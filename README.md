# Runway

Runway is a personal finance experience for Gen Z. It manages a limited Rs 10,000 budget over 30 days and lets you simulate a decision before you take it, so you see how it changes your balance, daily allowance, savings goals, forecast, risk and financial health.

## Problem statement coverage

| Requirement | Where it lives |
| --- | --- |
| Income | Plan page, Income card (`src/pages/Plan.jsx`) |
| Balance | Dashboard, computed in `src/engine/finance.js` |
| Spending | Plan page, spending log; allocation donut on the Dashboard |
| Commitments | Plan page, commitments with Pay now |
| Savings goals | Goals page, with daily need versus allowance |
| Subscriptions | Plan page, pause, resume, delete |
| Unexpected expenses | Shocks page with risk preview |
| Daily allowance | Dashboard stat and Simulator table |
| Monthly forecast | 30 day balance chart on the Dashboard |
| Financial risk | Low, Medium or High from the day 30 forecast |
| Financial health | 0 to 100 score from forecast, savings and subscription load |
| Simulate before deciding | Simulator page, before and after table, commit button |

## Experience

A scroll-scrubbed 3D story landing page (`src/pages/Story.jsx`) visualizes the month in six chapters mapped to a full-bleed video world (`/runway-scrub.mp4`) with smooth requestAnimationFrame easing, mouse depth parallax, a live HTML HUD, and solid Champagne text cards for guaranteed contrast. An Emerald Ink route wipe flows between views. The interface uses a distinct palette composed of 60% Champagne background (`#F8E7C9`), 30% Emerald Ink text (`#064E3B`), 10% Brass highlights (`#C99A3C`), Brass Deep actions (`#8C5A12`), and deeper Champagne cards (`#EFD9B3`), with 3D tilt cards, cursor spotlights, animated counters, and interactive balance forecasts. When `prefers-reduced-motion` is active (or if the video encounters an error), the app gracefully falls back to the static poster (`/runway-poster.jpg`) with stacked chapter sections.

## Run

```bash
npm install
npm run dev      # development server
npm test         # unit tests for the finance engine
npm run lint     # ESLint
npm run build    # production build in dist/
```

## Project structure

```
src/
  components/   reusable UI (charts, cards, navigation)
  pages/        one file per route, loaded lazily
  hooks/        routing, storage, animation hooks
  engine/       pure finance logic with unit tests
  data/         constants, sample month, story copy
  utils/        formatting and math helpers
docs/           architecture, features, accessibility
```

See `docs/ARCHITECTURE.md`, `docs/FEATURES.md` and `docs/ACCESSIBILITY.md`.

## Innovation

Decisions are simulated on a copy of the month, so every consequence is visible before commitment. Balance, allowance, goals, forecast, risk and health come from one engine and always agree with each other.

## Privacy and terms

All data stays in your browser. See the in-app Privacy policy and Terms pages.

## License

MIT, see `LICENSE`.
