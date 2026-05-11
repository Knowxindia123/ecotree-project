'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Tab = 'trees' | 'csr' | 'miyawaki'

interface Task {
  id: number; status: string; due_date: string | null; notes: string | null
  trees: { id: number; tree_id: string; species: string; tree_type: string; status: string } | null
  sites: { name: string; latitude: number | null; longitude: number | null } | null
}
interface CsrBatch {
  id: number; company_name: string; tree_count: number | null; trees_planted: number
  project_type: string | null; start_date: string | null; status: string | null
  progress_status: string | null; notes: string | null; sites: { name: string } | null
}
interface MiyawakiForest {
  id: number; forest_name: string; trees_target: number; trees_planted: number
  species_count: number; status: string | null; notes: string | null
  sites: { name: string } | null
}
interface WorkerInfo { id: number; name: string; email: string }

const SPECIES_EMOJI: Record<string,string> = { Neem:'🌿', Peepal:'🌳', Mango:'🥭', Jamun:'🍇', Banyan:'🌲', Gulmohar:'🌺', 'Rain Tree':'🌴', Guava:'🍈', default:'🌱' }
const se = (s: string) => SPECIES_EMOJI[s] || SPECIES_EMOJI.default

export default function FieldTasks() {
  const router = useRouter()
  const [tab,     setTab]     = useState<Tab>('trees')
  const [tasks,   setTasks]   = useState<Task[]>([])
  const [batches, setBatches] = useState<CsrBatch[]>([])
  const [forests, setForests] = useState<MiyawakiForest[]>([])
  const [worker,  setWorker]  = useState<WorkerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }
    const { data: u } = await supabase.from('users').select('id,name,email').eq('email', session.user.email).single()
    if (!u) { window.location.replace('/field/login'); return }
    setWorker(u)

    // Trees
    const { data: a } = await supabase.from('assignments')
      .select('id,status,due_date,notes,trees(id,tree_id,species,tree_type,status),sites(name,latitude,longitude)')
      .eq('worker_id', u.id).in('status', ['ASSIGNED','IN_PROGRESS']).order('assigned_at', { ascending: true })
    setTasks((a as unknown as Task[]) || [])

    // CSR
    const { data: c } = await supabase.from('csr_partners')
      .select('id,company_name,tree_count,trees_planted,project_type,start_date,status,progress_status,notes,site_id')
      .eq('worker_id', u.id).in('status', ['ASSIGNED','IN_PROGRESS'])
    if (c?.length) {
      const sids = c.map((x: any) => x.site_id).filter(Boolean)
      const { data: sd } = await supabase.from('sites').select('id,name').in('id', sids)
      const sm: Record<number,string> = {}
      sd?.forEach((s: any) => { sm[s.id] = s.name })
      setBatches(c.map((x: any) => ({ ...x, sites: x.site_id ? { name: sm[x.site_id]||'—' } : null })))
    } else setBatches([])

    // Miyawaki
    const { data: f } = await supabase.from('miyawaki_forests')
      .select('id,forest_name,trees_target,trees_planted,species_count,status,notes,site_id')
      .eq('worker_id', u.id).not('status','eq','COMPLETE').order('created_at', { ascending: false })
    if (f?.length) {
      const sids = f.map((x: any) => x.site_id).filter(Boolean)
      let sm: Record<number,string> = {}
      if (sids.length) {
        const { data: sd } = await supabase.from('sites').select('id,name').in('id', sids)
        sd?.forEach((s: any) => { sm[s.id] = s.name })
      }
      setForests(f.map((x: any) => ({ ...x, sites: x.site_id ? { name: sm[x.site_id]||'—' } : null })))
    } else setForests([])

    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.replace('/field/login') }

  function badge(s: string) {
    if (s==='ASSIGNED'||s==='PENDING') return { bg:'#fef3c7', text:'#92400e', label:'Pending' }
    if (s==='IN_PROGRESS'||s==='ACTIVE') return { bg:'#dbeafe', text:'#1e40af', label:'In Progress' }
    if (s==='COMPLETED') return { bg:'#dcfce7', text:'#166534', label:'Done' }
    return { bg:'#f3f4f6', text:'#6b7280', label:s }
  }

  const tabs = [
    { id:'trees',    emoji:'🌱', label:'My Trees',    count:tasks.length   },
    { id:'csr',      emoji:'🏢', label:'CSR',         count:batches.length },
    { id:'miyawaki', emoji:'🏙️', label:'Miyawaki',   count:forests.length },
  ]

  if (loading) return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontSize:'3rem' }}>🌱</div>
      <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', fontFamily:'sans-serif' }}>Loading tasks...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'#f3f4f6', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif', maxWidth:'480px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1A3C34,#2C5F2D)', padding:'1.25rem 1.25rem 1rem', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', fontWeight:700, color:'#97BC62' }}>Eco<span style={{ color:'white' }}>Tree</span></div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', marginTop:'2px' }}>👋 {worker?.name}</div>
          </div>
          <button onClick={handleLogout} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'10px', padding:'7px 14px', color:'rgba(255,255,255,0.85)', fontSize:'13px', cursor:'pointer' }}>Sign out</button>
        </div>
        <div style={{ marginTop:'1rem', background:'rgba(255,255,255,0.08)', borderRadius:'12px', padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)' }}>Today</div>
            <div style={{ fontSize:'14px', fontWeight:600, color:'white' }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' })}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)' }}>Pending tasks</div>
            <div style={{ fontSize:'20px', fontWeight:700, color:'#97BC62' }}>{tasks.length + batches.length + forests.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'white', borderBottom:'1px solid #e5e7eb', position:'sticky', top:'106px', zIndex:10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            style={{ flex:1, padding:'0.75rem 0.25rem', border:'none', cursor:'pointer', background:tab===t.id?'#f0fdf4':'white', borderBottom:`3px solid ${tab===t.id?'#1A3C34':'transparent'}`, fontSize:'12px', fontWeight:tab===t.id?700:400, color:tab===t.id?'#1A3C34':'#6B7280', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <span style={{ fontSize:'18px' }}>{t.emoji}</span>
            <span>{t.label}</span>
            <span style={{ background:tab===t.id?'#1A3C34':'#e5e7eb', color:tab===t.id?'white':'#6B7280', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>

        {/* TREES TAB */}
        {tab === 'trees' && (
          tasks.length === 0 ? (
            <Empty emoji="✅" title="All done!" sub="No pending tree tasks." />
          ) : tasks.map(t => {
            const b = badge(t.trees?.status || 'ASSIGNED')
            return (
              <div key={t.id} onClick={() => router.push(`/field/plant/${t.id}`)}
                style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', WebkitTapHighlightColor:'transparent', border:'1px solid #e5e7eb' }}>
                {/* Card header */}
                <div style={{ background:'#1A3C34', padding:'0.875rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontFamily:'monospace', fontSize:'12px', color:'#97BC62' }}>{t.trees?.tree_id}</div>
                  <span style={{ background:b.bg, color:b.text, fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>{b.label}</span>
                </div>
                <div style={{ padding:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                    <span style={{ fontSize:'2rem' }}>{se(t.trees?.species||'')}</span>
                    <div>
                      <div style={{ fontSize:'16px', fontWeight:700, color:'#1A1A1A' }}>{t.trees?.species || 'Unknown'}</div>
                      <div style={{ fontSize:'12px', color:'#6B7280' }}>{t.trees?.tree_type}</div>
                    </div>
                  </div>
                  {t.sites?.name && <InfoRow emoji="📍" text={t.sites.name} />}
                  {t.due_date && <InfoRow emoji="📅" text={`Due: ${new Date(t.due_date).toLocaleDateString('en-IN')}`} />}
                  {t.notes && <InfoRow emoji="📝" text={t.notes} />}
                  <div style={{ marginTop:'12px', background:'#f0fdf4', borderRadius:'10px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#1A3C34' }}>Tap to plant this tree</span>
                    <span style={{ fontSize:'20px' }}>→</span>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* CSR TAB */}
        {tab === 'csr' && (
          batches.length === 0 ? (
            <Empty emoji="🏢" title="No CSR batches" sub="Admin will assign CSR batches from the CSR Partners page." />
          ) : batches.map(b => {
            const planted = b.trees_planted || 0
            const total   = b.tree_count || 0
            const pct     = total > 0 ? Math.round((planted/total)*100) : 0
            const bd      = badge(b.status||'ASSIGNED')
            return (
              <div key={b.id} onClick={() => router.push(`/field/csr-batch/${b.id}`)}
                style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', border:'1px solid #e5e7eb' }}>
                <div style={{ background:'#1e40af', padding:'0.875rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'white' }}>🏢 {b.company_name}</div>
                  <span style={{ background:bd.bg, color:bd.text, fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>{bd.label}</span>
                </div>
                <div style={{ padding:'1rem' }}>
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>
                      <span>Progress</span><span style={{ fontWeight:600, color:'#1A3C34' }}>{planted}/{total} trees</span>
                    </div>
                    <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'8px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#1A3C34,#52B788)', borderRadius:'999px' }} />
                    </div>
                    <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>{pct}% complete</div>
                  </div>
                  {b.sites?.name && <InfoRow emoji="📍" text={b.sites.name} />}
                  {b.project_type && <InfoRow emoji="🌿" text={b.project_type} />}
                  <div style={{ marginTop:'10px', background:'#eff6ff', borderRadius:'10px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#1e40af' }}>Tap to update photos</span>
                    <span style={{ fontSize:'20px' }}>→</span>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* MIYAWAKI TAB */}
        {tab === 'miyawaki' && (
          forests.length === 0 ? (
            <Empty emoji="🏙️" title="No Miyawaki forests" sub="Admin will assign Miyawaki forests from the Miyawaki page." />
          ) : forests.map(f => {
            const planted = f.trees_planted || 0
            const total   = f.trees_target || 0
            const pct     = total > 0 ? Math.round((planted/total)*100) : 0
            const bd      = badge(f.status||'PENDING')
            return (
              <div key={f.id} onClick={() => router.push(`/field/miyawaki/${f.id}`)}
                style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', border:'1px solid #e5e7eb' }}>
                <div style={{ background:'#7C3AED', padding:'0.875rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'white' }}>🏙️ {f.forest_name}</div>
                  <span style={{ background:bd.bg, color:bd.text, fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:600 }}>{bd.label}</span>
                </div>
                <div style={{ padding:'1rem' }}>
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>
                      <span>Trees planted</span><span style={{ fontWeight:600, color:'#7C3AED' }}>{planted}/{total}</span>
                    </div>
                    <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'8px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#7C3AED,#a78bfa)', borderRadius:'999px' }} />
                    </div>
                    <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>{pct}% complete · {f.species_count}+ species</div>
                  </div>
                  {f.sites?.name && <InfoRow emoji="📍" text={f.sites.name} />}
                  {f.notes && <InfoRow emoji="📝" text={f.notes} />}
                  <div style={{ marginTop:'10px', background:'#f5f3ff', borderRadius:'10px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#7C3AED' }}>Tap to upload forest photos</span>
                    <span style={{ fontSize:'20px' }}>→</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background:'white', borderTop:'1px solid #e5e7eb', padding:'0.75rem 1.25rem', display:'flex', justifyContent:'space-around', position:'sticky', bottom:0 }}>
        <NavItem emoji="📋" label="Tasks" active />
        <NavItem emoji="☁️" label="Uploads" onClick={() => router.push('/field/status')} />
      </div>
    </div>
  )
}

function Empty({ emoji, title, sub }: { emoji:string; title:string; sub:string }) {
  return (
    <div style={{ background:'white', borderRadius:'16px', padding:'3rem 1.5rem', textAlign:'center', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>{emoji}</div>
      <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>{title}</div>
      <div style={{ fontSize:'13px', color:'#6B7280' }}>{sub}</div>
    </div>
  )
}

function InfoRow({ emoji, text }: { emoji:string; text:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
      <span style={{ fontSize:'14px' }}>{emoji}</span>
      <span style={{ fontSize:'14px', color:'#374151' }}>{text}</span>
    </div>
  )
}

function NavItem({ emoji, label, active, onClick }: { emoji:string; label:string; active?:boolean; onClick?:()=>void }) {
  return (
    <div onClick={onClick} style={{ textAlign:'center', color:active?'#1A3C34':'#9ca3af', cursor:onClick?'pointer':'default', flex:1 }}>
      <div style={{ fontSize:'22px' }}>{emoji}</div>
      <div style={{ fontSize:'11px', fontWeight:active?600:400 }}>{label}</div>
    </div>
  )
}
