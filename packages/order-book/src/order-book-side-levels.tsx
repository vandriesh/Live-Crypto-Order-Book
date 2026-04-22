import { memo, useEffect, useRef, useState } from "react";

import { OrderBookHoverOverlay } from "./order-book-hover-overlay";
import { OrderBookSideRow } from "./order-book-side-row";
import type { DisplayRow } from "./utils";

type OrderBookSideLevelsProps = {
    animationsEnabled: boolean;
    baseAsset: string;
    displayAverage: boolean;
    quoteAsset: string;
    rows: DisplayRow[];
    variant: "ask" | "bid";
};

const HOVER_DELAY_MS = 60;

export const OrderBookSideLevels = memo(function OrderBookSideLevels({
    animationsEnabled,
    baseAsset,
    displayAverage,
    quoteAsset,
    rows,
    variant,
}: OrderBookSideLevelsProps) {
    const [animatedPrices, setAnimatedPrices] = useState<Set<string>>(new Set());
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousRowsRef = useRef<DisplayRow[] | null>(null);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const currentRows = rows.filter((row) => !row.isPlaceholder);
        const previousRows = previousRowsRef.current;

        if (!animationsEnabled) {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
                animationTimeoutRef.current = null;
            }

            setAnimatedPrices(new Set());
            previousRowsRef.current = currentRows;
            return;
        }

        if (previousRows) {
            const previousRowsByPrice = new Map(
                previousRows.map((row) => [row.price, row]),
            );
            const changedPrices = currentRows
                .filter((row) => {
                    const previousRow = previousRowsByPrice.get(row.price);

                    if (!previousRow) {
                        return true;
                    }

                    return (
                        previousRow.amount !== row.amount ||
                        previousRow.total !== row.total
                    );
                })
                .map((row) => row.price);

            if (changedPrices.length > 0) {
                if (animationTimeoutRef.current) {
                    clearTimeout(animationTimeoutRef.current);
                }

                setAnimatedPrices(new Set(changedPrices));
                animationTimeoutRef.current = setTimeout(() => {
                    setAnimatedPrices(new Set());
                    animationTimeoutRef.current = null;
                }, 700);
            }
        }

        previousRowsRef.current = currentRows;
    }, [animationsEnabled, rows]);

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
                        animated={animatedPrices.has(row.price)}
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
