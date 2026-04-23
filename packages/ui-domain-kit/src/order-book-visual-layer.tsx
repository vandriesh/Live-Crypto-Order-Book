import { cva } from "class-variance-authority";

import { cn } from "@neet/ui-kit";

const orderBookDepthBarVariants = cva(
  "absolute top-1/2 right-2 h-6 -translate-y-1/2 rounded-[10px]",
  {
    variants: {
      hoverState: {
        active: "opacity-100",
        idle: "opacity-90",
      },
      tone: {
        ask: "bg-book-ask-soft",
        bid: "bg-book-bid-soft",
      },
    },
  },
);

function getDepthWidthPercent(depthRatio: number) {
  if (depthRatio <= 0) return "0%";

  const maxPercent = 58;
  const minPercent = 8;
  const widthPercent = Math.min(
    maxPercent,
    Math.max(minPercent, depthRatio * maxPercent),
  );

  return `${widthPercent}%`;
}

type OrderBookVisualLayerProps = {
  animated?: boolean;
  className?: string;
  depthRatio: number;
  hoverState?: "active" | "idle";
  tone: "ask" | "bid";
};

export function OrderBookVisualLayer({
  animated = false,
  className,
  depthRatio,
  hoverState = "idle",
  tone,
}: OrderBookVisualLayerProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[8px] transition-opacity duration-700",
          tone === "ask" ? "bg-red-500/30" : "bg-emerald-500/30",
          animated ? "opacity-100" : "opacity-0",
          className,
        )}
      />
      <div
        aria-hidden="true"
        className={cn(orderBookDepthBarVariants({ hoverState, tone }), className)}
        style={{ width: getDepthWidthPercent(depthRatio) }}
      />
    </>
  );
}
