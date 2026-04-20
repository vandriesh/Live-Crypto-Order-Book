# @neet/ui-domain-kit

Purpose: hold domain-aware UI components that understand NEET trading concepts while staying presentation-focused.

Current status:
- contains `BuySellRatioBar`
- contains `SymbolLogo`
- contains `OrderBookLevelRow`
- contains `TickSizeSelect`
- maps supported demo markets to local crypto SVG assets
- provides shared buy/sell ratio presentation for the order book
- provides shared ask/bid row presentation for the order book
- provides shared tick-size selection UI for the order book
- stays separate from `@neet/ui-kit`, which remains domain-agnostic
