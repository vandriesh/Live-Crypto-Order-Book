export const supportedMarkets = ["BTCUSDC", "ETHUSDC", "SOLUSDC"] as const;

export type SupportedMarket = (typeof supportedMarkets)[number];

export const defaultMarket: SupportedMarket = supportedMarkets[0];

export function isSupportedMarket(
  market: string | undefined,
): market is SupportedMarket {
  return supportedMarkets.includes(market as SupportedMarket);
}

export function formatMarketLabel(market: string) {
  const quote = market.slice(-4);
  const base = market.slice(0, -4);

  return `${base}/${quote}`;
}

export type {
  MarketConnectionStatus,
  MarketDataChannel,
  MarketDataListener,
  MarketDataProvider,
  MarketDataSnapshot,
  OrderBookLevel,
  OrderBookSnapshot,
} from "./market-data-contract";

export const dataFeatureSummary = {
  packageName: "@neet/data",
  status: "placeholder",
  responsibility:
    "Own provider-agnostic market-data contracts and normalized output shapes.",
  nextMilestones: [
    "Stabilize the app-facing market data contract.",
    "Keep consumers independent from provider-specific payloads.",
    "Support multiple provider implementations behind one output format.",
  ],
} as const;
