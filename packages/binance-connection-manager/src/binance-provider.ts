import {
  type MarketConnectionStatus,
  type MarketDataListener,
  type MarketDataProvider,
  type SupportedMarket,
} from "@neet/data";

import {
  BinanceOrderBookStream,
  toBinanceSymbol,
} from "./binance-order-book-stream";

type OrderBookSubscription = {
  symbol: string;
  channel: "order-book";
  listener: MarketDataListener;
};

type ActiveOrderBookStream = {
  stream: BinanceOrderBookStream;
  subscriptionCount: number;
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
  private activeOrderBookStreams = new Map<string, ActiveOrderBookStream>();

  static getInstance() {
    if (!BinanceProvider.instance) {
      BinanceProvider.instance = new BinanceProvider();
    }

    return BinanceProvider.instance;
  }

  openSocket() {
    if (this.socketIsOpen) {
      return;
    }

    this.socketIsOpen = true;
  }

  connect() {
    this.openSocket();
    this.connectionStatus = "connected";
  }

  disconnect() {
    this.activeOrderBookStreams.forEach(({ stream }) => {
      stream.stop();
    });
    this.activeOrderBookStreams.clear();
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
    const existingStream = this.activeOrderBookStreams.get(symbol);

    if (existingStream) {
      existingStream.subscriptionCount += 1;
    } else {
      const stream = new BinanceOrderBookStream(
        market,
        (snapshot) => {
          this.connectionStatus = "connected";
          this.emit(channel, symbol, snapshot);
        },
        () => {
          this.connectionStatus = "connecting";
        },
      );

      this.activeOrderBookStreams.set(symbol, {
        stream,
        subscriptionCount: 1,
      });
      stream.start();
    }

    this.orderBookSubscriptions.set(subscriptionKey, {
      symbol,
      channel,
      listener,
    });

    return subscriptionKey;
  }

  unsubscribe(subscriptionKey: string) {
    const subscription = this.orderBookSubscriptions.get(subscriptionKey);

    if (!subscription) {
      return;
    }

    this.orderBookSubscriptions.delete(subscriptionKey);

    const activeStream = this.activeOrderBookStreams.get(subscription.symbol);

    if (activeStream) {
      activeStream.subscriptionCount -= 1;

      if (activeStream.subscriptionCount <= 0) {
        activeStream.stream.stop();
        this.activeOrderBookStreams.delete(subscription.symbol);
      }
    }

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
