import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderBookVisualLayer } from "./order-book-visual-layer";

describe("OrderBookVisualLayer", () => {
  it("renders a bid visual layer with hidden animation and expected depth width", () => {
    const { container } = render(
      <OrderBookVisualLayer
        animated={false}
        depthRatio={0.5}
        hoverState="idle"
        tone="bid"
      />,
    );

    const layers = container.querySelectorAll("div[aria-hidden='true']");
    const animationLayer = layers[0];
    const depthLayer = layers[1];

    expect(animationLayer).toHaveClass("bg-emerald-500/30");
    expect(animationLayer).toHaveClass("opacity-0");
    expect(depthLayer).toHaveClass("bg-book-bid-soft");
    expect(depthLayer).toHaveStyle({ width: "29%" });
  });

  it("renders an ask visual layer with visible animation and active depth styling", () => {
    const { container } = render(
      <OrderBookVisualLayer
        animated
        depthRatio={1}
        hoverState="active"
        tone="ask"
      />,
    );

    const layers = container.querySelectorAll("div[aria-hidden='true']");
    const animationLayer = layers[0];
    const depthLayer = layers[1];

    expect(animationLayer).toHaveClass("bg-red-500/30");
    expect(animationLayer).toHaveClass("opacity-100");
    expect(depthLayer).toHaveClass("bg-book-ask-soft");
    expect(depthLayer).toHaveClass("opacity-100");
    expect(depthLayer).toHaveStyle({ width: "58%" });
  });
});
