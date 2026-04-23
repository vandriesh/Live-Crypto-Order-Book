import { memo } from "react";

import { OrderBookHoverOverlay } from "./order-book-hover-overlay";
import { OrderBookSideRow } from "./order-book-side-row";
import type { DisplayRow } from "./utils";
import { useDelayedHover } from "./use-delayed-hover";
import { useRowUpdateAnimation } from "./use-row-update-animation";

type OrderBookSideLevelsProps = {
    animationsEnabled: boolean;
    baseAsset: string;
    displayAverage: boolean;
    quoteAsset: string;
    rows: DisplayRow[];
    variant: "ask" | "bid";
};

export const OrderBookSideLevels = memo(function OrderBookSideLevels({
    animationsEnabled,
    baseAsset,
    displayAverage,
    quoteAsset,
    rows,
    variant,
}: OrderBookSideLevelsProps) {
    const animatedPrices = useRowUpdateAnimation(rows, animationsEnabled);
    const { hoveredIndex, handleHoverEnd, handleHoverStart } = useDelayedHover();

    return (
        <div className="relative flex flex-col" onMouseLeave={handleHoverEnd}>
            {hoveredIndex !== null ? (
                <OrderBookHoverOverlay
                    hoveredIndex={hoveredIndex}
                    rowCount={rows.length}
                    variant={variant}
                />
            ) : null}
            {rows.map((row, index) =>
                row.isPlaceholder ? (
                    <div key={`${variant}-placeholder-${index}`} className="relative z-10 h-8" />
                ) : (
                    <OrderBookSideRow
                        animated={animatedPrices.has(row.price)}
                        key={`${variant}-${row.price}`}
                        baseAsset={baseAsset}
                        displayAverage={displayAverage}
                        hoveredIndex={hoveredIndex}
                        index={index}
                        onHoverStart={handleHoverStart}
                        quoteAsset={quoteAsset}
                        row={row}
                        variant={variant}
                    />
                ),
            )}
        </div>
    );
});
