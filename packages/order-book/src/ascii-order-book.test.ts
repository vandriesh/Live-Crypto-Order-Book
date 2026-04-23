import {createAsciiVisualLayer,} from "./ascii-order-book.ts";
import {expect, test} from "vitest";

test("createAsciiBarString paints a proportional right-aligned bar in tenth steps", () => {
    expect(
        createAsciiVisualLayer({animated: false, percentage: 0.3})).toEqual(
        "                     ░░░░░░░░░",
    );
    expect(
        createAsciiVisualLayer({animated: true, percentage: 0.3}),).toEqual(
        "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓",
    );
});
