import {
  type OrderBookLevel,
  type OrderBookSnapshot,
  type SupportedMarket,
} from "@neet/data";

export type BinanceDepthLevelTuple = [price: string, quantity: string];

export type BinancePartialDepthPayload = {
  lastUpdateId: number;
  bids: BinanceDepthLevelTuple[];
  asks: BinanceDepthLevelTuple[];
};

export type BinanceDiffDepthPayload = {
  e: "depthUpdate";
  E: number;
  s: string;
  U: number;
  u: number;
  b: BinanceDepthLevelTuple[];
  a: BinanceDepthLevelTuple[];
};

export type BinanceOrderBookMessage = {
  partialDepthPayload: BinancePartialDepthPayload;
  diffDepthPayload: BinanceDiffDepthPayload;
  snapshot: OrderBookSnapshot;
};

type MockOrderBookOptions = {
  levels?: number;
  intervalMs?: number;
};

type InternalMarketState = {
  market: SupportedMarket;
  basePrice: number;
  tickSize: number;
  spreadTicks: number;
  lastUpdateId: number;
  sequence: number;
};

const marketConfig: Record<
  SupportedMarket,
  {
    basePrice: number;
    tickSize: number;
    spreadTicks: number;
  }
> = {
  BTCUSDC: { basePrice: 75136.08, tickSize: 0.01, spreadTicks: 2 },
  ETHUSDC: { basePrice: 3568.42, tickSize: 0.01, spreadTicks: 3 },
  SOLUSDC: { basePrice: 172.63, tickSize: 0.001, spreadTicks: 4 },
};

export function toBinanceSymbol(market: SupportedMarket) {
  return market.toLowerCase();
}

function createInitialState(market: SupportedMarket): InternalMarketState {
  const config = marketConfig[market];

  return {
    market,
    basePrice: config.basePrice,
    tickSize: config.tickSize,
    spreadTicks: config.spreadTicks,
    lastUpdateId: 100000,
    sequence: 0,
  };
}

function createSeededValue(seed: number) {
  const value = Math.sin(seed) * 10000;

  return value - Math.floor(value);
}

function roundToTick(value: number, tickSize: number) {
  const rounded = Math.round(value / tickSize) * tickSize;

  return Number(rounded.toFixed(getPriceScale(tickSize)));
}

function getPriceScale(tickSize: number) {
  const tickString = tickSize.toString();
  const decimalIndex = tickString.indexOf(".");

  return decimalIndex === -1 ? 0 : tickString.length - decimalIndex - 1;
}

function getQuantityScale(market: SupportedMarket) {
  if (market === "SOLUSDC") {
    return 3;
  }

  return 5;
}

function formatNumber(value: number, scale: number) {
  return value.toFixed(scale);
}

function createBaseQuantity(
  state: InternalMarketState,
  side: "bid" | "ask",
  index: number,
) {
  const sideSeed = side === "bid" ? 11 : 29;
  const noise = createSeededValue(state.sequence * 37 + index * 19 + sideSeed);
  const quantityBias = side === "bid" ? 1.15 : 0.92;
  const baseQuantity =
    ((state.market === "BTCUSDC" ? 0.0048 : state.market === "ETHUSDC" ? 0.068 : 1.45) /
      (index + 1)) *
    quantityBias;

  return baseQuantity * (0.65 + noise);
}

function buildDepthTuples(
  state: InternalMarketState,
  side: "bid" | "ask",
  levels: number,
) {
  const tuples: BinanceDepthLevelTuple[] = [];
  const priceScale = getPriceScale(state.tickSize);
  const quantityScale = getQuantityScale(state.market);
  const halfSpread = (state.spreadTicks * state.tickSize) / 2;

  for (let index = 0; index < levels; index += 1) {
    const priceOffset = halfSpread + index * state.tickSize;
    const rawPrice =
      side === "bid"
        ? state.basePrice - priceOffset
        : state.basePrice + priceOffset;
    const price = roundToTick(rawPrice, state.tickSize);
    const quantity = createBaseQuantity(state, side, index);

    tuples.push([
      formatNumber(price, priceScale),
      formatNumber(quantity, quantityScale),
    ]);
  }

  return tuples;
}

function normalizeLevels(
  levels: BinanceDepthLevelTuple[],
  maxQuantity: number,
): OrderBookLevel[] {
  let cumulative = 0;

  return levels.map(([price, quantity]) => {
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    cumulative += parsedQuantity;

    return {
      price: parsedPrice,
      quantity: parsedQuantity,
      cumulative,
      notional: parsedPrice * parsedQuantity,
      depthRatio: maxQuantity === 0 ? 0 : parsedQuantity / maxQuantity,
    };
  });
}

function createPartialDepthPayload(
  state: InternalMarketState,
  levels: number,
): BinancePartialDepthPayload {
  return {
    lastUpdateId: state.lastUpdateId,
    bids: buildDepthTuples(state, "bid", levels),
    asks: buildDepthTuples(state, "ask", levels),
  };
}

function createDiffDepthPayload(
  state: InternalMarketState,
  levels: number,
): BinanceDiffDepthPayload {
  const changedLevels = Math.min(levels, 4);

  return {
    e: "depthUpdate",
    E: Date.now(),
    s: toBinanceSymbol(state.market),
    U: state.lastUpdateId - 2,
    u: state.lastUpdateId,
    b: buildDepthTuples(state, "bid", changedLevels),
    a: buildDepthTuples(state, "ask", changedLevels),
  };
}

function createOrderBookSnapshot(
  market: SupportedMarket,
  partialDepthPayload: BinancePartialDepthPayload,
): OrderBookSnapshot {
  const maxQuantity = Math.max(
    ...partialDepthPayload.bids.map(([, quantity]) => Number(quantity)),
    ...partialDepthPayload.asks.map(([, quantity]) => Number(quantity)),
    0,
  );
  const bids = normalizeLevels(partialDepthPayload.bids, maxQuantity);
  const asks = normalizeLevels(partialDepthPayload.asks, maxQuantity);
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
  const spreadPercent = midPrice === 0 ? 0 : (spread / midPrice) * 100;

  return {
    market,
    lastUpdateId: partialDepthPayload.lastUpdateId,
    eventTime: Date.now(),
    bids,
    asks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    midPrice,
  };
}

function advanceMarketState(state: InternalMarketState) {
  state.sequence += 1;
  state.lastUpdateId += 3;

  const driftSeed = createSeededValue(state.sequence * 13 + state.basePrice);
  const signedDrift = (driftSeed - 0.5) * state.tickSize * 6;
  state.basePrice = roundToTick(state.basePrice + signedDrift, state.tickSize);
}

function createBinanceMockService() {
  const states = new Map<SupportedMarket, InternalMarketState>();

  function getState(market: SupportedMarket) {
    const existingState = states.get(market);

    if (existingState) {
      return existingState;
    }

    const initialState = createInitialState(market);
    states.set(market, initialState);
    return initialState;
  }

  function getMessage(
    market: SupportedMarket,
    options: MockOrderBookOptions = {},
  ): BinanceOrderBookMessage {
    const state = getState(market);
    const levels = options.levels ?? 12;
    const partialDepthPayload = createPartialDepthPayload(state, levels);
    const diffDepthPayload = createDiffDepthPayload(state, levels);
    const snapshot = createOrderBookSnapshot(market, partialDepthPayload);

    return {
      partialDepthPayload,
      diffDepthPayload,
      snapshot,
    };
  }

  function subscribe(
    market: SupportedMarket,
    listener: (message: BinanceOrderBookMessage) => void,
    options: MockOrderBookOptions = {},
  ) {
    const state = getState(market);
    const intervalMs = options.intervalMs ?? 1200;

    listener(getMessage(market, options));

    const intervalId = window.setInterval(() => {
      advanceMarketState(state);
      listener(getMessage(market, options));
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }

  return {
    getMessage,
    getOrderBookSnapshot(market: SupportedMarket, options?: MockOrderBookOptions) {
      return getMessage(market, options).snapshot;
    },
    subscribe,
  };
}

export const binanceMockService = createBinanceMockService();
