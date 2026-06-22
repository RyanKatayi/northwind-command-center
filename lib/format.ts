// Small formatting + date helpers shared across the views.

// The app's "now" for recency and tenure. A fixed reference date keeps scoring
// deterministic regardless of the real clock.
export const NORTHWIND_NOW = "2026-06-22";

// Parse a YYYY-MM-DD string as a local date (avoids UTC off-by-one).
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Whole days between two YYYY-MM-DD dates (a minus b).
export function daysBetween(a: string, b: string): number {
  const ms = parseDate(a).getTime() - parseDate(b).getTime();
  return Math.round(ms / 86_400_000);
}

export function fmtMoney(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Normalize long dashes in lead messages for clean one-line display.
export function cleanText(s: string): string {
  return (s || "").replace(/\s*—\s*/g, ", ").replace(/(\d)–(\d)/g, "$1-$2");
}

// Relative label from a day count (days since received).
export function relDate(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return days + "d ago";
  if (days < 14) return "1w ago";
  return Math.floor(days / 7) + "w ago";
}
