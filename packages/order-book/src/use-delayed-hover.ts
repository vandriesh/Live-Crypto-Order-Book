import { useCallback, useEffect, useRef, useState } from "react";

const HOVER_DELAY_MS = 60;

export function useDelayedHover() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const handleHoverStart = useCallback((index: number) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredIndex(index);
            hoverTimeoutRef.current = null;
        }, HOVER_DELAY_MS);
    }, []);

    const handleHoverEnd = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        setHoveredIndex(null);
    }, []);

    return {
        hoveredIndex,
        handleHoverEnd,
        handleHoverStart,
    };
}
