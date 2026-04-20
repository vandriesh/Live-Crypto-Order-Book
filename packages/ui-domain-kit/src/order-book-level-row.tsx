import { cva } from "class-variance-authority";

import { cn } from "@neet/ui-kit";

const orderBookLevelRowVariants = cva(
  "relative grid grid-cols-[1fr_1fr_1fr] items-center px-2 py-1.5 font-mono text-sm",
);

const orderBookLevelPriceVariants = cva("relative z-10", {
  variants: {
    variant: {
      ask: "text-book-ask",
      bid: "text-book-bid",
    },
  },
});

const orderBookLevelDepthVariants = cva(
  "absolute top-1/2 right-2 h-6 -translate-y-1/2 rounded-sm",
  {
    variants: {
      variant: {
        ask: "bg-book-ask-soft",
        bid: "bg-book-bid-soft",
      },
      depthSize: {
        xs: "w-8",
        sm: "w-12",
        md: "w-16",
        lg: "w-20",
        xl: "w-24",
        xxl: "w-28",
      },
    },
  },
);

export type OrderBookLevelRowProps = {
  amount: string;
  className?: string;
  depthRatio: number;
  variant: "ask" | "bid";
  price: string;
  total: string;
};

function getDepthSize(depthRatio: number) {
  if (depthRatio >= 0.85) return "xxl";
  if (depthRatio >= 0.65) return "xl";
  if (depthRatio >= 0.45) return "lg";
  if (depthRatio >= 0.3) return "md";
  if (depthRatio >= 0.18) return "sm";
  return "xs";
}

export function OrderBookLevelRow({
  amount,
  className,
  depthRatio,
                                    variant,
  price,
  total,
}: OrderBookLevelRowProps) {
  return (
    <div className={cn(orderBookLevelRowVariants(), className)}>
      <div
        className={orderBookLevelDepthVariants({
          variant,
          depthSize: getDepthSize(depthRatio),
        })}
      />
      <span className={orderBookLevelPriceVariants({ variant })}>{price}</span>
      <span className="relative z-10 text-right text-shell-text-muted">{amount}</span>
      <span className="relative z-10 text-right text-shell-text-muted">{total}</span>
    </div>
  );
}
