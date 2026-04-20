export type BuySellRatioBarProps = {
  buyPercent: number;
  sellPercent: number;
};

export function BuySellRatioBar({
  buyPercent,
  sellPercent,
}: BuySellRatioBarProps) {
  return (
    <div className="border-t border-shell-border px-4 py-3">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs font-medium">
        <span className="whitespace-nowrap text-book-bid">
          B {buyPercent.toFixed(2)}%
        </span>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-shell-surface-elevated">
          <div className="bg-book-bid" style={{ width: `${buyPercent}%` }} />
          <div className="bg-book-ask" style={{ width: `${sellPercent}%` }} />
        </div>
        <span className="whitespace-nowrap text-book-ask">
          {sellPercent.toFixed(2)}% S
        </span>
      </div>
    </div>
  );
}
