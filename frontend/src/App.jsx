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
    const dur = 800
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

/* ── Glowing Node Tree ── */
function TreeNodeEl({ nodeKey, subtree, isRoot }) {
  const children = isRoot ? (subtree[nodeKey] ?? {}) : subtree
  const keys = Object.keys(children).sort()

  return (
    <div className={`font-mono text-sm ${keys.length > 0 ? 'tree-line' : ''} pb-2`}>
      <div className="flex items-center gap-3 relative z-10">
        <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-110 cursor-default
          ${isRoot 
            ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 ring-4 ring-indigo-500/10' 
            : 'bg-zinc-800/80 border border-zinc-700 text-zinc-300'}`}>
          <span className="text-[11px] font-bold">{nodeKey}</span>
        </div>
        {isRoot && <span className="text-xs font-medium text-indigo-400/80 tracking-widest uppercase">Root</span>}
      </div>
      
      {keys.length > 0 && (
        <div className="pl-6 pt-3 space-y-2 relative z-10">
          {keys.map((ck) => (
            <div className="relative" key={ck}>
              {/* Connector horizontal line */}
              <div className="absolute -left-3 top-[11px] w-3 h-px bg-indigo-500/30"></div>
              <TreeNodeEl nodeKey={ck} subtree={children[ck]} isRoot={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Glassmorphic Hierarchy Card ── */
function HCard({ h, index }) {
  return (
    <div 
      className={`glass-panel rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 
        ${h.has_cycle ? 'border-red-500/20 bg-red-500/[0.02]' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black bg-gradient-to-br shadow-lg
            ${h.has_cycle ? 'from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30' : 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30'}`}>
            {h.root}
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Tree Root</span>
            {h.has_cycle ? (
              <span className="text-red-400 text-xs font-semibold tracking-wide flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Cyclic Dependency
              </span>
            ) : (
              <span className="text-indigo-300/80 text-xs font-medium tracking-wide mt-1">Depth: {h.depth} levels</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a]/50 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
        {/* Subtle glow inside the tree container */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        
        {h.has_cycle ? (
          <p className="text-sm text-zinc-500 italic leading-relaxed">
            This graph contains a cycle starting at <span className="text-red-400 font-mono">{h.root}</span>. 
            Tree rendering is disabled to prevent infinite loops.
          </p>
        ) : (
          <TreeNodeEl nodeKey={h.root} subtree={h.tree || {}} isRoot={true} />
        )}
      </div>
    </div>
  )
}

/* ── Custom Floating Input ── */
function FloatingInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="relative group">
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        spellCheck="false"
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 pb-3 pt-6 text-sm text-zinc-100 focus:outline-none focus:bg-white/[0.05] focus:border-indigo-500/50 transition-all peer"
        placeholder=" "
      />
      <label className="absolute left-5 top-4 text-xs font-medium text-zinc-500 uppercase tracking-widest transition-all duration-300 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-indigo-400 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-zinc-500 origin-left pointer-events-none">
        {label}
      </label>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [userId, setUserId] = useState('pulkitgupta_24082005')
  const [email, setEmail] = useState('pg1736@srmist.edu.in')
  const [roll, setRoll] = useState('RA23110028030014')
  const [input, setInput] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [tab, setTab] = useState('visual')

  const handleExample = () => { setInput(JSON.stringify(EXAMPLE, null, 2)); setError(''); setStatus(null) }
  const handleClear = () => { setInput(''); setError(''); setStatus(null); setResults(null) }

  const handleSubmit = async () => {
    setError(''); setStatus(null)
    const raw = input.trim()
    if (!raw) { setError('Please enter a JSON array of node strings.'); return }

    let parsed
    try { parsed = JSON.parse(raw) }
    catch { setError('Invalid JSON syntax. Try using the example data.'); return }

    if (!Array.isArray(parsed)) { setError('The input must be a valid JSON array.'); return }
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
      if (!res.ok) { setError(data.error || `API Error: ${res.status}`); return }
      
      setResults(data)
      const count = (data.hierarchies || []).length
      setStatus({ type: 'ok', text: `Analysis complete. Extracted ${count} distinct tree${count !== 1 ? 's' : ''}.` })
      setTab('visual')
    } catch {
      setError(`Connection failed. Could not reach the API at ${API_BASE}`)
    } finally {
      setLoading(false)
    }
  }

  // Animated Counters
  const trees = useAnimCount(results?.summary?.total_trees || 0)
  const cycles = useAnimCount(results?.summary?.total_cycles || 0)

  return (
    <div className="min-h-screen relative font-sans selection:bg-indigo-500/30">
      
      {/* ── Abstract Animated Background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-float-slow"></div>
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[100px] animate-float-fast"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] animate-float-slow" style={{animationDelay: '-5s'}}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col gap-16">
        
        {/* ── Premium Header ── */}
        <header className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-2 animate-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest">API Live</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/20">
            Hierarchy Analyzer
          </h1>
          <p className="text-lg text-zinc-400 font-light max-w-xl">
            A powerful, deterministic engine for resolving graph relationships, detecting cycles, and mapping hierarchical trees.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Left Column: Inputs ── */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">Identity</h2>
              </div>
              <FloatingInput label="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
              <FloatingInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <FloatingInput label="Roll Number" value={roll} onChange={e => setRoll(e.target.value)} />
            </div>

            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">Dataset</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExample} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">Example</button>
                  <button onClick={handleClear} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors">Clear</button>
                </div>
              </div>
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder='["A->B", "B->C"]'
                  spellCheck="false"
                  className="w-full bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-5 text-sm font-mono text-indigo-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:bg-[#0a0a0a]/80 transition-all resize-y min-h-[220px] leading-loose shadow-inner"
                />
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-[1px] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-3 bg-zinc-950/20 backdrop-blur-sm px-8 py-4 rounded-[15px] text-white font-semibold tracking-wide transition-colors group-hover:bg-transparent">
                {loading ? (
                  <svg className="w-5 h-5 text-white spinner-circle" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Process Graph
                  </>
                )}
              </div>
            </button>

            {/* Error & Status Tooltips */}
            {error && (
              <div className="glass-panel bg-red-500/10 border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-sm text-red-200 leading-relaxed">{error}</span>
              </div>
            )}
            {status && !error && (
              <div className="glass-panel bg-emerald-500/10 border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span className="text-sm text-emerald-200 font-medium">{status.text}</span>
              </div>
            )}
          </section>

          {/* ── Right Column: Results ── */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {!results ? (
              <div className="glass-panel rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center p-10 text-center border-dashed border-white/10">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-xl font-medium text-zinc-300 mb-2">Awaiting Data</h3>
                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                  Enter your node array and execute the analysis to visualize the hierarchical structures and dependencies.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
                
                {/* ── Sexy Stats ── */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Trees Found</span>
                    <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tabular-nums">{trees}</span>
                  </div>
                  <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cycles</span>
                    <span className={`text-4xl lg:text-5xl font-black text-transparent bg-clip-text tabular-nums ${results.summary?.total_cycles > 0 ? 'bg-gradient-to-r from-red-400 to-rose-400' : 'bg-gradient-to-r from-zinc-400 to-zinc-600'}`}>
                      {cycles}
                    </span>
                  </div>
                  <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Largest Root</span>
                    <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                      {results.summary?.largest_tree_root || '—'}
                    </span>
                  </div>
                </div>

                {/* ── View Toggle ── */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5 w-max">
                  <button onClick={() => setTab('visual')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${tab === 'visual' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Visualizer</button>
                  <button onClick={() => setTab('json')} className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${tab === 'json' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Raw JSON</button>
                </div>

                {/* ── Content ── */}
                <div className="min-h-[400px]">
                  {tab === 'visual' ? (
                    <div className="flex flex-col gap-6">
                      
                      {/* Warnings */}
                      {(results.invalid_entries?.length > 0 || results.duplicate_edges?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          {results.invalid_entries?.length > 0 && (
                            <div className="glass-panel rounded-2xl p-5 border-red-500/20 bg-red-500/[0.02]">
                              <div className="flex items-center gap-2 mb-4">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400">Invalid Inputs</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {results.invalid_entries.map((item, i) => (
                                  <span key={i} className="font-mono text-[11px] font-medium px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 shadow-sm">{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {results.duplicate_edges?.length > 0 && (
                            <div className="glass-panel rounded-2xl p-5 border-amber-500/20 bg-amber-500/[0.02]">
                              <div className="flex items-center gap-2 mb-4">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-400"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Duplicate Edges</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {results.duplicate_edges.map((item, i) => (
                                  <span key={i} className="font-mono text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {(results.hierarchies || []).map((h, i) => <HCard key={i} h={h} index={i} />)}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel rounded-3xl p-6 relative group">
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))} className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Copy JSON
                        </button>
                      </div>
                      <pre className="text-[12px] font-mono leading-relaxed text-zinc-300 overflow-x-auto">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}
