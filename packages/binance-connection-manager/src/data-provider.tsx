import {
  type MarketDataSnapshot,
  type SupportedMarket,
} from "@neet/data";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  binanceProvider,
  type BinanceProvider,
} from "./binance-provider";
import { createEmptyOrderBookSnapshot } from "./binance-order-book-stream";

type DataProviderProps = {
  children: ReactNode;
  market: SupportedMarket;
  marketType: string;
  channels?: MarketDataSnapshot["requestedChannels"];
  provider?: BinanceProvider;
};

const defaultChannels: MarketDataSnapshot["requestedChannels"] = ["order-book"];
const publishIntervalMs = 1000;

type MarketDataMeta = Omit<
  MarketDataSnapshot,
  "lastMessageAt" | "orderBookSnapshot"
>;
type MarketDataLive = Pick<
  MarketDataSnapshot,
  "lastMessageAt" | "orderBookSnapshot"
>;

const MarketDataMetaContext = createContext<MarketDataMeta | null>(null);
const MarketDataLiveContext = createContext<MarketDataLive | null>(null);

function createInitialValue(
  market: SupportedMarket,
  marketType: string,
  requestedChannels: MarketDataSnapshot["requestedChannels"],
): MarketDataSnapshot {
  const orderBookSnapshot = createEmptyOrderBookSnapshot(market);

  return {
    market,
    marketType,
    requestedChannels,
    activeChannels: [],
    connectionStatus: "idle",
    lastMessageAt: orderBookSnapshot.eventTime,
    orderBookSnapshot,
  };
}

export function DataProvider({
  children,
  market,
  marketType,
  channels = defaultChannels,
  provider = binanceProvider,
}: DataProviderProps) {
  const requestedChannels = useMemo(() => [...channels], [channels]);
  const [meta, setMeta] = useState<MarketDataMeta>(() => {
    const initialValue = createInitialValue(market, marketType, requestedChannels);

    return {
      activeChannels: initialValue.activeChannels,
      connectionStatus: initialValue.connectionStatus,
      market: initialValue.market,
      marketType: initialValue.marketType,
      requestedChannels: initialValue.requestedChannels,
    };
  });
  const [live, setLive] = useState<MarketDataLive>(() => {
    const initialValue = createInitialValue(market, marketType, requestedChannels);

    return {
      lastMessageAt: initialValue.lastMessageAt,
      orderBookSnapshot: initialValue.orderBookSnapshot,
    };
  });
  const latestSnapshotRef = useRef<MarketDataSnapshot["orderBookSnapshot"] | null>(
    null,
  );
  const publishTimeoutRef = useRef<number | null>(null);
  const lastPublishedAtRef = useRef(0);

  useEffect(() => {
    const subscriptionKeys: string[] = [];
    const emptySnapshot = createEmptyOrderBookSnapshot(market);

    const clearPendingPublish = () => {
      if (publishTimeoutRef.current != null) {
        window.clearTimeout(publishTimeoutRef.current);
        publishTimeoutRef.current = null;
      }
    };

    const publishSnapshot = (
      orderBookSnapshot: MarketDataSnapshot["orderBookSnapshot"],
    ) => {
      lastPublishedAtRef.current = Date.now();
      clearPendingPublish();

      setMeta((currentMeta) => {
        const nextMeta: MarketDataMeta = {
          activeChannels: requestedChannels,
          connectionStatus: provider.getStatus(),
          market,
          marketType,
          requestedChannels,
        };

        if (
          currentMeta.market === nextMeta.market &&
          currentMeta.marketType === nextMeta.marketType &&
          currentMeta.connectionStatus === nextMeta.connectionStatus &&
          currentMeta.requestedChannels === nextMeta.requestedChannels &&
          currentMeta.activeChannels === nextMeta.activeChannels
        ) {
          return currentMeta;
        }

        return nextMeta;
      });
      setLive({
        lastMessageAt: orderBookSnapshot.eventTime,
        orderBookSnapshot,
      });
    };

    latestSnapshotRef.current = null;
    lastPublishedAtRef.current = 0;
    clearPendingPublish();

    setMeta((currentMeta) => ({
      market,
      marketType,
      requestedChannels,
      activeChannels: [],
      connectionStatus:
        currentMeta.market === market ? "connecting" : "switching",
    }));
    setLive({
      lastMessageAt: emptySnapshot.eventTime,
      orderBookSnapshot: emptySnapshot,
    });

    if (requestedChannels.includes("order-book")) {
      const subscriptionKey = provider.subscribe({
        market,
        channel: "order-book",
        listener: (orderBookSnapshot) => {
          latestSnapshotRef.current = orderBookSnapshot;

          const now = Date.now();
          const elapsed = now - lastPublishedAtRef.current;

          if (lastPublishedAtRef.current === 0 || elapsed >= publishIntervalMs) {
            publishSnapshot(orderBookSnapshot);
            return;
          }

          if (publishTimeoutRef.current != null) {
            return;
          }

          publishTimeoutRef.current = window.setTimeout(() => {
            if (latestSnapshotRef.current) {
              publishSnapshot(latestSnapshotRef.current);
            }
          }, publishIntervalMs - elapsed);
        },
      });

      subscriptionKeys.push(subscriptionKey);
    }

    return () => {
      clearPendingPublish();
      latestSnapshotRef.current = null;
      lastPublishedAtRef.current = 0;

      subscriptionKeys.forEach((subscriptionKey) => {
        provider.unsubscribe(subscriptionKey);
      });
    };
  }, [market, marketType, provider, requestedChannels]);

  return (
    <MarketDataMetaContext.Provider value={meta}>
      <MarketDataLiveContext.Provider value={live}>
        {children}
      </MarketDataLiveContext.Provider>
    </MarketDataMetaContext.Provider>
  );
}

export function useMarketDataMeta() {
  const context = useContext(MarketDataMetaContext);

  if (!context) {
    throw new Error("useMarketDataMeta must be used inside DataProvider");
  }

  return context;
}

export function useMarketDataLive() {
  const context = useContext(MarketDataLiveContext);

  if (!context) {
    throw new Error("useMarketDataLive must be used inside DataProvider");
  }

  return context;
}

export function useMarketData() {
  const meta = useMarketDataMeta();
  const live = useMarketDataLive();

  return useMemo(
    () => ({
      ...meta,
      ...live,
    }),
    [live, meta],
  );
}
