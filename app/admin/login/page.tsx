'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError('Auth error: ' + authError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('No user returned')
      setLoading(false)
      return
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single()

    if (dbError) {
      setError('DB error: ' + dbError.message)
      setLoading(false)
      return
    }

    if (userData?.role !== 'ADMIN') {
      await supabase.auth.signOut()
      setError('Not admin. Role: ' + userData?.role)
      setLoading(false)
      return
    }

   setError('Login OK — redirecting...')
window.location.replace('https://ecotrees.org/admin/dashboard')

  } catch (err: any) {
    setError('Caught error: ' + err.message)
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1A3C34',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontFamily: 'serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1A3C34',
            marginBottom: '4px'
          }}>
            Eco<span style={{ color: '#97BC62' }}>Tree</span>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>Admin Dashboard</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="bhimsen.g@gmail.com"
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '13px',
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
              padding: '0.8rem',
              background: loading ? '#6b7280' : '#2C5F2D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '1.5rem' }}>
          EcoTree Admin · Authorized access only
        </p>
      </div>

      <style>{`
        input:focus { border-color: #2C5F2D !important; box-shadow: 0 0 0 3px rgba(44,95,45,0.1); }
      `}</style>
    </div>
  )
}
