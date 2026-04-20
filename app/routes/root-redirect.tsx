import { redirect } from "react-router";
import { defaultMarket } from "@neet/data";

import type { Route } from "./+types/root-redirect";

export async function loader({}: Route.LoaderArgs) {
  throw redirect(`/en/trade/${defaultMarket}?type=spot`);
}

export default function RootRedirect() {
  return null;
}
