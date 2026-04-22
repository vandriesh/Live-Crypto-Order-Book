import { useEffect, useRef, useState } from "react";

import type { DisplayRow } from "./utils";

const ANIMATION_DURATION_MS = 700;

export function useRowUpdateAnimation(
    rows: DisplayRow[],
    animationsEnabled: boolean,
) {
    const [animatedPrices, setAnimatedPrices] = useState<Set<string>>(new Set());
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousRowsRef = useRef<DisplayRow[] | null>(null);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
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
                }, ANIMATION_DURATION_MS);
            }
        }

        previousRowsRef.current = currentRows;
    }, [animationsEnabled, rows]);

    return animatedPrices;
}
