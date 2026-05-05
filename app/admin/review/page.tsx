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
  } | null
  users: { name: string; phone: string | null } | null
}

interface PhotoPopup {
  url: string
  label: string
  treeId: string
  health: number | null
  lat: number | null
  lng: number | null
}

export default function AdminReview() {
  const [items,      setItems]      = useState<ReviewItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [processing, setProcessing] = useState(false)
  const [photoPopup, setPhotoPopup] = useState<PhotoPopup | null>(null)

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    setLoading(true)
    const { data } = await supabase
      .from('tree_updates')
      .select(`
        id, photo_url, before_photo_url, after_photo_url,
        latitude, longitude, ai_health_score,
        ai_species_match, ai_gps_match,
        ai_duplicate_check, ai_timestamp_valid,
        notes, update_date,
        trees(tree_id, species, latitude, longitude, sites(name)),
        users(name, phone)
      `)
      .eq('is_verified', false)
      .in('verified_by', ['PENDING', 'AI'])
      .order('created_at', { ascending: true })
    setItems((data as unknown as ReviewItem[]) || [])
    setLoading(false)
  }

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
      }
    }
    setPhotoPopup(null)
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

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Review Queue</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          {items.length} photo{items.length !== 1 ? 's' : ''} waiting — Claude Vision flagged these for manual approval
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Queue is clear!</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>All recent photos passed AI verification</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => {
            const siteLat = item.trees?.latitude
            const siteLng = item.trees?.longitude
            const captLat = item.latitude
            const captLng = item.longitude
            const hasGPSCompare = siteLat && siteLng && captLat && captLng
            const dist = hasGPSCompare ? gpsDistance(siteLat!, siteLng!, captLat!, captLng!) : null
            const afterUrl = item.after_photo_url || item.photo_url

            return (
              <div key={item.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>

                {/* ── HEADER ── */}
                <div style={{ padding: '8px 14px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#1A3C34' }}>{item.trees?.tree_id || '—'}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '10px' }}>
                      👷 {item.users?.name || '—'} · 📍 {item.trees?.sites?.name || '—'} · {new Date(item.update_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleDecision(item.id, true)} disabled={processing}
                      style={{ padding: '5px 14px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleDecision(item.id, false)} disabled={processing}
                      style={{ padding: '5px 14px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>

                {/* ── BODY: photos left, info right ── */}
                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'start' }}>

                  {/* Photos — compact thumbnails */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>

                    {/* Before */}
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Before</div>
                      <div
                        onClick={() => item.before_photo_url && setPhotoPopup({
                          url: item.before_photo_url,
                          label: 'Before planting · ' + (item.trees?.species || ''),
                          treeId: item.trees?.tree_id || '',
                          health: null, lat: captLat, lng: captLng
                        })}
                        style={{
                          width: 140, height: 105, borderRadius: 8, overflow: 'hidden',
                          background: item.before_photo_url
                            ? `url(${item.before_photo_url}) center/cover`
                            : 'linear-gradient(135deg,#374151,#6b7280)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem', cursor: item.before_photo_url ? 'pointer' : 'default',
                          position: 'relative', border: '1px solid #e5e7eb',
                        }}
                      >
                        {!item.before_photo_url && <span>🏗️</span>}
                        {item.before_photo_url && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s', display: 'flex', alignItems: 'flex-end' }}>
                            <div style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', padding: '2px 5px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Before</span><span>🔍</span>
                            </div>
                          </div>
                        )}
                        {!item.before_photo_url && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', padding: '2px 5px', textAlign: 'center' }}>No photo</div>
                        )}
                      </div>
                    </div>

                    {/* After */}
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>After</div>
                      <div
                        onClick={() => afterUrl && setPhotoPopup({
                          url: afterUrl,
                          label: 'After planting · ' + (item.trees?.species || ''),
                          treeId: item.trees?.tree_id || '',
                          health: item.ai_health_score, lat: captLat, lng: captLng
                        })}
                        style={{
                          width: 140, height: 105, borderRadius: 8, overflow: 'hidden',
                          background: afterUrl
                            ? `url(${afterUrl}) center/cover`
                            : 'linear-gradient(135deg,#2d6a4f,#52b788)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem', cursor: afterUrl ? 'pointer' : 'default',
                          position: 'relative', border: '1px solid #e5e7eb',
                        }}
                      >
                        {!afterUrl && <span>🌳</span>}
                        {afterUrl && (
                          <>
                            {item.ai_health_score !== null && (
                              <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '10px', padding: '1px 6px', borderRadius: 5, fontWeight: 600 }}>
                                {item.ai_health_score}%
                              </div>
                            )}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '9px', padding: '2px 5px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>After</span><span>🔍</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side — AI badges + GPS + notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    {/* AI badges 2x2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      <CheckBadge pass={item.ai_species_match}   label="Species" />
                      <CheckBadge pass={item.ai_gps_match}       label="GPS" />
                      <CheckBadge pass={item.ai_duplicate_check} label="No dupe" />
                      <CheckBadge pass={item.ai_timestamp_valid} label="Timestamp" />
                    </div>

                    {/* GPS distance */}
                    {hasGPSCompare && dist && (
                      <div style={{ fontSize: '11px', color: item.ai_gps_match === false ? '#dc2626' : '#166534', fontWeight: 500, background: item.ai_gps_match === false ? '#fee2e2' : '#f0fdf4', padding: '4px 8px', borderRadius: 6 }}>
                        {item.ai_gps_match === false ? '⚠️' : '✅'} {dist} from assigned site
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#6B7280', marginLeft: 6 }}>
                          ({captLat?.toFixed(3)}, {captLng?.toFixed(3)})
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div style={{ background: '#f9fafb', borderRadius: 6, padding: '5px 8px', fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                        📝 {item.notes}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ── PHOTO FULLSCREEN POPUP (unchanged) ── */}
      {photoPopup && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '1rem' }}
          onClick={() => setPhotoPopup(null)}
        >
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tap anywhere to close</div>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label}
              style={{ width: 'min(90vw,560px)', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px' }} />
            <button onClick={() => setPhotoPopup(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#dc2626', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', color: 'white', fontSize: '12px', textAlign: 'center', width: 'min(90vw,480px)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#97BC62', marginBottom: '4px' }}>{photoPopup.treeId}</div>
            <div style={{ opacity: 0.8, marginBottom: '8px' }}>{photoPopup.label}</div>
            {photoPopup.health !== null && (
              <div style={{ marginBottom: '8px', fontWeight: 600, color: '#97BC62' }}>Health score: {photoPopup.health}/100</div>
            )}
            {photoPopup.lat && photoPopup.lng && (
              <div style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.6, marginBottom: '10px' }}>📍 {photoPopup.lat.toFixed(5)}, {photoPopup.lng.toFixed(5)}</div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => { const item = items.find(i => i.trees?.tree_id === photoPopup.treeId); if (item) handleDecision(item.id, true) }}
                style={{ padding: '8px 20px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                ✓ Approve
              </button>
              <button
                onClick={() => { const item = items.find(i => i.trees?.tree_id === photoPopup.treeId); if (item) handleDecision(item.id, false) }}
                style={{ padding: '8px 20px', background: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .review-body { grid-template-columns: 1fr !important; }
          .review-photos { flex-direction: row; }
        }
      `}</style>
    </div>
  )
}
