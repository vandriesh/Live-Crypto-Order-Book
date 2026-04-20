import type {
  OrderBookLevel,
  OrderBookSnapshot,
  SupportedMarket,
} from "@neet/data";

export type BinanceDepthLevelTuple = [price: string, quantity: string];

export type BinanceDepthSnapshotPayload = {
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

const BINANCE_REST_ENDPOINT = "https://api.binance.com/api/v3/depth";
const BINANCE_WS_ENDPOINT = "wss://stream.binance.com:9443/ws";
const SNAPSHOT_LEVEL_LIMIT = 5000;
const EMITTED_LEVELS_PER_SIDE = 40;

export function toBinanceSymbol(market: SupportedMarket) {
  return market.toLowerCase();
}

export function createEmptyOrderBookSnapshot(
  market: SupportedMarket,
): OrderBookSnapshot {
  return {
    market,
    lastUpdateId: 0,
    eventTime: Date.now(),
    bids: [],
    asks: [],
    bestBid: 0,
    bestAsk: 0,
    spread: 0,
    spreadPercent: 0,
    midPrice: 0,
  };
}

function normalizeLevels(
  entries: Array<[price: number, quantity: number]>,
): OrderBookLevel[] {
  const maxQuantity = Math.max(...entries.map(([, quantity]) => quantity), 0);
  let cumulative = 0;

  return entries.map(([price, quantity]) => {
    cumulative += quantity;

    return {
      price,
      quantity,
      cumulative,
      notional: price * quantity,
      depthRatio: maxQuantity === 0 ? 0 : quantity / maxQuantity,
    };
  });
}

function toNormalizedSnapshot(args: {
  asks: Map<number, number>;
  bids: Map<number, number>;
  eventTime: number;
  market: SupportedMarket;
  lastUpdateId: number;
}): OrderBookSnapshot {
  const { asks, bids, eventTime, market, lastUpdateId } = args;
  const bidEntries = [...bids.entries()]
    .sort((left, right) => right[0] - left[0])
    .slice(0, EMITTED_LEVELS_PER_SIDE);
  const askEntries = [...asks.entries()]
    .sort((left, right) => left[0] - right[0])
    .slice(0, EMITTED_LEVELS_PER_SIDE);
  const normalizedBids = normalizeLevels(bidEntries);
  const normalizedAsks = normalizeLevels(askEntries);
  const bestBid = normalizedBids[0]?.price ?? 0;
  const bestAsk = normalizedAsks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
  const spreadPercent = midPrice === 0 ? 0 : (spread / midPrice) * 100;

  return {
    market,
    lastUpdateId,
    eventTime,
    bids: normalizedBids,
    asks: normalizedAsks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    midPrice,
  };
}

function applyDepthLevels(
  levels: BinanceDepthLevelTuple[],
  side: Map<number, number>,
) {
  for (const [priceAsString, quantityAsString] of levels) {
    const price = Number(priceAsString);
    const quantity = Number(quantityAsString);

    if (quantity === 0) {
      side.delete(price);
      continue;
    }

    side.set(price, quantity);
  }
}

async function fetchDepthSnapshot(
  market: SupportedMarket,
): Promise<BinanceDepthSnapshotPayload> {
  const response = await fetch(
    `${BINANCE_REST_ENDPOINT}?symbol=${market}&limit=${SNAPSHOT_LEVEL_LIMIT}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Binance depth snapshot for ${market}`);
  }

  return await response.json() as Promise<BinanceDepthSnapshotPayload>;
}

export class BinanceOrderBookStream {
  private asks = new Map<number, number>();
  private bids = new Map<number, number>();
  private bufferedEvents: BinanceDiffDepthPayload[] = [];
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;
  private isStopped = false;
  private socket: WebSocket | null = null;
  private updateId = 0;

  constructor(
    private readonly market: SupportedMarket,
    private readonly onSnapshot: (snapshot: OrderBookSnapshot) => void,
    private readonly onSyncLoss: () => void,
  ) {}

  start() {
    this.openSocket();
  }

  stop() {
    this.isStopped = true;
    this.socket?.close();
    this.socket = null;
    this.bufferedEvents = [];
    this.initializationPromise = null;
    this.isInitialized = false;
  }

  private openSocket() {
    const symbol = toBinanceSymbol(this.market);
    const socket = new WebSocket(`${BINANCE_WS_ENDPOINT}/${symbol}@depth@100ms`);
    this.socket = socket;

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as BinanceDiffDepthPayload;

      if (!this.isInitialized) {
        this.bufferedEvents.push(payload);

        if (!this.initializationPromise) {
          this.initializationPromise = this.initializeFromSnapshot();
        }

        return;
      }

      this.applyEvent(payload);
    });

    socket.addEventListener("close", () => {
      if (this.socket !== socket || this.isStopped) {
        return;
      }

      if (!this.isStopped) {
        this.restartFromScratch();
      }
    });
  }

  private async initializeFromSnapshot() {
    try {
      while (!this.isStopped) {
        const firstBufferedEvent = this.bufferedEvents[0];

        if (!firstBufferedEvent) {
          return;
        }

        const snapshot = await fetchDepthSnapshot(this.market);

        if (snapshot.lastUpdateId < firstBufferedEvent.U) {
          continue;
        }

        const relevantBufferedEvents = this.bufferedEvents.filter(
          (event) => event.u > snapshot.lastUpdateId,
        );
        const firstRelevantEvent = relevantBufferedEvents[0];

        if (
          firstRelevantEvent &&
          !(
            firstRelevantEvent.U <= snapshot.lastUpdateId &&
            snapshot.lastUpdateId <= firstRelevantEvent.u
          )
        ) {
          continue;
        }

        this.bids = new Map(
          snapshot.bids.map(([price, quantity]) => [Number(price), Number(quantity)]),
        );
        this.asks = new Map(
          snapshot.asks.map(([price, quantity]) => [Number(price), Number(quantity)]),
        );
        this.updateId = snapshot.lastUpdateId;
        this.isInitialized = true;
        this.bufferedEvents = [];

        this.onSnapshot(
          toNormalizedSnapshot({
            asks: this.asks,
            bids: this.bids,
            eventTime: Date.now(),
            market: this.market,
            lastUpdateId: this.updateId,
          }),
        );

        for (const bufferedEvent of relevantBufferedEvents) {
          this.applyEvent(bufferedEvent);
        }

        return;
      }
    } catch (error) {
      console.error("[BinanceOrderBookStream] Failed to sync snapshot", error);
      this.initializationPromise = null;
    }
  }

  private applyEvent(event: BinanceDiffDepthPayload) {
    if (event.u < this.updateId) {
      return;
    }

    if (event.U > this.updateId + 1) {
      this.restartFromScratch();
      return;
    }

    applyDepthLevels(event.b, this.bids);
    applyDepthLevels(event.a, this.asks);
    this.updateId = event.u;

    this.onSnapshot(
      toNormalizedSnapshot({
        asks: this.asks,
        bids: this.bids,
        eventTime: event.E,
        market: this.market,
        lastUpdateId: this.updateId,
      }),
    );
  }

  private restartFromScratch() {
    this.onSyncLoss();
    this.asks.clear();
    this.bids.clear();
    this.bufferedEvents = [];
    this.initializationPromise = null;
    this.isInitialized = false;
    this.updateId = 0;
    const previousSocket = this.socket;
    this.socket = null;
    previousSocket?.close();

    if (!this.isStopped) {
      this.openSocket();
    }
  }
}
