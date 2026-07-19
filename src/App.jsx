import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DEFAULT_DECK, SLIDES, FONT_PAIRS } from './defaults'
import { Slide } from './slides'
import Controls from './Controls'
import {
  Download, RotateCcw, ChevronLeft, ChevronRight, Presentation,
  FilePlus2, Copy, Trash2, FileDown, FileUp, MonitorPlay, Loader2,
} from 'lucide-react'

const STORE_KEY = 'elyk-decks-v2'
const OLD_KEY = 'elyk-deck-v1'

/* Fill any missing keys from defaults so old saves never crash a slide */
function mergeDeck(saved) {
  if (!saved || typeof saved !== 'object') return DEFAULT_DECK
  const out = { ...DEFAULT_DECK, ...saved }
  for (const k of Object.keys(DEFAULT_DECK)) {
    if (DEFAULT_DECK[k] && typeof DEFAULT_DECK[k] === 'object' && !Array.isArray(DEFAULT_DECK[k])) {
      out[k] = { ...DEFAULT_DECK[k], ...(saved[k] || {}) }
    }
  }
  return out
}

const newId = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/* Load the multi-deck store; migrate a v1 single deck if present */
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY))
    if (s && s.decks && s.activeId && s.decks[s.activeId]) {
      for (const id of Object.keys(s.decks)) s.decks[id].deck = mergeDeck(s.decks[id].deck)
      return s
    }
  } catch { /* fall through */ }
  let first = DEFAULT_DECK
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY))
    if (old) first = mergeDeck(old)
  } catch { /* ignore */ }
  const id = newId()
  return {
    activeId: id,
    decks: { [id]: { name: `${first.brand.clientName} — Pitch`, deck: first, updatedAt: Date.now() } },
  }
}

/* Track an element's size (for scaling the 16:9 slide to fit) */
function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export default function App() {
  const [store, setStore] = useState(loadStore)
  const [idx, setIdx] = useState(0)
  const [saveNote, setSaveNote] = useState('Autosaved')
  const [exporting, setExporting] = useState(false)
  const importRef = useRef(null)

  const active = store.decks[store.activeId]
  const deck = active.deck
  const slideId = SLIDES[idx].id

  const setDeck = (next) =>
    setStore((s) => ({
      ...s,
      decks: { ...s.decks, [s.activeId]: { ...s.decks[s.activeId], deck: next, updatedAt: Date.now() } },
    }))

  // autosave (all decks)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store))
        setSaveNote('Autosaved')
      } catch {
        setSaveNote('⚠ Storage full — export decks to files')
      }
    }, 250)
    return () => clearTimeout(t)
  }, [store])

  /* ---- deck manager actions ---- */
  const switchDeck = (id) => { setStore((s) => ({ ...s, activeId: id })); setIdx(0) }
  const renameDeck = (name) =>
    setStore((s) => ({ ...s, decks: { ...s.decks, [s.activeId]: { ...s.decks[s.activeId], name } } }))
  const newDeck = () => {
    const id = newId()
    setStore((s) => ({
      activeId: id,
      decks: { ...s.decks, [id]: { name: 'New Pitch', deck: DEFAULT_DECK, updatedAt: Date.now() } },
    }))
    setIdx(0)
  }
  const duplicateDeck = () => {
    const id = newId()
    const clone = JSON.parse(JSON.stringify(deck))
    setStore((s) => ({
      activeId: id,
      decks: { ...s.decks, [id]: { name: `${active.name} (copy)`, deck: clone, updatedAt: Date.now() } },
    }))
    setIdx(0)
  }
  const deleteDeck = () => {
    if (!confirm(`Delete “${active.name}”? This can’t be undone.`)) return
    setStore((s) => {
      const decks = { ...s.decks }
      delete decks[s.activeId]
      let activeId = Object.keys(decks)[0]
      if (!activeId) {
        activeId = newId()
        decks[activeId] = { name: 'New Pitch', deck: DEFAULT_DECK, updatedAt: Date.now() }
      }
      return { activeId, decks }
    })
    setIdx(0)
  }
  const exportDeckFile = () => {
    const blob = new Blob([JSON.stringify({ name: active.name, deck }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${active.name.replace(/[^\w\- ]+/g, '').trim() || 'pitch-deck'}.elykdeck.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importDeckFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const j = JSON.parse(reader.result)
        const id = newId()
        setStore((s) => ({
          activeId: id,
          decks: {
            ...s.decks,
            [id]: { name: j.name || 'Imported Pitch', deck: mergeDeck(j.deck || j), updatedAt: Date.now() },
          },
        }))
        setIdx(0)
      } catch {
        alert('That file doesn’t look like a saved deck.')
      }
    }
    reader.readAsText(file)
  }

  /* Export all 7 slides as a real PowerPoint file (each slide captured
     as a full-bleed image, so it matches the preview exactly). */
  const fileBase = () => active.name.replace(/[^\w\- ]+/g, '').trim() || 'pitch-deck'
  const exportPptx = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const [{ toPng, getFontEmbedCSS }, PptxGenJS] = await Promise.all([
        import('html-to-image'),
        import('pptxgenjs').then((m) => m.default),
      ])
      const nodes = [...document.querySelectorAll('.print-deck .slide-surface')]
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'WIDE_169', width: 13.333, height: 7.5 })
      pptx.layout = 'WIDE_169'

      const withTimeout = (p, ms) =>
        Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('capture timeout')), ms))])

      // Fetch + inline the web fonts ONCE, then keep ONLY the two families this
      // deck uses — embedding all six loaded families makes the capture too
      // heavy to rasterize.
      let fontEmbedCSS = ''
      try {
        const pair = FONT_PAIRS[deck.brand.fontPair] || FONT_PAIRS['inter-roboto']
        const used = [...`${pair.head} ${pair.body}`.matchAll(/'([^']+)'/g)].map((m) => m[1])
        const full = await withTimeout(getFontEmbedCSS(nodes[0]), 10000)
        const chunks = full.split('@font-face')
        fontEmbedCSS =
          chunks[0] +
          chunks
            .slice(1)
            .filter((c) => {
              const fam = c.match(/font-family:\s*['"]?([^'";}]+)/)?.[1]?.trim()
              return fam && used.includes(fam)
            })
            .map((c) => '@font-face' + c)
            .join('')
      } catch {
        fontEmbedCSS = '' // fall back to capturing without embedded fonts
      }

      // Capture slides one at a time — parallel captures lock up the page.
      const opts = { width: 1280, height: 720, pixelRatio: 1.5 }
      for (const node of nodes) {
        const data = await withTimeout(
          toPng(node, fontEmbedCSS ? { ...opts, fontEmbedCSS } : { ...opts, skipFonts: true }),
          25000,
        ).catch(() =>
          // last resort: capture without fonts rather than failing the export
          withTimeout(toPng(node, { ...opts, skipFonts: true }), 15000),
        )
        pptx.addSlide().addImage({ data, x: 0, y: 0, w: 13.333, h: 7.5 })
      }
      await pptx.writeFile({ fileName: `${fileBase()}.pptx` })
    } catch (err) {
      console.error('PPTX export failed:', err)
      alert('Slides export failed — try Export PDF instead.')
    } finally {
      setExporting(false)
    }
  }
  // testing hook
  useEffect(() => { window.__exportPptx = exportPptx })

  // scale preview to fit
  const stageRef = useRef(null)
  const { w, h } = useSize(stageRef)
  const scale = w && h ? Math.min(w / 1280, h / 720) : 0

  const go = (d) => setIdx((i) => Math.max(0, Math.min(SLIDES.length - 1, i + d)))
  const reset = () => {
    if (confirm('Reset THIS deck to the starting template? (Other saved decks are untouched.)')) {
      setDeck(DEFAULT_DECK); setIdx(0)
    }
  }

  const mgrBtn = 'grid place-items-center h-8 w-8 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-700 transition'

  return (
    <div className="h-full flex flex-col bg-[var(--app-bg)]">
      {/* ============ TOP BAR ============ */}
      <header className="no-print flex items-center justify-between px-5 h-14 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-7 w-7 rounded-lg" style={{ background: deck.brand.primary }}>
            <Presentation size={16} color="#fff" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Pitch Deck Maker</span>
          <span className="text-[12px] text-neutral-500 hidden sm:inline">· {active.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] mr-1 hidden md:inline ${saveNote.startsWith('⚠') ? 'text-amber-400' : 'text-neutral-500'}`}>{saveNote}</span>
          <button onClick={reset}
                  className="inline-flex items-center gap-1.5 text-[13px] text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={exportPptx} disabled={exporting}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg text-neutral-100 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 transition"
                  title="Download a real PowerPoint file — opens in PowerPoint, Keynote, or Google Slides.">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <MonitorPlay size={14} />}
            {exporting ? 'Exporting…' : 'Export Slides'}
          </button>
          <button onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg text-white transition"
                  style={{ background: deck.brand.primary }}
                  title="Opens print dialog — choose Landscape, enable 'Background graphics', and Save as PDF.">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </header>

      {/* ============ BODY ============ */}
      <div className="no-print flex-1 min-h-0 flex">
        {/* sidebar */}
        <aside className="w-[400px] shrink-0 border-r border-neutral-800 overflow-y-auto scroll-thin p-5"
               style={{ background: 'var(--panel)' }}>
          {/* ---- deck manager ---- */}
          <div className="mb-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2.5">
              Your Decks — one per client
            </h4>
            <select
              value={store.activeId}
              onChange={(e) => switchDeck(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 mb-2"
            >
              {Object.entries(store.decks)
                .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
                .map(([id, d]) => <option key={id} value={id}>{d.name}</option>)}
            </select>
            <input
              value={active.name}
              onChange={(e) => renameDeck(e.target.value)}
              placeholder="Deck name (e.g. Nike — Pitch)"
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 mb-2"
            />
            <div className="flex items-center gap-1.5">
              <button onClick={newDeck} className={mgrBtn} title="New deck"><FilePlus2 size={15} /></button>
              <button onClick={duplicateDeck} className={mgrBtn} title="Duplicate this deck (great starting point for a new client)"><Copy size={15} /></button>
              <button onClick={deleteDeck} className={mgrBtn} title="Delete this deck"><Trash2 size={15} /></button>
              <span className="mx-1 h-5 w-px bg-neutral-800" />
              <button onClick={exportDeckFile} className={mgrBtn} title="Save this deck as a file (backup / share)"><FileDown size={15} /></button>
              <button onClick={() => importRef.current?.click()} className={mgrBtn} title="Open a deck file"><FileUp size={15} /></button>
              <input ref={importRef} type="file" accept=".json,application/json" className="hidden"
                     onChange={(e) => { importDeckFile(e.target.files?.[0]); e.target.value = '' }} />
            </div>
          </div>

          <div className="mb-5 border-t border-neutral-800" />

          <Controls deck={deck} onChange={setDeck} slideId={slideId} />
        </aside>

        {/* preview */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* slide tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800 overflow-x-auto scroll-thin">
            {SLIDES.map((s, i) => {
              const activeTab = i === idx
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => setIdx(i)}
                        className="group inline-flex items-center gap-2 shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium border transition"
                        style={{
                          background: activeTab ? '#26262c' : 'transparent',
                          borderColor: activeTab ? '#4a4a54' : 'transparent',
                          color: activeTab ? '#fff' : '#8a8a94',
                        }}>
                  <Icon size={14} style={{ color: activeTab ? deck.brand.primary : '#6a6a74' }} />
                  <span className="tabular-nums opacity-60">{s.n}</span> {s.name}
                </button>
              )
            })}
          </div>

          {/* stage */}
          <div ref={stageRef} className="relative flex-1 min-h-0 grid place-items-center p-8"
               style={{ background: 'radial-gradient(circle at 50% 40%, #17171b, #0b0b0d)' }}>
            {scale > 0 && (
              <div style={{ width: 1280 * scale, height: 720 * scale }}
                   className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <Slide id={slideId} deck={deck} />
                </div>
              </div>
            )}

            {/* prev / next */}
            <button onClick={() => go(-1)} disabled={idx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 disabled:opacity-25 transition">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(1)} disabled={idx === SLIDES.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 disabled:opacity-25 transition">
              <ChevronRight size={20} />
            </button>

            {/* caption */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[12px] text-neutral-500">
              Slide {SLIDES[idx].n} of 7 — <span className="text-neutral-300">{SLIDES[idx].name}</span>
              <span className="text-neutral-600"> · {SLIDES[idx].tag}</span>
            </div>
          </div>
        </main>
      </div>

      {/* ============ PRINT-ONLY: all 7 slides ============ */}
      <div className="print-deck">
        {SLIDES.map((s) => (
          <div key={s.id} className="print-page">
            <Slide id={s.id} deck={deck} />
          </div>
        ))}
      </div>
    </div>
  )
}
