'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Site { id: number; name: string }
interface Worker { id: number; name: string }
interface UnassignedDonor { id: number; name: string; email: string; total_donated: number; created_at: string; is_gift: boolean | null; gift_from_name: string | null }
interface Forest { id: number; forest_name: string; status: string; trees_target: number; trees_planted: number; species_count: number; area_sqm: number | null; notes: string | null; created_at: string; sites: { name: string } | null; worker: { name: string } | null; donor_count: number }
interface ForestDonor { id: number; amount: number; created_at: string; donors: { name: string; email: string } | null }

export default function AdminMiyawaki() {
  const [unassigned,    setUnassigned]    = useState<UnassignedDonor[]>([])
  const [forests,       setForests]       = useState<Forest[]>([])
  const [sites,         setSites]         = useState<Site[]>([])
  const [workers,       setWorkers]       = useState<Worker[]>([])
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [assigning,     setAssigning]     = useState(false)
  const [success,       setSuccess]       = useState('')
  const [error,         setError]         = useState('')
  const [expandedForest, setExpandedForest] = useState<number | null>(null)
  const [forestDonors,  setForestDonors]  = useState<Record<number, ForestDonor[]>>({})
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null)
  const [selectedDonor, setSelectedDonor] = useState('')

  const [form, setForm] = useState({
    forest_name: '', site_id: '', trees_target: '', area_sqm: '', species_count: '30', worker_id: '', notes: ''
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [sitesRes, workersRes] = await Promise.all([
      supabase.from('sites').select('id, name').eq('is_active', true).order('name'),
      supabase.from('users').select('id, name').eq('role', 'WORKER'),
    ])
    setSites(sitesRes.data || [])
    setWorkers(workersRes.data || [])

    // Unassigned miyawaki donors (no forest_id)
    const { data: unassignedData } = await supabase
      .from('miyawaki_donors').select('donor_id, donors(id, name, email, total_donated, created_at, is_gift, gift_from_name)')
      .is('forest_id', null)
    const mapped = (unassignedData || []).map((r: any) => {
      const d = Array.isArray(r.donors) ? r.donors[0] : r.donors
      return { id: d?.id, name: d?.name, email: d?.email, total_donated: d?.total_donated, created_at: d?.created_at, is_gift: d?.is_gift, gift_from_name: d?.gift_from_name }
    }).filter((d: any) => d.id)
    setUnassigned(mapped)

    // Forests with donor count
    const { data: forestData } = await supabase
      .from('miyawaki_forests')
      .select('*, site_id, worker_id')
      .order('created_at', { ascending: false })

    if (forestData) {
      const enriched = await Promise.all(forestData.map(async (f: any) => {
        const [siteRes, workerRes, countRes] = await Promise.all([
          f.site_id ? supabase.from('sites').select('name').eq('id', f.site_id).single() : Promise.resolve({ data: null }),
          f.worker_id ? supabase.from('users').select('name').eq('id', f.worker_id).single() : Promise.resolve({ data: null }),
          supabase.from('miyawaki_donors').select('*', { count: 'exact', head: true }).eq('forest_id', f.id),
        ])
        return { ...f, sites: siteRes.data, worker: workerRes.data, donor_count: countRes.count || 0 }
      }))
      setForests(enriched)
    }
    setLoading(false)
  }

  async function handleCreateForest(e: React.FormEvent) {
    e.preventDefault()
    if (!form.forest_name.trim()) { setError('Forest name is required'); return }
    setSaving(true); setError('')

    const { error: err } = await supabase.from('miyawaki_forests').insert({
      forest_name:   form.forest_name,
      site_id:       form.site_id ? Number(form.site_id) : null,
      trees_target:  Number(form.trees_target) || 0,
      area_sqm:      form.area_sqm ? Number(form.area_sqm) : null,
      species_count: Number(form.species_count) || 30,
      worker_id:     form.worker_id ? Number(form.worker_id) : null,
      notes:         form.notes || null,
      status:        'PENDING',
      trees_planted: 0,
    })

    if (err) { setError(err.message); setSaving(false); return }
    setSuccess('Forest created successfully!')
    setForm({ forest_name:'', site_id:'', trees_target:'', area_sqm:'', species_count:'30', worker_id:'', notes:'' })
    loadData()
    setSaving(false)
  }

  async function loadForestDonors(forestId: number) {
    const { data } = await supabase
      .from('miyawaki_donors')
      .select('id, amount, created_at, donors(name, email)')
      .eq('forest_id', forestId)
      .order('created_at', { ascending: true })
    setForestDonors(prev => ({ ...prev, [forestId]: (data as unknown as ForestDonor[]) || [] }))
  }

  async function handleAssignDonor(forestId: number) {
    if (!selectedDonor) return
    setAssigning(true)

    // Update miyawaki_donors record
    const { error: updateErr } = await supabase
      .from('miyawaki_donors')
      .update({ forest_id: forestId })
      .eq('donor_id', Number(selectedDonor))
      .is('forest_id', null)

    if (updateErr) { setError(updateErr.message); setAssigning(false); return }

    // Get donor details
    const { data: donorData } = await supabase
      .from('donors').select('name, email').eq('id', Number(selectedDonor)).single()

    // Get forest details
    const forest = forests.find(f => f.id === forestId)
    const site = sites.find(s => s.id === Number(form.site_id))

    // Send assignment email
    if (donorData) {
      await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'miyawaki_assigned',
          donor: {
            name:           donorData.name,
            email:          donorData.email,
            forest_name:    forest?.forest_name || 'Miyawaki Forest',
            site:           forest?.sites?.name || 'Bangalore',
            trees_target:   forest?.trees_target || 0,
            species_count:  forest?.species_count || 30,
            password:       '123456',
            dashboard:      '/miyawaki-dashboard',
          }
        })
      })
    }

    setSuccess('Donor assigned and email sent!')
    setShowAssignModal(null)
    setSelectedDonor('')
    loadData()
    setAssigning(false)
  }

  const inp = { width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }
  const lbl = { display:'block', fontSize:'13px', fontWeight:500, color:'#374151', marginBottom:'6px' } as React.CSSProperties

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.25rem', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>🏙️ Miyawaki Forest Management</h1>
        <p style={{ fontSize:'14px', color:'#6B7280' }}>{unassigned.length} donors waiting · {forests.length} forests</p>
      </div>

      {success && <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#166534' }}>{success}</div>}
      {error   && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#dc2626' }}>{error}</div>}

      {/* SECTION 1 — Unassigned Donors */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', marginBottom:'1.5rem' }}>
        <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid #e5e7eb', background:'#fef9c3', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:600, color:'#92400e' }}>⏳ Unassigned Donors ({unassigned.length})</span>
          <span style={{ fontSize:'12px', color:'#92400e' }}>These donors need a forest assigned</span>
        </div>
        {loading ? (
          <div style={{ padding:'1.5rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>Loading...</div>
        ) : unassigned.length === 0 ? (
          <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>✅ All donors have been assigned forests</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                {['Name','Email','Amount','Date','Gift','Action'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', fontSize:'11px', color:'#6B7280', fontWeight:500, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unassigned.map(d => (
                <tr key={d.id} style={{ borderTop:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'10px 12px', fontSize:'13px', fontWeight:600, color:'#1A1A1A' }}>{d.name}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6B7280' }}>{d.email}</td>
                  <td style={{ padding:'10px 12px', fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>₹{Number(d.total_donated).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#9ca3af' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6B7280' }}>{d.is_gift ? `🎁 ${d.gift_from_name}` : '—'}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {forests.length > 0 ? (
                     <select
                      onChange={async e => {
  if (!e.target.value) return
  if (!confirm(`Assign ${d.name} to this forest and send email?`)) return
  setAssigning(true)
  const { error: updateErr } = await supabase
    .from('miyawaki_donors')
    .update({ forest_id: Number(e.target.value) })
    .eq('donor_id', d.id)
    .is('forest_id', null)
  if (updateErr) { setError(updateErr.message); setAssigning(false); return }
  const forest = forests.find(f => f.id === Number(e.target.value))
  await fetch('/api/send-email', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'miyawaki_assigned',
      donor: {
        name: d.name, email: d.email,
        forest_name: forest?.forest_name || 'Miyawaki Forest',
        site: forest?.sites?.name || 'Bangalore',
        trees_target: forest?.trees_target || 0,
        species_count: forest?.species_count || 30,
        password: '123456', dashboard: '/miyawaki-dashboard',
      }
    })
  })
  setAssigning(false)
  setSuccess('Donor assigned and email sent!')
  loadData()
}}
                        defaultValue="" style={{ ...inp, width:'auto', fontSize:'12px', padding:'4px 8px' }}>
                        <option value="">Assign to forest →</option>
                        {forests.map(f => <option key={f.id} value={f.id}>{f.forest_name}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize:'12px', color:'#9ca3af' }}>Create forest first</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECTION 2 — Create Forest */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', padding:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'1rem' }}>🌿 Create New Miyawaki Forest</div>
        <form onSubmit={handleCreateForest}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ gridColumn:'span 2' }}>
              <label style={lbl}>Forest name *</label>
              <input type="text" placeholder="e.g. Vijayanagar Miyawaki Forest — 2026"
                value={form.forest_name} onChange={e=>setForm({...form,forest_name:e.target.value})} required style={inp}/>
            </div>
            <div>
              <label style={lbl}>Site</label>
              <select value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value})} style={inp}>
                <option value="">— Select site —</option>
                {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Assigned worker</label>
              <select value={form.worker_id} onChange={e=>setForm({...form,worker_id:e.target.value})} style={inp}>
                <option value="">— Select worker —</option>
                {workers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Trees target</label>
              <input type="number" min="0" placeholder="500"
                value={form.trees_target} onChange={e=>setForm({...form,trees_target:e.target.value})} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Species count</label>
              <input type="number" min="0" placeholder="30"
                value={form.species_count} onChange={e=>setForm({...form,species_count:e.target.value})} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Area (sqm)</label>
              <input type="number" min="0" placeholder="500"
                value={form.area_sqm} onChange={e=>setForm({...form,area_sqm:e.target.value})} style={inp}/>
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={lbl}>Notes</label>
              <textarea placeholder="Site details, access notes, etc."
                value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
                rows={2} style={{ ...inp, resize:'vertical' as const }}/>
            </div>
          </div>
          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background:saving?'#9ca3af':'#7C3AED', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {saving ? 'Creating...' : '🏙️ Create Forest'}
          </button>
        </form>
      </div>

      {/* SECTION 3 — Existing Forests */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>🏙️ All Miyawaki Forests ({forests.length})</span>
        </div>
        {forests.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🌱</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>No forests yet</div>
            <div style={{ fontSize:'13px', color:'#6B7280' }}>Create your first Miyawaki forest above</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {forests.map(f => (
              <div key={f.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', cursor:'pointer' }}
                  onClick={async () => {
                    if (expandedForest === f.id) { setExpandedForest(null) }
                    else { setExpandedForest(f.id); await loadForestDonors(f.id) }
                  }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>{f.forest_name}</div>
                    <div style={{ fontSize:'12px', color:'#9ca3af', display:'flex', gap:'12px', flexWrap:'wrap' }}>
                      {f.sites?.name && <span>📍 {f.sites.name}</span>}
                      {f.worker?.name && <span>👷 {f.worker.name}</span>}
                      <span>🌳 {f.trees_planted}/{f.trees_target} trees</span>
                      <span>🌿 {f.species_count}+ species</span>
                      <span>👥 {f.donor_count} donors</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px',
                      background: f.status==='COMPLETE'?'#dcfce7':f.status==='ACTIVE'?'#dbeafe':'#fef9c3',
                      color: f.status==='COMPLETE'?'#166534':f.status==='ACTIVE'?'#1e40af':'#92400e' }}>
                      {f.status}
                    </span>
                    <span style={{ color:'#6B7280', fontSize:'12px' }}>{expandedForest===f.id?'▲':'▼'}</span>
                  </div>
                </div>

                {/* Expanded — donors in this forest */}
                {expandedForest === f.id && (
                  <div style={{ background:'#f9fafb', borderTop:'1px solid #e5e7eb', padding:'1rem 1.25rem' }}>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'0.75rem' }}>
                      Donors in this forest ({forestDonors[f.id]?.length || 0})
                    </div>
                    {(forestDonors[f.id] || []).length === 0 ? (
                      <div style={{ fontSize:'13px', color:'#9ca3af' }}>No donors assigned yet</div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'1rem' }}>
                        {(forestDonors[f.id] || []).map(d => {
                          const donor = Array.isArray(d.donors) ? d.donors[0] : d.donors as any
                          return (
                            <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', borderRadius:'8px', padding:'8px 12px', border:'1px solid #e5e7eb' }}>
                              <div>
                                <div style={{ fontSize:'13px', fontWeight:600, color:'#1A1A1A' }}>{donor?.name}</div>
                                <div style={{ fontSize:'11px', color:'#9ca3af' }}>{donor?.email}</div>
                              </div>
                              <div style={{ fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>₹{d.amount.toLocaleString('en-IN')}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {unassigned.length > 0 && (
                      <button onClick={() => setShowAssignModal(f.id)}
                        style={{ padding:'6px 14px', background:'#7C3AED', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        + Assign Donor
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'1.5rem', width:'100%', maxWidth:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize:'16px', fontWeight:600, color:'#1A1A1A', marginBottom:'1rem' }}>
              Assign donor to forest
            </h3>
            <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'1rem' }}>
              Forest: <strong>{forests.find(f=>f.id===showAssignModal)?.forest_name}</strong>
            </div>
            <label style={lbl}>Select donor</label>
            <select value={selectedDonor} onChange={e=>setSelectedDonor(e.target.value)}
              style={{ ...inp, marginBottom:'1rem' }}>
              <option value="">— Select donor —</option>
              {unassigned.map(d=>(
                <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
              ))}
            </select>
            <div style={{ fontSize:'12px', color:'#6B7280', background:'#f0fdf4', borderRadius:'8px', padding:'8px 12px', marginBottom:'1rem' }}>
              📧 An email will be sent to the donor with forest details and dashboard access.
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <button onClick={()=>{setShowAssignModal(null);setSelectedDonor('')}}
                style={{ padding:'8px 16px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button onClick={()=>handleAssignDonor(showAssignModal)} disabled={!selectedDonor||assigning}
                style={{ padding:'8px 16px', background:selectedDonor&&!assigning?'#7C3AED':'#9ca3af', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:selectedDonor&&!assigning?'pointer':'not-allowed', fontFamily:'inherit' }}>
                {assigning ? 'Assigning...' : '✅ Assign + Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){ form > div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important;} }
        input:focus,select:focus,textarea:focus{border-color:#7C3AED !important;}
      `}</style>
    </div>
  )
}
