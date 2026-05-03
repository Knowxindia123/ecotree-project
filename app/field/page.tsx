'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FieldIndex() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/field/tasks')
      } else {
        window.location.replace('/field/login')
      }
    })
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#1A3C34',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌳</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Loading...</div>
      </div>
    </div>
  )
}
