import {
    DataProvider,
    useMarketDataLive,
} from "@neet/binance-connection-manager";
import {
    BuySellRatioBar,
    OrderBookMidPriceRow,
    OrderBookVisibilityToggle,
    TickSizeSelect,
} from "@neet/ui-domain-kit";
import { cn } from "@neet/ui-kit";
import type { SupportedMarket } from "@neet/data";

import { OrderBookDisplayPopup } from "./order-book-display-popup";
import {
    OrderBookDisplayProvider,
    useOrderBookDisplayActions,
    useOrderBookDisplayState,
    useOrderBookDisplayViewData,
    useOrderBookTickSizeOptions,
} from "./order-book-display-provider";
import { OrderBookSideLevels } from "./order-book-side-levels";
import { formatMarketLabel } from "@neet/utils";

type OrderBookContainerProps = {
    market: SupportedMarket;
    marketType: string;
};

export function OrderBookContainer({
    market,
    marketType,
}: OrderBookContainerProps) {
    return (
        <OrderBookDisplayProvider>
            <OrderBookContainerContent market={market} marketType={marketType} />
        </OrderBookDisplayProvider>
    );
}

function OrderBookContainerLiveDataBoundary({
    market,
    marketType,
}: OrderBookContainerProps) {
    const { orderBookSnapshot } = useMarketDataLive();
    const view = useOrderBookDisplayViewData({ market, orderBookSnapshot });
    const state = useOrderBookDisplayState();
    const {
        asks,
        baseAsset,
        bids,
        buyRatio,
        midPriceRow,
        quoteAsset,
        sellRatio,
        showRatio,
    } = view;
    const showAsks = state.visibleOperation === "both" || state.visibleOperation === "ask";
    const showBids = state.visibleOperation === "both" || state.visibleOperation === "bid";
    const isBothVisible = state.visibleOperation === "both";

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-[20px] border border-shell-border bg-shell-surface-alt" data-testid="order-book-section">
            <div className="grid grid-cols-[1fr_1fr_1fr] px-4 py-3 text-xs text-shell-text-faint" >
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
                                animationsEnabled={state.animationsEnabled}
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
                                animationsEnabled={state.animationsEnabled}
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
    );
}

export function OrderBookContainerContent({
    market,
    marketType,
}: OrderBookContainerProps) {
    const actions = useOrderBookDisplayActions();
    const state = useOrderBookDisplayState();
    const tickSizeOptions = useOrderBookTickSizeOptions();
    const marketLabel = formatMarketLabel(market);

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
                <DataProvider market={market} marketType={marketType}>
                    <OrderBookContainerLiveDataBoundary market={market} marketType={marketType} />
                </DataProvider>
            </div>
        </div>
    );
}
