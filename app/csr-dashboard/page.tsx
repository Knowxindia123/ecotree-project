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

interface CsrPartner {
  id: number; company_name: string; contact_name: string | null; contact_email: string | null
  tree_count: number | null; trees_planted: number; trees_verified: number; trees_assigned: number
  project_type: string | null; budget: string | null; start_date: string | null
  status: string | null; progress_status: string | null
  before_photos: string[] | null; after_photos: string[] | null; site_photos: string[] | null; all_before_photos: string[] | null; all_after_photos: string[] | null; all_site_photos: string[] | null
  latitude: number | null; longitude: number | null; notes: string | null
  sites: { name: string; city: string } | null
}

export default function CsrDashboard() {
  const [partners, setPartners] = useState<CsrPartner[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite')
  const [photoPopup, setPhotoPopup] = useState<{ url: string; label: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const partner = partners[selected] || null

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/csr-dashboard/login'); return }
    const { data } = await supabase.from('csr_partners').select('*, site_id')
      .eq('contact_email', session.user.email).eq('is_active', true)
      .order('created_at', { ascending: false })
    if (!data || data.length === 0) { window.location.replace('/csr-dashboard/login'); return }
    const withSites = await Promise.all(data.map(async (p: any) => {
      if (p.site_id) {
        const { data: s } = await supabase.from('sites').select('name, city').eq('id', p.site_id).single()
        return { ...p, sites: s }
      }
      return { ...p, sites: null }
    }))
    setPartners(withSites as CsrPartner[])
    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.replace('/csr-dashboard/login') }

  async function downloadCertificate() {
    if (!partner) return

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    const W = 297, H = 210
    const co2Val = (partner.trees_planted || 0) * 22
    const o2Val  = (partner.trees_planted || 0) * 118
    const certId = `ETIF-${new Date().getFullYear()}-${String(partner.id).padStart(3,'0')}`
    const issueDate = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
    const plantDate = partner.start_date
      ? new Date(partner.start_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
      : issueDate
    const location  = partner.sites?.name || 'Bangalore'
    const city      = partner.sites?.city || 'Bengaluru'
    const gpsLat    = partner.latitude  ? partner.latitude.toFixed(4)  + '° N' : '12.9716° N'
    const gpsLng    = partner.longitude ? partner.longitude.toFixed(4) + '° E' : '77.5946° E'
    const species   = 'Neem, Peepal, Banyan'

    // BACKGROUND
    doc.setFillColor(252, 251, 247)
    doc.rect(0, 0, W, H, 'F')

    // OUTER GOLD BORDER
    doc.setDrawColor(180, 140, 60)
    doc.setLineWidth(2)
    doc.rect(6, 6, W - 12, H - 12)

    // INNER GOLD BORDER
    doc.setDrawColor(200, 168, 76)
    doc.setLineWidth(0.5)
    doc.rect(10, 10, W - 20, H - 20)

    // Corner ornaments
    const corners: [number, number][] = [[14,17],[W-14,17],[14,H-12],[W-14,H-12]]
    doc.setTextColor(200, 168, 76)
    doc.setFontSize(14)
    corners.forEach(([x,y]) => doc.text('*', x, y, { align:'center' }))

    // TOP BAR — EcoTree logo
    doc.setFillColor(44, 95, 45)
    doc.roundedRect(14, 14, 48, 22, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('ECO TREE', 38, 22, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(151, 188, 98)
    doc.text('IMPACT FOUNDATION', 38, 28, { align: 'center' })
    doc.setFontSize(5.5)
    doc.setTextColor(200, 220, 180)
    doc.text('PLANT  |  PROTECT  |  PRESERVE', 38, 33, { align: 'center' })

    // Certificate ID + Date
    doc.setFontSize(9)
    doc.setTextColor(100, 80, 30)
    doc.text('Certificate ID:  ' + certId, W / 2 - 30, 22)
    doc.text('Date of Issue:  ' + issueDate, W / 2 - 30, 30)

    // Company name box (right)
    doc.setFillColor(240, 248, 240)
    doc.setDrawColor(180, 140, 60)
    doc.setLineWidth(0.5)
    doc.roundedRect(W - 68, 13, 56, 24, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setTextColor(44, 95, 45)
    const shortName = partner.company_name.length > 20
      ? partner.company_name.substring(0, 18) + '...'
      : partner.company_name
    doc.text(shortName, W - 40, 22, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setTextColor(100, 140, 100)
    doc.text('CSR PARTNER', W - 40, 30, { align: 'center' })

    // GOLD DIVIDER
    doc.setDrawColor(200, 168, 76)
    doc.setLineWidth(0.8)
    doc.line(14, 40, W - 14, 40)

    // TITLE
    doc.setFontSize(18)
    doc.setTextColor(26, 60, 52)
    doc.text('VERIFIED ENVIRONMENTAL IMPACT CERTIFICATE', W / 2, 53, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(151, 188, 98)
    doc.text('- * -', W / 2, 62, { align: 'center' })

    // RECIPIENT
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Presented To', W / 2, 71, { align: 'center' })
    doc.setFontSize(22)
    doc.setTextColor(26, 60, 52)
    doc.text(partner.company_name.toUpperCase(), W / 2, 82, { align: 'center' })

    // Dashed underline
    doc.setDrawColor(200, 168, 76)
    doc.setLineWidth(0.4)
    doc.setLineDashPattern([1, 1.5], 0)
    doc.line(80, 86, W - 80, 86)
    doc.setLineDashPattern([], 0)

    // Recognition text
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('In recognition of your commitment towards environmental sustainability,', W / 2, 93, { align:'center' })
    doc.text('urban greening and climate action through support for our', W / 2, 99, { align:'center' })
    doc.setFontSize(9.5)
    doc.setTextColor(44, 95, 45)
    doc.text('Tree Plantation & Ecological Restoration Initiative.', W / 2, 105, { align:'center' })

    // 3 STAT BOXES
    const stats = [
      { val: String(partner.trees_planted || 0), unit: '',        label:'TREES PLANTED',    x:30  },
      { val: String(co2Val),                     unit: ' KG/YR',  label:'CO2 OFFSET',       x:112 },
      { val: String(Math.round(o2Val / 1000)),   unit: ' TONS/YR',label:'OXYGEN GENERATED', x:194 },
    ]
    doc.setFillColor(245, 252, 245)
    doc.setDrawColor(200, 220, 180)
    doc.setLineWidth(0.5)
    doc.roundedRect(28, 110, 220, 28, 3, 3, 'FD')
    stats.forEach((s, i) => {
      if (i > 0) {
        doc.setDrawColor(200, 220, 180)
        doc.setLineWidth(0.4)
        doc.line(s.x - 2, 113, s.x - 2, 135)
      }
      doc.setFillColor(44, 95, 45)
      doc.circle(s.x + 12, 124, 9, 'F')
      doc.setFontSize(16)
      doc.setTextColor(26, 60, 52)
      doc.text(s.val, s.x + 40, 121, { align: 'center' })
      if (s.unit) {
        doc.setFontSize(7)
        doc.setTextColor(80, 80, 80)
        doc.text(s.unit, s.x + 55, 121)
      }
      doc.setFontSize(6.5)
      doc.setTextColor(100, 140, 100)
      doc.text(s.label, s.x + 40, 128, { align: 'center' })
    })

    // GOLD DIVIDER
    doc.setDrawColor(200, 168, 76)
    doc.setLineWidth(0.5)
    doc.line(28, 143, 248, 143)

    // PROJECT DETAILS
    doc.setFontSize(9)
    doc.setTextColor(44, 95, 45)
    doc.text('PROJECT DETAILS', 138, 151, { align: 'center' })
    doc.setDrawColor(200, 168, 76)
    doc.setLineWidth(0.4)
    doc.line(28, 154, 248, 154)

    const leftDetails = [
      { label:'Project Name',    val: partner.project_type || 'Green Bengaluru Initiative' },
      { label:'Location',        val: location + ', ' + city },
      { label:'GPS Coordinates', val: gpsLat + ', ' + gpsLng },
    ]
    const rightDetails = [
      { label:'Plantation Date', val: plantDate },
      { label:'Species Planted', val: species },
      { label:'Monitoring',      val: '3 Years' },
    ]
    leftDetails.forEach((d, i) => {
      const y = 161 + i * 8
      doc.setFontSize(7.5)
      doc.setTextColor(100, 140, 100)
      doc.text(d.label, 32, y)
      doc.setTextColor(50, 50, 50)
      doc.text(': ' + d.val, 82, y)
    })
    rightDetails.forEach((d, i) => {
      const y = 161 + i * 8
      doc.setFontSize(7.5)
      doc.setTextColor(100, 140, 100)
      doc.text(d.label, 148, y)
      doc.setTextColor(50, 50, 50)
      doc.text(': ' + d.val, 194, y)
    })

    // QR CODE PANEL
    doc.setFillColor(240, 248, 240)
    doc.setDrawColor(44, 95, 45)
    doc.setLineWidth(0.5)
    doc.roundedRect(254, 107, 36, 80, 2, 2, 'FD')
    doc.setFillColor(26, 60, 52)
    doc.roundedRect(254, 107, 36, 8, 1, 1, 'F')
    doc.setFontSize(5.5)
    doc.setTextColor(151, 188, 98)
    doc.text('SCAN TO VERIFY IMPACT', 272, 112, { align: 'center' })

    // REAL SCANNABLE QR CODE
    const QRCode = await import('qrcode')
    const qrDataUrl = await QRCode.toDataURL('https://ecotrees.org/csr-dashboard', {
      width: 200,
      margin: 1,
      color: { dark: '#1A3C34', light: '#F0F8F0' },
    })
    doc.addImage(qrDataUrl, 'PNG', 257, 117, 30, 30)
    doc.setFontSize(5)
    doc.setTextColor(100, 140, 100)
    doc.text('ecotrees.org/csr-dashboard', 272, 150, { align: 'center' })

    const features = [
      'GPS Verified Locations',
      'Geo-tagged Photographs',
      'Tree Registry',
      'Growth Tracking Reports',
      'Carbon Impact Metrics',
      'Downloadable CSR Reports',
    ]
    doc.setFontSize(6.5)
    features.forEach((f, i) => {
      doc.setTextColor(44, 95, 45)
      doc.text('•', 257, 150 + i * 6.5)
      doc.setTextColor(50, 50, 50)
      doc.text(f, 261, 150 + i * 6.5)
    })
    doc.setFontSize(5.5)
    doc.setTextColor(100, 140, 100)
    doc.text('Transparency. Accountability. Impact.', 272, 185, { align: 'center' })

    // BOTTOM GREEN BAR
    doc.setFillColor(44, 95, 45)
    doc.rect(0, H - 24, W, 24, 'F')

    // Quote
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('"The best time to plant a tree was 20 years ago.', 18, H - 15)
    doc.setFontSize(9)
    doc.setTextColor(151, 188, 98)
    doc.text('The second best time is now."', 18, H - 8)

    // Signature
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('Bhimsen G', W - 64, H - 14)
    doc.setFont('helvetica', 'normal')
    doc.setDrawColor(151, 188, 98)
    doc.setLineWidth(0.5)
    doc.line(W - 80, H - 10, W - 22, H - 10)
    doc.setFontSize(7)
    doc.setTextColor(151, 188, 98)
    doc.text('Founder & Director  |  Eco Tree Impact Foundation', W - 52, H - 5, { align: 'center' })

    // 80G badge
    doc.setFillColor(151, 188, 98)
    doc.roundedRect(W / 2 - 35, H - 22, 70, 10, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setTextColor(26, 60, 52)
    doc.text('80G Approved  |  Section 8  |  BRSR Ready', W / 2, H - 15, { align: 'center' })

    // SAVE
    doc.save('EcoTree-Certificate-' + certId + '-' + partner.company_name.replace(/\s+/g, '-') + '.pdf')
  }

  function shareWA() {
    if (!partner) return
    const c2=(partner.trees_planted||0)*22
    const t=encodeURIComponent(partner.company_name+' planted '+partner.trees_planted+' trees with EcoTree! '+c2+'kg CO2/yr. ecotrees.org/csr-ngo')
    window.open('https://wa.me/?text='+t,'_blank')
  }
  function shareLI() { window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://ecotrees.org/csr-ngo'),'_blank') }
  function copyImpact() {
    if (!partner) return
    const c2=(partner.trees_planted||0)*22
    navigator.clipboard.writeText(partner.company_name+': '+partner.trees_planted+' trees, '+c2+'kg CO2/yr - EcoTree Impact Foundation')
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#1A3C34',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'3rem'}}>🌳</div><div style={{fontSize:'14px',color:'rgba(255,255,255,0.6)'}}>Loading your impact dashboard...</div></div></div>
  if (!partner) return null

  const pct = partner.tree_count ? Math.round(((partner.trees_planted||0)/partner.tree_count)*100) : 0
  const co2 = (partner.trees_planted||0)*22
  const hasGPS = !!(partner.latitude && partner.longitude)
  const allPhotos = [...(partner.all_before_photos||partner.before_photos||[]),...(partner.all_after_photos||partner.after_photos||[]),...(partner.all_site_photos||partner.site_photos||[])]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        :root{--dark:#1A3C34;--moss:#97BC62;--green:#2C5F2D;--cream:#F7F5F0}
        .cp{font-family:'DM Sans',system-ui,sans-serif;background:white}
        .ch{background:var(--dark);padding:1.25rem 1.5rem}
        .chi{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
        .cc{background:var(--dark);border-top:1px solid rgba(255,255,255,.06);padding:1.5rem}
        .cci{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
        @media(max-width:700px){.cci{grid-template-columns:repeat(2,1fr)}}
        .cb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.3rem}
        .cs{padding:3rem 1.5rem}.ci{max-width:1200px;margin:0 auto}
        .ce{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--moss);margin-bottom:.5rem}
        .ch2{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.4rem,2.5vw,2rem);font-weight:700;color:#1a1a1a;line-height:1.2;margin-bottom:.75rem}
        .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}
        @media(max-width:768px){.pg{grid-template-columns:repeat(2,1fr)}}
        .pt{aspect-ratio:4/3;border-radius:10px;overflow:hidden;cursor:pointer;position:relative}
        .pt img{width:100%;height:100%;object-fit:cover;transition:transform .2s}
        .pt:hover img{transform:scale(1.05)}
        .ptz{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.55);color:white;font-size:10px;padding:2px 7px;border-radius:4px}
        .st{display:flex;gap:.4rem;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:4px}
        .sb{font-family:inherit;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6);background:transparent;border:none;border-radius:999px;padding:.4rem .9rem;cursor:pointer;transition:all .25s}
        .sb.a{color:#fff;background:rgba(255,255,255,.15)}
        .pc{display:inline-flex;align-items:center;padding:.5rem 1.1rem;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:white;font-size:.82rem;font-weight:500;white-space:nowrap}
        .sbn{display:inline-flex;align-items:center;gap:.4rem;padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;font-size:.88rem;font-weight:700;font-family:inherit}
        .mh{background:var(--green);border-radius:16px 16px 0 0;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;max-width:1200px;margin:0 auto}
        .ms{max-width:1200px;margin:0 auto;background:var(--green);border-radius:0 0 16px 16px;padding:.6rem 1.5rem;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:6px}
        .ld{width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 5px rgba(74,222,128,.9);animation:pulse 2s ease-in-out infinite;display:inline-block}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .po{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:1rem}
        @media(max-width:768px){.chi{flex-direction:column;align-items:flex-start}}
      `}</style>
      <main className="cp">
        <section className="ch">
          <div className="chi">
            <div>
              <div style={{fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--moss)',marginBottom:'.4rem',display:'flex',alignItems:'center',gap:'6px'}}>
                <span className="ld"/> CSR Impact Dashboard
              </div>
              <h1 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.2rem,2.5vw,1.75rem)',fontWeight:700,color:'white',lineHeight:1.15,marginBottom:'.4rem'}}>{partner.company_name}</h1>
              <p style={{fontSize:'.9rem',color:'rgba(255,255,255,.55)'}}>{partner.contact_name} - {partner.project_type||'Tree Plantation'} - {partner.sites?.name||'Bangalore'}</p>
            </div>
            <div style={{display:'flex',gap:'.75rem',alignItems:'center',flexWrap:'wrap'}}>
              <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white'}}>Share</button>
              <button onClick={shareLI} className="sbn" style={{background:'#0A66C2',color:'white'}}>LinkedIn</button>
              <button onClick={handleLogout} style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'8px',padding:'8px 14px',color:'rgba(255,255,255,.7)',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>Sign out</button>
            </div>
          </div>
        </section>
        {partners.length > 1 && (
          <div style={{background:'#1A3C34',borderTop:'1px solid rgba(255,255,255,.08)',padding:'.75rem 1.5rem'}}>
            <div style={{maxWidth:'1200px',margin:'0 auto'}}>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.5)',marginBottom:'8px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>Your projects ({partners.length})</div>
              <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                {partners.map((p,i)=>(
                  <button key={p.id} onClick={()=>setSelected(i)} style={{padding:'.5rem 1.1rem',borderRadius:'999px',border:'none',cursor:'pointer',fontSize:'.82rem',fontWeight:600,fontFamily:'inherit',background:selected===i?'white':'rgba(255,255,255,.15)',color:selected===i?'#1A3C34':'white',transition:'all .15s'}}>
                    {p.project_type||'Tree Plantation'}<span style={{marginLeft:'6px',fontSize:'11px',opacity:.7}}>- {p.trees_planted}/{p.tree_count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <section className="cc">
          <div className="cci">
            {[{icon:'🌳',val:partner.tree_count||0,label:'Trees committed',sub:'Total batch'},{icon:'🌱',val:partner.trees_planted||0,label:'Trees planted',sub:pct+'% complete'},{icon:'✅',val:partner.trees_verified||0,label:'AI verified',sub:'EcoTree certified'},{icon:'🌍',val:co2+' kg',label:'CO2 offset/yr',sub:'~22 kg per tree'}].map(c=>(
              <div className="cb" key={c.label}>
                <span style={{fontSize:'1.5rem'}}>{c.icon}</span>
                <span style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:700,color:'white',lineHeight:1}}>{c.val}</span>
                <span style={{fontSize:'.7rem',fontWeight:500,color:'rgba(255,255,255,.45)',textTransform:'uppercase',letterSpacing:'.05em',textAlign:'center'}}>{c.label}</span>
                <span style={{fontSize:'.65rem',color:'var(--moss)',fontWeight:500,textAlign:'center'}}>{c.sub}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="cs" style={{background:'var(--cream)',paddingTop:'2rem',paddingBottom:'2rem'}}>
          <div className="ci">
            <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'1.5rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                <div><p className="ce">Plantation Progress</p><h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.25rem',fontWeight:700,color:'#1a1a1a',margin:0}}>{partner.trees_planted} of {partner.tree_count} trees planted</h2></div>
                <span style={{background:pct>=100?'#dcfce7':'#fef9c3',color:pct>=100?'#166534':'#92400e',fontSize:'13px',fontWeight:600,padding:'6px 14px',borderRadius:'20px'}}>{pct>=100?'Complete':pct+'% done'}</span>
              </div>
              <div style={{background:'#f3f4f6',borderRadius:'999px',height:'10px',overflow:'hidden',marginBottom:'1rem'}}>
                <div style={{width:pct+'%',height:'100%',background:'linear-gradient(90deg,#2C5F2D,#52B788)',borderRadius:'999px',transition:'width 1s ease'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
                {[{label:'Site',value:partner.sites?.name||'--'},{label:'Project',value:partner.project_type||'--'},{label:'Start date',value:partner.start_date?new Date(partner.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'--'}].map(d=>(
                  <div key={d.label} style={{background:'#f9fafb',borderRadius:'10px',padding:'.75rem'}}>
                    <div style={{fontSize:'11px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'3px'}}>{d.label}</div>
                    <div style={{fontSize:'14px',fontWeight:500,color:'#1a1a1a'}}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {allPhotos.length > 0 && (
          <section className="cs" style={{background:'white'}}>
            <div className="ci">
              <p className="ce">Plantation Photos</p>
              <h2 className="ch2">Before and after your trees</h2>
              <p style={{fontSize:'.95rem',color:'#6B7280',marginBottom:'1.5rem'}}>Tap any photo to view full screen.</p>
              {(partner.all_before_photos||partner.before_photos||[]).length>0&&<div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'12px',fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Before planting ({(partner.all_before_photos||partner.before_photos||[]).length})</div><div className="pg">{(partner.all_before_photos||partner.before_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'Before - '+partner.company_name})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
              {(partner.all_after_photos||partner.after_photos||[]).length>0&&<div style={{marginBottom:'1.5rem'}}><div style={{fontSize:'12px',fontWeight:600,color:'#166534',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>After planting ({(partner.all_after_photos||partner.after_photos||[]).length})</div><div className="pg">{(partner.all_after_photos||partner.after_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'After - '+partner.company_name})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
              {(partner.all_site_photos||partner.site_photos||[]).length>0&&<div><div style={{fontSize:'12px',fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Site overview ({(partner.all_site_photos||partner.site_photos||[]).length})</div><div className="pg">{(partner.all_site_photos||partner.site_photos||[]).map((url,i)=><div key={i} className="pt" onClick={()=>setPhotoPopup({url,label:'Site - '+(partner.sites?.name||'Site')})}><img src={url} alt="" loading="lazy"/><div className="ptz">expand</div></div>)}</div></div>}
            </div>
          </section>
        )}
        {hasGPS&&(
          <section style={{background:'var(--cream)',padding:'3rem 0 0'}}>
            <div className="mh">
              <div style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'white'}}>Live Plantation Site - GPS verified</div>
              <div className="st">
                <button className={'sb'+(mapStyle==='light'?' a':'')} onClick={()=>setMapStyle('light')}>Street</button>
                <button className={'sb'+(mapStyle==='satellite'?' a':'')} onClick={()=>setMapStyle('satellite')}>Satellite</button>
              </div>
            </div>
            <div style={{height:'420px',maxWidth:'1200px',margin:'0 auto',overflow:'hidden'}}>
              <Map mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} initialViewState={{longitude:partner.longitude!,latitude:partner.latitude!,zoom:16}} style={{width:'100%',height:'100%'}} mapStyle={MAP_STYLES[mapStyle]}>
                <NavigationControl position="bottom-right"/>
                <Marker longitude={partner.longitude!} latitude={partner.latitude!} anchor="bottom">
                  <div style={{width:40,height:40,background:'#2C5F2D',borderRadius:'50% 50% 50% 0',transform:'rotate(-45deg)',border:'3px solid white',boxShadow:'0 3px 12px rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{transform:'rotate(45deg)',fontSize:18}}>🌳</span>
                  </div>
                </Marker>
              </Map>
            </div>
            <div className="ms"><span className="ld"/>GPS: {partner.latitude?.toFixed(6)}N, {partner.longitude?.toFixed(6)}E - {partner.sites?.name||'Site'} - {partner.sites?.city||'Bangalore'}</div>
          </section>
        )}
        <section className="cs" style={{background:'white'}}>
          <div className="ci">
            <p className="ce">Impact Report</p>
            <h2 className="ch2">BRSR and ESG documentation</h2>
            <p style={{fontSize:'.95rem',color:'#6B7280',marginBottom:'1.5rem'}}>Download your impact certificate for annual reports and board presentations.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'16px',padding:'1.5rem'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>📊</div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#1A3C34',marginBottom:'.5rem'}}>BRSR Report</div>
                <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>Trees: <strong>{partner.trees_planted}</strong><br/>CO2/yr: <strong>{co2} kg</strong><br/>Survival: <strong>{partner.trees_verified?Math.round((partner.trees_verified/(partner.trees_planted||1))*100):0}%</strong></div>
                <span style={{background:'#1A3C34',color:'#97BC62',fontSize:'11px',fontWeight:700,padding:'4px 10px',borderRadius:'20px'}}>BRSR Compatible</span>
              </div>
              <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'16px',padding:'1.5rem'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>🌍</div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#1e40af',marginBottom:'.5rem'}}>CO2 Certificate</div>
                <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>Offset: <strong>{co2} kg/year</strong><br/>Equiv: <strong>{Math.round(co2/0.21)} km</strong> driving<br/>Standard: <strong>ISFR</strong></div>
                <button onClick={downloadCertificate} style={{background:'#1e40af',color:'white',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:600,cursor:'pointer',width:'100%',fontFamily:'inherit'}}>Download PDF</button>
              </div>
              <div style={{background:'#fef9c3',border:'1px solid #fde68a',borderRadius:'16px',padding:'1.5rem'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'.75rem'}}>🧾</div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#92400e',marginBottom:'.5rem'}}>80G Tax Benefit</div>
                <div style={{fontSize:'13px',color:'#374151',lineHeight:1.6,marginBottom:'1rem'}}>EcoTree is a Section 8 NGO with 80G approval. Your donation qualifies for tax deduction.</div>
                <a href="mailto:hello@ecotrees.org?subject=80G Receipt Request" style={{display:'block',background:'#92400e',color:'white',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:600,textAlign:'center',textDecoration:'none'}}>Request 80G Receipt</a>
              </div>
            </div>
          </div>
        </section>
        <section style={{background:'#1A3C34',padding:'3rem 1.5rem'}}>
          <div className="ci" style={{textAlign:'center'}}>
            <p style={{fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--moss)',marginBottom:'.75rem'}}>Expand your impact</p>
            <h2 style={{fontFamily:'Fraunces,Georgia,serif',fontSize:'clamp(1.3rem,2.5vw,1.8rem)',fontWeight:700,color:'white',marginBottom:'.75rem'}}>Take on a new CSR project</h2>
            <p style={{fontSize:'.9rem',color:'rgba(255,255,255,.6)',maxWidth:'480px',margin:'0 auto 1.5rem'}}>Contact EcoTree for a custom proposal across any of our sustainability initiatives.</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.6rem',justifyContent:'center',marginBottom:'1.5rem'}}>
              {PROJECTS.map(p=><span key={p} className="pc">{p}</span>)}
            </div>
            <a href="/csr-ngo" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:'var(--moss)',color:'#1A3C34',fontWeight:700,fontSize:'.95rem',padding:'.875rem 2rem',borderRadius:'999px',textDecoration:'none'}}>Contact EcoTree for new project</a>
          </div>
        </section>
        <section className="cs" style={{background:'var(--cream)'}}>
          <div className="ci">
            <p className="ce">Share your impact</p>
            <h2 className="ch2">Tell the world about your CSR</h2>
            <div style={{background:'linear-gradient(135deg,#1B4332,#2C5F2D,#40916C)',borderRadius:'20px',padding:'2rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1.5rem',flexWrap:'wrap'}}>
              <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'14px',padding:'1.25rem 1.5rem',flex:1,minWidth:'220px'}}>
                <div style={{fontSize:'.9rem',color:'white',lineHeight:1.7,fontWeight:500}}>{partner.company_name} planted {partner.trees_planted} trees with EcoTree! {co2} kg CO2 offset - GPS verified - BRSR ready - ecotrees.org/csr-ngo</div>
                <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',marginTop:'.5rem'}}>#CSR #ESG #BRSR #Sustainability #EcoTree</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem',minWidth:'180px'}}>
                <button onClick={shareWA} className="sbn" style={{background:'#25D366',color:'white',justifyContent:'center'}}>WhatsApp</button>
                <button onClick={shareLI} className="sbn" style={{background:'#0A66C2',color:'white',justifyContent:'center'}}>LinkedIn</button>
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
            <button onClick={()=>setPhotoPopup(null)} style={{position:'absolute',top:'-12px',right:'-12px',width:'28px',height:'28px',borderRadius:'50%',background:'#dc2626',border:'none',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:700}}>X</button>
          </div>
          <div style={{background:'rgba(255,255,255,.1)',borderRadius:'12px',padding:'10px 16px',color:'white',fontSize:'12px',textAlign:'center'}}>{photoPopup.label}</div>
        </div>
      )}
    </>
  )
}
