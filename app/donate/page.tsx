'use client'
import React, { useState, useRef } from 'react'

const WEB3FORMS_KEY = 'f2635df8-33a5-44ef-889c-9f823771927f'
const WHATSAPP = '919886094611'

// ── QUOTES ──
const donationQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Someone is sitting in the shade today because someone planted a tree long ago.", author: "Warren Buffett" },
  { text: "The true meaning of life is to plant trees, under whose shade you do not expect to sit.", author: "Nelson Henderson" },
  { text: "A society grows great when old men plant trees whose shade they know they shall never sit in.", author: "Greek Proverb" },
  { text: "He who plants a tree plants a hope.", author: "Lucy Larcom" },
]

const giftQuotes: Record<string, string> = {
  birthday: "A tree planted in your name grows as you grow — rooted, reaching, alive.",
  anniversary: "Like your love — deeply rooted, enduring, and growing stronger every year.",
  memory: "Their memory lives on in every leaf, every branch, every breath of air this tree gives.",
  baby: "A tree planted the day you arrived — it will grow alongside you for a lifetime.",
  festival: "Celebrate the season with a gift that gives back to the earth every year.",
  corporate: "Great organisations, like great trees, grow by giving back to the world around them.",
  custom: "Every tree tells a story. This one is yours.",
}

// ── TREE TIERS ──
const treeTiers = [
  {
    id: 'common',
    icon: '🌿',
    name: 'Common Species',
    species: 'Neem · Peepal · Banyan',
    co2: '~5kg CO₂/year',
    price: 100,
    tag: '⭐ Most Popular',
    tagColor: '#52B788',
    desc: 'Hardy native trees perfect for urban greening. Fast-growing, low maintenance, high survival rate.',
    img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80',
  },
  {
    id: 'fruit',
    icon: '🥭',
    name: 'Fruit Trees',
    species: 'Mango · Jamun · Guava',
    co2: '~12kg CO₂/year',
    price: 250,
    tag: '🍎 Dual Impact',
    tagColor: '#F59E0B',
    desc: 'Fruit-bearing trees that feed communities while absorbing carbon. Popular in rural and peri-urban sites.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 'native',
    icon: '🌳',
    name: 'Native Large Trees',
    species: 'Rain Tree · Gulmohar · Arjuna',
    co2: '~22kg CO₂/year',
    price: 500,
    tag: '🌍 Max Impact',
    tagColor: '#1B4332',
    desc: 'Large canopy trees with the highest carbon sequestration. Best for biodiversity and long-term forest cover.',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
  },
  {
    id: 'miyawaki',
    icon: '🏙️',
    name: 'Miyawaki Mini Forest',
    species: '30+ native species · dense urban forest',
    co2: '~200kg CO₂/year',
    price: 5000,
    tag: '🔥 Premium',
    tagColor: '#7C3AED',
    desc: 'A dense micro-forest patch using the Miyawaki method — 10x faster growth, 30x more biodiversity than regular plantation.',
    img: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&q=80',
    fixed: true,
  },
]

// ── OCCASIONS ──
const occasions = [
  { id: 'birthday', icon: '🎂', label: 'Birthday', price: 100, msg: '"A tree planted in your name on your special day — growing, breathing, thriving."' },
  { id: 'anniversary', icon: '💍', label: 'Anniversary', price: 250, msg: '"A tree that grows as strong as your love — rooted, lasting, alive."' },
  { id: 'memory', icon: '🕯', label: 'In Memory', price: 100, msg: '"A living tribute — their memory grows in the shade of this tree."' },
  { id: 'festival', icon: '🎊', label: 'Festival', price: 100, msg: '"Celebrate the season with a tree that gives back to the earth every year."' },
  { id: 'baby', icon: '👶', label: 'New Baby', price: 250, msg: '"A tree planted on the day you arrived — growing alongside you for years to come."' },
  { id: 'corporate', icon: '🏢', label: 'Corporate', price: 500, msg: '"Marking your milestone with a forest — verified, tracked and ESG-ready."' },
  { id: 'custom', icon: '🎁', label: 'Custom', price: 100, msg: '"Your words, your tree, your story — personalised and tracked forever."' },
]

// ── CERTIFICATE GENERATOR ──
function generateCertId() {
  return `ET-BLR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000 + 100000))}`
}

function getCertQuote(isGift: boolean, occasion?: string) {
  if (isGift && occasion) return giftQuotes[occasion] || giftQuotes.custom
  const q = donationQuotes[Math.floor(Math.random() * donationQuotes.length)]
  return `"${q.text}" — ${q.author}`
}

async function downloadCertificate(data: CertData) {
  // Dynamic import jsPDF - graceful fallback
  try {
    const { jsPDF } = await import('jspdf' as any)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()

    // Background
    doc.setFillColor(248, 250, 248)
    doc.rect(0, 0, W, H, 'F')

    // Border — double line
    doc.setDrawColor(27, 67, 50)
    doc.setLineWidth(1.5)
    doc.rect(6, 6, W - 12, H - 12)
    doc.setLineWidth(0.4)
    doc.rect(8, 8, W - 16, H - 16)

    // Header bar
    doc.setFillColor(27, 67, 50)
    doc.rect(6, 6, W - 12, 22, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('EcoTree — Every Impact, Verified.', W / 2, 15, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(data.isGift ? 'GIFT CERTIFICATE' : 'CERTIFICATE OF IMPACT', W / 2, 22, { align: 'center' })

    // Main content
    doc.setTextColor(13, 31, 23)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('This certifies that', W / 2, 38, { align: 'center' })

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(27, 67, 50)
    doc.text(data.isGift ? data.recipientName || 'Recipient' : data.name, W / 2, 48, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(13, 31, 23)
    if (data.isGift) {
      doc.text(`has received a gift of ${data.qty} ${data.treeName} tree${data.qty > 1 ? 's' : ''}`, W / 2, 56, { align: 'center' })
      doc.text(`gifted by ${data.name} on ${data.occasion || 'a special occasion'}`, W / 2, 62, { align: 'center' })
    } else {
      doc.text(`has planted ${data.qty} ${data.treeName} tree${data.qty > 1 ? 's' : ''} in Bangalore, India`, W / 2, 56, { align: 'center' })
    }

    // Details box
    doc.setFillColor(216, 243, 220)
    doc.roundedRect(20, 67, W - 40, 22, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const details = [
      `Tree ID: ${data.certId}`,
      `Species: ${data.species}`,
      `CO₂ Offset: ${data.co2}/year`,
      `Tracking: 3 Years · AI-Verified`,
    ]
    details.forEach((d, i) => {
      doc.text(d, 28 + (i % 2) * (W / 2 - 20), 74 + Math.floor(i / 2) * 7)
    })

    // Date
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, W / 2, 93, { align: 'center' })

    // Quote
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(82, 183, 136)
    const quote = data.quote
    const lines = doc.splitTextToSize(quote, W - 40)
    doc.text(lines, W / 2, 100, { align: 'center' })

    // 80G
    if (data.pan) {
      doc.setTextColor(13, 31, 23)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(`80G Receipt | PAN: ${data.pan} | Amount: ₹${data.amount}`, W / 2, 112, { align: 'center' })
    }

    // Footer
    doc.setFillColor(27, 67, 50)
    doc.rect(6, H - 16, W - 12, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.text('EcoTree Impact Foundation, Bangalore — Section 8 NGO · 80G Approved · NGO Darpan Certified', W / 2, H - 10, { align: 'center' })

    doc.save(`EcoTree-Certificate-${data.certId}.pdf`)
  } catch {
    // jsPDF not available — show alert
    alert(`Certificate ID: ${data.certId}\nThank you ${data.name} for planting ${data.qty} tree(s)!\nYour certificate will be emailed to ${data.email}`)
  }
}

interface CertData {
  name: string; email: string; qty: number; treeName: string
  species: string; co2: string; amount: number; certId: string
  quote: string; pan?: string; isGift: boolean
  recipientName?: string; occasion?: string
}

type Tab = 'plant' | 'gift'
type Step = 1 | 2 | 3 | 4

export default function DonatePage() {
  const [tab, setTab] = useState<Tab>('plant')
  const [step, setStep] = useState<Step>(1)
  const [selectedTier, setSelectedTier] = useState(treeTiers[0])
  const [qty, setQty] = useState(1)
  const [selectedOccasion, setSelectedOccasion] = useState(occasions[0])
  const [certId] = useState(generateCertId)
  const [loading, setLoading] = useState(false)
  const wizardRef = useRef<HTMLDivElement>(null)

  // Form data
  const [form, setForm] = useState({
    name: '', email: '', phone: '', birthday: '', anniversary: '',
    address: '', pan: '', recipientName: '', recipientEmail: '', giftMessage: '',
  })
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const total = tab === 'plant'
    ? (selectedTier.fixed ? selectedTier.price : selectedTier.price * qty)
    : selectedOccasion.price

  const scrollToWizard = () => wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const certData: CertData = {
    name: form.name, email: form.email, qty,
    treeName: selectedTier.name, species: selectedTier.species,
    co2: selectedTier.co2, amount: total, certId,
    quote: getCertQuote(tab === 'gift', selectedOccasion?.id),
    pan: form.pan, isGift: tab === 'gift',
    recipientName: form.recipientName, occasion: selectedOccasion?.label,
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      // ── RAZORPAY INTEGRATION POINT ──
      // Replace this block with:
      // const razorpay = new window.Razorpay({
      //   key: 'rzp_live_XXXXXXXXXX',
      //   amount: total * 100,
      //   currency: 'INR',
      //   name: 'EcoTree Impact Foundation',
      //   description: `${qty} ${selectedTier.name} tree(s)`,
      //   handler: async (response) => { setStep(4); sendEmails(); }
      // })
      // razorpay.open()

      // Stub — simulate payment success after 1.5s
      await new Promise(r => setTimeout(r, 1500))
      setStep(4)
      await sendEmails()
    } catch { setStep(4) }
    setLoading(false)
  }

  const sendEmails = async () => {
    const basePayload = {
      access_key: WEB3FORMS_KEY,
      from_name: 'EcoTree Impact Foundation',
    }
    // Email to admin
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basePayload,
        subject: `New Tree Donation: ${form.name} — ${qty}x ${selectedTier.name} — ₹${total}`,
        email: 'bhimsen.g@gmail.com',
        donor_name: form.name, donor_email: form.email,
        donor_phone: form.phone, tree_type: selectedTier.name,
        quantity: qty, amount: `₹${total}`, cert_id: certId,
        pan: form.pan || 'Not provided', address: form.address,
      }),
    })
    // Email to donor
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basePayload,
        subject: `Your EcoTree Certificate — ${certId}`,
        email: form.email,
        message: `Dear ${form.name},\n\nThank you for planting ${qty} ${selectedTier.name} tree(s)!\n\nYour Tree ID: ${certId}\nCO₂ Offset: ${selectedTier.co2}\nTracking: 3 years, AI-verified\n\nYour certificate is ready for download.\n\nWith gratitude,\nEcoTree Impact Foundation`,
      }),
    })
    // Gift — email to recipient
    if (tab === 'gift' && form.recipientEmail) {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basePayload,
          subject: `${form.name} gifted you a tree 🌱`,
          email: form.recipientEmail,
          message: `Dear ${form.recipientName},\n\n${form.name} has gifted you a ${selectedTier.name} tree on ${selectedOccasion.label}!\n\n"${giftQuotes[selectedOccasion.id]}"\n\nTree ID: ${certId}\nYour tree will be planted in Bangalore within 7 days and tracked for 3 years.\n\nWith love,\nEcoTree Impact Foundation`,
        }),
      })
    }
    // Auto download certificate
    setTimeout(() => downloadCertificate(certData), 500)
  }

  return (
    <main className="dn">

      {/* ── TOP TRUST BAR ── */}
      <div className="dn-trust-bar">
        <div className="dn-container dn-trust-bar__inner">
          <span>🌱 10,000+ trees planted</span>
          <span className="dn-sep">·</span>
          <span>🎯 91% survival rate</span>
          <span className="dn-sep">·</span>
          <span>🤖 AI-verified</span>
          <span className="dn-sep">·</span>
          <span>🧾 80G tax benefit</span>
          <span className="dn-sep">·</span>
          <span>📜 Certificate instantly</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="dn-tabs-bar">
        <div className="dn-container dn-tabs-bar__inner">
          <button
            className={`dn-tab-btn${tab === 'plant' ? ' active' : ''}`}
            onClick={() => { setTab('plant'); setStep(1); scrollToWizard() }}
          >
            🌱 Plant a Tree
          </button>
          <button
            className={`dn-tab-btn${tab === 'gift' ? ' active' : ''}`}
            onClick={() => { setTab('gift'); setStep(1); scrollToWizard() }}
          >
            🎁 Gift a Tree
          </button>
        </div>
      </div>

      {/* ── WIZARD ── */}
      <div className="dn-wizard-wrap" ref={wizardRef}>
        <div className="dn-container dn-wizard">

          {/* Step indicator */}
          {step < 4 && (
            <div className="dn-steps">
              {['Choose Tree', 'Your Details', 'Pay'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`dn-step-pill${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                    <span className="dn-step-num">{step > i + 1 ? '✓' : i + 1}</span>
                    <span className="dn-step-label">{s}</span>
                  </div>
                  {i < 2 && <div className={`dn-step-line${step > i + 1 ? ' done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── STEP 1 — CHOOSE TREE ── */}
          {step === 1 && tab === 'plant' && (
            <div className="dn-step-body">
              <h2 className="dn-step-h2">Choose your tree</h2>
              <p className="dn-step-sub">We plant, GPS-tag, AI-verify and track it — you watch it grow.</p>
              <div className="dn-tree-grid">
                {treeTiers.map(tier => (
                  <div
                    key={tier.id}
                    className={`dn-tree-card${selectedTier.id === tier.id ? ' selected' : ''}`}
                    onClick={() => { setSelectedTier(tier); setQty(1) }}
                  >
                    <div className="dn-tree-img-wrap">
                      <img src={tier.img} alt={tier.name} className="dn-tree-img" loading="lazy" />
                      <span className="dn-tree-tag" style={{ background: tier.tagColor }}>{tier.tag}</span>
                      {selectedTier.id === tier.id && <div className="dn-tree-selected-badge">✓ Selected</div>}
                    </div>
                    <div className="dn-tree-body">
                      <div className="dn-tree-icon">{tier.icon}</div>
                      <div className="dn-tree-name">{tier.name}</div>
                      <div className="dn-tree-species">{tier.species}</div>
                      <div className="dn-tree-co2">🌍 {tier.co2}</div>
                      <div className="dn-tree-price">₹{tier.price.toLocaleString('en-IN')}{!tier.fixed && ' / tree'}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity */}
              {!selectedTier.fixed && (
                <div className="dn-qty-row">
                  <span className="dn-qty-label">Number of trees</span>
                  <div className="dn-qty-ctrl">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="dn-qty-btn">−</button>
                    <span className="dn-qty-num">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(100, q + 1))} className="dn-qty-btn">+</button>
                  </div>
                </div>
              )}

              {/* Order preview */}
              <div className="dn-order-preview">
                <div className="dn-order-row">
                  <span>{selectedTier.icon} {selectedTier.name}{!selectedTier.fixed ? ` × ${qty}` : ''}</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="dn-order-row dn-order-row--sm">
                  <span>🌍 CO₂ offset</span>
                  <span>{selectedTier.co2}{!selectedTier.fixed && qty > 1 ? ` × ${qty}` : ''}</span>
                </div>
                <div className="dn-order-row dn-order-row--sm">
                  <span>📅 Tracking</span><span>3 years · GPS + AI</span>
                </div>
                <div className="dn-order-row dn-order-row--sm">
                  <span>📜 Certificate</span><span>Sent instantly by email</span>
                </div>
              </div>
              <button className="dn-btn dn-btn--primary dn-btn--full" onClick={() => setStep(2)}>
                Continue → Enter Details
              </button>
            </div>
          )}

          {/* ── STEP 1 GIFT — CHOOSE OCCASION ── */}
          {step === 1 && tab === 'gift' && (
            <div className="dn-step-body">
              <h2 className="dn-step-h2">Choose the occasion</h2>
              <p className="dn-step-sub">The most meaningful gift — a tree that grows for years and lives on a personal dashboard.</p>
              <div className="dn-occasion-grid">
                {occasions.map(occ => (
                  <div
                    key={occ.id}
                    className={`dn-occasion-card${selectedOccasion.id === occ.id ? ' selected' : ''}`}
                    onClick={() => setSelectedOccasion(occ)}
                  >
                    <div className="dn-occ-icon">{occ.icon}</div>
                    <div className="dn-occ-label">{occ.label}</div>
                    <div className="dn-occ-price">₹{occ.price}</div>
                    <div className="dn-occ-msg">{occ.msg}</div>
                  </div>
                ))}
              </div>
              <div className="dn-order-preview" style={{ marginTop: '1.5rem' }}>
                <div className="dn-order-row">
                  <span>{selectedOccasion.icon} {selectedOccasion.label} Tree Gift</span>
                  <span>₹{selectedOccasion.price}</span>
                </div>
                <div className="dn-order-row dn-order-row--sm">
                  <span>📜 Certificate</span><span>Sent to gifter + recipient</span>
                </div>
                <div className="dn-order-row dn-order-row--sm">
                  <span>📅 Tracking</span><span>3 years · GPS + AI</span>
                </div>
              </div>
              <button className="dn-btn dn-btn--primary dn-btn--full" onClick={() => setStep(2)}>
                Continue → Enter Details
              </button>
            </div>
          )}

          {/* ── STEP 2 — DETAILS ── */}
          {step === 2 && (
            <div className="dn-step-body">
              <h2 className="dn-step-h2">Your details</h2>
              <p className="dn-step-sub">We use this to send your certificate and activate your tree dashboard.</p>
              <div className="dn-form">
                <div className="dn-form-row">
                  <div className="dn-field">
                    <label>Full Name *</label>
                    <input type="text" required placeholder="Your full name"
                      value={form.name} onChange={e => setF('name', e.target.value)} />
                  </div>
                  <div className="dn-field">
                    <label>Email Address *</label>
                    <input type="email" required placeholder="your@email.com"
                      value={form.email} onChange={e => setF('email', e.target.value)} />
                  </div>
                </div>
                <div className="dn-form-row">
                  <div className="dn-field">
                    <label>Phone Number *</label>
                    <input type="tel" required placeholder="+91 98860 94611"
                      value={form.phone} onChange={e => setF('phone', e.target.value)} />
                  </div>
                  <div className="dn-field">
                    <label>Address</label>
                    <input type="text" placeholder="Your address (single line)"
                      value={form.address} onChange={e => setF('address', e.target.value)} />
                  </div>
                </div>
                <div className="dn-form-row">
                  <div className="dn-field">
                    <label>Birthday <span className="dn-optional">(for tree anniversary wishes)</span></label>
                    <input type="date" value={form.birthday} onChange={e => setF('birthday', e.target.value)} />
                  </div>
                  <div className="dn-field">
                    <label>Anniversary <span className="dn-optional">(optional)</span></label>
                    <input type="date" value={form.anniversary} onChange={e => setF('anniversary', e.target.value)} />
                  </div>
                </div>

                {tab === 'gift' && (
                  <>
                    <div className="dn-gift-divider">🎁 Gift Recipient Details</div>
                    <div className="dn-form-row">
                      <div className="dn-field">
                        <label>Recipient Name *</label>
                        <input type="text" placeholder="Who is this gift for?"
                          value={form.recipientName} onChange={e => setF('recipientName', e.target.value)} />
                      </div>
                      <div className="dn-field">
                        <label>Recipient Email *</label>
                        <input type="email" placeholder="Their email for the gift certificate"
                          value={form.recipientEmail} onChange={e => setF('recipientEmail', e.target.value)} />
                      </div>
                    </div>
                    <div className="dn-field">
                      <label>Personal Message <span className="dn-optional">(optional)</span></label>
                      <textarea rows={3} placeholder="Add a personal message to the gift certificate..."
                        value={form.giftMessage} onChange={e => setF('giftMessage', e.target.value)} />
                    </div>
                  </>
                )}

                <div className="dn-pan-note">
                  🎁 PAN for 80G tax benefit — we&rsquo;ll ask after payment to keep checkout fast.
                </div>

                <div className="dn-btn-row">
                  <button className="dn-btn dn-btn--outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="dn-btn dn-btn--primary"
                    disabled={!form.name || !form.email || !form.phone}
                    onClick={() => setStep(3)}
                  >
                    🔒 Proceed to Pay · ₹{total.toLocaleString('en-IN')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 — PAY ── */}
          {step === 3 && (
            <div className="dn-step-body">
              <h2 className="dn-step-h2">Review &amp; Pay</h2>
              <div className="dn-review-box">
                <div className="dn-review-title">Order Summary</div>
                <div className="dn-review-row">
                  <span>Tree Type</span>
                  <span>{tab === 'gift' ? `${selectedOccasion.icon} ${selectedOccasion.label} Gift` : `${selectedTier.icon} ${selectedTier.name}`}</span>
                </div>
                {tab === 'plant' && !selectedTier.fixed && (
                  <div className="dn-review-row"><span>Quantity</span><span>{qty} tree{qty > 1 ? 's' : ''}</span></div>
                )}
                <div className="dn-review-row"><span>CO₂ Offset</span><span>{selectedTier.co2}</span></div>
                <div className="dn-review-row"><span>Tracking</span><span>3 years · GPS + AI</span></div>
                <div className="dn-review-row"><span>Certificate</span><span>Sent instantly by email</span></div>
                <div className="dn-review-row"><span>Name</span><span>{form.name}</span></div>
                <div className="dn-review-row"><span>Email</span><span>{form.email}</span></div>
                {tab === 'gift' && <div className="dn-review-row"><span>Gift For</span><span>{form.recipientName}</span></div>}
                <div className="dn-review-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="dn-pay-box">
                <div className="dn-pay-title">🔐 Secure Payment via Razorpay</div>
                <p className="dn-pay-sub">UPI · Credit/Debit Card · Net Banking · Wallets</p>
                <button
                  className="dn-btn dn-btn--primary dn-btn--full dn-btn--pay"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="dn-spinner" />Processing...</>
                  ) : (
                    <>🔒 Pay ₹{total.toLocaleString('en-IN')} Securely</>
                  )}
                </button>
                <div className="dn-pay-trust">
                  <span>🔒 Secure</span>
                  <span>📧 Certificate instantly</span>
                  <span>🧾 80G benefit</span>
                  <span>🌱 Tree in 7 days</span>
                </div>
              </div>

              <div className="dn-btn-row" style={{ marginTop: '1rem' }}>
                <button className="dn-btn dn-btn--outline" onClick={() => setStep(2)}>← Back to details</button>
              </div>
            </div>
          )}

          {/* ── STEP 4 — CONFIRMATION ── */}
          {step === 4 && (
            <div className="dn-step-body dn-confirmation">
              <div className="dn-conf-icon">🌱</div>
              <h2 className="dn-conf-h2">Payment Confirmed!</h2>
              <p className="dn-conf-sub">
                Thank you {form.name}! Your tree has been assigned and will be planted within 7 days.
              </p>

              <div className="dn-conf-id">
                <span>Tree ID</span>
                <strong>{certId}</strong>
              </div>

              <div className="dn-conf-grid">
                <div className="dn-conf-item"><span>🌳</span><span>{tab === 'gift' ? selectedOccasion.label : selectedTier.name}</span></div>
                <div className="dn-conf-item"><span>🌍</span><span>{selectedTier.co2}</span></div>
                <div className="dn-conf-item"><span>📅</span><span>3-year tracking</span></div>
                <div className="dn-conf-item"><span>📧</span><span>Certificate emailed</span></div>
              </div>

              {/* PAN for 80G */}
              <div className="dn-pan-box">
                <div className="dn-pan-title">🧾 Claim 80G Tax Benefit</div>
                <p className="dn-pan-desc">Provide your PAN to receive an 80G tax receipt along with your certificate.</p>
                <div className="dn-form-row">
                  <div className="dn-field">
                    <label>PAN Number <span className="dn-optional">(optional)</span></label>
                    <input type="text" placeholder="ABCDE1234F" maxLength={10}
                      value={form.pan} onChange={e => setF('pan', e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>

              <div className="dn-conf-actions">
                <button
                  className="dn-btn dn-btn--primary"
                  onClick={() => downloadCertificate({ ...certData, pan: form.pan })}
                >
                  📥 Download Certificate PDF
                </button>
                <a href="/impact" className="dn-btn dn-btn--outline">
                  📊 View Live Dashboard →
                </a>
              </div>

              <div className="dn-conf-note">
                Certificate also emailed to {form.email}
                {tab === 'gift' && form.recipientEmail && ` and ${form.recipientEmail}`}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── HOW IT WORKS (horizontal) ── */}
      <section className="dn-section dn-section--mint">
        <div className="dn-container">
          <div className="dn-label">After You Donate</div>
          <h2 className="dn-h2">What happens next</h2>
          <div className="dn-how-strip">
            {[
              { icon: '🌱', step: '01', title: 'We Plant', desc: 'Field team plants your tree within 7 days at a verified site in Bangalore.' },
              { icon: '📍', step: '02', title: 'GPS Tagged', desc: 'Unique GPS coordinates and QR code assigned to your specific tree.' },
              { icon: '🤖', step: '03', title: 'AI Verified', desc: 'Claude AI checks species, location, timestamp and health before it reaches you.' },
              { icon: '📊', step: '04', title: 'Dashboard Live', desc: 'Your tree appears on your personal dashboard with monthly photo updates.' },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="dn-how-item">
                  <div className="dn-how-icon">{s.icon}</div>
                  <div className="dn-how-step">{s.step}</div>
                  <div className="dn-how-title">{s.title}</div>
                  <div className="dn-how-desc">{s.desc}</div>
                </div>
                {i < 3 && <div className="dn-how-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── OCCASION GIFTING ── */}
      <section className="dn-section dn-section--white" id="gift">
        <div className="dn-container">
          <div className="dn-label">Occasion Gifting</div>
          <h2 className="dn-h2">Plant a tree. <em>Gift a memory.</em></h2>
          <p className="dn-section-sub">
            The most meaningful gift — a tree that grows for years and lives on a personal dashboard.
          </p>
          <div className="dn-gift-grid">
            {occasions.map(occ => (
              <div className="dn-gift-card" key={occ.id}>
                <div className="dn-gift-card__icon">{occ.icon}</div>
                <div className="dn-gift-card__label">{occ.label}</div>
                <div className="dn-gift-card__msg">{occ.msg}</div>
                <div className="dn-gift-card__price">₹{occ.price}</div>
                <button
                  className="dn-btn dn-btn--primary dn-btn--sm"
                  onClick={() => {
                    setTab('gift')
                    setSelectedOccasion(occ)
                    setStep(1)
                    scrollToWizard()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  🌱 Plant This Tree
                </button>
              </div>
            ))}
          </div>
          <p className="dn-gift-note">
            Certificate sent instantly by email · 80G tax benefit · Tree tracked for 3 years
          </p>
        </div>
      </section>

      {/* ── IMPACT CALCULATOR ── */}
      <section className="dn-section dn-section--dark">
        <div className="dn-container">
          <div className="dn-label dn-label--light">Impact Calculator</div>
          <h2 className="dn-h2 dn-h2--light">See your impact before you plant</h2>
          <ImpactCalc />
        </div>
      </section>

      {/* ── REAL TREE IMAGES ── */}
      <section className="dn-section dn-section--white">
        <div className="dn-container">
          <div className="dn-label">From Sapling to Forest</div>
          <h2 className="dn-h2">Real trees. <em>Real impact.</em></h2>
          <p className="dn-section-sub">Every tree you plant goes through this journey — tracked at every stage.</p>
          <div className="dn-gallery">
            {[
              { img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80', label: '🌱 Day 1 — Sapling planted', sub: 'GPS-tagged, QR code attached' },
              { img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80', label: '🌿 Month 6 — Growing strong', sub: 'AI health score: 94%' },
              { img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', label: '🌳 Year 3 — Mature canopy', sub: '22kg CO₂ offset/year' },
            ].map(g => (
              <div className="dn-gallery-item" key={g.label}>
                <img src={g.img} alt={g.label} className="dn-gallery-img" loading="lazy" />
                <div className="dn-gallery-cap">
                  <div className="dn-gallery-label">{g.label}</div>
                  <div className="dn-gallery-sub">{g.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="dn-trust-strip">
        <div className="dn-container dn-trust-strip__inner">
          {[
            { icon: '🧾', title: '80G Tax Benefit', sub: 'Section 8 NGO · All donations eligible' },
            { icon: '📜', title: 'Certificate Instantly', sub: 'PDF emailed right after payment' },
            { icon: '🤖', title: 'AI-Verified', sub: 'Every tree photo independently checked' },
            { icon: '📅', title: '3-Year Tracking', sub: 'Monthly updates on your dashboard' },
          ].map(t => (
            <div className="dn-trust-item" key={t.title}>
              <span className="dn-trust-icon">{t.icon}</span>
              <div>
                <div className="dn-trust-title">{t.title}</div>
                <div className="dn-trust-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="dn-section dn-section--offwhite">
        <div className="dn-container dn-container--narrow">
          <div className="dn-label">FAQ</div>
          <h2 className="dn-h2">Questions about donating</h2>
          <DonationFAQ />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="dn-section dn-section--dark">
        <div className="dn-container">
          <div className="dn-cta-block">
            <div className="dn-cta-badge">🌱 Start today</div>
            <h2 className="dn-cta-h2">
              Your tree is waiting.<br /><em>Plant it today.</em>
            </h2>
            <p className="dn-cta-p">
              From ₹100. Certificate instantly. Tracked for 3 years. 80G tax benefit.
            </p>
            <div className="dn-cta-btns">
              <button className="dn-btn dn-btn--primary dn-btn--lg"
                onClick={() => { setTab('plant'); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                🌱 Plant a Tree · From ₹100
              </button>
              <button className="dn-btn dn-btn--gold dn-btn--lg"
                onClick={() => { setTab('gift'); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                🎁 Gift a Tree
              </button>
              <a href={`https://wa.me/${WHATSAPP}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20plant%20trees!`}
                target="_blank" rel="noopener" className="dn-btn dn-btn--whatsapp dn-btn--lg">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .dn {
          --g-dark:   #1B4332;
          --g-mid:    #2D6A4F;
          --g-accent: #52B788;
          --g-light:  #74C69D;
          --g-moss:   #97BC62;
          --g-gold:   #D4A853;
          --mint:     #D8F3DC;
          --mint-dk:  #B7E4C7;
          --off-white:#F4F7F4;
          --text-dark:#0D1F17;
          --text-body:#2D3B36;
          --text-muted:#5C7268;
          --radius:   0.875rem;
          font-family: var(--font-body,'Segoe UI',system-ui,sans-serif);
          color: var(--text-dark);
        }
        .dn-container { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
        .dn-container--narrow { max-width:740px; }
        .dn-section { padding:3rem 0; }
        .dn-section--white    { background:#fff; }
        .dn-section--offwhite { background:var(--off-white); }
        .dn-section--mint     { background:var(--mint); }
        .dn-section--dark     { background:var(--clr-dark-bg,var(--g-dark)); }

        /* TYPE */
        .dn-label { display:inline-block; font-size:0.68rem; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:var(--g-accent); background:rgba(82,183,136,0.12); padding:0.28rem 0.8rem; border-radius:999px; margin-bottom:0.75rem; }
        .dn-label--light { color:var(--g-light); background:rgba(116,198,157,0.15); }
        .dn-h2 { font-size:clamp(1.5rem,3vw,2.2rem); font-weight:800; line-height:1.18; color:var(--text-dark); margin:0 0 0.75rem; }
        .dn-h2--light { color:#fff; }
        .dn-h2 em { color:var(--g-accent); font-style:normal; }
        .dn-section-sub { font-size:0.93rem; color:var(--text-muted); max-width:580px; margin-bottom:2rem; line-height:1.65; }

        /* BUTTONS */
        .dn-btn { display:inline-flex; align-items:center; justify-content:center; gap:0.4rem; font-size:0.9rem; font-weight:600; padding:0.65rem 1.4rem; border-radius:999px; text-decoration:none; cursor:pointer; border:none; transition:all 0.2s ease; white-space:nowrap; font-family:inherit; }
        .dn-btn--lg { font-size:0.95rem; padding:0.8rem 1.75rem; }
        .dn-btn--sm { font-size:0.8rem; padding:0.45rem 1rem; }
        .dn-btn--full { width:100%; border-radius:0.75rem; padding:0.85rem; font-size:1rem; }
        .dn-btn--pay { font-size:1.1rem; padding:1rem; }
        .dn-btn--primary { background:var(--clr-primary,var(--g-accent)); color:#fff; box-shadow:0 2px 12px rgba(44,95,45,0.3); }
        .dn-btn--primary:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
        .dn-btn--primary:disabled { opacity:0.6; cursor:not-allowed; }
        .dn-btn--outline { border:1.5px solid var(--g-accent); color:var(--g-dark); background:transparent; }
        .dn-btn--outline:hover { background:var(--mint); }
        .dn-btn--gold { background:transparent; color:var(--g-gold); border:1.5px solid rgba(212,168,83,0.5); }
        .dn-btn--gold:hover { background:rgba(212,168,83,0.1); }
        .dn-btn--whatsapp { background:#25D366; color:#fff; border:none; }
        .dn-btn--whatsapp:hover { background:#20c05a; }

        /* TRUST BAR */
        .dn-trust-bar { background:var(--g-dark); padding:0.6rem 0; border-bottom:1px solid rgba(151,188,98,0.2); }
        .dn-trust-bar__inner { display:flex; flex-wrap:wrap; gap:0.5rem 1.5rem; justify-content:center; align-items:center; font-size:0.75rem; font-weight:600; color:rgba(255,255,255,0.75); }
        .dn-sep { color:rgba(151,188,98,0.5); }

        /* TABS */
        .dn-tabs-bar { background:#fff; border-bottom:2px solid var(--mint-dk); position:sticky; top:80px; z-index:30; }
        .dn-tabs-bar__inner { display:flex; gap:0; }
        .dn-tab-btn { flex:1; max-width:200px; padding:1rem 1.5rem; font-size:0.95rem; font-weight:700; color:var(--text-muted); background:transparent; border:none; border-bottom:3px solid transparent; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .dn-tab-btn.active { color:var(--g-dark); border-bottom-color:var(--g-accent); }
        .dn-tab-btn:hover { color:var(--g-dark); background:var(--off-white); }

        /* WIZARD */
        .dn-wizard-wrap { background:var(--off-white); padding:2rem 0 3rem; }
        .dn-wizard { max-width:800px; }
        .dn-steps { display:flex; align-items:center; gap:0; margin-bottom:2rem; }
        .dn-step-pill { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.85rem; border-radius:999px; background:#fff; border:1.5px solid var(--mint-dk); font-size:0.8rem; font-weight:600; color:var(--text-muted); white-space:nowrap; }
        .dn-step-pill.active { background:var(--g-dark); border-color:var(--g-dark); color:#fff; }
        .dn-step-pill.done { background:var(--mint); border-color:var(--g-accent); color:var(--g-dark); }
        .dn-step-num { width:20px; height:20px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:800; flex-shrink:0; }
        .dn-step-pill.active .dn-step-num { background:rgba(255,255,255,0.2); }
        .dn-step-pill.done .dn-step-num { background:var(--g-accent); color:#fff; }
        .dn-step-label { display:none; }
        @media(min-width:480px){ .dn-step-label{display:inline;} }
        .dn-step-line { flex:1; height:2px; background:var(--mint-dk); min-width:12px; }
        .dn-step-line.done { background:var(--g-accent); }

        /* STEP BODY */
        .dn-step-body { background:#fff; border-radius:var(--radius); padding:2rem; box-shadow:0 2px 24px rgba(27,67,50,0.08); border:1px solid var(--mint-dk); }
        .dn-step-h2 { font-size:1.4rem; font-weight:800; color:var(--g-dark); margin:0 0 0.3rem; }
        .dn-step-sub { font-size:0.88rem; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.55; }

        /* TREE GRID */
        .dn-tree-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
        @media(max-width:860px){ .dn-tree-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px){ .dn-tree-grid{grid-template-columns:1fr 1fr;} }
        .dn-tree-card { border:2px solid var(--mint-dk); border-radius:var(--radius); overflow:hidden; cursor:pointer; transition:all 0.2s; }
        .dn-tree-card:hover { border-color:var(--g-accent); box-shadow:0 4px 16px rgba(82,183,136,0.15); }
        .dn-tree-card.selected { border-color:var(--g-accent); box-shadow:0 4px 20px rgba(82,183,136,0.25); }
        .dn-tree-img-wrap { position:relative; aspect-ratio:4/3; overflow:hidden; }
        .dn-tree-img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
        .dn-tree-card:hover .dn-tree-img { transform:scale(1.04); }
        .dn-tree-tag { position:absolute; top:0.5rem; left:0.5rem; font-size:0.62rem; font-weight:700; color:#fff; padding:0.2rem 0.5rem; border-radius:999px; }
        .dn-tree-selected-badge { position:absolute; bottom:0.5rem; right:0.5rem; background:var(--g-accent); color:#fff; font-size:0.68rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:999px; }
        .dn-tree-body { padding:0.85rem; }
        .dn-tree-icon { font-size:1.25rem; margin-bottom:0.25rem; }
        .dn-tree-name { font-size:0.85rem; font-weight:700; color:var(--text-dark); margin-bottom:0.15rem; }
        .dn-tree-species { font-size:0.72rem; color:var(--text-muted); margin-bottom:0.25rem; }
        .dn-tree-co2 { font-size:0.72rem; color:var(--g-mid); font-weight:600; margin-bottom:0.35rem; }
        .dn-tree-price { font-size:1rem; font-weight:900; color:var(--g-dark); }

        /* QTY */
        .dn-qty-row { display:flex; align-items:center; justify-content:space-between; background:var(--off-white); border-radius:0.75rem; padding:0.85rem 1.1rem; margin-bottom:1.25rem; }
        .dn-qty-label { font-size:0.9rem; font-weight:600; color:var(--text-body); }
        .dn-qty-ctrl { display:flex; align-items:center; gap:0; }
        .dn-qty-btn { width:36px; height:36px; border-radius:50%; border:1.5px solid var(--mint-dk); background:#fff; font-size:1.2rem; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--g-dark); transition:all 0.15s; font-family:inherit; }
        .dn-qty-btn:hover { background:var(--mint); border-color:var(--g-accent); }
        .dn-qty-num { min-width:48px; text-align:center; font-size:1.2rem; font-weight:800; color:var(--g-dark); }

        /* ORDER PREVIEW */
        .dn-order-preview { background:var(--mint); border-radius:0.75rem; padding:1rem 1.25rem; margin-bottom:1.25rem; display:flex; flex-direction:column; gap:0.4rem; }
        .dn-order-row { display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; font-weight:600; color:var(--text-dark); }
        .dn-order-row--sm { font-size:0.8rem; font-weight:500; color:var(--text-muted); }

        /* OCCASION GRID */
        .dn-occasion-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; }
        @media(max-width:700px){ .dn-occasion-grid{grid-template-columns:repeat(2,1fr);} }
        .dn-occasion-card { border:2px solid var(--mint-dk); border-radius:var(--radius); padding:1rem 0.85rem; cursor:pointer; text-align:center; transition:all 0.2s; }
        .dn-occasion-card:hover, .dn-occasion-card.selected { border-color:var(--g-accent); background:var(--mint); }
        .dn-occ-icon { font-size:1.75rem; margin-bottom:0.35rem; }
        .dn-occ-label { font-size:0.85rem; font-weight:700; color:var(--text-dark); margin-bottom:0.2rem; }
        .dn-occ-price { font-size:0.9rem; font-weight:800; color:var(--g-dark); margin-bottom:0.4rem; }
        .dn-occ-msg { font-size:0.7rem; color:var(--text-muted); line-height:1.4; font-style:italic; }

        /* FORM */
        .dn-form { display:flex; flex-direction:column; gap:1rem; }
        .dn-form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:540px){ .dn-form-row{grid-template-columns:1fr;} }
        .dn-field { display:flex; flex-direction:column; gap:0.4rem; }
        .dn-field label { font-size:0.82rem; font-weight:600; color:var(--text-body); }
        .dn-field input, .dn-field textarea { width:100%; padding:0.7rem 0.9rem; border:1.5px solid var(--mint-dk); border-radius:0.65rem; font-size:0.9rem; color:var(--text-dark); background:#fff; outline:none; transition:border-color 0.2s; font-family:inherit; box-sizing:border-box; }
        .dn-field input:focus, .dn-field textarea:focus { border-color:var(--g-accent); }
        .dn-field textarea { resize:vertical; min-height:80px; }
        .dn-optional { font-weight:400; color:var(--text-muted); font-size:0.75rem; }
        .dn-gift-divider { font-size:0.8rem; font-weight:700; color:var(--g-accent); text-transform:uppercase; letter-spacing:0.1em; padding:0.5rem 0; border-top:1px solid var(--mint-dk); margin-top:0.5rem; }
        .dn-pan-note { font-size:0.78rem; color:var(--text-muted); background:var(--off-white); padding:0.6rem 0.85rem; border-radius:0.5rem; }
        .dn-btn-row { display:flex; gap:0.75rem; align-items:center; }

        /* REVIEW */
        .dn-review-box { background:var(--off-white); border-radius:var(--radius); padding:1.25rem; margin-bottom:1.25rem; border:1px solid var(--mint-dk); }
        .dn-review-title { font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin-bottom:0.85rem; }
        .dn-review-row { display:flex; justify-content:space-between; align-items:center; font-size:0.88rem; color:var(--text-body); padding:0.4rem 0; border-bottom:1px solid var(--mint-dk); }
        .dn-review-total { display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; color:var(--g-dark); padding-top:0.75rem; margin-top:0.25rem; }
        .dn-pay-box { background:var(--g-dark); border-radius:var(--radius); padding:1.5rem; text-align:center; }
        .dn-pay-title { font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:0.3rem; }
        .dn-pay-sub { font-size:0.82rem; color:rgba(255,255,255,0.6); margin-bottom:1.25rem; }
        .dn-pay-trust { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:0.85rem; font-size:0.72rem; color:rgba(255,255,255,0.55); }
        .dn-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:dn-spin 0.6s linear infinite; }
        @keyframes dn-spin { to { transform:rotate(360deg); } }

        /* CONFIRMATION */
        .dn-confirmation { text-align:center; }
        .dn-conf-icon { font-size:4rem; margin-bottom:0.75rem; animation:dn-pop 0.5s ease; }
        @keyframes dn-pop { from{transform:scale(0)} to{transform:scale(1)} }
        .dn-conf-h2 { font-size:1.75rem; font-weight:900; color:var(--g-dark); margin:0 0 0.5rem; }
        .dn-conf-sub { font-size:0.95rem; color:var(--text-body); margin-bottom:1.5rem; line-height:1.6; }
        .dn-conf-id { display:flex; align-items:center; justify-content:center; gap:0.75rem; background:var(--mint); border-radius:0.75rem; padding:0.85rem 1.25rem; margin-bottom:1.25rem; font-size:0.88rem; }
        .dn-conf-id strong { font-size:1.05rem; color:var(--g-dark); letter-spacing:0.05em; }
        .dn-conf-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; margin-bottom:1.5rem; }
        @media(max-width:480px){ .dn-conf-grid{grid-template-columns:repeat(2,1fr);} }
        .dn-conf-item { display:flex; flex-direction:column; gap:0.25rem; align-items:center; background:var(--off-white); border-radius:0.65rem; padding:0.75rem 0.5rem; font-size:0.8rem; color:var(--text-body); }
        .dn-conf-item span:first-child { font-size:1.25rem; }
        .dn-pan-box { background:var(--off-white); border-radius:var(--radius); padding:1.25rem; margin-bottom:1.25rem; border:1px solid var(--mint-dk); text-align:left; }
        .dn-pan-title { font-size:0.88rem; font-weight:700; color:var(--g-dark); margin-bottom:0.3rem; }
        .dn-pan-desc { font-size:0.8rem; color:var(--text-muted); margin-bottom:0.85rem; line-height:1.5; }
        .dn-conf-actions { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:0.75rem; }
        .dn-conf-note { font-size:0.75rem; color:var(--text-muted); }

        /* HOW IT WORKS */
        .dn-how-strip { display:flex; align-items:flex-start; gap:0; flex-wrap:nowrap; overflow-x:auto; padding-bottom:0.5rem; }
        @media(max-width:640px){ .dn-how-strip{gap:0; flex-wrap:wrap;} .dn-how-arrow{display:none;} }
        .dn-how-item { flex:1; min-width:140px; text-align:center; padding:0 0.75rem; }
        .dn-how-icon { font-size:2rem; margin-bottom:0.4rem; }
        .dn-how-step { font-size:0.68rem; font-weight:700; color:var(--g-accent); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:0.3rem; }
        .dn-how-title { font-size:0.92rem; font-weight:700; color:var(--g-dark); margin-bottom:0.3rem; }
        .dn-how-desc { font-size:0.78rem; color:var(--text-muted); line-height:1.5; }
        .dn-how-arrow { font-size:1.5rem; color:var(--g-accent); padding-top:2rem; flex-shrink:0; align-self:flex-start; }

        /* GIFT GRID */
        .dn-gift-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
        @media(max-width:860px){ .dn-gift-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px){ .dn-gift-grid{grid-template-columns:1fr 1fr;} }
        .dn-gift-card { background:var(--off-white); border:1px solid var(--mint-dk); border-radius:var(--radius); padding:1.25rem 1rem; text-align:center; display:flex; flex-direction:column; gap:0.5rem; transition:all 0.2s; }
        .dn-gift-card:hover { border-color:var(--g-accent); box-shadow:0 4px 16px rgba(82,183,136,0.1); }
        .dn-gift-card__icon { font-size:1.75rem; }
        .dn-gift-card__label { font-size:0.88rem; font-weight:700; color:var(--text-dark); }
        .dn-gift-card__msg { font-size:0.72rem; color:var(--text-muted); font-style:italic; line-height:1.4; flex:1; }
        .dn-gift-card__price { font-size:0.95rem; font-weight:800; color:var(--g-dark); }
        .dn-gift-note { text-align:center; font-size:0.78rem; color:var(--text-muted); margin-top:1.25rem; }

        /* GALLERY */
        .dn-gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        @media(max-width:640px){ .dn-gallery{grid-template-columns:1fr;} }
        .dn-gallery-item { border-radius:var(--radius); overflow:hidden; border:1px solid var(--mint-dk); }
        .dn-gallery-img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; transition:transform 0.3s; }
        .dn-gallery-item:hover .dn-gallery-img { transform:scale(1.03); }
        .dn-gallery-cap { padding:0.85rem 1rem; background:#fff; }
        .dn-gallery-label { font-size:0.88rem; font-weight:700; color:var(--g-dark); margin-bottom:0.2rem; }
        .dn-gallery-sub { font-size:0.75rem; color:var(--text-muted); }

        /* TRUST STRIP */
        .dn-trust-strip { background:var(--g-dark); padding:1.75rem 0; }
        .dn-trust-strip__inner { display:grid; grid-template-columns:repeat(4,1fr); gap:1.25rem; }
        @media(max-width:700px){ .dn-trust-strip__inner{grid-template-columns:repeat(2,1fr);} }
        .dn-trust-item { display:flex; align-items:flex-start; gap:0.75rem; }
        .dn-trust-icon { font-size:1.5rem; flex-shrink:0; }
        .dn-trust-title { font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:0.15rem; }
        .dn-trust-sub { font-size:0.72rem; color:rgba(255,255,255,0.55); line-height:1.4; }

        /* CTA */
        .dn-cta-block { text-align:center; max-width:600px; margin:0 auto; }
        .dn-cta-badge { display:inline-block; font-size:0.78rem; font-weight:600; color:var(--g-light); background:rgba(82,183,136,0.18); border:1px solid rgba(82,183,136,0.35); padding:0.35rem 0.9rem; border-radius:999px; margin-bottom:1rem; }
        .dn-cta-h2 { font-size:clamp(1.7rem,4vw,2.8rem); font-weight:900; color:#fff; line-height:1.2; margin:0 0 0.9rem; }
        .dn-cta-h2 em { color:var(--g-light); font-style:normal; }
        .dn-cta-p { color:rgba(255,255,255,0.68); font-size:0.97rem; margin-bottom:1.75rem; line-height:1.6; }
        .dn-cta-btns { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; }

        /* MOBILE */
        @media(max-width:480px){
          .dn-section { padding:2.25rem 0; }
          .dn-wizard-wrap { padding:1.5rem 0 2.5rem; }
          .dn-step-body { padding:1.25rem; }
          .dn-cta-btns { flex-direction:column; align-items:center; }
          .dn-btn-row { flex-direction:column; }
          .dn-btn-row .dn-btn { width:100%; }
        }
      `}</style>
    </main>
  )
}

// ── IMPACT CALCULATOR COMPONENT ──
function ImpactCalc() {
  const [trees, setTrees] = useState(10)
  const co2 = trees * 22
  const cars = Math.round(co2 / 4600 * 10) / 10
  return (
    <div className="ic-wrap">
      <div className="ic-slider-row">
        <span className="ic-label">Number of trees</span>
        <input type="range" min={1} max={1000} value={trees}
          onChange={e => setTrees(Number(e.target.value))}
          className="ic-slider" />
        <span className="ic-num">{trees}</span>
      </div>
      <div className="ic-results">
        <div className="ic-result">
          <span className="ic-result-num">{co2.toLocaleString('en-IN')} kg</span>
          <span className="ic-result-label">CO₂ offset per year</span>
        </div>
        <div className="ic-result">
          <span className="ic-result-num">₹{(trees * 100).toLocaleString('en-IN')}</span>
          <span className="ic-result-label">Starting from</span>
        </div>
        <div className="ic-result">
          <span className="ic-result-num">{cars}</span>
          <span className="ic-result-label">Cars off road equivalent</span>
        </div>
      </div>
      <style>{`
        .ic-wrap { max-width:600px; margin:0 auto; }
        .ic-slider-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .ic-label { font-size:0.9rem; font-weight:600; color:rgba(255,255,255,0.8); white-space:nowrap; }
        .ic-slider { flex:1; min-width:150px; accent-color:#52B788; }
        .ic-num { font-size:1.4rem; font-weight:900; color:#74C69D; min-width:50px; text-align:right; }
        .ic-results { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
        @media(max-width:480px){ .ic-results{grid-template-columns:1fr;} }
        .ic-result { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:0.75rem; padding:1.25rem; text-align:center; display:flex; flex-direction:column; gap:0.3rem; }
        .ic-result-num { font-size:1.5rem; font-weight:900; color:#74C69D; }
        .ic-result-label { font-size:0.75rem; color:rgba(255,255,255,0.55); }
      `}</style>
    </div>
  )
}

// ── DONATION FAQ COMPONENT ──
function DonationFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: 'How do I know my tree was actually planted?', a: 'Within 7 days of your donation, our field team plants your tree and attaches a GPS tag and QR code. Claude AI verifies the photo — checking species, GPS coordinates, timestamp, and health — before it appears on your dashboard. You get monthly updates with real photos.' },
    { q: 'When will I receive my certificate?', a: 'Your PDF certificate is generated instantly after payment confirmation and emailed to you automatically. You can also download it directly from the confirmation screen.' },
    { q: 'How do I claim the 80G tax benefit?', a: 'Provide your PAN number on the confirmation screen after payment. We will include the 80G receipt details in your certificate. EcoTree Impact Foundation is a registered Section 8 company with 80G approval.' },
    { q: 'Can I gift a tree to someone in another city?', a: 'Yes — the tree is planted in Bangalore, but the certificate and digital dashboard are sent to any email address. The recipient gets a personal dashboard to track their gifted tree from anywhere in India or abroad.' },
    { q: 'What is the Miyawaki Mini Forest option?', a: 'Miyawaki is a Japanese method of creating dense micro-forests using 30+ native species planted close together. These forests grow 10x faster and support 30x more biodiversity than regular plantations. At ₹5,000, you sponsor one forest patch tracked for 3 years.' },
  ]
  return (
    <div className="fq-list">
      {faqs.map((f, i) => (
        <div key={i} className="fq-item">
          <button className={`fq-q${open === i ? ' open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span>
            <span className="fq-chev">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className="fq-a">{f.a}</div>}
        </div>
      ))}
      <style>{`
        .fq-list { display:flex; flex-direction:column; gap:0.6rem; margin-top:1.5rem; }
        .fq-item { border:1px solid var(--mint-dk); border-radius:0.5rem; overflow:hidden; }
        .fq-q { width:100%; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:1rem 1.1rem; font-size:0.92rem; font-weight:600; color:#1B4332; background:#F8FAF8; border:none; cursor:pointer; text-align:left; font-family:inherit; transition:background 0.15s; }
        .fq-q:hover, .fq-q.open { background:#D8F3DC; }
        .fq-chev { font-size:1.2rem; color:#52B788; flex-shrink:0; }
        .fq-a { padding:0.9rem 1.1rem; font-size:0.88rem; line-height:1.7; color:#2D3B36; background:#fff; border-top:1px solid #B7E4C7; }
      `}</style>
    </div>
  )
}
