'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Site { id: number; name: string }
interface Worker { id: number; name: string }
interface UnassignedDonor {
  miyawaki_id: number; donor_id: number; name: string; email: string
  amount: number; created_at: string; is_gift: boolean | null; gift_from_name: string | null
}
interface Forest {
  id: number; forest_name: string; forest_code: string | null; status: string
  trees_target: number; trees_planted: number; species_count: number
  area_sqm: number | null; notes: string | null; created_at: string
  total_donated: number | null
  sites: { name: string } | null; worker: { name: string } | null; donor_count: number
}
interface ForestDonor {
  id: number; amount: number; created_at: string
  donors: { name: string; email: string } | null
}

export default function AdminMiyawaki() {
  const [unassigned,     setUnassigned]     = useState<UnassignedDonor[]>([])
  const [forests,        setForests]        = useState<Forest[]>([])
  const [sites,          setSites]          = useState<Site[]>([])
  const [workers,        setWorkers]        = useState<Worker[]>([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [assigning,      setAssigning]      = useState(false)
  const [success,        setSuccess]        = useState('')
  const [error,          setError]          = useState('')
  const [expandedForest, setExpandedForest] = useState<number | null>(null)
  const [forestDonors,   setForestDonors]   = useState<Record<number, ForestDonor[]>>({})

  // Multi-select donor pooling
  const [selectedDonors, setSelectedDonors] = useState<number[]>([])  // miyawaki_ids
  const [poolForestId,   setPoolForestId]   = useState<number | null>(null)
  const [showPoolModal,  setShowPoolModal]  = useState(false)

  const [form, setForm] = useState({
    forest_name: '', site_id: '', trees_target: '', area_sqm: '',
    species_count: '30', worker_id: '', notes: ''
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

    // Unassigned miyawaki donors
    const { data: unassignedData } = await supabase
      .from('miyawaki_donors')
      .select('id, donor_id, amount, is_gift, gift_from_name, created_at, donors(id, name, email)')
      .is('forest_id', null)
      .order('created_at', { ascending: true })

    const mapped = (unassignedData || []).map((r: any) => {
      const d = Array.isArray(r.donors) ? r.donors[0] : r.donors
      return {
        miyawaki_id:   r.id,
        donor_id:      d?.id,
        name:          d?.name,
        email:         d?.email,
        amount:        r.amount || 5000,
        created_at:    r.created_at,
        is_gift:       r.is_gift,
        gift_from_name: r.gift_from_name,
      }
    }).filter((d: any) => d.donor_id)
    setUnassigned(mapped)

    // Forests
    const { data: forestData } = await supabase
      .from('miyawaki_forests')
      .select('*, site_id, worker_id')
      .order('created_at', { ascending: false })

    if (forestData) {
      const enriched = await Promise.all(forestData.map(async (f: any) => {
        const [siteRes, workerRes, countRes] = await Promise.all([
          f.site_id   ? supabase.from('sites').select('name').eq('id', f.site_id).single()   : Promise.resolve({ data: null }),
          f.worker_id ? supabase.from('users').select('name').eq('id', f.worker_id).single() : Promise.resolve({ data: null }),
          supabase.from('miyawaki_donors').select('*', { count: 'exact', head: true }).eq('forest_id', f.id),
        ])
        return { ...f, sites: siteRes.data, worker: workerRes.data, donor_count: countRes.count || 0 }
      }))
      setForests(enriched)
    }
    setLoading(false)
  }

  // Generate forest code: MF-BLR-2026-004
  async function generateForestCode(): Promise<string> {
    const { data } = await supabase.rpc('nextval', { sequence_name: 'miyawaki_forest_seq' }).single().catch(() => ({ data: null }))
    const seq = data ? String(data).padStart(3, '0') : String(Math.floor(Math.random() * 900) + 100)
    return `MF-BLR-${new Date().getFullYear()}-${seq}`
  }

  async function handleCreateForest(e: React.FormEvent) {
    e.preventDefault()
    if (!form.forest_name.trim()) { setError('Forest name is required'); return }
    setSaving(true); setError('')

    // Generate forest code
    const { data: countData } = await supabase
      .from('miyawaki_forests').select('id', { count: 'exact', head: true })
    const seq = String((countData as any || 0) + 1).padStart(3, '0')
    const forest_code = `MF-BLR-${new Date().getFullYear()}-${seq}`

    const { data: newForest, error: err } = await supabase.from('miyawaki_forests').insert({
      forest_name:   form.forest_name,
      forest_code,
      site_id:       form.site_id ? Number(form.site_id) : null,
      trees_target:  Number(form.trees_target) || 0,
      area_sqm:      form.area_sqm ? Number(form.area_sqm) : null,
      species_count: Number(form.species_count) || 30,
      worker_id:     form.worker_id ? Number(form.worker_id) : null,
      notes:         form.notes || null,
      status:        'PENDING',
      trees_planted: 0,
      total_donated: 0,
    }).select('id').single()

    if (err) { setError(err.message); setSaving(false); return }
    setSuccess(`Forest ${forest_code} created!`)
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

  function toggleDonor(miyawaki_id: number) {
    setSelectedDonors(prev =>
      prev.includes(miyawaki_id)
        ? prev.filter(id => id !== miyawaki_id)
        : [...prev, miyawaki_id]
    )
  }

  async function handleAssignPool() {
    if (!poolForestId || selectedDonors.length === 0) return
    setAssigning(true); setError('')

    const forest = forests.find(f => f.id === poolForestId)
    const selectedDonorData = unassigned.filter(d => selectedDonors.includes(d.miyawaki_id))

    // Check for already-assigned donors (bug fix)
    for (const d of selectedDonorData) {
      const { data: existing } = await supabase
        .from('miyawaki_donors')
        .select('id')
        .eq('donor_id', d.donor_id)
        .not('forest_id', 'is', null)
        .maybeSingle()
      if (existing) {
        setError(`${d.name} is already assigned to a forest. Please deselect them.`)
        setAssigning(false)
        return
      }
    }

    // Assign all selected donors to forest
    const totalDonated = selectedDonorData.reduce((s, d) => s + d.amount, 0)

    for (const d of selectedDonorData) {
      await supabase.from('miyawaki_donors')
        .update({ forest_id: poolForestId })
        .eq('id', d.miyawaki_id)
    }

    // Update forest total_donated
    await supabase.from('miyawaki_forests')
      .update({ total_donated: (forest?.total_donated || 0) + totalDonated })
      .eq('id', poolForestId)

    // Send email to all assigned donors
    for (const d of selectedDonorData) {
      await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'miyawaki_assigned',
          donor: {
            name:          d.name,
            email:         d.email,
            forest_name:   forest?.forest_name || 'Miyawaki Forest',
            forest_code:   forest?.forest_code || '',
            site:          forest?.sites?.name || 'Bangalore',
            trees_target:  forest?.trees_target || 0,
            species_count: forest?.species_count || 30,
            co_donors:     selectedDonorData.length,
            password:      '123456',
            dashboard:     '/miyawaki-dashboard',
          }
        })
      })
    }

    setSuccess(`✅ ${selectedDonorData.length} donor(s) assigned to ${forest?.forest_code} and emails sent!`)
    setShowPoolModal(false)
    setSelectedDonors([])
    setPoolForestId(null)
    loadData()
    setAssigning(false)
  }

  const inp = { width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }
  const lbl = { display:'block', fontSize:'13px', fontWeight:500, color:'#374151', marginBottom:'6px' } as React.CSSProperties
  const totalSelected = selectedDonors.reduce((s, id) => {
    const d = unassigned.find(u => u.miyawaki_id === id)
    return s + (d?.amount || 0)
  }, 0)

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.25rem', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>🏙️ Miyawaki Forest Management</h1>
        <p style={{ fontSize:'14px', color:'#6B7280' }}>{unassigned.length} donors waiting · {forests.length} forests</p>
      </div>

      {success && <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#166534' }}>{success}<button onClick={()=>setSuccess('')} style={{float:'right',background:'none',border:'none',cursor:'pointer',color:'#166534'}}>✕</button></div>}
      {error   && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#dc2626' }}>{error}<button onClick={()=>setError('')} style={{float:'right',background:'none',border:'none',cursor:'pointer',color:'#dc2626'}}>✕</button></div>}

      {/* SECTION 1 — Unassigned Donors */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', marginBottom:'1.5rem' }}>
        <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid #e5e7eb', background:'#fef9c3', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
          <span style={{ fontSize:'14px', fontWeight:600, color:'#92400e' }}>⏳ Unassigned Donors ({unassigned.length})</span>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {selectedDonors.length > 0 && (
              <span style={{ fontSize:'12px', color:'#92400e', background:'#fef3c7', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>
                {selectedDonors.length} selected · ₹{totalSelected.toLocaleString('en-IN')}
              </span>
            )}
            {selectedDonors.length > 0 && forests.length > 0 && (
              <button onClick={() => setShowPoolModal(true)}
                style={{ padding:'6px 14px', background:'#7C3AED', color:'white', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                Assign to Forest →
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:'1.5rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>Loading...</div>
        ) : unassigned.length === 0 ? (
          <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>✅ All donors have been assigned forests</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb' }}>
                <th style={{ padding:'8px 12px', width:'40px' }}>
                  <input type="checkbox"
                    checked={selectedDonors.length === unassigned.length}
                    onChange={e => setSelectedDonors(e.target.checked ? unassigned.map(d => d.miyawaki_id) : [])}
                  />
                </th>
                {['Name','Email','Amount','Date','Gift'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', fontSize:'11px', color:'#6B7280', fontWeight:500, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unassigned.map(d => (
                <tr key={d.miyawaki_id} style={{ borderTop:'1px solid #f3f4f6', background: selectedDonors.includes(d.miyawaki_id) ? '#f5f3ff' : 'white' }}>
                  <td style={{ padding:'10px 12px' }}>
                    <input type="checkbox"
                      checked={selectedDonors.includes(d.miyawaki_id)}
                      onChange={() => toggleDonor(d.miyawaki_id)}
                    />
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:'13px', fontWeight:600, color:'#1A1A1A' }}>{d.name}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6B7280' }}>{d.email}</td>
                  <td style={{ padding:'10px 12px', fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>₹{Number(d.amount).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#9ca3af' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding:'10px 12px', fontSize:'12px', color:'#6B7280' }}>{d.is_gift ? `🎁 ${d.gift_from_name}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECTION 2 — Create Forest */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', padding:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>🌿 Create New Miyawaki Forest</div>
        <div style={{ fontSize:'12px', color:'#9ca3af', marginBottom:'1rem' }}>Forest code will be auto-generated (e.g. MF-BLR-2026-004)</div>
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
            {forests.map(f => {
              const pct = f.trees_target > 0 ? Math.round((f.trees_planted/f.trees_target)*100) : 0
              return (
                <div key={f.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <div style={{ padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', cursor:'pointer' }}
                    onClick={async () => {
                      if (expandedForest === f.id) { setExpandedForest(null) }
                      else { setExpandedForest(f.id); await loadForestDonors(f.id) }
                    }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                        <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>{f.forest_name}</div>
                        {f.forest_code && <span style={{ fontSize:'11px', fontFamily:'monospace', color:'#7C3AED', background:'#f5f3ff', padding:'2px 8px', borderRadius:'4px' }}>{f.forest_code}</span>}
                      </div>
                      <div style={{ fontSize:'12px', color:'#9ca3af', display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'6px' }}>
                        {f.sites?.name && <span>📍 {f.sites.name}</span>}
                        {f.worker?.name && <span>👷 {f.worker.name}</span>}
                        <span>🌳 {f.trees_planted}/{f.trees_target} trees</span>
                        <span>🌿 {f.species_count}+ species</span>
                        <span>👥 {f.donor_count} donors</span>
                        {f.total_donated ? <span style={{ color:'#7C3AED' }}>₹{Number(f.total_donated).toLocaleString('en-IN')} pooled</span> : null}
                      </div>
                      {/* Progress bar */}
                      <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'4px', overflow:'hidden', maxWidth:'300px' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#7C3AED,#a78bfa)', borderRadius:'999px' }} />
                      </div>
                      <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'2px' }}>{pct}% planted</div>
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

                  {expandedForest === f.id && (
                    <div style={{ background:'#f9fafb', borderTop:'1px solid #e5e7eb', padding:'1rem 1.25rem' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'0.75rem' }}>
                        Donors in this forest ({forestDonors[f.id]?.length || 0})
                      </div>
                      {(forestDonors[f.id] || []).length === 0 ? (
                        <div style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'0.75rem' }}>No donors assigned yet</div>
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
                                <div style={{ fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>₹{Number(d.amount).toLocaleString('en-IN')}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {/* Add more donors button */}
                      {unassigned.length > 0 && (
                        <button onClick={() => { setPoolForestId(f.id); setShowPoolModal(true) }}
                          style={{ padding:'6px 14px', background:'#7C3AED', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                          + Add Donors to Forest
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* POOL ASSIGNMENT MODAL */}
      {showPoolModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'1.5rem', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', maxHeight:'80vh', overflowY:'auto' }}>
            <h3 style={{ fontSize:'16px', fontWeight:600, color:'#1A1A1A', marginBottom:'0.5rem' }}>
              Assign Donors to Forest
            </h3>

            {/* Forest selector */}
            <div style={{ marginBottom:'1rem' }}>
              <label style={lbl}>Select forest *</label>
              <select value={poolForestId || ''} onChange={e => setPoolForestId(Number(e.target.value))}
                style={{ ...inp }}>
                <option value="">— Select forest —</option>
                {forests.map(f => (
                  <option key={f.id} value={f.id}>{f.forest_code ? `${f.forest_code} · ` : ''}{f.forest_name}</option>
                ))}
              </select>
            </div>

            {/* Donor checkboxes */}
            <div style={{ marginBottom:'1rem' }}>
              <label style={lbl}>Select donors to pool ({selectedDonors.length} selected · ₹{totalSelected.toLocaleString('en-IN')})</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'240px', overflowY:'auto', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'8px' }}>
                {unassigned.map(d => (
                  <label key={d.miyawaki_id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px', borderRadius:'6px', cursor:'pointer', background: selectedDonors.includes(d.miyawaki_id) ? '#f5f3ff' : 'white', border: selectedDonors.includes(d.miyawaki_id) ? '1px solid #ddd6fe' : '1px solid transparent' }}>
                    <input type="checkbox"
                      checked={selectedDonors.includes(d.miyawaki_id)}
                      onChange={() => toggleDonor(d.miyawaki_id)}
                    />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'#1A1A1A' }}>{d.name}</div>
                      <div style={{ fontSize:'11px', color:'#9ca3af' }}>{d.email}</div>
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>₹{Number(d.amount).toLocaleString('en-IN')}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedDonors.length > 0 && poolForestId && (
              <div style={{ background:'#f0fdf4', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#166534' }}>
                📧 Email will be sent to {selectedDonors.length} donor(s) with forest details and dashboard access.
                <br/>Forest: <strong>{forests.find(f => f.id === poolForestId)?.forest_name}</strong>
                <br/>Total pool: <strong>₹{totalSelected.toLocaleString('en-IN')}</strong>
              </div>
            )}

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <button onClick={() => { setShowPoolModal(false); setSelectedDonors([]); setPoolForestId(null) }}
                style={{ padding:'8px 16px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
              <button onClick={handleAssignPool}
                disabled={!poolForestId || selectedDonors.length === 0 || assigning}
                style={{ padding:'8px 16px', background: (!poolForestId || selectedDonors.length === 0 || assigning) ? '#9ca3af' : '#7C3AED', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor: (!poolForestId || selectedDonors.length === 0 || assigning) ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                {assigning ? 'Assigning...' : `✅ Assign ${selectedDonors.length} Donor(s) + Send Email`}
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
