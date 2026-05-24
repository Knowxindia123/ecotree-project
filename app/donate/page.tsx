'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const WHATSAPP = '919886094611'
const SITE_URL = 'https://ecotrees.org/donate'
const WA_MSG = encodeURIComponent(`India's only NGO where you can see your tree growing live.\nPlant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit\n${SITE_URL}`)

const TIERS = [
  { id:'community_100', tier:'100', icon:'🌿', name:'Community Contributor', price:100, co2:'~5kg', water:'~200L', tag:'❤️ Most Accessible', tagColor:'#52B788', desc:'Join our community forest. Certificate in your name.', what:['Community forest certificate','Impact dashboard access','Project participation invites','Community tree tracking'], img:'/tier-community.webp', fallback:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', species:null, occasionIds:[], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'community_250', tier:'250', icon:'🌱', name:'Community Supporter', price:250, co2:'~5kg', water:'~200L', tag:'🌿 Great Value', tagColor:'#2D6A4F', desc:'Support our community forest with greater impact.', what:['Community forest certificate','Impact dashboard access','Priority project invites','Community tree tracking'], img:'/tier-community.webp', fallback:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', species:null, occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'joint_500', tier:'500', icon:'🤝', name:'Joint Tree Donor', price:500, co2:'~11kg', water:'~500L', tag:'👥 Share a Tree', tagColor:'#F59E0B', desc:'Pool with 1 donor — together you plant 1 tree.', what:['Individual tree certificate','Shared tree dashboard','GPS location on map','Before & after photos'], img:'/tier-joint.webp', fallback:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80', species:null, occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/my-tree', badge:'JOINT', badgeColor:'#F59E0B' },
  { id:'individual_1000', tier:'1000', icon:'🌳', name:'Individual Tree', price:1000, co2:'~22kg', water:'~1,000L', tag:'⭐ Most Popular', tagColor:'#1B4332', desc:'Your own tree. Full dashboard. GPS tracked for 3 years.', what:['Individual tree certificate','Personal tree dashboard','GPS location on map','Before & after photos','AI health score','80G tax receipt','Guaranteed species'], img:'/tier-individual.webp', fallback:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', species:['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar'], occasionIds:['birthday','anniversary','memory','festival','baby','corporate','custom'], dashboard:'/my-tree', badge:'INDIVIDUAL', badgeColor:'#1B4332' },
  { id:'miyawaki_5000', tier:'5000', icon:'🏙️', name:'Miyawaki Forest', price:5000, co2:'~200kg', water:'~8,000L', tag:'🔥 Premium Impact', tagColor:'#7C3AED', desc:'30+ native species. Dense urban forest. 10x faster growth.', what:['Forest impact certificate','Miyawaki forest dashboard','GPS forest location','Species diversity report','BRSR-compatible report','80G tax receipt','Donor wall recognition'], img:'/tier-miyawaki.webp', fallback:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80', species:null, occasionIds:['corporate','custom'], dashboard:'/miyawaki-dashboard', badge:'FOREST', badgeColor:'#7C3AED' },
]

const OCCASIONS = [
  { id:'birthday', icon:'🎂', label:'Birthday', price:100 },
  { id:'anniversary', icon:'💍', label:'Anniversary', price:250 },
  { id:'memory', icon:'🕯️', label:'In Memory', price:100 },
  { id:'festival', icon:'🎊', label:'Festival', price:100 },
  { id:'baby', icon:'👶', label:'New Baby', price:250 },
  { id:'corporate', icon:'🏢', label:'Corporate', price:500 },
  { id:'custom', icon:'🎁', label:'Custom', price:100 },
]

const SPECIES_DATA = [
  { name:'Banyan',    title:'The Tree of Generations', story:'Massive canopy. Deep roots. A living shelter for generations and wildlife alike.',              benefits:['Highway shade','Wildlife support','Long lifespan'],    img:'/tree-banyan.webp',    fallback:'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80' },
  { name:'Neem',      title:'The Healing Tree',         story:"Nature's pharmacy. Purifies air, enriches soil and supports life around it.",                  benefits:['Air purification','Medicinal value','Pest resistance'], img:'/tree-neem.webp',      fallback:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80' },
  { name:'Rain Tree', title:'The Giant Canopy',         story:'Creates extraordinary cooling shade across entire streets and communities.',                   benefits:['Massive shade','Fast growth','Urban cooling'],           img:'/tree-raintree.webp',  fallback:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80' },
  { name:'Honge',     title:'The Resilient Native',     story:'Exceptionally tough and adaptive. Thrives where others struggle.',                             benefits:['Drought resistant','Soil enrichment','Native species'],  img:'/tree-honge.webp',     fallback:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80' },
  { name:'Ashoka',    title:'The Graceful Sentinel',    story:'Tall, narrow and elegant. A natural screen of living green year-round.',                       benefits:['Road beautification','Narrow footprint','Air cleaner'], img:'/tree-ashoka.webp',    fallback:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80' },
  { name:'Gulmohar',  title:'The Flame of Nature',      story:'Transforms the landscape with spectacular red-orange blooms every summer.',                    benefits:['Seasonal beauty','Roadside appeal','Shade canopy'],      img:'/tree-gulmohar.webp',  fallback:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80' },
  { name:'Jamun',     title:'The Community Tree',       story:'Pollution-resistant with edible black plum fruits loved by birds and people.',                 benefits:['Pollution resistant','Edible fruits','Wildlife food'],   img:'/tree-jamun.webp',     fallback:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80' },
  { name:'Amaltas',   title:'The Golden Shower',        story:'Brilliant yellow blooms cascade every April — a spectacular urban spectacle.',                 benefits:['Golden blooms','Ornamental beauty','Shade support'],     img:'/tree-amaltas.webp',   fallback:'https://images.unsplash.com/photo-1490750967868-88df5691cc9f?w=800&q=80' },
  { name:'Arjun',     title:'The Fast Grower',          story:"One of India's fastest-growing shade trees with powerful medicinal bark.",                     benefits:['Fast growth','Medicinal bark','Dense shade'],            img:'/tree-arjun.webp',     fallback:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80' },
  { name:'Imli',      title:'The Ancient Root',         story:'Deep, strong roots that have anchored Indian villages for centuries.',                         benefits:['Deep roots','Edible fruit','Erosion control'],           img:'/tree-imli.webp',      fallback:'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80' },
  { name:'Mahogany',  title:'The Wind Warrior',         story:'Straight trunk, dense canopy, remarkably wind-resistant in urban environments.',               benefits:['Wind resistant','Straight form','Carbon capture'],       img:'/tree-mahogany.webp',  fallback:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80' },
  { name:'Atti',      title:'The Wildlife Magnet',      story:'A small tree with massive ecological impact — attracts birds, bees and butterflies.',          benefits:['Wildlife habitat','Attracts pollinators','Native eco'],  img:'/tree-atti.webp',      fallback:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80' },
]

function Img({ src, fallback, alt, style }: { src:string; fallback:string; alt:string; style?:React.CSSProperties }) {
  const alt1 = src.endsWith('.webp') ? src.replace('.webp', '.jpg') : src.replace('.jpg', '.webp')
  const [attempt, setAttempt] = useState(0)
  const srcs = [src, alt1, fallback]
  return <img src={srcs[Math.min(attempt, srcs.length-1)]} alt={alt} style={style} onError={()=>setAttempt(a=>Math.min(a+1, srcs.length-1))} loading="lazy"/>
}

export default function DonatePage() {
  const router = useRouter()
  const tierBarRef  = useRef<HTMLDivElement>(null)
  const detailRef   = useRef<HTMLDivElement>(null)

  const [mode,       setMode]       = useState<'plant'|'gift'>('plant')
  const [tier,       setTier]       = useState(TIERS[3])
  const [occ,        setOcc]        = useState(OCCASIONS[0])
  const [species,    setSpecies]    = useState('')
  const [qty,        setQty]        = useState(1)
  const [copied,     setCopied]     = useState(false)
  const [commLevel,  setCommLevel]  = useState<100|250>(100)
  const [spIdx,      setSpIdx]      = useState(0)
  const [carIdx,     setCarIdx]     = useState(0)
  const [spErr,      setSpErr]      = useState(false)
  const PER = typeof window !== 'undefined' && window.innerWidth < 600 ? 2 : 4

  const isComm  = tier.id === 'community_100' || tier.id === 'community_250'
  const isJoint = tier.id === 'joint_500'
  const isIndiv = tier.id === 'individual_1000'
  const isMiya  = tier.id === 'miyawaki_5000'
  const effPrice = isComm ? commLevel : tier.price
  const total    = mode === 'gift' ? occ.price : effPrice * qty
  const selSp    = SPECIES_DATA[spIdx]

  // Restore from sessionStorage on back-nav
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem('ecotree_selection') || 'null')
      if (!s) return
      const t = TIERS.find(x => x.id === s.tierId)
      if (t) { setTier(t) }
      if (s.commLevel) setCommLevel(s.commLevel)
      if (s.species) { setSpecies(s.species); const i = SPECIES_DATA.findIndex(x=>x.name===s.species); if(i>=0) setSpIdx(i) }
      if (s.qty) setQty(s.qty)
      if (s.mode) setMode(s.mode)
      if (s.occId) { const o = OCCASIONS.find(x=>x.id===s.occId); if(o) setOcc(o) }
    } catch {}
  }, [])

  const pickTier = (t: typeof TIERS[0]) => {
    setTier(t); setSpecies(''); setQty(1); setSpErr(false)
    if (t.occasionIds.length > 0) setOcc(OCCASIONS.find(o=>t.occasionIds.includes(o.id))||OCCASIONS[0])
    setTimeout(() => {
      if (!detailRef.current) return
      // Account for both sticky bars (trust bar ~30px + tier bar ~60px + navbar ~80px + 16px gap)
      const stickyOffset = (tierBarRef.current?.offsetHeight || 60) + 80 + 32
      const top = detailRef.current.getBoundingClientRect().top + window.scrollY - stickyOffset
      window.scrollTo({ top, behavior: 'smooth' })
    }, 80)
  }

  const copyLink = () => { navigator.clipboard.writeText(SITE_URL); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const pickSp = (i: number) => { setSpIdx(i); setSpecies(SPECIES_DATA[i].name); setSpErr(false) }

  const handleContinue = () => {
    if (isIndiv && !species) {
      setSpErr(true)
      if (detailRef.current) {
        const stickyOffset = (tierBarRef.current?.offsetHeight || 60) + 80 + 32
        const top = detailRef.current.getBoundingClientRect().top + window.scrollY - stickyOffset
        window.scrollTo({ top, behavior: 'smooth' })
      }
      return
    }
    sessionStorage.setItem('ecotree_selection', JSON.stringify({
      tierId: tier.id, tierName: tier.name, tierIcon: tier.icon,
      tierImg: isIndiv ? selSp.img : tier.img,
      tierFallback: isIndiv ? selSp.fallback : tier.fallback,
      tierBadge: tier.badge, badgeColor: tier.badgeColor,
      tierCo2: tier.co2, tierWater: tier.water, tierDashboard: tier.dashboard,
      tierWhat: tier.what,
      species, speciesTitle: isIndiv ? selSp.title : '',
      qty, mode, commLevel,
      occId: occ.id, occIcon: occ.icon, occLabel: occ.label, occPrice: occ.price,
      total,
    }))
    router.push('/donate/checkout')
  }

  const ctaLabel = () => {
    if (mode === 'gift') return `🎁 Continue to Gift Details →`
    if (isIndiv) return `🌱 Adopt This Living Tree →`
    if (isJoint) return `🤝 Join Tree Pool →`
    if (isMiya)  return `🏙️ Create Urban Forest →`
    return `🌿 Join Community Forest →`
  }

  // Tier image for hero pills — small thumbnail
  // Per-tier colour identity — each tier has its own selected colour
  const PILL_COLORS: Record<string, {bg:string;color:string;border:string;shadow:string}> = {
    community_100: { bg:'#52B788', color:'#fff',     border:'#52B788', shadow:'0 4px 16px rgba(82,183,136,0.45)' },
    joint_500:     { bg:'#F59E0B', color:'#1B2E25',  border:'#F59E0B', shadow:'0 4px 16px rgba(245,158,11,0.45)' },
    individual_1000:{ bg:'#D4A63F', color:'#1B2E25', border:'#D4A63F', shadow:'0 4px 16px rgba(212,166,63,0.45)' },
    miyawaki_5000: { bg:'#7C3AED', color:'#fff',     border:'#7C3AED', shadow:'0 4px 16px rgba(124,58,237,0.45)' },
  }

  const TierPill = ({ t }: { t: typeof TIERS[0] }) => {
    const active = isComm
      ? (t.id==='community_100'||t.id==='community_250')
      : tier.id===t.id
    if (t.id === 'community_250') return null

    // Compact labels that fit in 83px on mobile
    const label    = t.id==='community_100' ? '₹100/250' : `₹${t.price.toLocaleString('en-IN')}`
    const sublabel = t.id==='community_100' ? 'Forest' : t.id==='joint_500' ? 'Shared' : t.id==='individual_1000' ? 'Individual' : 'Miyawaki'
    const col      = PILL_COLORS[t.id] || PILL_COLORS.community_100

    const activeStyle: React.CSSProperties = active ? {
      background:  col.bg,
      color:       col.color,
      borderColor: col.border,
      boxShadow:   col.shadow,
      transform:   'translateY(-2px)',
    } : {}

    return (
      <button onClick={()=>pickTier(t)} className="dp-pill" style={activeStyle}>
        {t.id==='individual_1000' && (
          <span className="dp-pill-star-badge" style={{color:active?col.color:'#D4A63F'}}>★</span>
        )}
        <span className="dp-pill-amt" style={active?{color:col.color}:{}}>{label}</span>
        <span className="dp-pill-sub" style={active?{color:col.color,opacity:0.85}:{}}>{sublabel}</span>
      </button>
    )
  }

  return (
    <main className="dp">

      {/* ── TRUST BAR sticky ── */}
      <div className="dp-trust">
        <div className="dp-c dp-trust-inner">
          <div className="dp-trust-signals">
            <span>🌱 10,000+ trees</span>
            <span className="dp-dot">·</span>
            <span>🎯 91% survival</span>
            <span className="dp-dot">·</span>
            <span>🤖 AI-verified</span>
            <span className="dp-dot">·</span>
            <span>🧾 80G approved</span>
            <span className="dp-dot">·</span>
            <span>📍 GPS-tagged</span>
          </div>
          <div className="dp-trust-acts">
            <a href={`https://wa.me/?text=${WA_MSG}`} target="_blank" rel="noopener" className="dp-act dp-act--wa">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share
            </a>
            <button onClick={copyLink} className="dp-act dp-act--cp">{copied?'✓ Copied!':'🔗 Copy'}</button>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="dp-hero">
        <div className="dp-hero-bg" aria-hidden="true"/>
        <div className="dp-c dp-hero-inner">
          <div className="dp-hero-text">
            <div className="dp-hero-eyebrow">India's only NGO where you can see your tree growing live</div>
            <h1 className="dp-hero-h1">Plant a <em>Living Legacy</em></h1>
            <p className="dp-hero-sub">AI-verified · GPS-tagged · 3yr tracking · 80G tax benefit</p>
          </div>
        </div>
      </div>

      {/* ── STICKY TIER BAR ── */}
      <div className="dp-tier-bar" ref={tierBarRef}>
        <div className="dp-c dp-tier-bar-inner">
          <div className="dp-mode-pills">
            <button className={`dp-mode${mode==='plant'?' dp-mode--on':''}`} onClick={()=>setMode('plant')}>🌱 Plant</button>
            <button className={`dp-mode${mode==='gift'?' dp-mode--gift dp-mode--on':''}`} onClick={()=>setMode('gift')}>🎁 Gift</button>
          </div>
          <div className="dp-tier-pills">
            {TIERS.map(t => <TierPill key={t.id} t={t}/>)}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="dp-main">
        <div className="dp-c">
          {mode === 'plant' ? (
            <div className="dp-detail" ref={detailRef}>

              {/* ══ ₹1,000 INDIVIDUAL — Amazon style ══ */}
              {isIndiv && (
                <div className="dp-amazon-layout">

                  {/* LEFT: compact image + thumbnail strip below */}
                  <div className="dp-amazon-left">

                    {/* MAIN IMAGE — 4:3 compact */}
                    <div className="dp-amazon-img">
                      <Img
                        src={selSp.img} fallback={selSp.fallback} alt={selSp.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'opacity 0.3s ease'}}
                      />
                      <div className="dp-amazon-img-ov"/>
                      <div className="dp-amazon-img-caption">
                        <div className="dp-amazon-img-eyebrow">Your Selected Tree</div>
                        <div className="dp-amazon-img-name">{selSp.name}</div>
                        <div className="dp-amazon-img-title">{selSp.title}</div>
                      </div>
                      {spErr && (
                        <div className="dp-amazon-img-err">⚠️ Please select a species below</div>
                      )}
                    </div>

                    {/* THUMBNAIL STRIP — below main image */}
                    {/* SPECIES SELECTOR — text pills on mobile, image thumbs on desktop */}
                    <div className="dp-sp-selector">
                      <div className="dp-sp-sel-hdr">
                        <span className="dp-sp-sel-label">
                          Choose species
                          {spErr && <span className="dp-err-inline"> ⚠️ Required</span>}
                        </span>
                        {species && <span className="dp-sp-sel-chosen">{species}</span>}
                      </div>

                      {/* MOBILE: horizontal scrolling text pills */}
                      <div className="dp-sp-pills-mob">
                        {SPECIES_DATA.map((sp,i)=>(
                          <button
                            key={sp.name}
                            onClick={()=>pickSp(i)}
                            className={`dp-sp-pill${spIdx===i?' dp-sp-pill--on':''}`}
                          >
                            {sp.name}
                          </button>
                        ))}
                      </div>

                      {/* DESKTOP: image thumbnail carousel */}
                      <div className="dp-thumb-strip-desk">
                        <div className="dp-thumb-hdr">
                          <div className="dp-nav-btns">
                            <button className="dp-nav-btn" onClick={()=>setCarIdx(i=>Math.max(0,i-1))} disabled={carIdx===0}>‹</button>
                            <button className="dp-nav-btn" onClick={()=>setCarIdx(i=>Math.min(SPECIES_DATA.length-4,i+1))} disabled={carIdx>=SPECIES_DATA.length-4}>›</button>
                          </div>
                        </div>
                        <div className="dp-thumb-track-wrap">
                          <div className="dp-thumb-track" style={{transform:`translateX(calc(-${carIdx*25}% - ${carIdx*6/4}px))`}}>
                            {SPECIES_DATA.map((sp,i)=>(
                              <button key={sp.name} onClick={()=>pickSp(i)} className={`dp-thumb${spIdx===i?' dp-thumb--on':''}`}>
                                <div className="dp-thumb-img">
                                  <Img src={sp.img} fallback={sp.fallback} alt={sp.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                  {spIdx===i && <div className="dp-thumb-chk">✓</div>}
                                </div>
                                <div className="dp-thumb-name">{sp.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="dp-sp-dots" style={{marginTop:'0.5rem'}}>
                          {Array.from({length:SPECIES_DATA.length-4+1}).map((_,i)=>(
                            <button key={i} onClick={()=>setCarIdx(i)} className={`dp-dot-btn${i===carIdx?' dp-dot-btn--on':''}`}/>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* IMPACT BAND below thumbnails */}
                    <div className="dp-impact-band" style={{marginTop:'0.65rem'}}>
                      {[{icon:'🌍',val:'~22kg',lbl:'CO₂/year'},{icon:'💧',val:'~1,000L',lbl:'Water/year'},{icon:'📍',val:'GPS',lbl:'3yr tracked'}].map(m=>(
                        <div key={m.lbl} className="dp-impact-item">
                          <span className="dp-impact-icon">{m.icon}</span>
                          <span className="dp-impact-val">{m.val}</span>
                          <span className="dp-impact-lbl">{m.lbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: story + benefits + qty + CTA — always fully visible */}
                  <div className="dp-amazon-right">
                    <div className="dp-card dp-story-card" style={{marginBottom:'0.85rem'}}>
                      <span className="dp-badge" style={{background:'#1B4332',color:'#D4A63F'}}>INDIVIDUAL TREE · ₹1,000</span>
                      <h2 className="dp-story-name">{selSp.name}</h2>
                      <div className="dp-story-title">{selSp.title}</div>
                      <p className="dp-story-text">{selSp.story}</p>
                      <div className="dp-story-benefits-label">Why this tree</div>
                      {selSp.benefits.map(b=>(
                        <div key={b} className="dp-benefit"><span className="dp-benefit-chk">✓</span>{b}</div>
                      ))}
                      <div className="dp-meta-tags">
                        {['📍 GPS tracked','🌱 Native species','🛡 3-year care','📱 Personal dashboard','🧾 80G receipt','🤖 AI-verified','📜 Certificate'].map(m=>(
                          <span key={m} className="dp-meta-tag">{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="dp-card dp-qty-card" style={{marginBottom:'0.85rem'}}>
                      <div className="dp-qty-row">
                        <div>
                          <div className="dp-qty-label">Number of trees</div>
                          <div className="dp-qty-sub">Each gets unique GPS tracking</div>
                        </div>
                        <div className="dp-qty-ctrl">
                          <button className="dp-qty-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                          <span className="dp-qty-num">{qty}</span>
                          <button className="dp-qty-btn" onClick={()=>setQty(q=>Math.min(100,q+1))}>+</button>
                        </div>
                      </div>
                    </div>

                    <div className="dp-cta-row">
                      <div className="dp-cta-price">
                        <div className="dp-cta-price-lbl">Total</div>
                        <div className="dp-cta-price-val">₹{total.toLocaleString('en-IN')}</div>
                      </div>
                      <button onClick={handleContinue} className="dp-cta-btn">{ctaLabel()}</button>
                    </div>
                    <div className="dp-cta-hint">Next: Add your details &amp; complete payment</div>
                  </div>

                </div>
              )}

              {/* ══ COMMUNITY / JOINT / MIYAWAKI — Amazon style ══ */}
              {(isComm||isJoint||isMiya) && (
                <div className="dp-tier-amazon-layout" ref={detailRef}>

                  {/* LEFT — compact image 4:3 + impact band below */}
                  <div className="dp-tier-amazon-left">
                    <div className="dp-tier-amazon-img">
                      <Img
                        src={tier.img} fallback={tier.fallback} alt={tier.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                      />
                      <div className="dp-amazon-img-ov"/>
                      <div className="dp-amazon-img-caption">
                        <div className="dp-amazon-img-eyebrow">
                          {isComm?'Community Tier':isJoint?'Shared Tree':'Premium Forest'}
                        </div>
                        <div className="dp-amazon-img-name">
                          {isComm?'Community Forest':isJoint?'Shared Tree Impact':'Miyawaki Forest'}
                        </div>
                        <div className="dp-amazon-img-title">
                          {isComm?"You're part of something bigger":isJoint?'Two donors. One living tree.':'Create an entire ecosystem.'}
                        </div>
                      </div>
                    </div>

                    {/* Impact band below image */}
                    <div className="dp-impact-band" style={{marginTop:'0.75rem'}}>
                      {(isComm
                        ? [{icon:'🌳',val:'Forest',lbl:'Community'},{icon:'🌍',val:'~5kg',lbl:'CO₂/year'},{icon:'📜',val:'Cert',lbl:'Instant'}]
                        : isJoint
                        ? [{icon:'🌍',val:'~11kg',lbl:'CO₂/year'},{icon:'📍',val:'GPS',lbl:'Tracked'},{icon:'💧',val:'~500L',lbl:'Water/year'}]
                        : [{icon:'🌍',val:'~200kg',lbl:'CO₂/year'},{icon:'🌿',val:'30+',lbl:'Species'},{icon:'⚡',val:'10×',lbl:'Faster'}]
                      ).map(m=>(
                        <div key={m.lbl} className="dp-impact-item">
                          <span className="dp-impact-icon">{m.icon}</span>
                          <span className="dp-impact-val">{m.val}</span>
                          <span className="dp-impact-lbl">{m.lbl}</span>
                        </div>
                      ))}
                    </div>

                    {/* Community ₹100/₹250 toggle — LEFT column below image */}
                    {isComm && (
                      <div className="dp-comm-toggle" style={{marginTop:'0.75rem'}}>
                        <div className="dp-card-eyebrow" style={{marginBottom:'0.5rem'}}>Choose your level</div>
                        <div className="dp-comm-opts">
                          {([100,250] as const).map(amt=>(
                            <button key={amt} onClick={()=>{setCommLevel(amt);setTier(amt===100?TIERS[0]:TIERS[1])}} className={`dp-comm-opt${commLevel===amt?' dp-comm-opt--on':''}`}>
                              <span className="dp-comm-amt">₹{amt}</span>
                              <span className="dp-comm-lbl">{amt===100?'Contributor · Certificate':'Supporter · Priority updates'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT — story + features + qty + CTA — always visible */}
                  <div className="dp-tier-amazon-right">

                    {/* Story card */}
                    <div className="dp-card dp-story-card" style={{marginBottom:'0.85rem'}}>
                      <span className="dp-badge" style={{background:tier.badgeColor,color:'#fff'}}>
                        {tier.badge}{isComm?` · ₹${commLevel}`:isJoint?' · ₹500':' · ₹5,000'}
                      </span>
                      <h2 className="dp-story-name">
                        {isComm?'Community Forest':isJoint?'Shared Tree Impact':'Urban Forest Impact'}
                      </h2>
                      <p className="dp-story-text">
                        {isComm && "Every rupee plants a real tree in Bangalore's urban forest. You get a certificate in your name, dashboard access and monthly updates."}
                        {isJoint && "Pool ₹500 with one other donor — together you plant and track a real GPS-tagged tree. Both donors receive shared dashboard access and a certificate."}
                        {isMiya && "30+ native species planted in a dense Miyawaki forest patch — 10× faster growth than conventional planting. Creates a self-sustaining urban ecosystem."}
                      </p>

                      {isJoint && (
                        <div className="dp-joint-note">
                          🌿 Native species assigned at planting — chosen by field ecologists for maximum survival.
                        </div>
                      )}

                      {/* Features */}
                      {tier.what.map(w=>(
                        <div key={w} className="dp-benefit"><span className="dp-benefit-chk">✓</span>{w}</div>
                      ))}
                    </div>

                    {/* Qty */}
                    <div className="dp-card dp-qty-card" style={{marginBottom:'0.85rem'}}>
                      <div className="dp-qty-row">
                        <div>
                          <div className="dp-qty-label">
                            {isMiya?'Number of forests':isJoint?'Number of shares':'Number of contributions'}
                          </div>
                        </div>
                        <div className="dp-qty-ctrl">
                          <button className="dp-qty-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                          <span className="dp-qty-num">{qty}</span>
                          <button className="dp-qty-btn" onClick={()=>setQty(q=>Math.min(isJoint||isMiya?10:100,q+1))}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="dp-cta-row">
                      <div className="dp-cta-price">
                        <div className="dp-cta-price-lbl">Total</div>
                        <div className="dp-cta-price-val">₹{total.toLocaleString('en-IN')}</div>
                      </div>
                      <button onClick={handleContinue} className={`dp-cta-btn${isMiya?' dp-cta-btn--miya':''}`}>
                        {ctaLabel()}
                      </button>
                    </div>
                    <div className="dp-cta-hint">Next: Add your details &amp; complete payment</div>

                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ══ GIFT MODE ══ */
            <div ref={detailRef}>
              <div className="dp-card-eyebrow" style={{marginBottom:'0.85rem'}}>Choose the occasion</div>
              <div className="dp-occ-grid">
                {OCCASIONS.map(o=>(
                  <button key={o.id} onClick={()=>setOcc(o)} className={`dp-occ-card${occ.id===o.id?' dp-occ-card--on':''}`}>
                    <div className="dp-occ-icon">{o.icon}</div>
                    <div className="dp-occ-label">{o.label}</div>
                    <div className="dp-occ-price">₹{o.price}</div>
                    {occ.id===o.id && <div className="dp-occ-chk">✓</div>}
                  </button>
                ))}
              </div>
              <div className="dp-gift-fields">
                <div className="dp-card-eyebrow" style={{marginBottom:'0.75rem',marginTop:'1.5rem'}}>Recipient details</div>
                <div className="dp-gift-row">
                  <div className="dp-gift-field">
                    <label>Recipient name *</label>
                    <input type="text" placeholder="Who is this gift for?"/>
                  </div>
                  <div className="dp-gift-field">
                    <label>Recipient email *</label>
                    <input type="email" placeholder="Their email for certificate"/>
                  </div>
                </div>
                <div className="dp-gift-field">
                  <label>Personal message <span className="dp-opt">(optional)</span></label>
                  <textarea rows={2} placeholder="Add a personal message..."/>
                </div>
              </div>
              <div className="dp-cta-row" style={{marginTop:'1.25rem'}}>
                <div className="dp-cta-price">
                  <div className="dp-cta-price-lbl">Gift amount</div>
                  <div className="dp-cta-price-val">₹{occ.price}</div>
                </div>
                <button onClick={handleContinue} className="dp-cta-btn dp-cta-btn--gift">🎁 Continue to Gift Details →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE STICKY CTA ── */}
      <div className="dp-mob-cta">
        <div className="dp-mob-cta-left">
          <div className="dp-mob-cta-name">{isIndiv&&species?species:tier.name}</div>
          <div className="dp-mob-cta-price">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <button onClick={handleContinue} className="dp-mob-cta-btn">{ctaLabel()}</button>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="dp-sec dp-sec--how">
        <div className="dp-c">
          <div className="dp-sec-label">What Happens After You Pay</div>
          <div className="dp-how">
            {[{icon:'🌱',n:'01',t:'We Plant',d:'Our field team plants your tree at a verified Bangalore site within 7 days.'},{icon:'📍',n:'02',t:'GPS Tagged',d:'A unique GPS coordinate and QR code is assigned to your specific tree.'},{icon:'🤖',n:'03',t:'AI Verified',d:'Claude AI verifies species, location, timestamp and health before it reaches you.'},{icon:'📊',n:'04',t:'Live Dashboard',d:'Track your tree with monthly photos and AI health scores for 3 full years.'}].map((s,i)=>(
              <React.Fragment key={s.n}>
                <div className="dp-how-item">
                  <div className="dp-how-icon">{s.icon}</div>
                  <div className="dp-how-n">{s.n}</div>
                  <div className="dp-how-t">{s.t}</div>
                  <div className="dp-how-d">{s.d}</div>
                </div>
                {i<3&&<div className="dp-how-arr">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="dp-sec dp-sec--white">
        <div className="dp-c">
          <div className="dp-sec-label">From Sapling to Forest</div>
          <h2 className="dp-sec-h2">Real trees. <em>Real impact.</em></h2>
          <div className="dp-gallery">
            {[
              {img:'/gallery-sapling.webp',fb:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',l:'🌱 Day 1 — Sapling planted',s:'GPS-tagged, QR code attached'},
              {img:'/gallery-growing.webp',fb:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80',l:'🌿 Month 6 — Growing strong',s:'AI health score: 94%'},
              {img:'/gallery-canopy.webp',fb:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80',l:'🌳 Year 3 — Full canopy',s:'22kg CO₂ offset/year'},
            ].map(g=>(
              <div key={g.l} className="dp-gallery-item">
                <Img src={g.img} fallback={g.fb} alt={g.l} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block'}}/>
                <div className="dp-gallery-cap">
                  <div className="dp-gallery-l">{g.l}</div>
                  <div className="dp-gallery-s">{g.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="dp-trust-strip">
        <div className="dp-c dp-trust-strip-inner">
          {[{i:'🧾',t:'80G Tax Benefit',s:'Section 8 NGO · All donations eligible'},{i:'📜',t:'Certificate Instantly',s:'PDF emailed after payment'},{i:'🤖',t:'AI-Verified',s:'Every photo independently checked'},{i:'📅',t:'3-Year Tracking',s:'Monthly updates on dashboard'}].map(x=>(
            <div key={x.t} className="dp-trust-item">
              <span className="dp-trust-icon">{x.i}</span>
              <div><div className="dp-trust-t">{x.t}</div><div className="dp-trust-s">{x.s}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="dp-sec dp-sec--faq">
        <div className="dp-c dp-c--narrow">
          <div className="dp-sec-label">FAQ</div>
          <h2 className="dp-sec-h2">Quick answers</h2>
          <FAQ/>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <div className="dp-bcta">
        <div className="dp-c dp-bcta-inner">
          <span className="dp-bcta-text">🌱 Ready to plant? Choose your contribution above.</span>
          <div className="dp-bcta-btns">
            <button className="dp-btn dp-btn--p" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Plant a Tree · From ₹100</button>
            <a href={`https://wa.me/${WHATSAPP}?text=${WA_MSG}`} target="_blank" rel="noopener" className="dp-btn dp-btn--wa">💬 WhatsApp Us</a>
          </div>
        </div>
      </div>

      <style>{`
        /* ── TOKENS ── */
        .dp{--gd:#1B4332;--gm:#2D6A4F;--ga:#52B788;--gl:#74C69D;--gold:#D4A63F;--mt:#D8F3DC;--md:#B7E4C7;--ow:#F4F7F4;--td:#0D1F17;--tb:#1B2E25;--tm:#5C7268;--r:14px;--shadow:0 2px 16px rgba(27,67,50,0.08);font-family:var(--font-body,'Segoe UI',system-ui,sans-serif);color:var(--td);background:var(--ow);}
        *{box-sizing:border-box;}
        .dp-c{max-width:1200px;margin:0 auto;padding:0 1.25rem;}
        .dp-c--narrow{max-width:740px;}
        .dp-opt{font-weight:400;color:var(--tm);font-size:0.78rem;}
        .dp-dot{color:rgba(255,255,255,0.3);}
        .dp-err-inline{font-size:0.7rem;color:#ef4444;font-weight:600;margin-left:0.5rem;}

        /* ── TRUST BAR ── */
        .dp-trust{background:var(--gd);position:sticky;top:80px;z-index:60;border-bottom:1px solid rgba(82,183,136,0.18);padding:0.38rem 0;}
        .dp-trust-inner{display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;}
        .dp-trust-signals{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.72);flex-wrap:wrap;}
        .dp-trust-acts{display:flex;gap:0.35rem;flex-shrink:0;}
        .dp-act{display:inline-flex;align-items:center;gap:0.28rem;font-size:0.68rem;font-weight:700;padding:0.26rem 0.7rem;border-radius:999px;cursor:pointer;border:none;font-family:inherit;text-decoration:none;white-space:nowrap;}
        .dp-act--wa{background:#25D366;color:#fff;}
        .dp-act--cp{background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.18);}

        /* ── HERO ── */
        .dp-hero{background:var(--gd);padding:1.75rem 0 1.5rem;position:relative;overflow:hidden;border-bottom:2px solid rgba(82,183,136,0.2);}
        .dp-hero-bg{position:absolute;right:0;bottom:0;width:200px;height:100%;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 260' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 250L100 110' stroke='white' stroke-width='8' stroke-linecap='round'/%3E%3Cpath d='M100 110L72 158L50 133L78 96L58 116L35 78L68 57L47 77L58 30L100 8L142 30L153 77L132 57L165 78L142 116L162 96L122 133L128 158Z' fill='white'/%3E%3C/svg%3E") right bottom/contain no-repeat;opacity:0.05;pointer-events:none;}
        .dp-hero-inner{position:relative;z-index:1;}
        .dp-hero-eyebrow{font-size:0.62rem;font-weight:700;color:var(--gl);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;}
        .dp-hero-h1{font-size:clamp(1.6rem,3vw,2.5rem);font-weight:900;color:#fff;line-height:0.95;letter-spacing:-0.03em;margin:0 0 0.45rem;}
        .dp-hero-h1 em{color:var(--gl);font-style:normal;}
        .dp-hero-sub{font-size:0.72rem;color:rgba(255,255,255,0.45);letter-spacing:0.03em;margin:0;}

        /* ── TIER BAR sticky ── */
        .dp-tier-bar{background:var(--gd);border-bottom:3px solid rgba(82,183,136,0.25);padding:0.6rem 0;position:sticky;top:calc(80px + 28px);z-index:55;}
        .dp-tier-bar-inner{display:flex;align-items:center;gap:0.75rem;flex-wrap:nowrap;}
        .dp-mode-pills{display:flex;gap:0.35rem;flex-shrink:0;}
        .dp-mode{padding:0.35rem 0.9rem;border-radius:999px;font-size:0.75rem;font-weight:700;cursor:pointer;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.6);font-family:inherit;transition:all 0.15s;white-space:nowrap;}
        .dp-mode--on{border-color:var(--ga);background:var(--gm);color:#fff;}
        .dp-mode--gift.dp-mode--on{border-color:#7C3AED;background:#7C3AED;}
        .dp-tier-pills{display:flex;gap:0.4rem;overflow-x:auto;flex:1;-webkit-overflow-scrolling:touch;}
        .dp-tier-pills::-webkit-scrollbar{display:none;}
        .dp-pill{display:flex;flex-direction:column;align-items:flex-start;padding:0.48rem 1.05rem;border-radius:9px;border:2px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.09);color:rgba(255,255,255,0.78);cursor:pointer;font-family:inherit;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
        .dp-pill:hover{background:rgba(255,255,255,0.17);border-color:rgba(255,255,255,0.45);color:#fff;}
        .dp-pill--on{background:#fff !important;color:var(--gd) !important;border-color:#fff !important;box-shadow:0 4px 16px rgba(0,0,0,0.25);transform:translateY(-1px);}
        .dp-pill-star{font-size:0.6rem;color:var(--gold);margin-bottom:0.12rem;display:block;}
        .dp-pill-star-badge{font-size:0.6rem;font-weight:800;letter-spacing:0.04em;margin-bottom:0.1rem;display:block;}
        .dp-pill--on .dp-pill-star{color:var(--gold) !important;}
        .dp-pill-amt{font-size:0.88rem;font-weight:900;line-height:1;margin-bottom:0.14rem;}
        .dp-pill-sub{font-size:0.66rem;font-weight:600;opacity:0.72;}
        .dp-pill--on .dp-pill-sub{opacity:1;color:var(--gm) !important;}
        .dp-pill--on .dp-pill-amt{color:var(--gd) !important;}

        /* ── MAIN ── */
        .dp-main{padding:1.5rem 0 5rem;}

        /* ── TIER AMAZON LAYOUT (community/joint/miyawaki) ── */
        .dp-tier-amazon-layout{display:grid;grid-template-columns:380px 1fr;gap:1.75rem;align-items:start;}
        .dp-tier-amazon-left{}
        .dp-tier-amazon-right{}
        .dp-tier-amazon-img{border-radius:var(--r);overflow:hidden;position:relative;aspect-ratio:4/3;box-shadow:0 4px 20px rgba(27,67,50,0.12);background:#f0ede8;}

        /* ── ₹1,000 AMAZON LAYOUT ── */
        .dp-amazon-layout{display:grid;grid-template-columns:420px 1fr;gap:1.75rem;align-items:start;}
        .dp-amazon-left{}
        .dp-amazon-right{}

        /* Main image — compact 4:3 */
        .dp-amazon-img{
          border-radius:var(--r);overflow:hidden;
          position:relative;
          aspect-ratio:4/3;
          box-shadow:0 4px 20px rgba(27,67,50,0.12);
          background:#f0ede8;
        }
        .dp-amazon-img-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,31,23,0.82) 0%,transparent 50%);}
        .dp-amazon-img-caption{position:absolute;bottom:0;left:0;padding:1rem 1.15rem;}
        .dp-amazon-img-eyebrow{font-size:0.58rem;font-weight:800;color:rgba(255,255,255,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;}
        .dp-amazon-img-name{font-size:1.5rem;font-weight:900;color:#fff;line-height:1;}
        .dp-amazon-img-title{font-size:0.78rem;color:#74C69D;font-style:italic;margin-top:0.18rem;}
        .dp-amazon-img-err{position:absolute;top:0.75rem;left:0.75rem;background:#ef4444;color:#fff;font-size:0.72rem;font-weight:700;padding:0.28rem 0.7rem;border-radius:999px;}

        /* Thumbnail strip */
        /* ── SPECIES SELECTOR — dual mode ── */
        .dp-sp-selector{background:#fff;border:1px solid var(--md);border-radius:12px;padding:0.85rem 1rem;margin-top:0.65rem;box-shadow:var(--shadow);}
        .dp-sp-sel-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.65rem;flex-wrap:wrap;gap:0.4rem;}
        .dp-sp-sel-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--tb);}
        .dp-sp-sel-chosen{font-size:0.75rem;font-weight:700;color:var(--ga);background:var(--mt);padding:0.14rem 0.5rem;border-radius:999px;}
        /* Mobile text pills — hidden on desktop */
        .dp-sp-pills-mob{display:none;flex-wrap:wrap;gap:0.45rem;}
        .dp-sp-pill{display:inline-flex;align-items:center;padding:0.38rem 0.85rem;border-radius:999px;border:1.5px solid #E2E8E4;background:#fff;font-size:0.82rem;font-weight:600;color:var(--tb);cursor:pointer;font-family:inherit;white-space:nowrap;transition:all 0.15s;flex-shrink:0;}
        .dp-sp-pill:hover{border-color:var(--ga);color:var(--gd);}
        .dp-sp-pill--on{background:var(--gd);color:#D4A63F;border-color:var(--gd);font-weight:700;}
        /* Desktop image carousel — shown on desktop, hidden on mobile */
        .dp-thumb-strip-desk{display:block;}

        .dp-thumb-strip{background:#fff;border:1px solid var(--md);border-radius:12px;padding:0.75rem 0.85rem;margin-top:0.65rem;box-shadow:var(--shadow);}
        .dp-thumb-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;}
        .dp-thumb-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--tb);}
        .dp-thumb-selected{color:var(--ga);font-weight:800;text-transform:none;letter-spacing:0;}
        .dp-thumb-track-wrap{overflow:hidden;}
        .dp-thumb-track{display:flex;gap:6px;transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);}
        .dp-thumb{
          flex:0 0 calc(25% - 4.5px);
          border:2px solid #E2E8E4;
          border-radius:10px;
          overflow:hidden;
          cursor:pointer;
          padding:0;
          font-family:inherit;
          background:#fff;
          transition:all 0.2s ease;
          box-shadow:0 1px 3px rgba(27,67,50,0.06);
        }
        .dp-thumb:hover{border-color:#52B788;transform:translateY(-2px);box-shadow:0 4px 10px rgba(27,67,50,0.1);}
        .dp-thumb--on{border-color:#D4A63F;border-width:2.5px;box-shadow:0 4px 12px rgba(212,166,63,0.2);transform:translateY(-2px);background:#FFFDF6;}
        .dp-thumb-img{width:100%;aspect-ratio:1/1;overflow:hidden;position:relative;background:#f5f5f0;}
        .dp-thumb-img img{transition:transform 0.3s ease;}
        .dp-thumb:hover .dp-thumb-img img{transform:scale(1.08);}
        .dp-thumb-chk{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:50%;background:#D4A63F;display:flex;align-items:center;justify-content:center;font-size:10px;color:#1B4332;font-weight:900;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2);}
        .dp-thumb-name{font-size:0.7rem;font-weight:700;color:var(--tb);padding:0.35rem 0.4rem 0.4rem;text-align:center;line-height:1.2;border-top:1px solid #F0F4F1;background:#fff;}
        .dp-thumb--on .dp-thumb-name{background:#FFFDF6;color:#1B4332;border-top-color:#F0E8C0;}

        /* ── ₹1,000 NEW LAYOUT ── */
        .dp-indiv-main{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start;margin-top:0;}
        .dp-indiv-img-col{}
        .dp-indiv-img{border-radius:var(--r);overflow:hidden;position:relative;aspect-ratio:1/1;box-shadow:var(--shadow);}
        .dp-indiv-img-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,31,23,0.88) 0%,transparent 50%);}
        .dp-indiv-img-caption{position:absolute;bottom:0;left:0;padding:1rem 1.1rem;}
        .dp-indiv-img-eyebrow{font-size:0.6rem;font-weight:800;color:rgba(255,255,255,0.6);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;}
        .dp-indiv-img-name{font-size:1.5rem;font-weight:900;color:#fff;line-height:1;}
        .dp-indiv-img-title{font-size:0.78rem;color:#74C69D;font-style:italic;margin-top:0.15rem;}
        .dp-indiv-story-col{}

        /* 3-card slider track */
        .dp-sp-track3{display:flex;gap:10px;transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);}
        .dp-sp3-card{
          flex:0 0 calc(33.333% - 7px);
          border:2px solid #E2E8E4;
          border-radius:14px;
          overflow:hidden;
          cursor:pointer;
          transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
          background:#fff;
          padding:0;
          font-family:inherit;
          text-align:left;
          box-shadow:0 1px 4px rgba(27,67,50,0.06);
        }
        .dp-sp3-card:hover{
          border-color:#52B788;
          transform:translateY(-3px);
          box-shadow:0 6px 18px rgba(27,67,50,0.12);
        }
        .dp-sp3-card--on{
          border-color:#D4A63F;
          border-width:2.5px;
          box-shadow:0 6px 20px rgba(212,166,63,0.22);
          transform:translateY(-3px);
          background:#FFFDF6;
        }
        .dp-sp3-img{
          height:68px;
          overflow:hidden;
          position:relative;
          background:#f0f0e8;
        }
        .dp-sp3-img img{transition:transform 0.35s ease;}
        .dp-sp3-card:hover .dp-sp3-img img{transform:scale(1.06);}
        .dp-sp3-check{
          position:absolute;
          top:6px;right:6px;
          width:22px;height:22px;
          border-radius:50%;
          background:var(--gold);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;color:var(--gd);font-weight:900;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          border:2px solid #fff;
        }
        .dp-sp3-name{
          font-size:0.8rem;
          font-weight:700;
          color:var(--tb);
          padding:0.48rem 0.65rem 0.52rem;
          line-height:1.2;
          background:#fff;
          border-top:1px solid #F0F4F1;
          letter-spacing:0.01em;
        }
        .dp-sp3-card--on .dp-sp3-name{
          background:#FFFDF6;
          color:#1B4332;
          border-top-color:#F0E8C0;
        }

        /* ── LAYOUT ── */
        .dp-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;}

        /* ── CARDS ── */
        .dp-card{background:#fff;border:1px solid var(--md);border-radius:var(--r);padding:1.1rem 1.2rem;margin-bottom:0.85rem;box-shadow:var(--shadow);}
        .dp-card-eyebrow{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--tb);}
        .dp-card-sub{font-size:0.82rem;color:var(--tm);margin-top:0.18rem;}

        /* ── SPECIES CAROUSEL ── */
        .dp-sp-carousel{padding-bottom:0.85rem;}
        .dp-sp-carousel-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;}
        .dp-nav-btns{display:flex;gap:0.35rem;flex-shrink:0;}
        .dp-nav-btn{
          width:32px;height:32px;
          border-radius:50%;
          border:1.5px solid var(--md);
          background:#fff;
          color:var(--gd);
          font-size:15px;
          cursor:pointer;
          font-family:inherit;
          display:flex;align-items:center;justify-content:center;
          transition:all 0.15s;
          box-shadow:0 1px 4px rgba(27,67,50,0.08);
        }
        .dp-nav-btn:hover:not(:disabled){
          border-color:var(--gd);
          background:var(--gd);
          color:#fff;
          box-shadow:0 3px 10px rgba(27,67,50,0.2);
        }
        .dp-nav-btn:disabled{opacity:0.25;cursor:not-allowed;box-shadow:none;}
        .dp-sp-track-wrap{overflow:hidden;}
        .dp-sp-track{display:flex;gap:8px;transition:transform 0.3s ease;}
        .dp-sp-card{flex:0 0 calc(25% - 6px);border:2px solid #e2ddd5;border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.15s;background:#fff;text-align:left;font-family:inherit;padding:0;}
        .dp-sp-card--on{border-color:var(--gold);box-shadow:0 2px 12px rgba(212,166,63,0.2);}
        .dp-sp-card:hover{border-color:var(--gm);}
        .dp-sp-card-img{height:64px;overflow:hidden;position:relative;}
        .dp-sp-check{position:absolute;top:4px;right:4px;width:16px;height:16px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--gd);font-weight:800;}
        .dp-sp-card-body{padding:0.35rem 0.45rem;}
        .dp-sp-card-name{font-size:0.78rem;font-weight:700;color:var(--td);line-height:1.2;}
        .dp-sp-card-hint{font-size:0.68rem;color:var(--tm);margin-top:0.12rem;}
        .dp-sp-dots{display:flex;justify-content:center;gap:5px;margin-top:0.75rem;}
        .dp-dot-btn{width:6px;height:6px;border-radius:50%;background:#C8D4CE;border:none;cursor:pointer;padding:0;transition:all 0.22s ease;}
        .dp-dot-btn--on{width:18px;border-radius:3px;background:var(--gd);}
        .dp-dot-btn:hover:not(.dp-dot-btn--on){background:#A0B4AC;}

        /* ── SPECIES HERO IMAGE ── */
        .dp-sp-hero{border-radius:var(--r);overflow:hidden;position:relative;height:200px;box-shadow:var(--shadow);}
        .dp-sp-hero-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,31,23,0.88) 0%,transparent 55%);}
        .dp-sp-hero-caption{position:absolute;bottom:0;left:0;padding:1rem 1.15rem;}
        .dp-sp-hero-eyebrow{font-size:0.55rem;font-weight:800;color:rgba(255,255,255,0.55);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.22rem;}
        .dp-sp-hero-name{font-size:1.3rem;font-weight:900;color:#fff;line-height:1;}
        .dp-sp-hero-title{font-size:0.75rem;color:var(--gl);font-style:italic;margin-top:0.15rem;}

        /* ── TIER HERO IMAGE ── */
        .dp-tier-hero{border-radius:var(--r);overflow:hidden;position:relative;height:220px;margin-bottom:0.65rem;box-shadow:var(--shadow);}
        .dp-tier-hero-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,31,23,0.88) 0%,transparent 55%);}
        .dp-tier-hero-caption{position:absolute;bottom:0;left:0;padding:1rem 1.15rem;}
        .dp-tier-hero-name{font-size:1.3rem;font-weight:900;color:#fff;line-height:1;}
        .dp-tier-hero-sub{font-size:0.75rem;color:var(--gl);font-style:italic;margin-top:0.15rem;}

        /* ── IMPACT BAND ── */
        .dp-impact-band{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-top:0.65rem;}
        .dp-impact-item{background:#f0faf4;border:1px solid var(--md);border-radius:10px;padding:0.65rem 0.75rem;display:flex;flex-direction:column;gap:0.12rem;}
        .dp-impact-icon{font-size:0.9rem;}
        .dp-impact-val{font-size:0.95rem;font-weight:900;color:var(--gd);line-height:1;}
        .dp-impact-lbl{font-size:0.72rem;color:var(--tb);font-weight:500;}

        /* ── STORY CARD ── */
        .dp-story-card{padding:1.2rem;}
        .dp-badge{display:inline-block;font-size:0.55rem;font-weight:800;padding:0.13rem 0.5rem;border-radius:4px;letter-spacing:0.07em;margin-bottom:0.65rem;}
        .dp-story-name{font-size:1.35rem;font-weight:900;color:var(--gd);line-height:1.1;margin:0 0 0.2rem;}
        .dp-story-title{font-size:0.82rem;color:var(--ga);font-style:italic;font-weight:600;margin-bottom:0.75rem;}
        .dp-story-text{font-size:0.9rem;color:#2D3B36;line-height:1.7;margin-bottom:0.85rem;}
        .dp-story-benefits-label{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--tm);margin-bottom:0.5rem;}
        .dp-benefit{display:flex;align-items:flex-start;gap:0.38rem;font-size:0.85rem;color:var(--gm);font-weight:600;margin-bottom:0.32rem;}
        .dp-benefit-chk{color:var(--ga);font-weight:800;flex-shrink:0;font-size:0.82rem;}
        .dp-meta-tags{display:flex;flex-wrap:wrap;gap:0.28rem;margin-top:0.85rem;}
        .dp-meta-tag{font-size:0.72rem;background:var(--mt);color:var(--gd);padding:0.18rem 0.58rem;border-radius:999px;font-weight:600;}

        /* ── COMMUNITY TOGGLE ── */
        .dp-comm-toggle{margin-bottom:0.85rem;}
        .dp-comm-opts{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
        .dp-comm-opt{padding:0.7rem 0.85rem;border-radius:10px;border:2px solid var(--md);background:#fff;color:var(--gd);cursor:pointer;font-family:inherit;text-align:left;transition:all 0.15s;}
        .dp-comm-opt--on{border-color:var(--gd);background:var(--gd);color:#fff;}
        .dp-comm-amt{display:block;font-size:0.95rem;font-weight:900;line-height:1;margin-bottom:0.15rem;}
        .dp-comm-lbl{font-size:0.62rem;font-weight:600;opacity:0.8;}

        /* ── JOINT NOTE ── */
        .dp-joint-note{font-size:0.75rem;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #f59e0b;border-radius:8px;padding:0.5rem 0.75rem;margin-bottom:0.85rem;}

        /* ── QTY ── */
        .dp-qty-card{padding:0.9rem 1.1rem;}
        .dp-qty-row{display:flex;align-items:center;justify-content:space-between;}
        .dp-qty-label{font-size:0.95rem;font-weight:700;color:var(--tb);}
        .dp-qty-sub{font-size:0.78rem;color:var(--tm);margin-top:0.12rem;}
        .dp-qty-ctrl{display:flex;align-items:center;gap:0.6rem;}
        .dp-qty-btn{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--md);background:#fff;font-size:1rem;cursor:pointer;color:var(--gd);font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all 0.12s;}
        .dp-qty-btn:hover{background:var(--gd);color:#fff;border-color:var(--gd);}
        .dp-qty-num{font-size:1rem;font-weight:900;color:var(--gd);min-width:22px;text-align:center;}

        /* ── CTA ROW ── */
        .dp-cta-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:0.4rem;}
        .dp-cta-price-lbl{font-size:0.65rem;color:var(--tm);}
        .dp-cta-price-val{font-size:1.65rem;font-weight:900;color:var(--gd);line-height:1;}
        .dp-cta-btn{padding:0.82rem 1.4rem;background:var(--gd);color:var(--gold);border:none;border-radius:12px;font-size:0.9rem;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 4px 18px rgba(27,67,50,0.28);transition:all 0.18s;}
        .dp-cta-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .dp-cta-btn--miya{background:#7C3AED;color:#fff;box-shadow:0 4px 18px rgba(124,58,237,0.28);}
        .dp-cta-btn--gift{background:#7C3AED;color:#fff;box-shadow:0 4px 18px rgba(124,58,237,0.28);}
        .dp-cta-hint{font-size:0.8rem;color:var(--tm);text-align:center;margin-top:0.5rem;}

        /* ── GIFT MODE ── */
        .dp-occ-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.55rem;margin-bottom:0.5rem;}
        .dp-occ-card{position:relative;border:2px solid var(--md);border-radius:12px;padding:0.85rem 0.4rem;cursor:pointer;text-align:center;background:#fff;transition:all 0.18s;font-family:inherit;}
        .dp-occ-card--on{border-color:var(--ga);background:var(--mt);}
        .dp-occ-icon{font-size:1.4rem;margin-bottom:0.18rem;}
        .dp-occ-label{font-size:0.72rem;font-weight:700;color:var(--td);margin-bottom:0.12rem;}
        .dp-occ-price{font-size:0.75rem;font-weight:800;color:var(--gd);}
        .dp-occ-chk{position:absolute;top:0.28rem;right:0.28rem;width:14px;height:14px;background:var(--ga);color:#fff;border-radius:50%;font-size:0.55rem;display:flex;align-items:center;justify-content:center;font-weight:700;}
        .dp-gift-fields{display:flex;flex-direction:column;gap:0.75rem;}
        .dp-gift-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;}
        .dp-gift-field{display:flex;flex-direction:column;gap:0.3rem;}
        .dp-gift-field label{font-size:0.82rem;font-weight:700;color:var(--tb);}
        .dp-gift-field input,.dp-gift-field textarea{padding:0.68rem 0.85rem;border:1.5px solid var(--md);border-radius:9px;font-size:0.92rem;color:var(--td);background:#fff;outline:none;font-family:inherit;width:100%;transition:border-color 0.15s;}
        .dp-gift-field input:focus,.dp-gift-field textarea:focus{border-color:var(--ga);box-shadow:0 0 0 3px rgba(82,183,136,0.1);}
        .dp-gift-field textarea{resize:vertical;min-height:68px;}

        /* ── MOBILE STICKY CTA ── */
        .dp-mob-cta{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--gd);padding:10px 16px;z-index:200;align-items:center;justify-content:space-between;gap:12px;border-top:2px solid var(--gold);box-shadow:0 -4px 20px rgba(0,0,0,0.2);}
        .dp-mob-cta-left{}
        .dp-mob-cta-name{font-size:0.8rem;color:rgba(255,255,255,0.8);font-weight:700;}
        .dp-mob-cta-price{font-size:1.2rem;font-weight:900;color:var(--gold);line-height:1.2;}
        .dp-mob-cta-btn{padding:0.72rem 1.2rem;background:var(--gold);color:var(--gd);border:none;border-radius:10px;font-size:0.88rem;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;}

        /* ── BELOW FOLD ── */
        .dp-sec{padding:2.5rem 0;}
        .dp-sec--white{background:#fff;}
        .dp-sec--faq{background:var(--ow);}
        .dp-sec--how{background:#fff;border-top:1px solid var(--md);border-bottom:1px solid var(--md);}
        .dp-sec-label{display:inline-block;font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ga);background:rgba(82,183,136,0.12);padding:0.32rem 0.95rem;border-radius:999px;margin-bottom:1.2rem;}
        .dp-sec-h2{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;line-height:1.18;color:var(--td);margin:0 0 1.35rem;}
        .dp-sec-h2 em{color:var(--ga);font-style:normal;}
        .dp-how{display:flex;align-items:flex-start;margin-top:1.5rem;}
        .dp-how-item{flex:1;min-width:110px;text-align:center;padding:1.1rem 0.6rem;background:#fff;border-radius:var(--r);border:1px solid var(--md);margin:0 0.15rem;box-shadow:0 1px 6px rgba(27,67,50,0.04);}
        .dp-how-icon{font-size:1.8rem;margin-bottom:0.4rem;}
        .dp-how-n{font-size:0.68rem;font-weight:700;color:var(--ga);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.28rem;}
        .dp-how-t{font-size:0.95rem;font-weight:800;color:var(--gd);margin-bottom:0.28rem;}
        .dp-how-d{font-size:0.82rem;color:var(--tm);line-height:1.5;}
        .dp-how-arr{font-size:1.1rem;color:var(--ga);padding-top:2.8rem;flex-shrink:0;opacity:0.4;}
        .dp-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
        .dp-gallery-item{border-radius:var(--r);overflow:hidden;border:1px solid var(--md);}
        .dp-gallery-cap{padding:0.75rem 0.9rem;background:#fff;}
        .dp-gallery-l{font-size:0.92rem;font-weight:700;color:var(--gd);margin-bottom:0.14rem;}
        .dp-gallery-s{font-size:0.8rem;color:var(--tm);}
        .dp-trust-strip{background:var(--gd);padding:1.25rem 0;}
        .dp-trust-strip-inner{display:grid;grid-template-columns:repeat(4,1fr);gap:0.85rem;}
        .dp-trust-item{display:flex;align-items:flex-start;gap:0.55rem;}
        .dp-trust-icon{font-size:1.2rem;flex-shrink:0;}
        .dp-trust-t{font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:0.1rem;}
        .dp-trust-s{font-size:0.75rem;color:rgba(255,255,255,0.65);line-height:1.4;}
        .dp-bcta{background:var(--mt);padding:0.9rem 0;border-top:1px solid var(--md);}
        .dp-bcta-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .dp-bcta-text{font-size:0.92rem;font-weight:600;color:var(--gd);}
        .dp-bcta-btns{display:flex;gap:0.5rem;}
        .dp-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;font-size:0.85rem;font-weight:600;padding:0.55rem 1.2rem;border-radius:999px;text-decoration:none;cursor:pointer;border:none;transition:all 0.2s;font-family:inherit;white-space:nowrap;}
        .dp-btn--p{background:var(--gd);color:#fff;}
        .dp-btn--wa{background:#25D366;color:#fff;}

        /* ── RESPONSIVE ── */
        @media(max-width:860px){
          .dp-layout{grid-template-columns:1fr;}
          .dp-amazon-layout{grid-template-columns:1fr;}
          .dp-tier-amazon-layout{grid-template-columns:1fr;}
          .dp-amazon-img{aspect-ratio:unset;height:200px;}
          .dp-tier-amazon-img{aspect-ratio:unset;height:200px;}
          .dp-indiv-main{grid-template-columns:1fr;}
          .dp-indiv-img{aspect-ratio:unset;height:200px;}
          .dp-trust-strip-inner{grid-template-columns:repeat(2,1fr);}
          .dp-gallery{grid-template-columns:1fr 1fr;}
          .dp-mob-cta{display:flex;}
          .dp-main{padding-bottom:90px;}
          .dp-sp-hero{height:200px;}
          .dp-tier-hero{height:200px;}
          /* Switch species selector: show text pills, hide image carousel */
          .dp-sp-pills-mob{display:flex;}
          .dp-thumb-strip-desk{display:none;}
          .dp-card{padding:0.85rem 0.95rem;}
          .dp-story-text{font-size:0.82rem;line-height:1.55;}
          .dp-impact-band{grid-template-columns:repeat(3,1fr);}
        }
        @media(max-width:600px){
          .dp-trust-signals .dp-dot:nth-child(n+6){display:none;}
          .dp-trust-signals span:nth-child(n+7){display:none;}
          .dp-sp-card{flex:0 0 calc(50% - 4px);}
          .dp-thumb{flex:0 0 calc(25% - 5px) !important;}
          .dp-thumb-img{aspect-ratio:unset !important;height:48px !important;}
          .dp-thumb-name{font-size:0.58rem !important;padding:0.22rem 0.28rem !important;}
          .dp-sp3-card{flex:0 0 calc(50% - 5px);}
          .dp-sp3-img{height:75px;}
          .dp-occ-grid{grid-template-columns:repeat(2,1fr);}
          .dp-gift-row{grid-template-columns:1fr;}
          .dp-gallery{grid-template-columns:1fr;}
          .dp-how{flex-wrap:wrap;gap:0.85rem;}
          .dp-how-arr{display:none;}
          .dp-how-item{flex:0 0 calc(50% - 0.5rem);margin:0;}
          .dp-bcta-inner{flex-direction:column;align-items:stretch;}
          .dp-bcta-btns{flex-direction:column;}
          .dp-trust-strip-inner{grid-template-columns:1fr 1fr;}
          .dp-cta-row{flex-wrap:wrap;}
          .dp-cta-btn{width:100%;padding:0.95rem;font-size:1rem;}
          .dp-tier-bar-inner{flex-direction:column;align-items:stretch;gap:0.42rem;}
          .dp-mode-pills{display:flex;justify-content:center;gap:0.5rem;}
          .dp-tier-pills{display:flex;flex-direction:row;flex-wrap:nowrap;gap:0.3rem;overflow:visible;}
          .dp-pill{flex:1;padding:0.32rem 0.25rem;min-width:0;align-items:center;text-align:center;}
          .dp-pill-amt{font-size:0.72rem;white-space:nowrap;margin-bottom:0.08rem;}
          .dp-pill-sub{font-size:0.56rem;white-space:nowrap;opacity:0.75;}
          .dp-pill-star-badge{font-size:0.48rem;margin-bottom:0.06rem;}
          .dp-story-name{font-size:1.2rem;}
          .dp-sp-hero{height:210px;}
          .dp-tier-hero{height:210px;}
          .dp-indiv-img-name{font-size:1.2rem;}
          .dp-main{padding:0.75rem 0 90px;}
          .dp-impact-val{font-size:0.82rem;}
          .dp-impact-band{gap:0.4rem;}
          .dp-impact-item{padding:0.5rem 0.55rem;}
          .dp-impact-lbl{font-size:0.6rem;}
          .dp-qty-btn{width:34px;height:34px;}
          .dp-qty-num{font-size:1.1rem;}
          .dp-mob-cta-price{font-size:1.2rem;}
          .dp-mob-cta-name{font-size:0.78rem;}
        }
        @media(max-width:380px){
          .dp-hero-h1{font-size:1.5rem;}
          .dp-pill-amt{font-size:0.75rem;}
          .dp-pill-sub{font-size:0.6rem;}
        }
      `}</style>
    </main>
  )
}

function FAQ() {
  const [o, setO] = useState<number|null>(null)
  const qs = [
    {q:'What is the difference between Community and Individual?',a:'Community (₹100/₹250) contributes to our shared forest — you get a certificate and dashboard but no individual tree ID. Individual (₹1000) plants a specific tree in your name with GPS tracking, photos and AI health scores.'},
    {q:'How does the Joint Tree (₹500) work?',a:'Two people each donate ₹500 — together ₹1000 plants one tree. You are auto-matched with one other donor. Once matched, both receive the shared tree dashboard with GPS, photos and health updates.'},
    {q:'When will I receive my certificate?',a:'Your PDF certificate is emailed instantly after payment. Community donors get a Community Forest Certificate. Individual donors get a personalized tree certificate.'},
    {q:'How do I know my tree was actually planted?',a:'Within 7 days, our field team plants and GPS-tags your tree. Claude AI verifies the photo — species, GPS, timestamp, health — before it appears on your dashboard.'},
    {q:'How do I claim the 80G tax benefit?',a:'Provide your PAN on the thank-you page after payment. EcoTree Impact Foundation is a registered Section 8 company with 80G approval.'},
    {q:'What is the Miyawaki Forest option?',a:'Miyawaki creates dense micro-forests with 30+ native species — 10x faster growth, 30x more biodiversity. At ₹5,000 you sponsor one forest patch and get a dedicated forest dashboard with BRSR-compatible reports.'},
  ]
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.6rem',marginTop:'1.5rem'}}>
      {qs.map((f,i)=>(
        <div key={i} style={{border:'1px solid #B7E4C7',borderRadius:'0.6rem',overflow:'hidden'}}>
          <button onClick={()=>setO(o===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',padding:'1rem 1.1rem',fontSize:'0.92rem',fontWeight:600,color:'#1B4332',background:o===i?'#D8F3DC':'#F8FAF8',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'background 0.15s'}}>
            <span>{f.q}</span><span style={{fontSize:'1.2rem',color:'#52B788',flexShrink:0}}>{o===i?'−':'+'}</span>
          </button>
          {o===i&&<div style={{padding:'0.9rem 1.1rem',fontSize:'0.9rem',lineHeight:1.7,color:'#2D3B36',background:'#fff',borderTop:'1px solid #B7E4C7'}}>{f.a}</div>}
        </div>
      ))}
    </div>
  )
}
