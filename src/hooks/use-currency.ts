"use client";

import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { convertCurrency, getCurrencyLocale, type Currency } from "@/lib/currency";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";

/**
 * Hook to format currency using the selected currency from preferences
 * Automatically converts amounts if needed
 */
export function useCurrency() {
  const selectedCurrency = usePreferencesStore((s) => s.currency);

  const formatCurrency = (
    amount: number,
    opts?: {
      fromCurrency?: Currency; // Currency of the input amount (defaults to USD)
      currency?: Currency; // Override selected currency
      locale?: string;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      noDecimals?: boolean;
    }
  ): string => {
    const targetCurrency = opts?.currency || selectedCurrency;
    const sourceCurrency = opts?.fromCurrency || "USD";
    
    // Convert amount if currencies differ
    const convertedAmount = convertCurrency(amount, sourceCurrency, targetCurrency);
    
    const locale = opts?.locale || getCurrencyLocale(targetCurrency);
    
    return formatCurrencyUtil(convertedAmount, {
      currency: targetCurrency,
      locale,
      minimumFractionDigits: opts?.minimumFractionDigits,
      maximumFractionDigits: opts?.maximumFractionDigits,
      noDecimals: opts?.noDecimals,
    });
  };

  return {
    currency: selectedCurrency,
    formatCurrency,
    convertCurrency: (amount: number, fromCurrency: Currency = "USD") =>
      convertCurrency(amount, fromCurrency, selectedCurrency),
  };
}

