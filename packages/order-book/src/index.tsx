import {
  BuySellRatioBar,
  OrderBookLevelRow,
  TickSizeSelect,
} from "@neet/ui-domain-kit";
import { Minus, Plus } from "lucide-react";

import {
  cn,
} from "@neet/ui-kit";

import {
  OrderBookDisplayProvider,
  useOrderBookDisplay,
} from "./order-book-display-provider";
import { OrderBookDisplayPopup } from "./order-book-display-popup";

function IconToggle({
  active,
  tone,
}: {
  active?: boolean;
  tone: "ask" | "bid" | "both";
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-6 w-7 items-center justify-center rounded-md border border-transparent transition",
        active
          ? "bg-shell-surface-elevated"
          : "text-shell-text-faint hover:bg-shell-surface-elevated/80",
      )}
    >
      <span className="flex gap-0.5">
        <span
          className={cn(
            "h-2.5 w-1 rounded-sm",
            tone === "ask" ? "bg-book-ask" : "bg-book-bid",
          )}
        />
        <span
          className={cn(
            "h-3.5 w-1 rounded-sm",
            tone === "both" ? "bg-shell-text-faint" : tone === "ask" ? "bg-book-ask/45" : "bg-book-bid/45",
          )}
        />
      </span>
    </button>
  );
}

export function OrderBookContainer() {
  return (
    <OrderBookDisplayProvider>
      <OrderBookContainerContent />
    </OrderBookDisplayProvider>
  );
}

function OrderBookContainerContent() {
  const { actions, state, tickSizeOptions, view } = useOrderBookDisplay();
  const {
    asks,
    baseAsset,
    bids,
    buyRatio,
    marketLabel,
    midPrice,
    midPriceValue,
    quoteAsset,
    sellRatio,
    showRatio,
  } = view;

  return (
    <div className="flex h-full flex-col bg-shell-surface">
      <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Order Book</h2>
          <p className="mt-1 text-xs text-shell-text-faint">{marketLabel}</p>
        </div>
        <OrderBookDisplayPopup />
      </div>

      <div className="flex items-center justify-between border-b border-shell-border px-4 py-2">
        <div className="flex items-center gap-1">
          <IconToggle tone="ask" />
          <IconToggle tone="both" active />
          <IconToggle tone="bid" />
        </div>

        <TickSizeSelect
          options={tickSizeOptions}
          value={state.tickSize}
          onValueChange={actions.setTickSize}
        />
      </div>

      <div className="flex-1 p-4">
        <section className="overflow-hidden rounded-[20px] border border-shell-border bg-shell-surface-alt">
          <div className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 text-xs text-shell-text-faint">
            <span>Price ({quoteAsset})</span>
            <span className="text-right">Amount ({baseAsset})</span>
            <span className="text-right">Total</span>
          </div>

          <div className="px-2 pb-3">
            {asks.map((row) => (
                <OrderBookLevelRow
                  key={`ask-${row.price}-${row.total}`}
                  amount={row.amount}
                  depthRatio={row.depthRatio}
                  variant="ask"
                  price={row.price}
                  total={row.total}
                />
              ))}

            <div
              className="grid grid-cols-[1.2fr_1fr_auto] items-center border-y border-shell-border bg-shell-surface px-2 py-3"
            >
              <div className="flex items-center gap-2 font-mono text-[2rem] font-semibold leading-none text-book-bid">
                <span className="text-[11px] leading-none text-book-bid">
                  <Plus className="size-3.5" />
                </span>
                {midPrice}
              </div>
              <div className="font-mono text-sm text-shell-text-faint">
                ${midPriceValue}
              </div>
            </div>

            {bids.map((row) => (
              <OrderBookLevelRow
                key={`bid-${row.price}-${row.total}`}
                amount={row.amount}
                depthRatio={row.depthRatio}
                variant="bid"
                price={row.price}
                total={row.total}
              />
            ))}
          </div>

          {showRatio ? (
            <BuySellRatioBar buyPercent={buyRatio} sellPercent={sellRatio} />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ChevronRightGlyph() {
  return (
    <span className="flex items-center justify-end text-shell-text-faint">
      <Minus className="size-3.5 -rotate-45" />
    </span>
  );
}
