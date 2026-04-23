import type { MarketDataSnapshot, SupportedMarket } from "@neet/data";
import {
  formatMarketLabel,
  formatPrice,
  formatPriceForDisplay,
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
import {
  bucketOrderBookLevels,
  createDisplayRows,
  type DisplayRow,
  getVisibleOrderBookLevels,
  isOperationVisible,
  type DepthMode,
  type TickSizeOption,
  type VisibleOperation,
} from "./utils";

const tickSizeOptions = ["0.01", "0.1", "1", "10", "50", "100", "1000"] as const;

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

type OrderBookDisplayActions = {
  setAnimationsEnabled: (value: boolean) => void;
  setDepthMode: (value: DepthMode) => void;
  setDisplayAverage: (value: boolean) => void;
  setRoundingEnabled: (value: boolean) => void;
  setShowRatio: (value: boolean) => void;
  setTickSize: (value: TickSizeOption) => void;
  setVisibleOperation: (value: VisibleOperation) => void;
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

const OrderBookDisplayActionsContext =
  createContext<OrderBookDisplayActions | null>(null);
const OrderBookDisplayStateContext =
  createContext<OrderBookDisplayState | null>(null);

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

export function OrderBookDisplayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    orderBookDisplayReducer,
    initialDisplayState,
  );

  const actions = useMemo<OrderBookDisplayActions>(
    () => ({
      setAnimationsEnabled: (value) => dispatch({ type: "set_animations_enabled", value }),
      setDepthMode: (value) => dispatch({ type: "set_depth_mode", value }),
      setDisplayAverage: (value) => dispatch({ type: "set_display_average", value }),
      setRoundingEnabled: (value) => dispatch({ type: "set_rounding_enabled", value }),
      setShowRatio: (value) => dispatch({ type: "set_show_ratio", value }),
      setTickSize: (value) => dispatch({ type: "set_tick_size", value }),
      setVisibleOperation: (value) =>
        dispatch({ type: "set_visible_operation", value }),
    }),
    [],
  );

  return (
    <OrderBookDisplayActionsContext.Provider value={actions}>
      <OrderBookDisplayStateContext.Provider value={state}>
        {children}
      </OrderBookDisplayStateContext.Provider>
    </OrderBookDisplayActionsContext.Provider>
  );
}

export function useOrderBookDisplayActions() {
  const context = useContext(OrderBookDisplayActionsContext);

  if (!context) {
    throw new Error(
      "useOrderBookDisplayActions must be used inside OrderBookDisplayProvider",
    );
  }

  return context;
}

export function useOrderBookDisplayState() {
  const context = useContext(OrderBookDisplayStateContext);

  if (!context) {
    throw new Error(
      "useOrderBookDisplayState must be used inside OrderBookDisplayProvider",
    );
  }

  return context;
}

export function useOrderBookDisplayViewData(args: {
  market: SupportedMarket;
  orderBookSnapshot: MarketDataSnapshot["orderBookSnapshot"];
}) {
  const { market, orderBookSnapshot: snapshot } = args;
  const state = useOrderBookDisplayState();
  const previousMidPriceByMarketRef = useRef(
    new Map<string, { direction: "down" | "up"; price: number }>(),
  );

  const previousMidPriceState = previousMidPriceByMarketRef.current.get(market);
  const persistedMidPriceDirection =
    previousMidPriceState == null
      ? "up"
      : snapshot.midPrice > previousMidPriceState.price
        ? "up"
        : snapshot.midPrice < previousMidPriceState.price
          ? "down"
          : previousMidPriceState.direction;

  useEffect(() => {
    previousMidPriceByMarketRef.current.set(market, {
      direction: persistedMidPriceDirection,
      price: snapshot.midPrice,
    });
  }, [market, persistedMidPriceDirection, snapshot.midPrice]);

  return useMemo<OrderBookDisplayView>(() => {
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

    return {
      asks: createDisplayRows({
        depthMode: state.depthMode,
        levels: bucketOrderBookLevels({
          levels: visibleAsks,
          operation: "ask",
          tickSize: state.tickSize,
        }).reverse(),
        operation: "ask",
        roundingEnabled: state.roundingEnabled,
        targetCount: visibleLevels,
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
        targetCount: visibleLevels,
        tickSize: state.tickSize,
      }),
      buyRatio: (buyTotal / combinedTotal) * 100,
      marketLabel,
      midPriceRow: {
        direction: persistedMidPriceDirection,
        price: formatPriceForDisplay(
          snapshot.midPrice,
          state.tickSize,
        ),
        referencePrice: formatPrice(snapshot.midPrice),
      },
      quoteAsset,
      sellRatio: 100 - (buyTotal / combinedTotal) * 100,
      showRatio: state.showRatio,
    };
  }, [market, persistedMidPriceDirection, snapshot, state]);
}

export function useOrderBookTickSizeOptions() {
  return tickSizeOptions;
}
