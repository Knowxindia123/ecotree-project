'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Worker {
  id: number
  name: string
  email: string
  phone: string | null
  is_active: boolean
}

export default function AdminWorkers() {
  const [workers,  setWorkers]  = useState<Worker[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ name: '', email: '', phone: '', password: '' })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => { loadWorkers() }, [])

  async function loadWorkers() {
    setLoading(true)
    const { data } = await supabase.from('users').select('id, name, email, phone, is_active').eq('role', 'WORKER').order('name')
    setWorkers(data || [])
    setLoading(false)
  }

  async function addWorker(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const res = await fetch('/api/create-worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create worker')
    } else {
      setSuccess('Worker ' + form.name + ' added! They can login with ' + form.email)
      setForm({ name: '', email: '', phone: '', password: '' })
      setShowForm(false)
      loadWorkers()
    }
    setSaving(false)
  }

  async function toggleActive(worker: Worker) {
    await supabase.from('users').update({ is_active: !worker.is_active }).eq('id', worker.id)
    loadWorkers()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.25rem', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>Field Workers</h1>
          <p style={{ fontSize:'14px', color:'#6B7280' }}>{workers.filter(w=>w.is_active).length} active · {workers.length} total</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setSuccess(''); setError('') }} style={{ padding:'10px 20px', background:'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>+ Add worker</button>
      </div>

      {success && <div style={{ background:'#dcfce7', border:'1px solid #86efac', borderRadius:'10px', padding:'0.875rem 1rem', fontSize:'14px', color:'#166534', marginBottom:'1rem' }}>{success}</div>}

      {showForm && (
        <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.25rem', marginBottom:'1.5rem' }}>
          <h3 style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'0.25rem' }}>Add new field worker</h3>
          <p style={{ fontSize:'13px', color:'#6B7280', marginBottom:'1rem' }}>Login account will be created automatically. Share email + password with worker.</p>
          <form onSubmit={addWorker}>
            <div className="form-grid">
              {[{label:'Full name *',key:'name',type:'text',ph:'Raju Kumar'},{label:'Email *',key:'email',type:'email',ph:'raju@gmail.com'},{label:'Phone',key:'phone',type:'tel',ph:'+91 98765 43210'},{label:'Password *',key:'password',type:'password',ph:'Min 6 characters'}].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:500, color:'#374151', marginBottom:'6px' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} required={f.key!=='phone'} style={{ width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none' }} />
                </div>
              ))}
            </div>
            {error && <div style={{ color:'#dc2626', fontSize:'13px', margin:'0.75rem 0' }}>{error}</div>}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem' }}>
              <button type="submit" disabled={saving} style={{ padding:'10px 20px', background:saving?'#9ca3af':'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:saving?'not-allowed':'pointer' }}>{saving?'Creating...':'Add worker'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding:'10px 20px', background:'transparent', color:'#6B7280', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', cursor:'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ color:'#6B7280', fontSize:'14px' }}>Loading...</div> : (
        <>
          <div className="desk-table" style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#f9fafb' }}>{['Name','Email','Phone','Status','Action'].map(h => <th key={h} style={{ padding:'10px 16px', fontSize:'12px', color:'#6B7280', fontWeight:500, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>)}</tr></thead>
              <tbody>
                {workers.length===0 ? <tr><td colSpan={5} style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>No workers yet</td></tr>
                : workers.map(w => (
                  <tr key={w.id} style={{ borderTop:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:'10px' }}><div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#1A3C34', color:'#97BC62', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600 }}>{w.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div><span style={{ fontSize:'14px', fontWeight:500, color:'#1A1A1A' }}>{w.name}</span></div></td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#6B7280' }}>{w.email}</td>
                    <td style={{ padding:'12px 16px', fontSize:'13px', color:'#6B7280' }}>{w.phone||'—'}</td>
                    <td style={{ padding:'12px 16px' }}><span style={{ background:w.is_active?'#dcfce7':'#f3f4f6', color:w.is_active?'#166534':'#6B7280', fontSize:'12px', padding:'3px 8px', borderRadius:'6px', fontWeight:500 }}>{w.is_active?'Active':'Inactive'}</span></td>
                    <td style={{ padding:'12px 16px' }}><button onClick={() => toggleActive(w)} style={{ fontSize:'12px', padding:'5px 12px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:'6px', cursor:'pointer', color:'#374151' }}>{w.is_active?'Deactivate':'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mob-cards">
            {workers.map(w => (
              <div key={w.id} style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1rem', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>{w.name}</div>
                  <span style={{ background:w.is_active?'#dcfce7':'#f3f4f6', color:w.is_active?'#166534':'#6B7280', fontSize:'11px', padding:'3px 8px', borderRadius:'6px' }}>{w.is_active?'Active':'Inactive'}</span>
                </div>
                <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'4px' }}>✉️ {w.email}</div>
                <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'10px' }}>📞 {w.phone||'No phone'}</div>
                <button onClick={() => toggleActive(w)} style={{ fontSize:'13px', padding:'6px 14px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:'6px', cursor:'pointer' }}>{w.is_active?'Deactivate':'Activate'}</button>
              </div>
            ))}
          </div>
        </>
      )}
      <style>{`.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.desk-table{display:block}.mob-cards{display:none}@media(max-width:768px){.form-grid{grid-template-columns:1fr}.desk-table{display:none}.mob-cards{display:block}}`}</style>
    </div>
  )
}
