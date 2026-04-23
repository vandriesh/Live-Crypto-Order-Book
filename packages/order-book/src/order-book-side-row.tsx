import { OrderBookAvgSumTooltip, OrderBookLevelRow } from "@neet/ui-domain-kit";
import { memo, useCallback } from "react";

import type { DisplayRow } from "./utils";

export type OrderBookSideRowProps = {
    animated: boolean;
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
    animated,
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
    const handleMouseEnter = useCallback(
        () => onHoverStart(index),
        [index, onHoverStart],
    );
    const rowContent = (
        <OrderBookLevelRow
            amount={row.amount}
            animated={animated}
            depthRatio={row.depthRatio}
            hoverState={hoverState}
            onMouseEnter={handleMouseEnter}
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
        previous.animated === next.animated &&
        previous.baseAsset === next.baseAsset &&
        previous.displayAverage === next.displayAverage &&
        previous.index === next.index &&
        previous.onHoverStart === next.onHoverStart &&
        previous.quoteAsset === next.quoteAsset &&
        previous.variant === next.variant &&
        isActive(previous) === isActive(next) &&
        isSameDisplayRow(previous.row, next.row)
    );
}

function isSameDisplayRow(a: DisplayRow, b: DisplayRow) {
    return (
        a.price === b.price &&
        a.amount === b.amount &&
        a.total === b.total &&
        a.depthRatio === b.depthRatio &&
        a.isPlaceholder === b.isPlaceholder &&
        a.operation === b.operation &&
        a.summary?.averagePrice === b.summary?.averagePrice &&
        a.summary?.sumAmount === b.summary?.sumAmount &&
        a.summary?.sumTotal === b.summary?.sumTotal
    );
}

function isActive({
    hoveredIndex,
    index,
}: Pick<OrderBookSideRowProps, "hoveredIndex" | "index">) {
    return hoveredIndex === index;
}
