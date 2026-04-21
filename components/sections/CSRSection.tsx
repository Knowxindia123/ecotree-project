'use client'
import { useEffect, useRef } from 'react'

const BULLETS = [
  { icon: '🤖', title: 'AI-verified photo evidence',   sub: 'Every tree photo checked by Claude Vision before it reaches your report' },
  { icon: '📊', title: 'Real-time survival data',      sub: 'Live dashboard showing your trees health, GPS and photo updates' },
  { icon: '📋', title: 'ESG-ready reports',            sub: 'Downloadable PDF reports formatted for ESG and sustainability disclosures' },
  { icon: '🧾', title: '80G compliance built-in',      sub: 'Section 8 NGO — all donations eligible for 80G tax deduction' },
  { icon: '👥', title: 'Employee engagement tools',    sub: 'Each employee gets their own tree dashboard — plant in their name' },
]

export default function CSRSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s13left')?.classList.add('visible')
          document.getElementById('s13right')?.classList.add('visible')
          BULLETS.forEach((_,i) => document.getElementById(`bullet-${i}`)?.classList.add('visible'))
          // Animate counters
          setTimeout(() => {
            animateCount(document.getElementById('sr-num'), 91, 1800)
            animateCount(document.getElementById('co2-num'), 53900, 2000)
            const fill = document.getElementById('sr-fill') as SVGCircleElement | null
            if (fill) fill.style.strokeDashoffset = '22.8'
            const bar = document.getElementById('prog-fill')
            if (bar) { bar.style.width = '49%'; document.getElementById('prog-pct')!.textContent = '49%' }
          }, 400)
          observer.disconnect()
        }
      })
    }, { threshold: 0.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  function animateCount(el: HTMLElement | null, target: number, duration: number) {
    if (!el) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(eased * target).toLocaleString('en-IN')
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return (
    <section className="s13" ref={sectionRef} aria-label="CSR partnership">
      <div className="s13__container">

        {/* LEFT */}
        <div className="s13__left" id="s13left">
          <span className="s13__eyebrow">🏢 For corporates</span>
          <h2 className="s13__h2">Your CSR impact —<br /><em>fully verifiable.</em></h2>
          <p className="s13__sub">We don&apos;t just plant trees for your CSR budget. We prove every single one survived.</p>
          <ul className="s13__bullets">
            {BULLETS.map((b, i) => (
              <li key={b.title} id={`bullet-${i}`} className="s13__bullet" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                <div className="bullet-icon">{b.icon}</div>
                <div className="bullet-text">
                  <div className="bullet-title">{b.title}</div>
                  <div className="bullet-sub">{b.sub}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="s13__cta-wrap">
            <a href="/csr/partner" className="s13__cta">
              🤝 Become CSR Partner <span className="s13-arrow">→</span>
            </a>
            <p className="s13__cta-note">Minimum 100 trees · Custom dashboard · Dedicated account manager</p>
          </div>
        </div>

        {/* RIGHT — CSR Dashboard mockup */}
        <div className="s13__right" id="s13right">
          <div className="csr-mockup">
            <div className="csr-header">
              <div className="csr-company">
                <div className="csr-logo">INF</div>
                <div>
                  <div className="csr-company-name">Infosys Foundation</div>
                  <div className="csr-company-sub">CSR Partner since Jan 2026</div>
                </div>
              </div>
              <span className="csr-badge">✓ Verified Partner</span>
            </div>
            <div className="csr-body">
              <div className="csr-stats">
                {[['Trees Planted','2,450','↑ 150 this month'],['Planting Sites','8','Across Bangalore'],['Employees','245','Own a tree']].map(([lbl,val,sub]) => (
                  <div key={lbl} className="csr-stat">
                    <div className="csr-stat__label">{lbl}</div>
                    <div className="csr-stat__value">{val}</div>
                    <div className="csr-stat__sub">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="csr-mid">
                <div className="csr-survival">
                  <div className="survival-ring">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle className="sr-bg" cx="32" cy="32" r="26"/>
                      <circle id="sr-fill" className="sr-fill" cx="32" cy="32" r="26"/>
                    </svg>
                    <div className="survival-ring__label">
                      <span className="sr-num" id="sr-num">0</span>
                      <span className="sr-unit">%</span>
                    </div>
                  </div>
                  <div className="survival-info">
                    <div className="survival-title">Survival Rate</div>
                    <div className="survival-sub">Industry avg: 60%<br/>AI-monitored</div>
                  </div>
                </div>
                <div className="csr-co2">
                  <div className="co2-label">CO₂ Offset</div>
                  <div><div className="co2-value" id="co2-num">0</div><div className="co2-unit">kg / year</div></div>
                  <div className="co2-verified">↑ Verified by AI</div>
                </div>
              </div>
              <div className="csr-progress">
                <div className="progress-top">
                  <span className="progress-label">Annual CSR Target</span>
                  <span className="progress-pct" id="prog-pct">0%</span>
                </div>
                <div className="progress-bar"><div id="prog-fill" className="progress-fill" style={{ width: '0%' }}/></div>
                <div className="progress-note">2,450 of 5,000 trees · On track for Dec 2026</div>
              </div>
            </div>
            <div className="csr-esg">
              {['E — Environmental','S — Social','G — Governance','80G Eligible'].map((tag,i) => (
                <span key={tag} className={`esg-tag esg-tag--${['e','s','g','80g'][i]}`}>{tag}</span>
              ))}
            </div>
            <div className="csr-footer">
              <div className="csr-verified"><span className="live-dot"/>Last verified 2 hours ago</div>
              <a href="#" className="csr-download">⬇ Download ESG Report</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .s13{background:var(--clr-dark-bg);background-image:radial-gradient(ellipse 60% 80% at 10% 50%,rgba(151,188,98,0.06) 0%,transparent 60%);padding:56px 0;position:relative;overflow:hidden}
        .s13__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;position:relative;z-index:1}
        .s13__left{display:flex;flex-direction:column;gap:1.25rem;opacity:0;transform:translateX(-20px)}
        .s13__left.visible{animation:slideLeft 0.7s ease forwards}
        .s13__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-gold);background:rgba(212,168,83,0.1);border:1px solid rgba(212,168,83,0.22);border-radius:999px;padding:0.3rem 0.85rem;width:fit-content}
        .s13__h2{font-family:var(--font-display);font-size:clamp(1.65rem,2.8vw,2.35rem);font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.02em}
        .s13__h2 em{font-style:italic;color:var(--clr-moss)}
        .s13__sub{font-size:1.125rem;color:rgba(255,255,255,0.68);line-height:1.75;max-width:440px}
        .s13__bullets{list-style:none;display:flex;flex-direction:column;gap:0.75rem}
        .s13__bullet{display:flex;align-items:center;gap:0.75rem;opacity:0;transform:translateX(-12px)}
        .s13__bullet.visible{animation:slideLeft 0.45s ease forwards}
        .bullet-icon{width:36px;height:36px;background:rgba(151,188,98,0.12);border:1px solid rgba(151,188,98,0.22);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .bullet-title{font-size:1rem;font-weight:600;color:#fff}
        .bullet-sub{font-size:0.75rem;color:rgba(255,255,255,0.5)}
        .s13__cta-wrap{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
        .s13__cta{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:1rem;font-weight:600;color:#1a1a1a;background:var(--clr-gold);border:none;border-radius:999px;padding:0.85rem 1.75rem;cursor:pointer;text-decoration:none;box-shadow:0 4px 14px rgba(212,168,83,0.35);transition:all 0.28s ease}
        .s13__cta:hover{background:var(--clr-gold-light);transform:translateY(-2px)}
        .s13-arrow{transition:transform 0.28s ease;display:inline-block}
        .s13__cta:hover .s13-arrow{transform:translateX(4px)}
        .s13__cta-note{font-size:0.75rem;color:rgba(255,255,255,0.4);line-height:1.6}
        .s13__right{opacity:0;transform:translateX(20px)}
        .s13__right.visible{animation:slideRight 0.7s ease 0.15s forwards}
        .csr-mockup{background:#fff;border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.35),0 4px 16px rgba(0,0,0,0.2);overflow:hidden}
        .csr-header{background:#f8fafc;border-bottom:1px solid #e5e7eb;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between}
        .csr-company{display:flex;align-items:center;gap:0.75rem}
        .csr-logo{width:40px;height:40px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;letter-spacing:0.04em}
        .csr-company-name{font-size:0.875rem;font-weight:600;color:#1a1a1a}
        .csr-company-sub{font-size:0.75rem;color:#6b7280;margin-top:1px}
        .csr-badge{font-size:0.6rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.18);border-radius:999px;padding:3px 8px}
        .csr-body{padding:1.25rem;display:flex;flex-direction:column;gap:1rem;background:#fafafa}
        .csr-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem}
        .csr-stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:0.75rem 1rem}
        .csr-stat__label{font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280}
        .csr-stat__value{font-family:var(--font-display);font-size:1.375rem;font-weight:700;color:var(--clr-primary);line-height:1;margin-top:2px}
        .csr-stat__sub{font-size:0.6rem;color:#6b7280;margin-top:1px}
        .csr-mid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
        .csr-survival{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;display:flex;align-items:center;gap:1rem}
        .survival-ring{position:relative;width:64px;height:64px;flex-shrink:0}
        .survival-ring svg{transform:rotate(-90deg)}
        .sr-bg{fill:none;stroke:#e5e7eb;stroke-width:6}
        .sr-fill{fill:none;stroke:var(--clr-moss);stroke-width:6;stroke-linecap:round;stroke-dasharray:163;stroke-dashoffset:163;transition:stroke-dashoffset 1.8s ease}
        .survival-ring__label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .sr-num{font-size:0.85rem;font-weight:700;color:var(--clr-primary);line-height:1}
        .sr-unit{font-size:0.45rem;color:#6b7280;text-transform:uppercase}
        .survival-title{font-size:0.875rem;font-weight:600;color:#1a1a1a}
        .survival-sub{font-size:0.75rem;color:#6b7280;line-height:1.6;margin-top:2px}
        .csr-co2{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;display:flex;flex-direction:column;justify-content:space-between}
        .co2-label{font-size:0.62rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280}
        .co2-value{font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--clr-primary);line-height:1}
        .co2-unit{font-size:0.75rem;color:#6b7280}
        .co2-verified{font-size:0.62rem;color:var(--clr-primary);font-weight:600}
        .csr-progress{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:0.75rem 1rem}
        .progress-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem}
        .progress-label{font-size:0.75rem;font-weight:600;color:#1a1a1a}
        .progress-pct{font-size:0.75rem;font-weight:700;color:var(--clr-primary)}
        .progress-bar{height:6px;background:#e5e7eb;border-radius:999px;overflow:hidden}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--clr-primary),var(--clr-moss));border-radius:999px;width:0%;transition:width 1.6s ease}
        .progress-note{font-size:0.62rem;color:#6b7280;margin-top:0.5rem}
        .csr-esg{display:flex;gap:0.5rem;padding:0.75rem 1.25rem;background:#fff;border-top:1px solid #f0f0f0;flex-wrap:wrap}
        .esg-tag{font-size:0.6rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px;border:1px solid}
        .esg-tag--e{color:#2C5F2D;background:rgba(44,95,45,0.07);border-color:rgba(44,95,45,0.18)}
        .esg-tag--s{color:#1d4ed8;background:rgba(29,78,216,0.07);border-color:rgba(29,78,216,0.18)}
        .esg-tag--g{color:#7c3aed;background:rgba(124,58,237,0.07);border-color:rgba(124,58,237,0.18)}
        .esg-tag--80g{color:#b45309;background:rgba(180,83,9,0.07);border-color:rgba(180,83,9,0.18)}
        .csr-footer{padding:0.75rem 1.25rem;background:#fff;border-top:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between}
        .csr-verified{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;color:#6b7280}
        .csr-download{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.2);border-radius:999px;padding:0.35rem 0.85rem;text-decoration:none;transition:background 0.15s}
        .csr-download:hover{background:rgba(44,95,45,0.15)}
        @media(max-width:860px){.s13__container{grid-template-columns:1fr;gap:2rem}}
        @media(max-width:480px){.s13__h2{font-size:1.65rem}.csr-stats{grid-template-columns:1fr 1fr}}
      `}</style>
    </section>
  )
}
