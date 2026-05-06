'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SPECIES   = ['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar','Custom tree']
const TREE_TYPES = [
  { id: 'common',  label: 'Common Species',     price: 100  },
  { id: 'fruit',   label: 'Fruit Trees',        price: 250  },
  { id: 'native',  label: 'Native Large Trees', price: 500  },
]

type Tab = 'donor' | 'csr' | 'direct'

interface Worker     { id: number; name: string }
interface Site       { id: number; name: string }
interface CsrPartner { id: number; company_name: string; type: string }
interface UnassignedTree {
  id: number
  tree_id: string
  species: string
  tree_type: string
  donors: { id: number; name: string; email: string } | null
}
interface Assignment {
  id: number
  assigned_at: string
  status: string
  trees: { tree_id: string; species: string } | null
  users: { name: string } | null
  sites: { name: string } | null
}

export default function AdminAssign() {
  const [tab,         setTab]         = useState<Tab>('donor')
  const [workers,     setWorkers]     = useState<Worker[]>([])
  const [sites,       setSites]       = useState<Site[]>([])
  const [csrPartners, setCsrPartners] = useState<CsrPartner[]>([])
  const [unassigned,  setUnassigned]  = useState<UnassignedTree[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [showSiteForm,    setShowSiteForm]    = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  const [newSite, setNewSite] = useState({
    name: '', description: '', city: 'Bangalore', latitude: '', longitude: ''
  })

  // Tab 1 — Donor form
  const [donorForm, setDonorForm] = useState({
    tree_id: '', worker_id: '', site_id: '', due_date: '', notes: ''
  })

  // Tab 2 — CSR/NGO form
  const [csrForm, setCsrForm] = useState({
    csr_partner_id: '', worker_id: '', site_id: '', species: 'Neem',
    tree_type: 'common', due_date: '', notes: ''
  })

  // Tab 3 — Direct form
  const [directForm, setDirectForm] = useState({
    worker_id: '', site_id: '', species: 'Neem', tree_type: 'common',
    due_date: '', notes: ''
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [workersRes, sitesRes, csrRes, unassignedRes, assignmentsRes] = await Promise.all([
      supabase.from('users').select('id, name').eq('role', 'WORKER').eq('is_active', true).order('name'),
      supabase.from('sites').select('id, name').eq('is_active', true).order('name'),
      supabase.from('csr_partners').select('id, company_name, type').eq('is_active', true).order('company_name'),
      // Unassigned donor trees — PENDING and not in assignments
      supabase.from('trees')
        .select('id, tree_id, species, tree_type, donors(id, name, email)')
        .eq('status', 'PENDING')
        .not('donor_id', 'is', null)
        .order('created_at', { ascending: true }),
      supabase.from('assignments')
        .select('id, assigned_at, status, trees(tree_id, species), users(name), sites(name)')
        .eq('status', 'ASSIGNED')
        .order('assigned_at', { ascending: false })
        .limit(10)
    ])

    setWorkers(workersRes.data || [])
    setSites(sitesRes.data || [])
    setCsrPartners(csrRes.data || [])

    // Filter out trees already assigned
    const assignedTreeIds = new Set(
      (assignmentsRes.data || []).map((a: any) => {
        const t = Array.isArray(a.trees) ? a.trees[0] : a.trees
        return t?.tree_id
      }).filter(Boolean)
    )
    const unassignedTrees = (unassignedRes.data || []).filter((t: any) =>
      !assignedTreeIds.has(t.tree_id)
    )
    setUnassigned(unassignedTrees as UnassignedTree[])
    setAssignments((assignmentsRes.data as unknown as Assignment[]) || [])
    setLoading(false)
  }

  async function handleCreateSite(e: React.FormEvent) {
    e.preventDefault()
    const { data: site, error: siteError } = await supabase.from('sites').insert({
      name:        newSite.name,
      description: newSite.description || null,
      city:        newSite.city,
      latitude:    newSite.latitude  ? Number(newSite.latitude)  : null,
      longitude:   newSite.longitude ? Number(newSite.longitude) : null,
      is_active:   true,
    }).select('id, name').single()
    if (!siteError && site) {
      setSites(prev => [...prev, site])
      setSuccess(`Site "${newSite.name}" created!`)
      setShowSiteForm(false)
      setNewSite({ name:'', description:'', city:'Bangalore', latitude:'', longitude:'' })
    } else {
      setError(siteError?.message || 'Failed to create site')
    }
  }

  function getMyLocation() {
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setNewSite(s => ({ ...s, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }))
        setGettingLocation(false)
      },
      () => { setGettingLocation(false); alert('Could not get location.') },
      { enableHighAccuracy: true }
    )
  }

  // ── TAB 1: Assign existing donor tree ──
  async function handleDonorAssign(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')

    const tree = unassigned.find(t => String(t.id) === donorForm.tree_id)
    if (!tree) { setError('Please select a tree'); setSaving(false); return }

    // Update tree with site
    await supabase.from('trees').update({
      site_id:   Number(donorForm.site_id),
      worker_id: Number(donorForm.worker_id),
      status:    'ASSIGNED',
    }).eq('id', tree.id)

    // Create assignment
    const { error: assignError } = await supabase.from('assignments').insert({
      tree_id:   tree.id,
      worker_id: Number(donorForm.worker_id),
      site_id:   Number(donorForm.site_id),
      status:    'ASSIGNED',
      due_date:  donorForm.due_date || null,
      notes:     donorForm.notes    || null,
    })

    if (assignError) { setError(assignError.message); setSaving(false); return }

    const donor = Array.isArray(tree.donors) ? tree.donors[0] : tree.donors
    setSuccess(`✅ ${tree.tree_id} assigned to worker! ${donor?.name ? `Linked to ${donor.name}.` : ''}`)
    setDonorForm({ tree_id:'', worker_id:'', site_id:'', due_date:'', notes:'' })
    loadData()
    setSaving(false)
  }

  // ── TAB 2: Create CSR/NGO tree ──
  async function handleCsrAssign(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')

    const treeId   = `ET-BLR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const treeType = TREE_TYPES.find(t => t.id === csrForm.tree_type)

    const { data: tree, error: treeError } = await supabase.from('trees').insert({
      tree_id:        treeId,
      csr_partner_id: Number(csrForm.csr_partner_id),
      site_id:        Number(csrForm.site_id),
      worker_id:      Number(csrForm.worker_id),
      tree_type:      treeType?.label || csrForm.tree_type,
      species:        csrForm.species,
      status:         'ASSIGNED',
    }).select('id').single()

    if (treeError) { setError(treeError.message); setSaving(false); return }

    const { error: assignError } = await supabase.from('assignments').insert({
      tree_id:   tree.id,
      worker_id: Number(csrForm.worker_id),
      site_id:   Number(csrForm.site_id),
      status:    'ASSIGNED',
      due_date:  csrForm.due_date || null,
      notes:     csrForm.notes    || null,
    })

    if (assignError) { setError(assignError.message); setSaving(false); return }

    const partner = csrPartners.find(p => String(p.id) === csrForm.csr_partner_id)
    setSuccess(`✅ ${treeId} created and assigned! Linked to ${partner?.company_name}.`)
    setCsrForm({ csr_partner_id:'', worker_id:'', site_id:'', species:'Neem', tree_type:'common', due_date:'', notes:'' })
    loadData()
    setSaving(false)
  }

  // ── TAB 3: Create direct tree ──
  async function handleDirectAssign(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')

    const treeId   = `ET-BLR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const treeType = TREE_TYPES.find(t => t.id === directForm.tree_type)

    const { data: tree, error: treeError } = await supabase.from('trees').insert({
      tree_id:   treeId,
      site_id:   Number(directForm.site_id),
      worker_id: Number(directForm.worker_id),
      tree_type: treeType?.label || directForm.tree_type,
      species:   directForm.species,
      status:    'ASSIGNED',
    }).select('id').single()

    if (treeError) { setError(treeError.message); setSaving(false); return }

    const { error: assignError } = await supabase.from('assignments').insert({
      tree_id:   tree.id,
      worker_id: Number(directForm.worker_id),
      site_id:   Number(directForm.site_id),
      status:    'ASSIGNED',
      due_date:  directForm.due_date || null,
      notes:     directForm.notes    || null,
    })

    if (assignError) { setError(assignError.message); setSaving(false); return }

    setSuccess(`✅ ${treeId} created and assigned!`)
    setDirectForm({ worker_id:'', site_id:'', species:'Neem', tree_type:'common', due_date:'', notes:'' })
    loadData()
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', outline: 'none'
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px'
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Assign Trees</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Assign trees to field workers for planting</p>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {[
            { id: 'donor',  label: '🌿 Donor Tree',  desc: 'Assign existing donor tree' },
            { id: 'csr',    label: '🏢 CSR / NGO',   desc: 'Create tree for CSR partner' },
            { id: 'direct', label: '🌱 Direct',       desc: 'NGO direct plantation'      },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as Tab); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '0.875rem 1rem', border: 'none', cursor: 'pointer',
                background: tab === t.id ? '#f0fdf4' : 'white',
                borderBottom: tab === t.id ? '3px solid #2C5F2D' : '3px solid transparent',
                fontSize: '13px', fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? '#2C5F2D' : '#6B7280',
                transition: 'all 0.15s',
              }}>
              <div>{t.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{t.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ padding: '1.25rem' }}>

          {/* ── TAB 1: DONOR TREE ── */}
          {tab === 'donor' && (
            <form onSubmit={handleDonorAssign}>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#166534' }}>
                ✅ Select an existing donor tree — no new tree will be created
              </div>

              {unassigned.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '14px' }}>
                  🎉 All donor trees are assigned!
                </div>
              ) : (
                <div className="form-grid">
                  {/* Tree selector */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Select donor tree * <span style={{ color: '#9ca3af', fontWeight: 400 }}>({unassigned.length} unassigned)</span></label>
                    <select required value={donorForm.tree_id} onChange={e => setDonorForm({...donorForm, tree_id: e.target.value})} style={inputStyle}>
                      <option value="">— Select tree to assign —</option>
                      {unassigned.map(t => {
                        const donor = Array.isArray(t.donors) ? t.donors[0] : t.donors
                        return (
                          <option key={t.id} value={t.id}>
                            {t.tree_id} · {t.species} · {donor?.name || 'No donor'} {donor?.email ? `(${donor.email})` : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {/* Worker */}
                  <div>
                    <label style={labelStyle}>Field worker *</label>
                    <select required value={donorForm.worker_id} onChange={e => setDonorForm({...donorForm, worker_id: e.target.value})} style={inputStyle}>
                      <option value="">Select worker</option>
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>

                  {/* Site */}
                  <div>
                    <label style={labelStyle}>Planting site *</label>
                    <select required value={donorForm.site_id} onChange={e => setDonorForm({...donorForm, site_id: e.target.value})} style={inputStyle}>
                      <option value="">Select site</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowSiteForm(!showSiteForm)}
                      style={{ fontSize:'12px', color:'#2C5F2D', background:'none', border:'none', cursor:'pointer', marginTop:'6px', textDecoration:'underline' }}>
                      + Create new site
                    </button>
                  </div>

                  {/* Due date */}
                  <div>
                    <label style={labelStyle}>Due date</label>
                    <input type="date" value={donorForm.due_date} onChange={e => setDonorForm({...donorForm, due_date: e.target.value})} style={inputStyle} />
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={labelStyle}>Notes</label>
                    <input type="text" placeholder="e.g. Plant near entrance" value={donorForm.notes} onChange={e => setDonorForm({...donorForm, notes: e.target.value})} style={inputStyle} />
                  </div>
                </div>
              )}

              {error   && <div style={{ color:'#dc2626', fontSize:'13px', margin:'0.75rem 0' }}>{error}</div>}
              {success && <div style={{ color:'#16a34a', fontSize:'13px', margin:'0.75rem 0' }}>{success}</div>}

              {unassigned.length > 0 && (
                <button type="submit" disabled={saving}
                  style={{ marginTop:'1rem', padding:'10px 24px', background: saving?'#9ca3af':'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor: saving?'not-allowed':'pointer' }}>
                  {saving ? 'Assigning...' : 'Assign tree →'}
                </button>
              )}
            </form>
          )}

          {/* ── TAB 2: CSR/NGO ── */}
          {tab === 'csr' && (
            <form onSubmit={handleCsrAssign}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#1e40af' }}>
                🏢 Creates a new tree linked to a CSR/NGO partner
              </div>

              <div className="form-grid">
                {/* CSR Partner */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>CSR / NGO Partner *</label>
                  <select required value={csrForm.csr_partner_id} onChange={e => setCsrForm({...csrForm, csr_partner_id: e.target.value})} style={inputStyle}>
                    <option value="">— Select partner —</option>
                    {csrPartners.map(p => <option key={p.id} value={p.id}>{p.company_name} ({p.type})</option>)}
                  </select>
                  {csrPartners.length === 0 && (
                    <div style={{ fontSize:'12px', color:'#f59e0b', marginTop:'4px' }}>⚠️ No CSR/NGO partners yet — add them in the CSR Partners page</div>
                  )}
                </div>

                {/* Worker */}
                <div>
                  <label style={labelStyle}>Field worker *</label>
                  <select required value={csrForm.worker_id} onChange={e => setCsrForm({...csrForm, worker_id: e.target.value})} style={inputStyle}>
                    <option value="">Select worker</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                {/* Site */}
                <div>
                  <label style={labelStyle}>Planting site *</label>
                  <select required value={csrForm.site_id} onChange={e => setCsrForm({...csrForm, site_id: e.target.value})} style={inputStyle}>
                    <option value="">Select site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Tree type */}
                <div>
                  <label style={labelStyle}>Tree type *</label>
                  <select required value={csrForm.tree_type} onChange={e => setCsrForm({...csrForm, tree_type: e.target.value})} style={inputStyle}>
                    {TREE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — ₹{t.price}</option>)}
                  </select>
                </div>

                {/* Species */}
                <div>
                  <label style={labelStyle}>Species *</label>
                  <select required value={csrForm.species} onChange={e => setCsrForm({...csrForm, species: e.target.value})} style={inputStyle}>
                    {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <label style={labelStyle}>Due date</label>
                  <input type="date" value={csrForm.due_date} onChange={e => setCsrForm({...csrForm, due_date: e.target.value})} style={inputStyle} />
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <input type="text" placeholder="e.g. Plant near entrance" value={csrForm.notes} onChange={e => setCsrForm({...csrForm, notes: e.target.value})} style={inputStyle} />
                </div>
              </div>

              {error   && <div style={{ color:'#dc2626', fontSize:'13px', margin:'0.75rem 0' }}>{error}</div>}
              {success && <div style={{ color:'#16a34a', fontSize:'13px', margin:'0.75rem 0' }}>{success}</div>}

              <button type="submit" disabled={saving}
                style={{ marginTop:'1rem', padding:'10px 24px', background: saving?'#9ca3af':'#1e40af', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor: saving?'not-allowed':'pointer' }}>
                {saving ? 'Assigning...' : 'Create & assign tree →'}
              </button>
            </form>
          )}

          {/* ── TAB 3: DIRECT ── */}
          {tab === 'direct' && (
            <form onSubmit={handleDirectAssign}>
              <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#92400e' }}>
                🌱 NGO direct plantation — no donor or CSR partner linked
              </div>

              <div className="form-grid">
                {/* Worker */}
                <div>
                  <label style={labelStyle}>Field worker *</label>
                  <select required value={directForm.worker_id} onChange={e => setDirectForm({...directForm, worker_id: e.target.value})} style={inputStyle}>
                    <option value="">Select worker</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                {/* Site */}
                <div>
                  <label style={labelStyle}>Planting site *</label>
                  <select required value={directForm.site_id} onChange={e => setDirectForm({...directForm, site_id: e.target.value})} style={inputStyle}>
                    <option value="">Select site</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Tree type */}
                <div>
                  <label style={labelStyle}>Tree type *</label>
                  <select required value={directForm.tree_type} onChange={e => setDirectForm({...directForm, tree_type: e.target.value})} style={inputStyle}>
                    {TREE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — ₹{t.price}</option>)}
                  </select>
                </div>

                {/* Species */}
                <div>
                  <label style={labelStyle}>Species *</label>
                  <select required value={directForm.species} onChange={e => setDirectForm({...directForm, species: e.target.value})} style={inputStyle}>
                    {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <label style={labelStyle}>Due date</label>
                  <input type="date" value={directForm.due_date} onChange={e => setDirectForm({...directForm, due_date: e.target.value})} style={inputStyle} />
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <input type="text" placeholder="e.g. Plant near entrance" value={directForm.notes} onChange={e => setDirectForm({...directForm, notes: e.target.value})} style={inputStyle} />
                </div>
              </div>

              {error   && <div style={{ color:'#dc2626', fontSize:'13px', margin:'0.75rem 0' }}>{error}</div>}
              {success && <div style={{ color:'#16a34a', fontSize:'13px', margin:'0.75rem 0' }}>{success}</div>}

              <button type="submit" disabled={saving}
                style={{ marginTop:'1rem', padding:'10px 24px', background: saving?'#9ca3af':'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor: saving?'not-allowed':'pointer' }}>
                {saving ? 'Assigning...' : 'Create & assign tree →'}
              </button>
            </form>
          )}

          {/* ── CREATE SITE FORM (shared across tabs) ── */}
          {showSiteForm && (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'10px', padding:'1rem', marginTop:'1rem' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#1A3C34', marginBottom:'0.75rem' }}>Create new site</div>
              <form onSubmit={handleCreateSite}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Site name *</label>
                    <input required type="text" placeholder="Vijayanagar Park" value={newSite.name}
                      onChange={e => setNewSite(s => ({...s, name: e.target.value}))}
                      style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>City</label>
                    <input type="text" placeholder="Bangalore" value={newSite.city}
                      onChange={e => setNewSite(s => ({...s, city: e.target.value}))}
                      style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
                  </div>
                  <div style={{ gridColumn:'span 2' }}>
                    <button type="button" onClick={getMyLocation}
                      style={{ width:'100%', padding:'0.6rem', background:'#1A3C34', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                      {gettingLocation ? '📍 Getting location...' : '📍 Use my current location'}
                    </button>
                  </div>
                  {newSite.latitude && (
                    <div style={{ gridColumn:'span 2', fontSize:'12px', color:'#166634', background:'#dcfce7', padding:'6px 10px', borderRadius:'6px' }}>
                      ✅ GPS: {newSite.latitude}° N, {newSite.longitude}° E
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Latitude</label>
                    <input type="number" step="any" placeholder="12.9716" value={newSite.latitude}
                      onChange={e => setNewSite(s => ({...s, latitude: e.target.value}))}
                      style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Longitude</label>
                    <input type="number" step="any" placeholder="77.5946" value={newSite.longitude}
                      onChange={e => setNewSite(s => ({...s, longitude: e.target.value}))}
                      style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button type="submit" style={{ padding:'8px 16px', background:'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Create site</button>
                  <button type="button" onClick={() => setShowSiteForm(false)} style={{ padding:'8px 16px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ── PENDING ASSIGNMENTS TABLE ── */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>Pending assignments</span>
          <span style={{ fontSize:'13px', color:'#6B7280' }}>{assignments.length} active</span>
        </div>
        <div className="desk-table">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                {['Tree ID','Worker','Site','Species','Assigned','Status'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', fontSize:'12px', color:'#6B7280', fontWeight:500, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>No pending assignments</td></tr>
              ) : assignments.map(a => {
                const tree = Array.isArray(a.trees) ? a.trees[0] : a.trees
                const user = Array.isArray(a.users) ? a.users[0] : a.users
                const site = Array.isArray(a.sites) ? a.sites[0] : a.sites
                return (
                  <tr key={a.id} style={{ borderTop:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'12px 16px', fontSize:'13px', fontFamily:'monospace', color:'#1A1A1A' }}>{tree?.tree_id || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#374151' }}>{user?.name || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#6B7280' }}>{site?.name || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#6B7280' }}>{tree?.species || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#6B7280' }}>{new Date(a.assigned_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ background:'#fef3c7', color:'#92400e', fontSize:'12px', padding:'3px 8px', borderRadius:'6px', fontWeight:500 }}>{a.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mob-cards">
          {assignments.map(a => {
            const tree = Array.isArray(a.trees) ? a.trees[0] : a.trees
            const user = Array.isArray(a.users) ? a.users[0] : a.users
            const site = Array.isArray(a.sites) ? a.sites[0] : a.sites
            return (
              <div key={a.id} style={{ padding:'1rem', borderTop:'1px solid #f3f4f6' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'13px', fontFamily:'monospace', fontWeight:500 }}>{tree?.tree_id || '—'}</span>
                  <span style={{ background:'#fef3c7', color:'#92400e', fontSize:'11px', padding:'2px 8px', borderRadius:'6px' }}>{a.status}</span>
                </div>
                <div style={{ fontSize:'13px', color:'#6B7280' }}>👷 {user?.name || '—'} · 📍 {site?.name || '—'}</div>
                <div style={{ fontSize:'13px', color:'#6B7280' }}>🌿 {tree?.species || '—'}</div>
              </div>
            )
          })}
          {assignments.length === 0 && <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>No pending assignments</div>}
        </div>
      </div>

      <style>{`
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .desk-table { display: block; }
        .mob-cards  { display: none;  }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .desk-table { display: none;  }
          .mob-cards  { display: block; }
        }
        select:focus, input:focus { border-color: #2C5F2D !important; }
      `}</style>
    </div>
  )
}
