const ORDER_BOOK_ROW_HEIGHT = 32;

type OrderBookHoverOverlayProps = {
    hoveredIndex: number;
    rowCount: number;
    variant: "ask" | "bid";
};

export function OrderBookHoverOverlay({
    hoveredIndex,
    rowCount,
    variant,
}: OrderBookHoverOverlayProps) {
    const style =
        variant === "ask"
            ? {
                  height: `${Math.max(rowCount - hoveredIndex, 0) * ORDER_BOOK_ROW_HEIGHT}px`,
                  top: `${hoveredIndex * ORDER_BOOK_ROW_HEIGHT}px`,
              }
            : {
                  height: `${(hoveredIndex + 1) * ORDER_BOOK_ROW_HEIGHT}px`,
                  top: "0px",
              };

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 rounded-[10px] bg-[rgba(255,255,255,0.03)]"
            style={style}
        />
    );
}
