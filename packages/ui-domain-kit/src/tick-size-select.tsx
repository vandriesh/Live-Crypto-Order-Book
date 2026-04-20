import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neet/ui-kit";

export type TickSizeSelectProps<TOption extends string = string> = {
  onValueChange: (value: TOption) => void;
  options: readonly TOption[];
  value: TOption;
};

export function TickSizeSelect<TOption extends string>({
  onValueChange,
  options,
  value,
}: TickSizeSelectProps<TOption>) {
  return (
    <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as TOption)}>
      <SelectTrigger className="h-7 min-w-20 border-shell-border bg-transparent px-2.5 font-mono text-sm text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-32 border-shell-border bg-shell-surface-elevated text-shell-text-muted">
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="font-mono text-sm focus:bg-shell-surface-alt focus:text-white"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
