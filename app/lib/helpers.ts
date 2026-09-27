export function confidenceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.98) return "High";
  if (score >= 0.95) return "Medium";
  return "Low";
}

export function confidenceBadgeVariant(score: number): "positive" | "yellow" | "negative" {
  if (score >= 0.98) return "positive";
  if (score >= 0.95) return "yellow";
  return "negative";
}

export function churnRiskLabel(churnRate?: number) {
  if (churnRate == null || Number.isNaN(churnRate))
    return { text: "—", tone: "text-slate-600" };
  if (churnRate <= 0.14)
    return { text: `${(churnRate * 100).toFixed(1)}% (Low)`, tone: "text-emerald-700" };
  if (churnRate >= 0.25)
    return { text: `${(churnRate * 100).toFixed(1)}% (High)`, tone: "text-red-700" };
  if (churnRate <= 0.24)
    return { text: `${(churnRate * 100).toFixed(1)}% (Med)`, tone: "text-amber-700" };
  return { text: `${(churnRate * 100).toFixed(1)}% (Med)`, tone: "text-amber-700" };
}

export function safeNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function formatDisplayValue(value?: string) {
  if (!value) return "—";
  const slashNormalized = value
    .replace(/\s*\/+\s*/g, " • ")
    .replace(/\s+/g, " ")
    .trim();

  if (["NA", "N/A"].includes(slashNormalized.toUpperCase())) return "-";

  // Keep sentence-like text as-is.
  if (/[.!?]/.test(slashNormalized)) return slashNormalized;

  // Title-case compact labels/tokens and each bullet-separated segment.
  return slashNormalized
    .split(" • ")
    .map((segment) =>
      segment
        .replace(/[_-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    )
    .join(" • ");
}
