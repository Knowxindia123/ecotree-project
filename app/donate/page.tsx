'use client'
import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────
// CONSTANTS — unchanged from original
// ─────────────────────────────────────────────
const WHATSAPP = '919886094611'
const SITE_URL  = 'https://ecotrees.org/donate'
const WA_MSG    = encodeURIComponent(
  `India's only NGO where you can see your tree growing live.\nPlant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit\n${SITE_URL}`
)

const TIERS = [
  {
    id:'community_100', tier:'100', icon:'🌿', name:'Community Contributor',
    price:100, co2:'~5kg', water:'~200L',
    tag:'❤️ Most Accessible', tagColor:'#52B788',
    desc:'Join our community forest. Certificate in your name.',
    what:['Community forest certificate','Impact dashboard access','Project participation invites','Community tree tracking'],
    img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    species:null, occasionIds:[],
    dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788',
  },
  {
    id:'community_250', tier:'250', icon:'🌱', name:'Community Supporter',
    price:250, co2:'~5kg', water:'~200L',
    tag:'🌿 Great Value', tagColor:'#2D6A4F',
    desc:'Support our community forest with greater impact.',
    what:['Community forest certificate','Impact dashboard access','Priority project invites','Community tree tracking'],
    img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    species:null, occasionIds:['birthday','anniversary','festival','baby'],
    dashboard:'/community-dashboard', badge:'COMMUNITY', badgeColor:'#52B788',
  },
  {
    id:'joint_500', tier:'500', icon:'🤝', name:'Joint Tree Donor',
    price:500, co2:'~11kg', water:'~500L',
    tag:'👥 Share a Tree', tagColor:'#F59E0B',
    desc:'Pool with 1 stranger — together you plant 1 tree.',
    what:['Individual tree certificate','Shared tree dashboard','GPS location on map','Before & after photos','Species preference'],
    img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
    species:['Neem','Peepal','Mango','Jamun','Any'],
    occasionIds:['birthday','anniversary','festival','baby'],
    dashboard:'/my-tree', badge:'JOINT', badgeColor:'#F59E0B',
  },
  {
    id:'individual_1000', tier:'1000', icon:'🌳', name:'Individual Tree',
    price:1000, co2:'~22kg', water:'~1,000L',
    tag:'⭐ Most Popular', tagColor:'#1B4332',
    desc:'Your own tree. Full dashboard. GPS tracked for 3 years.',
    what:['Individual tree certificate','Personal tree dashboard','GPS location on map','Before & after photos','AI health score','80G tax receipt','Guaranteed species'],
    img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    species:['Neem','Peepal','Mango','Jamun','Guava','Rain Tree','Banyan','Gulmohar'],
    occasionIds:['birthday','anniversary','memory','festival','baby','corporate','custom'],
    dashboard:'/my-tree', badge:'INDIVIDUAL', badgeColor:'#1B4332',
  },
  {
    id:'miyawaki_5000', tier:'5000', icon:'🏙️', name:'Miyawaki Forest',
    price:5000, co2:'~200kg', water:'~8,000L',
    tag:'🔥 Premium Impact', tagColor:'#7C3AED',
    desc:'30+ native species. Dense urban forest. 10x faster growth.',
    what:['Forest impact certificate','Miyawaki forest dashboard','GPS forest location','Species diversity report','BRSR-compatible report','80G tax receipt','Donor wall recognition'],
    img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80',
    species:null, occasionIds:['corporate','custom'],
    dashboard:'/miyawaki-dashboard', badge:'FOREST', badgeColor:'#7C3AED',
  },
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

// ─────────────────────────────────────────────
// UTILITIES — unchanged from original
// ─────────────────────────────────────────────
function makeCertId()     { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }
function generateTreeId() { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }

async function sendEmail(type: string, donor: Record<string, unknown>) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, donor }),
    })
  } catch (err) { console.error('Email send failed:', err) }
}

interface FormErrors {
  name?: string; email?: string; phone?: string;
  recipientName?: string; recipientEmail?: string; species?: string
}

// ─────────────────────────────────────────────
// HERO TREE SILHOUETTE SVG
// ─────────────────────────────────────────────
const TreeSilhouette = () => (
  <svg
    viewBox="0 0 400 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position:'absolute', right:0, bottom:0, height:'100%', width:'auto', opacity:0.06, pointerEvents:'none' }}
    aria-hidden="true"
  >
    <path d="M200 480 L200 200" stroke="white" strokeWidth="18" strokeLinecap="round"/>
    <path d="M200 200 L140 300 L100 260 L160 180 L120 220 L80 160 L150 120 L110 160 L130 80 L200 40 L270 80 L290 160 L250 120 L320 160 L280 220 L340 180 L300 260 L260 300 L200 200Z" fill="white"/>
    <path d="M200 200 L180 320 L160 280 L170 240" fill="white" opacity="0.5"/>
    <path d="M200 200 L220 320 L240 280 L230 240" fill="white" opacity="0.5"/>
  </svg>
)

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DonatePage() {
  // ── All state — variable names unchanged ──
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
  const tierDetailRef         = useRef<HTMLDivElement>(null)
  const [form, setForm]       = useState({
    name:'', email:'', phone:'', address:'',
    birthday:'', anniversary:'',
    recipientName:'', recipientEmail:'', giftMessage:'',
  })

  // ── All handlers — unchanged ──
  const sf = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k as keyof FormErrors]) setErrors(p => ({ ...p, [k]: undefined }))
  }

  // Gift mode: occ.price. Plant mode: tier.price * qty — unchanged
  const total = mode === 'gift' ? occ.price : tier.price * qty

  const pickTier = (t: typeof TIERS[0]) => {
    setTier(t); setSpecies(''); setQty(1)
    if (t.occasionIds.length > 0)
      setOcc(OCCASIONS.find(o => t.occasionIds.includes(o.id)) || OCCASIONS[0])
    // Scroll to tier detail section on all screen sizes
    setTimeout(() => tierDetailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(SITE_URL)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── validate — unchanged ──
  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/[\s+\-()]/g, ''))) e.phone = 'Please enter a valid 10-digit Indian mobile number'
    if (mode === 'gift') {
      if (!form.recipientName.trim()) e.recipientName = 'Please enter recipient name'
      if (!form.recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) e.recipientEmail = 'Please enter a valid recipient email'
    }
    if (tier.species && tier.id === 'individual_1000' && !species) e.species = 'Please select a species'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── handlePay — entirely unchanged ──
  const handlePay = async () => {
    if (loading) return
    if (!validate()) { formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); return }
    setLoading(true)
    try {
      let donorId: number
      let isNewDonor = false
      const { data: existing } = await supabase
        .from('donors').select('id, total_trees, total_donated')
        .eq('email', form.email).eq('tier', tier.tier).maybeSingle()
      if (existing) {
        donorId = existing.id
        await supabase.from('donors').update({
          total_trees: (tier.id === 'joint_500' || tier.id === 'community_100' || tier.id === 'community_250')
            ? (existing.total_trees || 0)
            : (existing.total_trees || 0) + 1,
          total_donated: (Number(existing.total_donated) || 0) + total,
          phone: form.phone, address: form.address || null,
          birthday: form.birthday || null, anniversary: form.anniversary || null,
        }).eq('id', donorId)
      } else {
        const { data: newDonor, error: donorErr } = await supabase.from('donors').insert({
          name: form.name, email: form.email, phone: form.phone,
          address: form.address || null, birthday: form.birthday || null,
          anniversary: form.anniversary || null,
          total_trees: (tier.id === 'joint_500' || tier.id === 'community_100' || tier.id === 'community_250') ? 0 : 1,
          total_donated: total, city: 'Bangalore',
          is_gift: mode === 'gift',
          gift_from_name:  mode === 'gift' ? form.name      : null,
          gift_from_email: mode === 'gift' ? form.email     : null,
          gift_occasion:   mode === 'gift' ? occ.label      : null,
          gift_message:    mode === 'gift' ? form.giftMessage : null,
          tier: tier.tier,
        }).select('id').single()
        if (donorErr || !newDonor) throw new Error(donorErr?.message || 'Failed to create donor')
        donorId = newDonor.id
        isNewDonor = true
        await fetch('/api/create-donor', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ email:form.email, password:'123456', name:form.name, donorId }),
        })
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
            const newFilled    = targetPool.slots_filled + 1
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
                if (d?.email) {
                  await sendEmail('welcome', { name:d.name, email:d.email, tree_id:treeId, species:species||'Neem', password:'123456', tier:'500', dashboard:'/my-tree', joint:true, matched:true, partner:(members||[]).filter((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.email!==d.email}).map((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.name})[0]||'your co-donor' })
                }
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

  // ── payBtnLabel — unchanged ──
  const payBtnLabel = () => {
    if (loading) return '⏳ Saving...'
    if (tier.id === 'community_100' || tier.id === 'community_250') return `🌿 Join Community Forest · ₹${total}`
    if (tier.id === 'joint_500')     return `🤝 Join Tree Pool · ₹${total}`
    if (tier.id === 'miyawaki_5000') return `🏙️ Sponsor Miyawaki Forest · ₹${total}`
    return `🌳 Plant My Tree · ₹${total.toLocaleString('en-IN')}`
  }

  const Err = ({ msg }: { msg?: string }) =>
    msg ? <div className="et-err">⚠️ {msg}</div> : null

  // ─────────────────────────────────────────────
  // RENDER — new layout, all existing logic wired
  // ─────────────────────────────────────────────
  return (
    <main className="et">

      {/* ══ ZONE 1: TRUST BAR ══ */}
      <div className="et-trust">
        <div className="et-c et-trust__inner">
          <div className="et-trust__signals">
            <span>🌱 10,000+ trees</span>
            <span className="et-trust__dot">·</span>
            <span>🎯 91% survival</span>
            <span className="et-trust__dot">·</span>
            <span>🤖 AI-verified</span>
            <span className="et-trust__dot">·</span>
            <span>🧾 80G approved</span>
            <span className="et-trust__dot">·</span>
            <span>📍 GPS-tagged</span>
          </div>
          <div className="et-trust__actions">
            <a
              href={`https://wa.me/?text=${WA_MSG}`}
              target="_blank" rel="noopener"
              className="et-trust__btn et-trust__btn--wa"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share
            </a>
            <button className="et-trust__btn et-trust__btn--cp" onClick={copyLink}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ ZONE 2: HERO BANNER ══ */}
      <div className="et-hero">
        <TreeSilhouette />
        <div className="et-c et-hero__inner">

          {/* Left: headline + toggle */}
          <div className="et-hero__left">
            <div className="et-hero__eyebrow">India&rsquo;s only NGO where you can see your tree growing live</div>
            <h1 className="et-hero__h1">
              Plant a<br />
              <em>Living Legacy</em>
            </h1>
            <p className="et-hero__sub">
              AI-verified · GPS-tagged · 3yr tracking · 80G tax benefit
            </p>
            <div className="et-hero__toggles">
              <button
                className={`et-tog et-tog--plant${mode==='plant'?' active':''}`}
                onClick={() => setMode('plant')}
              >
                🌱 Plant For Myself
              </button>
              <button
                className={`et-tog et-tog--gift${mode==='gift'?' active':''}`}
                onClick={() => setMode('gift')}
              >
                🎁 Gift a Tree
              </button>
            </div>
          </div>

          {/* Right: tier pills */}
          <div className="et-hero__tiers">
            <div className="et-hero__tiers-label">Choose contribution level</div>
            <div className="et-hero__tier-pills">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  className={`et-tier-pill${tier.id===t.id?' on':''}`}
                  onClick={() => pickTier(t)}
                >
                  {t.id === 'individual_1000' && (
                    <span className="et-tier-pill__loved">★ MOST LOVED</span>
                  )}
                  <span className="et-tier-pill__amt">
                    {t.id === 'community_100' ? '₹100/₹250' : `₹${t.price.toLocaleString('en-IN')}`}
                  </span>
                  <span className="et-tier-pill__name">{t.name}</span>
                  <span className="et-tier-pill__desc">{t.desc.split('.')[0]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ ZONE 3: TWO COLUMNS ══ */}
      <div className="et-body">
        <div className="et-c et-body__cols">

          {/* ── ZONE 3A: TIER DETAIL ── */}
          <div className="et-detail" ref={tierDetailRef}>

            {mode === 'plant' ? (
              <>
                {/* PLANT MODE — tier image + impact + species + what + qty */}

                {/* TIER IMAGE — Framer Motion fade on tier change */}
                <div className="et-detail__img-wrap">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tier.id}
                      initial={{ opacity:0, y:12 }}
                      animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, y:-12 }}
                      transition={{ duration:0.3, ease:'easeInOut' }}
                      className="et-detail__img-inner"
                    >
                      <Image
                        src={tier.img}
                        alt={tier.name}
                        fill
                        className="et-detail__img"
                        priority
                      />
                      <div className="et-detail__img-overlay" />
                      <div className="et-detail__img-caption">
                        <div className="et-detail__img-badge" style={{ background:tier.badgeColor }}>
                          {tier.badge}
                        </div>
                        <div className="et-detail__img-name">{tier.icon} {tier.name}</div>
                        <div className="et-detail__img-desc">{tier.desc}</div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* GPS MAP + IMPACT METRICS */}
                <div className="et-impact">
                  <div className="et-impact__map">
                    <div className="et-impact__map-pin" aria-hidden="true" />
                    <div className="et-impact__map-ring" aria-hidden="true" />
                    <div className="et-impact__map-ring2" aria-hidden="true" />
                    <span className="et-impact__map-pill">📍 GPS Tracking Enabled</span>
                    <span className="et-impact__map-region">Bangalore Region</span>
                  </div>
                  <div className="et-impact__metric">
                    <div className="et-impact__metric-icon">🌍</div>
                    <div className="et-impact__metric-val">{tier.co2}</div>
                    <div className="et-impact__metric-lbl">CO₂ absorbed/year</div>
                  </div>
                  <div className="et-impact__metric">
                    <div className="et-impact__metric-icon">💧</div>
                    <div className="et-impact__metric-val">{tier.water}</div>
                    <div className="et-impact__metric-lbl">Water restored/year</div>
                  </div>
                </div>

                {/* DASHBOARD PREVIEW LINE */}
                <div className="et-dashboard-hint">
                  <span>📊</span>
                  <span>After planting, your dashboard shows real-time GPS location, tree photos and growth updates — updated monthly for 3 years.</span>
                </div>

                {/* SPECIES SELECTOR */}
                {tier.species && (
                  <div className="et-species">
                    <div className="et-species__label">
                      {tier.id === 'individual_1000' ? 'Choose species *' : 'Species preference'}
                      {tier.id === 'joint_500' && <span className="et-species__opt"> (subject to availability)</span>}
                    </div>
                    <select
                      value={species}
                      onChange={e => setSpecies(e.target.value)}
                      className={`et-species__select${errors.species?' et-err-border':''}`}
                    >
                      <option value="">— Select species —</option>
                      {tier.species.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Err msg={errors.species} />
                  </div>
                )}
                {tier.id === 'miyawaki_5000' && (
                  <div className="et-miyawaki-note">
                    🌿 30+ native species mixed forest — EcoTree selects for maximum biodiversity
                  </div>
                )}

                {/* WHAT'S INCLUDED */}
                <div className="et-what">
                  <div className="et-what__label">What&rsquo;s included</div>
                  <div className="et-what__grid">
                    {tier.what.map(w => (
                      <div key={w} className="et-what__item">
                        <span className="et-what__check" aria-hidden="true">✓</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUANTITY SELECTOR */}
                <div className="et-qty">
                  <div className="et-qty__info">
                    <div className="et-qty__label">
                      {tier.id === 'miyawaki_5000' ? 'Number of forests'
                        : tier.id === 'joint_500' ? 'Number of shares'
                        : tier.id === 'community_100' || tier.id === 'community_250' ? 'Number of contributions'
                        : 'Number of trees'}
                    </div>
                    {tier.id === 'individual_1000' && (
                      <div className="et-qty__sub">Each tree gets unique GPS tracking</div>
                    )}
                  </div>
                  <div className="et-qty__ctrl">
                    <button
                      className="et-qty__btn"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="et-qty__num">{qty}</span>
                    <button
                      className="et-qty__btn"
                      onClick={() => setQty(q => Math.min(
                        tier.id === 'miyawaki_5000' || tier.id === 'joint_500' ? 10 : 100, q + 1
                      ))}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* GIFT MODE — occasions grid replaces tier detail, exactly as original */}
                <div className="et-detail__section-lbl">Choose the occasion</div>

                <div className="et-ogrid">
                  {OCCASIONS.map(o => (
                    <div
                      key={o.id}
                      className={`et-ocard${occ.id===o.id?' sel':''}`}
                      onClick={() => setOcc(o)}
                    >
                      <div className="et-oi">{o.icon}</div>
                      <div className="et-ol">{o.label}</div>
                      <div className="et-op">₹{o.price}</div>
                      {occ.id === o.id && <div className="et-och" aria-hidden="true">✓</div>}
                    </div>
                  ))}
                </div>

                {/* GIFT RECIPIENT FIELDS below occasions grid */}
                <div className="et-gfields">
                  <div className="et-detail__section-lbl" style={{ marginTop:'1.5rem' }}>
                    Recipient details
                  </div>
                  <div className="et-field-row">
                    <div className="et-field">
                      <label htmlFor="et-rname-l">Recipient name *</label>
                      <input
                        id="et-rname-l"
                        type="text"
                        placeholder="Who is this gift for?"
                        value={form.recipientName}
                        onChange={e => sf('recipientName', e.target.value)}
                        className={errors.recipientName ? 'et-err-border' : ''}
                      />
                      <Err msg={errors.recipientName} />
                    </div>
                    <div className="et-field">
                      <label htmlFor="et-remail-l">Recipient email *</label>
                      <input
                        id="et-remail-l"
                        type="email"
                        placeholder="Their email for gift certificate"
                        value={form.recipientEmail}
                        onChange={e => sf('recipientEmail', e.target.value)}
                        className={errors.recipientEmail ? 'et-err-border' : ''}
                      />
                      <Err msg={errors.recipientEmail} />
                    </div>
                  </div>
                  <div className="et-field">
                    <label htmlFor="et-gmsg-l">
                      Personal message <span className="et-field__opt">(optional)</span>
                    </label>
                    <textarea
                      id="et-gmsg-l"
                      rows={2}
                      placeholder="Add a personal message..."
                      value={form.giftMessage}
                      onChange={e => sf('giftMessage', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ── ZONE 3B: FORM PANEL ── */}
          <div className="et-form-col" ref={formRef}>
            <div className="et-form-panel">

              {/* PANEL HEADER — selected tier summary */}
              <div className="et-panel-hdr">
                <div className="et-panel-hdr__icon">{tier.icon}</div>
                <div className="et-panel-hdr__info">
                  <div className="et-panel-hdr__eyebrow">Your order</div>
                  <div className="et-panel-hdr__name">
                    {mode === 'gift' ? `${occ.icon} ${occ.label} Gift` : tier.name}
                  </div>
                </div>
                <div className="et-panel-hdr__price">
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>

              {/* ORDER META TAGS */}
              <div className="et-order-meta">
                {tier.id === 'community_100' || tier.id === 'community_250'
                  ? <><span>🌿 Community forest</span><span>📜 Certificate</span><span>📊 Dashboard</span></>
                  : tier.id === 'joint_500'
                  ? <><span>🤝 Shared tree</span><span>📜 Certificate</span><span>📍 GPS</span><span>🧾 80G</span></>
                  : tier.id === 'miyawaki_5000'
                  ? <><span>🏙️ 30+ species</span><span>📊 Forest dashboard</span><span>🧾 80G</span></>
                  : <><span>🌍 ~22kg CO₂/yr</span><span>📅 3yr tracking</span><span>📜 Certificate</span><span>🧾 80G</span></>
                }
              </div>

              <div className="et-form-divider" />

              {/* GIFT MODE — summary only in right panel (occasions + recipient on left) */}
              {mode === 'gift' && (
                <div className="et-gift">
                  <div className="et-gift__title">
                    <span>🎁</span> {occ.icon} {occ.label} Gift · ₹{occ.price}
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'#6D28D9', opacity:0.75, marginTop:'-0.25rem' }}>
                    Recipient and message filled in on the left ←
                  </div>
                </div>
              )}

              {/* DONOR DETAILS FORM */}
              <div className="et-section-label">
                <span>Your Details</span>
              </div>

              <div className="et-field">
                <label htmlFor="et-name">Full name *</label>
                <input
                  id="et-name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => sf('name', e.target.value)}
                  className={errors.name ? 'et-err-border' : ''}
                />
                <Err msg={errors.name} />
              </div>

              <div className="et-field">
                <label htmlFor="et-email">Email address *</label>
                <input
                  id="et-email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => sf('email', e.target.value)}
                  className={errors.email ? 'et-err-border' : ''}
                />
                <Err msg={errors.email} />
              </div>

              <div className="et-field">
                <label htmlFor="et-phone">Phone number *</label>
                <input
                  id="et-phone"
                  type="tel"
                  placeholder="98860 94611"
                  value={form.phone}
                  onChange={e => sf('phone', e.target.value)}
                  className={errors.phone ? 'et-err-border' : ''}
                />
                <Err msg={errors.phone} />
              </div>

              <div className="et-field">
                <label htmlFor="et-addr">
                  City / address <span className="et-field__opt">(optional)</span>
                </label>
                <input
                  id="et-addr"
                  type="text"
                  placeholder="Bangalore"
                  value={form.address}
                  onChange={e => sf('address', e.target.value)}
                />
              </div>

              <div className="et-field-row">
                <div className="et-field">
                  <label htmlFor="et-bday">
                    Birthday <span className="et-field__opt">(anniversary wishes)</span>
                  </label>
                  <input
                    id="et-bday"
                    type="date"
                    value={form.birthday}
                    onChange={e => sf('birthday', e.target.value)}
                  />
                </div>
                <div className="et-field">
                  <label htmlFor="et-ann">
                    Anniversary <span className="et-field__opt">(optional)</span>
                  </label>
                  <input
                    id="et-ann"
                    type="date"
                    value={form.anniversary}
                    onChange={e => sf('anniversary', e.target.value)}
                  />
                </div>
              </div>

              {/* PAN NOTE */}
              <div className="et-pan-note">
                🧾 PAN for 80G tax benefit — collected after payment for faster checkout
              </div>

              <div className="et-form-divider" />

              {/* PAYMENT SUMMARY */}
              <div className="et-pay-summary">
                <div className="et-pay-summary__line">
                  <span>
                    {mode === 'gift'
                      ? `${occ.icon} ${occ.label} Gift`
                      : `${tier.name} × ${qty}`}
                  </span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="et-pay-summary__line et-pay-summary__line--muted">
                  <span>Plantation &amp; Care</span>
                  <span>₹0</span>
                </div>
                <div className="et-pay-summary__total">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* MAIN CTA */}
              <button
                className={`et-pay-btn${mode==='gift'?' et-pay-btn--gift':''}`}
                onClick={handlePay}
                disabled={loading}
              >
                {loading
                  ? <><span className="et-spin" aria-hidden="true" /> Saving...</>
                  : payBtnLabel()
                }
              </button>

              {/* PAYMENT METHODS */}
              <div className="et-pay-methods">
                <span>UPI</span>
                <span>·</span>
                <span>Card</span>
                <span>·</span>
                <span>Net Banking</span>
                <span>·</span>
                <span>Wallets</span>
              </div>
              <div className="et-pay-trust">
                <span>🔒 Secure · Razorpay</span>
                <span>📜 Certificate instantly</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ══ BELOW-FOLD SECTIONS — unchanged content ══ */}

      {/* HOW IT WORKS */}
      <section className="et-sec et-sec--how">
        <div className="et-c">
          <div className="et-sec__label">What Happens After You Pay</div>
          <div className="et-how">
            {[
              { icon:'🌱', n:'01', t:'We Plant',       d:'Our field team plants your tree at a verified Bangalore site within 7 days.' },
              { icon:'📍', n:'02', t:'GPS Tagged',      d:'A unique GPS coordinate and QR code is assigned to your specific tree.' },
              { icon:'🤖', n:'03', t:'AI Verified',     d:'Claude AI verifies species, location, timestamp and health before it reaches you.' },
              { icon:'📊', n:'04', t:'Live Dashboard',  d:'Track your tree with monthly photos and AI health scores for 3 full years.' },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="et-how__item">
                  <div className="et-how__icon">{s.icon}</div>
                  <div className="et-how__num">{s.n}</div>
                  <div className="et-how__title">{s.t}</div>
                  <div className="et-how__desc">{s.d}</div>
                </div>
                {i < 3 && <div className="et-how__arr" aria-hidden="true">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="et-sec et-sec--white">
        <div className="et-c">
          <div className="et-sec__label">From Sapling to Forest</div>
          <h2 className="et-h2">Real trees. <em>Real impact.</em></h2>
          <div className="et-gallery">
            {[
              { img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80', l:'🌱 Day 1 — Sapling planted',    s:'GPS-tagged, QR code attached' },
              { img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80', l:'🌿 Month 6 — Growing strong',   s:'AI health score: 94%' },
              { img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', l:'🌳 Year 3 — Full canopy',        s:'22kg CO₂ offset/year' },
            ].map(g => (
              <div className="et-gallery__item" key={g.l}>
                <img src={g.img} alt={g.l} className="et-gallery__img" loading="lazy" />
                <div className="et-gallery__cap">
                  <div className="et-gallery__cap-title">{g.l}</div>
                  <div className="et-gallery__cap-sub">{g.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="et-trust-strip">
        <div className="et-c et-trust-strip__inner">
          {[
            { i:'🧾', t:'80G Tax Benefit',     s:'Section 8 NGO · All donations eligible' },
            { i:'📜', t:'Certificate Instantly', s:'PDF emailed after payment' },
            { i:'🤖', t:'AI-Verified',           s:'Every photo independently checked' },
            { i:'📅', t:'3-Year Tracking',        s:'Monthly updates on dashboard' },
          ].map(x => (
            <div className="et-trust-strip__item" key={x.t}>
              <span className="et-trust-strip__icon">{x.i}</span>
              <div>
                <div className="et-trust-strip__title">{x.t}</div>
                <div className="et-trust-strip__sub">{x.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="et-sec et-sec--offwhite">
        <div className="et-c et-c--narrow">
          <div className="et-sec__label">FAQ</div>
          <h2 className="et-h2">Quick answers</h2>
          <FAQ />
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="et-bcta">
        <div className="et-c et-bcta__inner">
          <span>🌱 Ready to plant? Scroll up to choose your tier.</span>
          <div className="et-bcta__btns">
            <button
              className="et-btn et-btn--plant"
              onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
            >
              Plant a Tree · From ₹100
            </button>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${WA_MSG}`}
              target="_blank" rel="noopener"
              className="et-btn et-btn--wa"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        /* ── TOKENS ── */
        .et {
          --gd: #1B4332;
          --gm: #2D6A4F;
          --ga: #52B788;
          --gl: #74C69D;
          --mt: #D8F3DC;
          --md: #B7E4C7;
          --ow: #F4F7F4;
          --td: #0D1F17;
          --tb: #1B2E25;
          --tm: #4A6358;
          --gold: #D4A63F;
          --purple: #7C3AED;
          --r: 14px;
          font-family: var(--font-body, 'Segoe UI', system-ui, sans-serif);
          color: var(--td);
          background: var(--ow);
        }
        .et-c { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .et-c--narrow { max-width: 740px; }
        .et-sec { padding: 3rem 0; }
        .et-sec--white { background: #fff; }
        .et-sec--offwhite { background: var(--ow); }
        .et-sec--how { background: #fff; border-top: 1px solid var(--md); border-bottom: 1px solid var(--md); }
        .et-sec__label { display:inline-block; font-size:0.72rem; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--ga); background:rgba(82,183,136,0.12); padding:0.3rem 0.9rem; border-radius:999px; margin-bottom:1.25rem; }
        .et-h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 800; line-height: 1.18; color: var(--td); margin: 0 0 1.5rem; }
        .et-h2 em { color: var(--ga); font-style: normal; }

        /* ── ZONE 1: TRUST BAR ── */
        .et-trust {
          background: var(--gd);
          border-bottom: 1px solid rgba(116,198,157,0.2);
          padding: 0.55rem 0;
          position: sticky; top: 80px; z-index: 50;
        }
        .et-trust__inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
        }
        .et-trust__signals {
          display: flex; align-items: center; gap: 0.55rem;
          flex-wrap: wrap;
          font-size: 0.73rem; font-weight: 600; color: rgba(255,255,255,0.65);
        }
        .et-trust__dot { color: rgba(116,198,157,0.4); }
        .et-trust__actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .et-trust__btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.73rem; font-weight: 700; padding: 0.32rem 0.85rem;
          border-radius: 999px; cursor: pointer; border: none;
          font-family: inherit; transition: all 0.2s; white-space: nowrap;
        }
        .et-trust__btn--wa { background: #25D366; color: #fff; }
        .et-trust__btn--cp { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
        .et-trust__btn:hover { filter: brightness(1.1); }

        /* ── ZONE 2: HERO BANNER ── */
        .et-hero {
          background: var(--gd);
          position: relative; overflow: hidden;
          padding: 2.5rem 0 2rem;
          border-bottom: 3px solid rgba(82,183,136,0.3);
        }
        .et-hero__inner {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3rem; align-items: center;
        }
        .et-hero__left { min-width: 0; }
        .et-hero__eyebrow {
          font-size: 0.72rem; font-weight: 700; color: var(--gl);
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.6rem;
        }
        .et-hero__h1 {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900; color: #fff; line-height: 0.95;
          letter-spacing: -0.03em; margin-bottom: 0.7rem;
        }
        .et-hero__h1 em { color: var(--gl); font-style: normal; }
        .et-hero__sub {
          font-size: 0.8rem; color: rgba(255,255,255,0.55);
          margin-bottom: 1.25rem; letter-spacing: 0.04em;
        }
        .et-hero__toggles { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .et-tog {
          padding: 0.65rem 1.4rem; border-radius: 10px;
          font-size: 0.9rem; font-weight: 700;
          cursor: pointer; border: 2px solid transparent;
          font-family: inherit; transition: all 0.2s; white-space: nowrap;
        }
        .et-tog--plant {
          background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.15);
        }
        .et-tog--plant.active {
          background: var(--gm); color: #fff; border-color: var(--ga);
          box-shadow: 0 3px 12px rgba(82,183,136,0.3);
        }
        .et-tog--gift {
          background: rgba(124,58,237,0.15); color: rgba(255,255,255,0.7);
          border-color: rgba(124,58,237,0.3);
        }
        .et-tog--gift.active {
          background: var(--purple); color: #fff; border-color: var(--purple);
          box-shadow: 0 3px 12px rgba(124,58,237,0.4);
        }

        /* TIER PILLS in hero */
        .et-hero__tiers { min-width: 0; }
        .et-hero__tiers-label {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin-bottom: 0.75rem;
        }
        .et-hero__tier-pills {
          display: flex; gap: 0.6rem; flex-wrap: nowrap; overflow-x: auto;
        }
        .et-hero__tier-pills::-webkit-scrollbar { display: none; }
        .et-tier-pill {
          display: flex; flex-direction: column; align-items: flex-start;
          min-width: 120px; padding: 0.9rem 1rem;
          border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.07);
          color: #fff; cursor: pointer;
          transition: all 0.2s; font-family: inherit; text-align: left;
          flex-shrink: 0;
        }
        .et-tier-pill:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.35); }
        .et-tier-pill.on {
          background: #fff; color: var(--gd);
          border-color: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.2);
        }
        .et-tier-pill__loved {
          font-size: 0.6rem; font-weight: 800; color: var(--gold);
          letter-spacing: 0.07em; margin-bottom: 0.2rem;
          text-transform: uppercase;
        }
        .et-tier-pill.on .et-tier-pill__loved { color: var(--gold); }
        .et-tier-pill__amt {
          font-size: 1.15rem; font-weight: 900; line-height: 1; margin-bottom: 0.3rem;
        }
        .et-tier-pill__name { font-size: 0.78rem; font-weight: 700; margin-bottom: 0.15rem; }
        .et-tier-pill__desc { font-size: 0.68rem; opacity: 0.65; line-height: 1.3; }
        .et-tier-pill.on .et-tier-pill__desc { opacity: 0.6; }

        /* ── ZONE 3: TWO COLUMNS ── */
        .et-body { padding: 2rem 0 4rem; }
        .et-body__cols {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem; align-items: start;
        }

        /* ── ZONE 3A: TIER DETAIL ── */
        .et-detail {}

        /* Image */
        .et-detail__img-wrap {
          border-radius: 20px; overflow: hidden;
          position: relative; height: 300px;
          margin-bottom: 1rem;
        }
        .et-detail__img-inner {
          position: absolute; inset: 0;
        }
        .et-detail__img {
          object-fit: cover;
        }
        .et-detail__img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(11,31,23,0.82) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
        }
        .et-detail__img-caption {
          position: absolute; bottom: 0; left: 0; padding: 1.25rem 1.5rem;
          z-index: 2;
        }
        .et-detail__img-badge {
          display: inline-block; font-size: 0.6rem; font-weight: 800;
          color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px;
          letter-spacing: 0.07em; margin-bottom: 0.4rem;
        }
        .et-detail__img-name {
          font-size: 1.4rem; font-weight: 900; color: #fff; line-height: 1.1;
        }
        .et-detail__img-desc {
          font-size: 0.8rem; color: rgba(255,255,255,0.72); margin-top: 0.25rem;
        }

        /* GPS + Impact */
        .et-impact {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem; margin-bottom: 0.85rem;
        }
        .et-impact__map {
          border-radius: 12px; background: #e8f5e9;
          border: 1px solid var(--md);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 0.3rem;
          padding: 0.85rem 0.5rem; min-height: 90px;
        }
        .et-impact__map-pin {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--gd); position: relative; z-index: 2;
          box-shadow: 0 0 0 3px rgba(27,67,50,0.15);
        }
        .et-impact__map-ring {
          position: absolute; width: 40px; height: 40px;
          border-radius: 50%; border: 1.5px solid rgba(27,67,50,0.15);
        }
        .et-impact__map-ring2 {
          position: absolute; width: 65px; height: 65px;
          border-radius: 50%; border: 1px solid rgba(27,67,50,0.08);
        }
        .et-impact__map-pill {
          font-size: 0.65rem; font-weight: 700; color: var(--gd);
          position: absolute; top: 0.45rem; left: 0.45rem;
          background: rgba(255,255,255,0.9); padding: 0.15rem 0.5rem;
          border-radius: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .et-impact__map-region {
          font-size: 0.62rem; color: var(--tm); font-weight: 600; z-index: 2;
          margin-top: 0.3rem;
        }
        .et-impact__metric {
          background: #f0faf4; border: 1px solid var(--md);
          border-radius: 12px; padding: 0.85rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        .et-impact__metric-icon { font-size: 1.1rem; margin-bottom: 0.3rem; }
        .et-impact__metric-val {
          font-size: 1.3rem; font-weight: 900; color: var(--gd); line-height: 1;
        }
        .et-impact__metric-lbl {
          font-size: 0.7rem; color: var(--tm); margin-top: 0.2rem; line-height: 1.3;
        }

        /* Dashboard hint */
        .et-dashboard-hint {
          display: flex; align-items: flex-start; gap: 0.6rem;
          background: rgba(82,183,136,0.08); border: 1px solid var(--md);
          border-left: 3px solid var(--ga);
          border-radius: 10px; padding: 0.7rem 0.9rem;
          font-size: 0.8rem; color: var(--tm); line-height: 1.55;
          margin-bottom: 1rem;
        }
        .et-dashboard-hint span:first-child { font-size: 1rem; flex-shrink: 0; }

        /* Species */
        .et-species {
          background: #fff; border: 1.5px solid var(--md);
          border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 0.85rem;
        }
        .et-species__label {
          font-size: 0.88rem; font-weight: 700; color: var(--tb); margin-bottom: 0.5rem;
        }
        .et-species__opt { font-weight: 400; color: var(--tm); font-size: 0.78rem; }
        .et-species__select {
          width: 100%; padding: 0.65rem 0.9rem;
          border: 1.5px solid var(--md); border-radius: 10px;
          font-size: 0.95rem; color: var(--td); background: #fff;
          outline: none; font-family: inherit; cursor: pointer;
        }
        .et-species__select:focus { border-color: var(--ga); }
        .et-miyawaki-note {
          font-size: 0.78rem; color: var(--gm); background: var(--mt);
          padding: 0.6rem 0.9rem; border-radius: 8px;
          border-left: 3px solid var(--ga); margin-bottom: 0.85rem;
        }

        /* What's included */
        .et-what {
          background: #fff; border: 1px solid var(--md);
          border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 1rem;
        }
        .et-what__label {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--tm); margin-bottom: 0.65rem;
        }
        .et-what__grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem 0.5rem;
        }
        .et-what__item {
          display: flex; align-items: flex-start; gap: 0.4rem;
          font-size: 0.78rem; color: var(--gm); font-weight: 500;
        }
        .et-what__check { color: var(--ga); font-weight: 800; flex-shrink: 0; font-size: 0.8rem; }

        /* Quantity */
        .et-qty {
          display: flex; align-items: center; justify-content: space-between;
          background: #fff; border: 1.5px solid var(--md);
          border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 1rem;
        }
        .et-qty__label { font-size: 0.9rem; font-weight: 700; color: var(--tb); }
        .et-qty__sub { font-size: 0.73rem; color: var(--tm); margin-top: 0.2rem; }
        .et-qty__ctrl { display: flex; align-items: center; gap: 0.65rem; }
        .et-qty__btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid var(--md); background: #fff;
          font-size: 1.1rem; cursor: pointer; color: var(--gd);
          display: flex; align-items: center; justify-content: center;
          font-family: inherit; line-height: 1; transition: all 0.15s;
        }
        .et-qty__btn:hover { background: var(--gd); color: #fff; border-color: var(--gd); }
        .et-qty__num { font-size: 1.1rem; font-weight: 900; color: var(--gd); min-width: 24px; text-align: center; }

        /* ── ZONE 3B: FORM PANEL ── */
        .et-form-col {}
        .et-form-panel {
          background: #fff; border: 1.5px solid var(--md);
          border-radius: var(--r); padding: 1.5rem;
          position: sticky; top: 130px;
          box-shadow: 0 4px 24px rgba(27,67,50,0.08);
        }

        /* Panel header */
        .et-panel-hdr {
          display: flex; align-items: center; gap: 0.75rem;
          background: var(--ow); border-radius: 10px;
          padding: 0.75rem 0.9rem; margin-bottom: 0.65rem;
        }
        .et-panel-hdr__icon { font-size: 1.5rem; flex-shrink: 0; }
        .et-panel-hdr__info { flex: 1; min-width: 0; }
        .et-panel-hdr__eyebrow {
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--tm);
        }
        .et-panel-hdr__name { font-size: 0.95rem; font-weight: 800; color: var(--td); margin-top: 0.1rem; }
        .et-panel-hdr__price { font-size: 1.15rem; font-weight: 900; color: var(--gd); flex-shrink: 0; }

        /* Order meta tags */
        .et-order-meta {
          display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.85rem;
        }
        .et-order-meta span {
          font-size: 0.68rem; background: var(--mt); color: var(--gd);
          padding: 0.18rem 0.5rem; border-radius: 999px; font-weight: 600;
        }

        .et-form-divider { height: 1px; background: var(--md); margin: 0.85rem 0; }

        /* Gift section */
        .et-gift {
          background: #F7F0FF; border: 1.5px solid #E4D5FF;
          border-radius: 12px; padding: 1rem 1.1rem; margin-bottom: 0.85rem;
        }
        .et-gift__title {
          font-size: 0.88rem; font-weight: 700; color: var(--purple);
          margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;
        }

        /* Section label */
        .et-section-label {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--tm); margin-bottom: 0.75rem;
        }

        /* Form fields — VISIBLE DARK LABELS */
        .et-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.65rem; }
        .et-field label {
          font-size: 0.84rem; font-weight: 700; color: var(--tb);
          /* DARK VISIBLE LABEL */
        }
        .et-field__opt { font-weight: 400; color: var(--tm); font-size: 0.76rem; }
        .et-field input,
        .et-field select,
        .et-field textarea,
        .et-field__select,
        .et-gift .et-field__select {
          width: 100%; padding: 0.68rem 0.85rem;
          border: 1.5px solid var(--md); border-radius: 10px;
          font-size: 0.95rem; color: var(--td); background: #fff;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit; box-sizing: border-box;
        }
        .et-field input:focus,
        .et-field select:focus,
        .et-field textarea:focus,
        .et-field__select:focus {
          border-color: var(--ga); box-shadow: 0 0 0 3px rgba(82,183,136,0.1);
        }
        .et-field input::placeholder,
        .et-field textarea::placeholder { color: #AABFB4; font-size: 0.85rem; }
        .et-field textarea { resize: vertical; min-height: 66px; }
        .et-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }

        /* Gift field labels — purple */
        .et-gift .et-field label { color: #6D28D9; }
        .et-gift .et-field input,
        .et-gift .et-field select,
        .et-gift .et-field textarea,
        .et-gift .et-field__select {
          border-color: #E4D5FF;
        }
        .et-gift .et-field input:focus,
        .et-gift .et-field select:focus,
        .et-gift .et-field textarea:focus {
          border-color: var(--purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }

        /* Error states */
        .et-err-border { border-color: #DC2626 !important; }
        .et-err {
          font-size: 0.76rem; color: #DC2626;
          margin-top: 2px; display: flex; align-items: center; gap: 4px;
        }

        /* PAN note */
        .et-pan-note {
          font-size: 0.76rem; color: var(--tm); background: var(--ow);
          padding: 0.5rem 0.75rem; border-radius: 8px;
          border-left: 3px solid var(--ga); margin-bottom: 0.85rem; line-height: 1.5;
        }

        /* Payment summary */
        .et-pay-summary {
          background: var(--ow); border-radius: 10px;
          padding: 0.85rem 1rem; margin-bottom: 0.85rem;
        }
        .et-pay-summary__line {
          display: flex; justify-content: space-between;
          font-size: 0.84rem; color: var(--tb); margin-bottom: 0.3rem;
          font-weight: 600;
        }
        .et-pay-summary__line--muted { color: var(--tm); font-weight: 400; }
        .et-pay-summary__total {
          display: flex; justify-content: space-between;
          font-size: 1rem; font-weight: 900; color: var(--gd);
          border-top: 1px solid var(--md); padding-top: 0.55rem; margin-top: 0.3rem;
        }

        /* CTA button */
        .et-pay-btn {
          width: 100%; padding: 0.95rem;
          background: #2C5F2D; color: #fff;
          border: none; border-radius: 12px;
          font-size: 0.97rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 0.5rem;
          transition: all 0.2s; font-family: inherit;
          box-shadow: 0 4px 20px rgba(44,95,45,0.3); margin-bottom: 0.6rem;
        }
        .et-pay-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .et-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .et-pay-btn--gift { background: var(--purple); box-shadow: 0 4px 20px rgba(124,58,237,0.3); }
        .et-pay-btn--gift:hover:not(:disabled) { filter: brightness(1.08); }

        .et-spin {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: et-sp 0.6s linear infinite;
        }
        @keyframes et-sp { to { transform: rotate(360deg); } }

        .et-pay-methods {
          text-align: center; font-size: 0.73rem; color: var(--tm);
          margin-bottom: 0.3rem; display: flex; justify-content: center; gap: 0.35rem;
        }
        .et-pay-trust {
          display: flex; justify-content: space-between;
          font-size: 0.72rem; color: var(--tm);
        }

        /* ── GIFT MODE — OCCASIONS GRID (left side) ── */
        .et-detail__section-lbl {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--tm); margin-bottom: 0.85rem;
        }
        .et-ogrid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0.6rem; margin-bottom: 0.5rem;
        }
        .et-ocard {
          position: relative; border: 2px solid var(--md);
          border-radius: 12px; padding: 0.85rem 0.4rem;
          cursor: pointer; text-align: center;
          transition: all 0.2s; background: #fff;
        }
        .et-ocard:hover, .et-ocard.sel {
          border-color: var(--ga); background: var(--mt);
        }
        .et-oi { font-size: 1.4rem; margin-bottom: 0.2rem; }
        .et-ol { font-size: 0.74rem; font-weight: 700; color: var(--td); margin-bottom: 0.15rem; }
        .et-op { font-size: 0.78rem; font-weight: 800; color: var(--gd); }
        .et-och {
          position: absolute; top: 0.3rem; right: 0.3rem;
          width: 16px; height: 16px; background: var(--ga); color: #fff;
          border-radius: 50%; font-size: 0.6rem;
          display: flex; align-items: center; justify-content: center; font-weight: 700;
        }
        .et-gfields { display: flex; flex-direction: column; gap: 0.75rem; }

        /* ── BELOW FOLD ── */
        .et-how { display: flex; align-items: flex-start; gap: 0; margin-top: 2rem; }
        .et-how__item {
          flex: 1; min-width: 120px; text-align: center;
          padding: 1.25rem 0.65rem; background: #fff;
          border-radius: var(--r); border: 1px solid var(--md);
          margin: 0 0.18rem; box-shadow: 0 1px 8px rgba(27,67,50,0.05);
        }
        .et-how__icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .et-how__num { font-size: 0.62rem; font-weight: 700; color: var(--ga); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.3rem; }
        .et-how__title { font-size: 0.9rem; font-weight: 800; color: var(--gd); margin-bottom: 0.3rem; }
        .et-how__desc { font-size: 0.75rem; color: var(--tm); line-height: 1.5; }
        .et-how__arr { font-size: 1.2rem; color: var(--ga); padding-top: 3rem; flex-shrink: 0; opacity: 0.5; }

        .et-gallery { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
        .et-gallery__item { border-radius: var(--r); overflow: hidden; border: 1px solid var(--md); }
        .et-gallery__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; transition: transform 0.3s; }
        .et-gallery__item:hover .et-gallery__img { transform: scale(1.03); }
        .et-gallery__cap { padding: 0.8rem 1rem; background: #fff; }
        .et-gallery__cap-title { font-size: 0.88rem; font-weight: 700; color: var(--gd); margin-bottom: 0.15rem; }
        .et-gallery__cap-sub { font-size: 0.74rem; color: var(--tm); }

        .et-trust-strip { background: var(--gd); padding: 1.5rem 0; }
        .et-trust-strip__inner { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .et-trust-strip__item { display: flex; align-items: flex-start; gap: 0.65rem; }
        .et-trust-strip__icon { font-size: 1.3rem; flex-shrink: 0; }
        .et-trust-strip__title { font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.1rem; }
        .et-trust-strip__sub { font-size: 0.7rem; color: rgba(255,255,255,0.55); line-height: 1.4; }

        .et-bcta { background: var(--mt); padding: 1rem 0; border-top: 1px solid var(--md); }
        .et-bcta__inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .et-bcta__inner > span { font-size: 0.88rem; font-weight: 600; color: var(--gd); }
        .et-bcta__btns { display: flex; gap: 0.6rem; }
        .et-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.4rem; font-size: 0.88rem; font-weight: 600;
          padding: 0.6rem 1.3rem; border-radius: 999px;
          text-decoration: none; cursor: pointer; border: none;
          transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .et-btn--plant { background: #2C5F2D; color: #fff; }
        .et-btn--wa { background: #25D366; color: #fff; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .et-body__cols { grid-template-columns: 1fr 360px; }
        }
        @media (max-width: 860px) {
          .et-hero__inner { grid-template-columns: 1fr; gap: 1.5rem; }
          .et-body__cols { grid-template-columns: 1fr; }
          .et-form-panel { position: static; }
        }
        @media (max-width: 640px) {
          .et-hero { padding: 1.75rem 0 1.5rem; }
          .et-hero__h1 { font-size: 2rem; }
          .et-impact { grid-template-columns: 1fr 1fr 1fr; }
          .et-what__grid { grid-template-columns: 1fr; }
          .et-field-row { grid-template-columns: 1fr; }
          .et-gallery { grid-template-columns: 1fr; }
          .et-trust-strip__inner { grid-template-columns: repeat(2,1fr); }
          .et-how { flex-wrap: wrap; gap: 1rem; }
          .et-how__arr { display: none; }
          .et-bcta__inner { flex-direction: column; align-items: stretch; }
          .et-bcta__btns { flex-direction: column; }
          .et-trust__signals { display: none; }
        }
        @media (max-width: 420px) {
          .et-impact { grid-template-columns: 1fr 1fr; }
          .et-impact__map { grid-column: 1 / -1; }
        }
      `}</style>
    </main>
  )
}

// ─────────────────────────────────────────────
// FAQ COMPONENT — unchanged from original
// ─────────────────────────────────────────────
function FAQ() {
  const [o, setO] = useState<number|null>(null)
  const qs = [
    { q:'What is the difference between Community and Individual?', a:'Community (₹100/₹250) contributes to our shared forest — you get a certificate and dashboard but no individual tree ID. Individual (₹1000) plants a specific tree in your name with GPS tracking, photos and AI health scores.' },
    { q:'How does the Joint Tree (₹500) work?', a:'Two people each donate ₹500 — together ₹1000 plants one tree. You are auto-matched with one other donor. Once matched, both receive the shared tree dashboard with GPS, photos and health updates.' },
    { q:'When will I receive my certificate?', a:'Your PDF certificate is emailed instantly after payment. Community donors get a Community Forest Certificate. Individual donors get a personalized tree certificate.' },
    { q:'How do I know my tree was actually planted?', a:'Within 7 days, our field team plants and GPS-tags your tree. Claude AI verifies the photo — species, GPS, timestamp, health — before it appears on your dashboard.' },
    { q:'How do I claim the 80G tax benefit?', a:'Provide your PAN on the thank-you page after payment. EcoTree Impact Foundation is a registered Section 8 company with 80G approval.' },
    { q:'What is the Miyawaki Forest option?', a:'Miyawaki creates dense micro-forests with 30+ native species — 10x faster growth, 30x more biodiversity. At ₹5,000 you sponsor one forest patch and get a dedicated forest dashboard with BRSR-compatible reports.' },
  ]
  return (
    <div className="fq">
      {qs.map((f, i) => (
        <div key={i} className="fqi">
          <button className={`fqq${o===i?' op':''}`} onClick={() => setO(o===i ? null : i)}>
            <span>{f.q}</span>
            <span className="fqc">{o===i ? '−' : '+'}</span>
          </button>
          {o===i && <div className="fqa">{f.a}</div>}
        </div>
      ))}
      <style>{`
        .fq { display:flex; flex-direction:column; gap:0.6rem; margin-top:1.5rem; }
        .fqi { border:1px solid #B7E4C7; border-radius:0.6rem; overflow:hidden; }
        .fqq { width:100%; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:1rem 1.1rem; font-size:0.92rem; font-weight:600; color:#1B4332; background:#F8FAF8; border:none; cursor:pointer; text-align:left; font-family:inherit; transition:background 0.15s; }
        .fqq:hover, .fqq.op { background:#D8F3DC; }
        .fqc { font-size:1.2rem; color:#52B788; flex-shrink:0; }
        .fqa { padding:0.9rem 1.1rem; font-size:0.9rem; line-height:1.7; color:#2D3B36; background:#fff; border-top:1px solid #B7E4C7; }
      `}</style>
    </div>
  )
}
