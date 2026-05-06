'use client'
import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const WHATSAPP = '919886094611'
const SITE_URL = 'https://ecotrees.org/donate'
const WA_MSG = encodeURIComponent(`India's only NGO where you can see your tree growing live.\nPlant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit\n${SITE_URL}`)

const treeTiers = [
  { id:'common',   icon:'🌿', name:'Common Species',      species:'Neem · Peepal · Banyan',             co2:'~5kg',   price:100,  tag:'⭐ Most Popular', tagColor:'#52B788', desc:'Hardy native trees, fast-growing, high survival rate.',          img:'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80' },
  { id:'fruit',    icon:'🥭', name:'Fruit Trees',          species:'Mango · Jamun · Guava',              co2:'~12kg',  price:250,  tag:'🍎 Dual Impact',  tagColor:'#F59E0B', desc:'Feeds communities while absorbing carbon.',                      img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id:'native',   icon:'🌳', name:'Native Large Trees',   species:'Rain Tree · Gulmohar · Arjuna',      co2:'~22kg',  price:500,  tag:'🌍 Max Impact',   tagColor:'#1B4332', desc:'Highest carbon sequestration, best for biodiversity.',            img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { id:'miyawaki', icon:'🏙️', name:'Miyawaki Mini Forest', species:'30+ native species · dense urban forest', co2:'~200kg', price:5000, tag:'🔥 Premium',  tagColor:'#7C3AED', desc:'10x faster growth, 30x more biodiversity.',                      img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&q=80', fixed:true },
]

const occasions = [
  { id:'birthday',    icon:'🎂', label:'Birthday',    price:100 },
  { id:'anniversary', icon:'💍', label:'Anniversary', price:250 },
  { id:'memory',      icon:'🕯', label:'In Memory',   price:100 },
  { id:'festival',    icon:'🎊', label:'Festival',    price:100 },
  { id:'baby',        icon:'👶', label:'New Baby',    price:250 },
  { id:'corporate',   icon:'🏢', label:'Corporate',   price:500 },
  { id:'custom',      icon:'🎁', label:'Custom',      price:100 },
]

const TIER_SPECIES: Record<string, string[]> = {
  common:   ['Neem', 'Peepal', 'Banyan'],
  fruit:    ['Mango', 'Jamun', 'Guava'],
  native:   ['Rain Tree', 'Gulmohar', 'Arjuna'],
  miyawaki: ['Neem', 'Peepal', 'Mango', 'Jamun', 'Rain Tree'],
}

function makeCertId() {
  return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}`
}

function generateTreeId() {
  return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}`
}

function generatePassword(name: string) {
  return `${name.replace(/\s/g,'').slice(0,4)}@${Math.floor(1000+Math.random()*9000)}`
}

// ── Send email helper ──
async function sendEmail(type: string, donor: Record<string, any>) {
  try {
    await fetch('/api/send-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, donor }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
    // Non-blocking — don't throw, donor flow continues
  }
}

export default function DonatePage() {
  const [mode, setMode]     = useState<'plant'|'gift'>('plant')
  const [tier, setTier]     = useState(treeTiers[0])
  const [qty,  setQty]      = useState(1)
  const [occ,  setOcc]      = useState(occasions[0])
  const [loading, setLoading] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [certId]              = useState(makeCertId)
  const formRef               = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', address:'',
    birthday:'', anniversary:'',
    recipientName:'', recipientEmail:'', giftMessage:''
  })
  const sf = (k:string, v:string) => setForm(p=>({...p,[k]:v}))
  const total = mode==='plant' ? ((tier as any).fixed ? tier.price : tier.price*qty) : occ.price

  const copyLink = () => {
    navigator.clipboard.writeText(SITE_URL)
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  const pickTier = (t: typeof treeTiers[0]) => {
    setTier(t)
    setQty(1)
    if (window.innerWidth < 900) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    }
  }

  const pickOcc = (o: typeof occasions[0]) => {
    setOcc(o)
    if (window.innerWidth < 900) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
    }
  }

  const handlePay = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert('Please fill in Name, Email and Phone to continue.')
      return
    }
    setLoading(true)

    try {
      // ── Step 1: Create or get donor ──
      let donorId: number
      let isNewDonor = false
      let tempPassword = ''

      const { data: existingDonor } = await supabase
        .from('donors')
        .select('id, total_trees, total_donated')
        .eq('email', form.email)
        .single()

      if (existingDonor) {
        donorId = existingDonor.id
        await supabase.from('donors').update({
          total_trees:   (existingDonor.total_trees || 0) + qty,
          total_donated: (Number(existingDonor.total_donated) || 0) + total,
          phone:         form.phone,
          address:       form.address || null,
          birthday:      form.birthday || null,
          anniversary:   form.anniversary || null,
        }).eq('id', donorId)
      } else {
        const { data: newDonor, error: donorError } = await supabase
          .from('donors')
          .insert({
            name:          form.name,
            email:         form.email,
            phone:         form.phone,
            address:       form.address || null,
            birthday:      form.birthday || null,
            anniversary:   form.anniversary || null,
            total_trees:   qty,
            total_donated: total,
            city:          'Bangalore',
          })
          .select('id')
          .single()

        if (donorError || !newDonor) throw new Error(donorError?.message || 'Failed to create donor')
        donorId    = newDonor.id
        isNewDonor = true

        // Create Supabase Auth account
        tempPassword = '1234'
        await fetch('/api/create-donor', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            email:    form.email,
            password: tempPassword,
            name:     form.name,
            donorId,
          })
        })

        sessionStorage.setItem('donor_temp_password', tempPassword)
      }

      // ── Step 2: Create trees ──
      const speciesList = TIER_SPECIES[tier.id] || ['Neem']
      const treeIds: string[] = []

      for (let i = 0; i < qty; i++) {
        const treeId  = generateTreeId()
        const species = speciesList[i % speciesList.length]
        treeIds.push(treeId)

        await supabase.from('trees').insert({
          tree_id:       treeId,
          donor_id:      donorId,
          tree_type:     tier.name,
          species:       species,
          status:        'PENDING',
          planting_date: new Date().toISOString().split('T')[0],
        })
      }

      // ── Step 3: Create donation record ──
      await supabase.from('donations').insert({
        cert_id:         certId,
        donor_id:        donorId,
        tree_id:         null,
        payment_status:  'PAID',
        mode:            mode,
        tree_tier_id:    tier.id,
        tree_name:       tier.name,
        species:         speciesList[0],
        co2_per_year:    tier.co2,
        quantity:        qty,
        amount:          total,
        occasion_id:     mode === 'gift' ? occ.id    : null,
        occasion_label:  mode === 'gift' ? occ.label : null,
        recipient_name:  form.recipientName  || null,
        recipient_email: form.recipientEmail || null,
        gift_message:    form.giftMessage    || null,
        donor_name:      form.name,
        donor_email:     form.email,
        donor_phone:     form.phone,
        address:         form.address || null,
        payment_ref:     `TEST-${certId}`,
        payment_method:  'test',
      })

      // ── Step 4: Send welcome email (new donors only) ──
      if (isNewDonor) {
        await sendEmail('welcome', {
          name:     form.name,
          email:    form.email,
          tree_id:  treeIds[0],
          species:  speciesList[0],
          password: tempPassword,
        })
      }

      // ── Step 5: Save to session + redirect ──
      sessionStorage.setItem('ecotree_ty', JSON.stringify({
        certId,
        name:          form.name,
        email:         form.email,
        phone:         form.phone,
        treeName:      mode === 'gift' ? `${occ.icon} ${occ.label} Gift Tree` : tier.name,
        species:       tier.species,
        co2:           tier.co2,
        amount:        total,
        qty,
        mode,
        recipientName:  form.recipientName,
        recipientEmail: form.recipientEmail,
        occasion:       occ.label,
        occasionId:     occ.id,
        giftMessage:    form.giftMessage,
        treeIds,
        donorId,
      }))

      setLoading(false)
      window.location.href = '/thank-you'

    } catch (err: any) {
      console.error('Donation error:', err)
      alert('Something went wrong: ' + (err.message || 'Please try again.'))
      setLoading(false)
    }
  }

  return (
    <main className="dn">

      {/* ══ SINGLE COMPACT STICKY BAR ══ */}
      <div className="dn-topbar">
        <div className="dn-c">
          <div className="dn-tb-r1">
            <div className="dn-tb-headline">
              <div className="dn-tb-h">India&rsquo;s only NGO where you can <em>see your tree growing live.</em></div>
              <div className="dn-tb-sub">₹100 · AI-verified · GPS-tagged · 3yr tracking · 80G</div>
            </div>
            <div className="dn-tb-acts">
              <a href={`https://wa.me/?text=${WA_MSG}`} target="_blank" rel="noopener" className="dn-sbtn dn-sbtn--wa">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share
              </a>
              <button className="dn-sbtn dn-sbtn--cp" onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy Link'}</button>
            </div>
          </div>
          <div className="dn-tb-r2">
            <div className="dn-tb-trust">
              <span>🌱 10,000+ trees</span><span className="dn-dt">·</span>
              <span>🎯 91% survival</span><span className="dn-dt">·</span>
              <span>🤖 AI-verified</span><span className="dn-dt">·</span>
              <span>🧾 80G approved</span>
            </div>
            <div className="dn-tb-tabs">
              <button className={`dn-tab${mode==='plant'?' active':''}`} onClick={()=>setMode('plant')}>🌱 Plant a Tree</button>
              <button className={`dn-tab${mode==='gift'?' active':''}`} onClick={()=>setMode('gift')}>🎁 Gift a Tree</button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SPLIT LAYOUT ══ */}
      <div className="dn-split-bg">
        <div className="dn-c dn-split">
          <div className="dn-left">
            {mode==='plant' ? (
              <>
                <div className="dn-ptitle">Choose your tree</div>
                <div className="dn-tgrid">
                  {treeTiers.map(t=>(
                    <div key={t.id} className={`dn-tcard${tier.id===t.id?' sel':''}`} onClick={()=>pickTier(t)}>
                      <div className="dn-timg-w">
                        <img src={t.img} alt={t.name} className="dn-timg" loading="lazy"/>
                        <span className="dn-ttag" style={{background:t.tagColor}}>{t.tag}</span>
                        {tier.id===t.id && <div className="dn-tchk">✓</div>}
                      </div>
                      <div className="dn-tbody">
                        <div className="dn-ttop">
                          <span className="dn-tname">{t.icon} {t.name}</span>
                          <span className="dn-tprice">₹{t.price.toLocaleString('en-IN')}{!(t as any).fixed?'/tree':''}</span>
                        </div>
                        <div className="dn-tsp">{t.species}</div>
                        <div className="dn-tco2">🌍 {t.co2} CO₂/yr · {t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!(tier as any).fixed && (
                  <div className="dn-qty">
                    <span className="dn-ql">Number of trees</span>
                    <div className="dn-qc">
                      <button className="dn-qb" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                      <span className="dn-qn">{qty}</span>
                      <button className="dn-qb" onClick={()=>setQty(q=>Math.min(100,q+1))}>+</button>
                    </div>
                    <span className="dn-qt">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="dn-ptitle">Choose the occasion</div>
                <div className="dn-ogrid">
                  {occasions.map(o=>(
                    <div key={o.id} className={`dn-ocard${occ.id===o.id?' sel':''}`} onClick={()=>pickOcc(o)}>
                      <div className="dn-oi">{o.icon}</div>
                      <div className="dn-ol">{o.label}</div>
                      <div className="dn-op">₹{o.price}</div>
                      {occ.id===o.id && <div className="dn-och">✓</div>}
                    </div>
                  ))}
                </div>
                <div className="dn-gfields">
                  <div className="dn-ptitle" style={{marginTop:'1.5rem'}}>Recipient Details</div>
                  <div className="dn-frow">
                    <div className="dn-field">
                      <label>Recipient Name *</label>
                      <input type="text" placeholder="Who is this gift for?" value={form.recipientName} onChange={e=>sf('recipientName',e.target.value)}/>
                    </div>
                    <div className="dn-field">
                      <label>Recipient Email *</label>
                      <input type="email" placeholder="Their email for gift certificate" value={form.recipientEmail} onChange={e=>sf('recipientEmail',e.target.value)}/>
                    </div>
                  </div>
                  <div className="dn-field">
                    <label>Personal Message <span className="dn-opt">(optional)</span></label>
                    <textarea rows={2} placeholder="Add a personal message..." value={form.giftMessage} onChange={e=>sf('giftMessage',e.target.value)}/>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="dn-right" ref={formRef}>
            <div className="dn-rcard">
              <div className="dn-sum">
                <div className="dn-sum-t">Your Order</div>
                <div className="dn-sum-row">
                  <span>{mode==='gift' ? `${occ.icon} ${occ.label} Gift Tree` : `${tier.icon} ${tier.name}${!(tier as any).fixed&&qty>1?` × ${qty}`:''}`}</span>
                  <span className="dn-sum-p">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="dn-sum-meta">
                  <span>🌍 {tier.co2} CO₂/yr</span>
                  <span>📅 3yr tracking</span>
                  <span>📜 Certificate</span>
                  <span>🧾 80G</span>
                </div>
              </div>
              <div className="dn-div"/>
              <div className="dn-ptitle">Your details</div>
              <div className="dn-form">
                <div className="dn-frow">
                  <div className="dn-field">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Your full name" value={form.name} onChange={e=>sf('name',e.target.value)}/>
                  </div>
                  <div className="dn-field">
                    <label>Email Address *</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e=>sf('email',e.target.value)}/>
                  </div>
                </div>
                <div className="dn-frow">
                  <div className="dn-field">
                    <label>Phone Number *</label>
                    <input type="tel" placeholder="+91 98860 94611" value={form.phone} onChange={e=>sf('phone',e.target.value)}/>
                  </div>
                  <div className="dn-field">
                    <label>Address <span className="dn-opt">(optional)</span></label>
                    <input type="text" placeholder="Your city or address" value={form.address} onChange={e=>sf('address',e.target.value)}/>
                  </div>
                </div>
                <div className="dn-frow">
                  <div className="dn-field">
                    <label>Birthday <span className="dn-opt">(tree anniversary wishes)</span></label>
                    <input type="date" value={form.birthday} onChange={e=>sf('birthday',e.target.value)}/>
                  </div>
                  <div className="dn-field">
                    <label>Anniversary <span className="dn-opt">(optional)</span></label>
                    <input type="date" value={form.anniversary} onChange={e=>sf('anniversary',e.target.value)}/>
                  </div>
                </div>
              </div>
              <div className="dn-pannote">🧾 PAN for 80G tax benefit — collected after payment for faster checkout</div>
              <button className="dn-paybtn" onClick={handlePay} disabled={loading}>
                {loading ? <><span className="dn-spin"/> Saving your tree...</> : <>🌱 Plant My Tree · ₹{total.toLocaleString('en-IN')}</>}
              </button>
              <div className="dn-paymet"><span>UPI</span><span>·</span><span>Card</span><span>·</span><span>Net Banking</span><span>·</span><span>Wallets</span></div>
              <div className="dn-paytr"><span>🔒 Secure · Razorpay</span><span>📜 Certificate instantly</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="dn-sec dn-sec--how">
        <div className="dn-c">
          <div className="dn-lbl">What Happens After You Pay</div>
          <div className="dn-how">
            {[
              {icon:'🌱',n:'01',t:'We Plant',d:'Our field team plants your tree at a verified Bangalore site within 7 days.'},
              {icon:'📍',n:'02',t:'GPS Tagged',d:'A unique GPS coordinate and QR code is assigned to your specific tree.'},
              {icon:'🤖',n:'03',t:'AI Verified',d:'Claude AI verifies species, location, timestamp and health before it reaches you.'},
              {icon:'📊',n:'04',t:'Live Dashboard',d:'Track your tree with monthly photos and AI health scores for 3 full years.'},
            ].map((s,i)=>(
              <React.Fragment key={s.n}>
                <div className="dn-hi">
                  <div className="dn-hico">{s.icon}</div>
                  <div className="dn-hn">{s.n}</div>
                  <div className="dn-ht">{s.t}</div>
                  <div className="dn-hd">{s.d}</div>
                </div>
                {i<3 && <div className="dn-harr">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="dn-sec dn-sec--white">
        <div className="dn-c">
          <div className="dn-lbl">From Sapling to Forest</div>
          <h2 className="dn-h2">Real trees. <em>Real impact.</em></h2>
          <div className="dn-gal">
            {[
              {img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',l:'🌱 Day 1 — Sapling planted',s:'GPS-tagged, QR code attached'},
              {img:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80',l:'🌿 Month 6 — Growing strong',s:'AI health score: 94%'},
              {img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80',l:'🌳 Year 3 — Full canopy',s:'22kg CO₂ offset/year'},
            ].map(g=>(
              <div className="dn-gi" key={g.l}>
                <img src={g.img} alt={g.l} className="dn-gimg" loading="lazy"/>
                <div className="dn-gcap"><div className="dn-gl">{g.l}</div><div className="dn-gs">{g.s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="dn-tr">
        <div className="dn-c dn-tr__in">
          {[
            {i:'🧾',t:'80G Tax Benefit',s:'Section 8 NGO · All donations eligible'},
            {i:'📜',t:'Certificate Instantly',s:'PDF emailed after payment'},
            {i:'🤖',t:'AI-Verified',s:'Every photo independently checked'},
            {i:'📅',t:'3-Year Tracking',s:'Monthly updates on dashboard'},
          ].map(x=>(
            <div className="dn-ti" key={x.t}>
              <span className="dn-tii">{x.i}</span>
              <div><div className="dn-tt">{x.t}</div><div className="dn-ts">{x.s}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="dn-sec dn-sec--offwhite">
        <div className="dn-c dn-c--n">
          <div className="dn-lbl">FAQ</div>
          <h2 className="dn-h2">Quick answers</h2>
          <FAQ/>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="dn-bcta">
        <div className="dn-c dn-bcta__in">
          <span>🌱 Ready to plant? Scroll up to choose your tree.</span>
          <div className="dn-bcta__btns">
            <button className="dn-btn dn-btn--p" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Plant a Tree · From ₹100</button>
            <a href={`https://wa.me/${WHATSAPP}?text=${WA_MSG}`} target="_blank" rel="noopener" className="dn-btn dn-btn--wa">💬 WhatsApp Us</a>
          </div>
        </div>
      </div>

      <style>{`
        .dn{--gd:#1B4332;--gm:#2D6A4F;--ga:#52B788;--gl:#74C69D;--mt:#D8F3DC;--md:#B7E4C7;--ow:#F4F7F4;--td:#0D1F17;--tb:#2D3B36;--tm:#5C7268;--r:0.875rem;font-family:var(--font-body,'Segoe UI',system-ui,sans-serif);color:var(--td);}
        .dn-c{max-width:1200px;margin:0 auto;padding:0 1.5rem;}
        .dn-c--n{max-width:740px;}
        .dn-sec{padding:3rem 0;}
        .dn-sec--white{background:#fff;}
        .dn-sec--offwhite{background:var(--ow);}
        .dn-sec--how{background:#fff;border-top:1px solid var(--md);border-bottom:1px solid var(--md);}
        .dn-lbl{display:inline-block;font-size:0.72rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:var(--ga);background:rgba(82,183,136,0.12);padding:0.3rem 0.9rem;border-radius:999px;margin-bottom:1.25rem;}
        .dn-h2{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;line-height:1.18;color:var(--td);margin:0 0 1.5rem;}
        .dn-h2 em{color:var(--ga);font-style:normal;}
        .dn-opt{font-weight:400;color:var(--tm);font-size:0.78rem;}
        .dn-dt{color:rgba(151,188,98,0.5);}
        .dn-topbar{position:sticky;top:80px;z-index:50;background:var(--gd);border-bottom:1px solid rgba(151,188,98,0.25);box-shadow:0 2px 12px rgba(0,0,0,0.25);}
        .dn-topbar .dn-c{padding-top:0.6rem;padding-bottom:0;}
        .dn-tb-r1{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.08);}
        .dn-tb-headline{display:flex;flex-direction:column;gap:0.1rem;}
        .dn-tb-h{font-size:0.92rem;font-weight:700;color:#fff;line-height:1.3;}
        .dn-tb-h em{color:var(--gl);font-style:normal;}
        .dn-tb-sub{font-size:0.72rem;color:rgba(255,255,255,0.55);}
        .dn-tb-acts{display:flex;gap:0.5rem;flex-shrink:0;}
        .dn-sbtn{display:inline-flex;align-items:center;gap:0.35rem;font-size:0.75rem;font-weight:700;padding:0.38rem 0.9rem;border-radius:999px;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s;white-space:nowrap;}
        .dn-sbtn--wa{background:#25D366;color:#fff;}
        .dn-sbtn--cp{background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.2);}
        .dn-tb-r2{display:flex;align-items:center;justify-content:space-between;gap:1rem;}
        .dn-tb-trust{display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.65);}
        .dn-tb-tabs{display:flex;gap:0;}
        .dn-tab{padding:0.7rem 1.4rem;border:none;border-bottom:3px solid transparent;cursor:pointer;font-size:0.92rem;font-weight:700;color:rgba(255,255,255,0.6);background:transparent;transition:all 0.2s;font-family:inherit;white-space:nowrap;}
        .dn-tab.active{color:#fff;border-bottom-color:var(--ga);}
        .dn-split-bg{background:var(--ow);padding:2rem 0;}
        .dn-split{display:grid;grid-template-columns:1.15fr 0.85fr;gap:2rem;align-items:start;}
        @media(max-width:900px){.dn-split{grid-template-columns:1fr;}}
        .dn-ptitle{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--tm);margin-bottom:1rem;}
        .dn-tgrid{display:flex;flex-direction:column;gap:0.8rem;margin-bottom:1.1rem;}
        .dn-tcard{display:grid;grid-template-columns:115px 1fr;border:2px solid var(--md);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:all 0.2s;background:#fff;}
        .dn-tcard:hover,.dn-tcard.sel{border-color:var(--ga);box-shadow:0 4px 16px rgba(82,183,136,0.2);}
        @media(max-width:480px){.dn-tcard{grid-template-columns:85px 1fr;}}
        .dn-timg-w{position:relative;overflow:hidden;}
        .dn-timg{width:100%;height:100%;object-fit:cover;min-height:90px;display:block;transition:transform 0.3s;}
        .dn-tcard:hover .dn-timg{transform:scale(1.05);}
        .dn-ttag{position:absolute;top:0.4rem;left:0.4rem;font-size:0.6rem;font-weight:700;color:#fff;padding:0.15rem 0.45rem;border-radius:999px;}
        .dn-tchk{position:absolute;bottom:0.4rem;right:0.4rem;width:22px;height:22px;background:var(--ga);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;}
        .dn-tbody{padding:0.9rem 1rem;}
        .dn-ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.4rem;margin-bottom:0.25rem;}
        .dn-tname{font-size:0.95rem;font-weight:700;color:var(--td);}
        .dn-tprice{font-size:1rem;font-weight:900;color:var(--gd);white-space:nowrap;}
        .dn-tsp{font-size:0.78rem;color:var(--tm);margin-bottom:0.25rem;}
        .dn-tco2{font-size:0.75rem;color:var(--gm);line-height:1.4;}
        .dn-qty{display:flex;align-items:center;gap:1rem;background:#fff;border:1.5px solid var(--md);border-radius:0.75rem;padding:0.9rem 1rem;}
        .dn-ql{font-size:0.92rem;font-weight:600;color:var(--tb);flex:1;}
        .dn-qc{display:flex;align-items:center;}
        .dn-qb{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--md);background:#fff;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gd);transition:all 0.15s;font-family:inherit;}
        .dn-qn{min-width:42px;text-align:center;font-size:1.1rem;font-weight:800;color:var(--gd);}
        .dn-qt{font-size:1.05rem;font-weight:800;color:var(--gd);margin-left:auto;}
        .dn-ogrid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.65rem;}
        .dn-ocard{position:relative;border:2px solid var(--md);border-radius:0.75rem;padding:0.9rem 0.4rem;cursor:pointer;text-align:center;transition:all 0.2s;background:#fff;}
        .dn-ocard:hover,.dn-ocard.sel{border-color:var(--ga);background:var(--mt);}
        .dn-oi{font-size:1.5rem;margin-bottom:0.25rem;}
        .dn-ol{font-size:0.77rem;font-weight:700;color:var(--td);margin-bottom:0.18rem;}
        .dn-op{font-size:0.8rem;font-weight:800;color:var(--gd);}
        .dn-och{position:absolute;top:0.3rem;right:0.3rem;width:16px;height:16px;background:var(--ga);color:#fff;border-radius:50%;font-size:0.6rem;display:flex;align-items:center;justify-content:center;font-weight:700;}
        .dn-gfields{display:flex;flex-direction:column;gap:0.85rem;}
        .dn-rcard{background:#fff;border:1.5px solid var(--md);border-radius:var(--r);padding:1.6rem;position:sticky;top:155px;}
        .dn-sum-t{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--tm);margin-bottom:0.7rem;}
        .dn-sum-row{display:flex;justify-content:space-between;align-items:center;font-size:0.97rem;font-weight:700;color:var(--td);margin-bottom:0.45rem;}
        .dn-sum-p{font-size:1.15rem;font-weight:900;color:var(--gd);}
        .dn-sum-meta{display:flex;flex-wrap:wrap;gap:0.35rem;}
        .dn-sum-meta span{font-size:0.72rem;background:var(--mt);color:var(--gd);padding:0.2rem 0.55rem;border-radius:999px;font-weight:600;}
        .dn-div{height:1px;background:var(--md);margin:1.1rem 0;}
        .dn-form{display:flex;flex-direction:column;gap:0.8rem;margin-bottom:1rem;}
        .dn-frow{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;}
        @media(max-width:540px){.dn-frow{grid-template-columns:1fr;}}
        .dn-field{display:flex;flex-direction:column;gap:0.35rem;}
        .dn-field label{font-size:0.88rem;font-weight:700;color:var(--tb);}
        .dn-field input,.dn-field textarea{width:100%;padding:0.78rem 0.95rem;border:1.5px solid var(--md);border-radius:0.65rem;font-size:0.97rem;color:var(--td);background:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:inherit;box-sizing:border-box;}
        .dn-field input:focus,.dn-field textarea:focus{border-color:var(--ga);box-shadow:0 0 0 3px rgba(82,183,136,0.1);}
        .dn-field input::placeholder,.dn-field textarea::placeholder{color:#AABFB4;font-size:0.88rem;}
        .dn-field textarea{resize:vertical;min-height:75px;}
        .dn-pannote{font-size:0.78rem;color:var(--tm);background:var(--ow);padding:0.55rem 0.8rem;border-radius:0.5rem;margin-bottom:0.9rem;line-height:1.5;border-left:3px solid var(--ga);}
        .dn-paybtn{width:100%;padding:1.05rem;background:#2C5F2D;color:#fff;border:none;border-radius:0.75rem;font-size:1.02rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s;font-family:inherit;box-shadow:0 4px 20px rgba(44,95,45,0.35);margin-bottom:0.7rem;}
        .dn-paybtn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);}
        .dn-paybtn:disabled{opacity:0.7;cursor:not-allowed;transform:none;}
        .dn-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:sp 0.6s linear infinite;}
        @keyframes sp{to{transform:rotate(360deg);}}
        .dn-paymet{text-align:center;font-size:0.76rem;color:var(--tm);margin-bottom:0.4rem;display:flex;justify-content:center;gap:0.35rem;}
        .dn-paytr{display:flex;justify-content:space-between;font-size:0.76rem;color:var(--tm);}
        .dn-how{display:flex;align-items:flex-start;gap:0;margin-top:2rem;}
        @media(max-width:640px){.dn-how{flex-wrap:wrap;gap:1.25rem;} .dn-harr{display:none;}}
        .dn-hi{flex:1;min-width:120px;text-align:center;padding:1.4rem 0.7rem;background:#fff;border-radius:var(--r);border:1px solid var(--md);margin:0 0.2rem;box-shadow:0 1px 8px rgba(27,67,50,0.05);}
        .dn-hico{font-size:2.4rem;margin-bottom:0.55rem;}
        .dn-hn{font-size:0.65rem;font-weight:700;color:var(--ga);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.35rem;}
        .dn-ht{font-size:0.97rem;font-weight:800;color:var(--gd);margin-bottom:0.35rem;}
        .dn-hd{font-size:0.8rem;color:var(--tm);line-height:1.55;}
        .dn-harr{font-size:1.3rem;color:var(--ga);padding-top:3.2rem;flex-shrink:0;opacity:0.5;}
        .dn-gal{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;}
        @media(max-width:640px){.dn-gal{grid-template-columns:1fr;}}
        .dn-gi{border-radius:var(--r);overflow:hidden;border:1px solid var(--md);}
        .dn-gimg{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform 0.3s;}
        .dn-gi:hover .dn-gimg{transform:scale(1.03);}
        .dn-gcap{padding:0.85rem 1rem;background:#fff;}
        .dn-gl{font-size:0.9rem;font-weight:700;color:var(--gd);margin-bottom:0.18rem;}
        .dn-gs{font-size:0.76rem;color:var(--tm);}
        .dn-tr{background:var(--gd);padding:1.6rem 0;}
        .dn-tr__in{display:grid;grid-template-columns:repeat(4,1fr);gap:1.1rem;}
        @media(max-width:700px){.dn-tr__in{grid-template-columns:repeat(2,1fr);}}
        .dn-ti{display:flex;align-items:flex-start;gap:0.7rem;}
        .dn-tii{font-size:1.4rem;flex-shrink:0;}
        .dn-tt{font-size:0.88rem;font-weight:700;color:#fff;margin-bottom:0.12rem;}
        .dn-ts{font-size:0.72rem;color:rgba(255,255,255,0.55);line-height:1.4;}
        .dn-bcta{background:var(--mt);padding:1.1rem 0;border-top:1px solid var(--md);}
        .dn-bcta__in{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .dn-bcta__in>span{font-size:0.9rem;font-weight:600;color:var(--gd);}
        .dn-bcta__btns{display:flex;gap:0.65rem;}
        .dn-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;font-size:0.9rem;font-weight:600;padding:0.65rem 1.4rem;border-radius:999px;text-decoration:none;cursor:pointer;border:none;transition:all 0.2s;font-family:inherit;white-space:nowrap;}
        .dn-btn--p{background:#2C5F2D;color:#fff;}
        .dn-btn--wa{background:#25D366;color:#fff;}
        @media(max-width:480px){.dn-sec{padding:2rem 0;}.dn-split-bg{padding:1.25rem 0;}.dn-tb-r1{flex-wrap:wrap;gap:0.5rem;}.dn-tb-trust{display:none;}.dn-rcard{padding:1.1rem;}.dn-bcta__in{flex-direction:column;align-items:stretch;}.dn-bcta__btns{flex-direction:column;}}
      `}</style>
    </main>
  )
}

function FAQ() {
  const [o, setO] = useState<number|null>(null)
  const qs = [
    {q:'How do I know my tree was actually planted?', a:'Within 7 days, our field team plants and GPS-tags your tree. Claude AI verifies the photo — species, GPS, timestamp, health — before it appears on your dashboard. You get monthly photo updates for 3 years.'},
    {q:'When will I receive my certificate?', a:'Your PDF certificate is generated instantly after payment and emailed automatically. You can also download it from the thank-you page right away.'},
    {q:'How do I claim the 80G tax benefit?', a:'Provide your PAN on the thank-you page after payment. EcoTree Impact Foundation is a registered Section 8 company with 80G approval — your receipt is included in the certificate.'},
    {q:'Can I gift a tree to someone in another city?', a:'Yes — the tree is planted in Bangalore, but the certificate and dashboard link go to any email. The recipient tracks their tree from anywhere in India or abroad.'},
    {q:'What is the Miyawaki Mini Forest option?', a:'Miyawaki creates dense micro-forests with 30+ native species — 10x faster growth, 30x more biodiversity than regular plantation. At ₹5,000 you sponsor one forest patch tracked for 3 years.'},
  ]
  return (
    <div className="fq">
      {qs.map((f,i)=>(
        <div key={i} className="fqi">
          <button className={`fqq${o===i?' op':''}`} onClick={()=>setO(o===i?null:i)}>
            <span>{f.q}</span><span className="fqc">{o===i?'−':'+'}</span>
          </button>
          {o===i && <div className="fqa">{f.a}</div>}
        </div>
      ))}
      <style>{`
        .fq{display:flex;flex-direction:column;gap:0.65rem;margin-top:1.5rem;}
        .fqi{border:1px solid #B7E4C7;border-radius:0.6rem;overflow:hidden;}
        .fqq{width:100%;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.05rem 1.2rem;font-size:0.95rem;font-weight:600;color:#1B4332;background:#F8FAF8;border:none;cursor:pointer;text-align:left;font-family:inherit;transition:background 0.15s;}
        .fqq:hover,.fqq.op{background:#D8F3DC;}
        .fqc{font-size:1.25rem;color:#52B788;flex-shrink:0;}
        .fqa{padding:1rem 1.2rem;font-size:0.93rem;line-height:1.72;color:#2D3B36;background:#fff;border-top:1px solid #B7E4C7;}
      `}</style>
    </div>
  )
}
