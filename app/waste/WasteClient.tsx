"use client";

import { useEffect, useRef, useState } from "react";

/* ── Types ── */
interface Product {
  name: string;
  specs: { label: string; value: string }[];
  image: string;
  accent: string;
}

interface Installation {
  title: string;
  location: string;
  kg: string;
  image: string;
}

interface Client {
  name: string;
  industry: string;
  short: string;
}

/* ── Data ── */
const PRODUCTS: Product[] = [
  {
    name: "Eco Paver",
    specs: [
      { label: "Size", value: "200 × 160 × 40 mm" },
      { label: "Weight", value: "4 kg / piece" },
      { label: "Load bearing", value: "60 Tons" },
    ],
    image: "/images/waste/products/product-eco-paver.jpg",
    accent: "#1a7a45",
  },
  {
    name: "Eco Tiles",
    specs: [
      { label: "Size", value: "300 × 300 × 30 mm" },
      { label: "Weight", value: "3 kg / piece" },
    ],
    image: "/images/waste/products/product-eco-tiles.jpg",
    accent: "#0f5e34",
  },
  {
    name: "Nature Kerb",
    specs: [
      { label: "Size", value: "275 × 200 × 60 mm" },
      { label: "Weight", value: "3 kg / piece" },
    ],
    image: "/images/waste/products/product-nature-kerb.jpg",
    accent: "#166534",
  },
  {
    name: "Grass Paver",
    specs: [
      { label: "Size", value: "275 × 200 × 60 mm" },
      { label: "Weight", value: "Lightweight" },
    ],
    image: "/images/waste/products/product-grass-paver.jpg",
    accent: "#15803d",
  },
  {
    name: "Poly Bricks",
    specs: [
      { label: "Size", value: "300 × 150 × 100 mm" },
      { label: "Weight", value: "5 kg / piece" },
    ],
    image: "/images/waste/products/product-poly-bricks.jpg",
    accent: "#14532d",
  },
];

const INSTALLATIONS: Installation[] = [
  {
    title: "Titan — Chikkaballapur",
    location: "KIADB Industrial Area",
    kg: "13,200",
    image: "/images/waste/works/work-titan-chikkaballapur.jpg",
  },
  {
    title: "Ess Enn Auto CNC Pvt Ltd",
    location: "Basaveshwaranagar, Bangalore",
    kg: "10,125",
    image: "/images/waste/works/work-ess-enn.jpg",
  },
  {
    title: "Hosur SIPCOT Industrial Area",
    location: "In front of Tanishq Jewellery, Hosur",
    kg: "36,080",
    image: "/images/waste/works/work-hosur-sipcot.jpg",
  },
  {
    title: "Titan Watch Division",
    location: "Coimbatore",
    kg: "11,400",
    image: "/images/waste/works/work-titan-coimbatore.jpg",
  },
];

const CLIENTS: Client[] = [
  { name: "Titan Eyewear", industry: "Eyewear Manufacturing", short: "TE" },
  { name: "Shahi Export", industry: "Garment Export", short: "SE" },
  { name: "South Western Railway", industry: "Railways / Govt", short: "SW" },
  { name: "Microtex", industry: "Manufacturing", short: "MT" },
  { name: "Mill Works", industry: "Industrial", short: "MW" },
  { name: "LM Wind Mill", industry: "Wind Energy", short: "LM" },
  { name: "MRPL", industry: "Mangalore Refinery & Petrochemicals", short: "MR" },
  { name: "Sabari Recyclers", industry: "Recycling", short: "SR" },
  { name: "Titan Jewellery", industry: "Jewellery Manufacturing", short: "TJ" },
];

const STATS = [
  { value: 300, suffix: "", unit: "Tons", label: "Plastic Recycled" },
  { value: 70805, suffix: "", unit: "kg", label: "Waste to Infrastructure" },
  { value: 10, suffix: "+", unit: "Product", label: "Variants Made" },
  { value: 1000, suffix: "+", unit: "Trees", label: "Protected" },
  { value: 20, suffix: "+", unit: "Communities", label: "Served" },
];

const COMPARE_ROWS = [
  { label: "Waste collection", others: [true, false, false], us: true },
  { label: "Recycle & manufacture", others: [false, true, false], us: true },
  { label: "Urban infrastructure", others: [false, false, false], us: true },
  { label: "Tree plantation link", others: [false, false, false], us: true },
  { label: "GPS-verified impact", others: [false, false, false], us: true },
  { label: "CSR-ready reporting", others: [false, true, true], us: true },
  { label: "Integrated circular model", others: [false, false, false], us: true },
];

const CSR_BENEFITS = [
  { icon: "📍", title: "GPS-Verified Impact", desc: "Every kg of plastic and every installation tracked with coordinates." },
  { icon: "📊", title: "ESG-Ready Reports", desc: "Annual report-ready data for your sustainability disclosures." },
  { icon: "♻️", title: "Circular Economy", desc: "Closes the loop — your waste becomes public infrastructure." },
  { icon: "🌿", title: "Carbon Reduction Metrics", desc: "Quantified CO₂ offset data for every project." },
  { icon: "🤝", title: "Employee Volunteering", desc: "Engage your teams in plantation and installation drives." },
  { icon: "🏙️", title: "Visible Infrastructure", desc: "Your brand on pathways, parks, and public spaces." },
];

/* ── Counter hook ── */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Intersection observer hook ── */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Stat counter component ── */
function StatCounter({ value, suffix, unit, label, start }: { value: number; suffix: string; unit: string; label: string; start: boolean }) {
  const count = useCounter(value, 2000, start);
  const display = count >= 1000 ? count.toLocaleString("en-IN") : count;
  return (
    <div style={{ textAlign: "center", padding: "0 8px" }}>
      <div style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#4ade80", lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px", fontWeight: 500 }}>{unit}</div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

/* ── Main Component ── */
export default function WasteClient() {
  const statsSection = useInView(0.3);
  const [formData, setFormData] = useState({ company: "", contact: "", industry: "", budget: "", email: "", whatsapp: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", background: "#fff" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        .waste-fade-up { opacity: 0; transform: translateY(24px); animation: fadeUp 0.6s ease forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        .prod-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
        .prod-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }

        .work-card:hover .work-overlay { opacity: 1 !important; }
        .work-card { transition: transform 0.25s ease; }
        .work-card:hover { transform: translateY(-2px); }

        .client-card:hover { border-color: #1a7a45 !important; background: #f0fdf4 !important; }
        .client-card { transition: all 0.2s ease; }

        .cta-btn:hover { background: #15803d !important; transform: translateY(-1px); }
        .cta-btn { transition: all 0.2s ease; }

        .flow-step { animation: fadeUp 0.5s ease forwards; opacity: 0; }

        @media (max-width: 768px) {
          .prod-grid-inner { grid-template-columns: repeat(2, 1fr) !important; }
          .works-grid-inner { grid-template-columns: 1fr 1fr !important; }
          .client-grid-inner { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 24px !important; }
          .compare-table { font-size: 11px !important; }
          .hero-h1 { font-size: clamp(28px, 6vw, 52px) !important; }
          .flow-scroll { overflow-x: auto; padding-bottom: 12px; }
          .csr-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── SECTION 1: HERO ── */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", background: "#0a2318", overflow: "hidden" }}>
        {/* BG image placeholder */}
        <div style={{ position: "absolute", inset: 0, background: "url('/images/waste/hero-waste.jpg') center/cover no-repeat" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,27,17,0.92) 0%, rgba(8,27,17,0.75) 55%, rgba(8,27,17,0.4) 100%)" }} />

        {/* Decorative dots */}
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 200, height: 200, backgroundImage: "radial-gradient(circle, rgba(74,222,128,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px", borderRadius: "50%" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ maxWidth: 640 }}>
            <div className="waste-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 40, padding: "6px 16px", marginBottom: 24, animationDelay: "0.1s" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 500, letterSpacing: "0.05em" }}>PLASTIC WASTE → URBAN INFRASTRUCTURE</span>
            </div>

            <h1 className="waste-fade-up hero-h1" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 20, fontFamily: "'DM Serif Display', serif", animationDelay: "0.2s" }}>
              From Plastic Waste<br />
              <span style={{ color: "#4ade80" }}>to Urban Infrastructure</span>
            </h1>

            <p className="waste-fade-up" style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 36, animationDelay: "0.35s", maxWidth: 520 }}>
              Every kg of plastic becomes a tree guard, paving brick, or urban furniture — GPS-tracked, verified, and installed in your city.
            </p>

            <div className="waste-fade-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.5s" }}>
              <a href="#cta" className="cta-btn" style={{ background: "#1a7a45", color: "#fff", padding: "14px 28px", borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
                Partner with Us
              </a>
              <a href="#journey" style={{ background: "transparent", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.25)", padding: "14px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
                See the Journey ↓
              </a>
            </div>
          </div>

          {/* Stat pills at bottom */}
          <div className="waste-fade-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 64, animationDelay: "0.65s" }}>
            {[["300 Tons", "Recycled"], ["70,805 kg", "Installed"], ["1,000+", "Trees protected"]].map(([num, lbl]) => (
              <div key={lbl} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 20px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'DM Serif Display', serif" }}>{num}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRANSFORMATION JOURNEY ── */}
      <section id="journey" style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 12 }}>THE PROCESS</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 16 }}>From Waste to Worth</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>A complete circular process — no waste is discarded, everything becomes infrastructure.</p>
          </div>

          <div className="flow-scroll" style={{ overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0, minWidth: 860 }}>
              {[
                { icon: "🗑️", step: "01", label: "Collect", desc: "Industrial plastic waste from partner companies" },
                { icon: "⚙️", step: "02", label: "Shred", desc: "Granulate into uniform plastic pellets" },
                { icon: "🔥", step: "03", label: "Compress", desc: "Heat and mould under high pressure" },
                { icon: "🏭", step: "04", label: "Manufacture", desc: "Cast into precision product shapes" },
                { icon: "🧱", step: "05", label: "Products", desc: "Pavers, tiles, kerbs, bricks ready" },
                { icon: "🌳", step: "06", label: "Install", desc: "Laid on pathways, parks & public spaces" },
                { icon: "🏙️", step: "07", label: "Impact", desc: "Cleaner cities, verified & GPS-tagged" },
              ].map((s, i) => (
                <div key={s.step} className="flow-step" style={{ flex: 1, position: "relative", animationDelay: `${i * 0.1}s` }}>
                  <div style={{ background: i === 6 ? "#0a2318" : i % 2 === 0 ? "#f0fdf4" : "#fff", border: "1px solid #e5e7eb", borderLeft: i > 0 ? "none" : "1px solid #e5e7eb", padding: "28px 16px", height: "100%", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 4 }}>{s.step}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: i === 6 ? "#fff" : "#0a2318", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: i === 6 ? "rgba(255,255,255,0.55)" : "#9ca3af", lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                  {i < 6 && (
                    <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", zIndex: 2, fontSize: 16, color: "#1a7a45", background: "#fff", padding: "0 2px" }}>›</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: IMPACT NUMBERS ── */}
      <section ref={statsSection.ref} style={{ background: "#0a2318", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", letterSpacing: "0.1em", marginBottom: 12 }}>OUR IMPACT</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff" }}>Numbers That Matter</h2>
          </div>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {STATS.map((s, i) => (
              <StatCounter key={i} {...s} start={statsSection.inView} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>ACROSS 4 MAJOR INSTALLATIONS · BANGALORE · HOSUR · COIMBATORE</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PRODUCTS GRID ── */}
      <section style={{ background: "#f9fafb", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 12 }}>WHAT WE CREATE</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 14 }}>10+ Recycled Product Variants</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 460, margin: "0 auto" }}>Every product is engineered from 100% recycled plastic — durable, weather-resistant, and load-tested.</p>
          </div>

          <div className="prod-grid-inner" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {PRODUCTS.map((p) => (
              <div key={p.name} className="prod-card" style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                {/* Image */}
                <div style={{ width: "100%", aspectRatio: "1", background: "#e5e7eb", position: "relative", overflow: "hidden" }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Photo coming soon</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "14px 14px 16px" }}>
                  <div style={{ width: 32, height: 3, background: p.accent, borderRadius: 2, marginBottom: 8 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0a2318", marginBottom: 10 }}>{p.name}</div>
                  {p.specs.map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #f3f4f6", color: "#6b7280" }}>
                      <span>{s.label}</span>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#9ca3af" }}>
            + 5 more variants available · <a href="#cta" style={{ color: "#1a7a45", textDecoration: "none", fontWeight: 500 }}>Contact us for the full catalogue →</a>
          </p>
        </div>
      </section>

      {/* ── SECTION 5: OUR WORKS ── */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 12 }}>OUR WORKS</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 14 }}>Installed. Visible. Verified.</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 500, margin: "0 auto" }}>Real pathways and footpaths built from recycled plastic — you can walk on our impact.</p>
          </div>

          <div className="works-grid-inner" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {INSTALLATIONS.map((inst, i) => (
              <div key={i} className="work-card" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative", cursor: "pointer" }}>
                {/* Image */}
                <div style={{ width: "100%", aspectRatio: "16/9", background: "#d1d5db", position: "relative", overflow: "hidden" }}>
                  <img src={inst.image} alt={inst.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div style={{ position: "absolute", inset: 0, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Installation photo coming soon</span>
                  </div>
                  {/* Overlay */}
                  <div className="work-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,24,0.85) 0%, transparent 50%)", opacity: 0.6, transition: "opacity 0.3s" }} />
                  {/* KG badge */}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#1a7a45", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                    {inst.kg} kg used
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "16px 18px", background: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#0a2318", marginBottom: 4 }}>{inst.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                    <span>📍</span> {inst.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ marginTop: 32, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#166534", fontWeight: 500, marginBottom: 2 }}>Total plastic converted to public infrastructure</div>
              <div style={{ fontSize: 11, color: "#4b7a5a" }}>Across 4 installations · Bangalore · Hosur · Coimbatore</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#14532d", fontFamily: "'DM Serif Display', serif" }}>70,805 kg</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: DIFFERENTIATOR ── */}
      <section style={{ background: "#0a2318", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", letterSpacing: "0.1em", marginBottom: 12 }}>WHY WE ARE DIFFERENT</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff", marginBottom: 14 }}>No One Else Does All of This</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 440, margin: "0 auto" }}>Most organisations solve one piece. We close the entire loop.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Capability</th>
                  {["Waste Collection NGOs", "Recycling Companies", "CSR Awareness NGOs", "EcoTree"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: i === 3 ? "#4ade80" : "rgba(255,255,255,0.35)", fontWeight: i === 3 ? 700 : 500, borderBottom: i === 3 ? "2px solid #1a7a45" : "1px solid rgba(255,255,255,0.08)", background: i === 3 ? "rgba(26,122,69,0.15)" : "transparent" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: ri === COMPARE_ROWS.length - 1 ? "rgba(74,222,128,0.06)" : "transparent" }}>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: ri === COMPARE_ROWS.length - 1 ? "#4ade80" : "rgba(255,255,255,0.65)", fontWeight: ri === COMPARE_ROWS.length - 1 ? 600 : 400 }}>{row.label}</td>
                    {row.others.map((v, i) => (
                      <td key={i} style={{ padding: "11px 16px", textAlign: "center", fontSize: 16, background: "transparent" }}>
                        {v ? <span style={{ color: "#86efac" }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.2)" }}>✗</span>}
                      </td>
                    ))}
                    <td style={{ padding: "11px 16px", textAlign: "center", fontSize: 16, background: "rgba(26,122,69,0.15)" }}>
                      <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>
                      {ri === COMPARE_ROWS.length - 1 && <span style={{ fontSize: 10, color: "#4ade80", display: "block", marginTop: 2 }}>Only us</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CSR BENEFITS ── */}
      <section style={{ background: "#f9fafb", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 12 }}>FOR CSR PARTNERS</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 14 }}>Why Companies Choose EcoTree</h2>
          </div>
          <div className="csr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {CSR_BENEFITS.map((b) => (
              <div key={b.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 22px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0a2318", marginBottom: 8 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CLIENTS ── */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a45", letterSpacing: "0.1em", marginBottom: 12 }}>TRUSTED BY INDUSTRY</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 14 }}>Companies That Chose Circular</h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 440, margin: "0 auto" }}>Leading manufacturers, exporters, and public sector organisations trust us with their industrial plastic waste.</p>
          </div>
          <div className="client-grid-inner" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {CLIENTS.map((c) => (
              <div key={c.name} className="client-card" style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1a7a45" }}>
                  {c.short}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0a2318" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{c.industry}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: CTA ── */}
      <section id="cta" style={{ background: "#0a2318", padding: "88px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", letterSpacing: "0.1em", marginBottom: 16 }}>BECOME A PARTNER</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff", marginBottom: 14 }}>
              Turn Your Plastic Waste Into<br />Visible Urban Infrastructure
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 440, margin: "0 auto" }}>Partner with EcoTree for verified, visible ESG impact your company can be proud of.</p>
          </div>

          {submitted ? (
            <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#4ade80", marginBottom: 8 }}>Thank you!</div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "40px 36px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[
                  { key: "company", label: "Company Name", placeholder: "Your company name" },
                  { key: "contact", label: "Contact Person", placeholder: "Your name" },
                  { key: "industry", label: "Industry Type", placeholder: "e.g. Manufacturing, IT" },
                  { key: "budget", label: "CSR Budget Range", placeholder: "e.g. ₹5L – ₹20L" },
                  { key: "email", label: "Email", placeholder: "work@company.com" },
                  { key: "whatsapp", label: "WhatsApp Number", placeholder: "+91 98860 XXXXX" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={formData[f.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "#fff", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6, fontWeight: 500 }}>Message</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your waste volume and goals..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "#fff", outline: "none", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={handleSubmit} className="cta-btn" style={{ background: "#1a7a45", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                  Send Partnership Request
                </button>
                <a href="https://wa.me/919886094611" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#4ade80", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>💬</span> Or WhatsApp us directly
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
