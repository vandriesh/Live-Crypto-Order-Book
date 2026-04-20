import { netlifyRouterContext } from "@netlify/vite-plugin-react-router/edge";
import { OrderBookFeature } from "@neet/order-book";

import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NEET Crypto Order Book" },
    { name: "description", content: "Gradual architecture scaffold for the YEET order book challenge." },
  ];
}

// Example middleware that adds a custom header
const customDateHeaderMiddleware: Route.MiddlewareFunction = async (
  _request,
  next,
) => {
  const response = await next();
  response.headers.set("X-Current-Date", new Date().toUTCString());
  return response;
};

// Example middleware that uses Netlify context
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

export async function loader({ context }: Route.LoaderArgs) {
  const country =
    context.get(netlifyRouterContext).geo?.country?.name ?? "unknown location";

  return { country };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <OrderBookFeature country={loaderData.country} />;
}
