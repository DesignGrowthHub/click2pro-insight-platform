import "server-only";

type CurrencyAmount = {
  currency: string;
  amountCents: number;
};

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatAdminPercent(value: number | null, digits = 1) {
  if (value == null) {
    return "Unavailable";
  }

  return `${value.toFixed(digits)}%`;
}

export function formatAdminDate(value: Date | null | undefined) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export function formatAdminDateTime(value: Date | null | undefined) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

export function formatCurrencyAmount(currency: string, amountCents: number) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountCents / 100);
}

export function formatCurrencyBreakdown(values: CurrencyAmount[]) {
  if (!values.length) {
    return "Unavailable";
  }

  return values
    .map((value) => formatCurrencyAmount(value.currency, value.amountCents))
    .join(" / ");
}

export function formatAdminLabel(value: string | null | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}
