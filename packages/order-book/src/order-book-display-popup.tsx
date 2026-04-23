import { Ellipsis } from "lucide-react";

import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Switch,
} from "@neet/ui-kit";

import {
  useOrderBookDisplayActions,
  useOrderBookDisplayState,
} from "./order-book-display-provider";

function LabeledCheckbox({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-shell-text-muted">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        className="border-shell-border-strong bg-shell-surface-alt data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-shell-bg"
      />
      <span>{label}</span>
    </label>
  );
}

export function OrderBookDisplayPopup() {
  const actions = useOrderBookDisplayActions();
  const state = useOrderBookDisplayState();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Order book display settings"
          className="text-shell-text-faint transition hover:text-white"
        >
          <Ellipsis className="size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[240px] rounded-[18px] border-shell-border bg-shell-surface-elevated p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.95)]"
      >
        <div className="space-y-5">
          <div>
            <p className="text-xs text-shell-text-faint">Order Book Display</p>
            <div className="mt-3 flex flex-col gap-3">
              <LabeledCheckbox
                checked={state.displayAverage}
                label="Display Avg.&Sum"
                onCheckedChange={actions.setDisplayAverage}
              />
              <LabeledCheckbox
                checked={state.showRatio}
                label="Show Buy/Sell Ratio"
                onCheckedChange={actions.setShowRatio}
              />
              <LabeledCheckbox
                checked={state.roundingEnabled}
                label="Rounding"
                onCheckedChange={actions.setRoundingEnabled}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-shell-text-faint">Book Depth Visualization</p>
            <RadioGroup
              value={state.depthMode}
              onValueChange={(value) => actions.setDepthMode(value as "amount" | "cumulative")}
              className="mt-3 gap-3"
            >
              <label className="flex items-center gap-3 text-sm text-shell-text-muted">
                <RadioGroupItem
                  value="amount"
                  className="border-shell-border-strong bg-transparent text-white"
                />
                <span>Amount</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-shell-text-muted">
                <RadioGroupItem
                  value="cumulative"
                  className="border-shell-border-strong bg-transparent text-white"
                />
                <span>Cumulative</span>
              </label>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-shell-text-muted">Animations</span>
            <Switch
              checked={state.animationsEnabled}
              onCheckedChange={actions.setAnimationsEnabled}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-shell-surface-alt"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
