# NEET Crypto Order Book

Binance-inspired crypto order book built with React Router, React, TypeScript, and Tailwind CSS.

Live deployment:
- [https://neet-crypto.netlify.app](https://neet-crypto.netlify.app)

## Build And Run

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Frontend URL:
- `http://localhost:5173`

### Typecheck

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

## Assumptions

- The app focuses on 3 markets: `BTCUSDC`, `ETHUSDC`, and `SOLUSDC`.
- The order book should feel close to Binance in layout and interaction, but not every internal Binance behavior is publicly documented, so some UI details were inferred from observed behavior.
- A smoother visual cadence is acceptable for readability even when the underlying Binance feed updates more frequently.
- The localhost frontend port is the default Vite/React Router dev port: `5173`.

## Technology Choices

- `react` and `react-router`
  - Used for the UI, routing, and application structure.
- `typescript`
  - Used for safer refactors and clearer boundaries between data, feature, and UI layers.
- `tailwindcss`
  - Used for fast styling iteration and Binance-like UI tuning.
- `radix-ui`
  - Used for accessible primitives such as popovers, tooltips, select, checkbox, radio group, and switch.
- `class-variance-authority`
  - Used for concise variant-based styling in reusable UI/domain components.
- `Netlify`
  - Used for deployment and sharing the hosted solution.

## Architecture Notes

The codebase is split into small packages with explicit responsibilities:

- `@neet/data`
  - provider-agnostic market and contract types
- `@neet/binance-connection-manager`
  - Binance data access and subscription lifecycle
- `@neet/order-book`
  - order-book behavior, display settings, and feature orchestration
- `@neet/ui-domain-kit`
  - domain-specific presentational components
- `@neet/ui-kit`
  - lower-level reusable UI primitives
- `@neet/utils`
  - shared formatting helpers

## Bonus Challenges Attempted

- Netlify deployment
- Binance-like order book display popup
- Buy/Sell ratio widget
- Cumulative vs Amount depth visualization
- Hover-driven depth highlight behavior
- Avg.&Sum hover tooltip
- Order-book interaction and render optimization work

## Submission Checklist

- Git repository: this project is packaged as a Git repository.
- README instructions: included here.
- Localhost frontend port: `5173`.
- Deployment URL: [https://neet-crypto.netlify.app](https://neet-crypto.netlify.app)

GitHub upload and collaborator access:
- Upload the repository to GitHub
- Add `yeet-platform-devs` as viewer or contributor
