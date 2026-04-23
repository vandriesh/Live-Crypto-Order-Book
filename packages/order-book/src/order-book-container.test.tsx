import { render, screen } from "@testing-library/react";
import type { MarketDataSnapshot, OrderBookLevel } from "@neet/data";
import { describe, expect, it, vi } from "vitest";

import { createAsciiVisualLayer } from "./ascii-order-book.ts";
import { OrderBookContainer } from "./order-book-container";

let mockMarketData: MarketDataSnapshot;

vi.mock("@neet/binance-connection-manager", () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => children,
  useMarketData: () => mockMarketData,
}));

vi.mock("./order-book-display-popup", () => ({
  OrderBookDisplayPopup: () => <div data-testid="order-book-display-popup" />,
}));

vi.mock("./use-row-update-animation", () => ({
  useRowUpdateAnimation: () => new Set(["85.55", "85.46"]),
}));

vi.mock("../../ui-domain-kit/src/buy-sell-ratio-bar.tsx", () => ({
  BuySellRatioBar: ({
    buyPercent,
    sellPercent,
  }: {
    buyPercent: number;
    sellPercent: number;
  }) => (
    <span data-testid="mock-buy-sell-ratio-bar">
      {`B ${buyPercent.toFixed(2)}% [${
        "+".repeat(Math.round((buyPercent / 100) * 10))
      }${
        "-".repeat(Math.max(0, 10 - Math.round((buyPercent / 100) * 10)))
      }] ${sellPercent.toFixed(2)}% S`}
    </span>
  ),
}));

vi.mock("../../ui-domain-kit/src/order-book-mid-price-row.tsx", () => ({
  OrderBookMidPriceRow: ({
    direction,
    price,
    referencePrice,
  }: {
    direction: "down" | "flat" | "up";
    price: string;
    referencePrice: string;
  }) => (
    <span data-testid="mock-order-book-mid-price-row">
      {`${price}${direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}${referencePrice}`}
    </span>
  ),
}));

vi.mock("../../ui-domain-kit/src/order-book-visual-layer.tsx", () => ({
  OrderBookVisualLayer: ({
    animated = false,
    depthRatio,
  }: {
    animated?: boolean;
    className?: string;
    depthRatio: number;
    hoverState?: "active" | "idle";
    tone: "ask" | "bid";
  }) => (
    <i
      aria-hidden="true"
      data-testid="mock-order-book-visual-layer"
    >
      {createAsciiVisualLayer({ animated, percentage: depthRatio })}
    </i>
  ),
}));

function createLevel(price: number, quantity: number): OrderBookLevel {
  const notional = price * quantity;

  return {
    cumulative: notional,
    depthRatio: 0,
    notional,
    price,
    quantity,
  };
}

function createMockMarketData(): MarketDataSnapshot {
  return {
    activeChannels: ["order-book"],
    connectionStatus: "connected",
    lastMessageAt: 1_713_795_200_000,
    market: "SOLUSDC",
    marketType: "spot",
    orderBookSnapshot: {
      asks: [
        createLevel(85.53, 970.404),
        createLevel(85.55, 461.855),
        createLevel(85.56, 1126.869),
        createLevel(85.57, 168.563),
        createLevel(85.58, 404.247),
      ],
      bestAsk: 85.49,
      bestBid: 85.48,
      bids: [
        createLevel(85.48, 169.343),
        createLevel(85.46, 368.578),
        createLevel(85.45, 473.083),
        createLevel(85.44, 1032.387),
        createLevel(85.41, 805.008),
      ],
      eventTime: 1_713_795_200_000,
      lastUpdateId: 10,
      market: "SOLUSDC",
      midPrice: 85.485,
      spread: 0.01,
      spreadPercent: 0.011697824273583632,
    },
    requestedChannels: ["order-book"],
  };
}

function sanitizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, "");
}

function sanitizeSnapshotRows(rows: string[]) {
  return rows
    .map((row) => {
      if (row.indexOf("---") === 0 || row.indexOf("===") === 0) {
        return "";
      }

      return sanitizeText(row);
    })
    .join("");
}

describe("OrderBookContainer", () => {
  it("renders a SOLUSDC snapshot with compact totals and mocked visual layers", () => {
    mockMarketData = createMockMarketData();

    render(
      <OrderBookContainer market="SOLUSDC" marketType="spot" />,
    );

    const actualContent = sanitizeText(
      screen.getByTestId("order-book-section").textContent,
    );

    const expectedContent = sanitizeSnapshotRows([
      `Price(USDC)Amount(SOL)   Total`,
      `==============================`,
      `                  ░░░░░░░░░░░░`,
      `85.58       404.24700    34.6K`,
      `------------------------------`,
      `                           ░░░`,
      `85.57       168.56300   14.42K`,
      `------------------------------`,
      `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
      `85.56     1,126.86900   96.41K`,
      `------------------------------`,
      `▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓`,
      `85.55       461.85500   39.51K`,
      `------------------------------`,
      `   ░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
      `85.53       970.40400      83K`,
//    `==============================`,
      `85.485  ↑               85.485`,
//    `==============================`,
      `                        ░░░░░░`,
      `85.48       169.34300   14.48K`,
//    `------------------------------`,
      `▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓`,
      `85.46       368.57800    31.5K`,
//    `------------------------------`,
      `               ░░░░░░░░░░░░░░░`,
      `85.45       473.08300   40.42K`,
//    `------------------------------`,
      `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
      `85.44     1,032.38700   88.21K`,
//    `------------------------------`,
      `      ░░░░░░░░░░░░░░░░░░░░░░░░`,
      `85.41       805.00800   68.76K`,
//    `==============================`,
      `B 47.63% [+++++-----] 52.37% S`
    ]);

    expect(actualContent).toEqual(expectedContent);
  });
});
