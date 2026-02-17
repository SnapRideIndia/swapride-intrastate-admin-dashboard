import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  onCreate?: (value: string) => void;
  className?: string;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  emptyText = "No option found.",
  onCreate,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on input
  // const filteredOptions = options.filter((option) =>
  //   option.label.toLowerCase().includes(inputValue.toLowerCase())
  // );

  const handleCreate = () => {
    if (inputValue.trim()) {
      const newValue = inputValue.trim().toUpperCase().replace(/\s+/g, "_"); // Normalize to SLUG_FORMAT
      onChange(newValue);
      if (onCreate) {
        onCreate(newValue);
      }
      setOpen(false);
      setInputValue("");
    }
  };

  const showCreateOption =
    inputValue.trim() !== "" &&
    !options.some((option) => option.label.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (selectedOption ? selectedOption.label : value) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search or type new..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Use label for searching
                  onSelect={(currentValue) => {
                    // CommandItem returns lowercase value by default, so we need to find the original value
                    // However, we are passing value prop (which cmdk uses for filtering), let's find the option match
                    const matchedOption = options.find((o) => o.label.toLowerCase() === currentValue.toLowerCase());
                    onChange(matchedOption ? matchedOption.value : option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem value={inputValue} onSelect={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
