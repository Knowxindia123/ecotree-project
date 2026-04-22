"use client";
import { useState, useRef, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  donor, myTrees, occasionTimeline,
  SPECIES_EMOJI, SPECIES_COLOR, HEALTH_COLOR,
} from "./mockDonor";

type MapStyle = "light" | "satellite";

const MAP_STYLES: Record<MapStyle, string> = {
  light:     "mapbox://styles/mapbox/light-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

export default function MyTreeClient() {
  const [mapStyle, setMapStyle]   = useState<MapStyle>("light");
  const [popup, setPopup]         = useState<any>(null);
  const [openCard, setOpenCard]   = useState<number | null>(null);
  const [copied, setCopied]       = useState(false);
  const certRef                   = useRef<HTMLDivElement>(null);

  // Download certificate as PDF using jsPDF
  const downloadCert = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297; const H = 210;

    // Background cream
    doc.setFillColor(247, 245, 240);
    doc.rect(0, 0, W, H, "F");

    // Gold border outer
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(2);
    doc.rect(8, 8, W - 16, H - 16);

    // Gold border inner
    doc.setLineWidth(0.5);
    doc.rect(12, 12, W - 24, H - 24);

    // Corner ornaments
    const corners = [[14,14],[W-14,14],[14,H-14],[W-14,H-14]];
    doc.setFontSize(16);
    doc.setTextColor(201, 168, 76);
    corners.forEach(([x,y]) => doc.text("✦", x, y, { align:"center" }));

    // Header
    doc.setFontSize(11);
    doc.setTextColor(151, 188, 98);
    doc.text("ECOTREE IMPACT FOUNDATION", W/2, 30, { align:"center" });

    doc.setFontSize(9);
    doc.setTextColor(150, 130, 80);
    doc.text("Every tree tracked. Every impact verified.", W/2, 38, { align:"center" });

    // Divider line
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(40, 42, W-40, 42);

    // Certificate title
    doc.setFontSize(28);
    doc.setTextColor(44, 95, 45);
    doc.text("Certificate of Impact", W/2, 58, { align:"center" });

    // Body text
    doc.setFontSize(11);
    doc.setTextColor(80, 60, 20);
    doc.text("This certifies that", W/2, 72, { align:"center" });

    // Donor name — large gold italic
    doc.setFontSize(26);
    doc.setTextColor(180, 140, 40);
    doc.text(donor.name, W/2, 88, { align:"center" });

    // Impact statement
    doc.setFontSize(11);
    doc.setTextColor(80, 60, 20);
    doc.text(`has planted ${donor.total_trees} trees with EcoTree Impact Foundation`, W/2, 100, { align:"center" });
    doc.text(`across Bangalore, Karnataka, India`, W/2, 108, { align:"center" });

    // Stats row
    doc.setFillColor(44, 95, 45);
    doc.roundedRect(40, 116, 65, 24, 3, 3, "F");
    doc.roundedRect(116, 116, 65, 24, 3, 3, "F");
    doc.roundedRect(192, 116, 65, 24, 3, 3, "F");

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${donor.total_trees}`, 72, 126, { align:"center" });
    doc.text(`${donor.co2_kg} kg`, 148, 126, { align:"center" });
    doc.text(`${(donor.water_litres/1000).toFixed(1)}K L`, 224, 126, { align:"center" });

    doc.setFontSize(8);
    doc.setTextColor(216, 243, 220);
    doc.text("Trees Planted", 72, 134, { align:"center" });
    doc.text("CO₂ Offset", 148, 134, { align:"center" });
    doc.text("Water Saved", 224, 134, { align:"center" });

    // Bottom divider
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(40, 148, W-40, 148);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(130, 100, 40);
    doc.text(`Donor ID: ${donor.id}   |   Member since: ${donor.since}   |   Issued: April 2026`, W/2, 156, { align:"center" });
    doc.text("ISFR Standard · GPS Verified · 80G Approved · Section 8 Company", W/2, 163, { align:"center" });

    // EcoTree tagline
    doc.setFontSize(8);
    doc.setTextColor(151, 188, 98);
    doc.text("ecotree-project-tkr2.vercel.app", W/2, 172, { align:"center" });

    doc.save(`EcoTree-Certificate-${donor.id}.pdf`);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://ecotree.in/ref/${donor.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌳 I've planted ${donor.total_trees} trees with EcoTree Impact Foundation!\n` +
      `🌿 ${donor.co2_kg} kg CO₂ offset · Growing in Bangalore\n` +
      `💚 Join me: https://ecotree.in/ref/${donor.referral_code}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyInstagram = () => {
    navigator.clipboard.writeText(
      `🌳 I've planted ${donor.total_trees} trees with @EcoTreeBangalore!\n` +
      `🌿 ${donor.co2_kg} kg CO₂ offset · Growing in Bangalore 💚\n` +
      `#EcoTree #PlantATree #Bangalore #GreenIndia #ClimateAction`
    );
    alert("Caption copied! Paste it in your Instagram post.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600;0,9..144,700;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --clr-primary:  #2C5F2D;
          --clr-moss:     #97BC62;
          --clr-accent:   #52B788;
          --clr-dark-bg:  #1A3C34;
          --clr-cream:    #F7F5F0;
          --clr-gold:     #C9A84C;
          --clr-gold-lt:  #F0D080;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body:    'DM Sans', system-ui, sans-serif;
          --ease-out:     cubic-bezier(0.16,1,0.3,1);
        }
        .mt-page { font-family:var(--font-body); background:#fff; overflow-x:hidden; }

        /* ── HERO BAR ── */
        .mt-hero {
           background: var(--clr-dark-bg);
  background-image: radial-gradient(ellipse 60% 80% at 15% 50%, rgba(82,183,136,.1) 0%, transparent 65%);
  padding: 1.25rem 1.5rem 1.25rem;
        }
        .mt-hero__inner {
          max-width:1200px; margin:0 auto;
          display:flex; align-items:center; justify-content:space-between;
          gap:1.5rem; flex-wrap:wrap;
        }
        .mt-hero__left { display:flex; flex-direction:column; gap:.5rem; }
        .mt-hero__eyebrow {
          font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          color:var(--clr-moss); display:flex; align-items:center; gap:.5rem;
        }
        .live-dot {
          width:6px; height:6px; background:#4ade80; border-radius:50%;
          box-shadow:0 0 5px rgba(74,222,128,.9);
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.75)}}
        .mt-hero__h1 {
          font-family:var(--font-display);
          font-size:clamp(1.8rem,4vw,2.8rem);
          font-weight:700; color:#fff; line-height:1.15; letter-spacing:-.02em;
        }
        .mt-hero__h1 em { font-style:italic; color:var(--clr-moss); }
        .mt-hero__sub { font-size:.95rem; color:rgba(255,255,255,.55); }
        .mt-hero__meta {
          display:flex; gap:1.25rem; flex-wrap:wrap; margin-top:.25rem;
        }
        .mt-hero__meta span {
          font-size:.75rem; color:rgba(255,255,255,.4);
          display:flex; align-items:center; gap:.3rem;
        }
        .mt-hero__meta strong { color:rgba(255,255,255,.7); }
        .cert-btn {
          display:inline-flex; align-items:center; gap:.5rem;
          background: linear-gradient(135deg, var(--clr-gold), #a07820);
          color:#fff; font-family:var(--font-body);
          font-weight:700; font-size:.88rem;
          padding:.75rem 1.75rem; border-radius:999px; border:none;
          cursor:pointer; text-decoration:none;
          box-shadow:0 4px 20px rgba(201,168,76,.4);
          transition:box-shadow .2s, transform .2s;
          white-space:nowrap;
        }
        .cert-btn:hover{box-shadow:0 6px 28px rgba(201,168,76,.6);transform:translateY(-1px);}

        /* ── COUNTERS ── */
        .mt-counters {
          background:var(--clr-dark-bg);
          border-top:1px solid rgba(255,255,255,.06);
          padding:1.5rem;
        }
        .mt-counters__inner {
          max-width:1200px; margin:0 auto;
          display:grid; grid-template-columns:repeat(4,1fr); gap:1rem;
        }
        @media(max-width:700px){.mt-counters__inner{grid-template-columns:repeat(2,1fr);}}
        .mt-counter {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
          border-radius:14px; padding:1.25rem 1rem;
          display:flex; flex-direction:column; align-items:center; gap:.3rem;
          transition:background .2s;
        }
        .mt-counter:hover{background:rgba(255,255,255,.07);}
        .mt-counter__icon{font-size:1.5rem;}
        .mt-counter__val{
          font-family:var(--font-display);
          font-size:clamp(1.4rem,3vw,2rem);
          font-weight:700; color:#fff; line-height:1; letter-spacing:-.02em;
        }
        .mt-counter__label{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.45);letter-spacing:.05em;text-transform:uppercase;text-align:center;}
        .mt-counter__sub{font-size:.65rem;color:var(--clr-moss);font-weight:500;text-align:center;}

        /* ── MAP ── */
        .mt-map-section { background:var(--clr-cream); padding:3rem 0 0; }
        .mt-map-header {
          background:var(--clr-primary);
          border-radius:16px 16px 0 0;
          padding:1.25rem 2rem;
          display:flex; align-items:center; justify-content:space-between;
          gap:1rem; flex-wrap:wrap;
          max-width:1200px; margin:0 auto;
        }
        .mt-map-title {
          font-family:var(--font-display);
          font-size:1.2rem; font-weight:700; color:#fff;
          display:flex; align-items:center; gap:.5rem;
        }
        .mt-map-title span{font-size:.85rem;color:rgba(255,255,255,.5);font-family:var(--font-body);font-weight:400;}
        .style-toggle {
          display:flex; gap:.4rem;
          background:rgba(0,0,0,.2); border:1px solid rgba(255,255,255,.1);
          border-radius:999px; padding:4px;
        }
        .style-btn {
          display:inline-flex; align-items:center; gap:.35rem;
          font-family:var(--font-body); font-size:.8rem; font-weight:600;
          color:rgba(255,255,255,.6); background:transparent; border:none;
          border-radius:999px; padding:.4rem .9rem;
          cursor:pointer; transition:all .25s var(--ease-out);
        }
        .style-btn:hover{color:rgba(255,255,255,.9);}
        .style-btn.active{color:#fff;background:rgba(255,255,255,.15);box-shadow:0 2px 8px rgba(0,0,0,.2);}
        .mt-map-wrap {
          position:relative; height:420px;
          max-width:1200px; margin:0 auto; overflow:hidden;
        }
        @media(max-width:768px){.mt-map-wrap{height:340px;}}
        .mt-map-strip {
          max-width:1200px; margin:0 auto;
          background:var(--clr-primary);
          border-radius:0 0 16px 16px;
          padding:.6rem 1.5rem;
          font-size:.72rem; font-weight:600; color:rgba(255,255,255,.7);
          display:flex; align-items:center; gap:.75rem;
        }

        /* popups */
        .mapboxgl-popup-content{
          background:rgba(255,255,255,.97)!important;
          border:1px solid #e5e7eb!important;
          border-radius:12px!important; padding:12px 16px!important;
          font-family:var(--font-body)!important; color:#1a1a1a!important;
          font-size:.8rem!important; min-width:170px;
          box-shadow:0 8px 24px rgba(0,0,0,.12)!important;
        }
        .mapboxgl-popup-tip{border-top-color:rgba(255,255,255,.97)!important;}
        .mapboxgl-popup-close-button{color:#9CA3AF!important;}
        .pu-title{font-weight:700;font-size:.9rem;margin-bottom:5px;color:var(--clr-primary);}
        .pu-row{display:flex;justify-content:space-between;gap:.75rem;font-size:.75rem;color:#6B7280;margin-top:3px;}
        .pu-row strong{color:#374151;}
        .pu-health{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:700;margin-top:5px;}

        /* ── SECTIONS ── */
        .mt-section{padding:4rem 1.5rem;}
        .mt-section--cream{background:var(--clr-cream);}
        .mt-section--white{background:#fff;}
        .mt-section--dark{background:var(--clr-dark-bg);}
        .mt-inner{max-width:1200px;margin:0 auto;}
        .mt-eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--clr-accent);margin-bottom:.5rem;}
        .mt-h2{
          font-family:var(--font-display);
          font-size:clamp(1.5rem,3vw,2.2rem);
          font-weight:700;color:#1a1a1a;line-height:1.2;letter-spacing:-.015em;margin-bottom:.75rem;
        }
        .mt-h2--light{color:#fff;}
        .mt-sub{font-size:.95rem;color:#6B7280;line-height:1.6;max-width:560px;margin-bottom:2rem;}

        /* ── TREE HEALTH CARDS ── */
        .tree-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
        @media(max-width:900px){.tree-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:600px){.tree-grid{grid-template-columns:repeat(2,1fr);}}
        .tree-card{
          border:1px solid #e5e7eb; border-radius:16px; padding:1.25rem;
          background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.05);
          cursor:pointer; transition:box-shadow .2s,transform .2s;
        }
        .tree-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px);}
        .tree-card__emoji{font-size:2rem;margin-bottom:.5rem;display:block;}
        .tree-card__species{font-weight:700;font-size:.92rem;color:#1a1a1a;margin-bottom:2px;}
        .tree-card__zone{font-size:.75rem;color:#6B7280;margin-bottom:.6rem;}
        .tree-card__health-track{background:#f3f4f6;border-radius:999px;height:6px;overflow:hidden;margin-bottom:.35rem;}
        .tree-card__health-fill{height:100%;border-radius:999px;transition:width .8s var(--ease-out);}
        .tree-card__health-val{font-size:.7rem;font-weight:600;}
        .tree-card__occasion{
          display:inline-flex;align-items:center;gap:.3rem;
          margin-top:.5rem;font-size:.7rem;font-weight:600;
          background:var(--clr-cream);color:#374151;
          padding:2px 8px;border-radius:999px;
        }
        .tree-card__date{font-size:.68rem;color:#9CA3AF;margin-top:.35rem;}

        /* ── TIMELINE ── */
        .timeline{display:flex;flex-direction:column;gap:0;}
        .tl-item{
          display:flex;gap:1.25rem;align-items:flex-start;
          padding-bottom:1.5rem; position:relative;
        }
        .tl-item:not(:last-child)::before{
          content:'';position:absolute;left:19px;top:38px;
          width:2px;height:calc(100% - 10px);
          background:linear-gradient(#e5e7eb,transparent);
        }
        .tl-dot{
          width:38px;height:38px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:1.1rem;border:2px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.1);
        }
        .tl-content{padding-top:.35rem;}
        .tl-title{font-weight:600;font-size:.9rem;color:#1a1a1a;}
        .tl-meta{font-size:.75rem;color:#6B7280;margin-top:2px;}

        /* ── CERTIFICATE PREVIEW ── */
        .cert-preview {
          background:var(--clr-cream);
          border:2px solid var(--clr-gold);
          border-radius:20px; padding:3rem 2rem;
          text-align:center; position:relative;
          box-shadow:0 8px 40px rgba(201,168,76,.15), inset 0 0 0 8px rgba(201,168,76,.06);
          max-width:700px; margin:0 auto;
        }
        .cert-corner{
          position:absolute;font-size:1.4rem;color:var(--clr-gold);opacity:.6;
          line-height:1;
        }
        .cert-corner--tl{top:14px;left:18px;}
        .cert-corner--tr{top:14px;right:18px;}
        .cert-corner--bl{bottom:14px;left:18px;}
        .cert-corner--br{bottom:14px;right:18px;}
        .cert-org{
          font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
          color:var(--clr-moss);margin-bottom:.25rem;
        }
        .cert-tagline{font-size:.75rem;color:var(--clr-gold);margin-bottom:1rem;}
        .cert-divider{height:1px;background:linear-gradient(90deg,transparent,var(--clr-gold),transparent);margin:.75rem 0;}
        .cert-heading{
          font-family:var(--font-display);
          font-size:clamp(1.4rem,3vw,2rem);
          font-weight:700;color:var(--clr-primary);margin-bottom:1rem;
        }
        .cert-body{font-size:.9rem;color:#6B7280;line-height:1.8;margin-bottom:1.25rem;}
        .cert-name{
          font-family:var(--font-display);
          font-size:clamp(1.6rem,4vw,2.4rem);
          font-style:italic;font-weight:600;
          color:var(--clr-gold);margin:.25rem 0;
          line-height:1.2;
        }
        .cert-stats{
          display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;
          margin:1.25rem 0;
        }
        .cert-stat{
          background:var(--clr-primary);color:#fff;
          border-radius:12px;padding:.75rem 1.25rem;
          display:flex;flex-direction:column;align-items:center;gap:.2rem;
          min-width:90px;
        }
        .cert-stat__val{font-family:var(--font-display);font-size:1.3rem;font-weight:700;line-height:1;}
        .cert-stat__label{font-size:.65rem;font-weight:500;opacity:.75;text-transform:uppercase;letter-spacing:.05em;}
        .cert-footer{font-size:.7rem;color:#9CA3AF;margin-top:1rem;line-height:1.8;}
        .cert-id{
          display:inline-block;background:var(--clr-cream);
          border:1px solid var(--clr-gold);border-radius:6px;
          padding:2px 10px;font-size:.7rem;font-weight:600;
          color:var(--clr-gold);margin-top:.5rem;
          letter-spacing:.06em;
        }

        /* ── SOCIAL SHARE ── */
        .share-card{
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);
          border-radius:20px;padding:2rem;
          display:flex;align-items:center;justify-content:space-between;
          gap:1.5rem;flex-wrap:wrap;
        }
        .share-card__preview{
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
          border-radius:14px;padding:1.25rem 1.5rem;flex:1;min-width:220px;
        }
        .share-card__text{font-size:.9rem;color:#fff;line-height:1.7;font-weight:500;}
        .share-card__hashtags{font-size:.75rem;color:rgba(255,255,255,.5);margin-top:.5rem;}
        .share-btns{display:flex;flex-direction:column;gap:.75rem;min-width:180px;}
        .btn-whatsapp{
          display:flex;align-items:center;justify-content:center;gap:.5rem;
          background:#25D366;color:#fff;font-weight:700;font-size:.88rem;
          padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-whatsapp:hover{box-shadow:0 4px 16px rgba(37,211,102,.4);transform:translateY(-1px);}
        .btn-instagram{
          display:flex;align-items:center;justify-content:center;gap:.5rem;
          background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);
          color:#fff;font-weight:700;font-size:.88rem;
          padding:.7rem 1.5rem;border-radius:999px;border:none;cursor:pointer;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-instagram:hover{box-shadow:0 4px 16px rgba(253,29,29,.3);transform:translateY(-1px);}

        /* ── PLANT MORE ── */
        .occasion-grid{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem;}
        .occasion-chip{
          display:inline-flex;align-items:center;gap:.4rem;
          background:var(--clr-cream);border:1px solid #e5e7eb;
          border-radius:999px;padding:.5rem 1rem;
          font-size:.82rem;font-weight:600;color:#374151;
          cursor:pointer;transition:all .2s;text-decoration:none;
        }
        .occasion-chip:hover{background:var(--clr-mint,#D8F3DC);border-color:var(--clr-accent);color:var(--clr-primary);}

        /* ── REFER ── */
        .referral-box{
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          border-radius:16px;padding:1.5rem;
          display:flex;align-items:center;justify-content:space-between;
          gap:1rem;flex-wrap:wrap;
        }
        .referral-link{
          font-family:'Courier New',monospace;font-size:.85rem;
          color:var(--clr-moss);letter-spacing:.04em;
          background:rgba(255,255,255,.04);padding:.4rem .75rem;
          border-radius:6px;border:1px solid rgba(151,188,98,.2);
        }
        .btn-copy{
          display:inline-flex;align-items:center;gap:.4rem;
          background:var(--clr-accent);color:#fff;font-weight:700;font-size:.82rem;
          padding:.55rem 1.25rem;border-radius:999px;border:none;cursor:pointer;
          transition:background .2s;
        }
        .btn-copy:hover{background:#40916C;}
        .btn-copy.copied{background:#22c55e;}

        /* ── FINAL CTA ── */
        .plant-cta{
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 60%,#40916C 100%);
          border-radius:20px;padding:2.5rem 2rem;text-align:center;
        }
        .plant-cta h3{
          font-family:var(--font-display);
          font-size:clamp(1.3rem,2.5vw,1.8rem);
          font-weight:700;color:#fff;margin-bottom:.5rem;letter-spacing:-.01em;
        }
        .plant-cta p{font-size:.9rem;color:rgba(255,255,255,.6);margin-bottom:1.5rem;}
        .plant-cta__btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;}
        .btn-white{
          background:#fff;color:var(--clr-primary);font-weight:700;font-size:.88rem;
          padding:.7rem 1.75rem;border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-white:hover{box-shadow:0 6px 20px rgba(0,0,0,.2);transform:translateY(-1px);}
        .btn-outline-w{
          background:transparent;color:#fff;font-weight:600;font-size:.88rem;
          padding:.7rem 1.75rem;border-radius:999px;border:2px solid rgba(255,255,255,.4);
          cursor:pointer;text-decoration:none;display:inline-block;
          transition:border-color .2s,background .2s;
        }
        .btn-outline-w:hover{border-color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);}

        @media(max-width:768px){
          .mt-hero__inner{flex-direction:column;align-items:flex-start;}
          .mt-map-header{padding:1rem 1.25rem;border-radius:12px 12px 0 0;}
          .share-card{flex-direction:column;}
          .share-btns{flex-direction:row;min-width:auto;}
        }
      `}</style>

      <main className="mt-page">

        {/* ══════════════════════════════════════
            SECTION 1 — DONOR HERO BAR
        ══════════════════════════════════════ */}
        <section className="mt-hero">
          <div className="mt-hero__inner">
            <div className="mt-hero__left">
              <div className="mt-hero__eyebrow">
                <span className="live-dot" /> My EcoTree Dashboard
              </div>
              <h1 className="mt-hero__h1">
                {donor.first_name}, your forest is <em>growing</em> 🌳
              </h1>
              <p className="mt-hero__sub">
                {donor.total_trees} trees planted · {donor.co2_kg} kg CO₂ offset · Bangalore
              </p>
              <div className="mt-hero__meta">
                <span>🪪 <strong>{donor.id}</strong></span>
                <span>📅 Member since <strong>{donor.since}</strong></span>
                <span>📍 <strong>{donor.location}</strong></span>
              </div>
            </div>
            <button className="cert-btn" onClick={downloadCert}>
              ⬇️ Download Certificate
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 2 — PERSONAL IMPACT COUNTERS
        ══════════════════════════════════════ */}
        <section className="mt-counters">
          <div className="mt-counters__inner">
            {[
              { icon:"🌳", val:donor.total_trees,                           label:"My Trees",         sub:"GPS verified"             },
              { icon:"🌿", val:`${donor.co2_kg} kg`,                        label:"CO₂ Offset",       sub:"ISFR · 22 kg/tree/yr"     },
              { icon:"💧", val:`${(donor.water_litres/1000).toFixed(1)}K L`,label:"Water Saved",      sub:"3,785 L per tree/yr"      },
              { icon:"🌍", val:`${donor.km_equivalent.toLocaleString()} km`,label:"Driving Equivalent",sub:"less CO₂ on roads"       },
            ].map(c => (
              <div className="mt-counter" key={c.label}>
                <span className="mt-counter__icon">{c.icon}</span>
                <span className="mt-counter__val">{c.val}</span>
                <span className="mt-counter__label">{c.label}</span>
                <span className="mt-counter__sub">{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 3 — MY TREES ON MAPBOX
        ══════════════════════════════════════ */}
        <section className="mt-map-section">
          <div className="mt-map-header">
            <div className="mt-map-title">
              🗺️ My Trees on the Map
              <span>· {donor.total_trees} locations</span>
            </div>
            <div className="style-toggle">
              <button
                className={`style-btn${mapStyle==="light"?" active":""}`}
                onClick={() => setMapStyle("light")}
              >🗺️ Street</button>
              <button
                className={`style-btn${mapStyle==="satellite"?" active":""}`}
                onClick={() => setMapStyle("satellite")}
              >🛰️ Satellite</button>
            </div>
          </div>

          <div className="mt-map-wrap">
            <Map
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              initialViewState={{ longitude:77.6195, latitude:12.9650, zoom:11 }}
              style={{ width:"100%", height:"100%" }}
              mapStyle={MAP_STYLES[mapStyle]}
            >
              <NavigationControl position="bottom-right" />

              {myTrees.map((t, i) => (
                <Marker
                  key={t.id}
                  longitude={t.lng}
                  latitude={t.lat}
                  anchor="bottom"
                  onClick={e => { e.originalEvent.stopPropagation(); setPopup(t); }}
                >
                  <div style={{
                    width:34, height:34,
                    background: SPECIES_COLOR[t.species] || "#2C5F2D",
                    borderRadius:"50% 50% 50% 0",
                    transform:"rotate(-45deg)",
                    border:"2.5px solid rgba(255,255,255,.95)",
                    boxShadow: t.pulse
                      ? "0 0 0 8px rgba(44,95,45,.2), 0 3px 10px rgba(0,0,0,.3)"
                      : "0 3px 10px rgba(0,0,0,.25)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer",
                    animationDelay:`${i*0.06}s`,
                  }}>
                    <span style={{transform:"rotate(45deg)",fontSize:15}}>
                      {SPECIES_EMOJI[t.species]}
                    </span>
                  </div>
                </Marker>
              ))}

              {popup && (
                <Popup
                  longitude={popup.lng}
                  latitude={popup.lat}
                  anchor="bottom"
                  offset={48}
                  onClose={() => setPopup(null)}
                  closeOnClick={false}
                >
                  <div className="pu-title">{SPECIES_EMOJI[popup.species]} {popup.species}</div>
                  <div className="pu-row"><span>Zone</span><strong>{popup.zone}</strong></div>
                  <div className="pu-row"><span>Planted</span><strong>{popup.planted}</strong></div>
                  <div className="pu-row"><span>Occasion</span><strong>{popup.occasion}</strong></div>
                  <div>
                    <span
                      className="pu-health"
                      style={{
                        background: HEALTH_COLOR(popup.health) + "22",
                        color: HEALTH_COLOR(popup.health),
                      }}
                    >
                      Health: {popup.health}% {popup.health>=85?"🟢":popup.health>=70?"🟡":"🔴"}
                    </span>
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          <div className="mt-map-strip">
            <span className="live-dot" />
            All {donor.total_trees} trees GPS-verified · Click any pin for details · Satellite view shows real aerial imagery
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 4 — TREE HEALTH CARDS
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--cream">
          <div className="mt-inner">
            <p className="mt-eyebrow">Your Forest</p>
            <h2 className="mt-h2">All {donor.total_trees} of your trees</h2>
            <p className="mt-sub">Click any tree to see full details. Health is monitored monthly by our field volunteers.</p>
            <div className="tree-grid">
              {myTrees.map(t => (
                <div key={t.id} className="tree-card" onClick={() => setOpenCard(openCard===t.id?null:t.id)}>
                  <span className="tree-card__emoji">{SPECIES_EMOJI[t.species]}</span>
                  <div className="tree-card__species">{t.species}</div>
                  <div className="tree-card__zone">📍 {t.zone}</div>
                  <div className="tree-card__health-track">
                    <div
                      className="tree-card__health-fill"
                      style={{width:`${t.health}%`,background:HEALTH_COLOR(t.health)}}
                    />
                  </div>
                  <div className="tree-card__health-val" style={{color:HEALTH_COLOR(t.health)}}>
                    Health {t.health}% {t.health>=85?"🟢":t.health>=70?"🟡":"🔴"}
                  </div>
                  <div className="tree-card__occasion">
                    {occasionTimeline.find(o=>o.species===t.species&&o.zone===t.zone)?.icon || "🌱"} {t.occasion}
                  </div>
                  <div className="tree-card__date">Planted {t.planted}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 5 — OCCASION TIMELINE
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--white">
          <div className="mt-inner">
            <p className="mt-eyebrow">Your Story</p>
            <h2 className="mt-h2">Why each tree was planted</h2>
            <p className="mt-sub">Every tree has a memory behind it — birthdays, anniversaries, festivals, and moments that matter.</p>
            <div className="timeline">
              {occasionTimeline.map((o, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-dot" style={{background:o.color+"22",borderColor:o.color}}>
                    {o.icon}
                  </div>
                  <div className="tl-content">
                    <div className="tl-title">{o.occasion} · {o.species}</div>
                    <div className="tl-meta">📍 {o.zone} · {o.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 6 — CERTIFICATE PREVIEW
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--cream">
          <div className="mt-inner">
            <p className="mt-eyebrow">Your Impact Certificate</p>
            <h2 className="mt-h2">Download your certificate</h2>
            <p className="mt-sub">A premium PDF certificate verifying your environmental contribution — share it on LinkedIn or frame it.</p>

            <div className="cert-preview" ref={certRef}>
              <span className="cert-corner cert-corner--tl">✦</span>
              <span className="cert-corner cert-corner--tr">✦</span>
              <span className="cert-corner cert-corner--bl">✦</span>
              <span className="cert-corner cert-corner--br">✦</span>

              <div className="cert-org">EcoTree Impact Foundation</div>
              <div className="cert-tagline">Every tree tracked. Every impact verified.</div>
              <div className="cert-divider" />
              <div className="cert-heading">Certificate of Impact</div>
              <div className="cert-body">
                This certifies that
              </div>
              <div className="cert-name">{donor.name}</div>
              <div className="cert-body">
                has planted trees with EcoTree Impact Foundation<br />
                across Bangalore, Karnataka, India
              </div>

              <div className="cert-stats">
                <div className="cert-stat">
                  <span className="cert-stat__val">{donor.total_trees}</span>
                  <span className="cert-stat__label">Trees</span>
                </div>
                <div className="cert-stat">
                  <span className="cert-stat__val">{donor.co2_kg} kg</span>
                  <span className="cert-stat__label">CO₂ Offset</span>
                </div>
                <div className="cert-stat">
                  <span className="cert-stat__val">{(donor.water_litres/1000).toFixed(1)}K L</span>
                  <span className="cert-stat__label">Water Saved</span>
                </div>
              </div>

              <div className="cert-divider" />
              <div className="cert-footer">
                Member since {donor.since} · Issued April 2026<br />
                ISFR Standard · GPS Verified · 80G Approved · Section 8 Company
              </div>
              <div className="cert-id">{donor.id}</div>
            </div>

            <div style={{textAlign:"center",marginTop:"1.5rem"}}>
              <button className="cert-btn" onClick={downloadCert}>
                ⬇️ Download PDF Certificate
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 7 — SOCIAL SHARING
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--white">
          <div className="mt-inner">
            <p className="mt-eyebrow">Share Your Impact</p>
            <h2 className="mt-h2">Inspire others to plant</h2>
            <p className="mt-sub">Share your impact on social media — every share inspires more trees.</p>

            <div className="share-card">
              <div className="share-card__preview">
                <div className="share-card__text">
                  🌳 I've planted {donor.total_trees} trees with EcoTree Impact Foundation!<br />
                  🌿 {donor.co2_kg} kg CO₂ offset · Growing in Bangalore<br />
                  💚 Join me: ecotree.in/ref/{donor.referral_code}
                </div>
                <div className="share-card__hashtags">
                  #EcoTree #PlantATree #Bangalore #GreenIndia #ClimateAction
                </div>
              </div>
              <div className="share-btns">
                <button className="btn-whatsapp" onClick={shareWhatsApp}>
                  💬 Share on WhatsApp
                </button>
                <button className="btn-instagram" onClick={copyInstagram}>
                  📸 Copy for Instagram
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 8 — PLANT MORE
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--cream">
          <div className="mt-inner">
            <p className="mt-eyebrow">Grow Your Forest</p>
            <h2 className="mt-h2">Add more trees</h2>
            <p className="mt-sub">Every occasion is a reason to plant. Add to your forest today.</p>
            <div className="occasion-grid">
              {[
                {icon:"🎂",label:"Birthday"},
                {icon:"💍",label:"Anniversary"},
                {icon:"🙏",label:"Memorial"},
                {icon:"🪔",label:"Diwali"},
                {icon:"🎆",label:"New Year"},
                {icon:"🌍",label:"Earth Day"},
                {icon:"🏢",label:"Corporate"},
                {icon:"🎁",label:"Gift a Tree"},
              ].map(o => (
                <a key={o.label} href="/donate" className="occasion-chip">
                  {o.icon} {o.label}
                </a>
              ))}
            </div>
            <div className="plant-cta">
              <h3>Your forest is at {donor.total_trees} trees — keep growing 🌱</h3>
              <p>Every tree you add appears on your personal map and updates your certificate automatically.</p>
              <div className="plant-cta__btns">
                <a href="/donate" className="btn-white">🌳 Plant More Trees</a>
                <a href="/dashboard" className="btn-outline-w">📊 View Public Dashboard</a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 9 — REFER A FRIEND
        ══════════════════════════════════════ */}
        <section className="mt-section mt-section--dark">
          <div className="mt-inner">
            <p className="mt-eyebrow" style={{color:"var(--clr-moss)"}}>Referral Programme</p>
            <h2 className="mt-h2 mt-h2--light">Every friend you refer plants a tree</h2>
            <p className="mt-sub" style={{color:"rgba(255,255,255,.55)"}}>
              Share your referral link. When a friend donates their first tree, EcoTree plants a bonus tree in your name — free.
            </p>
            <div className="referral-box">
              <div>
                <div style={{fontSize:".75rem",color:"rgba(255,255,255,.4)",marginBottom:".35rem",fontWeight:600,letterSpacing:".05em",textTransform:"uppercase"}}>Your referral link</div>
                <div className="referral-link">ecotree.in/ref/{donor.referral_code}</div>
              </div>
              <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
                <button
                  className={`btn-copy${copied?" copied":""}`}
                  onClick={copyReferral}
                >
                  {copied ? "✅ Copied!" : "📋 Copy Link"}
                </button>
                <button className="btn-whatsapp" onClick={() => {
                  const text = encodeURIComponent(`🌳 Join me on EcoTree and plant your first tree!\nhttps://ecotree.in/ref/${donor.referral_code}`);
                  window.open(`https://wa.me/?text=${text}`,"_blank");
                }}>
                  💬 Share
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
