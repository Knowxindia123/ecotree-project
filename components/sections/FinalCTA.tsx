'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

const STATS = [
  { val: '10,000+', lbl: 'Trees planted' },
  { val: '91%',     lbl: 'Survival rate' },
  { val: 'AI ✓',   lbl: 'Every photo verified' },
  { val: '3 yrs',  lbl: 'Dashboard tracking' },
]

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          ;['s16-eyebrow','s16-h2','s16-sub','s16-btns','s16-stats','s16-note'].forEach(id => {
            document.getElementById(id)?.classList.add('visible')
          })
          observer.disconnect()
        }
      })
    }, { threshold: 0.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s16" ref={sectionRef} aria-label="Final call to action">
      <div className="s16__leaf" aria-hidden="true" />
      <div className="s16__glow"  aria-hidden="true" />

      <div className="s16__container">
        <span className="s16__eyebrow" id="s16-eyebrow">🌱 Start today</span>
        <h2 className="s16__h2" id="s16-h2">
          Every tree you plant lives on your<br /><em>dashboard forever.</em>
        </h2>
        <p className="s16__sub" id="s16-sub">
          Join 10,000+ donors who can see their trees growing right now — real photos, GPS locations, AI health scores.
        </p>
        <div className="s16__btns" id="s16-btns">
          <Link href="/donate" className="s16-btn-plant">
            🌱 Plant My First Tree <span className="s16-arrow">→</span>
          </Link>
          <Link href="/csr/partner" className="s16-btn-partner">
            🤝 Partner With Us
          </Link>
        </div>
        <div className="s16__stats" id="s16-stats">
          {STATS.map((s, i) => (
            <>
              <div key={s.lbl} className="s16-stat">
                <div className="s16-stat__val">{s.val}</div>
                <div className="s16-stat__lbl">{s.lbl}</div>
              </div>
              {i < STATS.length - 1 && <div className="s16-sep" aria-hidden="true" />}
            </>
          ))}
        </div>
        <p className="s16__note" id="s16-note">
          Section 8 Company · 80G Tax Benefit ·{' '}
          <Link href="/privacy">Privacy Policy</Link> ·{' '}
          <Link href="/terms">Terms of Use</Link>
        </p>
      </div>

      <style>{`
        .s16{background:var(--clr-dark-bg);padding:24px 0 32px;position:relative;overflow:hidden}
        .s16__leaf{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cpath d='M20 80 Q45 20 80 35 Q50 72 20 80Z' fill='none' stroke='rgba(151,188,98,0.07)' stroke-width='1.5'/%3E%3Cpath d='M100 20 Q145 40 135 85 Q112 55 100 20Z' fill='none' stroke='rgba(151,188,98,0.05)' stroke-width='1.5'/%3E%3C/svg%3E");background-size:160px 160px;animation:leafDrift 30s linear infinite;pointer-events:none}
        .s16__glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:400px;background:radial-gradient(ellipse,rgba(151,188,98,0.07) 0%,transparent 65%);pointer-events:none}
        .s16__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:1rem}
        .s16__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-moss);background:rgba(151,188,98,0.1);border:1px solid rgba(151,188,98,0.22);border-radius:999px;padding:0.3rem 0.9rem;opacity:0;transform:translateY(10px)}
        .s16__eyebrow.visible{animation:fadeUp 0.5s ease forwards}
        .s16__h2{font-family:var(--font-display);font-size:clamp(1.4rem,2.8vw,2rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-0.02em;max-width:700px;opacity:0;transform:translateY(14px)}
        .s16__h2.visible{animation:fadeUp 0.6s ease 0.1s forwards}
        .s16__h2 em{font-style:italic;color:var(--clr-moss)}
        .s16__sub{font-size:1rem;color:rgba(255,255,255,0.65);line-height:1.75;max-width:460px;opacity:0;transform:translateY(12px)}
        .s16__sub.visible{animation:fadeUp 0.6s ease 0.2s forwards}
        .s16__btns{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;opacity:0;transform:translateY(12px)}
        .s16__btns.visible{animation:fadeUp 0.6s ease 0.3s forwards}
        .s16-btn-plant{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:1rem;font-weight:600;color:#fff;background:var(--clr-primary);border:none;border-radius:999px;padding:0.75rem 1.6rem;cursor:pointer;text-decoration:none;box-shadow:0 4px 14px rgba(44,95,45,0.45);transition:all 0.28s ease;white-space:nowrap}
        .s16-btn-plant:hover{background:var(--clr-primary-hover);transform:translateY(-2px);box-shadow:0 8px 28px rgba(44,95,45,0.55)}
        .s16-arrow{transition:transform 0.28s ease;display:inline-block}
        .s16-btn-plant:hover .s16-arrow{transform:translateX(4px)}
        .s16-btn-partner{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:1rem;font-weight:600;color:var(--clr-gold);background:transparent;border:1.5px solid rgba(212,168,83,0.45);border-radius:999px;padding:0.7rem 1.5rem;cursor:pointer;text-decoration:none;transition:all 0.28s ease;white-space:nowrap}
        .s16-btn-partner:hover{background:rgba(212,168,83,0.1);border-color:var(--clr-gold);transform:translateY(-2px)}
        .s16__stats{display:flex;align-items:center;justify-content:center;gap:2rem;flex-wrap:wrap;padding-top:0.5rem;opacity:0;transform:translateY(10px)}
        .s16__stats.visible{animation:fadeUp 0.6s ease 0.42s forwards}
        .s16-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
        .s16-stat__val{font-family:var(--font-display);font-size:1.125rem;font-weight:700;color:var(--clr-moss);line-height:1}
        .s16-stat__lbl{font-size:0.75rem;color:rgba(255,255,255,0.45);font-weight:500;letter-spacing:0.03em}
        .s16-sep{width:1px;height:28px;background:rgba(255,255,255,0.1);flex-shrink:0}
        .s16__note{font-size:0.75rem;color:rgba(255,255,255,0.28);letter-spacing:0.04em;opacity:0}
        .s16__note.visible{animation:fadeUp 0.5s ease 0.55s forwards}
        .s16__note a{color:rgba(151,188,98,0.5);text-decoration:none}
        .s16__note a:hover{color:var(--clr-moss)}
        @media(max-width:560px){.s16__btns{flex-direction:column;align-items:stretch}.s16-btn-plant,.s16-btn-partner{justify-content:center}.s16__stats{gap:1.25rem}.s16-sep{display:none}}
      `}</style>
    </section>
  )
}
