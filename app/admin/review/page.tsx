'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ReviewItem {
  id: number
  photo_url: string | null
  latitude: number | null
  longitude: number | null
  ai_health_score: number | null
  ai_species_match: boolean | null
  ai_gps_match: boolean | null
  ai_duplicate_check: boolean | null
  ai_timestamp_valid: boolean | null
  notes: string | null
  update_date: string
  trees: {
    tree_id: string
    species: string
    latitude: number | null
    longitude: number | null
    sites: { name: string } | null
  } | null
  users: { name: string; phone: string | null } | null
}

export default function AdminReview() {
  const [items, setItems]     = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    setLoading(true)
    const { data } = await supabase
      .from('tree_updates')
      .select(`
        id, photo_url, latitude, longitude,
        ai_health_score, ai_species_match, ai_gps_match,
        ai_duplicate_check, ai_timestamp_valid,
        notes, update_date,
        trees(tree_id, species, latitude, longitude, sites(name)),
        users(name, phone)
      `)
      .eq('is_verified', false)
      .in('verified_by', ['PENDING', 'AI'])
      .order('created_at', { ascending: true })
    setItems((data as unknown as ReviewItem[]) || [])
    setLoading(false)
  }

  async function handleDecision(id: number, approve: boolean) {
    setProcessing(true)
    await supabase
      .from('tree_updates')
      .update({
        is_verified:  approve,
        verified_by:  approve ? 'HUMAN' : 'REJECTED'
      })
      .eq('id', id)

    if (approve) {
      // Update tree status to VERIFIED
      const item = items.find(i => i.id === id)
      if (item?.trees) {
        await supabase
          .from('trees')
          .update({
            status:             'VERIFIED',
            latest_health_score: item.ai_health_score,
            latest_update_date:  item.update_date
          })
          .eq('tree_id', item.trees.tree_id)
      }
    }

    setSelected(null)
    loadQueue()
    setProcessing(false)
  }

  function FailReason({ item }: { item: ReviewItem }) {
    const reasons = []
    if (item.ai_species_match === false) reasons.push({ label: 'Species mismatch', color: '#fee2e2', text: '#991b1b' })
    if (item.ai_gps_match     === false) reasons.push({ label: 'GPS off target',   color: '#fef3c7', text: '#92400e' })
    if (item.ai_duplicate_check === false) reasons.push({ label: 'Duplicate photo', color: '#fee2e2', text: '#991b1b' })
    if (item.ai_timestamp_valid === false) reasons.push({ label: 'Invalid timestamp', color: '#fef3c7', text: '#92400e' })
    if (reasons.length === 0) reasons.push({ label: 'Pending review', color: '#e0f2fe', text: '#075985' })
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {reasons.map(r => (
          <span key={r.label} style={{ background: r.color, color: r.text, fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}>
            {r.label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Review Queue</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          {items.length} photo{items.length !== 1 ? 's' : ''} waiting for human review — Claude Vision flagged these for manual approval
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>Queue is clear!</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>All recent photos passed AI verification</div>
        </div>
      ) : (
        <>
          {/* Review cards grid */}
          <div className="review-grid">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                style={{
                  background: 'white',
                  border: selected?.id === item.id ? '2px solid #2C5F2D' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s'
                }}
              >
                {/* Photo */}
                <div style={{
                  height: '140px',
                  background: item.photo_url ? `url(${item.photo_url}) center/cover` : 'linear-gradient(135deg,#2d6a4f,#52b788)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  position: 'relative'
                }}>
                  {!item.photo_url && '🌳'}
                  {item.ai_health_score !== null && (
                    <div style={{
                      position: 'absolute',
                      top: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '12px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      Health: {item.ai_health_score}
                    </div>
                  )}
                </div>

                <div style={{ padding: '0.875rem' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', fontFamily: 'monospace', marginBottom: '4px' }}>
                    {item.trees?.tree_id || '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                    👷 {item.users?.name || '—'} · 📍 {item.trees?.sites?.name || '—'}
                  </div>
                  <FailReason item={item} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDecision(item.id, true) }}
                      disabled={processing}
                      style={{ flex: 1, padding: '7px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDecision(item.id, false) }}
                      disabled={processing}
                      style={{ flex: 1, padding: '7px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px 16px 0 0',
              padding: '1.25rem',
              maxHeight: '50vh',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: '0 -8px 32px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Review: {selected.trees?.tree_id}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  ['Species match', selected.ai_species_match],
                  ['GPS match',     selected.ai_gps_match],
                  ['No duplicate',  selected.ai_duplicate_check],
                  ['Valid timestamp', selected.ai_timestamp_valid],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{
                    background: val === true ? '#dcfce7' : val === false ? '#fee2e2' : '#f3f4f6',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>{val === true ? '✅' : val === false ? '❌' : '⏳'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{String(label)}</span>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#374151', marginBottom: '1rem' }}>
                  📝 {selected.notes}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDecision(selected.id, true)}
                  disabled={processing}
                  style={{ flex: 1, padding: '12px', background: '#2C5F2D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Approve ✓
                </button>
                <button
                  onClick={() => handleDecision(selected.id, false)}
                  disabled={processing}
                  style={{ flex: 1, padding: '12px', background: 'transparent', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reject ✕
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        @media (max-width: 900px) { .review-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .review-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
