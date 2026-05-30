"use client";

import { useEffect, useRef, useState } from "react";

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
  color: string;
}

const PRODUCTS: Product[] = [
  { name: "Eco Paver", specs: [{ label: "Size", value: "200 × 160 × 40 mm" }, { label: "Weight", value: "4 kg / piece" }, { label: "Load bearing", value: "60 Tons" }], image: "/images/waste/products/product-eco-paver.jpg", accent: "#1a7a45" },
  { name: "Eco Tiles", specs: [{ label: "Size", value: "300 × 300 × 30 mm" }, { label: "Weight", value: "3 kg / piece" }], image: "/images/waste/products/product-eco-tiles.jpg", accent: "#0f5e34" },
  { name: "Nature Kerb", specs: [{ label: "Size", value: "275 × 200 × 60 mm" }, { label: "Weight", value: "3 kg / piece" }], image: "/images/waste/products/product-nature-kerb.jpg", accent: "#166534" },
  { name: "Grass Paver", specs: [{ label: "Size", value: "275 × 200 × 60 mm" }, { label: "Weight", value: "Lightweight" }], image: "/images/waste/products/product-grass-paver.jpg", accent: "#15803d" },
  { name: "Poly Bricks", specs: [{ label: "Size", value: "300 × 150 × 100 mm" }, { label: "Weight", value: "5 kg / piece" }], image: "/images/waste/products/product-poly-bricks.jpg", accent: "#14532d" },
];

const INSTALLATIONS: Installation[] = [
  { title: "Titan — Chikkaballapur", location: "KIADB Industrial Area", kg: "13,200", image: "/images/waste/works/work-titan-chikkaballapur.jpg" },
  { title: "Ess Enn Auto CNC Pvt Ltd", location: "Basaveshwaranagar, Bangalore", kg: "10,125", image: "/images/waste/works/work-ess-enn.jpg" },
  { title: "Hosur SIPCOT Industrial Area", location: "In front of Tanishq Jewellery, Hosur", kg: "36,080", image: "/images/waste/works/work-hosur-sipcot.jpg" },
  { title: "Titan Watch Division", location: "Coimbatore", kg: "11,400", image: "/images/waste/works/work-titan-coimbatore.jpg" },
];

const CLIENTS: Client[] = [
  { name: "Titan Eyewear", industry: "Eyewear Manufacturing", short: "TE", color: "#1e40af" },
  { name: "Shahi Export", industry: "Garment Export", short: "SE", color: "#7c3aed" },
  { name: "South Western Railway", industry: "Railways / Govt", short: "SW", color: "#b45309" },
  { name: "Microtex", industry: "Manufacturing", short: "MT", color: "#0f766e" },
  { name: "Mill Works", industry: "Industrial", short: "MW", color: "#be123c" },
  { name: "LM Wind Mill", industry: "Wind Energy", short: "LM", color: "#1a7a45" },
  { name: "MRPL", industry: "Mangalore Refinery & Petrochemicals", short: "MR", color: "#9333ea" },
  { name: "Sabari Recyclers", industry: "Recycling", short: "SR", color: "#0369a1" },
  { name: "Titan Jewellery", industry: "Jewellery Manufacturing", short: "TJ", color: "#c2410c" },
];

const STATS = [
  { value: 300, suffix: "", unit: "Tons", label: "Plastic Recycled", icon: "♻️" },
  { value: 70805, suffix: "", unit: "kg", label: "Waste to Infrastructure", icon: "🏗️" },
  { value: 10, suffix: "+", unit: "Product", label: "Variants Made", icon: "🧱" },
  { value: 1000, suffix: "+", unit: "Trees", label: "Protected", icon: "🌳" },
  { value: 20, suffix: "+", unit: "Communities", label: "Served", icon: "🏘️" },
];

const COMPARE_ROWS = [
  { label: "Waste collection", others: [true, false, false] },
  { label: "Recycle & manufacture", others: [false, true, false] },
  { label: "Urban infrastructure", others: [false, false, false] },
  { label: "Tree plantation link", others: [false, false, false] },
  { label: "GPS-verified impact", others: [false, false, false] },
  { label: "CSR-ready reporting", others: [false, true, true] },
  { label: "Integrated circular model", others: [false, false, false], highlight: true },
];

const CSR_BENEFITS = [
  { icon: "📍", title: "GPS-Verified Impact", desc: "Every kg of plastic and every installation tracked with coordinates.", color: "#ef4444", bg: "#fef2f2" },
  { icon: "📊", title: "ESG-Ready Reports", desc: "Annual report-ready data for your sustainability disclosures.", color: "#3b82f6", bg: "#eff6ff" },
  { icon: "♻️", title: "Circular Economy", desc: "Closes the loop — your waste becomes public infrastructure.", color: "#1a7a45", bg: "#f0fdf4" },
  { icon: "🌿", title: "Carbon Reduction", desc: "Quantified CO₂ offset data for every project.", color: "#16a34a", bg: "#f0fdf4" },
  { icon: "🤝", title: "Employee Volunteering", desc: "Engage your teams in plantation and installation drives.", color: "#7c3aed", bg: "#faf5ff" },
  { icon: "🏙️", title: "Visible Infrastructure", desc: "Your brand on pathways, parks, and public spaces.", color: "#f59e0b", bg: "#fffbeb" },
];

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

function StatCounter({ value, suffix, unit, label, icon, start }: { value: number; suffix: string; unit: string; label: string; icon: string; start: boolean }) {
  const count = useCounter(value, 2000, start);
  const display = count >= 1000 ? count.toLocaleString("en-IN") : count;
  return (
    <div style={{ textAlign: "center", padding: "16px 8px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#60a5fa", lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{unit}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function WasteClient() {
  const statsSection = useInView(0.3);
  const [formData, setFormData] = useState({ company: "", contact: "", industry: "", budget: "", email: "", whatsapp: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", background: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        .w-fade { opacity: 0; transform: translateY(20px); animation: wfadeup 0.6s ease forwards; }
        @keyframes wfadeup { to { opacity: 1; transform: translateY(0); } }
        .prod-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.13); }
        .prod-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .work-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        .work-card { transition: all 0.25s ease; }
        .client-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .client-card { transition: all 0.2s ease; }
        .cta-primary:hover { background: #15803d !important; transform: translateY(-1px); }
        .cta-primary { transition: all 0.2s ease; }
        .stat-col:last-child { border-right: none !important; }
        input:focus, textarea:focus { border-color: #1a7a45 !important; outline: none; }

        @media (max-width: 768px) {
          .prod-grid { grid-template-columns: repeat(2,1fr) !important; }
          .works-grid { grid-template-columns: 1fr !important; }
          .clients-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: repeat(3,1fr) !important; }
          .csr-grid { grid-template-columns: 1fr 1fr !important; }
          .compare-wrap { overflow-x: auto; }
          .form-grid { grid-template-columns: 1fr !important; }
          .hero-pills { flex-wrap: wrap; gap: 8px !important; }
          .flow-scroll { overflow-x: auto; padding-bottom: 8px; }
          .diff-cols { grid-template-columns: 1fr !important; }
          .stat-col { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .stat-col:last-child { border-bottom: none; }
        }
        @media (max-width: 480px) {
          .prod-grid { grid-template-columns: 1fr 1fr !important; }
          .clients-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .csr-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", background: "#071a0f", overflow: "hidden" }}>
        <img src="/images/waste/hero-waste.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(5,20,10,0.93) 0%, rgba(5,20,10,0.78) 55%, rgba(5,20,10,0.45) 100%)" }} />
        <div style={{ position: "absolute", top: "8%", right: "6%", width: 180, height: 180, backgroundImage: "radial-gradient(circle, rgba(74,222,128,0.12) 1px, transparent 1px)", backgroundSize: "18px 18px", borderRadius: "50%" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
          <div style={{ maxWidth: 620 }}>
            <div className="w-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: 40, padding: "6px 16px", marginBottom: 22, animationDelay: "0.1s" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em" }}>PLASTIC WASTE → URBAN INFRASTRUCTURE</span>
            </div>

            <h1 className="w-fade" style={{ fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 18, fontFamily: "'DM Serif Display', serif", animationDelay: "0.2s" }}>
              From Plastic Waste<br />
              <span style={{ color: "#4ade80" }}>to Urban Infrastructure</span>
            </h1>

            {/* DARK RED subheading */}
            <p className="w-fade" style={{ fontSize: 17, color: "#e05252", lineHeight: 1.7, marginBottom: 34, animationDelay: "0.35s", maxWidth: 520, fontWeight: 500 }}>
              Every kg of plastic becomes a tree guard, paving brick, or urban furniture — GPS-tracked, verified, and installed in your city.
            </p>

            <div className="w-fade" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.5s" }}>
              <a href="#cta" className="cta-primary" style={{ background: "#1a7a45", color: "#fff", padding: "13px 26px", borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-block" }}>Partner with Us</a>
              <a href="#journey" style={{ background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.22)", padding: "13px 26px", borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-block" }}>See the Journey ↓</a>
            </div>
          </div>

          {/* RED stat pills */}
          <div className="w-fade hero-pills" style={{ display: "flex", gap: 10, marginTop: 56, animationDelay: "0.65s" }}>
            {[["300 Tons", "Recycled"], ["70,805 kg", "Installed"], ["1,000+", "Trees protected"]].map(([num, lbl]) => (
              <div key={lbl} style={{ background: "#b91c1c", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 18px" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "'DM Serif Display', serif" }}>{num}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ── */}
      <section id="journey" style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.12em", marginBottom: 10 }}>THE PROCESS</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 12 }}>From Waste to Worth</h2>
            <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 440, margin: "0 auto" }}>A complete circular process — no waste is discarded, everything becomes infrastructure.</p>
          </div>
          <div className="flow-scroll" style={{ overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0, minWidth: 820 }}>
              {[
                { icon: "🗑️", step: "01", label: "Collect", desc: "Industrial plastic from partner companies" },
                { icon: "⚙️", step: "02", label: "Shred", desc: "Granulate into uniform pellets" },
                { icon: "🔥", step: "03", label: "Compress", desc: "Heat & mould under high pressure" },
                { icon: "🏭", step: "04", label: "Manufacture", desc: "Cast into precision product shapes" },
                { icon: "🧱", step: "05", label: "Products", desc: "Pavers, tiles, kerbs, bricks ready" },
                { icon: "🌳", step: "06", label: "Install", desc: "Laid on pathways & public spaces" },
                { icon: "🏙️", step: "07", label: "Impact", desc: "Cleaner cities, GPS-verified" },
              ].map((s, i) => (
                <div key={s.step} style={{ flex: 1, position: "relative" }}>
                  <div style={{ background: i === 6 ? "#0a2318" : i % 2 === 0 ? "#f0fdf4" : "#fff", border: "1px solid #e5e7eb", borderLeft: i > 0 ? "none" : "1px solid #e5e7eb", padding: "24px 12px", height: "100%", textAlign: "center" }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: i === 6 ? "#4ade80" : "#1a7a45", letterSpacing: "0.1em", marginBottom: 3 }}>{s.step}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === 6 ? "#fff" : "#0a2318", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: i === 6 ? "rgba(255,255,255,0.5)" : "#9ca3af", lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                  {i < 6 && <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", zIndex: 2, fontSize: 14, color: "#1a7a45", background: "#fff", padding: "0 2px" }}>›</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT NUMBERS — Deep Navy, compact ── */}
      <section ref={statsSection.ref} style={{ background: "#0f172a", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.12em", marginBottom: 8 }}>OUR IMPACT</div>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff" }}>Numbers That Matter</h2>
          </div>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-col" style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
                <StatCounter {...s} start={statsSection.inView} />
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>ACROSS 4 MAJOR INSTALLATIONS · BANGALORE · HOSUR · COIMBATORE</p>
        </div>
      </section>

      {/* ── PRODUCTS — larger cards, dark text ── */}
      <section style={{ background: "#f8fafc", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.12em", marginBottom: 10 }}>WHAT WE CREATE</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 12 }}>10+ Recycled Product Variants</h2>
            <p style={{ fontSize: 15, color: "#4b5563", maxWidth: 460, margin: "0 auto" }}>Every product engineered from 100% recycled plastic — durable, weather-resistant, and load-tested.</p>
          </div>
          <div className="prod-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20 }}>
            {PRODUCTS.map((p) => (
              <div key={p.name} className="prod-card" style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ width: "100%", paddingTop: "75%", position: "relative", overflow: "hidden", background: "#e2e8f0" }}>
                  <img src={p.image} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ padding: "16px 16px 20px" }}>
                  <div style={{ width: 36, height: 4, background: p.accent, borderRadius: 2, marginBottom: 10 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{p.name}</div>
                  {p.specs.map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f1f5f9", color: "#374151" }}>
                      <span style={{ color: "#6b7280" }}>{s.label}</span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#6b7280" }}>
            + 5 more variants available · <a href="#cta" style={{ color: "#1a7a45", textDecoration: "none", fontWeight: 600 }}>Contact us for full catalogue →</a>
          </p>
        </div>
      </section>

      {/* ── OUR WORKS ── */}
      <section style={{ background: "#fff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.12em", marginBottom: 10 }}>OUR WORKS</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 12 }}>Installed. Visible. Verified.</h2>
            <p style={{ fontSize: 15, color: "#4b5563", maxWidth: 460, margin: "0 auto" }}>Real pathways and footpaths built from recycled plastic — you can walk on our impact.</p>
          </div>
          <div className="works-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {INSTALLATIONS.map((inst, i) => (
              <div key={i} className="work-card" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "100%", paddingTop: "56.25%", position: "relative", overflow: "hidden", background: "#d1d5db" }}>
                  <img src={inst.image} alt={inst.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,35,24,0.7) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#b91c1c", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{inst.kg} kg used</div>
                </div>
                <div style={{ padding: "16px 20px", background: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{inst.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>📍 {inst.location}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #86efac", borderRadius: 12, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#166534", fontWeight: 600, marginBottom: 2 }}>Total plastic converted to public infrastructure</div>
              <div style={{ fontSize: 11, color: "#4b7a5a" }}>4 installations · Bangalore · Hosur · Coimbatore</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#14532d", fontFamily: "'DM Serif Display', serif" }}>70,805 kg</div>
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIATOR — premium ── */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", marginBottom: 10 }}>WHY WE ARE DIFFERENT</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff", marginBottom: 10 }}>No One Else Does All of This</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 380, margin: "0 auto" }}>Most organisations solve one piece. We close the entire loop.</p>
          </div>
          <div className="compare-wrap">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 620 }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)", letterSpacing: "0.05em" }}>CAPABILITY</th>
                  {["Waste NGOs", "Recyclers", "CSR Orgs", "EcoTree"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "center", fontSize: i === 3 ? 13 : 11, color: i === 3 ? "#a78bfa" : "rgba(255,255,255,0.3)", fontWeight: i === 3 ? 700 : 500, borderBottom: i === 3 ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.08)", background: i === 3 ? "rgba(124,58,237,0.12)" : "transparent", letterSpacing: "0.04em" }}>
                      {i === 3 ? "⭐ " + h : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => (
                  <tr key={row.label} style={{ background: row.highlight ? "rgba(167,139,250,0.08)" : ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: row.highlight ? "#a78bfa" : "rgba(255,255,255,0.7)", fontWeight: row.highlight ? 700 : 400, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.label}</td>
                    {row.others.map((v, i) => (
                      <td key={i} style={{ padding: "10px 16px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {v ? <span style={{ color: "#86efac", fontSize: 16 }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>✗</span>}
                      </td>
                    ))}
                    <td style={{ padding: "10px 16px", textAlign: "center", background: "rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                      <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16 }}>✓</span>
                      {row.highlight && <div style={{ fontSize: 9, color: "#a78bfa", marginTop: 2, fontWeight: 700, letterSpacing: "0.05em" }}>ONLY US</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CSR BENEFITS — colorful ── */}
      <section style={{ background: "#f8fafc", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.12em", marginBottom: 10 }}>FOR CSR PARTNERS</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 12 }}>Why Companies Choose EcoTree</h2>
          </div>
          <div className="csr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {CSR_BENEFITS.map((b) => (
              <div key={b.title} style={{ background: b.bg, border: `1.5px solid ${b.color}22`, borderRadius: 14, padding: "24px 22px", borderTop: `4px solid ${b.color}` }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{b.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENTS — colorful ── */}
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a45", letterSpacing: "0.12em", marginBottom: 10 }}>TRUSTED BY INDUSTRY</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#0a2318", marginBottom: 10 }}>Companies That Chose Circular</h2>
            <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 420, margin: "0 auto" }}>Leading manufacturers, exporters, and public sector organisations trust us with their industrial plastic waste.</p>
          </div>
          <div className="clients-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {CLIENTS.map((c) => (
              <div key={c.name} className="client-card" style={{ border: `1.5px solid ${c.color}22`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, background: `${c.color}08` }}>
                <div style={{ width: 42, height: 42, minWidth: 42, borderRadius: 10, background: `${c.color}18`, border: `1.5px solid ${c.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: c.color }}>
                  {c.short}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{c.industry}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — 25% smaller ── */}
      <section id="cta" style={{ background: "#0a2318", padding: "56px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: "0.12em", marginBottom: 12 }}>BECOME A PARTNER</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff", marginBottom: 10 }}>
              Turn Your Plastic Waste Into<br />Visible Urban Infrastructure
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 380, margin: "0 auto" }}>Partner with EcoTree for verified, visible ESG impact your company can be proud of.</p>
          </div>

          {submitted ? (
            <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#4ade80", marginBottom: 6 }}>Thank you!</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 28px" }}>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {[
                  { key: "company", label: "Company Name", placeholder: "Your company name" },
                  { key: "contact", label: "Contact Person", placeholder: "Your name" },
                  { key: "industry", label: "Industry Type", placeholder: "e.g. Manufacturing" },
                  { key: "budget", label: "CSR Budget Range", placeholder: "e.g. ₹5L – ₹20L" },
                  { key: "email", label: "Email", placeholder: "work@company.com" },
                  { key: "whatsapp", label: "WhatsApp", placeholder: "+91 98860 XXXXX" },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em" }}>{f.label.toUpperCase()}</label>
                    <input type="text" placeholder={f.placeholder} value={formData[f.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "10px 13px", fontSize: 13, color: "#fff", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em" }}>MESSAGE</label>
                <textarea rows={3} placeholder="Tell us about your waste volume and goals..."
                  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "10px 13px", fontSize: 13, color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setSubmitted(true)} className="cta-primary"
                  style={{ background: "#1a7a45", color: "#fff", border: "none", padding: "12px 26px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Send Partnership Request
                </button>
                <a href="https://wa.me/919886094611" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "#4ade80", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  💬 WhatsApp us directly
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
