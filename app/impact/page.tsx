"use client";
import { useState, useEffect, useRef } from "react";
import {
  GOALS, currentStats, VIDEOS, milestones,
  pillars, sdgs, impactFacts, faqs,
} from "./mockData";

function useCounter(target: number, duration = 2000, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [run, target, duration]);
  return val;
}

function pct(current: number, goal: number) {
  return Math.min((current / goal) * 100, 100).toFixed(1);
}

type Pillar = "trees" | "waste" | "water";

export default function ImpactClient() {
  const [activePillar, setActivePillar] = useState<Pillar>("trees");
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [countersRun, setCountersRun]   = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  const treesCount = useCounter(currentStats.trees, 2000, countersRun);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCountersRun(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (counterRef.current) obs.observe(counterRef.current);
    return () => obs.disconnect();
  }, []);

  const progressCards = [
    {
      icon: "🌳", label: "Trees Planted",
      current: currentStats.trees.toLocaleString("en-IN"),
      goal: "1,00,000",
      pct: parseFloat(pct(currentStats.trees, GOALS.trees)),
      color: "#2C5F2D", bg: "#d1fae5",
    },
    {
      icon: "♻️", label: "Waste Recycled",
      current: `${(currentStats.waste_kg/1000).toFixed(1)}T`,
      goal: "5,000T",
      pct: parseFloat(pct(currentStats.waste_kg, GOALS.waste_kg)),
      color: "#c2410c", bg: "#ffedd5",
    },
    {
      icon: "💧", label: "Water Conserved",
      current: `${(currentStats.water_litres/10000000).toFixed(1)}Cr L`,
      goal: "50Cr L",
      pct: parseFloat(pct(currentStats.water_litres, GOALS.water_litres)),
      color: "#0284c7", bg: "#e0f2fe",
    },
    {
      icon: "🤝", label: "Volunteers",
      current: currentStats.volunteers.toLocaleString("en-IN"),
      goal: "5,000",
      pct: parseFloat(pct(currentStats.volunteers, GOALS.volunteers)),
      color: "#7c3aed", bg: "#ede9fe",
    },
    {
      icon: "🏢", label: "CSR Partners",
      current: String(currentStats.csr),
      goal: "50",
      pct: parseFloat(pct(currentStats.csr, GOALS.csr)),
      color: "#b45309", bg: "#fef3c7",
    },
  ];

  const videoBoxes = [
    {
      id: "trees",
      eyebrow: "Tree Plantation",
      h3: "Miyawaki forest plantation",
      body: "We plant native species in dense urban clusters using the Miyawaki method — growing 10× faster, 30× denser, and becoming fully self-sustaining within 3 years. Every tree is GPS-tagged and health-monitored monthly.",
      stat: "1,00,000 trees · All of Karnataka",
      cta: "See live tree map →",
      ctaHref: "/dashboard",
      bg: "#F7F5F0",
      videoId: VIDEOS.trees,
      flip: false,
    },
    {
      id: "waste",
      eyebrow: "Waste to Wealth",
      h3: "Plastic that pollutes, now paves",
      body: "Collected plastic is shredded, processed, and blended into bricks, tiles, and road-laying material. What was destined for a landfill becomes durable infrastructure that lasts decades.",
      stat: "5,000 tonnes · Bricks, tiles, roads",
      cta: "Learn about our CSR programme →",
      ctaHref: "/csr",
      bg: "#fff",
      videoId: VIDEOS.waste,
      flip: true,
    },
    {
      id: "water",
      eyebrow: "Water Conservation",
      h3: "Restoring Bangalore's lakes and aquifers",
      body: "Each tree saves 3,785 litres of water per year. Combined with lake restoration, rainwater harvesting pits, and borewell recharge structures, EcoTree's water conservation goal is 50 crore litres by 2028.",
      stat: "50 crore litres · 25+ water bodies",
      cta: "See water impact →",
      ctaHref: "/dashboard",
      bg: "#F7F5F0",
      videoId: VIDEOS.water,
      flip: false,
    },
    {
      id: "skilling",
      eyebrow: "Community & Skilling",
      h3: "Training volunteers, creating green jobs",
      body: "EcoTree trains field volunteers in GPS tagging, species identification, and health monitoring. We partner with colleges and skill development centres to create certified green jobs across Karnataka.",
      stat: "5,000 volunteers · 30 districts",
      cta: "Volunteer with us →",
      ctaHref: "/contact",
      bg: "#fff",
      videoId: VIDEOS.skilling,
      flip: true,
    },
    {
      id: "csr",
      eyebrow: "Corporate Impact",
      h3: "Verified ESG impact for CSR partners",
      body: "Corporate teams join our plantation drives and get GPS-verified impact reports, quarterly certificates, and live dashboard access. Your company's trees appear on our public map — real accountability, real ESG value.",
      stat: "50 CSR partners · Quarterly reports",
      cta: "Start a CSR programme →",
      ctaHref: "/csr",
      bg: "#F7F5F0",
      videoId: VIDEOS.csr,
      flip: false,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600;0,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --clr-primary:  #2C5F2D;
          --clr-moss:     #97BC62;
          --clr-dark-bg:  #1A3C34;
          --clr-cream:    #F7F5F0;
          --clr-accent:   #52B788;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body:    'DM Sans', system-ui, sans-serif;
          --ease-out:     cubic-bezier(0.16,1,0.3,1);
        }
        .ip-page { font-family:var(--font-body); background:#fff; overflow-x:hidden; }

        /* ── S1: HERO ── */
        .ip-hero {
          background: var(--clr-dark-bg);
          background-image:
            radial-gradient(ellipse 60% 80% at 20% 50%, rgba(82,183,136,.08) 0%, transparent 65%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(151,188,98,.05) 0%, transparent 60%);
          padding: 5rem 1.5rem 4rem; text-align: center;
        }
        .ip-hero__eyebrow {
          display:inline-flex; align-items:center; gap:.5rem;
          background:rgba(82,183,136,.12); border:1px solid rgba(82,183,136,.25);
          border-radius:999px; padding:.25rem 1rem;
          font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          color:#4ade80; margin-bottom:1.5rem;
        }
        .live-dot {
          width:6px; height:6px; background:#4ade80; border-radius:50%;
          box-shadow:0 0 5px rgba(74,222,128,.9);
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .ip-hero__h1 {
          font-family:var(--font-display);
          font-size:clamp(2.2rem,5vw,4rem);
          font-weight:700; color:#fff; line-height:1.1;
          letter-spacing:-.025em; margin-bottom:1.25rem;
        }
        .ip-hero__h1 em { font-style:italic; color:var(--clr-moss); }
        .ip-hero__tagline {
          font-size:clamp(1rem,2vw,1.25rem);
          color:rgba(255,255,255,.6); line-height:1.6;
          max-width:700px; margin:0 auto 2rem;
        }
        .ip-hero__tagline strong { color:rgba(255,255,255,.85); font-weight:600; }
        .ip-hero__badge {
          display:inline-flex; align-items:center; gap:.5rem;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          border-radius:999px; padding:.4rem 1rem;
          font-size:.8rem; color:rgba(255,255,255,.5);
        }

        /* ── S2: PROGRESS ── */
        .ip-progress {
          background:var(--clr-dark-bg);
          border-top:1px solid rgba(255,255,255,.06);
          padding:3rem 1.5rem;
        }
        .ip-progress__inner { max-width:1200px; margin:0 auto; }
        .ip-progress__heading {
          font-family:var(--font-display);
          font-size:clamp(1.4rem,2.5vw,2rem);
          font-weight:700; color:#fff; margin-bottom:.5rem; letter-spacing:-.015em;
        }
        .ip-progress__sub { font-size:.88rem; color:rgba(255,255,255,.45); margin-bottom:2rem; }
        .progress-grid {
          display:grid; grid-template-columns:repeat(5,1fr); gap:1rem;
        }
        @media(max-width:900px){.progress-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:560px){.progress-grid{grid-template-columns:repeat(2,1fr);}}
        .progress-card {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
          border-radius:16px; padding:1.25rem 1rem;
          display:flex; flex-direction:column; gap:.5rem;
          transition:background .2s;
        }
        .progress-card:hover{background:rgba(255,255,255,.07);}
        .progress-card__top { display:flex; align-items:center; justify-content:space-between; }
        .progress-card__icon { font-size:1.4rem; }
        .progress-card__pct { font-size:.75rem; font-weight:700; padding:2px 7px; border-radius:999px; }
        .progress-card__current {
          font-family:var(--font-display);
          font-size:clamp(1.2rem,2.5vw,1.6rem);
          font-weight:700; color:#fff; line-height:1; letter-spacing:-.02em;
        }
        .progress-card__label { font-size:.7rem; color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.05em; }
        .progress-card__track { background:rgba(255,255,255,.1); border-radius:999px; height:6px; overflow:hidden; }
        .progress-card__fill  { height:100%; border-radius:999px; transition:width 1.2s var(--ease-out); }
        .progress-card__goal  { font-size:.68rem; color:rgba(255,255,255,.3); }
        .progress-card__goal span { color:rgba(255,255,255,.55); font-weight:600; }

        /* ── SECTION WRAPPER ── */
        .ip-section { padding:5rem 1.5rem; }
        .ip-section--cream { background:var(--clr-cream); }
        .ip-section--white { background:#fff; }
        .ip-section--dark  { background:var(--clr-dark-bg); }
        .ip-inner { max-width:1200px; margin:0 auto; }
        .ip-eyebrow { font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--clr-accent); margin-bottom:.5rem; }
        .ip-eyebrow--light { color:var(--clr-moss); }
        .ip-h2 {
          font-family:var(--font-display);
          font-size:clamp(1.6rem,3.5vw,2.6rem);
          font-weight:700; color:#1a1a1a; line-height:1.2; letter-spacing:-.02em; margin-bottom:.75rem;
        }
        .ip-h2--light { color:#fff; }
        .ip-sub { font-size:.95rem; color:#6B7280; line-height:1.65; max-width:560px; margin-bottom:2.5rem; }
        .ip-sub--light { color:rgba(255,255,255,.55); }

        /* ── S3: VIDEO BOXES ── */
        .video-box {
          display:grid; grid-template-columns:1fr 1fr;
          min-height:500px;
        }
        @media(max-width:768px){ .video-box{ grid-template-columns:1fr; } }
        .video-box--flip .vb-video  { order:2; }
        .video-box--flip .vb-text   { order:1; }
        @media(max-width:768px){
          .video-box--flip .vb-video { order:1; }
          .video-box--flip .vb-text  { order:2; }
        }
        .vb-video {
          position:relative; background:#111;
          min-height:320px;
        }
        .vb-video iframe {
          position:absolute; inset:0; width:100%; height:100%; border:none;
        }
        .vb-placeholder {
          position:absolute; inset:0;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          background:linear-gradient(135deg,#1B4332 0%,#2d6a4f 100%);
          gap:1rem;
        }
        .vb-placeholder__icon { font-size:3rem; opacity:.5; }
        .vb-placeholder__text { font-size:.8rem; color:rgba(255,255,255,.4); font-weight:500; letter-spacing:.06em; text-transform:uppercase; }
        .vb-placeholder__badge {
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
          border-radius:999px; padding:.3rem .85rem;
          font-size:.7rem; color:rgba(255,255,255,.5);
        }
        .vb-text {
          display:flex; flex-direction:column; justify-content:center;
          padding:3.5rem 3rem;
        }
        @media(max-width:768px){ .vb-text{ padding:2.5rem 1.5rem; } }
        .vb-eyebrow { font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--clr-accent); margin-bottom:.6rem; }
        .vb-h3 {
          font-family:var(--font-display);
          font-size:clamp(1.4rem,2.5vw,2rem);
          font-weight:700; color:#1a1a1a; line-height:1.2; letter-spacing:-.015em; margin-bottom:.85rem;
        }
        .vb-body { font-size:.95rem; color:#6B7280; line-height:1.7; margin-bottom:1.25rem; }
        .vb-stat {
          display:inline-flex; align-items:center; gap:.5rem;
          background:var(--clr-cream); border:1px solid #e5e7eb;
          border-radius:999px; padding:.4rem 1rem;
          font-size:.8rem; font-weight:600; color:var(--clr-primary); margin-bottom:1.25rem;
        }
        .vb-cta {
          display:inline-flex; align-items:center; gap:.35rem;
          font-size:.88rem; font-weight:600; color:var(--clr-accent);
          text-decoration:none; transition:gap .2s;
        }
        .vb-cta:hover { gap:.6rem; }

        /* ── S4: TIMELINE ── */
        .timeline-wrap { position:relative; max-width:700px; margin:0 auto; }
        .timeline-spine {
          position:absolute; left:50%; top:0; bottom:0;
          width:2px; background:rgba(255,255,255,.1);
          transform:translateX(-50%);
        }
        .tl-row {
          display:flex; align-items:center; gap:2rem;
          position:relative; margin-bottom:2.5rem;
        }
        .tl-row:last-child { margin-bottom:0; }
        .tl-left  { flex:1; text-align:right; }
        .tl-right { flex:1; }
        .tl-dot-wrap {
          width:40px; height:40px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          z-index:1;
        }
        .tl-dot {
          width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,.3);
          background:var(--clr-dark-bg);
          transition:all .3s;
        }
        .tl-dot--done {
          background:var(--clr-accent);
          border-color:var(--clr-accent);
          box-shadow:0 0 0 6px rgba(82,183,136,.2);
        }
        .tl-dot--goal {
          background:linear-gradient(135deg,#f59e0b,#d97706);
          border-color:#f59e0b;
          box-shadow:0 0 0 8px rgba(245,158,11,.2);
          width:22px; height:22px;
        }
        .tl-quarter { font-size:.8rem; font-weight:700; color:var(--clr-moss); margin-bottom:.25rem; }
        .tl-trees   { font-family:var(--font-display); font-size:1.1rem; font-weight:700; color:#fff; line-height:1.1; }
        .tl-details { font-size:.75rem; color:rgba(255,255,255,.5); margin-top:.2rem; }
        .tl-note    { font-size:.8rem; font-weight:600; color:rgba(255,255,255,.7); }

        /* ── S5: PILLARS ── */
        .pillar-tabs {
          display:flex; gap:.5rem; background:rgba(0,0,0,.08);
          border:1px solid #e5e7eb; border-radius:999px;
          padding:4px; width:fit-content; margin-bottom:2.5rem;
        }
        .pillar-tab {
          font-family:var(--font-body); font-size:.88rem; font-weight:600;
          color:#6B7280; background:transparent; border:none;
          border-radius:999px; padding:.5rem 1.25rem;
          cursor:pointer; transition:all .25s var(--ease-out);
        }
        .pillar-tab.active { color:#fff; background:var(--clr-primary); box-shadow:0 2px 10px rgba(44,95,45,.3); }
        .pillar-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; align-items:start; }
        @media(max-width:768px){ .pillar-grid{ grid-template-columns:1fr; } }
        .pillar-left { display:flex; flex-direction:column; gap:1rem; }
        .pillar-goal-box {
          background:var(--clr-primary); color:#fff;
          border-radius:16px; padding:1.5rem;
        }
        .pillar-goal-label { font-size:.7rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:.5rem; }
        .pillar-goal-text  { font-family:var(--font-display); font-size:1.1rem; font-weight:700; line-height:1.3; }
        .pillar-metric {
          display:inline-flex; align-items:center; gap:.5rem;
          background:var(--clr-cream); border:1px solid #e5e7eb;
          border-radius:999px; padding:.4rem 1rem;
          font-size:.8rem; font-weight:600; color:var(--clr-primary); margin-top:.75rem;
        }
        .pillar-why-box {
          background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:1.5rem;
        }
        .pillar-why-label { font-size:.7rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--clr-accent); margin-bottom:.6rem; }
        .pillar-why-text  { font-size:.9rem; color:#374151; line-height:1.7; }
        .pillar-how-list  { display:flex; flex-direction:column; gap:.6rem; }
        .pillar-how-item  {
          display:flex; align-items:flex-start; gap:.75rem;
          font-size:.88rem; color:#374151; line-height:1.5;
        }
        .pillar-how-dot {
          width:8px; height:8px; border-radius:50%;
          background:var(--clr-accent); flex-shrink:0; margin-top:5px;
        }

        /* ── S6: SDG ── */
        .sdg-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; }
        @media(max-width:900px){ .sdg-grid{ grid-template-columns:repeat(3,1fr); } }
        @media(max-width:560px){ .sdg-grid{ grid-template-columns:repeat(2,1fr); } }
        .sdg-card {
          border-radius:16px; padding:1.25rem 1rem;
          text-align:center; border:1px solid #e5e7eb;
          background:#fff; transition:box-shadow .2s, transform .2s;
        }
        .sdg-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.08); transform:translateY(-2px); }
        .sdg-emoji { font-size:1.8rem; margin-bottom:.5rem; display:block; }
        .sdg-num   { font-family:var(--font-display); font-size:1.1rem; font-weight:700; color:var(--clr-primary); line-height:1; }
        .sdg-title { font-size:.78rem; font-weight:600; color:#374151; margin:.3rem 0 .4rem; }
        .sdg-desc  { font-size:.7rem; color:#9CA3AF; line-height:1.5; }

        /* ── S7: IMPACT FACTS ── */
        .facts-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        @media(max-width:768px){ .facts-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px){ .facts-grid{ grid-template-columns:1fr; } }
        .fact-card {
          border-radius:16px; padding:1.5rem;
          background:#fff; border:1px solid #e5e7eb;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .fact-val {
          font-family:var(--font-display);
          font-size:clamp(1.6rem,3vw,2.2rem);
          font-weight:700; line-height:1; letter-spacing:-.02em;
          margin-bottom:.4rem;
        }
        .fact-label { font-size:.88rem; font-weight:600; color:#374151; margin-bottom:.2rem; }
        .fact-sub   { font-size:.75rem; color:#9CA3AF; }

        /* ── S8: PLEDGE ── */
        .pledge-box {
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 60%,#40916C 100%);
          border-radius:24px; padding:3rem 2.5rem;
          text-align:center; max-width:800px; margin:0 auto;
        }
        .pledge-box h2 {
          font-family:var(--font-display);
          font-size:clamp(1.4rem,2.5vw,2rem);
          font-weight:700; color:#fff; margin-bottom:.75rem; letter-spacing:-.015em;
        }
        .pledge-box p { font-size:.95rem; color:rgba(255,255,255,.6); line-height:1.65; margin-bottom:1.75rem; }
        .pledge-btn {
          display:inline-flex; align-items:center; gap:.5rem;
          background:#fff; color:var(--clr-primary);
          font-weight:700; font-size:.9rem; padding:.8rem 2rem;
          border-radius:999px; border:none; cursor:pointer;
          text-decoration:none; transition:box-shadow .2s, transform .2s;
        }
        .pledge-btn:hover { box-shadow:0 6px 20px rgba(0,0,0,.2); transform:translateY(-1px); }

        /* ── S9: FAQ ── */
        .ip-faq-list { display:flex; flex-direction:column; gap:.75rem; max-width:860px; margin:0 auto; }
        .ip-faq-item { border:1px solid rgba(255,255,255,.1); border-radius:12px; overflow:hidden; background:rgba(255,255,255,.04); }
        .ip-faq-q {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:1.1rem 1.25rem; background:transparent; border:none;
          cursor:pointer; text-align:left; gap:1rem;
          font-family:var(--font-body); font-size:.95rem; font-weight:600;
          color:#fff; transition:background .2s;
        }
        .ip-faq-q:hover { background:rgba(255,255,255,.04); }
        .ip-faq-chevron { font-size:1rem; color:var(--clr-moss); flex-shrink:0; transition:transform .3s; }
        .ip-faq-chevron.open { transform:rotate(180deg); }
        .ip-faq-a {
          font-size:.88rem; color:rgba(255,255,255,.6); line-height:1.65;
          padding:0 1.25rem; max-height:0; overflow:hidden;
          transition:max-height .4s var(--ease-out), padding .3s;
        }
        .ip-faq-a.open { max-height:220px; padding:0 1.25rem 1.1rem; }

        /* ── S10: CTA ── */
        .ip-cta {
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);
          padding:5rem 1.5rem; text-align:center;
        }
        .ip-cta h2 {
          font-family:var(--font-display);
          font-size:clamp(1.8rem,3.5vw,2.8rem);
          font-weight:700; color:#fff; margin-bottom:.75rem; letter-spacing:-.02em;
        }
        .ip-cta p { font-size:1rem; color:rgba(255,255,255,.6); margin-bottom:2.5rem; max-width:560px; margin-left:auto; margin-right:auto; }
        .ip-cta-btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
        .btn-white {
          background:#fff; color:var(--clr-primary); font-weight:700; font-size:.9rem;
          padding:.85rem 2rem; border-radius:999px; border:none; cursor:pointer;
          text-decoration:none; display:inline-block;
          transition:box-shadow .2s, transform .2s;
        }
        .btn-white:hover { box-shadow:0 6px 20px rgba(0,0,0,.2); transform:translateY(-1px); }
        .btn-outline {
          background:transparent; color:#fff; font-weight:600; font-size:.9rem;
          padding:.85rem 2rem; border-radius:999px; border:2px solid rgba(255,255,255,.4);
          cursor:pointer; text-decoration:none; display:inline-block;
          transition:border-color .2s, background .2s;
        }
        .btn-outline:hover { border-color:rgba(255,255,255,.8); background:rgba(255,255,255,.08); }
      `}</style>

      <main className="ip-page">

        {/* ══════════════ S1: HERO ══════════════ */}
        <section className="ip-hero">
          <div className="ip-hero__eyebrow">
            <span className="live-dot" />
            Public commitment · Updated daily
          </div>
          <h1 className="ip-hero__h1">
            Impact Roadmap<br /><em>2026–2028</em>
          </h1>
          <p className="ip-hero__tagline">
            <strong>1,00,000 trees.</strong> <strong>5,000 tonnes</strong> waste recycled.{" "}
            <strong>50 crore litres</strong> water conserved.<br />
            All of Karnataka. By 2028. On record.
          </p>
          <div className="ip-hero__badge">
            🗓️ 2026 → 2028 · GPS-verified · Public accountability
          </div>
        </section>

        {/* ══════════════ S2: PROGRESS ══════════════ */}
        <section className="ip-progress" ref={counterRef}>
          <div className="ip-progress__inner">
            <h2 className="ip-progress__heading">Our 2028 goals — live progress</h2>
            <p className="ip-progress__sub">
              Updated daily from field data · Current vs target · Last updated {currentStats.updated_at}
            </p>
            <div className="progress-grid">
              {progressCards.map(c => (
                <div className="progress-card" key={c.label}>
                  <div className="progress-card__top">
                    <span className="progress-card__icon">{c.icon}</span>
                    <span
                      className="progress-card__pct"
                      style={{background:c.bg, color:c.color}}
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <div className="progress-card__current">{c.current}</div>
                  <div className="progress-card__label">{c.label}</div>
                  <div className="progress-card__track">
                    <div
                      className="progress-card__fill"
                      style={{
                        width: countersRun ? `${c.pct}%` : "0%",
                        background: c.color,
                      }}
                    />
                  </div>
                  <div className="progress-card__goal">
                    Goal: <span>{c.goal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S3: 5 VIDEO BOXES ══════════════ */}
        {videoBoxes.map(box => (
          <div
            key={box.id}
            className={`video-box${box.flip ? " video-box--flip" : ""}`}
            style={{background: box.bg}}
          >
            {/* Video panel */}
            <div className="vb-video">
              {box.videoId.startsWith("YOUTUBE") ? (
                <div className="vb-placeholder">
                  <div className="vb-placeholder__icon">▶</div>
                  <div className="vb-placeholder__text">{box.eyebrow}</div>
                  <div className="vb-placeholder__badge">Video coming soon</div>
                </div>
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${box.videoId}?autoplay=0&rel=0&modestbranding=1`}
                  title={box.h3}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            {/* Text panel */}
            <div className="vb-text">
              <div className="vb-eyebrow">{box.eyebrow}</div>
              <h2 className="vb-h3">{box.h3}</h2>
              <p className="vb-body">{box.body}</p>
              <div className="vb-stat">🎯 {box.stat}</div>
              <a href={box.ctaHref} className="vb-cta">{box.cta}</a>
            </div>
          </div>
        ))}

        {/* ══════════════ S4: TIMELINE ══════════════ */}
        <section className="ip-section ip-section--dark">
          <div className="ip-inner">
            <p className="ip-eyebrow ip-eyebrow--light" style={{textAlign:"center"}}>Milestone Roadmap</p>
            <h2 className="ip-h2 ip-h2--light" style={{textAlign:"center",marginBottom:"3rem"}}>
              Our journey to 1,00,000 trees
            </h2>
            <div className="timeline-wrap">
              <div className="timeline-spine" />
              {milestones.map((m, i) => (
                <div key={i} className="tl-row">
                  <div className="tl-left">
                    <div className="tl-quarter">{m.quarter}</div>
                    <div className="tl-trees">{m.trees} trees</div>
                    <div className="tl-details">{m.waste} waste · {m.water}</div>
                  </div>
                  <div className="tl-dot-wrap">
                    <div className={`tl-dot${m.done?" tl-dot--done":""}${i===milestones.length-1?" tl-dot--goal":""}`} />
                  </div>
                  <div className="tl-right">
                    <div className="tl-note">{m.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S5: PILLARS DEEP DIVE ══════════════ */}
        <section className="ip-section ip-section--cream">
          <div className="ip-inner">
            <p className="ip-eyebrow">Deep Dive</p>
            <h2 className="ip-h2">Three pillars of impact</h2>
            <p className="ip-sub">The goal, the why, and how we're getting there — in each focus area.</p>
            <div className="pillar-tabs">
              {(["trees","waste","water"] as Pillar[]).map(p => (
                <button
                  key={p}
                  className={`pillar-tab${activePillar===p?" active":""}`}
                  onClick={() => setActivePillar(p)}
                >
                  {p==="trees"?"🌳 Trees":p==="waste"?"♻️ Waste":"💧 Water"}
                </button>
              ))}
            </div>
            <div className="pillar-grid">
              <div className="pillar-left">
                <div className="pillar-goal-box">
                  <div className="pillar-goal-label">2028 Goal</div>
                  <div className="pillar-goal-text">{pillars[activePillar].goal}</div>
                  <div className="pillar-metric">📊 {pillars[activePillar].metric}</div>
                </div>
                <div className="pillar-why-box">
                  <div className="pillar-why-label">Why it matters</div>
                  <p className="pillar-why-text">{pillars[activePillar].why}</p>
                </div>
              </div>
              <div>
                <div className="pillar-why-label" style={{marginBottom:"1rem"}}>How we'll do it</div>
                <div className="pillar-how-list">
                  {pillars[activePillar].how.map((h,i) => (
                    <div key={i} className="pillar-how-item">
                      <div className="pillar-how-dot" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ S6: SDG ALIGNMENT ══════════════ */}
        <section className="ip-section ip-section--white">
          <div className="ip-inner">
            <p className="ip-eyebrow">Global Standards</p>
            <h2 className="ip-h2">UN Sustainable Development Goals we support</h2>
            <p className="ip-sub">EcoTree's work is aligned with 5 of the 17 UN SDGs — documented in our annual impact report.</p>
            <div className="sdg-grid">
              {sdgs.map(s => (
                <div key={s.num} className="sdg-card">
                  <span className="sdg-emoji">{s.emoji}</span>
                  <div className="sdg-num" style={{color:s.color}}>SDG {s.num}</div>
                  <div className="sdg-title">{s.title}</div>
                  <div className="sdg-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S7: IMPACT FACTS ══════════════ */}
        <section className="ip-section ip-section--cream">
          <div className="ip-inner">
            <p className="ip-eyebrow">Environmental Science</p>
            <h2 className="ip-h2">Impact by the numbers</h2>
            <p className="ip-sub">The science behind why every tree, every kilogram, and every litre counts.</p>
            <div className="facts-grid">
              {impactFacts.map(f => (
                <div key={f.label} className="fact-card">
                  <div className="fact-val" style={{color:f.color}}>{f.val}</div>
                  <div className="fact-label">{f.label}</div>
                  <div className="fact-sub">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S8: TRANSPARENCY PLEDGE ══════════════ */}
        <section className="ip-section ip-section--white">
          <div className="ip-inner">
            <div className="pledge-box">
              <h2>We publish our numbers every month</h2>
              <p>
                Every tree count, every kilogram of waste, every litre of water — updated daily on our
                live dashboard. No hidden numbers. No estimated impact. GPS-verified data, publicly available.
              </p>
              <a href="/dashboard" className="pledge-btn">
                📊 View Live Dashboard
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════ S9: FAQ ══════════════ */}
        <section className="ip-section ip-section--dark">
          <div className="ip-inner">
            <p className="ip-eyebrow ip-eyebrow--light" style={{textAlign:"center"}}>Common Questions</p>
            <h2 className="ip-h2 ip-h2--light" style={{textAlign:"center",marginBottom:"2.5rem"}}>
              Frequently asked questions
            </h2>
            <div className="ip-faq-list">
              {faqs.map((f,i) => (
                <div key={i} className="ip-faq-item">
                  <button
                    className="ip-faq-q"
                    onClick={() => setOpenFaq(openFaq===i?null:i)}
                    aria-expanded={openFaq===i}
                  >
                    <span>{f.q}</span>
                    <span className={`ip-faq-chevron${openFaq===i?" open":""}`}>▾</span>
                  </button>
                  <div className={`ip-faq-a${openFaq===i?" open":""}`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S10: CTA ══════════════ */}
        <section className="ip-cta">
          <h2>Help us hit our goals</h2>
          <p>
            Every tree you plant, every company that partners, every volunteer who joins —
            moves us closer to a greener Karnataka by 2028.
          </p>
          <div className="ip-cta-btns">
            <a href="/donate"  className="btn-white">🌱 Plant a Tree</a>
            <a href="/csr"     className="btn-outline">🤝 CSR Partnership</a>
            <a href="/contact" className="btn-outline">💚 Volunteer</a>
          </div>
        </section>

      </main>
    </>
  );
}
