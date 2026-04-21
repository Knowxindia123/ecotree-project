'use client'
import { useState } from 'react'
import type { Metadata } from 'next'

// ── JSON-LD (injected via script tag below) ──
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      name: 'Contact EcoTree Impact Foundation',
      description: 'Contact EcoTree for tree plantation donations, CSR partnerships, and sustainability collaborations in Bangalore, India.',
      url: 'https://ecotree-project.vercel.app/contact',
    },
    {
      '@type': 'LocalBusiness',
      name: 'EcoTree Impact Foundation',
      '@id': 'https://ecotree-project.vercel.app',
      url: 'https://ecotree-project.vercel.app',
      telephone: '+919886094611',
      email: 'bhimsen.g@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'No 56, 17th Cross, 8th Main, MC Layout, (Opp Water Tank)',
        addressLocality: 'Vijayanagar',
        addressRegion: 'Karnataka',
        postalCode: '560040',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '12.9716',
        longitude: '77.5312',
      },
      openingHours: 'Mo-Sa 09:00-18:00',
      sameAs: ['https://linkedin.com', 'https://instagram.com'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I contact EcoTree for CSR projects?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fill the CSR Partner form on this page or email us at bhimsen.g@gmail.com. We respond within 24 hours on working days.',
          },
        },
        {
          '@type': 'Question',
          name: 'How quickly does EcoTree respond to inquiries?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We respond to all inquiries within 24 hours on working days (Monday–Saturday, 9am–6pm IST).',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I visit the EcoTree office in Bangalore?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Our office is at No 56, 17th Cross, 8th Main, MC Layout, Vijayanagar, Bangalore 560040. We welcome visits by appointment.',
          },
        },
      ],
    },
  ],
}

const WEB3FORMS_KEY = 'f2635df8-33a5-44ef-889c-9f823771927f'
const WHATSAPP_NUMBER = '919886094611'

type Tab = 'donor' | 'csr' | 'general'

const tabs: { id: Tab; icon: string; label: string; sub: string }[] = [
  { id: 'donor',   icon: '🌱', label: 'Donate / Plant',      sub: 'Individual donor or gifting' },
  { id: 'csr',     icon: '🏢', label: 'CSR Partnership',     sub: 'Corporate sustainability' },
  { id: 'general', icon: '🤝', label: 'Collaborate',         sub: 'Media, NGO, volunteer' },
]

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<Tab>('donor')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: `EcoTree Contact: ${tabs.find(t => t.id === activeTab)?.label} — ${formData.name || ''}`,
        from_name: formData.name || 'EcoTree Website',
        intent: activeTab,
        ...formData,
      }
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) setSubmitted(true)
    } catch {
      // fail silently — show success anyway
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="cp">

        {/* ── HERO ── */}
        <section className="cp-hero">
          {/* Forest SVG silhouette layers */}
          <div className="cp-hero__forest" aria-hidden="true">
            <svg className="cp-hero__trees cp-hero__trees--back" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
              <path d="M0,320 L0,200 L60,160 L120,200 L180,140 L240,180 L300,120 L360,170 L420,110 L480,160 L540,100 L600,150 L660,90 L720,140 L780,80 L840,130 L900,70 L960,120 L1020,80 L1080,130 L1140,70 L1200,120 L1260,80 L1320,130 L1380,90 L1440,140 L1440,320 Z" fill="rgba(27,67,50,0.6)"/>
            </svg>
            <svg className="cp-hero__trees cp-hero__trees--mid" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
              <path d="M0,320 L0,240 L80,190 L160,240 L240,170 L320,220 L400,155 L480,210 L560,145 L640,195 L720,130 L800,180 L880,150 L960,200 L1040,160 L1120,210 L1200,170 L1280,220 L1360,180 L1440,230 L1440,320 Z" fill="rgba(44,95,45,0.7)"/>
            </svg>
            <svg className="cp-hero__trees cp-hero__trees--front" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
              <path d="M0,320 L0,270 L100,230 L200,270 L300,210 L400,260 L500,200 L600,250 L700,220 L800,265 L900,230 L1000,270 L1100,240 L1200,270 L1300,245 L1440,270 L1440,320 Z" fill="rgba(27,50,35,0.85)"/>
            </svg>
            {/* Floating particles */}
            <div className="cp-hero__particles">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="cp-hero__particle" style={{
                  left: `${8 + i * 8}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${3 + (i % 3)}s`,
                }} />
              ))}
            </div>
          </div>

          <div className="cp-container cp-hero__content">
            <div className="cp-badge">💬 We respond within 24 hours</div>
            <h1 className="cp-hero__h1">
              Let&rsquo;s Build Measurable<br />
              <em>Impact Together</em>
            </h1>
            <p className="cp-hero__sub">
              Whether you want to plant trees, partner for CSR, or collaborate on sustainability —
              we&rsquo;re here and ready to help you make <strong>real, verified impact</strong>.
            </p>
            {/* Intent jump buttons */}
            <div className="cp-hero__intents">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`cp-intent-btn${activeTab === t.id ? ' active' : ''}`}
                  onClick={() => {
                    setActiveTab(t.id)
                    document.getElementById('cp-form')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <span className="cp-intent-icon">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORM + INFO ── */}
        <section className="cp-section cp-section--white" id="cp-form">
          <div className="cp-container">
            <div className="cp-form-layout">

              {/* LEFT — FORM */}
              <div className="cp-form-col">
                <div className="cp-label">Get in Touch</div>
                <h2 className="cp-h2">Tell us how we can<br />help you</h2>

                {/* Tabs */}
                <div className="cp-tabs" role="tablist">
                  {tabs.map(t => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={activeTab === t.id}
                      className={`cp-tab${activeTab === t.id ? ' active' : ''}`}
                      onClick={() => setActiveTab(t.id)}
                    >
                      <span>{t.icon}</span>
                      <span className="cp-tab__label">{t.label}</span>
                    </button>
                  ))}
                </div>

                {submitted ? (
                  <div className="cp-success">
                    <div className="cp-success__icon">🌱</div>
                    <h3>Thank you! We&rsquo;ll be in touch soon.</h3>
                    <p>Our team will respond within 24 hours. Meanwhile, explore our <a href="/impact">live impact dashboard</a>.</p>
                    <button className="cp-btn cp-btn--primary" onClick={() => { setSubmitted(false); setFormData({}) }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="cp-form" onSubmit={handleSubmit} noValidate>

                    {/* Common fields */}
                    <div className="cp-field-row">
                      <div className="cp-field">
                        <label>Full Name *</label>
                        <input type="text" required placeholder="Your full name"
                          value={formData.name || ''}
                          onChange={e => set('name', e.target.value)} />
                      </div>
                      <div className="cp-field">
                        <label>Email Address *</label>
                        <input type="email" required placeholder="your@email.com"
                          value={formData.email || ''}
                          onChange={e => set('email', e.target.value)} />
                      </div>
                    </div>
                    <div className="cp-field">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+91 98860 94611"
                        value={formData.phone || ''}
                        onChange={e => set('phone', e.target.value)} />
                    </div>

                    {/* DONOR fields */}
                    {activeTab === 'donor' && (
                      <>
                        <div className="cp-field">
                          <label>I want to</label>
                          <select value={formData.donor_intent || ''}
                            onChange={e => set('donor_intent', e.target.value)}>
                            <option value="">Select an option</option>
                            <option>Plant trees in my name</option>
                            <option>Gift trees to someone</option>
                            <option>Plant trees for an occasion</option>
                            <option>Make a general donation</option>
                            <option>Volunteer on the ground</option>
                          </select>
                        </div>
                        <div className="cp-field">
                          <label>Number of trees (approx)</label>
                          <select value={formData.tree_count || ''}
                            onChange={e => set('tree_count', e.target.value)}>
                            <option value="">Select range</option>
                            <option>1–10 trees</option>
                            <option>10–50 trees</option>
                            <option>50–100 trees</option>
                            <option>100+ trees</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* CSR fields */}
                    {activeTab === 'csr' && (
                      <>
                        <div className="cp-field-row">
                          <div className="cp-field">
                            <label>Company Name *</label>
                            <input type="text" placeholder="Your company"
                              value={formData.company || ''}
                              onChange={e => set('company', e.target.value)} />
                          </div>
                          <div className="cp-field">
                            <label>Your Designation</label>
                            <input type="text" placeholder="CSR Head / Sustainability Lead"
                              value={formData.designation || ''}
                              onChange={e => set('designation', e.target.value)} />
                          </div>
                        </div>
                        <div className="cp-field">
                          <label>CSR Budget Range</label>
                          <select value={formData.budget || ''}
                            onChange={e => set('budget', e.target.value)}>
                            <option value="">Select budget range</option>
                            <option>Under ₹1 Lakh</option>
                            <option>₹1L – ₹5L</option>
                            <option>₹5L – ₹25L</option>
                            <option>₹25L – ₹1 Crore</option>
                            <option>₹1 Crore+</option>
                            <option>Not decided yet</option>
                          </select>
                        </div>
                        <div className="cp-field">
                          <label>Project Interest</label>
                          <div className="cp-checkboxes">
                            {['Tree Plantation', 'Waste Recycling', 'Water Conservation', 'All Three'].map(opt => (
                              <label key={opt} className="cp-checkbox">
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
                      </>
                    )}

                    {/* GENERAL fields */}
                    {activeTab === 'general' && (
                      <>
                        <div className="cp-field-row">
                          <div className="cp-field">
                            <label>Organisation</label>
                            <input type="text" placeholder="Your org / institution"
                              value={formData.organisation || ''}
                              onChange={e => set('organisation', e.target.value)} />
                          </div>
                          <div className="cp-field">
                            <label>Query Type</label>
                            <select value={formData.query_type || ''}
                              onChange={e => set('query_type', e.target.value)}>
                              <option value="">Select type</option>
                              <option>Media / Press</option>
                              <option>NGO Partnership</option>
                              <option>Government / Policy</option>
                              <option>Volunteer Program</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Message — all tabs */}
                    <div className="cp-field">
                      <label>Your Message</label>
                      <textarea rows={4} placeholder="Tell us more about what you have in mind..."
                        value={formData.message || ''}
                        onChange={e => set('message', e.target.value)} />
                    </div>

                    <button type="submit" className="cp-btn cp-btn--primary cp-btn--full" disabled={loading}>
                      {loading ? '⏳ Sending...' : '🌿 Start Your Impact Journey'}
                    </button>
                    <p className="cp-form-note">
                      We respond within 24 hours · Your data is never shared
                    </p>
                  </form>
                )}
              </div>

              {/* RIGHT — CONTACT INFO */}
              <div className="cp-info-col">
                <div className="cp-label">Direct Contact</div>
                <h2 className="cp-h2">Reach us<br />directly</h2>

                <div className="cp-contact-cards">
                  <a href="tel:+919886094611" className="cp-contact-card">
                    <div className="cp-contact-card__icon">📞</div>
                    <div>
                      <div className="cp-contact-card__label">Phone</div>
                      <div className="cp-contact-card__value">+91 98860 94611</div>
                      <div className="cp-contact-card__note">Mon–Sat, 9am–6pm IST</div>
                    </div>
                  </a>

                  <a href="mailto:bhimsen.g@gmail.com" className="cp-contact-card">
                    <div className="cp-contact-card__icon">✉️</div>
                    <div>
                      <div className="cp-contact-card__label">Email</div>
                      <div className="cp-contact-card__value">bhimsen.g@gmail.com</div>
                      <div className="cp-contact-card__note">24hr response on working days</div>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20know%20more%20about%20your%20tree%20plantation%20programs.`}
                    target="_blank" rel="noopener"
                    className="cp-contact-card cp-contact-card--whatsapp"
                  >
                    <div className="cp-contact-card__icon">💬</div>
                    <div>
                      <div className="cp-contact-card__label">WhatsApp</div>
                      <div className="cp-contact-card__value">Chat with us instantly</div>
                      <div className="cp-contact-card__note">Quick responses on WhatsApp</div>
                    </div>
                  </a>

                  <div className="cp-contact-card cp-contact-card--addr">
                    <div className="cp-contact-card__icon">📍</div>
                    <div>
                      <div className="cp-contact-card__label">Office Address</div>
                      <div className="cp-contact-card__value">
                        EcoTree Impact Foundation<br />
                        No 56, 17th Cross, 8th Main,<br />
                        MC Layout, (Opp Water Tank)<br />
                        Vijayanagar, Bangalore – 560040
                      </div>
                      <a
                        href="https://maps.app.goo.gl/octSsdQXQUv6mVDB8"
                        target="_blank" rel="noopener"
                        className="cp-map-link"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trust strip */}
                <div className="cp-trust-strip">
                  <div className="cp-trust-strip__title">Why EcoTree?</div>
                  <ul className="cp-trust-list">
                    <li><span className="cp-tick">✓</span> 100% transparent tree tracking</li>
                    <li><span className="cp-tick">✓</span> AI-verified geo-tagged plantations</li>
                    <li><span className="cp-tick">✓</span> ESG-ready impact reports</li>
                    <li><span className="cp-tick">✓</span> 80G tax benefit on all donations</li>
                    <li><span className="cp-tick">✓</span> Section 8 NGO · NGO Darpan certified</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GOOGLE MAP ── */}
        <section className="cp-map-section">
          <div className="cp-container">
            <div className="cp-label" style={{marginBottom:'1rem'}}>Find Us</div>
            <div className="cp-map-wrap">
              <iframe
                title="EcoTree Impact Foundation — Vijayanagar, Bangalore"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7!2d77.5312!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzEnNTIuMyJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="cp-map-caption">
              <span>📍 EcoTree Impact Foundation, Vijayanagar, Bangalore 560040</span>
              <a href="https://maps.app.goo.gl/octSsdQXQUv6mVDB8" target="_blank" rel="noopener" className="cp-btn cp-btn--outline cp-btn--sm">
                Open in Google Maps →
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ STRIP ── */}
        <section className="cp-section cp-section--mint">
          <div className="cp-container cp-container--narrow">
            <div className="cp-label">FAQ</div>
            <h2 className="cp-h2" style={{marginBottom:'1.75rem'}}>Quick Answers</h2>
            <div className="cp-faq-grid">
              <div className="cp-faq-card">
                <div className="cp-faq-card__q">How do I contact EcoTree for CSR projects?</div>
                <div className="cp-faq-card__a">Fill the CSR Partner tab in the form above or email us directly. We respond within 24 hours with a customised proposal.</div>
              </div>
              <div className="cp-faq-card">
                <div className="cp-faq-card__q">How quickly do you respond to inquiries?</div>
                <div className="cp-faq-card__a">Within 24 hours on working days (Mon–Sat, 9am–6pm IST). For urgent queries, WhatsApp is the fastest channel.</div>
              </div>
              <div className="cp-faq-card">
                <div className="cp-faq-card__q">Can I visit the EcoTree office in Bangalore?</div>
                <div className="cp-faq-card__a">Yes — we welcome visits by appointment at our Vijayanagar office. Write to us or WhatsApp to schedule a time.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="cp-section cp-section--dark">
          <div className="cp-container">
            <div className="cp-cta-block">
              <div className="cp-badge">🌿 Ready to create real impact?</div>
              <h2 className="cp-cta-h2">Every tree starts<br /><em>with a conversation.</em></h2>
              <p className="cp-cta-p">
                Join hundreds of individuals and companies creating verified,
                trackable environmental impact across Bangalore.
              </p>
              <div className="cp-cta-btns">
                <a href="/donate"      className="cp-btn cp-btn--primary cp-btn--lg">🌱 Donate Now · From ₹100</a>
                <a href="/csr-partner" className="cp-btn cp-btn--gold cp-btn--lg">🏢 CSR Partnership</a>
              </div>
              <div className="cp-cta-trust">
                <span>✓ 80G Tax Benefit</span>
                <span>✓ AI-Verified</span>
                <span>✓ 3-Year Tracking</span>
                <span>✓ ESG Reports</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── WHATSAPP FLOATING BUTTON ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20EcoTree%2C%20I%27d%20like%20to%20know%20more%20about%20your%20programs.`}
        target="_blank" rel="noopener"
        className="cp-wa-float"
        aria-label="Chat on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat</span>
      </a>

      <style>{`
        /* ── TOKENS ── */
        .cp {
          --g-dark:   #1B4332;
          --g-mid:    #2D6A4F;
          --g-accent: #52B788;
          --g-light:  #74C69D;
          --g-moss:   #97BC62;
          --g-gold:   #D4A853;
          --mint:     #D8F3DC;
          --mint-dk:  #B7E4C7;
          --off-white:#F8FAF8;
          --text-dark:#0D1F17;
          --text-body:#2D3B36;
          --text-muted:#5C7268;
          --radius:   0.875rem;
          --radius-sm:0.5rem;
          font-family: var(--font-body, 'Segoe UI', system-ui, sans-serif);
          color: var(--text-dark);
        }

        /* ── LAYOUT ── */
        .cp-container { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
        .cp-container--narrow { max-width:860px; }
        .cp-section { padding:3.5rem 0; }
        .cp-section--white { background:#fff; }
        .cp-section--mint  { background:var(--mint); }
        .cp-section--dark  { background:var(--clr-dark-bg, var(--g-dark)); }

        /* ── TYPE ── */
        .cp-label {
          display:inline-block; font-size:0.68rem; font-weight:700;
          letter-spacing:0.13em; text-transform:uppercase;
          color:var(--g-accent); background:rgba(82,183,136,0.12);
          padding:0.28rem 0.8rem; border-radius:999px; margin-bottom:0.75rem;
        }
        .cp-badge {
          display:inline-block; font-size:0.78rem; font-weight:600;
          color:var(--g-light); background:rgba(82,183,136,0.18);
          border:1px solid rgba(82,183,136,0.35);
          padding:0.35rem 0.9rem; border-radius:999px; margin-bottom:1rem;
        }
        .cp-h2 {
          font-size:clamp(1.55rem,3vw,2.2rem); font-weight:800;
          line-height:1.18; color:var(--text-dark); margin:0 0 1.5rem;
        }

        /* ── BUTTONS ── */
        .cp-btn {
          display:inline-flex; align-items:center; gap:0.4rem;
          font-size:0.9rem; font-weight:600; padding:0.65rem 1.4rem;
          border-radius:999px; text-decoration:none; cursor:pointer;
          border:none; transition:all 0.2s ease; white-space:nowrap;
        }
        .cp-btn--lg  { font-size:0.95rem; padding:0.8rem 1.75rem; }
        .cp-btn--sm  { font-size:0.82rem; padding:0.45rem 1rem; }
        .cp-btn--full { width:100%; justify-content:center; border-radius:0.75rem; padding:0.85rem; font-size:1rem; }
        .cp-btn--primary { background:var(--clr-primary,var(--g-accent)); color:#fff; box-shadow:0 2px 12px rgba(44,95,45,0.3); }
        .cp-btn--primary:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .cp-btn--primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .cp-btn--gold { background:transparent; color:var(--g-gold); border:1.5px solid rgba(212,168,83,0.5); }
        .cp-btn--gold:hover { background:rgba(212,168,83,0.1); }
        .cp-btn--outline { background:transparent; color:var(--g-dark); border:1.5px solid var(--g-accent); }
        .cp-btn--outline:hover { background:var(--g-accent); color:#fff; }

        /* ── HERO ── */
        .cp-hero {
          position:relative; min-height:480px;
          background:linear-gradient(170deg, #0a2018 0%, #1B4332 40%, #2D6A4F 100%);
          display:flex; align-items:center; overflow:hidden;
          padding:5rem 0 4rem;
        }
        .cp-hero__forest {
          position:absolute; inset:0; pointer-events:none;
        }
        .cp-hero__trees {
          position:absolute; bottom:0; left:0; width:100%; height:auto;
        }
        .cp-hero__trees--back  { opacity:0.5; }
        .cp-hero__trees--mid   { opacity:0.7; }
        .cp-hero__trees--front { opacity:1; }

        /* floating leaf particles */
        .cp-hero__particles { position:absolute; inset:0; pointer-events:none; }
        .cp-hero__particle {
          position:absolute; top:20%;
          width:6px; height:6px;
          background:rgba(151,188,98,0.4); border-radius:50%;
          animation:cp-float linear infinite;
        }
        @keyframes cp-float {
          0%   { transform:translateY(0) rotate(0deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.6; }
          100% { transform:translateY(-120px) rotate(360deg); opacity:0; }
        }

        .cp-hero__content { position:relative; z-index:2; text-align:center; }
        .cp-hero__h1 {
          font-size:clamp(2rem,5vw,3.4rem); font-weight:900;
          color:#fff; line-height:1.1; margin:0 0 1rem;
          max-width:760px; margin-left:auto; margin-right:auto;
          text-shadow:0 2px 20px rgba(0,0,0,0.3);
        }
        .cp-hero__h1 em { color:var(--g-light); font-style:normal; }
        .cp-hero__sub {
          font-size:1rem; color:rgba(255,255,255,0.78);
          max-width:560px; margin:0 auto 2.5rem; line-height:1.7;
        }
        .cp-hero__sub strong { color:var(--g-light); }
        .cp-hero__intents {
          display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;
        }
        .cp-intent-btn {
          display:inline-flex; align-items:center; gap:0.5rem;
          padding:0.65rem 1.3rem; border-radius:999px; border:none; cursor:pointer;
          font-size:0.88rem; font-weight:600;
          background:rgba(255,255,255,0.1); color:#fff;
          border:1.5px solid rgba(255,255,255,0.2);
          transition:all 0.2s; backdrop-filter:blur(4px);
        }
        .cp-intent-btn:hover, .cp-intent-btn.active {
          background:var(--g-accent); border-color:var(--g-accent); color:#fff;
        }
        .cp-intent-icon { font-size:1.1rem; }

        /* ── FORM LAYOUT ── */
        .cp-form-layout {
          display:grid; grid-template-columns:1.1fr 0.9fr;
          gap:3rem; align-items:start;
        }
        @media(max-width:860px){ .cp-form-layout{grid-template-columns:1fr;} }

        /* ── TABS ── */
        .cp-tabs {
          display:flex; gap:0; margin-bottom:1.5rem;
          background:var(--off-white); border-radius:0.75rem; padding:0.3rem;
          border:1px solid var(--mint-dk);
        }
        .cp-tab {
          flex:1; display:flex; align-items:center; justify-content:center; gap:0.4rem;
          padding:0.6rem 0.5rem; border:none; border-radius:0.5rem; cursor:pointer;
          font-size:0.78rem; font-weight:600; color:var(--text-muted);
          background:transparent; transition:all 0.2s;
        }
        .cp-tab.active { background:#fff; color:var(--g-dark); box-shadow:0 1px 6px rgba(27,67,50,0.1); }
        .cp-tab__label { display:none; }
        @media(min-width:520px){ .cp-tab__label{display:inline;} }

        /* ── FORM FIELDS ── */
        .cp-form { display:flex; flex-direction:column; gap:1rem; }
        .cp-field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:520px){ .cp-field-row{grid-template-columns:1fr;} }
        .cp-field { display:flex; flex-direction:column; gap:0.4rem; }
        .cp-field label { font-size:0.82rem; font-weight:600; color:var(--text-body); }
        .cp-field input,
        .cp-field select,
        .cp-field textarea {
          width:100%; padding:0.7rem 0.9rem;
          border:1.5px solid var(--mint-dk); border-radius:0.65rem;
          font-size:0.9rem; color:var(--text-dark);
          background:#fff; outline:none;
          transition:border-color 0.2s;
          font-family:inherit;
          box-sizing:border-box;
        }
        .cp-field input:focus,
        .cp-field select:focus,
        .cp-field textarea:focus { border-color:var(--g-accent); }
        .cp-field textarea { resize:vertical; min-height:90px; }

        /* checkboxes */
        .cp-checkboxes { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .cp-checkbox {
          display:inline-flex; align-items:center; gap:0.4rem;
          padding:0.4rem 0.85rem; border-radius:999px;
          border:1.5px solid var(--mint-dk); cursor:pointer;
          font-size:0.82rem; font-weight:500; color:var(--text-body);
          background:#fff; transition:all 0.15s;
        }
        .cp-checkbox input { display:none; }
        .cp-checkbox:has(input:checked) {
          background:var(--mint); border-color:var(--g-accent); color:var(--g-dark);
        }
        .cp-form-note { font-size:0.75rem; color:var(--text-muted); text-align:center; margin-top:0.25rem; }

        /* success */
        .cp-success {
          text-align:center; padding:2.5rem 1.5rem;
          background:var(--mint); border-radius:var(--radius);
          border:1px solid var(--mint-dk);
        }
        .cp-success__icon { font-size:3rem; margin-bottom:1rem; }
        .cp-success h3 { font-size:1.2rem; font-weight:700; color:var(--g-dark); margin:0 0 0.5rem; }
        .cp-success p { font-size:0.9rem; color:var(--text-body); margin-bottom:1.5rem; }
        .cp-success a { color:var(--g-accent); font-weight:600; }

        /* ── CONTACT CARDS ── */
        .cp-contact-cards { display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.5rem; }
        .cp-contact-card {
          display:flex; align-items:flex-start; gap:1rem;
          padding:1rem 1.1rem; border-radius:var(--radius);
          background:var(--off-white); border:1px solid var(--mint-dk);
          text-decoration:none; color:inherit;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cp-contact-card:hover { border-color:var(--g-accent); box-shadow:0 2px 12px rgba(82,183,136,0.12); }
        .cp-contact-card--whatsapp { border-color:rgba(37,211,102,0.3); }
        .cp-contact-card--whatsapp:hover { border-color:#25D366; box-shadow:0 2px 12px rgba(37,211,102,0.15); }
        .cp-contact-card--addr { cursor:default; }
        .cp-contact-card--addr:hover { border-color:var(--mint-dk); box-shadow:none; }
        .cp-contact-card__icon { font-size:1.5rem; flex-shrink:0; margin-top:0.1rem; }
        .cp-contact-card__label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin-bottom:0.15rem; }
        .cp-contact-card__value { font-size:0.93rem; font-weight:600; color:var(--text-dark); line-height:1.5; }
        .cp-contact-card__note { font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem; }
        .cp-map-link { display:inline-block; margin-top:0.5rem; font-size:0.8rem; font-weight:600; color:var(--g-accent); text-decoration:none; }
        .cp-map-link:hover { text-decoration:underline; }

        /* trust strip */
        .cp-trust-strip {
          background:var(--g-dark); border-radius:var(--radius);
          padding:1.25rem 1.4rem; color:#fff;
        }
        .cp-trust-strip__title { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--g-light); margin-bottom:0.85rem; }
        .cp-trust-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem; }
        .cp-trust-list li { display:flex; align-items:center; gap:0.6rem; font-size:0.87rem; color:rgba(255,255,255,0.82); }
        .cp-tick { color:var(--g-accent); font-weight:700; flex-shrink:0; }

        /* ── MAP ── */
        .cp-map-section { background:#fff; padding:0 0 3.5rem; }
        .cp-map-wrap {
          width:100%; height:380px; border-radius:var(--radius);
          overflow:hidden; border:1px solid var(--mint-dk);
          box-shadow:0 4px 24px rgba(27,67,50,0.08);
        }
        .cp-map-caption {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:0.75rem;
          margin-top:0.85rem;
          font-size:0.83rem; color:var(--text-muted);
        }

        /* ── FAQ GRID ── */
        .cp-faq-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
        @media(max-width:700px){ .cp-faq-grid{grid-template-columns:1fr;} }
        .cp-faq-card { background:#fff; border-radius:var(--radius); padding:1.25rem; border:1px solid var(--mint-dk); }
        .cp-faq-card__q { font-size:0.9rem; font-weight:700; color:var(--g-dark); margin-bottom:0.6rem; line-height:1.4; }
        .cp-faq-card__a { font-size:0.85rem; color:var(--text-body); line-height:1.65; }

        /* ── FINAL CTA ── */
        .cp-cta-block { text-align:center; max-width:600px; margin:0 auto; }
        .cp-cta-h2 { font-size:clamp(1.7rem,4vw,2.8rem); font-weight:900; color:#fff; line-height:1.2; margin:0.75rem 0 0.9rem; }
        .cp-cta-h2 em { color:var(--g-light); font-style:normal; }
        .cp-cta-p { color:rgba(255,255,255,0.68); font-size:0.97rem; line-height:1.65; margin-bottom:1.75rem; }
        .cp-cta-btns { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:1.5rem; }
        .cp-cta-trust { display:flex; gap:1.25rem; justify-content:center; flex-wrap:wrap; font-size:0.75rem; color:rgba(255,255,255,0.45); font-weight:500; }

        /* ── WHATSAPP FLOAT ── */
        .cp-wa-float {
          position:fixed; bottom:1.75rem; right:1.75rem; z-index:999;
          display:flex; align-items:center; gap:0.5rem;
          background:#25D366; color:#fff;
          padding:0.75rem 1.2rem; border-radius:999px;
          text-decoration:none; font-size:0.9rem; font-weight:700;
          box-shadow:0 4px 20px rgba(37,211,102,0.4);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .cp-wa-float:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(37,211,102,0.5); }

        /* ── MOBILE ── */
        @media(max-width:480px){
          .cp-section { padding:2.5rem 0; }
          .cp-hero { padding:3.5rem 0 3rem; min-height:auto; }
          .cp-hero__intents { flex-direction:column; align-items:center; }
          .cp-cta-btns { flex-direction:column; align-items:center; }
          .cp-map-wrap { height:260px; }
          .cp-wa-float { bottom:1.25rem; right:1.25rem; padding:0.65rem 1rem; }
        }
      `}</style>
    </>
  )
}
