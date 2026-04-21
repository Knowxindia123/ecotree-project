'use client'
import { useEffect, useRef, useState } from 'react'

const TABS = [
  {
    id: 'trees', label: '🌳 Trees', color: '#2C5F2D', light: '#97BC62',
    mapBg: 'linear-gradient(135deg,#2d6a4f 0%,#40916c 25%,#52b788 50%,#74c69d 75%,#95d5b2 100%)',
    pins: [
      { top:'28%', left:'38%', label:'Cubbon Park',  count:'1,240 trees' },
      { top:'42%', left:'58%', label:'Whitefield',   count:'860 trees'   },
      { top:'62%', left:'32%', label:'Bannerghatta', count:'2,100 trees' },
      { top:'22%', left:'65%', label:'Hebbal',       count:'540 trees'   },
      { top:'55%', left:'72%', label:'Sarjapur',     count:'390 trees'   },
      { top:'35%', left:'20%', label:'Tumkur Rd',    count:'720 trees'   },
    ],
    card: { stat1:'10,247', lbl1:'Trees planted', stat2:'91%', lbl2:'Survival rate', stat3:'53,900kg', lbl3:'CO₂ offset/yr' },
    leftStats: [{ val:'10K+', lbl:'Trees on map' },{ val:'6', lbl:'Active sites' },{ val:'91%', lbl:'Survival rate' }],
  },
  {
    id: 'waste', label: '♻️ Waste', color: '#C2410C', light: '#FB923C',
    mapBg: 'linear-gradient(135deg,#3d1f0a 0%,#6b3810 25%,#8b5220 50%,#a86828 75%,#c07830 100%)',
    pins: [
      { top:'30%', left:'42%', label:'Koramangala',  count:'8.2T diverted' },
      { top:'50%', left:'60%', label:'Marathahalli', count:'6.5T diverted' },
      { top:'65%', left:'35%', label:'JP Nagar',     count:'9.1T diverted' },
      { top:'25%', left:'62%', label:'Indiranagar',  count:'5.8T diverted' },
      { top:'45%', left:'22%', label:'Rajajinagar',  count:'7.3T diverted' },
      { top:'38%', left:'75%', label:'Bellandur',    count:'11T diverted'  },
    ],
    card: { stat1:'48T', lbl1:'Waste diverted', stat2:'12', lbl2:'Wards active', stat3:'78%', lbl3:'Segregation rate' },
    leftStats: [{ val:'48T', lbl:'Diverted' },{ val:'12', lbl:'Wards active' },{ val:'78%', lbl:'Segregation' }],
  },
  {
    id: 'water', label: '💧 Water', color: '#0369A1', light: '#38BDF8',
    mapBg: 'linear-gradient(135deg,#030c1a 0%,#061828 25%,#0a2840 50%,#0e3a5c 75%,#145280 100%)',
    pins: [
      { top:'32%', left:'40%', label:'Ulsoor Lake',   count:'2.1M litres' },
      { top:'55%', left:'55%', label:'Bellandur',     count:'3.8M litres' },
      { top:'22%', left:'68%', label:'Hebbal Lake',   count:'1.9M litres' },
      { top:'60%', left:'28%', label:'Kanakapura',    count:'1.2M litres' },
      { top:'40%', left:'18%', label:'Sankey Tank',   count:'1.6M litres' },
      { top:'28%', left:'58%', label:'Agara Lake',    count:'1.4M litres' },
    ],
    card: { stat1:'12M', lbl1:'Litres restored', stat2:'7', lbl2:'Lakes active', stat3:'84', lbl3:'Quality score' },
    leftStats: [{ val:'12M', lbl:'Litres restored' },{ val:'7', lbl:'Lakes active' },{ val:'84', lbl:'Quality score' }],
  },
]

export default function DashboardPreview() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  const tab = TABS[active]

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s6left')?.classList.add('visible')
          document.getElementById('s6right')?.classList.add('visible')
          observer.disconnect()
        }
      })
    }, { threshold: 0.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s6" ref={sectionRef} aria-label="Live impact dashboard">
      <div className="s6__container">

        {/* LEFT */}
        <div className="s6__left" id="s6left">
          <span className="s6__eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Live right now
          </span>
          <h2 className="s6__h2">Every impact<br /><em>is monitored.</em></h2>
          <p className="s6__sub">
            Switch between Trees, Waste and Water — every action tracked live across Bangalore.
          </p>

          {/* Left stats — update on tab switch */}
          <div className="s6__stats">
            {tab.leftStats.map((s, i) => (
              <div key={i} className="s6-stat">
                <div className="s6-stat__val" style={{ color: tab.color }}>{s.val}</div>
                <div className="s6-stat__lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <a href="/dashboard" className="s6__cta" style={{ background: tab.color }}>
            📊 View Live Dashboard <span className="s6-arrow">→</span>
          </a>

          <p className="s6__future-note">
            🗺 Mapbox GPS map · Real data · Updates every 30 days
          </p>
        </div>

        {/* RIGHT — Map */}
        <div className="s6__right" id="s6right">

          {/* Tabs */}
          <div className="s6-tabs" role="tablist">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={active === i}
                className={`s6-tab${active === i ? ' active' : ''}`}
                style={active === i ? { background: t.color, borderColor: t.color, color: '#fff' } : {}}
                onClick={() => setActive(i)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Map */}
          <div className="s6-map" style={{ background: tab.mapBg }} role="img" aria-label={`${tab.label} impact map — Bangalore`}>
            {/* Grid overlay */}
            <div className="s6-map__grid" />

            {/* Pins */}
            {tab.pins.map((pin, i) => (
              <div
                key={`${tab.id}-${i}`}
                className="map-pin"
                style={{ top: pin.top, left: pin.left, animationDelay: `${i * 0.15}s` }}
                title={`${pin.label}: ${pin.count}`}
              >
                <div className="map-pin__pulse" style={{ borderColor: tab.light }} />
                <div className="map-pin__head" style={{ background: tab.color }}>
                  <span className="map-pin__emoji">
                    {tab.id === 'trees' ? '🌳' : tab.id === 'waste' ? '♻️' : '💧'}
                  </span>
                </div>
                <div className="map-pin__tip" style={{ background: tab.color }} />
                {/* Tooltip */}
                <div className="map-pin__tooltip">
                  <strong>{pin.label}</strong>
                  <span>{pin.count}</span>
                </div>
              </div>
            ))}

            {/* GPS badge */}
            <div className="s6-map__gps">12.9716° N, 77.5946° E · Bangalore</div>

            {/* Floating dashboard card */}
            <div className="s6-card">
              <div className="s6-card__header" style={{ background: tab.color }}>
                <span className="live-dot" aria-hidden="true" />
                <span>{tab.label} Dashboard</span>
              </div>
              <div className="s6-card__body">
                <div className="s6-card__stat">
                  <div className="s6-card__val" style={{ color: tab.color }}>{tab.card.stat1}</div>
                  <div className="s6-card__lbl">{tab.card.lbl1}</div>
                </div>
                <div className="s6-card__divider" />
                <div className="s6-card__stat">
                  <div className="s6-card__val" style={{ color: tab.color }}>{tab.card.stat2}</div>
                  <div className="s6-card__lbl">{tab.card.lbl2}</div>
                </div>
                <div className="s6-card__divider" />
                <div className="s6-card__stat">
                  <div className="s6-card__val" style={{ color: tab.color }}>{tab.card.stat3}</div>
                  <div className="s6-card__lbl">{tab.card.lbl3}</div>
                </div>
              </div>
              <div className="s6-card__footer">
                <span className="s6-card__verified">✓ AI verified · Updated today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .s6{background:#1A3C34;background-image:radial-gradient(ellipse 60% 80% at 0% 50%,rgba(151,188,98,0.07) 0%,transparent 60%);padding:56px 0;position:relative;overflow:hidden}
        .s6__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;display:grid;grid-template-columns:38fr 62fr;gap:3rem;align-items:center;position:relative;z-index:1}
        .s6__left{display:flex;flex-direction:column;gap:1.25rem;opacity:0;transform:translateX(-18px)}
        .s6__left.visible{animation:slideLeft 0.7s ease forwards}
        .s6__eyebrow{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-moss);background:rgba(151,188,98,0.1);border:1px solid rgba(151,188,98,0.22);border-radius:999px;padding:0.3rem 0.85rem;width:fit-content}
        .s6__h2{font-family:var(--font-display);font-size:clamp(1.65rem,2.8vw,2.35rem);font-weight:700;color:#fff;line-height:1.2;letter-spacing:-0.02em}
        .s6__h2 em{font-style:italic;color:var(--clr-moss)}
        .s6__sub{font-size:1rem;color:rgba(255,255,255,0.68);line-height:1.75;max-width:380px}
        .s6__stats{display:flex;align-items:center;gap:1.5rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1rem 1.25rem}
        .s6-stat{display:flex;flex-direction:column;gap:2px}
        .s6-stat__val{font-family:var(--font-display);font-size:1.375rem;font-weight:700;line-height:1;transition:color 0.3s}
        .s6-stat__lbl{font-size:0.65rem;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.45)}
        .s6__cta{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-body);font-size:1rem;font-weight:600;color:#fff;border:none;border-radius:999px;padding:0.85rem 1.75rem;cursor:pointer;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:all 0.28s ease;width:fit-content}
        .s6__cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
        .s6-arrow{transition:transform 0.28s ease;display:inline-block}
        .s6__cta:hover .s6-arrow{transform:translateX(4px)}
        .s6__future-note{font-size:0.72rem;color:rgba(255,255,255,0.3);letter-spacing:0.03em}
        .s6__right{display:flex;flex-direction:column;gap:0.75rem;opacity:0;transform:translateX(18px)}
        .s6__right.visible{animation:slideRight 0.7s ease 0.15s forwards}
        .s6-tabs{display:flex;gap:0.5rem}
        .s6-tab{font-family:var(--font-body);font-size:0.875rem;font-weight:600;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.12);border-radius:999px;padding:0.45rem 1.1rem;cursor:pointer;transition:all 0.25s ease;white-space:nowrap}
        .s6-tab:hover{color:#fff;background:rgba(255,255,255,0.12)}
        .s6-tab.active{color:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.3)}
        .s6-map{position:relative;height:380px;border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.4);transition:background 0.5s ease}
        .s6-map__grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
        .map-pin{position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;animation:pinDrop 0.5s ease both;z-index:2}
        .map-pin__pulse{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:40px;height:40px;border:1.5px solid;border-radius:50%;animation:pinPulse 2.5s ease-out infinite;opacity:0}
        .map-pin__head{width:32px;height:32px;border:2px solid rgba(255,255,255,0.8);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35)}
        .map-pin__emoji{transform:rotate(45deg);font-size:0.9rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%}
        .map-pin__tip{width:4px;height:8px;border-radius:0 0 2px 2px;margin-top:-1px}
        .map-pin__tooltip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);border-radius:8px;padding:0.35rem 0.6rem;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.2s;backdrop-filter:blur(4px)}
        .map-pin__tooltip strong{display:block;font-size:0.65rem;color:#fff;font-weight:600}
        .map-pin__tooltip span{font-size:0.6rem;color:rgba(255,255,255,0.7)}
        .map-pin:hover .map-pin__tooltip{opacity:1}
        .s6-map__gps{position:absolute;bottom:10px;left:12px;background:rgba(0,0,0,0.6);border-radius:6px;padding:3px 8px;font-size:0.58rem;font-family:'Courier New',monospace;color:#4ade80;letter-spacing:0.04em;backdrop-filter:blur(4px)}
        .s6-card{position:absolute;bottom:14px;right:14px;width:200px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.3)}
        .s6-card__header{padding:0.5rem 0.75rem;display:flex;align-items:center;gap:0.5rem;font-size:0.7rem;font-weight:600;color:#fff}
        .s6-card__body{padding:0.75rem;display:flex;align-items:center;gap:0.5rem;background:#fff}
        .s6-card__stat{display:flex;flex-direction:column;align-items:center;gap:1px;flex:1}
        .s6-card__val{font-family:var(--font-display);font-size:0.95rem;font-weight:700;line-height:1;transition:color 0.3s}
        .s6-card__lbl{font-size:0.5rem;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:center}
        .s6-card__divider{width:1px;height:28px;background:#e5e7eb;flex-shrink:0}
        .s6-card__footer{padding:0.4rem 0.75rem;background:#f8fafc;border-top:1px solid #e5e7eb}
        .s6-card__verified{font-size:0.55rem;font-weight:600;color:var(--clr-primary);letter-spacing:0.04em}
        @media(max-width:900px){.s6__container{grid-template-columns:1fr;gap:2rem}.s6__sub{max-width:100%}.s6-map{height:320px}}
        @media(max-width:480px){.s6-tabs{flex-wrap:wrap}.s6-map{height:280px}.s6-card{width:160px}.s6__h2{font-size:1.65rem}}
      `}</style>
    </section>
  )
}
