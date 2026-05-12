'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TreeDetail {
  id: number; tree_id: string; species: string; status: string
  latitude: number | null; longitude: number | null
  sites: { name: string } | null
}

interface Donor {
  id: number; name: string; email: string; phone: string | null
  total_trees: number; total_donated: number; created_at: string
  city: string | null; tier: string | null
  planted_count: number; verified_count: number; trees: TreeDetail[]
}

interface JointGroup {
  type: 'joint'
  pool_id: number
  pool_status: 'COMPLETE' | 'OPEN'
  tree_id: number | null
  donors: Donor[]
}

type DonorRow = Donor | JointGroup

export default function AdminDonors() {
  const [donors,     setDonors]     = useState<Donor[]>([])
  const [rows,       setRows]       = useState<DonorRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => { loadDonors() }, [])

  async function loadDonors() {
    setLoading(true)
    const { data: donorRows } = await supabase
      .from('donors')
      .select('id, name, email, phone, total_trees, total_donated, created_at, city, tier')
      .order('created_at', { ascending: false })

    if (!donorRows || donorRows.length === 0) { setDonors([]); setRows([]); setLoading(false); return }

    const donorIds = donorRows.map((d: any) => d.id)
    const { data: treesData } = await supabase
      .from('trees')
      .select('id, tree_id, species, status, latitude, longitude, donor_id, sites(name)')
      .in('donor_id', donorIds)

    const treesByDonor: Record<number, TreeDetail[]> = {}
    ;(treesData || []).forEach((t: any) => {
      const site = Array.isArray(t.sites) ? t.sites[0] : t.sites
      if (!treesByDonor[t.donor_id]) treesByDonor[t.donor_id] = []
      treesByDonor[t.donor_id].push({
        id: t.id, tree_id: t.tree_id, species: t.species,
        status: t.status, latitude: t.latitude, longitude: t.longitude,
        sites: site || null
      })
    })

    const enriched: Donor[] = donorRows.map((d: any) => {
      const trees = treesByDonor[d.id] || []
      return {
        ...d, trees,
        planted_count:  trees.filter((t: TreeDetail) => ['PLANTED','VERIFIED'].includes(t.status)).length,
        verified_count: trees.filter((t: TreeDetail) => t.status === 'VERIFIED').length
      }
    })

    setDonors(enriched)

    // --- Pool grouping for ₹500 donors ---
    const donor500Ids = enriched.filter(d => d.tier === '500').map(d => d.id)

    if (donor500Ids.length > 0) {
      const { data: poolData } = await supabase
        .from('tree_pool_members')
        .select('donor_id, pool_id, tree_pools(id, status, tree_id, slots_filled)')
        .in('donor_id', donor500Ids)

      // Build poolMap: pool_id → { status, tree_id, slots_filled, donorIds[] }
      const poolMap: Record<number, {
        status: string; tree_id: number | null
        slots_filled: number; donorIds: number[]
      }> = {}

      ;(poolData || []).forEach((pm: any) => {
        const tp = Array.isArray(pm.tree_pools) ? pm.tree_pools[0] : pm.tree_pools
        if (!poolMap[pm.pool_id]) {
          poolMap[pm.pool_id] = {
            status:       tp?.status      || 'OPEN',
            tree_id:      tp?.tree_id     || null,
            slots_filled: tp?.slots_filled || 1,
            donorIds:     []
          }
        }
        poolMap[pm.pool_id].donorIds.push(pm.donor_id)
      })

      const builtRows: DonorRow[] = []
      const grouped500Ids = new Set<number>()

      // Build joint rows
      Object.entries(poolMap).forEach(([poolIdStr, pool]) => {
        const poolId      = Number(poolIdStr)
        const poolDonors  = enriched.filter(d => pool.donorIds.includes(d.id))
        poolDonors.forEach(d => grouped500Ids.add(d.id))
        builtRows.push({
          type:        'joint',
          pool_id:     poolId,
          pool_status: pool.status as 'COMPLETE' | 'OPEN',
          tree_id:     pool.tree_id,
          donors:      poolDonors
        })
      })

      // Add non-500 donors normally
      enriched.filter(d => d.tier !== '500').forEach(d => builtRows.push(d))

      // Edge case: ₹500 donor not in any pool
      enriched
        .filter(d => d.tier === '500' && !grouped500Ids.has(d.id))
        .forEach(d => builtRows.push(d))

      setRows(builtRows)
    } else {
      setRows(enriched)
    }

    setLoading(false)
  }

  const filtered = rows.filter(row => {
    if ('type' in row) {
      return row.donors.some(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    return (row as Donor).name.toLowerCase().includes(search.toLowerCase()) ||
           (row as Donor).email.toLowerCase().includes(search.toLowerCase())
  })

  const totalTrees   = donors.reduce((s, d) => s + (d.total_trees  || 0), 0)
  const totalDonated = donors.reduce((s, d) => s + Number(d.total_donated || 0), 0)

  function toggleExpand(id: number) { setExpandedId(prev => prev === id ? null : id) }

  function getDashboardUrl(donor: Donor): string {
    const tier = donor.tier || '1000'
    if (tier === '100' || tier === '250') return `/community-dashboard?donor_id=${donor.id}&admin_view=true`
    if (tier === '5000') return `/miyawaki-dashboard?donor_id=${donor.id}&admin_view=true`
    return `/my-tree?donor_id=${donor.id}&admin_view=true`
  }

  function getDashboardLabel(donor: Donor): string {
    const tier = donor.tier || '1000'
    if (tier === '100' || tier === '250') return '🌿 Community'
    if (tier === '5000') return '🏙️ Miyawaki'
    if (tier === '500') return '🤝 Joint'
    return '🌳 My Tree'
  }

  function getDashboardColor(donor: Donor): string {
    const tier = donor.tier || '1000'
    if (tier === '100' || tier === '250') return '#2C5F2D'
    if (tier === '5000') return '#7C3AED'
    if (tier === '500') return '#F59E0B'
    return '#1A3C34'
  }

  function statusBadge(status: string) {
    switch (status) {
      case 'VERIFIED': return { bg: '#dcfce7', color: '#166534', label: '✅ Verified' }
      case 'PLANTED':  return { bg: '#dbeafe', color: '#1e40af', label: '🌱 Planted'  }
      case 'PENDING':  return { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending'  }
      default:         return { bg: '#f3f4f6', color: '#6b7280', label: status        }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Donors</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>{donors.length} donors · {totalTrees} trees · ₹{totalDonated.toLocaleString('en-IN')} raised</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
      </div>

      {loading ? <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div> : (
        <>
          <div className="desk-table" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={thStyle}>▼</th>
                    <th style={{ ...thStyle, position: 'sticky', left: 0, background: '#f9fafb', zIndex: 1 }}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>City</th>
                    <th style={thStyle}>Tier</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Trees</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Planted</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Verified</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Dashboard</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={12} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No donors found</td></tr>
                  ) : filtered.map((row, idx) => {

                    // ── JOINT ROW ──────────────────────────────────────────
                    if ('type' in row) {
                      const isComplete = row.pool_status === 'COMPLETE'
                      const names      = row.donors.map(d => d.name).join(' + ')
                      const emails     = row.donors.map(d => d.email)
                      const totalAmt   = row.donors.reduce((s, d) => s + Number(d.total_donated), 0)
                      const joinDate   = row.donors[0]?.created_at

                      return (
                        <tr key={`joint-${row.pool_id}`} style={{ borderTop: '1px solid #f3f4f6', background: '#fffbeb' }}>
                          <td style={{ padding: '10px 8px 10px 12px', width: '32px' }}></td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', position: 'sticky', left: 0, background: '#fffbeb', zIndex: 1, whiteSpace: 'nowrap' }}>
                            🤝 {names}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280' }}>
                            <div>{emails[0]?.length > 20 ? emails[0].slice(0,20)+'…' : emails[0]}</div>
                            {emails[1] && <div style={{ color: '#9ca3af' }}>{emails[1]?.length > 20 ? emails[1].slice(0,20)+'…' : emails[1]}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280' }}>—</td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280' }}>—</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px' }}>₹500×2</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#2C5F2D', textAlign: 'center' }}>
                            {isComplete ? 1 : 0}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>🌱 0</span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>✅ 0</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>
                            ₹{totalAmt.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {joinDate ? new Date(joinDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                          {isComplete ? (
  <a href={`/my-tree?donor_id=${row.donors[0]?.id}&admin_view=true`} target="_blank" rel="noopener noreferrer"
    style={{ padding: '4px 10px', background: '#F59E0B', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-block', textDecoration: 'none' }}>
    🤝 Joint →
  </a>
) : (
  <span style={{ padding: '4px 10px', background: '#9ca3af', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'inline-block' }}>
    ⏳ Waiting
  </span>
)}
                          </td>
                        </tr>
                      )
                    }

                    // ── NORMAL ROW ─────────────────────────────────────────
                    const d = row as Donor
                    return (
                      <>
                        <tr key={d.id} style={{ borderTop: '1px solid #f3f4f6', background: expandedId === d.id ? '#f0fdf4' : 'white' }}>
                          <td style={{ padding: '10px 8px 10px 12px', width: '32px' }}>
                            <button onClick={() => toggleExpand(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#6B7280', padding: '2px 4px', borderRadius: '4px' }}>
                              {expandedId === d.id ? '▲' : '▼'}
                            </button>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', position: 'sticky', left: 0, background: expandedId === d.id ? '#f0fdf4' : 'white', zIndex: 1, whiteSpace: 'nowrap' }}>{d.name}</td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email.length > 22 ? d.email.slice(0,22)+'…' : d.email}</td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{d.phone || '—'}</td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{d.city || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '4px' }}>₹{d.tier || '1000'}</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#2C5F2D', textAlign: 'center' }}>{d.total_trees}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>🌱 {d.planted_count}</span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>✅ {d.verified_count}</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>₹{Number(d.total_donated).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 12px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <a href={getDashboardUrl(d)} target="_blank" rel="noopener noreferrer"
                              style={{ padding: '4px 10px', background: getDashboardColor(d), color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}>
                              {getDashboardLabel(d)} →
                            </a>
                          </td>
                        </tr>
                        {expandedId === d.id && (
                          <tr key={`expand-${d.id}`}>
                            <td colSpan={12} style={{ padding: 0, background: '#f8fafc', borderTop: '1px solid #e5e7eb', borderBottom: '2px solid #97BC62' }}>
                              {d.trees.length === 0 ? (
                                <div style={{ padding: '1rem 1.5rem', fontSize: '13px', color: '#9ca3af' }}>
                                  {d.tier === '100' || d.tier === '250' ? 'Community donor — no individual tree assigned.' : 'No trees linked to this donor yet.'}
                                </div>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ background: '#f1f5f9' }}>
                                      {['Tree ID','Species','Site','GPS','Status','Profile'].map(h => (
                                        <th key={h} style={{ padding: '8px 16px', fontSize: '11px', color: '#6B7280', fontWeight: 500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {d.trees.map(t => {
                                      const badge  = statusBadge(t.status)
                                      const hasGps = !!(t.latitude && t.longitude)
                                      return (
                                        <tr key={t.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                          <td style={{ padding: '8px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#1A1A1A' }}>{t.tree_id}</td>
                                          <td style={{ padding: '8px 16px', fontSize: '12px', color: '#374151' }}>{t.species}</td>
                                          <td style={{ padding: '8px 16px', fontSize: '12px', color: '#6B7280' }}>{t.sites?.name || '—'}</td>
                                          <td style={{ padding: '8px 16px' }}>
                                            {hasGps
                                              ? <a href={`https://maps.google.com/?q=${t.latitude},${t.longitude}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2C5F2D', textDecoration: 'none', fontWeight: 500 }}>📍 GPS ✅</a>
                                              : <span style={{ fontSize: '12px', color: '#9ca3af' }}>No GPS</span>}
                                          </td>
                                          <td style={{ padding: '8px 16px' }}>
                                            <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}>{badge.label}</span>
                                          </td>
                                          <td style={{ padding: '8px 16px' }}>
                                            <a href={`/tree/${t.tree_id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2C5F2D', textDecoration: 'none', fontWeight: 500 }}>View profile →</a>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="mob-cards">
            {filtered.map((row, idx) => {

              // Joint card
              if ('type' in row) {
                const isComplete = row.pool_status === 'COMPLETE'
                const names      = row.donors.map(d => d.name).join(' + ')
                const totalAmt   = row.donors.reduce((s, d) => s + Number(d.total_donated), 0)
                return (
                  <div key={`joint-mob-${row.pool_id}`} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>🤝 {names}</span>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {row.donors.map(d => d.email).join(' · ')}
                        </div>
                      </div>
                      {isComplete
                        ? <span style={{ padding: '4px 10px', background: '#F59E0B', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>🤝 Joint ✅</span>
                        : <span style={{ padding: '4px 10px', background: '#9ca3af', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>⏳ Waiting</span>
                      }
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>₹500×2</span>
                      <span style={{ background: '#f0fdf4', color: '#2C5F2D', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', border: '1px solid #86efac' }}>🌳 {isComplete ? 1 : 0} tree</span>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500, padding: '3px 8px' }}>₹{totalAmt.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )
              }

              // Normal card
              const d = row as Donor
              return (
                <div key={d.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{d.name}</span>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{d.email}</div>
                    </div>
                    <a href={getDashboardUrl(d)} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '4px 10px', background: getDashboardColor(d), color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}>
                      {getDashboardLabel(d)} →
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>₹{d.tier || '1000'}</span>
                    <span style={{ background: '#f0fdf4', color: '#2C5F2D', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', border: '1px solid #86efac' }}>🌳 {d.total_trees} trees</span>
                    <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>🌱 {d.planted_count}</span>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px' }}>✅ {d.verified_count}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500, marginBottom: '4px' }}>₹{Number(d.total_donated).toLocaleString('en-IN')} · {d.city || '—'}</div>
                  <button onClick={() => toggleExpand(d.id)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#6B7280', cursor: 'pointer', marginTop: '4px' }}>
                    {expandedId === d.id ? '▲ Hide trees' : `▼ Show ${d.trees.length} trees`}
                  </button>
                  {expandedId === d.id && d.trees.length > 0 && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {d.trees.map(t => {
                        const badge = statusBadge(t.status)
                        return (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <div>
                              <span style={{ fontFamily: 'monospace', color: '#2C5F2D', fontWeight: 600 }}>{t.tree_id}</span>
                              <span style={{ color: '#6B7280', marginLeft: '6px' }}>{t.species} · {t.sites?.name || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>{badge.label}</span>
                              <a href={`/tree/${t.tree_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2C5F2D', textDecoration: 'none', fontWeight: 600 }}>→</a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '2rem' }}>No donors found</div>}
          </div>
        </>
      )}

      <style>{`
        .desk-table{display:block;}.mob-cards{display:none;}
        @media(max-width:768px){.desk-table{display:none;}.mob-cards{display:block;}}
        input:focus{border-color:#2C5F2D !important;}
        tbody tr:hover{background:#fafafa;}
      `}</style>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: '11px', color: '#6B7280', fontWeight: 500,
  textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
}
