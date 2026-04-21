'use client'
import { useEffect, useRef } from 'react'

const CARDS = [
  { id: 'trees',    icon: '🌱', value: 10,  suffix: 'K', label: 'Trees Planted',   sub: '↑ 247 this month',           ringPct: 0.72, barPct: 72, color: '#97BC62', duration: 1800 },
  { id: 'survival', icon: '🎯', value: 91,  suffix: '%', label: 'Survival Rate',   sub: 'AI-monitored every 30 days',  ringPct: 0.91, barPct: 91, color: '#b8d47a', duration: 2000 },
  { id: 'waste',    icon: '♻️', value: 48,  suffix: 'T', label: 'Waste Diverted',  sub: 'Tracked ward by ward',        ringPct: 0.55, barPct: 55, color: '#FB923C', duration: 1700 },
  { id: 'water',    icon: '💧', value: 12,  suffix: 'M', label: 'Water Restored',  sub: 'Lake restoration live',       ringPct: 0.48, barPct: 48, color: '#38BDF8', duration: 1900 },
]

const CIRC = 289 // 2π × 46

export default function ImpactBar() {
  const triggered = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          CARDS.forEach(card => {
            // Counter
            const el = document.getElementById(`num-${card.id}`)
            if (el) animateCount(el, card.value, card.duration)
            // Ring
            const ring = document.getElementById(`ring-${card.id}`) as SVGCircleElement | null
            if (ring) ring.style.strokeDashoffset = String(CIRC - card.ringPct * CIRC)
            // Bar
            const bar = document.getElementById(`bar-${card.id}`)
            if (bar) bar.style.width = card.barPct + '%'
            // Card entrance
            const cardEl = document.getElementById(`card-${card.id}`)
            if (cardEl) cardEl.classList.add('visible')
          })
          observer.disconnect()
        }
      })
    }, { threshold: 0.25 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  function animateCount(el: HTMLElement, target: number, duration: number) {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = (eased * target).toFixed(0)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return (
    <section className="impact" ref={sectionRef} aria-label="Impact statistics">
      <div className="impact__container">
        <div className="impact__eyebrow">
          <span className="impact__eyebrow-text">Our impact in numbers</span>
        </div>
        <div className="impact__grid">
          {CARDS.map((card, i) => (
            <div key={card.id} id={`card-${card.id}`} className={`impact-card impact-card--${card.id}`} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="ring-wrap">
                <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                  <circle className="ring-bg" cx="60" cy="60" r="46"/>
                  <circle id={`ring-${card.id}`} className="ring-fill" cx="60" cy="60" r="46" stroke={card.color} style={{ strokeDashoffset: CIRC }}/>
                </svg>
                <div className="ring-center">
                  <span className="ring-icon">{card.icon}</span>
                  <span className="ring-number">
                    <span id={`num-${card.id}`}>0</span>
                    <span style={{ fontSize: '1rem' }}>{card.suffix}</span>
                  </span>
                  <span className="ring-suffix">{card.id === 'trees' ? 'trees' : card.id === 'survival' ? 'survival' : card.id === 'waste' ? 'diverted' : 'litres'}</span>
                </div>
              </div>
              <div className="card-text">
                <div className="card-title">{card.label}</div>
                <div className="card-sub">{card.sub}</div>
              </div>
              <div className="card-bar">
                <div id={`bar-${card.id}`} className={`card-bar__fill card-bar__fill--${card.id}`} style={{ width: '0%' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .impact{background:#121821;padding:4rem 0;position:relative;overflow:hidden}
        .impact::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(151,188,98,0.3) 30%,rgba(151,188,98,0.3) 70%,transparent 100%)}
        .impact::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:100%;background:radial-gradient(ellipse,rgba(44,95,45,0.08) 0%,transparent 65%);pointer-events:none}
        .impact__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;position:relative;z-index:1}
        .impact__eyebrow{text-align:center;margin-bottom:2.5rem}
        .impact__eyebrow-text{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-moss);opacity:0.8}
        .impact__eyebrow-text::before,.impact__eyebrow-text::after{content:'';display:block;width:32px;height:1px;background:rgba(151,188,98,0.35)}
        .impact__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem}
        .impact-card{background:#1a2235;border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:2rem 1.5rem 1.5rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem;box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.35);position:relative;overflow:hidden;transition:transform 0.25s ease,border-color 0.25s;opacity:0;transform:translateY(28px)}
        .impact-card.visible{animation:cardUp 0.7s ease forwards}
        .impact-card:hover{transform:translateY(-4px);border-color:rgba(151,188,98,0.18)}
        .impact-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0}
        .impact-card--trees::before{background:linear-gradient(90deg,#2C5F2D,#97BC62)}
        .impact-card--survival::before{background:linear-gradient(90deg,#97BC62,#b8d47a)}
        .impact-card--waste::before{background:linear-gradient(90deg,#ea580c,#FB923C)}
        .impact-card--water::before{background:linear-gradient(90deg,#0ea5e9,#38BDF8)}
        .ring-wrap{position:relative;width:120px;height:120px;flex-shrink:0}
        .ring-wrap svg{transform:rotate(-90deg)}
        .ring-bg{fill:none;stroke:rgba(255,255,255,0.07);stroke-width:8}
        .ring-fill{fill:none;stroke-width:8;stroke-linecap:round;stroke-dasharray:289;transition:stroke-dashoffset 2s ease}
        .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
        .ring-icon{font-size:1.5rem;line-height:1}
        .ring-number{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:#fff;line-height:1;letter-spacing:-0.02em}
        .ring-suffix{font-size:0.6rem;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:0.04em;text-transform:uppercase}
        .card-text{display:flex;flex-direction:column;align-items:center;gap:0.5rem;text-align:center}
        .card-title{font-size:1.125rem;font-weight:600;color:#fff;letter-spacing:-0.01em}
        .card-sub{font-size:0.875rem;color:rgba(255,255,255,0.45);line-height:1.6}
        .card-bar{width:100%;height:3px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden}
        .card-bar__fill{height:100%;border-radius:999px;width:0%;transition:width 2.2s ease}
        .card-bar__fill--trees{background:linear-gradient(90deg,#2C5F2D,#97BC62)}
        .card-bar__fill--survival{background:#b8d47a}
        .card-bar__fill--waste{background:#FB923C}
        .card-bar__fill--water{background:#38BDF8}
        @media(max-width:900px){.impact__grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.impact__grid{grid-template-columns:1fr;max-width:320px;margin:0 auto}}
      `}</style>
    </section>
  )
}
