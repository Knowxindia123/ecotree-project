'use client'
import { useEffect, useRef } from 'react'

const CHECKS = [
  { id: 'species', icon: '🌿', color: 'rgba(44,95,45,.10)',   title: 'Species Identified',    delay: 0.08 },
  { id: 'gps',     icon: '📍', color: 'rgba(56,189,248,.10)', title: 'GPS Location Matched',  delay: 0.18 },
  { id: 'dup',     icon: '🔍', color: 'rgba(212,168,83,.12)', title: 'No Duplicate Photo',    delay: 0.28 },
  { id: 'time',    icon: '🕐', color: 'rgba(167,139,250,.12)',title: 'Timestamp Verified',    delay: 0.38 },
]

export default function AIVerification() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s9left')?.classList.add('visible')
          CHECKS.forEach((c, i) => {
            const card = document.getElementById(`check-${c.id}`)
            if (card) card.classList.add('visible')
            setTimeout(() => {
              document.getElementById(`tick-${c.id}`)?.classList.add('show')
            }, 350 + i * 140)
            setTimeout(() => {
              document.getElementById(`status-${c.id}`)?.classList.add('show')
            }, 600 + i * 140)
          })
          observer.disconnect()
        }
      })
    }, { threshold: 0.25 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s9" ref={sectionRef} aria-label="AI verification — no greenwashing">
      <div className="s9__container">
        <div className="s9__left" id="s9left">
          <span className="s9__eyebrow">AI-powered verification</span>
          <h2 className="s9__h2">No greenwashing.<br /><em>Ever.</em></h2>
          <p className="s9__sub">Every photo is verified by AI before it reaches you — four independent checks, automatically.</p>
          <div className="s9__trust">
            <span className="s9__trust-icon">🔒</span>
            <p className="s9__trust-text">
              <strong>If any check fails, it goes to human review — not to you.</strong>
            </p>
          </div>
        </div>

        <div className="s9__right">
          {CHECKS.map(c => (
            <div key={c.id} id={`check-${c.id}`} className="check-card" style={{ animationDelay: `${c.delay}s` }}>
              <div className="check-badge" style={{ background: c.color }}>
                <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                <span id={`tick-${c.id}`} className="tick">✓</span>
              </div>
              <div className="check-body">
                <h3 className="check-h3">{c.title}</h3>
                <span id={`status-${c.id}`} className="check-status">
                  <span className="s-dot" />&nbsp;Auto-verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .s9{background:var(--clr-dark-bg);background-image:radial-gradient(ellipse 55% 90% at 10% 50%,rgba(151,188,98,0.06) 0%,transparent 60%);padding:40px 0;position:relative;overflow:hidden}
        .s9::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(151,188,98,0.035) 1px,transparent 1px);background-size:24px 24px;pointer-events:none}
        .s9__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:center;position:relative;z-index:1}
        .s9__left{display:flex;flex-direction:column;gap:1rem;opacity:0;transform:translateX(-18px)}
        .s9__left.visible{animation:slideLeft 0.65s ease forwards}
        .s9__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-moss);background:rgba(151,188,98,0.1);border:1px solid rgba(151,188,98,0.2);border-radius:999px;padding:0.28rem 0.8rem;width:fit-content}
        .s9__h2{font-family:var(--font-display);font-size:clamp(1.65rem,2.8vw,2.25rem);font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.02em}
        .s9__h2 em{font-style:italic;color:var(--clr-moss)}
        .s9__sub{font-size:0.875rem;color:rgba(255,255,255,0.68);line-height:1.75;max-width:380px}
        .s9__trust{display:flex;align-items:center;gap:0.75rem;background:rgba(151,188,98,0.08);border:1px solid rgba(151,188,98,0.18);border-radius:12px;padding:0.75rem 1rem}
        .s9__trust-icon{font-size:1.1rem;flex-shrink:0}
        .s9__trust-text{font-size:0.75rem;color:rgba(255,255,255,0.75);line-height:1.6;font-style:italic}
        .s9__trust-text strong{color:var(--clr-moss);font-style:normal;font-weight:600}
        .s9__right{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
        .check-card{background:#fff;border-radius:12px;padding:1rem;display:flex;align-items:center;gap:0.75rem;box-shadow:0 2px 12px rgba(0,0,0,0.10);transition:transform 0.25s ease,box-shadow 0.25s;opacity:0;transform:translateY(16px)}
        .check-card.visible{animation:cardUp 0.5s ease forwards}
        .check-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.14)}
        .check-badge{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
        .tick{position:absolute;top:-4px;right:-4px;width:16px;height:16px;background:var(--clr-primary);border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.55rem;color:white;font-weight:700;opacity:0;transform:scale(0)}
        .tick.show{animation:tickPop 0.35s ease forwards}
        .check-body{display:flex;flex-direction:column;gap:3px}
        .check-h3{font-size:0.875rem;font-weight:600;color:#1A3C34;line-height:1.2}
        .check-status{display:inline-flex;align-items:center;gap:4px;font-size:0.6rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--clr-primary);opacity:0}
        .check-status.show{animation:fadeUp 0.3s ease forwards}
        .s-dot{width:5px;height:5px;background:var(--clr-moss);border-radius:50%;display:inline-block;animation:pulse 2s ease-in-out infinite}
        @media(max-width:820px){.s9__container{grid-template-columns:1fr;gap:1.5rem}.s9__right{grid-template-columns:1fr 1fr}}
        @media(max-width:480px){.s9__right{grid-template-columns:1fr}}
      `}</style>
    </section>
  )
}
