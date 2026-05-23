'use client'
import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const WHATSAPP = '919886094611'
const SITE_URL = 'https://ecotrees.org/donate'
const WA_MSG = encodeURIComponent(`India's only NGO where you can see your tree growing live.\nPlant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit\n${SITE_URL}`)

const TIERS = [
  { id:'community_100', tier:'100', icon:'🌿', name:'Community Contributor', price:100, co2:'~5kg', water:'~200L', tag:'❤️ Most Accessible', tagColor:'#52B788', desc:'Join our community forest. Certificate in your name.', what:['Community forest certificate','Impact dashboard access','Project participation invites','Community tree tracking'], img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', species:null, occasionIds:[], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'community_250', tier:'250', icon:'🌱', name:'Community Supporter', price:250, co2:'~5kg', water:'~200L', tag:'🌿 Great Value', tagColor:'#2D6A4F', desc:'Support our community forest with greater impact.', what:['Community forest certificate','Impact dashboard access','Priority project invites','Community tree tracking'], img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', species:null, occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788' },
  { id:'joint_500', tier:'500', icon:'🤝', name:'Joint Tree Donor', price:500, co2:'~11kg', water:'~500L', tag:'👥 Share a Tree', tagColor:'#F59E0B', desc:'Pool with 1 stranger — together you plant 1 tree.', what:['Individual tree certificate','Shared tree dashboard','GPS location on map','Before & after photos','Species preference'], img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80', species:['Neem','Peepal','Mango','Jamun','Any'], occasionIds:['birthday','anniversary','festival','baby'], dashboard:'/my-tree', badge:'JOINT', badgeColor:'#F59E0B' },
  { id:'individual_1000', tier:'1000', icon:'🌳', name:'Individual Tree', price:1000, co2:'~22kg', water:'~1,000L', tag:'⭐ Most Popular', tagColor:'#1B4332', desc:'Your own tree. Full dashboard. GPS tracked for 3 years.', what:['Individual tree certificate','Personal tree dashboard','GPS location on map','Before & after photos','AI health score','80G tax receipt','Guaranteed species'], img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', species:['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar'], occasionIds:['birthday','anniversary','memory','festival','baby','corporate','custom'], dashboard:'/my-tree', badge:'INDIVIDUAL', badgeColor:'#1B4332' },
  { id:'miyawaki_5000', tier:'5000', icon:'🏙️', name:'Miyawaki Forest', price:5000, co2:'~200kg', water:'~8,000L', tag:'🔥 Premium Impact', tagColor:'#7C3AED', desc:'30+ native species. Dense urban forest. 10x faster growth.', what:['Forest impact certificate','Miyawaki forest dashboard','GPS forest location','Species diversity report','BRSR-compatible report','80G tax receipt','Donor wall recognition'], img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80', species:null, occasionIds:['corporate','custom'], dashboard:'/miyawaki-dashboard', badge:'FOREST', badgeColor:'#7C3AED' },
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

function makeCertId() { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }
function generateTreeId() { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }

async function sendEmail(type: string, donor: Record<string, any>) {
  try { await fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, donor }) }) }
  catch (err) { console.error('Email send failed:', err) }
}

interface FormErrors { name?: string; email?: string; phone?: string; recipientName?: string; recipientEmail?: string; species?: string }

export default function DonatePage() {
  const [mode, setMode]       = useState<'plant'|'gift'>('plant')
  const [tier, setTier]       = useState(TIERS[3])
  const [occ,  setOcc]        = useState(OCCASIONS[0])
  const [species, setSpecies] = useState('')
  const [qty,  setQty]        = useState(1)
  const [loading, setLoading] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [certId]              = useState(makeCertId)
  const formRef               = useRef<HTMLDivElement>(null)
  const detailRef             = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', birthday:'', anniversary:'', recipientName:'', recipientEmail:'', giftMessage:'' })

  const sf = (k: string, v: string) => { setForm(p=>({...p,[k]:v})); if (errors[k as keyof FormErrors]) setErrors(p=>({...p,[k]:undefined})) }
  const total = mode === 'gift' ? occ.price : tier.price * qty

  const pickTier = (t: typeof TIERS[0]) => {
    setTier(t); setSpecies(''); setQty(1)
    if (t.occasionIds.length > 0) setOcc(OCCASIONS.find(o => t.occasionIds.includes(o.id)) || OCCASIONS[0])
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)

  const copyLink = () => { navigator.clipboard.writeText(SITE_URL); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/[\s+\-()]/g,''))) e.phone = 'Please enter a valid 10-digit Indian mobile number'
    if (mode === 'gift') {
      if (!form.recipientName.trim()) e.recipientName = 'Please enter recipient name'
      if (!form.recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) e.recipientEmail = 'Please enter a valid recipient email'
    }
    if (tier.species && tier.id === 'individual_1000' && !species) e.species = 'Please select a species'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (loading) return
    if (!validate()) { scrollToForm(); return }
    setLoading(true)
    try {
      let donorId: number
      let isNewDonor = false
      const { data: existing } = await supabase.from('donors').select('id, total_trees, total_donated').eq('email', form.email).eq('tier', tier.tier).maybeSingle()
      if (existing) {
        donorId = existing.id
        await supabase.from('donors').update({
          total_trees: (tier.id === 'joint_500' || tier.id === 'community_100' || tier.id === 'community_250') ? (existing.total_trees || 0) : (existing.total_trees || 0) + 1,
          total_donated: (Number(existing.total_donated) || 0) + total,
          phone: form.phone, address: form.address || null, birthday: form.birthday || null, anniversary: form.anniversary || null,
        }).eq('id', donorId)
      } else {
        const { data: newDonor, error: donorErr } = await supabase.from('donors').insert({
          name: form.name, email: form.email, phone: form.phone,
          address: form.address || null, birthday: form.birthday || null, anniversary: form.anniversary || null,
          total_trees: (tier.id === 'joint_500' || tier.id === 'community_100' || tier.id === 'community_250') ? 0 : 1,
          total_donated: total, city: 'Bangalore',
          is_gift: mode === 'gift',
          gift_from_name: mode === 'gift' ? form.name : null,
          gift_from_email: mode === 'gift' ? form.email : null,
          gift_occasion: mode === 'gift' ? occ.label : null,
          gift_message: mode === 'gift' ? form.giftMessage : null,
          tier: tier.tier,
        }).select('id').single()
        if (donorErr || !newDonor) throw new Error(donorErr?.message || 'Failed to create donor')
        donorId = newDonor.id
        isNewDonor = true
        await fetch('/api/create-donor', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, password:'123456', name:form.name, donorId }) })
      }
      let treeId = ''
      if (tier.id === 'community_100' || tier.id === 'community_250') {
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:mode==='gift'?occ.id:null, occasion_label:mode==='gift'?occ.label:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:certId, species:'Community Forest', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard })
      } else if (tier.id === 'joint_500') {
        for (let qi = 0; qi < qty; qi++) {
          const thisCertId = qi === 0 ? certId : makeCertId()
          const { data: allOpenPools } = await supabase.from('tree_pools').select('*').eq('tier','500').eq('status','OPEN').order('created_at', { ascending:true })
          let targetPool = null
          for (const pool of (allOpenPools || [])) {
            const { data: mem } = await supabase.from('tree_pool_members').select('id').eq('pool_id', pool.id).eq('donor_id', donorId).maybeSingle()
            if (!mem) { targetPool = pool; break }
          }
          if (targetPool) {
            await supabase.from('tree_pool_members').insert({ pool_id:targetPool.id, donor_id:donorId, amount:500, is_gift:mode==='gift', gift_from_name:mode==='gift'?form.name:null, gift_occasion:mode==='gift'?occ.label:null })
            const newFilled = targetPool.slots_filled + 1
            const newCollected = targetPool.amount_collected + 500
            if (newFilled >= targetPool.slots_total) {
              treeId = generateTreeId()
              const { data: firstMember } = await supabase.from('tree_pool_members').select('donor_id').eq('pool_id', targetPool.id).order('created_at', { ascending:true }).limit(1).single()
              const { data: newTree } = await supabase.from('trees').insert({ tree_id:treeId, tree_type:'Joint Tree', species:species||'Neem', status:'PENDING', donor_id:firstMember?.donor_id||donorId, planting_date:new Date().toISOString().split('T')[0] }).select('id').single()
              await supabase.from('tree_pools').update({ slots_filled:newFilled, amount_collected:newCollected, status:'COMPLETE', tree_id:newTree?.id, completed_at:new Date().toISOString() }).eq('id', targetPool.id)
              const { data: members } = await supabase.from('tree_pool_members').select('donor_id, donors(name, email, total_trees)').eq('pool_id', targetPool.id)
              for (const m of members || []) {
                const d = Array.isArray(m.donors) ? m.donors[0] : m.donors as any
                await supabase.from('donors').update({ total_trees:(d?.total_trees||0)+1 }).eq('id', m.donor_id)
                if (d?.email) await sendEmail('welcome', { name:d.name, email:d.email, tree_id:treeId, species:species||'Neem', password:'123456', tier:'500', dashboard:'/my-tree', joint:true, matched:true, partner:(members||[]).filter((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.email!==d.email}).map((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.name})[0]||'your co-donor' })
              }
            } else {
              await supabase.from('tree_pools').update({ slots_filled:newFilled, amount_collected:newCollected }).eq('id', targetPool.id)
              await sendEmail('welcome', { name:form.name, email:form.email, tree_id:thisCertId, species:species||'Any native species', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard, waiting:true })
            }
          } else {
            const { data: newPool } = await supabase.from('tree_pools').insert({ tier:'500', slots_total:2, slots_filled:1, amount_collected:500, target_amount:1000, status:'OPEN' }).select('id').single()
            await supabase.from('tree_pool_members').insert({ pool_id:newPool?.id, donor_id:donorId, amount:500, is_gift:mode==='gift', gift_from_name:mode==='gift'?form.name:null, gift_occasion:mode==='gift'?occ.label:null })
            await sendEmail('welcome', { name:form.name, email:form.email, tree_id:thisCertId, species:species||'Any native species', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard, waiting:true })
          }
        }
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:mode==='gift'?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
      } else if (tier.id === 'individual_1000') {
        for (let qi = 0; qi < qty; qi++) {
          treeId = generateTreeId()
          await supabase.from('trees').insert({ tree_id:treeId, donor_id:donorId, tree_type:tier.name, species:species||'Neem', status:'PENDING', planting_date:new Date().toISOString().split('T')[0] })
        }
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, species:species||'Neem', amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:mode==='gift'?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:treeId, species:species||'Neem', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard })
      } else if (tier.id === 'miyawaki_5000') {
        await supabase.from('miyawaki_donors').insert({ donor_id:donorId, amount:5000, is_gift:mode==='gift', gift_from_name:mode==='gift'?form.name:null, gift_occasion:mode==='gift'?occ.label:null })
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:mode==='gift'?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:certId, species:'30+ native species (Miyawaki)', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard })
      }
      sessionStorage.setItem('ecotree_ty', JSON.stringify({ certId, name:form.name, email:form.email, phone:form.phone, treeName:mode==='gift'?`${occ.icon} ${occ.label} Gift`:tier.name, species:species||tier.name, co2:tier.co2||'~22kg', amount:total, mode, tierId:tier.id, tierBadge:tier.badge, recipientName:form.recipientName, recipientEmail:form.recipientEmail, occasion:occ.label, giftMessage:form.giftMessage, treeId, donorId, dashboard:tier.dashboard }))
      setLoading(false)
      window.location.href = '/thank-you'
    } catch (err: any) {
      console.error('Donation error:', err)
      alert('Something went wrong: ' + (err.message || 'Please try again.'))
      setLoading(false)
    }
  }

  const payBtnLabel = () => {
    if (loading) return '⏳ Saving...'
    if (tier.id === 'community_100' || tier.id === 'community_250') return `🌿 Join Community Forest · ₹${total}`
    if (tier.id === 'joint_500') return `🤝 Join Tree Pool · ₹${total}`
    if (tier.id === 'miyawaki_5000') return `🏙️ Sponsor Miyawaki Forest · ₹${total}`
    return `🌳 Plant My Tree · ₹${total.toLocaleString('en-IN')}`
  }

  const Err = ({ msg }: { msg?: string }) => msg ? <div style={{fontSize:'0.76rem',color:'#dc2626',marginTop:'3px',display:'flex',alignItems:'center',gap:'4px'}}>⚠️ {msg}</div> : null


  // ─── SPECIES DATA — 12 species with emotional content ───
  const SPECIES_DATA = [
    { id:'banyan', name:'Banyan', title:'The Tree of Generations', story:'Massive canopy. Deep roots. A living shelter for generations and wildlife alike.', benefits:['Highway shade','Wildlife support','Long lifespan'], img:'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80', color:'#1B4332' },
    { id:'neem', name:'Neem', title:'The Healing Tree', story:"Nature's pharmacy. Purifies air, enriches soil and supports life around it.", benefits:['Air purification','Medicinal value','Pest resistance'], img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', color:'#2D6A4F' },
    { id:'raintree', name:'Rain Tree', title:'The Giant Canopy', story:'Creates extraordinary cooling shade across entire streets and communities.', benefits:['Massive shade','Fast growth','Urban cooling'], img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', color:'#1a5c2a' },
    { id:'honge', name:'Honge', title:'The Resilient Native', story:'Exceptionally tough and adaptive. Thrives where others struggle.', benefits:['Drought resistant','Soil enrichment','Native species'], img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80', color:'#166534' },
    { id:'ashoka', name:'Ashoka', title:'The Graceful Sentinel', story:'Tall, narrow and elegant. A natural screen of living green year-round.', benefits:['Road beautification','Narrow footprint','Air cleaner'], img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80', color:'#14532d' },
    { id:'gulmohar', name:'Gulmohar', title:'The Flame of Nature', story:'Transforms the landscape with spectacular red-orange blooms every summer.', benefits:['Seasonal beauty','Roadside appeal','Shade canopy'], img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', color:'#7c2d12' },
    { id:'jamun', name:'Jamun', title:'The Community Tree', story:'Pollution-resistant with edible black plum fruits loved by birds and people.', benefits:['Pollution resistant','Edible fruits','Wildlife food'], img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', color:'#3730a3' },
    { id:'amaltas', name:'Amaltas', title:'The Golden Shower', story:'Brilliant yellow blooms cascade every April — a spectacular urban spectacle.', benefits:['Golden blooms','Ornamental beauty','Shade support'], img:'https://images.unsplash.com/photo-1490750967868-88df5691cc9f?w=800&q=80', color:'#854d0e' },
    { id:'arjun', name:'Arjun', title:'The Fast Grower', story:"One of India's fastest-growing shade trees with powerful medicinal bark.", benefits:['Fast growth','Medicinal bark','Dense shade'], img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', color:'#166534' },
    { id:'imli', name:'Imli', title:'The Ancient Root', story:'Deep, strong roots that have anchored Indian villages for centuries.', benefits:['Deep roots','Edible fruit','Erosion control'], img:'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80', color:'#78350f' },
    { id:'mahogany', name:'Mahogany', title:'The Wind Warrior', story:'Straight trunk, dense canopy, remarkably wind-resistant in urban environments.', benefits:['Wind resistant','Straight form','Carbon capture'], img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', color:'#1c1917' },
    { id:'atti', name:'Atti (Cluster Fig)', title:'The Wildlife Magnet', story:'A small tree with massive ecological impact — attracts birds, bees and butterflies.', benefits:['Wildlife habitat','Attracts pollinators','Native ecosystem'], img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80', color:'#14532d' },
  ]

  // community sub-tier state — tracks ₹100 vs ₹250 toggle
  const [commLevel, setCommLevel] = React.useState<100|250>(100)
  const [spCarouselIdx, setSpCarouselIdx] = React.useState(0)
  const [selSpeciesIdx, setSelSpeciesIdx] = React.useState(0)
  const PER_VIEW = 3

  const selSp = SPECIES_DATA[selSpeciesIdx]

  const pickSpecies = (idx: number) => {
    setSelSpeciesIdx(idx)
    setSpecies(SPECIES_DATA[idx].name)
  }

  const slideLeft  = () => setSpCarouselIdx(i => Math.max(0, i - 1))
  const slideRight = () => setSpCarouselIdx(i => Math.min(SPECIES_DATA.length - PER_VIEW, i + 1))

  // community tier total override
  const effectiveTotal = (tier.id === 'community_100' || tier.id === 'community_250')
    ? (mode === 'gift' ? occ.price : commLevel * qty)
    : total

  // ─── SHARED STYLE HELPERS ───
  const S = {
    impactBand: { display:'grid' as const, gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem', margin:'0.85rem 0' },
    impactItem: { background:'#f0faf4', border:'1px solid #B7E4C7', borderRadius:'10px', padding:'0.7rem 0.85rem', display:'flex', flexDirection:'column' as const, gap:'0.15rem' },
    impactIcon: { fontSize:'1rem' },
    impactVal:  { fontSize:'1rem', fontWeight:900, color:'#1B4332', lineHeight:1 as const },
    impactLbl:  { fontSize:'0.65rem', color:'#4A6358', lineHeight:1.3 as const },
    sectionLbl: { fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.11em', color:'#4A6358', marginBottom:'0.6rem' },
    photoWrap:  { borderRadius:'18px', overflow:'hidden' as const, position:'relative' as const, height:'260px', marginBottom:'0.85rem' },
    photoOverlay: { position:'absolute' as const, inset:0, background:'linear-gradient(to top,rgba(11,31,23,0.82) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)' },
    photoCaption: { position:'absolute' as const, bottom:0, left:0, padding:'1.1rem 1.3rem' },
    featureItem: { display:'flex', alignItems:'flex-start' as const, gap:'0.4rem', fontSize:'0.78rem', color:'#2D6A4F', fontWeight:500 as const },
    metaRow: { display:'flex', flexWrap:'wrap' as const, gap:'0.4rem', margin:'0.5rem 0 0.85rem' },
    metaTag: { fontSize:'0.68rem', background:'#D8F3DC', color:'#1B4332', padding:'0.18rem 0.55rem', borderRadius:'999px', fontWeight:600 as const },
    ctaBtn: (isGift: boolean) => ({ width:'100%', padding:'0.95rem', background:isGift?'#7C3AED':'#1B4332', color:isGift?'#fff':'#D4A63F', border:'none', borderRadius:'12px', fontSize:'0.97rem', fontWeight:700 as const, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontFamily:'inherit', boxShadow:isGift?'0 4px 20px rgba(124,58,237,0.3)':'0 4px 20px rgba(27,67,50,0.3)', marginBottom:'0.6rem', transition:'all 0.2s' }),
    qtyWrap: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1.5px solid #B7E4C7', borderRadius:'12px', padding:'0.85rem 1rem', margin:'0.85rem 0' },
    qtyBtn: { width:'30px', height:'30px', borderRadius:'50%', border:'2px solid #B7E4C7', background:'#fff', fontSize:'1rem', cursor:'pointer', color:'#1B4332', fontFamily:'inherit', lineHeight:1 as const, transition:'all 0.12s' },
  }

  return (
    <main style={{fontFamily:"var(--font-body,'Segoe UI',system-ui,sans-serif)",background:'#F4F7F4',color:'#0D1F17',minHeight:'100vh'}}>

      {/* ══ ZONE 1: TRUST BAR ══ */}
      <div style={{background:'#1B4332',borderBottom:'1px solid rgba(82,183,136,0.2)',padding:'0.45rem 0',position:'sticky',top:'80px',zIndex:50}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',fontSize:'0.7rem',fontWeight:600,color:'rgba(255,255,255,0.6)'}}>
            <span>🌱 10,000+ trees</span><span style={{opacity:0.35}}>·</span>
            <span>🎯 91% survival</span><span style={{opacity:0.35}}>·</span>
            <span>🤖 AI-verified</span><span style={{opacity:0.35}}>·</span>
            <span>🧾 80G approved</span><span style={{opacity:0.35}}>·</span>
            <span>📍 GPS-tagged</span>
          </div>
          <div style={{display:'flex',gap:'0.4rem',flexShrink:0}}>
            <a href={`https://wa.me/?text=${WA_MSG}`} target="_blank" rel="noopener" style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',fontSize:'0.7rem',fontWeight:700,padding:'0.28rem 0.75rem',borderRadius:'999px',background:'#25D366',color:'#fff',textDecoration:'none'}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share
            </a>
            <button onClick={copyLink} style={{fontSize:'0.7rem',fontWeight:700,padding:'0.28rem 0.75rem',borderRadius:'999px',background:'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,255,255,0.18)',cursor:'pointer'}}>{copied?'✓ Copied!':'🔗 Copy'}</button>
          </div>
        </div>
      </div>

      {/* ══ ZONE 2: HERO BANNER — compact, no image ══ */}
      <div style={{background:'#1B4332',padding:'1.6rem 0 1.4rem',position:'relative',overflow:'hidden',borderBottom:'2px solid rgba(82,183,136,0.22)'}}>
        <svg viewBox="0 0 280 360" fill="none" style={{position:'absolute',right:0,bottom:0,height:'100%',width:'auto',opacity:0.05,pointerEvents:'none'}} aria-hidden="true">
          <path d="M140 350L140 155" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          <path d="M140 155L100 220L72 188L112 135L85 162L55 115L103 85L76 115L92 55L140 22L188 55L204 115L187 85L225 115L195 162L228 135L168 188L180 220Z" fill="white"/>
        </svg>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2.5rem',alignItems:'center',position:'relative',zIndex:1}}>
          <div>
            <div style={{fontSize:'0.65rem',fontWeight:700,color:'#74C69D',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.45rem'}}>India's only NGO where you can see your tree growing live</div>
            <h1 style={{fontSize:'clamp(1.7rem,3.2vw,2.6rem)',fontWeight:900,color:'#fff',lineHeight:0.95,letterSpacing:'-0.03em',marginBottom:'0.55rem'}}>Plant a<br/><span style={{color:'#74C69D'}}>Living Legacy</span></h1>
            <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginBottom:'1rem',letterSpacing:'0.03em'}}>AI-verified · GPS-tagged · 3yr tracking · 80G tax benefit</p>
            {/* COMPACT TOGGLE PILLS */}
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              <button onClick={()=>setMode('plant')} style={{padding:'0.45rem 1.1rem',borderRadius:'999px',fontFamily:'inherit',fontSize:'0.82rem',fontWeight:700,cursor:'pointer',border:`1.5px solid ${mode==='plant'?'#52B788':'rgba(255,255,255,0.2)'}`,background:mode==='plant'?'#2D6A4F':'transparent',color:mode==='plant'?'#fff':'rgba(255,255,255,0.65)',transition:'all 0.18s',whiteSpace:'nowrap' as const}}>🌱 Plant For Myself</button>
              <button onClick={()=>setMode('gift')} style={{padding:'0.45rem 1.1rem',borderRadius:'999px',fontFamily:'inherit',fontSize:'0.82rem',fontWeight:700,cursor:'pointer',border:`1.5px solid ${mode==='gift'?'#7C3AED':'rgba(255,255,255,0.2)'}`,background:mode==='gift'?'#7C3AED':'transparent',color:'#fff',transition:'all 0.18s',whiteSpace:'nowrap' as const}}>🎁 Gift a Tree</button>
            </div>
          </div>
          {/* TIER PILLS — right side, compact */}
          <div>
            <div style={{fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',color:'rgba(255,255,255,0.35)',marginBottom:'0.65rem'}}>Choose contribution</div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {/* Community — single pill */}
              <button onClick={()=>pickTier(TIERS[0])} style={{padding:'0.5rem 0.9rem',borderRadius:'10px',border:`1.5px solid ${(tier.id==='community_100'||tier.id==='community_250')?'#fff':'rgba(255,255,255,0.2)'}`,background:(tier.id==='community_100'||tier.id==='community_250')?'#fff':'rgba(255,255,255,0.07)',color:(tier.id==='community_100'||tier.id==='community_250')?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s',textAlign:'left' as const}}>
                <div style={{fontSize:'0.72rem',fontWeight:900,lineHeight:1,marginBottom:'0.15rem'}}>₹100/₹250</div>
                <div style={{fontSize:'0.62rem',fontWeight:600,opacity:0.75}}>Community</div>
              </button>
              {/* Joint */}
              <button onClick={()=>pickTier(TIERS[2])} style={{padding:'0.5rem 0.9rem',borderRadius:'10px',border:`1.5px solid ${tier.id==='joint_500'?'#fff':'rgba(255,255,255,0.2)'}`,background:tier.id==='joint_500'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='joint_500'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s',textAlign:'left' as const}}>
                <div style={{fontSize:'0.72rem',fontWeight:900,lineHeight:1,marginBottom:'0.15rem'}}>₹500</div>
                <div style={{fontSize:'0.62rem',fontWeight:600,opacity:0.75}}>Shared Tree</div>
              </button>
              {/* Individual — most loved */}
              <button onClick={()=>pickTier(TIERS[3])} style={{padding:'0.5rem 0.9rem',borderRadius:'10px',border:`1.5px solid ${tier.id==='individual_1000'?'#fff':'rgba(255,255,255,0.2)'}`,background:tier.id==='individual_1000'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='individual_1000'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s',textAlign:'left' as const}}>
                <div style={{fontSize:'0.6rem',fontWeight:800,color:'#D4A63F',letterSpacing:'0.06em',marginBottom:'0.1rem'}}>★ MOST LOVED</div>
                <div style={{fontSize:'0.72rem',fontWeight:900,lineHeight:1,marginBottom:'0.15rem'}}>₹1,000</div>
                <div style={{fontSize:'0.62rem',fontWeight:600,opacity:0.75}}>Individual</div>
              </button>
              {/* Miyawaki */}
              <button onClick={()=>pickTier(TIERS[4])} style={{padding:'0.5rem 0.9rem',borderRadius:'10px',border:`1.5px solid ${tier.id==='miyawaki_5000'?'#fff':'rgba(255,255,255,0.2)'}`,background:tier.id==='miyawaki_5000'?'#fff':'rgba(255,255,255,0.07)',color:tier.id==='miyawaki_5000'?'#1B4332':'#fff',cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s',textAlign:'left' as const}}>
                <div style={{fontSize:'0.72rem',fontWeight:900,lineHeight:1,marginBottom:'0.15rem'}}>₹5,000</div>
                <div style={{fontSize:'0.62rem',fontWeight:600,opacity:0.75}}>Miyawaki</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ZONE 3: TWO COLUMNS ══ */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'1.5rem 1.5rem 4rem',display:'grid',gridTemplateColumns:'1fr 370px',gap:'1.5rem',alignItems:'start'}}>

        {/* ── ZONE 3A: TIER DETAIL ── */}
        <div ref={detailRef}>
          {mode==='plant' ? (
            <>
              {/* ══ ₹1,000 INDIVIDUAL TREE ══ */}
              {tier.id==='individual_1000' && (
                <>
                  {/* SPECIES CAROUSEL */}
                  <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'16px',padding:'1.1rem 1.2rem',marginBottom:'1rem'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.8rem'}}>
                      <div>
                        <div style={S.sectionLbl}>Choose your tree species</div>
                        <div style={{fontSize:'0.75rem',color:'#4A6358'}}>Each species has a unique story and impact</div>
                      </div>
                      <div style={{display:'flex',gap:'0.4rem'}}>
                        <button onClick={slideLeft} disabled={spCarouselIdx===0} style={{width:'28px',height:'28px',borderRadius:'8px',border:'1.5px solid #B7E4C7',background:'#fff',fontSize:'13px',cursor:spCarouselIdx===0?'not-allowed':'pointer',opacity:spCarouselIdx===0?0.3:1,color:'#1B4332',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                        <button onClick={slideRight} disabled={spCarouselIdx>=SPECIES_DATA.length-PER_VIEW} style={{width:'28px',height:'28px',borderRadius:'8px',border:'1.5px solid #B7E4C7',background:'#fff',fontSize:'13px',cursor:spCarouselIdx>=SPECIES_DATA.length-PER_VIEW?'not-allowed':'pointer',opacity:spCarouselIdx>=SPECIES_DATA.length-PER_VIEW?0.3:1,color:'#1B4332',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                      </div>
                    </div>
                    <div style={{overflow:'hidden'}}>
                      <div style={{display:'flex',gap:'0.6rem',transition:'transform 0.3s ease',transform:`translateX(calc(-${spCarouselIdx * (100/PER_VIEW)}% - ${spCarouselIdx * 0.6 / PER_VIEW}rem))`}}>
                        {SPECIES_DATA.map((sp,idx)=>(
                          <div key={sp.id} onClick={()=>pickSpecies(idx)} style={{flex:`0 0 calc(${100/PER_VIEW}% - 0.4rem)`,borderRadius:'12px',border:`2px solid ${selSpeciesIdx===idx?'#D4A63F':'#e2ddd5'}`,overflow:'hidden',cursor:'pointer',transition:'all 0.15s',background:'#fff',boxShadow:selSpeciesIdx===idx?'0 4px 14px rgba(212,166,63,0.2)':'none'}}>
                            <div style={{height:'80px',overflow:'hidden',position:'relative'}}>
                              <img src={sp.img} alt={sp.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}} loading="lazy"/>
                              {selSpeciesIdx===idx&&<div style={{position:'absolute',top:'5px',right:'5px',width:'18px',height:'18px',borderRadius:'50%',background:'#D4A63F',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#1B4332',fontWeight:800}}>✓</div>}
                            </div>
                            <div style={{padding:'0.5rem 0.6rem'}}>
                              <div style={{fontSize:'0.78rem',fontWeight:700,color:selSpeciesIdx===idx?'#1B4332':'#333',lineHeight:1.2}}>{sp.name}</div>
                              <div style={{fontSize:'0.65rem',color:'#6B7280',marginTop:'0.15rem',lineHeight:1.3}}>{sp.benefits[0]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Dots */}
                    <div style={{display:'flex',justifyContent:'center',gap:'4px',marginTop:'0.65rem'}}>
                      {Array.from({length:SPECIES_DATA.length-PER_VIEW+1}).map((_,i)=>(
                        <div key={i} onClick={()=>setSpCarouselIdx(i)} style={{width:i===spCarouselIdx?'14px':'5px',height:'5px',borderRadius:'3px',background:i===spCarouselIdx?'#1B4332':'#d0ccc4',cursor:'pointer',transition:'all 0.2s'}}/>
                      ))}
                    </div>
                    <Err msg={errors.species}/>
                  </div>

                  {/* SELECTED SPECIES — emotional visual + story */}
                  <AnimatePresence mode="wait">
                    <motion.div key={selSp.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}>
                      {/* BIG CINEMATIC IMAGE */}
                      <div style={S.photoWrap}>
                        <img src={selSp.img} alt={selSp.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                        <div style={S.photoOverlay}/>
                        <div style={S.photoCaption}>
                          <div style={{fontSize:'0.6rem',fontWeight:800,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.3rem'}}>YOUR TREE</div>
                          <div style={{fontSize:'1.5rem',fontWeight:900,color:'#fff',lineHeight:1,marginBottom:'0.2rem'}}>{selSp.name}</div>
                          <div style={{fontSize:'0.9rem',fontWeight:600,color:'#74C69D',fontStyle:'italic'}}>{selSp.title}</div>
                        </div>
                      </div>
                      {/* STORY + BENEFITS */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'0.85rem'}}>
                        <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'12px',padding:'0.9rem 1rem'}}>
                          <div style={S.sectionLbl}>The Story</div>
                          <p style={{fontSize:'0.82rem',color:'#2D3B36',lineHeight:1.65,margin:0}}>{selSp.story}</p>
                        </div>
                        <div style={{background:'#fff',border:'1px solid #B7E4C7',borderRadius:'12px',padding:'0.9rem 1rem'}}>
                          <div style={S.sectionLbl}>Impact</div>
                          {selSp.benefits.map(b=>(
                            <div key={b} style={{...S.featureItem,marginBottom:'0.4rem'}}>
                              <span style={{color:'#52B788',fontWeight:800,flexShrink:0}}>✓</span><span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* IMPACT BAND — compact 3-col */}
                  <div style={S.impactBand}>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌍</span><span style={S.impactVal}>~22kg</span><span style={S.impactLbl}>CO₂/year</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>💧</span><span style={S.impactVal}>1,000L</span><span style={S.impactLbl}>Water/year</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>📍</span><span style={S.impactVal}>GPS</span><span style={S.impactLbl}>3yr tracking</span></div>
                  </div>

                  {/* METADATA ROW */}
                  <div style={S.metaRow}>
                    {['📍 GPS tracked','🌱 Native species','🛡 3-year care','📱 Personal dashboard','🧾 80G receipt','🤖 AI-verified'].map(m=><span key={m} style={S.metaTag}>{m}</span>)}
                  </div>

                  {/* DASHBOARD HINT */}
                  <div style={{fontSize:'0.76rem',color:'#4A6358',background:'rgba(82,183,136,0.07)',border:'1px solid #B7E4C7',borderLeft:'3px solid #52B788',borderRadius:'8px',padding:'0.6rem 0.85rem',marginBottom:'0.85rem',lineHeight:1.55}}>
                    📊 After planting, your dashboard shows real-time GPS location, growth photos and AI health scores — updated monthly for 3 years.
                  </div>

                  {/* QUANTITY */}
                  <div style={S.qtyWrap}>
                    <div><div style={{fontSize:'0.9rem',fontWeight:700,color:'#1B2E25'}}>Number of trees</div><div style={{fontSize:'0.72rem',color:'#4A6358',marginTop:'0.15rem'}}>Each tree gets unique GPS tracking</div></div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                      <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={S.qtyBtn}>−</button>
                      <span style={{fontSize:'1.1rem',fontWeight:900,color:'#1B4332',minWidth:'22px',textAlign:'center'}}>{qty}</span>
                      <button onClick={()=>setQty(q=>Math.min(100,q+1))} style={S.qtyBtn}>+</button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ ₹100/₹250 COMMUNITY ══ */}
              {(tier.id==='community_100'||tier.id==='community_250') && (
                <>
                  <div style={S.photoWrap}>
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" alt="Community Forest" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={S.photoOverlay}/>
                    <div style={S.photoCaption}>
                      <div style={{fontSize:'1.4rem',fontWeight:900,color:'#fff',lineHeight:1,marginBottom:'0.2rem'}}>Community Forest</div>
                      <div style={{fontSize:'0.85rem',color:'#74C69D',fontStyle:'italic'}}>You're part of something bigger</div>
                    </div>
                  </div>
                  <p style={{fontSize:'0.88rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'1rem',background:'#fff',border:'1px solid #B7E4C7',borderRadius:'12px',padding:'0.9rem 1rem'}}>Every rupee plants a real tree in Bangalore's urban forest. You get a certificate in your name, dashboard access and monthly updates on the forest you helped grow.</p>
                  {/* ₹100 / ₹250 COMPACT TOGGLE */}
                  <div style={{marginBottom:'0.85rem'}}>
                    <div style={S.sectionLbl}>Choose your contribution level</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>
                      {([100,250] as const).map(amt=>(
                        <button key={amt} onClick={()=>{setCommLevel(amt);setTier(amt===100?TIERS[0]:TIERS[1])}} style={{padding:'0.85rem 1rem',borderRadius:'12px',border:`2px solid ${commLevel===amt?'#1B4332':'#B7E4C7'}`,background:commLevel===amt?'#1B4332':'#fff',color:commLevel===amt?'#fff':'#1B4332',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,transition:'all 0.18s'}}>
                          <div style={{fontSize:'1rem',fontWeight:900,lineHeight:1,marginBottom:'0.2rem'}}>₹{amt}</div>
                          <div style={{fontSize:'0.72rem',fontWeight:600,opacity:0.8}}>{amt===100?'Contributor · Certificate':'Supporter · Priority updates'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={S.impactBand}>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌳</span><span style={S.impactVal}>Forest</span><span style={S.impactLbl}>Community</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌍</span><span style={S.impactVal}>~5kg</span><span style={S.impactLbl}>CO₂/year</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>📜</span><span style={S.impactVal}>Cert</span><span style={S.impactLbl}>Instant</span></div>
                  </div>
                  <div style={S.metaRow}>
                    {['🌿 Community forest','📜 Digital certificate','📊 Impact dashboard','🎟 Event invites'].map(m=><span key={m} style={S.metaTag}>{m}</span>)}
                  </div>
                  <div style={S.qtyWrap}>
                    <div><div style={{fontSize:'0.9rem',fontWeight:700,color:'#1B2E25'}}>Number of contributions</div></div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                      <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={S.qtyBtn}>−</button>
                      <span style={{fontSize:'1.1rem',fontWeight:900,color:'#1B4332',minWidth:'22px',textAlign:'center'}}>{qty}</span>
                      <button onClick={()=>setQty(q=>Math.min(100,q+1))} style={S.qtyBtn}>+</button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ ₹500 JOINT TREE ══ */}
              {tier.id==='joint_500' && (
                <>
                  <div style={S.photoWrap}>
                    <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80" alt="Joint Tree" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={S.photoOverlay}/>
                    <div style={S.photoCaption}>
                      <div style={{fontSize:'1.4rem',fontWeight:900,color:'#fff',lineHeight:1,marginBottom:'0.2rem'}}>Shared Tree Impact</div>
                      <div style={{fontSize:'0.85rem',color:'#74C69D',fontStyle:'italic'}}>Two donors. One living tree.</div>
                    </div>
                  </div>
                  <p style={{fontSize:'0.88rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem',background:'#fff',border:'1px solid #B7E4C7',borderRadius:'12px',padding:'0.9rem 1rem'}}>Pool ₹500 with one other donor — together you plant and track a real GPS-tagged tree. Both donors receive shared dashboard access, growth photos and a certificate.</p>
                  <div style={S.impactBand}>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌍</span><span style={S.impactVal}>~11kg</span><span style={S.impactLbl}>CO₂/year</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>📍</span><span style={S.impactVal}>GPS</span><span style={S.impactLbl}>Tracked</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>💧</span><span style={S.impactVal}>~500L</span><span style={S.impactLbl}>Water/year</span></div>
                  </div>
                  <div style={{fontSize:'0.76rem',color:'#4A6358',background:'rgba(82,183,136,0.07)',border:'1px solid #B7E4C7',borderLeft:'3px solid #F59E0B',borderRadius:'8px',padding:'0.6rem 0.85rem',marginBottom:'0.85rem'}}>
                    🌿 Native species assigned at planting based on site suitability — chosen by our field ecologists for maximum survival and impact.
                  </div>
                  <div style={S.metaRow}>
                    {['🤝 Shared ownership','📍 GPS tracked','📜 Shared certificate','📸 Growth photos','🧾 80G receipt'].map(m=><span key={m} style={S.metaTag}>{m}</span>)}
                  </div>
                  <div style={S.qtyWrap}>
                    <div><div style={{fontSize:'0.9rem',fontWeight:700,color:'#1B2E25'}}>Number of shares</div></div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                      <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={S.qtyBtn}>−</button>
                      <span style={{fontSize:'1.1rem',fontWeight:900,color:'#1B4332',minWidth:'22px',textAlign:'center'}}>{qty}</span>
                      <button onClick={()=>setQty(q=>Math.min(10,q+1))} style={S.qtyBtn}>+</button>
                    </div>
                  </div>
                </>
              )}

              {/* ══ ₹5,000 MIYAWAKI ══ */}
              {tier.id==='miyawaki_5000' && (
                <>
                  <div style={S.photoWrap}>
                    <img src="https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80" alt="Miyawaki Forest" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    <div style={S.photoOverlay}/>
                    <div style={S.photoCaption}>
                      <div style={{fontSize:'1.4rem',fontWeight:900,color:'#fff',lineHeight:1,marginBottom:'0.2rem'}}>Miyawaki Forest</div>
                      <div style={{fontSize:'0.85rem',color:'#74C69D',fontStyle:'italic'}}>Create an entire ecosystem</div>
                    </div>
                  </div>
                  <p style={{fontSize:'0.88rem',color:'#2D3B36',lineHeight:1.65,marginBottom:'0.85rem',background:'#fff',border:'1px solid #B7E4C7',borderRadius:'12px',padding:'0.9rem 1rem'}}>30+ native species planted in a dense Miyawaki forest patch — 10× faster growth than conventional planting. Creates a self-sustaining urban ecosystem with measurable biodiversity impact.</p>
                  <div style={S.impactBand}>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌍</span><span style={S.impactVal}>~200kg</span><span style={S.impactLbl}>CO₂/year</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>🌿</span><span style={S.impactVal}>30+</span><span style={S.impactLbl}>Species</span></div>
                    <div style={S.impactItem}><span style={S.impactIcon}>⚡</span><span style={S.impactVal}>10×</span><span style={S.impactLbl}>Faster growth</span></div>
                  </div>
                  <div style={S.metaRow}>
                    {['🏙️ Urban forest','📍 GPS forest zone','📊 Forest dashboard','🧬 Biodiversity report','🧾 BRSR report','🧾 80G receipt'].map(m=><span key={m} style={S.metaTag}>{m}</span>)}
                  </div>
                  <div style={S.qtyWrap}>
                    <div><div style={{fontSize:'0.9rem',fontWeight:700,color:'#1B2E25'}}>Number of forests</div></div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                      <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={S.qtyBtn}>−</button>
                      <span style={{fontSize:'1.1rem',fontWeight:900,color:'#1B4332',minWidth:'22px',textAlign:'center'}}>{qty}</span>
                      <button onClick={()=>setQty(q=>Math.min(10,q+1))} style={S.qtyBtn}>+</button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* ══ GIFT MODE — occasions grid ══ */
            <>
              <div style={S.sectionLbl}>Choose the occasion</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.6rem',marginBottom:'1.4rem'}}>
                {OCCASIONS.map(o=>(
                  <div key={o.id} onClick={()=>setOcc(o)} style={{position:'relative',border:`2px solid ${occ.id===o.id?'#52B788':'#B7E4C7'}`,borderRadius:'12px',padding:'0.85rem 0.4rem',cursor:'pointer',textAlign:'center' as const,background:occ.id===o.id?'#D8F3DC':'#fff',transition:'all 0.18s'}}>
                    <div style={{fontSize:'1.4rem',marginBottom:'0.2rem'}}>{o.icon}</div>
                    <div style={{fontSize:'0.74rem',fontWeight:700,color:'#0D1F17',marginBottom:'0.15rem'}}>{o.label}</div>
                    <div style={{fontSize:'0.78rem',fontWeight:800,color:'#1B4332'}}>₹{o.price}</div>
                    {occ.id===o.id&&<div style={{position:'absolute',top:'0.3rem',right:'0.3rem',width:'15px',height:'15px',background:'#52B788',color:'#fff',borderRadius:'50%',fontSize:'0.58rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✓</div>}
                  </div>
                ))}
              </div>
              <div style={S.sectionLbl}>Recipient details</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
                <div>
                  <label style={{display:'block',fontSize:'0.84rem',fontWeight:700,color:'#1B2E25',marginBottom:'0.3rem'}}>Recipient name *</label>
                  <input type="text" placeholder="Who is this gift for?" value={form.recipientName} onChange={e=>sf('recipientName',e.target.value)} style={{width:'100%',padding:'0.68rem 0.85rem',border:`1.5px solid ${errors.recipientName?'#dc2626':'#B7E4C7'}`,borderRadius:'10px',fontSize:'0.95rem',color:'#0D1F17',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}}/>
                  <Err msg={errors.recipientName}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'0.84rem',fontWeight:700,color:'#1B2E25',marginBottom:'0.3rem'}}>Recipient email *</label>
                  <input type="email" placeholder="Their email for certificate" value={form.recipientEmail} onChange={e=>sf('recipientEmail',e.target.value)} style={{width:'100%',padding:'0.68rem 0.85rem',border:`1.5px solid ${errors.recipientEmail?'#dc2626':'#B7E4C7'}`,borderRadius:'10px',fontSize:'0.95rem',color:'#0D1F17',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}}/>
                  <Err msg={errors.recipientEmail}/>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.84rem',fontWeight:700,color:'#1B2E25',marginBottom:'0.3rem'}}>Personal message <span style={{fontWeight:400,color:'#4A6358',fontSize:'0.78rem'}}>(optional)</span></label>
                <textarea rows={2} placeholder="Add a personal message..." value={form.giftMessage} onChange={e=>sf('giftMessage',e.target.value)} style={{width:'100%',padding:'0.68rem 0.85rem',border:'1.5px solid #B7E4C7',borderRadius:'10px',fontSize:'0.95rem',color:'#0D1F17',background:'#fff',outline:'none',fontFamily:'inherit',resize:'vertical' as const}}/>
              </div>
            </>
          )}
        </div>

        {/* ── ZONE 3B: STICKY FORM PANEL ── */}
        <div ref={formRef}>
          <div style={{background:'#fff',border:'1.5px solid #B7E4C7',borderRadius:'16px',padding:'1.4rem',position:'sticky',top:'120px',boxShadow:'0 4px 24px rgba(27,67,50,0.08)'}}>

            {/* ORDER HEADER */}
            <div style={{display:'flex',alignItems:'center',gap:'0.7rem',background:'#F4F7F4',borderRadius:'10px',padding:'0.7rem 0.85rem',marginBottom:'0.6rem'}}>
              <span style={{fontSize:'1.4rem',flexShrink:0}}>{tier.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'0.6rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.12em',color:'#4A6358'}}>Your order</div>
                <div style={{fontSize:'0.9rem',fontWeight:800,color:'#0D1F17',marginTop:'0.1rem'}}>
                  {mode==='gift'?`${occ.icon} ${occ.label} Gift`:
                   tier.id==='individual_1000'&&selSp?`${selSp.name} Tree`:tier.name}
                </div>
              </div>
              <div style={{fontSize:'1.05rem',fontWeight:900,color:'#1B4332',flexShrink:0}}>₹{effectiveTotal.toLocaleString('en-IN')}</div>
            </div>

            {/* META TAGS */}
            <div style={{display:'flex',flexWrap:'wrap' as const,gap:'0.28rem',marginBottom:'0.8rem'}}>
              {tier.id==='community_100'||tier.id==='community_250'?<><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🌿 Community</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>📜 Certificate</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>📊 Dashboard</span></>
              :tier.id==='joint_500'?<><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🤝 Shared tree</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>📍 GPS</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🧾 80G</span></>
              :tier.id==='miyawaki_5000'?<><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🏙️ 30+ species</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>📊 Dashboard</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🧾 80G</span></>
              :<><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🌍 ~22kg CO₂/yr</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>📍 GPS 3yr</span><span style={{fontSize:'0.65rem',background:'#D8F3DC',color:'#1B4332',padding:'0.15rem 0.5rem',borderRadius:'999px',fontWeight:600}}>🧾 80G</span></>}
            </div>

            <div style={{height:'1px',background:'#B7E4C7',margin:'0.8rem 0'}}/>

            {/* DONOR FORM */}
            <div style={{fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.11em',color:'#4A6358',marginBottom:'0.7rem'}}>Your Details</div>

            {([
              {k:'name',l:'Full Name *',p:'Your full name',t:'text'},
              {k:'email',l:'Email *',p:'your@email.com',t:'email'},
              {k:'phone',l:'Phone *',p:'98860 94611',t:'tel'},
              {k:'address',l:'City / Address',p:'Bangalore',t:'text'},
            ] as {k:keyof typeof form,l:string,p:string,t:string}[]).map(f=>(
              <div key={f.k} style={{marginBottom:'0.55rem'}}>
                <label style={{display:'block',fontSize:'0.82rem',fontWeight:700,color:'#1B2E25',marginBottom:'0.25rem'}}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>sf(f.k,e.target.value)} style={{width:'100%',padding:'0.6rem 0.8rem',border:`1.5px solid ${errors[f.k as keyof FormErrors]?'#dc2626':'#B7E4C7'}`,borderRadius:'9px',fontSize:'0.9rem',color:'#0D1F17',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}}/>
                <Err msg={errors[f.k as keyof FormErrors]}/>
              </div>
            ))}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.55rem',marginBottom:'0.55rem'}}>
              {[{k:'birthday',l:'Birthday',p:'dd-mm-yyyy'},{k:'anniversary',l:'Anniversary',p:'optional'}].map(f=>(
                <div key={f.k}>
                  <label style={{display:'block',fontSize:'0.78rem',fontWeight:700,color:'#1B2E25',marginBottom:'0.25rem'}}>{f.l}</label>
                  <input type="date" value={form[f.k as keyof typeof form]} onChange={e=>sf(f.k,e.target.value)} style={{width:'100%',padding:'0.6rem 0.8rem',border:'1.5px solid #B7E4C7',borderRadius:'9px',fontSize:'0.82rem',color:'#0D1F17',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const}}/>
                </div>
              ))}
            </div>

            <div style={{fontSize:'0.72rem',color:'#4A6358',background:'#F4F7F4',padding:'0.45rem 0.7rem',borderRadius:'7px',borderLeft:'2.5px solid #52B788',marginBottom:'0.8rem',lineHeight:1.45}}>🧾 PAN for 80G — collected after payment</div>

            <div style={{height:'1px',background:'#B7E4C7',margin:'0.8rem 0'}}/>

            {/* PAYMENT SUMMARY */}
            <div style={{background:'#F4F7F4',borderRadius:'9px',padding:'0.8rem 0.95rem',marginBottom:'0.8rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#2D3B36',marginBottom:'0.28rem',fontWeight:600}}>
                <span>{mode==='gift'?`${occ.icon} ${occ.label}`:tier.id==='individual_1000'&&selSp?`${selSp.name} × ${qty}`:`${tier.name} × ${qty}`}</span>
                <span>₹{effectiveTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.76rem',color:'#4A6358',marginBottom:'0.28rem'}}>
                <span>Plantation &amp; Care</span><span>₹0</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.95rem',fontWeight:900,color:'#1B4332',borderTop:'1px solid #B7E4C7',paddingTop:'0.5rem',marginTop:'0.28rem'}}>
                <span>Total</span><span>₹{effectiveTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* ── MAIN CTA — emotional language ── */}
            <button onClick={handlePay} disabled={loading} style={{...S.ctaBtn(mode==='gift'),opacity:loading?0.7:1}}>
              {loading ? <><span style={{display:'inline-block',width:'13px',height:'13px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/> Saving...</> :
               mode==='gift' ? `🎁 Gift This Living Tree · ₹${effectiveTotal.toLocaleString('en-IN')}` :
               tier.id==='individual_1000' ? `🌱 Adopt This Living Tree · ₹${effectiveTotal.toLocaleString('en-IN')}` :
               tier.id==='joint_500' ? `🤝 Join Tree Pool · ₹${effectiveTotal.toLocaleString('en-IN')}` :
               tier.id==='miyawaki_5000' ? `🏙️ Create Urban Forest · ₹${effectiveTotal.toLocaleString('en-IN')}` :
               `🌿 Join Community Forest · ₹${effectiveTotal.toLocaleString('en-IN')}`}
            </button>
            <div style={{textAlign:'center',fontSize:'0.7rem',color:'#4A6358',marginBottom:'0.3rem',display:'flex',justifyContent:'center',gap:'0.3rem'}}>
              <span>UPI</span><span>·</span><span>Card</span><span>·</span><span>Net Banking</span><span>·</span><span>Wallets</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.7rem',color:'#4A6358'}}>
              <span>🔒 Secure · Razorpay</span><span>📜 Certificate instantly</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BELOW FOLD: HOW IT WORKS ── */}
      <section style={{padding:'2.5rem 0',background:'#fff',borderTop:'1px solid #B7E4C7',borderBottom:'1px solid #B7E4C7'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem'}}>
          <div style={{display:'inline-block',fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.13em',textTransform:'uppercase' as const,color:'#52B788',background:'rgba(82,183,136,0.1)',padding:'0.28rem 0.85rem',borderRadius:'999px',marginBottom:'1.1rem'}}>What Happens After You Pay</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:0,flexWrap:'wrap' as const}}>
            {[{icon:'🌱',n:'01',t:'We Plant',d:'Our field team plants your tree at a verified Bangalore site within 7 days.'},{icon:'📍',n:'02',t:'GPS Tagged',d:'A unique GPS coordinate and QR code is assigned to your specific tree.'},{icon:'🤖',n:'03',t:'AI Verified',d:'Claude AI verifies species, location, timestamp and health before it reaches you.'},{icon:'📊',n:'04',t:'Live Dashboard',d:'Track your tree with monthly photos and AI health scores for 3 full years.'}].map((s,i)=>(
              <React.Fragment key={s.n}>
                <div style={{flex:1,minWidth:'110px',textAlign:'center' as const,padding:'1.1rem 0.6rem',background:'#fff',borderRadius:'12px',border:'1px solid #B7E4C7',margin:'0 0.15rem',boxShadow:'0 1px 6px rgba(27,67,50,0.04)'}}>
                  <div style={{fontSize:'1.8rem',marginBottom:'0.45rem'}}>{s.icon}</div>
                  <div style={{fontSize:'0.6rem',fontWeight:700,color:'#52B788',letterSpacing:'0.12em',textTransform:'uppercase' as const,marginBottom:'0.28rem'}}>{s.n}</div>
                  <div style={{fontSize:'0.85rem',fontWeight:800,color:'#1B4332',marginBottom:'0.28rem'}}>{s.t}</div>
                  <div style={{fontSize:'0.72rem',color:'#4A6358',lineHeight:1.5}}>{s.d}</div>
                </div>
                {i<3&&<div style={{fontSize:'1.1rem',color:'#52B788',paddingTop:'2.8rem',flexShrink:0,opacity:0.45}}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section style={{padding:'2.5rem 0',background:'#fff'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem'}}>
          <div style={{display:'inline-block',fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.13em',textTransform:'uppercase' as const,color:'#52B788',background:'rgba(82,183,136,0.1)',padding:'0.28rem 0.85rem',borderRadius:'999px',marginBottom:'1.1rem'}}>From Sapling to Forest</div>
          <h2 style={{fontSize:'clamp(1.4rem,2.8vw,2rem)',fontWeight:800,lineHeight:1.18,color:'#0D1F17',margin:'0 0 1.25rem'}}>Real trees. <em style={{color:'#52B788',fontStyle:'normal'}}>Real impact.</em></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
            {[{img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',l:'🌱 Day 1 — Sapling planted',s:'GPS-tagged, QR code attached'},{img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80',l:'🌿 Month 6 — Growing strong',s:'AI health score: 94%'},{img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80',l:'🌳 Year 3 — Full canopy',s:'22kg CO₂ offset/year'}].map(g=>(
              <div key={g.l} style={{borderRadius:'12px',overflow:'hidden',border:'1px solid #B7E4C7'}}>
                <img src={g.img} alt={g.l} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block'}} loading="lazy"/>
                <div style={{padding:'0.75rem 0.9rem',background:'#fff'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'#1B4332',marginBottom:'0.12rem'}}>{g.l}</div>
                  <div style={{fontSize:'0.72rem',color:'#4A6358'}}>{g.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{background:'#1B4332',padding:'1.25rem 0'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.85rem'}}>
          {[{i:'🧾',t:'80G Tax Benefit',s:'Section 8 NGO · All donations eligible'},{i:'📜',t:'Certificate Instantly',s:'PDF emailed after payment'},{i:'🤖',t:'AI-Verified',s:'Every photo independently checked'},{i:'📅',t:'3-Year Tracking',s:'Monthly updates on dashboard'}].map(x=>(
            <div key={x.t} style={{display:'flex',alignItems:'flex-start',gap:'0.55rem'}}>
              <span style={{fontSize:'1.2rem',flexShrink:0}}>{x.i}</span>
              <div><div style={{fontSize:'0.82rem',fontWeight:700,color:'#fff',marginBottom:'0.08rem'}}>{x.t}</div><div style={{fontSize:'0.67rem',color:'rgba(255,255,255,0.5)',lineHeight:1.35}}>{x.s}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <section style={{padding:'2.5rem 0',background:'#F4F7F4'}}>
        <div style={{maxWidth:'740px',margin:'0 auto',padding:'0 1.5rem'}}>
          <div style={{display:'inline-block',fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.13em',textTransform:'uppercase' as const,color:'#52B788',background:'rgba(82,183,136,0.1)',padding:'0.28rem 0.85rem',borderRadius:'999px',marginBottom:'1.1rem'}}>FAQ</div>
          <h2 style={{fontSize:'clamp(1.4rem,2.8vw,2rem)',fontWeight:800,lineHeight:1.18,color:'#0D1F17',margin:'0 0 0.4rem'}}>Quick answers</h2>
          <FAQ/>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <div style={{background:'#D8F3DC',padding:'0.9rem 0',borderTop:'1px solid #B7E4C7'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap' as const}}>
          <span style={{fontSize:'0.85rem',fontWeight:600,color:'#1B4332'}}>🌱 Ready to plant? Choose your contribution above.</span>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{fontSize:'0.85rem',fontWeight:600,padding:'0.55rem 1.2rem',borderRadius:'999px',background:'#1B4332',color:'#fff',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Plant From ₹100</button>
            <a href={`https://wa.me/${WHATSAPP}?text=${WA_MSG}`} target="_blank" rel="noopener" style={{fontSize:'0.85rem',fontWeight:600,padding:'0.55rem 1.2rem',borderRadius:'999px',background:'#25D366',color:'#fff',textDecoration:'none'}}>💬 WhatsApp</a>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:860px){}`}</style>
    </main>
  )
}

function FAQ() {
  const [o, setO] = React.useState<number|null>(null)
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
          <button onClick={()=>setO(o===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',padding:'1rem 1.1rem',fontSize:'0.92rem',fontWeight:600,color:'#1B4332',background:o===i?'#D8F3DC':'#F8FAF8',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
            <span>{f.q}</span><span style={{fontSize:'1.2rem',color:'#52B788',flexShrink:0}}>{o===i?'−':'+'}</span>
          </button>
          {o===i&&<div style={{padding:'0.9rem 1.1rem',fontSize:'0.9rem',lineHeight:1.7,color:'#2D3B36',background:'#fff',borderTop:'1px solid #B7E4C7'}}>{f.a}</div>}
        </div>
      ))}
    </div>
  )
}
