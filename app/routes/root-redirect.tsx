import { redirect } from "react-router";
import { netlifyRouterContext } from "@netlify/vite-plugin-react-router/edge";
import { defaultMarket } from "@neet/data";

import type { Route } from "./+types/root-redirect";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NEET Crypto Order Book" },
    {
      name: "description",
      content: "Gradual architecture scaffold for the YEET order book challenge.",
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

export async function loader({ context }: Route.LoaderArgs) {
  const country =
    context.get(netlifyRouterContext).geo?.country?.name ?? "unknown location";

  console.log(
    `Redirecting viewer from ${country} to default market ${defaultMarket}`,
  );

  throw redirect(`/en/trade/${defaultMarket}?type=spot`);
}

export default function RootRedirect() {
  return null;
}
