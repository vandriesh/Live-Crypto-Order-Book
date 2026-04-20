import {
  type MarketConnectionStatus,
  type MarketDataListener,
  type MarketDataProvider,
  type SupportedMarket,
} from "@neet/data";

import { binanceMockService, toBinanceSymbol } from "./binance-mock-service";

type OrderBookSubscription = {
  symbol: string;
  channel: "order-book";
  listener: MarketDataListener;
  unsubscribeTransport: () => void;
};

type SubscribeToOrderBookArgs = {
  market: SupportedMarket;
  channel: "order-book";
  listener: MarketDataListener;
};

export class BinanceProvider implements MarketDataProvider {
  private static instance: BinanceProvider | null = null;

  private socketIsOpen = false;
  private connectionStatus: MarketConnectionStatus = "idle";
  private orderBookSubscriptions = new Map<string, OrderBookSubscription>();

  static getInstance() {
    if (!BinanceProvider.instance) {
      BinanceProvider.instance = new BinanceProvider();
    }

    return BinanceProvider.instance;
  }

  openSocket() {
    this.socketIsOpen = true;
  }

  connect() {
    this.openSocket();
    this.connectionStatus = "connected";
  }

  disconnect() {
    this.orderBookSubscriptions.forEach((subscription) => {
      subscription.unsubscribeTransport();
    });
    this.orderBookSubscriptions.clear();
    this.socketIsOpen = false;
    this.connectionStatus = "idle";
  }

  getStatus() {
    return this.connectionStatus;
  }

  subscribe({ market, channel, listener }: SubscribeToOrderBookArgs) {
    const symbol = toBinanceSymbol(market);
    this.connect();
    this.connectionStatus = this.orderBookSubscriptions.size === 0
      ? "connecting"
      : "switching";

    const subscriptionKey = `${channel}:${symbol}:${crypto.randomUUID()}`;
    const unsubscribeTransport = binanceMockService.subscribe(
      market,
      (message) => {
        this.connectionStatus = "connected";
        this.emit(channel, symbol, message.snapshot);
      },
    );

    this.orderBookSubscriptions.set(subscriptionKey, {
      symbol,
      channel,
      listener,
      unsubscribeTransport,
    });

    return subscriptionKey;
  }

  unsubscribe(subscriptionKey: string) {
    const subscription = this.orderBookSubscriptions.get(subscriptionKey);

    if (!subscription) {
      return;
    }

    subscription.unsubscribeTransport();
    this.orderBookSubscriptions.delete(subscriptionKey);

    if (this.orderBookSubscriptions.size === 0) {
      this.disconnect();
    }
  }

  emit(
    channel: "order-book",
    symbol: string,
    snapshot: Parameters<MarketDataListener>[0],
  ) {
    this.orderBookSubscriptions.forEach((subscription) => {
      if (subscription.channel !== channel || subscription.symbol !== symbol) {
        return;
      }

      subscription.listener(snapshot);
    });
  }
}

export const binanceProvider = BinanceProvider.getInstance();
