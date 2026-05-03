'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Update {
  id: number
  update_date: string
  is_verified: boolean
  verified_by: string
  photo_url: string | null
  trees: { tree_id: string; species: string } | null
  sites?: { name: string } | null
}

export default function FieldStatus() {
  const router  = useRouter()
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [worker,  setWorker]  = useState<any>(null)

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.replace('/field/login'); return }

    const { data: userData } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', session.user.email)
      .single()

    setWorker(userData)

    const { data } = await supabase
      .from('tree_updates')
      .select('id, update_date, is_verified, verified_by, photo_url, trees(tree_id, species)')
      .eq('worker_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setUpdates((data as unknown as Update[]) || [])
    setLoading(false)
  }

  function statusInfo(u: Update) {
    if (u.is_verified)                return { icon: '✅', label: 'Verified',      bg: '#dcfce7', text: '#166534' }
    if (u.verified_by === 'REJECTED') return { icon: '❌', label: 'Rejected',      bg: '#fee2e2', text: '#991b1b' }
    if (u.verified_by === 'PENDING')  return { icon: '⏳', label: 'Pending review', bg: '#fef3c7', text: '#92400e' }
    return                                   { icon: '☁️', label: 'Uploaded',       bg: '#dbeafe', text: '#1e40af' }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#1A3C34', padding: '1rem 1.25rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, color: '#97BC62' }}>
          Eco<span style={{ color: 'white' }}>Tree</span>
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginTop: '4px' }}>Upload Status</div>
      </div>

      {/* Summary */}
      <div style={{ padding: '1rem 1.25rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Verified',  count: updates.filter(u => u.is_verified).length,                           color: '#166534', bg: '#dcfce7' },
            { label: 'Pending',   count: updates.filter(u => !u.is_verified && u.verified_by === 'PENDING').length, color: '#92400e', bg: '#fef3c7' },
            { label: 'Rejected',  count: updates.filter(u => u.verified_by === 'REJECTED').length,            color: '#991b1b', bg: '#fee2e2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '12px', color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Updates list */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280', fontSize: '14px' }}>Loading...</div>
        ) : updates.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>No uploads yet</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Plant your first tree to see status here</div>
          </div>
        ) : updates.map(u => {
          const s = statusInfo(u)
          return (
            <div key={u.id} style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Photo thumbnail */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '10px', flexShrink: 0,
                background: u.photo_url ? `url(${u.photo_url}) center/cover` : 'linear-gradient(135deg,#2d6a4f,#52b788)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>
                {!u.photo_url && '🌳'}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#1A3C34', marginBottom: '3px' }}>
                  {u.trees?.tree_id || '—'}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  🌿 {u.trees?.species || '—'} · {new Date(u.update_date).toLocaleDateString('en-IN')}
                </div>
                <span style={{ background: s.bg, color: s.text, fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>
                  {s.icon} {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-around', position: 'sticky', bottom: 0 }}>
        <div onClick={() => router.push('/field/tasks')} style={{ textAlign: 'center', color: '#9ca3af', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>📋</div>
          <div style={{ fontSize: '11px' }}>Tasks</div>
        </div>
        <div style={{ textAlign: 'center', color: '#1A3C34' }}>
          <div style={{ fontSize: '20px' }}>☁️</div>
          <div style={{ fontSize: '11px', fontWeight: 600 }}>Uploads</div>
        </div>
      </div>
    </div>
  )
}
