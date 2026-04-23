# README Visual Testing Guide

This file records the selected user prompts related to the visual testing approach in chronological order.

## 1. Visual Testing Strategy

> let me teach you how to visually test
> basically it'a simple unit test that scaffolds the env to test,
> 1. add provider
> 2. feed it mock data
> 3. check UI

## 2. ASCII Shade Direction

> not quite, more like this:
>
> ```
>  78,811.88     ░░░0.07326░░░░░░░░░5.77K
>  78,811.87▒▒▒▒▒▒▒▒0.00007▒▒▓▓▓▓5.516830
>  78,811.82  ░░░░░░0.00007░░░░░░5.516827
> ```

## 3. Bar Drawing Scaffold

> Now we need to scaffold the test and have to check first how we draw the bars.
> now it looks like layer
> 1st `xxx   yyy   zzz`
> 2nd `▒▒▒▒▒▒▒▓▓▓▓`
>
> and we need to:
> 1st detach painting elements in a separate components tha receives number param (percentage) to draw the bars
>
> then we Mock this UI elements with ASCII block shading elements
>
> The challenge would be to tell how many digits the row has so we overlap with the full bars for instance.
>
> 5 digits `xx   x` will overlap with 3 bars like
> `xx ▓x`
>
> So think of the space and merging these two layers and the digits take precedence. If there is a digit we don't draw an under bar.
>
> Make sense?
>
> I think it would be nice to have a small test for this utility to make sure we draw correctly the mocked rows.

## 4. Depth Bar Export Boundary

> 1. OrderBookDepthBar it is not used outside so it is not needed to be exported.
> 2. As mock examples for the test please use three columns OrderBookRow "style"
> `78,811.88        0.07326         5.77K`

## 5. Simplify the ASCII Utility

> That's quite complicated logic you had and it has a lot of parameters. What I was looking for is to
> 1st pass percentage (number)
> `          xxxxxxxxxx` - nicer if it's divided by 10 - easier to determin visually the bars value
> This one should be done first.
>
> than we have char to place (number/the actual bar )
> `123.3    45.5   11.1`
>
> than we jsut insert each number chars [0-9,] into final results

## 6. Keep It Generic

> Also there is no need to be that domain-specific. All we need is to have two strings:
> 1. one representing the bars   `    ======` (60% - proportional)
> 2. the other representing the row `123 567 90` - but I decided we better hav 20 chars to have more space for splitting columns

## 7. Three-Layer Correction

> Sorry I forgot to mention that we have three layers.

## 8. Remove Low-Value Test

> ```
> test("createAsciiRowString creates a fixed-width row string", () => {
>   assert.equal(
>     createAsciiRowString({
>       row: "123.56  901.34  78.0",
>       width: 20,
>     }),
>     "123.56  901.34  78.0",
>   );
> });
> ```
>
> I don't see any usefulness in this test.
>
> Our case we will have three columns, one in the left and the middle and the right. There won't be any space to trim.

## 9. Target Animated Result

> let me remind you how end results should look like
>
> ```
>  78,811.88     ░░░0.07326░░░░░░░░░5.77K
>  78,811.87▒▒▒▒▒▒▒▒0.00007▒▒▓▓▓▓5.516830
>  78,811.82  ░░░░░░0.00007░░░░░░5.516827
> ```
>
> 2nd row - this is the animated row that overlaps a bar.
>
> Animation roll has two shades: lighter and darker.  Attach the image so you can see better how we can organize the shading.

## 10. Rendering Split

> So here is the deal: we should split our UI rendering role into three parts:
> 1. One that draws the bars
> 2. One that draws the animation, basically highlighting the whole role
> 3. Another that draws the value, the content
>
> In unit test we mock these elements and introduce our ASCII render.
>
> So if in real life we get a style to render a bar of 60%, in our test we will render the ASCII shading charts.
>
> Make sense?

## 11. Full-Row Overlay Rule

> ```
> test("mergeAsciiLayers gives the animation layer precedence over depth", () => {
>   assert.equal(
>     mergeAsciiLayers({
>       base: "    ░░░░░░",
>       overlay: "      ▒▒▒▒",
>       overlapChar: "▓",
>     }),
>     "    ░░▓▓▓▓",
>   );
> });
> ```
> When we have overlay, we overlay the whole row. The blink animation class changes the animation property to overlay the whole row.

## 12. API Cleanup

> ```
> mergeAsciiLayers({
>       base: "    ░░░░░░",
>       overlay: "▒▒▒▒▒▒▒▒▒▒",
>       overlapChar: "▓",
>     }),
> ```
> It's not quite a config I'd expect. This change should be hardcoded and not mentioned, only checked for
>
> The properties are a different story. What it should is to get the bar in percentage and overlay animation boolean.

## 13. Wider Row for Better Readability

> let's make use of 30 chars ;-)
>
> let's use a market with smaller numbers - to the row would have more space for bar/overay chars

## 14. Separate Layers vs Merged Line

> btw what would be more clear (in your opinion)
>
> 1 row, 2 "layers": visual bg/2nd data layour
> ```
> "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓",
> " 8.46     758.84     6.41K"
> ```
>
> or what we have now:
>
> ```
> "▒8.46▒▒▒▒▒▒▒▒758.84▒▒▒▓▓▓▓6.41K"
> ```

## 15. Remove Unneeded Merge Path

> You don't need anymore to merge layers, correct? Clean the functionality.

## 16. React Testing Setup

> And second please add testing library React and the test to be able to start writing tests.

## 17. Expected Snapshot Shape

> the test should look like:
>
> ```
> `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
> 8.49       3.00000     25.47  `,
>       // createAsciiSnapshotRow({
>       //   row: "8.49       3.00000     25.47  ",
>       //   visual: createAsciiVisualLayer({ animated: false, percentage: 1 }),
>       // }),
> ```

## 18. Mock at the Right Boundary

> The scope of separating the UI component was to be able to mock it in the tests. I'd like to mock only this UI component so I could use the original rendering elements. The test should do a check for the container, the provider, the rendering DOM elements, and we only update these UI overlay responsible components.
>
> Just to check we do have a component for showing the animation overlay and the bars separately, right?

## 19. Visual Layer Mock Return

> Instead of :
>
> ```
> vi.mock("../../ui-domain-kit/src/order-book-visual-layer.tsx", () => ({
>   OrderBookVisualLayer: ({
>     animated = false,
>     depthRatio,
>   }: {
>     animated?: boolean;
>     className?: string;
>     depthRatio: number;
>     hoverState?: "active" | "idle";
>     tone: "ask" | "bid";
>   }) => (
>     <i
>       aria-hidden="true"
>       data-animated={animated ? "true" : "false"}
>       data-depth-ratio={String(depthRatio)}
>       data-testid="mock-order-book-visual-layer"
>     />
>   ),
> }));
> ```
>
> we should retujrn something like
> `createAsciiVisualLayer({animated: false, percentage: 0.3}))`


## 20. Mock Ratio Bar Too

> Now let's mock BuySellRatioBar the same way we mocked the visual compoentns
> `B 60.00%               40.00% S`
>
> ```
> `B 60.00% [++++------] 40.00% S`
> ```
> You know better, ASCII, to show well maybe that shadcn components lighter and darker.

## 21. Mock Mid Price Too

> OrderBookMidPriceRow  also can benefit from such mocking use emoji red arrow and green arrow if you have; if not please use ASCII arrows.

## 22. Force Animated Rows

> It looks like we don't have any animation.  I'll just mock data to have at least two.

## 23. Require Three Shades

> The idea is to have three shades in the test and now I see only two:
> 1. First is for Simple Bar.
> 2. Second use case is for Overlay.
> 3. When Overlay overlaps a bar we get third shade.
