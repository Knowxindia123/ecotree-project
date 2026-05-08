'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'form' | 'submitting' | 'done'

export default function CsrBatchPlant() {
  const router  = useRouter()
  const params  = useParams()
  const batchId = params.id as string

  const [step,        setStep]        = useState<Step>('form')
  const [batch,       setBatch]       = useState<any>(null)
  const [worker,      setWorker]      = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [progress,    setProgress]    = useState(0)

  // Photo arrays
  const [beforePhotos, setBeforePhotos] = useState<File[]>([])
  const [afterPhotos,  setAfterPhotos]  = useState<File[]>([])
  const [sitePreviews, setSitePreviews] = useState<string[]>([])
  const [beforePreviews, setBeforePreviews] = useState<string[]>([])
  const [afterPreviews,  setAfterPreviews]  = useState<string[]>([])
  const [sitePhotos,  setSitePhotos]   = useState<File[]>([])

  // Form fields
  const [treesPlanted, setTreesPlanted] = useState('')
  const [notes,        setNotes]        = useState('')
  const [gps,          setGps]          = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading,   setGpsLoading]   = useState(false)

  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef  = useRef<HTMLInputElement>(null)
  const siteRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { loadBatch() }, [batchId])

  async function loadBatch() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }

    const { data: userData } = await supabase
      .from('users').select('id, name, email').eq('email', session.user.email).single()
    setWorker(userData)

    const { data: batchData } = await supabase
      .from('csr_partners')
      .select('id, company_name, tree_count, trees_planted, project_type, start_date, status, notes, site_id')
      .eq('id', batchId).single()

    if (batchData?.site_id) {
      const { data: siteData } = await supabase
        .from('sites').select('id, name, latitude, longitude').eq('id', batchData.site_id).single()
      setBatch({ ...batchData, sites: siteData })
      if (siteData?.latitude && siteData?.longitude) {
        setGps({ lat: siteData.latitude, lng: siteData.longitude })
      }
    } else {
      setBatch(batchData)
    }

    setLoading(false)
  }

  function captureGPS() {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false) },
      () => { setGpsLoading(false); alert('Could not get GPS') },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  function handleBeforePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setBeforePhotos(prev => [...prev, ...files])
    setBeforePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function handleAfterPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setAfterPhotos(prev => [...prev, ...files])
    setAfterPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function handleSitePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSitePhotos(prev => [...prev, ...files])
    setSitePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  async function handleSubmit() {
    if (!treesPlanted || Number(treesPlanted) < 1) {
      setError('Please enter number of trees planted'); return
    }
    if (afterPhotos.length === 0) {
      setError('Please upload at least one after photo'); return
    }

    setStep('submitting')
    setError('')
    setProgress(10)

    try {
      const timestamp = Date.now()
      const bucket    = 'tree-photos'
      const prefix    = `csr-${batchId}`

      // Upload before photos
      const beforeUrls: string[] = []
      for (let i = 0; i < beforePhotos.length; i++) {
        const path = `${prefix}/before-${timestamp}-${i}.jpg`
        await supabase.storage.from(bucket).upload(path, beforePhotos[i], { contentType:'image/jpeg', upsert:true })
        beforeUrls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
        setProgress(10 + Math.round((i + 1) / (beforePhotos.length || 1) * 25))
      }

      setProgress(35)

      // Upload after photos
      const afterUrls: string[] = []
      for (let i = 0; i < afterPhotos.length; i++) {
        const path = `${prefix}/after-${timestamp}-${i}.jpg`
        await supabase.storage.from(bucket).upload(path, afterPhotos[i], { contentType:'image/jpeg', upsert:true })
        afterUrls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
        setProgress(35 + Math.round((i + 1) / (afterPhotos.length || 1) * 25))
      }

      setProgress(60)

      // Upload site photos
      const siteUrls: string[] = []
      for (let i = 0; i < sitePhotos.length; i++) {
        const path = `${prefix}/site-${timestamp}-${i}.jpg`
        await supabase.storage.from(bucket).upload(path, sitePhotos[i], { contentType:'image/jpeg', upsert:true })
        siteUrls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
        setProgress(60 + Math.round((i + 1) / (sitePhotos.length || 1) * 20))
      }

      setProgress(80)

      // Update csr_partners
      const newTotal = (batch?.trees_planted || 0) + Number(treesPlanted)
      const isComplete = newTotal >= (batch?.tree_count || 0)

      const { error: updateErr } = await supabase.from('csr_partners').update({
        trees_planted:   newTotal,
        before_photos:   beforeUrls.length > 0 ? beforeUrls : undefined,
        after_photos:    afterUrls.length  > 0 ? afterUrls  : undefined,
        site_photos:     siteUrls.length   > 0 ? siteUrls   : undefined,
        latitude:        gps?.lat ?? null,
        longitude:       gps?.lng ?? null,
        notes:           notes || null,
        progress_status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        status:          isComplete ? 'COMPLETED'  : 'ASSIGNED',
        updated_at:      new Date().toISOString(),
      }).eq('id', batchId)

      if (updateErr) throw updateErr

      setProgress(100)
      setStep('done')

    } catch (err: any) {
      setError(err.message || 'Upload failed. Check signal and try again.')
      setStep('form')
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100dvh', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🏢</div>
        <div style={{ fontSize:'14px', color:'#6B7280' }}>Loading batch...</div>
      </div>
    </div>
  )

  // ── SUBMITTING ──
  if (step === 'submitting') return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'1.5rem' }}>
      <div style={{ fontSize:'3rem' }}>📸</div>
      <div style={{ fontSize:'18px', fontWeight:700, color:'white' }}>Uploading photos...</div>
      <div style={{ width:'100%', maxWidth:'280px', height:'6px', background:'rgba(255,255,255,0.2)', borderRadius:'999px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${progress}%`, background:'#97BC62', borderRadius:'999px', transition:'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>Please keep app open · {progress}%</div>
    </div>
  )

  // ── DONE ──
  if (step === 'done') return (
    <div style={{ minHeight:'100dvh', background:'#1A3C34', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', gap:'1rem', textAlign:'center' }}>
      <div style={{ fontSize:'4rem' }}>🎉</div>
      <div style={{ fontSize:'22px', fontWeight:700, color:'#97BC62' }}>Batch Updated!</div>
      <div style={{ fontSize:'15px', color:'white', fontWeight:600 }}>{batch?.company_name}</div>
      <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 20px', color:'rgba(255,255,255,0.8)', fontSize:'14px', lineHeight:1.7 }}>
        Trees planted this session: <strong style={{ color:'#97BC62' }}>{treesPlanted}</strong><br/>
        Total planted: <strong style={{ color:'#97BC62' }}>{(batch?.trees_planted || 0) + Number(treesPlanted)}</strong> / {batch?.tree_count || 0}<br/>
        Photos uploaded: <strong style={{ color:'#97BC62' }}>{beforePhotos.length + afterPhotos.length + sitePhotos.length}</strong>
      </div>
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', maxWidth:'280px', lineHeight:1.6 }}>
        Admin will review and update the CSR partner dashboard.
      </div>
      <button onClick={() => router.push('/field/tasks')}
        style={{ width:'100%', maxWidth:'280px', padding:'1rem', background:'#97BC62', color:'#1A3C34', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:700, cursor:'pointer', minHeight:'56px', marginTop:'0.5rem' }}>
        Back to Tasks
      </button>
    </div>
  )

  // ── MAIN FORM ──
  return (
    <div style={{ minHeight:'100dvh', background:'#f9fafb', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'#1A3C34', padding:'1rem 1.25rem' }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', fontSize:'14px', cursor:'pointer', padding:0, marginBottom:'8px' }}>
          ← Back
        </button>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em' }}>CSR Batch Update</div>
        <div style={{ fontSize:'17px', fontWeight:700, color:'white', marginTop:'2px' }}>🏢 {batch?.company_name}</div>
        <div style={{ display:'flex', gap:'1rem', marginTop:'6px' }}>
          <div style={{ fontSize:'12px', color:'#97BC62' }}>{batch?.tree_count} trees total</div>
          {batch?.sites?.name && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>📍 {batch.sites.name}</div>}
        </div>
      </div>

      <div style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem', overflowY:'auto' }}>

        {/* Progress */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#6B7280', marginBottom:'6px' }}>
            <span>Plantation progress</span>
            <span style={{ fontWeight:600, color:'#1A3C34' }}>{batch?.trees_planted || 0} / {batch?.tree_count || 0} trees</span>
          </div>
          <div style={{ background:'#f3f4f6', borderRadius:'999px', height:'8px', overflow:'hidden' }}>
            <div style={{ width:`${batch?.tree_count ? Math.round(((batch?.trees_planted || 0) / batch.tree_count) * 100) : 0}%`, height:'100%', background:'#2C5F2D', borderRadius:'999px' }} />
          </div>
        </div>

        {/* Trees planted this session */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <label style={{ display:'block', fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'8px' }}>
            🌳 Trees planted this session *
          </label>
          <input type="number" min="1" max={batch?.tree_count || 9999}
            placeholder="e.g. 50"
            value={treesPlanted}
            onChange={e => setTreesPlanted(e.target.value)}
            style={{ width:'100%', padding:'0.875rem', border:'1.5px solid #e5e7eb', borderRadius:'12px', fontSize:'18px', fontWeight:600, outline:'none', textAlign:'center', boxSizing:'border-box' as const }} />
        </div>

        {/* GPS */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'8px' }}>📍 Site GPS</div>
          {gps ? (
            <div style={{ background:'#dcfce7', borderRadius:'10px', padding:'10px 12px', fontSize:'13px', color:'#166534' }}>
              ✅ GPS captured: {gps.lat.toFixed(6)}° N, {gps.lng.toFixed(6)}° E
              <button onClick={captureGPS} style={{ marginLeft:'8px', fontSize:'12px', color:'#166534', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Update</button>
            </div>
          ) : (
            <button onClick={captureGPS} disabled={gpsLoading}
              style={{ width:'100%', padding:'0.75rem', background:'#0369a1', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
              {gpsLoading ? '⏳ Getting GPS...' : '📍 Capture GPS Location'}
            </button>
          )}
        </div>

        {/* Before photos */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>📷 Before photos</div>
            <span style={{ fontSize:'12px', color:'#9ca3af' }}>{beforePhotos.length} added</span>
          </div>
          {beforePreviews.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'8px' }}>
              {beforePreviews.map((url, i) => (
                <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:'8px', overflow:'hidden' }}>
                  <img src={url} alt={`Before ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={() => { setBeforePhotos(p => p.filter((_,j) => j!==i)); setBeforePreviews(p => p.filter((_,j) => j!==i)) }}
                    style={{ position:'absolute', top:'3px', right:'3px', width:'20px', height:'20px', background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', color:'white', fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => beforeRef.current?.click()}
            style={{ width:'100%', padding:'0.75rem', background:'#f9fafb', border:'2px dashed #d1d5db', borderRadius:'10px', fontSize:'14px', color:'#6B7280', cursor:'pointer' }}>
            + Add before photos
          </button>
          <input ref={beforeRef} type="file" accept="image/*" multiple capture="environment"
            onChange={handleBeforePhotos} style={{ display:'none' }} />
        </div>

        {/* After photos */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1.5px solid #86efac' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>🌱 After photos *</div>
            <span style={{ fontSize:'12px', color:'#9ca3af' }}>{afterPhotos.length} added</span>
          </div>
          {afterPreviews.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'8px' }}>
              {afterPreviews.map((url, i) => (
                <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:'8px', overflow:'hidden' }}>
                  <img src={url} alt={`After ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={() => { setAfterPhotos(p => p.filter((_,j) => j!==i)); setAfterPreviews(p => p.filter((_,j) => j!==i)) }}
                    style={{ position:'absolute', top:'3px', right:'3px', width:'20px', height:'20px', background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', color:'white', fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => afterRef.current?.click()}
            style={{ width:'100%', padding:'0.75rem', background:'#f0fdf4', border:'2px dashed #86efac', borderRadius:'10px', fontSize:'14px', color:'#166534', cursor:'pointer' }}>
            + Add after photos (required)
          </button>
          <input ref={afterRef} type="file" accept="image/*" multiple capture="environment"
            onChange={handleAfterPhotos} style={{ display:'none' }} />
        </div>

        {/* Site overview photos */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>🏞️ Site overview photos</div>
            <span style={{ fontSize:'12px', color:'#9ca3af' }}>{sitePhotos.length} added</span>
          </div>
          {sitePreviews.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'8px' }}>
              {sitePreviews.map((url, i) => (
                <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:'8px', overflow:'hidden' }}>
                  <img src={url} alt={`Site ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={() => { setSitePhotos(p => p.filter((_,j) => j!==i)); setSitePreviews(p => p.filter((_,j) => j!==i)) }}
                    style={{ position:'absolute', top:'3px', right:'3px', width:'20px', height:'20px', background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', color:'white', fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => siteRef.current?.click()}
            style={{ width:'100%', padding:'0.75rem', background:'#f9fafb', border:'2px dashed #d1d5db', borderRadius:'10px', fontSize:'14px', color:'#6B7280', cursor:'pointer' }}>
            + Add site overview photos
          </button>
          <input ref={siteRef} type="file" accept="image/*" multiple capture="environment"
            onChange={handleSitePhotos} style={{ display:'none' }} />
        </div>

        {/* Notes */}
        <div style={{ background:'white', borderRadius:'12px', padding:'1rem', border:'1px solid #e5e7eb' }}>
          <label style={{ display:'block', fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'8px' }}>📝 Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Any observations about soil, weather, or planting conditions..."
            rows={3}
            style={{ width:'100%', padding:'0.875rem', border:'1.5px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none', resize:'none', fontFamily:'inherit', boxSizing:'border-box' as const }} />
        </div>

        {error && (
          <div style={{ background:'#fef2f2', borderRadius:'12px', padding:'0.875rem', fontSize:'14px', color:'#dc2626' }}>{error}</div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          style={{ width:'100%', padding:'1.125rem', background:'#1A3C34', color:'white', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:700, cursor:'pointer', minHeight:'60px', marginBottom:'1rem' }}>
          📸 Submit Batch Update
        </button>
      </div>
    </div>
  )
}
