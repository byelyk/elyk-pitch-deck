import { BRIEF_SLIDES } from './defaults'
import { rgba, ctxFrom, Accent, Kicker, Img } from './slides'
import { Check, ImageIcon, ArrowRight } from 'lucide-react'

/* Shell — brief numbering + top bar */
function Shell({ deck, ctx, id, children, pad = 72 }) {
  const { asset } = ctx
  const bgImg = asset('bg_' + id)
  const bg = deck.backgrounds?.[id] || {}
  const styleMode = bg.style || (id === 'cover' ? 'split' : 'full')
  const blur = bg.blur ?? 6
  const overlay = bg.overlay ?? (styleMode === 'split' ? 35 : 65)
  const a = Math.min(1, Math.max(0, overlay / 100))
  const sec = ctx.secondary

  const hidden = deck.hidden || []
  const visible = BRIEF_SLIDES.filter((s) => !hidden.includes(s.id))
  const posIn = visible.findIndex((s) => s.id === id)
  const total = visible.length || 1
  const pad2 = (x) => String(x).padStart(2, '0')
  const numLabel = posIn >= 0 ? `${pad2(posIn + 1)} / ${pad2(total)}` : `— / ${pad2(total)}`

  return (
    <div className="absolute inset-0" style={{ background: sec, color: ctx.text, fontFamily: ctx.fontBody }}>
      {bgImg && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={bgImg} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: `blur(${blur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0" style={{
            background: styleMode === 'split'
              ? `linear-gradient(90deg, ${sec} 0%, ${rgba(sec, 0.96)} 30%, ${rgba(sec, Math.max(a, 0.12))} 68%, ${rgba(sec, Math.max(a - 0.12, 0))} 100%)`
              : rgba(sec, a),
          }} />
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: `radial-gradient(60% 55% at 82% 8%, ${rgba(ctx.primary, 0.14)} 0%, rgba(0,0,0,0) 60%)` }} />
      <div className="absolute left-0 right-0 flex items-center justify-between" style={{ top: 34, paddingLeft: pad, paddingRight: pad, zIndex: 2 }}>
        <div className="flex items-center gap-2.5">
          {asset('agencyLogo')
            ? <img src={asset('agencyLogo')} alt="" style={{ height: 26 }} className="object-contain" />
            : <span className="text-[15px] font-bold tracking-[0.16em] uppercase whitespace-nowrap" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{deck.brand.agencyName}</span>}
        </div>
        <span className="text-[12px] font-medium tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: rgba(ctx.text, 0.45) }}>
          {deck.brand.clientName} · Creative Brief
        </span>
      </div>
      <div className="absolute inset-0" style={{ padding: pad, paddingTop: 104 }}>{children}</div>
      <div className="absolute" style={{ left: pad, bottom: 30 }}>
        <span className="text-[12px] font-medium tracking-[0.16em]" style={{ color: rgba(ctx.text, 0.4) }}>{numLabel}</span>
      </div>
      {id !== 'cover' && deck.brand.footer && (
        <div className="absolute" style={{ right: pad, bottom: 30 }}>
          <span className="text-[12px] font-medium tracking-[0.1em] whitespace-nowrap" style={{ color: rgba(ctx.text, 0.4) }}>{deck.brand.footer}</span>
        </div>
      )}
    </div>
  )
}

/* ===================== COVER ===================== */
function Cover({ deck, ctx }) {
  const c = deck.cover
  return (
    <Shell deck={deck} ctx={ctx} id="cover">
      <div className="h-full grid grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div style={{ zIndex: 2 }}>
          <Kicker ctx={ctx}>{c.kicker}</Kicker>
          <h1 className="mt-5 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 88, lineHeight: 0.98, letterSpacing: '-0.02em', color: ctx.heading }}>{c.title}</h1>
          <p className="mt-6 max-w-[520px]" style={{ fontSize: 20, lineHeight: 1.5, color: rgba(ctx.text, 0.75) }}>
            <Accent text={c.subtitle} ctx={ctx} />
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {(c.chips || []).map((ch, i) => (
              <span key={i} className="text-[13px] font-semibold rounded-full px-3.5 py-2"
                    style={{ background: rgba(ctx.primary, 0.12), border: `1px solid ${rgba(ctx.primary, 0.35)}`, color: ctx.primary }}>{ch}</span>
            ))}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-3xl" style={{ height: 420, background: rgba(ctx.chrome, 0.05), border: `1px solid ${rgba(ctx.chrome, 0.12)}` }}>
          {ctx.asset('brief_cover')
            ? <img src={ctx.asset('brief_cover')} alt="" className="absolute inset-0 h-full w-full object-cover" />
            : <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.3) }}>
                <div className="text-center"><ImageIcon size={30} strokeWidth={1.4} className="mx-auto" />
                <div className="mt-2 text-[12px]">Series cover art / thumbnail</div></div>
              </div>}
        </div>
      </div>
    </Shell>
  )
}

/* ===================== CONCEPT ===================== */
function Concept({ deck, ctx }) {
  const cc = deck.concept
  return (
    <Shell deck={deck} ctx={ctx} id="concept">
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-10">
        <div>
          <Kicker ctx={ctx}>{cc.kicker}</Kicker>
          <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 34, lineHeight: 1.12, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={cc.headline} ctx={ctx} />
          </h2>
          <p className="mt-4 text-[15.5px]" style={{ color: rgba(ctx.text, 0.72), lineHeight: 1.55 }}>{cc.body}</p>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2.5" style={{ color: rgba(ctx.text, 0.5) }}>{cc.thumbsLabel}</div>
          <div className="space-y-3">
            <Img src={ctx.asset('ct1')} ctx={ctx} className="h-[128px]" rounded="rounded-xl" />
            <Img src={ctx.asset('ct2')} ctx={ctx} className="h-[128px]" rounded="rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-5">
        {(cc.points || []).slice(0, 3).map((p, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <div className="text-[16px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.primary }}>{p.title}</div>
            <p className="mt-1.5 text-[13.5px]" style={{ color: rgba(ctx.text, 0.7), lineHeight: 1.45 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== FORMAT ===================== */
function Format({ deck, ctx }) {
  const f = deck.format
  return (
    <Shell deck={deck} ctx={ctx} id="format">
      <Kicker ctx={ctx}>{f.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 38, letterSpacing: '-0.015em', color: ctx.heading }}>
        <Accent text={f.headline} ctx={ctx} />
      </h2>
      <div className="mt-6 grid grid-cols-3 gap-5">
        {(f.steps || []).slice(0, 6).map((st, i) => (
          <div key={i} className="rounded-2xl px-5 py-4" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center rounded-full text-[13px] font-bold shrink-0"
                    style={{ width: 28, height: 28, background: ctx.primary, color: '#fff', fontFamily: ctx.fontHead }}>{i + 1}</span>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                    style={{ background: rgba(ctx.primary, 0.12), color: ctx.primary }}>{st.tag}</span>
            </div>
            <div className="mt-3 text-[17px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{st.title}</div>
            <p className="mt-1.5 text-[13px]" style={{ color: rgba(ctx.text, 0.68), lineHeight: 1.45 }}>{st.desc}</p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== INTEGRATION ===================== */
function Integration({ deck, ctx }) {
  const g = deck.integration
  return (
    <Shell deck={deck} ctx={ctx} id="integration">
      <Kicker ctx={ctx}>{g.kicker}</Kicker>
      <h2 className="mt-3 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 34, letterSpacing: '-0.015em', color: ctx.heading }}>
        <Accent text={g.headline} ctx={ctx} />
      </h2>
      <div className="mt-5 grid grid-cols-[1.05fr_0.95fr] gap-9">
        <div className="space-y-2.5">
          {(g.placements || []).slice(0, 6).map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-2.5"
                 style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
              <span className="grid place-items-center rounded-full shrink-0" style={{ width: 22, height: 22, background: rgba(ctx.primary, 0.15), color: ctx.primary, marginTop: 1 }}>
                <Check size={13} strokeWidth={2.5} />
              </span>
              <span className="text-[14px]" style={{ color: rgba(ctx.text, 0.88), lineHeight: 1.4 }}>{p}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2.5" style={{ color: rgba(ctx.text, 0.5) }}>{g.mocksLabel}</div>
          <div className="space-y-3">
            <Img src={ctx.asset('im1')} ctx={ctx} className="h-[122px]" rounded="rounded-xl" />
            <Img src={ctx.asset('im2')} ctx={ctx} className="h-[122px]" rounded="rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl px-6 py-3.5" style={{ background: rgba(ctx.primary, 0.09), border: `1px solid ${rgba(ctx.primary, 0.4)}` }}>
        <p className="text-[13.5px]" style={{ color: rgba(ctx.text, 0.9), lineHeight: 1.45 }}>{g.callout}</p>
      </div>
    </Shell>
  )
}

/* ===================== DISTRIBUTION ===================== */
function Distribution({ deck, ctx }) {
  const d = deck.distribution
  return (
    <Shell deck={deck} ctx={ctx} id="distribution">
      <Kicker ctx={ctx}>{d.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, letterSpacing: '-0.015em', color: ctx.heading }}>
        <Accent text={d.headline} ctx={ctx} />
      </h2>
      <div className="mt-8 grid grid-cols-4 gap-5">
        {(d.tiles || []).slice(0, 4).map((t, i) => (
          <div key={i} className="rounded-2xl px-6 py-7" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 42, lineHeight: 1, color: ctx.primary }}>{t.value}</div>
            <div className="mt-2.5 text-[12.5px] uppercase tracking-[0.1em]" style={{ color: rgba(ctx.text, 0.6) }}>{t.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-[900px] text-[17px]" style={{ color: rgba(ctx.text, 0.75), lineHeight: 1.6 }}>{d.blurb}</p>
    </Shell>
  )
}


/* ===================== TIMELINE ===================== */
function Timeline({ deck, ctx }) {
  const t = deck.timeline || {}
  const ms = (t.milestones || []).slice(0, 6)
  return (
    <Shell deck={deck} ctx={ctx} id="timeline">
      <div className="flex items-end justify-between gap-8">
        <div>
          <Kicker ctx={ctx}>{t.kicker}</Kicker>
          <h2 className="mt-3 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 36, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={t.headline} ctx={ctx} />
          </h2>
        </div>
        {t.intro && <p className="text-[13.5px] max-w-[320px] text-right pb-1.5" style={{ color: rgba(ctx.text, 0.6), lineHeight: 1.45 }}>{t.intro}</p>}
      </div>
      <div className="mt-6 relative">
        <div className="absolute" style={{ left: 9, top: 10, bottom: 10, width: 2, background: rgba(ctx.chrome, 0.14) }} />
        <div className="space-y-2">
          {ms.map((m, i) => {
            const hi = !!m.highlight
            return (
              <div key={i} className="relative flex items-start gap-4" style={{ paddingLeft: 34 }}>
                <span className="absolute rounded-full" style={{
                  left: 3, top: 12, width: 14, height: 14,
                  background: hi ? ctx.primary : rgba(ctx.chrome, 0.25),
                  boxShadow: hi ? `0 0 0 4px ${rgba(ctx.primary, 0.2)}` : 'none',
                }} />
                <div className="flex-1 rounded-xl px-5 py-2.5" style={{
                  background: hi ? rgba(ctx.primary, 0.1) : rgba(ctx.chrome, 0.035),
                  border: `1px solid ${hi ? rgba(ctx.primary, 0.4) : rgba(ctx.chrome, 0.09)}`,
                }}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] whitespace-nowrap" style={{ color: hi ? ctx.primary : rgba(ctx.text, 0.5), minWidth: 118 }}>{m.date}</span>
                    <span className="text-[16px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{m.title}</span>
                  </div>
                  <p className="mt-0.5 text-[13px]" style={{ color: rgba(ctx.text, 0.65), lineHeight: 1.4, paddingLeft: 130 }}>{m.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}

/* ===================== NUMBERS =====================
   Split layout: PROVEN (real track record, solid treatment) on the left vs
   PROJECTED (forecast, outlined + labelled as estimates) on the right — so a
   finance reader can instantly tell fact from forecast. */
function Numbers({ deck, ctx }) {
  const n = deck.numbers
  const receipts = (n.receipts || []).slice(0, 3)
  const projections = (n.projections || []).slice(0, 4)
  return (
    <Shell deck={deck} ctx={ctx} id="numbers">
      <div className="flex items-end justify-between gap-8">
        <div>
          <Kicker ctx={ctx}>{n.kicker}</Kicker>
          <h2 className="mt-3 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 36, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={n.headline} ctx={ctx} />
          </h2>
        </div>
        <p className="text-[14px] max-w-[330px] text-right pb-1.5" style={{ color: rgba(ctx.text, 0.6), lineHeight: 1.45 }}>{n.intro}</p>
      </div>

      <div className="mt-6 grid grid-cols-[0.85fr_1.15fr] gap-6" style={{ height: 300 }}>
        {/* ---- PROVEN ---- */}
        <div className="rounded-2xl px-6 py-5 flex flex-col"
             style={{ background: rgba(ctx.primary, 0.1), border: `1px solid ${rgba(ctx.primary, 0.4)}` }}>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center rounded-full" style={{ width: 18, height: 18, background: ctx.primary }}>
              <Check size={11} color="#fff" strokeWidth={3} />
            </span>
            <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: ctx.primary }}>Proven</span>
          </div>
          <div className="mt-1 text-[12px]" style={{ color: rgba(ctx.text, 0.55) }}>What we've already built</div>
          <div className="mt-5 flex-1 flex flex-col justify-between pb-1">
            {receipts.map((r, i) => (
              <div key={i} style={i > 0 ? { borderTop: `1px solid ${rgba(ctx.primary, 0.22)}`, paddingTop: 13 } : {}}>
                <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 34, lineHeight: 1, color: ctx.heading }}>{r.value}</div>
                <div className="mt-1 text-[11.5px] uppercase tracking-[0.1em]" style={{ color: rgba(ctx.text, 0.6) }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ---- PROJECTED ---- */}
        <div className="rounded-2xl px-6 py-5 flex flex-col"
             style={{ background: rgba(ctx.chrome, 0.03), border: `1px dashed ${rgba(ctx.chrome, 0.28)}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: rgba(ctx.text, 0.7) }}>Projected · Season 1</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                  style={{ background: rgba(ctx.chrome, 0.08), color: rgba(ctx.text, 0.5) }}>Estimates</span>
          </div>
          <div className="mt-5 flex-1 grid grid-cols-2 gap-x-6 gap-y-5 content-center">
            {projections.map((p, i) => (
              <div key={i}>
                <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 38, lineHeight: 1, color: ctx.primary }}>{p.value}</div>
                <div className="mt-1.5 text-[11.5px] uppercase tracking-[0.09em]" style={{ color: rgba(ctx.text, 0.62) }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl px-6 py-4" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.primary, 0.4)}` }}>
        <p className="text-[14.5px]" style={{ color: rgba(ctx.text, 0.88), lineHeight: 1.5 }}>{n.callout}</p>
      </div>
    </Shell>
  )
}

/* ===================== INVESTMENT ===================== */
function Investment({ deck, ctx }) {
  const iv = deck.investment
  const tiers = iv.tiers || []

  if (tiers.length) {
    return (
      <Shell deck={deck} ctx={ctx} id="investment">
        <Kicker ctx={ctx}>{iv.kicker}</Kicker>
        <h2 className="mt-3 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 36, letterSpacing: '-0.015em', color: ctx.heading }}>
          <Accent text={iv.headline || 'The Investment'} ctx={ctx} />
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-5" style={{ height: 372 }}>
          {tiers.slice(0, 3).map((t, i) => {
            const rec = !!t.recommended
            return (
              <div key={i} className="relative rounded-2xl px-6 pt-6 pb-5 flex flex-col"
                   style={{ background: rec ? rgba(ctx.primary, 0.1) : rgba(ctx.chrome, 0.04),
                            border: `1px solid ${rec ? rgba(ctx.primary, 0.5) : rgba(ctx.chrome, 0.1)}` }}>
                {rec && (
                  <span className="absolute -top-2.5 left-6 text-[10.5px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: ctx.primary, color: '#fff' }}>Recommended</span>
                )}
                <div className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: rec ? ctx.primary : rgba(ctx.text, 0.6) }}>{t.name}</div>
                {t.listValue && <div className="mt-2 text-[14px] line-through" style={{ color: rgba(ctx.text, 0.4) }}>{t.listValue}</div>}
                <div className="mt-1 flex items-end gap-1.5">
                  <span className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 36, lineHeight: 1, color: ctx.heading }}>{t.price}</span>
                  {t.cadence && <span className="text-[13px] mb-1" style={{ color: rgba(ctx.text, 0.5) }}>{t.cadence}</span>}
                </div>
                {t.save && (
                  <span className="mt-2.5 self-start text-[11.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: rgba(ctx.primary, 0.15), color: ctx.primary }}>{t.save}</span>
                )}
                <div className="mt-3.5 pt-3.5 space-y-1.5" style={{ borderTop: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
                  {(t.features || []).slice(0, 7).map((f, j) => (
                    <div key={j} className="flex items-start gap-2" style={{ fontSize: 12.5, lineHeight: 1.32, color: rgba(ctx.text, 0.85) }}>
                      <Check size={13} strokeWidth={2.5} style={{ color: ctx.primary, marginTop: 2, flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {iv.cta && (
          <div className="mt-4 pt-3.5 text-center" style={{ borderTop: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <p className="text-[15px] font-medium mx-auto max-w-[1000px]" style={{ color: rgba(ctx.text, 0.85), lineHeight: 1.4 }}>
              <Accent text={iv.cta} ctx={ctx} />
            </p>
          </div>
        )}
      </Shell>
    )
  }

  return (
    <Shell deck={deck} ctx={ctx} id="investment">
      <div className="h-full grid grid-cols-[1fr_1fr] gap-12">
        <div className="flex flex-col justify-center">
          <Kicker ctx={ctx}>{iv.kicker}</Kicker>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.02em', color: ctx.heading }}>{iv.price}</span>
            <span className="text-[20px] mb-2" style={{ color: rgba(ctx.text, 0.58) }}>{iv.cadence}</span>
          </div>
          <div className="mt-6 space-y-2.5">
            {(iv.includes || []).map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check size={17} style={{ color: ctx.primary }} strokeWidth={2.5} />
                <span className="text-[15.5px]" style={{ color: rgba(ctx.text, 0.9) }}>{it}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-3xl p-9"
             style={{ background: `linear-gradient(160deg, ${rgba(ctx.primary, 0.14)}, ${rgba(ctx.chrome, 0.03)})`, border: `1px solid ${rgba(ctx.primary, 0.35)}` }}>
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: ctx.primary }}>Next Steps</span>
          <p className="mt-4 font-semibold" style={{ fontFamily: ctx.fontHead, fontSize: 25, lineHeight: 1.34, color: ctx.heading }}>
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

const BMAP = {
  cover: Cover, concept: Concept, format: Format, integration: Integration,
  distribution: Distribution, timeline: Timeline, numbers: Numbers, investment: Investment,
}

export function BriefSlide({ id, deck }) {
  const ctx = ctxFrom(deck)
  const Comp = BMAP[id] || Cover
  return (
    <div className="slide-surface">
      <Comp deck={deck} ctx={ctx} />
    </div>
  )
}
