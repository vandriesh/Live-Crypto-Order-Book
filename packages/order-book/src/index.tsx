import { dataFeatureSummary, supportedMarkets } from "@neet/data";

type OrderBookFeatureProps = {
  country: string;
};

export function OrderBookFeature({ country }: OrderBookFeatureProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-400">
            <span>NEET crypto</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 tracking-[0.2em] text-emerald-300">
              placeholder scaffold
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Order book challenge workspace
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">
              This first pass locks in the package boundaries and alias wiring.
              The real Binance-like order book behavior will be layered in
              gradually, starting with the data package and the smart container.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <div className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2">
              Viewer country: {country}
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2">
              Markets queued: {supportedMarkets.join(", ")}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Package
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {dataFeatureSummary.packageName}
                </h2>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                {dataFeatureSummary.status}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {dataFeatureSummary.responsibility}
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              {dataFeatureSummary.nextMilestones.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Next package
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              @neet/order-book
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This package will become the smart container that owns book
              orchestration, settings, and rendering. For now it intentionally
              stays thin while the boundaries become clearer.
            </p>

            <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 p-5">
              <p className="text-sm font-medium text-white">
                Planned responsibilities
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Market switching UI</li>
                <li>Bid and ask ladder rendering</li>
                <li>Decimals and rounding controls</li>
                <li>Ratio and depth visualization modes</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
