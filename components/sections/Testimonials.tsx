'use client'
import { useEffect, useRef } from 'react'

const TESTIMONIALS = [
  {
    id: 'donor', type: 'donor', role: '🌱 Donor', initials: 'PS',
    quote: "I planted a tree for my father's birthday. Three months later, I got a photo update — it had grown almost a foot. I showed it to him on video call and he cried. That moment was worth everything.",
    name: 'Priya Sharma', location: 'Bangalore · Planted 3 trees',
  },
  {
    id: 'field', type: 'field', role: '🌿 Field Worker', initials: 'RK',
    quote: "Before EcoTree, we'd plant and never hear anything again. Now every tree I plant has a name, a donor, a dashboard. When I upload the photo and see the AI verify it — I feel the work matters.",
    name: 'Raju Kumar', location: 'Field Team · Whitefield site',
  },
  {
    id: 'csr', type: 'csr', role: '🏢 CSR Partner', initials: 'AK',
    quote: "We've used three different tree planting vendors. EcoTree is the first one where I can open a dashboard, show my board a live survival rate and a verified photo for every single tree. That's what ESG reporting needs.",
    name: 'Anand Krishnan', location: 'CSR Head · Tech Company · Bangalore',
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const triggered  = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          document.getElementById('s15header')?.classList.add('visible')
          TESTIMONIALS.forEach(t => document.getElementById(`tcard-${t.id}`)?.classList.add('visible'))
          observer.disconnect()
        }
      })
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="s15" ref={sectionRef} aria-label="Testimonials">
      <div className="s15__container">
        <header className="s15__header" id="s15header">
          <span className="s15__eyebrow">What people say</span>
          <h2 className="s15__h2">Real people. <em>Real trees. Real proof.</em></h2>
        </header>
        <div className="s15__grid">
          {TESTIMONIALS.map((t, i) => (
            <article key={t.id} id={`tcard-${t.id}`} className={`t-card t-card--${t.type}`} style={{ animationDelay: `${i * 0.12}s` }}>
              <span className={`t-role-tag t-role-tag--${t.type}`}>{t.role}</span>
              <span className="t-quote-mark" aria-hidden="true">&ldquo;</span>
              <blockquote className="t-quote">{t.quote}</blockquote>
              <div className="t-person">
                <div className="t-photo-placeholder" aria-label={`${t.name} photo`}>
                  {/* Replace with <img> in Next.js: src="/images/testimonials/name.jpg" */}
                </div>
                <div className="t-person-info">
                  <div className="t-name">{t.name}</div>
                  <div className="t-location">{t.location}</div>
                </div>
                <div className="t-stars" aria-label="5 stars">★★★★★</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .s15{background:#F7F5F0;padding:40px 0}
        .s15__container{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem}
        .s15__header{text-align:center;margin-bottom:2rem;opacity:0;transform:translateY(12px)}
        .s15__header.visible{animation:fadeUp 0.6s ease forwards}
        .s15__eyebrow{display:inline-block;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--clr-primary);background:rgba(44,95,45,0.08);border:1px solid rgba(44,95,45,0.15);border-radius:999px;padding:0.28rem 0.8rem;margin-bottom:0.75rem}
        .s15__h2{font-family:var(--font-display);font-size:clamp(1.4rem,2.5vw,1.9rem);font-weight:600;color:#1A1A1A;line-height:1.2;letter-spacing:-0.02em}
        .s15__h2 em{font-style:italic;color:var(--clr-primary)}
        .s15__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
        .t-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:22px;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;box-shadow:0 0 0 1px rgba(0,0,0,0.06),0 4px 20px rgba(0,0,0,0.07);position:relative;overflow:hidden;transition:transform 0.25s ease,box-shadow 0.25s;opacity:0;transform:translateY(20px)}
        .t-card.visible{animation:cardUp 0.6s ease forwards}
        .t-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,0.11)}
        .t-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:22px 22px 0 0}
        .t-card--donor::before{background:linear-gradient(90deg,var(--clr-moss),transparent)}
        .t-card--field::before{background:linear-gradient(90deg,var(--clr-gold),transparent)}
        .t-card--csr::before{background:linear-gradient(90deg,#38bdf8,transparent)}
        .t-role-tag{display:inline-flex;align-items:center;gap:4px;font-size:0.62rem;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;padding:3px 8px;border-radius:999px;width:fit-content;border:1px solid}
        .t-role-tag--donor{color:var(--clr-primary);background:rgba(44,95,45,0.08);border-color:rgba(44,95,45,0.16)}
        .t-role-tag--field{color:#92600a;background:rgba(212,168,83,0.1);border-color:rgba(212,168,83,0.22)}
        .t-role-tag--csr{color:#0369a1;background:rgba(56,189,248,0.08);border-color:rgba(56,189,248,0.2)}
        .t-quote-mark{font-family:var(--font-display);font-size:3.5rem;line-height:0.7;color:var(--clr-moss);opacity:0.25;display:block}
        .t-card--field .t-quote-mark{color:var(--clr-gold)}
        .t-card--csr .t-quote-mark{color:#38bdf8}
        .t-quote{font-family:var(--font-display);font-size:1.075rem;font-style:italic;font-weight:400;color:#1A1A1A;line-height:1.8;flex:1}
        .t-person{display:flex;align-items:center;gap:0.75rem;padding-top:0.75rem;border-top:1px solid rgba(0,0,0,0.06)}
        .t-photo-placeholder{width:48px;height:48px;border-radius:50%;flex-shrink:0;border:2px solid rgba(0,0,0,0.06);background:linear-gradient(135deg,#e5e7eb,#d1d5db);position:relative;overflow:hidden}
        .t-photo-placeholder::before{content:'';position:absolute;top:8px;left:50%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:#b0b8c4;z-index:1}
        .t-photo-placeholder::after{content:'';position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:32px;height:32px;border-radius:50% 50% 0 0;background:#b0b8c4}
        .t-person-info{display:flex;flex-direction:column;gap:2px}
        .t-name{font-size:0.875rem;font-weight:600;color:#1A1A1A}
        .t-location{font-size:0.75rem;color:#6B7280}
        .t-stars{margin-left:auto;color:var(--clr-gold);font-size:0.8rem;letter-spacing:1px}
        @media(max-width:860px){.s15__grid{grid-template-columns:1fr;gap:1rem}}
        @media(max-width:480px){.s15__h2{font-size:1.4rem}}
      `}</style>
    </section>
  )
}
