'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'

type MapStyle = 'light' | 'satellite'
const MAP_STYLES: Record<MapStyle, string> = {
  light:     'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

const PROJECTS = [
  'Tree Plantation', 'Lake Rejuvenation', 'Waste Processing',
  'Plastic → Products', 'Water Conservation', 'Employee Engagement',
  'Skilling & Education', 'Multi-vertical',
]

interface CsrPartner {
  id: number
  company_name: string
  contact_name: string | null
  contact_email: string | null
  tree_count: number | null
  trees_planted: number
  trees_verified: number
  trees_assigned: number
  project_type: string | null
  budget: string | null
  start_date: string | null
  completion_date: string | null
  status: string | null
  progress_status: string | null
  before_photos: string[] | null
  after_photos: string[] | null
  site_photos: string[] | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  sites: { name: string; city: string } | null
}

export default function CsrDashboard() {
  const router    = useRouter()
  const [partner, setPartner] = useState<CsrPartner | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite')
  const [photoPopup, setPhotoPopup] = useState<{ url: string; label: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/csr-dashboard/login'); return }

    const { data } = await supabase
      .from('csr_partners')
      .select('*, site_id')
      .eq('contact_email', session.user.email)
      .eq('is_active', true)
      .single()

    if (!data) { window.location.replace('/csr-dashboard/login'); return }

    // Fetch site details
    if (data.site_id) {
      const { data: siteData } = await supabase
        .from('sites').select('name, city').eq('id', data.site_id).single()
      setPartner({ ...data, sites: siteData })
    } else {
      setPartner(data)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.replace('/csr-dashboard/login')
  }

  async function downloadCertificate() {
    if (!partner) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = 297; const H = 210

    doc.setFillColor(26, 60, 52); doc.rect(0, 0, W, H, 'F')
    doc.setDrawColor(151, 188, 98); doc.setLineWidth(1.5); doc.rect(8, 8, W-16, H-16)
    doc.setLineWidth(0.5); doc.rect(12, 12, W-24, H-24)

    doc.setFontSize(10); doc.setTextColor(151, 188, 98)
    doc.text('ECOTREE IMPACT FOUNDATION', W/2, 28, { align: 'center' })
    doc.setFontSize(8); doc.setTextColor(180, 180, 180)
    doc.text('Every tree tracked. Every impact verified.', W/2, 36, { align: 'center' })

    doc.setDrawColor(151, 188, 98); doc.setLineWidth(0.3); doc.line(40, 40, W-40, 40)

    doc.setFontSize(22); doc.setTextColor(151, 188, 98)
    doc.text('CSR Impact Certificate', W/2, 56, { align: 'center' })

    doc.setFontSize(10); doc.setTextColor(200, 200, 200)
    doc.text('This certifies that', W/2, 68, { align: 'center' })

    doc.setFontSize(20); doc.setTextColor(255, 255, 255)
    doc.text(partner.company_name, W/2, 82, { align: 'center' })

    doc.setFontSize(10); doc.setTextColor(200, 200, 200)
    doc.text(`has planted ${partner.trees_planted} trees through EcoTree Impact Foundation`, W/2, 94, { align: 'center' })
    doc.text(`at ${partner.sites?.name || 'Bangalore'}, Karnataka, India`, W/2, 102, { align: 'center' })

    // Stats boxes
    const co2 = (partner.trees_planted || 0) * 22
    const stats = [
      { val: String(partner.trees_planted || 0), label: 'Trees Planted', x: 55 },
      { val: `${co2} kg`,                        label: 'CO₂ Offset/yr', x: 120 },
      { val: `${partner.trees_verified || 0}`,   label: 'AI Verified',   x: 185 },
      { val: '80G',                              label: 'Tax Benefit',   x: 240 },
    ]

    stats.forEach(s => {
      doc.setFillColor(44, 95, 45)
      doc.roundedRect(s.x, 112, 55, 22, 2, 2, 'F')
      doc.setFontSize(13); doc.setTextColor(255, 255, 255)
      doc.text(s.val, s.x + 27.5, 121, { align: 'center' })
      doc.setFontSize(7); doc.setTextColor(151, 188, 98)
      doc.text(s.label, s.x + 27.5, 129, { align: 'center' })
    })

    doc.setDrawColor(151, 188, 98); doc.setLineWidth(0.3); doc.line(40, 142, W-40, 142)
    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text(`Issued: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}  ·  ISFR Standard  ·  GPS Verified  ·  BRSR Compatible`, W/2, 150, { align: 'center' })
    doc.setFontSize(7); doc.setTextColor(151, 188, 98)
    doc.text('ecotrees.org', W/2, 158, { align: 'center' })

    doc.save(`EcoTree-CSR-Certificate-${partner.company_name.replace(/\s/g, '-')}.pdf`)
  }

  function shareWhatsApp() {
    if (!partner) return
    const text = encodeURIComponent(`🌳 ${partner.company_name} has planted ${partner.trees_planted} trees with EcoTree Impact Foundation!\n🌿 ${(partner.trees_planted||0)*22} kg CO₂ offset/year · GPS verified · BRSR ready\n💚 ecotrees.org/csr-ngo`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  function shareLinkedIn() {
    if (!partner) return
    const text = encodeURIComponent(`${partner.company_name} is proud to partner with EcoTree Impact Foundation for our CSR initiative.\n\n✅ ${partner.trees_planted} trees planted\n🌍 ${(partner.trees_planted||0)*22} kg CO₂ offset per year\n📍 GPS-verified plantation in Bangalore\n📊 BRSR-compatible impact reporting\n\n#CSR #ESG #BRSR #Sustainability #EcoTree`)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ecotrees.org/csr-ngo')}&summary=${text}`, '_blank')
  }

  function copyImpact() {
    if (!partner) return
    navigator.clipboard.writeText(`${partner.company_name} CSR Impact:\n🌳 ${partner.trees_planted} trees planted\n🌍 ${(partner.trees_planted||0)*22} kg CO₂ offset/year\n📍 ${partner.sites?.name || 'Bangalore'}, Karnataka\n✅ AI-verified by EcoTree Impact Foundation\necotrees.org`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#1A3C34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌳</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Loading your impact dashboard...</div>
      </div>
    </div>
  )

  if (!partner) return null

  const pct        = partner.tree_count ? Math.round(((partner.trees_planted || 0) / partner.tree_count) * 100) : 0
  const co2        = (partner.trees_planted || 0) * 22
  const allPhotos  = [...(partner.before_photos || []), ...(partner.after_photos || []), ...(partner.site_photos || [])]
  const hasGPS     = !!(partner.latitude && partner.longitude)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root { --dark:#1A3C34; --moss:#97BC62; --green:#2C5F2D; --cream:#F7F5F0; }
        .csr-page { font-family: 'DM Sans', system-ui, sans-serif; background: white; }
        .csr-hero { background: var(--dark); background-image: radial-gradient(ellipse 60% 80% at 15% 50%, rgba(82,183,136,.1) 0%, transparent 65%); padding: 1.25rem 1.5rem; }
        .csr-hero__inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
        .csr-counters { background: var(--dark); border-top: 1px solid rgba(255,255,255,.06); padding: 1.5rem; }
        .csr-counters__inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        @media(max-width:700px) { .csr-counters__inner { grid-template-columns: repeat(2,1fr); } }
        .csr-counter { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: center; gap: .3rem; }
        .csr-section { padding: 3rem 1.5rem; }
        .csr-inner { max-width: 1200px; margin: 0 auto; }
        .csr-eyebrow { font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--moss); margin-bottom: .5rem; }
        .csr-h2 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.4rem,2.5vw,2rem); font-weight: 700; color: #1a1a1a; line-height: 1.2; margin-bottom: .75rem; }
        .photo-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: .75rem; }
        @media(max-width:768px) { .photo-grid { grid-template-columns: repeat(2,1fr); } }
        .photo-thumb { aspect-ratio: 4/3; border-radius: 10px; overflow: hidden; cursor: pointer; position: relative; }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .2s; }
        .photo-thumb:hover img { transform: scale(1.05); }
        .photo-thumb .zoom { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.55); color: white; font-size: 10px; padding: 2px 7px; border-radius: 4px; }
        .style-toggle { display: flex; gap: .4rem; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.1); border-radius: 999px; padding: 4px; }
        .style-btn { display: inline-flex; align-items: center; gap: .35rem; font-family: inherit; font-size: .8rem; font-weight: 600; color: rgba(255,255,255,.6); background: transparent; border: none; border-radius: 999px; padding: .4rem .9rem; cursor: pointer; transition: all .25s; }
        .style-btn.active { color: #fff; background: rgba(255,255,255,.15); }
        .project-chip { display: inline-flex; align-items: center; padding: .5rem 1.1rem; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: white; font-size: .82rem; font-weight: 500; white-space: nowrap; }
        .share-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .7rem 1.5rem; border-radius: 999px; border: none; cursor: pointer; font-size: .88rem; font-weight: 700; font-family: inherit; }
        .map-header { background: var(--green); border-radius: 16px 16px 0 0; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; }
        .map-strip { max-width: 1200px; margin: 0 auto; background: var(--green); border-radius: 0 0 16px 16px; padding: .6rem 1.5rem; font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.7); }
        .live-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 5px rgba(74,222,128,.9); animation: pulse 2s ease-in-out infinite; display: inline-block; margin-right: 6px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
        .photo-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; padding: 1rem; }
      `}</style>

      <main className="csr-page">

        {/* ── HERO ── */}
        <section className="csr-hero">
          <div className="csr-hero__inner">
            <div>
              <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: '.4rem' }}>
                <span className="live-dot" />CSR Impact Dashboard
              </div>
              <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(1.2rem,2.5vw,1.75rem)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: '.4rem' }}>
                {partner.company_name}
              </h1>
              <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.55)' }}>
                {partner.contact_name} · {partner.project_type || 'Tree Plantation'} · {partner.sites?.name || 'Bangalore'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={shareWhatsApp} className="share-btn" style={{ background: '#25D366', color: 'white' }}>💬 Share</button>
              <button onClick={shareLinkedIn} className="share-btn" style={{ background: '#0A66C2', color: 'white' }}>💼 LinkedIn</button>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(255,255,255,.7)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
            </div>
          </div>
        </section>

        {/* ── COUNTERS ── */}
        <section className="csr-counters">
          <div className="csr-counters__inner">
            {[
              { icon: '🌳', val: partner.tree_count || 0,    label: 'Trees committed', sub: 'Total batch' },
              { icon: '🌱', val: partner.trees_planted || 0, label: 'Trees planted',   sub: `${pct}% complete` },
              { icon: '✅', val: partner.trees_verified || 0,label: 'AI verified',     sub: 'EcoTree certified' },
              { icon: '🌍', val: `${co2} kg`,                label: 'CO₂ offset/yr',  sub: '~22 kg per tree' },
            ].map(c => (
              <div className="csr-counter" key={c.label}>
                <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, color: 'white', lineHeight: 1 }}>{c.val}</span>
                <span style={{ fontSize: '.7rem', fontWeight: 500, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>{c.label}</span>
                <span style={{ fontSize: '.65rem', color: 'var(--moss)', fontWeight: 500, textAlign: 'center' }}>{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROGRESS ── */}
        <section className="csr-section" style={{ background: 'var(--cream)', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="csr-inner">
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                <div>
                  <p className="csr-eyebrow">Plantation Progress</p>
                  <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                    {partner.trees_planted} of {partner.tree_count} trees planted
                  </h2>
                </div>
                <span style={{ background: pct >= 100 ? '#dcfce7' : '#fef9c3', color: pct >= 100 ? '#166534' : '#92400e', fontSize: '13px', fontWeight: 600, padding: '6px 14px', borderRadius: '20px' }}>
                  {pct >= 100 ? '✅ Complete' : `${pct}% done`}
                </span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #2C5F2D, #52B788)', borderRadius: '999px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { label: 'Site', value: partner.sites?.name || '—' },
                  { label: 'Project', value: partner.project_type || '—' },
                  { label: 'Start date', value: partner.start_date ? new Date(partner.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                ].map(d => (
                  <div key={d.label} style={{ background: '#f9fafb', borderRadius: '10px', padding: '.75rem' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '3px' }}>{d.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PHOTOS ── */}
        {allPhotos.length > 0 && (
          <section className="csr-section" style={{ background: 'white' }}>
            <div className="csr-inner">
              <p className="csr-eyebrow">Plantation Photos</p>
              <h2 className="csr-h2">Before &amp; after your trees</h2>
              <p style={{ fontSize: '.95rem', color: '#6B7280', marginBottom: '1.5rem' }}>Tap any photo to view full screen.</p>

              {/* Before */}
              {(partner.before_photos || []).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Before planting ({(partner.before_photos || []).length})</div>
                  <div className="photo-grid">
                    {(partner.before_photos || []).map((url, i) => (
                      <div key={i} className="photo-thumb" onClick={() => setPhotoPopup({ url, label: `Before planting · ${partner.company_name}` })}>
                        <img src={url} alt={`Before ${i+1}`} loading="lazy" />
                        <div className="zoom">🔍 expand</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* After */}
              {(partner.after_photos || []).length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>After planting ✅ ({(partner.after_photos || []).length})</div>
                  <div className="photo-grid">
                    {(partner.after_photos || []).map((url, i) => (
                      <div key={i} className="photo-thumb" onClick={() => setPhotoPopup({ url, label: `After planting · ${partner.company_name}` })}>
                        <img src={url} alt={`After ${i+1}`} loading="lazy" />
                        <div className="zoom">🔍 expand</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Site */}
              {(partner.site_photos || []).length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Site overview ({(partner.site_photos || []).length})</div>
                  <div className="photo-grid">
                    {(partner.site_photos || []).map((url, i) => (
                      <div key={i} className="photo-thumb" onClick={() => setPhotoPopup({ url, label: `Site overview · ${partner.sites?.name || 'Plantation site'}` })}>
                        <img src={url} alt={`Site ${i+1}`} loading="lazy" />
                        <div className="zoom">🔍 expand</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── MAP ── */}
        {hasGPS && (
          <section style={{ background: 'var(--cream)', padding: '3rem 0 0' }}>
            <div className="map-header">
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                🗺️ Live Plantation Site <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', fontFamily: 'DM Sans, system-ui, sans-serif', fontWeight: 400 }}>· GPS verified</span>
              </div>
              <div className="style-toggle">
                <button className={`style-btn${mapStyle === 'light' ? ' active' : ''}`} onClick={() => setMapStyle('light')}>🗺️ Street</button>
                <button className={`style-btn${mapStyle === 'satellite' ? ' active' : ''}`} onClick={() => setMapStyle('satellite')}>🛰️ Satellite</button>
              </div>
            </div>
            <div style={{ height: '420px', maxWidth: '1200px', margin: '0 auto', overflow: 'hidden' }}>
              <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{ longitude: partner.longitude!, latitude: partner.latitude!, zoom: 14 }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLES[mapStyle]}>
                <NavigationControl position="bottom-right" />
                <Marker longitude={partner.longitude!} latitude={partner.latitude!} anchor="bottom">
                  <div style={{ width: 40, height: 40, background: '#2C5F2D', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', border: '3px solid white', boxShadow: '0 3px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ transform: 'rotate(45deg)', fontSize: 18 }}>🌳</span>
                  </div>
                </Marker>
              </Map>
            </div>
            <div className="map-strip">
              <span className="live-dot" />
              GPS: {partner.latitude?.toFixed(6)}° N, {partner.longitude?.toFixed(6)}° E · {partner.sites?.name || 'Plantation site'} · {partner.sites?.city || 'Bangalore'}
            </div>
          </section>
        )}

        {/* ── BRSR + IMPACT REPORT ── */}
        <section className="csr-section" style={{ background: 'white' }}>
          <div className="csr-inner">
            <p className="csr-eyebrow">Impact Report</p>
            <h2 className="csr-h2">BRSR &amp; ESG documentation</h2>
            <p style={{ fontSize: '.95rem', color: '#6B7280', marginBottom: '1.5rem' }}>Download your impact certificate for annual reports and board presentations.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>

              {/* BRSR card */}
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.75rem' }}>📊</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A3C34', marginBottom: '.5rem' }}>BRSR Report</div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Trees: <strong>{partner.trees_planted}</strong><br />
                  CO₂/yr: <strong>{co2} kg</strong><br />
                  Survival: <strong>{partner.trees_verified ? Math.round((partner.trees_verified/(partner.trees_planted||1))*100) : 0}%</strong>
                </div>
                <span style={{ background: '#1A3C34', color: '#97BC62', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>✅ BRSR Compatible</span>
              </div>

              {/* CO₂ Certificate */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.75rem' }}>🌍</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', marginBottom: '.5rem' }}>CO₂ Certificate</div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Offset: <strong>{co2} kg/year</strong><br />
                  Equivalent: <strong>{Math.round(co2/0.21)} km</strong> driving<br />
                  Standard: <strong>ISFR</strong>
                </div>
                <button onClick={downloadCertificate}
                  style={{ background: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
                  ⬇️ Download PDF
                </button>
              </div>

              {/* 80G info */}
              <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.75rem' }}>🧾</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '.5rem' }}>80G Tax Benefit</div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, marginBottom: '1rem' }}>
                  EcoTree is a Section 8 NGO with 80G approval. Your donation qualifies for tax deduction under Section 80G of the Income Tax Act.
                </div>
                <a href="mailto:hello@ecotrees.org?subject=80G Receipt Request"
                  style={{ display: 'block', background: '#92400e', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: 'inherit' }}>
                  📧 Request 80G Receipt
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA STRIP ── */}
        <section style={{ background: '#1A3C34', padding: '3rem 1.5rem' }}>
          <div className="csr-inner" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: '.75rem' }}>Expand your impact</p>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, color: 'white', marginBottom: '.75rem' }}>
              Take on a new CSR project
            </h2>
            <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.6)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Contact EcoTree for a custom proposal across any of our sustainability initiatives.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {PROJECTS.map(p => (
                <span key={p} className="project-chip">{p}</span>
              ))}
            </div>
            <a href="/csr-ngo"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--moss)', color: '#1A3C34', fontWeight: 700, fontSize: '.95rem', padding: '.875rem 2rem', borderRadius: '999px', textDecoration: 'none' }}>
              🌿 Contact EcoTree for new project →
            </a>
          </div>
        </section>

        {/* ── SHARE ── */}
        <section className="csr-section" style={{ background: 'var(--cream)' }}>
          <div className="csr-inner">
            <p className="csr-eyebrow">Share your impact</p>
            <h2 className="csr-h2">Tell the world about your CSR</h2>
            <div style={{ background: 'linear-gradient(135deg,#1B4332,#2C5F2D,#40916C)', borderRadius: '20px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '14px', padding: '1.25rem 1.5rem', flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '.9rem', color: 'white', lineHeight: 1.7, fontWeight: 500 }}>
                  🌳 {partner.company_name} has planted {partner.trees_planted} trees with EcoTree!<br />
                  🌿 {co2} kg CO₂ offset · GPS verified · BRSR ready<br />
                  💚 ecotrees.org/csr-ngo
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', marginTop: '.5rem' }}>
                  #CSR #ESG #BRSR #Sustainability #EcoTree
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', minWidth: '180px' }}>
                <button onClick={shareWhatsApp} className="share-btn" style={{ background: '#25D366', color: 'white', justifyContent: 'center' }}>💬 Share on WhatsApp</button>
                <button onClick={shareLinkedIn} className="share-btn" style={{ background: '#0A66C2', color: 'white', justifyContent: 'center' }}>💼 Share on LinkedIn</button>
                <button onClick={copyImpact} className="share-btn" style={{ background: copied ? '#22c55e' : 'rgba(255,255,255,.15)', color: 'white', justifyContent: 'center', border: '1px solid rgba(255,255,255,.2)' }}>
                  {copied ? '✅ Copied!' : '📋 Copy text'}
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── PHOTO POPUP ── */}
      {photoPopup && (
        <div className="photo-overlay" onClick={() => setPhotoPopup(null)}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Tap anywhere to close</div>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label} style={{ width: 'min(90vw,620px)', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
            <button onClick={() => setPhotoPopup(null)} style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#dc2626', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '12px', textAlign: 'center' }}>
            {photoPopup.label}
          </div>
        </div>
      )}
    </>
  )
}
