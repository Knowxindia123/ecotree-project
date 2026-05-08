'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ReviewItem {
  id: number
  photo_url: string | null
  before_photo_url: string | null
  after_photo_url: string | null
  latitude: number | null
  longitude: number | null
  ai_health_score: number | null
  ai_species_match: boolean | null
  ai_gps_match: boolean | null
  ai_duplicate_check: boolean | null
  ai_timestamp_valid: boolean | null
  notes: string | null
  update_date: string
  trees: {
    tree_id: string
    species: string
    latitude: number | null
    longitude: number | null
    sites: { name: string } | null
    donors: { id: number; name: string; email: string } | null
  } | null
  users: { name: string; phone: string | null } | null
}

interface CsrBatchReview {
  id: number
  company_name: string
  tree_count: number | null
  trees_planted: number
  project_type: string | null
  before_photos: string[] | null
  after_photos: string[] | null
  site_photos: string[] | null
  notes: string | null
  progress_status: string | null
  status: string | null
  contact_email: string | null
  contact_name: string | null
  updated_at: string
  sites: { name: string } | null
  worker: { name: string } | null
}

interface PhotoPopup {
  url: string
  label: string
  treeId: string
  itemId: number
  health: number | null
  lat: number | null
  lng: number | null
}

async function sendEmail(type: string, donor: Record<string, any>) {
  try {
    await fetch('/api/send-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, donor }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

export default function AdminReview() {
  const [items,       setItems]       = useState<ReviewItem[]>([])
  const [csrBatches,  setCsrBatches]  = useState<CsrBatchReview[]>([])
  const [loading,     setLoading]     = useState(true)
  const [processing,  setProcessing]  = useState(false)
  const [photoPopup,  setPhotoPopup]  = useState<PhotoPopup | null>(null)
  const [batchPhoto,  setBatchPhoto]  = useState<{ url: string; label: string } | null>(null)

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    setLoading(true)

    // Individual tree updates
    const { data: treeData } = await supabase
      .from('tree_updates')
      .select(`
        id, photo_url, before_photo_url, after_photo_url,
        latitude, longitude, ai_health_score,
        ai_species_match, ai_gps_match,
        ai_duplicate_check, ai_timestamp_valid,
        notes, update_date,
        trees(tree_id, species, latitude, longitude, sites(name), donors(id, name, email)),
        users(name, phone)
      `)
      .eq('is_verified', false)
      .in('verified_by', ['PENDING', 'AI'])
      .order('created_at', { ascending: true })
    setItems((treeData as unknown as ReviewItem[]) || [])

    // CSR batch reviews
    const { data: csrData } = await supabase
      .from('csr_partners')
      .select('id, company_name, tree_count, trees_planted, project_type, before_photos, after_photos, site_photos, notes, progress_status, status, contact_email, contact_name, updated_at, site_id, worker_id')
      .eq('progress_status', 'IN_PROGRESS')
      .order('updated_at', { ascending: true })

    if (csrData && csrData.length > 0) {
      // Fetch sites and workers
      const siteIds   = [...new Set(csrData.map((c: any) => c.site_id).filter(Boolean))]
      const workerIds = [...new Set(csrData.map((c: any) => c.worker_id).filter(Boolean))]
      const [sitesRes, workersRes] = await Promise.all([
        siteIds.length   > 0 ? supabase.from('sites').select('id, name').in('id', siteIds) : { data: [] },
        workerIds.length > 0 ? supabase.from('users').select('id, name').in('id', workerIds) : { data: [] },
      ])
      const sitesMap:   Record<number, string> = {}
      const workersMap: Record<number, string> = {}
      sitesRes.data?.forEach((s: any)   => { sitesMap[s.id]   = s.name })
      workersRes.data?.forEach((w: any) => { workersMap[w.id] = w.name })
      setCsrBatches(csrData.map((c: any) => ({
        ...c,
        sites:  c.site_id   ? { name: sitesMap[c.site_id]     || '—' } : null,
        worker: c.worker_id ? { name: workersMap[c.worker_id] || '—' } : null,
      })))
    } else {
      setCsrBatches([])
    }

    setLoading(false)
  }

  // ── Approve/reject individual tree ──
  async function handleDecision(id: number, approve: boolean) {
    setProcessing(true)
    await supabase.from('tree_updates').update({
      is_verified: approve,
      verified_by: approve ? 'HUMAN' : 'REJECTED'
    }).eq('id', id)

    if (approve) {
      const item = items.find(i => i.id === id)
      if (item?.trees) {
        await supabase.from('trees').update({
          status:              'VERIFIED',
          latest_health_score: item.ai_health_score,
          latest_update_date:  item.update_date
        }).eq('tree_id', item.trees.tree_id)

        const donor = Array.isArray(item.trees.donors) ? item.trees.donors[0] : item.trees.donors
        if (donor?.email) {
          await sendEmail('verified', {
            name:             donor.name,
            email:            donor.email,
            tree_id:          item.trees.tree_id,
            species:          item.trees.species,
            site:             item.trees.sites?.name || 'Bangalore',
            health_score:     item.ai_health_score,
            before_photo_url: item.before_photo_url,
            after_photo_url:  item.after_photo_url || item.photo_url,
            latitude:         item.latitude,
            longitude:        item.longitude,
          })
        }
      }
    }

    setPhotoPopup(null)
    loadQueue()
    setProcessing(false)
  }

  // ── Approve CSR batch ──
  async function handleCsrApprove(batch: CsrBatchReview) {
    setProcessing(true)
    const { error } = await supabase.from('csr_partners').update({
      progress_status: 'VERIFIED',
      trees_verified:  batch.trees_planted,
      status:          batch.trees_planted >= (batch.tree_count || 0) ? 'COMPLETED' : 'ASSIGNED',
    }).eq('id', batch.id)

    if (!error && batch.contact_email) {
      // Send Email 2 — CSR verified notification
      await sendEmail('csr_enquiry', {
        name:      batch.contact_name || batch.company_name,
        email:     batch.contact_email,
        company:   batch.company_name,
        budget:    '—',
        trees:     batch.trees_planted,
        interests: batch.project_type || 'Tree Plantation',
      })
    }

    loadQueue()
    setProcessing(false)
  }

  // ── Reject CSR batch ──
  async function handleCsrReject(id: number) {
    if (!confirm('Reject this batch update? Worker will need to resubmit.')) return
    setProcessing(true)
    await supabase.from('csr_partners').update({ progress_status: 'REJECTED' }).eq('id', id)
    loadQueue()
    setProcessing(false)
  }

  function gpsDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    const d = 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return d < 1000 ? `${Math.round(d)}m` : `${(d/1000).toFixed(1)}km`
  }

  function CheckBadge({ pass, label }: { pass: boolean | null; label: string }) {
    const bg   = pass === true ? '#dcfce7' : pass === false ? '#fee2e2' : '#f3f4f6'
    const text = pass === true ? '#166534' : pass === false ? '#991b1b' : '#6b7280'
    const icon = pass === true ? '✅' : pass === false ? '❌' : '⏳'
    return (
      <div style={{ background: bg, borderRadius: 6, padding: '4px 6px', textAlign: 'center', fontSize: '11px', color: text, fontWeight: 500 }}>
        {icon} {label}
      </div>
    )
  }

  const totalQueue = items.length + csrBatches.length

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Review Queue</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          {totalQueue} item{totalQueue !== 1 ? 's' : ''} waiting for approval
          {csrBatches.length > 0 && <span style={{ marginLeft: '8px', background: '#dbeafe', color: '#1e40af', fontSize: '12px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>🏢 {csrBatches.length} CSR batch{csrBatches.length !== 1 ? 'es' : ''}</span>}
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : totalQueue === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Queue is clear!</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>All recent photos passed verification</div>
        </div>
      ) : (
        <>
          {/* ── CSR BATCH REVIEW SECTION ── */}
          {csrBatches.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏢 CSR Batch Updates
                <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{csrBatches.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {csrBatches.map(batch => {
                  const afterPhotos  = batch.after_photos  || []
                  const beforePhotos = batch.before_photos || []
                  const sitePhotos   = batch.site_photos   || []
                  const pct = batch.tree_count ? Math.round((batch.trees_planted / batch.tree_count) * 100) : 0
                  return (
                    <div key={batch.id} style={{ background: 'white', border: '1.5px solid #bfdbfe', borderRadius: '12px', overflow: 'hidden' }}>

                      {/* Header */}
                      <div style={{ padding: '10px 14px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af' }}>🏢 {batch.company_name}</div>
                          <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                            👷 {batch.worker?.name || '—'} · 📍 {batch.sites?.name || '—'} · {batch.project_type || 'Tree Plantation'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleCsrApprove(batch)} disabled={processing}
                            style={{ padding: '6px 16px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => handleCsrReject(batch.id)} disabled={processing}
                            style={{ padding: '6px 12px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '12px 14px' }}>
                        {/* Progress */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ color: '#6B7280' }}>Trees planted this update</span>
                            <span style={{ fontWeight: 700, color: '#1A3C34' }}>{batch.trees_planted} / {batch.tree_count}</span>
                          </div>
                          <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#2C5F2D', borderRadius: '999px' }} />
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{pct}% of batch complete</div>
                        </div>

                        {/* Photos grid */}
                        {(beforePhotos.length > 0 || afterPhotos.length > 0 || sitePhotos.length > 0) && (
                          <div style={{ marginBottom: '12px' }}>
                            {/* Before photos */}
                            {beforePhotos.length > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Before ({beforePhotos.length})</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {beforePhotos.map((url, i) => (
                                    <div key={i} onClick={() => setBatchPhoto({ url, label: `Before · ${batch.company_name}` })}
                                      style={{ width: '72px', height: '72px', borderRadius: '8px', background: `url(${url}) center/cover`, cursor: 'pointer', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* After photos */}
                            {afterPhotos.length > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>After ({afterPhotos.length})</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {afterPhotos.map((url, i) => (
                                    <div key={i} onClick={() => setBatchPhoto({ url, label: `After · ${batch.company_name}` })}
                                      style={{ width: '72px', height: '72px', borderRadius: '8px', background: `url(${url}) center/cover`, cursor: 'pointer', border: '1px solid #86efac', flexShrink: 0 }} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Site photos */}
                            {sitePhotos.length > 0 && (
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Site overview ({sitePhotos.length})</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {sitePhotos.map((url, i) => (
                                    <div key={i} onClick={() => setBatchPhoto({ url, label: `Site · ${batch.company_name}` })}
                                      style={{ width: '72px', height: '72px', borderRadius: '8px', background: `url(${url}) center/cover`, cursor: 'pointer', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {batch.notes && (
                          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#374151', marginBottom: '8px' }}>
                            📝 {batch.notes}
                          </div>
                        )}

                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          Updated: {new Date(batch.updated_at).toLocaleString('en-IN')}
                          {batch.contact_email && <span style={{ marginLeft: '8px', color: '#166534' }}>📧 Approval email → {batch.contact_email}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── INDIVIDUAL TREE REVIEW ── */}
          {items.length > 0 && (
            <>
              {csrBatches.length > 0 && (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌱 Individual Trees
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{items.length}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {items.map(item => {
                  const siteLat  = item.trees?.latitude
                  const siteLng  = item.trees?.longitude
                  const captLat  = item.latitude
                  const captLng  = item.longitude
                  const hasGPS   = siteLat && siteLng && captLat && captLng
                  const dist     = hasGPS ? gpsDistance(siteLat!, siteLng!, captLat!, captLng!) : null
                  const afterUrl = item.after_photo_url || item.photo_url
                  const donor    = Array.isArray(item.trees?.donors) ? item.trees?.donors[0] : item.trees?.donors

                  return (
                    <div key={item.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '8px 10px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#1A3C34' }}>{item.trees?.tree_id || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>
                            👷 {item.users?.name || '—'} · 📍 {item.trees?.sites?.name || '—'}
                            {donor && <span style={{ color: '#2C5F2D', marginLeft: '6px' }}>· 🌿 {donor.name}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleDecision(item.id, true)} disabled={processing}
                            style={{ padding: '4px 12px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => handleDecision(item.id, false)} disabled={processing}
                            style={{ padding: '4px 12px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ borderRight: '1px solid #f3f4f6' }}>
                          <div style={{ padding: '5px 8px 3px', fontSize: '10px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before</div>
                          <div onClick={() => item.before_photo_url && setPhotoPopup({ url: item.before_photo_url, label: 'Before planting · ' + (item.trees?.species || ''), treeId: item.trees?.tree_id || '', itemId: item.id, health: null, lat: captLat, lng: captLng })}
                            style={{ width: '100%', aspectRatio: '4/3', background: item.before_photo_url ? `url(${item.before_photo_url}) center/cover` : 'linear-gradient(135deg,#374151,#6b7280)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', cursor: item.before_photo_url ? 'pointer' : 'default', position: 'relative' }}>
                            {!item.before_photo_url && '🏗️'}
                            {item.before_photo_url && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', padding: '3px 7px', display: 'flex', justifyContent: 'space-between' }}><span>Before</span><span>🔍 expand</span></div>}
                          </div>
                        </div>
                        <div>
                          <div style={{ padding: '5px 8px 3px', fontSize: '10px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After</div>
                          <div onClick={() => afterUrl && setPhotoPopup({ url: afterUrl, label: 'After planting · ' + (item.trees?.species || ''), treeId: item.trees?.tree_id || '', itemId: item.id, health: item.ai_health_score, lat: captLat, lng: captLng })}
                            style={{ width: '100%', aspectRatio: '4/3', background: afterUrl ? `url(${afterUrl}) center/cover` : 'linear-gradient(135deg,#2d6a4f,#52b788)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', cursor: afterUrl ? 'pointer' : 'default', position: 'relative' }}>
                            {!afterUrl && '🌳'}
                            {afterUrl && <>
                              {item.ai_health_score !== null && <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '10px', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>{item.ai_health_score}%</div>}
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', padding: '3px 7px', display: 'flex', justifyContent: 'space-between' }}><span>After</span><span>🔍 expand</span></div>
                            </>}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '8px 10px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px' }}>
                          <CheckBadge pass={item.ai_species_match}   label="Species" />
                          <CheckBadge pass={item.ai_gps_match}       label="GPS" />
                          <CheckBadge pass={item.ai_duplicate_check} label="No dupe" />
                          <CheckBadge pass={item.ai_timestamp_valid} label="Timestamp" />
                        </div>
                        {hasGPS && dist && (
                          <div style={{ background: item.ai_gps_match === false ? '#fee2e2' : '#f0fdf4', border: `1px solid ${item.ai_gps_match === false ? '#fecaca' : '#86efac'}`, borderRadius: 6, padding: '4px 8px', fontSize: '11px', color: item.ai_gps_match === false ? '#dc2626' : '#166534', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{item.ai_gps_match === false ? '⚠️' : '✅'} {dist} from site</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#6B7280' }}>{captLat?.toFixed(3)}, {captLng?.toFixed(3)}</span>
                          </div>
                        )}
                        {donor ? (
                          <div style={{ fontSize: '10px', color: '#166534', background: '#f0fdf4', padding: '3px 8px', borderRadius: 6 }}>📧 Verified email will go to {donor.email}</div>
                        ) : (
                          <div style={{ fontSize: '10px', color: '#9ca3af', background: '#f9fafb', padding: '3px 8px', borderRadius: 6 }}>⚠️ No donor linked — no email will be sent</div>
                        )}
                        {item.notes && <div style={{ background: '#f9fafb', borderRadius: 6, padding: '5px 8px', fontSize: '11px', color: '#374151' }}>📝 {item.notes}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ── BATCH PHOTO POPUP ── */}
      {batchPhoto && (
        <div onClick={() => setBatchPhoto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '1rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tap anywhere to close</div>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={batchPhoto.url} alt={batchPhoto.label} style={{ width: 'min(90vw,620px)', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' }} />
            <button onClick={() => setBatchPhoto(null)} style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#dc2626', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '12px', textAlign: 'center' }}>
            {batchPhoto.label}
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL TREE PHOTO POPUP ── */}
      {photoPopup && (
        <div onClick={() => setPhotoPopup(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '1rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tap anywhere to close</div>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label} style={{ width: 'min(90vw,620px)', maxHeight: '65vh', objectFit: 'contain', borderRadius: '12px' }} />
            <button onClick={() => setPhotoPopup(null)} style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#dc2626', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', color: 'white', fontSize: '12px', textAlign: 'center', width: 'min(90vw,480px)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#97BC62', marginBottom: '4px' }}>{photoPopup.treeId}</div>
            <div style={{ opacity: 0.8, marginBottom: '8px' }}>{photoPopup.label}</div>
            {photoPopup.health !== null && <div style={{ marginBottom: '8px', fontWeight: 600, color: '#97BC62' }}>Health score: {photoPopup.health}/100</div>}
            {photoPopup.lat && photoPopup.lng && <div style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.6, marginBottom: '10px' }}>📍 {photoPopup.lat.toFixed(5)}, {photoPopup.lng.toFixed(5)}</div>}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => handleDecision(photoPopup.itemId, true)} disabled={processing}
                style={{ padding: '8px 24px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>✓ Approve</button>
              <button onClick={() => handleDecision(photoPopup.itemId, false)} disabled={processing}
                style={{ padding: '8px 24px', background: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>✕ Reject</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
