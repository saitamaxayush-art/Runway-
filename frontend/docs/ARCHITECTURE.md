# Architecture

State is one plain object (`src/data/initialState.js`) held by `useStore` and saved to localStorage. Pages receive `s` (state) and `set` (updater).

All finance rules are pure functions in `src/engine/finance.js`: `calc` derives metrics, `series` builds the 30 day forecast, `apply` returns a new state with a simulated decision. Because they are pure, the Simulator compares `calc(s)` against `calc(apply(s, decision))` without touching real data.

Routing uses the URL hash (`useHash`). `useRouteTransition` plays the wipe between routes and respects reduced motion. Pages are code split with `React.lazy`.

Layers: `utils` and `data` have no imports from the app, `engine` uses them, `hooks` and `components` use the engine, `pages` compose everything.
