export function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00Z`));
}

export function describeNetBias(value: number | null | undefined) {
  if (value == null) {
    return "Neutral";
  }

  if (value > 0) {
    return "Speculators net long";
  }

  if (value < 0) {
    return "Speculators net short";
  }

  return "Flat positioning";
}
