const TOTAL_WIDTH = 30;
const BAR_STEPS = 10;
const DEPTH_CHAR = "░";
const ANIMATION_CHAR = "▒";
const OVERLAP_CHAR = "▓";

function clampPercentage(percentage: number) {
  if (!Number.isFinite(percentage)) {
    return 0;
  }

  return Math.max(0, Math.min(1, percentage));
}

export function createAsciiBarString(args: {
  percentage: number;
}) {
  const { percentage } = args;
  const safeWidth = TOTAL_WIDTH;
  const quantizedPercentage =
    Math.round(clampPercentage(percentage) * BAR_STEPS) / BAR_STEPS;
  const fillWidth = Math.round(safeWidth * quantizedPercentage);

  return `${" ".repeat(safeWidth - fillWidth)}${DEPTH_CHAR.repeat(fillWidth)}`;
}

export function createAsciiVisualLayer(args: {
  animated: boolean;
  percentage: number;
}) {
  const { animated, percentage } = args;
  const depthLayer = createAsciiBarString({ percentage });

  if (!animated) {
    return depthLayer;
  }

  return Array.from({ length: TOTAL_WIDTH }, (_, index) => {
    const depthCharacter = depthLayer[index];

    return depthCharacter === " " ? ANIMATION_CHAR : OVERLAP_CHAR;
  }).join("");
}
