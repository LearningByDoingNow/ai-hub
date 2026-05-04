function parseToDate(raw: string): Date | null {
  if (!raw) return null;
  if (raw.includes("T")) return new Date(raw);
  if (raw.includes(" ") && !raw.includes("+") && !raw.includes("Z")) {
    return new Date(raw.replace(" ", "T") + "Z");
  }
  return new Date(raw + "T00:00:00");
}

function hasTime(dateStr: string): boolean {
  return dateStr.includes("T") || dateStr.includes(" ");
}

function relativeTime(diff: number, locale: string): string {
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === "zh") {
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${Math.floor(days / 7)}周前`;
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function formatAbsoluteTime(date: Date | string, locale: string): string {
  if (typeof date === "string") {
    const d = parseToDate(date);
    if (!d || isNaN(d.getTime())) return date;
    return formatAbsoluteTime(d, locale);
  }
  const now = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");

  if (date.toDateString() === now.toDateString()) {
    return `${locale === "zh" ? "今天" : "Today"} ${hours}:${mins}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `${locale === "zh" ? "昨天" : "Yesterday"} ${hours}:${mins}`;
  }
  return `${month}-${day} ${hours}:${mins}`;
}

/**
 * Smart time display:
 * - If date has precise time (ISO with T): show "今天 12:33" or "3分钟前"
 * - If date is date-only: use createdAt for relative time
 */
export function formatPublishTime(dateStr: string, locale: string = "zh", createdAt?: string): string {
  if (!dateStr) return "";

  // Date has precise time → show publish time
  if (hasTime(dateStr)) {
    const d = parseToDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr;
    const diff = Date.now() - d.getTime();
    if (diff < 0) return formatAbsoluteTime(d, locale);
    // Within 1 hour: relative. Beyond: absolute.
    if (diff < 3600000) return relativeTime(diff, locale);
    return formatAbsoluteTime(d, locale);
  }

  // Date is date-only → use createdAt for relative time
  const ref = createdAt || dateStr;
  const d = parseToDate(ref);
  if (!d || isNaN(d.getTime())) return dateStr;
  const diff = Date.now() - d.getTime();
  if (diff < 0) return dateStr;
  if (diff < 7 * 24 * 3600000) return relativeTime(diff, locale);
  return dateStr;
}

export function formatCreatedAt(createdAt: string | undefined, locale: string = "zh"): string {
  if (!createdAt) return "";
  const d = parseToDate(createdAt);
  if (!d || isNaN(d.getTime())) return "";
  return `${locale === "zh" ? "抓取于" : "Fetched"} ${formatAbsoluteTime(d, locale)}`;
}

export function formatFullDate(dateStr: string, locale: string = "zh"): string {
  if (!dateStr) return "";
  const d = parseToDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr;

  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");

  if (dateStr.includes("T") || dateStr.includes(" ")) {
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  }
  return `${Y}-${M}-${D}`;
}

// Keep backward compat
export function timeAgo(dateStr: string, locale: string = "zh", createdAt?: string): string {
  return formatPublishTime(dateStr, locale, createdAt);
}
