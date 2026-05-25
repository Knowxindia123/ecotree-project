'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Site { id: number; name: string }
interface Update {
  id: number; title: string; description: string | null
  photos: string[]; trees_planted: number
  planted_date: string | null; created_at: string
  sites: { name: string } | null
}

export default function AdminCommunity() {
  const [updates,  setUpdates]  = useState<Update[]>([])
  const [sites,    setSites]    = useState<Site[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')
  const [uploading,setUploading]= useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [photoUrls,setPhotoUrls]= useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Site creation
  const [showSiteForm, setShowSiteForm] = useState(false)
  const [siteForm,     setSiteForm]     = useState({ name: '', city: 'Bangalore', state: 'Karnataka', description: '' })
  const [creatingSite, setCreatingSite] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', site_id: '', trees_planted: '', planted_date: ''
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [updatesRes, sitesRes] = await Promise.all([
      supabase.from('community_updates').select('*, sites(name)').order('created_at', { ascending: false }),
      supabase.from('sites').select('id, name').eq('is_active', true).order('name'),
    ])
    setUpdates((updatesRes.data as unknown as Update[]) || [])
    setSites(sitesRes.data || [])
    setLoading(false)
  }

  async function handleCreateSite() {
    if (!siteForm.name.trim()) return
    setCreatingSite(true)
    const { data: newSite, error: siteErr } = await supabase.from('sites').insert({
      name: siteForm.name, city: siteForm.city || 'Bangalore',
      state: siteForm.state || 'Karnataka',
      description: siteForm.description || null, is_active: true,
    }).select('id, name').single()
    if (!siteErr && newSite) {
      setSites(prev => [...prev, newSite])
      setForm(prev => ({ ...prev, site_id: String(newSite.id) }))
      setSiteForm({ name: '', city: 'Bangalore', state: 'Karnataka', description: '' })
      setShowSiteForm(false)
      setSuccess(`Site "${newSite.name}" created!`)
    }
    setCreatingSite(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []; const prevs: string[] = []
    for (const file of files) {
      prevs.push(URL.createObjectURL(file))
      const path = `community/${Date.now()}-${file.name.replace(/\s/g,'-')}`
      const { error: uploadErr } = await supabase.storage.from('tree-photos').upload(path, file, { contentType: file.type, upsert: true })
      if (!uploadErr) urls.push(supabase.storage.from('tree-photos').getPublicUrl(path).data.publicUrl)
    }
    setPhotoUrls(prev => [...prev, ...urls])
    setPreviews(prev => [...prev, ...prevs])
    setUploading(false)
  }

  function removePhoto(i: number) {
    setPhotoUrls(prev => prev.filter((_,j) => j!==i))
    setPreviews(prev => prev.filter((_,j) => j!==i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('community_updates').insert({
      title: form.title, description: form.description || null,
      site_id: form.site_id ? Number(form.site_id) : null,
      trees_planted: Number(form.trees_planted) || 0,
      planted_date: form.planted_date || null, photos: photoUrls,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setSuccess('Community update posted!')
    setForm({ title:'', description:'', site_id:'', trees_planted:'', planted_date:'' })
    setPhotoUrls([]); setPreviews([])
    loadData(); setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this community update?')) return
    await supabase.from('community_updates').delete().eq('id', id)
    loadData()
  }

  const inp = { width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #e5e7eb', borderRadius:'8px', fontSize:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }
  const lbl = { display:'block', fontSize:'13px', fontWeight:500, color:'#374151', marginBottom:'6px' } as React.CSSProperties

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.25rem', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>Community Plantation</h1>
        <p style={{ fontSize:'14px', color:'#6B7280' }}>Post updates that appear on all ₹100/₹250 donor dashboards</p>
      </div>

      {success && <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#166534' }}>{success}<button onClick={()=>setSuccess('')} style={{float:'right',background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}
      {error   && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'1rem', fontSize:'13px', color:'#dc2626' }}>{error}</div>}

      {/* ADD UPDATE FORM */}
      <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'1rem' }}>🌿 Post Community Plantation Update</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{ gridColumn:'span 2' }}>
              <label style={lbl}>Title *</label>
              <input type="text" placeholder="e.g. Vijayanagar Park Plantation — May 2026"
                value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required style={inp}/>
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={lbl}>Description</label>
              <textarea placeholder="Describe this plantation event..."
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                rows={3} style={{ ...inp, resize:'vertical' as const }}/>
            </div>

            {/* Site with create option */}
            <div>
              <label style={lbl}>Site</label>
              {sites.length === 0 && !showSiteForm ? (
                <button type="button" onClick={() => setShowSiteForm(true)}
                  style={{ width:'100%', padding:'0.6rem', background:'#f0fdf4', border:'1.5px dashed #86efac', borderRadius:'8px', fontSize:'14px', color:'#166534', cursor:'pointer', fontFamily:'inherit' }}>
                  + Create your first site
                </button>
              ) : (
                <>
                  <select value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value})} style={inp}>
                    <option value="">— Select site —</option>
                    {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowSiteForm(!showSiteForm)}
                    style={{ background:'none', border:'none', color:'#2C5F2D', fontSize:'12px', cursor:'pointer', padding:'4px 0', fontFamily:'inherit' }}>
                    {showSiteForm ? '▲ Cancel' : '+ Create new site'}
                  </button>
                </>
              )}
              {showSiteForm && (
                <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'12px', marginTop:'8px' }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#166534', marginBottom:'8px' }}>Create new site</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                    <div style={{ gridColumn:'span 2' }}>
                      <input type="text" placeholder="Site name *" value={siteForm.name}
                        onChange={e => setSiteForm({...siteForm, name: e.target.value})} style={{ ...inp }} />
                    </div>
                    <input type="text" placeholder="City" value={siteForm.city}
                      onChange={e => setSiteForm({...siteForm, city: e.target.value})} style={{ ...inp }} />
                    <input type="text" placeholder="State" value={siteForm.state}
                      onChange={e => setSiteForm({...siteForm, state: e.target.value})} style={{ ...inp }} />
                    <div style={{ gridColumn:'span 2' }}>
                      <input type="text" placeholder="Description (optional)" value={siteForm.description}
                        onChange={e => setSiteForm({...siteForm, description: e.target.value})} style={{ ...inp }} />
                    </div>
                  </div>
                  <button type="button" onClick={handleCreateSite} disabled={creatingSite || !siteForm.name.trim()}
                    style={{ padding:'6px 16px', background: creatingSite || !siteForm.name.trim() ? '#9ca3af' : '#2C5F2D', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    {creatingSite ? 'Creating...' : '✅ Save Site'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label style={lbl}>Trees planted</label>
              <input type="number" min="0" placeholder="0"
                value={form.trees_planted} onChange={e=>setForm({...form,trees_planted:e.target.value})} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Plantation date</label>
              <input type="date" value={form.planted_date} onChange={e=>setForm({...form,planted_date:e.target.value})} style={inp}/>
            </div>
          </div>

          <div style={{ marginBottom:'1rem' }}>
            <label style={lbl}>Photos</label>
            {previews.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'8px' }}>
                {previews.map((url,i)=>(
                  <div key={i} style={{ position:'relative', aspectRatio:'4/3', borderRadius:'8px', overflow:'hidden' }}>
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    <button type="button" onClick={()=>removePhoto(i)}
                      style={{ position:'absolute', top:'4px', right:'4px', width:'20px', height:'20px', background:'rgba(220,38,38,.8)', border:'none', borderRadius:'50%', color:'white', fontSize:'11px', cursor:'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading}
              style={{ width:'100%', padding:'0.75rem', background:'#f9fafb', border:'2px dashed #d1d5db', borderRadius:'10px', fontSize:'14px', color:'#6B7280', cursor:'pointer', fontFamily:'inherit' }}>
              {uploading ? '⏳ Uploading...' : '+ Add plantation photos'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display:'none' }}/>
          </div>

          <button type="submit" disabled={saving}
            style={{ padding:'10px 24px', background:saving?'#9ca3af':'#2C5F2D', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {saving ? 'Posting...' : '🌿 Post Update'}
          </button>
        </form>
      </div>

      {/* PAST UPDATES */}
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A' }}>Past community updates</span>
          <span style={{ fontSize:'13px', color:'#6B7280' }}>{updates.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding:'2rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>Loading...</div>
        ) : updates.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🌿</div>
            <div style={{ fontSize:'15px', fontWeight:600, color:'#1A1A1A', marginBottom:'4px' }}>No updates yet</div>
            <div style={{ fontSize:'13px', color:'#6B7280' }}>Post your first community plantation update above</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {updates.map(u => (
              <div key={u.id} style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'6px' }}>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:600, color:'#1A1A1A', marginBottom:'2px' }}>{u.title}</div>
                    <div style={{ fontSize:'12px', color:'#9ca3af' }}>
                      {u.sites?.name && <span>📍 {u.sites.name} · </span>}
                      {u.trees_planted > 0 && <span>🌳 {u.trees_planted} trees · </span>}
                      {u.planted_date && <span>📅 {new Date(u.planted_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · </span>}
                      <span>📸 {u.photos?.length || 0} photos</span>
                    </div>
                  </div>
                  <button onClick={()=>handleDelete(u.id)}
                    style={{ padding:'5px 12px', background:'transparent', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', fontSize:'12px', cursor:'pointer', flexShrink:0 }}>Delete</button>
                </div>
                {u.description && <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'8px', lineHeight:1.5 }}>{u.description}</div>}
                {u.photos?.length > 0 && (
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    {u.photos.slice(0,5).map((url,i)=>(
                      <div key={i} style={{ width:'60px', height:'60px', borderRadius:'6px', background:`url(${url}) center/cover`, border:'1px solid #e5e7eb' }}/>
                    ))}
                    {u.photos.length > 5 && <div style={{ width:'60px', height:'60px', borderRadius:'6px', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#6B7280' }}>+{u.photos.length-5}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px){ form > div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important;} }
        input:focus,select:focus,textarea:focus{border-color:#2C5F2D !important;}
      `}</style>
    </div>
  )
}
