import { useEffect, useRef, useState } from "react";

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

    return {
        hoveredIndex,
        handleHoverEnd,
        handleHoverStart,
    };
}
