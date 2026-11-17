const CURRENCY_LOCALE = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function toCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100);
}

export function formatMoney(value, currency = "USD", options = {}) {
  const amount = Number(value) || 0;
  const { showSign = false, compactZero = false } = options;
  if (compactZero && Math.abs(amount) < 0.005) return formatMoney(0, currency);

  const formatted = new Intl.NumberFormat(CURRENCY_LOCALE[currency] || "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign) {
    if (amount > 0.004) return `+${formatted}`;
    if (amount < -0.004) return `-${formatted}`;
  }
  if (amount < -0.004) return `-${formatted}`;
  return formatted;
}

export function currencySymbol(currency = "USD") {
  const parts = new Intl.NumberFormat(CURRENCY_LOCALE[currency] || "en-US", {
    style: "currency",
    currency,
  }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value || "$";
}

export function parseAmount(value) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toDate(value) {
  if (!value) return null;
  if (value.length === 10) return new Date(`${value}T12:00:00`);
  return new Date(value);
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatLongDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function relativeTime(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/** Split 100% into two-decimal shares, giving leftover hundredths to the first people. */
export function evenPercentages(ids) {
  if (!ids.length) return {};
  const totalHundredths = 10000;
  const base = Math.floor(totalHundredths / ids.length);
  let remainder = totalHundredths - base * ids.length;

  return Object.fromEntries(
    ids.map((id) => {
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      return [id, ((base + extra) / 100).toFixed(2)];
    }),
  );
}

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function firstName(name = "") {
  return name.split(" ")[0] || name;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const SPLIT_LABELS = {
  equal: "Equally",
  exact: "Exact amounts",
  percentage: "By percentage",
};
