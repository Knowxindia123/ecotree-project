'use client'
import { useEffect, useRef } from 'react'

const STEPS = [
  {
    num: 1, icon: '💳', tag: 'You do this', tagClass: 'tag--you',
    h3: 'You Donate & Choose',
    p: 'Donate ₹100–₹500 and choose your tree species — Neem, Peepal, Mango, Rain Tree or Banyan. Add a personal message for occasion gifting.',
    chips: ['💳 UPI / Card / Net banking', '🌳 5 species to choose from', '🎁 Occasion gifting available'],
  },
  {
    num: 2, icon: '🌱', tag: 'Field Team', tagClass: 'tag--us',
    h3: 'We Plant & GPS-Tag',
    p: 'Our field team plants and GPS-tags your tree within 7 days. Every tree gets a unique code and its exact coordinates are recorded.',
    chips: ['📍 GPS coordinates recorded', '⏱ Within 7 days', '🏷 Unique tree code assigned'],
  },
  {
    num: 3, icon: '🤖', tag: 'Claude AI', tagClass: 'tag--ai',
    h3: 'AI Verifies the Photo',
    p: 'Claude AI verifies the photo — species match, health score, GPS location and timestamp. If any check fails, it goes to human review — not to you.',
    chips: ['✅ Species identified', '📡 GPS location matched', '🔍 Duplicate photo check', '🕐 Timestamp verified'],
  },
  {
    num: 4, icon: '🏷', tag: 'Field Team', tagClass: 'tag--field',
    h3: 'QR Tag on Your Tree',
    p: 'A weatherproof QR tag is attached to your physical tree. Anyone can scan it to see the full tree profile, photos and health history.',
    chips: ['🌧 Weatherproof tag', '📱 Scan with any phone', '🔗 Links to live dashboard'],
  },
  {
    num: 5, icon: '📊', tag: 'You do this', tagClass: 'tag--you',
    h3: 'You Track Live for 3 Years',
    p: 'Track it live on your personal dashboard — real photos every 30 days, AI health scores, CO₂ offset and GPS. Your tree, your proof.',
    chips: ['📸 Photo every 30 days', '💚 AI health score 0–100', '🌿 CO₂ offset tracked', '📅 3-year monitoring'],
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s8header')?.classList.add('visible')
          STEPS.forEach(s => document.getElementById(`step-${s.num}`)?.classList.add('visible'))
          document.getElementById('s8bottom')?.classList.add('visible')
          observer.disconnect()
        }
      })
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s8" ref={sectionRef} aria-label="How EcoTree works">
      <div className="s8__container">
        <div className="s8__header-row" id="s8header">
          <div className="s8__heading-block">
            <span className="s8__eyebrow">How it works</span>
            <h2 className="s8__h2">Planting trees was never so <em>transparent</em></h2>
          </div>
          <div className="s8__intro-block">
            <p className="s8__intro">From your donation to a living, tracked tree — every step is verified, documented and visible to you.</p>
          </div>
        </div>

        <div className="s8__cards-wrap">
          <div className="s8__cards">
            {STEPS.map((step, i) => (
              <article key={step.num} id={`step-${step.num}`} className="s8-card" style={{ animationDelay: `${i * 0.10}s` }} aria-label={`Step ${step.num}: ${step.h3}`}>
                <div className="s8-card__bg" />
                <div className="s8-card__overlay" />
                <div className="s8-card__num">{step.num}</div>
                <span className={`s8-card__tag ${step.tagClass}`}>{step.tag}</span>
                <div className="s8-card__content">
                  <span className="s8-card__icon">{step.icon}</span>
                  <h3 className="s8-card__h3">{step.h3}</h3>
                  <p className="s8-card__p">{step.p}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="s8__bottom" id="s8bottom">
          <a href="/donate" className="s8__cta">
            🌱 Plant Your First Tree <span className="s8-arrow">→</span>
          </a>
          <p className="s8__note">
            Starting at <strong>₹100</strong> &nbsp;·&nbsp; Certificate sent instantly &nbsp;·&nbsp; <strong>80G</strong> tax benefit &nbsp;·&nbsp; No greenwashing — ever
          </p>
        </div>
      </div>

      <style>{`
        .s8{background:#F7F5F0;padding:56px 0}
        .s8__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem}
        .s8__header-row{display:grid;grid-template-columns:300px 1fr;gap:3rem;align-items:end;margin-bottom:2rem;opacity:0;transform:translateY(14px)}
        .s8__header-row.visible{animation:fadeUp 0.6s ease forwards}
        .s8__eyebrow{display:inline-block;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.16);border-radius:999px;padding:0.3rem 0.85rem;margin-bottom:1rem}
        .s8__h2{font-family:var(--font-display);font-size:clamp(1.5rem,2.5vw,2rem);font-weight:700;color:#1A1A1A;line-height:1.2;letter-spacing:-0.02em}
        .s8__h2 em{font-style:italic;color:var(--clr-primary)}
        .s8__intro{font-size:1.125rem;color:#3D3D3D;line-height:1.75;max-width:480px}
        .s8__cards-wrap{position:relative}
        .s8__cards-wrap::after{content:'';position:absolute;top:0;right:0;bottom:0;width:60px;background:linear-gradient(90deg,transparent,#F7F5F0);pointer-events:none;z-index:2}
        .s8__cards{display:grid;grid-template-columns:repeat(5,1fr);gap:1rem}
        .s8-card{position:relative;height:340px;border-radius:24px;overflow:hidden;cursor:pointer;flex-shrink:0;opacity:0;transform:translateY(20px)}
        .s8-card.visible{animation:cardUp 0.6s ease forwards}
        .s8-card__bg{position:absolute;inset:0;transition:transform 0.6s ease}
        .s8-card:nth-child(1) .s8-card__bg{background:linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)}
        .s8-card:nth-child(2) .s8-card__bg{background:linear-gradient(160deg,#0a2010,#122a18,#2a5c32,#3a7a42)}
        .s8-card:nth-child(3) .s8-card__bg{background:linear-gradient(160deg,#0f2027,#203a43,#2c5364)}
        .s8-card:nth-child(4) .s8-card__bg{background:linear-gradient(160deg,#5c3d1e,#7a5230,#8b6340,#6b4423)}
        .s8-card:nth-child(5) .s8-card__bg{background:linear-gradient(160deg,#1a3c34,#2c5f2d,#3d7a3d,#1e4d2b)}
        .s8-card:hover .s8-card__bg{transform:scale(1.06)}
        .s8-card__overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.2) 35%,rgba(0,0,0,0.65) 65%,rgba(0,0,0,0.9) 100%);transition:background 0.28s}
        .s8-card:hover .s8-card__overlay{background:linear-gradient(180deg,rgba(0,0,0,0.12) 0%,rgba(0,0,0,0.28) 35%,rgba(0,0,0,0.72) 65%,rgba(0,0,0,0.92) 100%)}
        .s8-card__num{position:absolute;top:14px;left:14px;width:32px;height:32px;background:var(--clr-primary);border:2px solid rgba(255,255,255,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:#fff;z-index:2;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
        .s8-card__tag{position:absolute;top:14px;right:14px;font-size:0.58rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:0.25rem 0.6rem;border-radius:999px;z-index:2;border:1px solid rgba(255,255,255,0.25);backdrop-filter:blur(4px)}
        .tag--you{background:rgba(212,168,83,0.25);color:#fcd98a}
        .tag--us{background:rgba(44,95,45,0.35);color:#a8e06a}
        .tag--ai{background:rgba(99,102,241,0.3);color:#c4b5fd}
        .tag--field{background:rgba(20,184,166,0.3);color:#5eead4}
        .s8-card__content{position:absolute;bottom:0;left:0;right:0;padding:1.25rem 1rem 1rem;z-index:2;display:flex;flex-direction:column;gap:0.5rem}
        .s8-card__icon{font-size:1.5rem;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))}
        .s8-card__h3{font-family:var(--font-display);font-size:1.05rem;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.01em;text-shadow:0 1px 4px rgba(0,0,0,0.4)}
        .s8-card__p{font-size:0.72rem;color:rgba(255,255,255,0.78);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .s8-card:hover .s8-card__p{-webkit-line-clamp:unset;color:rgba(255,255,255,0.92)}
        .s8__bottom{margin-top:2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;opacity:0;transform:translateY(12px)}
        .s8__bottom.visible{animation:fadeUp 0.5s ease 0.5s forwards}
        .s8__cta{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:1rem;font-weight:600;color:#fff;background:var(--clr-primary);border:none;border-radius:999px;padding:0.85rem 1.75rem;cursor:pointer;text-decoration:none;box-shadow:0 4px 14px rgba(44,95,45,0.38);transition:all 0.28s ease}
        .s8__cta:hover{background:var(--clr-primary-hover);transform:translateY(-2px);box-shadow:0 8px 24px rgba(44,95,45,0.45)}
        .s8-arrow{transition:transform 0.28s ease;display:inline-block}
        .s8__cta:hover .s8-arrow{transform:translateX(4px)}
        .s8__note{font-size:0.875rem;color:#6B7280;line-height:1.75}
        .s8__note strong{color:var(--clr-primary);font-weight:600}
        @media(max-width:1100px){.s8__cards{grid-template-columns:repeat(5,220px);overflow-x:auto;padding-bottom:0.5rem}}
        @media(max-width:860px){.s8__header-row{grid-template-columns:1fr;gap:1.25rem}.s8__cards{grid-template-columns:repeat(5,180px)}.s8-card{height:280px}}
        @media(max-width:600px){.s8__cards{grid-template-columns:repeat(2,1fr);overflow-x:unset}.s8__cards-wrap::after{display:none}.s8-card{height:240px}.s8-card:last-child{grid-column:span 2}.s8__bottom{flex-direction:column;align-items:flex-start}}
      `}</style>
    </section>
  )
}
