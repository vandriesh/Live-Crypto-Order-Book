import {
  formatMarketLabel,
} from "@neet/data";
import { useMarketData } from "@neet/binance-connection-manager";
import { Ellipsis, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  cn,
} from "@neet/ui-kit";

const tickSizes = ["0.01", "0.1", "1", "10", "50", "100", "1000"];

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

function LabeledCheckbox({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-shell-text-muted">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        className="border-shell-border-strong bg-shell-surface-alt data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-shell-bg"
      />
      <span>{label}</span>
    </label>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  }).format(value);
}

function getDepthClass(depthRatio: number) {
  if (depthRatio >= 0.85) return "w-28";
  if (depthRatio >= 0.65) return "w-24";
  if (depthRatio >= 0.45) return "w-20";
  if (depthRatio >= 0.3) return "w-16";
  if (depthRatio >= 0.18) return "w-12";
  return "w-8";
}

export function OrderBookContainer() {
  const marketData = useMarketData();
  const { market, orderBookSnapshot: snapshot } = marketData;
  const [displayAverage, setDisplayAverage] = useState(true);
  const [showRatio, setShowRatio] = useState(true);
  const [roundingEnabled, setRoundingEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [depthMode, setDepthMode] = useState("amount");
  const [tickSize, setTickSize] = useState("0.01");

  useEffect(() => {
    console.log("[OrderBookContainer] market data", marketData);
  }, [marketData]);

  const [baseAsset, quoteAsset] = useMemo(
    () => formatMarketLabel(market).split("/"),
    [market],
  );
  const buyTotal = snapshot.bids.reduce((sum, level) => sum + level.quantity, 0);
  const sellTotal = snapshot.asks.reduce((sum, level) => sum + level.quantity, 0);
  const combinedTotal = buyTotal + sellTotal || 1;
  const buyRatio = (buyTotal / combinedTotal) * 100;
  const sellRatio = 100 - buyRatio;

  return (
    <div className="flex h-full flex-col bg-shell-surface">
      <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Order Book</h2>
          <p className="mt-1 text-xs text-shell-text-faint">{formatMarketLabel(market)}</p>
        </div>
        <button type="button" className="text-shell-text-faint transition hover:text-white">
          <Ellipsis className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-shell-border px-4 py-2">
        <div className="flex items-center gap-1">
          <IconToggle tone="ask" />
          <IconToggle tone="both" active />
          <IconToggle tone="bid" />
        </div>

        <Select value={tickSize} onValueChange={setTickSize}>
          <SelectTrigger className="h-7 min-w-20 border-shell-border bg-transparent px-2.5 font-mono text-sm text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-32 border-shell-border bg-shell-surface-elevated text-shell-text-muted">
            {tickSizes.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="font-mono text-sm focus:bg-shell-surface-alt focus:text-white"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid flex-1 gap-4 p-4">
        <section className="rounded-[20px] border border-shell-border bg-shell-surface-alt/80 p-4">
          <div className="space-y-5">
            <div>
              <p className="text-xs text-shell-text-faint">Order Book Display</p>
              <div className="mt-3 flex flex-col gap-3">
                <LabeledCheckbox
                  checked={displayAverage}
                  label="Display Avg.&Sum"
                  onCheckedChange={setDisplayAverage}
                />
                <LabeledCheckbox
                  checked={showRatio}
                  label="Show Buy/Sell Ratio"
                  onCheckedChange={setShowRatio}
                />
                <LabeledCheckbox
                  checked={roundingEnabled}
                  label="Rounding"
                  onCheckedChange={setRoundingEnabled}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-shell-text-faint">Book Depth Visualization</p>
              <RadioGroup
                value={depthMode}
                onValueChange={setDepthMode}
                className="mt-3 gap-3"
              >
                <label className="flex items-center gap-3 text-sm text-shell-text-muted">
                  <RadioGroupItem
                    value="amount"
                    className="border-shell-border-strong bg-transparent text-white"
                  />
                  <span>Amount</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-shell-text-muted">
                  <RadioGroupItem
                    value="cumulative"
                    className="border-shell-border-strong bg-transparent text-white"
                  />
                  <span>Cumulative</span>
                </label>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-shell-text-muted">Animations</span>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-shell-surface-elevated"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[20px] border border-shell-border bg-shell-surface-alt">
          <div className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 text-xs text-shell-text-faint">
            <span>Price ({quoteAsset})</span>
            <span className="text-right">Amount ({baseAsset})</span>
            <span className="text-right">Total</span>
          </div>

          <div className="px-2 pb-3">
            {snapshot.asks
              .slice()
              .reverse()
              .map((row) => (
                <div
                  key={`ask-${row.price}`}
                  className="relative grid grid-cols-[1fr_1fr_1fr] items-center px-2 py-1.5 font-mono text-sm"
                >
                  <div
                    className={cn(
                      "absolute top-1/2 right-2 h-6 -translate-y-1/2 rounded-sm bg-book-ask-soft",
                      getDepthClass(row.depthRatio),
                    )}
                  />
                  <span className="relative z-10 text-book-ask">
                    {formatPrice(row.price)}
                  </span>
                  <span className="relative z-10 text-right text-shell-text-muted">
                    {formatQuantity(row.quantity)}
                  </span>
                  <span className="relative z-10 text-right text-shell-text-muted">
                    {depthMode === "cumulative"
                      ? formatQuantity(row.cumulative)
                      : formatCompactNumber(row.notional)}
                  </span>
                </div>
              ))}

            <div
              className="grid grid-cols-[1.2fr_1fr_auto] items-center border-y border-shell-border bg-shell-surface px-2 py-3"
            >
              <div className="flex items-center gap-2 font-mono text-[2rem] font-semibold leading-none text-book-bid">
                <span className="text-[11px] leading-none text-book-bid">
                  <Plus className="size-3.5" />
                </span>
                {formatPrice(snapshot.midPrice)}
              </div>
              <div className="font-mono text-sm text-shell-text-faint">
                ${formatPrice(snapshot.midPrice)}
              </div>
              <ChevronRightGlyph />
            </div>

            {snapshot.bids.map((row) => (
              <div
                key={`bid-${row.price}`}
                className="relative grid grid-cols-[1fr_1fr_1fr] items-center px-2 py-1.5 font-mono text-sm"
              >
                <div
                  className={cn(
                    "absolute top-1/2 right-2 h-6 -translate-y-1/2 rounded-sm bg-book-bid-soft",
                    getDepthClass(row.depthRatio),
                  )}
                />
                <span className="relative z-10 text-book-bid">
                  {formatPrice(row.price)}
                </span>
                <span className="relative z-10 text-right text-shell-text-muted">
                  {formatQuantity(row.quantity)}
                </span>
                <span className="relative z-10 text-right text-shell-text-muted">
                  {depthMode === "cumulative"
                    ? formatQuantity(row.cumulative)
                    : formatCompactNumber(row.notional)}
                </span>
              </div>
            ))}
          </div>

          {showRatio ? (
            <div className="border-t border-shell-border px-4 py-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-book-bid">B {buyRatio.toFixed(2)}%</span>
                <span className="text-book-ask">{sellRatio.toFixed(2)}% S</span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-shell-surface-elevated">
                <div className="bg-book-bid" style={{ width: `${buyRatio}%` }} />
                <div className="bg-book-ask" style={{ width: `${sellRatio}%` }} />
              </div>
            </div>
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
