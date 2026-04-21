import { cva } from "class-variance-authority";

import { cn } from "@neet/ui-kit";

const orderBookLevelRowVariants = cva(
  "relative grid grid-cols-[1fr_1fr_1fr] items-center border-b border-t border-transparent px-2 py-1.5 font-mono text-sm transition-colors",
  {
    variants: {
      hoverState: {
        active: "",
        idle: "",
        range: "",
      },
      tone: {
        ask: "",
        bid: "",
      },
    },
    compoundVariants: [
      {
        className: "bg-[rgba(255,255,255,0.03)]",
        hoverState: "range",
        tone: "ask",
      },
      {
        className:
          "border-t border-dashed border-t-[rgba(126,141,163,0.32)] bg-[rgba(255,255,255,0.03)]",
        hoverState: "active",
        tone: "ask",
      },
      {
        className: "bg-[rgba(255,255,255,0.03)]",
        hoverState: "range",
        tone: "bid",
      },
      {
        className:
          "border-b border-dashed border-b-[rgba(126,141,163,0.32)] bg-[rgba(255,255,255,0.03)]",
        hoverState: "active",
        tone: "bid",
      },
    ],
  },
);

const orderBookLevelPriceVariants = cva("relative z-10", {
  variants: {
    tone: {
      ask: "text-book-ask",
      bid: "text-book-bid",
    },
  },
});

const orderBookLevelDepthVariants = cva(
  "absolute top-1/2 right-2 h-6 -translate-y-1/2 rounded-[10px]",
  {
    variants: {
      hoverState: {
        active: "",
        idle: "",
        range: "",
      },
      tone: {
        ask: "bg-book-ask-soft",
        bid: "bg-book-bid-soft",
      },
    },
    compoundVariants: [
      {
        className: "opacity-100",
        hoverState: "active",
      },
      {
        className: "opacity-95",
        hoverState: "range",
      },
      {
        className: "opacity-90",
        hoverState: "idle",
      },
    ],
  },
);

type OrderBookLevelRowProps = {
  amount: string;
  className?: string;
  depthRatio: number;
  hoverState?: "active" | "idle" | "range";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tone: "ask" | "bid";
  price: string;
  total: string;
};

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

export function OrderBookLevelRow({
  amount,
  className,
  depthRatio,
  hoverState = "idle",
  onMouseEnter,
  onMouseLeave,
  tone,
  price,
  total,
}: OrderBookLevelRowProps) {
  return (
    <div
      className={cn(orderBookLevelRowVariants({ hoverState, tone }), className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={orderBookLevelDepthVariants({ hoverState, tone })}
        style={{ width: getDepthWidthPercent(depthRatio) }}
      />
      <span className={orderBookLevelPriceVariants({ tone })}>{price}</span>
      <span className="relative z-10 text-right text-shell-text-muted">{amount}</span>
      <span className="relative z-10 text-right text-shell-text-muted">{total}</span>
    </div>
  );
}
