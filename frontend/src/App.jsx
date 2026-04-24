import { useState, useEffect } from 'react'
import './index.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pulkitgupta-bfhl.vercel.app'

const EXAMPLE = [
  "A->B", "A->C", "B->D", "C->E", "E->F",
  "X->Y", "Y->Z", "Z->X",
  "P->Q", "Q->R",
  "G->H", "G->H", "G->I",
  "hello", "1->2", "A->"
]

/* ── Animated counter ── */
function useAnimCount(target) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const t0 = performance.now()
    const dur = 600
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return val
}

/* ── Tree node (recursive) ── */
function TreeNodeEl({ nodeKey, subtree, isRoot }) {
  const children = isRoot ? (subtree[nodeKey] ?? {}) : subtree
  const keys = Object.keys(children).sort()

  return (
    <div className="font-mono text-[13px] leading-relaxed">
      <div className="flex items-center gap-2">
        <span className={isRoot ? "font-bold text-zinc-900 dark:text-white text-base" : "text-zinc-600 dark:text-zinc-300"}>
          {nodeKey}
        </span>
      </div>
      {keys.length > 0 && (
        <div className="pl-1">
          {keys.map((ck, ci) => (
            <div className="flex items-start" key={ck}>
              <span className="text-zinc-300 dark:text-zinc-700 mr-2 select-none">
                {ci === keys.length - 1 ? '└─' : '├─'}
              </span>
              <TreeNodeEl nodeKey={ck} subtree={children[ck]} isRoot={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Hierarchy card ── */
function HCard({ h }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${h.has_cycle ? 'border-red-200/50 dark:border-red-900/50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-medium text-zinc-900 dark:text-white">{h.root}</span>
          {h.has_cycle ? (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">Cycle</span>
          ) : (
            <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400 dark:text-zinc-500">Depth {h.depth}</span>
          )}
        </div>
      </div>
      {h.has_cycle ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">Tree cannot be built due to cyclic reference.</p>
      ) : (
        <div className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/50">
          <TreeNodeEl nodeKey={h.root} subtree={h.tree || {}} isRoot={true} />
        </div>
      )}
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('bfhl-theme') === 'dark')
  
  // Form State
  const [userId, setUserId] = useState('pulkitgupta_24082005')
  const [email, setEmail] = useState('pg1736@srmist.edu.in')
  const [roll, setRoll] = useState('RA23110028030014')
  const [input, setInput] = useState('')
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [tab, setTab] = useState('visual')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('bfhl-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(d => !d)
  const clearFeedback = () => { setError(''); setStatus(null) }
  const handleExample = () => { setInput(JSON.stringify(EXAMPLE, null, 2)); clearFeedback() }
  const handleClear = () => { setInput(''); clearFeedback(); setResults(null) }

  const handleSubmit = async () => {
    clearFeedback()
    const raw = input.trim()
    if (!raw) { setError('Enter a JSON array of node strings.'); return }

    let parsed
    try { parsed = JSON.parse(raw) }
    catch { setError('Invalid JSON. Example: ["A->B", "B->C"]'); return }

    if (!Array.isArray(parsed)) { setError('Input must be a JSON array.'); return }
    if (!userId.trim()) { setError('User ID is required.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: parsed,
          user_id: userId.trim(),
          email_id: email.trim(),
          college_roll_number: roll.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || `API Error ${res.status}`); return }
      setResults(data)
      const count = (data.hierarchies || []).length
      setStatus({ type: 'ok', text: `Analyzed successfully: ${count} tree${count !== 1 ? 's' : ''} found.` })
      setTab('visual')
    } catch {
      setError(`Network error: Could not reach ${API_BASE}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-5 py-12 md:py-20 flex flex-col gap-12">
        
        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Hierarchy Analyzer</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">SRM Engineering Challenge</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </header>

        {/* ── Input Section ── */}
        <section className="flex flex-col gap-8">
          
          {/* Identity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">User ID</label>
              <input type="text" value={userId} onChange={e => setUserId(e.target.value)} spellCheck="false" 
                className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-2 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} spellCheck="false" 
                className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-2 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Roll Number</label>
              <input type="text" value={roll} onChange={e => setRoll(e.target.value)} spellCheck="false" 
                className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-2 text-sm focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors" />
            </div>
          </div>

          {/* JSON Data */}
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <label className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Node Data</label>
              <div className="flex items-center gap-3">
                <button onClick={handleExample} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Example</button>
                <button onClick={handleClear} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Clear</button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='["A->B", "A->C", "B->D"]'
              spellCheck="false"
              className="w-full glass-card rounded-2xl p-5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-all resize-y min-h-[160px] leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full relative overflow-hidden bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium py-3.5 rounded-2xl transition-transform active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <svg className="w-5 h-5 text-zinc-500 spinner-circle" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              ) : (
                <span className="tracking-wide">Run Analysis</span>
              )}
            </button>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {status && !error && (
              <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-4 py-3 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                {status.text}
              </div>
            )}
          </div>
        </section>

        {/* ── Results Section ── */}
        {results && (
          <section className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Trees</span>
                <span className="text-3xl font-light tabular-nums">{results.summary?.total_trees || 0}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cycles</span>
                <span className={`text-3xl font-light tabular-nums ${results.summary?.total_cycles > 0 ? 'text-red-500' : ''}`}>
                  {results.summary?.total_cycles || 0}
                </span>
              </div>
              <div className="glass-card rounded-2xl p-5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Largest Root</span>
                <span className="text-3xl font-light font-mono text-indigo-500">{results.summary?.largest_tree_root || '—'}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setTab('visual')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${tab === 'visual' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Visualizer</button>
              <button onClick={() => setTab('json')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${tab === 'json' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Raw JSON</button>
            </div>

            {/* Content */}
            {tab === 'visual' ? (
              <div className="flex flex-col gap-8">
                {/* Visual Trees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(results.hierarchies || []).map((h, i) => <HCard key={i} h={h} />)}
                </div>

                {/* Warnings */}
                {(results.invalid_entries?.length > 0 || results.duplicate_edges?.length > 0) && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {results.invalid_entries?.length > 0 && (
                      <div className="flex-1 glass-card rounded-2xl p-5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Invalid Entries</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.invalid_entries.map((item, i) => (
                            <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.duplicate_edges?.length > 0 && (
                      <div className="flex-1 glass-card rounded-2xl p-5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Duplicate Edges</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.duplicate_edges.map((item, i) => (
                            <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/50">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-5 overflow-x-auto">
                <pre className="text-[11px] font-mono leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  )
}
