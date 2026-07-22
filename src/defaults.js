import {
  Sparkles, Users, Target, Palette, Images, Lightbulb, Trophy, Layers, Route, DollarSign,
  Star, BarChart3, PieChart, Clapperboard, Smartphone, MonitorPlay, Handshake, Quote, Wand2, ListChecks, Mail,
} from 'lucide-react'

/* Font pairings — families are loaded in index.html */
export const FONT_PAIRS = {
  'inter-roboto':     { label: 'Inter / Roboto',        head: "'Inter', sans-serif",             body: "'Roboto', sans-serif" },
  'space-inter':      { label: 'Space Grotesk / Inter', head: "'Space Grotesk', sans-serif",      body: "'Inter', sans-serif" },
  'poppins-inter':    { label: 'Poppins / Inter',       head: "'Poppins', sans-serif",            body: "'Inter', sans-serif" },
  'montserrat-inter': { label: 'Montserrat / Inter',    head: "'Montserrat', sans-serif",         body: "'Inter', sans-serif" },
  'sora-inter':       { label: 'Sora / Inter',          head: "'Sora', sans-serif",               body: "'Inter', sans-serif" },
  'archivo-inter':    { label: 'Archivo / Inter',       head: "'Archivo', sans-serif",            body: "'Inter', sans-serif" },
  'syne-inter':       { label: 'Syne / Inter',          head: "'Syne', sans-serif",               body: "'Inter', sans-serif" },
  'bricolage-inter':  { label: 'Bricolage / Inter',     head: "'Bricolage Grotesque', sans-serif",body: "'Inter', sans-serif" },
  'playfair-inter':   { label: 'Playfair / Inter',      head: "'Playfair Display', serif",        body: "'Inter', sans-serif" },
  'fraunces-inter':   { label: 'Fraunces / Inter',      head: "'Fraunces', serif",                body: "'Inter', sans-serif" },
  'instrument-inter': { label: 'Instrument / Inter',    head: "'Instrument Serif', serif",        body: "'Inter', sans-serif" },
  'dmserif-dmsans':   { label: 'DM Serif / DM Sans',    head: "'DM Serif Display', serif",        body: "'DM Sans', sans-serif" },
}

/* One-click color themes (all dark-background so the slide styling stays crisp) */
export const THEMES = [
  { name: 'ELYK Orange', primary: '#FF4D00', secondary: '#101014', heading: '#FFFFFF', text: '#E9E9EF' },
  { name: 'Midnight',    primary: '#6C8CFF', secondary: '#0B1020', heading: '#FFFFFF', text: '#C7CEE0' },
  { name: 'Emerald',     primary: '#12D18E', secondary: '#0A1512', heading: '#FFFFFF', text: '#CFE9DF' },
  { name: 'Hot Pink',    primary: '#FF3D8B', secondary: '#150A11', heading: '#FFFFFF', text: '#F1D9E4' },
  { name: 'Gold Lux',    primary: '#D4AF37', secondary: '#121110', heading: '#FFF7E8', text: '#D8D2C4' },
  { name: 'Electric',    primary: '#B4FF39', secondary: '#0C0F08', heading: '#FFFFFF', text: '#D9E6C7' },
  { name: 'Ocean',       primary: '#26C6DA', secondary: '#08161A', heading: '#EAFBFF', text: '#B9D9E0' },
  { name: 'Violet',      primary: '#A66CFF', secondary: '#100A1A', heading: '#FFFFFF', text: '#D8CCEC' },
]

/* Slide navigation metadata — array order = deck order */
export const SLIDES = [
  { id: 'vision',        name: 'The Vision',     tag: 'The Hook',        icon: Sparkles },
  { id: 'team',          name: 'Who We Are',     tag: 'By the Numbers',  icon: Users },
  { id: 'blueprint',     name: 'Mini-Blueprint', tag: 'The Problem',     icon: Target },
  { id: 'strategy',      name: 'The Strategy',   tag: 'The Solution',    icon: Palette },
  { id: 'visionBoard',   name: 'Vision Board',   tag: 'What We Create',  icon: Images },
  { id: 'campaignIdeas', name: 'Campaign Ideas', tag: 'Big Ideas',       icon: Lightbulb },
  { id: 'caseStudies',   name: 'Case Studies',   tag: 'The Proof',       icon: Trophy },
  { id: 'deliverables',  name: 'Deliverables',   tag: 'Perceived Value', icon: Layers },
  { id: 'process',       name: 'How We Work',    tag: 'Logistics',       icon: Route },
  { id: 'investment',    name: 'The Investment', tag: 'Pricing & CTA',   icon: DollarSign },
]

export const DEFAULT_DECK = {
  type: 'pitch',
  brand: {
    agencyName: 'ELYK STUDIO',
    tagline: 'A Social-First Creative Agency',
    clientName: 'Nova Skincare',
    primary: '#FF4D00',
    secondary: '#101014',
    headingColor: '#FFFFFF',
    textColor: '#E9E9EF',
    footer: 'elykstudio.com · @elykstudio',
    fontPair: 'space-inter',
  },

  hidden: [],        // slide ids toggled off for this deck
  assets: {},        // key -> dataURL
  backgrounds: {},   // slideId -> { style, blur, overlay }

  vision: {
    kicker: 'The Opportunity',
    headline: 'The *massive opportunity* for Nova Skincare on TikTok',
    subtitle:
      'A social-first content engine built to turn attention into leads, traffic, and brand authority — not just views.',
  },

  team: {
    kicker: 'Who We Are',
    headline: 'We put your brand *inside the culture* — not in front of it',
    blurb:
      'Elyk Studio is an organic, social-first collective of some of the biggest college creators in the nation. We reach Gen Z where they live — on campus and in the feed — spreading awareness, turning attention into leads, and creating content you can repurpose forever. That’s how you earn their trust.',
    metrics: [
      { label: 'Creators', value: '40+' },
      { label: 'Monthly Views', value: '85M' },
      { label: 'Combined Followers', value: '12M' },
      { label: 'Brands Served', value: '30+' },
    ],
    creators: [
      { name: 'Creator One', handle: '@creatorone' },
      { name: 'Creator Two', handle: '@creatortwo' },
      { name: 'Creator Three', handle: '@creator3' },
      { name: 'Creator Four', handle: '@creator4' },
    ],
  },

  blueprint: {
    intro:
      "Here's exactly where you stand today — and where the brands winning your market already are.",
    current: [
      { label: 'Avg. views / post', value: '1.2K' },
      { label: 'Posting cadence', value: '2 / wk' },
      { label: 'Monthly reach', value: '18K' },
    ],
    target: [
      { label: 'Avg. views / post', value: '250K+' },
      { label: 'Posting cadence', value: 'Daily' },
      { label: 'Monthly reach', value: '4.5M' },
    ],
    weakCaption: 'Your current content — low reach, inconsistent, no hook.',
    competitorCaption: 'A competitor crushing it — native, high-retention, scroll-stopping.',
  },

  strategy: {
    kicker: 'Creative Direction',
    overview:
      'We build a repeatable, platform-native content system around your brand — a clear aesthetic, a proven hook framework, and a distribution model designed to compound reach week over week.',
    moodCaptions: ['Tone & aesthetic', 'Hook style', 'Talent / POV', 'Editing rhythm'],
  },

  visionBoard: {
    kicker: 'What We’d Create',
    headline: 'Your brand, *native to the feed*',
    intro: 'A living board of the content our creators make — and exactly where your brand shows up inside it.',
    brandFit:
      'Where you fit: seamless, authentic integrations that feel like content people already choose to watch — not ads they skip past.',
    captions: ['GRWM / daily life', 'POV skits', 'Street interviews', 'Product moments', 'Trend-jacking', 'Storytime'],
  },

  campaignIdeas: {
    kicker: 'Campaign Concepts',
    headline: 'Three ways we’d *launch* your brand',
    intro: 'Starting points, not final answers — each one built to be made at scale and to compound.',
    ideas: [
      { title: 'The Challenge', format: 'TikTok · Reels', desc: 'A branded challenge that gets creators and their audiences making content for you — organic reach that compounds on itself.' },
      { title: 'Creator Takeover', format: 'Multi-platform', desc: 'Our top creators live a day with your product, turning real usage into scroll-stopping stories your audience trusts.' },
      { title: 'The Series', format: 'Episodic', desc: 'A repeatable, recognizable format your audience returns for — building a brand world, not just one-off posts.' },
    ],
  },

  caseStudies: {
    intro: 'We do not sell filming. We sell outcomes. Here is the proof.',
    items: [
      {
        client: 'Sephora',
        goal: 'Make an exclusive product drop feel unmissable.',
        results: '12.4M views · +340% engagement · 210K saves',
      },
      {
        client: 'Quinn',
        goal: 'Build a recognizable, returning series audience.',
        results: '22.3M views · +120K follows · 18 episodes',
      },
    ],
  },

  deliverables: {
    kicker: 'What You Get',
    items: [
      '30 organic assets / month, distributed across 3 platforms = 90 monthly touchpoints',
      'Full creative direction, scripting & hook strategy',
      'Shoot day production + professional editing',
      'You own every asset — reuse it across your own channels forever',
    ],
    leadGen:
      'Lead-generation setup: on every video we install a clear CTA path (link-in-bio funnel + DM automation) so attention converts into booked calls.',
  },

  process: {
    kicker: 'Simple, Done-For-You',
    steps: [
      { title: 'Strategy', desc: 'We lock the aesthetic, hooks, and content pillars in a kickoff sprint.' },
      { title: 'Shoot Day', desc: 'One monthly production day captures a full library of content.' },
      { title: 'Daily Uploads', desc: 'We edit, schedule, and post — showing up every single day.' },
      { title: 'Optimize', desc: 'We read the data, double down on winners, and report on results.' },
    ],
  },

  investment: {
    kicker: 'The Investment',
    headline: 'The Investment',
    price: '$6,000',
    cadence: '/ month',
    includes: [
      '30 organic assets across 3 platforms',
      'Full strategy, production & editing',
      'Daily posting & scheduling',
      'Lead-gen funnel setup + monthly reporting',
    ],
    tiers: [],
    cta: "Let's get your brand in the right rooms. Reserve your shoot day this month — we onboard 2 new brands per quarter.",
  },
}

/* =========================================================
   MEDIA KIT — a second document type for individual creators
   ========================================================= */
export const KIT_SLIDES = [
  { id: 'cover',         name: 'Cover',          tag: 'Intro',          icon: Star },
  { id: 'numbers',       name: 'The Numbers',    tag: 'By the Numbers', icon: BarChart3 },
  { id: 'audience',      name: 'Audience',       tag: 'Who Watches',    icon: PieChart },
  { id: 'contentStyle',  name: 'Content Style',  tag: 'What I Make',    icon: Clapperboard },
  { id: 'shortForm',     name: 'Short-Form',     tag: '9:16',           icon: Smartphone },
  { id: 'longForm',      name: 'Long-Form',      tag: '16:9',           icon: MonitorPlay },
  { id: 'brandPartners', name: 'Brand Partners', tag: 'The Proof',      icon: Handshake },
  { id: 'testimonials',  name: 'Testimonials',   tag: 'Social Proof',   icon: Quote },
  { id: 'madeFor',       name: 'Made For You',   tag: 'Bespoke',        icon: Wand2 },
  { id: 'collabMenu',    name: 'Collab Menu',    tag: 'How to Work',    icon: ListChecks },
  { id: 'rates',         name: 'Rates',          tag: 'Pricing',        icon: DollarSign },
  { id: 'contact',       name: 'Contact & PR',   tag: 'Get in Touch',   icon: Mail },
]

export const DEFAULT_KIT = {
  type: 'mediakit',
  brand: {
    agencyName: 'MAYA CHEN',
    tagline: 'Creator Media Kit',
    clientName: 'Glossier',
    primary: '#FF4D00',
    secondary: '#101014',
    headingColor: '#FFFFFF',
    textColor: '#E9E9EF',
    footer: 'mayachen.com · @mayachen',
    fontPair: 'space-inter',
  },

  hidden: [],
  assets: {},
  backgrounds: {},

  cover: {
    name: 'Maya Chen',
    handle: '@mayachen',
    tagline: 'Lifestyle & beauty creator making content people actually *finish*.',
    niches: ['Beauty', 'Lifestyle', 'GRWM', 'Wellness'],
    links: [
      { label: 'TikTok', url: 'https://tiktok.com/@mayachen' },
      { label: 'Instagram', url: 'https://instagram.com/mayachen' },
      { label: 'YouTube', url: 'https://youtube.com/@mayachen' },
    ],
  },

  numbers: {
    kicker: 'By the Numbers',
    platforms: [
      { platform: 'TikTok', followers: '620K' },
      { platform: 'Instagram', followers: '210K' },
      { platform: 'YouTube', followers: '95K' },
    ],
    highlights: [
      { label: 'Total Reach / mo', value: '8.4M' },
      { label: 'Avg. Views', value: '340K' },
      { label: 'Engagement Rate', value: '7.2%' },
    ],
  },

  audience: {
    kicker: 'The Audience',
    gender: [
      { label: 'Women', value: 68 },
      { label: 'Men', value: 29 },
      { label: 'Other', value: 3 },
    ],
    ages: [
      { label: '18–24', value: '34%' },
      { label: '25–34', value: '41%' },
      { label: '35–44', value: '18%' },
    ],
    locations: ['United States', 'United Kingdom', 'Canada', 'Australia'],
    interests: ['Beauty & skincare', 'Fashion', 'Wellness', 'Home & lifestyle'],
  },

  contentStyle: {
    kicker: 'Content Style',
    intro: 'The formats my audience shows up for — and finishes.',
    types: [
      { title: 'GRWM & daily life', desc: 'Relatable get-ready-with-me and day-in-the-life storytelling.' },
      { title: 'Honest reviews', desc: 'Try-ons and reviews my audience trusts to make buying decisions.' },
      { title: 'Trend-native skits', desc: 'Fast, on-trend concepts built to be shared and saved.' },
    ],
  },

  shortForm: {
    kicker: 'Short-Form',
    headline: 'Vertical content that *converts*',
    intro: 'TikTok · Reels · Shorts — 9:16, built for the for-you page.',
    items: [
      { caption: 'GRWM', stat: '2.4M views' },
      { caption: 'Product review', stat: '1.1M views' },
      { caption: 'POV skit', stat: '3.8M views' },
      { caption: 'Storytime', stat: '890K views' },
    ],
  },

  longForm: {
    kicker: 'Long-Form',
    headline: 'Deeper stories in *16:9*',
    intro: 'YouTube long-form — for depth, trust, and searchability.',
    items: [
      { title: 'Full routine walkthrough', stat: '420K views' },
      { title: 'Honest 30-day test', stat: '610K views' },
      { title: 'Brand deep-dive', stat: '280K views' },
    ],
  },

  brandPartners: {
    kicker: 'Brand Partners',
    intro: 'A few of the brands I’ve created for.',
    names: ['Sephora', 'Glossier', 'Quinn', 'Oura', 'Rare Beauty', 'Sol de Janeiro'],
  },

  testimonials: {
    kicker: 'What Brands Say',
    quotes: [
      { quote: 'Our best-performing creator partnership of the quarter — the content still drives sales months later.', author: 'Brand Manager', role: 'Beauty brand' },
      { quote: 'Maya made our product feel native, not like an ad. Conversions doubled.', author: 'Head of Social', role: 'DTC brand' },
    ],
  },

  madeFor: {
    kicker: 'Made For You',
    headline: 'Ideas for *your brand*',
    intro: 'A first look at how I’d bring your product into content my audience already loves.',
    shortLabel: 'Short-form angles (9:16)',
    longLabel: 'Long-form angle (16:9)',
    shortCaptions: ['Unboxing / first impression', 'GRWM featuring the product', 'Honest 1-week test'],
    longCaption: 'A full routine video with your product as the hero.',
  },

  collabMenu: {
    kicker: 'Ways to Work Together',
    intro: 'Pick what fits your goals — mix and match.',
    items: [
      { title: 'Dedicated video', desc: 'A full video built entirely around your product.' },
      { title: 'Integration', desc: 'Your product woven into a broader piece of content.' },
      { title: 'Story set', desc: 'A sequence of stories with links / swipe-ups.' },
      { title: 'UGC / whitelisting', desc: 'Content you own and can run as paid ads.' },
    ],
  },

  rates: {
    kicker: 'Rates',
    intro: 'Starting rates — bundles and long-term partnerships discounted.',
    packages: [
      { name: 'Short-form', price: '$2,500', includes: ['1× 9:16 video', 'Posted to TikTok + Reels', '1 round of revisions'] },
      { name: 'Long-form', price: '$5,000', includes: ['1× YouTube video', 'Integrated or dedicated', '30-day usage rights'] },
      { name: 'Bundle', price: '$9,000', includes: ['3× short-form', '1× long-form', 'Story set + link in bio'] },
    ],
  },

  contact: {
    kicker: 'Let’s Work',
    email: 'hello@mayachen.com',
    links: [
      { label: 'TikTok', url: 'https://tiktok.com/@mayachen' },
      { label: 'Instagram', url: 'https://instagram.com/mayachen' },
      { label: 'YouTube', url: 'https://youtube.com/@mayachen' },
    ],
    shipName: 'Maya Chen',
    shipAddress: 'PO Box 1234, Los Angeles, CA 90001',
    note: 'For product sends & PR packages, use the address above. Please email before shipping.',
  },
}
