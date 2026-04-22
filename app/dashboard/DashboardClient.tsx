"use client";
import { useState, useEffect, useRef } from "react";
import {
  impactSummary,
  treeLocations,
  wasteLocations,
  waterLocations,
  speciesBreakdown,
  wasteBreakdown,
  waterBreakdown,
  monthlyGrowth,
  activityFeed,
  csrPartners,
  faqs,
} from "./mockData";

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return n.toLocaleString("en-IN");
  return String(n);
}

function useCounter(target: number, duration = 1800, run: boolean) {
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

// ─── types ────────────────────────────────────────────────────────────────────
type Layer = "trees" | "waste" | "water";

// ─── pin colours per layer ───────────────────────────────────────────────────
const SPECIES_COLORS: Record<string, string> = {
  Peepal: "#2C5F2D", Neem: "#40916C", Mango: "#b45309",
  Banyan: "#7c3aed", "Rain Tree": "#1d4ed8", Jamun: "#6d28d9",
};
const SPECIES_EMOJI: Record<string, string> = {
  Peepal: "🌳", Neem: "🌿", Mango: "🥭",
  Banyan: "🌴", "Rain Tree": "🌲", Jamun: "🍇",
};
const WASTE_COLORS: Record<string, string> = {
  Plastic: "#c2410c", "E-Waste": "#92400e", Organic: "#15803d", Paper: "#1d4ed8",
};
const WASTE_EMOJI: Record<string, string> = {
  Plastic: "🗑", "E-Waste": "♻️", Organic: "🌱", Paper: "📄",
};

export default function DashboardClient() {
  const [layer, setLayer] = useState<Layer>("trees");
  const [heroVisible, setHeroVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // counters
  const trees   = useCounter(impactSummary.trees_total,  1800, heroVisible);
  const co2     = useCounter(impactSummary.co2_kg,       2000, heroVisible);
  const waste   = useCounter(impactSummary.waste_kg,     1600, heroVisible);
  const water   = useCounter(impactSummary.water_litres, 2200, heroVisible);
  const partners= useCounter(impactSummary.csr_partners, 1000, heroVisible);

  useEffect(() => {
    const obs1 = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeroVisible(true); obs1.disconnect(); } },
      { threshold: 0.2 }
    );
    const obs2 = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setMapVisible(true); obs2.disconnect(); } },
      { threshold: 0.15 }
    );
    if (heroRef.current) obs1.observe(heroRef.current);
    if (mapRef.current)  obs2.observe(mapRef.current);
    return () => { obs1.disconnect(); obs2.disconnect(); };
  }, []);

  // map terrain gradient per layer
  const terrainClass = layer === "waste" ? "waste" : layer === "water" ? "water" : "";

  const terrainBg = {
    trees: "linear-gradient(155deg,#1a5c3a 0%,#246b44 10%,#2d7a4f 20%,#3d8f5e 30%,#4da06e 38%,#5eb580 46%,#6ec48e 53%,#80cfa0 60%,#92d8b0 66%,#a5e0bf 72%,#7ab89a 78%,#5c9e7e 84%,#3d8460 90%,#2a6a4a 95%,#1a5035 100%)",
    waste: "linear-gradient(155deg,#292524 0%,#3c2a1a 15%,#4a3320 28%,#5c4025 40%,#7a5430 52%,#9e7040 62%,#b88040 72%,#8a6030 82%,#5c4020 90%,#3a2810 100%)",
    water: "linear-gradient(155deg,#0c2a4a 0%,#0e3a60 15%,#104a78 28%,#1260a0 40%,#1878c8 52%,#3090d8 62%,#48a8e0 72%,#2080b8 82%,#106090 90%,#0a4070 100%)",
  };

  const GPS_LABELS: Record<Layer, string> = {
    trees: "12.9716° N · 77.5946° E · Bangalore",
    waste: "12.9350° N · 77.6245° E · Bangalore",
    water: "12.9500° N · 77.5600° E · Bangalore",
  };

  const SIDEBAR: Record<Layer, { total: string; totalLabel: string; today: string; todayLabel: string; sub: string; last: string }> = {
    trees: { total: "12,847", totalLabel: "Trees Planted", today: "38",  todayLabel: "Verified Today",       sub: "AI checks complete", last: "2 min ago"  },
    waste: { total: "48.2T",  totalLabel: "Waste Diverted", today: "12",  todayLabel: "Sites Active Today",   sub: "sites active today", last: "8 min ago"  },
    water: { total: "12.4M",  totalLabel: "Water Restored", today: "7",   todayLabel: "Sites Monitored Today",sub: "sites monitored",    last: "15 min ago" },
  };

  // chart max values
  const speciesMax = Math.max(...speciesBreakdown.map(s => s.count));
  const wasteMax   = Math.max(...wasteBreakdown.map(w => w.kg));
  const waterMax   = Math.max(...waterBreakdown.map(w => w.litres));
  const growthMax  = Math.max(...monthlyGrowth.map(m => Math.max(m.trees, m.waste * 10, m.water / 10000)));

  return (
    <>
      <style>{`
        :root {
          --clr-primary:   #2C5F2D;
          --clr-moss:      #97BC62;
          --clr-dark-bg:   #1A3C34;
          --clr-cream:     #F7F5F0;
          --clr-accent:    #52B788;
          --clr-mint:      #D8F3DC;
          --clr-water:     #38BDF8;
          --clr-waste:     #FB923C;
          --font-display:  'Fraunces', Georgia, serif;
          --font-body:     'DM Sans', system-ui, sans-serif;
          --ease-out:      cubic-bezier(0.16,1,0.3,1);
        }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .db-page { font-family: var(--font-body); background: #fff; overflow-x: hidden; }

        /* ── HERO ── */
        .db-hero {
          background: var(--clr-dark-bg);
          background-image: radial-gradient(ellipse 70% 80% at 20% 50%, rgba(82,183,136,.08) 0%, transparent 65%);
          padding: 5rem 1.5rem 4rem;
          text-align: center;
        }
        .db-hero__eyebrow {
          display: inline-flex; align-items: center; gap: .5rem;
          background: rgba(82,183,136,.12); border: 1px solid rgba(82,183,136,.25);
          border-radius: 999px; padding: .25rem .9rem;
          font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: #4ade80; margin-bottom: 1.25rem;
        }
        .live-dot {
          width: 6px; height: 6px; background: #4ade80; border-radius: 50%;
          box-shadow: 0 0 5px rgba(74,222,128,.9);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
        .db-hero__h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem,5vw,3.5rem);
          font-weight: 700; color: #fff;
          line-height: 1.15; letter-spacing: -.02em;
          margin-bottom: 1rem;
        }
        .db-hero__h1 em { font-style: italic; color: var(--clr-moss); }
        .db-hero__sub {
          font-size: 1.05rem; color: rgba(255,255,255,.6);
          max-width: 600px; margin: 0 auto 1.5rem; line-height: 1.6;
        }
        .db-hero__updated {
          font-size: .72rem; color: rgba(255,255,255,.35);
          letter-spacing: .06em; text-transform: uppercase;
        }

        /* ── COUNTER BAR ── */
        .counter-bar {
          background: var(--clr-dark-bg);
          border-top: 1px solid rgba(255,255,255,.06);
          padding: 2rem 1.5rem;
        }
        .counter-bar__inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(5,1fr);
          gap: 1rem;
        }
        @media(max-width:900px){ .counter-bar__inner{ grid-template-columns: repeat(3,1fr); } }
        @media(max-width:560px){ .counter-bar__inner{ grid-template-columns: repeat(2,1fr); } }
        .counter-card {
          display: flex; flex-direction: column; align-items: center; gap: .35rem;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px; padding: 1.25rem 1rem;
          transition: background .2s;
        }
        .counter-card:hover { background: rgba(255,255,255,.07); }
        .counter-card__icon { font-size: 1.6rem; line-height: 1; }
        .counter-card__val {
          font-family: var(--font-display);
          font-size: clamp(1.4rem,3vw,2rem);
          font-weight: 700; color: #fff; line-height: 1;
          letter-spacing: -.02em;
        }
        .counter-card__label {
          font-size: .7rem; font-weight: 500;
          color: rgba(255,255,255,.45);
          letter-spacing: .05em; text-transform: uppercase;
          text-align: center;
        }
        .counter-card__sub {
          font-size: .65rem; color: var(--clr-moss); font-weight: 500;
        }

        /* ── SECTION WRAPPER ── */
        .db-section {
          padding: 4rem 1.5rem;
        }
        .db-section--cream { background: var(--clr-cream); }
        .db-section--white { background: #fff; }
        .db-section--dark  { background: var(--clr-dark-bg); }
        .db-inner { max-width: 1200px; margin: 0 auto; }
        .section-eyebrow {
          font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--clr-accent); margin-bottom: .5rem;
        }
        .section-h2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem,3.5vw,2.4rem);
          font-weight: 700; color: #1a1a1a;
          line-height: 1.2; letter-spacing: -.015em;
          margin-bottom: .75rem;
        }
        .section-h2--light { color: #fff; }
        .section-sub { font-size: .95rem; color: #6B7280; line-height: 1.6; max-width: 560px; margin-bottom: 2.5rem; }
        .section-sub--light { color: rgba(255,255,255,.55); }

        /* ── MAP SECTION ── */
        .map-section { background: var(--clr-cream); padding: 4rem 0; }
        .map-header {
          background: var(--clr-dark-bg);
          background-image: radial-gradient(ellipse 70% 100% at 25% 50%, rgba(151,188,98,.07) 0%, transparent 65%);
          border-radius: 16px 16px 0 0;
          padding: 1.25rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
          max-width: 1200px; margin: 0 auto;
        }
        .map-title-block { display: flex; flex-direction: column; gap: 4px; }
        .map-eyebrow {
          font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: var(--clr-moss); opacity: .8;
          display: flex; align-items: center; gap: .5rem;
        }
        .live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.25);
          border-radius: 999px; padding: 2px 8px;
          font-size: .6rem; font-weight: 600; color: #4ade80;
          text-transform: uppercase; letter-spacing: .06em;
        }
        .map-title {
          font-family: var(--font-display);
          font-size: clamp(1.1rem,2vw,1.6rem);
          font-weight: 700; color: #fff; line-height: 1.2; letter-spacing: -.01em;
        }
        .map-title em { font-style: italic; color: var(--clr-moss); }
        .map-toggles {
          display: flex; align-items: center; gap: .5rem;
          background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.08);
          border-radius: 999px; padding: 4px;
        }
        .toggle-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-body); font-size: .875rem; font-weight: 600;
          color: rgba(255,255,255,.6); background: transparent; border: none;
          border-radius: 999px; padding: .45rem 1rem;
          cursor: pointer; transition: all .25s var(--ease-out); white-space: nowrap;
        }
        .toggle-btn:hover { color: rgba(255,255,255,.9); background: rgba(255,255,255,.07); }
        .toggle-btn.active         { color: #fff; background: var(--clr-primary); box-shadow: 0 2px 10px rgba(44,95,45,.45); }
        .toggle-btn.active--waste  { background: #c2410c; box-shadow: 0 2px 10px rgba(194,65,12,.4); }
        .toggle-btn.active--water  { background: #0284c7; box-shadow: 0 2px 10px rgba(2,132,199,.4); }

        .map-wrap {
          position: relative; height: 420px;
          max-width: 1200px; margin: 0 auto;
          border-radius: 0 0 16px 16px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.10);
        }
        .map-terrain {
          position: absolute; inset: 0;
          transition: background .4s var(--ease-out);
        }
        .map-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);
          background-size: 48px 48px;
        }
        .map-roads {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background:
            linear-gradient(12deg,transparent 28%,rgba(255,255,255,.14) 28%,rgba(255,255,255,.14) 30%,transparent 30%),
            linear-gradient(78deg,transparent 42%,rgba(255,255,255,.11) 42%,rgba(255,255,255,.11) 44%,transparent 44%),
            linear-gradient(145deg,transparent 55%,rgba(255,255,255,.10) 55%,rgba(255,255,255,.10) 57%,transparent 57%),
            linear-gradient(200deg,transparent 62%,rgba(255,255,255,.08) 62%,rgba(255,255,255,.08) 64%,transparent 64%);
        }
        .map-vignette {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: radial-gradient(ellipse 90% 90% at 50% 50%,transparent 50%,rgba(0,0,0,.25) 100%);
        }
        .map-zone {
          position: absolute; z-index: 4; pointer-events: none;
          font-size: .65rem; font-weight: 600; color: rgba(255,255,255,.4);
          letter-spacing: .08em; text-transform: uppercase;
        }
        .map-sidebar {
          position: absolute; top: 20px; left: 20px; z-index: 10;
          background: rgba(10,22,16,.88);
          border: 1px solid rgba(151,188,98,.22);
          border-radius: 16px; padding: 1rem 1.25rem;
          display: flex; flex-direction: column; gap: 1rem;
          min-width: 180px; backdrop-filter: blur(8px);
          animation: sidebarIn .6s var(--ease-out) .3s both;
        }
        @keyframes sidebarIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .sidebar-title {
          font-size: .7rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: var(--clr-moss); border-bottom: 1px solid rgba(151,188,98,.15);
          padding-bottom: .75rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .sidebar-val {
          font-family: var(--font-display);
          font-size: 1.5rem; font-weight: 700; color: #fff;
          line-height: 1; letter-spacing: -.02em;
        }
        .sidebar-label { font-size: .7rem; font-weight: 500; color: rgba(255,255,255,.55); }
        .sidebar-sub   { font-size: .65rem; color: var(--clr-moss); font-weight: 500; }
        .sidebar-divider { height: 1px; background: rgba(255,255,255,.07); }
        .sidebar-last  { font-size: .68rem; color: rgba(255,255,255,.5); font-weight: 500; }
        .sidebar-last strong { color: var(--clr-moss); font-weight: 600; }

        /* pins */
        .pin-layer { position: absolute; inset: 0; z-index: 6; }
        .mpin {
          position: absolute; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center;
          cursor: pointer; animation: pinDrop .55s var(--ease-out) both;
          transition: transform .25s var(--ease-out);
        }
        .mpin:hover { transform: translateX(-50%) translateY(-3px); }
        @keyframes pinDrop {
          0%   { opacity:0; transform:translateX(-50%) translateY(-18px); }
          65%  { opacity:1; transform:translateX(-50%) translateY(3px); }
          82%  { transform:translateX(-50%) translateY(-2px); }
          100% { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        .mpin__head {
          border: 2.5px solid rgba(255,255,255,.9);
          border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 12px rgba(0,0,0,.35); overflow: hidden;
          transition: transform .25s var(--ease-out);
        }
        .mpin:hover .mpin__head { transform: rotate(-45deg) scale(1.15); }
        .mpin__emoji { transform: rotate(45deg); line-height:1; display:flex; align-items:center; justify-content:center; }
        .mpin__tail  { width:2px; margin-top:-1px; opacity:.8; }
        .mpin__shadow{ border-radius:50%; background:rgba(0,0,0,.28); }
        .mpin__tip {
          position:absolute; bottom:calc(100% + 5px); left:50%; transform:translateX(-50%);
          background:rgba(5,15,10,.9); color:#fff;
          font-size:.6rem; font-weight:600; white-space:nowrap;
          padding:4px 8px; border-radius:6px; border:1px solid rgba(151,188,98,.2);
          opacity:0; pointer-events:none; transition:opacity .15s;
        }
        .mpin:hover .mpin__tip { opacity:1; }
        .mpin__pulse {
          position:absolute; top:-8px; left:50%; transform:translateX(-50%);
          border:2px solid rgba(44,95,45,.5); border-radius:50%;
          animation:pinPulse 2.5s ease-out .5s infinite; pointer-events:none;
        }
        @keyframes pinPulse {
          0%   { transform:translateX(-50%) scale(.6); opacity:.85; }
          100% { transform:translateX(-50%) scale(2.5); opacity:0; }
        }
        .map-gps {
          position:absolute; bottom:16px; right:16px; z-index:10;
          background:rgba(5,15,10,.82); border:1px solid rgba(151,188,98,.22);
          border-radius:6px; padding:5px 10px;
          font-size:.62rem; font-family:'Courier New',monospace;
          color:#4ade80; letter-spacing:.04em;
        }
        .map-controls {
          position:absolute; bottom:54px; right:16px; z-index:10;
          display:flex; flex-direction:column;
          background:rgba(10,22,16,.88); border:1px solid rgba(255,255,255,.1);
          border-radius:6px; overflow:hidden;
        }
        .map-ctrl { width:32px; height:32px; display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,.7); font-size:1.1rem; font-weight:700;
          background:transparent; border:none; cursor:default;
          border-bottom:1px solid rgba(255,255,255,.08); }
        .map-ctrl:last-child{border-bottom:none;}

        /* ── CHARTS ── */
        .charts-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
        }
        @media(max-width:768px){ .charts-grid{ grid-template-columns:1fr; } }
        .chart-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;
          padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,.05);
        }
        .chart-title {
          font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
          color: #1a1a1a; margin-bottom: 1.25rem;
        }
        .bar-row {
          display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem;
        }
        .bar-label {
          width: 90px; font-size: .75rem; font-weight: 500; color: #374151;
          flex-shrink: 0; display: flex; align-items: center; gap: .35rem;
        }
        .bar-track { flex: 1; background: #f3f4f6; border-radius: 999px; height: 10px; overflow: hidden; }
        .bar-fill  { height: 100%; border-radius: 999px; transition: width 1s var(--ease-out); }
        .bar-val   { font-size: .72rem; font-weight: 600; color: #6B7280; width: 60px; text-align: right; flex-shrink:0; }

        /* monthly chart */
        .month-bars { display: flex; align-items: flex-end; gap: .75rem; height: 140px; }
        .month-col  { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .35rem; }
        .month-bar  { width: 100%; border-radius: 6px 6px 0 0; transition: height 1s var(--ease-out); min-height: 4px; }
        .month-label{ font-size: .72rem; color: #6B7280; font-weight: 500; }

        /* ── ACTIVITY FEED ── */
        .feed-list { display: flex; flex-direction: column; gap: .85rem; }
        .feed-item {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1rem 1.25rem; border-radius: 12px;
          background: #fff; border: 1px solid #e5e7eb;
          box-shadow: 0 1px 6px rgba(0,0,0,.04);
          transition: box-shadow .2s;
        }
        .feed-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
        .feed-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .feed-icon--tree  { background: #d1fae5; }
        .feed-icon--waste { background: #ffedd5; }
        .feed-icon--water { background: #e0f2fe; }
        .feed-text { font-size: .88rem; color: #374151; line-height: 1.4; font-weight: 500; }
        .feed-meta { font-size: .72rem; color: #9CA3AF; margin-top: .2rem; }

        /* ── CSR PARTNERS ── */
        .csr-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
        @media(max-width:600px){ .csr-grid{ grid-template-columns:1fr; } }
        .csr-card {
          border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem;
          text-align: center; background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,.04);
          transition: box-shadow .2s, transform .2s;
        }
        .csr-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.1); transform: translateY(-2px); }
        .csr-logo {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
          color: #fff; margin: 0 auto 1rem;
        }
        .csr-name  { font-weight: 600; color: #1a1a1a; font-size: .9rem; margin-bottom: .35rem; }
        .csr-trees { font-size: .8rem; color: var(--clr-accent); font-weight: 600; }
        .csr-cta-wrap { text-align: center; margin-top: 2rem; }

        /* ── FAQ ── */
        .faq-list { display: flex; flex-direction: column; gap: .75rem; }
        .faq-item {
          border: 1px solid rgba(255,255,255,.1); border-radius: 12px;
          overflow: hidden; background: rgba(255,255,255,.04);
        }
        .faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.25rem; background: transparent; border: none;
          cursor: pointer; text-align: left; gap: 1rem;
          font-family: var(--font-body); font-size: .95rem; font-weight: 600;
          color: #fff; transition: background .2s;
        }
        .faq-q:hover { background: rgba(255,255,255,.04); }
        .faq-chevron { font-size: 1rem; color: var(--clr-moss); flex-shrink:0; transition: transform .3s; }
        .faq-chevron.open { transform: rotate(180deg); }
        .faq-a {
          font-size: .88rem; color: rgba(255,255,255,.6); line-height: 1.65;
          padding: 0 1.25rem; max-height: 0; overflow: hidden;
          transition: max-height .4s var(--ease-out), padding .3s;
        }
        .faq-a.open { max-height: 200px; padding: 0 1.25rem 1.1rem; }

        /* ── CTA STRIP ── */
        .cta-strip {
          background: linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);
          padding: 4rem 1.5rem; text-align: center;
        }
        .cta-strip h2 {
          font-family: var(--font-display);
          font-size: clamp(1.5rem,3vw,2.2rem);
          font-weight: 700; color: #fff; margin-bottom: .75rem;
          letter-spacing: -.015em;
        }
        .cta-strip p { font-size: .95rem; color: rgba(255,255,255,.65); margin-bottom: 2rem; }
        .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          background: #fff; color: var(--clr-primary);
          font-weight: 700; font-size: .9rem; padding: .8rem 2rem;
          border-radius: 999px; border: none; cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: box-shadow .2s, transform .2s;
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(0,0,0,.2); transform: translateY(-1px); }
        .btn-outline {
          background: transparent; color: #fff;
          font-weight: 600; font-size: .9rem; padding: .8rem 2rem;
          border-radius: 999px; border: 2px solid rgba(255,255,255,.4); cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: border-color .2s, background .2s;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,.8); background: rgba(255,255,255,.08); }

        @media(max-width:768px){
          .map-header{ padding:1rem 1.25rem; border-radius:12px 12px 0 0; }
          .map-wrap{ height:360px; }
          .map-sidebar{ min-width:150px; padding:.75rem 1rem; }
          .sidebar-val{ font-size:1.25rem; }
          .map-section{ padding:3rem 1rem; }
        }
        @media(max-width:480px){
          .map-header{ flex-direction:column; align-items:flex-start; }
          .map-toggles{ width:100%; justify-content:stretch; }
          .toggle-btn{ flex:1; justify-content:center; }
          .map-wrap{ height:300px; }
        }
      `}</style>

      <main className="db-page">

        {/* ── HERO ── */}
        <section className="db-hero" ref={heroRef}>
          <div className="db-hero__eyebrow">
            <span className="live-dot" />
            Updated daily · EcoTree Impact Foundation
          </div>
          <h1 className="db-hero__h1">
            Our <em>live</em> environmental impact
          </h1>
          <p className="db-hero__sub">
            Every number here is a real tree, real litre, real kilogram — GPS-verified
            by our volunteers across Bangalore and growing every day.
          </p>
          <p className="db-hero__updated">Last refreshed: 22 April 2026 · 00:00 IST</p>
        </section>

        {/* ── COUNTER BAR ── */}
        <section className="counter-bar" ref={heroRef}>
          <div className="counter-bar__inner">
            {[
              { icon: "🌳", val: formatNum(trees),   label: "Trees Planted",      sub: "↑ 247 this month" },
              { icon: "🌿", val: formatNum(co2),     label: "CO₂ Offset (kg)",    sub: "ISFR standard" },
              { icon: "♻️", val: formatNum(waste),   label: "Waste Recycled (kg)",sub: "↑ 120 kg this week" },
              { icon: "💧", val: formatNum(water),   label: "Water Conserved (L)",sub: "trees × 3785 L/yr" },
              { icon: "🤝", val: String(partners),   label: "CSR Partners",        sub: "across Bangalore" },
            ].map(c => (
              <div className="counter-card" key={c.label}>
                <span className="counter-card__icon">{c.icon}</span>
                <span className="counter-card__val">{c.val}</span>
                <span className="counter-card__label">{c.label}</span>
                <span className="counter-card__sub">{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MAP SECTION ── */}
        <section className="map-section" ref={mapRef} aria-label="Live impact map">
          {/* header */}
          <div className="map-header">
            <div className="map-title-block">
              <div className="map-eyebrow">
                <span className="live-badge"><span className="live-dot" /> Live</span>
                Updated daily
              </div>
              <h2 className="map-title">See every impact <em>on the map</em></h2>
            </div>
            <div className="map-toggles" role="group" aria-label="Map layer toggle">
              {(["trees","waste","water"] as Layer[]).map(l => (
                <button
                  key={l}
                  className={`toggle-btn${layer===l?" active":""}${layer===l&&l==="waste"?" active--waste":""}${layer===l&&l==="water"?" active--water":""}`}
                  onClick={() => setLayer(l)}
                >
                  {l==="trees"?"🌳 Trees":l==="waste"?"🗑 Waste Sites":"💧 Water Bodies"}
                </button>
              ))}
            </div>
          </div>

          {/* map */}
          <div className="map-wrap">
            <div className="map-terrain" style={{ background: terrainBg[layer] }} />
            <div className="map-grid" />
            <div className="map-roads" />
            <div className="map-vignette" />

            {/* zone labels */}
            {[
              { label:"Whitefield",     style:{top:"8%",left:"6%"}},
              { label:"Indiranagar",    style:{top:"8%",left:"38%"}},
              { label:"Hebbal",         style:{top:"8%",right:"12%"}},
              { label:"Rajajinagar",    style:{top:"44%",left:"6%"}},
              { label:"Koramangala",    style:{bottom:"18%",left:"28%"}},
              { label:"Electronic City",style:{bottom:"10%",right:"10%"}},
            ].map(z => (
              <div key={z.label} className="map-zone" style={z.style as React.CSSProperties}>{z.label}</div>
            ))}

            {/* sidebar */}
            {mapVisible && (
              <div className="map-sidebar">
                <div className="sidebar-title">
                  <span className="live-dot" /> Live Stats
                </div>
                <div>
                  <div className="sidebar-val">{SIDEBAR[layer].total}</div>
                  <div className="sidebar-label">{SIDEBAR[layer].totalLabel}</div>
                  <div className="sidebar-sub">↑ {SIDEBAR[layer].today} this month</div>
                </div>
                <div className="sidebar-divider" />
                <div>
                  <div className="sidebar-val" style={{fontSize:"1.25rem"}}>{SIDEBAR[layer].today}</div>
                  <div className="sidebar-label">{SIDEBAR[layer].todayLabel}</div>
                  <div className="sidebar-sub">{SIDEBAR[layer].sub}</div>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-last">🌱 Last activity <strong>{SIDEBAR[layer].last}</strong></div>
              </div>
            )}

            {/* PINS */}
            <div className="pin-layer">
              {mapVisible && layer === "trees" && treeLocations.map((t,i) => {
                const sz = 32; const color = SPECIES_COLORS[t.species] || "#2C5F2D";
                return (
                  <div key={t.id} className="mpin" style={{left:t.left,top:t.top,animationDelay:`${i*0.08}s`}}>
                    {t.pulse && <div className="mpin__pulse" style={{width:sz+16,height:sz+16}} />}
                    <div className="mpin__tip">{t.species} · Health {t.health_pct}%</div>
                    <div className="mpin__head" style={{width:sz,height:sz,background:color}}>
                      <div className="mpin__emoji" style={{fontSize:Math.round(sz*.55),width:Math.round(sz*.78),height:Math.round(sz*.78)}}>{SPECIES_EMOJI[t.species]}</div>
                    </div>
                    <div className="mpin__tail" style={{height:8,background:color}} />
                    <div className="mpin__shadow" style={{width:Math.round(sz*.28),height:3}} />
                  </div>
                );
              })}
              {mapVisible && layer === "waste" && wasteLocations.map((w,i) => {
                const sz = 30; const color = WASTE_COLORS[w.type] || "#c2410c";
                return (
                  <div key={w.id} className="mpin" style={{left:w.left,top:w.top,animationDelay:`${i*0.08}s`}}>
                    {w.pulse && <div className="mpin__pulse" style={{width:sz+16,height:sz+16}} />}
                    <div className="mpin__tip">{w.zone} · {(w.kg/1000).toFixed(1)}T diverted</div>
                    <div className="mpin__head" style={{width:sz,height:sz,background:color}}>
                      <div className="mpin__emoji" style={{fontSize:Math.round(sz*.55),width:Math.round(sz*.78),height:Math.round(sz*.78)}}>{WASTE_EMOJI[w.type]}</div>
                    </div>
                    <div className="mpin__tail" style={{height:8,background:color}} />
                    <div className="mpin__shadow" style={{width:Math.round(sz*.28),height:3}} />
                  </div>
                );
              })}
              {mapVisible && layer === "water" && waterLocations.map((w,i) => {
                const sz = 30; const color = "#0284c7";
                return (
                  <div key={w.id} className="mpin" style={{left:w.left,top:w.top,animationDelay:`${i*0.08}s`}}>
                    {w.pulse && <div className="mpin__pulse" style={{width:sz+16,height:sz+16}} />}
                    <div className="mpin__tip">{w.name} · {w.restored_pct}% restored</div>
                    <div className="mpin__head" style={{width:sz,height:sz,background:color}}>
                      <div className="mpin__emoji" style={{fontSize:Math.round(sz*.55),width:Math.round(sz*.78),height:Math.round(sz*.78)}}>💧</div>
                    </div>
                    <div className="mpin__tail" style={{height:8,background:color}} />
                    <div className="mpin__shadow" style={{width:Math.round(sz*.28),height:3}} />
                  </div>
                );
              })}
            </div>

            <div className="map-gps">{GPS_LABELS[layer]}</div>
            <div className="map-controls">
              <div className="map-ctrl">+</div>
              <div className="map-ctrl">−</div>
            </div>
          </div>
        </section>

        {/* ── CHARTS ── */}
        <section className="db-section db-section--cream">
          <div className="db-inner">
            <p className="section-eyebrow">Data Breakdown</p>
            <h2 className="section-h2">Impact by the numbers</h2>
            <p className="section-sub">Detailed breakdown across trees, waste, and water — updated daily from field reports.</p>

            <div className="charts-grid">
              {/* species */}
              <div className="chart-card">
                <div className="chart-title">🌳 Trees by Species</div>
                {speciesBreakdown.map(s => (
                  <div key={s.species} className="bar-row">
                    <div className="bar-label">{s.emoji} {s.species}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:`${(s.count/speciesMax)*100}%`,background:s.color}} />
                    </div>
                    <div className="bar-val">{s.count.toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>

              {/* monthly growth */}
              <div className="chart-card">
                <div className="chart-title">📈 Monthly Trees Planted (2026)</div>
                <div className="month-bars">
                  {monthlyGrowth.map(m => (
                    <div key={m.month} className="month-col">
                      <div
                        className="month-bar"
                        style={{
                          height: `${(m.trees/Math.max(...monthlyGrowth.map(x=>x.trees)))*120}px`,
                          background: "linear-gradient(180deg,#52B788,#1B4332)"
                        }}
                      />
                      <div className="month-label">{m.month}</div>
                      <div className="month-label" style={{color:"#374151",fontWeight:600}}>{m.trees.toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* waste */}
              <div className="chart-card">
                <div className="chart-title">♻️ Waste by Category (kg)</div>
                {wasteBreakdown.map(w => (
                  <div key={w.category} className="bar-row">
                    <div className="bar-label">{w.emoji} {w.category}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:`${(w.kg/wasteMax)*100}%`,background:w.color}} />
                    </div>
                    <div className="bar-val">{w.kg.toLocaleString("en-IN")} kg</div>
                  </div>
                ))}
              </div>

              {/* water */}
              <div className="chart-card">
                <div className="chart-title">💧 Water by Method (Litres)</div>
                {waterBreakdown.map(w => (
                  <div key={w.method} className="bar-row">
                    <div className="bar-label" style={{width:110}}>{w.emoji} {w.method}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:`${(w.litres/waterMax)*100}%`,background:w.color}} />
                    </div>
                    <div className="bar-val">{(w.litres/1_000_000).toFixed(1)}M L</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTIVITY FEED ── */}
        <section className="db-section db-section--white">
          <div className="db-inner">
            <p className="section-eyebrow">Field Reports</p>
            <h2 className="section-h2">Recent activity</h2>
            <p className="section-sub">Latest verified actions from our volunteers on the ground across Bangalore.</p>
            <div className="feed-list">
              {activityFeed.map((f,i) => (
                <div key={i} className="feed-item">
                  <div className={`feed-icon feed-icon--${f.type}`}>{f.icon}</div>
                  <div>
                    <div className="feed-text">{f.text}</div>
                    <div className="feed-meta">📍 {f.zone} · {f.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CSR PARTNERS ── */}
        <section className="db-section db-section--cream">
          <div className="db-inner">
            <p className="section-eyebrow">Corporate Impact</p>
            <h2 className="section-h2">CSR partner spotlight</h2>
            <p className="section-sub">Companies partnering with EcoTree to meet their ESG and CSR goals through verified tree plantation.</p>
            <div className="csr-grid">
              {csrPartners.map(p => (
                <div key={p.name} className="csr-card">
                  <div className="csr-logo" style={{background:p.color}}>{p.logo}</div>
                  <div className="csr-name">{p.name}</div>
                  <div className="csr-trees">🌳 {p.trees.toLocaleString("en-IN")} trees planted</div>
                </div>
              ))}
            </div>
            <div className="csr-cta-wrap">
              <a href="/contact" className="btn-primary" style={{background:"var(--clr-primary)",color:"#fff"}}>
                Become a CSR Partner →
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="db-section db-section--dark">
          <div className="db-inner">
            <p className="section-eyebrow" style={{color:"var(--clr-moss)"}}>Common Questions</p>
            <h2 className="section-h2 section-h2--light">Frequently asked questions</h2>
            <p className="section-sub section-sub--light">Everything about how we track, verify, and report our environmental impact.</p>
            <div className="faq-list">
              {faqs.map((f,i) => (
                <div key={i} className="faq-item">
                  <button
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq===i ? null : i)}
                    aria-expanded={openFaq===i}
                  >
                    <span>{f.q}</span>
                    <span className={`faq-chevron${openFaq===i?" open":""}`}>▾</span>
                  </button>
                  <div className={`faq-a${openFaq===i?" open":""}`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA STRIP ── */}
        <section className="cta-strip">
          <div className="db-inner">
            <h2>Want your impact tracked here?</h2>
            <p>Plant a tree today — every sapling is GPS-verified and appears on this dashboard.</p>
            <div className="cta-btns">
              <a href="/donate" className="btn-primary">🌱 Donate Now</a>
              <a href="/contact" className="btn-outline">🤝 CSR Partnership</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
