'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',     icon: '⊡' },
  { href: '/admin/workers',   label: 'Field Workers', icon: '👷' },
  { href: '/admin/assign',    label: 'Assign Trees',  icon: '🌱' },
  { href: '/admin/review',    label: 'Review Queue',  icon: '🔍', badge: true },
  { href: '/admin/donors',    label: 'Donors',        icon: '❤️' },
  { href: '/admin/csr',       label: 'CSR Partners',  icon: '🏢' },
  { href: '/admin/community', label: 'Community',     icon: '🌿' },
  { href: '/admin/miyawaki',  label: 'Miyawaki',      icon: '🏙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen]             = useState(false)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    supabase
      .from('tree_updates')
      .select('id', { count: 'exact' })
      .eq('is_verified', false)
      .eq('verified_by', 'PENDING')
      .then(({ count }) => setReviewCount(count || 0))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40, display:'none' }}
          className="mob-overlay" />
      )}
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', fontWeight:700, color:'#97BC62' }}>
            Eco<span style={{ color:'white' }}>Tree</span>
          </div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px', letterSpacing:'0.05em', textTransform:'uppercase' }}>
            Admin Panel
          </div>
        </div>
        <nav style={{ padding:'0.75rem 0.5rem', flex:1 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 12px', borderRadius:'8px', fontSize:'14px', fontWeight:500,
                color: pathname === item.href ? '#97BC62' : 'rgba(255,255,255,0.65)',
                background: pathname === item.href ? 'rgba(151,188,98,0.15)' : 'transparent',
                textDecoration:'none', marginBottom:'2px', transition:'all 0.15s'
              }}>
              <span style={{ fontSize:'16px', width:'20px', textAlign:'center' }}>{item.icon}</span>
              {item.label}
              {item.badge && reviewCount > 0 && (
                <span style={{ marginLeft:'auto', background:'rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:'11px', padding:'1px 6px', borderRadius:'4px', fontWeight:700 }}>
                  {reviewCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'0.75rem 0.5rem', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout}
            style={{ width:'100%', padding:'10px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', color:'#fca5a5', fontSize:'13px', cursor:'pointer', textAlign:'left' }}>
            Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div className="mob-topbar">
          <button onClick={() => setOpen(!open)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#1A3C34', padding:'4px' }}>☰</button>
          <div style={{ fontFamily:'Georgia,serif', fontWeight:700, color:'#1A3C34' }}>Eco<span style={{ color:'#2C5F2D' }}>Tree</span> Admin</div>
          <div style={{ width:'28px' }} />
        </div>
        <main style={{ flex:1, padding:'1.5rem', overflowY:'auto' }}>{children}</main>
      </div>
      <style>{`
        .admin-sidebar{width:220px;background:#1A3C34;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;}
        .mob-topbar{display:none;}
        @media(max-width:768px){
          .admin-sidebar{position:fixed;top:0;left:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform 0.3s ease;}
          .admin-sidebar.open{transform:translateX(0);}
          .mob-overlay{display:block !important;}
          .mob-topbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;background:white;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:30;}
          main{padding:1rem !important;}
        }
      `}</style>
    </div>
  )
}
