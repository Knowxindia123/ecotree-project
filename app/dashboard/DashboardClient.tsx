"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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

type Layer = "trees" | "waste" | "water";

// Real Bangalore GPS coordinates for mock pins
const TREE_PINS = [
  { id: 1,  species: "Peepal",    lat: 12.9698, lng: 77.7500, zone: "Whitefield",      health: 86, pulse: true  },
  { id: 2,  species: "Neem",      lat: 12.9784, lng: 77.6408, zone: "Indiranagar",     health: 91, pulse: false },
  { id: 3,  species: "Mango",     lat: 13.0350, lng: 77.5970, zone: "Hebbal",          health: 78, pulse: false },
  { id: 4,  species: "Rain Tree", lat: 12.9352, lng: 77.6245, zone: "Koramangala",     health: 82, pulse: false },
  { id: 5,  species: "Banyan",    lat: 12.9900, lng: 77.5560, zone: "Rajajinagar",     health: 94, pulse: false },
  { id: 6,  species: "Jamun",     lat: 12.9063, lng: 77.5857, zone: "JP Nagar",        health: 88, pulse: false },
  { id: 7,  species: "Peepal",    lat: 12.8456, lng: 77.6603, zone: "Electronic City", health: 79, pulse: false },
  { id: 8,  species: "Neem",      lat: 12.9698, lng: 77.7490, zone: "Whitefield",      health: 85, pulse: false },
  { id: 9,  species: "Mango",     lat: 12.9279, lng: 77.6271, zone: "Koramangala",     health: 73, pulse: false },
  { id: 10, species: "Rain Tree", lat: 12.8530, lng: 77.6620, zone: "Electronic City", health: 88, pulse: false },
  { id: 11, species: "Banyan",    lat: 13.0450, lng: 77.5970, zone: "Hebbal",          health: 96, pulse: false },
  { id: 12, species: "Neem",      lat: 12.9784, lng: 77.6390, zone: "Indiranagar",     health: 90, pulse: false },
];

const WASTE_PINS = [
  { id: 1, type: "Plastic",  lat: 12.9698, lng: 77.7490, zone: "Ward 42", kg: 2400, pulse: true  },
  { id: 2, type: "E-Waste",  lat: 12.9784, lng: 77.6400, zone: "Ward 56", kg: 1800, pulse: false },
  { id: 3, type: "Plastic",  lat: 12.9352, lng: 77.6245, zone: "Ward 31", kg: 3100, pulse: false },
  { id: 4, type: "Organic",  lat: 12.9063, lng: 77.5857, zone: "Ward 18", kg: 900,  pulse: false },
  { id: 5, type: "Plastic",  lat: 12.9900, lng: 77.5560, zone: "Ward 72", kg: 1500, pulse: false },
  { id: 6, type: "Paper",    lat: 12.8456, lng: 77.6603, zone: "Ward 08", kg: 2000, pulse: false },
  { id: 7, type: "Plastic",  lat: 12.9279, lng: 77.6271, zone: "Ward 63", kg: 1200, pulse: false },
  { id: 8, type: "E-Waste",  lat: 12.8530, lng: 77.6620, zone: "Ward 90", kg: 700,  pulse: false },
];

const WATER_PINS = [
  { id: 1, name: "Ulsoor Lake",    lat: 12.9825, lng: 77.6196, restored: 42, pulse: true  },
  { id: 2, name: "Hebbal Lake",    lat: 13.0450, lng: 77.5920, restored: 68, pulse: false },
  { id: 3, name: "Agara Lake",     lat: 12.9120, lng: 77.6420, restored: 35, pulse: false },
  { id: 4, name: "Madiwala Lake",  lat: 12.9170, lng: 77.6160, restored: 55, pulse: false },
  { id: 5, name: "Nagawara Lake",  lat: 13.0480, lng: 77.6210, restored: 41, pulse: false },
  { id: 6, name: "Sankey Tank",    lat: 13.0050, lng: 77.5710, restored: 72, pulse: false },
  { id: 7, name: "Bellandur Lake", lat: 12.9270, lng: 77.6780, restored: 28, pulse: false },
];

const SPECIES_EMOJI: Record<string, string> = {
  Peepal: "🌳", Neem: "🌿", Mango: "🥭",
  Banyan: "🌴", "Rain Tree": "🌲", Jamun: "🍇",
};
const SPECIES_COLOR: Record<string, string> = {
  Peepal: "#2C5F2D", Neem: "#40916C", Mango: "#b45309",
  Banyan: "#7c3aed", "Rain Tree": "#1d4ed8", Jamun: "#6d28d9",
};
const WASTE_COLOR: Record<string, string> = {
  Plastic: "#c2410c", "E-Waste": "#92400e", Organic: "#15803d", Paper: "#1d4ed8",
};
const WASTE_EMOJI: Record<string, string> = {
  Plastic: "🗑️", "E-Waste": "♻️", Organic: "🌱", Paper: "📄",
};

const LIVE_STRIP: Record<Layer, string> = {
  trees: "🟢 Live · 12,847 trees verified · 38 planted today · Next refresh: midnight IST",
  waste: "🟠 Live · 48.2T waste diverted · 12 sites active today · Next refresh: midnight IST",
  water: "🔵 Live · 12.4M litres restored · 7 water bodies monitored · Next refresh: midnight IST",
};

const STRIP_COLOR: Record<Layer, string> = {
  trees: "rgba(44,95,45,0.95)",
  waste: "rgba(194,65,12,0.95)",
  water: "rgba(2,132,199,0.95)",
};

export default function DashboardClient() {
  const [layer, setLayer]       = useState<Layer>("trees");
  const [countersRun, setCountersRun] = useState(false);
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [popup, setPopup]       = useState<any>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  // counters
  const trees    = useCounter(impactSummary.trees_total,  1800, countersRun);
  const co2      = useCounter(impactSummary.co2_kg,       2000, countersRun);
  const waste    = useCounter(impactSummary.waste_kg,     1600, countersRun);
  const water    = useCounter(impactSummary.water_litres, 2200, countersRun);
  const partners = useCounter(impactSummary.csr_partners, 1000, countersRun);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCountersRun(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (counterRef.current) obs.observe(counterRef.current);
    return () => obs.disconnect();
  }, []);

  const speciesMax = Math.max(...speciesBreakdown.map(s => s.count));
  const wasteMax   = Math.max(...wasteBreakdown.map(w => w.kg));
  const waterMax   = Math.max(...waterBreakdown.map(w => w.litres));
  const treeGrowthMax = Math.max(...monthlyGrowth.map(m => m.trees));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --clr-primary: #2C5F2D;
          --clr-moss:    #97BC62;
          --clr-dark-bg: #1A3C34;
          --clr-cream:   #F7F5F0;
          --clr-accent:  #52B788;
          --font-display:'Fraunces', Georgia, serif;
          --font-body:   'DM Sans', system-ui, sans-serif;
          --ease-out:    cubic-bezier(0.16,1,0.3,1);
        }
        .db-page { font-family:var(--font-body); background:#fff; overflow-x:hidden; }

        /* ── MAP HEADER (first thing user sees) ── */
        .map-section { background:var(--clr-cream); padding:2rem 0 0;overflow: hidden; }
        .map-header {
          background: var(--clr-dark-bg);
          background-image: radial-gradient(ellipse 70% 100% at 25% 50%, rgba(151,188,98,.07) 0%, transparent 65%);
          border-radius: 16px 16px 0 0;
          padding: 1.5rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
          max-width: 1200px; margin: 0 auto;
        }
        .map-title-block { display:flex; flex-direction:column; gap:6px; }
        .map-eyebrow {
          font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          color:var(--clr-moss); display:flex; align-items:center; gap:.5rem;
        }
        .live-badge {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(74,222,128,.12); border:1px solid rgba(74,222,128,.25);
          border-radius:999px; padding:2px 8px;
          font-size:.6rem; font-weight:600; color:#4ade80;
          text-transform:uppercase; letter-spacing:.06em;
        }
        .live-dot {
          width:6px; height:6px; background:#4ade80; border-radius:50%;
          box-shadow:0 0 5px rgba(74,222,128,.9);
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .map-h1 {
          font-family:var(--font-display);
          font-size:clamp(1.4rem,3vw,2.2rem);
          font-weight:700; color:#fff; line-height:1.2; letter-spacing:-.02em;
        }
        .map-h1 em { font-style:italic; color:var(--clr-moss); }
        .map-h1-sub {
          font-size:.85rem; color:rgba(255,255,255,.5); margin-top:2px;
        }
        .map-header-right { display:flex; flex-direction:column; align-items:flex-end; gap:.75rem; }
        .map-toggles {
          display:flex; align-items:center; gap:.4rem;
          background:rgba(0,0,0,.2); border:1px solid rgba(255,255,255,.08);
          border-radius:999px; padding:4px;
        }
        .toggle-btn {
          display:inline-flex; align-items:center; gap:5px;
          font-family:var(--font-body); font-size:.82rem; font-weight:600;
          color:rgba(255,255,255,.6); background:transparent; border:none;
          border-radius:999px; padding:.4rem .9rem;
          cursor:pointer; transition:all .25s var(--ease-out); white-space:nowrap;
        }
        .toggle-btn:hover{color:rgba(255,255,255,.9);background:rgba(255,255,255,.07);}
        .toggle-btn.active        {color:#fff;background:var(--clr-primary);box-shadow:0 2px 10px rgba(44,95,45,.45);}
        .toggle-btn.active--waste {background:#c2410c;box-shadow:0 2px 10px rgba(194,65,12,.4);}
        .toggle-btn.active--water {background:#0284c7;box-shadow:0 2px 10px rgba(2,132,199,.4);}
        .map-donate-btn {
          display:inline-flex; align-items:center; gap:.4rem;
          background:var(--clr-accent); color:#fff;
          font-family:var(--font-body); font-size:.82rem; font-weight:700;
          padding:.5rem 1.25rem; border-radius:999px; border:none;
          cursor:pointer; text-decoration:none;
          transition:box-shadow .2s,transform .2s;
          white-space:nowrap;
        }
        .map-donate-btn:hover{box-shadow:0 4px 14px rgba(82,183,136,.5);transform:translateY(-1px);}

        /* ── MAPBOX WRAP ── */
        .map-wrap {
          position:relative; height:500px;
          max-width:1200px; margin:0 auto;
          box-shadow:0 20px 60px rgba(0,0,0,.2);
        }
        @media(max-width:768px){.map-wrap{height:380px;}}
        @media(max-width:480px){.map-wrap{height:300px;}}

        /* ── LIVE STATUS STRIP ── */
        .live-strip {
          max-width:1200px; margin:0 auto;
          display:flex; align-items:center; justify-content:center;
          gap:.75rem; padding:.6rem 1.5rem;
          font-size:.72rem; font-weight:600; letter-spacing:.04em;
          color:#fff; border-radius:0 0 16px 16px;
          transition:background .4s var(--ease-out);
        }
        .live-strip-dot {
          width:7px; height:7px; border-radius:50%; background:#4ade80;
          box-shadow:0 0 6px rgba(74,222,128,.9);
          animation:pulse 2s ease-in-out infinite; flex-shrink:0;
        }

        /* ── COUNTER BAR ── */
        .counter-bar {
          background:var(--clr-dark-bg);
          border-top:1px solid rgba(255,255,255,.06);
          padding:2rem 1.5rem;
        }
        .counter-bar__inner {
          max-width:1200px; margin:0 auto;
          display:grid; grid-template-columns:repeat(5,1fr); gap:1rem;
        }
        @media(max-width:900px){.counter-bar__inner{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:560px){.counter-bar__inner{grid-template-columns:repeat(2,1fr);}}
        .counter-card {
          display:flex; flex-direction:column; align-items:center; gap:.35rem;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
          border-radius:14px; padding:1.25rem 1rem; transition:background .2s;
        }
        .counter-card:hover{background:rgba(255,255,255,.07);}
        .counter-card__icon{font-size:1.6rem;line-height:1;}
        .counter-card__val{
          font-family:var(--font-display);
          font-size:clamp(1.4rem,3vw,2rem);
          font-weight:700; color:#fff; line-height:1; letter-spacing:-.02em;
        }
        .counter-card__label{
          font-size:.7rem; font-weight:500; color:rgba(255,255,255,.45);
          letter-spacing:.05em; text-transform:uppercase; text-align:center;
        }
        .counter-card__sub{font-size:.65rem;color:var(--clr-moss);font-weight:500;}

        /* ── SECTIONS ── */
        .db-section{padding:4rem 1.5rem;}
        .db-section--cream{background:var(--clr-cream);}
        .db-section--white{background:#fff;}
        .db-section--dark{background:var(--clr-dark-bg);}
        .db-inner{max-width:1200px;margin:0 auto;}
        .section-eyebrow{
          font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
          color:var(--clr-accent);margin-bottom:.5rem;
        }
        .section-h2{
          font-family:var(--font-display);
          font-size:clamp(1.6rem,3.5vw,2.4rem);
          font-weight:700;color:#1a1a1a;line-height:1.2;letter-spacing:-.015em;margin-bottom:.75rem;
        }
        .section-h2--light{color:#fff;}
        .section-sub{font-size:.95rem;color:#6B7280;line-height:1.6;max-width:560px;margin-bottom:2.5rem;}
        .section-sub--light{color:rgba(255,255,255,.55);}

        /* ── MID PAGE CTA ── */
        .mid-cta {
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 60%,#40916C 100%);
          border-radius:20px; padding:2.5rem 2rem;
          display:flex; align-items:center; justify-content:space-between;
          gap:1.5rem; flex-wrap:wrap; margin-top:2.5rem;
        }
        .mid-cta__text h3{
          font-family:var(--font-display);
          font-size:clamp(1.2rem,2.5vw,1.7rem);
          font-weight:700; color:#fff; letter-spacing:-.01em; margin-bottom:.35rem;
        }
        .mid-cta__text p{font-size:.88rem;color:rgba(255,255,255,.6);line-height:1.5;}
        .mid-cta__btns{display:flex;gap:.75rem;flex-wrap:wrap;}
        .btn-white{
          background:#fff;color:var(--clr-primary);
          font-weight:700;font-size:.88rem;padding:.7rem 1.75rem;
          border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-white:hover{box-shadow:0 6px 20px rgba(0,0,0,.2);transform:translateY(-1px);}
        .btn-outline-white{
          background:transparent;color:#fff;
          font-weight:600;font-size:.88rem;padding:.7rem 1.75rem;
          border-radius:999px;border:2px solid rgba(255,255,255,.4);
          cursor:pointer;text-decoration:none;display:inline-block;
          transition:border-color .2s,background .2s;
        }
        .btn-outline-white:hover{border-color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);}

        /* ── CHARTS ── */
        .charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
        @media(max-width:768px){.charts-grid{grid-template-columns:1fr;}}
        .chart-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:16px;
          padding:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,.05);
        }
        .chart-title{
          font-family:var(--font-display);font-size:1.05rem;font-weight:700;
          color:#1a1a1a;margin-bottom:1.25rem;
        }
        .bar-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem;}
        .bar-label{
          width:90px;font-size:.72rem;font-weight:500;color:#374151;
          flex-shrink:0;display:flex;align-items:center;gap:.3rem;
        }
        .bar-track{flex:1;background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;}
        .bar-fill{height:100%;border-radius:999px;transition:width 1s var(--ease-out);}
        .bar-val{font-size:.7rem;font-weight:600;color:#6B7280;width:62px;text-align:right;flex-shrink:0;}
        .month-bars{display:flex;align-items:flex-end;gap:.75rem;height:140px;}
        .month-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:.35rem;}
        .month-bar{width:100%;border-radius:6px 6px 0 0;min-height:4px;transition:height 1s var(--ease-out);}
        .month-label{font-size:.7rem;color:#6B7280;font-weight:500;}

        /* ── FEED ── */
        .feed-list{display:flex;flex-direction:column;gap:.85rem;}
        .feed-item{
          display:flex;align-items:flex-start;gap:1rem;
          padding:1rem 1.25rem;border-radius:12px;
          background:#fff;border:1px solid #e5e7eb;
          box-shadow:0 1px 6px rgba(0,0,0,.04);transition:box-shadow .2s;
        }
        .feed-item:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
        .feed-icon{
          width:38px;height:38px;border-radius:10px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:1.1rem;
        }
        .feed-icon--tree{background:#d1fae5;}
        .feed-icon--waste{background:#ffedd5;}
        .feed-icon--water{background:#e0f2fe;}
        .feed-text{font-size:.88rem;color:#374151;line-height:1.4;font-weight:500;}
        .feed-meta{font-size:.72rem;color:#9CA3AF;margin-top:.2rem;}

        /* ── CSR ── */
        .csr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;}
        @media(max-width:600px){.csr-grid{grid-template-columns:1fr;}}
        .csr-card{
          border:1px solid #e5e7eb;border-radius:16px;padding:1.5rem;
          text-align:center;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.04);
          transition:box-shadow .2s,transform .2s;
        }
        .csr-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.1);transform:translateY(-2px);}
        .csr-logo{
          width:56px;height:56px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-display);font-size:1.1rem;font-weight:700;
          color:#fff;margin:0 auto 1rem;
        }
        .csr-name{font-weight:600;color:#1a1a1a;font-size:.9rem;margin-bottom:.35rem;}
        .csr-trees{font-size:.8rem;color:var(--clr-accent);font-weight:600;}
        .csr-cta-wrap{text-align:center;margin-top:2rem;}
        .btn-green{
          background:var(--clr-primary);color:#fff;
          font-weight:700;font-size:.9rem;padding:.8rem 2rem;
          border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-green:hover{box-shadow:0 6px 20px rgba(44,95,45,.3);transform:translateY(-1px);}

        /* ── FAQ ── */
        .faq-list{display:flex;flex-direction:column;gap:.75rem;}
        .faq-item{
          border:1px solid rgba(255,255,255,.1);border-radius:12px;
          overflow:hidden;background:rgba(255,255,255,.04);
        }
        .faq-q{
          width:100%;display:flex;align-items:center;justify-content:space-between;
          padding:1.1rem 1.25rem;background:transparent;border:none;
          cursor:pointer;text-align:left;gap:1rem;
          font-family:var(--font-body);font-size:.95rem;font-weight:600;
          color:#fff;transition:background .2s;
        }
        .faq-q:hover{background:rgba(255,255,255,.04);}
        .faq-chevron{font-size:1rem;color:var(--clr-moss);flex-shrink:0;transition:transform .3s;}
        .faq-chevron.open{transform:rotate(180deg);}
        .faq-a{
          font-size:.88rem;color:rgba(255,255,255,.6);line-height:1.65;
          padding:0 1.25rem;max-height:0;overflow:hidden;
          transition:max-height .4s var(--ease-out),padding .3s;
        }
        .faq-a.open{max-height:200px;padding:0 1.25rem 1.1rem;}

        /* ── FINAL CTA ── */
        .cta-strip{
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);
          padding:4rem 1.5rem;text-align:center;
        }
        .cta-strip h2{
          font-family:var(--font-display);
          font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:700;color:#fff;margin-bottom:.75rem;letter-spacing:-.015em;
        }
        .cta-strip p{font-size:.95rem;color:rgba(255,255,255,.65);margin-bottom:2rem;}
        .cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
        .btn-primary{
          background:#fff;color:var(--clr-primary);
          font-weight:700;font-size:.9rem;padding:.8rem 2rem;
          border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-primary:hover{box-shadow:0 6px 20px rgba(0,0,0,.2);transform:translateY(-1px);}
        .btn-outline{
          background:transparent;color:#fff;
          font-weight:600;font-size:.9rem;padding:.8rem 2rem;
          border-radius:999px;border:2px solid rgba(255,255,255,.4);
          cursor:pointer;text-decoration:none;display:inline-block;
          transition:border-color .2s,background .2s;
        }
        .btn-outline:hover{border-color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);}

        /* mapbox popup override */
        .mapboxgl-popup-content{
          background:rgba(5,15,10,.92)!important;
          border:1px solid rgba(151,188,98,.25)!important;
          border-radius:10px!important;padding:10px 14px!important;
          font-family:var(--font-body)!important;color:#fff!important;
          font-size:.78rem!important;min-width:160px;
        }
        .mapboxgl-popup-tip{border-top-color:rgba(5,15,10,.92)!important;}
        .mapboxgl-popup-close-button{color:rgba(255,255,255,.5)!important;font-size:1rem!important;}
        .popup-title{font-weight:700;font-size:.85rem;margin-bottom:4px;color:var(--clr-moss);}
        .popup-row{display:flex;justify-content:space-between;gap:.75rem;font-size:.72rem;color:rgba(255,255,255,.7);margin-top:2px;}

        @media(max-width:768px){
          .map-header{padding:1rem 1.25rem;border-radius:12px 12px 0 0;}
          .map-section{padding:1rem 0 0;}
          .map-header-right{align-items:flex-start;}
        }
        @media(max-width:480px){
          .map-header{flex-direction:column;align-items:flex-start;}
          .map-toggles{width:100%;}
          .toggle-btn{flex:1;justify-content:center;padding:.4rem .5rem;font-size:.75rem;}
        }
      `}</style>

      <main className="db-page">

        {/* ══════════════════════════════════════════
            SECTION 1 — MAP FIRST (hero experience)
        ══════════════════════════════════════════ */}
        <section className="map-section" aria-label="Live environmental impact map">

          {/* Dark header band with H1 + toggles + donate CTA */}
          <div className="map-header">
            <div className="map-title-block">
              <div className="map-eyebrow">
                <span className="live-badge"><span className="live-dot" /> Live</span>
                Updated daily · EcoTree Impact Foundation
              </div>
              <h1 className="map-h1">
                Our <em>live</em> environmental impact
              </h1>
              <p className="map-h1-sub">
                GPS-verified trees, waste drives & water bodies — Bangalore
              </p>
            </div>

            <div className="map-header-right">
              {/* Layer toggle */}
              <div className="map-toggles" role="group" aria-label="Map layer toggle">
                {(["trees","waste","water"] as Layer[]).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLayer(l); setPopup(null); }}
                    className={[
                      "toggle-btn",
                      layer===l ? "active" : "",
                      layer===l && l==="waste" ? "active--waste" : "",
                      layer===l && l==="water" ? "active--water" : "",
                    ].join(" ")}
                  >
                    {l==="trees" ? "🌳 Trees" : l==="waste" ? "♻️ Waste" : "💧 Water"}
                  </button>
                ))}
              </div>
              {/* Donate CTA in header */}
              <a href="/donate" className="map-donate-btn">
                🌱 Plant a Tree — Donate Now
              </a>
            </div>
          </div>

          {/* ── MAPBOX MAP ── */}
          <div className="map-wrap">
            <Map
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              initialViewState={{
                longitude: 77.5946,
                latitude:  12.9716,
                zoom: 11,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
            >
              <NavigationControl position="bottom-right" />

              {/* TREE PINS */}
              {layer === "trees" && TREE_PINS.map(t => (
                <Marker
                  key={`tree-${t.id}`}
                  longitude={t.lng}
                  latitude={t.lat}
                  anchor="bottom"
                  onClick={e => { e.originalEvent.stopPropagation(); setPopup({...t, type:"tree"}); }}
                >
                  <div style={{
                    width: 36, height: 36,
                    background: SPECIES_COLOR[t.species] || "#2C5F2D",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    border: "2.5px solid rgba(255,255,255,.9)",
                    boxShadow: t.pulse ? "0 0 0 8px rgba(44,95,45,.25)" : "0 3px 10px rgba(0,0,0,.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    animation: t.pulse ? "pulse 2s ease-in-out infinite" : "none",
                  }}>
                    <span style={{ transform:"rotate(45deg)", fontSize:16 }}>
                      {SPECIES_EMOJI[t.species]}
                    </span>
                  </div>
                </Marker>
              ))}

              {/* WASTE PINS */}
              {layer === "waste" && WASTE_PINS.map(w => (
                <Marker
                  key={`waste-${w.id}`}
                  longitude={w.lng}
                  latitude={w.lat}
                  anchor="bottom"
                  onClick={e => { e.originalEvent.stopPropagation(); setPopup({...w, type:"waste"}); }}
                >
                  <div style={{
                    width: 34, height: 34,
                    background: WASTE_COLOR[w.type] || "#c2410c",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    border: "2.5px solid rgba(255,255,255,.9)",
                    boxShadow: w.pulse ? "0 0 0 8px rgba(194,65,12,.25)" : "0 3px 10px rgba(0,0,0,.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <span style={{ transform:"rotate(45deg)", fontSize:15 }}>
                      {WASTE_EMOJI[w.type]}
                    </span>
                  </div>
                </Marker>
              ))}

              {/* WATER PINS */}
              {layer === "water" && WATER_PINS.map(w => (
                <Marker
                  key={`water-${w.id}`}
                  longitude={w.lng}
                  latitude={w.lat}
                  anchor="bottom"
                  onClick={e => { e.originalEvent.stopPropagation(); setPopup({...w, type:"water"}); }}
                >
                  <div style={{
                    width: 34, height: 34,
                    background: "#0284c7",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    border: "2.5px solid rgba(255,255,255,.9)",
                    boxShadow: w.pulse ? "0 0 0 8px rgba(2,132,199,.25)" : "0 3px 10px rgba(0,0,0,.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <span style={{ transform:"rotate(45deg)", fontSize:15 }}>💧</span>
                  </div>
                </Marker>
              ))}

              {/* POPUP */}
              {popup && (
                <Popup
                  longitude={popup.lng}
                  latitude={popup.lat}
                  anchor="bottom"
                  offset={48}
                  onClose={() => setPopup(null)}
                  closeOnClick={false}
                >
                  {popup.type === "tree" && (
                    <>
                      <div className="popup-title">{SPECIES_EMOJI[popup.species]} {popup.species}</div>
                      <div className="popup-row"><span>Zone</span><span>{popup.zone}</span></div>
                      <div className="popup-row"><span>Health</span><span style={{color:"#4ade80"}}>{popup.health}% 🟢</span></div>
                      <div className="popup-row"><span>GPS</span><span>{popup.lat.toFixed(4)}°N {popup.lng.toFixed(4)}°E</span></div>
                    </>
                  )}
                  {popup.type === "waste" && (
                    <>
                      <div className="popup-title">{WASTE_EMOJI[popup.type === "waste" ? popup.type2 || popup.type : popup.type]} {popup.zone}</div>
                      <div className="popup-row"><span>Type</span><span>{popup.type2 || "Mixed"}</span></div>
                      <div className="popup-row"><span>Diverted</span><span style={{color:"#fb923c"}}>{(popup.kg/1000).toFixed(1)}T</span></div>
                      <div className="popup-row"><span>GPS</span><span>{popup.lat.toFixed(4)}°N {popup.lng.toFixed(4)}°E</span></div>
                    </>
                  )}
                  {popup.type === "water" && (
                    <>
                      <div className="popup-title">💧 {popup.name}</div>
                      <div className="popup-row"><span>Restored</span><span style={{color:"#38bdf8"}}>{popup.restored}%</span></div>
                      <div className="popup-row"><span>Status</span><span>{popup.restored >= 60 ? "🟢 Good" : popup.restored >= 40 ? "🟡 Progress" : "🔴 Needs work"}</span></div>
                      <div className="popup-row"><span>GPS</span><span>{popup.lat.toFixed(4)}°N {popup.lng.toFixed(4)}°E</span></div>
                    </>
                  )}
                </Popup>
              )}
            </Map>
          </div>

          {/* ── LIVE STATUS STRIP — bottom of map ── */}
          <div
            className="live-strip"
            style={{ background: STRIP_COLOR[layer] }}
          >
            <span className="live-strip-dot" />
            <span>{LIVE_STRIP[layer]}</span>
          </div>

        </section>

        {/* ══════════════════════════════════════════
            SECTION 2 — COUNTER BAR (credibility)
        ══════════════════════════════════════════ */}
        <section className="counter-bar" ref={counterRef}>
          <div className="counter-bar__inner">
            {[
              { icon:"🌳", val:formatNum(trees),   label:"Trees Planted",       sub:"↑ 247 this month"   },
              { icon:"🌿", val:formatNum(co2),     label:"CO₂ Offset (kg)",     sub:"ISFR standard · 22kg/tree" },
              { icon:"♻️", val:formatNum(waste),   label:"Waste Recycled (kg)", sub:"↑ 120 kg this week" },
              { icon:"💧", val:formatNum(water),   label:"Water Conserved (L)", sub:"3,785 L per tree/yr" },
              { icon:"🤝", val:String(partners),   label:"CSR Partners",         sub:"across Bangalore"   },
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

        {/* ══════════════════════════════════════════
            SECTION 3 — CHARTS
        ══════════════════════════════════════════ */}
        <section className="db-section db-section--cream">
          <div className="db-inner">
            <p className="section-eyebrow">Data Breakdown</p>
            <h2 className="section-h2">Impact by the numbers</h2>
            <p className="section-sub">Detailed breakdown across trees, waste, and water — updated daily from field reports.</p>

            <div className="charts-grid">
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

              <div className="chart-card">
                <div className="chart-title">📈 Monthly Trees Planted (2026)</div>
                <div className="month-bars">
                  {monthlyGrowth.map(m => (
                    <div key={m.month} className="month-col">
                      <div className="month-bar" style={{
                        height:`${(m.trees/treeGrowthMax)*120}px`,
                        background:"linear-gradient(180deg,#52B788,#1B4332)"
                      }} />
                      <div className="month-label">{m.month}</div>
                      <div className="month-label" style={{color:"#374151",fontWeight:600}}>{m.trees.toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="chart-card">
                <div className="chart-title">💧 Water by Method (Litres)</div>
                {waterBreakdown.map(w => (
                  <div key={w.method} className="bar-row">
                    <div className="bar-label" style={{width:100}}>{w.emoji} {w.method}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:`${(w.litres/waterMax)*100}%`,background:w.color}} />
                    </div>
                    <div className="bar-val">{(w.litres/1_000_000).toFixed(1)}M L</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MID-PAGE CTA ── */}
            <div className="mid-cta">
              <div className="mid-cta__text">
                <h3>Your company's trees could be on this map</h3>
                <p>EcoTree's CSR programme gives your team GPS-verified impact — tracked, reported, and displayed here publicly.</p>
              </div>
              <div className="mid-cta__btns">
                <a href="/donate" className="btn-white">🌱 Donate Now</a>
                <a href="/csr" className="btn-outline-white">🤝 CSR Programme</a>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 4 — ACTIVITY FEED
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            SECTION 5 — CSR PARTNERS
        ══════════════════════════════════════════ */}
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
              <a href="/contact" className="btn-green">Become a CSR Partner →</a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 6 — FAQ
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            SECTION 7 — FINAL CTA
        ══════════════════════════════════════════ */}
        <section className="cta-strip">
          <div className="db-inner">
            <h2>Want your impact tracked here?</h2>
            <p>Plant a tree today — every sapling is GPS-verified and appears on this live map.</p>
            <div className="cta-btns">
              <a href="/donate"  className="btn-primary">🌱 Donate Now</a>
              <a href="/my-tree" className="btn-outline">🌳 View My Trees</a>
              <a href="/contact" className="btn-outline">🤝 CSR Partnership</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
