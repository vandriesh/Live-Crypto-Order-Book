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

  useEffect(() => {
    const subscriptionKeys: string[] = [];

    setValue((currentValue) => ({
      ...currentValue,
      market,
      marketType,
      requestedChannels,
      activeChannels: [],
      connectionStatus:
        currentValue.market === market ? "connecting" : "switching",
    }));

    if (requestedChannels.includes("order-book")) {
      const subscriptionKey = provider.subscribe({
        market,
        channel: "order-book",
        listener: (orderBookSnapshot) => {
          setValue({
            market,
            marketType,
            requestedChannels,
            activeChannels: requestedChannels,
            connectionStatus: provider.getStatus(),
            lastMessageAt: orderBookSnapshot.eventTime,
            orderBookSnapshot,
          });
        },
      });

      subscriptionKeys.push(subscriptionKey);
    }

    return () => {
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
