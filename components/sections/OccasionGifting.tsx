'use client'
import { useEffect, useRef, useState } from 'react'

const OCCASIONS = [
  {
    id: 'birthday', label: '🎂 Birthday', accent: '#f472b6', price: '₹100',
    icon: '🌳', occasion: 'Birthday Tree',
    message: '"A tree planted in your name on your special day — growing, breathing, thriving."',
    inputLabel: "Recipient's name", placeholder: 'e.g. Priya Sharma',
    href: '/donate/occasion/birthday',
  },
  {
    id: 'anniversary', label: '💍 Anniversary', accent: '#f59e0b', price: '₹250',
    icon: '🌿', occasion: 'Anniversary Tree',
    message: '"A tree that grows as strong as your love — rooted, lasting, alive."',
    inputLabel: "Couple's names", placeholder: 'e.g. Raj & Meena',
    href: '/donate/occasion/anniversary',
  },
  {
    id: 'memory', label: '🕯 In Memory', accent: '#a78bfa', price: '₹100',
    icon: '🕯', occasion: 'Memorial Tree',
    message: '"A living tribute — their memory grows in the shade of this tree."',
    inputLabel: 'In memory of', placeholder: 'e.g. Ramaiah Gowda',
    href: '/donate/occasion/memory',
  },
  {
    id: 'festival', label: '🎊 Festival', accent: '#fb923c', price: '₹100',
    icon: '🎊', occasion: 'Festival Tree',
    message: '"Celebrate the season with a tree that gives back to the earth every year."',
    inputLabel: 'Gift to', placeholder: 'e.g. The Sharma Family',
    href: '/donate/occasion/festival',
  },
  {
    id: 'baby', label: '👶 New Baby', accent: '#34d399', price: '₹250',
    icon: '👶', occasion: 'Welcome Tree',
    message: '"A tree planted on the day you arrived — growing alongside you for years to come."',
    inputLabel: "Baby's name", placeholder: 'e.g. Arjun Kumar',
    href: '/donate/occasion/baby',
  },
  {
    id: 'corporate', label: '🏢 Corporate', accent: '#38bdf8', price: '₹500',
    icon: '🏢', occasion: 'Corporate Milestone',
    message: '"Marking your milestone with a forest — verified, tracked and ESG-ready."',
    inputLabel: 'Company / team name', placeholder: 'e.g. Infosys Foundation',
    href: '/donate/occasion/corporate',
  },
  {
    id: 'custom', label: '🎁 Custom', accent: '#97BC62', price: '₹100',
    icon: '🎁', occasion: 'Custom Gift Tree',
    message: '"Your words, your tree, your story — personalised and tracked forever."',
    inputLabel: 'Your occasion / name', placeholder: 'e.g. Thank you, Suresh!',
    href: '/donate/occasion/custom',
  },
]

function OccasionCard({ occ }: { occ: typeof OCCASIONS[0] }) {
  const [name, setName] = useState('')
  return (
    <article className="occ-card" aria-label={`${occ.label} tree gift`}>
      <div className="occ-card__accent" style={{ background: `linear-gradient(90deg,${occ.accent},transparent)` }} />
      <div className="occ-cert">
        <div className="occ-cert__top">
          <span className="cert-logo">Eco<span>Tree</span></span>
          <span className="cert-badge">Certificate</span>
        </div>
        <div className="occ-cert__mid">
          <span className="occ-cert__icon">{occ.icon}</span>
          <div>
            <div className="occ-cert__occasion">{occ.occasion}</div>
            <div className="occ-cert__name">{name || "Recipient's Name"}</div>
          </div>
        </div>
        <div className="occ-cert__message">{occ.message}</div>
        <div className="occ-cert__footer">
          <span className="cert-code">ET-BLR-2026-00{4820 + OCCASIONS.findIndex(o => o.id === occ.id)}</span>
          <div className="cert-qr" aria-hidden="true" />
        </div>
      </div>
      <div className="occ-card__body">
        <div className="occ-input-wrap">
          <label className="occ-input-label">{occ.inputLabel}</label>
          <input className="occ-input" type="text" placeholder={occ.placeholder} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <a href={occ.href} className="occ-cta" style={{ background: occ.id === 'corporate' ? '#0369a1' : 'var(--clr-primary)' }}>
          🌱 Plant This Tree <span className="occ-price">{occ.price}</span>
        </a>
      </div>
    </article>
  )
}

export default function OccasionGifting() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)
  const [filter, setFilter] = useState('all')
  const [ready, setReady]   = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s11header')?.classList.add('visible')
          // Small delay then show cards — only fires once
          setTimeout(() => setReady(true), 200)
          observer.disconnect()
        }
      })
    }, { threshold: 0.1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const filtered = filter === 'all' ? OCCASIONS : OCCASIONS.filter(o => o.id === filter)

  return (
    <section className="s11" ref={sectionRef} aria-label="Occasion tree gifting">
      <div className="s11__container">

        <header className="s11__header" id="s11header">
          <span className="s11__eyebrow">🎁 Gift a tree</span>
          <h2 className="s11__h2">Plant a tree. <em>Gift a memory.</em></h2>
          <p className="s11__sub">The most meaningful gift — a tree that grows for years and lives on a personal dashboard.</p>
        </header>

        <div className="s11__tabs" role="tablist">
          <button className={`s11-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {OCCASIONS.map(o => (
            <button key={o.id} role="tab" aria-selected={filter === o.id}
              className={`s11-tab${filter === o.id ? ' active' : ''}`}
              onClick={() => setFilter(o.id)}
            >{o.label}</button>
          ))}
        </div>

        <div className="s11__track-wrap">
          <div className={`s11__track${ready ? ' ready' : ''}`}>
            {filtered.map((occ, i) => (
              <div key={occ.id} className="occ-wrap" style={{ '--i': i } as React.CSSProperties}>
                <OccasionCard occ={occ} />
              </div>
            ))}
          </div>
        </div>

        <p className="s11__note">Certificate sent instantly by email · 80G tax benefit · Tree tracked for 3 years</p>
      </div>

      <style>{`
        .s11{background:#F7F5F0;padding:48px 0 56px;position:relative;overflow:hidden}
        .s11::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(44,95,45,0.06) 0%,transparent 65%);pointer-events:none}
        .s11__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;position:relative;z-index:1}
        .s11__header{text-align:center;margin-bottom:1.75rem;opacity:0;transform:translateY(14px)}
        .s11__header.visible{animation:fadeUp 0.6s ease forwards}
        .s11__eyebrow{display:inline-block;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.16);border-radius:999px;padding:0.28rem 0.8rem;margin-bottom:0.75rem}
        .s11__h2{font-family:var(--font-display);font-size:clamp(1.5rem,2.6vw,2.1rem);font-weight:700;color:#1A1A1A;line-height:1.2;letter-spacing:-0.02em;margin-bottom:0.6rem}
        .s11__h2 em{font-style:italic;color:var(--clr-primary)}
        .s11__sub{font-size:0.9375rem;color:#3D3D3D;line-height:1.75;max-width:440px;margin:0 auto}
        .s11__tabs{display:flex;gap:0.4rem;margin-bottom:1.5rem;overflow-x:auto;padding-bottom:0.25rem;scrollbar-width:none}
        .s11__tabs::-webkit-scrollbar{display:none}
        .s11-tab{font-family:var(--font-body);font-size:0.8125rem;font-weight:500;color:#6B7280;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:999px;padding:0.38rem 0.85rem;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;flex-shrink:0}
        .s11-tab:hover{color:var(--clr-primary);border-color:rgba(44,95,45,0.3)}
        .s11-tab.active{color:#fff;background:var(--clr-primary);border-color:var(--clr-primary);box-shadow:0 2px 10px rgba(44,95,45,0.3)}
        .s11__track-wrap{position:relative}
        .s11__track-wrap::after{content:'';position:absolute;top:0;right:0;bottom:0;width:48px;background:linear-gradient(270deg,#F7F5F0,transparent);pointer-events:none;z-index:2}
        .s11__track{display:flex;gap:1rem;overflow-x:auto;padding:0.25rem 0 0.75rem;scrollbar-width:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
        .s11__track::-webkit-scrollbar{display:none}
        /* Card wrapper — visible by default, animate in only when ready */
        .occ-wrap{flex-shrink:0;scroll-snap-align:start;opacity:1}
        .s11__track.ready .occ-wrap{opacity:0;animation:cardUp 0.45s ease forwards;animation-delay:calc(var(--i) * 60ms)}
        .occ-card{width:232px;background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.07);transition:transform 0.25s ease,box-shadow 0.25s}
        .occ-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.11)}
        .occ-card__accent{height:3px}
        .occ-cert{margin:0.75rem 0.75rem 0;background:#F7F5F0;border-radius:10px;padding:0.65rem;border:1px solid rgba(212,168,83,0.18)}
        .occ-cert__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem}
        .cert-logo{font-family:var(--font-display);font-size:0.68rem;font-weight:700;color:var(--clr-primary)}
        .cert-logo span{color:var(--clr-moss)}
        .cert-badge{font-size:0.48rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--clr-gold);background:rgba(212,168,83,0.1);border:1px solid rgba(212,168,83,0.22);border-radius:999px;padding:1px 5px}
        .occ-cert__mid{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem}
        .occ-cert__icon{font-size:1.25rem;flex-shrink:0}
        .occ-cert__occasion{font-family:var(--font-display);font-size:0.7rem;font-weight:600;color:var(--clr-dark-bg);line-height:1.2}
        .occ-cert__name{font-size:0.65rem;font-style:italic;color:var(--clr-primary);margin-top:1px;min-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
        .occ-cert__message{font-size:0.56rem;color:#9ca3af;line-height:1.5;font-style:italic;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .occ-cert__footer{display:flex;align-items:center;justify-content:space-between;margin-top:0.4rem;padding-top:0.35rem;border-top:1px solid rgba(0,0,0,0.06)}
        .cert-code{font-size:0.46rem;font-family:'Courier New',monospace;color:#d1d5db;letter-spacing:0.04em}
        .cert-qr{width:14px;height:14px;background:repeating-linear-gradient(0deg,#aaa 0px,#aaa 2px,transparent 2px,transparent 4px),repeating-linear-gradient(90deg,#aaa 0px,#aaa 2px,transparent 2px,transparent 4px);border-radius:2px;opacity:0.5}
        .occ-card__body{padding:0.65rem 0.75rem 0.75rem;display:flex;flex-direction:column;gap:0.55rem}
        .occ-input-wrap{display:flex;flex-direction:column;gap:0.2rem}
        .occ-input-label{font-size:0.6rem;font-weight:500;color:#6B7280;letter-spacing:0.04em}
        .occ-input{width:100%;background:#F7F5F0;border:1.5px solid rgba(0,0,0,0.1);border-radius:8px;padding:0.42rem 0.6rem;font-family:var(--font-body);font-size:0.78rem;color:#1A1A1A;outline:none;transition:border-color 0.15s,background 0.15s}
        .occ-input::placeholder{color:#9ca3af}
        .occ-input:focus{border-color:rgba(44,95,45,0.4);background:#fff}
        .occ-cta{display:flex;align-items:center;justify-content:center;gap:0.35rem;font-family:var(--font-body);font-size:0.78rem;font-weight:600;color:#fff;border:none;border-radius:8px;padding:0.55rem;cursor:pointer;text-decoration:none;transition:all 0.22s ease;width:100%;box-shadow:0 2px 8px rgba(44,95,45,0.25)}
        .occ-cta:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(44,95,45,0.4)}
        .occ-price{background:rgba(255,255,255,0.25);border-radius:999px;padding:0.1rem 0.4rem;font-size:0.68rem;font-weight:700}
        .s11__note{text-align:center;margin-top:1.25rem;font-size:0.7rem;color:#9ca3af;letter-spacing:0.04em}
        @media(max-width:600px){
          .s11{padding:36px 0 44px}
          .occ-card{width:200px}
          .s11-tab{padding:0.3rem 0.65rem;font-size:0.72rem}
        }
        @media(max-width:380px){.occ-card{width:178px}}
      `}</style>
    </section>
  )
}
