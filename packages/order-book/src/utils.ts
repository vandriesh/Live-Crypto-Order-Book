import {
    ceilToTick,
    floorToTick,
    formatAveragePrice,
    formatPriceForDisplay,
    formatQuantity,
    formatSumAmount,
    formatTotal,
} from "@neet/utils";

export type DepthMode = "amount" | "cumulative";
export type VisibleOperation = "ask" | "bid" | "both";
export type TickSizeOption = "0.01" | "0.1" | "1" | "10" | "50" | "100" | "1000";

export type DisplayRow = {
    amount: string;
    depthRatio: number;
    isPlaceholder?: boolean;
    operation?: "ask" | "bid";
    price: string;
    summary?: {
        averagePrice: string;
        sumAmount: string;
        sumTotal: string;
    };
    total: string;
};

export type OrderBookLevel = {
    notional: number;
    price: number;
    quantity: number;
};

const visibleOrderBookLevels = 10;

export function getVisibleOrderBookLevels(visibleOperation: VisibleOperation) {
    return visibleOperation === "both"
        ? visibleOrderBookLevels
        : visibleOrderBookLevels * 2;
}

export function isOperationVisible(
    visibleOperation: VisibleOperation,
    operation: "ask" | "bid",
) {
    return visibleOperation === "both" || visibleOperation === operation;
}

export function getAskHoverState(index: number, hoveredAskIndex: number | null) {
    if (hoveredAskIndex == null) {
        return "idle" as const;
    }

    if (index === hoveredAskIndex) {
        return "active" as const;
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

    return "idle" as const;
}

export function createDisplayRows(args: {
    depthMode: DepthMode;
    levels: OrderBookLevel[];
    operation: "ask" | "bid";
    roundingEnabled: boolean;
    targetCount: number;
    tickSize: TickSizeOption;
}) {
    const {
        depthMode,
        levels,
        operation,
        roundingEnabled,
        targetCount,
        tickSize,
    } = args;

    const cumulativeNotionals = new Array<number>(levels.length).fill(0);
    let runningNotional = 0;

    if (operation === "ask") {
        for (let index = levels.length - 1; index >= 0; index -= 1) {
            runningNotional += levels[index].notional;
            cumulativeNotionals[index] = runningNotional;
        }
    } else {
        for (let index = 0; index < levels.length; index += 1) {
            runningNotional += levels[index].notional;
            cumulativeNotionals[index] = runningNotional;
        }
    }

    const maxAmountDepth = levels.reduce(
        (maxDepth, level) => Math.max(maxDepth, level.notional),
        0,
    );
    const maxCumulativeDepth = cumulativeNotionals.reduce(
        (maxDepth, value) => Math.max(maxDepth, value),
        0,
    );

    const rows: DisplayRow[] = levels.map((level, index) => {
        const totalValue =
            depthMode === "cumulative" ? cumulativeNotionals[index] : level.notional;
        const depthBase =
            depthMode === "cumulative" ? maxCumulativeDepth : maxAmountDepth;
        const cumulativeQuantity =
            operation === "ask"
                ? levels
                      .slice(index)
                      .reduce((sum, currentLevel) => sum + currentLevel.quantity, 0)
                : levels
                      .slice(0, index + 1)
                      .reduce((sum, currentLevel) => sum + currentLevel.quantity, 0);
        const averagePrice =
            cumulativeQuantity === 0
                ? level.price
                : cumulativeNotionals[index] / cumulativeQuantity;

        return {
            amount: formatQuantity(level.quantity),
            depthRatio: depthBase === 0 ? 0 : totalValue / depthBase,
            operation,
            price: formatPriceForDisplay(level.price, tickSize),
            summary: {
                averagePrice: formatAveragePrice(averagePrice),
                sumAmount: formatSumAmount(cumulativeQuantity),
                sumTotal: formatTotal(cumulativeNotionals[index], false),
            },
            total: formatTotal(totalValue, roundingEnabled),
        };
    });

    const missingRowCount = Math.max(targetCount - rows.length, 0);

    if (missingRowCount === 0) {
        return rows;
    }

    const placeholderRows: DisplayRow[] = Array.from({ length: missingRowCount }, () => ({
        amount: "",
        depthRatio: 0,
        isPlaceholder: true,
        operation,
        price: "",
        total: "",
    }));

    return operation === "ask"
        ? [...placeholderRows, ...rows]
        : [...rows, ...placeholderRows];
}

export function bucketOrderBookLevels(args: {
    levels: OrderBookLevel[];
    operation: "ask" | "bid";
    tickSize: TickSizeOption;
}) {
    const { levels, operation, tickSize } = args;
    const buckets = new Map<number, { price: number; quantity: number }>();

    for (const level of levels) {
        const bucketPrice =
            operation === "ask"
                ? ceilToTick(level.price, tickSize)
                : floorToTick(level.price, tickSize);

        const existingBucket = buckets.get(bucketPrice);

        if (existingBucket) {
            existingBucket.quantity += level.quantity;
            continue;
        }

        buckets.set(bucketPrice, {
            price: bucketPrice,
            quantity: level.quantity,
        });
    }

    const sortedBuckets = [...buckets.values()].sort((left, right) =>
        operation === "ask" ? left.price - right.price : right.price - left.price,
    );

    return sortedBuckets.map((bucket) => ({
        notional: bucket.price * bucket.quantity,
        price: bucket.price,
        quantity: bucket.quantity,
    }));
}
