import { redirect } from "react-router";
import { netlifyRouterContext } from "@netlify/vite-plugin-react-router/edge";
import { AppShell } from "@neet/app-shell";
import {
  defaultMarket,
  isSupportedMarket,
  supportedMarkets,
} from "@neet/data";
import { OrderBookContainer } from "@neet/order-book";

import type { Route } from "./+types/trade";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `NEET Crypto ${params.market ?? defaultMarket}` },
    {
      name: "description",
      content: "NEET order book trading route scaffold.",
    },
  ];
}

const customDateHeaderMiddleware: Route.MiddlewareFunction = async (
  _request,
  next,
) => {
  const response = await next();
  response.headers.set("X-Current-Date", new Date().toUTCString());
  return response;
};

const logMiddleware: Route.MiddlewareFunction = async ({
  request,
  context,
}) => {
  const country =
    context.get(netlifyRouterContext).geo?.country?.name || "unknown location";
  console.log(
    `Handling ${request.method} request to ${request.url} from ${country}`,
  );
};

export const middleware: Route.MiddlewareFunction[] = [
  customDateHeaderMiddleware,
  logMiddleware,
];

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const country =
    context.get(netlifyRouterContext).geo?.country?.name ?? "unknown location";
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "spot";
  const market = params.market;

  if (!isSupportedMarket(market)) {
    throw redirect(`/en/trade/${defaultMarket}?type=${type}`);
  }

  return {
    country,
    market,
    type,
  };
}

export default function TradeRoute({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell
      country={loaderData.country}
      markets={supportedMarkets}
      currentMarket={loaderData.market}
      marketType={loaderData.type}
    >
      <OrderBookContainer />
    </AppShell>
  );
}
