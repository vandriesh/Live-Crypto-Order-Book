import type { SupportedMarket } from "./index";

export type MarketDataChannel = "order-book" | "trades" | "ticker";
export type MarketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "switching";

export type OrderBookLevel = {
  price: number;
  quantity: number;
  cumulative: number;
  notional: number;
  depthRatio: number;
};

export type OrderBookSnapshot = {
  market: SupportedMarket;
  lastUpdateId: number;
  eventTime: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
};

export type MarketDataSnapshot = {
  market: SupportedMarket;
  marketType: string;
  requestedChannels: MarketDataChannel[];
  activeChannels: MarketDataChannel[];
  connectionStatus: MarketConnectionStatus;
  lastMessageAt: number | null;
  orderBookSnapshot: OrderBookSnapshot;
};

export type MarketDataListener = (snapshot: OrderBookSnapshot) => void;

export type MarketDataProvider = {
  openSocket: () => void;
  connect: () => void;
  disconnect: () => void;
  getStatus: () => MarketConnectionStatus;
  subscribe: (args: {
    market: SupportedMarket;
    channel: "order-book";
    listener: MarketDataListener;
  }) => string;
  unsubscribe: (subscriptionKey: string) => void;
};
