export const CURRENCIES = {
  IDR: { symbol: "Rp", locale: "id-ID", label: "IDR — Rupiah" },
  USD: { symbol: "$", locale: "en-US", label: "USD — Dollar" },
  SGD: { symbol: "S$", locale: "en-SG", label: "SGD — Singapore Dollar" },
  MYR: { symbol: "RM", locale: "ms-MY", label: "MYR — Ringgit" },
  EUR: { symbol: "€", locale: "de-DE", label: "EUR — Euro" },
  GBP: { symbol: "£", locale: "en-GB", label: "GBP — Pound" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatBudget(amount: number, currency: CurrencyCode): string {
  const { symbol, locale } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString(locale)}`;
}
