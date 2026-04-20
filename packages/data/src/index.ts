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

export const dataFeatureSummary = {
  packageName: "@neet/data",
  status: "placeholder",
  responsibility:
    "Own websocket subscriptions, cleanup, and depth stream normalization.",
  nextMilestones: [
    "Create a Binance depth stream client.",
    "Handle subscribe and teardown on market changes.",
    "Normalize bids and asks for the order book feature.",
  ],
} as const;
