"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setValueToCookie } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { type Currency } from "@/stores/preferences/preferences-store";

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "GBP", label: "GBP", symbol: "£" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "AED", label: "AED", symbol: "د.إ" },
  { value: "JPY", label: "JPY", symbol: "¥" },
  { value: "CAD", label: "CAD", symbol: "C$" },
  { value: "AUD", label: "AUD", symbol: "A$" },
  { value: "CHF", label: "CHF", symbol: "CHF" },
  { value: "CNY", label: "CNY", symbol: "¥" },
  { value: "INR", label: "INR", symbol: "₹" },
];

export function CurrencySelector() {
  const currency = usePreferencesStore((s) => s.currency);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);

  const handleValueChange = async (value: Currency) => {
    setCurrency(value);
    await setValueToCookie("currency", value);
  };

  const currentCurrency = CURRENCY_OPTIONS.find((opt) => opt.value === currency) || CURRENCY_OPTIONS[0];

  return (
    <Select value={currency} onValueChange={handleValueChange}>
      <SelectTrigger className="h-9 w-[100px] border-none shadow-none outline-none focus-visible:ring-0 bg-transparent hover:bg-accent">
        <SelectValue>
          <span className="text-sm font-medium">
            {currentCurrency.symbol} {currentCurrency.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span>{option.symbol}</span>
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

