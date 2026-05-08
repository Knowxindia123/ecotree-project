'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface TreeProfile {
  id: number
  tree_id: string
  species: string
  tree_type: string
  planting_date: string
  status: string
  photo_url: string | null
  qr_code_url: string | null
  latest_health_score: number | null
  co2_offset_kg: number | null
  latitude: number | null
  longitude: number | null
  sites: { name: string; city: string } | null
  donors: { name: string } | null
}

interface TreeUpdate {
  id: number
  update_date: string
  photo_url: string | null
  before_photo_url: string | null
  after_photo_url: string | null
  ai_health_score: number | null
  is_verified: boolean
  notes: string | null
}

export default function TreeProfile() {
  const params   = useParams()
  const treeId   = params.treeId as string
  const [tree,     setTree]     = useState<TreeProfile | null>(null)
  const [updates,  setUpdates]  = useState<TreeUpdate[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [photoPopup, setPhotoPopup] = useState<{ url: string; label: string } | null>(null)

  useEffect(() => { loadTree() }, [treeId])

  async function loadTree() {
    setLoading(true)
    const { data: treeData } = await supabase
      .from('trees')
      .select('*, sites(name, city), donors(name)')
      .eq('tree_id', treeId)
      .single()

    if (!treeData) { setNotFound(true); setLoading(false); return }
    setTree(treeData as unknown as TreeProfile)

    const { data: updateData } = await supabase
      .from('tree_updates')
      .select('id, update_date, photo_url, before_photo_url, after_photo_url, ai_health_score, is_verified, notes')
      .eq('tree_id', treeData.id)
      .eq('is_verified', true)
      .order('update_date', { ascending: false })

    setUpdates((updateData as unknown as TreeUpdate[]) || [])
    setLoading(false)
  }

  function statusColor(status: string) {
    switch (status) {
      case 'VERIFIED': return { bg: '#dcfce7', text: '#166534', label: '✅ Verified' }
      case 'PLANTED':  return { bg: '#dbeafe', text: '#1e40af', label: '🌱 Planted' }
      case 'HEALTHY':  return { bg: '#dcfce7', text: '#166534', label: '💚 Healthy' }
      case 'AT_RISK':  return { bg: '#fef3c7', text: '#92400e', label: '⚠️ At Risk' }
      default:         return { bg: '#f3f4f6', text: '#6b7280', label: status }
    }
  }

  function healthColor(score: number) {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#ca8a04'
    return '#dc2626'
  }

  // Get before/after from most recent update
  const latestUpdate = updates[0] || null
  const beforePhoto  = latestUpdate?.before_photo_url || null
  const afterPhoto   = latestUpdate?.after_photo_url  || latestUpdate?.photo_url || null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌳</div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading tree profile...</div>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>Tree not found</div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>Tree ID: {treeId}</div>
      </div>
    </div>
  )

  const badge  = statusColor(tree?.status || '')
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://ecotrees.org/tree/${treeId}`)}`

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* ── PHOTO FULLSCREEN POPUP ── */}
      {photoPopup && (
        <div
          onClick={() => setPhotoPopup(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '1rem' }}
        >
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tap anywhere to close</div>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img
              src={photoPopup.url}
              alt={photoPopup.label}
              style={{ width: 'min(90vw, 480px)', aspectRatio: '4/3', borderRadius: '16px', objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => setPhotoPopup(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#dc2626', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#97BC62' }}>{photoPopup.label}</div>
            <div style={{ fontFamily: 'monospace', opacity: 0.7, marginTop: '4px' }}>{treeId}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#1A3C34', padding: '1.25rem 1.5rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.25rem', fontWeight: 700, color: '#97BC62', marginBottom: '4px' }}>
            Eco<span style={{ color: 'white' }}>Tree</span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Tree Profile
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem' }}>

        {/* ── MAIN CARD ── */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

          {/* Hero */}
          <div style={{
            height: '220px',
            background: tree?.photo_url
              ? `url(${tree.photo_url}) center/cover`
              : 'linear-gradient(135deg,#2d6a4f 0%,#40916c 50%,#52b788 100%)',
            display: 'flex', alignItems: 'flex-end', position: 'relative'
          }}>
            {!tree?.photo_url && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🌳</div>
            )}
            <div style={{ width: '100%', padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{tree?.species}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{tree?.tree_type}</div>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#1A3C34' }}>{tree?.tree_id}</div>
              <span style={{ background: badge.bg, color: badge.text, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 500 }}>
                {badge.label}
              </span>
            </div>

            {/* Health score */}
            {tree?.latest_health_score !== null && tree?.latest_health_score !== undefined && (
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Health Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: healthColor(tree.latest_health_score), lineHeight: 1 }}>
                    {tree.latest_health_score}<span style={{ fontSize: '1rem', color: '#9ca3af' }}>/100</span>
                  </div>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  {tree.latest_health_score >= 80 ? '💚' : tree.latest_health_score >= 60 ? '💛' : '❤️'}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { icon: '📍', label: 'Location',   value: tree?.sites?.name || '—' },
                { icon: '🏙',  label: 'City',       value: tree?.sites?.city || 'Bangalore' },
                { icon: '📅', label: 'Planted',    value: tree?.planting_date ? new Date(tree.planting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { icon: '🌍', label: 'CO₂ offset', value: tree?.co2_offset_kg ? `${tree.co2_offset_kg}kg/yr` : '~5kg/yr' },
                { icon: '❤️', label: 'Planted for', value: tree?.donors?.name || 'EcoTree' },
                { icon: '🔬', label: 'Updates',    value: `${updates.length} verified` },
              ].map(d => (
                <div key={d.label} style={{ background: '#f9fafb', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>{d.icon} {d.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* GPS */}
            {tree?.latitude && tree?.longitude && (
              <a
                href={`https://maps.google.com/?q=${tree.latitude},${tree.longitude}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', textDecoration: 'none' }}
              >
                <span style={{ fontSize: '16px' }}>📍</span>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#166534' }}>
                  {tree.latitude.toFixed(6)}° N, {tree.longitude.toFixed(6)}° E
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>Maps →</span>
              </a>
            )}
          </div>
        </div>

        {/* ── BEFORE & AFTER PHOTOS ── */}
        {(beforePhoto || afterPhoto) && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>📸 Before & After</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Before photo */}
              {beforePhoto && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Before planting</div>
                  <div
                    onClick={() => setPhotoPopup({ url: beforePhoto, label: `Before planting · ${tree?.species}` })}
                    style={{ position: 'relative', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}
                  >
                    <img
                      src={beforePhoto}
                      alt="Before planting"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '20px' }}>🔍 Tap to enlarge</div>
                    </div>
                  </div>
                </div>
              )}

              {/* After photo */}
              {afterPhoto && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>After planting ✅</div>
                  <div
                    onClick={() => setPhotoPopup({ url: afterPhoto, label: `After planting · ${tree?.species}` })}
                    style={{ position: 'relative', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}
                  >
                    <img
                      src={afterPhoto}
                      alt="After planting"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '20px' }}>🔍 Tap to enlarge</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PHOTO TIMELINE ── */}
        {updates.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>📅 Update Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {updates.map(u => (
                <div key={u.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    onClick={() => { const url = u.after_photo_url || u.photo_url; if (url) setPhotoPopup({ url, label: new Date(u.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }) }}
                    style={{
                      width: '72px', height: '72px', borderRadius: '10px', flexShrink: 0, cursor: u.after_photo_url || u.photo_url ? 'pointer' : 'default',
                      background: u.photo_url || u.after_photo_url ? `url(${u.photo_url || u.after_photo_url}) center/cover` : 'linear-gradient(135deg,#2d6a4f,#52b788)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>
                    {!u.photo_url && !u.after_photo_url && '🌳'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '3px' }}>
                      {new Date(u.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {u.ai_health_score !== null && (
                      <div style={{ fontSize: '12px', color: healthColor(u.ai_health_score || 0), marginBottom: '3px', fontWeight: 500 }}>
                        Health: {u.ai_health_score}/100
                      </div>
                    )}
                    {u.notes && <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{u.notes}</div>}
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>✅ AI Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QR CODE ── */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '1.25rem', marginBottom: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '0.75rem' }}>🔗 Tree QR Code</div>
          <img src={qrUrl} alt={`QR code for tree ${treeId}`} style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.5rem' }}>ecotrees.org/tree/{treeId}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>Scan to view this tree&apos;s live profile</div>
        </div>

        {/* Branding */}
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', fontWeight: 700, color: '#1A3C34', marginBottom: '4px' }}>
            Eco<span style={{ color: '#2C5F2D' }}>Tree</span>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Every impact, verified · ecotrees.org</div>
        </div>

      </div>
    </div>
  )
}
