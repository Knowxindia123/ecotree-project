'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const PROJECT_INTERESTS = [
  'Tree Plantation',
  'Lake Rejuvenation',
  'Waste Processing',
  'Plastic → Products',
  'Water Conservation',
  'Employee Engagement',
  'Skilling & Education',
  'Multi-vertical',
]

const BUDGET_RANGES = [
  'Under ₹1 Lakh',
  '₹1L – ₹5L',
  '₹5L – ₹25L',
  '₹25L – ₹1 Crore',
  '₹1 Crore+',
  'Not decided yet',
]

const TREE_TYPES = [
  { id: 'common', label: 'Common Species', price: '₹100/tree' },
  { id: 'fruit',  label: 'Fruit Trees',    price: '₹250/tree' },
  { id: 'native', label: 'Native Large',   price: '₹500/tree' },
]

const HOW_IT_WORKS = [
  { num: '01', title: 'Consultation',    desc: 'We understand your CSR goals and BRSR requirements' },
  { num: '02', title: 'Project design',  desc: 'Custom scope, location, species and timeline' },
  { num: '03', title: 'Execution',       desc: 'On-ground team handles planting end-to-end' },
  { num: '04', title: 'Live tracking',   desc: 'AI-verified photos, GPS data, health scores' },
  { num: '05', title: 'ESG reporting',   desc: 'BRSR-compatible reports, 80G receipts, carbon data' },
]

const PROJECTS = [
  { icon: '🌳', label: 'Tree Plantation',      tag: 'Most popular' },
  { icon: '💧', label: 'Lake Rejuvenation',    tag: 'High impact' },
  { icon: '♻️', label: 'Waste Processing',     tag: '' },
  { icon: '🧱', label: 'Plastic → Products',  tag: 'Unique' },
  { icon: '🌊', label: 'Water Conservation',   tag: '' },
  { icon: '👥', label: 'Employee Engagement',  tag: '' },
  { icon: '🌱', label: 'Skilling & Education', tag: '' },
  { icon: '🏢', label: 'Multi-vertical',       tag: 'EPR ready' },
]

const TRUST_STATS = [
  { icon: '🌱', value: '10,000+', label: 'Trees planted' },
  { icon: '🎯', value: '91%',     label: 'Survival rate' },
  { icon: '🤖', value: 'AI',      label: 'Verified' },
  { icon: '🧾', value: '80G',     label: 'Approved' },
  { icon: '📊', value: 'BRSR',    label: 'Ready' },
]

interface FormData {
  contact_name: string
  designation: string
  company_name: string
  contact_email: string
  contact_phone: string
  budget: string
  project_type: string[]
  tree_count: string
  tree_type: string
  message: string
}

interface FormErrors {
  contact_name?: string
  company_name?: string
  contact_email?: string
  contact_phone?: string
  budget?: string
  project_type?: string
  tree_count?: string
}

export default function CsrNgoPage() {
  const [form, setForm] = useState<FormData>({
    contact_name: '',
    designation: '',
    company_name: '',
    contact_email: '',
    contact_phone: '',
    budget: '',
    project_type: [],
    tree_count: '',
    tree_type: 'common',
    message: '',
  })
  const [errors, setErrors]     = useState<FormErrors>({})
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [dupWarn, setDupWarn]   = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.contact_name.trim() || form.contact_name.trim().length < 2)
      e.contact_name = 'Please enter your full name (min 2 characters)'
    if (/\d/.test(form.contact_name))
      e.contact_name = 'Name should not contain numbers'
    if (!form.company_name.trim() || form.company_name.trim().length < 2)
      e.company_name = 'Please enter your company name'
    if (!form.contact_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      e.contact_email = 'Please enter a valid work email'
    if (!form.contact_phone.trim() || !/^\d{10}$/.test(form.contact_phone.replace(/\s/g, '')))
      e.contact_phone = 'Please enter a valid 10-digit phone number'
    if (!form.budget)
      e.budget = 'Please select a budget range'
    if (form.project_type.length === 0)
      e.project_type = 'Please select at least one project interest'
    if (!form.tree_count || isNaN(Number(form.tree_count)) || Number(form.tree_count) < 1 || Number(form.tree_count) > 10000)
      e.tree_count = 'Please enter a tree count between 1 and 10,000'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function toggleInterest(interest: string) {
    setForm(f => ({
      ...f,
      project_type: f.project_type.includes(interest)
        ? f.project_type.filter(i => i !== interest)
        : [...f.project_type, interest],
    }))
    if (errors.project_type) setErrors(e => ({ ...e, project_type: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitErr('')
    setDupWarn(false)

    // Duplicate email check
    const { data: existing } = await supabase
      .from('csr_partners')
      .select('id')
      .eq('contact_email', form.contact_email.toLowerCase().trim())
      .maybeSingle()

    if (existing) setDupWarn(true)

    const { error } = await supabase.from('csr_partners').insert({
      contact_name:  form.contact_name.trim(),
      designation:   form.designation.trim() || null,
      company_name:  form.company_name.trim(),
      contact_email: form.contact_email.toLowerCase().trim(),
      contact_phone: form.contact_phone.trim(),
      budget:        form.budget || null,
      project_type:  form.project_type.join(', '),
      tree_count:    Number(form.tree_count),
      message:       form.message.trim() || null,
      type:          'CSR',
      status:        'PENDING',
      is_active:     false,
      city:          'Bangalore',
    })

    if (error) {
      setSubmitErr('Something went wrong. Please try again or WhatsApp us.')
      setSaving(false)
      return
    }

    // Send confirmation email — non-blocking
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'csr_enquiry',
          donor: {
            name:      form.contact_name,
            email:     form.contact_email,
            company:   form.company_name,
            budget:    form.budget,
            trees:     form.tree_count,
            interests: form.project_type.join(', '),
          },
        }),
      })
      // Admin alert
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'csr_enquiry',
          donor: {
            name:      'Admin',
            email:     'hello@ecotrees.org',
            company:   form.company_name,
            budget:    form.budget,
            trees:     form.tree_count,
            interests: form.project_type.join(', '),
          },
        }),
      })
    } catch (_) {}

    setSuccess(true)
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem',
    border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    background: 'white', color: '#1a1a1a',
  }
  const errStyle: React.CSSProperties = {
    color: '#dc2626', fontSize: '12px', marginTop: '4px',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: '#374151', marginBottom: '5px',
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>

      {/* ── STRIP BANNER ── */}
      <div style={{
        background: '#1A3C34', color: 'white',
        padding: '10px 20px', textAlign: 'center',
        fontSize: '13px', lineHeight: 1.5,
      }}>
        <span style={{ fontStyle: 'italic', color: '#6ee7b7' }}>
          India's only NGO where you can track your CSR impact live.
        </span>
        {' '}
        <span style={{ color: '#d1fae5', opacity: 0.85 }}>
          ₹100/tree · AI-verified · GPS-tagged · 3yr tracking · 80G · BRSR-ready
        </span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A3C34', marginBottom: '6px' }}>
            Start Your CSR Journey
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Tell us your requirements — our team will reach out within 24 hours with a customised proposal.
          </p>
        </div>

        {/* ── TWO COLUMN: FORM + TRUST STRIP ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}>

          {/* ── FORM ── */}
          <div style={{
            background: 'white', borderRadius: '12px',
            border: '1px solid #e5e7eb', padding: '1.5rem',
          }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3C34', marginBottom: '8px' }}>
                  Thank you, {form.contact_name.split(' ')[0]}!
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1rem' }}>
                  We've received your CSR proposal request for <strong>{form.company_name}</strong>.
                  Our team will reach out within <strong>24 hours</strong>.
                </p>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                  A confirmation has been sent to {form.contact_email}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {dupWarn && (
                  <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#92400e' }}>
                    ⚠️ We already have an enquiry from this email. We'll update your details and reach out soon.
                  </div>
                )}

                {/* Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Full name *</label>
                    <input
                      type="text" placeholder="Your name" value={form.contact_name}
                      onChange={e => { setForm(f => ({ ...f, contact_name: e.target.value })); setErrors(er => ({ ...er, contact_name: undefined })) }}
                      style={{ ...inp, borderColor: errors.contact_name ? '#dc2626' : '#e5e7eb' }}
                    />
                    {errors.contact_name && <p style={errStyle}>{errors.contact_name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Designation</label>
                    <input
                      type="text" placeholder="CSR Head / Sustainability Manager"
                      value={form.designation}
                      onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                      style={inp}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Company name *</label>
                    <input
                      type="text" placeholder="Your company" value={form.company_name}
                      onChange={e => { setForm(f => ({ ...f, company_name: e.target.value })); setErrors(er => ({ ...er, company_name: undefined })) }}
                      style={{ ...inp, borderColor: errors.company_name ? '#dc2626' : '#e5e7eb' }}
                    />
                    {errors.company_name && <p style={errStyle}>{errors.company_name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Work email *</label>
                    <input
                      type="email" placeholder="you@company.com" value={form.contact_email}
                      onChange={e => { setForm(f => ({ ...f, contact_email: e.target.value })); setErrors(er => ({ ...er, contact_email: undefined })) }}
                      style={{ ...inp, borderColor: errors.contact_email ? '#dc2626' : '#e5e7eb' }}
                    />
                    {errors.contact_email && <p style={errStyle}>{errors.contact_email}</p>}
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Phone number *</label>
                    <input
                      type="tel" placeholder="+91 98860 94611" value={form.contact_phone}
                      onChange={e => { setForm(f => ({ ...f, contact_phone: e.target.value.replace(/[^\d\s]/g, '') })); setErrors(er => ({ ...er, contact_phone: undefined })) }}
                      style={{ ...inp, borderColor: errors.contact_phone ? '#dc2626' : '#e5e7eb' }}
                    />
                    {errors.contact_phone && <p style={errStyle}>{errors.contact_phone}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>CSR budget range *</label>
                    <select
                      value={form.budget}
                      onChange={e => { setForm(f => ({ ...f, budget: e.target.value })); setErrors(er => ({ ...er, budget: undefined })) }}
                      style={{ ...inp, borderColor: errors.budget ? '#dc2626' : '#e5e7eb' }}
                    >
                      <option value="">Select range</option>
                      {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.budget && <p style={errStyle}>{errors.budget}</p>}
                  </div>
                </div>

                {/* Project interest chips */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Project interest * <span style={{ fontWeight: 400, color: '#9ca3af' }}>(select all that apply)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PROJECT_INTERESTS.map(p => {
                      const active = form.project_type.includes(p)
                      return (
                        <button
                          key={p} type="button"
                          onClick={() => toggleInterest(p)}
                          style={{
                            padding: '8px 14px', borderRadius: '20px', fontSize: '13px',
                            cursor: 'pointer', transition: 'all 0.15s', minHeight: '44px',
                            background: active ? '#1A3C34' : 'white',
                            color: active ? 'white' : '#374151',
                            border: `1.5px solid ${active ? '#1A3C34' : '#e5e7eb'}`,
                            fontWeight: active ? 600 : 400,
                          }}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  {errors.project_type && <p style={errStyle}>{errors.project_type}</p>}
                </div>

                {/* Tree count + type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Approx. tree count *</label>
                    <input
                      type="number" placeholder="e.g. 500" min="1" max="10000"
                      value={form.tree_count}
                      onChange={e => { setForm(f => ({ ...f, tree_count: e.target.value })); setErrors(er => ({ ...er, tree_count: undefined })) }}
                      style={{ ...inp, borderColor: errors.tree_count ? '#dc2626' : '#e5e7eb' }}
                    />
                    {errors.tree_count && <p style={errStyle}>{errors.tree_count}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Tree type</label>
                    <select
                      value={form.tree_type}
                      onChange={e => setForm(f => ({ ...f, tree_type: e.target.value }))}
                      style={inp}
                    >
                      {TREE_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label} — {t.price}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>
                    CSR requirements / message
                    <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '6px' }}>
                      {form.message.length}/500
                    </span>
                  </label>
                  <textarea
                    rows={3} placeholder="Tell us about your goals, timeline, or any specific requirements..."
                    value={form.message} maxLength={500}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>

                {submitErr && (
                  <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{submitErr}</div>
                )}

                <button
                  type="submit" disabled={saving}
                  style={{
                    width: '100%', padding: '12px 24px',
                    background: saving ? '#9ca3af' : '#1A3C34',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '15px', fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {saving ? 'Submitting...' : '🌿 Request CSR Proposal'}
                </button>
                <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' }}>
                  We respond within 24 hours · Your data is never shared or sold
                </p>
              </form>
            )}
          </div>

          {/* ── TRUST STRIP ── */}
          <div style={{
            background: '#1A3C34', borderRadius: '12px',
            padding: '1.25rem 1rem', color: 'white',
          }}>
            <p style={{ fontSize: '12px', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', margin: '0 0 1rem' }}>
              Why EcoTree
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {TRUST_STATS.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#6ee7b7', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#d1fae5', opacity: 0.8 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1.25rem', paddingTop: '1rem' }}>
              <div style={{ fontSize: '11px', color: '#d1fae5', opacity: 0.7, lineHeight: 1.6 }}>
                ✓ Section 8 NGO<br />
                ✓ 80G Approved<br />
                ✓ NGO Darpan Certified<br />
                ✓ CSR-1 Filed<br />
                ✓ BRSR-Ready Reports
              </div>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3C34', marginBottom: '4px' }}>How it works</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.25rem' }}>
            From first conversation to board-level ESG report — five steps, fully managed by our team.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} style={{
                background: 'white', border: '1px solid #e5e7eb',
                borderRadius: '10px', padding: '1rem',
                position: 'relative',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#1A3C34', color: 'white',
                  fontSize: '12px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.625rem',
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A3C34', marginBottom: '4px' }}>{step.title}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>{step.desc}</div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute', right: '-10px', top: '24px',
                    width: '18px', height: '18px',
                    color: '#9ca3af', fontSize: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── PROJECTS WE WORK ON ── */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3C34', marginBottom: '4px' }}>Projects we work on</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.25rem' }}>
            Partner with us across multiple sustainability initiatives aligned with your CSR and BRSR goals.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {PROJECTS.map(p => (
              <div key={p.label} style={{
                background: 'white', border: '1px solid #e5e7eb',
                borderRadius: '10px', padding: '1rem',
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                {p.tag && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, color: '#1A3C34',
                    background: '#d1fae5', padding: '2px 8px',
                    borderRadius: '10px', alignSelf: 'flex-start',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {p.tag}
                  </span>
                )}
                <span style={{ fontSize: '22px' }}>{p.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A3C34' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .csr-grid { grid-template-columns: 1fr !important; }
          .hiw-grid { grid-template-columns: 1fr 1fr !important; }
          .proj-grid { grid-template-columns: 1fr 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
        select:focus, input:focus, textarea:focus {
          border-color: #1A3C34 !important;
          box-shadow: 0 0 0 2px rgba(26,60,52,0.1);
        }
      `}</style>
    </div>
  )
}
