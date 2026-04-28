"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { heroStats, benefits, uspCards, species, nativeImportance, faqs } from "./data";

export default function WhyTreesClient() {
  const [benefitIdx, setBenefitIdx] = useState(0);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const speciesRef = useRef<HTMLDivElement>(null);

  const scrollBenefit = (dir: "prev" | "next") => {
    const next = dir === "next"
      ? Math.min(benefitIdx + 1, benefits.length - 1)
      : Math.max(benefitIdx - 1, 0);
    setBenefitIdx(next);
    scrollRef.current?.children[next]?.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
  };

  const scrollSpecies = (dir: "left" | "right") => {
    if (speciesRef.current) {
      speciesRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600;0,9..144,700;1,9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        :root {
          --clr-primary:  #2C5F2D;
          --clr-moss:     #97BC62;
          --clr-dark-bg:  #1A3C34;
          --clr-cream:    #F7F5F0;
          --clr-accent:   #52B788;
          --clr-gold:     #C9A84C;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body:    'DM Sans', system-ui, sans-serif;
          --ease-out:     cubic-bezier(0.16,1,0.3,1);
        }
        .wt-page { font-family:var(--font-body); background:#fff; overflow-x:hidden; }

        /* ── S1: HERO ── */
        .wt-hero {
          position:relative; min-height:100vh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:6rem 1.5rem 4rem; overflow:hidden;
        }
        .wt-hero__bg {
          position:absolute; inset:0; z-index:0;
          background:linear-gradient(135deg,#0d2818 0%,#1a3c2a 40%,#2C5F2D 100%);
        }
        .wt-hero__img {
          position:absolute; inset:0; z-index:1;
          object-fit:cover; width:100%; height:100%;
          opacity:.45;
        }
        .wt-hero__overlay {
          position:absolute; inset:0; z-index:2;
          background:linear-gradient(to bottom, rgba(10,30,15,.3) 0%, rgba(10,30,15,.7) 100%);
        }
        .wt-hero__content { position:relative; z-index:3; max-width:900px; margin:0 auto; }
        .wt-hero__eyebrow {
          display:inline-flex; align-items:center; gap:.5rem;
          background:rgba(82,183,136,.15); border:1px solid rgba(82,183,136,.3);
          border-radius:999px; padding:.3rem 1rem;
          font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          color:#4ade80; margin-bottom:1.5rem;
        }
        .live-dot {
          width:6px; height:6px; background:#4ade80; border-radius:50%;
          box-shadow:0 0 6px rgba(74,222,128,.9);
          animation:pulse 2s ease-in-out infinite;
        }
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .wt-hero__h1 {
          font-family:var(--font-display);
          font-size:clamp(2.8rem,7vw,5.5rem);
          font-weight:700; color:#fff; line-height:1.05;
          letter-spacing:-.03em; margin-bottom:1.25rem;
        }
        .wt-hero__h1 em { font-style:italic; color:var(--clr-moss); }
        .wt-hero__sub {
          font-size:clamp(1rem,2vw,1.3rem);
          color:rgba(255,255,255,.7); line-height:1.65;
          max-width:620px; margin:0 auto 2.5rem;
          font-weight:400;
        }
        /* USP pills */
        .wt-hero__pills {
          display:flex; flex-wrap:wrap; gap:.6rem;
          justify-content:center; margin-bottom:2.5rem;
        }
        .usp-pill {
          display:inline-flex; align-items:center; gap:.4rem;
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
          border-radius:999px; padding:.4rem 1rem;
          font-size:.78rem; font-weight:600; color:#fff;
          backdrop-filter:blur(4px);
          transition:background .2s;
        }
        .usp-pill:hover{background:rgba(255,255,255,.18);}
        /* CTA buttons */
        .wt-hero__btns {
          display:flex; gap:.85rem; justify-content:center; flex-wrap:wrap;
        }
        .btn-hero-primary {
          background:var(--clr-accent); color:#fff;
          font-family:var(--font-body); font-weight:700; font-size:.95rem;
          padding:.85rem 2rem; border-radius:999px; border:none;
          cursor:pointer; text-decoration:none; display:inline-block;
          transition:box-shadow .2s, transform .2s;
          box-shadow:0 4px 20px rgba(82,183,136,.4);
        }
        .btn-hero-primary:hover{box-shadow:0 6px 28px rgba(82,183,136,.6);transform:translateY(-1px);}
        .btn-hero-outline {
          background:transparent; color:#fff;
          font-family:var(--font-body); font-weight:600; font-size:.95rem;
          padding:.85rem 2rem; border-radius:999px;
          border:2px solid rgba(255,255,255,.4);
          cursor:pointer; text-decoration:none; display:inline-block;
          transition:border-color .2s, background .2s;
        }
        .btn-hero-outline:hover{border-color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);}
        /* Scroll hint */
        .wt-hero__scroll {
          position:absolute; bottom:2rem; left:50%; transform:translateX(-50%);
          z-index:3; display:flex; flex-direction:column; align-items:center; gap:.4rem;
          font-size:.7rem; color:rgba(255,255,255,.4); letter-spacing:.06em; text-transform:uppercase;
          animation:bounce 2s ease-in-out infinite;
        }
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}

        /* ── S2: STATS BAR ── */
        .wt-stats {
          background:var(--clr-dark-bg);
          border-top:1px solid rgba(255,255,255,.06);
          padding:2.5rem 1.5rem;
        }
        .wt-stats__inner {
          max-width:1200px; margin:0 auto;
          display:grid; grid-template-columns:repeat(4,1fr); gap:1rem;
        }
        @media(max-width:700px){.wt-stats__inner{grid-template-columns:repeat(2,1fr);}}
        .stat-card {
          text-align:center; padding:1.25rem 1rem;
          border-right:1px solid rgba(255,255,255,.07);
        }
        .stat-card:last-child{border-right:none;}
        .stat-card__icon{font-size:1.5rem;margin-bottom:.4rem;display:block;}
        .stat-card__val{
          font-family:var(--font-display);
          font-size:clamp(1.8rem,4vw,2.8rem);
          font-weight:700; color:#fff; line-height:1; letter-spacing:-.03em;
          display:block; margin-bottom:.4rem;
        }
        .stat-card__label{font-size:.8rem;color:rgba(255,255,255,.55);font-weight:500;line-height:1.4;}

        /* ── S3: HORIZONTAL BENEFITS SCROLL ── */
        .wt-benefits { background:var(--clr-cream); padding:5rem 0; overflow:hidden; }
        .wt-benefits__header {
          max-width:1200px; margin:0 auto 2.5rem; padding:0 1.5rem;
          display:flex; align-items:flex-end; justify-content:space-between; gap:1rem;
        }
        .wt-benefits__heading-wrap { }
        .wt-eyebrow { font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--clr-accent); margin-bottom:.4rem; }
        .wt-h2 {
          font-family:var(--font-display);
          font-size:clamp(1.6rem,3.5vw,2.6rem);
          font-weight:700; color:#1a1a1a; line-height:1.15; letter-spacing:-.02em;
        }
        .wt-h2 em{font-style:italic;color:var(--clr-primary);}
        .benefit-nav { display:flex; gap:.5rem; align-items:center; }
        .nav-btn {
          width:40px; height:40px; border-radius:50%;
          background:#fff; border:1px solid #e5e7eb;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:1rem; color:#374151;
          transition:all .2s; flex-shrink:0;
        }
        .nav-btn:hover{background:var(--clr-primary);color:#fff;border-color:var(--clr-primary);}
        .nav-btn:disabled{opacity:.3;cursor:default;}
        /* scroll track */
        .benefit-track {
          display:flex; overflow-x:auto; scroll-snap-type:x mandatory;
          scrollbar-width:none; gap:0;
          scroll-behavior:smooth;
        }
        .benefit-track::-webkit-scrollbar{display:none;}
        .benefit-panel {
          flex:0 0 100%; scroll-snap-align:start;
          display:grid; grid-template-columns:1fr 1fr;
          min-height:480px;
        }
        @media(max-width:768px){
          .benefit-panel{grid-template-columns:1fr;min-height:auto;}
        }
        .benefit-panel__img {
          position:relative; overflow:hidden; min-height:300px;
          background:linear-gradient(135deg,#1B4332,#2d6a4f);
        }
        .benefit-panel__placeholder {
          position:absolute; inset:0;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:.75rem;
        }
        .benefit-panel__placeholder-icon{font-size:4rem;opacity:.4;}
        .benefit-panel__placeholder-label{font-size:.75rem;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;}
        .benefit-panel__text {
          padding:3rem 3.5rem;
          display:flex; flex-direction:column; justify-content:center; gap:1rem;
          background:#fff;
        }
        @media(max-width:768px){.benefit-panel__text{padding:2rem 1.5rem;}}
        .benefit-panel__stat {
          font-family:var(--font-display);
          font-size:clamp(1.8rem,4vw,3rem);
          font-weight:700; line-height:1; letter-spacing:-.03em;
        }
        .benefit-panel__title {
          font-family:var(--font-display);
          font-size:clamp(1.2rem,2.5vw,1.8rem);
          font-weight:700; color:#1a1a1a; line-height:1.2; letter-spacing:-.01em;
        }
        .benefit-panel__body {
          font-size:1rem; color:#374151; line-height:1.75; font-weight:400;
          max-width:480px;
        }
        /* dots */
        .benefit-dots {
          display:flex; gap:.5rem; justify-content:center; margin-top:2rem;
        }
        .benefit-dot {
          width:8px; height:8px; border-radius:999px;
          background:#d1d5db; border:none; cursor:pointer; padding:0;
          transition:all .3s var(--ease-out);
        }
        .benefit-dot.active{width:24px;background:var(--clr-primary);}

        /* ── S4: 6 BENEFIT CARDS ── */
        .wt-cards { background:#fff; padding:5rem 1.5rem; }
        .wt-inner { max-width:1200px; margin:0 auto; }
        .wt-sub { font-size:1rem; color:#374151; line-height:1.7; max-width:560px; margin-bottom:2.5rem; font-weight:500; }
        .cards-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem;
        }
        @media(max-width:900px){.cards-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:560px){.cards-grid{grid-template-columns:1fr;}}
        .benefit-card {
          border-radius:20px; padding:1.75rem;
          border:1px solid #e5e7eb; background:#fff;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
          transition:box-shadow .2s, transform .2s;
          display:flex; flex-direction:column; gap:.6rem;
        }
        .benefit-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.1);transform:translateY(-2px);}
        .benefit-card__icon{font-size:2rem;line-height:1;}
        .benefit-card__stat{
          font-family:var(--font-display);
          font-size:1.5rem; font-weight:700; line-height:1; letter-spacing:-.02em;
        }
        .benefit-card__title{font-size:1rem;font-weight:700;color:#1a1a1a;line-height:1.3;}
        .benefit-card__body{font-size:.9rem;color:#374151;line-height:1.7;font-weight:400;}

        /* ── S5: CLIMATE ── */
        .wt-climate {
          background:var(--clr-dark-bg);
          background-image:radial-gradient(ellipse 60% 80% at 20% 50%, rgba(82,183,136,.07) 0%, transparent 65%);
          padding:5rem 1.5rem; text-align:center;
        }
        .wt-climate__inner{max-width:800px;margin:0 auto;}
        .wt-eyebrow--light{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--clr-moss);margin-bottom:.5rem;}
        .wt-h2--light{
          font-family:var(--font-display);
          font-size:clamp(1.8rem,4vw,3rem);
          font-weight:700;color:#fff;line-height:1.15;letter-spacing:-.025em;margin-bottom:1.25rem;
        }
        .wt-h2--light em{font-style:italic;color:var(--clr-moss);}
        .wt-climate__body{font-size:1.05rem;color:rgba(255,255,255,.75);line-height:1.8;margin-bottom:2rem;font-weight:400;}
        .climate-callout {
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
          border-radius:16px; padding:1.5rem 2rem; margin:0 auto 2rem;
          max-width:580px; text-align:left;
        }
        .climate-callout__row{
          display:flex; align-items:center; gap:1rem;
          font-size:.95rem; color:rgba(255,255,255,.8);
          font-weight:500; line-height:1.5;
        }
        .climate-callout__row+.climate-callout__row{margin-top:.75rem;padding-top:.75rem;border-top:1px solid rgba(255,255,255,.08);}
        .climate-callout__icon{font-size:1.4rem;flex-shrink:0;}

        /* ── S6: USP ── */
        .wt-usp{background:var(--clr-cream);padding:5rem 1.5rem;}
        .wt-usp__header{text-align:center;max-width:600px;margin:0 auto 3rem;}
        .usp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;}
        @media(max-width:900px){.usp-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:480px){.usp-grid{grid-template-columns:1fr;}}
        .usp-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:20px;
          padding:1.75rem 1.5rem;
          box-shadow:0 2px 12px rgba(0,0,0,.05);
          transition:box-shadow .2s,transform .2s;
          border-top:3px solid var(--clr-accent);
        }
        .usp-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.1);transform:translateY(-2px);}
        .usp-card__icon{font-size:2rem;margin-bottom:.75rem;display:block;}
        .usp-card__title{font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:.5rem;}
        .usp-card__body{font-size:.9rem;color:#374151;line-height:1.65;font-weight:400;}
        .usp-cta{text-align:center;margin-top:2.5rem;}

        /* ── S7: CSR ── */
        .wt-csr{background:#fff;padding:5rem 0;}
        .wt-csr__inner{
          max-width:1200px;margin:0 auto;padding:0 1.5rem;
          display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;
        }
        @media(max-width:768px){.wt-csr__inner{grid-template-columns:1fr;gap:2rem;}}
        .wt-csr__img{
          position:relative;height:420px;border-radius:24px;overflow:hidden;
          background:linear-gradient(135deg,#1B4332,#2d6a4f);
        }
        .wt-csr__placeholder{
          position:absolute;inset:0;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:.75rem;
        }
        .wt-csr__placeholder-icon{font-size:4rem;opacity:.35;}
        .wt-csr__placeholder-label{font-size:.75rem;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;}
        .wt-csr__body{font-size:1rem;color:#374151;line-height:1.8;margin-bottom:1.5rem;font-weight:400;}
        .csr-pills{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:2rem;}
        .csr-pill{
          display:inline-flex;align-items:center;gap:.4rem;
          background:var(--clr-cream);border:1px solid #e5e7eb;
          border-radius:999px;padding:.4rem 1rem;
          font-size:.82rem;font-weight:600;color:var(--clr-primary);
        }
        .csr-btns{display:flex;gap:.75rem;flex-wrap:wrap;}
        .btn-green{
          background:var(--clr-primary);color:#fff;font-weight:700;font-size:.9rem;
          padding:.75rem 1.75rem;border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-green:hover{box-shadow:0 6px 20px rgba(44,95,45,.3);transform:translateY(-1px);}
        .btn-outline-green{
          background:transparent;color:var(--clr-primary);font-weight:600;font-size:.9rem;
          padding:.75rem 1.75rem;border-radius:999px;border:2px solid var(--clr-primary);
          cursor:pointer;text-decoration:none;display:inline-block;
          transition:background .2s,color .2s;
        }
        .btn-outline-green:hover{background:var(--clr-primary);color:#fff;}

        /* ── S8: MIYAWAKI ── */
        .wt-miyawaki{background:var(--clr-cream);padding:5rem 0;}
        .wt-miyawaki__inner{
          max-width:1200px;margin:0 auto;padding:0 1.5rem;
          display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;
        }
        @media(max-width:768px){.wt-miyawaki__inner{grid-template-columns:1fr;gap:2rem;}}
        .wt-miyawaki__text{order:1;}
        .wt-miyawaki__video{order:2;border-radius:24px;overflow:hidden;aspect-ratio:16/9;background:#111;}
        @media(max-width:768px){
          .wt-miyawaki__text{order:2;}
          .wt-miyawaki__video{order:1;}
        }
        .wt-miyawaki__video iframe{width:100%;height:100%;border:none;display:block;}
        .wt-miyawaki__body{font-size:1rem;color:#374151;line-height:1.8;margin-bottom:1.5rem;font-weight:400;}
        .miyawaki-facts{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.75rem;}
        .miyawaki-fact{
          display:flex;align-items:center;gap:.75rem;
          font-size:.95rem;font-weight:600;color:#1a1a1a;
        }
        .miyawaki-fact__dot{
          width:10px;height:10px;border-radius:50%;
          background:var(--clr-accent);flex-shrink:0;
          box-shadow:0 0 0 3px rgba(82,183,136,.2);
        }

        /* ── S9: NATIVE IMPORTANCE ── */
        .wt-native{background:#fff;padding:5rem 1.5rem;}
        .native-why{
          display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;
          margin-bottom:3rem;
        }
        @media(max-width:560px){.native-why{grid-template-columns:1fr;}}
        .native-why-card{
          display:flex;align-items:flex-start;gap:1rem;
          background:var(--clr-cream);border-radius:16px;padding:1.25rem;
        }
        .native-why-card__icon{font-size:1.5rem;flex-shrink:0;}
        .native-why-card__text{font-size:.92rem;color:#374151;line-height:1.65;font-weight:500;}

        /* ── S9b: SPECIES SCROLL ── */
        .wt-species{background:var(--clr-cream);padding:5rem 0;}
        .wt-species__header{
          max-width:1200px;margin:0 auto 2rem;padding:0 1.5rem;
          display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;
        }
        .species-track-wrap{position:relative;}
        .species-track {
          display:flex;gap:1.25rem;overflow-x:auto;
          scroll-snap-type:x mandatory;scrollbar-width:none;
          padding:0 1.5rem 1rem;scroll-behavior:smooth;
        }
        .species-track::-webkit-scrollbar{display:none;}
        .species-card{
          flex:0 0 260px;scroll-snap-align:start;
          border-radius:20px;overflow:hidden;background:#fff;
          border:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,.06);
          transition:box-shadow .2s,transform .2s;
        }
        .species-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.12);transform:translateY(-2px);}
        .species-card__img{
          height:180px;position:relative;overflow:hidden;
        }
        .species-card__placeholder{
          position:absolute;inset:0;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:.4rem;
        }
        .species-card__emoji{font-size:3rem;}
        .species-card__placeholder-label{font-size:.65rem;color:rgba(255,255,255,.4);letter-spacing:.06em;text-transform:uppercase;}
        .species-card__body{padding:1.25rem;}
        .species-card__name{font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:#1a1a1a;margin-bottom:.25rem;}
        .species-card__co2{
          display:inline-flex;align-items:center;gap:.3rem;
          background:var(--clr-cream);border-radius:999px;
          padding:2px 8px;font-size:.72rem;font-weight:700;
          color:var(--clr-primary);margin-bottom:.6rem;
        }
        .species-card__benefit{font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.5rem;}
        .species-card__fact{font-size:.78rem;color:#6B7280;line-height:1.55;}

        /* ── S10: FAQ ── */
        .wt-faq{background:var(--clr-dark-bg);padding:5rem 1.5rem;}
        .wt-faq__inner{max-width:860px;margin:0 auto;}
        .wt-faq-list{display:flex;flex-direction:column;gap:.75rem;margin-top:2.5rem;}
        .wt-faq-item{border:1px solid rgba(255,255,255,.1);border-radius:14px;overflow:hidden;background:rgba(255,255,255,.04);}
        .wt-faq-q{
          width:100%;display:flex;align-items:center;justify-content:space-between;
          padding:1.1rem 1.25rem;background:transparent;border:none;
          cursor:pointer;text-align:left;gap:1rem;
          font-family:var(--font-body);font-size:.95rem;font-weight:600;
          color:#fff;transition:background .2s;
        }
        .wt-faq-q:hover{background:rgba(255,255,255,.04);}
        .wt-faq-chevron{font-size:1rem;color:var(--clr-moss);flex-shrink:0;transition:transform .3s;}
        .wt-faq-chevron.open{transform:rotate(180deg);}
        .wt-faq-a{
          font-size:.92rem;color:rgba(255,255,255,.78);line-height:1.7;
          padding:0 1.25rem;max-height:0;overflow:hidden;
          transition:max-height .4s var(--ease-out),padding .3s;
        }
        .wt-faq-a.open{max-height:220px;padding:0 1.25rem 1.1rem;}

        /* ── S11: FINAL CTA ── */
        .wt-cta{
          background:linear-gradient(135deg,#1B4332 0%,#2C5F2D 50%,#40916C 100%);
          padding:5rem 1.5rem;text-align:center;
        }
        .wt-cta h2{
          font-family:var(--font-display);
          font-size:clamp(2rem,4vw,3.2rem);
          font-weight:700;color:#fff;margin-bottom:.75rem;letter-spacing:-.025em;
        }
        .wt-cta h2 em{font-style:italic;color:var(--clr-moss);}
        .wt-cta p{font-size:1.05rem;color:rgba(255,255,255,.7);margin-bottom:2.5rem;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.7;}
        .wt-cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
        .btn-white{
          background:#fff;color:var(--clr-primary);font-weight:700;font-size:.95rem;
          padding:.85rem 2.25rem;border-radius:999px;border:none;cursor:pointer;
          text-decoration:none;display:inline-block;
          transition:box-shadow .2s,transform .2s;
        }
        .btn-white:hover{box-shadow:0 6px 24px rgba(0,0,0,.2);transform:translateY(-1px);}
        .btn-outline-white{
          background:transparent;color:#fff;font-weight:600;font-size:.95rem;
          padding:.85rem 2.25rem;border-radius:999px;border:2px solid rgba(255,255,255,.4);
          cursor:pointer;text-decoration:none;display:inline-block;
          transition:border-color .2s,background .2s;
        }
        .btn-outline-white:hover{border-color:rgba(255,255,255,.8);background:rgba(255,255,255,.08);}

        @media(max-width:768px){
          .wt-benefits__header{flex-direction:column;align-items:flex-start;padding:0 1rem;}
          .wt-species__header{flex-direction:column;align-items:flex-start;}
        }
      `}</style>

      <main className="wt-page">

        {/* ══════════════ S1: HERO ══════════════ */}
        <section className="wt-hero">
          <div className="wt-hero__bg" />
          {/* Replace src with your image: /images/why-trees/hero.jpg */}
          <img
            src="/images/why-trees/hero.jpg"
            alt="Dense green forest canopy — EcoTree Impact Foundation"
            className="wt-hero__img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="wt-hero__overlay" />
          <div className="wt-hero__content">
            <div className="wt-hero__eyebrow">
              <span className="live-dot" />
              EcoTree Impact Foundation · Bangalore
            </div>
            <h1 className="wt-hero__h1">
              Why Trees Matter<br /><em>More Than Ever</em>
            </h1>
            <p className="wt-hero__sub">
              Before cities, before roads, before us — there were trees.
              And without them, none of us survive.
            </p>
            <div className="wt-hero__pills">
              {["🌱 Geo-Tagged Trees","📊 Personal Dashboard","📍 GPS Verified","🔄 3-Year Care","🛡️ Tree Guards","🧾 80G Tax Benefit"].map(p => (
                <span key={p} className="usp-pill">{p}</span>
              ))}
            </div>
            <div className="wt-hero__btns">
              <a href="/donate"  className="btn-hero-primary">🌱 Plant a Tree</a>
              <a href="/donate"  className="btn-hero-outline">🎁 Gift a Tree</a>
              <a href="/csr"     className="btn-hero-outline">🏢 CSR Partnership</a>
            </div>
          </div>
          <div className="wt-hero__scroll">
            <span>Scroll to explore</span>
            <span>↓</span>
          </div>
        </section>

        {/* ══════════════ S2: STATS BAR ══════════════ */}
        <section className="wt-stats">
          <div className="wt-stats__inner">
            {heroStats.map(s => (
              <div key={s.label} className="stat-card">
                <span className="stat-card__icon">{s.icon}</span>
                <span className="stat-card__val">{s.val}</span>
                <span className="stat-card__label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ S3: HORIZONTAL BENEFITS SCROLL ══════════════ */}
        <section className="wt-benefits">
          <div className="wt-benefits__header">
            <div className="wt-benefits__heading-wrap">
              <p className="wt-eyebrow">Why Trees Are Important</p>
              <h2 className="wt-h2">Six ways trees <em>keep us alive</em></h2>
            </div>
            <div className="benefit-nav">
              <button className="nav-btn" onClick={() => scrollBenefit("prev")} disabled={benefitIdx===0}>←</button>
              <span style={{fontSize:".8rem",color:"#6B7280",fontWeight:600,minWidth:40,textAlign:"center"}}>{benefitIdx+1}/{benefits.length}</span>
              <button className="nav-btn" onClick={() => scrollBenefit("next")} disabled={benefitIdx===benefits.length-1}>→</button>
            </div>
          </div>

          <div className="benefit-track" ref={scrollRef}>
            {benefits.map((b, i) => (
              <div key={b.id} className="benefit-panel">
                {/* Image left */}
                <div className="benefit-panel__img" style={{background:`linear-gradient(135deg,${b.color}99,${b.color}44)`}}>
                  <img
                    src={b.image}
                    alt={b.title}
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.85}}
                    onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }}
                  />
                  <div className="benefit-panel__placeholder">
                    <div className="benefit-panel__placeholder-icon">{b.icon}</div>
                    <div className="benefit-panel__placeholder-label">Upload: {b.id}.jpg</div>
                  </div>
                </div>
                {/* Text right */}
                <div className="benefit-panel__text">
                  <div className="benefit-panel__stat" style={{color:b.color}}>{b.stat}</div>
                  <h2 className="benefit-panel__title">{b.title}</h2>
                  <p className="benefit-panel__body">{b.body}</p>
                  <a href="/donate" className="btn-green" style={{alignSelf:"flex-start"}}>🌱 Plant a Tree</a>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="benefit-dots">
            {benefits.map((_, i) => (
              <button
                key={i}
                className={`benefit-dot${benefitIdx===i?" active":""}`}
                onClick={() => {
                  setBenefitIdx(i);
                  scrollRef.current?.children[i]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
                }}
              />
            ))}
          </div>
        </section>

        {/* ══════════════ S4: 6 BENEFIT CARDS ══════════════ */}
        <section className="wt-cards">
          <div className="wt-inner">
            <p className="wt-eyebrow">At a Glance</p>
            <h2 className="wt-h2" style={{marginBottom:".75rem"}}>Every tree does more than you think</h2>
            <p className="wt-sub">The science is clear — trees are the single most effective investment in a healthy planet.</p>
            <div className="cards-grid">
              {benefits.map(b => (
                <div key={b.id} className="benefit-card" style={{borderTop:`3px solid ${b.color}`}}>
                  <span className="benefit-card__icon">{b.icon}</span>
                  <div className="benefit-card__stat" style={{color:b.color}}>{b.stat}</div>
                  <div className="benefit-card__title">{b.title}</div>
                  <p className="benefit-card__body">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S5: CLIMATE ══════════════ */}
        <section className="wt-climate">
          <div className="wt-climate__inner">
            <p className="wt-eyebrow--light">The Climate Crisis</p>
            <h2 className="wt-h2--light">
              Every Second, We Lose a<br /><em>Football Field of Forest</em>
            </h2>
            <p className="wt-climate__body">
              Deforestation is not a distant problem. It is happening right now — and its
              effects are felt in our temperatures, our rainfall, and our air quality.
              Planting trees is not symbolic. It is one of the most direct, measurable
              actions any person or company can take against climate change.
            </p>
            <div className="climate-callout">
              <div className="climate-callout__row">
                <span className="climate-callout__icon">🌳</span>
                <span>1 tree absorbs <strong>22 kg of CO₂</strong> every year — quietly, reliably, for free.</span>
              </div>
              <div className="climate-callout__row">
                <span className="climate-callout__icon">🚗</span>
                <span>Your 10 trees = taking <strong>1 car off the road</strong> for an entire month.</span>
              </div>
              <div className="climate-callout__row">
                <span className="climate-callout__icon">💧</span>
                <span>Each tree saves <strong>3,785 litres of water</strong> per year through its root system.</span>
              </div>
            </div>
            <a href="/donate" className="btn-hero-primary">🌱 Offset Your Carbon Now</a>
          </div>
        </section>

        {/* ══════════════ S6: USP — ECOTREE DIFFERENCE ══════════════ */}
        <section className="wt-usp">
          <div className="wt-inner">
            <div className="wt-usp__header">
              <p className="wt-eyebrow" style={{textAlign:"center"}}>The EcoTree Difference</p>
              <h2 className="wt-h2" style={{textAlign:"center",marginBottom:".75rem"}}>
                Not all tree plantations are the same
              </h2>
              <p className="wt-sub" style={{textAlign:"center",margin:"0 auto 0"}}>
                Anyone can claim to plant trees. We prove it — with GPS, dashboards, and monthly field reports.
              </p>
            </div>
            <div className="usp-grid" style={{marginTop:"2.5rem"}}>
              {uspCards.map(u => (
                <div key={u.title} className="usp-card">
                  <span className="usp-card__icon">{u.icon}</span>
                  <div className="usp-card__title">{u.title}</div>
                  <p className="usp-card__body">{u.body}</p>
                </div>
              ))}
            </div>
            <div className="usp-cta">
              <a href="/dashboard" className="btn-green">📱 View Live Dashboard →</a>
            </div>
          </div>
        </section>

        {/* ══════════════ S7: CSR ══════════════ */}
        <section className="wt-csr">
          <div className="wt-csr__inner">
            <div className="wt-csr__img">
              <img
                src="/images/why-trees/csr-team.jpg"
                alt="Corporate team planting trees — EcoTree CSR programme"
                style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
                onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }}
              />
              <div className="wt-csr__placeholder">
                <div className="wt-csr__placeholder-icon">🏢</div>
                <div className="wt-csr__placeholder-label">Upload: csr-team.jpg</div>
              </div>
            </div>
            <div>
              <p className="wt-eyebrow">For Companies</p>
              <h2 className="wt-h2" style={{marginBottom:"1rem"}}>
                Why companies choose tree plantation for CSR
              </h2>
              <p className="wt-csr__body">
                ESG reporting is no longer optional. Companies need measurable,
                verifiable environmental impact — not just good intentions.
              </p>
              <p className="wt-csr__body">
                Tree plantation with EcoTree gives your company GPS-verified data,
                quarterly impact reports, and live dashboard access. Your team joins
                plantation drives. Your stakeholders see real numbers. Your ESG scores improve.
              </p>
              <div className="csr-pills">
                <span className="csr-pill">📊 Measurable impact data</span>
                <span className="csr-pill">📍 GPS-verified reporting</span>
                <span className="csr-pill">🏆 Public dashboard visibility</span>
              </div>
              <div className="csr-btns">
                <a href="/csr"     className="btn-green">🏢 Start CSR Project</a>
                <a href="/contact" className="btn-outline-green">📊 Request ESG Report</a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ S8: MIYAWAKI ══════════════ */}
        <section className="wt-miyawaki">
          <div className="wt-miyawaki__inner">
            <div className="wt-miyawaki__text">
              <p className="wt-eyebrow">Our Method</p>
              <h2 className="wt-h2" style={{marginBottom:"1rem"}}>
                The Miyawaki Method — forests that grow <em>10× faster</em>
              </h2>
              <p className="wt-miyawaki__body">
                Developed by Japanese botanist Akira Miyawaki, this method plants native
                trees 3 to 5 per square metre — creating dense, self-sustaining urban
                forests in just 3 years. No maintenance needed after that. Just a thriving
                ecosystem where there was once concrete.
              </p>
              <div className="miyawaki-facts">
                {["🌳 Grows 10× faster than conventional plantation","🌿 30× more dense — a real forest, not a garden","♻️ Self-sustaining within 3 years — zero maintenance"].map(f => (
                  <div key={f} className="miyawaki-fact">
                    <div className="miyawaki-fact__dot" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/donate" className="btn-green">🌳 Plant a Miyawaki Tree</a>
            </div>
            <div className="wt-miyawaki__video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/kFXrduVKU3Q?autoplay=1&loop=1&mute=1&controls=0&rel=0&playlist=kFXrduVKU3Q&modestbranding=1"
                title="Miyawaki forest plantation — EcoTree"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ══════════════ S9: NATIVE IMPORTANCE + SPECIES SCROLL ══════════════ */}
        <section className="wt-native">
          <div className="wt-inner">
            <p className="wt-eyebrow">Why Native Species Matter</p>
            <h2 className="wt-h2" style={{marginBottom:"1rem"}}>The importance of planting native trees</h2>
            <p className="wt-sub">
              Not all trees are equal. Native species evolved over thousands of years
              with local soil, rain, and wildlife — making them far more effective
              and sustainable than exotic varieties.
            </p>
            <div className="native-why">
              {nativeImportance.map((n,i) => (
                <div key={i} className="native-why-card">
                  <span className="native-why-card__icon">{n.icon}</span>
                  <span className="native-why-card__text">{n.point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wt-species">
          <div className="wt-species__header">
            <div>
              <p className="wt-eyebrow">Karnataka Native Species</p>
              <h2 className="wt-h2">Trees we plant — and <em>why each one matters</em></h2>
            </div>
            <div className="benefit-nav">
              <button className="nav-btn" onClick={() => scrollSpecies("left")}>←</button>
              <button className="nav-btn" onClick={() => scrollSpecies("right")}>→</button>
            </div>
          </div>
          <div className="species-track" ref={speciesRef}>
            {species.map(s => (
              <div key={s.name} className="species-card">
                <div className="species-card__img" style={{background:`linear-gradient(135deg,${s.color}cc,${s.color}44)`}}>
                  <img
                    src={s.image}
                    alt={`${s.name} tree — native Karnataka species`}
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.8}}
                    onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }}
                  />
                  <div className="species-card__placeholder">
                    <div className="species-card__emoji">{s.emoji}</div>
                    <div className="species-card__placeholder-label">Upload: {s.name.toLowerCase().replace(" ","-")}.jpg</div>
                  </div>
                </div>
                <div className="species-card__body">
                  <div className="species-card__name">{s.emoji} {s.name}</div>
                  <div className="species-card__co2">🌿 {s.co2}</div>
                  <div className="species-card__benefit">{s.benefit}</div>
                  <p className="species-card__fact">{s.fact}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ S10: FAQ ══════════════ */}
        <section className="wt-faq">
          <div className="wt-faq__inner">
            <p className="wt-eyebrow--light" style={{textAlign:"center"}}>Common Questions</p>
            <h2 className="wt-h2--light" style={{textAlign:"center",fontSize:"clamp(1.6rem,3vw,2.4rem)"}}>
              Frequently asked questions
            </h2>
            <div className="wt-faq-list">
              {faqs.map((f,i) => (
                <div key={i} className="wt-faq-item">
                  <button
                    className="wt-faq-q"
                    onClick={() => setOpenFaq(openFaq===i?null:i)}
                    aria-expanded={openFaq===i}
                  >
                    <span>{f.q}</span>
                    <span className={`wt-faq-chevron${openFaq===i?" open":""}`}>▾</span>
                  </button>
                  <div className={`wt-faq-a${openFaq===i?" open":""}`}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ S11: FINAL CTA ══════════════ */}
        <section className="wt-cta">
          <h2>Plant a Tree. <em>See It Grow.</em></h2>
          <p>
            Your contribution is not just a donation — it is a living, trackable
            piece of Karnataka's future. GPS-verified. Health-monitored. Yours.
          </p>
          <div className="wt-cta-btns">
            <a href="/donate"  className="btn-white">🌱 Plant a Tree</a>
            <a href="/donate"  className="btn-outline-white">🎁 Gift a Tree</a>
            <a href="/csr"     className="btn-outline-white">🏢 Partner for CSR</a>
          </div>
        </section>

      </main>
    </>
  );
}
