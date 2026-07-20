import { FONT_PAIRS, SLIDES } from './defaults'
import {
  ArrowRight, Check, Plus, ImageIcon, TrendingUp, TrendingDown, Sparkles, Lightbulb,
} from 'lucide-react'

/* hex (#rgb / #rrggbb) -> rgba() string */
export function rgba(hex, a = 1) {
  let h = (hex || '#000000').replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/* Build the render context from the deck.
   `chrome` = the color used for card fills / borders / hairlines. It follows
   the heading color, so light + dark themes both keep readable panels. */
export function ctxFrom(deck) {
  const pair = FONT_PAIRS[deck.brand.fontPair] || FONT_PAIRS['inter-roboto']
  return {
    primary: deck.brand.primary,
    secondary: deck.brand.secondary,
    heading: deck.brand.headingColor || '#FFFFFF',
    text: deck.brand.textColor || '#E9E9EF',
    chrome: deck.brand.headingColor || '#FFFFFF',
    fontHead: pair.head,
    fontBody: pair.body,
    asset: (k) => deck.assets?.[k] || '',
  }
}

/* Render *word* segments in the primary color */
export function Accent({ text, ctx }) {
  const parts = String(text ?? '').split(/\*([^*]+)\*/g)
  return parts.map((p, i) =>
    i % 2 ? <span key={i} style={{ color: ctx.primary }}>{p}</span> : <span key={i}>{p}</span>
  )
}

/* Image placeholder tile */
export function Img({ src, caption, ctx, icon: Icon = ImageIcon, className = '', rounded = 'rounded-2xl' }) {
  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}
         style={{ background: rgba(ctx.chrome, 0.05), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.28) }}>
          <Icon size={28} strokeWidth={1.4} />
        </div>
      )}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 text-[13px] font-medium"
             style={{ color: 'rgba(255,255,255,0.9)', background: 'linear-gradient(0deg, rgba(0,0,0,0.78), rgba(0,0,0,0))' }}>
          {caption}
        </div>
      )}
    </div>
  )
}

export function Kicker({ children, ctx }) {
  return (
    <span className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase"
          style={{ color: ctx.primary, letterSpacing: '0.22em', fontFamily: ctx.fontBody }}>
      <span style={{ width: 26, height: 2, background: ctx.primary, display: 'inline-block' }} />
      {children}
    </span>
  )
}

/* Shared shell: background (color / photo mix) + brand row + slide number + footer.
   Slide number + total are derived from the visible (non-hidden) slide order. */
function Shell({ deck, ctx, id, children, pad = 72 }) {
  const { asset } = ctx
  const bgImg = asset('bg_' + id)
  const bg = deck.backgrounds?.[id] || {}
  const styleMode = bg.style || (id === 'vision' ? 'split' : 'full')
  const blur = bg.blur ?? 6
  const overlay = bg.overlay ?? (styleMode === 'split' ? 35 : 65)
  const a = Math.min(1, Math.max(0, overlay / 100))
  const sec = ctx.secondary

  const hidden = deck.hidden || []
  const visible = SLIDES.filter((s) => !hidden.includes(s.id))
  const posIn = visible.findIndex((s) => s.id === id)
  const total = visible.length || 1
  const pad2 = (x) => String(x).padStart(2, '0')
  const numLabel = posIn >= 0 ? `${pad2(posIn + 1)} / ${pad2(total)}` : `— / ${pad2(total)}`

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
          {numLabel}
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

/* ======================= SLIDE — VISION ======================= */
function Vision({ deck, ctx }) {
  const v = deck.vision
  return (
    <Shell deck={deck} ctx={ctx} id="vision">
      <div className="relative h-full flex flex-col justify-center max-w-[980px]" style={{ zIndex: 2 }}>
        <Kicker ctx={ctx}>{v.kicker}</Kicker>
        <h1 className="mt-6 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 74, lineHeight: 1.03, letterSpacing: '-0.02em', color: ctx.heading }}>
          <Accent text={v.headline} ctx={ctx} />
        </h1>
        <p className="mt-7 max-w-[760px]" style={{ fontSize: 23, lineHeight: 1.5, color: rgba(ctx.text, 0.72) }}>
          {v.subtitle}
        </p>
      </div>
      <div className="absolute flex items-center gap-4" style={{ right: 72, bottom: 30, zIndex: 2 }}>
        <span className="text-[12px] uppercase tracking-[0.16em]" style={{ color: rgba(ctx.text, 0.45) }}>Prepared for</span>
        {ctx.asset('clientLogo')
          ? <img src={ctx.asset('clientLogo')} alt="" style={{ height: 30 }} className="object-contain" />
          : <span className="text-[18px] font-semibold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{deck.brand.clientName}</span>}
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — TEAM / WHO WE ARE ======================= */
function Team({ deck, ctx }) {
  const t = deck.team
  return (
    <Shell deck={deck} ctx={ctx} id="team">
      <div className="h-full grid grid-cols-[1.05fr_0.95fr] gap-11">
        {/* left: who we are + metrics */}
        <div className="flex flex-col">
          <Kicker ctx={ctx}>{t.kicker}</Kicker>
          <h2 className="mt-5 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={t.headline} ctx={ctx} />
          </h2>
          <p className="mt-4 text-[16px]" style={{ color: rgba(ctx.text, 0.68), lineHeight: 1.5 }}>{t.blurb}</p>
          <div className="mt-auto grid grid-cols-2 gap-3.5 pt-6">
            {(t.metrics || []).map((m, i) => (
              <div key={i} className="rounded-2xl px-5 py-4" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
                <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 34, lineHeight: 1, color: ctx.primary }}>{m.value}</div>
                <div className="mt-1.5 text-[12px] uppercase tracking-[0.12em]" style={{ color: rgba(ctx.text, 0.6) }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* right: creator cards */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          {(t.creators || []).slice(0, 4).map((c, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl" style={{ background: rgba(ctx.chrome, 0.05), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
              {ctx.asset(`creator${i + 1}`)
                ? <img src={ctx.asset(`creator${i + 1}`)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                : <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.28) }}><Sparkles size={24} strokeWidth={1.4} /></div>}
              <div className="absolute inset-x-0 bottom-0 px-3.5 py-2.5"
                   style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.82), rgba(0,0,0,0))' }}>
                <div className="text-[14px] font-bold text-white leading-tight">{c.name}</div>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.72)' }}>{c.handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — BLUEPRINT ======================= */
function MetricRow({ m, tone, ctx }) {
  const good = tone === 'target'
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
      <span className="text-[15px]" style={{ color: rgba(ctx.text, 0.65) }}>{m.label}</span>
      <span className="text-[22px] font-bold" style={{ fontFamily: ctx.fontHead, color: good ? ctx.primary : ctx.heading }}>{m.value}</span>
    </div>
  )
}
function Blueprint({ deck, ctx }) {
  const b = deck.blueprint
  return (
    <Shell deck={deck} ctx={ctx} id="blueprint">
      <Kicker ctx={ctx}>The Mini-Blueprint</Kicker>
      <p className="mt-4 max-w-[820px] text-[19px]" style={{ color: rgba(ctx.text, 0.75), lineHeight: 1.45 }}>
        <Accent text={b.intro} ctx={ctx} />
      </p>
      <div className="mt-7 grid grid-cols-2 gap-7" style={{ height: 384 }}>
        <div className="rounded-2xl p-6 flex flex-col" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} style={{ color: rgba(ctx.text, 0.5) }} />
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: rgba(ctx.text, 0.5) }}>Where you are now</span>
          </div>
          <div className="mb-4">{b.current.map((m, i) => <MetricRow key={i} m={m} tone="current" ctx={ctx} />)}</div>
          <Img src={ctx.asset('weakContent')} caption={b.weakCaption} ctx={ctx} className="flex-1 min-h-0" />
        </div>
        <div className="relative rounded-2xl p-6 flex flex-col" style={{ background: rgba(ctx.primary, 0.06), border: `1px solid ${rgba(ctx.primary, 0.35)}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: ctx.primary }} />
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: ctx.primary }}>Where the market is</span>
          </div>
          <div className="mb-4">{b.target.map((m, i) => <MetricRow key={i} m={m} tone="target" ctx={ctx} />)}</div>
          <Img src={ctx.asset('competitor')} caption={b.competitorCaption} ctx={ctx} className="flex-1 min-h-0" />
          <div className="absolute grid place-items-center rounded-full" style={{ left: -34, top: '46%', width: 44, height: 44, background: ctx.primary, boxShadow: `0 8px 24px ${rgba(ctx.primary, 0.5)}` }}>
            <ArrowRight size={22} color="#fff" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — STRATEGY ======================= */
function Strategy({ deck, ctx }) {
  const s = deck.strategy
  const keys = ['mood1', 'mood2', 'mood3', 'mood4']
  return (
    <Shell deck={deck} ctx={ctx} id="strategy">
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

/* ======================= SLIDE — VISION BOARD ======================= */
function VisionBoard({ deck, ctx }) {
  const vb = deck.visionBoard
  const keys = ['vb1', 'vb2', 'vb3', 'vb4', 'vb5', 'vb6']
  return (
    <Shell deck={deck} ctx={ctx} id="visionBoard">
      <div className="flex items-end justify-between gap-8">
        <div>
          <Kicker ctx={ctx}>{vb.kicker}</Kicker>
          <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={vb.headline} ctx={ctx} />
          </h2>
        </div>
        <p className="text-[15px] max-w-[360px] text-right pb-1" style={{ color: rgba(ctx.text, 0.6), lineHeight: 1.45 }}>{vb.intro}</p>
      </div>
      {/* collage */}
      <div className="mt-6 grid grid-cols-3 grid-rows-2 gap-3.5" style={{ height: 348 }}>
        {keys.map((k, i) => (
          <Img key={k} src={ctx.asset(k)} caption={vb.captions?.[i]} ctx={ctx} icon={Sparkles} rounded="rounded-xl" />
        ))}
      </div>
      {/* brand-fit callout */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl px-6 py-4" style={{ background: rgba(ctx.primary, 0.09), border: `1px solid ${rgba(ctx.primary, 0.4)}` }}>
        <span className="grid place-items-center rounded-full shrink-0 mt-0.5" style={{ width: 24, height: 24, background: ctx.primary }}>
          <Plus size={15} color="#fff" strokeWidth={2.5} />
        </span>
        <p className="text-[16px]" style={{ color: rgba(ctx.text, 0.92), lineHeight: 1.45 }}>{vb.brandFit}</p>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — CAMPAIGN IDEAS ======================= */
function CampaignIdeas({ deck, ctx }) {
  const ci = deck.campaignIdeas
  return (
    <Shell deck={deck} ctx={ctx} id="campaignIdeas">
      <Kicker ctx={ctx}>{ci.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 42, letterSpacing: '-0.015em', color: ctx.heading }}>
        <Accent text={ci.headline} ctx={ctx} />
      </h2>
      <p className="mt-2 text-[17px]" style={{ color: rgba(ctx.text, 0.6) }}>{ci.intro}</p>
      <div className="mt-6 grid grid-cols-3 gap-6" style={{ height: 372 }}>
        {(ci.ideas || []).slice(0, 3).map((idea, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <div className="relative" style={{ height: 150 }}>
              {ctx.asset(`ci${i + 1}`)
                ? <img src={ctx.asset(`ci${i + 1}`)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                : <div className="absolute inset-0 grid place-items-center" style={{ background: rgba(ctx.primary, 0.08), color: ctx.primary }}><Lightbulb size={26} strokeWidth={1.5} /></div>}
              <span className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                    style={{ background: rgba(ctx.secondary, 0.72), color: ctx.primary }}>{idea.format}</span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="text-[20px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{idea.title}</div>
              <p className="mt-2 text-[14px]" style={{ color: rgba(ctx.text, 0.66), lineHeight: 1.5 }}>{idea.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — CASE STUDIES ======================= */
function CaseStudies({ deck, ctx }) {
  const cs = deck.caseStudies
  return (
    <Shell deck={deck} ctx={ctx} id="caseStudies">
      <Kicker ctx={ctx}>The Proof</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Case Studies</h2>
      <p className="mt-2 text-[18px]" style={{ color: rgba(ctx.text, 0.6) }}>
        <Accent text={cs.intro} ctx={ctx} />
      </p>
      <div className="mt-6 grid grid-cols-2 gap-7" style={{ height: 356 }}>
        {cs.items.map((c, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <Img src={ctx.asset(`case${i + 1}Thumb`)} ctx={ctx} className="h-[170px]" rounded="" />
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

/* ======================= SLIDE — DELIVERABLES ======================= */
function Deliverables({ deck, ctx }) {
  const d = deck.deliverables
  return (
    <Shell deck={deck} ctx={ctx} id="deliverables">
      <Kicker ctx={ctx}>{d.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>The Deliverables</h2>
      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div className="space-y-3">
          {d.items.map((it, i) => (
            <div key={i} className="flex items-start gap-3.5 rounded-xl px-5 py-4"
                 style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
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

/* ======================= SLIDE — PROCESS ======================= */
function Process({ deck, ctx }) {
  const p = deck.process
  const cols = p.steps.length
  const tight = cols >= 5 // 5 columns → slightly smaller type so it stays clean
  return (
    <Shell deck={deck} ctx={ctx} id="process">
      <Kicker ctx={ctx}>{p.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>How We Work</h2>
      <div className="mt-14 relative">
        <div className="absolute" style={{ top: 26, left: 26, right: 26, height: 2, background: rgba(ctx.chrome, 0.14) }} />
        <div className={`grid relative ${tight ? 'gap-4' : 'gap-6'}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {p.steps.map((st, i) => (
            <div key={i}>
              <div className="grid place-items-center rounded-full text-[20px] font-bold"
                   style={{ width: 54, height: 54, background: ctx.primary, color: '#fff', fontFamily: ctx.fontHead, boxShadow: `0 8px 22px ${rgba(ctx.primary, 0.45)}` }}>
                {i + 1}
              </div>
              <div className="mt-6 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: tight ? 19 : 22, color: ctx.heading }}>{st.title}</div>
              <p className="mt-2.5" style={{ fontSize: tight ? 15 : 16, color: rgba(ctx.text, 0.65), lineHeight: 1.5 }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ======================= SLIDE — INVESTMENT ======================= */
function Investment({ deck, ctx }) {
  const iv = deck.investment
  return (
    <Shell deck={deck} ctx={ctx} id="investment">
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
             style={{ background: `linear-gradient(160deg, ${rgba(ctx.primary, 0.16)}, ${rgba(ctx.chrome, 0.03)})`, border: `1px solid ${rgba(ctx.primary, 0.35)}` }}>
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
  vision: Vision, team: Team, blueprint: Blueprint, strategy: Strategy,
  visionBoard: VisionBoard, campaignIdeas: CampaignIdeas, caseStudies: CaseStudies,
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
