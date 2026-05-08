'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CSRPartner {
  id: number
  company_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  designation: string | null
  trees_assigned: number
  trees_verified: number
  budget: string | null
  project_type: string | null
  tree_count: number | null
  message: string | null
  is_active: boolean
  status: string | null
  payment_status: string | null
  payment_mode: string | null
  amount_paid: number | null
  worker_id: number | null
  site_id: number | null
  start_date: string | null
  assigned_at: string | null
  created_at: string
}

interface Worker { id: number; name: string }
interface Site   { id: number; name: string }

export default function AdminCSR() {
  const [partners,  setPartners]  = useState<CSRPartner[]>([])
  const [pending,   setPending]   = useState<CSRPartner[]>([])
  const [workers,   setWorkers]   = useState<Worker[]>([])
  const [sites,     setSites]     = useState<Site[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [actionId,  setActionId]  = useState<number | null>(null)
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')

  // Batch assignment form
  const [assignForm, setAssignForm] = useState({
    partner_id: '', worker_id: '', site_id: '', start_date: '', due_date: '', notes: ''
  })
  const [showAssignForm, setShowAssignForm] = useState(false)

  // Add partner form
  const [form, setForm] = useState({
    company_name: '', contact_name: '', contact_email: '',
    contact_phone: '', budget: '', project_type: ''
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [partnersRes, workersRes, sitesRes] = await Promise.all([
      supabase.from('csr_partners').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, name').eq('role', 'WORKER').eq('is_active', true).order('name'),
      supabase.from('sites').select('id, name').eq('is_active', true).order('name'),
    ])
    const all = partnersRes.data || []
    setPending(all.filter(p => !p.is_active || p.status === 'PENDING'))
    setPartners(all.filter(p => p.is_active && p.status !== 'PENDING'))
    setWorkers(workersRes.data || [])
    setSites(sitesRes.data || [])
    setLoading(false)
  }

  // ── Approve partner ──
  async function approvePartner(id: number, company: string) {
    setActionId(id)
    const { error: err } = await supabase
      .from('csr_partners')
      .update({ is_active: true, status: 'ACTIVE' })
      .eq('id', id)
    if (err) setError(err.message)
    else { setSuccess(`✅ ${company} approved!`); loadAll() }
    setActionId(null)
  }

  // ── Reject partner ──
  async function rejectPartner(id: number, company: string) {
    if (!confirm(`Reject ${company}?`)) return
    const { error: err } = await supabase
      .from('csr_partners').update({ status: 'REJECTED' }).eq('id', id)
    if (err) setError(err.message)
    else { setSuccess(`${company} rejected.`); loadAll() }
  }

  // ── Mark paid offline ──
  async function markPaidOffline(id: number, company: string) {
    setActionId(id)
    const { error: err } = await supabase
      .from('csr_partners')
      .update({ payment_status: 'PAID', payment_mode: 'OFFLINE', is_active: true, status: 'ACTIVE' })
      .eq('id', id)
    if (err) setError(err.message)
    else { setSuccess(`✅ ${company} marked as paid and activated!`); loadAll() }
    setActionId(null)
  }

  // ── Send Razorpay link (placeholder) ──
  async function sendPaymentLink(id: number, company: string, email: string | null) {
    setActionId(id)
    // Mark as awaiting payment
    const { error: err } = await supabase
      .from('csr_partners')
      .update({ payment_status: 'AWAITING' })
      .eq('id', id)
    if (err) setError(err.message)
    else { setSuccess(`💳 Payment link sent to ${email || company}! Status set to Awaiting.`); loadAll() }
    setActionId(null)
  }

  // ── Batch assign ──
  async function handleBatchAssign(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const partner = partners.find(p => String(p.id) === assignForm.partner_id)
    if (!partner) { setError('Please select a partner'); setSaving(false); return }

    const { error: err } = await supabase
      .from('csr_partners')
      .update({
        worker_id:   Number(assignForm.worker_id),
        site_id:     Number(assignForm.site_id),
        start_date:  assignForm.start_date || null,
        assigned_at: new Date().toISOString(),
        status:      'ASSIGNED',
        trees_assigned: partner.tree_count || 0,
        notes:       assignForm.notes || null,
      })
      .eq('id', partner.id)

    if (err) { setError(err.message); setSaving(false); return }

    const worker = workers.find(w => String(w.id) === assignForm.worker_id)
    const site   = sites.find(s => String(s.id) === assignForm.site_id)
    setSuccess(`✅ ${partner.company_name} batch assigned to ${worker?.name} at ${site?.name}!`)
    setAssignForm({ partner_id: '', worker_id: '', site_id: '', start_date: '', due_date: '', notes: '' })
    setShowAssignForm(false)
    loadAll()
    setSaving(false)
  }

  // ── Add partner manually ──
  async function addPartner(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('csr_partners').insert({
      company_name:   form.company_name,
      contact_name:   form.contact_name,
      contact_email:  form.contact_email,
      contact_phone:  form.contact_phone,
      budget:         form.budget || null,
      project_type:   form.project_type,
      is_active:      true,
      status:         'ACTIVE',
      payment_status: 'PAID',
      payment_mode:   'OFFLINE',
    })
    if (err) { setError(err.message) }
    else {
      setSuccess(`${form.company_name} added!`)
      setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', budget: '', project_type: '' })
      setShowForm(false)
      loadAll()
    }
    setSaving(false)
  }

  function survivalRate(p: CSRPartner) {
    if (!p.trees_assigned) return '—'
    return Math.round((p.trees_verified / p.trees_assigned) * 100) + '%'
  }

  function paymentBadge(p: CSRPartner) {
    switch (p.payment_status) {
      case 'PAID':     return { bg: '#dcfce7', color: '#166534', label: '✅ Paid' }
      case 'AWAITING': return { bg: '#fef9c3', color: '#92400e', label: '⏳ Awaiting' }
      default:         return { bg: '#f3f4f6', color: '#6B7280', label: '💳 Unpaid' }
    }
  }

  function statusBadge(status: string | null) {
    switch (status) {
      case 'ACTIVE':    return { bg: '#dcfce7', color: '#166534', label: 'Active' }
      case 'ASSIGNED':  return { bg: '#dbeafe', color: '#1e40af', label: '👷 Assigned' }
      case 'COMPLETED': return { bg: '#f0fdf4', color: '#166534', label: '✅ Completed' }
      case 'REJECTED':  return { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' }
      default:          return { bg: '#f3f4f6', color: '#6B7280', label: status || '—' }
    }
  }

  const inp = { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' } as React.CSSProperties

  // Partners eligible for batch assignment (ACTIVE + PAID + not yet ASSIGNED)
  const assignablePartners = partners.filter(p =>
    p.payment_status === 'PAID' && p.status === 'ACTIVE'
  )

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>CSR Partners</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{partners.length} active · {pending.length} pending</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {assignablePartners.length > 0 && (
            <button onClick={() => setShowAssignForm(!showAssignForm)}
              style={{ padding: '10px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              👷 Assign Batch
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            + Add partner
          </button>
        </div>
      </div>

      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#166534' }}>{success}</div>}
      {error   && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', fontSize: '13px', color: '#dc2626' }}>{error}</div>}

      {/* ── BATCH ASSIGN FORM ── */}
      {showAssignForm && (
        <div style={{ background: 'white', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '1rem' }}>👷 Assign CSR Batch to Worker</div>
          <form onSubmit={handleBatchAssign}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              {/* Partner */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>CSR Partner * <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '12px' }}>({assignablePartners.length} ready to assign)</span></label>
                <select required value={assignForm.partner_id}
                  onChange={e => setAssignForm({...assignForm, partner_id: e.target.value})}
                  style={inp}>
                  <option value="">— Select partner —</option>
                  {assignablePartners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.company_name} · {p.tree_count || 0} trees · {p.project_type || '—'}
                    </option>
                  ))}
                </select>
              </div>
              {/* Worker */}
              <div>
                <label style={lbl}>Field Worker *</label>
                <select required value={assignForm.worker_id}
                  onChange={e => setAssignForm({...assignForm, worker_id: e.target.value})}
                  style={inp}>
                  <option value="">Select worker</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              {/* Site */}
              <div>
                <label style={lbl}>Planting Site *</label>
                <select required value={assignForm.site_id}
                  onChange={e => setAssignForm({...assignForm, site_id: e.target.value})}
                  style={inp}>
                  <option value="">Select site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {/* Start date */}
              <div>
                <label style={lbl}>Start Date</label>
                <input type="date" value={assignForm.start_date}
                  onChange={e => setAssignForm({...assignForm, start_date: e.target.value})}
                  style={inp} />
              </div>
              {/* Notes */}
              <div>
                <label style={lbl}>Notes</label>
                <input type="text" placeholder="e.g. Plant near north boundary"
                  value={assignForm.notes}
                  onChange={e => setAssignForm({...assignForm, notes: e.target.value})}
                  style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 20px', background: saving ? '#9ca3af' : '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Assigning...' : '👷 Assign Batch →'}
              </button>
              <button type="button" onClick={() => setShowAssignForm(false)}
                style={{ padding: '10px 20px', background: 'transparent', color: '#6B7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PENDING APPROVALS ── */}
      {pending.length > 0 && (
        <div style={{ background: 'white', border: '1.5px solid #fde68a', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #fde68a', background: '#fffbeb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>⏳ Pending Approvals</span>
            <span style={{ background: '#f59e0b', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{pending.length}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fffbeb' }}>
                  {['Company', 'Contact', 'Budget', 'Trees', 'Interests', 'Registered', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#92400e', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #fef3c7' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{p.company_name}</div>
                      {p.designation && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.designation}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#374151' }}>{p.contact_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.contact_email || ''}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.contact_phone || ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{p.budget || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#2C5F2D' }}>{p.tree_count || '—'}</td>
                    <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(p.project_type || '').split(', ').filter(Boolean).map(t => (
                          <span key={t} style={{ background: '#f0fdf4', color: '#166534', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {new Date(p.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {/* Approve */}
                        <button onClick={() => approvePartner(p.id, p.company_name)} disabled={actionId === p.id}
                          style={{ padding: '5px 12px', background: actionId === p.id ? '#9ca3af' : '#2C5F2D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          ✅ Approve
                        </button>
                        {/* Mark paid offline */}
                        <button onClick={() => markPaidOffline(p.id, p.company_name)} disabled={actionId === p.id}
                          style={{ padding: '5px 12px', background: '#166534', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          💵 Mark Paid
                        </button>
                        {/* Send payment link */}
                        <button onClick={() => sendPaymentLink(p.id, p.company_name, p.contact_email)} disabled={actionId === p.id}
                          style={{ padding: '5px 12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          💳 Payment Link
                        </button>
                        {/* Reject */}
                        <button onClick={() => rejectPartner(p.id, p.company_name)}
                          style={{ padding: '5px 12px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD PARTNER FORM ── */}
      {showForm && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '1rem' }}>Add CSR partner manually</h3>
          <form onSubmit={addPartner}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              {[
                { label: 'Company name *', key: 'company_name', type: 'text',  ph: 'Infosys Foundation' },
                { label: 'Contact name',   key: 'contact_name', type: 'text',  ph: 'Anand Krishnan' },
                { label: 'Contact email',  key: 'contact_email',type: 'email', ph: 'anand@infosys.com' },
                { label: 'Contact phone',  key: 'contact_phone',type: 'tel',   ph: '+91 98765 43210' },
                { label: 'Budget range',   key: 'budget',       type: 'text',  ph: '₹5L – ₹25L' },
                { label: 'Project type',   key: 'project_type', type: 'text',  ph: 'Tree planting + waste' },
              ].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    required={f.key === 'company_name'} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 20px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Adding...' : 'Add partner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: '10px 20px', background: 'transparent', color: '#6B7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
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
          {/* ── ACTIVE PARTNERS TABLE ── */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Active Partners</span>
            </div>
            <div className="desk-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Company','Contact','Trees','Verified','Survival','Budget','Payment','Status','Assigned To'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No active CSR partners yet</td></tr>
                  ) : partners.map(p => {
                    const pay  = paymentBadge(p)
                    const stat = statusBadge(p.status)
                    const worker = workers.find(w => w.id === p.worker_id)
                    const site   = sites.find(s => s.id === p.site_id)
                    return (
                      <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{p.company_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '13px', color: '#374151' }}>{p.contact_name || '—'}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.contact_email || ''}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#2C5F2D' }}>{p.trees_assigned || p.tree_count || 0}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.trees_verified}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                            {survivalRate(p)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{p.budget || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: pay.bg, color: pay.color, fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                            {pay.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: stat.bg, color: stat.color, fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                            {stat.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                          {worker ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>👷 {worker.name}</div>
                              {site && <div style={{ fontSize: '12px', color: '#9ca3af' }}>📍 {site.name}</div>}
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mob-cards">
              {partners.map(p => {
                const pay  = paymentBadge(p)
                const stat = statusBadge(p.status)
                const worker = workers.find(w => w.id === p.worker_id)
                return (
                  <div key={p.id} style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{p.company_name}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ background: pay.bg, color: pay.color, fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>{pay.label}</span>
                        <span style={{ background: stat.bg, color: stat.color, fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}>{stat.label}</span>
                      </div>
                    </div>
                    {p.contact_name  && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '3px' }}>👤 {p.contact_name}</div>}
                    {p.contact_email && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '3px' }}>✉️ {p.contact_email}</div>}
                    {worker && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '3px' }}>👷 {worker.name}</div>}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                      <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#2C5F2D' }}>{p.trees_assigned || p.tree_count || 0}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Trees</div></div>
                      <div><div style={{ fontSize: '16px', fontWeight: 700, color: '#2C5F2D' }}>{survivalRate(p)}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Survival</div></div>
                      {p.budget && <div><div style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>{p.budget}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Budget</div></div>}
                    </div>
                  </div>
                )
              })}
              {partners.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '2rem' }}>No active CSR partners yet</div>}
            </div>
          </div>
        </>
      )}

      <style>{`
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .desk-table { display: block; }
        .mob-cards  { display: none; }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .desk-table { display: none; }
          .mob-cards  { display: block; }
        }
        button:hover { opacity: 0.9; }
        select:focus, input:focus { border-color: #2C5F2D !important; }
      `}</style>
    </div>
  )
}
