'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SPECIES = ['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar','Custom tree']
const TREE_TYPES = [
  { id: 'common',  label: 'Common Species',    price: 100 },
  { id: 'fruit',   label: 'Fruit Trees',       price: 250 },
  { id: 'native',  label: 'Native Large Trees', price: 500 },
]

interface Worker { id: number; name: string }
interface Site   { id: number; name: string }
interface Assignment {
  id: number
  assigned_at: string
  status: string
  trees: { tree_id: string; species: string } | null
  users: { name: string } | null
  sites: { name: string } | null
}

export default function AdminAssign() {
  const [workers, setWorkers]       = useState<Worker[]>([])
  const [sites, setSites]           = useState<Site[]>([])
  const [showSiteForm, setShowSiteForm] = useState(false)
const [newSite, setNewSite] = useState({
  name: '', description: '', city: 'Bangalore',
  latitude: '', longitude: ''
})
const [gettingLocation, setGettingLocation] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')

  const [form, setForm] = useState({
    worker_id: '',
    site_id:   '',
    species:   'Neem',
    tree_type: 'common',
    due_date:  '',
    notes:     '',
    donor_name:  '',
    donor_email: '',
  })

  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id, name').eq('role', 'WORKER').eq('is_active', true).order('name'),
      supabase.from('sites').select('id, name').eq('is_active', true).order('name'),
      supabase.from('assignments')
        .select('id, assigned_at, status, trees(tree_id, species), users(name), sites(name)')
        .eq('status', 'ASSIGNED')
        .order('assigned_at', { ascending: false })
        .limit(10)
    ]).then(([w, s, a]) => {
      setWorkers(w.data || [])
      setSites(s.data || [])
      setAssignments((a.data as unknown as Assignment[]) || [])
      setLoading(false)
    })
  }, [])
async function handleCreateSite(e: React.FormEvent) {
  e.preventDefault()
  const { data: site, error } = await supabase.from('sites').insert({
    name:        newSite.name,
    description: newSite.description || null,
    city:        newSite.city,
    latitude:    newSite.latitude ? Number(newSite.latitude) : null,
    longitude:   newSite.longitude ? Number(newSite.longitude) : null,
    is_active:   true,
  }).select('id, name').single()

  if (!error && site) {
    setSites(prev => [...prev, site])
    setForm(f => ({ ...f, site_id: String(site.id) }))
    setSuccess(`Site "${newSite.name}" created and selected!`)
    setShowSiteForm(false)
    setNewSite({ name:'', description:'', city:'Bangalore', latitude:'', longitude:'' })
  } else {
    setError(error?.message || 'Failed to create site')
  }
}

function getMyLocation() {
  setGettingLocation(true)
  navigator.geolocation.getCurrentPosition(
    pos => {
      setNewSite(s => ({
        ...s,
        latitude:  pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6)
      }))
      setGettingLocation(false)
    },
    () => {
      setGettingLocation(false)
      alert('Could not get location. Enter manually.')
    },
    { enableHighAccuracy: true }
  )
}

async function handleAssign(e: React.FormEvent) {
  // ... existing code
  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    // Generate tree ID
    const treeId = `ET-BLR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const treeType = TREE_TYPES.find(t => t.id === form.tree_type)

    // Create a placeholder donor if needed
    let donorId = null
    if (form.donor_email) {
      const { data: existingDonor } = await supabase
        .from('donors')
        .select('id')
        .eq('email', form.donor_email)
        .single()

      if (existingDonor) {
        donorId = existingDonor.id
      } else {
        const { data: newDonor } = await supabase
          .from('donors')
          .insert({ name: form.donor_name || 'TBD', email: form.donor_email })
          .select('id')
          .single()
        donorId = newDonor?.id
      }
    }

    // Create tree
    const { data: tree, error: treeError } = await supabase
      .from('trees')
      .insert({
        tree_id:   treeId,
        donor_id:  donorId || 1,
        site_id:   Number(form.site_id),
        worker_id: Number(form.worker_id),
        tree_type: treeType?.label || form.tree_type,
        species:   form.species,
        status:    'ASSIGNED',
      })
      .select('id')
      .single()

    if (treeError) { setError(treeError.message); setSaving(false); return }

    // Create assignment
    const { error: assignError } = await supabase
      .from('assignments')
      .insert({
        tree_id:     tree.id,
        worker_id:   Number(form.worker_id),
        site_id:     Number(form.site_id),
        status:      'ASSIGNED',
        due_date:    form.due_date || null,
        notes:       form.notes || null,
      })

    if (assignError) { setError(assignError.message); setSaving(false); return }

    setSuccess(`Tree ${treeId} assigned successfully!`)
    setForm({ worker_id: '', site_id: '', species: 'Neem', tree_type: 'common', due_date: '', notes: '', donor_name: '', donor_email: '' })

    // Reload assignments
    const { data: newAssignments } = await supabase
      .from('assignments')
      .select('id, assigned_at, status, trees(tree_id, species), users(name), sites(name)')
      .eq('status', 'ASSIGNED')
      .order('assigned_at', { ascending: false })
      .limit(10)
    setAssignments((newAssignments as unknown as Assignment[]) || [])
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Assign Trees</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Assign a tree to a field worker at a planting site</p>
      </div>

      {/* Assignment form */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>New assignment</h3>
        <form onSubmit={handleAssign}>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Field worker *</label>
              <select required value={form.worker_id} onChange={e => setForm({...form, worker_id: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                <option value="">Select worker</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Planting site *</label>
              <select required value={form.site_id} onChange={e => setForm({...form, site_id: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
               <option value="">Select site</option>
  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>

<button
  type="button"
  onClick={() => setShowSiteForm(!showSiteForm)}
  style={{ fontSize:'12px', color:'#2C5F2D', background:'none', border:'none', cursor:'pointer', marginTop:'4px', textDecoration:'underline' }}
>
  + Create new site
</button>

{showSiteForm && (
  ... entire form from Step 3 ...
)}
              {showSiteForm && (
  <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'10px', padding:'1rem', marginTop:'0.5rem' }}>
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
          <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Description</label>
          <input type="text" placeholder="Near main entrance" value={newSite.description}
            onChange={e => setNewSite(s => ({...s, description: e.target.value}))}
            style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
        </div>
        <div style={{ gridColumn:'span 2' }}>
          <button type="button" onClick={getMyLocation}
            style={{ width:'100%', padding:'0.6rem', background:'#1A3C34', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            {gettingLocation ? '📍 Getting location...' : '📍 Use my current location'}
          </button>
        </div>
        {newSite.latitude && (
          <div style={{ gridColumn:'span 2', fontSize:'12px', color:'#166534', background:'#dcfce7', padding:'6px 10px', borderRadius:'6px' }}>
            ✅ GPS: {newSite.latitude}° N, {newSite.longitude}° E
          </div>
        )}
        <div>
          <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Latitude (manual)</label>
          <input type="number" step="any" placeholder="12.9716" value={newSite.latitude}
            onChange={e => setNewSite(s => ({...s, latitude: e.target.value}))}
            style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
        </div>
        <div>
          <label style={{ fontSize:'12px', fontWeight:500, color:'#374151', display:'block', marginBottom:'4px' }}>Longitude (manual)</label>
          <input type="number" step="any" placeholder="77.5946" value={newSite.longitude}
            onChange={e => setNewSite(s => ({...s, longitude: e.target.value}))}
            style={{ width:'100%', padding:'0.5rem 0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', outline:'none' }} />
        </div>
      </div>
      <div style={{ display:'flex', gap:'0.5rem' }}>
        <button type="submit" style={{ padding:'8px 16px', background:'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
          Create site
        </button>
        <button type="button" onClick={() => setShowSiteForm(false)}
          style={{ padding:'8px 16px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
                <option value="">Select site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Tree type *</label>
              <select required value={form.tree_type} onChange={e => setForm({...form, tree_type: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                {TREE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — ₹{t.price}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Species *</label>
              <select required value={form.species} onChange={e => setForm({...form, species: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Due date</label>
              <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Notes</label>
              <input type="text" placeholder="e.g. Plant near entrance" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          {error   && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{error}</div>}
          {success && <div style={{ color: '#16a34a', fontSize: '13px', marginBottom: '0.75rem' }}>{success}</div>}

          <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: saving ? '#9ca3af' : '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Assigning...' : 'Assign tree →'}
          </button>
        </form>
      </div>

      {/* Pending assignments */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Pending assignments</span>
        </div>

        {/* Desktop */}
        <div className="desk-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tree ID','Worker','Site','Species','Assigned','Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No pending assignments</td></tr>
              ) : assignments.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#1A1A1A' }}>{a.trees?.tree_id || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{a.users?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{a.sites?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{a.trees?.species || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{new Date(a.assigned_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="mob-cards">
          {assignments.map(a => (
            <div key={a.id} style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 500 }}>{a.trees?.tree_id || '—'}</span>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>{a.status}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>👷 {a.users?.name || '—'} · 📍 {a.sites?.name || '—'}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>🌿 {a.trees?.species || '—'}</div>
            </div>
          ))}
          {assignments.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No pending assignments</div>}
        </div>
      </div>

      <style>{`
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .desk-table { display: block; }
        .mob-cards { display: none; }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .desk-table { display: none; }
          .mob-cards { display: block; }
        }
        select:focus, input:focus { border-color: #2C5F2D !important; }
      `}</style>
    </div>
  )
}
