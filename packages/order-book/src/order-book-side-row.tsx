import { OrderBookAvgSumTooltip, OrderBookLevelRow } from "@neet/ui-domain-kit";
import { memo } from "react";

import type { DisplayRow } from "./utils";

export type OrderBookSideRowProps = {
    baseAsset: string;
    displayAverage: boolean;
    hoveredIndex: number | null;
    index: number;
    onHoverStart: (index: number) => void;
    quoteAsset: string;
    row: DisplayRow;
    variant: "ask" | "bid";
};

export const OrderBookSideRow = memo(function OrderBookSideRow({
    baseAsset,
    displayAverage,
    hoveredIndex,
    index,
    onHoverStart,
    quoteAsset,
    row,
    variant,
}: OrderBookSideRowProps) {
    const hoverState = hoveredIndex === index ? "active" : "idle";
    const rowContent = (
        <OrderBookLevelRow
            amount={row.amount}
            depthRatio={row.depthRatio}
            hoverState={hoverState}
            onMouseEnter={() => onHoverStart(index)}
            tone={variant}
            price={row.price}
            total={row.total}
        />
    );

    if (!displayAverage || hoverState !== "active" || !row.summary) {
        return rowContent;
    }

    return (
        <OrderBookAvgSumTooltip
            averagePrice={row.summary.averagePrice}
            baseAsset={baseAsset}
            open
            quoteAsset={quoteAsset}
            sumAmount={row.summary.sumAmount}
            sumTotal={row.summary.sumTotal}
        >
            {rowContent}
        </OrderBookAvgSumTooltip>
    );
}, areOrderBookSideRowPropsEqual);

function areOrderBookSideRowPropsEqual(
    previous: OrderBookSideRowProps,
    next: OrderBookSideRowProps,
) {
    return (
        previous.baseAsset === next.baseAsset &&
        previous.displayAverage === next.displayAverage &&
        previous.index === next.index &&
        previous.onHoverStart === next.onHoverStart &&
        previous.quoteAsset === next.quoteAsset &&
        previous.row === next.row &&
        previous.variant === next.variant &&
        isActive(previous) === isActive(next)
    );
}

function isActive({
    hoveredIndex,
    index,
}: Pick<OrderBookSideRowProps, "hoveredIndex" | "index">) {
    return hoveredIndex === index;
}
