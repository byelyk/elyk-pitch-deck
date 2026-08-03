import { useRef } from 'react'
import { Upload, X, Plus, Trash2, GripVertical } from 'lucide-react'

/* ---- Section wrapper ---- */
export function Group({ title, children }) {
  return (
    <div className="mb-6">
      {title && (
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2.5">
          {title}
        </h4>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/* ---- Text input ---- */
export function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      {label && <span className="block text-[12px] text-neutral-400 mb-1">{label}</span>}
      <input
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 transition"
      />
    </label>
  )
}

/* ---- Multi-line ---- */
export function Area({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block">
      {label && <span className="block text-[12px] text-neutral-400 mb-1">{label}</span>}
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 transition resize-y leading-relaxed"
      />
    </label>
  )
}

/* ---- Color ---- */
export function ColorField({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-neutral-400">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-xs font-mono text-neutral-200 outline-none focus:border-neutral-600"
        />
        <span className="relative h-8 w-8 rounded-md overflow-hidden border border-neutral-700">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer p-0 border-0 bg-transparent"
          />
        </span>
      </span>
    </label>
  )
}

/* ---- Image upload (stores a data URL) ----
   Uploads are auto-resized to a 2000px cap and re-encoded (JPEG for photos,
   PNG kept for logos/transparency). Slides only ever display ~1920px wide,
   so this is visually lossless while keeping browser storage ~10x smaller. */
const MAX_IMG_DIM = 1400   // slides render at 1280px — anything larger is wasted bytes

/* Encode an already-loaded image to a data URL, downscaled to `cap`.
   PNG is only kept when the image genuinely has transparent pixels (logos);
   opaque PNGs — screenshots especially — become JPEG, which is ~10x smaller. */
function encodeImage(img, cap = MAX_IMG_DIM, quality = 0.82) {
  const scale = Math.min(1, cap / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  let hasAlpha = false
  try {
    const d = ctx.getImageData(0, 0, w, h).data
    for (let i = 3; i < d.length; i += 4 * 997) { if (d[i] < 250) { hasAlpha = true; break } }
  } catch { hasAlpha = false }
  return c.toDataURL(hasAlpha ? 'image/png' : 'image/jpeg', quality)
}

/* Re-compress a data-URL image. Returns the original if it wouldn't shrink. */
export function compressDataURL(dataUrl, cap = MAX_IMG_DIM, quality = 0.82) {
  return new Promise((resolve) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return resolve(dataUrl)
    const img = new Image()
    img.onload = () => {
      try {
        const out = encodeImage(img, cap, quality)
        resolve(out && out.length < dataUrl.length ? out : dataUrl)
      } catch { resolve(dataUrl) }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function processImage(file, cb) {
  const reader = new FileReader()
  reader.onload = () => compressDataURL(reader.result).then(cb)
  reader.readAsDataURL(file)
}

export function ImageDrop({ label, value, onChange, aspect = '16/9' }) {
  const ref = useRef(null)
  const pick = (file) => {
    if (!file) return
    processImage(file, onChange)
  }
  return (
    <div>
      {label && <span className="block text-[12px] text-neutral-400 mb-1">{label}</span>}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]) }}
        className="relative group rounded-lg border border-dashed border-neutral-700 bg-neutral-900/60 hover:border-neutral-500 cursor-pointer overflow-hidden transition"
        style={{ aspectRatio: aspect }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="absolute top-1.5 right-1.5 grid place-items-center h-6 w-6 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
              title="Remove"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-neutral-500">
            <div className="flex flex-col items-center gap-1">
              <Upload size={18} />
              <span className="text-[11px]">Upload / drop image</span>
            </div>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  )
}

/* ---- On/off toggle ---- */
export function Toggle({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 border transition"
      style={{
        background: checked ? 'rgba(255,77,0,0.10)' : '#171719',
        borderColor: checked ? 'rgba(255,77,0,0.45)' : '#2a2a31',
      }}
    >
      <span className="text-[13px]" style={{ color: checked ? '#fff' : '#9a9aa4' }}>{label}</span>
      <span className="relative inline-block shrink-0" style={{ width: 38, height: 22 }}>
        <span className="absolute inset-0 rounded-full transition"
              style={{ background: checked ? '#ff4d00' : '#3a3a42' }} />
        <span className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all"
              style={{ left: checked ? 18 : 2 }} />
      </span>
    </button>
  )
}

/* ---- Range slider ---- */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '' }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[12px] text-neutral-400 mb-1">
        <span>{label}</span>
        <span className="text-neutral-200 tabular-nums">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer appearance-auto"
        style={{ accentColor: '#ff4d00' }}
      />
    </label>
  )
}

/* ---- Editable bullet list ---- */
export function ListEditor({ label, items, onChange, placeholder = 'List item' }) {
  const update = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, ''])
  return (
    <div>
      {label && <span className="block text-[12px] text-neutral-400 mb-1.5">{label}</span>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <GripVertical size={14} className="mt-2.5 shrink-0 text-neutral-600" />
            <textarea
              rows={1}
              value={it}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600 resize-y"
            />
            <button
              onClick={() => remove(i)}
              className="mt-1.5 shrink-0 grid place-items-center h-7 w-7 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-md px-2.5 py-1.5 bg-neutral-800/70 hover:bg-neutral-700 transition"
      >
        <Plus size={13} /> Add item
      </button>
    </div>
  )
}

/* ---- Editable label + URL rows (social links) ---- */
export function LinkEditor({ label, items, onChange }) {
  const update = (i, key, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { label: '', url: '' }])
  return (
    <div>
      {label && <span className="block text-[12px] text-neutral-400 mb-1.5">{label}</span>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it.label}
              placeholder="Label"
              onChange={(e) => update(i, 'label', e.target.value)}
              className="w-24 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            />
            <input
              value={it.url}
              placeholder="https://…"
              onChange={(e) => update(i, 'url', e.target.value)}
              className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            />
            <button onClick={() => remove(i)}
                    className="shrink-0 grid place-items-center h-7 w-7 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition" title="Remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-md px-2.5 py-1.5 bg-neutral-800/70 hover:bg-neutral-700 transition">
        <Plus size={13} /> Add link
      </button>
    </div>
  )
}

/* ---- Editable label/value metric rows ---- */
export function MetricEditor({ label, items, onChange }) {
  const update = (i, key, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { label: '', value: '' }])
  return (
    <div>
      {label && <span className="block text-[12px] text-neutral-400 mb-1.5">{label}</span>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it.label}
              placeholder="Metric"
              onChange={(e) => update(i, 'label', e.target.value)}
              className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            />
            <input
              value={it.value}
              placeholder="Value"
              onChange={(e) => update(i, 'value', e.target.value)}
              className="w-24 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm font-semibold text-neutral-100 outline-none focus:border-neutral-600"
            />
            <button
              onClick={() => remove(i)}
              className="shrink-0 grid place-items-center h-7 w-7 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-md px-2.5 py-1.5 bg-neutral-800/70 hover:bg-neutral-700 transition"
      >
        <Plus size={13} /> Add metric
      </button>
    </div>
  )
}
