'use client'
import React, { useState, useEffect, useRef } from 'react'

const WEB3FORMS_KEY = 'f2635df8-33a5-44ef-889c-9f823771927f'
const WHATSAPP = '919886094611'
const SITE_URL = 'https://ecotree-project-tkr2.vercel.app/donate'

const donationQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Someone is sitting in the shade today because someone planted a tree long ago.", author: "Warren Buffett" },
  { text: "The true meaning of life is to plant trees, under whose shade you do not expect to sit.", author: "Nelson Henderson" },
  { text: "A society grows great when old men plant trees whose shade they shall never sit in.", author: "Greek Proverb" },
  { text: "He who plants a tree plants a hope.", author: "Lucy Larcom" },
]

const giftQuotes: Record<string, string> = {
  birthday: "A tree planted in your name grows as you grow — rooted, reaching, alive.",
  anniversary: "Like your love — deeply rooted, enduring, and growing stronger every year.",
  memory: "Their memory lives on in every leaf, every branch, every breath this tree gives.",
  baby: "A tree planted the day you arrived — it will grow alongside you for a lifetime.",
  festival: "Celebrate the season with a gift that gives back to the earth every year.",
  corporate: "Great organisations, like great trees, grow by giving back to the world around them.",
  custom: "Every tree tells a story. This one is yours.",
}

interface TYData {
  certId: string; name: string; email: string; phone: string
  treeName: string; species: string; co2: string; amount: number
  qty: number; mode: string; recipientName?: string
  recipientEmail?: string; occasion?: string; occasionId?: string
  giftMessage?: string
tierId?: string
dashboard?: string
}

export default function ThankYouPage() {
  const [data, setData] = useState<TYData | null>(null)
  const [pan, setPan] = useState('')
  const [panSaved, setPanSaved] = useState(false)
  const [shared, setShared] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('ecotree_ty')
    if (raw) {
      const parsed = JSON.parse(raw) as TYData
      setData(parsed)
      sendEmails(parsed)
    }
  }, [])

  const sendEmails = async (d: TYData) => {
    // Email to donor
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Your EcoTree Certificate — ${d.certId}`,
        email: d.email,
        from_name: 'EcoTree Impact Foundation',
        message: `Dear ${d.name},\n\nThank you for planting ${d.qty} ${d.treeName}!\n\nTree ID: ${d.certId}\nCO₂ Offset: ${d.co2}/year\nTracking: 3 years · AI-verified\n\nYour tree will be planted within 7 days. Download your certificate from the thank-you page.\n\nWith gratitude,\nEcoTree Impact Foundation, Bangalore`,
      }),
    })
    // Email to gift recipient
    if (d.mode === 'gift' && d.recipientEmail) {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `${d.name} gifted you a tree 🌱`,
          email: d.recipientEmail,
          from_name: 'EcoTree Impact Foundation',
          message: `Dear ${d.recipientName},\n\n${d.name} has gifted you a tree on ${d.occasion}!\n\n"${giftQuotes[d.occasionId || 'custom']}"\n\nTree ID: ${d.certId}\nYour tree will be planted in Bangalore within 7 days and tracked for 3 years.\n\n${d.giftMessage ? `Message from ${d.name}: "${d.giftMessage}"\n\n` : ''}With love,\nEcoTree Impact Foundation, Bangalore`,
        }),
      })
    }
  }

  const savePan = async () => {
    if (!pan || !data) return
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `80G PAN: ${data.name} — ${pan}`,
        email: 'bhimsen.g@gmail.com',
        from_name: 'EcoTree 80G',
        cert_id: data.certId, donor: data.name,
        donor_email: data.email, pan, amount: `₹${data.amount}`,
      }),
    })
    setPanSaved(true)
  }

  const downloadCert = async () => {
    if (!data) return
    try {
      const { jsPDF } = await import('jspdf' as any)
      const isGift = data.mode === 'gift'
      const tierId = data.tierId || 'individual_1000'
const isCommunity = tierId === 'community_100' || tierId === 'community_250'
const isMiyawaki = tierId === 'miyawaki_5000'
const isJoint = tierId === 'joint_500'
      const quote = isGift
        ? giftQuotes[data.occasionId || 'custom']
        : donationQuotes[Math.floor(Math.random() * donationQuotes.length)]

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      const H = doc.internal.pageSize.getHeight()

      if (isGift) {
        // ── GIFT CERTIFICATE — Modern Premium Card Style ──
        // Background
        doc.setFillColor(248, 250, 248)
        doc.rect(0, 0, W, H, 'F')

        // Green left accent bar
        doc.setFillColor(27, 67, 50)
        doc.rect(0, 0, 18, H, 'F')

        // Top accent line
        doc.setFillColor(82, 183, 136)
        doc.rect(18, 0, W - 18, 4, 'F')

        // Decorative dots on left bar
        doc.setFillColor(82, 183, 136)
        for (let i = 0; i < 8; i++) {
          doc.circle(9, 20 + i * 24, 2.5, 'F')
        }

        // Brand name on left bar (rotated)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('ECOTREE IMPACT FOUNDATION', 4, H - 15, { angle: 90 })

        // Main content area
        const cx = 18

        // Gift icon + occasion
        doc.setTextColor(82, 183, 136)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`🎁  ${(data.occasion || 'Gift').toUpperCase()} TREE CERTIFICATE`, cx + 10, 18)

        // Divider
        doc.setDrawColor(212, 212, 212)
        doc.setLineWidth(0.3)
        doc.line(cx + 10, 22, W - 15, 22)

        // "A tree has been gifted to"
        doc.setTextColor(90, 110, 100)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text('A tree has been planted in the name of', cx + 10, 32)

        // Recipient name — large
        doc.setTextColor(27, 67, 50)
        doc.setFontSize(28)
        doc.setFont('helvetica', 'bold')
        doc.text(data.recipientName || 'Recipient', cx + 10, 50)

        // Gifted by
        doc.setTextColor(90, 110, 100)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Gifted by ${data.name}`, cx + 10, 60)

        // Date
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, cx + 10, 67)

        // Green details box
        doc.setFillColor(216, 243, 220)
        doc.roundedRect(cx + 10, 73, (W - cx - 25) / 2, 32, 3, 3, 'F')
        doc.setFillColor(27, 50, 35)
        doc.roundedRect(cx + 10 + (W - cx - 25) / 2 + 5, 73, (W - cx - 25) / 2, 32, 3, 3, 'F')

        // Left box content
        doc.setTextColor(27, 67, 50)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('TREE TYPE', cx + 14, 81)
        doc.setFontSize(11)
        doc.text(data.treeName, cx + 14, 89)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Species: ${data.species}`, cx + 14, 96)
        doc.text(`CO₂ Offset: ${data.co2}/year`, cx + 14, 101)

        // Right box content
        const rx = cx + 10 + (W - cx - 25) / 2 + 9
        doc.setTextColor(116, 198, 157)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('TRACKING', rx, 81)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.text(data.certId, rx, 89)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Tracked: 3 years · AI-Verified', rx, 96)
        doc.text('GPS-tagged within 7 days', rx, 101)

        // Quote
        doc.setTextColor(70, 100, 80)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        const qText = `"${typeof quote === 'string' ? quote : quote.text}"`
        const qLines = doc.splitTextToSize(qText, W - cx - 30)
        doc.text(qLines, cx + 10, 114)

        // Personal message
        if (data.giftMessage) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(90, 110, 100)
          doc.setFontSize(8.5)
          doc.text(`"${data.giftMessage}"`, cx + 10, 124)
        }

        // Footer
        doc.setFillColor(27, 67, 50)
        doc.rect(18, H - 12, W - 18, 12, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text('EcoTree Impact Foundation · Bangalore · Section 8 NGO · 80G Approved · AI-Verified Plantations', cx + 10, H - 4)

      } else {
        // ── DONOR CERTIFICATE — Award/Degree Style ──
        const q = quote as { text: string; author: string }

        // Parchment background
        doc.setFillColor(253, 251, 245)
        doc.rect(0, 0, W, H, 'F')

        // Outer gold border
        doc.setDrawColor(180, 140, 60)
        doc.setLineWidth(2.5)
        doc.rect(8, 8, W - 16, H - 16)

        // Inner green border
        doc.setDrawColor(27, 67, 50)
        doc.setLineWidth(0.8)
        doc.rect(12, 12, W - 24, H - 24)

        // Corner ornaments
        const corners = [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]]
        doc.setFillColor(180, 140, 60)
        corners.forEach(([x, y]) => {
          doc.circle(x, y, 2, 'F')
        })

        // Top header band
        doc.setFillColor(27, 67, 50)
        doc.rect(12, 12, W - 24, 30, 'F')

        // Decorative gold line in header
        doc.setDrawColor(180, 140, 60)
        doc.setLineWidth(0.5)
        doc.line(18, 24, W - 18, 24)
        doc.line(18, 38, W - 18, 38)

        // Organization name
        doc.setTextColor(212, 168, 83)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('ECOTREE IMPACT FOUNDATION', W / 2, 20, { align: 'center' })

        // Certificate title
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('CERTIFICATE OF ENVIRONMENTAL IMPACT', W / 2, 33, { align: 'center' })

        // "This certifies"
        doc.setTextColor(90, 70, 30)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('This certificate is proudly presented to', W / 2, 54, { align: 'center' })

        // Gold underline
        doc.setDrawColor(180, 140, 60)
        doc.setLineWidth(0.4)
        doc.line(W / 2 - 80, 56, W / 2 + 80, 56)

        // Donor name — large serif-style
        doc.setTextColor(27, 67, 50)
        doc.setFontSize(30)
        doc.setFont('helvetica', 'bold')
        doc.text(data.name, W / 2, 74, { align: 'center' })

        // Gold underline below name
        doc.setDrawColor(180, 140, 60)
        doc.setLineWidth(1)
        doc.line(W / 2 - 60, 78, W / 2 + 60, 78)

        // "for planting" text
        doc.setTextColor(60, 80, 60)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(isCommunity ? `for contributing to EcoTree's Community Forest Initiative` : `for planting ${data.qty} ${data.treeName} tree${data.qty > 1 ? 's' : ''} in Bangalore, India`, W / 2, 88, { align: 'center' })

        // Details row — 4 boxes
       const co2Val = isCommunity ? '~5kg/tree/yr' : `${data.co2}/year`
const boxes = [
  { label: isCommunity ? 'Certificate' : 'Tree ID', value: isCommunity ? 'Community Forest' : data.certId },
{ label: 'CO₂ Offset', value: isCommunity ? '~5kg/tree/yr' : `${data.co2}/yr` },
          { label: 'Species', value: data.species.split('·')[0].trim() },
          { label: 'Tracking', value: '3 Years · AI' },
        ]
        const bw = (W - 40) / 4
        boxes.forEach((b, i) => {
          const bx = 20 + i * (bw + 2)
          doc.setFillColor(i % 2 === 0 ? 235 : 220, i % 2 === 0 ? 245 : 238, i % 2 === 0 ? 230 : 225)
          doc.roundedRect(bx, 94, bw, 20, 2, 2, 'F')
          doc.setDrawColor(180, 140, 60)
          doc.setLineWidth(0.3)
          doc.roundedRect(bx, 94, bw, 20, 2, 2, 'S')
          doc.setTextColor(100, 80, 30)
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.text(b.label.toUpperCase(), bx + bw / 2, 100, { align: 'center' })
          doc.setTextColor(27, 67, 50)
          doc.setFontSize(8.5)
          doc.text(b.value, bx + bw / 2, 108, { align: 'center' })
        })

        // Date
        doc.setTextColor(90, 70, 30)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Issued on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, W / 2, 122, { align: 'center' })

        // Quote
        doc.setTextColor(70, 90, 70)
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'italic')
        const qLines = doc.splitTextToSize(`"${q.text}"`, W - 60)
        doc.text(qLines, W / 2, 132, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.text(`— ${q.author}`, W / 2, 132 + qLines.length * 5, { align: 'center' })

        // 80G receipt
        if (pan) {
          doc.setTextColor(60, 80, 60)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.text(`80G Tax Receipt | PAN: ${pan} | Amount: ₹${data.amount} | Receipt No: ${data.certId}`, W / 2, H - 22, { align: 'center' })
        }

        // Footer band
        doc.setFillColor(27, 67, 50)
        doc.rect(12, H - 18, W - 24, 6, 'F')
        doc.setTextColor(212, 168, 83)
        doc.setFontSize(7)
        doc.text('EcoTree Impact Foundation, Bangalore · Section 8 Company · 80G Approved · NGO Darpan Certified · AI-Verified Plantations', W / 2, H - 14, { align: 'center' })

        // Gold corners bottom
        doc.setFillColor(180, 140, 60)
        doc.circle(14, H - 14, 2, 'F')
        doc.circle(W - 14, H - 14, 2, 'F')
      }

      doc.save(`EcoTree-Certificate-${data.certId}.pdf`)
    } catch (err) {
      alert(`Certificate ID: ${data.certId}\nThank you ${data.name}!\nCertificate emailed to ${data.email}`)
    }
  }

  const goPlantAnother = () => {
    sessionStorage.removeItem('ecotree_ty')
    window.location.href = '/donate'
  }

  if (!data) {
    return (
      <main className="ty">
        <div className="ty-loading">
          <div className="ty-loading__icon">🌱</div>
          <p>Loading your certificate...</p>
          <p style={{ fontSize: '0.85rem', color: '#5C7268', marginTop: '0.5rem' }}>
            If this persists,{' '}
            <a href="/donate" style={{ color: '#52B788' }} onClick={() => sessionStorage.removeItem('ecotree_ty')}>
              return to donate page
            </a>
          </p>
        </div>
        <style>{`.ty{min-height:60vh;display:flex;align-items:center;justify-content:center;}.ty-loading{text-align:center;font-size:1rem;color:#5C7268;}.ty-loading__icon{font-size:3rem;margin-bottom:1rem;animation:pulse 1.5s ease-in-out infinite;}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </main>
    )
  }

  const isGift = data.mode === 'gift'

  return (
    <main className="ty">

      {/* CONFETTI STRIP */}
      <div className="ty-confetti" aria-hidden="true">
        {['🌱','🌳','🍃','💚','🌿','🌱','🌳','🍃','💚','🌿','🌱','🌳'].map((e,i)=>(
          <span key={i} style={{animationDelay:`${i*0.15}s`}}>{e}</span>
        ))}
      </div>

      <div className="ty-container">

        {/* SUCCESS HEADER */}
        <div className="ty-success">
          <div className="ty-success__icon">🎉</div>
          <h1 className="ty-success__h1">
            {isGift ? `Your gift tree is on its way to ${data.recipientName}!` : 'Payment Confirmed! Your tree is on its way.'}
          </h1>
          <p className="ty-success__sub">
            Tree ID <strong>{data.certId}</strong> · Planted within 7 days · Certificate emailed to {data.email}
            {isGift && data.recipientEmail && ` and ${data.recipientEmail}`}
          </p>
        </div>

        <div className="ty-grid">

          {/* LEFT — CERT PREVIEW */}
          <div className="ty-cert-col">
            <div className="ty-section-label">{isGift ? '🎁 Gift Certificate Preview' : '🏆 Your Certificate Preview'}</div>

            {/* Certificate visual preview */}
            <div ref={certRef} className={`ty-cert-preview${isGift ? ' ty-cert-preview--gift' : ' ty-cert-preview--award'}`}>
              {isGift ? (
                /* GIFT CERT PREVIEW */
                <div className="tyc-gift">
                  <div className="tyc-gift__sidebar">
                    <span className="tyc-gift__brand">ECOTREE</span>
                  </div>
                  <div className="tyc-gift__main">
                    <div className="tyc-gift__top-line" />
                    <div className="tyc-gift__tag">🎁 {(data.occasion || 'GIFT').toUpperCase()} TREE CERTIFICATE</div>
                    <div className="tyc-gift__sub">A tree has been planted in the name of</div>
                    <div className="tyc-gift__recipient">{data.recipientName || 'Recipient'}</div>
                    <div className="tyc-gift__gifter">Gifted by {data.name}</div>
                    <div className="tyc-gift__boxes">
                      <div className="tyc-gift__box tyc-gift__box--light">
                        <div className="tyc-gift__box-label">TREE TYPE</div>
                        <div className="tyc-gift__box-val">{data.treeName}</div>
                        <div className="tyc-gift__box-sub">{data.species}</div>
                      </div>
                      <div className="tyc-gift__box tyc-gift__box--dark">
                        <div className="tyc-gift__box-label">TREE ID</div>
                        <div className="tyc-gift__box-val tyc-gift__box-val--id">{data.certId}</div>
                        <div className="tyc-gift__box-sub">3yr tracking · AI-Verified</div>
                      </div>
                    </div>
                    <div className="tyc-gift__quote">&ldquo;{giftQuotes[data.occasionId || 'custom']}&rdquo;</div>
                    {data.giftMessage && <div className="tyc-gift__msg">&ldquo;{data.giftMessage}&rdquo;</div>}
                    <div className="tyc-gift__footer">EcoTree Impact Foundation · Bangalore · Section 8 NGO · 80G Approved</div>
                  </div>
                </div>
              ) : (
                /* AWARD CERT PREVIEW */
                <div className="tyc-award">
                  <div className="tyc-award__outer">
                    <div className="tyc-award__inner">
                      <div className="tyc-award__header">
                        <div className="tyc-award__org">ECOTREE IMPACT FOUNDATION</div>
                        <div className="tyc-award__title">CERTIFICATE OF ENVIRONMENTAL IMPACT</div>
                      </div>
                      <div className="tyc-award__body">
                        <div className="tyc-award__presents">This certificate is proudly presented to</div>
                        <div className="tyc-award__name">{data.name}</div>
                        <div className="tyc-award__name-line" />
                        <div className="tyc-award__for">
                          {(data.tierId === 'community_100' || data.tierId === 'community_250') ? "for contributing to EcoTree's Community Forest Initiative" : `for planting ${data.qty} ${data.treeName} tree${data.qty > 1 ? 's' : ''} in Bangalore, India`}
                        </div>
                        <div className="tyc-award__details">
                          <div className="tyc-award__detail">
                            <span className="tyc-award__detail-label">Tree ID</span>
                            <span className="tyc-award__detail-val">{data.certId}</span>
                          </div>
                          <div className="tyc-award__detail">
                            <span className="tyc-award__detail-label">CO₂ Offset</span>
                            <span className="tyc-award__detail-val">{data.co2}/yr</span>
                          </div>
                          <div className="tyc-award__detail">
                            <span className="tyc-award__detail-label">Tracking</span>
                            <span className="tyc-award__detail-val">3 Years · AI</span>
                          </div>
                          <div className="tyc-award__detail">
                            <span className="tyc-award__detail-label">Date</span>
                            <span className="tyc-award__detail-val">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="tyc-award__quote">
                          &ldquo;{donationQuotes[0].text}&rdquo;
                          <span className="tyc-award__quote-auth">— {donationQuotes[0].author}</span>
                        </div>
                      </div>
                      <div className="tyc-award__footer">
                        EcoTree Impact Foundation, Bangalore · Section 8 · 80G Approved · AI-Verified
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="ty-btn ty-btn--primary ty-btn--full" onClick={downloadCert}>
              📥 Download Certificate PDF
            </button>
            <p className="ty-cert-note">Certificate also emailed to {data.email}{isGift && data.recipientEmail ? ` & ${data.recipientEmail}` : ''}</p>
          </div>

          {/* RIGHT — ACTIONS */}
          <div className="ty-actions-col">

            {/* Order summary */}
            <div className="ty-card">
              <div className="ty-card__title">🌱 Your Impact</div>
              <div className="ty-impact-grid">
                <div className="ty-impact-item"><span>🌳</span><span>{data.treeName}</span></div>
                <div className="ty-impact-item"><span>🌍</span><span>{data.co2} CO₂/yr</span></div>
                <div className="ty-impact-item"><span>📅</span><span>3-year tracking</span></div>
                <div className="ty-impact-item"><span>🤖</span><span>AI-verified</span></div>
              </div>
            </div>

            {/* PAN for 80G */}
            <div className="ty-card">
              <div className="ty-card__title">🧾 Claim 80G Tax Benefit</div>
              <p className="ty-card__sub">Provide your PAN to receive an 80G tax receipt included in your certificate.</p>
              {panSaved ? (
                <div className="ty-pan-saved">✓ PAN saved — 80G receipt will be included in your certificate</div>
              ) : (
                <div className="ty-pan-row">
                  <input
                    type="text" placeholder="ABCDE1234F" maxLength={10}
                    value={pan} onChange={e => setPan(e.target.value.toUpperCase())}
                    className="ty-pan-input"
                  />
                  <button className="ty-btn ty-btn--outline" onClick={savePan} disabled={!pan}>Save PAN</button>
                </div>
              )}
            </div>

            {/* Share moment */}
            <div className="ty-card ty-card--green">
              <div className="ty-card__title" style={{ color: '#fff' }}>📢 Share Your Impact</div>
              <p className="ty-card__sub" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Inspire others to plant too. Every share plants a seed of awareness.
              </p>
              <div className="ty-share-btns">
                <a
                  href={`https://wa.me/?text=I%20just%20planted%20a%20tree%20%F0%9F%8C%B1%20with%20EcoTree%20%E2%80%94%20India%27s%20AI-verified%20tree%20NGO!%20You%20can%20plant%20yours%20from%20%E2%82%B9100.%20${encodeURIComponent(SITE_URL)}`}
                  target="_blank" rel="noopener" className="ty-btn ty-btn--wa"
                >
                  💬 Share on WhatsApp
                </a>
                <button
                  className="ty-btn ty-btn--copy"
                  onClick={() => { navigator.clipboard.writeText(SITE_URL); setShared(true); setTimeout(() => setShared(false), 2000) }}
                >
                  {shared ? '✓ Copied!' : '🔗 Copy Donate Link'}
                </button>
              </div>
            </div>

            {/* Next steps */}
            <div className="ty-card">
              <div className="ty-card__title">📊 What's Next</div>
              <ul className="ty-next-list">
                <li><span className="ty-next-icon">🌱</span><div><strong>Days 1–7</strong><br/>Field team plants and GPS-tags your tree</div></li>
                <li><span className="ty-next-icon">🤖</span><div><strong>Day 7–10</strong><br/>AI verifies photos and activates your dashboard</div></li>
                <li><span className="ty-next-icon">📧</span><div><strong>Day 10</strong><br/>You receive dashboard access link by email</div></li>
                <li><span className="ty-next-icon">📅</span><div><strong>Every 30 days</strong><br/>New photos and health score updates</div></li>
              </ul>
            </div>

            <a href="/impact" className="ty-btn ty-btn--outline ty-btn--full">
              📊 View Live Impact Dashboard →
            </a>
            <button className="ty-btn ty-btn--ghost ty-btn--full" onClick={goPlantAnother}>
              🌱 Plant Another Tree
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ty{background:#F4F7F4;min-height:100vh;padding-bottom:4rem;}
        .ty-container{max-width:1100px;margin:0 auto;padding:0 1.5rem;}

        /* CONFETTI */
        .ty-confetti{background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:0.75rem 0;text-align:center;overflow:hidden;}
        .ty-confetti span{display:inline-block;font-size:1.1rem;margin:0 0.4rem;animation:tydrop 3s ease-in-out infinite;}
        @keyframes tydrop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(10deg)}}

        /* SUCCESS */
        .ty-success{text-align:center;padding:2.5rem 1rem 2rem;}
        .ty-success__icon{font-size:3.5rem;animation:typ 0.6s ease;margin-bottom:0.75rem;}
        @keyframes typ{from{transform:scale(0) rotate(-20deg)}to{transform:scale(1) rotate(0)}}
        .ty-success__h1{font-size:clamp(1.4rem,3vw,2rem);font-weight:900;color:#1B4332;line-height:1.2;margin:0 0 0.6rem;}
        .ty-success__sub{font-size:0.9rem;color:#5C7268;line-height:1.6;}
        .ty-success__sub strong{color:#1B4332;}

        /* GRID */
        .ty-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:1.75rem;align-items:start;}
        @media(max-width:860px){.ty-grid{grid-template-columns:1fr;}}

        /* SECTION LABEL */
        .ty-section-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#52B788;margin-bottom:0.85rem;}

        /* CERT PREVIEW */
        .ty-cert-preview{border-radius:0.875rem;overflow:hidden;margin-bottom:1rem;box-shadow:0 8px 40px rgba(27,67,50,0.15);}
        .ty-cert-preview--award{background:#FDF9EE;border:2px solid #B48C3C;}
        .ty-cert-preview--gift{background:#F8FAF8;border:2px solid #B7E4C7;}
        .ty-cert-note{font-size:0.75rem;color:#5C7268;text-align:center;margin-top:0.5rem;}

        /* GIFT CERT */
        .tyc-gift{display:grid;grid-template-columns:32px 1fr;}
        .tyc-gift__sidebar{background:#1B4332;display:flex;align-items:center;justify-content:center;}
        .tyc-gift__brand{font-size:0.55rem;font-weight:700;color:#74C69D;letter-spacing:0.2em;writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);padding:0.5rem 0;}
        .tyc-gift__main{padding:1.25rem 1.5rem;}
        .tyc-gift__top-line{height:3px;background:#52B788;border-radius:999px;margin-bottom:0.85rem;}
        .tyc-gift__tag{font-size:0.68rem;font-weight:700;color:#52B788;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;}
        .tyc-gift__sub{font-size:0.78rem;color:#5C7268;margin-bottom:0.25rem;}
        .tyc-gift__recipient{font-size:1.6rem;font-weight:900;color:#1B4332;line-height:1.1;margin-bottom:0.25rem;}
        .tyc-gift__gifter{font-size:0.78rem;color:#5C7268;margin-bottom:0.85rem;}
        .tyc-gift__boxes{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.85rem;}
        .tyc-gift__box{padding:0.65rem 0.75rem;border-radius:0.5rem;}
        .tyc-gift__box--light{background:#D8F3DC;}
        .tyc-gift__box--dark{background:#1B4332;}
        .tyc-gift__box-label{font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#52B788;margin-bottom:0.2rem;}
        .tyc-gift__box--light .tyc-gift__box-label{color:#2D6A4F;}
        .tyc-gift__box-val{font-size:0.88rem;font-weight:700;color:#1B4332;margin-bottom:0.15rem;}
        .tyc-gift__box--dark .tyc-gift__box-val{color:#fff;}
        .tyc-gift__box-val--id{font-size:0.72rem;font-family:monospace;}
        .tyc-gift__box-sub{font-size:0.62rem;color:#5C7268;}
        .tyc-gift__box--dark .tyc-gift__box-sub{color:rgba(255,255,255,0.6);}
        .tyc-gift__quote{font-size:0.72rem;font-style:italic;color:#5C7268;border-left:3px solid #52B788;padding-left:0.65rem;margin-bottom:0.5rem;line-height:1.5;}
        .tyc-gift__msg{font-size:0.72rem;color:#2D6A4F;font-style:italic;margin-bottom:0.75rem;}
        .tyc-gift__footer{font-size:0.6rem;color:#5C7268;border-top:1px solid #B7E4C7;padding-top:0.5rem;}

        /* AWARD CERT */
        .tyc-award{background:#FDF9EE;}
        .tyc-award__outer{border:2px solid #B48C3C;margin:6px;border-radius:4px;}
        .tyc-award__inner{border:1px solid #1B4332;margin:4px;border-radius:2px;overflow:hidden;}
        .tyc-award__header{background:#1B4332;padding:0.85rem 1rem;text-align:center;}
        .tyc-award__org{font-size:0.62rem;font-weight:700;letter-spacing:0.18em;color:#D4A853;text-transform:uppercase;margin-bottom:0.25rem;}
        .tyc-award__title{font-size:0.88rem;font-weight:700;color:#fff;letter-spacing:0.05em;}
        .tyc-award__body{padding:1.25rem 1.5rem;text-align:center;}
        .tyc-award__presents{font-size:0.78rem;color:#6B5B2E;font-style:italic;margin-bottom:0.5rem;}
        .tyc-award__name{font-size:2rem;font-weight:900;color:#1B4332;line-height:1;margin-bottom:0.3rem;}
        .tyc-award__name-line{width:80px;height:2px;background:#B48C3C;margin:0 auto 0.75rem;}
        .tyc-award__for{font-size:0.85rem;color:#4A5A4A;margin-bottom:1rem;}
        .tyc-award__details{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:1rem;}
        .tyc-award__detail{background:linear-gradient(135deg,#EFF6EE,#E5F0E3);border:1px solid #B48C3C;border-radius:0.4rem;padding:0.5rem 0.35rem;text-align:center;}
        .tyc-award__detail-label{font-size:0.58rem;font-weight:700;color:#8B6914;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:0.2rem;}
        .tyc-award__detail-val{font-size:0.75rem;font-weight:700;color:#1B4332;display:block;}
        .tyc-award__quote{font-size:0.72rem;font-style:italic;color:#5A7060;line-height:1.5;margin-bottom:0.25rem;}
        .tyc-award__quote-auth{display:block;font-style:normal;font-weight:600;font-size:0.68rem;color:#8B6914;margin-top:0.2rem;}
        .tyc-award__footer{background:#1B4332;padding:0.5rem;text-align:center;font-size:0.6rem;color:#D4A853;letter-spacing:0.05em;}

        /* CARDS */
        .ty-card{background:#fff;border:1px solid #B7E4C7;border-radius:0.875rem;padding:1.25rem;margin-bottom:1rem;}
        .ty-card--green{background:#1B4332;border-color:#2D6A4F;}
        .ty-card__title{font-size:0.85rem;font-weight:700;color:#1B4332;margin-bottom:0.5rem;}
        .ty-card__sub{font-size:0.82rem;color:#5C7268;line-height:1.55;margin-bottom:0.85rem;}

        /* IMPACT GRID */
        .ty-impact-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;}
        .ty-impact-item{display:flex;align-items:center;gap:0.5rem;background:#F4F7F4;border-radius:0.5rem;padding:0.55rem 0.75rem;font-size:0.82rem;color:#2D3B36;font-weight:500;}
        .ty-impact-item span:first-child{font-size:1.1rem;}

        /* PAN */
        .ty-pan-row{display:flex;gap:0.65rem;align-items:center;}
        .ty-pan-input{flex:1;padding:0.6rem 0.8rem;border:1.5px solid #B7E4C7;border-radius:0.6rem;font-size:0.9rem;font-family:inherit;color:#0D1F17;outline:none;letter-spacing:0.05em;}
        .ty-pan-input:focus{border-color:#52B788;}
        .ty-pan-saved{font-size:0.85rem;font-weight:600;color:#2D6A4F;background:#D8F3DC;padding:0.6rem 0.85rem;border-radius:0.5rem;}

        /* SHARE */
        .ty-share-btns{display:flex;gap:0.65rem;flex-wrap:wrap;}

        /* NEXT LIST */
        .ty-next-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;}
        .ty-next-list li{display:flex;align-items:flex-start;gap:0.75rem;font-size:0.85rem;color:#2D3B36;line-height:1.5;}
        .ty-next-icon{font-size:1.2rem;flex-shrink:0;margin-top:0.1rem;}
        .ty-next-list strong{font-weight:700;color:#1B4332;}

        /* BUTTONS */
        .ty-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.4rem;font-size:0.88rem;font-weight:600;padding:0.65rem 1.3rem;border-radius:999px;cursor:pointer;border:none;transition:all 0.2s;font-family:inherit;text-decoration:none;white-space:nowrap;}
        .ty-btn--full{width:100%;border-radius:0.75rem;margin-bottom:0.6rem;}
        .ty-btn--primary{background:#52B788;color:#fff;box-shadow:0 2px 12px rgba(44,95,45,0.3);}
        .ty-btn--primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .ty-btn--outline{border:1.5px solid #52B788;color:#1B4332;background:transparent;}
        .ty-btn--outline:hover{background:#D8F3DC;}
        .ty-btn--outline:disabled{opacity:0.5;cursor:not-allowed;}
        .ty-btn--ghost{border:1.5px solid #B7E4C7;color:#5C7268;background:transparent;}
        .ty-btn--ghost:hover{background:#F4F7F4;}
        .ty-btn--wa{background:#25D366;color:#fff;}
        .ty-btn--wa:hover{background:#20c05a;}
        .ty-btn--copy{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.25);}
        .ty-btn--copy:hover{background:rgba(255,255,255,0.25);}

        @media(max-width:480px){
          .ty-share-btns{flex-direction:column;}
          .ty-pan-row{flex-direction:column;align-items:stretch;}
          .tyc-award__details{grid-template-columns:repeat(2,1fr);}
          .ty-cert-preview{font-size:90%;}
        }
      `}</style>
    </main>
  )
}
