# ELYK STUDIO — Pitch Deck & Media Kit Maker

A React app for generating, customizing, and exporting two kinds of documents — **client pitch decks** (for the agency) and **creator media kits** (for individual creators). Split-screen: editing controls on the left, a live real-time preview on the right. Switch document type from the **top-left toggle (Pitch Deck ⇄ Media Kit)**; each saved doc remembers its type and they live side by side in the doc manager.

## The 7 slides
1. **The Vision** — the hook (headline + client lockup)
2. **Mini-Blueprint** — the problem (current vs. target metrics + weak/competitor visuals)
3. **The Strategy** — the solution (overview + mood board)
4. **Case Studies** — the proof (2 past projects: goal + results + thumbnail)
5. **Deliverables** — perceived value (value-stacked bullets + lead-gen setup)
6. **How We Work** — logistics (3–4 step timeline)
7. **The Investment** — pricing + next-steps CTA

## The media kit (12 pages)
For creators pitching brands: **Cover** (photo, niches, links + QR) · **The Numbers** (per-platform followers, reach, engagement) · **Audience** (gender/age/locations/interests) · **Content Style** · **Short-Form (9:16)** gallery · **Long-Form (16:9)** gallery · **Brand Partners** · **Testimonials** · **Made For You** (bespoke 9:16 + 16:9 ideas for the specific brand) · **Collab Menu** · **Rates** · **Contact & PR** (email, links, PO box / shipping address). Social links are clickable in-app and in PDF, with **QR codes** so they survive the image-based PowerPoint export.

## Run it

Node.js is already installed on this machine. From a terminal in this folder:

```bash
npm run dev
```

Then open the printed URL (http://127.0.0.1:5178/). To stop it, press `Ctrl+C`.

> First time on a fresh machine only: run `npm install` once before `npm run dev`.

## Customize a pitch
Everything is editable live in the left sidebar — brand name, client name, logos (upload/drag-drop), colors (primary accent, background, **heading text, body text**), font pairing, and every text field, metric, bullet, and image per slide. Your work **autosaves** to the browser automatically.

- **One deck per client** — the "Your Decks" panel at the top of the sidebar lets you create, rename, duplicate, and switch between saved decks. Duplicate your best deck as the starting point for each new client.
- **Deck files** — the download/upload buttons save a deck as a `.json` file (backup) or open one.
- **Background photos** — every slide has a "Slide background photo" section: upload a photo, pick **Split** (brand color fades into the photo) or **Full**, and tune the blur + color-overlay sliders.
- **Accent words** — wrap words in `*asterisks*` in any text field to color them with your primary color, e.g. `The *massive opportunity* for…`

To change the *default* template copy that loads for a brand-new deck, edit **`src/defaults.js`**.

## Presenting & exporting
**Present** — fullscreen slideshow for pitching live on a call. Arrow keys / click to advance, Esc to exit. Hidden slides are skipped.

**Export PDF** — one click, downloads a ready-to-send PDF. No print dialog, no settings.

**Export Slides (.pptx)** — downloads a real PowerPoint file that opens in PowerPoint, Keynote, or Google Slides. Each slide is captured pixel-perfect with the real fonts embedded. Larger docs take ~30–60 seconds (the button shows a spinner) — the page stays usable while it runs.

Exports include only the slides you've toggled on, in 16:9 landscape.

**Image uploads** are automatically resized to a 2000px cap (visually lossless on slides) so browser storage stays roomy — an 8MB phone photo stores at a few hundred KB.

## Tech
React + Vite + Tailwind CSS v4 + lucide-react. No backend — images are stored inline and the deck saves to `localStorage`.
