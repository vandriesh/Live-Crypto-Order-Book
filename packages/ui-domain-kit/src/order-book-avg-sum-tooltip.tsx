import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@neet/ui-kit";

type OrderBookAvgSumTooltipProps = {
  averagePrice: string;
  baseAsset: string;
  children: ReactNode;
  open: boolean;
  quoteAsset: string;
  sumAmount: string;
  sumTotal: string;
};

export function OrderBookAvgSumTooltip({
  averagePrice,
  baseAsset,
  children,
  open,
  quoteAsset,
  sumAmount,
  sumTotal,
}: OrderBookAvgSumTooltipProps) {
  return (
    <TooltipProvider delayDuration={100} disableHoverableContent>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={18}
          arrowClassName="fill-[rgba(255,255,255,0.7)]"
          className="rounded-[18px] bg-white/70 px-3 py-2 text-[15px] font-medium text-shell-bg shadow-[0_18px_60px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm"
        >
          <div className="grid grid-cols-[6.25rem_8.25rem] items-center gap-x-1 gap-y-1 whitespace-nowrap">
            <span className="inline-block w-[6.25rem]">Avg Price:</span>
            <span className="inline-block w-[8.25rem] text-right font-mono tabular-nums">
              ≈ {averagePrice}
            </span>

            <span className="inline-block w-[6.25rem]">Sum {baseAsset}:</span>
            <span className="inline-block w-[8.25rem] text-right font-mono tabular-nums">
              {sumAmount}
            </span>

            <span className="inline-block w-[6.25rem]">Sum {quoteAsset}:</span>
            <span className="inline-block w-[8.25rem] text-right font-mono tabular-nums">
              {sumTotal}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
