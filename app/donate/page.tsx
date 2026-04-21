'use client'
import React, { useState } from 'react'

const WEB3FORMS_KEY = 'f2635df8-33a5-44ef-889c-9f823771927f'
const WHATSAPP = '919886094611'
const SITE_URL = 'https://ecotree-project-tkr2.vercel.app/donate'

const treeTiers = [
  { id:'common', icon:'🌿', name:'Common Species', species:'Neem · Peepal · Banyan', co2:'~5kg', price:100, tag:'⭐ Most Popular', tagColor:'#52B788', desc:'Hardy native trees, fast-growing, high survival rate.', img:'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80' },
  { id:'fruit', icon:'🥭', name:'Fruit Trees', species:'Mango · Jamun · Guava', co2:'~12kg', price:250, tag:'🍎 Dual Impact', tagColor:'#F59E0B', desc:'Feeds communities while absorbing carbon.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id:'native', icon:'🌳', name:'Native Large Trees', species:'Rain Tree · Gulmohar · Arjuna', co2:'~22kg', price:500, tag:'🌍 Max Impact', tagColor:'#1B4332', desc:'Highest carbon sequestration, best for biodiversity.', img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { id:'miyawaki', icon:'🏙️', name:'Miyawaki Mini Forest', species:'30+ native species · dense urban forest', co2:'~200kg', price:5000, tag:'🔥 Premium', tagColor:'#7C3AED', desc:'10x faster growth, 30x more biodiversity.', img:'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=600&q=80', fixed:true },
]

const occasions = [
  { id:'birthday', icon:'🎂', label:'Birthday', price:100 },
  { id:'anniversary', icon:'💍', label:'Anniversary', price:250 },
  { id:'memory', icon:'🕯', label:'In Memory', price:100 },
  { id:'festival', icon:'🎊', label:'Festival', price:100 },
  { id:'baby', icon:'👶', label:'New Baby', price:250 },
  { id:'corporate', icon:'🏢', label:'Corporate', price:500 },
  { id:'custom', icon:'🎁', label:'Custom', price:100 },
]

function makeCertId() {
  return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900000+100000))}`
}

export default function DonatePage() {
  const [mode, setMode] = useState<'plant'|'gift'>('plant')
  const [tier, setTier] = useState(treeTiers[0])
  const [qty, setQty] = useState(1)
  const [occ, setOcc] = useState(occasions[0])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [certId] = useState(makeCertId)
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', birthday:'', anniversary:'', recipientName:'', recipientEmail:'', giftMessage:'' })
  const sf = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const total = mode==='plant' ? (tier.fixed ? tier.price : tier.price*qty) : occ.price

  const copyLink = () => { navigator.clipboard.writeText(SITE_URL); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const handlePay = async () => {
    if (!form.name||!form.email||!form.phone) { alert('Please fill Name, Email and Phone.'); return }
    setLoading(true)
    try {
      // RAZORPAY: replace this block with actual Razorpay integration
      // const rz = new window.Razorpay({ key:'rzp_live_XXXXX', amount:total*100, currency:'INR', ... })
      // rz.open()

      await fetch('https://api.web3forms.com/submit', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ access_key:WEB3FORMS_KEY, subject:`🌱 Donation: ${form.name} — ₹${total}`, email:'bhimsen.g@gmail.com', from_name:'EcoTree', cert_id:certId, donor:form.name, donor_email:form.email, tree:tier.name, qty, amount:`₹${total}`, mode, recipient:form.recipientName||'N/A' })
      })

      await new Promise(r=>setTimeout(r,1200))
      sessionStorage.setItem('ecotree_ty', JSON.stringify({ certId, name:form.name, email:form.email, phone:form.phone, treeName: mode==='gift'?`${occ.icon} ${occ.label} Gift Tree`:tier.name, species:tier.species, co2:tier.co2, amount:total, qty, mode, recipientName:form.recipientName, recipientEmail:form.recipientEmail, occasion:occ.label, occasionId:occ.id, giftMessage:form.giftMessage }))
      window.location.href = '/thank-you'
    } catch { setLoading(false) }
  }

  return (
    <main className="dn">

      {/* STICKY BAR */}
      <div className="dn-sbar">
        <div className="dn-c dn-sbar__in">
          <div className="dn-sbar__trust">
            <span>🌱 10,000+ trees planted</span><span className="dn-dt">·</span>
            <span>🎯 91% survival</span><span className="dn-dt">·</span>
            <span>🤖 AI-verified</span><span className="dn-dt">·</span>
            <span>🧾 80G benefit</span>
          </div>
          <div className="dn-sbar__acts">
            <a href={`https://wa.me/?text=Plant%20a%20tree%20%F0%9F%8C%B1%20from%20%E2%82%B9100%20%E2%80%94%20EcoTree%20India%27s%20AI-verified%20NGO.%20${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noopener" className="dn-sbtn dn-sbtn--wa">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share
            </a>
            <button className="dn-sbtn dn-sbtn--cp" onClick={copyLink}>{copied?'✓ Copied!':'🔗 Copy Link'}</button>
          </div>
        </div>
      </div>

      {/* HOOK */}
      <div className="dn-hook">
        <div className="dn-c dn-hook__in">
          <div>
            <h1 className="dn-hook__h1">India&rsquo;s only NGO where you can<br/><em>see your tree growing live.</em></h1>
            <p className="dn-hook__sub">Plant from ₹100 · AI-verified · GPS-tagged · Tracked 3 years · 80G tax benefit</p>
          </div>
          <div className="dn-tabs">
            <button className={`dn-tab${mode==='plant'?' active':''}`} onClick={()=>setMode('plant')}>🌱 Plant a Tree</button>
            <button className={`dn-tab${mode==='gift'?' active':''}`} onClick={()=>setMode('gift')}>🎁 Gift a Tree</button>
          </div>
        </div>
      </div>

      {/* SPLIT */}
      <div className="dn-split-bg">
        <div className="dn-c dn-split">

          {/* LEFT */}
          <div className="dn-left">
            {mode==='plant' ? (
              <>
                <div className="dn-ptitle">Choose your tree</div>
                <div className="dn-tgrid">
                  {treeTiers.map(t=>(
                    <div key={t.id} className={`dn-tcard${tier.id===t.id?' sel':''}`} onClick={()=>{setTier(t);setQty(1)}}>
                      <div className="dn-timg-w">
                        <img src={t.img} alt={t.name} className="dn-timg" loading="lazy"/>
                        <span className="dn-ttag" style={{background:t.tagColor}}>{t.tag}</span>
                        {tier.id===t.id&&<div className="dn-tchk">✓</div>}
                      </div>
                      <div className="dn-tbody">
                        <div className="dn-ttop">
                          <span className="dn-tname">{t.icon} {t.name}</span>
                          <span className="dn-tprice">₹{t.price.toLocaleString('en-IN')}{!t.fixed?'/tree':''}</span>
                        </div>
                        <div className="dn-tsp">{t.species}</div>
                        <div className="dn-tco2">🌍 {t.co2} CO₂/yr · {t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!tier.fixed&&(
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
            ):(
              <>
                <div className="dn-ptitle">Choose the occasion</div>
                <div className="dn-ogrid">
                  {occasions.map(o=>(
                    <div key={o.id} className={`dn-ocard${occ.id===o.id?' sel':''}`} onClick={()=>setOcc(o)}>
                      <div className="dn-oi">{o.icon}</div>
                      <div className="dn-ol">{o.label}</div>
                      <div className="dn-op">₹{o.price}</div>
                      {occ.id===o.id&&<div className="dn-och">✓</div>}
                    </div>
                  ))}
                </div>
                <div className="dn-gfields">
                  <div className="dn-ptitle" style={{marginTop:'1.25rem'}}>Recipient Details</div>
                  <div className="dn-frow">
                    <div className="dn-field"><label>Recipient Name *</label><input type="text" placeholder="Who is this gift for?" value={form.recipientName} onChange={e=>sf('recipientName',e.target.value)}/></div>
                    <div className="dn-field"><label>Recipient Email *</label><input type="email" placeholder="Their email" value={form.recipientEmail} onChange={e=>sf('recipientEmail',e.target.value)}/></div>
                  </div>
                  <div className="dn-field"><label>Personal Message <span className="dn-opt">(optional)</span></label><textarea rows={2} placeholder="Add a personal message..." value={form.giftMessage} onChange={e=>sf('giftMessage',e.target.value)}/></div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="dn-right">
            <div className="dn-rcard">
              <div className="dn-sum">
                <div className="dn-sum-t">Your Order</div>
                <div className="dn-sum-row">
                  <span>{mode==='gift'?`${occ.icon} ${occ.label} Gift Tree`:`${tier.icon} ${tier.name}${!tier.fixed&&qty>1?` × ${qty}`:''}`}</span>
                  <span className="dn-sum-p">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="dn-sum-meta">
                  <span>🌍 {tier.co2} CO₂/yr</span><span>📅 3yr</span><span>📜 Cert</span><span>🧾 80G</span>
                </div>
              </div>
              <div className="dn-div"/>
              <div className="dn-ptitle">Your details</div>
              <div className="dn-form">
                <div className="dn-frow">
                  <div className="dn-field"><label>Full Name *</label><input type="text" placeholder="Your name" value={form.name} onChange={e=>sf('name',e.target.value)}/></div>
                  <div className="dn-field"><label>Email *</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e=>sf('email',e.target.value)}/></div>
                </div>
                <div className="dn-frow">
                  <div className="dn-field"><label>Phone *</label><input type="tel" placeholder="+91 98860 94611" value={form.phone} onChange={e=>sf('phone',e.target.value)}/></div>
                  <div className="dn-field"><label>Address <span className="dn-opt">(optional)</span></label><input type="text" placeholder="City / address" value={form.address} onChange={e=>sf('address',e.target.value)}/></div>
                </div>
                <div className="dn-frow">
                  <div className="dn-field"><label>Birthday <span className="dn-opt">(tree anniversary)</span></label><input type="date" value={form.birthday} onChange={e=>sf('birthday',e.target.value)}/></div>
                  <div className="dn-field"><label>Anniversary <span className="dn-opt">(optional)</span></label><input type="date" value={form.anniversary} onChange={e=>sf('anniversary',e.target.value)}/></div>
                </div>
              </div>
              <div className="dn-pannote">🧾 PAN for 80G — collected after payment for faster checkout</div>
              <button className="dn-paybtn" onClick={handlePay} disabled={loading}>
                {loading?<><span className="dn-spin"/>Processing...</>:<>🔒 Pay ₹{total.toLocaleString('en-IN')} &amp; Plant Your Tree</>}
              </button>
              <div className="dn-paymet"><span>UPI</span><span>·</span><span>Card</span><span>·</span><span>Net Banking</span><span>·</span><span>Wallets</span></div>
              <div className="dn-paytr"><span>🔒 Secure · Razorpay</span><span>📜 Certificate instantly</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="dn-sec dn-sec--mint">
        <div className="dn-c">
          <div className="dn-lbl">What Happens Next</div>
          <div className="dn-how">
            {[
              {icon:'🌱',n:'01',t:'We Plant',d:'Field team plants within 7 days at a verified Bangalore site.'},
              {icon:'📍',n:'02',t:'GPS Tagged',d:'Unique coordinates and QR code assigned to your tree.'},
              {icon:'🤖',n:'03',t:'AI Verified',d:'Claude AI checks species, location and health before it reaches you.'},
              {icon:'📊',n:'04',t:'Live Dashboard',d:'Track your tree with monthly photos and AI health scores.'},
            ].map((s,i)=>(
              <React.Fragment key={s.n}>
                <div className="dn-hi">
                  <div className="dn-hico">{s.icon}</div>
                  <div className="dn-hn">{s.n}</div>
                  <div className="dn-ht">{s.t}</div>
                  <div className="dn-hd">{s.d}</div>
                </div>
                {i<3&&<div className="dn-harr">→</div>}
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

      {/* TRUST */}
      <div className="dn-tr">
        <div className="dn-c dn-tr__in">
          {[{i:'🧾',t:'80G Tax Benefit',s:'Section 8 NGO · All donations eligible'},{i:'📜',t:'Certificate Instantly',s:'PDF emailed after payment'},{i:'🤖',t:'AI-Verified',s:'Every photo independently checked'},{i:'📅',t:'3-Year Tracking',s:'Monthly updates on dashboard'}].map(x=>(
            <div className="dn-ti" key={x.t}><span className="dn-tii">{x.i}</span><div><div className="dn-tt">{x.t}</div><div className="dn-ts">{x.s}</div></div></div>
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
            <a href={`https://wa.me/${WHATSAPP}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20plant%20trees!`} target="_blank" rel="noopener" className="dn-btn dn-btn--wa">💬 WhatsApp Us</a>
          </div>
        </div>
      </div>

      <style>{`
        .dn{--gd:#1B4332;--gm:#2D6A4F;--ga:#52B788;--gl:#74C69D;--gg:#D4A853;--mt:#D8F3DC;--md:#B7E4C7;--ow:#F4F7F4;--td:#0D1F17;--tb:#2D3B36;--tm:#5C7268;--r:0.875rem;font-family:var(--font-body,'Segoe UI',system-ui,sans-serif);color:var(--td);}
        .dn-c{max-width:1200px;margin:0 auto;padding:0 1.5rem;}
        .dn-c--n{max-width:740px;}
        .dn-sec{padding:3rem 0;}
        .dn-sec--white{background:#fff;}
        .dn-sec--offwhite{background:var(--ow);}
        .dn-sec--mint{background:var(--mt);}
        .dn-lbl{display:inline-block;font-size:0.68rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:var(--ga);background:rgba(82,183,136,0.12);padding:0.28rem 0.8rem;border-radius:999px;margin-bottom:0.75rem;}
        .dn-h2{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;line-height:1.18;color:var(--td);margin:0 0 1.5rem;}
        .dn-h2 em{color:var(--ga);font-style:normal;}
        .dn-opt{font-weight:400;color:var(--tm);font-size:0.72rem;}

        /* STICKY BAR */
        .dn-sbar{position:sticky;top:80px;z-index:50;background:var(--gd);padding:0.5rem 0;border-bottom:1px solid rgba(151,188,98,0.2);}
        .dn-sbar__in{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .dn-sbar__trust{display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.75);}
        .dn-dt{color:rgba(151,188,98,0.5);}
        .dn-sbar__acts{display:flex;gap:0.5rem;}
        .dn-sbtn{display:inline-flex;align-items:center;gap:0.35rem;font-size:0.75rem;font-weight:700;padding:0.35rem 0.85rem;border-radius:999px;cursor:pointer;border:none;font-family:inherit;transition:all 0.2s;}
        .dn-sbtn--wa{background:#25D366;color:#fff;}
        .dn-sbtn--wa:hover{background:#20c05a;}
        .dn-sbtn--cp{background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.2);}
        .dn-sbtn--cp:hover{background:rgba(255,255,255,0.2);}

        /* HOOK */
        .dn-hook{background:#fff;padding:1.5rem 0 0;border-bottom:2px solid var(--md);}
        .dn-hook__in{display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;padding-bottom:1rem;}
        .dn-hook__h1{font-size:clamp(1.2rem,2.5vw,1.8rem);font-weight:900;color:var(--td);line-height:1.2;margin:0 0 0.35rem;}
        .dn-hook__h1 em{color:var(--ga);font-style:normal;}
        .dn-hook__sub{font-size:0.8rem;color:var(--tm);}
        .dn-tabs{display:flex;background:var(--ow);border-radius:999px;padding:0.25rem;border:1.5px solid var(--md);flex-shrink:0;}
        .dn-tab{padding:0.55rem 1.3rem;border-radius:999px;border:none;cursor:pointer;font-size:0.9rem;font-weight:700;color:var(--tm);background:transparent;transition:all 0.2s;font-family:inherit;white-space:nowrap;}
        .dn-tab.active{background:var(--gd);color:#fff;box-shadow:0 2px 8px rgba(27,67,50,0.3);}

        /* SPLIT */
        .dn-split-bg{background:var(--ow);padding:2rem 0;}
        .dn-split{display:grid;grid-template-columns:1.15fr 0.85fr;gap:2rem;align-items:start;}
        @media(max-width:900px){.dn-split{grid-template-columns:1fr;}}
        .dn-ptitle{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--tm);margin-bottom:0.85rem;}

        /* TREE CARDS */
        .dn-tgrid{display:flex;flex-direction:column;gap:0.7rem;margin-bottom:1rem;}
        .dn-tcard{display:grid;grid-template-columns:110px 1fr;border:2px solid var(--md);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:all 0.2s;background:#fff;}
        .dn-tcard:hover{border-color:var(--ga);}
        .dn-tcard.sel{border-color:var(--ga);box-shadow:0 4px 16px rgba(82,183,136,0.2);}
        @media(max-width:480px){.dn-tcard{grid-template-columns:85px 1fr;}}
        .dn-timg-w{position:relative;overflow:hidden;}
        .dn-timg{width:100%;height:100%;object-fit:cover;min-height:85px;display:block;transition:transform 0.3s;}
        .dn-tcard:hover .dn-timg{transform:scale(1.05);}
        .dn-ttag{position:absolute;top:0.35rem;left:0.35rem;font-size:0.58rem;font-weight:700;color:#fff;padding:0.15rem 0.4rem;border-radius:999px;}
        .dn-tchk{position:absolute;bottom:0.35rem;right:0.35rem;width:20px;height:20px;background:var(--ga);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;}
        .dn-tbody{padding:0.8rem;}
        .dn-ttop{display:flex;justify-content:space-between;align-items:flex-start;gap:0.4rem;margin-bottom:0.2rem;}
        .dn-tname{font-size:0.88rem;font-weight:700;color:var(--td);}
        .dn-tprice{font-size:0.92rem;font-weight:900;color:var(--gd);white-space:nowrap;}
        .dn-tsp{font-size:0.72rem;color:var(--tm);margin-bottom:0.2rem;}
        .dn-tco2{font-size:0.7rem;color:var(--gm);line-height:1.4;}

        /* QTY */
        .dn-qty{display:flex;align-items:center;gap:0.85rem;background:#fff;border:1.5px solid var(--md);border-radius:0.75rem;padding:0.8rem 1rem;}
        .dn-ql{font-size:0.85rem;font-weight:600;color:var(--tb);flex:1;}
        .dn-qc{display:flex;align-items:center;}
        .dn-qb{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--md);background:#fff;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gd);transition:all 0.15s;font-family:inherit;}
        .dn-qb:hover{background:var(--mt);border-color:var(--ga);}
        .dn-qn{min-width:38px;text-align:center;font-size:1.1rem;font-weight:800;color:var(--gd);}
        .dn-qt{font-size:1rem;font-weight:800;color:var(--gd);margin-left:auto;}

        /* OCCASION */
        .dn-ogrid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.6rem;}
        .dn-ocard{position:relative;border:2px solid var(--md);border-radius:0.75rem;padding:0.8rem 0.4rem;cursor:pointer;text-align:center;transition:all 0.2s;background:#fff;}
        .dn-ocard:hover,.dn-ocard.sel{border-color:var(--ga);background:var(--mt);}
        .dn-oi{font-size:1.4rem;margin-bottom:0.2rem;}
        .dn-ol{font-size:0.7rem;font-weight:700;color:var(--td);margin-bottom:0.15rem;}
        .dn-op{font-size:0.75rem;font-weight:800;color:var(--gd);}
        .dn-och{position:absolute;top:0.3rem;right:0.3rem;width:15px;height:15px;background:var(--ga);color:#fff;border-radius:50%;font-size:0.58rem;display:flex;align-items:center;justify-content:center;font-weight:700;}
        .dn-gfields{display:flex;flex-direction:column;gap:0.75rem;}

        /* RIGHT CARD */
        .dn-rcard{background:#fff;border:1.5px solid var(--md);border-radius:var(--r);padding:1.4rem;position:sticky;top:160px;}
        .dn-sum-t{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--tm);margin-bottom:0.65rem;}
        .dn-sum-row{display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;font-weight:700;color:var(--td);margin-bottom:0.45rem;}
        .dn-sum-p{font-size:1.1rem;font-weight:900;color:var(--gd);}
        .dn-sum-meta{display:flex;flex-wrap:wrap;gap:0.35rem;}
        .dn-sum-meta span{font-size:0.68rem;background:var(--mt);color:var(--gd);padding:0.18rem 0.5rem;border-radius:999px;font-weight:600;}
        .dn-div{height:1px;background:var(--md);margin:1rem 0;}

        /* FORM */
        .dn-form{display:flex;flex-direction:column;gap:0.65rem;margin-bottom:0.85rem;}
        .dn-frow{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;}
        @media(max-width:480px){.dn-frow{grid-template-columns:1fr;}}
        .dn-field{display:flex;flex-direction:column;gap:0.3rem;}
        .dn-field label{font-size:0.76rem;font-weight:600;color:var(--tb);}
        .dn-field input,.dn-field textarea{width:100%;padding:0.55rem 0.75rem;border:1.5px solid var(--md);border-radius:0.6rem;font-size:0.85rem;color:var(--td);background:#fff;outline:none;transition:border-color 0.2s;font-family:inherit;box-sizing:border-box;}
        .dn-field input:focus,.dn-field textarea:focus{border-color:var(--ga);}
        .dn-field textarea{resize:vertical;min-height:65px;}
        .dn-pannote{font-size:0.72rem;color:var(--tm);background:var(--ow);padding:0.45rem 0.7rem;border-radius:0.5rem;margin-bottom:0.85rem;line-height:1.5;}

        /* PAY BTN */
        .dn-paybtn{width:100%;padding:0.95rem;background:var(--clr-primary,var(--ga));color:#fff;border:none;border-radius:0.75rem;font-size:0.97rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s;font-family:inherit;box-shadow:0 4px 20px rgba(44,95,45,0.35);margin-bottom:0.65rem;}
        .dn-paybtn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);}
        .dn-paybtn:disabled{opacity:0.65;cursor:not-allowed;transform:none;}
        .dn-spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:sp 0.6s linear infinite;}
        @keyframes sp{to{transform:rotate(360deg);}}
        .dn-paymet{text-align:center;font-size:0.7rem;color:var(--tm);margin-bottom:0.4rem;display:flex;justify-content:center;gap:0.35rem;}
        .dn-paytr{display:flex;justify-content:space-between;font-size:0.7rem;color:var(--tm);}

        /* HOW */
        .dn-how{display:flex;align-items:flex-start;gap:0;margin-top:1.25rem;}
        @media(max-width:640px){.dn-how{flex-wrap:wrap;gap:1rem;} .dn-harr{display:none;}}
        .dn-hi{flex:1;min-width:120px;text-align:center;padding:0 0.4rem;}
        .dn-hico{font-size:1.65rem;margin-bottom:0.3rem;}
        .dn-hn{font-size:0.62rem;font-weight:700;color:var(--ga);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.2rem;}
        .dn-ht{font-size:0.85rem;font-weight:700;color:var(--gd);margin-bottom:0.2rem;}
        .dn-hd{font-size:0.73rem;color:var(--tm);line-height:1.5;}
        .dn-harr{font-size:1.2rem;color:var(--ga);padding-top:1.6rem;flex-shrink:0;}

        /* GALLERY */
        .dn-gal{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem;}
        @media(max-width:640px){.dn-gal{grid-template-columns:1fr;}}
        .dn-gi{border-radius:var(--r);overflow:hidden;border:1px solid var(--md);}
        .dn-gimg{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform 0.3s;}
        .dn-gi:hover .dn-gimg{transform:scale(1.03);}
        .dn-gcap{padding:0.8rem 0.9rem;background:#fff;}
        .dn-gl{font-size:0.85rem;font-weight:700;color:var(--gd);margin-bottom:0.18rem;}
        .dn-gs{font-size:0.72rem;color:var(--tm);}

        /* TRUST */
        .dn-tr{background:var(--gd);padding:1.6rem 0;}
        .dn-tr__in{display:grid;grid-template-columns:repeat(4,1fr);gap:1.1rem;}
        @media(max-width:700px){.dn-tr__in{grid-template-columns:repeat(2,1fr);}}
        .dn-ti{display:flex;align-items:flex-start;gap:0.65rem;}
        .dn-tii{font-size:1.3rem;flex-shrink:0;}
        .dn-tt{font-size:0.82rem;font-weight:700;color:#fff;margin-bottom:0.12rem;}
        .dn-ts{font-size:0.7rem;color:rgba(255,255,255,0.55);line-height:1.4;}

        /* BOTTOM CTA */
        .dn-bcta{background:var(--mt);padding:1.1rem 0;border-top:1px solid var(--md);}
        .dn-bcta__in{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
        .dn-bcta__in>span{font-size:0.85rem;font-weight:600;color:var(--gd);}
        .dn-bcta__btns{display:flex;gap:0.65rem;}
        .dn-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;font-size:0.88rem;font-weight:600;padding:0.6rem 1.3rem;border-radius:999px;text-decoration:none;cursor:pointer;border:none;transition:all 0.2s;font-family:inherit;white-space:nowrap;}
        .dn-btn--p{background:var(--clr-primary,var(--ga));color:#fff;}
        .dn-btn--p:hover{filter:brightness(1.08);}
        .dn-btn--wa{background:#25D366;color:#fff;}
        .dn-btn--wa:hover{background:#20c05a;}

        @media(max-width:480px){
          .dn-sec{padding:2rem 0;}
          .dn-split-bg{padding:1.25rem 0;}
          .dn-hook__in{flex-direction:column;align-items:flex-start;gap:0.85rem;}
          .dn-tabs{width:100%;}
          .dn-tab{flex:1;text-align:center;padding:0.55rem 0.5rem;font-size:0.82rem;}
          .dn-sbar__trust{display:none;}
          .dn-bcta__in{flex-direction:column;align-items:stretch;}
          .dn-bcta__btns{flex-direction:column;}
        }
      `}</style>
    </main>
  )
}

function FAQ() {
  const [o,setO] = useState<number|null>(null)
  const qs = [
    {q:'How do I know my tree was actually planted?',a:'Within 7 days, our field team plants and GPS-tags your tree. Claude AI verifies the photo before it appears on your dashboard. You get monthly photo updates for 3 years.'},
    {q:'When will I receive my certificate?',a:'Your PDF certificate is generated instantly after payment and emailed automatically. You can also download it from the thank-you page.'},
    {q:'How do I claim the 80G tax benefit?',a:'Provide your PAN on the thank-you page after payment. EcoTree Impact Foundation is a registered Section 8 company with 80G approval.'},
    {q:'Can I gift a tree to someone in another city?',a:'Yes — the tree is planted in Bangalore, but the certificate and dashboard link are sent to any email. The recipient tracks their tree from anywhere.'},
    {q:'What is the Miyawaki Mini Forest option?',a:'Miyawaki creates dense micro-forests with 30+ native species — 10x faster growth, 30x more biodiversity. At ₹5,000, you sponsor one forest patch tracked for 3 years.'},
  ]
  return (
    <div className="fq">
      {qs.map((f,i)=>(
        <div key={i} className="fqi">
          <button className={`fqq${o===i?' op':''}`} onClick={()=>setO(o===i?null:i)}><span>{f.q}</span><span className="fqc">{o===i?'−':'+'}</span></button>
          {o===i&&<div className="fqa">{f.a}</div>}
        </div>
      ))}
      <style>{`.fq{display:flex;flex-direction:column;gap:0.55rem;margin-top:1.5rem;}.fqi{border:1px solid #B7E4C7;border-radius:0.5rem;overflow:hidden;}.fqq{width:100%;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:0.95rem 1rem;font-size:0.9rem;font-weight:600;color:#1B4332;background:#F8FAF8;border:none;cursor:pointer;text-align:left;font-family:inherit;transition:background 0.15s;}.fqq:hover,.fqq.op{background:#D8F3DC;}.fqc{font-size:1.1rem;color:#52B788;flex-shrink:0;}.fqa{padding:0.85rem 1rem;font-size:0.87rem;line-height:1.7;color:#2D3B36;background:#fff;border-top:1px solid #B7E4C7;}`}</style>
    </div>
  )
}
