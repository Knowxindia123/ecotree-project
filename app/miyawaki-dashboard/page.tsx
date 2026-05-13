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

const PROJECTS = ['Tree Plantation','Lake Rejuvenation','Waste Processing','Plastic to Products','Water Conservation','Employee Engagement','Skilling and Education','Multi-vertical']

interface Forest {
  id: number; forest_name: string; forest_code: string | null
  trees_target: number; trees_planted: number
  species_count: number; area_sqm: number | null; status: string | null
  before_photos: string[] | null; after_photos: string[] | null; site_photos: string[] | null
  latitude: number | null; longitude: number | null; notes: string | null
  total_donated: number | null
  sites: { name: string; city: string } | null
}

interface CodonorRow {
  id: number; amount: number; is_gift: boolean; gift_from_name: string | null
  gift_occasion: string | null; created_at: string
  donors: { name: string; email: string } | null
}

interface ProgressUpdate {
  id: number; trees_planted_today: number; total_planted_so_far: number
  notes: string | null; status: string; created_at: string
  photos: string[] | null
}

interface Donor {
  id: number; name: string; email: string; total_donated: number
  is_gift: boolean | null; gift_from_name: string | null; gift_occasion: string | null
}

export default function MiyawakiDashboard() {
  const [donor,      setDonor]      = useState<Donor | null>(null)
  const [forests,    setForests]    = useState<Forest[]>([])   // all forests for this donor
  const [activeForest, setActiveForest] = useState<Forest | null>(null)
  const [codonors,   setCodonors]   = useState<CodonorRow[]>([])
  const [updates,    setUpdates]    = useState<ProgressUpdate[]>([])
  const [loading,    setLoading]    = useState(true)
  const [mapStyle,   setMapStyle]   = useState<MapStyle>('satellite')
  const [photoPopup, setPhotoPopup] = useState<{ url: string; label: string } | null>(null)
  const [copied,     setCopied]     = useState(false)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/my-tree/login'); return }

    const params = new URLSearchParams(window.location.search)
    const donorIdParam = params.get('donor_id')
    const adminView = params.get('admin_view') === 'true'

    let donorData: any = null
    if (donorIdParam && adminView) {
      const { data: d } = await supabase.from('donors').select('*').eq('id', donorIdParam).single()
      donorData = d
    } else {
      // Get ALL donor rows for this email (multi-tier)
      const { data: allDonors } = await supabase
        .from('donors').select('*').eq('email', session.user.email)
        .eq('tier', '5000').order('created_at', { ascending: false })
      donorData = allDonors?.[0] || null
    }

    if (!donorData) { window.location.replace('/my-tree/login'); return }
    setDonor(donorData)

    // Get ALL miyawaki donor records for this donor (could be in multiple forests)
    const { data: myRecords } = await supabase
      .from('miyawaki_donors').select('forest_id, amount')
      .eq('donor_id', donorData.id)
      .not('forest_id', 'is', null)

    if (myRecords && myRecords.length > 0) {
      const forestIds = myRecords.map((r: any) => r.forest_id)

      // Load all forests this donor is part of
      const { data: forestsData } = await supabase
        .from('miyawaki_forests').select('*, site_id')
        .in('id', forestIds)
        .order('created_at', { ascending: false })

      if (forestsData) {
        const enriched = await Promise.all(forestsData.map(async (f: any) => {
          if (f.site_id) {
            const { data: s } = await supabase.from('sites').select('name, city').eq('id', f.site_id).single()
            return { ...f, sites: s }
          }
          return { ...f, sites: null }
        }))
        setForests(enriched)
        setActiveForest(enriched[0])

        // Load co-donors and updates for first forest
        if (enriched[0]) {
          await loadForestData(enriched[0].id)
        }
      }
    }

    setLoading(false)
  }

  async function loadForestData(forestId: number) {
    const [coRes, updRes] = await Promise.all([
      supabase.from('miyawaki_donors')
        .select('id, amount, is_gift, gift_from_name, gift_occasion, created_at, donors(name, email)')
        .eq('forest_id', forestId)
        .order('created_at', { ascending: true }),
      supabase.from('miyawaki_updates')
        .select('id, trees_planted_today, total_planted_so_far, notes, status, created_at, photos')
        .eq('forest_id', forestId)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })
        .limit(10),
    ])
    setCodonors((coRes.data as unknown as CodonorRow[]) || [])
    setUpdates((updRes.data as unknown as ProgressUpdate[]) || [])
  }

  async function switchForest(forest: Forest) {
    setActiveForest(forest)
    await loadForestData(forest.id)
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
    if (activeForest?.forest_code) { doc.setFontSize(8); doc.setTextColor(100,100,100); doc.text(activeForest.forest_code,W/2,36,{align:'center'}) }
    doc.setFontSize(20); doc.setTextColor(151,188,98); doc.text('Miyawaki Forest Sponsorship Certificate',W/2,52,{align:'center'})
    doc.setFontSize(10); doc.setTextColor(200,200,200); doc.text('This certifies that',W/2,68,{align:'center'})
    doc.setFontSize(22); doc.setTextColor(255,255,255); doc.text(donor.name,W/2,82,{align:'center'})
    doc.setFontSize(10); doc.setTextColor(200,200,200)
    if (activeForest) {
      doc.text('has sponsored the '+activeForest.forest_name+' Miyawaki Forest',W/2,94,{align:'center'})
      doc.text('at '+(activeForest.sites?.name||'Bangalore')+', Karnataka, India',W/2,102,{align:'center'})
      const co2 = (activeForest.trees_planted||0)*22
      const stats = [
        {val:String(activeForest.trees_planted||0),label:'Trees Planted',x:55},
        {val:String(activeForest.species_count||30)+'+',label:'Species',x:120},
        {val:co2+'kg',label:'CO2 Offset/yr',x:185},
        {val:'80G',label:'Tax Benefit',x:240},
      ]
      stats.forEach(s=>{
        doc.setFillColor(44,95,45); doc.roundedRect(s.x,108,55,22,2,2,'F')
        doc.setFontSize(13); doc.setTextColor(255,255,255); doc.text(s.val,s.x+27.5,117,{align:'center'})
        doc.setFontSize(7); doc.setTextColor(151,188,98); doc.text(s.label,s.x+27.5,125,{align:'center'})
      })
    }
    doc.setFontSize(7); doc.setTextColor(151,188,98); doc.text('ecotrees.org',W/2,158,{align:'center'})
    doc.save('EcoTree-Miyawaki-'+donor.name.replace(/\s/g,'-')+'.pdf')
  }

  function shareWA() {
    if (!donor||!activeForest) return
    const co2=(activeForest.trees_planted||0)*22
    const t=encodeURIComponent(`${donor.name} sponsored ${activeForest.forest_name} Miyawaki Forest!\n${activeForest.trees_planted} trees, ${activeForest.species_count||30}+ species, ${co2}kg CO2/yr\necotrees.org/donate`)
    window.open('https://wa.me/?text='+t,'_blank')
  }

  function copyImpact() {
    if (!donor||!activeForest) return
    const co2=(activeForest.trees_planted||0)*22
    navigator.clipboard.writeText(`${donor.name} sponsored ${activeForest.forest_name}\n${activeForest.forest_code||''} · ${activeForest.trees_planted} trees, ${activeForest.species_count||30}+ species, ${co2}kg CO2/yr\nEcoTree Impact Foundation, Bangalore\necotrees.org`)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#1A3C34',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🏙️</div><div style={{fontSize:'14px',color:'rgba(255,255,255,0.6)'}}>Loading your forest dashboard...</div></div>
    </div>
  )
  if (!donor) return null

  const f = activeForest
  const pct = f?.trees_target ? Math.round(((f.trees_planted||0)/f.trees_target)*100) : 0
  const co2 = (f?.trees_planted||0)*22
  const hasGPS = !!(f?.latitude && f?.longitude)
  const allPhotos = [...(f?.before_photos||[]),...(f?.after_photos||[]),...(f?.site_photos||[])]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        :root{--dark:#1A3C34;--moss:#97BC62;--green:#2C5F2D;--cream:#F7F5F0;--purple:#7C3AED}
        .md{font-family:'DM Sans',system-ui,sans-serif;background:white}
        .md-hero{background:var(--dark);padding:1.25rem 1.5rem}
        .md-hi{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
        .md-cc{background:var(--dark);border-top:1px solid rgba(255,255,255,.06);padding:1.5rem}
        .md-ci{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
        @media(max-width:700px){.md-ci{grid-template-columns:repeat(2,1fr)}}
        .md-cb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.3rem}
        .md-sec{padding:3rem 1.5rem}.md-in{max-width:1200px;margin:0 auto}
        .md-ey{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--moss);margin-bottom:.5rem}
        .md-h2{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:700;color:#1a1a1a;line-height:1.2;margin-bottom:.75rem}
        .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
        @media(max-width:768px){.pg{grid-template-columns:repeat(2,1fr)}}
        .pt{aspect-ratio:4/3;border-radius:10px;overflow:hidden;cursor:pointer;position:relative}
        .pt img{width:100%;height:100%;object-fit:cover;transition:transform .2s}
        .pt:hover img{transform:scale(1.05)}
        .ptz{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.55);color:white;font-size:10px;padding:2px 7px;border-radius:4px}
        .st{display:flex;gap:.4rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:4px}
        .sb{font-family:inherit;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6);background:transparent;border:none;border-radius:999px;padding:.4rem .9rem;cursor:pointer}
        .sb.a{color:#fff;background:rgba(255,255,255,.15)}
        .sbn{display:inline-flex;align-items:center;gap:.4rem;padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;font-size:.88rem;font-weight:700;font-family:inherit}
        .mh{background:var(--green);border-radius:16px 16px 0 0;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;max-width:1200px;margin:0 auto}
        .ms{max-width:1200px;margin:0 auto;background:var(--green);border-radius:0 0 16px 16px;padding:.6rem 1.5rem;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:6px}
        .ld{width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 5px rgba(74,222,128,.9);animation:pulse 2s ease-in-out infinite;display:inline-block}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .po{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:1rem}
        @media(max-width:768px){.md-hi{flex-direction:column;align-items:flex-start}}
      `}</style>
      <main className="md">

        {/* HERO */}
        <section className="md-hero">
          <div className="md-hi">
            <div>
              <div style={{fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--moss)',marginBottom:'.4rem',display:'flex',alignItems:'center',gap:'6px'}}>
                <span className="ld"/> Miyawaki Forest Dashboard
              </div>
              <h1 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.2rem,2.5vw,1.75rem)',fontWeight:700,color:'white',lineHeight:1.15,marginBottom:'.4rem'}}>
                {donor.name}
              </h1>
              <p style={{fontSize:'.9rem',color:'rgba(255,255,255,.55)'}}>
                {f ? f.forest_name : 'Forest pending assignment'}
                {f?.forest_code && <span style={{marginLeft:'8px',fontFamily:'monospace',fontSize:'.8rem',background:'rgba(124,58,237,0.3)',padding:'2px 8px',borderRadius:'4px',color:'#c4b5fd'}}>{f.forest_code}</span>}
              </p>

              {/* Multiple forest tabs */}
              {forests.length > 1 && (
                <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
                  {forests.map(forest => (
                    <button key={forest.id} onClick={() => switchForest(forest)}
                      style={{padding:'4px 12px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:600,background: activeForest?.id === forest.id ? '#7C3AED' : 'rgba(255,255,255,0.1)',color:'white',fontFamily:'inherit'}}>
                      {forest.forest_code || forest.forest_name.slice(0,15)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'.75rem',alignItems:'center',flexWrap:'wrap'}}>
              <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white'}}>💬 Share</button>
              <button onClick={downloadCertificate} className="sbn" style={{background:'#1A3C34',color:'white',border:'1px solid rgba(255,255,255,0.2)'}}>⬇️ Certificate</button>
              <button onClick={handleLogout} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'8px',padding:'8px 14px',color:'rgba(255,255,255,.7)',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>Sign out</button>
            </div>
          </div>
        </section>

        {/* PENDING STATE */}
        {!f && (
          <section className="md-sec" style={{background:'var(--cream)'}}>
            <div className="md-in">
              <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'2rem',textAlign:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🌱</div>
                <h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.5rem',fontWeight:700,color:'#1A3C34',marginBottom:'.5rem'}}>Your forest is being planned</h2>
                <p style={{fontSize:'15px',color:'#6B7280',maxWidth:'480px',margin:'0 auto'}}>
                  Our team is grouping donors and selecting the best site for your Miyawaki forest. You will receive an email once your forest is assigned.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* COUNTERS */}
        <section className="md-cc">
          <div className="md-ci">
            {[
              {icon:'🌳',val:f?.trees_target||'TBD',label:'Trees target',sub:'Full forest'},
              {icon:'🌱',val:f?.trees_planted||0,label:'Trees planted',sub:pct+'% complete'},
              {icon:'🌍',val:co2+'kg',label:'CO₂ offset/yr',sub:'~22kg per tree'},
              {icon:'👥',val:codonors.length||1,label:'Co-donors',sub:'Same forest group'},
            ].map(c=>(
              <div className="md-cb" key={c.label}>
                <span style={{fontSize:'1.5rem'}}>{c.icon}</span>
                <span style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:700,color:'white',lineHeight:1}}>{c.val}</span>
                <span style={{fontSize:'.7rem',fontWeight:500,color:'rgba(255,255,255,.45)',textTransform:'uppercase',letterSpacing:'.05em',textAlign:'center'}}>{c.label}</span>
                <span style={{fontSize:'.65rem',color:'var(--moss)',fontWeight:500,textAlign:'center'}}>{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PROGRESS */}
        {f && (
          <section className="md-sec" style={{background:'var(--cream)',paddingTop:'2rem',paddingBottom:'2rem'}}>
            <div className="md-in">
              <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                  <div>
                    <p className="md-ey">Forest progress</p>
                    <h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.25rem',fontWeight:700,color:'#1a1a1a',margin:0}}>{f.trees_planted} of {f.trees_target} trees planted</h2>
                  </div>
                  <span style={{background:pct>=100?'#dcfce7':'#fef9c3',color:pct>=100?'#166534':'#92400e',fontSize:'13px',fontWeight:600,padding:'6px 14px',borderRadius:'20px'}}>{pct>=100?'✅ Complete':pct+'% done'}</span>
                </div>
                <div style={{background:'#f3f4f6',borderRadius:'999px',height:'12px',overflow:'hidden',marginBottom:'1rem'}}>
                  <div style={{width:pct+'%',height:'100%',background:'linear-gradient(90deg,#7C3AED,#a78bfa)',borderRadius:'999px',transition:'width 1s ease'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1rem'}}>
                  {[
                    {label:'Forest name',value:f.forest_name},
                    {label:'Forest code',value:f.forest_code||'—'},
                    {label:'Site',value:f.sites?.name||'—'},
                    {label:'Species',value:(f.species_count||30)+'+ native species'},
                    {label:'Area',value:f.area_sqm?`${f.area_sqm} sqm`:'—'},
                    {label:'Status',value:f.status||'PENDING'},
                  ].map(d=>(
                    <div key={d.label} style={{background:'#f9fafb',borderRadius:'10px',padding:'.75rem'}}>
                      <div style={{fontSize:'11px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'3px'}}>{d.label}</div>
                      <div style={{fontSize:'14px',fontWeight:500,color:'#1a1a1a'}}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Progress update timeline */}
                {updates.length > 0 && (
                  <div>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#374151',marginBottom:'8px'}}>📋 Planting updates</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                      {updates.map((u, i) => (
                        <div key={u.id} style={{display:'flex',alignItems:'center',gap:'12px',background:'#f9fafb',borderRadius:'8px',padding:'8px 12px'}}>
                          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#7C3AED',flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:'13px',fontWeight:600,color:'#1A1A1A'}}>+{u.trees_planted_today} trees planted</div>
                            {u.notes && <div style={{fontSize:'11px',color:'#6B7280'}}>{u.notes}</div>}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'12px',fontWeight:600,color:'#7C3AED'}}>Total: {u.total_planted_so_far}</div>
                            <div style={{fontSize:'11px',color:'#9ca3af'}}>{new Date(u.created_at).toLocaleDateString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CO-DONORS WALL */}
        {codonors.length > 0 && (
          <section className="md-sec" style={{background:'white'}}>
            <div className="md-in">
              <p className="md-ey">Your forest group</p>
              <h2 className="md-h2">Co-donors wall</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                {codonors.map((cd,i)=>{
                  const d = Array.isArray(cd.donors)?cd.donors[0]:cd.donors as any
                  const initial = d?.name?d.name.charAt(0).toUpperCase():'?'
                  return (
                    <div key={cd.id} style={{display:'flex',alignItems:'center',gap:'1rem',background:'#f9fafb',borderRadius:'12px',padding:'.875rem 1rem'}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'#1A3C34',display:'flex',alignItems:'center',justifyContent:'center',color:'#97BC62',fontWeight:700,fontSize:'14px',flexShrink:0}}>{initial}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'14px',fontWeight:600,color:'#1a1a1a'}}>
                          {d?.name?.split(' ')[0]} {d?.name?.split(' ')[1]?.charAt(0)}.
                          {cd.is_gift && cd.gift_from_name && <span style={{marginLeft:'8px',fontSize:'12px',color:'#6B7280'}}>🎁 Gifted by {cd.gift_from_name}</span>}
                        </div>
                        <div style={{fontSize:'12px',color:'#9ca3af'}}>{new Date(cd.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</div>
                      </div>
                      <div style={{fontSize:'14px',fontWeight:600,color:'#2C5F2D'}}>₹{cd.amount.toLocaleString('en-IN')}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* PHOTOS */}
        {allPhotos.length > 0 && (
          <section className="md-sec" style={{background:'var(--cream)'}}>
            <div className="md-in">
              <p className="md-ey">Forest photos</p>
              <h2 className="md-h2">Your Miyawaki forest growing</h2>
              {(f?.before_photos||[]).length>0&&<div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'12px',fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Before ({(f?.before_photos||[]).length})</div><div className="pg">{(f?.before_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'Before · '+(f?.forest_name||'Forest')})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
              {(f?.after_photos||[]).length>0&&<div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'12px',fontWeight:600,color:'#166534',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>After ({(f?.after_photos||[]).length})</div><div className="pg">{(f?.after_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'After · '+(f?.forest_name||'Forest')})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
              {(f?.site_photos||[]).length>0&&<div><div style={{fontSize:'12px',fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Site overview</div><div className="pg">{(f?.site_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'Site · '+(f?.sites?.name||'Site')})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
            </div>
          </section>
        )}

        {/* MAP */}
        {hasGPS && f && (
          <section style={{background:'white',padding:'3rem 0 0'}}>
            <div className="mh">
              <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'white'}}>🗺️ Forest Location · GPS verified</div>
              <div className="st">
                <button className={'sb'+(mapStyle==='light'?' a':'')} onClick={()=>setMapStyle('light')}>🗺️ Street</button>
                <button className={'sb'+(mapStyle==='satellite'?' a':'')} onClick={()=>setMapStyle('satellite')}>🛰️ Satellite</button>
              </div>
            </div>
            <div style={{height:'400px',maxWidth:'1200px',margin:'0 auto',overflow:'hidden'}}>
              <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{longitude:f.longitude!,latitude:f.latitude!,zoom:15}}
                style={{width:'100%',height:'100%'}} mapStyle={MAP_STYLES[mapStyle]}>
                <NavigationControl position="bottom-right"/>
                <Marker longitude={f.longitude!} latitude={f.latitude!} anchor="bottom">
                  <div style={{width:40,height:40,background:'#7C3AED',borderRadius:'50% 50% 50% 0',transform:'rotate(-45deg)',border:'3px solid white',boxShadow:'0 3px 12px rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{transform:'rotate(45deg)',fontSize:18}}>🏙️</span>
                  </div>
                </Marker>
              </Map>
            </div>
            <div className="ms"><span className="ld"/>GPS: {f.latitude?.toFixed(6)}N, {f.longitude?.toFixed(6)}E · {f.sites?.name||'Forest site'}</div>
          </section>
        )}

        {/* CERTIFICATE */}
        <section className="md-sec" style={{background:'var(--cream)'}}>
          <div className="md-in">
            <p className="md-ey">Your certificate</p>
            <h2 className="md-h2">Miyawaki Forest Certificate</h2>
            <button onClick={downloadCertificate}
              style={{background:'#1A3C34',color:'white',border:'none',borderRadius:'10px',padding:'12px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              ⬇️ Download Certificate PDF
            </button>
          </div>
        </section>

        {/* BRSR */}
        {f && (
          <section className="md-sec" style={{background:'white'}}>
            <div className="md-in">
              <p className="md-ey">Impact report</p>
              <h2 className="md-h2">BRSR and ESG documentation</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
                <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'16px',padding:'1.5rem'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>📊</div>
                  <div style={{fontSize:'14px',fontWeight:700,color:'#1A3C34',marginBottom:'.5rem'}}>BRSR Report</div>
                  <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>Trees: <strong>{f.trees_planted}</strong><br/>Species: <strong>{f.species_count||30}+</strong><br/>CO₂/yr: <strong>{co2}kg</strong></div>
                  <span style={{background:'#1A3C34',color:'#97BC62',fontSize:'11px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>BRSR Compatible</span>
                </div>
                <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'16px',padding:'1.5rem'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>🌍</div>
                  <div style={{fontSize:'14px',fontWeight:700,color:'#1e40af',marginBottom:'.5rem'}}>CO₂ Certificate</div>
                  <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>Offset: <strong>{co2}kg/year</strong><br/>Growth: <strong>10x faster</strong><br/>Biodiversity: <strong>30x more</strong></div>
                  <button onClick={downloadCertificate} style={{background:'#1e40af',color:'white',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:600,cursor:'pointer',width:'100%',fontFamily:'inherit'}}>Download PDF</button>
                </div>
                <div style={{background:'#fef9c3',border:'1px solid #fde68a',borderRadius:'16px',padding:'1.5rem'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>🧾</div>
                  <div style={{fontSize:'14px',fontWeight:700,color:'#92400e',marginBottom:'.5rem'}}>80G Tax Benefit</div>
                  <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>EcoTree is a Section 8 NGO with 80G approval. Your donation qualifies for tax deduction.</div>
                  <a href="mailto:hello@ecotrees.org?subject=80G Receipt - Miyawaki" style={{display:'block',background:'#92400e',color:'white',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:600,textAlign:'center',textDecoration:'none'}}>Request 80G Receipt</a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SHARE */}
        <section className="md-sec" style={{background:'var(--cream)'}}>
          <div className="md-in">
            <p className="md-ey">Share your impact</p>
            <h2 className="md-h2">Tell the world about your forest</h2>
            <div style={{background:'linear-gradient(135deg,#1B4332,#2C5F2D,#40916C)',borderRadius:'20px',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1.5rem',flexWrap:'wrap'}}>
              <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'14px',padding:'1.25rem 1.5rem',flex:1,minWidth:'220px'}}>
                <div style={{fontSize:'.9rem',color:'white',lineHeight:1.7,fontWeight:500}}>
                  🏙️ {donor.name} sponsored {f?.forest_name||'a Miyawaki forest'} with EcoTree!<br/>
                  {f?.trees_planted||0} trees, {f?.species_count||30}+ species, {co2}kg CO2/yr
                </div>
                <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',marginTop:'.5rem'}}>#Miyawaki #EcoTree #UrbanForest #ESG</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem',minWidth:'180px'}}>
                <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white',justifyContent:'center'}}>💬 WhatsApp</button>
                <button onClick={copyImpact} className="sbn" style={{background:copied?'#22c55e':'rgba(255,255,255,.15)',color:'white',justifyContent:'center',border:'1px solid rgba(255,255,255,.2)'}}>{copied?'Copied!':'Copy text'}</button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{background:'#1A3C34',padding:'3rem 1.5rem'}}>
          <div className="md-in" style={{textAlign:'center'}}>
            <h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.3rem,2.5vw,1.8rem)',fontWeight:700,color:'white',marginBottom:'1rem'}}>Expand your impact</h2>
            <a href="/donate" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:'var(--moss)',color:'#1A3C34',fontWeight:700,fontSize:'.95rem',padding:'.875rem 2rem',borderRadius:'999px',textDecoration:'none'}}>Plant more trees →</a>
          </div>
        </section>

      </main>
      {photoPopup&&(
        <div className="po" onClick={()=>setPhotoPopup(null)}>
          <div style={{color:'rgba(255,255,255,.5)',fontSize:'11px',textTransform:'uppercase'}}>Tap anywhere to close</div>
          <div style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
            <img src={photoPopup.url} alt={photoPopup.label} style={{width:'min(90vw,620px)',maxHeight:'70vh',objectFit:'contain',borderRadius:'12px',display:'block'}}/>
            <button onClick={()=>setPhotoPopup(null)} style={{position:'absolute',top:'-12px',right:'-12px',width:'28px',height:'28px',borderRadius:'50%',background:'#dc2626',border:'none',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:700}}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
