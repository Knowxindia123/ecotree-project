'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── CONSTANTS (unchanged from original) ───
const WHATSAPP = '919886094611'
const SITE_URL  = 'https://ecotrees.org/donate'
const WA_MSG    = encodeURIComponent(`India's only NGO where you can see your tree growing live.\nPlant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit\n${SITE_URL}`)

const TIERS = [
  { id:'community_100',  tier:'100',  icon:'🌿', name:'Community Contributor', price:100,  co2:'~5kg',   water:'~200L',   desc:'Join our community forest. Certificate in your name.',       img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', species:null, occasionIds:[], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'community_250',  tier:'250',  icon:'🌱', name:'Community Supporter',   price:250,  co2:'~5kg',   water:'~200L',   desc:'Support our community forest with greater impact.',           img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', species:null, occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'joint_500',      tier:'500',  icon:'🤝', name:'Joint Tree Donor',      price:500,  co2:'~11kg',  water:'~500L',   desc:'Pool with 1 other donor — together you plant 1 real tree.', img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80', species:null, occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/my-tree',              badge:'JOINT',     badgeColor:'#F59E0B' },
  { id:'individual_1000',tier:'1000', icon:'🌳', name:'Individual Tree',       price:1000, co2:'~22kg',  water:'~1,000L', desc:'Your own tree. Full dashboard. GPS tracked for 3 years.',    img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', species:['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar'], occasionIds:['birthday','anniversary','memory','festival','baby','corporate','custom'], dashboard:'/my-tree', badge:'INDIVIDUAL', badgeColor:'#1B4332' },
  { id:'miyawaki_5000',  tier:'5000', icon:'🏙️', name:'Miyawaki Forest',       price:5000, co2:'~200kg', water:'~8,000L', desc:'30+ native species. Dense urban forest. 10× faster growth.',  img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80', species:null, occasionIds:['corporate','custom'], dashboard:'/miyawaki-dashboard', badge:'FOREST', badgeColor:'#7C3AED' },
]

const OCCASIONS = [
  { id:'birthday',    icon:'🎂', label:'Birthday',    price:100 },
  { id:'anniversary', icon:'💍', label:'Anniversary', price:250 },
  { id:'memory',      icon:'🕯️', label:'In Memory',   price:100 },
  { id:'festival',    icon:'🎊', label:'Festival',     price:100 },
  { id:'baby',        icon:'👶', label:'New Baby',     price:250 },
  { id:'corporate',   icon:'🏢', label:'Corporate',   price:500 },
  { id:'custom',      icon:'🎁', label:'Custom',       price:100 },
]

// 12 species with emotional content
const SPECIES_DATA = [
  { id:'banyan',    name:'Banyan',           title:'The Tree of Generations', story:'Massive canopy. Deep roots. A living shelter for generations and wildlife alike.',                        benefits:['Highway shade','Wildlife support','Long lifespan'],    img:'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80' },
  { id:'neem',      name:'Neem',             title:'The Healing Tree',         story:"Nature's pharmacy. Purifies air, enriches soil and supports life around it.",                           benefits:['Air purification','Medicinal value','Pest resistance'], img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80' },
  { id:'raintree',  name:'Rain Tree',        title:'The Giant Canopy',         story:'Creates extraordinary cooling shade across entire streets and communities.',                              benefits:['Massive shade','Fast growth','Urban cooling'],           img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { id:'honge',     name:'Honge',            title:'The Resilient Native',     story:'Exceptionally tough and adaptive. Thrives where others struggle.',                                       benefits:['Drought resistant','Soil enrichment','Native species'],  img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&q=80' },
  { id:'ashoka',    name:'Ashoka',           title:'The Graceful Sentinel',    story:'Tall, narrow and elegant. A natural screen of living green year-round.',                                 benefits:['Road beautification','Narrow footprint','Air cleaner'], img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80' },
  { id:'gulmohar',  name:'Gulmohar',         title:'The Flame of Nature',      story:'Transforms the landscape with spectacular red-orange blooms every summer.',                              benefits:['Seasonal beauty','Roadside appeal','Shade canopy'],      img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80' },
  { id:'jamun',     name:'Jamun',            title:'The Community Tree',       story:'Pollution-resistant with edible black plum fruits loved by birds and people.',                           benefits:['Pollution resistant','Edible fruits','Wildlife food'],   img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
  { id:'amaltas',   name:'Amaltas',          title:'The Golden Shower',        story:'Brilliant yellow blooms cascade every April — a spectacular urban spectacle.',                           benefits:['Golden blooms','Ornamental beauty','Shade support'],     img:'https://images.unsplash.com/photo-1490750967868-88df5691cc9f?w=600&q=80' },
  { id:'arjun',     name:'Arjun',            title:'The Fast Grower',          story:"One of India's fastest-growing shade trees with powerful medicinal bark.",                               benefits:['Fast growth','Medicinal bark','Dense shade'],            img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80' },
  { id:'imli',      name:'Imli',             title:'The Ancient Root',         story:'Deep, strong roots that have anchored Indian villages for centuries.',                                    benefits:['Deep roots','Edible fruit','Erosion control'],           img:'https://images.unsplash.com/photo-1511497584788-876760111969?w=600&q=80' },
  { id:'mahogany',  name:'Mahogany',         title:'The Wind Warrior',         story:'Straight trunk, dense canopy, remarkably wind-resistant in urban environments.',                         benefits:['Wind resistant','Straight form','Carbon capture'],       img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { id:'atti',      name:'Atti (Cluster Fig)',title:'The Wildlife Magnet',     story:'A small tree with massive ecological impact — attracts birds, bees and butterflies.',                    benefits:['Wildlife habitat','Attracts pollinators','Native eco'],  img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&q=80' },
]

// ─── TIER CONFIG for display ───
const TIER_STORY: Record<string, { headline: string; story: string; features: string[]; impactBand: {icon:string;val:string;lbl:string}[] }> = {
  community: {
    headline: "You're part of something bigger",
    story: "Every rupee plants a real tree in Bangalore's urban forest. You get a certificate in your name, dashboard access and monthly updates on the forest you helped grow.",
    features: ['Community forest certificate','Impact dashboard access','Project participation invites','Monthly progress updates'],
    impactBand: [{icon:'🌳',val:'Forest',lbl:'Community'},{icon:'🌍',val:'~5kg',lbl:'CO₂/year'},{icon:'📜',val:'Instant',lbl:'Certificate'}],
  },
  joint: {
    headline: 'Two donors. One living tree.',
    story: 'Pool ₹500 with one other donor — together you plant and track a real GPS-tagged tree. Both donors receive shared dashboard access, growth photos and a certificate.',
    features: ['Shared tree certificate','GPS tracked tree','Shared dashboard access','Before & after photos','Growth photo updates'],
    impactBand: [{icon:'🌍',val:'~11kg',lbl:'CO₂/year'},{icon:'📍',val:'GPS',lbl:'Tracked'},{icon:'💧',val:'~500L',lbl:'Water/year'}],
  },
  miyawaki: {
    headline: 'Create an entire ecosystem.',
    story: '30+ native species planted in a dense Miyawaki forest patch — 10× faster growth than conventional planting. Creates a self-sustaining urban ecosystem with measurable biodiversity impact.',
    features: ['Forest impact certificate','Miyawaki forest dashboard','GPS forest location','Species diversity report','BRSR-compatible report','80G tax receipt'],
    impactBand: [{icon:'🌍',val:'~200kg',lbl:'CO₂/year'},{icon:'🌿',val:'30+',lbl:'Species'},{icon:'⚡',val:'10×',lbl:'Faster'}],
  },
}

export default function DonatePage() {
  const router = useRouter()
  const tierPillsRef = useRef<HTMLDivElement>(null)
  const detailRef    = useRef<HTMLDivElement>(null)

  const [mode,       setMode]       = useState<'plant'|'gift'>('plant')
  const [tier,       setTier]       = useState(TIERS[3])
  const [occ,        setOcc]        = useState(OCCASIONS[0])
  const [species,    setSpecies]    = useState('')
  const [selSpIdx,   setSelSpIdx]   = useState(0)
  const [qty,        setQty]        = useState(1)
  const [copied,     setCopied]     = useState(false)
  const [commLevel,  setCommLevel]  = useState<100|250>(100)
  const [carouselIdx,setCarouselIdx]= useState(0)
  const [spErr,      setSpErr]      = useState(false)
  const PER = 4  // species cards per view

  // Restore selection from sessionStorage on back-navigation
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ecotree_selection')
      if (!saved) return
      const s = JSON.parse(saved)
      const foundTier = TIERS.find(t => t.id === s.tierId)
      if (foundTier) {
        setTier(foundTier)
        if (s.tierId === 'community_100' || s.tierId === 'community_250') setCommLevel(s.tierPrice as 100|250)
      }
      if (s.species) setSpecies(s.species)
      if (s.qty) setQty(s.qty)
      if (s.mode) setMode(s.mode)
      if (s.occId) { const foundOcc = OCCASIONS.find(o => o.id === s.occId); if (foundOcc) setOcc(foundOcc) }
      if (s.tierId === 'individual_1000' && s.species) { const spIdx = SPECIES_DATA.findIndex(sp => sp.name === s.species); if (spIdx >= 0) setSelSpIdx(spIdx) }
    } catch {}
  }, [])

  const isComm = tier.id === 'community_100' || tier.id === 'community_250'
  const effectivePrice = isComm ? commLevel : tier.price
  const total = mode === 'gift' ? occ.price : effectivePrice * qty

  const pickTier = (t: typeof TIERS[0]) => {
    setTier(t); setSpecies(''); setQty(1); setSpErr(false)
    if (t.occasionIds.length > 0) setOcc(OCCASIONS.find(o => t.occasionIds.includes(o.id)) || OCCASIONS[0])
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  const copyLink = () => { navigator.clipboard.writeText(SITE_URL); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const handleContinue = () => {
    // Validate species for ₹1,000
    if (tier.id === 'individual_1000' && !species) { setSpErr(true); return }
    setSpErr(false)
    // Save selection to sessionStorage — checkout page reads this
    sessionStorage.setItem('ecotree_selection', JSON.stringify({
      tierId: tier.id, tierName: tier.name, tierBadge: tier.badge, badgeColor: tier.badgeColor,
      tierIcon: tier.icon, tierImg: tier.img, tierPrice: effectivePrice,
      tierCo2: tier.co2, tierWater: tier.water, tierDashboard: tier.dashboard,
      species, speciesTitle: tier.id==='individual_1000' ? SPECIES_DATA[selSpIdx].title : '',
      speciesImg: tier.id==='individual_1000' ? SPECIES_DATA[selSpIdx].img : tier.img,
      qty, mode,
      occId:    occ.id,    occIcon: occ.icon, occLabel: occ.label, occPrice: occ.price,
      total,
    }))
    router.push('/donate/checkout')
  }

  const selSp = SPECIES_DATA[selSpIdx]

  const C = {
    sectionLbl: { fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.11em', color:'#4A6358', marginBottom:'0.5rem', display:'block' as const },
    metaTag:    { fontSize:'0.65rem', background:'#D8F3DC', color:'#1B4332', padding:'0.15rem 0.5rem', borderRadius:'999px', fontWeight:600 as const },
    benefit:    { display:'flex', alignItems:'flex-start' as const, gap:'0.35rem', fontSize:'0.78rem', color:'#2D6A4F', fontWeight:500 as const, marginBottom:'0.3rem' },
    featureChk: { color:'#52B788', fontWeight:800 as const, flexShrink:0 as const },
    qtyBtn:     { width:'28px', height:'28px', borderRadius:'50%', border:'1.5px solid #B7E4C7', background:'#fff', fontSize:'1rem', cursor:'pointer', color:'#1B4332', fontFamily:'inherit', lineHeight:1 as const, display:'flex', alignItems:'center', justifyContent:'center' },
  }

  return (
    <main style={{fontFamily:"var(--font-body,'Segoe UI',system-ui,sans-serif)",background:'#F4F7F4',color:'#0D1F17',minHeight:'100vh'}}>

      {/* ── TRUST BAR ── */}
      <div style={{background:'#1B4332',borderBottom:'1px solid rgba(82,183,136,0.18)',padding:'0.42rem 0',position:'sticky',top:'80px',zIndex:60}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap' as const}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap' as const,fontSize:'0.68rem',fontWeight:600,color:'rgba(255,255,255,0.58)'}}>
            <span>🌱 10,000+ trees</span><span style={{opacity:0.35}}>·</span>
            <span>🎯 91% survival</span><span style={{opacity:0.35}}>·</span>
            <span>🤖 AI-verified</span><span style={{opacity:0.35}}>·</span>
            <span>🧾 80G approved</span><span style={{opacity:0.35}}>·</span>
            <span>📍 GPS-tagged</span>
          </div>
          <div style={{display:'flex',gap:'0.38rem'}}>
            <a href={`https://wa.me/?text=${WA_MSG}`} target="_blank" rel="noopener" style={{display:'inline-flex',alignItems:'center',gap:'0.28rem',fontSize:'0.68rem',fontWeight:700,padding:'0.26rem 0.7rem',borderRadius:'999px',background:'#25D366',color:'#fff',textDecoration:'none'}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share
            </a>
            <button onClick={copyLink} style={{fontSize:'0.68rem',fontWeight:700,padding:'0.26rem 0.7rem',borderRadius:'999px',background:'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,255,255,0.18)',cursor:'pointer'}}>{copied?'✓ Copied!':'🔗 Copy'}</button>
          </div>
        </div>
      </div>

      {/* ── HERO — not sticky ── */}
      <div style={{background:'#1B4332',padding:'1.5rem 0 1.35rem',position:'relative',overflow:'hidden',borderBottom:'2px solid rgba(82,183,136,0.2)'}}>
        <svg viewBox="0 0 240 300" fill="none" style={{position:'absolute',right:0,bottom:0,height:'100%',width:'auto',opacity:0.05,pointerEvents:'none'}} aria-hidden="true">
          <path d="M120 290L120 130" stroke="white" strokeWidth="10" strokeLinecap="round"/>
          <path d="M120 130L88 185L62 158L96 113L72 137L45 94L87 68L63 94L76 40L120 14L164 40L177 94L153 68L195 94L168 137L204 113L144 158L152 185Z" fill="white"/>
        </svg>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',position:'relative',zIndex:1}}>
          <div style={{fontSize:'0.62rem',fontWeight:700,color:'#74C69D',letterSpacing:'0.1em',textTransform:'uppercase' as const,marginBottom:'0.4rem'}}>India's only NGO where you can see your tree growing live</div>
          <h1 style={{fontSize:'clamp(1.6rem,3vw,2.5rem)',fontWeight:900,color:'#fff',lineHeight:0.95,letterSpacing:'-0.03em',marginBottom:'0.45rem'}}>Plant a <span style={{color:'#74C69D'}}>Living Legacy</span></h1>
          <p style={{fontSize:'0.73rem',color:'rgba(255,255,255,0.48)',letterSpacing:'0.03em'}}>AI-verified · GPS-tagged · 3yr tracking · 80G tax benefit</p>
        </div>
      </div>

      {/* ── STICKY TIER PILLS + MODE TOGGLE ── */}
      <div ref={tierPillsRef} style={{background:'#1B4332',borderBottom:'3px solid rgba(82,183,136,0.28)',padding:'0.7rem 0',position:'sticky',top:'calc(80px + 30px)',zIndex:55}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap' as const}}>
          {/* Mode toggle */}
          <div style={{display:'flex',gap:'0.4rem',flexShrink:0}}>
            <button onClick={()=>setMode('plant')} style={{padding:'0.38rem 0.95rem',borderRadius:'999px',fontFamily:'inherit',fontSize:'0.78rem',fontWeight:700,cursor:'pointer',border:`1.5px solid ${mode==='plant'?'#52B788':'rgba(255,255,255,0.2)'}`,background:mode==='plant'?'#2D6A4F':'transparent',color:mode==='plant'?'#fff':'rgba(255,255,255,0.6)',transition:'all 0.15s',whiteSpace:'nowrap' as const}}>🌱 Plant</button>
            <button onClick={()=>setMode('gift')} style={{padding:'0.38rem 0.95rem',borderRadius:'999px',fontFamily:'inherit',fontSize:'0.78rem',fontWeight:700,cursor:'pointer',border:`1.5px solid ${mode==='gift'?'#7C3AED':'rgba(255,255,255,0.2)'}`,background:mode==='gift'?'#7C3AED':'transparent',color:'#fff',transition:'all 0.15s',whiteSpace:'nowrap' as const}}>🎁 Gift</button>
          </div>
          {/* Tier pills */}
          <div style={{display:'flex',gap:'0.45rem',flexWrap:'wrap' as const}}>
            {/* Community */}
            <button onClick={()=>pickTier(TIERS[0])} style={{padding:'0.38rem 0.85rem',borderRadius:'8px',border:`1.5px solid ${isComm?'#fff':'rgba(255,255,255,0.22)'}`,background:isComm?'#fff':'rgba(255,255,255,0.07)',color:isComm?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'0.75rem',fontWeight:700,transition:'all 0.15s',whiteSpace:'nowrap' as const}}>
              ₹100/₹250 Community
            </button>
            {/* Joint */}
            <button onClick={()=>pickTier(TIERS[2])} style={{padding:'0.38rem 0.85rem',borderRadius:'8px',border:`1.5px solid ${tier.id==='joint_500'?'#fff':'rgba(255,255,255,0.22)'}`,background:tier.id==='joint_500'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='joint_500'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'0.75rem',fontWeight:700,transition:'all 0.15s',whiteSpace:'nowrap' as const}}>
              ₹500 Shared Tree
            </button>
            {/* Individual */}
            <button onClick={()=>pickTier(TIERS[3])} style={{padding:'0.38rem 0.85rem',borderRadius:'8px',border:`1.5px solid ${tier.id==='individual_1000'?'#fff':'rgba(255,255,255,0.22)'}`,background:tier.id==='individual_1000'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='individual_1000'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'0.75rem',fontWeight:700,transition:'all 0.15s',whiteSpace:'nowrap' as const}}>
              <span style={{fontSize:'0.58rem',color:tier.id==='individual_1000'?'#D4A63F':'#D4A63F',marginRight:'0.25rem'}}>★</span>₹1,000 Individual
            </button>
            {/* Miyawaki */}
            <button onClick={()=>pickTier(TIERS[4])} style={{padding:'0.38rem 0.85rem',borderRadius:'8px',border:`1.5px solid ${tier.id==='miyawaki_5000'?'#fff':'rgba(255,255,255,0.22)'}`,background:tier.id==='miyawaki_5000'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='miyawaki_5000'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:'0.75rem',fontWeight:700,transition:'all 0.15s',whiteSpace:'nowrap' as const}}>
              ₹5,000 Miyawaki
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'1.5rem 1.5rem 4rem'}}>

        {mode === 'plant' ? (
          <div ref={detailRef}>

            {/* ══ ₹1,000 INDIVIDUAL ══ */}
            {tier.id === 'individual_1000' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}}>

                {/* LEFT — species carousel + selected image */}
                <div>
                  {/* SPECIES CAROUSEL */}
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'14px',padding:'1rem',marginBottom:'1rem'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.7rem'}}>
                      <div>
                        <span style={C.sectionLbl}>Choose your tree species *</span>
                        {spErr && <span style={{fontSize:'0.72rem',color:'#dc2626',marginLeft:'0.5rem'}}>⚠️ Please select a species</span>}
                      </div>
                      <div style={{display:'flex',gap:'0.35rem'}}>
                        <button onClick={()=>setCarouselIdx(i=>Math.max(0,i-1))} disabled={carouselIdx===0} style={{...C.qtyBtn,opacity:carouselIdx===0?0.3:1,cursor:carouselIdx===0?'not-allowed':'pointer'}}>‹</button>
                        <button onClick={()=>setCarouselIdx(i=>Math.min(SPECIES_DATA.length-PER,i+1))} disabled={carouselIdx>=SPECIES_DATA.length-PER} style={{...C.qtyBtn,opacity:carouselIdx>=SPECIES_DATA.length-PER?0.3:1,cursor:carouselIdx>=SPECIES_DATA.length-PER?'not-allowed':'pointer'}}>›</button>
                      </div>
                    </div>
                    {/* 4-up carousel */}
                    <div style={{overflow:'hidden'}}>
                      <div style={{display:'flex',gap:'0.5rem',transition:'transform 0.3s ease',transform:`translateX(calc(-${carouselIdx*(100/PER)}% - ${carouselIdx*0.5/PER}rem))`}}>
                        {SPECIES_DATA.map((sp,idx)=>(
                          <div key={sp.id} onClick={()=>{setSelSpIdx(idx);setSpecies(sp.name);setSpErr(false)}} style={{flex:`0 0 calc(${100/PER}% - 0.38rem)`,borderRadius:'10px',border:`2px solid ${selSpIdx===idx?'#D4A63F':'#e2ddd5'}`,overflow:'hidden',cursor:'pointer',transition:'all 0.15s',background:'#fff',boxShadow:selSpIdx===idx?'0 3px 12px rgba(212,166,63,0.2)':'none'}}>
                            <div style={{height:'65px',overflow:'hidden',position:'relative'}}>
                              <img src={sp.img} alt={sp.name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
                              {selSpIdx===idx&&<div style={{position:'absolute',top:'4px',right:'4px',width:'16px',height:'16px',borderRadius:'50%',background:'#D4A63F',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#1B4332',fontWeight:800}}>✓</div>}
                            </div>
                            <div style={{padding:'0.38rem 0.45rem'}}>
                              <div style={{fontSize:'0.7rem',fontWeight:700,color:selSpIdx===idx?'#1B4332':'#444',lineHeight:1.2}}>{sp.name}</div>
                              <div style={{fontSize:'0.6rem',color:'#888',marginTop:'0.1rem'}}>{sp.benefits[0]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Dots */}
                    <div style={{display:'flex',justifyContent:'center',gap:'3px',marginTop:'0.5rem'}}>
                      {Array.from({length:SPECIES_DATA.length-PER+1}).map((_,i)=>(
                        <div key={i} onClick={()=>setCarouselIdx(i)} style={{width:i===carouselIdx?'12px':'4px',height:'4px',borderRadius:'2px',background:i===carouselIdx?'#1B4332':'#ccc',cursor:'pointer',transition:'all 0.2s'}}/>
                      ))}
                    </div>
                  </div>

                  {/* SELECTED TREE IMAGE — Amazon left style */}
                  <div style={{borderRadius:'14px',overflow:'hidden',position:'relative',height:'220px'}}>
                    <img key={selSp.id} src={selSp.img} alt={selSp.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'opacity 0.3s'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(11,31,23,0.82) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',bottom:0,left:0,padding:'1rem 1.2rem'}}>
                      <div style={{fontSize:'0.55rem',fontWeight:800,color:'rgba(255,255,255,0.55)',letterSpacing:'0.1em',textTransform:'uppercase' as const,marginBottom:'0.2rem'}}>YOUR SELECTED TREE</div>
                      <div style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',lineHeight:1}}>{selSp.name}</div>
                      <div style={{fontSize:'0.78rem',color:'#74C69D',fontStyle:'italic',marginTop:'0.15rem'}}>{selSp.title}</div>
                    </div>
                  </div>

                  {/* IMPACT BAND below image */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginTop:'0.65rem'}}>
                    {[{icon:'🌍',val:'~22kg',lbl:'CO₂/year'},{icon:'💧',val:'~1,000L',lbl:'Water/year'},{icon:'📍',val:'GPS',lbl:'3yr tracked'}].map(m=>(
                      <div key={m.lbl} style={{background:'#f0faf4',border:'1px solid #B7E4C7',borderRadius:'9px',padding:'0.6rem 0.7rem'}}>
                        <div style={{fontSize:'0.85rem',marginBottom:'0.2rem'}}>{m.icon}</div>
                        <div style={{fontSize:'0.9rem',fontWeight:900,color:'#1B4332',lineHeight:1}}>{m.val}</div>
                        <div style={{fontSize:'0.6rem',color:'#4A6358',marginTop:'0.15rem'}}>{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — story + benefits + metadata + qty + CTA */}
                <div>
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.85rem'}}>
                    <div style={{fontSize:'0.58rem',fontWeight:800,display:'inline-block',background:'#1B4332',color:'#D4A63F',padding:'0.15rem 0.55rem',borderRadius:'4px',letterSpacing:'0.07em',marginBottom:'0.6rem'}}>INDIVIDUAL TREE</div>
                    <h2 style={{fontSize:'1.4rem',fontWeight:900,color:'#1B4332',lineHeight:1.1,marginBottom:'0.3rem'}}>{selSp.name}</h2>
                    <div style={{fontSize:'0.88rem',color:'#52B788',fontStyle:'italic',fontWeight:600,marginBottom:'0.75rem'}}>{selSp.title}</div>
                    <p style={{fontSize:'0.84rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem'}}>{selSp.story}</p>
                    <div style={{marginBottom:'0.85rem'}}>
                      <span style={C.sectionLbl}>Why this tree</span>
                      {selSp.benefits.map(b=>(
                        <div key={b} style={C.benefit}><span style={C.featureChk}>✓</span><span>{b}</span></div>
                      ))}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap' as const,gap:'0.3rem',marginBottom:'0.85rem'}}>
                      {['📍 GPS tracked','🌱 Native species','🛡 3-year care','📱 Personal dashboard','🧾 80G receipt','🤖 AI-verified','📜 Certificate'].map(m=><span key={m} style={C.metaTag}>{m}</span>)}
                    </div>
                  </div>

                  {/* DASHBOARD HINT */}
                  <div style={{fontSize:'0.75rem',color:'#4A6358',background:'rgba(82,183,136,0.07)',border:'1px solid #B7E4C7',borderLeft:'3px solid #52B788',borderRadius:'8px',padding:'0.55rem 0.8rem',marginBottom:'0.85rem',lineHeight:1.5}}>
                    📊 After planting, your dashboard shows real-time GPS, growth photos and AI health scores — updated monthly for 3 years.
                  </div>

                  {/* QUANTITY */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff',border:'1.5px solid #B7E4C7',borderRadius:'10px',padding:'0.75rem 0.95rem',marginBottom:'0.85rem'}}>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:700,color:'#1B2E25'}}>Number of trees</div>
                      <div style={{fontSize:'0.68rem',color:'#4A6358',marginTop:'0.1rem'}}>Each gets unique GPS tracking</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                      <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={C.qtyBtn}>−</button>
                      <span style={{fontSize:'1rem',fontWeight:900,color:'#1B4332',minWidth:'20px',textAlign:'center' as const}}>{qty}</span>
                      <button onClick={()=>setQty(q=>Math.min(100,q+1))} style={C.qtyBtn}>+</button>
                    </div>
                  </div>

                  {/* PRICE + CTA */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.6rem'}}>
                    <div>
                      <div style={{fontSize:'0.68rem',color:'#4A6358'}}>Total</div>
                      <div style={{fontSize:'1.5rem',fontWeight:900,color:'#1B4332'}}>₹{(1000*qty).toLocaleString('en-IN')}</div>
                    </div>
                    <button onClick={handleContinue} style={{padding:'0.85rem 1.5rem',background:'#1B4332',color:'#D4A63F',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px rgba(27,67,50,0.3)',transition:'all 0.2s',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      🌱 Adopt This Living Tree →
                    </button>
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#4A6358',textAlign:'center' as const}}>Next: Add your details &amp; complete payment</div>
                </div>
              </div>
            )}

            {/* ══ COMMUNITY ₹100/₹250 ══ */}
            {isComm && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}} ref={detailRef}>
                {/* LEFT — image + impact */}
                <div>
                  <div style={{borderRadius:'14px',overflow:'hidden',position:'relative',height:'220px',marginBottom:'0.65rem'}}>
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" alt="Community Forest" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(11,31,23,0.82) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',bottom:0,left:0,padding:'1rem 1.2rem'}}>
                      <div style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',lineHeight:1}}>Community Forest</div>
                      <div style={{fontSize:'0.78rem',color:'#74C69D',fontStyle:'italic',marginTop:'0.15rem'}}>You're part of something bigger</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                    {TIER_STORY.community.impactBand.map(m=>(
                      <div key={m.lbl} style={{background:'#f0faf4',border:'1px solid #B7E4C7',borderRadius:'9px',padding:'0.6rem 0.7rem'}}>
                        <div style={{fontSize:'0.85rem',marginBottom:'0.2rem'}}>{m.icon}</div>
                        <div style={{fontSize:'0.9rem',fontWeight:900,color:'#1B4332',lineHeight:1}}>{m.val}</div>
                        <div style={{fontSize:'0.6rem',color:'#4A6358',marginTop:'0.15rem'}}>{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* RIGHT — story + toggle + features + CTA */}
                <div>
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.85rem'}}>
                    <div style={{fontSize:'0.58rem',fontWeight:800,display:'inline-block',background:'#52B788',color:'#fff',padding:'0.15rem 0.55rem',borderRadius:'4px',letterSpacing:'0.07em',marginBottom:'0.6rem'}}>COMMUNITY</div>
                    <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'#1B4332',lineHeight:1.1,marginBottom:'0.35rem'}}>Community Forest</h2>
                    <p style={{fontSize:'0.83rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem'}}>{TIER_STORY.community.story}</p>
                    {/* ₹100/₹250 toggle */}
                    <div style={{marginBottom:'0.85rem'}}>
                      <span style={C.sectionLbl}>Choose your level</span>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                        {([100,250] as const).map(amt=>(
                          <button key={amt} onClick={()=>{setCommLevel(amt);setTier(amt===100?TIERS[0]:TIERS[1])}} style={{padding:'0.7rem 0.8rem',borderRadius:'10px',border:`2px solid ${commLevel===amt?'#1B4332':'#B7E4C7'}`,background:commLevel===amt?'#1B4332':'#fff',color:commLevel===amt?'#fff':'#1B4332',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,transition:'all 0.15s'}}>
                            <div style={{fontSize:'0.9rem',fontWeight:900,lineHeight:1,marginBottom:'0.15rem'}}>₹{amt}</div>
                            <div style={{fontSize:'0.65rem',fontWeight:600,opacity:0.8}}>{amt===100?'Contributor · Certificate':'Supporter · Priority updates'}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {TIER_STORY.community.features.map(f=>(
                      <div key={f} style={C.benefit}><span style={C.featureChk}>✓</span><span>{f}</span></div>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <div>
                      <div style={{fontSize:'0.68rem',color:'#4A6358'}}>Total</div>
                      <div style={{fontSize:'1.5rem',fontWeight:900,color:'#1B4332'}}>₹{(commLevel*qty).toLocaleString('en-IN')}</div>
                    </div>
                    <button onClick={handleContinue} style={{padding:'0.85rem 1.5rem',background:'#1B4332',color:'#D4A63F',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px rgba(27,67,50,0.3)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      🌿 Join Community Forest →
                    </button>
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#4A6358',textAlign:'center' as const}}>Next: Add your details &amp; complete payment</div>
                </div>
              </div>
            )}

            {/* ══ ₹500 JOINT ══ */}
            {tier.id === 'joint_500' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}} ref={detailRef}>
                <div>
                  <div style={{borderRadius:'14px',overflow:'hidden',position:'relative',height:'220px',marginBottom:'0.65rem'}}>
                    <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80" alt="Joint Tree" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(11,31,23,0.82) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',bottom:0,left:0,padding:'1rem 1.2rem'}}>
                      <div style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',lineHeight:1}}>Shared Tree Impact</div>
                      <div style={{fontSize:'0.78rem',color:'#74C69D',fontStyle:'italic',marginTop:'0.15rem'}}>Two donors. One living tree.</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                    {TIER_STORY.joint.impactBand.map(m=>(
                      <div key={m.lbl} style={{background:'#f0faf4',border:'1px solid #B7E4C7',borderRadius:'9px',padding:'0.6rem 0.7rem'}}>
                        <div style={{fontSize:'0.85rem',marginBottom:'0.2rem'}}>{m.icon}</div>
                        <div style={{fontSize:'0.9rem',fontWeight:900,color:'#1B4332',lineHeight:1}}>{m.val}</div>
                        <div style={{fontSize:'0.6rem',color:'#4A6358',marginTop:'0.15rem'}}>{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.85rem'}}>
                    <div style={{fontSize:'0.58rem',fontWeight:800,display:'inline-block',background:'#F59E0B',color:'#fff',padding:'0.15rem 0.55rem',borderRadius:'4px',letterSpacing:'0.07em',marginBottom:'0.6rem'}}>JOINT TREE</div>
                    <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'#1B4332',lineHeight:1.1,marginBottom:'0.35rem'}}>Shared Tree Impact</h2>
                    <p style={{fontSize:'0.83rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem'}}>{TIER_STORY.joint.story}</p>
                    <div style={{fontSize:'0.75rem',color:'#4A6358',background:'#FEF9EC',border:'1px solid #FDE68A',borderLeft:'3px solid #F59E0B',borderRadius:'8px',padding:'0.5rem 0.75rem',marginBottom:'0.85rem'}}>
                      🌿 Native species assigned at planting based on site suitability — chosen by our field ecologists.
                    </div>
                    {TIER_STORY.joint.features.map(f=>(
                      <div key={f} style={C.benefit}><span style={C.featureChk}>✓</span><span>{f}</span></div>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <div>
                      <div style={{fontSize:'0.68rem',color:'#4A6358'}}>Total</div>
                      <div style={{fontSize:'1.5rem',fontWeight:900,color:'#1B4332'}}>₹{(500*qty).toLocaleString('en-IN')}</div>
                    </div>
                    <button onClick={handleContinue} style={{padding:'0.85rem 1.5rem',background:'#1B4332',color:'#D4A63F',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px rgba(27,67,50,0.3)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      🤝 Join Tree Pool →
                    </button>
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#4A6358',textAlign:'center' as const}}>Next: Add your details &amp; complete payment</div>
                </div>
              </div>
            )}

            {/* ══ ₹5,000 MIYAWAKI ══ */}
            {tier.id === 'miyawaki_5000' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',alignItems:'start'}} ref={detailRef}>
                <div>
                  <div style={{borderRadius:'14px',overflow:'hidden',position:'relative',height:'220px',marginBottom:'0.65rem'}}>
                    <img src="https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80" alt="Miyawaki Forest" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(11,31,23,0.82) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',bottom:0,left:0,padding:'1rem 1.2rem'}}>
                      <div style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',lineHeight:1}}>Miyawaki Forest</div>
                      <div style={{fontSize:'0.78rem',color:'#74C69D',fontStyle:'italic',marginTop:'0.15rem'}}>Create an entire ecosystem.</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                    {TIER_STORY.miyawaki.impactBand.map(m=>(
                      <div key={m.lbl} style={{background:'#f0faf4',border:'1px solid #B7E4C7',borderRadius:'9px',padding:'0.6rem 0.7rem'}}>
                        <div style={{fontSize:'0.85rem',marginBottom:'0.2rem'}}>{m.icon}</div>
                        <div style={{fontSize:'0.9rem',fontWeight:900,color:'#1B4332',lineHeight:1}}>{m.val}</div>
                        <div style={{fontSize:'0.6rem',color:'#4A6358',marginTop:'0.15rem'}}>{m.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.85rem'}}>
                    <div style={{fontSize:'0.58rem',fontWeight:800,display:'inline-block',background:'#7C3AED',color:'#fff',padding:'0.15rem 0.55rem',borderRadius:'4px',letterSpacing:'0.07em',marginBottom:'0.6rem'}}>MIYAWAKI FOREST</div>
                    <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'#1B4332',lineHeight:1.1,marginBottom:'0.35rem'}}>Urban Forest Impact</h2>
                    <p style={{fontSize:'0.83rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem'}}>{TIER_STORY.miyawaki.story}</p>
                    {TIER_STORY.miyawaki.features.map(f=>(
                      <div key={f} style={C.benefit}><span style={C.featureChk}>✓</span><span>{f}</span></div>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <div>
                      <div style={{fontSize:'0.68rem',color:'#4A6358'}}>Total</div>
                      <div style={{fontSize:'1.5rem',fontWeight:900,color:'#1B4332'}}>₹{(5000*qty).toLocaleString('en-IN')}</div>
                    </div>
                    <button onClick={handleContinue} style={{padding:'0.85rem 1.5rem',background:'#7C3AED',color:'#fff',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px rgba(124,58,237,0.3)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      🏙️ Create Urban Forest →
                    </button>
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#4A6358',textAlign:'center' as const}}>Next: Add your details &amp; complete payment</div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ══ GIFT MODE ══ */
          <div ref={detailRef}>
            <div style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.11em',color:'#4A6358',marginBottom:'0.85rem'}}>Choose the occasion</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.6rem',marginBottom:'1.5rem',maxWidth:'680px'}}>
              {OCCASIONS.map(o=>(
                <div key={o.id} onClick={()=>setOcc(o)} style={{position:'relative',border:`2px solid ${occ.id===o.id?'#52B788':'#B7E4C7'}`,borderRadius:'12px',padding:'0.85rem 0.4rem',cursor:'pointer',textAlign:'center' as const,background:occ.id===o.id?'#D8F3DC':'#fff',transition:'all 0.18s'}}>
                  <div style={{fontSize:'1.4rem',marginBottom:'0.2rem'}}>{o.icon}</div>
                  <div style={{fontSize:'0.74rem',fontWeight:700,color:'#0D1F17',marginBottom:'0.15rem'}}>{o.label}</div>
                  <div style={{fontSize:'0.78rem',fontWeight:800,color:'#1B4332'}}>₹{o.price}</div>
                  {occ.id===o.id&&<div style={{position:'absolute',top:'0.3rem',right:'0.3rem',width:'15px',height:'15px',background:'#52B788',color:'#fff',borderRadius:'50%',fontSize:'0.58rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'680px'}}>
              <div>
                <div style={{fontSize:'0.68rem',color:'#4A6358'}}>Gift amount</div>
                <div style={{fontSize:'1.5rem',fontWeight:900,color:'#1B4332'}}>₹{occ.price}</div>
              </div>
              <button onClick={handleContinue} style={{padding:'0.85rem 1.5rem',background:'#7C3AED',color:'#fff',border:'none',borderRadius:'12px',fontSize:'0.95rem',fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px rgba(124,58,237,0.3)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                🎁 Continue to Gift Details →
              </button>
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS ── */}
        <div style={{marginTop:'3rem',paddingTop:'2.5rem',borderTop:'1px solid #B7E4C7'}}>
          <div style={{display:'inline-block',fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase' as const,color:'#52B788',background:'rgba(82,183,136,0.1)',padding:'0.25rem 0.8rem',borderRadius:'999px',marginBottom:'1rem'}}>What Happens After You Pay</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:0,flexWrap:'wrap' as const}}>
            {[{icon:'🌱',n:'01',t:'We Plant',d:'Our field team plants your tree at a verified Bangalore site within 7 days.'},{icon:'📍',n:'02',t:'GPS Tagged',d:'A unique GPS coordinate and QR code is assigned to your specific tree.'},{icon:'🤖',n:'03',t:'AI Verified',d:'Claude AI verifies species, location, timestamp and health before it reaches you.'},{icon:'📊',n:'04',t:'Live Dashboard',d:'Track your tree with monthly photos and AI health scores for 3 full years.'}].map((s,i)=>(
              <React.Fragment key={s.n}>
                <div style={{flex:1,minWidth:'110px',textAlign:'center' as const,padding:'1rem 0.6rem',background:'#fff',borderRadius:'12px',border:'1px solid #B7E4C7',margin:'0 0.15rem',boxShadow:'0 1px 6px rgba(27,67,50,0.04)'}}>
                  <div style={{fontSize:'1.7rem',marginBottom:'0.4rem'}}>{s.icon}</div>
                  <div style={{fontSize:'0.58rem',fontWeight:700,color:'#52B788',letterSpacing:'0.1em',textTransform:'uppercase' as const,marginBottom:'0.25rem'}}>{s.n}</div>
                  <div style={{fontSize:'0.82rem',fontWeight:800,color:'#1B4332',marginBottom:'0.25rem'}}>{s.t}</div>
                  <div style={{fontSize:'0.7rem',color:'#4A6358',lineHeight:1.45}}>{s.d}</div>
                </div>
                {i<3&&<div style={{fontSize:'1rem',color:'#52B788',paddingTop:'2.5rem',flexShrink:0,opacity:0.4}}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>

      <style>{`@media(max-width:860px){}`}</style>
    </main>
  )
}
