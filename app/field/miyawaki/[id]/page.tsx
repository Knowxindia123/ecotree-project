'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'photos' | 'details' | 'submitting' | 'done'

export default function FieldMiyawaki() {
  const router   = useRouter()
  const params   = useParams()
  const forestId = params.id as string

  const [step,         setStep]         = useState<Step>('photos')
  const [forest,       setForest]       = useState<any>(null)
  const [worker,       setWorker]       = useState<any>(null)
  const [beforePhotos, setBeforePhotos] = useState<File[]>([])
  const [afterPhotos,  setAfterPhotos]  = useState<File[]>([])
  const [sitePhotos,   setSitePhotos]   = useState<File[]>([])
  const [beforePrevs,  setBeforePrevs]  = useState<string[]>([])
  const [afterPrevs,   setAfterPrevs]   = useState<string[]>([])
  const [sitePrevs,    setSitePrevs]    = useState<string[]>([])
  const [treesToday,   setTreesToday]   = useState('')   // trees planted TODAY
  const [notes,        setNotes]        = useState('')
  const [gps,          setGps]          = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading,   setGpsLoading]   = useState(false)
  const [gpsError,     setGpsError]     = useState('')
  const [error,        setError]        = useState('')
  const [progress,     setProgress]     = useState(0)
  const [prevUpdates,  setPrevUpdates]  = useState<any[]>([])

  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef  = useRef<HTMLInputElement>(null)
  const siteRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { loadForest() }, [forestId])

  async function loadForest() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }
    const { data: u } = await supabase.from('users').select('id,name').eq('email', session.user.email).single()
    setWorker(u)

    const { data: f } = await supabase.from('miyawaki_forests')
      .select('*, site_id').eq('id', forestId).single()
    if (f?.site_id) {
      const { data: s } = await supabase.from('sites').select('name').eq('id', f.site_id).single()
      setForest({ ...f, site_name: s?.name })
    } else setForest(f)

    // Load previous approved updates for this forest
    const { data: updates } = await supabase
      .from('miyawaki_updates')
      .select('id, trees_planted_today, total_planted_so_far, notes, status, created_at')
      .eq('forest_id', forestId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false })
      .limit(5)
    setPrevUpdates(updates || [])
  }

  function addPhotos(files: FileList | null, type: 'before'|'after'|'site') {
    if (!files) return
    const arr = Array.from(files)
    const prevs = arr.map(f => URL.createObjectURL(f))
    if (type === 'before') { setBeforePhotos(p => [...p,...arr]); setBeforePrevs(p => [...p,...prevs]) }
    if (type === 'after')  { setAfterPhotos(p => [...p,...arr]);  setAfterPrevs(p => [...p,...prevs])  }
    if (type === 'site')   { setSitePhotos(p => [...p,...arr]);   setSitePrevs(p => [...p,...prevs])   }
  }

  function removePhoto(type: 'before'|'after'|'site', i: number) {
    if (type === 'before') { setBeforePhotos(p => p.filter((_,j)=>j!==i)); setBeforePrevs(p => p.filter((_,j)=>j!==i)) }
    if (type === 'after')  { setAfterPhotos(p => p.filter((_,j)=>j!==i));  setAfterPrevs(p => p.filter((_,j)=>j!==i))  }
    if (type === 'site')   { setSitePhotos(p => p.filter((_,j)=>j!==i));   setSitePrevs(p => p.filter((_,j)=>j!==i))   }
  }

  function captureGPS() {
    setGpsLoading(true); setGpsError('')
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false) },
      err => { setGpsError('Could not get GPS: ' + err.message); setGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  async function uploadPhotos(files: File[], folder: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of files) {
      const path = `miyawaki-${forestId}/${folder}-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: e } = await supabase.storage.from('tree-photos').upload(path, file, { contentType:'image/jpeg', upsert:true })
      if (!e) urls.push(supabase.storage.from('tree-photos').getPublicUrl(path).data.publicUrl)
    }
    return urls
  }

  async function handleSubmit() {
    if (afterPhotos.length === 0) { setError('Please upload at least one after photo'); return }
    const todayCount = Number(treesToday)
    if (!treesToday || todayCount < 1) { setError('Please enter number of trees planted today'); return }

    // Validate: total can't exceed target
    const currentTotal = forest?.trees_planted || 0
    const newTotal = currentTotal + todayCount
    if (forest?.trees_target && newTotal > forest.trees_target) {
      setError(`Cannot exceed target. Current: ${currentTotal}, Today: ${todayCount}, Target: ${forest.trees_target}`)
      return
    }

    setStep('submitting'); setError('')

    try {
      setProgress(20)
      const [beforeUrls, afterUrls, siteUrls] = await Promise.all([
        uploadPhotos(beforePhotos, 'before'),
        uploadPhotos(afterPhotos, 'after'),
        uploadPhotos(sitePhotos, 'site'),
      ])
      setProgress(60)

      // Save to miyawaki_updates (PENDING — admin reviews)
      await supabase.from('miyawaki_updates').insert({
        forest_id:           Number(forestId),
        worker_id:           worker?.id,
        trees_planted_today: todayCount,
        total_planted_so_far: newTotal,
        photos:              [...beforeUrls, ...afterUrls, ...siteUrls],
        notes:               notes || null,
        status:              'PENDING',
      })

      // Also update forest photos + GPS immediately (photos visible to donors)
      const existing = forest || {}
      const newBefore = [...(existing.before_photos||[]), ...beforeUrls]
      const newAfter  = [...(existing.after_photos||[]),  ...afterUrls]
      const newSite   = [...(existing.site_photos||[]),   ...siteUrls]

      await supabase.from('miyawaki_forests').update({
        before_photos: newBefore,
        after_photos:  newAfter,
        site_photos:   newSite,
        latitude:      gps?.lat ?? forest?.latitude ?? null,
        longitude:     gps?.lng ?? forest?.longitude ?? null,
        status:        'ACTIVE',
        notes:         notes || forest?.notes || null,
      }).eq('id', forestId)

      setProgress(100)
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Upload failed. Try again.')
      setStep('details')
    }
  }

  if (!forest) return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontSize:'3rem' }}>🏙️</div>
      <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.7)', fontFamily:'sans-serif' }}>Loading forest...</div>
    </div>
  )

  const pct = forest.trees_target > 0 ? Math.round(((forest.trees_planted||0)/forest.trees_target)*100) : 0
  const todayCount = Number(treesToday) || 0
  const newTotal = (forest.trees_planted || 0) + todayCount
  const newPct = forest.trees_target > 0 ? Math.round((newTotal/forest.trees_target)*100) : 0

  if (step === 'done') return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'1.25rem', textAlign:'center', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:'4rem' }}>🎉</div>
      <div style={{ fontSize:'22px', fontWeight:700, color:'#97BC62' }}>Update Submitted!</div>
      <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{forest.forest_name}</div>
      <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'16px', padding:'1.25rem', width:'100%', maxWidth:'300px' }}>
        <Stat label="Trees today" val={String(todayCount)} />
        <Stat label="Total so far" val={`${newTotal} / ${forest.trees_target}`} />
        <Stat label="Progress" val={`${newPct}%`} />
        <Stat label="Photos" val={String(beforePhotos.length + afterPhotos.length + sitePhotos.length)} />
      </div>
      <div style={{ background:'rgba(255,193,7,0.15)', borderRadius:'12px', padding:'10px 16px', fontSize:'13px', color:'rgba(255,255,255,0.7)', maxWidth:'300px' }}>
        ⏳ Admin will review and approve this update. Donors will see progress once approved.
      </div>
      <button onClick={() => router.push('/field/tasks')}
        style={{ width:'100%', maxWidth:'300px', padding:'1rem', background:'#97BC62', color:'#1A3C34', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:700, cursor:'pointer' }}>
        Back to Tasks
      </button>
    </div>
  )

  if (step === 'submitting') return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'1.5rem', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:'3rem' }}>🏙️</div>
      <div style={{ fontSize:'18px', fontWeight:700, color:'white' }}>Uploading...</div>
      <div style={{ width:'100%', maxWidth:'280px', height:'8px', background:'rgba(255,255,255,0.2)', borderRadius:'999px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${progress}%`, background:'#97BC62', borderRadius:'999px', transition:'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>Please keep app open · {progress}%</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'#f3f4f6', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif', maxWidth:'480px', margin:'0 auto' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7C3AED,#5b21b6)', padding:'1.25rem', position:'sticky', top:0, zIndex:20 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', fontSize:'14px', cursor:'pointer', padding:0, marginBottom:'10px' }}>← Back</button>
        <div style={{ fontSize:'18px', fontWeight:700, color:'white', marginBottom:'2px' }}>🏙️ {forest.forest_name}</div>
        {forest.forest_code && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', fontFamily:'monospace', marginBottom:'4px' }}>{forest.forest_code}</div>}
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)' }}>{forest.site_name || 'Bangalore'} · {forest.species_count||30}+ species</div>
        <div style={{ marginTop:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'rgba(255,255,255,0.6)', marginBottom:'4px' }}>
            <span>Current progress</span>
            <span style={{ fontWeight:600, color:'#e9d5ff' }}>{forest.trees_planted||0}/{forest.trees_target} ({pct}%)</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:'999px', height:'6px', overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:'#e9d5ff', borderRadius:'999px' }} />
          </div>
        </div>
      </div>

      <div style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem', overflowY:'auto' }}>

        {/* Previous updates */}
        {prevUpdates.length > 0 && (
          <div style={{ background:'white', borderRadius:'16px', padding:'1rem', border:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'8px' }}>📋 Previous approved updates</div>
            {prevUpdates.map((u, i) => (
              <div key={u.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', padding:'4px 0', borderBottom: i < prevUpdates.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <span>{new Date(u.created_at).toLocaleDateString('en-IN')}</span>
                <span style={{ color:'#7C3AED', fontWeight:600 }}>+{u.trees_planted_today} trees</span>
                <span>Total: {u.total_planted_so_far}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trees planted TODAY */}
        <div style={{ background:'white', borderRadius:'16px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#1A1A1A', marginBottom:'2px' }}>🌳 Trees Planted Today</div>
          <div style={{ fontSize:'12px', color:'#9ca3af', marginBottom:'10px' }}>How many trees planted in this session?</div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', background:'#f9fafb', borderRadius:'12px', padding:'1rem', border:'1.5px solid #e5e7eb' }}>
            <button onClick={()=>setTreesToday(p=>String(Math.max(0,(Number(p)||0)-1)))}
              style={{ width:'44px', height:'44px', borderRadius:'50%', border:'2px solid #e5e7eb', background:'white', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', flexShrink:0 }}>−</button>
            <input type="number" value={treesToday} onChange={e=>setTreesToday(e.target.value)} min="0"
              style={{ flex:1, textAlign:'center', fontSize:'2rem', fontWeight:700, color:'#7C3AED', border:'none', background:'transparent', outline:'none', fontFamily:'inherit' }}/>
            <button onClick={()=>setTreesToday(p=>String((Number(p)||0)+1))}
              style={{ width:'44px', height:'44px', borderRadius:'50%', border:'2px solid #e5e7eb', background:'white', fontSize:'1.5rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', flexShrink:0 }}>+</button>
          </div>
          {todayCount > 0 && (
            <div style={{ marginTop:'10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>
                <span>After this update: {newTotal}/{forest.trees_target}</span>
                <span style={{ fontWeight:600, color:'#7C3AED' }}>{newPct}%</span>
              </div>
              <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'5px', overflow:'hidden' }}>
                <div style={{ width:`${newPct}%`, height:'100%', background:'linear-gradient(90deg,#7C3AED,#a78bfa)', borderRadius:'999px' }} />
              </div>
            </div>
          )}
          <div style={{ fontSize:'12px', color:'#9ca3af', textAlign:'center', marginTop:'6px' }}>Target: {forest.trees_target} · Planted: {forest.trees_planted||0} · Remaining: {(forest.trees_target||0) - (forest.trees_planted||0)}</div>
        </div>

        {/* After Photos — required */}
        <Section title="🌱 After Photos *" subtitle="Trees planted today (required)">
          <PhotoGrid previews={afterPrevs} onAdd={() => afterRef.current?.click()} onRemove={i=>removePhoto('after',i)} color="#166534" required />
          <input ref={afterRef} type="file" accept="image/*" capture="environment" multiple onChange={e=>addPhotos(e.target.files,'after')} style={{ display:'none' }}/>
        </Section>

        {/* Before Photos */}
        <Section title="📸 Before Photos" subtitle="Site before today's planting">
          <PhotoGrid previews={beforePrevs} onAdd={() => beforeRef.current?.click()} onRemove={i=>removePhoto('before',i)} color="#1A3C34" />
          <input ref={beforeRef} type="file" accept="image/*" capture="environment" multiple onChange={e=>addPhotos(e.target.files,'before')} style={{ display:'none' }}/>
        </Section>

        {/* Site Overview */}
        <Section title="🏞️ Site Overview Photos" subtitle="Wider view of plantation area">
          <PhotoGrid previews={sitePrevs} onAdd={() => siteRef.current?.click()} onRemove={i=>removePhoto('site',i)} color="#0369a1" />
          <input ref={siteRef} type="file" accept="image/*" capture="environment" multiple onChange={e=>addPhotos(e.target.files,'site')} style={{ display:'none' }}/>
        </Section>

        {/* GPS */}
        <Section title="📍 GPS Location" subtitle="Forest site coordinates">
          {gps ? (
            <div style={{ background:'#dcfce7', borderRadius:'12px', padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'20px' }}>✅</span>
              <div>
                <div style={{ fontSize:'13px', fontWeight:600, color:'#166534' }}>GPS captured</div>
                <div style={{ fontFamily:'monospace', fontSize:'12px', color:'#166534' }}>{gps.lat.toFixed(6)}° N, {gps.lng.toFixed(6)}° E</div>
              </div>
              <button onClick={()=>setGps(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:'18px' }}>✕</button>
            </div>
          ) : (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ width:'100%', padding:'0.875rem', background:gpsLoading?'#9ca3af':'#0369a1', color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:600, cursor:gpsLoading?'not-allowed':'pointer', fontFamily:'inherit' }}>
              {gpsLoading ? '⏳ Getting GPS...' : '📍 Capture GPS Location'}
            </button>
          )}
          {gpsError && <div style={{ fontSize:'13px', color:'#dc2626', marginTop:'6px' }}>{gpsError}</div>}
        </Section>

        {/* Notes */}
        <Section title="📝 Notes" subtitle="Optional field notes">
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder="Species planted today, soil conditions, any issues..."
            rows={3} style={{ width:'100%', padding:'0.875rem', border:'1.5px solid #e5e7eb', borderRadius:'12px', fontSize:'15px', outline:'none', resize:'none', fontFamily:'inherit', boxSizing:'border-box' as const }}/>
        </Section>

        {error && <div style={{ background:'#fef2f2', borderRadius:'12px', padding:'0.875rem', fontSize:'14px', color:'#dc2626' }}>{error}</div>}

        <button onClick={handleSubmit}
          style={{ width:'100%', padding:'1.125rem', background:'#7C3AED', color:'white', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:700, cursor:'pointer', minHeight:'60px', marginBottom:'1rem' }}>
          🏙️ Submit Today's Update
        </button>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title:string; subtitle:string; children:React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:'16px', padding:'1rem', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize:'14px', fontWeight:700, color:'#1A1A1A', marginBottom:'2px' }}>{title}</div>
      <div style={{ fontSize:'12px', color:'#9ca3af', marginBottom:'10px' }}>{subtitle}</div>
      {children}
    </div>
  )
}

function PhotoGrid({ previews, onAdd, onRemove, color, required }: { previews:string[]; onAdd:()=>void; onRemove:(i:number)=>void; color:string; required?:boolean }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
      {previews.map((url,i) => (
        <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:'10px', overflow:'hidden' }}>
          <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <button onClick={()=>onRemove(i)} style={{ position:'absolute', top:'4px', right:'4px', width:'22px', height:'22px', borderRadius:'50%', background:'rgba(220,38,38,0.85)', border:'none', color:'white', fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>✕</button>
        </div>
      ))}
      <div onClick={onAdd}
        style={{ aspectRatio:'1', borderRadius:'10px', border:`2px dashed ${required?'#ef4444':'#d1d5db'}`, background:required?'#fef2f2':'#f9fafb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:'4px' }}>
        <span style={{ fontSize:'1.5rem', color:color }}>+</span>
        <span style={{ fontSize:'10px', color:'#9ca3af' }}>Add photo</span>
      </div>
    </div>
  )
}

function Stat({ label, val }: { label:string; val:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
      <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>{label}</span>
      <span style={{ fontSize:'13px', fontWeight:600, color:'white' }}>{val}</span>
    </div>
  )
}
