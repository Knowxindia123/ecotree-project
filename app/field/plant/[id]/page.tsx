'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'before' | 'gps' | 'after' | 'notes' | 'submitting' | 'done'

const HEALTH_OPTIONS = [
  { id: 'healthy',     label: '✅ Healthy',      color: '#dcfce7', text: '#166534' },
  { id: 'needs_water', label: '💧 Needs water',  color: '#dbeafe', text: '#1e40af' },
  { id: 'damaged',     label: '⚠️ Damaged',      color: '#fef3c7', text: '#92400e' },
]

export default function FieldPlant() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [step,       setStep]       = useState<Step>('before')
  const [task,       setTask]       = useState<any>(null)
  const [worker,     setWorker]     = useState<any>(null)
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto,  setAfterPhoto]  = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState('')
  const [afterPreview,  setAfterPreview]  = useState('')
  const [gps,        setGps]        = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError,   setGpsError]   = useState('')
  const [health,     setHealth]     = useState('healthy')
  const [notes,      setNotes]      = useState('')
  const [treeId,     setTreeId]     = useState('')
  const [error,      setError]      = useState('')
  const [progress,   setProgress]   = useState(0)

  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTask()
  }, [assignmentId])

  async function loadTask() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }

    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', session.user.email)
      .single()

    setWorker(userData)

    const { data: assignment } = await supabase
      .from('assignments')
      .select(`id, notes, status, trees(id, tree_id, species, tree_type, latitude, longitude), sites(name, latitude, longitude)`)
      .eq('id', assignmentId)
      .single()

    setTask(assignment)
    setTreeId(assignment?.trees?.tree_id || '')
  }

  function captureGPS() {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('GPS not available on this device')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStep('after')
      },
      err => {
        setGpsError('Could not get GPS. ' + err.message)
        // Allow continuing without GPS
        setStep('after')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'before') {
      setBeforePhoto(file)
      setBeforePreview(url)
      setStep('gps')
    } else {
      setAfterPhoto(file)
      setAfterPreview(url)
      setStep('notes')
    }
  }

  async function handleSubmit() {
    if (!beforePhoto || !afterPhoto) {
      setError('Both photos are required')
      return
    }
    setStep('submitting')
    setError('')

    try {
      const timestamp = Date.now()
      const bucket    = 'tree-photos'

      setProgress(20)

      // Upload before photo
      const beforePath = `${treeId}/before-${timestamp}.jpg`
      const { error: beforeErr } = await supabase.storage
        .from(bucket)
        .upload(beforePath, beforePhoto, { contentType: 'image/jpeg', upsert: true })
      if (beforeErr) throw beforeErr

      setProgress(45)

      // Upload after photo
      const afterPath = `${treeId}/after-${timestamp}.jpg`
      const { error: afterErr } = await supabase.storage
        .from(bucket)
        .upload(afterPath, afterPhoto, { contentType: 'image/jpeg', upsert: true })
      if (afterErr) throw afterErr

      setProgress(65)

      // Get public URLs
      const beforeUrl = supabase.storage.from(bucket).getPublicUrl(beforePath).data.publicUrl
      const afterUrl  = supabase.storage.from(bucket).getPublicUrl(afterPath).data.publicUrl

      // Insert tree_update
      const { error: updateErr } = await supabase.from('tree_updates').insert({
        tree_id:          task?.trees?.id,
        worker_id:        worker?.id,
        before_photo_url: beforeUrl,
        after_photo_url:  afterUrl,
        photo_url:        afterUrl,
        latitude:         gps?.lat || null,
        longitude:        gps?.lng || null,
        notes:            `${health}${notes ? ' · ' + notes : ''}`,
        is_verified:      false,
        verified_by:      'PENDING',
        update_date:      new Date().toISOString().split('T')[0],
      })
      if (updateErr) throw updateErr

      setProgress(80)

      // Update tree status to PLANTED
      await supabase.from('trees').update({
        status:        'PLANTED',
        latitude:      gps?.lat || task?.trees?.latitude,
        longitude:     gps?.lng || task?.trees?.longitude,
        photo_url:     afterUrl,
        worker_id:     worker?.id,
        planting_date: new Date().toISOString().split('T')[0],
      }).eq('id', task?.trees?.id)

      // Save QR code URL to trees table
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://ecotrees.org/tree/${treeId}`)}`
      await supabase.from('trees')
        .update({ qr_code_url: qrCodeUrl })
        .eq('tree_id', treeId)

      // Update assignment status
      await supabase.from('assignments')
        .update({ status: 'COMPLETED' })
        .eq('id', assignmentId)

      setProgress(100)
      setStep('done')

    } catch (err: any) {
      setError(err.message || 'Upload failed. Check signal and try again.')
      setStep('notes')
    }
  }

  // ── STEP: BEFORE PHOTO ──
  if (step === 'before') return (
    <Screen title="Step 1 of 4" subtitle="Take BEFORE photo" treeId={treeId} site={task?.sites?.name}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', fontSize: '14px', color: '#92400e' }}>
          📸 Take a photo of the <strong>site before planting</strong> — show the empty ground where you will plant the tree.
        </div>

        {beforePreview ? (
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', flex: 1, maxHeight: '40vh' }}>
            <img src={beforePreview} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => { setBeforePhoto(null); setBeforePreview('') }}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
            >
              Retake
            </button>
          </div>
        ) : (
          <div
            onClick={() => beforeRef.current?.click()}
            style={{
              flex: 1,
              minHeight: '200px',
              background: '#f9fafb',
              border: '2px dashed #d1d5db',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '3rem' }}>📷</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Tap to take photo</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Before planting</span>
          </div>
        )}

        <input ref={beforeRef} type="file" accept="image/*" capture="environment" onChange={e => handlePhotoChange(e, 'before')} style={{ display: 'none' }} />

        {beforePreview && (
          <button
            onClick={() => setStep('gps')}
            style={{ width: '100%', padding: '1rem', background: '#1A3C34', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', minHeight: '56px' }}
          >
            Next — Capture GPS →
          </button>
        )}
      </div>
    </Screen>
  )

  // ── STEP: GPS ──
  if (step === 'gps') return (
    <Screen title="Step 2 of 4" subtitle="Capture GPS location" treeId={treeId} site={task?.sites?.name}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '1rem', fontSize: '14px', color: '#1e40af' }}>
          📍 Stand next to where you will plant the tree and tap the button below to capture GPS coordinates.
        </div>

        {gps ? (
          <div style={{ background: '#dcfce7', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>GPS Captured!</div>
            <div style={{ fontSize: '13px', color: '#166534', fontFamily: 'monospace' }}>
              {gps.lat.toFixed(6)}° N, {gps.lng.toFixed(6)}° E
            </div>
          </div>
        ) : (
          <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📍</div>
            <div style={{ fontSize: '15px', color: '#374151' }}>GPS not captured yet</div>
          </div>
        )}

        {gpsError && (
          <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '1rem', fontSize: '13px', color: '#dc2626' }}>
            {gpsError}
          </div>
        )}

        <button
          onClick={captureGPS}
          style={{ width: '100%', padding: '1rem', background: '#0369a1', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', minHeight: '56px' }}
        >
          📍 Capture GPS Now
        </button>

        <button
          onClick={() => setStep('after')}
          style={{ width: '100%', padding: '0.875rem', background: 'transparent', color: '#6B7280', border: '1px solid #e5e7eb', borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }}
        >
          Skip GPS (no signal)
        </button>
      </div>
    </Screen>
  )

  // ── STEP: AFTER PHOTO ──
  if (step === 'after') return (
    <Screen title="Step 3 of 4" subtitle="Take AFTER photo" treeId={treeId} site={task?.sites?.name}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '1rem', fontSize: '14px', color: '#166534' }}>
          🌱 Now plant the tree. Once planted, take a photo of the <strong>tree in the ground</strong>.
        </div>

        {afterPreview ? (
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', flex: 1, maxHeight: '40vh' }}>
            <img src={afterPreview} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => { setAfterPhoto(null); setAfterPreview('') }}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
            >
              Retake
            </button>
          </div>
        ) : (
          <div
            onClick={() => afterRef.current?.click()}
            style={{
              flex: 1,
              minHeight: '200px',
              background: '#f0fdf4',
              border: '2px dashed #86efac',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '3rem' }}>🌱</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Tap to take photo</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>After planting</span>
          </div>
        )}

        <input ref={afterRef} type="file" accept="image/*" capture="environment" onChange={e => handlePhotoChange(e, 'after')} style={{ display: 'none' }} />

        {afterPreview && (
          <button
            onClick={() => setStep('notes')}
            style={{ width: '100%', padding: '1rem', background: '#1A3C34', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', minHeight: '56px' }}
          >
            Next — Add Notes →
          </button>
        )}
      </div>
    </Screen>
  )

  // ── STEP: NOTES + SUBMIT ──
  if (step === 'notes') return (
    <Screen title="Step 4 of 4" subtitle="Tree health + submit" treeId={treeId} site={task?.sites?.name}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', overflowY: 'auto' }}>

        {/* Photo previews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
            <img src={beforePreview} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
            <img src={afterPreview} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* GPS status */}
        <div style={{
          background: gps ? '#dcfce7' : '#f3f4f6',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: gps ? '#166534' : '#6B7280'
        }}>
          <span>{gps ? '✅' : '⚠️'}</span>
          {gps ? `GPS: ${gps.lat.toFixed(5)}° N, ${gps.lng.toFixed(5)}° E` : 'GPS not captured'}
        </div>

        {/* Health chips */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
            Tree health condition
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {HEALTH_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setHealth(opt.id)}
                style={{
                  padding: '0.875rem 1rem',
                  background: health === opt.id ? opt.color : '#f9fafb',
                  border: `2px solid ${health === opt.id ? opt.text : '#e5e7eb'}`,
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: health === opt.id ? 600 : 400,
                  color: health === opt.id ? opt.text : '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
            Notes (optional)
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes about this tree..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1.5px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '0.875rem', fontSize: '14px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '1.125rem',
            background: '#1A3C34',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: '60px',
            letterSpacing: '0.02em',
          }}
        >
          🌱 Submit Tree Report
        </button>
      </div>
    </Screen>
  )

  // ── STEP: SUBMITTING ──
  if (step === 'submitting') return (
    <div style={{ minHeight: '100dvh', background: '#1A3C34', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>🌱</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Uploading...</div>
      <div style={{ width: '100%', maxWidth: '280px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#97BC62', borderRadius: '999px', transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Please keep app open · {progress}%</div>
    </div>
  )

  // ── STEP: DONE ──
  if (step === 'done') return (
    <div style={{ minHeight: '100dvh', background: '#1A3C34', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem' }}>🎉</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#97BC62' }}>Tree Planted!</div>
      <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px' }}>
        {treeId}
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '280px', lineHeight: 1.6 }}>
        Photos uploaded. Admin will verify and donor will be notified.
      </div>

      {/* QR Code — real */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', width: '100%', maxWidth: '280px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A3C34', marginBottom: '8px' }}>🔗 Tree QR Code</div>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://ecotrees.org/tree/${treeId}`)}`}
          alt="Tree QR Code"
          style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '0 auto 8px', display: 'block' }}
        />
        <div style={{ fontSize: '12px', color: '#6B7280' }}>Print and tie to tree trunk</div>
        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', marginTop: '4px' }}>ecotrees.org/tree/{treeId}</div>
        <a
          href={`https://ecotrees.org/tree/${treeId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: '#1A3C34', fontWeight: 600, textDecoration: 'none' }}
        >
          View tree profile →
        </a>
      </div>

      <button
        onClick={() => router.push('/field/tasks')}
        style={{ width: '100%', maxWidth: '280px', padding: '1rem', background: '#97BC62', color: '#1A3C34', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', minHeight: '56px' }}
      >
        Back to Tasks
      </button>
    </div>
  )

  return null
}

// ── Shared screen wrapper ──
function Screen({ title, subtitle, treeId, site, children }: {
  title: string; subtitle: string; treeId: string; site?: string; children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100dvh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1A3C34', padding: '1rem 1.25rem' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '8px' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginTop: '2px' }}>{subtitle}</div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
          {treeId && <div style={{ fontSize: '12px', color: '#97BC62', fontFamily: 'monospace' }}>{treeId}</div>}
          {site   && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>📍 {site}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}
