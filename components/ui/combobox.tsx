'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

type ComboboxProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
};

/** A shadcn-style searchable combobox that also accepts a value not in its suggestions. */
function Combobox({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
}: ComboboxProps) {
  return (
    <Autocomplete.Root
      items={options}
      value={value}
      onValueChange={onValueChange}
      autoHighlight
      openOnInputClick
    >
      <div className="relative">
        <Autocomplete.Input
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 pr-9 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        <ChevronsUpDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={8} className="z-50 w-[min(100vw-2rem,28rem)]">
          <Autocomplete.Popup className="overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            <Autocomplete.List>
              {(option: string) => (
                <Autocomplete.Item
                  key={option}
                  value={option}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {option}
                  <CheckIcon className="size-4 opacity-0 data-selected:opacity-100" />
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
            <Autocomplete.Empty className="px-2 py-3 text-sm text-muted-foreground">
              Keep typing to use a custom role.
            </Autocomplete.Empty>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

export { Combobox };
