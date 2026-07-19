import {
  Sparkles, Target, Palette, Trophy, Layers, Route, DollarSign,
} from 'lucide-react'

/* Font pairings — families are loaded in index.html */
export const FONT_PAIRS = {
  'inter-roboto':    { label: 'Inter / Roboto',        head: "'Inter', sans-serif",           body: "'Roboto', sans-serif" },
  'space-inter':     { label: 'Space Grotesk / Inter', head: "'Space Grotesk', sans-serif",    body: "'Inter', sans-serif" },
  'playfair-inter':  { label: 'Playfair / Inter',      head: "'Playfair Display', serif",      body: "'Inter', sans-serif" },
  'dmserif-dmsans':  { label: 'DM Serif / DM Sans',    head: "'DM Serif Display', serif",      body: "'DM Sans', sans-serif" },
}

/* Slide navigation metadata */
export const SLIDES = [
  { id: 'vision',       n: 1, name: 'The Vision',      tag: 'The Hook',            icon: Sparkles },
  { id: 'blueprint',    n: 2, name: 'Mini-Blueprint',  tag: 'The Problem',         icon: Target },
  { id: 'strategy',     n: 3, name: 'The Strategy',    tag: 'The Solution',        icon: Palette },
  { id: 'caseStudies',  n: 4, name: 'Case Studies',    tag: 'The Proof',           icon: Trophy },
  { id: 'deliverables', n: 5, name: 'Deliverables',    tag: 'Perceived Value',     icon: Layers },
  { id: 'process',      n: 6, name: 'How We Work',     tag: 'Logistics',           icon: Route },
  { id: 'investment',   n: 7, name: 'The Investment',  tag: 'Pricing & CTA',       icon: DollarSign },
]

export const DEFAULT_DECK = {
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

  assets: {}, // key -> dataURL

  /* Per-slide background photo settings: { [slideId]: { style, blur, overlay } } */
  backgrounds: {},

  vision: {
    kicker: 'The Opportunity',
    headline: 'The *massive opportunity* for Nova Skincare on TikTok',
    subtitle:
      'A social-first content engine built to turn attention into leads, traffic, and brand authority — not just views.',
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
    price: '$6,000',
    cadence: '/ month',
    includes: [
      '30 organic assets across 3 platforms',
      'Full strategy, production & editing',
      'Daily posting & scheduling',
      'Lead-gen funnel setup + monthly reporting',
    ],
    cta: "Let's get Nova Skincare in the right rooms. Reserve your shoot day this month — we onboard 2 new brands per quarter.",
  },
}
