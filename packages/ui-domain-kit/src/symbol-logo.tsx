import btcLogo from "~/assets/market-icons/btc.svg";
import ethLogo from "~/assets/market-icons/eth.svg";
import solLogo from "~/assets/market-icons/sol.svg";

import { cn } from "@neet/ui-kit";

const marketLogoByAsset = {
  BTC: btcLogo,
  ETH: ethLogo,
  SOL: solLogo,
} as const;

type SupportedAsset = keyof typeof marketLogoByAsset;

type SymbolLogoProps = Omit<
  React.ComponentPropsWithoutRef<"img">,
  "alt" | "src"
> & {
  market: string;
  size?: number;
};

function getAssetFromMarket(market: string): SupportedAsset | null {
  const normalizedMarket = market.toUpperCase();

  if (normalizedMarket in marketLogoByAsset) {
    return normalizedMarket as SupportedAsset;
  }

  if (normalizedMarket.endsWith("USDC")) {
    const baseAsset = normalizedMarket.slice(0, -4);
    if (baseAsset in marketLogoByAsset) {
      return baseAsset as SupportedAsset;
    }
  }

  return null;
}

export function SymbolLogo({
  market,
  size = 28,
  className,
  ...props
}: SymbolLogoProps) {
  const asset = getAssetFromMarket(market);

  if (!asset) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-shell-border bg-shell-surface-elevated font-mono text-[10px] font-semibold tracking-[0.16em] text-shell-text-muted",
          className,
        )}
        style={{ height: size, width: size }}
      >
        {market.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      {...props}
      alt={`${asset} logo`}
      className={cn("rounded-full", className)}
      height={size}
      src={marketLogoByAsset[asset]}
      width={size}
    />
  );
}
