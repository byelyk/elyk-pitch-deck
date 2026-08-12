import { FONT_PAIRS, THEMES } from './defaults'
import { Group, Field, Area, ColorField, ImageDrop, ListEditor, MetricEditor, Toggle, Slider } from './ui'

function BgControls({ deck, onChange, slideId }) {
  const bg = deck.backgrounds?.[slideId] || {}
  const styleMode = bg.style || (slideId === 'cover' ? 'split' : 'full')
  const img = deck.assets[`bg_${slideId}`]
  const setBg = (k, v) => onChange({ ...deck, backgrounds: { ...(deck.backgrounds || {}), [slideId]: { ...bg, [k]: v } } })
  const setImg = (v) => onChange({ ...deck, assets: { ...deck.assets, [`bg_${slideId}`]: v } })
  return (
    <Group title="Page background photo">
      <ImageDrop label="Background photo (optional)" value={img} onChange={setImg} />
      {img && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {[['split', 'Split — color fades into photo'], ['full', 'Full — photo behind everything']].map(([key, label]) => (
              <button key={key} onClick={() => setBg('style', key)} className="rounded-lg px-3 py-2 text-[12px] text-left border transition"
                      style={{ background: styleMode === key ? '#26262c' : '#171719', borderColor: styleMode === key ? '#55555f' : '#2a2a31', color: styleMode === key ? '#fff' : '#9a9aa4' }}>{label}</button>
            ))}
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
  return <div className="mb-4"><Toggle label={included ? 'Included in this brief' : 'Hidden from this brief'} checked={included} onChange={toggle} /></div>
}

export default function BriefControls({ deck, onChange, slideId }) {
  const brand = (key, val) => onChange({ ...deck, brand: { ...deck.brand, [key]: val } })
  const asset = (key, val) => onChange({ ...deck, assets: { ...deck.assets, [key]: val } })
  const field = (section, key, val) => onChange({ ...deck, [section]: { ...deck[section], [key]: val } })
  const applyTheme = (t) => onChange({ ...deck, brand: { ...deck.brand, primary: t.primary, secondary: t.secondary, headingColor: t.heading, textColor: t.text } })

  return (
    <div>
      <Group title="Agency & Brand">
        <Field label="Your agency name" value={deck.brand.agencyName} onChange={(v) => brand('agencyName', v)} />
        <Field label="Brand / sponsor name" value={deck.brand.clientName} onChange={(v) => brand('clientName', v)} />
        <Field label="Footer line" value={deck.brand.footer} onChange={(v) => brand('footer', v)} />
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
          <Group title="Page · Cover">
            <Field label="Kicker" value={deck.cover.kicker} onChange={(v) => field('cover', 'kicker', v)} />
            <Field label="Series title" value={deck.cover.title} onChange={(v) => field('cover', 'title', v)} />
            <Area label="Subtitle" rows={3} value={deck.cover.subtitle} onChange={(v) => field('cover', 'subtitle', v)} />
            <ListEditor label="Info chips" items={deck.cover.chips} onChange={(v) => field('cover', 'chips', v)} placeholder="2 episodes / month" />
            <ImageDrop label="Cover art / thumbnail" value={deck.assets.brief_cover} onChange={(v) => asset('brief_cover', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="cover" />
        </>
      )}

      {slideId === 'concept' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="concept" />
          <Group title="Page · The Concept">
            <Area label="Headline" rows={2} value={deck.concept.headline} onChange={(v) => field('concept', 'headline', v)} />
            <Area label="Body" rows={5} value={deck.concept.body} onChange={(v) => field('concept', 'body', v)} />
            {deck.concept.points.map((p, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Point {i + 1}</span>
                <Field label="Title" value={p.title} onChange={(v) => field('concept', 'points', deck.concept.points.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Area label="Description" rows={2} value={p.desc} onChange={(v) => field('concept', 'points', deck.concept.points.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
            <Field label="Screenshots label" value={deck.concept.thumbsLabel} onChange={(v) => field('concept', 'thumbsLabel', v)} />
            <div className="grid grid-cols-2 gap-3">
              <ImageDrop label="Screenshot 1" value={deck.assets.ct1} onChange={(v) => asset('ct1', v)} />
              <ImageDrop label="Screenshot 2" value={deck.assets.ct2} onChange={(v) => asset('ct2', v)} />
            </div>
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="concept" />
        </>
      )}

      {slideId === 'format' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="format" />
          <Group title="Page · The Format">
            <Area label="Headline" rows={2} value={deck.format.headline} onChange={(v) => field('format', 'headline', v)} />
            {deck.format.steps.map((st, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Beat {i + 1}</span>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Title" value={st.title} onChange={(v) => field('format', 'steps', deck.format.steps.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                  <Field label="Tag" value={st.tag} onChange={(v) => field('format', 'steps', deck.format.steps.map((x, idx) => (idx === i ? { ...x, tag: v } : x)))} />
                </div>
                <Area label="Description" rows={2} value={st.desc} onChange={(v) => field('format', 'steps', deck.format.steps.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="format" />
        </>
      )}

      {slideId === 'integration' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="integration" />
          <Group title="Page · Brand Map">
            <Area label="Headline" rows={2} value={deck.integration.headline} onChange={(v) => field('integration', 'headline', v)} />
            <ListEditor label="Placements" items={deck.integration.placements} onChange={(v) => field('integration', 'placements', v)} />
            <Field label="Mockups label" value={deck.integration.mocksLabel} onChange={(v) => field('integration', 'mocksLabel', v)} />
            <div className="grid grid-cols-2 gap-3">
              <ImageDrop label="Mockup 1" value={deck.assets.im1} onChange={(v) => asset('im1', v)} />
              <ImageDrop label="Mockup 2" value={deck.assets.im2} onChange={(v) => asset('im2', v)} />
            </div>
            <Area label="Repurposing callout" rows={3} value={deck.integration.callout} onChange={(v) => field('integration', 'callout', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="integration" />
        </>
      )}

      {slideId === 'timeline' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="timeline" />
          <Group title="Page · Timeline">
            <Area label="Headline" rows={2} value={deck.timeline?.headline || ''} onChange={(v) => field('timeline', 'headline', v)} />
            <Field label="Intro line" value={deck.timeline?.intro || ''} onChange={(v) => field('timeline', 'intro', v)} />
            {(deck.timeline?.milestones || []).map((m, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Milestone {i + 1}</span>
                  <Toggle label="Highlight" checked={!!m.highlight}
                          onChange={(v) => field('timeline', 'milestones', deck.timeline.milestones.map((x, idx) => (idx === i ? { ...x, highlight: v } : x)))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Date" value={m.date} onChange={(v) => field('timeline', 'milestones', deck.timeline.milestones.map((x, idx) => (idx === i ? { ...x, date: v } : x)))} />
                  <Field label="Title" value={m.title} onChange={(v) => field('timeline', 'milestones', deck.timeline.milestones.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                </div>
                <Area label="Description" rows={2} value={m.desc} onChange={(v) => field('timeline', 'milestones', deck.timeline.milestones.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="timeline" />
        </>
      )}

      {slideId === 'distribution' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="distribution" />
          <Group title="Page · Distribution">
            <Area label="Headline" rows={2} value={deck.distribution.headline} onChange={(v) => field('distribution', 'headline', v)} />
            <MetricEditor label="Tiles (value + label)" items={deck.distribution.tiles.map(t => ({ label: t.label, value: t.value }))}
                          onChange={(v) => field('distribution', 'tiles', v.map(x => ({ value: x.value, label: x.label })))} />
            <Area label="Supporting paragraph" rows={4} value={deck.distribution.blurb} onChange={(v) => field('distribution', 'blurb', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="distribution" />
        </>
      )}

      {slideId === 'numbers' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="numbers" />
          <Group title="Page · The Numbers">
            <Area label="Headline" rows={2} value={deck.numbers.headline} onChange={(v) => field('numbers', 'headline', v)} />
            <Field label="Intro line" value={deck.numbers.intro} onChange={(v) => field('numbers', 'intro', v)} />
            <MetricEditor label="Projections (editable — keep honest!)" items={deck.numbers.projections} onChange={(v) => field('numbers', 'projections', v)} />
            <MetricEditor label="Real receipts (your actual stats)" items={deck.numbers.receipts} onChange={(v) => field('numbers', 'receipts', v)} />
            <Area label="Finance callout" rows={3} value={deck.numbers.callout} onChange={(v) => field('numbers', 'callout', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="numbers" />
        </>
      )}

      {slideId === 'investment' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="investment" />
          <Group title="Page · Investment">
            {(() => {
              const iv = deck.investment
              const tiers = iv.tiers || []
              const on = tiers.length > 0
              const setTiers = (v) => field('investment', 'tiers', v)
              const upd = (i, k, val) => setTiers(tiers.map((t, idx) => (idx === i ? { ...t, [k]: val } : t)))
              const starter = [
                { name: 'Launch', listValue: '', price: '$10,000', cadence: '/ campaign', save: '', recommended: false, features: [] },
                { name: 'Amplify', listValue: '', price: '$17,500', cadence: '/ campaign', save: '', recommended: true, features: [] },
                { name: 'Takeover', listValue: '', price: '$25,000', cadence: '/ campaign', save: '', recommended: false, features: [] },
              ]
              return (
                <>
                  <Toggle label={on ? 'Pricing tiers (a range)' : 'Single price'} checked={on} onChange={(v) => setTiers(v ? starter : [])} />
                  {!on && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Price" value={iv.price} onChange={(v) => field('investment', 'price', v)} />
                        <Field label="Cadence" value={iv.cadence} onChange={(v) => field('investment', 'cadence', v)} />
                      </div>
                      <ListEditor label="What’s included" items={iv.includes} onChange={(v) => field('investment', 'includes', v)} />
                    </>
                  )}
                  {on && (
                    <>
                      <Field label="Headline" value={iv.headline || ''} onChange={(v) => field('investment', 'headline', v)} />
                      {tiers.map((t, i) => (
                        <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Tier {i + 1}</span>
                            <Toggle label="Recommended" checked={!!t.recommended}
                                    onChange={(v) => setTiers(tiers.map((x, idx) => ({ ...x, recommended: idx === i ? v : false })))} />
                          </div>
                          <Field label="Name" value={t.name} onChange={(v) => upd(i, 'name', v)} />
                          <div className="grid grid-cols-3 gap-2">
                            <Field label="À-la-carte" value={t.listValue} onChange={(v) => upd(i, 'listValue', v)} />
                            <Field label="Price" value={t.price} onChange={(v) => upd(i, 'price', v)} />
                            <Field label="Save" value={t.save} onChange={(v) => upd(i, 'save', v)} />
                          </div>
                          <ListEditor label="Includes" items={t.features || []} onChange={(v) => upd(i, 'features', v)} />
                        </div>
                      ))}
                    </>
                  )}
                  <Area label="Bottom line / CTA" rows={3} value={iv.cta} onChange={(v) => field('investment', 'cta', v)} />
                </>
              )
            })()}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="investment" />
        </>
      )}
    </div>
  )
}
