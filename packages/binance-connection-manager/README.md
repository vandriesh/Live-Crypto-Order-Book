# @neet/binance-connection-manager

Purpose: provide the Binance-specific market-data provider implementation and React market-data context.

High-level responsibility:
- receive the active market from the route layer
- translate route-level `market` into Binance `symbol`
- own Binance payload shapes and provider-specific mapping
- keep websocket-ish transport logic in a singleton
- manage subscribe/unsubscribe when the market changes
- expose connection state through a provider + hook API
- output the provider-agnostic `@neet/data` contract to consumers

Current status:
- contains `BinanceProvider` singleton
- contains `DataProvider` React context provider
- contains `useMarketData()` consumer hook
- contains the Binance mock service for now
- currently wires only the `order-book` channel
