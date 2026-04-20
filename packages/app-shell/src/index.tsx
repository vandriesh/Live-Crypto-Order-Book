import type { ReactNode } from "react";
import btcLogo from "~/assets/market-icons/btc.svg";
import ethLogo from "~/assets/market-icons/eth.svg";
import solLogo from "~/assets/market-icons/sol.svg";

import { formatMarketLabel } from "@neet/utils";

type AppShellProps = {
  children: ReactNode;
  country: string;
  markets: readonly string[];
  currentMarket: string;
  marketType: string;
};

const marketLogoByAsset = {
  BTC: btcLogo,
  ETH: ethLogo,
  SOL: solLogo,
} as const;

export function AppShell({
  children,
  country,
  markets,
  currentMarket,
  marketType,
}: AppShellProps) {
  const currentMarketLabel = formatMarketLabel(currentMarket);
  const currentMarketAsset = currentMarket.toUpperCase().replace(/USDC$/, "");
  const currentMarketLogoSrc =
    marketLogoByAsset[currentMarketAsset as keyof typeof marketLogoByAsset];

  return (
    <div className="min-h-screen bg-shell-bg text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-shell-border bg-shell-surface px-4 py-5 xl:flex">
          <div className="flex items-center gap-3 border-b border-shell-border pb-5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-shell-brand to-shell-brand-alt text-sm font-semibold tracking-[0.22em] text-white shadow-[0_0_28px_-8px_rgba(151,71,255,0.9)]">
              N
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[0.32em] text-white">
                NEET
              </div>
              <p className="text-xs text-shell-text-muted">Trading shell</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-shell-text-faint">
                Trading
              </p>
              <div className="flex flex-col gap-2">
                {["Markets", "Spot", "Futures", "Portfolio", "History"].map(
                  (item) => (
                    <button
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-shell-text-muted transition hover:border-shell-border hover:bg-shell-surface-alt hover:text-white"
                      type="button"
                    >
                      <span className="size-1.5 rounded-full bg-shell-brand" />
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-shell-text-faint">
                Markets
              </p>
              <div className="flex flex-col gap-2">
                {markets.map((market) => (
                  <a
                    key={market}
                    href={`/en/trade/${market}?type=${marketType}`}
                    className={
                      market === currentMarket
                        ? "flex items-center justify-between rounded-xl border border-shell-border-strong bg-shell-surface-elevated px-3 py-2.5 text-sm text-white"
                        : "flex items-center justify-between rounded-xl border border-shell-border bg-shell-surface-alt px-3 py-2.5 text-sm text-shell-text-muted transition hover:border-shell-border-strong hover:text-white"
                    }
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      {marketLogoByAsset[
                        market.toUpperCase().replace(/USDC$/, "") as keyof typeof marketLogoByAsset
                      ] ? (
                        <img
                          alt={`${market} logo`}
                          className="rounded-full"
                          height={18}
                          src={
                            marketLogoByAsset[
                              market.toUpperCase().replace(/USDC$/, "") as keyof typeof marketLogoByAsset
                            ]
                          }
                          width={18}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="inline-flex items-center justify-center rounded-full border border-shell-border bg-shell-surface-elevated font-mono text-[10px] font-semibold tracking-[0.16em] text-shell-text-muted"
                          style={{ height: 18, width: 18 }}
                        >
                          {market.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                      {formatMarketLabel(market)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-xs leading-none text-shell-text-faint"
                    >
                      ☆
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-shell-border bg-shell-surface/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-shell-text-muted">
                <span>Trade</span>
                <span aria-hidden="true" className="text-shell-text-faint">
                  ›
                </span>
                <span className="capitalize">{marketType}</span>
                <span aria-hidden="true" className="text-shell-text-faint">
                  ›
                </span>
                <span className="font-medium text-white">{currentMarketLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-shell-text-muted transition hover:bg-shell-surface-elevated hover:text-white"
                  type="button"
                >
                  <span aria-hidden="true" className="text-sm leading-none">
                    ⌕
                  </span>
                  Search
                </button>
                <button
                  className="inline-flex h-9 items-center rounded-md border border-shell-border bg-shell-surface-alt px-3 text-sm text-shell-text-muted transition hover:bg-shell-surface-elevated hover:text-white"
                  type="button"
                >
                  Login
                </button>
                <button
                  className="inline-flex h-9 items-center rounded-md bg-gradient-to-r from-shell-brand to-shell-brand-alt px-3 text-sm text-white transition hover:opacity-90"
                  type="button"
                >
                  Create Account
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-5">
            <section className="mb-4 rounded-[20px] border border-shell-border-strong bg-shell-surface px-5 py-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {currentMarketLogoSrc ? (
                    <img
                      alt={`${currentMarket} logo`}
                      className="rounded-full"
                      height={44}
                      src={currentMarketLogoSrc}
                      width={44}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center rounded-full border border-shell-border bg-shell-surface-elevated font-mono text-[10px] font-semibold tracking-[0.16em] text-shell-text-muted"
                      style={{ height: 44, width: 44 }}
                    >
                      {currentMarket.slice(0, 3).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-mono text-2xl font-semibold text-white">
                        {currentMarketLabel}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full border border-book-bid/20 bg-book-bid/10 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-book-bid">
                        <span className="size-1.5 rounded-full bg-book-bid" />
                        LIVE
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-shell-text-muted">
                      Viewer country: {country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    ["Last Price", "$75,178.00"],
                    ["24h Change", "+1.24%"],
                    ["24h High", "$75,410.21"],
                    ["24h Low", "$74,902.09"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-shell-text-faint">
                        {label}
                      </p>
                      <p className="mt-1 font-mono text-sm font-medium text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)_330px]">
              <div className="min-h-[720px] overflow-hidden rounded-[24px] border border-shell-border bg-shell-surface shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                {children}
              </div>

              <div className="grid gap-4">
                <section className="rounded-[24px] border border-shell-border bg-shell-surface p-0 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center gap-6 border-b border-shell-border px-5 py-3 text-sm text-shell-text-muted">
                    {["Chart", "Info", "Trading Data", "Square"].map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          index === 0
                            ? "border-b-2 border-yellow-400 pb-2 font-medium text-white"
                            : "pb-2 transition hover:text-white"
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="border-b border-shell-border px-5 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-shell-text-muted">
                      <div className="flex items-center gap-3">
                        <span>Time</span>
                        {["1s", "15m", "1H", "4H", "1D", "1W"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={item === "1D" ? "font-medium text-white" : "transition hover:text-white"}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white">Original</span>
                        <span>Trading View</span>
                        <span>Depth</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex h-[480px] items-center justify-center rounded-[18px] border border-dashed border-shell-border-strong bg-shell-surface-alt/70 text-center">
                      <div>
                        <p className="font-mono text-sm text-white">
                          TradingView-style chart placeholder
                        </p>
                        <p className="mt-2 text-sm text-shell-text-muted">
                          Center panel kept shell-level for layout parity only.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[24px] border border-shell-border bg-shell-surface shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center gap-6 border-b border-shell-border px-5 py-3 text-sm text-shell-text-muted">
                    {["Spot", "Cross", "Isolated", "Grid"].map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          index === 0
                            ? "border-b-2 border-yellow-400 pb-2 font-medium text-white"
                            : "pb-2 transition hover:text-white"
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 p-5 lg:grid-cols-2">
                    <div className="rounded-[18px] border border-shell-border bg-shell-surface-alt p-4">
                      <p className="text-sm font-medium text-white">Buy</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Price
                        </div>
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Total
                        </div>
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Amount
                        </div>
                        <button
                          className="w-full rounded-md bg-book-bid px-3 py-2 text-sm font-medium text-[#06150E] transition hover:bg-book-bid/90"
                          type="button"
                        >
                          Log In
                        </button>
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-shell-border bg-shell-surface-alt p-4">
                      <p className="text-sm font-medium text-white">Sell</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Price
                        </div>
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Amount
                        </div>
                        <div className="rounded-xl border border-shell-border px-3 py-3 text-shell-text-faint">
                          Total
                        </div>
                        <button
                          className="w-full rounded-md bg-book-ask px-3 py-2 text-sm font-medium text-white transition hover:bg-book-ask/90"
                          type="button"
                        >
                          Log In
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid gap-4">
                <section className="rounded-[24px] border border-shell-border bg-shell-surface p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                  <div className="rounded-xl border border-shell-border bg-shell-surface-alt px-3 py-3 text-sm text-shell-text-faint">
                    Search
                  </div>
                  <div className="mt-4 flex items-center gap-4 border-b border-shell-border pb-3 text-sm text-shell-text-muted">
                    {["New", "USDC", "USDT", "USD1", "BNB"].map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          index === 2
                            ? "border-b-2 border-yellow-400 pb-2 font-medium text-white"
                            : "pb-2 transition hover:text-white"
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      ["OG/USDT", "0.583", "+2.10%"],
                      ["1000CAT/USDT", "0.00182", "+1.68%"],
                      ["AAVE/USDT", "90.25", "-3.65%"],
                      ["ACH/USDT", "0.00628", "+2.61%"],
                    ].map(([pair, price, change]) => (
                      <div
                        key={pair}
                        className="grid grid-cols-[1.4fr_0.7fr_0.6fr] gap-3 rounded-xl px-2 py-2 text-xs"
                      >
                        <span className="text-shell-text-muted">{pair}</span>
                        <span className="text-right font-mono text-white">{price}</span>
                        <span
                          className={`text-right font-mono ${change.startsWith("-") ? "text-book-ask" : "text-book-bid"}`}
                        >
                          {change}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-shell-border bg-shell-surface p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <button type="button" className="border-b-2 border-yellow-400 pb-2 font-medium text-white">
                        Market Trades
                      </button>
                      <button type="button" className="pb-2 text-shell-text-muted transition hover:text-white">
                        My Trades
                      </button>
                    </div>
                    <span aria-hidden="true" className="text-shell-text-faint">
                      ...
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["75,136.08", "0.00266", "13:49:46"],
                      ["75,136.12", "0.00015", "13:49:45"],
                      ["75,136.31", "0.00007", "13:49:45"],
                      ["75,136.64", "0.02007", "13:49:44"],
                    ].map(([price, amount, time]) => (
                      <div
                        key={`${price}-${time}`}
                        className="grid grid-cols-3 gap-3 font-mono text-xs text-shell-text-muted"
                      >
                        <span className="text-book-ask">{price}</span>
                        <span className="text-right">{amount}</span>
                        <span className="text-right">{time}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-shell-border bg-shell-surface p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Top Movers</h3>
                    <span aria-hidden="true" className="text-shell-text-faint">
                      ›
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2 text-xs text-shell-text-muted">
                    {["All", "Change", "Volume"].map((item, index) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          index === 0
                            ? "rounded-full bg-shell-surface-elevated px-3 py-1.5 text-white"
                            : "rounded-full px-3 py-1.5 transition hover:bg-shell-surface-elevated hover:text-white"
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["PNUT/USDT", "-12.20%"],
                      ["SKY/BTC", "+8.00%"],
                      ["BNB/USDT", "+4.51%"],
                    ].map(([pair, move]) => (
                      <div
                        key={pair}
                        className="flex items-center justify-between rounded-xl border border-shell-border bg-shell-surface-alt px-3 py-2 text-xs"
                      >
                        <span className="text-shell-text-muted">{pair}</span>
                        <span
                          className={`font-mono ${move.startsWith("-") ? "text-book-ask" : "text-book-bid"}`}
                        >
                          {move}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
