'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CSRPartner {
  id: number
  company_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  trees_assigned: number
  trees_verified: number
  budget: number | null
  is_active: boolean
  created_at: string
}

export default function AdminCSR() {
  const [partners, setPartners] = useState<CSRPartner[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    company_name: '', contact_name: '', contact_email: '',
    contact_phone: '', budget: '', project_type: ''
  })

  useEffect(() => { loadPartners() }, [])

  async function loadPartners() {
    setLoading(true)
    const { data } = await supabase
      .from('csr_partners')
      .select('*')
      .order('created_at', { ascending: false })
    setPartners(data || [])
    setLoading(false)
  }

  async function addPartner(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('csr_partners').insert({
      company_name:  form.company_name,
      contact_name:  form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      budget:        form.budget ? Number(form.budget) : null,
      project_type:  form.project_type,
      is_active:     true
    })
    if (err) { setError(err.message) }
    else {
      setSuccess(`${form.company_name} added!`)
      setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', budget: '', project_type: '' })
      setShowForm(false)
      loadPartners()
    }
    setSaving(false)
  }

  function survivalRate(p: CSRPartner) {
    if (!p.trees_assigned) return '—'
    return Math.round((p.trees_verified / p.trees_assigned) * 100) + '%'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>CSR Partners</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{partners.filter(p => p.is_active).length} active partners</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          + Add partner
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '1rem' }}>Add CSR partner</h3>
          <form onSubmit={addPartner}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              {[
                { label: 'Company name *', key: 'company_name', type: 'text', ph: 'Infosys Foundation' },
                { label: 'Contact name',   key: 'contact_name',  type: 'text', ph: 'Anand Krishnan' },
                { label: 'Contact email',  key: 'contact_email', type: 'email', ph: 'anand@infosys.com' },
                { label: 'Contact phone',  key: 'contact_phone', type: 'tel', ph: '+91 98765 43210' },
                { label: 'Budget (₹)',     key: 'budget',        type: 'number', ph: '1000000' },
                { label: 'Project type',   key: 'project_type',  type: 'text', ph: 'Tree planting + waste' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.key === 'company_name'}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
              ))}
            </div>
            {error   && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '0.75rem' }}>{error}</div>}
            {success && <div style={{ color: '#16a34a', fontSize: '13px', marginBottom: '0.75rem' }}>{success}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 20px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Adding...' : 'Add partner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#6B7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : (
        <>
          <div className="desk-table" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Company','Contact','Trees','Verified','Survival','Budget','Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No CSR partners yet</td></tr>
                ) : partners.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{p.company_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#374151' }}>{p.contact_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.contact_email || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#2C5F2D' }}>{p.trees_assigned}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.trees_verified}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                        {survivalRate(p)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: p.is_active ? '#dcfce7' : '#f3f4f6', color: p.is_active ? '#166534' : '#6B7280', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mob-cards">
            {partners.map(p => (
              <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{p.company_name}</span>
                  <span style={{ background: p.is_active ? '#dcfce7' : '#f3f4f6', color: p.is_active ? '#166534' : '#6B7280', fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {p.contact_name  && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '3px' }}>👤 {p.contact_name}</div>}
                {p.contact_email && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '3px' }}>✉️ {p.contact_email}</div>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                  <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#2C5F2D' }}>{p.trees_assigned}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Trees</div></div>
                  <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#2C5F2D' }}>{survivalRate(p)}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Survival</div></div>
                  {p.budget && <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>₹{Number(p.budget).toLocaleString('en-IN')}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Budget</div></div>}
                </div>
              </div>
            ))}
            {partners.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '2rem' }}>No CSR partners yet</div>}
          </div>
        </>
      )}

      <style>{`
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .desk-table { display: block; }
        .mob-cards { display: none; }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .desk-table { display: none; }
          .mob-cards { display: block; }
        }
      `}</style>
    </div>
  )
}
