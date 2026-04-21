'use client'
import React, { useState } from 'react'

const WEB3FORMS_KEY = 'f2635df8-33a5-44ef-889c-9f823771927f'
const WHATSAPP = '919886094611'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'CSR Environmental Projects India | EcoTree Impact Foundation',
      description: 'Partner with EcoTree for verified CSR environmental projects — tree plantation, lake rejuvenation, plastic waste recycling, Miyawaki forests, and employee engagement drives across India.',
      url: 'https://ecotree-project.vercel.app/csr',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Can CSR funds be used for tree plantation under the Companies Act?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tree plantation and afforestation are explicitly listed under Schedule VII of the Companies Act 2013 as eligible CSR activities under environmental sustainability.' } },
        { '@type': 'Question', name: 'Do you provide BRSR-compatible ESG reports?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. EcoTree provides detailed ESG reports formatted for BRSR (Business Responsibility and Sustainability Reporting) disclosure requirements for listed Indian companies.' } },
        { '@type': 'Question', name: 'What is the minimum budget to start a CSR project with EcoTree?', acceptedAnswer: { '@type': 'Answer', text: 'Our Starter partnerships begin from ₹1 Lakh, covering geo-tagged tree plantation with real-time tracking dashboards and ESG reporting.' } },
        { '@type': 'Question', name: 'How do you verify trees have not been counted twice or replaced?', acceptedAnswer: { '@type': 'Answer', text: 'Every tree is assigned a unique GPS coordinate and QR code. Claude AI independently verifies each photo for species match, GPS location, timestamp, and duplicate detection before it appears on any dashboard.' } },
        { '@type': 'Question', name: 'Do employees get individual tree dashboards?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each employee can be assigned their own tree with a personal dashboard showing GPS location, monthly photos, AI health scores, and CO₂ offset — making CSR personal and engaging.' } },
        { '@type': 'Question', name: 'Is EcoTree 80G registered?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. EcoTree Impact Foundation is a registered Section 8 company with 80G approval. All CSR contributions are eligible for tax deduction under the Income Tax Act, India.' } },
        { '@type': 'Question', name: 'How quickly can a CSR project be started?', acceptedAnswer: { '@type': 'Answer', text: 'Most projects can be initiated within 2–3 weeks of signing. Plantation drives aligned with monsoon season (June–September) are ideal for best survival rates.' } },
        { '@type': 'Question', name: 'Can EcoTree execute multi-city CSR projects?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We execute projects across Karnataka and are expanding pan-India. Enterprise partners receive a unified dashboard tracking all locations, sites, and metrics in one place.' } },
      ],
    },
  ],
}

const impactAreas = [
  {
    icon: '🌳',
    title: 'Tree Plantation Drives',
    sub: 'Miyawaki Forests + Geo-Tagged Plantations',
    points: ['Native species Miyawaki dense forests', 'GPS-tagged trees with QR codes', 'Employee plantation engagement events', '3-year survival tracking & reporting'],
    tag: 'Most Popular',
    tagColor: '#52B788',
  },
  {
    icon: '💧',
    title: 'Lake Rejuvenation',
    sub: 'Urban Lake & Water Body Restoration',
    points: ['Lake desilting and boundary restoration', 'Floating trash boom installation', 'Vetiver grass & native plant buffer', 'Groundwater recharge monitoring'],
    tag: 'High Impact',
    tagColor: '#3B82F6',
  },
  {
    icon: '♻️',
    title: 'Urban Waste Processing',
    sub: 'Plastic Collection & Circular Economy',
    points: ['Ward-level plastic collection drives', 'Segregation & recycling systems', 'Waste-to-product circular model', 'Real-time diversion tracking'],
    tag: null,
    tagColor: '',
  },
  {
    icon: '🧱',
    title: 'Plastic → Products',
    sub: 'Bricks, Tiles, Benches, School Desks',
    points: ['Plastic waste → construction bricks', 'Recycled tiles & paving blocks', 'School desks & park benches', 'Verified circular economy reporting'],
    tag: 'Unique',
    tagColor: '#F59E0B',
  },
  {
    icon: '🌊',
    title: 'Water Conservation',
    sub: 'Rainwater Harvesting & Borewell Recharge',
    points: ['Rainwater harvesting systems', 'Borewell recharge structures', 'Community water ATMs (solar)', 'Water quality IoT monitoring'],
    tag: null,
    tagColor: '',
  },
  {
    icon: '🛣️',
    title: 'Plastic Pyramid Roads',
    sub: 'Roads, Benches & Furniture from Waste',
    points: ['Plastic-blended road construction', 'Park benches & outdoor furniture', 'School desks for government schools', 'EPR compliance documentation'],
    tag: 'EPR Ready',
    tagColor: '#8B5CF6',
  },
  {
    icon: '🌱',
    title: 'Skilling & Education',
    sub: 'Organic Farming, Composting & Tech Awareness',
    points: ['Organic farming training for rural farmers', 'Composting & zero-waste workshops', 'Technology & sustainability awareness', 'School environmental education programs'],
    tag: null,
    tagColor: '',
  },
  {
    icon: '👥',
    title: 'Employee Engagement',
    sub: 'CSR Drives Your Team Will Remember',
    points: ['One-day plantation & cleanup drives', 'Each employee gets their own tree', 'Team dashboards & impact certificates', 'Media coverage & social content'],
    tag: '↓ See Section',
    tagColor: '#1B4332',
  },
]

const steps = [
  { num: '01', title: 'Consultation', desc: 'We understand your CSR goals, BRSR requirements, and sustainability priorities.' },
  { num: '02', title: 'Project Design', desc: 'Choose from trees, waste, water, or skilling — we customise scope, location, and timeline.' },
  { num: '03', title: 'Execution', desc: 'Our on-ground team handles site prep, planting, and implementation end-to-end.' },
  { num: '04', title: 'Live Tracking', desc: 'Real-time dashboards with AI-verified photos, GPS data, and health scores.' },
  { num: '05', title: 'ESG Reporting', desc: 'BRSR-compatible reports, 80G receipts, and carbon impact data — audit-ready.' },
]

const tiers = [
  {
    name: 'Starter',
    icon: '🌱',
    desc: 'Perfect for first-time CSR partners or smaller teams wanting to start with verified impact.',
    features: ['Geo-tagged tree plantation', 'Live tracking dashboard', 'ESG impact report', '80G tax receipts', 'Employee tree certificates'],
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    icon: '🌳',
    desc: 'Multi-vertical projects with deeper employee engagement and quarterly reporting.',
    features: ['Trees + Waste or Water vertical', 'Employee individual dashboards', 'Quarterly ESG reports', 'Plantation event with media', 'BRSR disclosure support'],
    cta: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Enterprise',
    icon: '🏢',
    desc: 'Multi-city, multi-vertical annual partnerships with board-level ESG visibility.',
    features: ['All 3 verticals covered', 'Multi-city execution', 'Annual BRSR-ready report', 'Dedicated account manager', 'Carbon offset certification'],
    cta: 'Talk to Us',
  },
]

const faqs = [
  { q: 'Can CSR funds be used for tree plantation under the Companies Act?', a: 'Yes. Tree plantation and afforestation are explicitly listed under Schedule VII of the Companies Act 2013 as eligible CSR activities under environmental sustainability.' },
  { q: 'Do you provide BRSR-compatible ESG reports?', a: 'Yes. EcoTree provides detailed ESG reports formatted for BRSR (Business Responsibility and Sustainability Reporting) disclosure requirements for listed Indian companies.' },
  { q: 'What is the minimum budget to start a CSR project with EcoTree?', a: 'Our Starter partnerships begin from ₹1 Lakh, covering geo-tagged tree plantation with real-time tracking dashboards and ESG reporting.' },
  { q: 'How do you verify trees have not been counted twice?', a: 'Every tree is assigned a unique GPS coordinate and QR code. Claude AI independently verifies each photo for species match, GPS location, timestamp, and duplicate detection before it appears on any dashboard.' },
  { q: 'Do employees get individual tree dashboards?', a: 'Yes. Each employee can be assigned their own tree with a personal dashboard showing GPS location, monthly photos, AI health scores, and CO₂ offset — making CSR personal and engaging.' },
  { q: 'Is EcoTree 80G registered?', a: 'Yes. EcoTree Impact Foundation is a registered Section 8 company with 80G approval. All CSR contributions are eligible for tax deduction under the Income Tax Act, India.' },
  { q: 'How quickly can a CSR project be started?', a: 'Most projects can be initiated within 2–3 weeks of signing. Plantation drives aligned with monsoon season (June–September) give best survival rates.' },
  { q: 'Can EcoTree execute multi-city CSR projects?', a: 'Yes. We execute projects across Karnataka and are expanding pan-India. Enterprise partners receive a unified dashboard tracking all locations and metrics in one place.' },
]

export default function CSRPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `CSR Lead: ${formData.company || 'Unknown'} — ${formData.name || ''}`,
          from_name: formData.name || 'EcoTree CSR',
          ...formData,
        }),
      })
      setSubmitted(true)
    } catch { setSubmitted(true) }
    setLoading(false)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="csr">

        {/* ── HERO ── */}
        <section className="csr-hero">
          <div className="csr-hero__img-wrap">
            <img src="/forest-hero.jpg" alt="Sunlight through forest — EcoTree CSR environmental impact" className="csr-hero__img" />
            <div className="csr-hero__overlay" />
          </div>
          <div className="csr-container csr-hero__content">
            <div className="csr-badge">🏢 CSR &amp; Corporate Sustainability</div>
            <h1 className="csr-hero__h1">
              Track, Verify &amp; Report<br />
              <em>Your CSR Impact</em>
            </h1>
            <p className="csr-hero__sub">
              Real-time dashboards. AI-verified outcomes. ESG-ready reporting for trees,
              waste, and water initiatives — built for India&rsquo;s BRSR requirements.
            </p>
            <p className="csr-hero__support">
              Move beyond traditional CSR. Build measurable, transparent environmental
              impact with complete visibility from day one.
            </p>
            <div className="csr-hero__ctas">
              <a href="/contact" className="csr-btn csr-btn--primary csr-btn--lg">🤝 Book a Demo</a>
              <a href={`https://wa.me/${WHATSAPP}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20discuss%20a%20CSR%20partnership.`}
                target="_blank" rel="noopener" className="csr-btn csr-btn--whatsapp csr-btn--lg">
                💬 WhatsApp Us
              </a>
              <a href="/impact" className="csr-btn csr-btn--ghost csr-btn--lg">📊 View Dashboard</a>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="csr-trust-bar">
          <div className="csr-container csr-trust-bar__inner">
            {['✓ Section 8 NGO', '✓ 80G Approved', '✓ NGO Darpan Certified', '✓ CSR-1 Filed', '✓ BRSR-Ready Reports', '✓ AI-Verified Impact'].map(t => (
              <span key={t} className="csr-trust-item">{t}</span>
            ))}
          </div>
        </div>

        {/* ── PROBLEM vs SOLUTION ── */}
        <section className="csr-section csr-section--offwhite" id="why">
          <div className="csr-container">
            <div className="csr-label">The Case for Change</div>
            <h2 className="csr-h2" style={{ marginBottom: '2rem' }}>
              Why Traditional CSR Falls Short
            </h2>
            <div className="csr-ps-box">
              <div className="csr-ps-col csr-ps-col--problem">
                <div className="csr-ps-head">
                  <span className="csr-ps-icon">⚠️</span>
                  <span>The Problem</span>
                </div>
                <ul className="csr-ps-list">
                  <li><span className="csr-x">✕</span> Trees planted, never tracked or verified</li>
                  <li><span className="csr-x">✕</span> No survival data or long-term monitoring</li>
                  <li><span className="csr-x">✕</span> Manual, time-consuming ESG reporting</li>
                  <li><span className="csr-x">✕</span> No proof of impact for BRSR disclosures</li>
                  <li><span className="csr-x">✕</span> Greenwashing risk with no audit trail</li>
                  <li><span className="csr-x">✕</span> Employees disconnected from CSR outcomes</li>
                </ul>
              </div>
              <div className="csr-ps-divider" aria-hidden="true">
                <div className="csr-ps-arrow">→</div>
              </div>
              <div className="csr-ps-col csr-ps-col--solution">
                <div className="csr-ps-head">
                  <span className="csr-ps-icon">✅</span>
                  <span>The EcoTree Way</span>
                </div>
                <ul className="csr-ps-list">
                  <li><span className="csr-tick">✓</span> Every tree geo-tagged with GPS + QR code</li>
                  <li><span className="csr-tick">✓</span> AI photo verification — 4-point check</li>
                  <li><span className="csr-tick">✓</span> Automated BRSR-compatible ESG reports</li>
                  <li><span className="csr-tick">✓</span> Real-time dashboards — audit ready always</li>
                  <li><span className="csr-tick">✓</span> Zero greenwashing — AI catches duplicates</li>
                  <li><span className="csr-tick">✓</span> Individual employee tree dashboards</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8 IMPACT AREAS ── */}
        <section className="csr-section csr-section--white" id="impact-areas">
          <div className="csr-container">
            <div className="csr-label">Impact Areas</div>
            <h2 className="csr-h2">Choose Your Impact Area</h2>
            <p className="csr-section-sub">
              Partner with us across multiple sustainability initiatives aligned with
              your CSR goals, BRSR requirements, and employee engagement objectives.
            </p>
            <div className="csr-impact-grid">
              {impactAreas.map((area) => (
                <div className="csr-impact-card" key={area.title}>
                  {area.tag && (
                    <span className="csr-impact-tag" style={{ background: area.tagColor }}>
                      {area.tag}
                    </span>
                  )}
                  <div className="csr-impact-icon">{area.icon}</div>
                  <h3 className="csr-impact-title">{area.title}</h3>
                  <div className="csr-impact-sub">{area.sub}</div>
                  <ul className="csr-impact-points">
                    {area.points.map(p => (
                      <li key={p}><span className="csr-dot">·</span>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="csr-section csr-section--dark" id="how">
          <div className="csr-container">
            <div className="csr-label csr-label--light">Our Process</div>
            <h2 className="csr-h2 csr-h2--light">How It Works</h2>
            <p className="csr-section-sub csr-section-sub--light">
              From first conversation to board-level ESG report — five steps,
              fully managed by our team.
            </p>
            <div className="csr-steps">
              {steps.map((s, i) => (
                <div className="csr-step" key={s.num}>
                  <div className="csr-step__num">{s.num}</div>
                  <div className="csr-step__line" style={{ opacity: i < steps.length - 1 ? 1 : 0 }} />
                  <div className="csr-step__body">
                    <div className="csr-step__title">{s.title}</div>
                    <div className="csr-step__desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <a href="/contact" className="csr-btn csr-btn--primary">🤝 Start the Conversation</a>
            </div>
          </div>
        </section>

        {/* ── EMPLOYEE ENGAGEMENT ── */}
        <section className="csr-section csr-section--mint" id="employee">
          <div className="csr-container">
            <div className="csr-label">Employee Engagement</div>
            <h2 className="csr-h2">CSR Your Team Will<br /><em>Actually Remember</em></h2>
            <p className="csr-section-sub">
              Turn your CSR budget into a team-building experience. Every employee
              plants, tracks, and owns their impact — making sustainability personal.
            </p>
            <div className="csr-ee-layout">
              <div className="csr-ee-cards">
                {[
                  { icon: '🌱', title: 'Plant Together', desc: 'Organised one-day plantation drives for teams of 10 to 1000+ employees. We handle logistics, safety, media coverage, and documentation.' },
                  { icon: '📱', title: 'Own Your Tree', desc: 'Every employee gets a personal tree dashboard — GPS location, monthly AI-verified photos, health score, and CO₂ offset. Their tree, their story.' },
                  { icon: '🏆', title: 'Track & Celebrate', desc: 'Leaderboards, team forest maps, and impact milestones. Share on LinkedIn with verified certificates — turns employees into brand ambassadors.' },
                  { icon: '📊', title: 'Report It', desc: 'Full event documentation, attendance records, photo archives, and ESG-formatted impact reports ready for your annual sustainability report.' },
                ].map(card => (
                  <div className="csr-ee-card" key={card.title}>
                    <span className="csr-ee-icon">{card.icon}</span>
                    <div>
                      <div className="csr-ee-title">{card.title}</div>
                      <div className="csr-ee-desc">{card.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="csr-ee-visual">
                <div className="csr-ee-mockup">
                  <div className="csr-ee-mockup__header">
                    <span>🌳</span>
                    <span>Team Forest — Infosys Bangalore</span>
                    <span className="csr-live-dot">● Live</span>
                  </div>
                  <div className="csr-ee-mockup__stats">
                    <div className="csr-ee-stat"><span>2,450</span><span>Trees planted</span></div>
                    <div className="csr-ee-stat"><span>245</span><span>Employees</span></div>
                    <div className="csr-ee-stat"><span>91%</span><span>Survival rate</span></div>
                    <div className="csr-ee-stat"><span>53.9T</span><span>CO₂/yr offset</span></div>
                  </div>
                  <div className="csr-ee-mockup__bar">
                    <div className="csr-ee-mockup__bar-label">Annual CSR Target</div>
                    <div className="csr-ee-mockup__progress">
                      <div className="csr-ee-mockup__fill" style={{ width: '49%' }} />
                    </div>
                    <div className="csr-ee-mockup__bar-note">2,450 of 5,000 trees · On track</div>
                  </div>
                  <div className="csr-ee-mockup__footer">
                    ✓ AI Verified · Last updated 2 hours ago
                  </div>
                </div>
                <a href="/contact" className="csr-btn csr-btn--primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
                  🌳 Plan a Team Drive →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT METRICS ── */}
        <section className="csr-section csr-section--white" id="metrics">
          <div className="csr-container">
            <div className="csr-label">Proven Impact</div>
            <h2 className="csr-h2">Every Number is Verified</h2>
            <p className="csr-section-sub">Real-time tracking and verifiable data — not estimates.</p>
            <div className="csr-metrics-grid">
              {[
                { icon: '🌱', num: '10,000+', label: 'Trees Planted', note: 'Geo-tagged & AI-verified' },
                { icon: '🎯', num: '91%', label: 'Avg Survival Rate', note: 'Industry avg: 60%' },
                { icon: '♻️', num: '48T', label: 'Waste Diverted', note: 'Tracked ward by ward' },
                { icon: '💧', num: '12M L', label: 'Water Restored', note: 'Lake restoration live' },
                { icon: '🌍', num: '53.9T', label: 'CO₂ Offset/yr', note: 'AI-calculated' },
                { icon: '🏢', num: '3+', label: 'CSR Partners', note: 'Growing monthly' },
              ].map(m => (
                <div className="csr-metric-card" key={m.label}>
                  <span className="csr-metric-icon">{m.icon}</span>
                  <span className="csr-metric-num">{m.num}</span>
                  <span className="csr-metric-label">{m.label}</span>
                  <span className="csr-metric-note">{m.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARBON IMPACT ── */}
        <section className="csr-section csr-section--offwhite" id="carbon">
          <div className="csr-container">
            <div className="csr-carbon-layout">
              <div className="csr-carbon-text">
                <div className="csr-label">Carbon Impact</div>
                <h2 className="csr-h2">Quantify Your<br />Environmental Contribution</h2>
                <p>
                  Every EcoTree project generates measurable, reportable carbon impact data —
                  ready for your sustainability disclosure, BRSR filing, and stakeholder communications.
                </p>
                <ul className="csr-carbon-list">
                  <li>🌳 Every tree offsets ~<strong>22 kg CO₂ per year</strong></li>
                  <li>♻️ Every ton of plastic waste diverted saves ~<strong>1.5T CO₂</strong> equivalent</li>
                  <li>💧 Water conservation reduces energy-intensive supply — tracked live</li>
                  <li>📊 All data formatted for <strong>GHG Protocol</strong> and BRSR reporting</li>
                </ul>
                <a href="/contact" className="csr-btn csr-btn--primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                  📥 Request ESG &amp; Carbon Report
                </a>
              </div>
              <div className="csr-carbon-card">
                <div className="csr-carbon-card__title">🌱 Carbon Calculator</div>
                <div className="csr-carbon-card__sub">Your 1,000 trees will offset</div>
                <div className="csr-carbon-card__num">22,000 kg</div>
                <div className="csr-carbon-card__unit">CO₂ per year</div>
                <div className="csr-carbon-card__equiv">
                  = Equivalent to taking <strong>5 cars off the road</strong> annually
                </div>
                <div className="csr-carbon-card__items">
                  <div><span>🌳</span><span>1,000 trees</span><span>×</span><span>22 kg/tree/yr</span></div>
                  <div style={{ borderTop: '1px solid rgba(27,67,50,0.1)', paddingTop: '0.5rem', fontWeight: 700, color: 'var(--g-dark)' }}>
                    = 22,000 kg CO₂ offset
                  </div>
                </div>
                <div className="csr-carbon-card__note">Scale to your tree count — custom report on request</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CASE STUDIES ── */}
        <section className="csr-section csr-section--white" id="cases">
          <div className="csr-container">
            <div className="csr-label">Case Studies</div>
            <h2 className="csr-h2">Impact in Action</h2>
            <p className="csr-section-sub">Real projects delivering measurable, verified outcomes.</p>
            <div className="csr-cases-grid">
              <div className="csr-case-card">
                <div className="csr-case-header csr-case-header--green">
                  <span className="csr-case-icon">🌳</span>
                  <div>
                    <div className="csr-case-title">Bangalore Urban Plantation Initiative</div>
                    <div className="csr-case-type">Tree Plantation · Employee Engagement</div>
                  </div>
                </div>
                <div className="csr-case-body">
                  <p>
                    A corporate CSR partner commissioned a large-scale geo-tagged plantation drive
                    across 6 sites in Bangalore. Employee teams participated in the planting event
                    and each received a personal tree dashboard.
                  </p>
                  <div className="csr-case-stats">
                    <div><span>1,000+</span><span>Trees planted</span></div>
                    <div><span>92%</span><span>Survival rate</span></div>
                    <div><span>6</span><span>Planting sites</span></div>
                    <div><span>22T</span><span>CO₂ offset/yr</span></div>
                  </div>
                  <div className="csr-case-tags">
                    <span>Geo-tagged</span><span>AI-verified</span><span>ESG Report</span><span>80G</span>
                  </div>
                </div>
              </div>

              <div className="csr-case-card">
                <div className="csr-case-header csr-case-header--amber">
                  <span className="csr-case-icon">🧱</span>
                  <div>
                    <div className="csr-case-title">Plastic Waste → Bricks &amp; Tiles Project</div>
                    <div className="csr-case-type">Circular Economy · Waste Processing</div>
                  </div>
                </div>
                <div className="csr-case-body">
                  <p>
                    Urban plastic waste collected through ward-level drives was processed
                    and converted into construction bricks, tiles, and park benches — donated
                    to government schools and community spaces in Bangalore.
                  </p>
                  <div className="csr-case-stats">
                    <div><span>12T</span><span>Plastic processed</span></div>
                    <div><span>2,400</span><span>Bricks produced</span></div>
                    <div><span>8</span><span>Wards covered</span></div>
                    <div><span>EPR</span><span>Compliant</span></div>
                  </div>
                  <div className="csr-case-tags">
                    <span>Circular Economy</span><span>EPR Ready</span><span>Community Impact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARTNERSHIP TIERS ── */}
        <section className="csr-section csr-section--dark" id="tiers">
          <div className="csr-container">
            <div className="csr-label csr-label--light">Partnership Tiers</div>
            <h2 className="csr-h2 csr-h2--light">Find Your Fit</h2>
            <p className="csr-section-sub csr-section-sub--light">
              Every partnership is customised. These tiers give you a starting point —
              contact us for a tailored proposal.
            </p>
            <div className="csr-tiers-grid">
              {tiers.map(t => (
                <div className={`csr-tier-card${t.highlight ? ' csr-tier-card--highlight' : ''}`} key={t.name}>
                  {t.highlight && <div className="csr-tier-badge">Most Popular</div>}
                  <div className="csr-tier-icon">{t.icon}</div>
                  <div className="csr-tier-name">{t.name}</div>
                  <p className="csr-tier-desc">{t.desc}</p>
                  <ul className="csr-tier-features">
                    {t.features.map(f => (
                      <li key={f}><span className="csr-tick">✓</span>{f}</li>
                    ))}
                  </ul>
                  <a href="/contact" className={`csr-btn${t.highlight ? ' csr-btn--primary' : ' csr-btn--outline-light'}`} style={{ marginTop: 'auto', display: 'inline-flex', justifyContent: 'center' }}>
                    {t.cta === 'Most Popular' ? 'Get Started' : t.cta} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="csr-section csr-section--offwhite" id="faq">
          <div className="csr-container csr-container--narrow">
            <div className="csr-label">FAQ</div>
            <h2 className="csr-h2">Questions CSR Managers Ask</h2>
            <p className="csr-section-sub">
              Everything you need to know before partnering with EcoTree for your
              corporate sustainability program.
            </p>
            <div className="csr-faq-list">
              {faqs.map((item, i) => (
                <div className="csr-faq-item" key={i}>
                  <button
                    className={`csr-faq-q${openFaq === i ? ' open' : ''}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.q}</span>
                    <span className="csr-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="csr-faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEAD FORM ── */}
        <section className="csr-section csr-section--white" id="start">
          <div className="csr-container csr-container--narrow">
            <div className="csr-label">Get Started</div>
            <h2 className="csr-h2">Start Your CSR Journey</h2>
            <p className="csr-section-sub">
              Tell us your requirements and our team will reach out within 24 hours
              with a customised proposal.
            </p>

            {submitted ? (
              <div className="csr-success">
                <div className="csr-success__icon">🌿</div>
                <h3>Thank you — we&rsquo;ll be in touch soon!</h3>
                <p>Our CSR team will respond within 24 hours with a tailored proposal for your company.</p>
                <button className="csr-btn csr-btn--primary" onClick={() => { setSubmitted(false); setFormData({}) }}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form className="csr-form" onSubmit={handleSubmit} noValidate>
                <div className="csr-form-row">
                  <div className="csr-field">
                    <label>Full Name *</label>
                    <input type="text" required placeholder="Your name"
                      value={formData.name || ''} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="csr-field">
                    <label>Designation</label>
                    <input type="text" placeholder="CSR Head / Sustainability Manager"
                      value={formData.designation || ''} onChange={e => set('designation', e.target.value)} />
                  </div>
                </div>
                <div className="csr-form-row">
                  <div className="csr-field">
                    <label>Company Name *</label>
                    <input type="text" required placeholder="Your company"
                      value={formData.company || ''} onChange={e => set('company', e.target.value)} />
                  </div>
                  <div className="csr-field">
                    <label>Work Email *</label>
                    <input type="email" required placeholder="you@company.com"
                      value={formData.email || ''} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
                <div className="csr-form-row">
                  <div className="csr-field">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+91 98860 94611"
                      value={formData.phone || ''} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="csr-field">
                    <label>CSR Budget Range</label>
                    <select value={formData.budget || ''} onChange={e => set('budget', e.target.value)}>
                      <option value="">Select range</option>
                      <option>Under ₹1 Lakh</option>
                      <option>₹1L – ₹5L</option>
                      <option>₹5L – ₹25L</option>
                      <option>₹25L – ₹1 Crore</option>
                      <option>₹1 Crore+</option>
                      <option>Not decided yet</option>
                    </select>
                  </div>
                </div>
                <div className="csr-field">
                  <label>Project Interest</label>
                  <div className="csr-checkboxes">
                    {['Tree Plantation', 'Lake Rejuvenation', 'Waste Processing', 'Plastic → Products', 'Water Conservation', 'Employee Engagement', 'Skilling & Education', 'Multi-vertical'].map(opt => (
                      <label key={opt} className={`csr-checkbox${(formData.interests || '').includes(opt) ? ' checked' : ''}`}>
                        <input type="checkbox"
                          checked={(formData.interests || '').includes(opt)}
                          onChange={e => {
                            const cur = formData.interests ? formData.interests.split(',').filter(Boolean) : []
                            const next = e.target.checked ? [...cur, opt] : cur.filter(x => x !== opt)
                            set('interests', next.join(','))
                          }} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="csr-field">
                  <label>CSR Requirements / Message</label>
                  <textarea rows={4} placeholder="Tell us about your CSR goals, timeline, locations, and any specific requirements..."
                    value={formData.message || ''} onChange={e => set('message', e.target.value)} />
                </div>
                <button type="submit" className="csr-btn csr-btn--primary csr-btn--full" disabled={loading}>
                  {loading ? '⏳ Sending...' : '🌿 Request a Demo'}
                </button>
                <p className="csr-form-note">We respond within 24 hours · Your data is never shared or sold</p>
              </form>
            )}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="csr-section csr-section--dark">
          <div className="csr-container">
            <div className="csr-cta-block">
              <div className="csr-badge">🏢 Ready to Build Verified Impact?</div>
              <h2 className="csr-cta-h2">
                Partner with EcoTree.<br /><em>Prove every rupee of CSR.</em>
              </h2>
              <p className="csr-cta-p">
                Join companies across India creating transparent, trackable,
                BRSR-ready environmental impact — with proof.
              </p>
              <div className="csr-cta-btns">
                <a href="/contact" className="csr-btn csr-btn--primary csr-btn--lg">🤝 Book a Demo</a>
                <a href={`https://wa.me/${WHATSAPP}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20discuss%20CSR%20partnership%20options.`}
                  target="_blank" rel="noopener" className="csr-btn csr-btn--whatsapp csr-btn--lg">
                  💬 WhatsApp Us
                </a>
              </div>
              <div className="csr-cta-trust">
                <span>✓ 80G Tax Benefit</span>
                <span>✓ BRSR-Ready Reports</span>
                <span>✓ AI-Verified Impact</span>
                <span>✓ 3-Year Tracking</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <style>{`
        .csr {
          --g-dark:   #1B4332;
          --g-mid:    #2D6A4F;
          --g-accent: #52B788;
          --g-light:  #74C69D;
          --g-moss:   #97BC62;
          --g-gold:   #D4A853;
          --mint:     #D8F3DC;
          --mint-dk:  #B7E4C7;
          --off-white:#F4F7F4;
          --text-dark:#0D1F17;
          --text-body:#2D3B36;
          --text-muted:#5C7268;
          --radius:   0.875rem;
          --radius-sm:0.5rem;
          font-family: var(--font-body,'Segoe UI',system-ui,sans-serif);
          color: var(--text-dark);
        }

        /* LAYOUT */
        .csr-container { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
        .csr-container--narrow { max-width:780px; }
        .csr-section { padding:3.5rem 0; }
        .csr-section--white    { background:#fff; }
        .csr-section--offwhite { background:var(--off-white); }
        .csr-section--mint     { background:var(--mint); }
        .csr-section--dark     { background:var(--clr-dark-bg,var(--g-dark)); }

        /* TYPE */
        .csr-label {
          display:inline-block; font-size:0.68rem; font-weight:700;
          letter-spacing:0.13em; text-transform:uppercase;
          color:var(--g-accent); background:rgba(82,183,136,0.12);
          padding:0.28rem 0.8rem; border-radius:999px; margin-bottom:0.75rem;
        }
        .csr-label--light { color:var(--g-light); background:rgba(116,198,157,0.15); }
        .csr-badge {
          display:inline-block; font-size:0.78rem; font-weight:600;
          color:var(--g-light); background:rgba(82,183,136,0.18);
          border:1px solid rgba(82,183,136,0.35);
          padding:0.35rem 0.9rem; border-radius:999px; margin-bottom:1rem;
        }
        .csr-h2 {
          font-size:clamp(1.55rem,3vw,2.3rem); font-weight:800;
          line-height:1.18; color:var(--text-dark); margin:0 0 0.9rem;
        }
        .csr-h2--light { color:#fff; }
        .csr-h2 em, .csr-cta-h2 em { color:var(--g-accent); font-style:normal; }
        .csr-section-sub { font-size:0.93rem; color:var(--text-muted); max-width:600px; margin-bottom:2rem; line-height:1.65; }
        .csr-section-sub--light { color:rgba(255,255,255,0.65); }

        /* BUTTONS */
        .csr-btn {
          display:inline-flex; align-items:center; gap:0.4rem;
          font-size:0.9rem; font-weight:600; padding:0.65rem 1.4rem;
          border-radius:999px; text-decoration:none; cursor:pointer;
          border:none; transition:all 0.2s ease; white-space:nowrap;
        }
        .csr-btn--lg { font-size:0.95rem; padding:0.8rem 1.75rem; }
        .csr-btn--full { width:100%; justify-content:center; border-radius:0.75rem; padding:0.85rem; font-size:1rem; }
        .csr-btn--primary { background:var(--clr-primary,var(--g-accent)); color:#fff; box-shadow:0 2px 12px rgba(44,95,45,0.3); }
        .csr-btn--primary:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .csr-btn--primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .csr-btn--whatsapp { background:#25D366; color:#fff; }
        .csr-btn--whatsapp:hover { background:#20c05a; transform:translateY(-1px); }
        .csr-btn--ghost { border:1.5px solid rgba(255,255,255,0.3); color:#fff; background:transparent; }
        .csr-btn--ghost:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.6); }
        .csr-btn--outline-light { border:1.5px solid rgba(255,255,255,0.3); color:#fff; background:transparent; }
        .csr-btn--outline-light:hover { background:rgba(255,255,255,0.08); }

        /* HERO */
        .csr-hero { position:relative; min-height:560px; display:flex; align-items:center; overflow:hidden; }
        .csr-hero__img-wrap { position:absolute; inset:0; }
        .csr-hero__img { width:100%; height:100%; object-fit:cover; object-position:center 40%; display:block; }
        .csr-hero__overlay {
          position:absolute; inset:0;
          background:linear-gradient(105deg, rgba(10,32,24,0.88) 0%, rgba(27,67,50,0.75) 50%, rgba(27,67,50,0.4) 100%);
        }
        .csr-hero__content { position:relative; z-index:2; padding:4rem 1.5rem; max-width:680px; }
        .csr-hero__h1 { font-size:clamp(2rem,4.5vw,3.2rem); font-weight:900; color:#fff; line-height:1.1; margin:0 0 1rem; text-shadow:0 2px 20px rgba(0,0,0,0.3); }
        .csr-hero__h1 em { color:var(--g-light); font-style:normal; }
        .csr-hero__sub { font-size:1.05rem; color:rgba(255,255,255,0.85); line-height:1.65; margin-bottom:0.75rem; }
        .csr-hero__support { font-size:0.9rem; color:rgba(255,255,255,0.65); margin-bottom:2rem; line-height:1.6; }
        .csr-hero__ctas { display:flex; gap:0.75rem; flex-wrap:wrap; }

        /* TRUST BAR */
        .csr-trust-bar { background:var(--g-dark); border-bottom:1px solid rgba(151,188,98,0.2); padding:0.85rem 0; }
        .csr-trust-bar__inner { display:flex; flex-wrap:wrap; gap:1rem 2rem; justify-content:center; align-items:center; }
        .csr-trust-item { font-size:0.75rem; font-weight:600; color:rgba(255,255,255,0.7); letter-spacing:0.06em; white-space:nowrap; }

        /* PROBLEM / SOLUTION BOX */
        .csr-ps-box {
          display:grid; grid-template-columns:1fr auto 1fr; gap:0;
          border-radius:var(--radius); overflow:hidden;
          box-shadow:0 4px 32px rgba(27,67,50,0.1);
          border:1px solid var(--mint-dk);
        }
        @media(max-width:700px){ .csr-ps-box{grid-template-columns:1fr;} .csr-ps-divider{display:none;} }
        .csr-ps-col { padding:2rem 1.75rem; }
        .csr-ps-col--problem { background:#FEF2F2; }
        .csr-ps-col--solution { background:var(--mint); }
        .csr-ps-head { display:flex; align-items:center; gap:0.6rem; font-size:1rem; font-weight:800; margin-bottom:1.25rem; color:var(--text-dark); }
        .csr-ps-icon { font-size:1.3rem; }
        .csr-ps-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.65rem; }
        .csr-ps-list li { display:flex; align-items:flex-start; gap:0.6rem; font-size:0.9rem; line-height:1.5; color:var(--text-body); }
        .csr-x    { color:#EF4444; font-weight:700; flex-shrink:0; }
        .csr-tick { color:var(--g-mid); font-weight:700; flex-shrink:0; }
        .csr-ps-divider {
          display:flex; align-items:center; justify-content:center;
          background:var(--off-white); width:48px;
          border-left:1px solid var(--mint-dk); border-right:1px solid var(--mint-dk);
        }
        .csr-ps-arrow { font-size:1.4rem; color:var(--g-accent); font-weight:700; }

        /* IMPACT AREAS */
        .csr-impact-grid {
          display:grid; grid-template-columns:repeat(4,1fr); gap:1.1rem;
        }
        @media(max-width:960px){ .csr-impact-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:540px){ .csr-impact-grid{grid-template-columns:1fr;} }
        .csr-impact-card {
          position:relative; background:#fff; border:1.5px solid var(--mint-dk);
          border-radius:var(--radius); padding:1.4rem 1.2rem;
          display:flex; flex-direction:column; gap:0.5rem;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .csr-impact-card:hover { border-color:var(--g-accent); box-shadow:0 4px 20px rgba(82,183,136,0.12); }
        .csr-impact-tag {
          position:absolute; top:0.75rem; right:0.75rem;
          font-size:0.65rem; font-weight:700; color:#fff;
          padding:0.2rem 0.55rem; border-radius:999px; letter-spacing:0.06em;
        }
        .csr-impact-icon { font-size:1.75rem; }
        .csr-impact-title { font-size:0.97rem; font-weight:700; color:var(--text-dark); line-height:1.3; }
        .csr-impact-sub { font-size:0.75rem; color:var(--g-accent); font-weight:600; }
        .csr-impact-points { list-style:none; padding:0; margin:0.25rem 0 0; display:flex; flex-direction:column; gap:0.35rem; }
        .csr-impact-points li { display:flex; align-items:flex-start; gap:0.4rem; font-size:0.8rem; color:var(--text-body); line-height:1.4; }
        .csr-dot { color:var(--g-accent); font-size:1.1rem; line-height:1; flex-shrink:0; }

        /* HOW IT WORKS */
        .csr-steps { display:flex; flex-direction:column; gap:0; max-width:680px; margin:0 auto; }
        .csr-step { display:flex; gap:1.25rem; align-items:flex-start; position:relative; padding-bottom:1.5rem; }
        .csr-step:last-child { padding-bottom:0; }
        .csr-step__num {
          width:44px; height:44px; flex-shrink:0;
          background:var(--g-accent); color:#fff;
          border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:0.85rem; font-weight:800; position:relative; z-index:1;
        }
        .csr-step__line {
          position:absolute; left:22px; top:44px; bottom:0;
          width:2px; background:rgba(82,183,136,0.3);
        }
        .csr-step__body { padding-top:0.6rem; }
        .csr-step__title { font-size:1rem; font-weight:700; color:#fff; margin-bottom:0.3rem; }
        .csr-step__desc { font-size:0.88rem; color:rgba(255,255,255,0.7); line-height:1.6; }

        /* EMPLOYEE ENGAGEMENT */
        .csr-ee-layout { display:grid; grid-template-columns:1.1fr 0.9fr; gap:2.5rem; align-items:start; }
        @media(max-width:768px){ .csr-ee-layout{grid-template-columns:1fr;} }
        .csr-ee-cards { display:flex; flex-direction:column; gap:1rem; }
        .csr-ee-card {
          display:flex; gap:1rem; align-items:flex-start;
          background:#fff; border:1px solid var(--mint-dk);
          border-radius:var(--radius); padding:1.1rem 1.25rem;
        }
        .csr-ee-icon { font-size:1.5rem; flex-shrink:0; }
        .csr-ee-title { font-size:0.92rem; font-weight:700; color:var(--g-dark); margin-bottom:0.3rem; }
        .csr-ee-desc { font-size:0.84rem; color:var(--text-body); line-height:1.6; }
        /* Mockup */
        .csr-ee-mockup {
          background:var(--g-dark); border-radius:var(--radius);
          padding:1.4rem; color:#fff;
          border:1px solid rgba(151,188,98,0.2);
        }
        .csr-ee-mockup__header { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:600; margin-bottom:1.1rem; color:rgba(255,255,255,0.9); }
        .csr-live-dot { color:#4ade80; font-size:0.7rem; margin-left:auto; }
        .csr-ee-mockup__stats { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.25rem; }
        .csr-ee-stat { display:flex; flex-direction:column; gap:0.15rem; }
        .csr-ee-stat span:first-child { font-size:1.3rem; font-weight:900; color:var(--g-light); }
        .csr-ee-stat span:last-child { font-size:0.68rem; color:rgba(255,255,255,0.55); }
        .csr-ee-mockup__bar-label { font-size:0.7rem; color:rgba(255,255,255,0.55); margin-bottom:0.4rem; }
        .csr-ee-mockup__progress { background:rgba(255,255,255,0.1); border-radius:999px; height:8px; overflow:hidden; margin-bottom:0.4rem; }
        .csr-ee-mockup__fill { background:var(--g-accent); height:100%; border-radius:999px; }
        .csr-ee-mockup__bar-note { font-size:0.7rem; color:rgba(255,255,255,0.5); }
        .csr-ee-mockup__footer { margin-top:1rem; font-size:0.7rem; color:rgba(255,255,255,0.4); padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08); }

        /* METRICS */
        .csr-metrics-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:1rem; }
        @media(max-width:900px){ .csr-metrics-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:540px){ .csr-metrics-grid{grid-template-columns:repeat(2,1fr);} }
        .csr-metric-card {
          background:var(--off-white); border:1px solid var(--mint-dk);
          border-radius:var(--radius); padding:1.25rem 0.9rem;
          text-align:center; display:flex; flex-direction:column; gap:0.3rem;
        }
        .csr-metric-icon { font-size:1.4rem; }
        .csr-metric-num { font-size:1.5rem; font-weight:900; color:var(--g-dark); line-height:1; }
        .csr-metric-label { font-size:0.78rem; font-weight:600; color:var(--text-body); }
        .csr-metric-note { font-size:0.68rem; color:var(--text-muted); }

        /* CARBON */
        .csr-carbon-layout { display:grid; grid-template-columns:1.2fr 0.8fr; gap:3rem; align-items:center; }
        @media(max-width:768px){ .csr-carbon-layout{grid-template-columns:1fr;} }
        .csr-carbon-text p { font-size:0.95rem; color:var(--text-body); line-height:1.75; margin-bottom:1.25rem; }
        .csr-carbon-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.65rem; }
        .csr-carbon-list li { font-size:0.9rem; color:var(--text-body); line-height:1.5; }
        .csr-carbon-card {
          background:var(--g-dark); color:#fff; border-radius:var(--radius);
          padding:1.75rem; text-align:center;
          border:1px solid rgba(151,188,98,0.2);
        }
        .csr-carbon-card__title { font-size:0.8rem; font-weight:700; color:var(--g-light); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.5rem; }
        .csr-carbon-card__sub { font-size:0.85rem; color:rgba(255,255,255,0.65); margin-bottom:0.5rem; }
        .csr-carbon-card__num { font-size:2.8rem; font-weight:900; color:var(--g-light); line-height:1; }
        .csr-carbon-card__unit { font-size:0.85rem; color:rgba(255,255,255,0.55); margin-bottom:0.75rem; }
        .csr-carbon-card__equiv { font-size:0.85rem; color:rgba(255,255,255,0.75); margin-bottom:1.25rem; line-height:1.5; }
        .csr-carbon-card__items { font-size:0.8rem; color:rgba(255,255,255,0.6); background:rgba(255,255,255,0.05); border-radius:0.5rem; padding:0.85rem; margin-bottom:0.75rem; display:flex; flex-direction:column; gap:0.5rem; }
        .csr-carbon-card__items div { display:flex; justify-content:space-between; align-items:center; }
        .csr-carbon-card__note { font-size:0.7rem; color:rgba(255,255,255,0.35); }

        /* CASE STUDIES */
        .csr-cases-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        @media(max-width:700px){ .csr-cases-grid{grid-template-columns:1fr;} }
        .csr-case-card { border-radius:var(--radius); overflow:hidden; border:1px solid var(--mint-dk); box-shadow:0 2px 16px rgba(27,67,50,0.07); }
        .csr-case-header { display:flex; align-items:center; gap:1rem; padding:1.25rem 1.4rem; }
        .csr-case-header--green { background:var(--g-dark); }
        .csr-case-header--amber { background:#78350F; }
        .csr-case-icon { font-size:1.75rem; flex-shrink:0; }
        .csr-case-title { font-size:0.97rem; font-weight:700; color:#fff; line-height:1.3; }
        .csr-case-type { font-size:0.72rem; color:rgba(255,255,255,0.6); margin-top:0.2rem; font-weight:500; }
        .csr-case-body { padding:1.4rem; background:#fff; }
        .csr-case-body p { font-size:0.87rem; color:var(--text-body); line-height:1.7; margin-bottom:1.25rem; }
        .csr-case-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; margin-bottom:1rem; }
        .csr-case-stats div { display:flex; flex-direction:column; align-items:center; gap:0.15rem; background:var(--off-white); border-radius:0.5rem; padding:0.65rem 0.4rem; }
        .csr-case-stats div span:first-child { font-size:1.1rem; font-weight:900; color:var(--g-dark); }
        .csr-case-stats div span:last-child { font-size:0.65rem; color:var(--text-muted); text-align:center; }
        .csr-case-tags { display:flex; flex-wrap:wrap; gap:0.4rem; }
        .csr-case-tags span { font-size:0.68rem; font-weight:600; background:var(--mint); color:var(--g-dark); padding:0.2rem 0.6rem; border-radius:999px; }

        /* TIERS */
        .csr-tiers-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        @media(max-width:768px){ .csr-tiers-grid{grid-template-columns:1fr;} }
        .csr-tier-card {
          position:relative; background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:var(--radius); padding:1.75rem;
          display:flex; flex-direction:column; gap:0.75rem;
        }
        .csr-tier-card--highlight { background:rgba(82,183,136,0.15); border-color:var(--g-accent); }
        .csr-tier-badge { position:absolute; top:-0.6rem; left:50%; transform:translateX(-50%); background:var(--g-accent); color:#fff; font-size:0.68rem; font-weight:700; padding:0.22rem 0.85rem; border-radius:999px; white-space:nowrap; letter-spacing:0.06em; }
        .csr-tier-icon { font-size:1.75rem; }
        .csr-tier-name { font-size:1.15rem; font-weight:800; color:#fff; }
        .csr-tier-desc { font-size:0.85rem; color:rgba(255,255,255,0.65); line-height:1.6; }
        .csr-tier-features { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem; flex:1; }
        .csr-tier-features li { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.85rem; color:rgba(255,255,255,0.8); }

        /* FAQ */
        .csr-faq-list { display:flex; flex-direction:column; gap:0.6rem; margin-top:1.75rem; }
        .csr-faq-item { border:1px solid var(--mint-dk); border-radius:var(--radius-sm); overflow:hidden; }
        .csr-faq-q {
          width:100%; display:flex; align-items:center; justify-content:space-between; gap:1rem;
          padding:1rem 1.1rem; font-size:0.93rem; font-weight:600; color:var(--g-dark);
          cursor:pointer; background:var(--off-white); border:none; text-align:left;
          transition:background 0.15s;
        }
        .csr-faq-q:hover, .csr-faq-q.open { background:var(--mint); }
        .csr-faq-chevron { font-size:1.2rem; color:var(--g-accent); flex-shrink:0; font-weight:400; }
        .csr-faq-a { padding:0.9rem 1.1rem 1.1rem; font-size:0.9rem; line-height:1.7; color:var(--text-body); background:#fff; border-top:1px solid var(--mint-dk); }

        /* FORM */
        .csr-form { display:flex; flex-direction:column; gap:1rem; }
        .csr-form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:540px){ .csr-form-row{grid-template-columns:1fr;} }
        .csr-field { display:flex; flex-direction:column; gap:0.4rem; }
        .csr-field label { font-size:0.82rem; font-weight:600; color:var(--text-body); }
        .csr-field input, .csr-field select, .csr-field textarea {
          width:100%; padding:0.7rem 0.9rem;
          border:1.5px solid var(--mint-dk); border-radius:0.65rem;
          font-size:0.9rem; color:var(--text-dark);
          background:#fff; outline:none; transition:border-color 0.2s;
          font-family:inherit; box-sizing:border-box;
        }
        .csr-field input:focus, .csr-field select:focus, .csr-field textarea:focus { border-color:var(--g-accent); }
        .csr-field textarea { resize:vertical; min-height:90px; }
        .csr-checkboxes { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .csr-checkbox {
          display:inline-flex; align-items:center; gap:0.4rem;
          padding:0.4rem 0.85rem; border-radius:999px;
          border:1.5px solid var(--mint-dk); cursor:pointer;
          font-size:0.82rem; font-weight:500; color:var(--text-body);
          background:#fff; transition:all 0.15s;
        }
        .csr-checkbox input { display:none; }
        .csr-checkbox.checked { background:var(--mint); border-color:var(--g-accent); color:var(--g-dark); }
        .csr-form-note { font-size:0.75rem; color:var(--text-muted); text-align:center; margin-top:0.25rem; }
        .csr-success { text-align:center; padding:2.5rem 1.5rem; background:var(--mint); border-radius:var(--radius); border:1px solid var(--mint-dk); }
        .csr-success__icon { font-size:3rem; margin-bottom:1rem; }
        .csr-success h3 { font-size:1.2rem; font-weight:700; color:var(--g-dark); margin:0 0 0.5rem; }
        .csr-success p { font-size:0.9rem; color:var(--text-body); margin-bottom:1.5rem; }

        /* CTA */
        .csr-cta-block { text-align:center; max-width:600px; margin:0 auto; }
        .csr-cta-h2 { font-size:clamp(1.7rem,4vw,2.8rem); font-weight:900; color:#fff; line-height:1.2; margin:0.75rem 0 0.9rem; }
        .csr-cta-p { color:rgba(255,255,255,0.68); font-size:0.97rem; line-height:1.65; margin-bottom:1.75rem; }
        .csr-cta-btns { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
        .csr-cta-trust { display:flex; gap:1.25rem; justify-content:center; flex-wrap:wrap; font-size:0.75rem; color:rgba(255,255,255,0.45); font-weight:500; }

        /* MOBILE */
        @media(max-width:480px){
          .csr-section { padding:2.5rem 0; }
          .csr-hero { min-height:auto; }
          .csr-hero__content { padding:3rem 1.5rem; }
          .csr-hero__ctas { flex-direction:column; align-items:flex-start; }
          .csr-cta-btns { flex-direction:column; align-items:center; }
        }
      `}</style>
    </>
  )
}
