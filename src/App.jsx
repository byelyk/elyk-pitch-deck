import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DEFAULT_DECK, DEFAULT_KIT, DEFAULT_BRIEF, SLIDES, KIT_SLIDES, BRIEF_SLIDES, FONT_PAIRS } from './defaults'
import { Slide } from './slides'
import { KitSlide } from './kit-slides'
import { BriefSlide } from './brief-slides'
import Controls from './Controls'
import KitControls from './kit-controls'
import BriefControls from './brief-controls'
import { compressDataURL } from './ui'
import {
  Download, RotateCcw, ChevronLeft, ChevronRight, Presentation, IdCard, ClipboardList,
  FilePlus2, Copy, Trash2, FileDown, FileUp, MonitorPlay, Loader2, EyeOff, Eye, Play, X, Wand2,
} from 'lucide-react'

const STORE_KEY = 'elyk-decks-v2'
const OLD_KEY = 'elyk-deck-v1'

const baseFor = (type) => (type === 'mediakit' ? DEFAULT_KIT : type === 'brief' ? DEFAULT_BRIEF : DEFAULT_DECK)

/* Fill any missing keys from the right defaults so old saves never crash a slide */
function mergeDeck(saved) {
  const base = baseFor(saved?.type)
  if (!saved || typeof saved !== 'object') return base
  const out = { ...base, ...saved, type: saved.type || 'pitch' }
  for (const k of Object.keys(base)) {
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = { ...base[k], ...(saved[k] || {}) }
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
  const [exportingPdf, setExportingPdf] = useState(false)
  const [present, setPresent] = useState(null) // null | index into visibleSlides
  const [optimizing, setOptimizing] = useState(false)
  const importRef = useRef(null)

  const active = store.decks[store.activeId]
  const deck = active.deck
  const isKit = deck.type === 'mediakit'
  const isBrief = deck.type === 'brief'

  // pick the right slide set + renderer + controls for this document type
  const SLIDE_LIST = isKit ? KIT_SLIDES : isBrief ? BRIEF_SLIDES : SLIDES
  const RenderSlide = isKit ? KitSlide : isBrief ? BriefSlide : Slide
  const ControlsComp = isKit ? KitControls : isBrief ? BriefControls : Controls
  const safeIdx = Math.min(idx, SLIDE_LIST.length - 1)
  const slideId = SLIDE_LIST[safeIdx].id

  // visible (included) slides drive numbering + export
  const hiddenIds = deck.hidden || []
  const visibleSlides = SLIDE_LIST.filter((s) => !hiddenIds.includes(s.id))
  const posMap = Object.fromEntries(visibleSlides.map((s, i) => [s.id, i + 1]))

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
  const createDoc = (type) => {
    const id = newId()
    const name = type === 'mediakit' ? 'New Media Kit' : type === 'brief' ? 'New Brief' : 'New Pitch'
    setStore((s) => ({ activeId: id, decks: { ...s.decks, [id]: { name, deck: baseFor(type), updatedAt: Date.now() } } }))
    setIdx(0)
  }
  const newDeck = () => createDoc(deck.type)
  // Top-left switch: jump to the newest doc of that type, or start one
  const switchType = (type) => {
    if (deck.type === type) return
    const match = Object.entries(store.decks)
      .filter(([, d]) => (d.deck.type || 'pitch') === type)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]
    if (match) { setStore((s) => ({ ...s, activeId: match[0] })); setIdx(0) }
    else createDoc(type)
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
  /* Shrink every embedded image in a deck. Oversized images (multi-MB phone
     photos / PNG screenshots) blow up the export capture, so this runs on
     import and is available on demand for decks that are already heavy. */
  const optimizeAssets = async (assets) => {
    const out = {}
    for (const [k, v] of Object.entries(assets || {})) {
      out[k] = typeof v === 'string' && v.startsWith('data:image') ? await compressDataURL(v) : v
    }
    return out
  }

  const importDeckFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const j = JSON.parse(reader.result)
        const merged = mergeDeck(j.deck || j)
        merged.assets = await optimizeAssets(merged.assets)
        const id = newId()
        setStore((s) => ({
          activeId: id,
          decks: {
            ...s.decks,
            [id]: { name: j.name || 'Imported Pitch', deck: merged, updatedAt: Date.now() },
          },
        }))
        setIdx(0)
      } catch {
        alert('That file doesn’t look like a saved deck.')
      }
    }
    reader.readAsText(file)
  }

  const optimizeCurrentDeck = async () => {
    if (optimizing) return
    setOptimizing(true)
    try {
      const before = JSON.stringify(deck.assets || {}).length
      const assets = await optimizeAssets(deck.assets)
      const after = JSON.stringify(assets).length
      setDeck({ ...deck, assets })
      const mb = (n) => (n * 0.75 / 1048576).toFixed(1)
      alert(before > after
        ? `Images optimized: ${mb(before)} MB → ${mb(after)} MB.\nExports will be faster and more reliable.`
        : 'Images are already optimized.')
    } finally {
      setOptimizing(false)
    }
  }

  /* ---- shared slide-capture pipeline (feeds PowerPoint + PDF exports) ---- */
  const fileBase = () => active.name.replace(/[^\w\- ]+/g, '').trim() || 'pitch-deck'
  const withTimeout = (p, ms) =>
    Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('capture timeout')), ms))])

  const captureSlides = async (format = 'png') => {
    const { toPng, toJpeg, getFontEmbedCSS } = await import('html-to-image')
    const nodes = [...document.querySelectorAll('.print-deck .slide-surface')]

    // Fetch + inline the web fonts ONCE, then keep ONLY the two families this
    // doc uses — embedding every loaded family makes the capture too heavy.
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
    const cap = format === 'jpeg' ? toJpeg : toPng
    const opts = { width: 1280, height: 720, pixelRatio: 1.5, ...(format === 'jpeg' ? { quality: 0.92, backgroundColor: '#000' } : {}) }
    const datas = []
    for (const node of nodes) {
      const data = await withTimeout(
        cap(node, fontEmbedCSS ? { ...opts, fontEmbedCSS } : { ...opts, skipFonts: true }),
        25000,
      ).catch(() =>
        // last resort: capture without fonts rather than failing the export
        withTimeout(cap(node, { ...opts, skipFonts: true }), 15000),
      )
      datas.push(data)
    }
    return datas
  }

  /* Export as a real PowerPoint file (each slide a full-bleed image) */
  const exportPptx = async () => {
    if (exporting || exportingPdf) return
    setExporting(true)
    try {
      const PptxGenJS = await import('pptxgenjs').then((m) => m.default)
      const datas = await captureSlides('png')
      const pptx = new PptxGenJS()
      pptx.defineLayout({ name: 'WIDE_169', width: 13.333, height: 7.5 })
      pptx.layout = 'WIDE_169'
      for (const data of datas) pptx.addSlide().addImage({ data, x: 0, y: 0, w: 13.333, h: 7.5 })
      await pptx.writeFile({ fileName: `${fileBase()}.pptx` })
    } catch (err) {
      console.error('PPTX export failed:', err)
      alert('Slides export failed — try Export PDF instead.')
    } finally {
      setExporting(false)
    }
  }

  /* One-click PDF — no print dialog, no settings to remember */
  const exportPdf = async () => {
    if (exporting || exportingPdf) return
    setExportingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const datas = await captureSlides('jpeg')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720], hotfixes: ['px_scaling'] })
      datas.forEach((data, i) => {
        if (i > 0) doc.addPage([1280, 720], 'landscape')
        doc.addImage(data, 'JPEG', 0, 0, 1280, 720)
      })
      doc.save(`${fileBase()}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed — you can still print to PDF with Cmd+P.')
    } finally {
      setExportingPdf(false)
    }
  }

  /* ?load=/file.json — open a saved doc straight from a URL */
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get('load')
    if (!url) return
    let cancelled = false
    ;(async () => {
      try {
        const j = await (await fetch(url)).json()
        if (cancelled) return
        const merged = mergeDeck(j.deck || j)
        merged.assets = await optimizeAssets(merged.assets)
        const id = newId()
        setStore((s) => ({
          activeId: id,
          decks: { ...s.decks, [id]: { name: j.name || 'Opened Doc', deck: merged, updatedAt: Date.now() } },
        }))
        setIdx(0)
        window.history.replaceState({}, '', window.location.pathname)
      } catch (e) { console.warn('?load failed:', e) }
    })()
    return () => { cancelled = true }
  }, [])

  // testing hooks
  useEffect(() => { window.__exportPptx = exportPptx; window.__exportPdf = exportPdf })

  /* ---- present mode (fullscreen slideshow) ---- */
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const f = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])

  const startPresent = () => {
    const pos = visibleSlides.findIndex((s) => s.id === slideId)
    setPresent(pos >= 0 ? pos : 0)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const stopPresent = () => {
    setPresent(null)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }
  useEffect(() => {
    if (present === null) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault(); setPresent((p) => Math.min(visibleSlides.length - 1, p + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); setPresent((p) => Math.max(0, p - 1))
      } else if (e.key === 'Escape') stopPresent()
    }
    const onFs = () => { if (!document.fullscreenElement) setPresent(null) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs) }
  }, [present, visibleSlides.length])

  // scale preview to fit
  const stageRef = useRef(null)
  const { w, h } = useSize(stageRef)
  const scale = w && h ? Math.min(w / 1280, h / 720) : 0

  const toggleHidden = (id) =>
    setDeck({ ...deck, hidden: hiddenIds.includes(id) ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id] })
  const go = (d) => setIdx((i) => Math.max(0, Math.min(SLIDE_LIST.length - 1, i + d)))
  const reset = () => {
    if (confirm('Reset THIS document to the starting template? (Other saved docs are untouched.)')) {
      setDeck(baseFor(deck.type)); setIdx(0)
    }
  }

  const mgrBtn = 'grid place-items-center h-8 w-8 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-700 transition'

  return (
    <div className="h-full flex flex-col bg-[var(--app-bg)]">
      {/* ============ TOP BAR ============ */}
      <header className="no-print flex items-center justify-between px-5 h-14 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-7 w-7 rounded-lg shrink-0" style={{ background: deck.brand.primary }}>
            <Presentation size={16} color="#fff" />
          </span>
          {/* document-type switch */}
          <div className="flex items-center rounded-lg border border-neutral-700 overflow-hidden text-[12.5px] font-medium">
            {[
              ['pitch', 'Pitch Deck', Presentation],
              ['mediakit', 'Media Kit', IdCard],
              ['brief', 'Brief', ClipboardList],
            ].map(([type, label, Icon]) => {
              const on = deck.type === type
              return (
                <button key={type} onClick={() => switchType(type)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 transition"
                        style={{ background: on ? deck.brand.primary : 'transparent', color: on ? '#fff' : '#9a9aa4' }}>
                  <Icon size={13} /> {label}
                </button>
              )
            })}
          </div>
          <span className="text-[12px] text-neutral-500 hidden md:inline truncate max-w-[180px]">· {active.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] mr-1 hidden md:inline ${saveNote.startsWith('⚠') ? 'text-amber-400' : 'text-neutral-500'}`}>{saveNote}</span>
          <button onClick={reset}
                  className="inline-flex items-center gap-1.5 text-[13px] text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={startPresent}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg text-neutral-100 bg-neutral-800 hover:bg-neutral-700 transition"
                  title="Fullscreen slideshow — present live on a call. Arrow keys to navigate, Esc to exit.">
            <Play size={14} /> Present
          </button>
          <button onClick={exportPptx} disabled={exporting || exportingPdf}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg text-neutral-100 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 transition"
                  title="Download a real PowerPoint file — opens in PowerPoint, Keynote, or Google Slides.">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <MonitorPlay size={14} />}
            {exporting ? 'Exporting…' : 'Export Slides'}
          </button>
          <button onClick={exportPdf} disabled={exporting || exportingPdf}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg text-white disabled:opacity-60 transition"
                  style={{ background: deck.brand.primary }}
                  title="Downloads a ready-to-send PDF — no print dialog, no settings.">
            {exportingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exportingPdf ? 'Exporting…' : 'Export PDF'}
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
              Your Docs — decks &amp; kits
            </h4>
            <select
              value={store.activeId}
              onChange={(e) => switchDeck(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 mb-2"
            >
              {Object.entries(store.decks)
                .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
                .map(([id, d]) => <option key={id} value={id}>{(d.deck.type === 'mediakit' ? '🪪 ' : d.deck.type === 'brief' ? '📋 ' : '📊 ') + d.name}</option>)}
            </select>
            <input
              value={active.name}
              onChange={(e) => renameDeck(e.target.value)}
              placeholder={isKit ? 'Kit name (e.g. Maya — Media Kit)' : 'Deck name (e.g. Nike — Pitch)'}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 mb-2"
            />
            <div className="flex items-center gap-1.5">
              <button onClick={newDeck} className={mgrBtn} title={isKit ? 'New media kit' : 'New pitch deck'}><FilePlus2 size={15} /></button>
              <button onClick={duplicateDeck} className={mgrBtn} title="Duplicate this doc (great starting point for a new client)"><Copy size={15} /></button>
              <button onClick={deleteDeck} className={mgrBtn} title="Delete this doc"><Trash2 size={15} /></button>
              <span className="mx-1 h-5 w-px bg-neutral-800" />
              <button onClick={exportDeckFile} className={mgrBtn} title="Save this doc as a file (backup / share)"><FileDown size={15} /></button>
              <button onClick={() => importRef.current?.click()} className={mgrBtn} title="Open a saved file"><FileUp size={15} /></button>
              <span className="mx-1 h-5 w-px bg-neutral-800" />
              <button onClick={optimizeCurrentDeck} disabled={optimizing} className={mgrBtn}
                      title="Optimize images — shrink oversized photos so exports are fast and reliable">
                {optimizing ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              </button>
              <input ref={importRef} type="file" accept=".json,application/json" className="hidden"
                     onChange={(e) => { importDeckFile(e.target.files?.[0]); e.target.value = '' }} />
            </div>
          </div>

          <div className="mb-5 border-t border-neutral-800" />

          <ControlsComp deck={deck} onChange={setDeck} slideId={slideId} />
        </aside>

        {/* preview */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* slide tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800 overflow-x-auto scroll-thin">
            {SLIDE_LIST.map((s, i) => {
              const activeTab = i === safeIdx
              const isHidden = hiddenIds.includes(s.id)
              const Icon = s.icon
              return (
                <div key={s.id}
                     title={s.tag}
                     className="group inline-flex items-center gap-1.5 shrink-0 rounded-lg pl-3 pr-1.5 py-1.5 text-[12.5px] font-medium border transition cursor-pointer"
                     onClick={() => setIdx(i)}
                     style={{
                       background: activeTab ? '#26262c' : 'transparent',
                       borderColor: activeTab ? '#4a4a54' : 'transparent',
                       color: activeTab ? '#fff' : '#8a8a94',
                       opacity: isHidden ? 0.5 : 1,
                     }}>
                  <Icon size={14} style={{ color: activeTab ? deck.brand.primary : '#6a6a74' }} />
                  <span className="tabular-nums opacity-60">{isHidden ? '–' : posMap[s.id]}</span>
                  <span className={isHidden ? 'line-through' : ''}>{s.name}</span>
                  <span role="button" tabIndex={0}
                        title={isHidden ? 'Excluded from export — click to include' : 'Included — click to exclude from export'}
                        onClick={(e) => { e.stopPropagation(); toggleHidden(s.id) }}
                        className="ml-0.5 grid place-items-center h-5 w-5 rounded hover:bg-white/15 transition"
                        style={{ color: isHidden ? '#e0a03a' : '#7a7a84' }}>
                    {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </span>
                </div>
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
                  <RenderSlide id={slideId} deck={deck} />
                </div>
              </div>
            )}

            {/* prev / next */}
            <button onClick={() => go(-1)} disabled={safeIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 disabled:opacity-25 transition">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(1)} disabled={safeIdx === SLIDE_LIST.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 disabled:opacity-25 transition">
              <ChevronRight size={20} />
            </button>

            {/* caption */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[12px] text-neutral-500">
              {hiddenIds.includes(slideId)
                ? <span className="text-amber-400/80">Hidden from this {isKit ? 'kit' : isBrief ? 'brief' : 'deck'}</span>
                : <>{isKit || isBrief ? 'Page' : 'Slide'} {posMap[slideId]} of {visibleSlides.length}</>}
              {' — '}<span className="text-neutral-300">{SLIDE_LIST[safeIdx].name}</span>
              <span className="text-neutral-600"> · {SLIDE_LIST[safeIdx].tag}</span>
            </div>
          </div>
        </main>
      </div>

      {/* ============ PRESENT MODE (fullscreen slideshow) ============ */}
      {present !== null && visibleSlides[present] && (() => {
        const pScale = Math.min(winSize.w / 1280, winSize.h / 720)
        return (
          <div className="no-print fixed inset-0 z-50 bg-black grid place-items-center"
               onClick={() => setPresent((p) => Math.min(visibleSlides.length - 1, p + 1))}>
            <div style={{ width: 1280 * pScale, height: 720 * pScale }} className="overflow-hidden">
              <div style={{ transform: `scale(${pScale})`, transformOrigin: 'top left' }}>
                <RenderSlide id={visibleSlides[present].id} deck={deck} />
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); stopPresent() }}
                    className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                    title="Exit (Esc)">
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[12px] text-white/40 select-none">
              {present + 1} / {visibleSlides.length} · arrows or click to advance · Esc to exit
            </div>
          </div>
        )
      })()}

      {/* ============ PRINT / EXPORT: only included slides ============ */}
      <div className="print-deck">
        {visibleSlides.map((s) => (
          <div key={s.id} className="print-page">
            <RenderSlide id={s.id} deck={deck} />
          </div>
        ))}
      </div>
    </div>
  )
}
