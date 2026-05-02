'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Donor {
  id: number
  name: string
  email: string
  phone: string | null
  total_trees: number
  total_donated: number
  created_at: string
  city: string | null
}

export default function AdminDonors() {
  const [donors, setDonors]   = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => { loadDonors() }, [])

  async function loadDonors() {
    setLoading(true)
    const { data } = await supabase
      .from('donors')
      .select('id, name, email, phone, total_trees, total_donated, created_at, city')
      .order('created_at', { ascending: false })
    setDonors(data || [])
    setLoading(false)
  }

  const filtered = donors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalTrees   = donors.reduce((sum, d) => sum + (d.total_trees || 0), 0)
  const totalDonated = donors.reduce((sum, d) => sum + Number(d.total_donated || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Donors</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          {donors.length} donors · {totalTrees} trees · ₹{totalDonated.toLocaleString('en-IN')} raised
        </p>
      </div>

      {/* Search + export */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="desk-table" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Name','Email','Phone','City','Trees','Amount','Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No donors found</td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{d.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{d.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{d.phone || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{d.city || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#2C5F2D' }}>{d.total_trees}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>₹{Number(d.total_donated).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9ca3af' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mob-cards">
            {filtered.map(d => (
              <div key={d.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{d.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#2C5F2D' }}>{d.total_trees} trees</span>
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>✉️ {d.email}</div>
                {d.phone && <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>📞 {d.phone}</div>}
                <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>₹{Number(d.total_donated).toLocaleString('en-IN')} donated</div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '2rem' }}>No donors found</div>}
          </div>
        </>
      )}

      <style>{`
        .desk-table { display: block; }
        .mob-cards { display: none; }
        @media (max-width: 768px) {
          .desk-table { display: none; }
          .mob-cards { display: block; }
        }
        input:focus { border-color: #2C5F2D !important; }
      `}</style>
    </div>
  )
}
