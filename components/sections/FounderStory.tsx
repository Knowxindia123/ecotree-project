'use client'
import { useEffect, useRef } from 'react'

export default function FounderStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s14left')?.classList.add('visible')
          document.getElementById('s14right')?.classList.add('visible')
          observer.disconnect()
        }
      })
    }, { threshold: 0.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s14" ref={sectionRef} aria-label="Founder story">
      <div className="s14__container">

        {/* LEFT */}
        <div className="s14__left" id="s14left">
          <div className="founder-ring">
            <div className="founder-photo" role="img" aria-label="Bhimsen, Founder of EcoTree">
              <span className="founder-initials">BR</span>
            </div>
          </div>
          <div>
            <div className="founder-name">Bhimsen</div>
            <div className="founder-title">Founder &amp; CEO, EcoTree<br/>Knowx Innovations · Bangalore</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="s14__right" id="s14right">
          <span className="s14__eyebrow">The story behind EcoTree</span>

          <div className="s14__quote-wrap">
            <h2 className="s14__h2">&ldquo;Every tree deserves to be remembered.&rdquo;</h2>
            <div className="s14__quote-attr">— Bhimsen, Founder</div>
          </div>

          <div className="s14__divider" />

          <div className="s14__message">
            <p className="s14__para">
              I grew up in a farming family in Karnataka. The land wasn&apos;t just where we lived — it was who we were. Trees, soil, water. That connection never left me.
            </p>
            <p className="s14__para">
              Years later, running a tech company in Bangalore, I joined Rotary and started planting trees across the city. Thousands of them. And every single time, the same thing happened — we&apos;d plant, celebrate, and leave. Six months later, nobody knew if even half had survived. No photo. No data. No one responsible.
            </p>
            <p className="s14__para--highlight">That silence bothered me more than anything.</p>
            <p className="s14__para">
              I built EcoTree because every tree we plant is a promise. And a promise deserves proof — a real photo, a GPS pin, a health score, a name. Not just a number on someone&apos;s CSR report.
            </p>
            <p className="s14__closing"><em>Every tree deserves to be remembered.</em></p>
          </div>

          <div className="s14__signature">
            <div className="sig-name">Bhimsen</div>
            <div className="sig-divider" />
            <div className="sig-details">
              <div className="sig-role">Founder &amp; CEO · EcoTree</div>
              <div className="sig-company">Knowx Innovations Pvt Ltd · Bangalore · Est. 2005</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .s14{background:#F0F7EE;padding:40px 0;position:relative;overflow:hidden}
        .s14::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(151,188,98,0.10) 0%,transparent 65%);pointer-events:none}
        .s14__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;display:grid;grid-template-columns:30fr 70fr;gap:2.5rem;align-items:start;position:relative;z-index:1}
        .s14__left{display:flex;flex-direction:column;align-items:center;gap:1rem;text-align:center;padding-top:1rem;opacity:0;transform:translateY(16px)}
        .s14__left.visible{animation:fadeUp 0.65s ease forwards}
        .founder-ring{position:relative;width:108px;height:108px}
        .founder-ring::before{content:'';position:absolute;inset:-3px;border-radius:50%;background:linear-gradient(135deg,var(--clr-moss),var(--clr-primary));z-index:0}
        .founder-ring::after{content:'';position:absolute;inset:-1px;border-radius:50%;background:#F0F7EE;z-index:1}
        .founder-photo{position:relative;z-index:2;width:108px;height:108px;border-radius:50%;background:linear-gradient(135deg,#1E4D2B 0%,#2C5F2D 60%,#3d7a3d 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(44,95,45,0.18)}
        .founder-initials{font-family:var(--font-display);font-size:2rem;font-weight:600;color:rgba(255,255,255,0.92);line-height:1}
        .founder-name{font-family:var(--font-display);font-size:1.15rem;font-weight:600;color:#1A1A1A;line-height:1.2}
        .founder-title{font-size:0.75rem;color:#6B7280;line-height:1.6;margin-top:2px}
        .s14__right{display:flex;flex-direction:column;gap:1.25rem;opacity:0;transform:translateX(16px)}
        .s14__right.visible{animation:slideRight 0.65s ease 0.12s forwards}
        .s14__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.16);border-radius:999px;padding:0.28rem 0.8rem;width:fit-content}
        .s14__quote-wrap{position:relative;padding-left:1.25rem;border-left:3px solid var(--clr-moss)}
        .s14__h2{font-family:var(--font-display);font-size:clamp(1.2rem,2vw,1.6rem);font-weight:300;font-style:italic;color:#1A1A1A;line-height:1.4;letter-spacing:-0.01em}
        .s14__quote-attr{font-size:0.75rem;color:#6B7280;margin-top:0.5rem;font-weight:500}
        .s14__divider{width:40px;height:2px;background:linear-gradient(90deg,var(--clr-moss),transparent);border-radius:999px}
        .s14__message{display:flex;flex-direction:column;gap:1rem}
        .s14__para{font-size:1.075rem;color:#3A3A3A;line-height:1.85;font-weight:400}
        .s14__para--highlight{font-family:var(--font-display);font-size:1.05rem;font-style:italic;color:var(--clr-primary);line-height:1.4}
        .s14__closing{font-family:var(--font-display);font-size:1.05rem;font-style:italic;color:#1A1A1A;line-height:1.4}
        .s14__closing em{color:var(--clr-primary);font-style:normal;font-weight:600}
        .s14__signature{display:flex;align-items:center;gap:1.25rem;padding-top:0.5rem;border-top:1px solid rgba(44,95,45,0.12)}
        .sig-name{font-family:var(--font-signature);font-size:1.65rem;color:var(--clr-primary);line-height:1.2}
        .sig-divider{width:1px;height:40px;background:rgba(0,0,0,0.1);flex-shrink:0}
        .sig-role{font-size:0.75rem;font-weight:600;color:#1A1A1A}
        .sig-company{font-size:0.75rem;color:#6B7280}
        @media(max-width:760px){.s14__container{grid-template-columns:1fr;gap:1.5rem}.s14__left{flex-direction:row;text-align:left;align-items:center;gap:1rem}.founder-ring{flex-shrink:0}}
        @media(max-width:480px){.s14__left{flex-direction:column;text-align:center}.s14__signature{flex-direction:column;align-items:flex-start;gap:0.75rem}.sig-divider{display:none}}
      `}</style>
    </section>
  )
}
