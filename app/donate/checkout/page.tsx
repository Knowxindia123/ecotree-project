'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── UNCHANGED UTILITIES ───
function makeCertId()     { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }
function generateTreeId() { return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}` }

async function sendEmail(type: string, donor: Record<string, any>) {
  try { await fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, donor }) }) }
  catch (err) { console.error('Email send failed:', err) }
}

interface FormErrors { name?: string; email?: string; phone?: string; recipientName?: string; recipientEmail?: string }

// ─── SELECTION TYPE read from sessionStorage ───
interface Selection {
  tierId: string; tierName: string; tierBadge: string; badgeColor: string
  tierIcon: string; tierImg: string; tierPrice: number
  tierCo2: string; tierWater: string; tierDashboard: string
  species: string; speciesTitle: string; speciesImg: string
  qty: number; mode: 'plant'|'gift'
  occId: string; occIcon: string; occLabel: string; occPrice: number
  total: number
}

// ─── TIER IMPACT DATA for order summary ───
const TIER_IMPACT: Record<string, {icon:string;val:string;lbl:string}[]> = {
  community_100:   [{icon:'🌳',val:'Forest',lbl:'Community'},{icon:'🌍',val:'~5kg',lbl:'CO₂/yr'},{icon:'📜',val:'Cert',lbl:'Instant'}],
  community_250:   [{icon:'🌳',val:'Forest',lbl:'Community'},{icon:'🌍',val:'~5kg',lbl:'CO₂/yr'},{icon:'📜',val:'Cert',lbl:'Instant'}],
  joint_500:       [{icon:'🌍',val:'~11kg',lbl:'CO₂/yr'},{icon:'📍',val:'GPS',lbl:'Tracked'},{icon:'💧',val:'~500L',lbl:'Water/yr'}],
  individual_1000: [{icon:'🌍',val:'~22kg',lbl:'CO₂/yr'},{icon:'💧',val:'~1,000L',lbl:'Water/yr'},{icon:'📍',val:'GPS',lbl:'3yr tracked'}],
  miyawaki_5000:   [{icon:'🌍',val:'~200kg',lbl:'CO₂/yr'},{icon:'🌿',val:'30+',lbl:'Species'},{icon:'⚡',val:'10×',lbl:'Faster'}],
}

const TIER_META: Record<string, string[]> = {
  community_100:   ['🌿 Community forest','📜 Certificate','📊 Dashboard'],
  community_250:   ['🌿 Community forest','📜 Certificate','📊 Dashboard','🎟 Priority invites'],
  joint_500:       ['🤝 Shared tree','📍 GPS tracked','📜 Certificate','🧾 80G'],
  individual_1000: ['🌍 ~22kg CO₂/yr','📍 GPS 3yr','📜 Certificate','🤖 AI verified','🧾 80G'],
  miyawaki_5000:   ['🏙️ 30+ species','📊 Forest dashboard','🧬 Biodiversity report','🧾 80G'],
}

export default function CheckoutPage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [certId] = useState(makeCertId)

  // ─── Selection from sessionStorage ───
  const [sel, setSel] = useState<Selection|null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ecotree_selection')
      if (!saved) { router.replace('/donate'); return }
      const s: Selection = JSON.parse(saved)
      if (!s.tierId) { router.replace('/donate'); return }
      setSel(s)
    } catch { router.replace('/donate') }
    setReady(true)
  }, [router])

  // ─── Form state — all original field names ───
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [form, setForm] = useState({
    name:'', email:'', phone:'', address:'',
    birthday:'', anniversary:'',
    recipientName:'', recipientEmail:'', giftMessage:'',
  })

  const sf = (k: string, v: string) => {
    setForm(p=>({...p,[k]:v}))
    if (errors[k as keyof FormErrors]) setErrors(p=>({...p,[k]:undefined}))
  }

  const Err = ({ msg }: { msg?: string }) =>
    msg ? <div style={{fontSize:'0.74rem',color:'#dc2626',marginTop:'3px',display:'flex',alignItems:'center',gap:'4px'}}>⚠️ {msg}</div> : null

  // ─── Derived values ───
  const isGift     = sel?.mode === 'gift'
  const isComm     = sel?.tierId === 'community_100' || sel?.tierId === 'community_250'
  const isJoint    = sel?.tierId === 'joint_500'
  const isIndiv    = sel?.tierId === 'individual_1000'
  const isMiya     = sel?.tierId === 'miyawaki_5000'
  const total      = sel?.total ?? 0
  const accentColor = isGift ? '#7C3AED' : '#1B4332'
  const ctaBg       = isGift ? 'linear-gradient(135deg,#9333ea,#7C3AED)' : 'linear-gradient(135deg,#2D6A4F,#1B4332)'

  // ─── Validate ───
  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/[\s+\-()]/g,''))) e.phone = 'Please enter a valid 10-digit Indian mobile number'
    if (isGift) {
      if (!form.recipientName.trim()) e.recipientName = 'Please enter recipient name'
      if (!form.recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) e.recipientEmail = 'Please enter valid recipient email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ─── handlePay — 100% identical Supabase logic from original ───
  const handlePay = async () => {
    if (loading || !sel) return
    if (!validate()) { formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); return }
    setLoading(true)

    const species  = sel.species || 'Neem'
    const qty      = sel.qty || 1
    const tierId   = sel.tierId
    const tierTier = sel.tierId.includes('100') ? '100'
                   : sel.tierId.includes('250') ? '250'
                   : sel.tierId.includes('500') && !sel.tierId.includes('5000') ? '500'
                   : sel.tierId.includes('1000') ? '1000' : '5000'
    const occ      = { id:sel.occId, label:sel.occLabel, price:sel.occPrice }
    const mode     = sel.mode

    try {
      let donorId: number
      let isNewDonor = false

      const { data: existing } = await supabase
        .from('donors').select('id, total_trees, total_donated')
        .eq('email', form.email).eq('tier', tierTier).maybeSingle()

      if (existing) {
        donorId = existing.id
        await supabase.from('donors').update({
          total_trees: (tierId==='joint_500'||isComm) ? (existing.total_trees||0) : (existing.total_trees||0)+1,
          total_donated: (Number(existing.total_donated)||0)+total,
          phone: form.phone, address: form.address||null,
          birthday: form.birthday||null, anniversary: form.anniversary||null,
        }).eq('id', donorId)
      } else {
        const { data: newDonor, error: donorErr } = await supabase.from('donors').insert({
          name: form.name, email: form.email, phone: form.phone,
          address: form.address||null, birthday: form.birthday||null, anniversary: form.anniversary||null,
          total_trees: (tierId==='joint_500'||isComm) ? 0 : 1,
          total_donated: total, city: 'Bangalore',
          is_gift: isGift,
          gift_from_name:  isGift ? form.name        : null,
          gift_from_email: isGift ? form.email       : null,
          gift_occasion:   isGift ? occ.label        : null,
          gift_message:    isGift ? form.giftMessage : null,
          tier: tierTier,
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

      // ── COMMUNITY ──
      if (isComm) {
        await supabase.from('donations').insert({
          cert_id:certId, donor_id:donorId, payment_status:'PAID', mode,
          tree_tier_id:tierId, tree_name:sel.tierName, amount:total,
          donor_name:form.name, donor_email:form.email, donor_phone:form.phone,
          payment_ref:`TEST-${certId}`, payment_method:'test',
          occasion_id:isGift?occ.id:null, occasion_label:isGift?occ.label:null,
          recipient_name:form.recipientName||null, recipient_email:form.recipientEmail||null,
          gift_message:form.giftMessage||null,
        })
        await sendEmail('welcome', {
          name:form.name, email:form.email, tree_id:certId,
          species:'Community Forest', password:isNewDonor?'123456':null,
          tier:tierTier, dashboard:sel.tierDashboard,
        })

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
        await supabase.from('donations').insert({
          cert_id:certId, donor_id:donorId, payment_status:'PAID', mode,
          tree_tier_id:tierId, tree_name:sel.tierName, amount:total,
          donor_name:form.name, donor_email:form.email, donor_phone:form.phone,
          payment_ref:`TEST-${certId}`, payment_method:'test',
          occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null,
          recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null,
        })

      // ── INDIVIDUAL ₹1000 ──
      } else if (isIndiv) {
        for (let qi = 0; qi < qty; qi++) {
          treeId = generateTreeId()
          await supabase.from('trees').insert({ tree_id:treeId, donor_id:donorId, tree_type:sel.tierName, species:species||'Neem', status:'PENDING', planting_date:new Date().toISOString().split('T')[0] })
        }
        await supabase.from('donations').insert({
          cert_id:certId, donor_id:donorId, payment_status:'PAID', mode,
          tree_tier_id:tierId, tree_name:sel.tierName, species:species||'Neem', amount:total,
          donor_name:form.name, donor_email:form.email, donor_phone:form.phone,
          payment_ref:`TEST-${certId}`, payment_method:'test',
          occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null,
          recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null,
        })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:treeId, species:species||'Neem', password:isNewDonor?'123456':null, tier:'1000', dashboard:'/my-tree' })

      // ── MIYAWAKI ₹5000 ──
      } else if (isMiya) {
        await supabase.from('miyawaki_donors').insert({ donor_id:donorId, amount:5000, is_gift:isGift, gift_from_name:isGift?form.name:null, gift_occasion:isGift?occ.label:null })
        await supabase.from('donations').insert({
          cert_id:certId, donor_id:donorId, payment_status:'PAID', mode,
          tree_tier_id:tierId, tree_name:sel.tierName, amount:total,
          donor_name:form.name, donor_email:form.email, donor_phone:form.phone,
          payment_ref:`TEST-${certId}`, payment_method:'test',
          occasion_id:isGift?occ.id:null, recipient_name:form.recipientName||null,
          recipient_email:form.recipientEmail||null, gift_message:form.giftMessage||null,
        })
        await sendEmail('welcome', { name:form.name, email:form.email, tree_id:certId, species:'30+ native species (Miyawaki)', password:isNewDonor?'123456':null, tier:'5000', dashboard:'/miyawaki-dashboard' })
      }

      // ── Success: save thank-you data + redirect (unchanged) ──
      sessionStorage.setItem('ecotree_ty', JSON.stringify({
        certId, name:form.name, email:form.email, phone:form.phone,
        treeName: isGift ? `${sel.occIcon} ${sel.occLabel} Gift` : sel.tierName,
        species: species || sel.tierName,
        co2: sel.tierCo2 || '~22kg', amount: total,
        mode, tierId, tierBadge: sel.tierBadge,
        recipientName: form.recipientName, recipientEmail: form.recipientEmail,
        occasion: occ.label, giftMessage: form.giftMessage,
        treeId, donorId, dashboard: sel.tierDashboard,
      }))
      // Clear selection after successful payment
      sessionStorage.removeItem('ecotree_selection')
      setLoading(false)
      window.location.href = '/thank-you'

    } catch (err: any) {
      console.error('Donation error:', err)
      alert('Something went wrong: ' + (err.message || 'Please try again.'))
      setLoading(false)
    }
  }

  // ─── CTA LABEL ───
  const ctaLabel = () => {
    if (loading) return '⏳ Saving...'
    if (isGift)  return `🎁 Gift This Living Tree · ₹${total.toLocaleString('en-IN')}`
    if (isIndiv) return `🌱 Adopt This Living Tree · ₹${total.toLocaleString('en-IN')}`
    if (isJoint) return `🤝 Join Tree Pool · ₹${total.toLocaleString('en-IN')}`
    if (isMiya)  return `🏙️ Create Urban Forest · ₹${total.toLocaleString('en-IN')}`
    return `🌿 Join Community Forest · ₹${total.toLocaleString('en-IN')}`
  }

  if (!ready || !sel) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',fontFamily:'system-ui',color:'#4A6358'}}>
      Loading your order...
    </div>
  )

  // ─── SHARED STYLES ───
  const fieldStyle = (hasErr?: boolean) => ({
    width:'100%', padding:'0.65rem 0.85rem',
    border:`1.5px solid ${hasErr?'#dc2626':'#B7E4C7'}`,
    borderRadius:'9px', fontSize:'0.92rem', color:'#0D1F17',
    background:'#fff', outline:'none', fontFamily:'inherit',
    boxSizing:'border-box' as const,
    transition:'border-color 0.15s',
  })
  const labelStyle = { display:'block' as const, fontSize:'0.82rem', fontWeight:700, color:'#1B2E25', marginBottom:'0.28rem' }
  const metaTag = { fontSize:'0.62rem', background:'#D8F3DC', color:'#1B4332', padding:'0.13rem 0.48rem', borderRadius:'999px', fontWeight:600 as const }

  return (
    <main style={{fontFamily:"var(--font-body,'Segoe UI',system-ui,sans-serif)",background:'#F4F7F4',color:'#0D1F17',minHeight:'100vh'}}>

      {/* ── CHECKOUT HEADER ── */}
      <div style={{background: isGift ? '#4C1D95' : '#1B4332', borderBottom:`2px solid ${isGift?'rgba(167,139,250,0.3)':'rgba(82,183,136,0.25)'}`, padding:'0.9rem 0'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <button onClick={()=>router.push('/donate')} style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.75rem',fontWeight:600,color:isGift?'rgba(221,214,254,0.75)':'rgba(255,255,255,0.55)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',padding:0}}>
              ← Edit selection
            </button>
            <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
            <span style={{fontSize:'0.9rem',fontWeight:700,color:'#fff'}}>Complete Your {isGift?'Gift':'Donation'}</span>
          </div>
          {/* Progress indicator */}
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.72rem',fontWeight:600}}>
            <span style={{color:'rgba(255,255,255,0.4)'}}>① Select</span>
            <span style={{color:'rgba(255,255,255,0.3)'}}>→</span>
            <span style={{color:isGift?'#C4B5FD':'#74C69D',fontWeight:800}}>② Checkout</span>
            <span style={{color:'rgba(255,255,255,0.3)'}}>→</span>
            <span style={{color:'rgba(255,255,255,0.4)'}}>③ Done</span>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'1.5rem 1.5rem 4rem',display:'grid',gridTemplateColumns:'1fr 400px',gap:'1.5rem',alignItems:'start'}}>

        {/* ── LEFT: ORDER SUMMARY ── */}
        <div>

          {/* ORDER CARD */}
          <div style={{background:'#fff',border:`1.5px solid ${isGift?'#E4D5FF':'#B7E4C7'}`,borderRadius:'16px',overflow:'hidden',marginBottom:'1rem'}}>

            {/* Tier image — half height, emotional */}
            <div style={{position:'relative',height:'200px'}}>
              <img
                src={isIndiv && sel.speciesImg ? sel.speciesImg : sel.tierImg}
                alt={isIndiv ? sel.species : sel.tierName}
                style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
              />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(11,31,23,0.85) 0%,transparent 50%)'}}/>
              <div style={{position:'absolute',bottom:0,left:0,padding:'1rem 1.25rem'}}>
                <span style={{display:'inline-block',fontSize:'0.55rem',fontWeight:800,color:'#fff',background:sel.badgeColor,padding:'0.13rem 0.5rem',borderRadius:'4px',letterSpacing:'0.07em',marginBottom:'0.35rem'}}>{sel.tierBadge}</span>
                <div style={{fontSize:'1.3rem',fontWeight:900,color:'#fff',lineHeight:1}}>
                  {isGift ? `${sel.occIcon} ${sel.occLabel} Gift` : isIndiv ? sel.species : sel.tierName}
                </div>
                {isIndiv && sel.speciesTitle && (
                  <div style={{fontSize:'0.78rem',color:'#74C69D',fontStyle:'italic',marginTop:'0.15rem'}}>{sel.speciesTitle}</div>
                )}
                {isGift && (
                  <div style={{fontSize:'0.78rem',color:'#C4B5FD',fontStyle:'italic',marginTop:'0.15rem'}}>A living memory in someone's name</div>
                )}
              </div>
              {/* Edit button on image */}
              <button onClick={()=>router.push('/donate')} style={{position:'absolute',top:'0.75rem',right:'0.75rem',fontSize:'0.68rem',fontWeight:700,padding:'0.28rem 0.7rem',borderRadius:'999px',background:'rgba(255,255,255,0.18)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)',cursor:'pointer',backdropFilter:'blur(4px)'}}>
                ✏️ Change
              </button>
            </div>

            {/* Impact band — 3 col */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0,borderBottom:`1px solid ${isGift?'#E4D5FF':'#B7E4C7'}`}}>
              {(TIER_IMPACT[sel.tierId]||TIER_IMPACT.individual_1000).map((m,i)=>(
                <div key={m.lbl} style={{padding:'0.75rem 0.85rem',borderRight:i<2?`1px solid ${isGift?'#E4D5FF':'#B7E4C7'}`:'none',textAlign:'center' as const}}>
                  <div style={{fontSize:'1rem',marginBottom:'0.18rem'}}>{m.icon}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:900,color:isGift?'#6D28D9':'#1B4332',lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:'0.6rem',color:'#4A6358',marginTop:'0.12rem'}}>{m.lbl}</div>
                </div>
              ))}
            </div>

            {/* Meta tags + qty */}
            <div style={{padding:'0.85rem 1.1rem'}}>
              <div style={{display:'flex',flexWrap:'wrap' as const,gap:'0.28rem',marginBottom:'0.65rem'}}>
                {(TIER_META[sel.tierId]||[]).map(m=><span key={m} style={metaTag}>{m}</span>)}
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.85rem',color:'#2D3B36',fontWeight:600}}>
                <span>{isGift ? `${sel.occLabel} · Gift` : `${sel.tierName} × ${sel.qty}`}</span>
                <span style={{fontSize:'1.1rem',fontWeight:900,color:isGift?'#6D28D9':'#1B4332'}}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* DASHBOARD HINT */}
          <div style={{fontSize:'0.75rem',color:'#4A6358',background:'rgba(82,183,136,0.06)',border:'1px solid #B7E4C7',borderLeft:'3px solid #52B788',borderRadius:'8px',padding:'0.55rem 0.8rem',lineHeight:1.5,marginBottom:'1rem'}}>
            📊 After planting, your dashboard at <strong>{sel.tierDashboard}</strong> shows real-time GPS, photos and growth updates for 3 years.
          </div>

          {/* GIFT MODE — recipient fields on LEFT below order summary */}
          {isGift && (
            <div style={{background:'#F7F0FF',border:'1.5px solid #E4D5FF',borderRadius:'14px',padding:'1.1rem 1.2rem'}}>
              <div style={{fontSize:'0.75rem',fontWeight:800,color:'#7C3AED',textTransform:'uppercase' as const,letterSpacing:'0.1em',marginBottom:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                🎁 Gift recipient details
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.65rem',marginBottom:'0.65rem'}}>
                <div>
                  <label style={{...labelStyle,color:'#6D28D9'}}>Recipient name *</label>
                  <input type="text" placeholder="Who is this gift for?" value={form.recipientName} onChange={e=>sf('recipientName',e.target.value)} style={{...fieldStyle(!!errors.recipientName),borderColor:errors.recipientName?'#dc2626':'#E4D5FF'}}/>
                  <Err msg={errors.recipientName}/>
                </div>
                <div>
                  <label style={{...labelStyle,color:'#6D28D9'}}>Recipient email *</label>
                  <input type="email" placeholder="Their email for certificate" value={form.recipientEmail} onChange={e=>sf('recipientEmail',e.target.value)} style={{...fieldStyle(!!errors.recipientEmail),borderColor:errors.recipientEmail?'#dc2626':'#E4D5FF'}}/>
                  <Err msg={errors.recipientEmail}/>
                </div>
              </div>
              <div>
                <label style={{...labelStyle,color:'#6D28D9'}}>Personal message <span style={{fontWeight:400,fontSize:'0.74rem',color:'#9CA3AF'}}>(optional)</span></label>
                <textarea rows={2} placeholder="A living memory in their name..." value={form.giftMessage} onChange={e=>sf('giftMessage',e.target.value)} style={{...fieldStyle(),borderColor:'#E4D5FF',resize:'vertical' as const,minHeight:'60px'}}/>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT: DONOR FORM + PAYMENT ── */}
        <div ref={formRef}>
          <div style={{background:'#fff',border:`1.5px solid ${isGift?'#E4D5FF':'#B7E4C7'}`,borderRadius:'16px',padding:'1.35rem',position:'sticky',top:'20px',boxShadow:'0 4px 24px rgba(27,67,50,0.07)'}}>

            <div style={{fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.11em',color:'#4A6358',marginBottom:'0.75rem'}}>Your Details</div>

            {/* FORM FIELDS */}
            {([
              {k:'name',  l:'Full Name *',      p:'Your full name',  t:'text'},
              {k:'email', l:'Email Address *',  p:'your@email.com',  t:'email'},
              {k:'phone', l:'Phone Number *',   p:'98860 94611',     t:'tel'},
              {k:'address',l:'City / Address',  p:'Bangalore',       t:'text'},
            ] as {k:keyof typeof form,l:string,p:string,t:string}[]).map(f=>(
              <div key={f.k} style={{marginBottom:'0.55rem'}}>
                <label style={labelStyle}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>sf(f.k,e.target.value)} style={fieldStyle(!!errors[f.k as keyof FormErrors])}/>
                <Err msg={errors[f.k as keyof FormErrors]}/>
              </div>
            ))}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.55rem',marginBottom:'0.65rem'}}>
              {[{k:'birthday',l:'Birthday'},{k:'anniversary',l:'Anniversary'}].map(f=>(
                <div key={f.k}>
                  <label style={labelStyle}>{f.l} <span style={{fontWeight:400,fontSize:'0.72rem',color:'#9CA3AF'}}>(optional)</span></label>
                  <input type="date" value={form[f.k as keyof typeof form]} onChange={e=>sf(f.k,e.target.value)} style={fieldStyle()}/>
                </div>
              ))}
            </div>

            {/* PAN */}
            <div style={{fontSize:'0.73rem',color:'#4A6358',background:'#F4F7F4',padding:'0.45rem 0.7rem',borderRadius:'7px',borderLeft:`2.5px solid ${isGift?'#7C3AED':'#52B788'}`,marginBottom:'0.85rem',lineHeight:1.45}}>
              🧾 PAN for 80G tax benefit — collected after payment for faster checkout
            </div>

            <div style={{height:'1px',background:isGift?'#E4D5FF':'#B7E4C7',margin:'0.85rem 0'}}/>

            {/* PAYMENT SUMMARY */}
            <div style={{background:'#F4F7F4',borderRadius:'9px',padding:'0.8rem 0.95rem',marginBottom:'0.85rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#2D3B36',marginBottom:'0.28rem',fontWeight:600}}>
                <span>{isGift ? `${sel.occIcon} ${sel.occLabel} Gift` : isIndiv ? `${sel.species||sel.tierName} × ${sel.qty}` : `${sel.tierName} × ${sel.qty}`}</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.76rem',color:'#4A6358',marginBottom:'0.28rem'}}>
                <span>Plantation &amp; Care</span><span>₹0</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.98rem',fontWeight:900,color:isGift?'#6D28D9':'#1B4332',borderTop:`1px solid ${isGift?'#E4D5FF':'#B7E4C7'}`,paddingTop:'0.5rem',marginTop:'0.28rem'}}>
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* MAIN CTA */}
            <button
              onClick={handlePay}
              disabled={loading}
              style={{width:'100%',padding:'0.95rem',background:ctaBg,color:isGift?'#fff':'#D4A63F',border:'none',borderRadius:'12px',fontSize:'0.96rem',fontWeight:800,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',fontFamily:'inherit',boxShadow:isGift?'0 4px 20px rgba(124,58,237,0.3)':'0 4px 20px rgba(27,67,50,0.3)',marginBottom:'0.6rem',opacity:loading?0.7:1,transition:'all 0.2s'}}
            >
              {loading
                ? <><span style={{display:'inline-block',width:'13px',height:'13px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/> Saving...</>
                : ctaLabel()
              }
            </button>

            <div style={{textAlign:'center' as const,fontSize:'0.68rem',color:'#4A6358',marginBottom:'0.3rem',display:'flex',justifyContent:'center',gap:'0.3rem'}}>
              <span>UPI</span><span>·</span><span>Card</span><span>·</span><span>Net Banking</span><span>·</span><span>Wallets</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'#4A6358'}}>
              <span>🔒 Secure · Razorpay</span>
              <span>📜 Certificate instantly</span>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
