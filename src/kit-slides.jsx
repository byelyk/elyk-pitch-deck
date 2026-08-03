import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { KIT_SLIDES } from './defaults'
import { rgba, ctxFrom, Accent, Kicker, Img } from './slides'
import {
  ExternalLink, Check, MapPin, Quote as QuoteIcon, Smartphone, MonitorPlay, Star, Mail,
} from 'lucide-react'

/* QR code (data URL image — survives PDF + PowerPoint export) */
function Qr({ value, size = 76 }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let ok = true
    if (value) {
      QRCode.toDataURL(value, { margin: 1, width: 240, color: { dark: '#000000', light: '#ffffff' } })
        .then((u) => ok && setSrc(u)).catch(() => ok && setSrc(''))
    } else setSrc('')
    return () => { ok = false }
  }, [value])
  if (!src) return null
  return (
    <span style={{ background: '#fff', padding: 5, borderRadius: 10, display: 'inline-block', lineHeight: 0 }}>
      <img src={src} alt="" width={size} height={size} style={{ display: 'block' }} />
    </span>
  )
}

function LinkChip({ item, ctx }) {
  return (
    <a href={item.url} target="_blank" rel="noopener"
       className="inline-flex items-center gap-1.5 text-[14px] font-medium rounded-full px-3.5 py-1.5"
       style={{ color: ctx.primary, background: rgba(ctx.primary, 0.1), border: `1px solid ${rgba(ctx.primary, 0.3)}` }}>
      {item.label} <ExternalLink size={12} />
    </a>
  )
}

/* Aspect-locked example tile (9:16 or 16:9).
   fit="width" fills its grid cell; fit="height" fills a fixed-height row
   (width derived) so tall 9:16 tiles never run into the footer. */
function Tile({ src, caption, stat, ctx, ratio = '9/16', vertical = true, fit = 'width' }) {
  const box = fit === 'height'
    ? { height: '100%', aspectRatio: ratio }
    : { width: '100%', aspectRatio: ratio }
  return (
    <div className="relative overflow-hidden rounded-xl"
         style={{ ...box, background: rgba(ctx.chrome, 0.05), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
      {src
        ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        : <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.28) }}>
            {vertical ? <Smartphone size={26} strokeWidth={1.4} /> : <MonitorPlay size={26} strokeWidth={1.4} />}
          </div>}
      {(caption || stat) && (
        <div className="absolute inset-x-0 bottom-0 px-3.5 py-2.5"
             style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.82), rgba(0,0,0,0))' }}>
          {caption && <div className="text-[13px] font-semibold text-white leading-tight">{caption}</div>}
          {stat && <div className="text-[11.5px] font-medium" style={{ color: rgba(ctx.primary, 1) }}>{stat}</div>}
        </div>
      )}
    </div>
  )
}

/* Shell — media-kit numbering + top bar */
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
  const visible = KIT_SLIDES.filter((s) => !hidden.includes(s.id))
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
           style={{ background: `radial-gradient(60% 55% at 82% 8%, ${rgba(ctx.primary, 0.16)} 0%, rgba(0,0,0,0) 60%)` }} />
      <div className="absolute left-0 right-0 flex items-center justify-between" style={{ top: 34, paddingLeft: pad, paddingRight: pad, zIndex: 2 }}>
        <div className="flex items-center gap-2.5">
          {asset('agencyLogo')
            ? <img src={asset('agencyLogo')} alt="" style={{ height: 26 }} className="object-contain" />
            : <span className="text-[15px] font-bold tracking-[0.16em] uppercase whitespace-nowrap" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{deck.brand.agencyName}</span>}
        </div>
        <span className="text-[12px] font-medium tracking-[0.18em] uppercase whitespace-nowrap" style={{ color: rgba(ctx.text, 0.45) }}>
          {deck.brand.clientName ? `${deck.brand.clientName} · Media Kit` : 'Media Kit'}
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
      <div className="h-full grid grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <Kicker ctx={ctx}>Media Kit</Kicker>
          <h1 className="mt-5 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 72, lineHeight: 0.98, letterSpacing: '-0.02em', color: ctx.heading }}>{c.name}</h1>
          <div className="mt-2 text-[20px] font-semibold" style={{ color: ctx.primary }}>{c.handle}</div>
          <p className="mt-5 text-[20px] max-w-[520px]" style={{ color: rgba(ctx.text, 0.72), lineHeight: 1.45 }}>
            <Accent text={c.tagline} ctx={ctx} />
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(c.niches || []).map((n, i) => (
              <span key={i} className="text-[13px] font-medium rounded-full px-3 py-1.5" style={{ background: rgba(ctx.chrome, 0.06), border: `1px solid ${rgba(ctx.chrome, 0.12)}`, color: rgba(ctx.text, 0.85) }}>{n}</span>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {(c.links || []).map((l, i) => <LinkChip key={i} item={l} ctx={ctx} />)}
            </div>
            {c.links?.[0]?.url && <Qr value={c.links[0].url} size={70} />}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: '3/4', background: rgba(ctx.chrome, 0.05), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
          {ctx.asset('kit_photo')
            ? <img src={ctx.asset('kit_photo')} alt="" className="absolute inset-0 h-full w-full object-cover" />
            : <div className="absolute inset-0 grid place-items-center" style={{ color: rgba(ctx.text, 0.28) }}><Star size={30} strokeWidth={1.4} /></div>}
        </div>
      </div>
    </Shell>
  )
}

/* ===================== NUMBERS ===================== */
function Numbers({ deck, ctx }) {
  const n = deck.numbers
  return (
    <Shell deck={deck} ctx={ctx} id="numbers">
      <Kicker ctx={ctx}>{n.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>The Numbers</h2>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {(n.platforms || []).map((p, i) => (
          <div key={i} className="rounded-2xl px-6 py-6" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: rgba(ctx.text, 0.55) }}>{p.platform}</div>
            <div className="mt-2 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 46, lineHeight: 1, color: ctx.heading }}>{p.followers}</div>
            <div className="mt-1 text-[13px]" style={{ color: rgba(ctx.text, 0.5) }}>followers</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-5">
        {(n.highlights || []).map((h, i) => (
          <div key={i} className="rounded-2xl px-6 py-5" style={{ background: rgba(ctx.primary, 0.08), border: `1px solid ${rgba(ctx.primary, 0.3)}` }}>
            <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 34, lineHeight: 1, color: ctx.primary }}>{h.value}</div>
            <div className="mt-1.5 text-[13px] uppercase tracking-[0.12em]" style={{ color: rgba(ctx.text, 0.6) }}>{h.label}</div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== AUDIENCE ===================== */
function Bar({ label, value, ctx }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[14px] mb-1.5">
        <span style={{ color: rgba(ctx.text, 0.8) }}>{label}</span>
        <span className="font-semibold" style={{ color: ctx.heading }}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: rgba(ctx.chrome, 0.1) }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ctx.primary }} />
      </div>
    </div>
  )
}
function Audience({ deck, ctx }) {
  const a = deck.audience
  return (
    <Shell deck={deck} ctx={ctx} id="audience">
      <Kicker ctx={ctx}>{a.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>The Audience</h2>
      <div className="mt-7 grid grid-cols-2 gap-10">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: rgba(ctx.text, 0.5) }}>Gender</div>
          {(a.gender || []).map((g, i) => <Bar key={i} label={g.label} value={g.value} ctx={ctx} />)}
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-2 mt-6" style={{ color: rgba(ctx.text, 0.5) }}>Age</div>
          <div className="flex gap-3">
            {(a.ages || []).map((ag, i) => (
              <div key={i} className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
                <div className="font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 22, color: ctx.primary }}>{ag.value}</div>
                <div className="text-[12px] mt-0.5" style={{ color: rgba(ctx.text, 0.6) }}>{ag.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: rgba(ctx.text, 0.5) }}>Top locations</div>
          <div className="space-y-2">
            {(a.locations || []).map((loc, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[16px]" style={{ color: rgba(ctx.text, 0.85) }}>
                <MapPin size={15} style={{ color: ctx.primary }} /> {loc}
              </div>
            ))}
          </div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-2.5 mt-6" style={{ color: rgba(ctx.text, 0.5) }}>Interests & niches</div>
          <div className="flex flex-wrap gap-2">
            {(a.interests || []).map((it, i) => (
              <span key={i} className="text-[13px] rounded-full px-3 py-1.5" style={{ background: rgba(ctx.primary, 0.1), border: `1px solid ${rgba(ctx.primary, 0.3)}`, color: rgba(ctx.text, 0.9) }}>{it}</span>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ===================== CONTENT STYLE ===================== */
function ContentStyle({ deck, ctx }) {
  const cs = deck.contentStyle
  return (
    <Shell deck={deck} ctx={ctx} id="contentStyle">
      <Kicker ctx={ctx}>{cs.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Content Style</h2>
      <p className="mt-2 text-[17px]" style={{ color: rgba(ctx.text, 0.6) }}>{cs.intro}</p>
      <div className="mt-6 grid grid-cols-3 gap-6" style={{ height: 360 }}>
        {(cs.types || []).slice(0, 3).map((t, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <Img src={ctx.asset(`cs${i + 1}`)} ctx={ctx} className="h-[170px]" rounded="" icon={Smartphone} />
            <div className="p-5 flex flex-col flex-1">
              <div className="text-[19px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{t.title}</div>
              <p className="mt-2 text-[14px]" style={{ color: rgba(ctx.text, 0.66), lineHeight: 1.5 }}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== SHORT-FORM (9:16) ===================== */
function ShortForm({ deck, ctx }) {
  const s = deck.shortForm
  return (
    <Shell deck={deck} ctx={ctx} id="shortForm">
      <div className="flex items-end justify-between gap-8">
        <div>
          <Kicker ctx={ctx}>{s.kicker}</Kicker>
          <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={s.headline} ctx={ctx} />
          </h2>
        </div>
        <p className="text-[15px] pb-1" style={{ color: rgba(ctx.text, 0.6) }}>{s.intro}</p>
      </div>
      <div className="mt-6 flex gap-4 justify-center items-stretch" style={{ height: 430 }}>
        {(s.items || []).slice(0, 4).map((it, i) => (
          <Tile key={i} src={ctx.asset(`sf${i + 1}`)} caption={it.caption} stat={it.stat} ctx={ctx} ratio="9/16" vertical fit="height" />
        ))}
      </div>
    </Shell>
  )
}

/* ===================== LONG-FORM (16:9) ===================== */
function LongForm({ deck, ctx }) {
  const l = deck.longForm
  return (
    <Shell deck={deck} ctx={ctx} id="longForm">
      <div className="flex items-end justify-between gap-8">
        <div>
          <Kicker ctx={ctx}>{l.kicker}</Kicker>
          <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, letterSpacing: '-0.015em', color: ctx.heading }}>
            <Accent text={l.headline} ctx={ctx} />
          </h2>
        </div>
        <p className="text-[15px] pb-1" style={{ color: rgba(ctx.text, 0.6) }}>{l.intro}</p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-6">
        {(l.items || []).slice(0, 3).map((it, i) => (
          <Tile key={i} src={ctx.asset(`lf${i + 1}`)} caption={it.title} stat={it.stat} ctx={ctx} ratio="16/9" vertical={false} />
        ))}
      </div>
    </Shell>
  )
}

/* ===================== BRAND PARTNERS ===================== */
function BrandPartners({ deck, ctx }) {
  const b = deck.brandPartners
  return (
    <Shell deck={deck} ctx={ctx} id="brandPartners">
      <Kicker ctx={ctx}>{b.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Brand Partners</h2>
      <p className="mt-2 text-[17px]" style={{ color: rgba(ctx.text, 0.6) }}>{b.intro}</p>
      <div className="mt-7 grid grid-cols-3 gap-5">
        {(b.names || []).slice(0, 6).map((name, i) => (
          <div key={i} className="grid place-items-center rounded-2xl" style={{ height: 128, background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            {ctx.asset(`bp${i + 1}`)
              ? <img src={ctx.asset(`bp${i + 1}`)} alt="" style={{ maxHeight: 52, maxWidth: '70%' }} className="object-contain" />
              : <span className="text-[22px] font-bold" style={{ fontFamily: ctx.fontHead, color: rgba(ctx.text, 0.8) }}>{name}</span>}
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== TESTIMONIALS ===================== */
function Testimonials({ deck, ctx }) {
  const t = deck.testimonials
  return (
    <Shell deck={deck} ctx={ctx} id="testimonials">
      <Kicker ctx={ctx}>{t.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>What Brands Say</h2>
      <div className="mt-7 grid grid-cols-2 gap-7">
        {(t.quotes || []).slice(0, 2).map((q, i) => (
          <div key={i} className="rounded-2xl p-8 flex flex-col" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <QuoteIcon size={30} style={{ color: ctx.primary }} />
            <p className="mt-4 text-[21px] font-medium" style={{ fontFamily: ctx.fontHead, color: ctx.heading, lineHeight: 1.4 }}>{q.quote}</p>
            <div className="mt-auto pt-6">
              <div className="text-[15px] font-semibold" style={{ color: ctx.heading }}>{q.author}</div>
              <div className="text-[13px]" style={{ color: rgba(ctx.text, 0.55) }}>{q.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== MADE FOR YOU ===================== */
function MadeFor({ deck, ctx }) {
  const m = deck.madeFor
  return (
    <Shell deck={deck} ctx={ctx} id="madeFor">
      <Kicker ctx={ctx}>{m.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, letterSpacing: '-0.015em', color: ctx.heading }}>
        <Accent text={m.headline} ctx={ctx} />
      </h2>
      <p className="mt-2 text-[16px]" style={{ color: rgba(ctx.text, 0.6) }}>{m.intro}</p>
      <div className="mt-6 grid grid-cols-[1.5fr_1fr] gap-8">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: rgba(ctx.text, 0.5) }}>{m.shortLabel}</div>
          <div className="flex gap-3.5 items-stretch" style={{ height: 336 }}>
            {[0, 1, 2].map((i) => (
              <Tile key={i} src={ctx.asset(`mf_s${i + 1}`)} caption={m.shortCaptions?.[i]} ctx={ctx} ratio="9/16" vertical fit="height" />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: rgba(ctx.text, 0.5) }}>{m.longLabel}</div>
          <Tile src={ctx.asset('mf_l1')} ctx={ctx} ratio="16/9" vertical={false} />
          <p className="mt-3 text-[15px]" style={{ color: rgba(ctx.text, 0.7), lineHeight: 1.5 }}>{m.longCaption}</p>
        </div>
      </div>
    </Shell>
  )
}

/* ===================== COLLAB MENU ===================== */
function CollabMenu({ deck, ctx }) {
  const c = deck.collabMenu
  return (
    <Shell deck={deck} ctx={ctx} id="collabMenu">
      <Kicker ctx={ctx}>{c.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Ways to Work Together</h2>
      <p className="mt-2 text-[17px]" style={{ color: rgba(ctx.text, 0.6) }}>{c.intro}</p>
      <div className="mt-6 grid grid-cols-2 gap-5">
        {(c.items || []).map((it, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl px-6 py-5" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
            <span className="grid place-items-center rounded-full shrink-0 text-[15px] font-bold" style={{ width: 34, height: 34, background: rgba(ctx.primary, 0.15), color: ctx.primary, fontFamily: ctx.fontHead }}>{i + 1}</span>
            <div>
              <div className="text-[19px] font-bold" style={{ fontFamily: ctx.fontHead, color: ctx.heading }}>{it.title}</div>
              <p className="mt-1 text-[15px]" style={{ color: rgba(ctx.text, 0.66), lineHeight: 1.45 }}>{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== RATES ===================== */
function Rates({ deck, ctx }) {
  const r = deck.rates
  return (
    <Shell deck={deck} ctx={ctx} id="rates">
      <Kicker ctx={ctx}>{r.kicker}</Kicker>
      <h2 className="mt-4 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 44, letterSpacing: '-0.015em', color: ctx.heading }}>Rates & Packages</h2>
      <p className="mt-2 text-[16px]" style={{ color: rgba(ctx.text, 0.6) }}>{r.intro}</p>
      <div className="mt-6 grid grid-cols-3 gap-6">
        {(r.packages || []).slice(0, 3).map((p, i) => (
          <div key={i} className="rounded-2xl p-6 flex flex-col" style={{ background: i === 2 ? rgba(ctx.primary, 0.08) : rgba(ctx.chrome, 0.04), border: `1px solid ${i === 2 ? rgba(ctx.primary, 0.35) : rgba(ctx.chrome, 0.1)}` }}>
            <div className="text-[14px] font-semibold uppercase tracking-[0.14em]" style={{ color: rgba(ctx.text, 0.6) }}>{p.name}</div>
            <div className="mt-2 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 40, lineHeight: 1, color: i === 2 ? ctx.primary : ctx.heading }}>{p.price}</div>
            <div className="mt-5 space-y-2.5">
              {(p.includes || []).map((it, j) => (
                <div key={j} className="flex items-start gap-2.5 text-[14.5px]" style={{ color: rgba(ctx.text, 0.85) }}>
                  <Check size={16} style={{ color: ctx.primary, marginTop: 2 }} strokeWidth={2.5} /> {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* ===================== CONTACT & PR ===================== */
function Contact({ deck, ctx }) {
  const c = deck.contact
  return (
    <Shell deck={deck} ctx={ctx} id="contact">
      <div className="h-full grid grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <Kicker ctx={ctx}>{c.kicker}</Kicker>
          <h2 className="mt-5 font-bold" style={{ fontFamily: ctx.fontHead, fontSize: 52, letterSpacing: '-0.02em', color: ctx.heading }}>Let’s create<br />something.</h2>
          <a href={`mailto:${c.email}`} className="mt-6 inline-flex items-center gap-2.5 text-[22px] font-semibold" style={{ color: ctx.primary }}>
            <Mail size={20} /> {c.email}
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {(c.links || []).map((l, i) => <LinkChip key={i} item={l} ctx={ctx} />)}
          </div>
        </div>
        <div className="rounded-3xl p-8" style={{ background: rgba(ctx.chrome, 0.04), border: `1px solid ${rgba(ctx.chrome, 0.1)}` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: ctx.primary }}>PR & Product Sends</div>
              <div className="mt-4 text-[18px] font-semibold" style={{ color: ctx.heading }}>{c.shipName}</div>
              <div className="mt-1 text-[16px]" style={{ color: rgba(ctx.text, 0.8), lineHeight: 1.5 }}>{c.shipAddress}</div>
            </div>
            {c.links?.[0]?.url && <Qr value={c.links[0].url} size={72} />}
          </div>
          <p className="mt-5 text-[14px]" style={{ color: rgba(ctx.text, 0.6), lineHeight: 1.5 }}>{c.note}</p>
        </div>
      </div>
    </Shell>
  )
}

const KMAP = {
  cover: Cover, numbers: Numbers, audience: Audience, contentStyle: ContentStyle,
  shortForm: ShortForm, longForm: LongForm, brandPartners: BrandPartners,
  testimonials: Testimonials, madeFor: MadeFor, collabMenu: CollabMenu, rates: Rates, contact: Contact,
}

export function KitSlide({ id, deck }) {
  const ctx = ctxFrom(deck)
  const Comp = KMAP[id] || Cover
  return (
    <div className="slide-surface">
      <Comp deck={deck} ctx={ctx} />
    </div>
  )
}
