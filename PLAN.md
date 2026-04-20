# YEET Order Book Plan

## Source of truth
This plan is derived from [YEET Order book take home (3).pdf](/Users/vandries/Downloads/YEET%20Order%20book%20take%20home%20%283%29.pdf).

Rules for this document:
- Items under the feature sections are exact requirements or functionality explicitly mentioned in the PDF.
- Architecture notes are labeled as rationale, not as PDF requirements.
- Progress is tracked by milestone and is meant to be updated after each commit.

## Feature: `@neet/data`

### Exact PDF requirements
- Get order book data from Binance using their open API.
- Recommended websocket endpoint:
  - `wss://stream.binance.com:9443/ws/${symbol}@depth${levels}${speedSuffix}`
- The application must allow the user to change the currently selected market.
- Any 3 markets may be chosen.
- Websocket subscriptions must be properly opened and closed when the market changes.
- The order book updates several times per second, so the implementation must use as few resources as possible.
- Frontend architecture is part of the evaluation, including:
  - where data is requested
  - how hooks are used
  - how memoization is used

### Architecture rationale
- `@neet/data` owns stream acquisition, subscription lifecycle, normalization, and source-of-truth contracts.
- Contracts and interfaces live here because the data is born here.
- `@neet/order-book` should consume exported contracts from this package.
- Do not create a detached shared `types.ts` layer for these contracts.

## Feature: `@neet/order-book`

### Exact PDF requirements
- Build a fully featured order book component.
- Copy the Binance order book as closely as possible in both design and functionality.
- The order book component must use React.
- Show relevant bids and asks data as it arrives from the stream.
- Allow the user to change the selected market for any 3 chosen markets.
- Add support for rounding.
- Add decimals option behavior similar to Binance.
- Show or hide Buy/Sell ratio.
- Support both Cumulative Depth and Amount Depth.
- Highlight elements closer to the center on hover.
- Bonus:
  - animations are a nice to have

### Architecture rationale
- `@neet/order-book` is the smart component/container.
- It owns order book orchestration, display settings, and rendering behavior.
- It imports source-of-truth data contracts from `@neet/data`.
- It stays focused on book behavior and UI, not websocket transport details.

## Project-level delivery requirements

### Exact PDF requirements
- Package the solution in a Git repository.
- Include a `README.md` with:
  - clear instructions on how to build and run the application
  - any assumptions made
  - a brief explanation of technology choices and libraries
  - mention any bonus challenges attempted
- Ensure the application runs on localhost and specify the frontend port.
- Upload the code to GitHub and add `yeet-platform-devs` as viewer or contributor.
- Ideally deploy the app to a service like Netlify and share the URL.

## Commit progress tracking

<table>
  <thead>
    <tr>
      <th>Milestone</th>
      <th>PDF requirements covered</th>
      <th>Status</th>
      <th>Commit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="4"><strong>Cross-cutting</strong> - repo scaffolding, performance, and submission requirements</td>
    </tr>
    <tr>
      <td>Scaffold package boundaries and aliases</td>
      <td>Architecture evaluation, package split foundation</td>
      <td><code>[x]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Performance pass for frequent updates</td>
      <td>Efficient updates, low resource usage, hooks/memoization quality</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>README and submission requirements</td>
      <td>README, localhost port, GitHub, collaborator, deploy URL</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="4"><strong>@neet/data</strong> - data acquisition, contracts, and subscription lifecycle</td>
    </tr>
    <tr>
      <td>Define Binance stream contract and normalization</td>
      <td>Binance data source, source-owned contracts, normalization boundary</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Implement Binance websocket stream connection</td>
      <td>Get order book data from Binance open API using the recommended websocket endpoint</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add market switching and subscription lifecycle</td>
      <td>3 markets, proper open/close of subscriptions</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td colspan="4"><strong>@neet/order-book</strong> - smart container, controls, and ladder rendering</td>
    </tr>
    <tr>
      <td>Build the Binance-inspired order book shell</td>
      <td>Fully featured order book component, React implementation, Binance-like design/functionality baseline</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Render initial bid/ask ladder</td>
      <td>Show bids and asks as data arrives</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add market switching UI</td>
      <td>Allow the user to change the selected market for 3 chosen markets</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add rounding and decimals controls</td>
      <td>Rounding, Binance-like decimals option</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add ratio toggle and depth mode toggle</td>
      <td>Show/hide Buy/Sell ratio, cumulative depth, amount depth</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add hover-center highlighting</td>
      <td>Highlight elements closer to the center on hover</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Add bonus animations</td>
      <td>Optional animation polish</td>
      <td><code>[ ]</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

Status legend:
- `[ ]` not started
- `[~]` in progress
- `[x]` done

## Type and contract ownership rule
- Raw Binance message shapes belong in `@neet/data`.
- Normalized order book shapes belong in `@neet/data`.
- `@neet/order-book` imports those exported contracts.
- Shared consumption happens by export/import, not by redefining interfaces elsewhere.

## Acceptance check
This plan is complete when:
- every explicit PDF feature is represented exactly once
- non-PDF architecture choices are clearly labeled as rationale
- progress can be updated after each commit without changing this file's structure
- package ownership is clear enough to implement without inventing new boundaries
