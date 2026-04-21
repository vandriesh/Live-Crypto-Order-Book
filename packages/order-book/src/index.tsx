import { DataProvider } from "@neet/binance-connection-manager";
import {
    BuySellRatioBar,
    OrderBookAvgSumTooltip,
    OrderBookLevelRow,
    OrderBookMidPriceRow,
    OrderBookVisibilityToggle,
    TickSizeSelect,
} from "@neet/ui-domain-kit";
import {cn} from "@neet/ui-kit";
import {useState} from "react";
import type { SupportedMarket } from "@neet/data";

import {OrderBookDisplayProvider, useOrderBookDisplay,} from "./order-book-display-provider";
import {OrderBookDisplayPopup} from "./order-book-display-popup";
import {getAskHoverState, getBidHoverState} from "./utils";

type OrderBookContainerProps = {
    market: SupportedMarket;
    marketType: string;
};

export function OrderBookContainer({
    market,
    marketType,
}: OrderBookContainerProps) {
    return (
        <DataProvider market={market} marketType={marketType}>
            <OrderBookDisplayProvider>
                <OrderBookContainerContent/>
            </OrderBookDisplayProvider>
        </DataProvider>
    );
}

function OrderBookContainerContent() {
    const {actions, state, tickSizeOptions, view} = useOrderBookDisplay();
    const [hoveredAskIndex, setHoveredAskIndex] = useState<number | null>(null);
    const [hoveredBidIndex, setHoveredBidIndex] = useState<number | null>(null);
    const {
        asks,
        baseAsset,
        bids,
        buyRatio,
        marketLabel,
        midPriceRow,
        quoteAsset,
        sellRatio,
        showRatio,
    } = view;
    const showAsks = state.visibleOperation === "both" || state.visibleOperation === "ask";
    const showBids = state.visibleOperation === "both" || state.visibleOperation === "bid";
    const isBothVisible = state.visibleOperation === "both";

    function renderAskRow(row: (typeof asks)[number], index: number) {
        const hoverState = getAskHoverState(index, hoveredAskIndex);
        const rowContent = (
            <OrderBookLevelRow
                key={`ask-${row.price}-${row.total}`}
                amount={row.amount}
                depthRatio={row.depthRatio}
                hoverState={hoverState}
                onMouseEnter={() => setHoveredAskIndex(index)}
                onMouseLeave={() => setHoveredAskIndex(null)}
                tone="ask"
                price={row.price}
                total={row.total}
            />
        );

        if (!state.displayAverage || hoverState !== "active" || !row.summary) {
            return rowContent;
        }

        return (
            <OrderBookAvgSumTooltip
                key={`ask-tooltip-${row.price}-${row.total}`}
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
    }

    function renderBidRow(row: (typeof bids)[number], index: number) {
        const hoverState = getBidHoverState(index, hoveredBidIndex);
        const rowContent = (
            <OrderBookLevelRow
                key={`bid-${row.price}-${row.total}`}
                amount={row.amount}
                depthRatio={row.depthRatio}
                hoverState={hoverState}
                onMouseEnter={() => setHoveredBidIndex(index)}
                onMouseLeave={() => setHoveredBidIndex(null)}
                tone="bid"
                price={row.price}
                total={row.total}
            />
        );

        if (!state.displayAverage || hoverState !== "active" || !row.summary) {
            return rowContent;
        }

        return (
            <OrderBookAvgSumTooltip
                key={`bid-tooltip-${row.price}-${row.total}`}
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
    }

    return (
        <div className="flex h-full flex-col bg-shell-surface">
            <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
                <div>
                    <h2 className="text-sm font-semibold text-white">Order Book</h2>
                    <p className="mt-1 text-xs text-shell-text-faint">{marketLabel}</p>
                </div>
                <OrderBookDisplayPopup/>
            </div>

            <div className="flex items-center justify-between border-b border-shell-border px-4 py-2">
                <OrderBookVisibilityToggle
                    value={state.visibleOperation}
                    onValueChange={actions.setVisibleOperation}
                />

                <TickSizeSelect
                    options={tickSizeOptions}
                    value={state.tickSize}
                    onValueChange={actions.setTickSize}
                />
            </div>

            <div className="flex-1 p-4">
                <section
                    className="flex h-full flex-col overflow-hidden rounded-[20px] border border-shell-border bg-shell-surface-alt">
                    <div className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 text-xs text-shell-text-faint">
                        <span>Price ({quoteAsset})</span>
                        <span className="text-right">Amount ({baseAsset})</span>
                        <span className="text-right">Total</span>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col px-2 pb-3">
                        {showAsks ? (
                            <div
                                className={cn(
                                    "min-h-0 overflow-hidden",
                                    isBothVisible ? "flex-1" : "flex-[2]",
                                )}
                            >
                                <div className="flex min-h-full flex-col justify-end">
                                    {asks.map((row, index) => (
                                        row.isPlaceholder ? (
                                            <div key={`ask-placeholder-${index}`} className="h-8"/>
                                        ) : (
                                            renderAskRow(row, index)
                                        )
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <OrderBookMidPriceRow
                            direction={midPriceRow.direction}
                            price={midPriceRow.price}
                            referencePrice={midPriceRow.referencePrice}
                        />

                        {showBids ? (
                            <div
                                className={cn(
                                    "min-h-0 overflow-hidden",
                                    isBothVisible ? "flex-1" : "flex-[2]",
                                )}
                            >
                                <div className="flex flex-col">
                                    {bids.map((row, index) => (
                                        row.isPlaceholder ? (
                                            <div key={`bid-placeholder-${index}`} className="h-8"/>
                                        ) : (
                                            renderBidRow(row, index)
                                        )
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {showRatio ? (
                        <BuySellRatioBar buyPercent={buyRatio} sellPercent={sellRatio}/>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
