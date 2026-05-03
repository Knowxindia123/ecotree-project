'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Task {
  id: number
  status: string
  due_date: string | null
  notes: string | null
  trees: {
    id: number
    tree_id: string
    species: string
    tree_type: string
    status: string
  } | null
  sites: {
    name: string
    latitude: number | null
    longitude: number | null
  } | null
}

interface WorkerInfo {
  name: string
  email: string
}

export default function FieldTasks() {
  const router = useRouter()
  const [tasks,  setTasks]  = useState<Task[]>([])
  const [worker, setWorker] = useState<WorkerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.replace('/field/login')
      return
    }

    // Get worker info
    const { data: userData } = await supabase
      .from('users')
      .select('name, email, id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      window.location.replace('/field/login')
      return
    }

    setWorker(userData)

    // Get today's assignments
    const today = new Date().toISOString().split('T')[0]
    const { data: assignments } = await supabase
      .from('assignments')
      .select(`
        id, status, due_date, notes,
        trees(id, tree_id, species, tree_type, status),
        sites(name, latitude, longitude)
      `)
      .eq('worker_id', userData.id)
      .in('status', ['ASSIGNED', 'IN_PROGRESS'])
      .order('assigned_at', { ascending: true })

    setTasks((assignments as unknown as Task[]) || [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.replace('/field/login')
  }

  function statusColor(status: string) {
    switch (status) {
      case 'ASSIGNED':    return { bg: '#fef3c7', text: '#92400e', label: 'Pending' }
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' }
      case 'COMPLETED':   return { bg: '#dcfce7', text: '#166534', label: 'Done' }
      default:            return { bg: '#f3f4f6', text: '#6b7280', label: status }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading your tasks...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        background: '#1A3C34',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, color: '#97BC62' }}>
            Eco<span style={{ color: 'white' }}>Tree</span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
            👋 {worker?.name}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>

      {/* Date + count */}
      <div style={{ padding: '1rem 1.25rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>
          Today&apos;s Tasks
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}{tasks.length} tree{tasks.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {/* Tasks list */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
              All done for today!
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              No pending tasks. Check back tomorrow.
            </div>
          </div>
        ) : tasks.map(task => {
          const badge = statusColor(task.trees?.status || 'ASSIGNED')
          return (
            <div
              key={task.id}
              onClick={() => router.push(`/field/plant/${task.id}`)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Tree ID + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#1A3C34' }}>
                  {task.trees?.tree_id || 'Unassigned'}
                </div>
                <span style={{
                  background: badge.bg,
                  color: badge.text,
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 500
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Species + type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {task.trees?.species === 'Mango' ? '🥭' :
                   task.trees?.species === 'Neem'  ? '🌿' :
                   task.trees?.species === 'Peepal' ? '🌳' : '🌱'}
                </span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>
                    {task.trees?.species || 'Unknown species'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {task.trees?.tree_type}
                  </div>
                </div>
              </div>

              {/* Site */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>📍</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>{task.sites?.name || 'No site'}</span>
              </div>

              {/* Due date */}
              {task.due_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>📅</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    Due: {new Date(task.due_date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>📝</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{task.notes}</span>
                </div>
              )}

              {/* Tap to plant CTA */}
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: '#f0fdf4',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A3C34' }}>
                  Tap to plant this tree
                </span>
                <span style={{ fontSize: '18px' }}>→</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom nav */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-around',
        position: 'sticky',
        bottom: 0,
      }}>
        <div style={{ textAlign: 'center', color: '#1A3C34' }}>
          <div style={{ fontSize: '20px' }}>📋</div>
          <div style={{ fontSize: '11px', fontWeight: 600 }}>Tasks</div>
        </div>
        <div
          onClick={() => router.push('/field/status')}
          style={{ textAlign: 'center', color: '#9ca3af', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '20px' }}>☁️</div>
          <div style={{ fontSize: '11px' }}>Uploads</div>
        </div>
      </div>
    </div>
  )
}
