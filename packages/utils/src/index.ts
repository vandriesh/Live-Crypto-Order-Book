export function formatMarketLabel(market: string) {
  const quote = market.slice(-4);
  const base = market.slice(0, -4);

  return `${base}/${quote}`;
}

function toPositiveTickValue(tickSize: number | string) {
  const tickValue =
    typeof tickSize === "number" ? tickSize : Number.parseFloat(tickSize);

  if (!Number.isFinite(tickValue) || tickValue <= 0) {
    return null;
  }

  return tickValue;
}

const compactNumberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const priceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

const averagePriceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

const quantityFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

const sumAmountFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const totalPreciseFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

export function formatPrice(value: number) {
  return priceFormat.format(value);
}

export function formatAveragePrice(value: number) {
  return averagePriceFormat.format(value);
}

export function formatQuantity(value: number) {
  return quantityFormat.format(value);
}

export function formatSumAmount(value: number) {
  return sumAmountFormat.format(value);
}

export function formatTotal(value: number, humanReadable: boolean) {
  if (humanReadable) {
    return compactNumberFormat.format(value);
  }

  return totalPreciseFormat.format(value);
}


export function floorToTick(value: number, tickSize: number | string) {
  const tickValue = toPositiveTickValue(tickSize);

  if (tickValue == null) {
    return value;
  }

  return Math.floor(value / tickValue) * tickValue;
}

export function ceilToTick(value: number, tickSize: number | string) {
  const tickValue = toPositiveTickValue(tickSize);

  if (tickValue == null) {
    return value;
  }

  return Math.ceil(value / tickValue) * tickValue;
}

export function getTickFractionDigits(tickSize: number | string) {
  const serializedTickSize =
    typeof tickSize === "number" ? tickSize.toString() : tickSize;
  const [, decimals = ""] = serializedTickSize.split(".");

  return decimals.length;
}

const priceForDisplayFormatCache = new Map<number, Intl.NumberFormat>();

export function formatPriceForDisplay(
  value: number,
  tickSize: number | string,
) {
  const fractionDigits = getTickFractionDigits(tickSize);
  let formatter = priceForDisplayFormatCache.get(fractionDigits);

  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: Math.max(fractionDigits, 3),
    });
    priceForDisplayFormatCache.set(fractionDigits, formatter);
  }

  return formatter.format(value);
}
