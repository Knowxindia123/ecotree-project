'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const navLinks = [
    { href: '/about',     label: 'About' },
    { href: '/why-trees', label: 'Why Trees' },
    { href: '/waste',     label: 'Waste' },
    { href: '/water',     label: 'Water' },
    { href: '/impact',    label: 'Impact' },
    { href: '/csr',       label: 'CSR' },
    { href: '/blog',      label: 'Blog' },
  ]

  return (
    <>
      <nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo" aria-label="EcoTree Home">
            <svg className="logo-mark" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="rgba(44,95,45,0.35)" stroke="rgba(151,188,98,0.3)" strokeWidth="0.75"/>
              <rect x="18.5" y="27" width="3" height="7" rx="1.5" fill="#97BC62"/>
              <path d="M10 27 L20 13 L30 27 Z" fill="#2C5F2D"/>
              <path d="M12.5 22 L20 10 L27.5 22 Z" fill="#3a7a3b"/>
              <path d="M15 17.5 L20 8 L25 17.5 Z" fill="#97BC62"/>
              <circle cx="20" cy="7" r="1.2" fill="#c8e08a" opacity="0.8"/>
            </svg>
            <div className="navbar__logo-text">
              <span className="navbar__logo-name">Eco<span>Tree</span></span>
              <span className="navbar__logo-tagline">Every impact, verified.</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="navbar__nav" role="list">
            {navLinks.map(link => (
              <li key={link.href} className="navbar__nav-item">
                <Link href={link.href} className="navbar__nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="navbar__actions">
            <Link href="/donate"      className="btn-nav-plant">🌱 Plant a Tree</Link>
            <Link href="/csr-partner" className="btn-nav-csr">🤝 CSR Partner</Link>
          </div>

          {/* Hamburger */}
          <button
            className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}
        id="mobileMenu"
        role="dialog"
        aria-label="Mobile navigation"
      >
        <ul className="navbar__mobile-nav" role="list">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="navbar__mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <span className="mob-icon">
                  {link.label === 'About'     ? '👋' :
                   link.label === 'Why Trees' ? '🌳' :
                   link.label === 'Waste'     ? '♻️' :
                   link.label === 'Water'     ? '💧' :
                   link.label === 'Impact'    ? '📊' :
                   link.label === 'CSR'       ? '🏢' : '✍️'}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-actions">
          <Link href="/donate"      className="btn-mob-plant" onClick={() => setMenuOpen(false)}>🌱 Plant a Tree</Link>
          <Link href="/csr-partner" className="btn-mob-csr"   onClick={() => setMenuOpen(false)}>🤝 CSR Partner</Link>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000; height: 80px;
          background: var(--clr-dark-bg);
          background-image: radial-gradient(ellipse 70% 90% at 50% -20%, rgba(151,188,98,0.08) 0%, transparent 65%);
          border-bottom: 1px solid rgba(151,188,98,0.18);
          display: flex; align-items: center;
          transition: box-shadow 0.25s ease;
        }
        .navbar.scrolled { box-shadow: 0 2px 40px rgba(0,0,0,0.4); }
        .navbar__inner {
          max-width: var(--max-w); width: 100%; margin: 0 auto;
          padding: 0 1.5rem;
          display: flex; align-items: center; gap: 1.5rem;
        }
        .navbar__logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .logo-mark { transition: transform 0.25s ease; }
        .navbar__logo:hover .logo-mark { transform: scale(1.08) rotate(-4deg); }
        .navbar__logo-text { display:flex; flex-direction:column; line-height:1; }
        .navbar__logo-name { font-family:var(--font-display); font-size:1.25rem; font-weight:700; color:#fff; letter-spacing:-0.02em; }
        .navbar__logo-name span { color: var(--clr-moss); }
        .navbar__logo-tagline { font-size:0.6875rem; font-weight:500; color:rgba(255,255,255,0.82); letter-spacing:0.1em; text-transform:uppercase; margin-top:5px; }
        .navbar__nav { flex:1; display:flex; align-items:center; justify-content:center; gap:0; list-style:none; }
        .navbar__nav-item { position:relative; }
        .navbar__nav-link { display:flex; align-items:center; font-size:0.9375rem; font-weight:500; color:rgba(255,255,255,0.68); text-decoration:none; padding:0.45rem 0.7rem; border-radius:6px; transition:color 0.15s,background 0.15s; }
        .navbar__nav-link:hover { color:#fff; background:rgba(255,255,255,0.07); }
        .navbar__actions { display:flex; align-items:center; gap:0.75rem; flex-shrink:0; }
        .btn-nav-plant { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-body); font-size:0.9375rem; font-weight:600; color:#fff; background:var(--clr-primary); border:none; border-radius:999px; padding:0.55rem 1.1rem; cursor:pointer; text-decoration:none; box-shadow:0 2px 12px rgba(44,95,45,0.5); transition:all 0.25s ease; white-space:nowrap; }
        .btn-nav-plant:hover { background:var(--clr-primary-hover); transform:translateY(-1px); }
        .btn-nav-csr { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-body); font-size:0.9375rem; font-weight:600; color:var(--clr-gold); background:transparent; border:1.5px solid rgba(212,168,83,0.45); border-radius:999px; padding:0.5rem 1.1rem; cursor:pointer; text-decoration:none; transition:all 0.25s ease; white-space:nowrap; }
        .btn-nav-csr:hover { background:rgba(212,168,83,0.1); border-color:var(--clr-gold); }
        .navbar__hamburger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:40px; height:40px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:6px; cursor:pointer; margin-left:auto; transition:background 0.15s; }
        .navbar__hamburger span { display:block; width:18px; height:1.5px; background:rgba(255,255,255,0.85); border-radius:2px; transition:all 0.25s ease; transform-origin:center; }
        .navbar__hamburger.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
        .navbar__hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
        .navbar__hamburger.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }
        .navbar__mobile-menu { position:fixed; top:80px; left:0; right:0; background:var(--clr-dark-bg); border-bottom:1px solid rgba(151,188,98,0.18); padding:1rem 1.25rem 1.5rem; transform:translateY(-8px); opacity:0; pointer-events:none; transition:transform 0.4s ease,opacity 0.25s ease; z-index:999; }
        .navbar__mobile-menu.open { transform:translateY(0); opacity:1; pointer-events:all; }
        .navbar__mobile-nav { list-style:none; display:flex; flex-direction:column; gap:0.25rem; margin-bottom:1.25rem; }
        .navbar__mobile-nav-link { display:flex; align-items:center; gap:0.75rem; font-size:1rem; font-weight:500; color:rgba(255,255,255,0.78); text-decoration:none; padding:0.75rem; border-radius:6px; transition:background 0.15s,color 0.15s; }
        .navbar__mobile-nav-link:hover { background:rgba(255,255,255,0.07); color:#fff; }
        .mob-icon { width:32px; height:32px; background:rgba(151,188,98,0.12); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
        .navbar__mobile-actions { display:flex; flex-direction:column; gap:0.75rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.08); }
        .btn-mob-plant { width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.875rem; background:var(--clr-primary); color:#fff; font-family:var(--font-body); font-size:1rem; font-weight:600; border:none; border-radius:12px; cursor:pointer; text-decoration:none; }
        .btn-mob-csr { width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.875rem; background:transparent; color:var(--clr-gold); font-family:var(--font-body); font-size:1rem; font-weight:600; border:1.5px solid rgba(212,168,83,0.45); border-radius:12px; cursor:pointer; text-decoration:none; }
        @media (max-width: 820px) {
          .navbar__nav, .navbar__actions { display:none; }
          .navbar__hamburger { display:flex; }
        }
      `}</style>
    </>
  )
}
