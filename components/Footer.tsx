import Link from 'next/link'

const LOGO_SVG = (
  <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="20" r="19" fill="rgba(44,95,45,0.35)" stroke="rgba(151,188,98,0.3)" strokeWidth="0.75"/>
    <rect x="18.5" y="27" width="3" height="7" rx="1.5" fill="#97BC62"/>
    <path d="M10 27 L20 13 L30 27 Z" fill="#2C5F2D"/>
    <path d="M12.5 22 L20 10 L27.5 22 Z" fill="#3a7a3b"/>
    <path d="M15 17.5 L20 8 L25 17.5 Z" fill="#97BC62"/>
    <circle cx="20" cy="7" r="1.2" fill="#c8e08a" opacity="0.8"/>
  </svg>
)

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/why-trees', label: 'Trees' },
      { href: '/waste',     label: 'Waste' },
      { href: '/water',     label: 'Water' },
      { href: '/dashboard', label: 'Live Dashboard' },
      { href: '/dashboard', label: 'Impact Map' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { href: '/donate',  label: 'Donate a Tree' },
      { href: '/donate',  label: 'Gift a Tree' },
      { href: '/contact', label: 'Volunteer' },
      { href: '/contact', label: 'Events' },
      { href: '/my-tree', label: 'Field Worker App' },
    ],
  },
  {
    title: 'CSR',
    links: [
      { href: '/csr',     label: 'Why Partner' },
      { href: '/dashboard',label: 'CSR Dashboard' },
      { href: '/csr',     label: 'ESG Reports' },
      { href: '/contact', label: 'Become a Partner' },
      { href: '/csr',     label: 'Case Studies' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about',   label: 'Our Story' },
      { href: '/about',   label: 'Team' },
      { href: '/blog',    label: 'Blog' },
      { href: '/about',   label: 'Technology' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
]
    title: 'About',
    links: [
      { href: '/about',            label: 'Our Story' },
      { href: '/about/team',       label: 'Team' },
      { href: '/blog',             label: 'Blog' },
      { href: '/about/technology', label: 'Technology' },
      { href: '/contact',          label: 'Contact Us' },
    ],
  },
]

const socials = [
  { label: 'LinkedIn',   href: 'https://linkedin.com', svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: 'X',          href: 'https://x.com',        svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: 'Instagram',  href: 'https://instagram.com', svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { label: 'YouTube',    href: 'https://youtube.com',   svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
]

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Top: brand + columns */}
        <div className="footer__top">
          <div className="footer__brand">
            <Link href="/" className="footer__logo" aria-label="EcoTree Home">
              {LOGO_SVG}
              <div className="footer__logo-text">
                <span className="footer__logo-name">Eco<span>Tree</span></span>
                <span className="footer__logo-tagline">Every impact, verified.</span>
              </div>
            </Link>
            <p className="footer__mission">
              Tech-powered environmental action — every tree planted is GPS-tagged, AI-verified, and trackable for 3 years.
            </p>
          </div>

          <nav className="footer__columns" aria-label="Footer navigation">
            {columns.map(col => (
              <div key={col.title}>
                <p className="footer__col-title">{col.title}</p>
                <ul className="footer__col-links">
                  {col.links.map(link => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-row">
            <p className="footer__copyright">© 2026 <strong>EcoTree.</strong> All rights reserved.</p>
            <ul className="footer__legal">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <div className="footer__legal-sep" aria-hidden="true" />
              <li><Link href="/terms">Terms of Use</Link></li>
              <div className="footer__legal-sep" aria-hidden="true" />
              <li><Link href="/refunds">Refund Policy</Link></li>
            </ul>
            <div className="footer__social" aria-label="Social media">
              {socials.map(s => (
                <a key={s.label} href={s.href} className="footer__social-link" aria-label={s.label} target="_blank" rel="noopener">
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
          <p className="footer__trust">
            Section 8 Company <span>·</span> 12A Registered <span>·</span> 80G Approved <span>·</span> NGO Darpan Certified <span>·</span> CSR-1 Filed
          </p>
        </div>
      </div>

      <style>{`
        .footer { background:var(--clr-dark-bg); background-image:radial-gradient(ellipse 80% 40% at 50% 0%,rgba(151,188,98,0.06) 0%,transparent 60%); color:#fff; border-top:1px solid rgba(151,188,98,0.18); }
        .footer__top { padding:3rem 0 2.5rem; display:flex; align-items:flex-start; gap:4rem; border-bottom:1px solid rgba(255,255,255,0.07); }
        .footer__brand { flex:0 0 280px; }
        .footer__logo { display:flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:1rem; }
        .footer__logo-text { display:flex; flex-direction:column; line-height:1; }
        .footer__logo-name { font-family:var(--font-display); font-size:1.35rem; font-weight:700; color:#fff; letter-spacing:-0.02em; }
        .footer__logo-name span { color:var(--clr-moss); }
        .footer__logo-tagline { font-size:0.6875rem; font-weight:500; color:rgba(255,255,255,0.82); letter-spacing:0.1em; text-transform:uppercase; margin-top:5px; }
        .footer__mission { font-size:0.875rem; color:rgba(255,255,255,0.52); line-height:1.75; max-width:260px; }
        .footer__columns { flex:1; display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; }
        .footer__col-title { font-size:0.75rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--clr-moss); margin-bottom:1.25rem; }
        .footer__col-links { list-style:none; display:flex; flex-direction:column; gap:0.75rem; }
        .footer__col-links a { font-size:0.875rem; color:rgba(255,255,255,0.65); text-decoration:none; transition:color 0.15s; }
        .footer__col-links a:hover { color:#fff; }
        .footer__bottom { padding:1.5rem 0; border-top:1px solid rgba(255,255,255,0.14); }
        .footer__bottom-row { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; }
        .footer__copyright { font-size:0.75rem; color:rgba(255,255,255,0.65); }
        .footer__copyright strong { color:rgba(255,255,255,0.85); font-weight:500; }
        .footer__legal { display:flex; align-items:center; gap:1.25rem; list-style:none; }
        .footer__legal a { font-size:0.75rem; color:rgba(255,255,255,0.65); text-decoration:none; transition:color 0.15s; }
        .footer__legal a:hover { color:rgba(255,255,255,0.95); }
        .footer__legal-sep { width:1px; height:12px; background:rgba(255,255,255,0.25); flex-shrink:0; }
        .footer__social { display:flex; align-items:center; gap:0.75rem; }
        .footer__social-link { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:rgba(255,255,255,0.7); text-decoration:none; transition:background 0.15s,color 0.15s,border-color 0.15s; }
        .footer__social-link:hover { background:rgba(151,188,98,0.15); border-color:rgba(151,188,98,0.35); color:var(--clr-moss); }
        .footer__trust { width:100%; padding-top:1rem; text-align:center; font-size:0.6875rem; font-weight:500; color:rgba(255,255,255,0.55); letter-spacing:0.08em; text-transform:uppercase; }
        .footer__trust span { margin:0 0.75rem; color:rgba(151,188,98,0.7); }
        @media (max-width:820px) { .footer__top{flex-direction:column;gap:2rem;padding:2.5rem 0 2rem} .footer__brand{flex:none} .footer__columns{grid-template-columns:repeat(2,1fr)} }
        @media (max-width:520px) { .footer__bottom-row{flex-direction:column;align-items:flex-start} .footer__columns{grid-template-columns:repeat(2,1fr)} }
      `}</style>
    </footer>
  )
}
