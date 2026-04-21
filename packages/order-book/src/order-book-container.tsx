import { DataProvider, useMarketData } from "@neet/binance-connection-manager";
import {
    BuySellRatioBar,
    OrderBookMidPriceRow,
    OrderBookVisibilityToggle,
    TickSizeSelect,
} from "@neet/ui-domain-kit";
import { cn } from "@neet/ui-kit";
import type { SupportedMarket } from "@neet/data";

import { OrderBookDisplayPopup } from "./order-book-display-popup";
import { OrderBookDisplayProvider, useOrderBookDisplay } from "./order-book-display-provider";
import { OrderBookSideLevels } from "./order-book-side-levels";

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
            <OrderBookContainerDataBoundary />
        </DataProvider>
    );
}

function OrderBookContainerDataBoundary() {
    const { market, orderBookSnapshot } = useMarketData();

    return (
        <OrderBookDisplayProvider market={market} orderBookSnapshot={orderBookSnapshot}>
            <OrderBookContainerContent />
        </OrderBookDisplayProvider>
    );
}

export function OrderBookContainerContent() {
    const { actions, state, tickSizeOptions, view } = useOrderBookDisplay();
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

    return (
        <div className="flex h-full flex-col bg-shell-surface">
            <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
                <div>
                    <h2 className="text-sm font-semibold text-white">Order Book</h2>
                    <p className="mt-1 text-xs text-shell-text-faint">{marketLabel}</p>
                </div>
                <OrderBookDisplayPopup />
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
                <section className="flex h-full flex-col overflow-hidden rounded-[20px] border border-shell-border bg-shell-surface-alt">
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
                                    <OrderBookSideLevels
                                        baseAsset={baseAsset}
                                        displayAverage={state.displayAverage}
                                        quoteAsset={quoteAsset}
                                        rows={asks}
                                        variant="ask"
                                    />
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
                                    <OrderBookSideLevels
                                        baseAsset={baseAsset}
                                        displayAverage={state.displayAverage}
                                        quoteAsset={quoteAsset}
                                        rows={bids}
                                        variant="bid"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {showRatio ? (
                        <BuySellRatioBar buyPercent={buyRatio} sellPercent={sellRatio} />
                    ) : null}
                </section>
            </div>
        </div>
    );
}
