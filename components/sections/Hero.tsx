'use client'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const healthFillRef = useRef<SVGCircleElement>(null)
  const healthNumRef  = useRef<HTMLSpanElement>(null)
  const co2Ref        = useRef<HTMLSpanElement>(null)
  const forestRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate health ring + counters
    const timer = setTimeout(() => {
      if (healthFillRef.current) healthFillRef.current.style.strokeDashoffset = '19.3'
      animateCount(healthNumRef.current, 86, 1800)
      animateCount(co2Ref.current, 22, 1600)
    }, 800)

    // Build forest silhouettes
    buildForest()

    return () => clearTimeout(timer)
  }, [])

  function animateCount(el: HTMLElement | null, target: number, duration: number) {
    if (!el) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(eased * target).toString()
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  function buildForest() {
    const forest = forestRef.current
    if (!forest) return

    const shapes = [
      (w: number, h: number) => `<svg width="${w}" height="${h}" viewBox="0 0 60 ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="27" y="${h*0.72}" width="6" height="${h*0.28}" rx="2"/><ellipse cx="30" cy="${h*0.52}" rx="22" ry="${h*0.30}"/><ellipse cx="18" cy="${h*0.62}" rx="14" ry="${h*0.22}"/><ellipse cx="42" cy="${h*0.60}" rx="14" ry="${h*0.20}"/><ellipse cx="30" cy="${h*0.36}" rx="16" ry="${h*0.22}"/></svg>`,
      (w: number, h: number) => `<svg width="${w}" height="${h}" viewBox="0 0 50 ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="${h*0.78}" width="6" height="${h*0.22}" rx="2"/><polygon points="25,0 46,${h*0.55} 4,${h*0.55}"/><polygon points="25,${h*0.18} 44,${h*0.65} 6,${h*0.65}"/><polygon points="25,${h*0.35} 43,${h*0.78} 7,${h*0.78}"/></svg>`,
      (w: number, h: number) => `<svg width="${w}" height="${h}" viewBox="0 0 56 ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="${h*0.60}" width="6" height="${h*0.40}" rx="2"/><circle cx="28" cy="${h*0.38}" r="${h*0.38}"/></svg>`,
    ]
    const swayAnims = ['sway1','sway2','sway3','sway4','sway5','sway6']
    const layerColors = ['#07130e','#091a11','#0b2014']
    const layerOpacity = [0.35, 0.50, 0.65]

    const trees = [
      [2,110,55,0,0,9,0],[15,130,60,0,1,10,0.5],[30,120,58,0,2,9.5,0.8],
      [46,140,65,0,1,10,0.3],[62,125,60,0,0,9,1.0],[78,115,55,0,2,10,0.7],
      [93,130,60,0,1,9,0.4],[1,200,80,1,1,8,0.6],[12,220,90,1,0,7.5,0.2],
      [27,210,85,1,2,8,1.1],[43,230,92,1,1,7,1.6],[59,205,84,1,0,9,0.4],
      [75,220,90,1,2,7.5,0.7],[91,200,82,1,1,8,1.4],[0,320,110,2,0,7,0.5],
      [11,350,120,2,1,6.5,0.9],[25,330,112,2,2,7,0.3],[41,360,122,2,0,6,1.0],
      [57,340,115,2,1,7,1.8],[73,320,110,2,2,6.5,0.4],[89,345,118,2,0,7.5,0.8],
    ]

    trees.forEach(([leftPct, height, width, , zLayer, dur, delay], i) => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText = `position:absolute;bottom:0;left:${leftPct}%;width:${width}px;height:${height}px;opacity:${layerOpacity[zLayer]};z-index:${zLayer};transform-origin:bottom center;animation:${swayAnims[i % 6]} ${dur}s ease-in-out ${delay}s infinite;will-change:transform;`
      const color = layerColors[zLayer]
      let svg = shapes[i % 3](width, height)
      svg = svg.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
      wrapper.innerHTML = svg
      forest.appendChild(wrapper)
    })
  }

  return (
    <section className="hero" aria-label="Hero section">
      <div className="hero__forest" ref={forestRef} aria-hidden="true" />
      <div className="hero__after" aria-hidden="true" />

      <div className="hero__container">
        {/* LEFT */}
        <div className="hero__left">
          <span className="hero__eyebrow">
            <span className="hero__eyebrow-dot live-dot" aria-hidden="true" />
            India&apos;s First AI-Verified Tree NGO
          </span>

          <h1 className="hero__h1">
            India&apos;s first NGO where every tree has a <em>GPS address</em>
          </h1>

          <p className="hero__sub">
            Plant trees, manage waste, restore water — and see your impact live. Every rupee verified by AI.
          </p>

          <div className="hero__ctas">
            <a href="/donate" className="btn-hero-primary">
              🌱 Plant a Tree <span className="cta-price">from ₹100</span>
            </a>
            <a href="/dashboard" className="btn-hero-secondary">
              📊 View Live Dashboard →
            </a>
          </div>

          <div className="hero__trust" role="list">
            {[['10,000+','Trees Planted'],['91%','Survival Rate'],['✓','AI Verified'],['3 yrs','Tracking']].map(([val,lbl]) => (
              <div key={lbl} className="trust-item" role="listitem">
                <strong>{val}</strong> {lbl}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Dashboard mockup */}
        <div className="hero__right">
          <div className="mockup-glow">
            <span className="mockup-label">Live Dashboard Preview</span>
            <div className="mockup" role="img" aria-label="My Tree Dashboard mockup">
              <div className="mockup__header">
                <div className="mockup__header-title">
                  <span className="live-dot" aria-hidden="true" />
                  My Tree Dashboard
                </div>
                <span className="mockup__tree-code">SM-BLR-2026-004821</span>
              </div>
              <div className="mockup__map" aria-hidden="true">
                <div className="map-pin map-pin--primary">
                  <div className="map-pin__pulse" style={{width:52,height:52}} />
                  <div className="map-pin__head" style={{width:40,height:40,background:'#2C5F2D'}}>
                    <div className="map-pin__img" style={{fontSize:20,width:32,height:32}}>🌳</div>
                  </div>
                  <div className="map-pin__tail" style={{background:'#2C5F2D',height:9,marginTop:-1}} />
                  <div className="map-pin__shadow" style={{width:10,height:3,borderRadius:'50%',background:'rgba(0,0,0,0.25)'}} />
                </div>
                <div className="map-gps-badge">12.9716° N, 77.5946° E</div>
              </div>
              <div className="mockup__body">
                <div className="mockup__tree-info">
                  <div>
                    <div className="mockup__species-name">Peepal Tree</div>
                    <div className="mockup__species-sci">Ficus religiosa</div>
                    <span className="mockup__species-tag">Native · ₹100</span>
                  </div>
                  <div className="mockup__health">
                    <div className="health-ring">
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle className="health-ring__bg" cx="28" cy="28" r="22"/>
                        <circle ref={healthFillRef} className="health-ring__fill" cx="28" cy="28" r="22"/>
                      </svg>
                      <div className="health-ring__label">
                        <span ref={healthNumRef} className="health-ring__number">0</span>
                        <span className="health-ring__unit">Health</span>
                      </div>
                    </div>
                    <span className="mockup__health-label">Score</span>
                  </div>
                </div>
                <div>
                  <div className="mockup__timeline-label">Photo Timeline</div>
                  <div className="mockup__photos">
                    {[['🌱',"Jan '26",'planted'],['🪴',"Apr '26",'3mo'],['🌿',"Jan '27",'1yr'],['🌳',"Jan '28",'2yr']].map(([icon,date,cls]) => (
                      <div key={date} className={`photo-thumb photo-thumb--${cls}`} style={{position:'relative'}}>
                        <div className="photo-thumb__placeholder">{icon}</div>
                        <div className="photo-thumb__date">{date}</div>
                        {cls==='2yr' && <div className="photo-thumb__ai-badge">AI ✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mockup__stats">
                  <div className="mockup__stat-card">
                    <div className="stat-card__label">CO₂ Offset</div>
                    <div className="stat-card__value"><span ref={co2Ref}>0</span></div>
                    <div className="stat-card__unit">kg / year</div>
                  </div>
                  <div className="mockup__stat-card">
                    <div className="stat-card__label">Age</div>
                    <div className="stat-card__value">2 yrs</div>
                    <div className="stat-card__unit">Planted Jan 2026</div>
                  </div>
                </div>
              </div>
              <div className="mockup__footer">
                <div className="qr-block">
                  <svg className="qr-code" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="10" height="10" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="3" y="3" width="6" height="6" fill="#1a1a1a"/>
                    <rect x="25" y="1" width="10" height="10" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="27" y="3" width="6" height="6" fill="#1a1a1a"/>
                    <rect x="1" y="25" width="10" height="10" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="3" y="27" width="6" height="6" fill="#1a1a1a"/>
                    <rect x="16" y="16" width="5" height="5" fill="#97BC62"/>
                    <rect x="13" y="13" width="9" height="2" fill="#1a1a1a"/><rect x="22" y="13" width="2" height="9" fill="#1a1a1a"/>
                    <rect x="13" y="22" width="2" height="9" fill="#1a1a1a"/><rect x="19" y="28" width="2" height="5" fill="#1a1a1a"/>
                  </svg>
                  <div className="qr-label"><strong>Scan to visit tree</strong>ecotree.org/t/4821</div>
                </div>
                <a href="#" className="mockup__share-btn">↗ Share Forest</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="scroll-label">Scroll</span>
        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
      </div>

      <style>{`
        .hero{position:relative;min-height:100vh;background-color:var(--clr-dark-bg);display:flex;align-items:center;overflow:hidden;padding-top:80px}
        .hero__forest{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;will-change:transform;transform:translateZ(0)}
        .hero__after{position:absolute;top:-10%;left:-5%;width:60%;height:80%;background:radial-gradient(ellipse,rgba(151,188,98,0.07) 0%,transparent 65%);pointer-events:none;z-index:0}
        .hero__container{position:relative;z-index:1;max-width:var(--max-w);width:100%;margin:0 auto;padding:4rem 1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;min-height:calc(100vh - 80px)}
        .hero__left{display:flex;flex-direction:column;gap:1.5rem;animation:fadeUp 0.6s ease 0.1s both}
        .hero__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;background:rgba(151,188,98,0.12);border:1px solid rgba(151,188,98,0.25);border-radius:999px;padding:0.35rem 0.9rem;font-size:0.75rem;font-weight:600;color:var(--clr-moss);letter-spacing:0.06em;text-transform:uppercase;width:fit-content}
        .hero__eyebrow-dot{flex-shrink:0}
        .hero__h1{font-family:var(--font-display);font-size:clamp(2.2rem,3.8vw,3.5rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-0.02em}
        .hero__h1 em{font-style:italic;color:var(--clr-moss)}
        .hero__sub{font-size:1.125rem;color:rgba(255,255,255,0.85);line-height:1.75;max-width:440px}
        .hero__ctas{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
        .btn-hero-primary{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-size:1rem;font-weight:600;color:#fff;background:var(--clr-primary);border:none;border-radius:999px;padding:0.85rem 1.6rem;cursor:pointer;text-decoration:none;box-shadow:0 4px 14px rgba(44,95,45,0.4);transition:all 0.28s ease}
        .btn-hero-primary:hover{background:var(--clr-primary-hover);transform:translateY(-2px);box-shadow:0 8px 28px rgba(44,95,45,0.55)}
        .cta-price{background:rgba(255,255,255,0.2);border-radius:999px;padding:0.15rem 0.5rem;font-size:0.75rem;font-weight:700}
        .btn-hero-secondary{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-size:1rem;font-weight:500;color:rgba(255,255,255,0.92);background:transparent;border:1.5px solid rgba(255,255,255,0.45);border-radius:999px;padding:0.8rem 1.5rem;cursor:pointer;text-decoration:none;transition:all 0.28s ease}
        .btn-hero-secondary:hover{border-color:rgba(255,255,255,0.7);color:#fff;background:rgba(255,255,255,0.06)}
        .hero__trust{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;padding-top:0.5rem}
        .trust-item{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:500;color:rgba(255,255,255,0.88)}
        .trust-item strong{color:var(--clr-moss);font-weight:600}
        .hero__right{display:flex;justify-content:center;align-items:center;animation:fadeUp 0.9s ease 0.35s both}
        .mockup-glow{position:relative}
        .mockup-glow::before{content:'';position:absolute;inset:-40px;background:radial-gradient(ellipse,rgba(44,95,45,0.3) 0%,transparent 70%);pointer-events:none;z-index:0}
        .mockup-label{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--clr-gold);color:#1a1a1a;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(212,168,83,0.4);z-index:2}
        .mockup{position:relative;z-index:1;width:100%;max-width:420px;background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(0,0,0,0.45),0 8px 24px rgba(0,0,0,0.25);overflow:hidden;border:1px solid rgba(255,255,255,0.12)}
        .mockup__header{background:var(--clr-dark-bg);padding:0.75rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(151,188,98,0.15)}
        .mockup__header-title{font-size:0.875rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:0.5rem}
        .mockup__tree-code{font-size:0.65rem;color:var(--clr-moss);font-family:'Courier New',monospace;letter-spacing:0.05em}
        .mockup__map{position:relative;height:160px;background:linear-gradient(135deg,#2d6a4f 0%,#40916c 25%,#52b788 50%,#74c69d 75%,#95d5b2 100%);overflow:hidden}
        .mockup__map::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:24px 24px}
        .map-pin{position:absolute;top:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;z-index:2}
        .map-pin__head{border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);overflow:hidden}
        .map-pin__img{transform:rotate(45deg);display:flex;align-items:center;justify-content:center;border-radius:50%}
        .map-pin__pulse{position:absolute;top:-8px;left:50%;transform:translateX(-50%);border:2px solid rgba(44,95,45,0.5);border-radius:50%;animation:pinPulse 2s ease-out 0.3s infinite}
        .map-gps-badge{position:absolute;bottom:8px;right:10px;background:rgba(0,0,0,0.6);border-radius:6px;padding:3px 7px;font-size:0.58rem;font-family:'Courier New',monospace;color:#4ade80;letter-spacing:0.04em}
        .mockup__body{padding:1rem;display:flex;flex-direction:column;gap:0.75rem;background:#fafafa}
        .mockup__tree-info{display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem}
        .mockup__species-name{font-size:0.875rem;font-weight:600;color:#1a1a1a}
        .mockup__species-sci{font-size:0.75rem;color:#6b7280;font-style:italic;margin-top:1px}
        .mockup__species-tag{display:inline-block;margin-top:4px;font-size:0.58rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--clr-primary);background:rgba(44,95,45,0.08);padding:2px 6px;border-radius:999px}
        .mockup__health{display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0}
        .health-ring{position:relative;width:56px;height:56px}
        .health-ring svg{transform:rotate(-90deg)}
        .health-ring__bg{fill:none;stroke:#e5e7eb;stroke-width:5}
        .health-ring__fill{fill:none;stroke:var(--clr-moss);stroke-width:5;stroke-linecap:round;stroke-dasharray:138.2;stroke-dashoffset:138.2;transition:stroke-dashoffset 1.8s ease}
        .health-ring__label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .health-ring__number{font-size:0.8125rem;font-weight:700;color:var(--clr-primary);line-height:1}
        .health-ring__unit{font-size:0.45rem;color:#6b7280;text-transform:uppercase}
        .mockup__health-label{font-size:0.55rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280}
        .mockup__timeline-label{font-size:0.6rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem}
        .mockup__photos{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem}
        .photo-thumb{position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden}
        .photo-thumb__placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1rem}
        .photo-thumb__date{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.65));padding:6px 3px 2px;font-size:0.5rem;color:rgba(255,255,255,0.9);text-align:center;font-weight:500}
        .photo-thumb__ai-badge{position:absolute;top:2px;right:2px;background:rgba(44,95,45,0.85);border-radius:3px;padding:1px 3px;font-size:0.45rem;color:#a8e06a;font-weight:700}
        .photo-thumb--planted .photo-thumb__placeholder{background:linear-gradient(135deg,#6b8f4e,#8fb05a)}
        .photo-thumb--3mo .photo-thumb__placeholder{background:linear-gradient(135deg,#4a7c3f,#6aab4d)}
        .photo-thumb--1yr .photo-thumb__placeholder{background:linear-gradient(135deg,#2d6a2d,#3d8b3d)}
        .photo-thumb--2yr .photo-thumb__placeholder{background:linear-gradient(135deg,#1a4d1a,#2a6e2a)}
        .mockup__stats{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}
        .mockup__stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:0.5rem 0.75rem}
        .stat-card__label{font-size:0.55rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280}
        .stat-card__value{font-size:1.125rem;font-weight:700;color:var(--clr-primary);line-height:1;margin-top:1px}
        .stat-card__unit{font-size:0.6rem;color:#6b7280}
        .mockup__footer{padding:0.5rem 1rem;background:#fff;border-top:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;gap:0.75rem}
        .qr-block{display:flex;align-items:center;gap:0.5rem}
        .qr-label{font-size:0.58rem;color:#6b7280;line-height:1.4}
        .qr-label strong{display:block;color:#1a1a1a;font-size:0.65rem}
        .mockup__share-btn{display:inline-flex;align-items:center;gap:3px;font-size:0.65rem;font-weight:600;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.18);border-radius:999px;padding:0.25rem 0.6rem;text-decoration:none}
        .hero__scroll{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:0.5rem;animation:fadeUp 0.6s ease 1.5s both}
        .scroll-label{font-size:0.75rem;font-weight:500;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase}
        .scroll-mouse{width:22px;height:34px;border:1.5px solid rgba(255,255,255,0.2);border-radius:999px;display:flex;justify-content:center;padding-top:6px}
        .scroll-wheel{width:3px;height:6px;background:rgba(255,255,255,0.4);border-radius:999px;animation:scrollWheel 1.8s ease-in-out infinite}
        @media(max-width:900px){.hero__container{grid-template-columns:1fr;gap:2.5rem;padding:3rem 1.25rem;text-align:center;align-items:start}.hero__eyebrow,.hero__sub{margin:0 auto}.hero__ctas,.hero__trust{justify-content:center}.hero__right{order:1}.mockup{max-width:320px}}
        @media(max-width:480px){.hero__h1{font-size:2rem}.hero__ctas{flex-direction:column;align-items:stretch}.btn-hero-primary,.btn-hero-secondary{justify-content:center}}
      `}</style>
    </section>
  )
}
