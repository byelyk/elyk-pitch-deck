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

/* ---- Image upload (stores a data URL) ---- */
export function ImageDrop({ label, value, onChange, aspect = '16/9' }) {
  const ref = useRef(null)
  const pick = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
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
