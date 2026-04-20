# @neet/data

Purpose: own provider-agnostic market-data contracts and user-facing shapes.

Scope:
- normalized order book output types
- provider contract interfaces
- supported market helpers used by the app layer

Current status:
- defines the output contract every market data provider should produce
- does not own Binance-specific payloads or transport implementation
