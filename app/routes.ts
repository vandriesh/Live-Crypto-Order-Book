import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/root-redirect.tsx"),
  route("en/trade/:market", "routes/trade.tsx"),
] satisfies RouteConfig;
