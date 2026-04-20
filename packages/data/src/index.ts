export const supportedMarkets = ["BTCUSDC", "ETHUSDC", "SOLUSDC"] as const;

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
