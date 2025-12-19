import { type Currency } from "@/stores/preferences/preferences-store";

// Exchange rates relative to USD (base currency)
// These are approximate rates - in production, you'd fetch from an API
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  GBP: 0.79,
  EUR: 0.92,
  AED: 3.67,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.0,
};

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency (defaults to USD)
 * @param toCurrency - Target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency = "USD",
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];

  return convertedAmount;
}

/**
 * Get locale for currency formatting
 */
export function getCurrencyLocale(currency: Currency): string {
  const localeMap: Record<Currency, string> = {
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE", // Using en-IE for EUR as en-EU is not valid
    AED: "ar-AE",
    JPY: "ja-JP",
    CAD: "en-CA",
    AUD: "en-AU",
    CHF: "de-CH",
    CNY: "zh-CN",
    INR: "en-IN",
  };

  return localeMap[currency] || "en-US";
}

