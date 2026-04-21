export function getAskHoverState(index: number, hoveredAskIndex: number | null) {
    if (hoveredAskIndex == null) {
        return "idle" as const;
    }

    if (index === hoveredAskIndex) {
        return "active" as const;
    }

    if (index >= hoveredAskIndex) {
        return "range" as const;
    }

    return "idle" as const;
}

export function getBidHoverState(index: number, hoveredBidIndex: number | null) {
    if (hoveredBidIndex == null) {
        return "idle" as const;
    }

    if (index === hoveredBidIndex) {
        return "active" as const;
    }

    if (index <= hoveredBidIndex) {
        return "range" as const;
    }

    return "idle" as const;
}
