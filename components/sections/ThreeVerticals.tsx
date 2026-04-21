'use client'
import { useEffect, useRef } from 'react'

const CARDS = [
  {
    id: 'trees', icon: '🌳', label: 'Trees', accentColor: '#97BC62',
    gradient: 'linear-gradient(160deg,#0a2010 0%,#122a18 15%,#1a3c22 28%,#2a5c32 42%,#3a7a42 56%,#4a9452 68%,#5aaa60 80%,#3a7a42 100%)',
    h3: 'Every tree geotagged, AI-verified and tracked for 3 years',
    p: 'From sapling to standing tree — GPS coordinates, monthly photos, AI health scores and a QR tag on every trunk.',
    stats: [{ val: '10K+', lbl: 'Trees planted' }, { val: '91%', lbl: 'Survival rate' }, { val: '3 yrs', lbl: 'Tracking' }],
    href: '/impact/trees',
  },
  {
    id: 'waste', icon: '♻️', label: 'Waste', accentColor: '#FB923C',
    gradient: 'linear-gradient(160deg,#1a0e06 0%,#2d1a0a 15%,#4a2c12 28%,#6b3e18 42%,#8b5220 56%,#a86828 68%,#c07830 80%,#7a4418 100%)',
    h3: 'Segregation, composting and recovery — tracked ward by ward',
    p: 'Real-time waste diversion metrics across Bangalore wards — segregation rates, composting volumes and recovery data.',
    stats: [{ val: '48T', lbl: 'Diverted' }, { val: '12', lbl: 'Wards active' }, { val: 'Live', lbl: 'Dashboard' }],
    href: '/impact/waste',
  },
  {
    id: 'water', icon: '💧', label: 'Water', accentColor: '#38BDF8',
    gradient: 'linear-gradient(160deg,#030c1a 0%,#061828 15%,#0a2840 28%,#0e3a5c 42%,#145280 56%,#1a6aa0 68%,#2080b8 80%,#0e3a5c 100%)',
    h3: 'Lake restoration, borewell recharge and quality monitoring',
    p: "Bangalore's lakes restored and monitored — water quality sensors, recharge levels and restoration progress tracked live.",
    stats: [{ val: '12M', lbl: 'Litres restored' }, { val: '7', lbl: 'Lakes active' }, { val: 'Live', lbl: 'Monitoring' }],
    href: '/impact/water',
  },
]

export default function ThreeVerticals() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s10header')?.classList.add('visible')
          CARDS.forEach(c => document.getElementById(`vcard-${c.id}`)?.classList.add('visible'))
          observer.disconnect()
        }
      })
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s10" ref={sectionRef} aria-label="Three environmental verticals">
      <div className="s10__container">
        <header className="s10__header" id="s10header">
          <span className="s10__eyebrow">What we do</span>
          <h2 className="s10__h2">One platform. <em>Three missions.</em></h2>
          <p className="s10__intro">Trees, waste and water — three interconnected environmental challenges, one tech-powered platform tracking every action.</p>
        </header>

        <div className="s10__cards">
          {CARDS.map((card, i) => (
            <article key={card.id} id={`vcard-${card.id}`} className="v-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="v-card__bg" style={{ background: card.gradient }} />
              <div className="v-card__overlay" />
              <div className="v-card__accent" style={{ background: `linear-gradient(90deg,${card.accentColor},transparent)` }} />
              <div className="v-card__content">
                <div className="v-card__top">
                  <div className="v-card__icon" style={{ background: `rgba(255,255,255,0.15)`, border: `1px solid rgba(255,255,255,0.25)` }}>{card.icon}</div>
                  <span className="v-card__label" style={{ color: card.accentColor }}>{card.label}</span>
                </div>
                <h3 className="v-card__h3">{card.h3}</h3>
                <p className="v-card__p">{card.p}</p>
                <div className="v-card__stats">
                  {card.stats.map(s => (
                    <div key={s.lbl} className="v-stat">
                      <div className="v-stat__val">{s.val}</div>
                      <div className="v-stat__lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="v-card__divider" />
                <a href={card.href} className="v-card__cta" style={{ color: card.accentColor }}>
                  View Impact <span className="cta-arr">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .s10{background:#F0F7EE;padding:56px 0;position:relative}
        .s10::before{content:'';position:absolute;top:-20%;right:-5%;width:400px;height:400px;background:radial-gradient(circle,rgba(44,95,45,0.07) 0%,transparent 65%);pointer-events:none}
        .s10__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;position:relative;z-index:1}
        .s10__header{text-align:center;margin-bottom:2rem;opacity:0;transform:translateY(14px)}
        .s10__header.visible{animation:fadeUp 0.6s ease forwards}
        .s10__eyebrow{display:inline-block;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.16);border-radius:999px;padding:0.3rem 0.85rem;margin-bottom:1rem}
        .s10__h2{font-family:var(--font-display);font-size:clamp(1.6rem,3vw,2.25rem);font-weight:700;color:#1A1A1A;line-height:1.2;letter-spacing:-0.02em;margin-bottom:0.75rem}
        .s10__h2 em{font-style:italic;color:var(--clr-primary)}
        .s10__intro{font-size:1rem;color:#3D3D3D;line-height:1.75;max-width:480px;margin:0 auto}
        .s10__cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
        .v-card{position:relative;height:400px;border-radius:24px;overflow:hidden;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.18);opacity:0;transform:translateY(24px)}
        .v-card.visible{animation:cardUp 0.65s ease forwards}
        .v-card:hover .v-card__bg{transform:scale(1.05)}
        .v-card__bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform 0.65s ease}
        .v-card__overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.2) 35%,rgba(0,0,0,0.62) 62%,rgba(0,0,0,0.9) 100%);transition:background 0.28s}
        .v-card__accent{position:absolute;top:0;left:0;right:0;height:3px;z-index:3}
        .v-card__content{position:absolute;bottom:0;left:0;right:0;padding:1.5rem 1.25rem 1.25rem;z-index:2;display:flex;flex-direction:column;gap:0.75rem}
        .v-card__top{display:flex;align-items:center;gap:0.75rem}
        .v-card__icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;backdrop-filter:blur(4px)}
        .v-card__label{font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
        .v-card__h3{font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.01em;text-shadow:0 1px 4px rgba(0,0,0,0.3)}
        .v-card__p{font-size:0.8125rem;color:rgba(255,255,255,0.75);line-height:1.6}
        .v-card__stats{display:flex;gap:1rem}
        .v-stat__val{font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:#fff;line-height:1}
        .v-stat__lbl{font-size:0.6rem;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.5)}
        .v-card__divider{height:1px;background:rgba(255,255,255,0.15)}
        .v-card__cta{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:600;text-decoration:none;transition:gap 0.28s ease}
        .v-card:hover .v-card__cta{gap:0.75rem}
        .cta-arr{transition:transform 0.28s ease;display:inline-block}
        .v-card:hover .cta-arr{transform:translateX(4px)}
        @media(max-width:860px){.s10__cards{grid-template-columns:1fr;gap:1rem}.v-card{height:320px}}
        @media(max-width:600px){.v-card{height:280px}}
      `}</style>
    </section>
  )
}
