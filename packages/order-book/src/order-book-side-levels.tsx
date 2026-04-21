import { memo, useEffect, useRef, useState } from "react";

import { OrderBookHoverOverlay } from "./order-book-hover-overlay";
import { OrderBookSideRow } from "./order-book-side-row";
import type { DisplayRow } from "./utils";

type OrderBookSideLevelsProps = {
    baseAsset: string;
    displayAverage: boolean;
    quoteAsset: string;
    rows: DisplayRow[];
    variant: "ask" | "bid";
};

const HOVER_DELAY_MS = 60;

export const OrderBookSideLevels = memo(function OrderBookSideLevels({
    baseAsset,
    displayAverage,
    quoteAsset,
    rows,
    variant,
}: OrderBookSideLevelsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    function handleHoverStart(index: number) {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredIndex(index);
            hoverTimeoutRef.current = null;
        }, HOVER_DELAY_MS);
    }

    function handleHoverEnd() {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        setHoveredIndex(null);
    }

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
                        key={`${variant}-${row.price}-${row.total}`}
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
