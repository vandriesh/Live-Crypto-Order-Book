import { ArrowDown, ArrowUp } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@neet/ui-kit";

const midPriceValueVariants = cva(
  "flex items-center gap-1 font-mono text-[2.2rem] font-semibold leading-none tracking-[-0.04em]",
  {
    variants: {
      direction: {
        down: "text-book-ask",
        flat: "text-shell-text-muted",
        up: "text-book-bid",
      },
    },
  },
);

type OrderBookMidPriceRowProps = {
  direction: "down" | "flat" | "up";
  price: string;
  referencePrice: string;
};

function DirectionGlyph({
  direction,
}: {
  direction: OrderBookMidPriceRowProps["direction"];
}) {
  const iconClassName = "size-[0.9em] stroke-[2.2]";

  if (direction === "up") {
    return <ArrowUp className={iconClassName} />;
  }

  if (direction === "down") {
    return <ArrowDown className={iconClassName} />;
  }

  return <span aria-hidden="true" className={iconClassName} />;
}

export function OrderBookMidPriceRow({
  direction,
  price,
  referencePrice,
}: OrderBookMidPriceRowProps) {
  return (
    <div className="-mx-2 w-auto  px-4 py-4">
      <div className="flex items-center gap-3">
        <div className={cn(midPriceValueVariants({ direction }))}>
          <span>{price}</span>
          <DirectionGlyph direction={direction} />
        </div>
        <div className="font-mono text-[0.95rem] text-shell-text-faint">
          ${referencePrice}
        </div>
      </div>
    </div>
  );
}
