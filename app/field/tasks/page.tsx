'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Tab = 'trees' | 'csr'

interface Task {
  id: number
  status: string
  due_date: string | null
  notes: string | null
  trees: {
    id: number
    tree_id: string
    species: string
    tree_type: string
    status: string
  } | null
  sites: {
    name: string
    latitude: number | null
    longitude: number | null
  } | null
}

interface CsrBatch {
  id: number
  company_name: string
  tree_count: number | null
  trees_planted: number
  project_type: string | null
  start_date: string | null
  status: string | null
  progress_status: string | null
  notes: string | null
  sites: { name: string } | null
}

interface WorkerInfo {
  id: number
  name: string
  email: string
}

export default function FieldTasks() {
  const router   = useRouter()
  const [tab,     setTab]     = useState<Tab>('trees')
  const [tasks,   setTasks]   = useState<Task[]>([])
  const [batches, setBatches] = useState<CsrBatch[]>([])
  const [worker,  setWorker]  = useState<WorkerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuthAndLoad() }, [])

  async function checkAuthAndLoad() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }

    const { data: userData } = await supabase
      .from('users').select('id, name, email').eq('email', session.user.email).single()
    if (!userData) { window.location.replace('/field/login'); return }
    setWorker(userData)

    // Load individual tree tasks
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, status, due_date, notes, trees(id, tree_id, species, tree_type, status), sites(name, latitude, longitude)')
      .eq('worker_id', userData.id)
      .in('status', ['ASSIGNED', 'IN_PROGRESS'])
      .order('assigned_at', { ascending: true })
    setTasks((assignments as unknown as Task[]) || [])

    // Load CSR batch assignments
    const { data: csrData } = await supabase
      .from('csr_partners')
      .select('id, company_name, tree_count, trees_planted, project_type, start_date, status, progress_status, notes, site_id')
      .eq('worker_id', userData.id)
      .in('status', ['ASSIGNED', 'IN_PROGRESS'])
      .order('assigned_at', { ascending: true })

    // Fetch site names separately
    if (csrData && csrData.length > 0) {
      const siteIds = csrData.map((c: any) => c.site_id).filter(Boolean)
      const { data: sitesData } = await supabase
        .from('sites').select('id, name').in('id', siteIds)
      const sitesMap: Record<number, string> = {}
      sitesData?.forEach((s: any) => { sitesMap[s.id] = s.name })
      setBatches(csrData.map((c: any) => ({ ...c, sites: c.site_id ? { name: sitesMap[c.site_id] || '—' } : null })))
    } else {
      setBatches([])
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.replace('/field/login')
  }

  function statusColor(status: string) {
    switch (status) {
      case 'ASSIGNED':    return { bg: '#fef3c7', text: '#92400e', label: 'Pending' }
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' }
      case 'COMPLETED':   return { bg: '#dcfce7', text: '#166534', label: 'Done' }
      default:            return { bg: '#f3f4f6', text: '#6b7280', label: status }
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100dvh', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🌱</div>
        <div style={{ fontSize:'14px', color:'#6B7280' }}>Loading your tasks...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'#f9fafb', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'#1A3C34', padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#97BC62' }}>
            Eco<span style={{ color:'white' }}>Tree</span>
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', marginTop:'1px' }}>👋 {worker?.name}</div>
        </div>
        <button onClick={handleLogout} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'6px 12px', color:'rgba(255,255,255,0.8)', fontSize:'13px', cursor:'pointer' }}>
          Sign out
        </button>
      </div>

      {/* Date + count */}
      <div style={{ padding:'1rem 1.25rem', background:'white', borderBottom:'1px solid #e5e7eb' }}>
        <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A' }}>Today&apos;s Tasks</div>
        <div style={{ fontSize:'13px', color:'#6B7280', marginTop:'2px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'white', borderBottom:'1px solid #e5e7eb' }}>
        {[
          { id:'trees', label:'🌱 My Trees',   count: tasks.length   },
          { id:'csr',   label:'🏢 CSR Batches', count: batches.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            style={{
              flex:1, padding:'0.75rem', border:'none', cursor:'pointer',
              background: tab === t.id ? '#f0fdf4' : 'white',
              borderBottom: tab === t.id ? '3px solid #1A3C34' : '3px solid transparent',
              fontSize:'13px', fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? '#1A3C34' : '#6B7280',
            }}>
            {t.label}
            <span style={{ marginLeft:'6px', background: tab === t.id ? '#1A3C34' : '#e5e7eb', color: tab === t.id ? 'white' : '#6B7280', fontSize:'11px', fontWeight:700, padding:'1px 7px', borderRadius:'10px' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── INDIVIDUAL TREES TAB ── */}
      {tab === 'trees' && (
        <div style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {tasks.length === 0 ? (
            <div style={{ background:'white', borderRadius:'16px', padding:'3rem 1.5rem', textAlign:'center', border:'1px solid #e5e7eb' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>✅</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>All done for today!</div>
              <div style={{ fontSize:'13px', color:'#6B7280' }}>No pending tree tasks.</div>
            </div>
          ) : tasks.map(task => {
            const badge = statusColor(task.trees?.status || 'ASSIGNED')
            return (
              <div key={task.id} onClick={() => router.push(`/field/plant/${task.id}`)}
                style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #e5e7eb', cursor:'pointer', transition:'transform 0.15s', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', WebkitTapHighlightColor:'transparent' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ fontFamily:'monospace', fontSize:'13px', fontWeight:600, color:'#1A3C34' }}>{task.trees?.tree_id || 'Unassigned'}</div>
                  <span style={{ background:badge.bg, color:badge.text, fontSize:'12px', padding:'3px 10px', borderRadius:'20px', fontWeight:500 }}>{badge.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                  <span style={{ fontSize:'1.25rem' }}>
                    {task.trees?.species === 'Mango' ? '🥭' : task.trees?.species === 'Neem' ? '🌿' : task.trees?.species === 'Peepal' ? '🌳' : '🌱'}
                  </span>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A' }}>{task.trees?.species || 'Unknown species'}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280' }}>{task.trees?.tree_type}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                  <span style={{ fontSize:'14px' }}>📍</span>
                  <span style={{ fontSize:'14px', color:'#374151' }}>{task.sites?.name || 'No site'}</span>
                </div>
                {task.due_date && (
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'14px' }}>📅</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>Due: {new Date(task.due_date).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {task.notes && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'6px' }}>
                    <span style={{ fontSize:'14px' }}>📝</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>{task.notes}</span>
                  </div>
                )}
                <div style={{ marginTop:'12px', padding:'10px', background:'#f0fdf4', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'#1A3C34' }}>Tap to plant this tree</span>
                  <span style={{ fontSize:'18px' }}>→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CSR BATCH TAB ── */}
      {tab === 'csr' && (
        <div style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {batches.length === 0 ? (
            <div style={{ background:'white', borderRadius:'16px', padding:'3rem 1.5rem', textAlign:'center', border:'1px solid #e5e7eb' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🏢</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>No CSR batches assigned</div>
              <div style={{ fontSize:'13px', color:'#6B7280' }}>Admin will assign CSR batches from the CSR Partners page.</div>
            </div>
          ) : batches.map(batch => {
            const planted   = batch.trees_planted || 0
            const total     = batch.tree_count || 0
            const pct       = total > 0 ? Math.round((planted / total) * 100) : 0
            const badge     = statusColor(batch.status || 'ASSIGNED')
            return (
              <div key={batch.id} onClick={() => router.push(`/field/csr-batch/${batch.id}`)}
                style={{ background:'white', borderRadius:'16px', padding:'1.25rem', border:'1px solid #e5e7eb', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', WebkitTapHighlightColor:'transparent' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#1A1A1A' }}>🏢 {batch.company_name}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>{batch.project_type || 'Tree Plantation'}</div>
                  </div>
                  <span style={{ background:badge.bg, color:badge.text, fontSize:'12px', padding:'3px 10px', borderRadius:'20px', fontWeight:500 }}>{badge.label}</span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>
                    <span>Trees planted</span>
                    <span style={{ fontWeight:600, color:'#1A3C34' }}>{planted} / {total}</span>
                  </div>
                  <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'6px', overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:'#2C5F2D', borderRadius:'999px', transition:'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>{pct}% complete</div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                  <span style={{ fontSize:'14px' }}>📍</span>
                  <span style={{ fontSize:'14px', color:'#374151' }}>{batch.sites?.name || 'No site'}</span>
                </div>

                {batch.start_date && (
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'14px' }}>📅</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>Started: {new Date(batch.start_date).toLocaleDateString('en-IN')}</span>
                  </div>
                )}

                {batch.notes && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'6px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'14px' }}>📝</span>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>{batch.notes}</span>
                  </div>
                )}

                <div style={{ marginTop:'8px', padding:'10px', background:'#eff6ff', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'#1e40af' }}>Tap to update batch photos</span>
                  <span style={{ fontSize:'18px' }}>→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ background:'white', borderTop:'1px solid #e5e7eb', padding:'0.75rem 1.25rem', display:'flex', justifyContent:'space-around', position:'sticky', bottom:0 }}>
        <div style={{ textAlign:'center', color:'#1A3C34' }}>
          <div style={{ fontSize:'20px' }}>📋</div>
          <div style={{ fontSize:'11px', fontWeight:600 }}>Tasks</div>
        </div>
        <div onClick={() => router.push('/field/status')} style={{ textAlign:'center', color:'#9ca3af', cursor:'pointer' }}>
          <div style={{ fontSize:'20px' }}>☁️</div>
          <div style={{ fontSize:'11px' }}>Uploads</div>
        </div>
      </div>
    </div>
  )
}
