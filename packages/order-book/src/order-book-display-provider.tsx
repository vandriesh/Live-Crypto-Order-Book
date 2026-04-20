import { useMarketData } from "@neet/binance-connection-manager";
import {
  ceilToTick,
  floorToTick,
  formatCompactNumber,
  formatMarketLabel,
  formatPrice,
  formatPriceForDisplay,
  formatQuantity,
} from "@neet/utils";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

const tickSizeOptions = ["0.01", "0.1", "1", "10", "50", "100", "1000"] as const;
const visibleOrderBookLevels = 15;

type TickSizeOption = (typeof tickSizeOptions)[number];
type DepthMode = "amount" | "cumulative";
type VisibleOperation = "ask" | "bid" | "both";

type OrderBookDisplayState = {
  animationsEnabled: boolean;
  depthMode: DepthMode;
  displayAverage: boolean;
  roundingEnabled: boolean;
  showRatio: boolean;
  tickSize: TickSizeOption;
  visibleOperation: VisibleOperation;
};

type OrderBookDisplayAction =
  | { type: "set_animations_enabled"; value: boolean }
  | { type: "set_depth_mode"; value: DepthMode }
  | { type: "set_display_average"; value: boolean }
  | { type: "set_rounding_enabled"; value: boolean }
  | { type: "set_show_ratio"; value: boolean }
  | { type: "set_tick_size"; value: TickSizeOption }
  | { type: "set_visible_operation"; value: VisibleOperation };

type DisplayRow = {
  amount: string;
  depthRatio: number;
  operation: "ask" | "bid";
  price: string;
  total: string;
};

type OrderBookDisplayView = {
  asks: DisplayRow[];
  baseAsset: string;
  buyRatio: number;
  marketLabel: string;
  midPriceRow: {
    direction: "down" | "flat" | "up";
    price: string;
    referencePrice: string;
  };
  quoteAsset: string;
  sellRatio: number;
  showRatio: boolean;
  bids: DisplayRow[];
};

type OrderBookDisplayContextValue = {
  actions: {
    setAnimationsEnabled: (value: boolean) => void;
    setDepthMode: (value: DepthMode) => void;
    setDisplayAverage: (value: boolean) => void;
    setRoundingEnabled: (value: boolean) => void;
    setShowRatio: (value: boolean) => void;
    setTickSize: (value: TickSizeOption) => void;
    setVisibleOperation: (value: VisibleOperation) => void;
  };
  state: OrderBookDisplayState;
  tickSizeOptions: readonly TickSizeOption[];
  view: OrderBookDisplayView;
};

const initialDisplayState: OrderBookDisplayState = {
  animationsEnabled: false,
  depthMode: "amount",
  displayAverage: true,
  roundingEnabled: true,
  showRatio: true,
  tickSize: "0.01",
  visibleOperation: "both",
};

const OrderBookDisplayContext =
  createContext<OrderBookDisplayContextValue | null>(null);

function orderBookDisplayReducer(
  state: OrderBookDisplayState,
  action: OrderBookDisplayAction,
) {
  switch (action.type) {
    case "set_animations_enabled":
      return { ...state, animationsEnabled: action.value };
    case "set_depth_mode":
      return { ...state, depthMode: action.value };
    case "set_display_average":
      return { ...state, displayAverage: action.value };
    case "set_rounding_enabled":
      return { ...state, roundingEnabled: action.value };
    case "set_show_ratio":
      return { ...state, showRatio: action.value };
    case "set_tick_size":
      return { ...state, tickSize: action.value };
    case "set_visible_operation":
      return { ...state, visibleOperation: action.value };
    default:
      return state;
  }
}

function getVisibleOrderBookLevels(visibleOperation: VisibleOperation) {
  return visibleOperation === "both"
    ? visibleOrderBookLevels
    : visibleOrderBookLevels * 2;
}

function isOperationVisible(
  visibleOperation: VisibleOperation,
  operation: "ask" | "bid",
) {
  return visibleOperation === "both" || visibleOperation === operation;
}

function createDisplayRows(args: {
  depthMode: DepthMode;
  levels: {
    cumulative: number;
    depthRatio: number;
    notional: number;
    price: number;
    quantity: number;
  }[];
  operation: "ask" | "bid";
  roundingEnabled: boolean;
  tickSize: TickSizeOption;
}) {
  const { depthMode, levels, operation, roundingEnabled, tickSize } = args;

  return levels.map((level) => ({
    amount: formatQuantity(level.quantity),
    depthRatio: level.depthRatio,
    operation,
    price: formatPriceForDisplay(level.price, roundingEnabled, tickSize),
    total:
      depthMode === "cumulative"
        ? formatQuantity(level.cumulative)
        : formatCompactNumber(level.notional),
  }));
}

function bucketOrderBookLevels(args: {
  levels: {
    depthRatio: number;
    notional: number;
    price: number;
    quantity: number;
  }[];
  operation: "ask" | "bid";
  tickSize: TickSizeOption;
}) {
  const { levels, operation, tickSize } = args;
  const buckets = new Map<number, { price: number; quantity: number }>();

  for (const level of levels) {
    const bucketPrice =
      operation === "ask"
        ? ceilToTick(level.price, tickSize)
        : floorToTick(level.price, tickSize);

    const existingBucket = buckets.get(bucketPrice);

    if (existingBucket) {
      existingBucket.quantity += level.quantity;
      continue;
    }

    buckets.set(bucketPrice, {
      price: bucketPrice,
      quantity: level.quantity,
    });
  }

  const sortedBuckets = [...buckets.values()].sort((left, right) =>
    operation === "ask" ? left.price - right.price : right.price - left.price,
  );

  const totalQuantity = sortedBuckets.reduce(
    (sum, bucket) => sum + bucket.quantity,
    0,
  );
  let cumulative = 0;

  return sortedBuckets.map((bucket) => {
    cumulative += bucket.quantity;

    return {
      cumulative,
      depthRatio: totalQuantity === 0 ? 0 : bucket.quantity / totalQuantity,
      notional: bucket.price * bucket.quantity,
      price: bucket.price,
      quantity: bucket.quantity,
    };
  });
}

export function OrderBookDisplayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const marketData = useMarketData();
  const { market, orderBookSnapshot: snapshot } = marketData;
  const previousMidPriceByMarketRef = useRef(new Map<string, number>());
  const [state, dispatch] = useReducer(
    orderBookDisplayReducer,
    initialDisplayState,
  );

  useEffect(() => {
    console.log("[OrderBookDisplayProvider] market data", marketData);
  }, [marketData]);

  const previousMidPrice = previousMidPriceByMarketRef.current.get(market);

  useEffect(() => {
    previousMidPriceByMarketRef.current.set(market, snapshot.midPrice);
  }, [market, snapshot.midPrice]);

  const value = useMemo<OrderBookDisplayContextValue>(() => {
    const marketLabel = formatMarketLabel(market);
    const [baseAsset, quoteAsset] = marketLabel.split("/");
    const visibleLevels = getVisibleOrderBookLevels(state.visibleOperation);
    const visibleAsks = isOperationVisible(state.visibleOperation, "ask")
      ? snapshot.asks.slice(0, visibleLevels)
      : [];
    const visibleBids = isOperationVisible(state.visibleOperation, "bid")
      ? snapshot.bids.slice(0, visibleLevels)
      : [];
    const buyTotal = snapshot.bids.reduce((sum, level) => sum + level.quantity, 0);
    const sellTotal = snapshot.asks.reduce((sum, level) => sum + level.quantity, 0);
    const combinedTotal = buyTotal + sellTotal || 1;
    const midPriceDirection =
      previousMidPrice == null
        ? "flat"
        : snapshot.midPrice > previousMidPrice
          ? "up"
          : snapshot.midPrice < previousMidPrice
            ? "down"
            : "flat";

    return {
      actions: {
        setAnimationsEnabled: (value) => dispatch({ type: "set_animations_enabled", value }),
        setDepthMode: (value) => dispatch({ type: "set_depth_mode", value }),
        setDisplayAverage: (value) => dispatch({ type: "set_display_average", value }),
        setRoundingEnabled: (value) => dispatch({ type: "set_rounding_enabled", value }),
        setShowRatio: (value) => dispatch({ type: "set_show_ratio", value }),
        setTickSize: (value) => dispatch({ type: "set_tick_size", value }),
        setVisibleOperation: (value) =>
          dispatch({ type: "set_visible_operation", value }),
      },
      state,
      tickSizeOptions,
      view: {
        asks: createDisplayRows({
          depthMode: state.depthMode,
          levels: bucketOrderBookLevels({
            levels: visibleAsks,
            operation: "ask",
            tickSize: state.tickSize,
          }).reverse(),
          operation: "ask",
          roundingEnabled: state.roundingEnabled,
          tickSize: state.tickSize,
        }),
        baseAsset,
        bids: createDisplayRows({
          depthMode: state.depthMode,
          levels: bucketOrderBookLevels({
            levels: visibleBids,
            operation: "bid",
            tickSize: state.tickSize,
          }),
          operation: "bid",
          roundingEnabled: state.roundingEnabled,
          tickSize: state.tickSize,
        }),
        buyRatio: (buyTotal / combinedTotal) * 100,
        marketLabel,
        midPriceRow: {
          direction: midPriceDirection,
          price: formatPriceForDisplay(
            snapshot.midPrice,
            state.roundingEnabled,
            state.tickSize,
          ),
          referencePrice: formatPrice(snapshot.midPrice),
        },
        quoteAsset,
        sellRatio: 100 - (buyTotal / combinedTotal) * 100,
        showRatio: state.showRatio,
      },
    };
  }, [market, previousMidPrice, snapshot, state]);

  return (
    <OrderBookDisplayContext.Provider value={value}>
      {children}
    </OrderBookDisplayContext.Provider>
  );
}

export function useOrderBookDisplay() {
  const context = useContext(OrderBookDisplayContext);

  if (!context) {
    throw new Error(
      "useOrderBookDisplay must be used inside OrderBookDisplayProvider",
    );
  }

  return context;
}
