'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Unchanged utilities from original ──
function makeCertId()     { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }
function generateTreeId() { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }

async function sendEmail(type: string, donor: Record<string, any>) {
  try { await fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, donor }) }) }
  catch (err) { console.error('Email send failed:', err) }
}

interface FormErrors { name?: string; email?: string; phone?: string; recipientName?: string; recipientEmail?: string }

interface Sel {
  tierId: string; tierName: string; tierIcon: string; tierImg: string; tierFallback: string
  tierBadge: string; badgeColor: string; tierCo2: string; tierWater: string
  tierDashboard: string; tierWhat: string[]
  species: string; speciesTitle: string
  qty: number; mode: 'plant'|'gift'; commLevel: number
  occId: string; occIcon: string; occLabel: string; occPrice: number
  total: number
  recipientName?: string; recipientEmail?: string; giftMessage?: string
  certificateTitle?: string
}

function Img({ src, fallback, alt, style }: { src:string; fallback:string; alt:string; style?:React.CSSProperties }) {
  const alt1 = src.endsWith('.webp') ? src.replace('.webp', '.jpg') : src.replace('.jpg', '.webp')
  const srcs = [src, alt1, fallback]
  const [attempt, setAttempt] = useState(0)
  useEffect(() => { setAttempt(0) }, [src])
  return <img src={srcs[Math.min(attempt, srcs.length-1)]} alt={alt} style={style} onError={()=>setAttempt(a=>Math.min(a+1, srcs.length-1))} loading="lazy"/>
}

export default function CheckoutPage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [certId] = useState(makeCertId)
  const [sel, setSel] = useState<Sel|null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', birthday:'', anniversary:'', recipientName:'', recipientEmail:'', giftMessage:'' })

  useEffect(() => {
    try {
      const s: Sel = JSON.parse(sessionStorage.getItem('ecotree_selection') || 'null')
      if (!s?.tierId) { router.replace('/donate'); return }
      // Sanitize image paths — strip /trees/ prefix if present (handles stale sessionStorage)
      if (s.tierImg) s.tierImg = s.tierImg.replace('/trees/', '/')
      if (s.tierFallback) s.tierFallback = s.tierFallback.replace('/trees/', '/')
      setSel(s)
      // Pre-fill recipient fields from sessionStorage for gift mode
      if (s.mode === 'gift') {
        if (s.recipientName)  setForm(f=>({...f, recipientName:  s.recipientName}))
        if (s.recipientEmail) setForm(f=>({...f, recipientEmail: s.recipientEmail}))
        if (s.giftMessage)    setForm(f=>({...f, giftMessage:    s.giftMessage}))
      }
    } catch { router.replace('/donate') }
    setReady(true)
  }, [router])

  const sf = (k: string, v: string) => {
    setForm(p=>({...p,[k]:v}))
    if (errors[k as keyof FormErrors]) setErrors(p=>({...p,[k]:undefined}))
  }

  const Err = ({ msg }: { msg?: string }) =>
    msg ? <div className="co-err">⚠️ {msg}</div> : null

  const isGift  = sel?.mode === 'gift'
  const isComm  = sel?.tierId === 'community_100' || sel?.tierId === 'community_250'
  const isJoint = sel?.tierId === 'joint_500'
  const isIndiv = sel?.tierId === 'individual_1000'
  const isMiya  = sel?.tierId === 'miyawaki_5000'
  const total   = sel?.total ?? 0

  // ── validate — unchanged from original ──
  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/[\s+\-()]/g,''))) e.phone = 'Please enter a valid 10-digit Indian mobile number'
    if (isGift) {
      if (!form.recipientName.trim()) e.recipientName = 'Please enter recipient name'
      if (!form.recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) e.recipientEmail = 'Please enter a valid recipient email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── handlePay — 100% identical Supabase logic from original ──
  const handlePay = async () => {
    if (loading || !sel) return
    if (!validate()) { formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); return }
    setLoading(true)

    const species  = sel.species || 'Neem'
    const qty      = sel.qty || 1
    const tier     = { id:sel.tierId, tier: sel.tierId.includes('100')?'100':sel.tierId.includes('250')?'250':sel.tierId.includes('5000')?'5000':sel.tierId.includes('1000')?'1000':'500', name:sel.tierName, badge:sel.tierBadge, dashboard:sel.tierDashboard, co2:sel.tierCo2 }
    const occ      = { id:sel.occId, label:sel.occLabel, price:sel.occPrice }
    const mode     = sel.mode

    try {
      let donorId: number
      let isNewDonor = false

      const { data: existing } = await supabase
        .from('donors').select('id, total_trees, total_donated')
        .eq('email', form.email).eq('tier', tier.tier).maybeSingle()

      if (existing) {
        donorId = existing.id
        await supabase.from('donors').update({
          total_trees: (isJoint||isComm) ? (existing.total_trees||0) : (existing.total_trees||0)+1,
          total_donated: (Number(existing.total_donated)||0)+total,
          phone: form.phone, address: form.address||null,
          birthday: form.birthday||null, anniversary: form.anniversary||null,
        }).eq('id', donorId)
      } else {
        const { data: newDonor, error: donorErr } = await supabase.from('donors').insert({
          name: form.name, email: form.email, phone: form.phone,
          address: form.address||null, birthday: form.birthday||null, anniversary: form.anniversary||null,
          total_trees: (isJoint||isComm) ? 0 : 1,
          total_donated: total, city: 'Bangalore',
          is_gift: isGift,
          gift_from_name:  isGift ? form.name        : null,
          gift_from_email: isGift ? form.email       : null,
          gift_occasion:   isGift ? occ.label        : null,
          gift_message:    isGift ? form.giftMessage : null,
          tier: tier.tier,
        }).select('id').single()
        if (donorErr || !newDonor) throw new Error(donorErr?.message || 'Failed to create donor')
        donorId = newDonor.id
        isNewDonor = true
        await fetch('/api/create-donor', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, password:'123456', name:form.name, donorId }) })
      }

      let treeId = ''

      // ── COMMUNITY ──
      if (isComm) {
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:isGift?occ.id:null, occasion_label:isGift?occ.label:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:certId, species:'Community Forest', password:isNewDonor?'123456':null, tier:tier.tier, dashboard:tier.dashboard })

      // ── JOINT ₹500 ──
      } else if (isJoint) {
        for (let qi = 0; qi < qty; qi++) {
          const thisCertId = qi === 0 ? certId : makeCertId()
          const { data: allOpenPools } = await supabase.from('tree_pools').select('*').eq('tier','500').eq('status','OPEN').order('created_at',{ascending:true})
          let targetPool = null
          for (const pool of (allOpenPools||[])) {
            const { data: mem } = await supabase.from('tree_pool_members').select('id').eq('pool_id',pool.id).eq('donor_id',donorId).maybeSingle()
            if (!mem) { targetPool = pool; break }
          }
          if (targetPool) {
            await supabase.from('tree_pool_members').insert({ pool_id:targetPool.id, donor_id:donorId, amount:500, is_gift:isGift, gift_from_name:isGift?form.name:null, gift_occasion:isGift?occ.label:null })
            const newFilled = targetPool.slots_filled+1
            const newCollected = targetPool.amount_collected+500
            if (newFilled >= targetPool.slots_total) {
              treeId = generateTreeId()
              const { data: firstMember } = await supabase.from('tree_pool_members').select('donor_id').eq('pool_id',targetPool.id).order('created_at',{ascending:true}).limit(1).single()
              const { data: newTree } = await supabase.from('trees').insert({ tree_id:treeId, tree_type:'Joint Tree', species:species||'Neem', status:'PENDING', donor_id:firstMember?.donor_id||donorId, planting_date:new Date().toISOString().split('T')[0] }).select('id').single()
              await supabase.from('tree_pools').update({ slots_filled:newFilled, amount_collected:newCollected, status:'COMPLETE', tree_id:newTree?.id, completed_at:new Date().toISOString() }).eq('id',targetPool.id)
              const { data: members } = await supabase.from('tree_pool_members').select('donor_id, donors(name, email, total_trees)').eq('pool_id',targetPool.id)
              for (const m of members||[]) {
                const d = Array.isArray(m.donors)?m.donors[0]:m.donors as any
                await supabase.from('donors').update({ total_trees:(d?.total_trees||0)+1 }).eq('id',m.donor_id)
                if (d?.email) await sendEmail('welcome', { name:d.name, email:d.email, tree_id:treeId, species:species||'Neem', password:'123456', tier:'500', dashboard:'/my-tree', joint:true, matched:true, partner:(members||[]).filter((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.email!==d.email}).map((mm:any)=>{const dd=Array.isArray(mm.donors)?mm.donors[0]:mm.donors as any;return dd?.name})[0]||'your co-donor' })
              }
            } else {
              await supabase.from('tree_pools').update({ slots_filled:newFilled, amount_collected:newCollected }).eq('id',targetPool.id)
              await sendEmail('welcome', { name:form.name, email:form.email, tree_id:thisCertId, species:'Any native species', password:isNewDonor?'123456':null, tier:'500', dashboard:'/my-tree', waiting:true })
            }
          } else {
            const { data: newPool } = await supabase.from('tree_pools').insert({ tier:'500', slots_total:2, slots_filled:1, amount_collected:500, target_amount:1000, status:'OPEN' }).select('id').single()
            await supabase.from('tree_pool_members').insert({ pool_id:newPool?.id, donor_id:donorId, amount:500, is_gift:isGift, gift_from_name:isGift?form.name:null, gift_occasion:isGift?occ.label:null })
            await sendEmail('welcome', { name:form.name, email:form.email, tree_id:thisCertId, species:'Any native species', password:isNewDonor?'123456':null, tier:'500', dashboard:'/my-tree', waiting:true })
          }
        }
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })

      // ── INDIVIDUAL ₹1000 ──
      } else if (isIndiv) {
        for (let qi = 0; qi < qty; qi++) {
          treeId = generateTreeId()
          await supabase.from('trees').insert({ tree_id:treeId, donor_id:donorId, tree_type:tier.name, species:species||'Neem', status:'PENDING', planting_date:new Date().toISOString().split('T')[0] })
        }
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, species:species||'Neem', amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:treeId, species:species||'Neem', password:isNewDonor?'123456':null, tier:'1000', dashboard:'/my-tree' })

      // ── MIYAWAKI ₹5000 ──
      } else if (isMiya) {
        await supabase.from('miyawaki_donors').insert({ donor_id:donorId, amount:5000, is_gift:isGift, gift_from_name:isGift?form.name:null, gift_occasion:isGift?occ.label:null })
        await supabase.from('donations').insert({ cert_id:certId, donor_id:donorId, payment_status:'PAID', mode, tree_tier_id:tier.id, tree_name:tier.name, amount:total, donor_name:form.name, donor_email:form.email, donor_phone:form.phone, payment_ref:`TEST-${certId}`, payment_method:'test', occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:certId, species:'30+ native species (Miyawaki)', password:isNewDonor?'123456':null, tier:'5000', dashboard:'/miyawaki-dashboard' })
      }

      // ── Success — identical sessionStorage + redirect ──
      sessionStorage.setItem('ecotree_ty', JSON.stringify({ certId, name:form.name, email:form.email, phone:form.phone, treeName:isGift?`${sel.occIcon} ${sel.occLabel} Gift`:sel.tierName, species:species||sel.tierName, co2:sel.tierCo2||'~22kg', amount:total, mode, tierId:sel.tierId, tierBadge:sel.tierBadge, recipientName:form.recipientName, recipientEmail:form.recipientEmail, occasion:occ.label, giftMessage:form.giftMessage, treeId, donorId, dashboard:sel.tierDashboard }))
      sessionStorage.removeItem('ecotree_selection')
      setLoading(false)
      window.location.href = '/thank-you'

    } catch (err: any) {
      console.error('Donation error:', err)
      alert('Something went wrong: ' + (err.message || 'Please try again.'))
      setLoading(false)
    }
  }

  const ctaLabel = () => {
    if (loading) return '⏳ Saving...'
    if (isGift)  return `🎁 Gift This Living Tree · ₹${total.toLocaleString('en-IN')}`
    if (isIndiv) return `🌱 Adopt This Living Tree · ₹${total.toLocaleString('en-IN')}`
    if (isJoint) return `🤝 Join Tree Pool · ₹${total.toLocaleString('en-IN')}`
    if (isMiya)  return `🏙️ Create Urban Forest · ₹${total.toLocaleString('en-IN')}`
    return `🌿 Join Community Forest · ₹${total.toLocaleString('en-IN')}`
  }

  // Hide fixed CTA bar when keyboard opens (prevents page shake)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handler = () => setKeyboardOpen(window.innerHeight - vv.height > 150)
    vv.addEventListener('resize', handler)
    return () => vv.removeEventListener('resize', handler)
  }, [])

  if (!ready||!sel) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',fontFamily:'system-ui',color:'#4A6358',fontSize:'0.9rem'}}>
      Loading your order...
    </div>
  )

  const accentBg = isGift ? '#4C1D95' : '#1B4332'
  const ctaBg    = isGift ? 'linear-gradient(135deg,#9333ea,#7C3AED)' : 'linear-gradient(135deg,#2D6A4F,#1B4332)'
  const ctaColor = isGift ? '#fff' : '#D4A63F'

  const impactItems = isComm
    ? [{icon:'🌳',val:'Forest',lbl:'Community'},{icon:'🌍',val:'~5kg',lbl:'CO₂/yr'},{icon:'📜',val:'Cert',lbl:'Instant'}]
    : isJoint
    ? [{icon:'🌍',val:'~11kg',lbl:'CO₂/yr'},{icon:'📍',val:'GPS',lbl:'Tracked'},{icon:'💧',val:'~500L',lbl:'Water/yr'}]
    : isMiya
    ? [{icon:'🌍',val:'~200kg',lbl:'CO₂/yr'},{icon:'🌿',val:'30+',lbl:'Species'},{icon:'⚡',val:'10×',lbl:'Faster'}]
    : [{icon:'🌍',val:'~22kg',lbl:'CO₂/yr'},{icon:'💧',val:'~1,000L',lbl:'Water/yr'},{icon:'📍',val:'GPS',lbl:'3yr tracked'}]

  return (
    <main className="co">

      {/* ── CHECKOUT HEADER ── */}
      <div className="co-header" style={{background:accentBg}}>
        <div className="co-c co-header-inner">
          <button onClick={()=>router.push('/donate')} className="co-back">← Edit selection</button>
          <div className="co-steps">
            <span className="co-step co-step--done">① Select</span>
            <span className="co-step-arrow">→</span>
            <span className={`co-step co-step--active${isGift?' co-step--gift':''}`}>② Checkout</span>
            <span className="co-step-arrow">→</span>
            <span className="co-step">③ Done</span>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN ── */}
      <div className="co-body">
        <div className="co-c co-layout">

          {/* ── LEFT: ORDER SUMMARY ── */}
          <div className="co-left">

            {/* Hero image */}
            <div className="co-order-card">
              <div className="co-order-img">
                <Img src={sel.tierImg} fallback={sel.tierFallback} alt={sel.tierName} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                <div className="co-order-img-ov"/>
                <div className="co-order-img-caption">
                  <span className="co-order-badge" style={{background:sel.badgeColor}}>{sel.tierBadge}</span>
                  <div className="co-order-name">
                    {isGift ? `${sel.occIcon} ${sel.occLabel} Gift` : isIndiv&&sel.species ? sel.species : sel.tierName}
                  </div>
                  {isIndiv && sel.speciesTitle && <div className="co-order-subtitle">{sel.speciesTitle}</div>}
                  {isGift && <div className="co-order-subtitle" style={{color:'#C4B5FD'}}>A living memory in someone's name</div>}
                </div>
                <button onClick={()=>router.push('/donate')} className="co-change-btn">✏️ Change</button>
              </div>

              {/* Impact band */}
              <div className="co-impact-band">
                {impactItems.map((m,i)=>(
                  <div key={m.lbl} className="co-impact-item" style={{borderRight:i<2?'1px solid #E5E7EB':'none'}}>
                    <span className="co-impact-icon">{m.icon}</span>
                    <span className="co-impact-val" style={{color:isGift?'#6D28D9':'#1B4332'}}>{m.val}</span>
                    <span className="co-impact-lbl">{m.lbl}</span>
                  </div>
                ))}
              </div>

              {/* Meta + line item */}
              <div className="co-order-footer">
                <div className="co-order-meta">
                  {(sel.tierWhat||[]).slice(0,4).map(w=>(
                    <span key={w} className="co-meta-tag">{w}</span>
                  ))}
                </div>
                <div className="co-order-line">
                  <span>{isGift?`${sel.occLabel} Gift`:isIndiv&&sel.species?`${sel.species} × ${sel.qty}`:`${sel.tierName} × ${sel.qty}`}</span>
                  <span className="co-order-line-price" style={{color:isGift?'#6D28D9':'#1B4332'}}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Dashboard hint */}
            <div className="co-hint">
              📊 After planting, your dashboard at <strong>{sel.tierDashboard}</strong> shows real-time GPS, photos and growth updates for 3 years.
            </div>

            {/* GIFT RECIPIENT FIELDS — on left below order summary */}
            {isGift && (
              <div className="co-gift-panel">
                <div className="co-gift-title">🎁 Gift recipient details</div>
                <div className="co-field-row">
                  <div className="co-field">
                    <label className="co-label" style={{color:'#6D28D9'}}>Recipient name *</label>
                    <input type="text" placeholder="Who is this gift for?" value={form.recipientName} onChange={e=>sf('recipientName',e.target.value)} className={`co-input${errors.recipientName?' co-input--err':''}`} style={{borderColor:errors.recipientName?'#dc2626':'#E4D5FF'}}/>
                    <Err msg={errors.recipientName}/>
                  </div>
                  <div className="co-field">
                    <label className="co-label" style={{color:'#6D28D9'}}>Recipient email *</label>
                    <input type="email" placeholder="Their email for certificate" value={form.recipientEmail} onChange={e=>sf('recipientEmail',e.target.value)} className={`co-input${errors.recipientEmail?' co-input--err':''}`} style={{borderColor:errors.recipientEmail?'#dc2626':'#E4D5FF'}}/>
                    <Err msg={errors.recipientEmail}/>
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-label" style={{color:'#6D28D9'}}>Personal message <span style={{fontWeight:400,color:'#9CA3AF',fontSize:'0.74rem'}}>(optional)</span></label>
                  <textarea rows={2} placeholder="A living memory in their name..." value={form.giftMessage} onChange={e=>sf('giftMessage',e.target.value)} className="co-input" style={{resize:'vertical',minHeight:'60px',borderColor:'#E4D5FF'}}/>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: FORM + PAYMENT ── */}
          <div className="co-right" ref={formRef}>
            <div className="co-form-card" style={{borderColor:isGift?'#E4D5FF':'#B7E4C7'}}>

              <div className="co-form-section-label">Your Details</div>

              {([
                {k:'name',  l:'Full Name *',     p:'Your full name', t:'text'},
                {k:'email', l:'Email Address *', p:'your@email.com', t:'email'},
                {k:'phone', l:'Phone Number *',  p:'98860 94611',    t:'tel'},
                {k:'address',l:'City / Address', p:'Bangalore',      t:'text'},
              ] as {k:keyof typeof form;l:string;p:string;t:string}[]).map(f=>(
                <div key={f.k} className="co-field">
                  <label className="co-label">{f.l}</label>
                  <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>sf(f.k,e.target.value)} className={`co-input${errors[f.k as keyof FormErrors]?' co-input--err':''}`}/>
                  <Err msg={errors[f.k as keyof FormErrors]}/>
                </div>
              ))}

              <div className="co-field-row">
                {[{k:'birthday',l:'Birthday'},{k:'anniversary',l:'Anniversary'}].map(f=>(
                  <div key={f.k} className="co-field">
                    <label className="co-label">{f.l} <span style={{fontWeight:400,fontSize:'0.7rem',color:'#9CA3AF'}}>(optional)</span></label>
                    <input type="date" value={form[f.k as keyof typeof form]} onChange={e=>sf(f.k,e.target.value)} className="co-input"/>
                  </div>
                ))}
              </div>

              <div className="co-pan-note" style={{borderLeftColor:isGift?'#7C3AED':'#52B788'}}>
                🧾 PAN for 80G tax benefit — collected after payment for faster checkout
              </div>

              <div className="co-divider" style={{background:isGift?'#E4D5FF':'#B7E4C7'}}/>

              {/* Payment summary */}
              <div className="co-pay-summary">
                <div className="co-pay-line">
                  <span>{isGift?`${sel.occIcon} ${sel.occLabel} Gift`:isIndiv&&sel.species?`${sel.species} × ${sel.qty}`:`${sel.tierName} × ${sel.qty}`}</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="co-pay-line co-pay-line--muted">
                  <span>Plantation &amp; Care</span><span>₹0</span>
                </div>
                <div className="co-pay-total" style={{color:isGift?'#6D28D9':'#1B4332',borderTopColor:isGift?'#E4D5FF':'#B7E4C7'}}>
                  <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* CTA */}
              <button onClick={handlePay} disabled={loading} className="co-cta-btn" style={{background:ctaBg,color:ctaColor,opacity:loading?0.7:1}}>
                {loading
                  ? <><span className="co-spin"/>Saving...</>
                  : ctaLabel()
                }
              </button>

              <div className="co-pay-methods">
                <span>UPI</span><span>·</span><span>Card</span><span>·</span><span>Net Banking</span><span>·</span><span>Wallets</span>
              </div>
              <div className="co-pay-trust">
                <span>🔒 Secure · Razorpay</span><span>📜 Certificate instantly</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE STICKY CTA ── */}
      <div className={`co-mob-cta${keyboardOpen?' co-mob-cta--hidden':''}`} style={{background:accentBg,borderTopColor:isGift?'#7C3AED':'#D4A63F'}}>
        <div className="co-mob-cta-left">
          <div className="co-mob-cta-name">{isGift?`${sel.occLabel} Gift`:isIndiv&&sel.species?sel.species:sel.tierName}</div>
          <div className="co-mob-cta-price">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <button onClick={handlePay} disabled={loading} className="co-mob-cta-btn" style={{background:isGift?'#7C3AED':'#D4A63F',color:isGift?'#fff':'#1B4332'}}>
          {loading?'Saving...':isGift?'🎁 Gift →':isIndiv?'🌱 Adopt →':isJoint?'🤝 Join →':isMiya?'🏙️ Create →':'🌿 Join →'}
        </button>
      </div>

      <style>{`
        *{box-sizing:border-box;}
        .co{font-family:var(--font-body,'Segoe UI',system-ui,sans-serif);color:#0D1F17;background:#F4F7F4;min-height:100vh;}
        .co-c{max-width:1100px;margin:0 auto;padding:0 1.25rem;}

        /* HEADER */
        .co-header{padding:0.85rem 0;border-bottom:1px solid rgba(255,255,255,0.1);}
        .co-header-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .co-back{display:inline-flex;align-items:center;gap:0.4rem;font-size:0.82rem;font-weight:700;color:#fff;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.35);cursor:pointer;font-family:inherit;padding:0.4rem 1rem;border-radius:999px;transition:all 0.18s;text-decoration:none;}
        .co-back:hover{background:rgba(255,255,255,0.25);border-color:rgba(255,255,255,0.6);}
        .co-steps{display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;font-weight:600;}
        .co-step{color:rgba(255,255,255,0.35);}
        .co-step--active{color:#74C69D;font-weight:800;}
        .co-step--gift.co-step--active{color:#C4B5FD;}
        .co-step--done{color:rgba(255,255,255,0.4);}
        .co-step-arrow{color:rgba(255,255,255,0.2);}

        /* BODY */
        .co-body{padding:1.5rem 0 4rem;}
        .co-layout{display:grid;grid-template-columns:1fr 380px;gap:1.5rem;align-items:start;}

        /* ORDER CARD */
        .co-order-card{background:#fff;border:1px solid #B7E4C7;border-radius:16px;overflow:hidden;margin-bottom:0.85rem;box-shadow:0 2px 16px rgba(27,67,50,0.07);}
        .co-order-img{position:relative;aspect-ratio:4/3;height:auto;}
        .co-order-img-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(11,31,23,0.88) 0%,transparent 52%);}
        .co-order-img-caption{position:absolute;bottom:0;left:0;padding:1rem 1.2rem;}
        .co-order-badge{display:inline-block;font-size:0.55rem;font-weight:800;color:#fff;padding:0.12rem 0.48rem;border-radius:4px;letter-spacing:0.07em;margin-bottom:0.35rem;}
        .co-order-name{font-size:1.35rem;font-weight:900;color:#fff;line-height:1.1;}
        .co-order-subtitle{font-size:0.74rem;font-style:italic;margin-top:0.15rem;}
        .co-change-btn{position:absolute;top:0.75rem;right:0.75rem;font-size:0.65rem;font-weight:700;padding:0.25rem 0.65rem;border-radius:999px;background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.28);cursor:pointer;backdrop-filter:blur(4px);font-family:inherit;}
        .co-impact-band{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #E5E7EB;}
        .co-impact-item{padding:0.7rem 0.85rem;text-align:center;display:flex;flex-direction:column;gap:0.12rem;}
        .co-impact-icon{font-size:0.95rem;}
        .co-impact-val{font-size:1.05rem;font-weight:900;line-height:1;}
        .co-impact-lbl{font-size:0.72rem;color:#4A6358;font-weight:500;}
        .co-order-footer{padding:0.85rem 1.1rem;}
        .co-order-meta{display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.6rem;max-width:100%;}
        .co-meta-tag{font-size:0.68rem;background:#D8F3DC;color:#1B4332;padding:0.18rem 0.5rem;border-radius:999px;font-weight:600;white-space:nowrap;}
        .co-order-line{display:flex;justify-content:space-between;align-items:center;font-size:0.88rem;font-weight:600;color:#2D3B36;gap:0.5rem;}
        .co-order-line-price{font-size:1.15rem;font-weight:900;}

        /* HINT */
        .co-hint{font-size:0.85rem;color:#2D3B36;background:rgba(82,183,136,0.07);border:1px solid #B7E4C7;border-left:3px solid #52B788;border-radius:8px;padding:0.7rem 1rem;line-height:1.55;margin-bottom:0.85rem;}

        /* GIFT PANEL */
        .co-gift-panel{background:#F7F0FF;border:1.5px solid #E4D5FF;border-radius:14px;padding:1.1rem 1.2rem;}
        .co-gift-title{font-size:0.75rem;font-weight:800;color:#7C3AED;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.85rem;}

        /* FORM CARD */
        .co-form-card{background:#fff;border:1.5px solid #B7E4C7;border-radius:16px;padding:1.35rem;position:sticky;top:20px;box-shadow:0 4px 24px rgba(27,67,50,0.07);}
        .co-form-section-label{font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.11em;color:#5C7268;margin-bottom:0.75rem;}
        .co-field{display:flex;flex-direction:column;gap:0.28rem;margin-bottom:0.55rem;}
        .co-label{font-size:0.88rem;font-weight:700;color:#1B2E25;}
        .co-input{width:100%;padding:0.72rem 0.9rem;border:1.5px solid #B7E4C7;border-radius:9px;font-size:0.95rem;color:#0D1F17;background:#fff;outline:none;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;}
        .co-input:focus{border-color:#52B788;box-shadow:0 0 0 3px rgba(82,183,136,0.1);}
        .co-input--err{border-color:#dc2626 !important;}
        .co-input::placeholder{color:#AABFB4;font-size:0.85rem;}
        .co-field-row{display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;}
        .co-err{font-size:0.72rem;color:#dc2626;display:flex;align-items:center;gap:4px;margin-top:2px;}
        .co-pan-note{font-size:0.82rem;color:#5C7268;background:#F4F7F4;padding:0.55rem 0.85rem;border-radius:7px;border-left:3px solid #52B788;margin-bottom:0.85rem;line-height:1.5;}
        .co-divider{height:1px;margin:0.85rem 0;}
        .co-pay-summary{background:#F4F7F4;border-radius:9px;padding:0.8rem 0.95rem;margin-bottom:0.85rem;}
        .co-pay-line{display:flex;justify-content:space-between;font-size:0.88rem;color:#2D3B36;margin-bottom:0.32rem;font-weight:600;}
        .co-pay-line--muted{color:#6B7280;font-weight:400;}
        .co-pay-total{display:flex;justify-content:space-between;font-size:1.05rem;font-weight:900;border-top:1px solid;padding-top:0.55rem;margin-top:0.32rem;}
        .co-cta-btn{width:100%;padding:1.05rem;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-family:inherit;margin-bottom:0.7rem;transition:all 0.18s;box-shadow:0 4px 18px rgba(27,67,50,0.25);letter-spacing:0.01em;}
        .co-cta-btn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);}
        .co-cta-btn:disabled{cursor:not-allowed;}
        .co-spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:currentColor;border-radius:50%;animation:cospin 0.6s linear infinite;}
        @keyframes cospin{to{transform:rotate(360deg);}}
        .co-pay-methods{text-align:center;font-size:0.82rem;color:#4A6358;margin-bottom:0.4rem;display:flex;justify-content:center;gap:0.4rem;font-weight:600;}
        .co-pay-trust{display:flex;justify-content:space-between;font-size:0.8rem;color:#4A6358;font-weight:600;}

        /* MOBILE STICKY */
        .co-mob-cta--hidden{display:none !important;}
        .co-mob-cta{display:none;position:fixed;bottom:0;left:0;right:0;padding:10px 16px;z-index:200;align-items:center;justify-content:space-between;gap:12px;border-top:2px solid;box-shadow:0 -4px 20px rgba(0,0,0,0.15);}
        .co-mob-cta-left{}
        .co-mob-cta-name{font-size:0.7rem;color:rgba(255,255,255,0.6);font-weight:600;}
        .co-mob-cta-price{font-size:1.1rem;font-weight:900;line-height:1.2;}
        .co-mob-cta-btn{padding:0.62rem 1rem;border:none;border-radius:9px;font-size:0.8rem;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;}

        /* RESPONSIVE */
        @media(max-width:860px){
          .co-layout{grid-template-columns:1fr;}
          .co-form-card{position:static;}
          .co-mob-cta{display:flex;}
          .co-body{padding-bottom:90px;}
          .co-order-img{aspect-ratio:4/3;height:auto;}
        }
        @media(max-width:540px){
          .co-field-row{grid-template-columns:1fr;}
          .co-steps{display:none;}
          .co-back{font-size:0.78rem;padding:0.35rem 0.85rem;}
          .co-order-img{aspect-ratio:4/3;height:auto;}
          .co-order-name{font-size:1.3rem;}
          .co-label{font-size:0.85rem;}
          .co-input{font-size:0.92rem;padding:0.65rem 0.85rem;}
          .co-cta-btn{font-size:0.95rem;padding:1rem;}
          .co-pay-methods{font-size:0.78rem;}
          .co-pay-trust{font-size:0.75rem;}
          .co-mob-cta-btn{font-size:0.82rem;padding:0.65rem 1rem;}
        }
      `}</style>
    </main>
  )
}
