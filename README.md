# Push Your Luck

A modular rewrite of the original single-file Push Your Luck prototype using **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. The codebase splits the UI, state management, and game math so that each part is independently testable.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:5173 to play.

Run the test suite with:

```bash
npm test
```

## Deploying to GitHub Pages

This project ships with a GitHub Actions workflow that builds the Vite app and
publishes the generated `dist/` directory to the `gh-pages` branch. To deploy:

1. Enable GitHub Pages in the repository settings and choose the `gh-pages`
   branch as the publication source.
2. Push to `main` (or trigger the workflow manually). The action will run
   `npm ci` and `npm run build`, then upload the compiled assets from `dist/`.
3. GitHub Pages will serve the static bundle that references the hashed
   JavaScript files Vite produces, avoiding 404s for `src/main.tsx`.

## Project structure

```
push-your-luck/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ tailwind.config.cjs
├─ postcss.config.cjs
└─ src/
   ├─ main.tsx                      # mounts <App />
   ├─ App.tsx                       # page shell, layout, routes (if any)
   ├─ styles/
   │  └─ tailwind.css               # Tailwind base/components/utilities import
   ├─ types/
   │  └─ dice.ts                    # shared types (Die, RollResult, etc.)
   ├─ lib/                          # pure, testable game logic (no React here)
   │  ├─ econ.ts                    # cost formulas and inflation math
   │  ├─ heat.ts                    # computeStartingHeat, payoutFromDiceCount
   │  ├─ prob.ts                    # bust chance, expected successes
   │  └─ format.ts                  # small helpers (toFixed, clamp)
   ├─ state/                        # React state management
   │  ├─ gameReducer.ts             # reducer for all game actions
   │  ├─ GameContext.tsx            # provider + hooks (useGame, useGameActions)
   │  └─ selectors.ts               # derived data helpers
   ├─ components/                   # presentational components
   │  ├─ Card.tsx
   │  ├─ DiceIcon.tsx
   │  ├─ DiceTile.tsx
   │  ├─ DiceList.tsx
   │  ├─ Controls.tsx
   │  ├─ Panels/
   │  │  ├─ StatsPanel.tsx
   │  │  ├─ UpgradesPanel.tsx
   │  │  └─ AutomationPanel.tsx
   │  └─ Log.tsx
   ├─ pages/
   │  └─ GamePage.tsx               # composes panels + controls
   └─ tests/                        # vitest unit coverage for pure logic
      ├─ econ.test.ts
      ├─ heat.test.ts
      ├─ prob.test.ts
      └─ reducer.test.ts
```

## Key ideas

* **Pure math in `lib/`** – deterministic helpers (economy, heat, probability, formatting) are free of React and fully unit-tested.
* **State isolation** – `state/gameReducer.ts` centralizes all mutations while selectors compute derived pricing and status values.
* **Presentational components** – `components/` focuses on rendering; they receive their data via props for easy testing and reuse.
* **Tailwind styling** – styling lives in utility classes powered by `src/styles/tailwind.css`.
* **Keyboard + automation loops** – `GamePage` wires reducer actions to keyboard shortcuts, automation timers, and interest ticks.

This setup replaces the monolithic `index.html` with a maintainable architecture that keeps gameplay logic, UI, and state management cleanly separated.
