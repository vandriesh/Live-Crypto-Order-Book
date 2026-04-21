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

const MarketDataContext = createContext<MarketDataSnapshot | null>(null);

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
  const [value, setValue] = useState<MarketDataSnapshot>(() =>
    createInitialValue(market, marketType, requestedChannels),
  );
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

      setValue({
        market,
        marketType,
        requestedChannels,
        activeChannels: requestedChannels,
        connectionStatus: provider.getStatus(),
        lastMessageAt: orderBookSnapshot.eventTime,
        orderBookSnapshot,
      });
    };

    latestSnapshotRef.current = null;
    lastPublishedAtRef.current = 0;
    clearPendingPublish();

    setValue((currentValue) => ({
      market,
      marketType,
      requestedChannels,
      activeChannels: [],
      connectionStatus:
        currentValue.market === market ? "connecting" : "switching",
      lastMessageAt: emptySnapshot.eventTime,
      orderBookSnapshot: emptySnapshot,
    }));

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
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);

  if (!context) {
    throw new Error("useMarketData must be used inside DataProvider");
  }

  return context;
}
