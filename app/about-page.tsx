import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About EcoTree | Transparent Tree Plantation & CSR NGO India',
  description:
    "EcoTree is India's first AI-verified tree plantation NGO. Every tree geo-tagged, QR-tracked and monitored for 3 years. Transparent ESG impact for CSR partners across Bangalore and India.",
  keywords: [
    'transparent tree plantation NGO India',
    'AI verified tree tracking',
    'CSR tree plantation Bangalore',
    'ESG sustainability NGO India',
    'tree survival rate tracking',
    'QR tree monitoring system',
  ],
  openGraph: {
    title: 'About EcoTree | Every Impact, Verified.',
    description:
      "We don't just plant trees. We prove they exist. AI-verified, geo-tagged, QR-tracked tree plantation NGO in India.",
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'EcoTree Impact Foundation',
      url: 'https://ecotree-project.vercel.app',
      description:
        "India's first AI-verified tree plantation NGO. Transparent, tech-enabled environmental impact across trees, waste, and water.",
      foundingDate: '2024',
      foundingLocation: 'Bangalore, Karnataka, India',
      areaServed: 'India',
      founder: [
        { '@type': 'Person', name: 'G V Bhimasena' },
        { '@type': 'Person', name: 'Poornima S.N' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'How do you track planted trees?', acceptedAnswer: { '@type': 'Answer', text: 'Every tree is geo-tagged with GPS coordinates and linked to a unique QR code, enabling real-time tracking of location, growth stage, and health condition through our live dashboard.' } },
        { '@type': 'Question', name: 'Can I see the tree I sponsored?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can scan the QR code on the physical tree or log into your personal dashboard to view photos, AI health scores, GPS location, and growth updates updated every 30 days.' } },
        { '@type': 'Question', name: 'What is your tree survival rate?', acceptedAnswer: { '@type': 'Answer', text: 'We maintain a 91% survival rate, significantly above the industry average of 60%, through AI-monitored health checks every 30 days and on-ground maintenance protocols.' } },
        { '@type': 'Question', name: 'How can companies partner with EcoTree for CSR?', acceptedAnswer: { '@type': 'Answer', text: 'Corporates can partner with us for tree plantation, waste recycling, and water conservation projects with full ESG reporting, live dashboards, employee tree dashboards, and 80G-eligible receipts.' } },
        { '@type': 'Question', name: 'How is waste recycled through EcoTree?', acceptedAnswer: { '@type': 'Answer', text: 'We convert plastic and urban waste into usable products like bricks, tiles, and construction materials, creating a circular economy with ward-by-ward tracking across Bangalore.' } },
        { '@type': 'Question', name: 'Do you provide ESG and impact reports?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We provide detailed ESG reports, live dashboards, and AI-verified impact data for all corporate partners and individual donors.' } },
        { '@type': 'Question', name: 'Is EcoTree an 80G registered NGO?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. EcoTree Impact Foundation is a registered Section 8 company. All donations are eligible for 80G tax deduction under the Income Tax Act, India.' } },
        { '@type': 'Question', name: 'How is EcoTree different from other plantation NGOs?', acceptedAnswer: { '@type': 'Answer', text: "EcoTree is India's only NGO that uses Claude AI to independently verify every tree photo — checking species match, GPS location, duplicate detection, and timestamp — before it reaches donors." } },
      ],
    },
  ],
};

const faqs = [
  { q: 'How do you track planted trees?', a: 'Every tree is geo-tagged with GPS coordinates and linked to a unique QR code, enabling real-time tracking of location, growth stage, and health condition through our live dashboard.' },
  { q: 'Can I see the tree I sponsored?', a: 'Yes. Scan the QR code on the physical tree or log into your personal dashboard to view photos, AI health scores, GPS location, and growth updates — refreshed every 30 days.' },
  { q: 'What is your tree survival rate?', a: 'We maintain a 91% survival rate, significantly above the industry average of 60%, through AI-monitored health checks and on-ground maintenance protocols.' },
  { q: 'How can companies partner with EcoTree for CSR?', a: 'Corporates can partner with us for tree plantation, waste recycling, and water conservation projects with full ESG reporting, live dashboards, employee tree dashboards, and 80G-eligible receipts.' },
  { q: 'How is waste recycled through EcoTree?', a: 'We convert plastic and urban waste into usable products like bricks, tiles, and construction materials — tracked ward by ward across Bangalore.' },
  { q: 'Do you provide ESG and impact reports?', a: 'Yes. We provide detailed ESG reports, live dashboards, and AI-verified impact data for all corporate partners. Reports are formatted for standard sustainability disclosures.' },
  { q: 'Is EcoTree an 80G registered NGO?', a: 'Yes. EcoTree Impact Foundation is a registered Section 8 company. All donations are eligible for 80G tax deduction under the Income Tax Act, India.' },
  { q: 'How is EcoTree different from other plantation NGOs?', a: "EcoTree is India's only NGO using Claude AI to independently verify every tree photo — checking species match, GPS coordinates, duplicate detection, and timestamp — before it reaches donors." },
];

const roles = [
  { title: 'Field Operations Lead', type: 'Full-time', location: 'Bangalore', icon: '🌱', desc: 'Oversee tree plantation drives, site selection, and on-ground team coordination across Bangalore.' },
  { title: 'AI / IoT Engineer', type: 'Full-time', location: 'Bangalore (Remote OK)', icon: '🤖', desc: 'Build and improve our AI photo verification pipeline and IoT sensor integrations for water and waste tracking.' },
  { title: 'Sustainability Intern', type: 'Internship · 3–6 months', location: 'Bangalore', icon: '🎓', desc: 'Research, content, and ground-level implementation support across our three environmental verticals.' },
  { title: 'CSR & Partnerships Manager', type: 'Full-time', location: 'Bangalore', icon: '🤝', desc: 'Own relationships with corporate CSR teams, drive ESG reporting workflows, and grow our partner portfolio.' },
  { title: 'Community Volunteer', type: 'Volunteer', location: 'Pan India', icon: '💚', desc: 'Join our plantation drives, awareness campaigns, and community events. No formal commitment required.' },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="about-page">

        {/* ── HERO ── */}
        <section className="ab-hero" id="top">
          <div className="ab-hero__bg" aria-hidden="true" />
          <div className="ab-container ab-hero__content">
            <div className="ab-badge">🌿 India&rsquo;s First AI-Verified Tree NGO</div>
            <h1 className="ab-hero__h1">
              We Don&rsquo;t Just Plant Trees.<br />
              <em>We Prove They Exist.</em>
            </h1>
            <p className="ab-hero__sub">
              EcoTree Impact Foundation builds a transparent, technology-driven ecosystem where every tree planted,
              every kilogram of waste recycled, and every drop of water conserved is{' '}
              <strong>measurable, verifiable, and visible in real time</strong>.
            </p>
            <div className="ab-hero__ctas">
              <a href="/donate"           className="ab-btn ab-btn--primary">🌱 Plant a Tree · ₹100</a>
              <a href="/donate/occasion"  className="ab-btn ab-btn--gold">🎁 Gift a Tree</a>
              <a href="/csr-partner"      className="ab-btn ab-btn--ghost">🤝 CSR Partner</a>
            </div>
            <div className="ab-hero__trust">
              <span>✓ 80G Tax Benefit</span>
              <span>✓ Certificate Instantly</span>
              <span>✓ AI-Verified</span>
              <span>✓ 3-Year Tracking</span>
            </div>
          </div>
        </section>

        {/* ── STICKY IN-PAGE NAV ── */}
        <nav className="ab-inpage-nav" aria-label="Page sections">
          <div className="ab-inpage-nav__inner">
            <a href="#mission">Mission</a>
            <a href="#story">Story</a>
            <a href="#impact">Impact</a>
            <a href="#leadership">Leadership</a>
            <a href="#careers">Careers</a>
            <a href="#faq">FAQ</a>
          </div>
        </nav>

        {/* ── MISSION ── */}
        <section className="ab-section ab-section--white" id="mission">
          <div className="ab-container">
            <div className="ab-label">Our Mission</div>
            <h2 className="ab-h2">Bridging the Gap Between<br />Intent and Impact</h2>
            <p className="ab-lead">
              Our mission is to create a transparent and accountable environmental ecosystem that ensures
              every sustainability effort — tree plantation, waste recycling, or water conservation —
              is backed by data, technology, and proof.
            </p>
            <div className="ab-mission-grid">
              <div className="ab-mission-card ab-mission-card--dark">
                <div className="ab-card-label">The Problem</div>
                <h3>Environmental initiatives that look impactful on paper</h3>
                <ul className="ab-list">
                  <li><span className="ab-x">✕</span> Trees planted but never tracked</li>
                  <li><span className="ab-x">✕</span> Survival rates unknown or unverified</li>
                  <li><span className="ab-x">✕</span> Waste recycling lacks visibility</li>
                  <li><span className="ab-x">✕</span> CSR projects without measurable accountability</li>
                  <li><span className="ab-x">✕</span> Greenwashing disguised as impact</li>
                </ul>
                <div className="ab-mission-quote">
                  The world doesn&rsquo;t need more promises. It needs <strong>proof of impact.</strong>
                </div>
              </div>
              <div className="ab-mission-card ab-mission-card--mint">
                <div className="ab-card-label">Our Approach</div>
                <h3>Verified Environmental Impact</h3>
                <ul className="ab-list">
                  <li><span className="ab-tick">✓</span> <strong>Geo-tagged tree plantation</strong> — GPS for every tree</li>
                  <li><span className="ab-tick">✓</span> <strong>QR-based tracking system</strong> — scan from anywhere</li>
                  <li><span className="ab-tick">✓</span> <strong>AI photo verification</strong> — 4-point check</li>
                  <li><span className="ab-tick">✓</span> <strong>Live impact dashboards</strong> — updated every 30 days</li>
                  <li><span className="ab-tick">✓</span> <strong>ESG-ready reporting</strong> — formatted for disclosures</li>
                </ul>
                <div className="ab-solution-tagline">
                  You don&rsquo;t just donate. You <strong>see your impact grow.</strong>
                </div>
                <a href="/donate" className="ab-btn ab-btn--primary ab-btn--sm" style={{marginTop:'1rem',display:'inline-flex'}}>🌱 Start Planting</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── STORY ── */}
        <section className="ab-section ab-section--dark" id="story">
          <div className="ab-container">
            <div className="ab-label ab-label--light">Our Story</div>
            <div className="ab-story-layout">
              <div className="ab-story-text">
                <h2 className="ab-h2 ab-h2--light">Born from a simple<br />but powerful realization</h2>
                <blockquote className="ab-story-quote">
                  &ldquo;What gets measured, gets sustained.&rdquo;
                </blockquote>
                <p>
                  We observed that many environmental initiatives — however well-intentioned —
                  lacked long-term accountability. Trees were planted, but few survived.
                  Waste was collected, but not efficiently reused. CSR budgets were spent
                  on promises, not proof.
                </p>
                <p>
                  As a technology company with two decades building verifiable systems for
                  industry, we asked: <em>What if every environmental action could be tracked
                  and independently verified?</em>
                </p>
                <p>
                  That question became EcoTree — where <strong>impact is not assumed.
                  It is proven.</strong>
                </p>
                <div className="ab-story-ctas">
                  <a href="/donate"      className="ab-btn ab-btn--primary-light">🌱 Plant a Tree</a>
                  <a href="/csr-partner" className="ab-btn ab-btn--ghost-light">🤝 Partner with Us</a>
                </div>
              </div>

              {/* ── VIDEO CARD ── */}
              <div className="ab-story-video">
                <div className="ab-video-card">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="ab-video"
                    poster="/images/trees-poster.jpg"
                  >
                    {/* Upload your video to: public/videos/trees.mp4 */}
                    <source src="/videos/trees.mp4" type="video/mp4" />
                  </video>
                  <div className="ab-video-overlay">
                    <div className="ab-video-badge">🌳 Real Trees. Real Impact.</div>
                  </div>
                </div>
                <div className="ab-video-stats">
                  <div className="ab-vstat">
                    <span className="ab-vstat__num">2024</span>
                    <span className="ab-vstat__label">Founded, Bangalore</span>
                  </div>
                  <div className="ab-vstat">
                    <span className="ab-vstat__num">3</span>
                    <span className="ab-vstat__label">Environmental verticals</span>
                  </div>
                  <div className="ab-vstat">
                    <span className="ab-vstat__num">AI</span>
                    <span className="ab-vstat__label">Every tree verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT STRIP ── */}
        <section className="ab-section ab-section--mint" id="impact">
          <div className="ab-container">
            <div className="ab-label">Our Impact</div>
            <p className="ab-impact-sub">Measured. Verified. Transparent.</p>
            <div className="ab-impact-grid">
              <div className="ab-impact-stat">
                <span className="ab-impact-icon">🌱</span>
                <span className="ab-impact-num">10,000+</span>
                <span className="ab-impact-label">Trees Planted</span>
                <span className="ab-impact-note">↑ 247 this month</span>
              </div>
              <div className="ab-impact-stat">
                <span className="ab-impact-icon">🎯</span>
                <span className="ab-impact-num">91%</span>
                <span className="ab-impact-label">Survival Rate</span>
                <span className="ab-impact-note">AI-monitored every 30 days</span>
              </div>
              <div className="ab-impact-stat">
                <span className="ab-impact-icon">♻️</span>
                <span className="ab-impact-num">48T</span>
                <span className="ab-impact-label">Waste Diverted</span>
                <span className="ab-impact-note">Tracked ward by ward</span>
              </div>
              <div className="ab-impact-stat">
                <span className="ab-impact-icon">💧</span>
                <span className="ab-impact-num">12M L</span>
                <span className="ab-impact-label">Water Restored</span>
                <span className="ab-impact-note">Lake restoration live</span>
              </div>
            </div>
            <div className="ab-impact-cta">
              <a href="/impact" className="ab-btn ab-btn--dark">📊 View Full Live Dashboard →</a>
            </div>
          </div>
        </section>

        {/* ── LEADERSHIP ── */}
        <section className="ab-section ab-section--white" id="leadership">
          <div className="ab-container">
            <div className="ab-label">Our Leadership</div>
            <h2 className="ab-h2">The Team Behind the Mission</h2>
            <p className="ab-section-sub">
              Technology veterans and sustainability advocates — united by the belief that
              environmental impact must be provable.
            </p>
            <div className="ab-leadership-grid">
              <div className="ab-leader-card">
                <div className="ab-leader-avatar" style={{background:'linear-gradient(135deg,#1B4332,#52B788)'}}>
                  <span>GVB</span>
                </div>
                <div className="ab-leader-info">
                  <h3>G V Bhimasena</h3>
                  <div className="ab-leader-title">Founder &amp; Director</div>
                  <p>
                    A technology entrepreneur with two decades building product engineering systems,
                    now applying that rigour to environmental impact. Rotary member and active
                    tree plantation advocate across Bangalore.
                  </p>
                  <div className="ab-leader-tags">
                    <span>Product Engineering</span>
                    <span>IoT &amp; AI Systems</span>
                    <span>Sustainability</span>
                  </div>
                </div>
              </div>
              <div className="ab-leader-card">
                <div className="ab-leader-avatar" style={{background:'linear-gradient(135deg,#2D6A4F,#74C69D)'}}>
                  <span>PSN</span>
                </div>
                <div className="ab-leader-info">
                  <h3>Poornima S.N</h3>
                  <div className="ab-leader-title">Co-Founder</div>
                  <p>
                    A social impact leader dedicated to community development, environmental
                    awareness, and grassroots engagement across Karnataka. Drives our
                    community partnerships and on-ground volunteer programs.
                  </p>
                  <div className="ab-leader-tags">
                    <span>Community Development</span>
                    <span>Environmental Awareness</span>
                    <span>Grassroots Programs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CAREERS ── */}
        <section className="ab-section ab-section--dark" id="careers">
          <div className="ab-container">
            <div className="ab-label ab-label--light">Join Us</div>
            <h2 className="ab-h2 ab-h2--light">Build Impact. Not Just a Career.</h2>
            <p className="ab-section-sub ab-section-sub--light">
              We are building a movement for measurable environmental impact. Join us if you want
              to work on real-world challenges at the intersection of technology and sustainability.
            </p>
            <div className="ab-roles-grid">
              {roles.map((role) => (
                <div className="ab-role-card" key={role.title}>
                  <div className="ab-role-top">
                    <span className="ab-role-icon">{role.icon}</span>
                    <div className="ab-role-meta">
                      <span className="ab-role-type">{role.type}</span>
                      <span className="ab-role-loc">📍 {role.location}</span>
                    </div>
                  </div>
                  <h3 className="ab-role-title">{role.title}</h3>
                  <p className="ab-role-desc">{role.desc}</p>
                  <a href="mailto:careers@ecotree.org" className="ab-role-apply">Apply →</a>
                </div>
              ))}
            </div>
            <div className="ab-careers-note">
              Don&rsquo;t see a fit? We&rsquo;re always open to passionate people.{' '}
              <a href="mailto:hello@ecotree.org">Write to us →</a>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="ab-section ab-section--white" id="faq">
          <div className="ab-container ab-container--narrow">
            <div className="ab-label">FAQ</div>
            <h2 className="ab-h2">Questions We Get Asked</h2>
            <p className="ab-section-sub">
              Everything you need to know before donating, partnering, or joining EcoTree.
            </p>
            <div className="ab-faq-list">
              {faqs.map((item, i) => (
                <details className="ab-faq-item" key={i}>
                  <summary className="ab-faq-q">
                    <span>{item.q}</span>
                    <span className="ab-faq-chevron" aria-hidden="true">›</span>
                  </summary>
                  <div className="ab-faq-a">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="ab-section ab-section--cta">
          <div className="ab-container">
            <div className="ab-cta-block">
              <div className="ab-badge">🌿 Make an Impact Today</div>
              <h2 className="ab-cta-h2">
                See Your Impact.<br /><em>Don&rsquo;t Just Imagine It.</em>
              </h2>
              <p className="ab-cta-p">
                Join EcoTree in building a future where every action is measurable
                and every impact is visible — with proof.
              </p>
              <div className="ab-cta-btns">
                <a href="/donate"           className="ab-btn ab-btn--primary ab-btn--lg">🌱 Plant a Tree · From ₹100</a>
                <a href="/donate/occasion"  className="ab-btn ab-btn--primary-light ab-btn--lg">🎁 Gift a Tree</a>
                <a href="/csr-partner"      className="ab-btn ab-btn--ghost ab-btn--lg">🤝 CSR Partner</a>
              </div>
              <div className="ab-cta-trust">
                <span>✓ 80G Tax Benefit</span>
                <span>✓ Certificate Instantly</span>
                <span>✓ AI-Verified</span>
                <span>✓ 3-Year Tracking</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <style>{`
        .about-page {
          --g-dark:    #1B4332;
          --g-mid:     #2D6A4F;
          --g-accent:  #52B788;
          --g-light:   #74C69D;
          --g-moss:    #97BC62;
          --g-gold:    #D4A853;
          --mint:      #D8F3DC;
          --mint-dk:   #B7E4C7;
          --off-white: #F8FAF8;
          --text-dark: #0D1F17;
          --text-body: #2D3B36;
          --text-muted:#5C7268;
          --radius:    0.875rem;
          --radius-sm: 0.5rem;
          font-family: var(--font-body, 'Segoe UI', system-ui, sans-serif);
          color: var(--text-dark);
        }
        .ab-container { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
        .ab-container--narrow { max-width:760px; }
        .ab-section { padding:3.5rem 0; }
        .ab-section--white { background:#fff; }
        .ab-section--dark  { background:var(--clr-dark-bg, var(--g-dark)); }
        .ab-section--mint  { background:var(--mint); }
        .ab-section--cta   { background:var(--clr-dark-bg, var(--g-dark)); }

        .ab-label {
          display:inline-block; font-size:0.68rem; font-weight:700;
          letter-spacing:0.13em; text-transform:uppercase;
          color:var(--g-accent); background:rgba(82,183,136,0.12);
          padding:0.28rem 0.8rem; border-radius:999px; margin-bottom:0.75rem;
        }
        .ab-label--light { color:var(--g-light); background:rgba(116,198,157,0.15); }
        .ab-badge {
          display:inline-block; font-size:0.78rem; font-weight:600;
          letter-spacing:0.06em; color:var(--g-light);
          background:rgba(82,183,136,0.18); border:1px solid rgba(82,183,136,0.35);
          padding:0.35rem 0.9rem; border-radius:999px; margin-bottom:1.1rem;
        }
        .ab-h2 {
          font-size:clamp(1.55rem,3.2vw,2.3rem); font-weight:800;
          line-height:1.18; color:var(--text-dark); margin:0 0 0.9rem;
        }
        .ab-h2--light { color:#fff; }
        .ab-h2 em, .ab-cta-h2 em { color:var(--g-accent); font-style:normal; }
        .ab-lead { font-size:1rem; line-height:1.75; color:var(--text-body); max-width:660px; margin-bottom:2rem; }
        .ab-section-sub { font-size:0.93rem; color:var(--text-muted); max-width:600px; margin-bottom:2rem; line-height:1.65; }
        .ab-section-sub--light { color:rgba(255,255,255,0.65); }

        .ab-btn {
          display:inline-flex; align-items:center; gap:0.4rem;
          font-size:0.9rem; font-weight:600; padding:0.65rem 1.4rem;
          border-radius:999px; text-decoration:none;
          transition:all 0.2s ease; white-space:nowrap;
        }
        .ab-btn--lg { font-size:0.95rem; padding:0.8rem 1.65rem; }
        .ab-btn--sm { font-size:0.82rem; padding:0.5rem 1.1rem; }
        .ab-btn--primary { background:var(--clr-primary,var(--g-accent)); color:#fff; box-shadow:0 2px 12px rgba(44,95,45,0.35); }
        .ab-btn--primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .ab-btn--gold { background:transparent; color:var(--clr-gold,var(--g-gold)); border:1.5px solid rgba(212,168,83,0.45); }
        .ab-btn--gold:hover { background:rgba(212,168,83,0.1); border-color:var(--clr-gold,var(--g-gold)); }
        .ab-btn--ghost { border:1.5px solid rgba(255,255,255,0.3); color:#fff; }
        .ab-btn--ghost:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.6); }
        .ab-btn--primary-light { background:#fff; color:var(--g-dark); }
        .ab-btn--primary-light:hover { background:var(--mint); color:var(--g-dark); }
        .ab-btn--ghost-light { border:1.5px solid rgba(255,255,255,0.3); color:rgba(255,255,255,0.85); }
        .ab-btn--ghost-light:hover { background:rgba(255,255,255,0.08); }
        .ab-btn--dark { background:var(--g-dark); color:#fff; }
        .ab-btn--dark:hover { background:var(--g-mid); }

        /* HERO */
        .ab-hero {
          position:relative; background:var(--clr-dark-bg,var(--g-dark));
          padding:4rem 0 3.5rem; text-align:center; overflow:hidden;
        }
        .ab-hero__bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 50%,rgba(82,183,136,0.1) 0%,transparent 60%),
            radial-gradient(ellipse 50% 80% at 85% 30%,rgba(116,198,157,0.07) 0%,transparent 55%);
          pointer-events:none;
        }
        .ab-hero__content { position:relative; z-index:1; }
        .ab-hero__h1 {
          font-size:clamp(1.8rem,4.5vw,3.2rem); font-weight:900;
          color:#fff; line-height:1.12; margin:0 0 1.1rem;
          max-width:760px; margin-left:auto; margin-right:auto;
        }
        .ab-hero__h1 em { color:var(--g-light); font-style:normal; }
        .ab-hero__sub {
          font-size:1rem; color:rgba(255,255,255,0.75);
          max-width:600px; margin:0 auto 2rem; line-height:1.7;
        }
        .ab-hero__sub strong { color:var(--g-light); }
        .ab-hero__ctas { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
        .ab-hero__trust {
          display:flex; gap:1.25rem; justify-content:center; flex-wrap:wrap;
          font-size:0.76rem; color:rgba(255,255,255,0.45); font-weight:500;
        }

        /* STICKY NAV */
        .ab-inpage-nav {
          position:sticky; top:80px; z-index:40;
          background:rgba(255,255,255,0.97); backdrop-filter:blur(8px);
          border-bottom:1px solid var(--mint-dk);
          box-shadow:0 1px 8px rgba(27,67,50,0.06);
        }
        .ab-inpage-nav__inner {
          max-width:1100px; margin:0 auto; padding:0 1.5rem;
          display:flex; overflow-x:auto; scrollbar-width:none;
        }
        .ab-inpage-nav__inner::-webkit-scrollbar { display:none; }
        .ab-inpage-nav__inner a {
          display:block; padding:0.75rem 1rem; font-size:0.82rem;
          font-weight:600; color:var(--text-muted); text-decoration:none;
          white-space:nowrap; border-bottom:2px solid transparent; transition:all 0.15s;
        }
        .ab-inpage-nav__inner a:hover { color:var(--g-dark); border-bottom-color:var(--g-accent); }

        /* MISSION */
        .ab-mission-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        @media(max-width:680px){ .ab-mission-grid{grid-template-columns:1fr;} }
        .ab-mission-card { border-radius:var(--radius); padding:1.75rem; }
        .ab-mission-card--dark { background:var(--clr-dark-bg,var(--g-dark)); color:#fff; }
        .ab-mission-card--mint { background:var(--mint); color:var(--text-dark); }
        .ab-card-label { font-size:0.67rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; opacity:0.55; margin-bottom:0.6rem; }
        .ab-mission-card h3 { font-size:1rem; font-weight:700; margin:0 0 1rem; line-height:1.4; }
        .ab-list { list-style:none; padding:0; margin:0 0 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
        .ab-list li { display:flex; align-items:flex-start; gap:0.55rem; font-size:0.9rem; line-height:1.5; }
        .ab-x    { color:#F87171; font-weight:700; flex-shrink:0; }
        .ab-tick { color:var(--g-mid); font-weight:700; flex-shrink:0; }
        .ab-mission-quote { font-size:0.87rem; color:rgba(255,255,255,0.65); border-left:3px solid var(--g-accent); padding-left:0.7rem; }
        .ab-mission-quote strong { color:#fff; }
        .ab-solution-tagline { font-size:0.87rem; color:var(--g-mid); font-weight:500; }
        .ab-solution-tagline strong { color:var(--g-dark); }

        /* STORY */
        .ab-story-layout { display:grid; grid-template-columns:1.2fr 0.8fr; gap:2.5rem; align-items:start; margin-top:1.5rem; }
        @media(max-width:768px){ .ab-story-layout{grid-template-columns:1fr;} .ab-story-video{order:-1;} }
        .ab-story-text p { color:rgba(255,255,255,0.78); font-size:0.95rem; line-height:1.75; margin-bottom:1rem; }
        .ab-story-text em { color:var(--g-light); font-style:normal; font-weight:500; }
        .ab-story-text strong { color:#fff; }
        .ab-story-quote {
          font-size:1.2rem; font-weight:700; color:var(--g-light);
          border-left:3px solid var(--g-accent); padding:0.4rem 0 0.4rem 1.1rem;
          margin:0 0 1.5rem; font-style:italic;
        }
        .ab-story-ctas { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1.5rem; }
        .ab-story-video { display:flex; flex-direction:column; gap:1rem; }
        .ab-video-card {
          position:relative; border-radius:var(--radius); overflow:hidden;
          aspect-ratio:9/16; max-height:400px;
          border:1px solid rgba(255,255,255,0.1);
          box-shadow:0 8px 40px rgba(0,0,0,0.4);
          background:rgba(255,255,255,0.04);
        }
        @media(max-width:768px){ .ab-video-card{aspect-ratio:16/9; max-height:none;} }
        .ab-video { width:100%; height:100%; object-fit:cover; display:block; }
        .ab-video-overlay {
          position:absolute; bottom:0; left:0; right:0; padding:0.85rem;
          background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%);
        }
        .ab-video-badge {
          display:inline-block; font-size:0.72rem; font-weight:600;
          color:#fff; background:rgba(82,183,136,0.3);
          border:1px solid rgba(82,183,136,0.4); padding:0.28rem 0.7rem; border-radius:999px;
        }
        .ab-video-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:0.65rem; }
        .ab-vstat {
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
          border-radius:var(--radius-sm); padding:0.65rem 0.4rem; text-align:center;
          display:flex; flex-direction:column; gap:0.15rem;
        }
        .ab-vstat__num { font-size:1.2rem; font-weight:900; color:var(--g-light); line-height:1; }
        .ab-vstat__label { font-size:0.63rem; color:rgba(255,255,255,0.5); }

        /* IMPACT */
        .ab-impact-sub { font-size:0.8rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--g-mid); margin-bottom:1.75rem; }
        .ab-impact-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        @media(max-width:640px){ .ab-impact-grid{grid-template-columns:repeat(2,1fr);} }
        .ab-impact-stat {
          background:#fff; border-radius:var(--radius); padding:1.25rem 0.9rem;
          text-align:center; display:flex; flex-direction:column; gap:0.35rem;
          box-shadow:0 2px 12px rgba(27,67,50,0.07);
        }
        .ab-impact-icon { font-size:1.4rem; }
        .ab-impact-num { font-size:1.7rem; font-weight:900; color:var(--g-dark); line-height:1; }
        .ab-impact-label { font-size:0.8rem; font-weight:600; color:var(--text-body); }
        .ab-impact-note { font-size:0.7rem; color:var(--text-muted); }
        .ab-impact-cta { text-align:center; }

        /* LEADERSHIP */
        .ab-leadership-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.5rem; }
        @media(max-width:680px){ .ab-leadership-grid{grid-template-columns:1fr;} }
        .ab-leader-card {
          display:flex; gap:1.25rem; background:var(--off-white);
          border:1px solid var(--mint-dk); border-radius:var(--radius);
          padding:1.5rem; align-items:flex-start;
        }
        .ab-leader-avatar { width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:#fff; flex-shrink:0; letter-spacing:0.04em; }
        .ab-leader-info h3 { font-size:1rem; font-weight:700; color:var(--g-dark); margin:0 0 0.15rem; }
        .ab-leader-title { font-size:0.72rem; font-weight:600; color:var(--g-accent); margin-bottom:0.6rem; text-transform:uppercase; letter-spacing:0.07em; }
        .ab-leader-info p { font-size:0.87rem; color:var(--text-body); line-height:1.65; margin:0 0 0.85rem; }
        .ab-leader-tags { display:flex; flex-wrap:wrap; gap:0.35rem; }
        .ab-leader-tags span { font-size:0.68rem; font-weight:600; background:var(--mint); color:var(--g-dark); padding:0.22rem 0.6rem; border-radius:999px; }

        /* CAREERS */
        .ab-roles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.75rem; }
        @media(max-width:860px){ .ab-roles-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:560px){ .ab-roles-grid{grid-template-columns:1fr;} }
        .ab-role-card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.11); border-radius:var(--radius); padding:1.25rem; display:flex; flex-direction:column; gap:0.65rem; transition:background 0.2s; }
        .ab-role-card:hover { background:rgba(255,255,255,0.1); }
        .ab-role-top { display:flex; align-items:center; justify-content:space-between; gap:0.5rem; }
        .ab-role-icon { font-size:1.4rem; }
        .ab-role-meta { display:flex; flex-direction:column; gap:0.1rem; text-align:right; }
        .ab-role-type { font-size:0.67rem; font-weight:700; color:var(--g-light); text-transform:uppercase; letter-spacing:0.07em; }
        .ab-role-loc { font-size:0.68rem; color:rgba(255,255,255,0.45); }
        .ab-role-title { font-size:0.95rem; font-weight:700; color:#fff; margin:0; }
        .ab-role-desc { font-size:0.84rem; color:rgba(255,255,255,0.65); line-height:1.6; margin:0; flex:1; }
        .ab-role-apply { display:inline-block; font-size:0.82rem; font-weight:600; color:var(--g-light); text-decoration:none; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.1); transition:color 0.15s; }
        .ab-role-apply:hover { color:#fff; }
        .ab-careers-note { text-align:center; font-size:0.87rem; color:rgba(255,255,255,0.5); }
        .ab-careers-note a { color:var(--g-light); text-decoration:none; font-weight:600; }
        .ab-careers-note a:hover { text-decoration:underline; }

        /* FAQ */
        .ab-faq-list { display:flex; flex-direction:column; gap:0.6rem; margin-top:1.75rem; }
        .ab-faq-item { border:1px solid var(--mint-dk); border-radius:var(--radius-sm); overflow:hidden; }
        .ab-faq-item[open] { border-color:var(--g-accent); }
        .ab-faq-q { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.95rem 1.1rem; font-size:0.93rem; font-weight:600; color:var(--g-dark); cursor:pointer; list-style:none; background:var(--off-white); transition:background 0.15s; }
        .ab-faq-q:hover, .ab-faq-item[open] .ab-faq-q { background:var(--mint); }
        .ab-faq-q::-webkit-details-marker { display:none; }
        .ab-faq-chevron { font-size:1.1rem; color:var(--g-accent); transition:transform 0.2s; flex-shrink:0; }
        .ab-faq-item[open] .ab-faq-chevron { transform:rotate(90deg); }
        .ab-faq-a { padding:0.9rem 1.1rem 1.1rem; font-size:0.9rem; line-height:1.7; color:var(--text-body); background:#fff; border-top:1px solid var(--mint-dk); }

        /* CTA */
        .ab-cta-block { text-align:center; max-width:640px; margin:0 auto; }
        .ab-cta-h2 { font-size:clamp(1.6rem,3.8vw,2.6rem); font-weight:900; color:#fff; line-height:1.2; margin:0.75rem 0 0.9rem; }
        .ab-cta-p { color:rgba(255,255,255,0.68); font-size:0.97rem; line-height:1.65; margin-bottom:1.75rem; }
        .ab-cta-btns { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
        .ab-cta-trust { display:flex; gap:1.25rem; justify-content:center; flex-wrap:wrap; font-size:0.75rem; color:rgba(255,255,255,0.45); font-weight:500; }

        /* MOBILE */
        @media(max-width:480px){
          .ab-section { padding:2.5rem 0; }
          .ab-hero { padding:3rem 0 2.5rem; }
          .ab-hero__ctas { flex-direction:column; align-items:center; }
          .ab-cta-btns { flex-direction:column; align-items:center; }
          .ab-story-ctas { flex-direction:column; }
        }
      `}</style>
    </>
  );
}
