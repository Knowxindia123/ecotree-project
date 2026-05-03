'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FieldLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check WORKER role
    const { data: userData } = await supabase
      .from('users')
      .select('role, name')
      .eq('email', email)
      .single()

    if (!userData || (userData.role !== 'WORKER' && userData.role !== 'ADMIN')) {
      await supabase.auth.signOut()
      setError('Access denied. Field worker accounts only.')
      setLoading(false)
      return
    }

    window.location.replace('/field/tasks')
  }

  return (
    <div style={{
     
      minHeight: '100dvh',
      background: '#1A3C34',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌳</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, color: '#97BC62' }}>
          Eco<span style={{ color: 'white' }}>Tree</span>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', letterSpacing: '0.05em' }}>
          FIELD WORKER APP
        </div>
      </div>

      {/* Form card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1.25rem' }}>
          Sign in
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '14px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#9ca3af' : '#1A3C34',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              minHeight: '56px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        EcoTree Field Worker · Authorized access only
      </p>

      <style>{`
        input:focus { border-color: #1A3C34 !important; box-shadow: 0 0 0 3px rgba(26,60,52,0.15); }
      `}</style>
    </div>
  )
}
