import { FONT_PAIRS, THEMES } from './defaults'
import { Group, Field, Area, ColorField, ImageDrop, ListEditor, MetricEditor, Slider, Toggle } from './ui'

/* Per-slide background photo controls (photo + blur + color-mix) */
function BgControls({ deck, onChange, slideId }) {
  const bg = deck.backgrounds?.[slideId] || {}
  const styleMode = bg.style || (slideId === 'vision' ? 'split' : 'full')
  const img = deck.assets[`bg_${slideId}`]
  const setBg = (k, v) =>
    onChange({ ...deck, backgrounds: { ...(deck.backgrounds || {}), [slideId]: { ...bg, [k]: v } } })
  const setImg = (v) => onChange({ ...deck, assets: { ...deck.assets, [`bg_${slideId}`]: v } })

  return (
    <Group title="Slide background photo">
      <ImageDrop label="Background photo (optional)" value={img} onChange={setImg} />
      {img && (
        <>
          <div>
            <span className="block text-[12px] text-neutral-400 mb-1.5">Blend style</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['split', 'Split — color fades into photo'],
                ['full', 'Full — photo behind everything'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setBg('style', key)}
                        className="rounded-lg px-3 py-2 text-[12px] text-left border transition"
                        style={{
                          background: styleMode === key ? '#26262c' : '#171719',
                          borderColor: styleMode === key ? '#55555f' : '#2a2a31',
                          color: styleMode === key ? '#fff' : '#9a9aa4',
                        }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Slider label="Photo blur" value={bg.blur ?? 6} onChange={(v) => setBg('blur', v)} min={0} max={24} suffix="px" />
          <Slider label="Color overlay (higher = more brand color)" value={bg.overlay ?? (styleMode === 'split' ? 35 : 65)}
                  onChange={(v) => setBg('overlay', v)} min={0} max={100} suffix="%" />
        </>
      )}
    </Group>
  )
}

/* Include / exclude this slide from the deck */
function IncludeToggle({ deck, onChange, slideId }) {
  const hidden = deck.hidden || []
  const included = !hidden.includes(slideId)
  const toggle = (on) =>
    onChange({ ...deck, hidden: on ? hidden.filter((x) => x !== slideId) : [...hidden, slideId] })
  return (
    <div className="mb-4">
      <Toggle label={included ? 'Included in this deck' : 'Hidden from this deck'} checked={included} onChange={toggle} />
    </div>
  )
}

export default function Controls({ deck, onChange, slideId }) {
  const brand = (key, val) => onChange({ ...deck, brand: { ...deck.brand, [key]: val } })
  const asset = (key, val) => onChange({ ...deck, assets: { ...deck.assets, [key]: val } })
  const field = (section, key, val) => onChange({ ...deck, [section]: { ...deck[section], [key]: val } })
  const applyTheme = (t) =>
    onChange({ ...deck, brand: { ...deck.brand, primary: t.primary, secondary: t.secondary, headingColor: t.heading, textColor: t.text } })

  return (
    <div>
      {/* ---------- GLOBAL BRAND ---------- */}
      <Group title="Brand & Client">
        <Field label="Your agency name" value={deck.brand.agencyName} onChange={(v) => brand('agencyName', v)} />
        <Field label="Client name" value={deck.brand.clientName} onChange={(v) => brand('clientName', v)} />
        <Field label="Footer line (site · socials — shows on every slide)" value={deck.brand.footer} onChange={(v) => brand('footer', v)} />
        <div className="grid grid-cols-2 gap-3">
          <ImageDrop label="Agency logo" value={deck.assets.agencyLogo} onChange={(v) => asset('agencyLogo', v)} aspect="3/1" />
          <ImageDrop label="Client logo" value={deck.assets.clientLogo} onChange={(v) => asset('clientLogo', v)} aspect="3/1" />
        </div>
      </Group>

      <Group title="Theme presets">
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const active = deck.brand.primary.toLowerCase() === t.primary.toLowerCase()
              && deck.brand.secondary.toLowerCase() === t.secondary.toLowerCase()
            return (
              <button key={t.name} onClick={() => applyTheme(t)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 border transition"
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
            <button
              key={key}
              onClick={() => brand('fontPair', key)}
              className="rounded-lg px-3 py-2 text-[13px] text-left border transition truncate"
              style={{
                fontFamily: p.head,
                background: deck.brand.fontPair === key ? '#26262c' : '#171719',
                borderColor: deck.brand.fontPair === key ? '#55555f' : '#2a2a31',
                color: deck.brand.fontPair === key ? '#fff' : '#b6b6c0',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Tip: in any text field, wrap words in *asterisks* to highlight them in your primary color —
          e.g. “The *massive opportunity* for…”
        </p>
      </Group>

      <div className="my-5 border-t border-neutral-800" />

      {/* ---------- PER-SLIDE ---------- */}
      {slideId === 'vision' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="vision" />
          <Group title="Slide · The Vision">
            <Field label="Kicker" value={deck.vision.kicker} onChange={(v) => field('vision', 'kicker', v)} />
            <Area label="Headline" rows={3} value={deck.vision.headline} onChange={(v) => field('vision', 'headline', v)} />
            <Area label="Subtitle" rows={3} value={deck.vision.subtitle} onChange={(v) => field('vision', 'subtitle', v)} />
            <p className="text-[11px] text-neutral-500">Logos come from “Brand &amp; Client” above.</p>
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="vision" />
        </>
      )}

      {slideId === 'team' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="team" />
          <Group title="Slide · Who We Are">
            <Field label="Kicker" value={deck.team.kicker} onChange={(v) => field('team', 'kicker', v)} />
            <Area label="Headline" rows={2} value={deck.team.headline} onChange={(v) => field('team', 'headline', v)} />
            <Area label="Who we are (blurb)" rows={4} value={deck.team.blurb} onChange={(v) => field('team', 'blurb', v)} />
            <MetricEditor label="Metrics (creators, views, followers…)" items={deck.team.metrics} onChange={(v) => field('team', 'metrics', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">Creators (photo + name + handle)</span>
            {deck.team.creators.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.3fr] gap-3 items-start">
                <ImageDrop value={deck.assets[`creator${i + 1}`]} onChange={(v) => asset(`creator${i + 1}`, v)} aspect="1/1" />
                <div className="space-y-2">
                  <Field label={`Name ${i + 1}`} value={c.name}
                         onChange={(v) => field('team', 'creators', deck.team.creators.map((x, idx) => (idx === i ? { ...x, name: v } : x)))} />
                  <Field label="Handle" value={c.handle}
                         onChange={(v) => field('team', 'creators', deck.team.creators.map((x, idx) => (idx === i ? { ...x, handle: v } : x)))} />
                </div>
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="team" />
        </>
      )}

      {slideId === 'blueprint' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="blueprint" />
          <Group title="Slide · Mini-Blueprint">
            <Area label="Intro line" rows={2} value={deck.blueprint.intro} onChange={(v) => field('blueprint', 'intro', v)} />
            <MetricEditor label="Current metrics (where they are)" items={deck.blueprint.current} onChange={(v) => field('blueprint', 'current', v)} />
            <MetricEditor label="Target metrics (the market)" items={deck.blueprint.target} onChange={(v) => field('blueprint', 'target', v)} />
            <ImageDrop label="Current weak content" value={deck.assets.weakContent} onChange={(v) => asset('weakContent', v)} />
            <Field label="…caption" value={deck.blueprint.weakCaption} onChange={(v) => field('blueprint', 'weakCaption', v)} />
            <ImageDrop label="Competitor crushing it" value={deck.assets.competitor} onChange={(v) => asset('competitor', v)} />
            <Field label="…caption" value={deck.blueprint.competitorCaption} onChange={(v) => field('blueprint', 'competitorCaption', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="blueprint" />
        </>
      )}

      {slideId === 'strategy' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="strategy" />
          <Group title="Slide · The Strategy">
            <Field label="Kicker" value={deck.strategy.kicker} onChange={(v) => field('strategy', 'kicker', v)} />
            <Area label="Overview" rows={5} value={deck.strategy.overview} onChange={(v) => field('strategy', 'overview', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">Mood board (4 tiles)</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1.2fr] gap-3 items-end">
                <ImageDrop value={deck.assets[`mood${i + 1}`]} onChange={(v) => asset(`mood${i + 1}`, v)} aspect="1/1" />
                <Field label={`Caption ${i + 1}`} value={deck.strategy.moodCaptions[i]}
                       onChange={(v) => field('strategy', 'moodCaptions', deck.strategy.moodCaptions.map((c, idx) => (idx === i ? v : c)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="strategy" />
        </>
      )}

      {slideId === 'visionBoard' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="visionBoard" />
          <Group title="Slide · Vision Board">
            <Field label="Kicker" value={deck.visionBoard.kicker} onChange={(v) => field('visionBoard', 'kicker', v)} />
            <Area label="Headline" rows={2} value={deck.visionBoard.headline} onChange={(v) => field('visionBoard', 'headline', v)} />
            <Area label="Intro" rows={2} value={deck.visionBoard.intro} onChange={(v) => field('visionBoard', 'intro', v)} />
            <Area label="Where your brand fits (callout)" rows={3} value={deck.visionBoard.brandFit} onChange={(v) => field('visionBoard', 'brandFit', v)} />
            <span className="block text-[12px] text-neutral-400 mt-1">Board images (6 tiles)</span>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_1.2fr] gap-3 items-end">
                <ImageDrop value={deck.assets[`vb${i + 1}`]} onChange={(v) => asset(`vb${i + 1}`, v)} aspect="1/1" />
                <Field label={`Caption ${i + 1}`} value={deck.visionBoard.captions[i]}
                       onChange={(v) => field('visionBoard', 'captions', deck.visionBoard.captions.map((c, idx) => (idx === i ? v : c)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="visionBoard" />
        </>
      )}

      {slideId === 'campaignIdeas' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="campaignIdeas" />
          <Group title="Slide · Campaign Ideas">
            <Field label="Kicker" value={deck.campaignIdeas.kicker} onChange={(v) => field('campaignIdeas', 'kicker', v)} />
            <Area label="Headline" rows={2} value={deck.campaignIdeas.headline} onChange={(v) => field('campaignIdeas', 'headline', v)} />
            <Field label="Intro line" value={deck.campaignIdeas.intro} onChange={(v) => field('campaignIdeas', 'intro', v)} />
            {deck.campaignIdeas.ideas.map((idea, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Idea {i + 1}</span>
                <ImageDrop label="Image (optional)" value={deck.assets[`ci${i + 1}`]} onChange={(v) => asset(`ci${i + 1}`, v)} />
                <Field label="Title" value={idea.title}
                       onChange={(v) => field('campaignIdeas', 'ideas', deck.campaignIdeas.ideas.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Field label="Format tag (e.g. TikTok · Reels)" value={idea.format}
                       onChange={(v) => field('campaignIdeas', 'ideas', deck.campaignIdeas.ideas.map((x, idx) => (idx === i ? { ...x, format: v } : x)))} />
                <Area label="Description" rows={3} value={idea.desc}
                      onChange={(v) => field('campaignIdeas', 'ideas', deck.campaignIdeas.ideas.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="campaignIdeas" />
        </>
      )}

      {slideId === 'caseStudies' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="caseStudies" />
          <Group title="Slide · Case Studies">
            <Field label="Intro line" value={deck.caseStudies.intro} onChange={(v) => field('caseStudies', 'intro', v)} />
            {deck.caseStudies.items.map((c, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Case {i + 1}</span>
                <ImageDrop label="Thumbnail" value={deck.assets[`case${i + 1}Thumb`]} onChange={(v) => asset(`case${i + 1}Thumb`, v)} />
                <Field label="Client name" value={c.client}
                       onChange={(v) => field('caseStudies', 'items', deck.caseStudies.items.map((x, idx) => (idx === i ? { ...x, client: v } : x)))} />
                <Area label="The goal" rows={2} value={c.goal}
                      onChange={(v) => field('caseStudies', 'items', deck.caseStudies.items.map((x, idx) => (idx === i ? { ...x, goal: v } : x)))} />
                <Field label="The results (views / leads / sales)" value={c.results}
                       onChange={(v) => field('caseStudies', 'items', deck.caseStudies.items.map((x, idx) => (idx === i ? { ...x, results: v } : x)))} />
              </div>
            ))}
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="caseStudies" />
        </>
      )}

      {slideId === 'deliverables' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="deliverables" />
          <Group title="Slide · Deliverables">
            <ListEditor label="Value-stacked deliverables" items={deck.deliverables.items}
                        onChange={(v) => field('deliverables', 'items', v)} placeholder="e.g. 30 assets × 3 platforms = 90 touchpoints" />
            <Area label="Lead-generation setup" rows={4} value={deck.deliverables.leadGen} onChange={(v) => field('deliverables', 'leadGen', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="deliverables" />
        </>
      )}

      {slideId === 'process' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="process" />
          <Group title="Slide · How We Work">
            <Field label="Kicker" value={deck.process.kicker} onChange={(v) => field('process', 'kicker', v)} />
            {deck.process.steps.map((st, i) => (
              <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Step {i + 1}</span>
                <Field label="Title" value={st.title}
                       onChange={(v) => field('process', 'steps', deck.process.steps.map((x, idx) => (idx === i ? { ...x, title: v } : x)))} />
                <Area label="Description" rows={2} value={st.desc}
                      onChange={(v) => field('process', 'steps', deck.process.steps.map((x, idx) => (idx === i ? { ...x, desc: v } : x)))} />
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => field('process', 'steps', [...deck.process.steps, { title: 'New Step', desc: '' }])}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40"
                      disabled={deck.process.steps.length >= 5}>+ Add step</button>
              <button onClick={() => field('process', 'steps', deck.process.steps.slice(0, -1))}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40"
                      disabled={deck.process.steps.length <= 3}>− Remove last</button>
            </div>
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="process" />
        </>
      )}

      {slideId === 'investment' && (
        <>
          <IncludeToggle deck={deck} onChange={onChange} slideId="investment" />
          <Group title="Slide · The Investment">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Retainer price" value={deck.investment.price} onChange={(v) => field('investment', 'price', v)} />
              <Field label="Cadence" value={deck.investment.cadence} onChange={(v) => field('investment', 'cadence', v)} />
            </div>
            <ListEditor label="What’s included" items={deck.investment.includes} onChange={(v) => field('investment', 'includes', v)} />
            <Area label="Next steps (CTA)" rows={4} value={deck.investment.cta} onChange={(v) => field('investment', 'cta', v)} />
          </Group>
          <BgControls deck={deck} onChange={onChange} slideId="investment" />
        </>
      )}
    </div>
  )
}
