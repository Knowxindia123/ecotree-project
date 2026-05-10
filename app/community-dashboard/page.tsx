'use client'
import { useEffect, useState } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'

type MapStyle = 'light' | 'satellite'
const MAP_STYLES: Record<MapStyle, string> = {
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
}

interface Donor {
  id: number; name: string; email: string
  tier: string | null; total_donated: number
  is_gift: boolean | null; gift_from_name: string | null; gift_occasion: string | null
  created_at: string
}

interface SitePin { id: number; name: string; latitude: number; longitude: number }

export default function CommunityDashboard() {
  const [donor,        setDonor]        = useState<Donor | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [mapStyle,     setMapStyle]     = useState<MapStyle>('satellite')
  const [photoPopup,   setPhotoPopup]   = useState<{ url: string; label: string } | null>(null)
  const [copied,       setCopied]       = useState(false)
  const [totalTrees,   setTotalTrees]   = useState(0)
  const [totalDonors,  setTotalDonors]  = useState(0)
  const [sitePins,     setSitePins]     = useState<SitePin[]>([])
  const [sitePhotos,   setSitePhotos]   = useState<string[]>([])

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/my-tree/login'); return }

    const params = new URLSearchParams(window.location.search)
    const donorIdParam = params.get('donor_id')
    const adminView = params.get('admin_view') === 'true'

    let donorData: any = null

    if (donorIdParam && adminView) {
      const { data: d } = await supabase
        .from('donors').select('*').eq('id', donorIdParam).single()
      donorData = d
    } else {
      const { data: d } = await supabase
        .from('donors').select('*')
        .eq('email', session.user.email)
        .order('created_at', { ascending: false })
        .limit(1).maybeSingle()
      donorData = d
    }

    if (!donorData) { window.location.replace('/my-tree/login'); return }
    setDonor(donorData)

    // Community stats — all ₹100/₹250 donors
    const { count: donorCount } = await supabase
      .from('donors').select('*', { count: 'exact', head: true })
      .in('tier', ['100', '250'])
    setTotalDonors(donorCount || 0)

    // Community trees — from donations table
    const { data: donationStats } = await supabase
      .from('donations').select('quantity')
      .in('tree_tier_id', ['community_100', 'community_250'])
    const total = (donationStats || []).reduce((sum: number, d: any) => sum + (d.quantity || 1), 0)
    setTotalTrees(total)

    // Site pins with GPS
    const { data: sites } = await supabase
      .from('sites').select('id, name, latitude, longitude')
      .not('latitude', 'is', null).not('longitude', 'is', null)
    setSitePins(sites || [])

    // Site photos from csr_partners
    const { data: csrData } = await supabase
      .from('csr_partners').select('site_photos, after_photos')
      .not('site_photos', 'eq', '{}')
      .limit(5)
    const photos: string[] = []
    csrData?.forEach((c: any) => {
      if (c.site_photos?.length) photos.push(...c.site_photos.slice(0, 2))
      if (c.after_photos?.length) photos.push(...c.after_photos.slice(0, 2))
    })
    setSitePhotos(photos.slice(0, 8))

    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.replace('/my-tree/login') }

  async function downloadCertificate() {
    if (!donor) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = 297
    doc.setFillColor(26,60,52); doc.rect(0,0,W,210,'F')
    doc.setDrawColor(151,188,98); doc.setLineWidth(1.5); doc.rect(8,8,W-16,194)
    doc.setFontSize(10); doc.setTextColor(151,188,98); doc.text('ECOTREE IMPACT FOUNDATION',W/2,28,{align:'center'})
    doc.setFontSize(8); doc.setTextColor(180,180,180); doc.text('Every tree tracked. Every impact verified.',W/2,36,{align:'center'})
    doc.setFontSize(20); doc.setTextColor(151,188,98); doc.text('Community Forest Certificate',W/2,56,{align:'center'})
    doc.setFontSize(10); doc.setTextColor(200,200,200); doc.text('This certifies that',W/2,70,{align:'center'})
    doc.setFontSize(22); doc.setTextColor(255,255,255); doc.text(donor.name,W/2,84,{align:'center'})
    doc.setFontSize(10); doc.setTextColor(200,200,200)
    doc.text('has contributed to EcoTree\'s Community Forest Initiative',W/2,96,{align:'center'})
    doc.text('Bangalore, Karnataka, India',W/2,104,{align:'center'})
    const stats = [
      { val: 'Community', label: 'Contributor', x: 55 },
      { val: String(totalTrees), label: 'Community Trees', x: 120 },
      { val: (totalTrees*5)+'kg', label: 'CO2 Offset/yr', x: 185 },
      { val: '80G', label: 'Tax Benefit', x: 240 },
    ]
    stats.forEach(s => {
      doc.setFillColor(44,95,45); doc.roundedRect(s.x,112,55,22,2,2,'F')
      doc.setFontSize(11); doc.setTextColor(255,255,255); doc.text(s.val,s.x+27.5,121,{align:'center'})
      doc.setFontSize(7); doc.setTextColor(151,188,98); doc.text(s.label,s.x+27.5,129,{align:'center'})
    })
    doc.setFontSize(7); doc.setTextColor(151,188,98); doc.text('ecotrees.org',W/2,158,{align:'center'})
    doc.save('EcoTree-Community-Certificate-' + donor.name.replace(/\s/g,'-') + '.pdf')
  }

  function shareWA() {
    if (!donor) return
    const t = encodeURIComponent(`I just joined EcoTree's Community Forest Initiative in Bangalore! ${totalTrees} trees and counting. ecotrees.org/donate`)
    window.open('https://wa.me/?text='+t,'_blank')
  }
  function shareLI() { window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://ecotrees.org/donate'),'_blank') }
  function copyImpact() {
    if (!donor) return
    navigator.clipboard.writeText(`${donor.name} joined EcoTree's Community Forest Initiative!\n${totalTrees} community trees planted in Bangalore\necotrees.org/donate`)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1A3C34', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌿</div>
        <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>Loading your community dashboard...</div>
      </div>
    </div>
  )
  if (!donor) return null

  const co2 = totalTrees * 5
  const firstSite = sitePins[0]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        :root{--dark:#1A3C34;--moss:#97BC62;--green:#2C5F2D;--cream:#F7F5F0}
        .cd{font-family:'DM Sans',system-ui,sans-serif;background:white}
        .cd-hero{background:var(--dark);padding:1.25rem 1.5rem}
        .cd-hi{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
        .cd-cc{background:var(--dark);border-top:1px solid rgba(255,255,255,.06);padding:1.5rem}
        .cd-ci{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
        @media(max-width:700px){.cd-ci{grid-template-columns:repeat(2,1fr)}}
        .cd-cb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.3rem}
        .cd-sec{padding:3rem 1.5rem}.cd-in{max-width:1200px;margin:0 auto}
        .cd-ey{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--moss);margin-bottom:.5rem}
        .cd-h2{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:700;color:#1a1a1a;line-height:1.2;margin-bottom:.75rem}
        .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
        @media(max-width:768px){.pg{grid-template-columns:repeat(2,1fr)}}
        .pt{aspect-ratio:4/3;border-radius:10px;overflow:hidden;cursor:pointer;position:relative}
        .pt img{width:100%;height:100%;object-fit:cover;transition:transform .2s}
        .pt:hover img{transform:scale(1.05)}
        .ptz{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.55);color:white;font-size:10px;padding:2px 7px;border-radius:4px}
        .st{display:flex;gap:.4rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:4px}
        .sb{font-family:inherit;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6);background:transparent;border:none;border-radius:999px;padding:.4rem .9rem;cursor:pointer;transition:all .25s}
        .sb.a{color:#fff;background:rgba(255,255,255,.15)}
        .sbn{display:inline-flex;align-items:center;gap:.4rem;padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;font-size:.88rem;font-weight:700;font-family:inherit}
        .mh{background:var(--green);border-radius:16px 16px 0 0;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;max-width:1200px;margin:0 auto}
        .ms{max-width:1200px;margin:0 auto;background:var(--green);border-radius:0 0 16px 16px;padding:.6rem 1.5rem;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:6px}
        .ld{width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 5px rgba(74,222,128,.9);animation:pulse 2s ease-in-out infinite;display:inline-block}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .po{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:1rem}
        @media(max-width:768px){.cd-hi{flex-direction:column;align-items:flex-start}}
      `}</style>
      <main className="cd">

        {/* HERO */}
        <section className="cd-hero">
          <div className="cd-hi">
            <div>
              <div style={{fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--moss)',marginBottom:'.4rem',display:'flex',alignItems:'center',gap:'6px'}}>
                <span className="ld"/> Community Forest Dashboard
              </div>
              <h1 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.2rem,2.5vw,1.75rem)',fontWeight:700,color:'white',lineHeight:1.15,marginBottom:'.4rem'}}>{donor.name}</h1>
              <p style={{fontSize:'.9rem',color:'rgba(255,255,255,.55)'}}>
                Community Contributor · ₹{donor.total_donated} donated
                {donor.is_gift && donor.gift_from_name && (
                  <span style={{marginLeft:'10px',background:'rgba(255,255,255,.1)',padding:'2px 10px',borderRadius:'20px',fontSize:'.8rem'}}>
                    🎁 Gifted by {donor.gift_from_name}{donor.gift_occasion ? ` · ${donor.gift_occasion}` : ''}
                  </span>
                )}
              </p>
            </div>
            <div style={{display:'flex',gap:'.75rem',alignItems:'center',flexWrap:'wrap'}}>
              <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white'}}>💬 Share</button>
              <button onClick={shareLI} className="sbn" style={{background:'#0A66C2',color:'white'}}>💼 LinkedIn</button>
              <button onClick={handleLogout} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'8px',padding:'8px 14px',color:'rgba(255,255,255,.7)',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>Sign out</button>
            </div>
          </div>
        </section>

        {/* COUNTERS */}
        <section className="cd-cc">
          <div className="cd-ci">
            {[
              {icon:'💚',val:'₹'+donor.total_donated,label:'Your contribution',sub:'Community donor'},
              {icon:'🌳',val:totalTrees||0,label:'Community trees',sub:'Total planted'},
              {icon:'🌍',val:co2+'kg',label:'CO₂ offset/yr',sub:'~5kg per tree'},
              {icon:'👥',val:totalDonors||0,label:'Contributors',sub:'Including you'},
            ].map(c=>(
              <div className="cd-cb" key={c.label}>
                <span style={{fontSize:'1.5rem'}}>{c.icon}</span>
                <span style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:700,color:'white',lineHeight:1}}>{c.val}</span>
                <span style={{fontSize:'.7rem',fontWeight:500,color:'rgba(255,255,255,.45)',textTransform:'uppercase',letterSpacing:'.05em',textAlign:'center'}}>{c.label}</span>
                <span style={{fontSize:'.65rem',color:'var(--moss)',fontWeight:500,textAlign:'center'}}>{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CERTIFICATE */}
        <section className="cd-sec" style={{background:'var(--cream)',paddingTop:'2rem',paddingBottom:'2rem'}}>
          <div className="cd-in">
            <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'1.5rem'}}>
              <p className="cd-ey">Your certificate</p>
              <h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.25rem',fontWeight:700,color:'#1a1a1a',marginBottom:'.5rem'}}>Community Forest Certificate</h2>
              <p style={{fontSize:'14px',color:'#6B7280',marginBottom:'1rem'}}>
                Your contribution supports EcoTree's community plantation across Bangalore. {totalDonors} contributors and growing.
              </p>
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'10px',padding:'1rem',marginBottom:'1rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',textAlign:'center'}}>
                  {[
                    {label:'Contributor',value:donor.name},
                    {label:'Tier',value:'Community Forest'},
                    {label:'Date',value:new Date(donor.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})},
                  ].map(d=>(
                    <div key={d.label}>
                      <div style={{fontSize:'11px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'3px'}}>{d.label}</div>
                      <div style={{fontSize:'14px',fontWeight:600,color:'#1A3C34'}}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={downloadCertificate} style={{background:'#1A3C34',color:'white',border:'none',borderRadius:'10px',padding:'10px 20px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                ⬇️ Download Certificate PDF
              </button>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        {sitePhotos.length > 0 && (
          <section className="cd-sec" style={{background:'white'}}>
            <div className="cd-in">
              <p className="cd-ey">Community forest photos</p>
              <h2 className="cd-h2">Your forest growing in Bangalore</h2>
              <div className="pg">
                {sitePhotos.map((url,i)=>(
                  <div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'Community forest · Bangalore'})}>
                    <img src={url} alt="" loading="lazy"/>
                    <div className="ptz">expand</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MAP */}
        {sitePins.length > 0 && (
          <section style={{background:'var(--cream)',padding:'3rem 0 0'}}>
            <div className="mh">
              <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'white'}}>
                🗺️ Community Plantation Sites
              </div>
              <div className="st">
                <button className={'sb'+(mapStyle==='light'?' a':'')} onClick={()=>setMapStyle('light')}>🗺️ Street</button>
                <button className={'sb'+(mapStyle==='satellite'?' a':'')} onClick={()=>setMapStyle('satellite')}>🛰️ Satellite</button>
              </div>
            </div>
            <div style={{height:'380px',maxWidth:'1200px',margin:'0 auto',overflow:'hidden'}}>
              <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{longitude:firstSite?.longitude||77.5946,latitude:firstSite?.latitude||12.9716,zoom:11}}
                style={{width:'100%',height:'100%'}} mapStyle={MAP_STYLES[mapStyle]}>
                <NavigationControl position="bottom-right"/>
                {sitePins.map(pin=>(
                  <Marker key={pin.id} longitude={pin.longitude} latitude={pin.latitude} anchor="bottom">
                    <div style={{width:32,height:32,background:'#2C5F2D',borderRadius:'50% 50% 50% 0',transform:'rotate(-45deg)',border:'2px solid white',boxShadow:'0 2px 8px rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{transform:'rotate(45deg)',fontSize:14}}>🌿</span>
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>
            <div className="ms">
              <span className="ld"/>
              {sitePins.length} plantation site{sitePins.length!==1?'s':''} across Bangalore · GPS verified
            </div>
          </section>
        )}

        {/* CONTRIBUTORS */}
        <section className="cd-sec" style={{background:'white'}}>
          <div className="cd-in">
            <p className="cd-ey">Community</p>
            <h2 className="cd-h2">You are part of something bigger</h2>
            <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'16px',padding:'2rem',textAlign:'center'}}>
              <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'3rem',fontWeight:700,color:'#1A3C34',marginBottom:'.5rem'}}>{totalDonors}</div>
              <div style={{fontSize:'16px',fontWeight:600,color:'#2C5F2D',marginBottom:'.5rem'}}>community contributors</div>
              <div style={{fontSize:'14px',color:'#6B7280'}}>including you and {Math.max(0,totalDonors-1)} others · together planting {totalTrees} trees</div>
            </div>
          </div>
        </section>

        {/* SHARE */}
        <section className="cd-sec" style={{background:'var(--cream)'}}>
          <div className="cd-in">
            <p className="cd-ey">Share your impact</p>
            <h2 className="cd-h2">Inspire others to join</h2>
            <div style={{background:'linear-gradient(135deg,#1B4332,#2C5F2D,#40916C)',borderRadius:'20px',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1.5rem',flexWrap:'wrap'}}>
              <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'14px',padding:'1.25rem 1.5rem',flex:1,minWidth:'220px'}}>
                <div style={{fontSize:'.9rem',color:'white',lineHeight:1.7,fontWeight:500}}>
                  🌿 I joined EcoTree's Community Forest Initiative!<br/>
                  {totalTrees} trees planted in Bangalore<br/>
                  💚 ecotrees.org/donate
                </div>
                <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',marginTop:'.5rem'}}>#CommunityForest #EcoTree #Bangalore #GreenCity</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem',minWidth:'180px'}}>
                <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white',justifyContent:'center'}}>💬 WhatsApp</button>
                <button onClick={shareLI} className="sbn" style={{background:'#0A66C2',color:'white',justifyContent:'center'}}>💼 LinkedIn</button>
                <button onClick={copyImpact} className="sbn" style={{background:copied?'#22c55e':'rgba(255,255,255,.15)',color:'white',justifyContent:'center',border:'1px solid rgba(255,255,255,.2)'}}>{copied?'Copied!':'Copy text'}</button>
              </div>
            </div>
          </div>
        </section>

      </main>
      {photoPopup&&(
        <div className="po" onClick={()=>setPhotoPopup(null)}>
          <div style={{color:'rgba(255,255,255,.5)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.08em'}}>Tap anywhere to close</div>
          <div style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label} style={{width:'min(90vw,620px)',maxHeight:'70vh',objectFit:'contain',borderRadius:'12px',display:'block'}}/>
            <button onClick={()=>setPhotoPopup(null)} style={{position:'absolute',top:'-12px',right:'-12px',width:'28px',height:'28px',borderRadius:'50%',background:'#dc2626',border:'none',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:700}}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
