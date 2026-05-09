'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CsrLogin() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // Check csr_partners record exists for this email
    const { data: partner } = await supabase
      .from('csr_partners')
      .select('id, company_name, is_active')
      .eq('contact_email', email.toLowerCase().trim())
      .single()

    if (!partner) {
      await supabase.auth.signOut()
      setError('No CSR partner account found for this email.')
      setLoading(false)
      return
    }

    if (!partner.is_active) {
      await supabase.auth.signOut()
      setError('Your account is pending approval. Please contact EcoTree.')
      setLoading(false)
      return
    }

    window.location.replace('/csr-dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A3C34 0%, #2C5F2D 50%, #40916C 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌳</div>
        <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#97BC62' }}>
          Eco<span style={{ color: 'white' }}>Tree</span>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          CSR Partner Dashboard
        </div>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#1A3C34', marginBottom: '0.25rem' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.5rem' }}>
          Sign in to track your CSR impact
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Work email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required
              style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '14px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '1rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1A3C34, #2C5F2D)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontFamily: 'inherit', minHeight: '52px' }}>
            {loading ? 'Signing in...' : 'View my impact →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '1.5rem' }}>
          New to EcoTree?{' '}
          <a href="/csr-ngo" style={{ color: '#2C5F2D', fontWeight: 600, textDecoration: 'none' }}>Register your company</a>
        </p>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        EcoTree Impact Foundation · BRSR-Ready · 80G Approved
      </p>

      <style>{`input:focus { border-color: #2C5F2D !important; box-shadow: 0 0 0 3px rgba(44,95,45,0.1); }`}</style>
    </div>
  )
}
