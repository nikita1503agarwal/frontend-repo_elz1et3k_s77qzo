import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import { Plus, Search, Globe, Folder, Clock, CheckCircle2, XCircle, RefreshCw, ChevronRight, Check } from 'lucide-react'
import './index.css'
import './styles/monitor.css'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Badge({ type = 'up', children }){
  const cls = type === 'up' ? 'badge badge-up' : type === 'down' ? 'badge badge-down' : 'badge badge-warn'
  return <span className={cls}>{children}</span>
}

function Header({ onOpenNew }){
  return (
    <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">WM</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Website Monitor</h1>
            <p className="text-xs text-gray-500">Pantau uptime, response time, dan keyword</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenNew} className="btn btn-primary flex items-center gap-2"><Plus size={16}/> Tambah Website</button>
        </div>
      </div>
    </div>
  )
}

function Stats({ summary }){
  return (
    <div className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass rounded-xl p-4 stat-gradient">
        <div className="text-xs uppercase text-gray-500">Total Website</div>
        <div className="text-3xl font-bold text-gray-800 mt-1">{summary?.total_sites ?? 0}</div>
      </div>
      <div className="glass rounded-xl p-4 stat-gradient">
        <div className="text-xs uppercase text-gray-500">Kategori</div>
        <div className="text-3xl font-bold text-gray-800 mt-1">{summary?.total_categories ?? 0}</div>
      </div>
      <div className="glass rounded-xl p-4 stat-gradient">
        <div className="text-xs uppercase text-gray-500">Up</div>
        <div className="text-3xl font-bold text-emerald-700 mt-1">{summary?.up ?? 0}</div>
      </div>
      <div className="glass rounded-xl p-4 stat-gradient">
        <div className="text-xs uppercase text-gray-500">Rata2 Respon</div>
        <div className="text-3xl font-bold text-indigo-700 mt-1">{summary?.avg_response_time_ms ?? 0} ms</div>
      </div>
    </div>
  )
}

function WebsiteForm({ onClose, onSaved, categories }){
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category_id, setCategory] = useState('')
  const [keywords, setKeywords] = useState('')
  const [interval_seconds, setInterval] = useState(300)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/websites`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          name, url, category_id: category_id || null,
          keywords: keywords.split(',').map(s=>s.trim()).filter(Boolean),
          interval_seconds: Number(interval_seconds),
          is_active: true
        })
      })
      if(!res.ok) throw new Error('Gagal menyimpan')
      onSaved && onSaved()
      onClose && onClose()
    }catch(e){
      alert(e.message)
    }finally{ setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 grid place-items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Tambah Website</h3>
          <button onClick={onClose} className="btn btn-ghost">Tutup</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Nama</label>
            <input className="input mt-1" value={name} onChange={e=>setName(e.target.value)} placeholder="Contoh: Website Perusahaan"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">URL</label>
            <input className="input mt-1" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Kategori</label>
            <select className="input mt-1" value={category_id} onChange={e=>setCategory(e.target.value)}>
              <option value="">Pilih kategori</option>
              {categories?.map(c=> (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Kata Kunci (pisahkan dengan koma)</label>
            <input className="input mt-1" value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="login, produk, promo"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Interval Cek (detik)</label>
            <input type="number" className="input mt-1" value={interval_seconds} onChange={e=>setInterval(e.target.value)} min={30} />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="btn btn-ghost">Batal</button>
          <button onClick={save} disabled={loading} className="btn btn-primary flex items-center gap-2">{loading ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  )
}

function CategoryManager({ onUpdated }){
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [categories, setCategories] = useState([])

  const load = async () => {
    const res = await fetch(`${API_BASE}/api/categories`)
    const data = await res.json()
    setCategories(data)
    onUpdated && onUpdated()
  }
  useEffect(()=>{ load() },[])

  const add = async () => {
    if(!name) return
    const res = await fetch(`${API_BASE}/api/categories`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, color })
    })
    if(res.ok){ setName(''); await load() }
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Kategori</h3>
        <button onClick={load} className="btn btn-ghost text-sm flex items-center gap-2"><RefreshCw size={16}/> Muat Ulang</button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input className="input" placeholder="Nama kategori" value={name} onChange={e=>setName(e.target.value)} />
        <input type="color" className="w-10 h-10 rounded-md border" value={color} onChange={e=>setColor(e.target.value)} />
        <button onClick={add} className="btn btn-primary"><Plus size={16}/></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <span key={c.id} className="tag" style={{background: c.color || '#F3F4F6'}}>{c.name}</span>
        ))}
      </div>
    </div>
  )
}

function WebsiteTable({ items, onCheckNow }){
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Daftar Website</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Website</th>
              <th>Kategori</th>
              <th>Kata Kunci</th>
              <th>Interval</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(w => (
              <tr key={w.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center text-blue-600"><Globe size={18}/></div>
                    <div>
                      <div className="font-semibold text-gray-800">{w.name}</div>
                      <a href={w.url} target="_blank" className="text-sm text-blue-600 hover:underline">{w.url}</a>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="tag">{w.category_id ? w.category_id.substring(0,6) : '-'}</span>
                </td>
                <td>
                  {w.keywords?.length ? w.keywords.map(k => <span key={k} className="tag">{k}</span>) : <span className="text-gray-400 text-sm">-</span>}
                </td>
                <td>
                  <span className="text-sm text-gray-700 flex items-center gap-1"><Clock size={14}/> {w.interval_seconds}s</span>
                </td>
                <td>
                  <button onClick={()=>onCheckNow(w.id)} className="btn btn-ghost text-sm">Cek Sekarang</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LatestChecks({ items }){
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Cek Terbaru</h3>
      </div>
      <div className="space-y-3">
        {items.map(r => (
          <div key={r.id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-3">
              {r.is_up ? <CheckCircle2 className="text-emerald-600"/> : <XCircle className="text-rose-600"/>}
              <div>
                <div className="font-medium">{r.website_id.substring(0,6)} • {r.status_code || '-'} • {r.response_time_ms || 0}ms</div>
                <div className="text-sm text-gray-600">{r.keyword_matches?.length ? `Keyword: ${r.keyword_matches.join(', ')}` : 'Tidak ada keyword cocok'}</div>
              </div>
            </div>
            {r.is_up ? <Badge type="up">UP</Badge> : <Badge type="down">DOWN</Badge>}
          </div>
        ))}
      </div>
    </div>
  )
}

function App(){
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [websites, setWebsites] = useState([])
  const [checks, setChecks] = useState([])
  const [summary, setSummary] = useState(null)

  const loadAll = async () => {
    const [catRes, webRes, sumRes, chkRes] = await Promise.all([
      fetch(`${API_BASE}/api/categories`),
      fetch(`${API_BASE}/api/websites`),
      fetch(`${API_BASE}/api/summary`),
      fetch(`${API_BASE}/api/checks/latest`)
    ])
    const cats = await catRes.json(); setCategories(cats)
    const webs = await webRes.json(); setWebsites(webs)
    const sum = await sumRes.json(); setSummary(sum)
    const chks = await chkRes.json(); setChecks(chks)
  }

  useEffect(()=>{ loadAll() },[])

  const checkNow = async (id) => {
    await fetch(`${API_BASE}/api/check/${id}`,{ method:'POST' })
    await loadAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header onOpenNew={()=>setShowForm(true)} />
      <Stats summary={summary} />
      <div className="max-w-6xl mx-auto px-6 my-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CategoryManager onUpdated={loadAll} />
          <WebsiteTable items={websites} onCheckNow={checkNow} />
        </div>
        <div className="space-y-6">
          <LatestChecks items={checks} />
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-gray-800">Tips</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Gunakan kata kunci yang unik untuk konten penting.</li>
              <li>Gunakan interval lebih kecil untuk halaman kritikal.</li>
              <li>Tekan "Cek Sekarang" saat perlu validasi cepat.</li>
            </ul>
          </div>
        </div>
      </div>

      {showForm && (
        <WebsiteForm onClose={()=>setShowForm(false)} onSaved={loadAll} categories={categories} />
      )}
    </div>
  )
}

export default App
