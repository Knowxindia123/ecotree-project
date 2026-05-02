'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  totalTrees: number
  verifiedTrees: number
  totalWorkers: number
  reviewQueue: number
  totalDonors: number
  survivalRate: number
}

interface RecentUpdate {
  id: number
  tree_id: string
  is_verified: boolean
  verified_by: string
  update_date: string
  trees: { tree_id: string; species: string; sites: { name: string } | null }
  users: { name: string } | null
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [recent, setRecent]   = useState<RecentUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [treesRes, workersRes, reviewRes, donorsRes, recentRes] = await Promise.all([
      supabase.from('trees').select('id, status', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'WORKER'),
      supabase.from('tree_updates').select('id', { count: 'exact' }).eq('is_verified', false).eq('verified_by', 'PENDING'),
      supabase.from('donors').select('id', { count: 'exact' }),
      supabase.from('tree_updates')
        .select('id, tree_id, is_verified, verified_by, update_date, trees(tree_id, species, sites(name)), users(name)')
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    const totalTrees    = treesRes.count || 0
    const verifiedTrees = treesRes.data?.filter(t => t.status === 'VERIFIED').length || 0
    const survivalRate  = totalTrees > 0 ? Math.round((verifiedTrees / totalTrees) * 100) : 0

    setStats({
      totalTrees,
      verifiedTrees,
      totalWorkers: workersRes.count || 0,
      reviewQueue: reviewRes.count || 0,
      totalDonors: donorsRes.count || 0,
      survivalRate
    })

    setRecent((recentRes.data as unknown as RecentUpdate[]) || [])
    setLoading(false)
  }

  function statusBadge(update: RecentUpdate) {
    if (update.is_verified) return { label: 'Verified', color: '#dcfce7', text: '#166534' }
    if (update.verified_by === 'REJECTED') return { label: 'Rejected', color: '#fee2e2', text: '#991b1b' }
    return { label: 'Pending', color: '#fef3c7', text: '#92400e' }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Welcome back, Bhimsen. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total trees',    value: stats?.totalTrees.toLocaleString('en-IN') || '0', sub: 'All time', color: '#2C5F2D' },
              { label: 'Survival rate',  value: `${stats?.survivalRate}%`,  sub: 'AI monitored', color: '#97BC62' },
              { label: 'Field workers',  value: String(stats?.totalWorkers || 0), sub: 'Active accounts', color: '#0369a1' },
              { label: 'Review queue',   value: String(stats?.reviewQueue || 0),  sub: 'Needs attention', color: stats?.reviewQueue ? '#dc2626' : '#6b7280' },
              { label: 'Total donors',   value: stats?.totalDonors.toLocaleString('en-IN') || '0', sub: 'Registered', color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent updates */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Recent tree updates</span>
              <Link href="/admin/review" style={{ fontSize: '13px', color: '#2C5F2D', textDecoration: 'none' }}>View all →</Link>
            </div>

            {/* Desktop table */}
            <div className="desk-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Tree ID','Worker','Site','Species','Status','Action'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '12px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No updates yet</td></tr>
                  ) : recent.map(u => {
                    const badge = statusBadge(u)
                    return (
                      <tr key={u.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1A1A1A', fontFamily: 'monospace' }}>{u.trees?.tree_id || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{u.users?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{u.trees?.sites?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>{u.trees?.species || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: badge.color, color: badge.text, fontSize: '12px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Link href={`/admin/review?id=${u.id}`} style={{ fontSize: '13px', color: '#2C5F2D', textDecoration: 'none', fontWeight: 500 }}>
                            Review →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mob-cards">
              {recent.map(u => {
                const badge = statusBadge(u)
                return (
                  <div key={u.id} style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1A1A1A', fontWeight: 500 }}>{u.trees?.tree_id || '—'}</span>
                      <span style={{ background: badge.color, color: badge.text, fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
                      👷 {u.users?.name || '—'} · 📍 {u.trees?.sites?.name || '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>
                      🌿 {u.trees?.species || '—'}
                    </div>
                    <Link href={`/admin/review?id=${u.id}`} style={{ fontSize: '13px', color: '#2C5F2D', textDecoration: 'none', fontWeight: 500 }}>
                      Review →
                    </Link>
                  </div>
                )
              })}
              {recent.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No updates yet</div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/admin/workers" style={{ padding: '10px 20px', background: '#2C5F2D', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              + Add worker
            </Link>
            <Link href="/admin/assign" style={{ padding: '10px 20px', background: '#97BC62', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Assign trees
            </Link>
            {(stats?.reviewQueue || 0) > 0 && (
              <Link href="/admin/review" style={{ padding: '10px 20px', background: '#dc2626', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                Review queue ({stats?.reviewQueue})
              </Link>
            )}
          </div>
        </>
      )}

      <style>{`
        .stat-grid { grid-template-columns: repeat(5, 1fr); }
        .mob-cards { display: none; }
        @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .desk-table { display: none; }
          .mob-cards { display: block; }
        }
        @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  )
}
