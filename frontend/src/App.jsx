import { useState, useEffect } from 'react'
import './index.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

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
    const dur = 500
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return val
}

/* ── Tree node (recursive) ── */
function TreeNodeEl({ nodeKey, subtree, isRoot }) {
  const children = isRoot
    ? (subtree[nodeKey] ?? {})
    : subtree
  const keys = Object.keys(children).sort()

  return (
    <div className="tree-wrap">
      <div className="tree-row">
        <span className="tree-lbl">{nodeKey}</span>
      </div>
      {keys.length > 0 && (
        <div className="tree-children">
          {keys.map((ck, ci) => (
            <div className="tree-row" key={ck}>
              <span className="tree-arm">{ci === keys.length - 1 ? '└ ' : '├ '}</span>
              <TreeNodeEl nodeKey={ck} subtree={children[ck]} isRoot={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Hierarchy card ── */
function HCard({ h, index }) {
  return (
    <div className={`hcard${h.has_cycle ? ' cyclic' : ''}`} style={{ animationDelay: `${index * 45}ms` }}>
      <div className="hcard-head">
        <span className="hcard-root">{h.root}</span>
        {h.has_cycle
          ? <span className="badge badge-cycle">CYCLE</span>
          : h.depth !== undefined && <span className="badge badge-depth">depth {h.depth}</span>
        }
      </div>
      {h.has_cycle
        ? <span className="cyclenote">Cyclic — tree not built.</span>
        : <TreeNodeEl nodeKey={h.root} subtree={h.tree || {}} isRoot={true} />
      }
    </div>
  )
}

/* ── Tag list ── */
function TagList({ items, cls }) {
  if (!items.length) return <span className="tag tag-none">None</span>
  return items.map((item, i) => (
    <span key={i} className={`tag ${cls}`}>{item}</span>
  ))
}

/* ── Stats with animated counters ── */
function SummaryBar({ summary }) {
  const trees  = useAnimCount(summary.total_trees  || 0)
  const cycles = useAnimCount(summary.total_cycles || 0)
  return (
    <div className="summary-bar">
      <div className="sum-stats">
        <div className="sum-stat">
          <span className="sum-val">{trees}</span>
          <span className="sum-key">Trees</span>
        </div>
        <div className="sum-div" />
        <div className="sum-stat">
          <span className="sum-val v-red">{cycles}</span>
          <span className="sum-key">Cycles</span>
        </div>
        <div className="sum-div" />
        <div className="sum-stat">
          <span className="sum-val v-teal">{summary.largest_tree_root || '—'}</span>
          <span className="sum-key">Largest Root</span>
        </div>
      </div>
      <div className="ok-badge">
        <span className="ok-dot" />
        <span>200 OK</span>
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('bfhl-theme') === 'dark')
  const [userId, setUserId]   = useState('pulkitgupta_24082005')
  const [email,  setEmail]    = useState('pg1736@srmist.edu.in')
  const [roll,   setRoll]     = useState('RA23110028030014')
  const [input,  setInput]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [status,  setStatus]  = useState(null) // { type: 'ok'|'err', text }
  const [results, setResults] = useState(null)
  const [tab,     setTab]     = useState('visual')
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('bfhl-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(d => !d)

  const clearFeedback = () => { setError(''); setStatus(null) }

  const handleExample = () => { setInput(JSON.stringify(EXAMPLE, null, 2)); clearFeedback() }
  const handleClear   = () => { setInput(''); clearFeedback(); setResults(null) }

  const handleCopy = () => {
    if (!results) return
    navigator.clipboard.writeText(JSON.stringify(results, null, 2)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSubmit = async () => {
    clearFeedback()
    const raw = input.trim()
    if (!raw) { setError('Enter a JSON array of node strings.'); return }

    let parsed
    try { parsed = JSON.parse(raw) }
    catch { setError('Invalid JSON. Example: ["A->B", "B->C"]'); return }

    if (!Array.isArray(parsed)) { setError('Input must be a JSON array.'); return }
    if (!userId.trim()) { setError('User ID cannot be empty.'); return }

    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/bfhl`, {
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
      if (!res.ok) { setError(data.error || `API error: ${res.status}`); return }
      setResults(data)
      const g = (data.hierarchies || []).length
      setStatus({ type: 'ok', text: `200 OK — ${g} group${g !== 1 ? 's' : ''} found` })
      setTab('visual')
    } catch {
      setError(`Could not reach the API at ${API_BASE}. Is the backend running?`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d0e14] text-[#0d0f1a] dark:text-[#eceef8] text-sm antialiased transition-colors duration-200">
      {/* ── Top strip — both items centered ── */}
      <div className="h-11 flex items-center justify-center gap-4 bg-white dark:bg-[#13141e] border-b border-[#e2e5ef] dark:border-white/[0.07] sticky top-0 z-40">
        <span className="inline-flex items-center border border-[#cdd1e0] dark:border-white/[0.13] rounded-full overflow-hidden font-mono text-[11px] font-semibold">
          <span className="bg-[#5b4cf5] dark:bg-[#7b6df8] text-white px-[10px] py-[3px] tracking-[0.04em]">POST</span>
          <span className="bg-[#eef0f5] dark:bg-[#1a1b28] text-[#5a5e74] dark:text-[#818699] px-[10px] py-[3px]">/bfhl</span>
        </span>
        <button
          id="btn-theme"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border border-[#e2e5ef] dark:border-white/[0.07] rounded-[5px] text-[#5a5e74] dark:text-[#818699] cursor-pointer transition-all hover:bg-[#eef0f5] dark:hover:bg-[#1a1b28] hover:text-[#0d0f1a] dark:hover:text-[#eceef8] hover:border-[#cdd1e0] dark:hover:border-white/[0.13]"
        >
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Workspace ── */}
      <main className="workspace">

        {/* ── Input panel ── */}
        <section className="panel panel-input">

          {/* Identity card */}
          <div className="panel-card">
            <div className="card-label">Identity</div>
            <div className="field">
              <label htmlFor="field-userid">User ID</label>
              <input id="field-userid" type="text" value={userId} onChange={e => setUserId(e.target.value)} spellCheck="false" autoComplete="off" />
              <span className="field-hint">fullname_ddmmyyyy</span>
            </div>
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="field-email">Email</label>
                <input id="field-email" type="email" value={email} onChange={e => setEmail(e.target.value)} spellCheck="false" autoComplete="off" />
              </div>
              <div className="field">
                <label htmlFor="field-roll">Roll Number</label>
                <input id="field-roll" type="text" value={roll} onChange={e => setRoll(e.target.value)} spellCheck="false" autoComplete="off" />
              </div>
            </div>
          </div>

          {/* Node data card */}
          <div className="panel-card">
            <div className="card-label">
              Node Data
              <span className="mono-chip">JSON Array</span>
            </div>
            <div className="ta-wrap">
              <textarea
                id="node-input"
                rows="10"
                spellCheck="false"
                placeholder='["A->B", "A->C", "B->D"]'
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="ta-bar">
                <span className="ta-hint"><code>X-&gt;Y</code> — single uppercase letters A–Z</span>
                <button id="btn-example" className="txt-btn" onClick={handleExample}>Example</button>
                <button id="btn-clear" className="txt-btn" onClick={handleClear}>Clear</button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-wrap mt-1">
            <button id="btn-submit" className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {!loading && (
                <svg className="s-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
              <span className="s-label">{loading ? '' : 'Run API'}</span>
              {loading && <span className="s-spinner" />}
            </button>

            {status && !error && (
              <div id="run-status" className={`run-status ${status.type}`}>
                <span id="rs-icon">{status.type === 'ok' ? '✓' : '✕'}</span>
                <span id="rs-text">{status.text}</span>
              </div>
            )}

            {error && (
              <div id="error-box" className="error-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span id="error-msg">{error}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Output panel ── */}
        <section className="panel panel-output">

          {!results ? (
            <div className="empty-state" id="empty-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
                <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/>
              </svg>
              <p className="empty-title">No results yet</p>
              <p className="empty-desc">Fill in your credentials and node array, then click <strong>Run API</strong>.</p>
            </div>
          ) : (
            <div id="results" className="results-wrap">

              {/* Summary bar */}
              <SummaryBar summary={results.summary || {}} />

              {/* Hierarchies */}
              <div className="out-card">
                <div className="out-hdr">
                  <span className="out-title">Hierarchies</span>
                  <div className="seg">
                    <button className={`seg-btn${tab === 'visual' ? ' active' : ''}`} id="vtab-visual" onClick={() => setTab('visual')}>Visual</button>
                    <button className={`seg-btn${tab === 'json' ? ' active' : ''}`} id="vtab-json" onClick={() => setTab('json')}>JSON</button>
                  </div>
                </div>
                {tab === 'visual' ? (
                  <div id="h-visual" className="h-visual">
                    {(results.hierarchies || []).map((h, i) => <HCard key={i} h={h} index={i} />)}
                  </div>
                ) : (
                  <div id="h-json">
                    <pre id="h-json-pre">{JSON.stringify(results.hierarchies || [], null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Invalid + Duplicates */}
              <div className="out-two">
                <div className="out-card">
                  <div className="out-hdr"><span className="out-title">Invalid Entries</span></div>
                  <div className="tag-list" id="list-invalid">
                    <TagList items={results.invalid_entries || []} cls="tag-invalid" />
                  </div>
                </div>
                <div className="out-card">
                  <div className="out-hdr"><span className="out-title">Duplicate Edges</span></div>
                  <div className="tag-list" id="list-dup">
                    <TagList items={results.duplicate_edges || []} cls="tag-dup" />
                  </div>
                </div>
              </div>

              {/* Raw response */}
              <div className="out-card">
                <div className="out-hdr">
                  <span className="out-title">Raw Response</span>
                  <button className="ghost-btn" id="btn-copy" onClick={handleCopy}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="raw-pre" id="raw-pre">{JSON.stringify(results, null, 2)}</pre>
              </div>

            </div>
          )}
        </section>

      </main>
    </div>
  )
}
