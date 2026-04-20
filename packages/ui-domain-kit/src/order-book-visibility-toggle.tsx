import { cva } from "class-variance-authority";

import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@neet/ui-kit";

type VisibleOperation = "ask" | "bid" | "both";

type OrderBookVisibilityToggleProps = {
  onValueChange: (value: VisibleOperation) => void;
  value: VisibleOperation;
};

const visibilityToggleButtonVariants = cva(
  "flex h-6 w-7 items-center justify-center transition-opacity",
  {
    variants: {
      active: {
        false: "opacity-70 hover:opacity-100",
        true: "opacity-100",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

function OpacityBar({
  color,
  dimmed,
  heightClassName,
}: {
  color: "ask" | "bid";
  dimmed?: boolean;
  heightClassName: string;
}) {
  return (
    <span
      className={cn(
        "w-1 rounded-sm transition-opacity",
        heightClassName,
        color === "ask" ? "bg-book-ask" : "bg-book-bid",
        dimmed ? "opacity-45" : "opacity-100",
      )}
    />
  );
}

function VisibilityIcon({ operation }: { operation: VisibleOperation }) {
  const isAskDimmed = operation === "bid";
  const isBidDimmed = operation === "ask";

  return (
    <span className="flex items-end gap-0.5">
      <OpacityBar
        color="ask"
        dimmed={isAskDimmed}
        heightClassName={operation === "both" ? "h-3.5" : "h-2.5"}
      />
      <OpacityBar
        color="bid"
        dimmed={isBidDimmed}
        heightClassName={operation === "both" ? "h-3.5" : "h-2.5"}
      />
    </span>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  operation,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  operation: VisibleOperation;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={visibilityToggleButtonVariants({ active })}
        >
          <VisibilityIcon operation={operation} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function OrderBookVisibilityToggle({
  onValueChange,
  value,
}: OrderBookVisibilityToggleProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-1">
        <ToggleButton
          active={value === "ask"}
          label="Sell Order"
          onClick={() => onValueChange("ask")}
          operation="ask"
        />
        <ToggleButton
          active={value === "both"}
          label="Order Book"
          onClick={() => onValueChange("both")}
          operation="both"
        />
        <ToggleButton
          active={value === "bid"}
          label="Buy Order"
          onClick={() => onValueChange("bid")}
          operation="bid"
        />
      </div>
    </TooltipProvider>
  );
}
