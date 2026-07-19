import { FONT_PAIRS, THEMES } from './defaults'
import { Group, Field, Area, ColorField, ImageDrop, ListEditor, MetricEditor, LinkEditor, Toggle, Slider } from './ui'

function BgControls({ deck, onChange, slideId }) {
  const bg = deck.backgrounds?.[slideId] || {}
  const styleMode = bg.style || (slideId === 'cover' ? 'split' : 'full')
  const img = deck.assets[`bg_${slideId}`]
  const setBg = (k, v) => onChange({ ...deck, backgrounds: { ...(deck.backgrounds || {}), [slideId]: { ...bg, [k]: v } } })
  const setImg = (v) => onChange({ ...deck, assets: { ...deck.assets, [`bg_${slideId}`]: v } })
  return (
    <Group title="Slide background photo">
      <ImageDrop label="Background photo (optional)" value={img} onChange={setImg} />
      {img && (
        <>
          <div>
            <span className="block text-[12px] text-neutral-400 mb-1.5">Blend style</span>
            <div className="grid grid-cols-2 gap-2">
              {[['split', 'Split — color fades into photo'], ['full', 'Full — photo behind everything']].map(([key, label]) => (
                <button key={key} onClick={() => setBg('style', key)} className="rounded-lg px-3 py-2 text-[12px] text-left border transition"
                        style={{ background: styleMode === key ? '#26262c' : '#171719', borderColor: styleMode === key ? '#55555f' : '#2a2a31', color: styleMode === key ? '#fff' : '#9a9aa4' }}>{label}</button>
              ))}
            </div>
          </div>
          <Slider label="Photo blur" value={bg.blur ?? 6} onChange={(v) => setBg('blur', v)} min={0} max={24} suffix="px" />
          <Slider label="Color overlay" value={bg.overlay ?? (styleMode === 'split' ? 35 : 65)} onChange={(v) => setBg('overlay', v)} min={0} max={100} suffix="%" />
        </>
      )}
    </Group>
  )
}

function IncludeToggle({ deck, onChange, slideId }) {
  const hidden = deck.hidden || []
  const included = !hidden.includes(slideId)
  const toggle = (on) => onChange({ ...deck, hidden: on ? hidden.filter((x) => x !== slideId) : [...hidden, slideId] })
  return <div className="mb-4"><Toggle label={included ? 'Included in this kit' : 'Hidden from this kit'} checked={included} onChange={toggle} /></div>
}

/* platforms: [{platform, followers}] */
function PlatformEditor({ items, onChange }) {
  const upd = (i, k, v) => onChange(items.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)))
  const rm = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, { platform: '', followers: '' }])
  return (
    <div>
      <span className="block text-[12px] text-neutral-400 mb-1.5">Platforms & followers</span>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it.platform} placeholder="Platform" onChange={(e) => upd(i, 'platform', e.target.value)} className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-600" />
            <input value={it.followers} placeholder="620K" onChange={(e) => upd(i, 'followers', e.target.value)} className="w-24 rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-sm font-semibold text-neutral-100 outline-none focus:border-neutral-600" />
            <button onClick={() => rm(i)} className="text-neutral-500 hover:text-red-400 text-xs px-1">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-2 text-xs px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200">+ Add platform</button>
    </div>
  )
}

export default function KitControls({ deck, onChange, slideId }) {
  const brand = (key, val) => onChange({ ...deck, brand: { ...deck.brand, [key]: val } })
  const asset = (key, val) => onChange({ ...deck, assets: { ...deck.assets, [key]: val } })
  const field = (section, key, val) => onChange({ ...deck, [section]: { ...deck[section], [key]: val } })
  const applyTheme = (t) => onChange({ ...deck, brand: { ...deck.brand, primary: t.primary, secondary: t.secondary, headingColor: t.heading, textColor: t.text } })

  return (
    <div>
      <Group title="Creator & Brand">
        <Field label="Your name / handle (top-left mark)" value={deck.brand.agencyName} onChange={(v) => brand('agencyName', v)} />
        <Field label="Sending to — brand name" value={deck.brand.clientName} onChange={(v) => brand('clientName', v)} />
        <Field label="Footer line (site · socials)" value={deck.brand.footer} onChange={(v) => brand('footer', v)} />
        <div className="grid grid-cols-2 gap-3">
          <ImageDrop label="Your logo" value={deck.assets.agencyLogo} onChange={(v) => asset('agencyLogo', v)} aspect="3/1" />
          <ImageDrop label="Brand logo" value={deck.assets.clientLogo} onChange={(v) => asset('clientLogo', v)} aspect="3/1" />
        </div>
      </Group>

      <Group title="Theme presets">
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const active = deck.brand.primary.toLowerCase() === t.primary.toLowerCase() && deck.brand.secondary.toLowerCase() === t.secondary.toLowerCase()
            return (
              <button key={t.name} onClick={() => applyTheme(t)} className="flex items-center gap-2 rounded-lg px-2.5 py-2 border transition"
                      style={{ background: active ? '#26262c' : '#171719', borderColor: active ? '#55555f' : '#2a2a31' }}>
                <span className="flex -space-x-1">
                  <span className="h-4 w-4 rounded-full border border-black/30" style={{ background: t.secondary }} />
                  <span className="h-4 w-4 rounded-full border border-black/30" style={{ background: t.primary }} />
                </span>
                <span className="text-[12px]" style={{ color: active ? '#fff' : '#b6b6c0' }}>{t.name}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Colors">
        <ColorField label="Primary (accent)" value={deck.brand.primary} onChange={(v) => brand('primary', v)} />
        <ColorField label="Background" value={deck.brand.secondary} onChange={(v) => brand('secondary', v)} />
        <ColorField label="Heading text" value={deck.brand.headingColor || '#FFFFFF'} onChange={(v) => brand('headingColor', v)} />
        <ColorField label="Body text" value={deck.brand.textColor || '#E9E9EF'} onChange={(v) => brand('textColor', v)} />
      </Group>

      <Group title="Typography">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(FONT_PAIRS).map(([key, p]) => (
            <button key={key} onClick={() => brand('fontPair', key)} className="rounded-lg px-3 py-2 text-[13px] text-left border transition truncate"
                    style={{ fontFamily: p.head, background: deck.brand.fontPair === key ? '#26262c' : '#171719', borderColor: deck.brand.fontPair === key ? '#55555f' : '#2a2a31', color: deck.brand.fontPair === key ? '#fff' : '#b6b6c0' }}>{p.label}</button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">Wrap words in *asterisks* to highlight them in your primary color.</p>
      </Group>

      <div className="my-5 border-t border-neutral-800" />

      {slideId === 'cover' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="cover" />
          <Group title="Slide · Cover">
            <ImageDrop label="Your photo (portrait)" value={deck.assets.kit_photo} onChange={(v) => asset('kit_photo', v)} aspect="3/4" />
            <Field label="Name" value={deck.cover.name} onChange={(v) => field('cover', 'name', v)} />
            <Field label="Handle" value={deck.cover.handle} onChange={(v) => field('cover', 'handle', v)} />
            <Area label="Tagline" rows={2} value={deck.cover.tagline} onChange={(v) => field('cover', 'tagline', v)} />
            <ListEditor label="Niche tags" items={deck.cover.niches} onChange={(v) => field('cover', 'niches', v)} placeholder="Beauty" />
            <LinkEditor label="Social links (clickable + QR)" items={deck.cover.links} onChange={(v) => field('cover', 'links', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="cover" />
        </>
      )}

      {slideId === 'numbers' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="numbers" />
          <Group title="Slide · The Numbers">
            <PlatformEditor items={deck.numbers.platforms} onChange={(v) => field('numbers', 'platforms', v)} />
            <MetricEditor label="Highlights (reach, avg views, engagement…)" items={deck.numbers.highlights} onChange={(v) => field('numbers', 'highlights', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="numbers" />
        </>
      )}

      {slideId === 'audience' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="audience" />
          <Group title="Slide · Audience">
            <MetricEditor label="Gender split (value = % number)" items={deck.audience.gender} onChange={(v) => field('audience', 'gender', v)} />
            <MetricEditor label="Age ranges" items={deck.audience.ages} onChange={(v) => field('audience', 'ages', v)} />
            <ListEditor label="Top locations" items={deck.audience.locations} onChange={(v) => field('audience', 'locations', v)} placeholder="United States" />
            <ListEditor label="Interests & niches" items={deck.audience.interests} onChange={(v) => field('audience', 'interests', v)} placeholder="Beauty" />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="audience" />
        </>
      )}

      {slideId === 'contentStyle' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="contentStyle" />
          <Group title="Slide · Content Style">
            <Field label="Intro line" value={deck.contentStyle.intro} onChange={(v) => field('contentStyle', 'intro', v)} />
            {deck.contentStyle.types.map((t, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Type {i + 1}</span>
                <ImageDrop label="Image (optional)" value={deck.assets[`cs${i + 1}`]} onChange={(v) => asset(`cs${i + 1}`, v)} />
                <Field label="Title" value={t.title} onChange={(v) => field('contentStyle', 'types', deck.contentStyle.types.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Area label="Description" rows={2} value={t.desc} onChange={(v) => field('contentStyle', 'types', deck.contentStyle.types.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="contentStyle" />
        </>
      )}

      {slideId === 'shortForm' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="shortForm" />
          <Group title="Slide · Short-Form (9:16)">
            <Area label="Headline" rows={2} value={deck.shortForm.headline} onChange={(v) => field('shortForm', 'headline', v)} />
            <Field label="Intro line" value={deck.shortForm.intro} onChange={(v) => field('shortForm', 'intro', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">4 vertical example tiles</span>
            {deck.shortForm.items.map((it, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.3fr] gap-3 items-start">
                <ImageDrop value={deck.assets[`sf${i + 1}`]} onChange={(v) => asset(`sf${i + 1}`, v)} aspect="9/16" />
                <div className="space-y-2">
                  <Field label={`Caption ${i + 1}`} value={it.caption} onChange={(v) => field('shortForm', 'items', deck.shortForm.items.map((x, idx) => (idx === i ? { ...x, caption: v } : x)))} />
                  <Field label="Stat" value={it.stat} onChange={(v) => field('shortForm', 'items', deck.shortForm.items.map((x, idx) => (idx === i ? { ...x, stat: v } : x)))} />
                </div>
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="shortForm" />
        </>
      )}

      {slideId === 'longForm' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="longForm" />
          <Group title="Slide · Long-Form (16:9)">
            <Area label="Headline" rows={2} value={deck.longForm.headline} onChange={(v) => field('longForm', 'headline', v)} />
            <Field label="Intro line" value={deck.longForm.intro} onChange={(v) => field('longForm', 'intro', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">3 horizontal example tiles</span>
            {deck.longForm.items.map((it, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <ImageDrop label={`Thumbnail ${i + 1}`} value={deck.assets[`lf${i + 1}`]} onChange={(v) => asset(`lf${i + 1}`, v)} aspect="16/9" />
                <Field label="Title" value={it.title} onChange={(v) => field('longForm', 'items', deck.longForm.items.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Field label="Stat" value={it.stat} onChange={(v) => field('longForm', 'items', deck.longForm.items.map((x, idx) => (idx === i ? { ...x, stat: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="longForm" />
        </>
      )}

      {slideId === 'brandPartners' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="brandPartners" />
          <Group title="Slide · Brand Partners">
            <Field label="Intro line" value={deck.brandPartners.intro} onChange={(v) => field('brandPartners', 'intro', v)} />
            <ListEditor label="Brand names (used if no logo)" items={deck.brandPartners.names} onChange={(v) => field('brandPartners', 'names', v)} placeholder="Sephora" />
            <span className="block text-[12px] text-neutral-400 mt-1">Logos (optional — override names)</span>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ImageDrop key={i} value={deck.assets[`bp${i + 1}`]} onChange={(v) => asset(`bp${i + 1}`, v)} aspect="3/2" />
              ))}
            </div>
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="brandPartners" />
        </>
      )}

      {slideId === 'testimonials' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="testimonials" />
          <Group title="Slide · Testimonials">
            {deck.testimonials.quotes.map((q, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Quote {i + 1}</span>
                <Area label="Quote" rows={3} value={q.quote} onChange={(v) => field('testimonials', 'quotes', deck.testimonials.quotes.map((x, idx) => (idx === i ? { ...x, quote: v } : x)))} />
                <Field label="Author" value={q.author} onChange={(v) => field('testimonials', 'quotes', deck.testimonials.quotes.map((x, idx) => (idx === i ? { ...x, author: v } : x)))} />
                <Field label="Role / brand" value={q.role} onChange={(v) => field('testimonials', 'quotes', deck.testimonials.quotes.map((x, idx) => (idx === i ? { ...x, role: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="testimonials" />
        </>
      )}

      {slideId === 'madeFor' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="madeFor" />
          <Group title="Slide · Made For You">
            <Area label="Headline" rows={2} value={deck.madeFor.headline} onChange={(v) => field('madeFor', 'headline', v)} />
            <Field label="Intro line" value={deck.madeFor.intro} onChange={(v) => field('madeFor', 'intro', v)} />
            <Field label="Short-form label" value={deck.madeFor.shortLabel} onChange={(v) => field('madeFor', 'shortLabel', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">Short-form ideas (9:16 ×3)</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1.3fr] gap-3 items-center">
                <ImageDrop value={deck.assets[`mf_s${i + 1}`]} onChange={(v) => asset(`mf_s${i + 1}`, v)} aspect="9/16" />
                <Field label={`Caption ${i + 1}`} value={deck.madeFor.shortCaptions[i]} onChange={(v) => field('madeFor', 'shortCaptions', deck.madeFor.shortCaptions.map((c, idx) => (idx === i ? v : c)))} />
              </div>
            ))}
            <Field label="Long-form label" value={deck.madeFor.longLabel} onChange={(v) => field('madeFor', 'longLabel', v)} />
            <ImageDrop label="Long-form idea (16:9)" value={deck.assets.mf_l1} onChange={(v) => asset('mf_l1', v)} aspect="16/9" />
            <Area label="Long-form caption" rows={2} value={deck.madeFor.longCaption} onChange={(v) => field('madeFor', 'longCaption', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="madeFor" />
        </>
      )}

      {slideId === 'collabMenu' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="collabMenu" />
          <Group title="Slide · Collab Menu">
            <Field label="Intro line" value={deck.collabMenu.intro} onChange={(v) => field('collabMenu', 'intro', v)} />
            {deck.collabMenu.items.map((it, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Option {i + 1}</span>
                <Field label="Title" value={it.title} onChange={(v) => field('collabMenu', 'items', deck.collabMenu.items.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Area label="Description" rows={2} value={it.desc} onChange={(v) => field('collabMenu', 'items', deck.collabMenu.items.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="collabMenu" />
        </>
      )}

      {slideId === 'rates' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="rates" />
          <Group title="Slide · Rates">
            <Field label="Intro line" value={deck.rates.intro} onChange={(v) => field('rates', 'intro', v)} />
            {deck.rates.packages.map((p, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Package {i + 1}</span>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Name" value={p.name} onChange={(v) => field('rates', 'packages', deck.rates.packages.map((x, idx) => (idx === i ? { ...x, name: v } : x)))} />
                  <Field label="Price" value={p.price} onChange={(v) => field('rates', 'packages', deck.rates.packages.map((x, idx) => (idx === i ? { ...x, price: v } : x)))} />
                </div>
                <ListEditor label="Includes" items={p.includes} onChange={(v) => field('rates', 'packages', deck.rates.packages.map((x, idx) => (idx === i ? { ...x, includes: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="rates" />
        </>
      )}

      {slideId === 'contact' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="contact" />
          <Group title="Slide · Contact & PR">
            <Field label="Email" value={deck.contact.email} onChange={(v) => field('contact', 'email', v)} />
            <LinkEditor label="Social links (clickable + QR)" items={deck.contact.links} onChange={(v) => field('contact', 'links', v)} />
            <Field label="Ship-to name" value={deck.contact.shipName} onChange={(v) => field('contact', 'shipName', v)} />
            <Area label="PO box / shipping address" rows={2} value={deck.contact.shipAddress} onChange={(v) => field('contact', 'shipAddress', v)} />
            <Area label="Note" rows={3} value={deck.contact.note} onChange={(v) => field('contact', 'note', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="contact" />
        </>
      )}
    </div>
  )
}
