import { FONT_PAIRS } from './defaults'
import {
  ArrowRight, Check, Plus, ImageIcon, TrendingUp, TrendingDown, Sparkles,
} from 'lucide-react'

/* hex (#rgb / #rrggbb) -> rgba() string */
function rgba(hex, a = 1) {
  let h = (hex || '#000000').replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/* Build the render context from the deck */
function ctxFrom(deck) {
  const pair = FONT_PAIRS[deck.brand.fontPair] || FONT_PAIRS['inter-roboto']
  return {
    primary: deck.brand.primary,
    secondary: deck.brand.secondary,
    heading: deck.brand.headingColor || '#FFFFFF',
    text: deck.brand.textColor || '#E9E9EF',
    fontHead: pair.head,
    fontBody: pair.body,
    asset: (k) => deck.assets?.[k] || '',
  }
}

/* Render *word* segments in the primary color */
function Accent({ text, ctx }) {
  const parts = String(text ?? '').split(/\*([^*]+)\*/g)
  return parts.map((p, i) =>
    i % 2 ? <span key={i} style={{ color: ctx.primary }}>{p}</span> : <span key={i}>{p}</span>
  )
}

/* Image placeholder tile */
function Img({ src, caption, ctx, icon: Icon = ImageIcon, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
         style={{ background: rgba('#ffffff', 0.04), border: `1px solid ${rgba('#ffffff', 0.09)}` }}>
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.28) }}>
          <Icon size={30} strokeWidth={1.4} />
        </div>
      )}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 text-[13px] font-medium"
             style={{ color: 'rgba(255,255,255,0.88)', background: 'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))' }}>
          {caption}
        </div>
      )}
    </div>
  )
}

function Kicker({ children, ctx }) {
  return (
    <span className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase"
          style={{ color: ctx.primary, letterSpacing: '0.22em', fontFamily: ctx.fontBody }}>
      <span style={{ width: 26, height: 2, background: ctx.primary, display: 'inline-block' }} />
      {children}
    </span>
  )
}

/* Shared shell: background (color / photo mix) + brand row + slide number + footer */
function Shell({ deck, ctx, n, id, children, pad = 72 }) {
  const { asset } = ctx
  const bgImg = asset('bg_' + id)
  const bg = deck.backgrounds?.[id] || {}
  const styleMode = bg.style || (id === 'vision' ? 'split' : 'full')
  const blur = bg.blur ?? 6
  const overlay = bg.overlay ?? (styleMode === 'split' ? 35 : 65)
  const a = Math.min(1, Math.max(0, overlay / 100))
  const sec = ctx.secondary

  return (
    <div className="absolute inset-0" style={{ background: sec, color: ctx.text, fontFamily: ctx.fontBody }}>
      {/* optional background photo, blurred + mixed with the brand color */}
      {bgImg && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={bgImg} alt="" className="absolute inset-0 h-full w-full object-cover"
               style={{ filter: `blur(${blur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0"
               style={{
                 background: styleMode === 'split'
                   ? `linear-gradient(90deg, ${sec} 0%, ${rgba(sec, 0.96)} 30%, ${rgba(sec, Math.max(a, 0.12))} 68%, ${rgba(sec, Math.max(a - 0.12, 0))} 100%)`
                   : rgba(sec, a),
               }} />
        </div>
      )}
      {/* accent glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: `radial-gradient(60% 55% at 82% 8%, ${rgba(ctx.primary, 0.16)} 0%, rgba(0,0,0,0) 60%)` }} />
      {/* top brand bar */}
      <div className="absolute left-0 right-0 flex items-center justify-between" style={{ top: 34, paddingLeft: pad, paddingRight: pad, zIndex: 2 }}>
        <div className="flex items-center gap-2.5">
          {asset('agencyLogo')
            ? <img src={asset('agencyLogo')} alt="" style={{ height: 26 }} className="object-contain" />
            : <span className="text-[15px] font-bold tracking-[0.16em] uppercase" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{deck.brand.agencyName}</span>}
        </div>
        <span className="text-[12px] font-medium tracking-[0.18em] uppercase" style={{ color: rgba(ctx.text, 0.45) }}>
          {deck.brand.clientName} · Proposal
        </span>
      </div>
      {/* content */}
      <div className="absolute inset-0" style={{ padding: pad, paddingTop: 104 }}>{children}</div>
      {/* footer: number + contact line */}
      <div className="absolute" style={{ left: pad, bottom: 30 }}>
        <span className="text-[12px] font-medium tracking-[0.16em]" style={{ color: rgba(ctx.text, 0.4) }}>
          {String(n).padStart(2, '0')} / 07
        </span>
      </div>
      {id !== 'vision' && deck.brand.footer && (
        <div className="absolute" style={{ right: pad, bottom: 30 }}>
          <span className="text-[12px] font-medium tracking-[0.1em]" style={{ color: rgba(ctx.text, 0.4) }}>
            {deck.brand.footer}
          </span>
        </div>
      )}
    </div>
  )
}

/* ======================= SLIDE 1 — VISION ======================= */
function Vision({ deck, ctx }) {
  const v = deck.vision
  return (
    <Shell deck={deck} ctx={ctx} n={1} id="vision">
      <div className="relative h-full flex flex-col justify-center max-w-[980px]" style={{ zIndex: 2 }}>
        <Kicker ctx={ctx}>{v.kicker}</Kicker>
        <h1 className="mt-6 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 74, lineHeight: 1.03, letterSpacing: '-0.02em', color: ctx.heading }}>
          <Accent text={v.headline} ctx={ctx} />
        </h1>
        <p className="mt-7 max-w-[760px]" style={{ fontSize: 23, lineHeight: 1.5, color: rgba(ctx.text, 0.72) }}>
          {v.subtitle}
        </p>
      </div>
      {/* client lockup, bottom-right */}
      <div className="absolute flex items-center gap-4" style={{ right: 72, bottom: 30, zIndex: 2 }}>
        <span className="text-[12px] uppercase tracking-[0.16em]" style={{ color: rgba(ctx.text, 0.45) }}>Prepared for</span>
        {ctx.asset('clientLogo')
          ? <img src={ctx.asset('clientLogo')} alt="" style={{ height: 30 }} className="object-contain" />
          : <span className="text-[18px] font-semibold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{deck.brand.clientName}</span>}
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 2 — BLUEPRINT ======================= */
function MetricRow({ m, tone, ctx }) {
  const good = tone === 'target'
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${rgba('#ffffff', 0.08)}` }}>
      <span className="text-[15px]" style={{ color: rgba(ctx.text, 0.65) }}>{m.label}</span>
      <span className="text-[22px] font-bold" style={{ fontFamily: ctx.fontHead, color: good ? ctx.primary : ctx.heading }}>{m.value}</span>
    </div>
  )
}
function Blueprint({ deck, ctx }) {
  const b = deck.blueprint
  return (
    <Shell deck={deck} ctx={ctx} n={2} id="blueprint">
      <Kicker ctx={ctx}>The Mini-Blueprint</Kicker>
      <p className="mt-4 max-w-[820px] text-[19px]" style={{ color: rgba(ctx.text, 0.75), lineHeight: 1.45 }}>
        <Accent text={b.intro} ctx={ctx} />
      </p>
      <div className="mt-7 grid grid-cols-2 gap-7" style={{ height: 384 }}>
        {/* current */}
        <div className="rounded-2xl p-6 flex flex-col" style={{ background: rgba('#ffffff', 0.03), border: `1px solid ${rgba('#ffffff', 0.08)}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} style={{ color: rgba(ctx.text, 0.5) }} />
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: rgba(ctx.text, 0.5) }}>Where you are now</span>
          </div>
          <div className="mb-4">{b.current.map((m, i) => <MetricRow key={i} m={m} tone="current" ctx={ctx} />)}</div>
          <Img src={ctx.asset('weakContent')} caption={b.weakCaption} ctx={ctx} className="flex-1 min-h-0" />
        </div>
        {/* target */}
        <div className="relative rounded-2xl p-6 flex flex-col" style={{ background: rgba(ctx.primary, 0.06), border: `1px solid ${rgba(ctx.primary, 0.35)}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: ctx.primary }} />
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: ctx.primary }}>Where the market is</span>
          </div>
          <div className="mb-4">{b.target.map((m, i) => <MetricRow key={i} m={m} tone="target" ctx={ctx} />)}</div>
          <Img src={ctx.asset('competitor')} caption={b.competitorCaption} ctx={ctx} className="flex-1 min-h-0" />
          {/* arrow */}
          <div className="absolute grid place-items-center rounded-full" style={{ left: -34, top: '46%', width: 44, height: 44, background: ctx.primary, boxShadow: `0 8px 24px ${rgba(ctx.primary, 0.5)}` }}>
            <ArrowRight size={22} color="#fff" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 3 — STRATEGY ======================= */
function Strategy({ deck, ctx }) {
  const s = deck.strategy
  const keys = ['mood1', 'mood2', 'mood3', 'mood4']
  return (
    <Shell deck={deck} ctx={ctx} n={3} id="strategy">
      <div className="h-full grid grid-cols-[minmax(0,1fr)_1.15fr] gap-12">
        <div className="flex flex-col justify-center">
          <Kicker ctx={ctx}>{s.kicker}</Kicker>
          <h2 className="mt-5 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 46, lineHeight: 1.08, letterSpacing: '-0.015em', color: ctx.heading }}>
            The Strategy
          </h2>
          <p className="mt-5 text-[19px]" style={{ color: rgba(ctx.text, 0.72), lineHeight: 1.55 }}>
            <Accent text={s.overview} ctx={ctx} />
          </p>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          {keys.map((k, i) => (
            <Img key={k} src={ctx.asset(k)} caption={s.moodCaptions[i]} ctx={ctx} icon={Sparkles} />
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 4 — CASE STUDIES ======================= */
function CaseStudies({ deck, ctx }) {
  const cs = deck.caseStudies
  return (
    <Shell deck={deck} ctx={ctx} n={4} id="caseStudies">
      <Kicker ctx={ctx}>The Proof</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Case Studies</h2>
      <p className="mt-2 text-[18px]" style={{ color: rgba(ctx.text, 0.62) }}>
        <Accent text={cs.intro} ctx={ctx} />
      </p>
      <div className="mt-6 grid grid-cols-2 gap-7" style={{ height: 356 }}>
        {cs.items.map((c, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: rgba('#ffffff', 0.03), border: `1px solid ${rgba('#ffffff', 0.08)}` }}>
            <Img src={ctx.asset(`case${i + 1}Thumb`)} ctx={ctx} className="h-[170px] rounded-none" />
            <div className="p-6 flex flex-col flex-1">
              <span className="text-[19px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{c.client}</span>
              <span className="mt-1.5 text-[15px]" style={{ color: rgba(ctx.text, 0.62), lineHeight: 1.4 }}>{c.goal}</span>
              <div className="mt-auto pt-4 text-[19px] font-semibold" style={{ color: ctx.primary, fontFamily: ctx.fontHead, lineHeight: 1.3 }}>
                {c.results}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 5 — DELIVERABLES ======================= */
function Deliverables({ deck, ctx }) {
  const d = deck.deliverables
  return (
    <Shell deck={deck} ctx={ctx} n={5} id="deliverables">
      <Kicker ctx={ctx}>{d.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>The Deliverables</h2>
      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div className="space-y-3">
          {d.items.map((it, i) => (
            <div key={i} className="flex items-start gap-3.5 rounded-xl px-5 py-4"
                 style={{ background: rgba('#ffffff', 0.03), border: `1px solid ${rgba('#ffffff', 0.08)}` }}>
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 26, height: 26, background: rgba(ctx.primary, 0.15), color: ctx.primary, marginTop: 1 }}>
                <Check size={15} strokeWidth={2.5} />
              </span>
              <span className="text-[17px]" style={{ lineHeight: 1.4, color: rgba(ctx.text, 0.92) }}>
                <Accent text={it} ctx={ctx} />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 h-full" style={{ background: rgba(ctx.primary, 0.09), border: `1px solid ${rgba(ctx.primary, 0.4)}` }}>
          <div className="flex items-center gap-2">
            <Plus size={18} style={{ color: ctx.primary }} />
            <span className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: ctx.primary }}>Lead Generation</span>
          </div>
          <p className="mt-3 text-[17px]" style={{ lineHeight: 1.5, color: rgba(ctx.text, 0.92) }}>{d.leadGen}</p>
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 6 — PROCESS ======================= */
function Process({ deck, ctx }) {
  const p = deck.process
  const cols = p.steps.length
  return (
    <Shell deck={deck} ctx={ctx} n={6} id="process">
      <Kicker ctx={ctx}>{p.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>How We Work</h2>
      <div className="mt-14 relative">
        <div className="absolute" style={{ top: 26, left: 26, right: 26, height: 2, background: rgba('#ffffff', 0.12) }} />
        <div className="grid gap-6 relative" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {p.steps.map((st, i) => (
            <div key={i}>
              <div className="grid place-items-center rounded-full text-[20px] font-bold"
                   style={{ width: 54, height: 54, background: ctx.primary, color: '#fff', fontFamily: ctx.fontHead, boxShadow: `0 8px 22px ${rgba(ctx.primary, 0.45)}` }}>
                {i + 1}
              </div>
              <div className="mt-6 text-[22px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{st.title}</div>
              <p className="mt-2.5 text-[16px]" style={{ color: rgba(ctx.text, 0.65), lineHeight: 1.5 }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE 7 — INVESTMENT ======================= */
function Investment({ deck, ctx }) {
  const iv = deck.investment
  return (
    <Shell deck={deck} ctx={ctx} n={7} id="investment">
      <div className="h-full grid grid-cols-[1fr_1fr] gap-12">
        <div className="flex flex-col justify-center">
          <Kicker ctx={ctx}>{iv.kicker}</Kicker>
          <div className="mt-6 flex items-end gap-2">
            <span className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 84, lineHeight: 0.95, letterSpacing: '-0.02em', color: ctx.heading }}>{iv.price}</span>
            <span className="text-[22px] mb-3" style={{ color: rgba(ctx.text, 0.58) }}>{iv.cadence}</span>
          </div>
          <div className="mt-7 space-y-2.5">
            {iv.includes.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check size={18} style={{ color: ctx.primary }} strokeWidth={2.5} />
                <span className="text-[17px]" style={{ color: rgba(ctx.text, 0.9) }}>{it}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-3xl p-9"
             style={{ background: `linear-gradient(160deg, ${rgba(ctx.primary, 0.16)}, ${rgba('#ffffff', 0.02)})`, border: `1px solid ${rgba(ctx.primary, 0.35)}` }}>
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: ctx.primary }}>Next Steps</span>
          <p className="mt-4 font-semibold" style={{ fontFamily: ctx.fontHead, fontSize: 27, lineHeight: 1.32, color: ctx.heading }}>
            <Accent text={iv.cta} ctx={ctx} />
          </p>
          <div className="mt-8 inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-[16px] font-semibold"
               style={{ background: ctx.primary, color: '#fff' }}>
            Let’s talk <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Shell>
  )
}

const MAP = {
  vision: Vision, blueprint: Blueprint, strategy: Strategy, caseStudies: CaseStudies,
  deliverables: Deliverables, process: Process, investment: Investment,
}

/* One slide, authored in a fixed 1280x720 surface */
export function Slide({ id, deck }) {
  const ctx = ctxFrom(deck)
  const Comp = MAP[id] || Vision
  return (
    <div className="slide-surface">
      <Comp deck={deck} ctx={ctx} />
    </div>
  )
}
