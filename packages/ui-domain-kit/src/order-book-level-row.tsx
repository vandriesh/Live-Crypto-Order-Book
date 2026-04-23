import { cva } from "class-variance-authority";

import { cn } from "@neet/ui-kit";

import { OrderBookVisualLayer } from "./order-book-visual-layer";


const orderBookLevelRowVariants = cva(
  "relative z-10 grid h-8 grid-cols-[1fr_1fr_1fr] items-center border-b border-t border-transparent px-2 font-mono text-sm transition-colors",
  {
    variants: {
      hoverState: {
        active: "",
        idle: "",
      },
      tone: {
        ask: "",
        bid: "",
      },
    },
    compoundVariants: [
      {
        className: "border-t border-dashed border-t-[rgba(126,141,163,0.32)]",
        hoverState: "active",
        tone: "ask",
      },
      {
        className: "border-b border-dashed border-b-[rgba(126,141,163,0.32)]",
        hoverState: "active",
        tone: "bid",
      },
    ],
  },
);

const orderBookLevelPriceVariants = cva("relative z-10 transition-colors", {
  variants: {
    hoverState: {
      active: "",
      idle: "",
    },
    tone: {
      ask: "",
      bid: "",
    },
  },
  compoundVariants: [
    {
      className: "text-red-400",
      hoverState: "active",
      tone: "ask",
    },
    {
      className: "text-red-600",
      hoverState: "idle",
      tone: "ask",
    },
    {
      className: "text-emerald-400",
      hoverState: "active",
      tone: "bid",
    },
    {
      className: "text-emerald-600",
      hoverState: "idle",
      tone: "bid",
    },
  ],
});

const orderBookLevelValueVariants = cva(
  "relative z-10 text-right transition-colors",
  {
    variants: {
      hoverState: {
        active: "text-white",
        idle: "text-shell-text-muted",
      },
    },
  },
);

type OrderBookLevelRowProps = {
  amount: string;
  animated?: boolean;
  className?: string;
  depthRatio: number;
  hoverState?: "active" | "idle";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tone: "ask" | "bid";
  price: string;
  total: string;
};

export function OrderBookLevelRow({
  amount,
  animated = false,
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
      <OrderBookVisualLayer
        animated={animated}
        depthRatio={depthRatio}
        hoverState={hoverState}
        tone={tone}
      />
      <span className={orderBookLevelPriceVariants({ hoverState, tone })}>
        {price}
      </span>
      <span className={orderBookLevelValueVariants({ hoverState })}>{amount}</span>
      <span className={orderBookLevelValueVariants({ hoverState })}>{total}</span>
    </div>
  );
}
