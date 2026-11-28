'use client';

import { Combobox } from '@base-ui/react/combobox';
import { Select } from '@base-ui/react/select';
import { Check, ChevronDown, Search } from 'lucide-react';

export type Choice = { value: string; label: string };
type ChoiceFieldProps = {
  name: string;
  label: string;
  options: Choice[];
  defaultValue: string | null;
};

export function SelectField({ name, label, options, defaultValue }: ChoiceFieldProps) {
  return (
    <div>
      <Select.Root items={options} name={name} defaultValue={defaultValue} required>
        <Select.Label className="field-label">{label}</Select.Label>
        <Select.Trigger className="choice-trigger">
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={17} aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="choice-positioner"
            align="start"
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <Select.Popup className="choice-popup">
              <Select.List className="choice-list">
                {options.map((option) => (
                  <Select.Item key={option.value} value={option.value} className="choice-option">
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="choice-check">
                      <Check size={16} aria-hidden="true" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

type SearchableChoiceProps = Omit<ChoiceFieldProps, 'defaultValue'> & {
  value: Choice | null;
  placeholder: string;
  searchLabel: string;
  emptyMessage: string;
  disabled?: boolean;
  onValueChange: (value: Choice | null) => void;
  onOpenChange?: (open: boolean) => void;
  onQueryChange?: (query: string) => void;
};

export function SearchableChoiceField({
  name,
  label,
  options,
  value,
  placeholder,
  searchLabel,
  emptyMessage,
  disabled,
  onValueChange,
  onOpenChange,
  onQueryChange,
}: SearchableChoiceProps) {
  return (
    <div>
      <Combobox.Root
        items={options}
        name={name}
        value={value}
        isItemEqualToValue={(item, selected) => item.value === selected.value}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        onInputValueChange={(query, details) => {
          if (details.reason === 'input-change' || query === '') onQueryChange?.(query);
        }}
        filter={onQueryChange ? null : undefined}
        disabled={disabled}
        required
      >
        <Combobox.Label className="field-label">{label}</Combobox.Label>
        <Combobox.Trigger className="choice-trigger">
          <Combobox.Value placeholder={placeholder} />
          <Combobox.Icon>
            <ChevronDown size={17} aria-hidden="true" />
          </Combobox.Icon>
        </Combobox.Trigger>
        <Combobox.Portal>
          <Combobox.Positioner className="choice-positioner" align="start" sideOffset={6}>
            <Combobox.Popup className="choice-popup" aria-label={label}>
              <div className="choice-search">
                <Search size={16} aria-hidden="true" />
                <Combobox.Input
                  aria-label={searchLabel}
                  placeholder={searchLabel}
                  autoComplete="off"
                  maxLength={100}
                />
              </div>
              <Combobox.Empty className="choice-empty">{emptyMessage}</Combobox.Empty>
              <Combobox.List className="choice-list">
                {(option: Choice) => (
                  <Combobox.Item key={option.value} value={option} className="choice-option">
                    <span>{option.label}</span>
                    <Combobox.ItemIndicator className="choice-check">
                      <Check size={16} aria-hidden="true" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
