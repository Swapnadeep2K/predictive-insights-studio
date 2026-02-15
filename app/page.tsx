"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// -----------------------------
// Types (adapted to your JSON)
// -----------------------------
type RoiResult = {
  estimated_roi: number;
  confidence_score: number;
  expected_conversion_lift?: number;
  predicted_segment_metrics?: Record<string, number>;
};

type UseCase = {
  use_case_id: string;
  use_case_title: string;
  use_case_type: string; // upsell | retention | etc.
  what_to_show?: {
    type?: string;
    message?: string;
    explanation?: string;
  };
  where_to_show?: {
    channel?: string;
    surface?: string;
    explanation?: string;
  };
  when_to_show?: {
    trigger?: string;
    frequency?: string;
    duration?: string;
    explanation?: string;
  };
  hypothesis?: string;
  target_criteria?: string;
  roi_result?: RoiResult;
};

type SegmentAttributes = Record<string, string>;

type Segment = {
  segment_name: string;
  segment_description?: string;
  segment_attributes?: SegmentAttributes;
  use_cases?: UseCase[];
};

type SegmentsPayload = Record<string, Segment>;

type SidebarItem = {
  label: string;
  icon: string;
  clickable?: boolean;
  active?: boolean;
};

type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
};

type TruncateTextProps = {
  text: string;
  className?: string;
  as?: "span" | "div";
};

type UseCaseSortField = "name" | "type" | "channel" | "trigger" | "roi" | "confidence";
type SortDirection = "asc" | "desc";

// -----------------------------
// Helpers
// -----------------------------
function confidenceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.98) return "High";
  if (score >= 0.95) return "Medium";
  return "Low";
}

function confidenceColor(score: number) {
  // Spectrum-ish semantics
  if (score >= 0.98)
    return {
      dot: "bg-emerald-600",
      pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  if (score >= 0.95)
    return {
      dot: "bg-amber-500",
      pill: "bg-amber-50 text-amber-800 border-amber-200",
    };
  return { dot: "bg-red-600", pill: "bg-red-50 text-red-800 border-red-200" };
}

function churnRiskLabel(churnRate?: number) {
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

function safeNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function TruncateText({ text, className = "", as = "span" }: TruncateTextProps) {
  const Component = as;
  return (
    <Component className={`truncate ${className}`.trim()} title={text}>
      {text}
    </Component>
  );
}

function formatDisplayValue(value?: string) {
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

function SortArrow({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return null;

  return (
    <svg
      className={`h-3 w-3 shrink-0 text-slate-700 ${direction === "asc" ? "rotate-180" : ""}`}
      viewBox="0 0 10 11"
      focusable="false"
      aria-hidden="true"
      role="img"
      fill="currentColor"
    >
      <path d="M7.99 6.01a1 1 0 0 0-1.707-.707L5 6.586V1a1 1 0 0 0-2 0v5.586L1.717 5.303A1 1 0 1 0 .303 6.717l2.99 2.98a1 1 0 0 0 1.414 0l2.99-2.98a.997.997 0 0 0 .293-.707z" />
    </svg>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="group relative flex h-10 min-w-[220px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left outline-none"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="min-w-[62px] text-slate-500">{label}:</span>
          <span className="max-w-[120px] truncate font-medium text-slate-800">{value}</span>
        </span>
        <span aria-hidden="true" className="text-xs text-slate-500">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm ${
                    option === value ? "bg-[#0265dc] text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Theme tokens
const VIOLET = {
  accent: "#0265dc",
  tint: "#eaf2ff",
};

const SIDEBAR_HOME: SidebarItem = { label: "Home", icon: "⌂" };

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Journey management",
    collapsible: true,
    items: [
      { label: "Campaigns", icon: "✉" },
      { label: "Journeys", icon: "⤴" },
      { label: "Reports", icon: "📄" },
    ],
  },
  {
    title: "Use Case Playbooks",
    collapsible: true,
    items: [
      { label: "Playbooks", icon: "▤" },
      { label: "Predictive Insights Studio", icon: "▦", clickable: true, active: true },
    ],
  },
  {
    title: "Content Management",
    collapsible: true,
    items: [
      { label: "Assets", icon: "◧" },
      { label: "Content templates", icon: "▣" },
      { label: "Brands", icon: "◍" },
      { label: "Fragments", icon: "◫" },
      { label: "Landing pages", icon: "▭" },
      { label: "Translations", icon: "◎" },
    ],
  },
  {
    title: "Data Management",
    collapsible: true,
    items: [
      { label: "Schemas", icon: "◩" },
      { label: "Datasets", icon: "◒" },
      { label: "Queries", icon: "⌕" },
    ],
  },
  {
    title: "Monitoring",
    items: [{ label: "Monitoring", icon: "▵" }],
  },
  {
    title: "Connections",
    collapsible: true,
    items: [
      { label: "Sources", icon: "↺" },
      { label: "Destinations", icon: "◔" },
    ],
  },
  {
    title: "Customer",
    collapsible: true,
    items: [
      { label: "Audiences", icon: "◌" },
      { label: "Subscription lists", icon: "☷" },
    ],
  },
];

// -----------------------------
// Modal
// -----------------------------
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusSelector = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(focusSelector);
    (firstFocusable ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const currentPanel = panelRef.current;
      if (!currentPanel) return;

      const focusables = Array.from(currentPanel.querySelectorAll<HTMLElement>(focusSelector)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
      );
      if (!focusables.length) {
        event.preventDefault();
        currentPanel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/35" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl outline-none xl:max-w-5xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900" title={title}>
                {title}
              </div>
              <div className="text-xs text-slate-500">Use Case Details</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>

          {footer && (
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// ROI Module (your pattern)
// -----------------------------
function RoiModule({ roi }: { roi: RoiResult }) {
  const roiVal = roi?.estimated_roi ?? 0;
  const conf = roi?.confidence_score ?? 0;
  const lift = roi?.expected_conversion_lift;
  const confTxt = confidenceLabel(conf);
  const confTone = confidenceColor(conf);

  // Create a simple interval around ROI (placeholder until model-supplied bounds are available).
  const intervalMin = roiVal * 0.9;
  const intervalMax = roiVal * 1.15;
  const scaleMin = -5;
  const scaleMax = 15;
  const riskMax = 1;
  const clampedRoi = Math.min(scaleMax, Math.max(scaleMin, roiVal));
  const pos = (clampedRoi - scaleMin) / Math.max(1e-9, scaleMax - scaleMin); // 0..1
  const riskPos = (riskMax - scaleMin) / Math.max(1e-9, scaleMax - scaleMin); // 0..1

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left card */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-lg font-semibold text-slate-900">ROI Result</div>

        <div className="mt-3 flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: VIOLET.accent }}>
            {roiVal.toFixed(2)}×
          </div>

          <div className={`flex items-center gap-2 rounded-full border px-3 py-2 ${confTone.pill}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${confTone.dot}`} />
            <span className="text-sm font-medium">{confTxt} Confidence</span>
          </div>
        </div>

        {/* 95% interval values */}
        <div className="mt-6 grid grid-cols-[110px_1fr] items-center gap-3">
          <div className="text-sm text-slate-500">95% Interval</div>
          <div className="text-sm font-semibold text-slate-900">
            {intervalMin.toFixed(2)}× to {intervalMax.toFixed(2)}×
          </div>
        </div>

        {/* ROI scale */}
        <div className="mt-4 grid grid-cols-[110px_1fr] items-center gap-3">
          <div className="text-sm text-slate-500">ROI Scale</div>
          <div>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">Loss Zone: -5× to 1×</span>
              <span className="font-semibold text-slate-700">ROI: {roiVal.toFixed(2)}×</span>
            </div>

            <div className="relative h-3 rounded-full border border-slate-200 bg-white">
              <div
                className="h-full rounded-l-full bg-red-100/80"
                style={{ width: `${Math.max(0, Math.min(1, riskPos)) * 100}%` }}
                aria-hidden="true"
              />

              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${pos * 100}%`,
                  background: VIOLET.accent,
                }}
                title={`${roiVal.toFixed(2)}× ROI`}
              />
            </div>

            <div className="relative mt-2 text-xs text-slate-500">
              <span>{scaleMin.toFixed(0)}×</span>
              <span className="absolute -translate-x-1/2" style={{ left: `${riskPos * 100}%` }}>
                1×
              </span>
              <span className="float-right">{scaleMax.toFixed(0)}×</span>
            </div>
          </div>
        </div>

        {/* Lift */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">Expected Conversion</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
            {lift != null ? `${(lift * 100).toFixed(1)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Right compact breakdown */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-lg font-semibold text-slate-900">ROI Breakdown (compact)</div>

        <div className="mt-4 divide-y divide-slate-200">
          {[
            ["Estimated ROI", `${roiVal.toFixed(2)}×`],
            ["Confidence Level", confTxt],
            ["Confidence Score", conf.toFixed(2)],
            ["Lift (conv.)", lift != null ? `+${(lift * 100).toFixed(1)}%` : "—"],
            // If you calculate churn delta later, populate it here
            ["Churn Delta", "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-500">{k}</div>
              <div className="font-mono text-sm font-semibold text-slate-900">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Main Page
// -----------------------------
export default function PlaybooksDashboard() {
  // Option A: put JSON in /public/segments.json and set:
  // const DATA_URL = "/segments.json";
  //
  // Option B: use Drive "uc?export=download&id=..."
  const DATA_URL = "https://www.googleapis.com/drive/v3/files/1SnS2I6IvWmq_rTFHnju-Z-szN3sijC7n?alt=media&key=AIzaSyDHca9gfn2daxIZr17_mbPop4dkDUtR-SU"; // <-- set this

  const [data, setData] = useState<SegmentsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const segmentKeys = useMemo(() => (data ? Object.keys(data).sort() : []), [data]);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string | null>(null);

  const selectedSegment = selectedSegmentKey && data ? data[selectedSegmentKey] : null;

  const [selectedUseCaseIds, setSelectedUseCaseIds] = useState<Set<string>>(new Set());
  const [modalUseCase, setModalUseCase] = useState<UseCase | null>(null);
  const [isSegmentSwitching, setIsSegmentSwitching] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [sortField, setSortField] = useState<UseCaseSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [hasDescOverflow, setHasDescOverflow] = useState<boolean>(false);
  const [isHypExpanded, setIsHypExpanded] = useState<boolean>(false);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState<boolean>(false);
  const descRef = useRef<HTMLDivElement | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const hasInitializedSegmentRef = useRef<boolean>(false);

  // Load JSON
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        if (!DATA_URL) {
          throw new Error(
            "Set DATA_URL to your hosted JSON (recommended: /public/segments.json or a CORS-friendly URL)."
          );
        }

        const res = await fetch(DATA_URL);
        const contentType = res.headers.get("content-type");

        console.log("[segments] fetch", {
          requestUrl: DATA_URL,
          finalUrl: res.url,
          status: res.status,
          ok: res.ok,
          contentType,
        });

        const raw = await res.text();
        console.log("[segments] response preview", raw.slice(0, 500));

        if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);

        let json: SegmentsPayload;
        try {
          json = JSON.parse(raw) as SegmentsPayload;
        } catch {
          throw new Error(
            `Response is not valid JSON. content-type=${contentType ?? "unknown"}. Check browser console for preview.`
          );
        }

        if (cancelled) return;

        setData(json);
        const firstKey = Object.keys(json).sort()[0] ?? null;
        setSelectedSegmentKey(firstKey);
        setIsDescExpanded(false);
      } catch (e: unknown) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [DATA_URL]);

  const useCases = useMemo(() => selectedSegment?.use_cases ?? [], [selectedSegment]);
  const channelOptions = useMemo(
    () => ["All", ...Array.from(new Set(useCases.map((uc) => formatDisplayValue(uc.where_to_show?.channel)).filter((v) => v !== "—")))],
    [useCases]
  );
  const typeOptions = useMemo(
    () => ["All", ...Array.from(new Set(useCases.map((uc) => formatDisplayValue(uc.use_case_type)).filter((v) => v !== "—")))],
    [useCases]
  );
  const filteredUseCases = useMemo(
    () =>
      useCases.filter((uc) => {
        const channel = formatDisplayValue(uc.where_to_show?.channel);
        const type = formatDisplayValue(uc.use_case_type);
        const channelMatch = channelFilter === "All" || channel === channelFilter;
        const typeMatch = typeFilter === "All" || type === typeFilter;
        return channelMatch && typeMatch;
      }),
    [channelFilter, typeFilter, useCases]
  );
  const sortedUseCases = useMemo(() => {
    const list = [...filteredUseCases];
    const dir = sortDirection === "asc" ? 1 : -1;

    const compareText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

    list.sort((a, b) => {
      if (sortField === "roi") {
        const av = a.roi_result?.estimated_roi ?? Number.NEGATIVE_INFINITY;
        const bv = b.roi_result?.estimated_roi ?? Number.NEGATIVE_INFINITY;
        return (av - bv) * dir;
      }

      if (sortField === "confidence") {
        const av = a.roi_result?.confidence_score ?? Number.NEGATIVE_INFINITY;
        const bv = b.roi_result?.confidence_score ?? Number.NEGATIVE_INFINITY;
        return (av - bv) * dir;
      }

      if (sortField === "name") {
        return compareText(formatDisplayValue(a.use_case_title), formatDisplayValue(b.use_case_title)) * dir;
      }

      if (sortField === "type") {
        return compareText(formatDisplayValue(a.use_case_type), formatDisplayValue(b.use_case_type)) * dir;
      }

      if (sortField === "channel") {
        return compareText(formatDisplayValue(a.where_to_show?.channel), formatDisplayValue(b.where_to_show?.channel)) * dir;
      }

      return compareText(formatDisplayValue(a.when_to_show?.trigger), formatDisplayValue(b.when_to_show?.trigger)) * dir;
    });

    return list;
  }, [filteredUseCases, sortDirection, sortField]);
  const selectedUseCases = useMemo(
    () => useCases.filter((uc) => selectedUseCaseIds.has(uc.use_case_id)),
    [useCases, selectedUseCaseIds]
  );
  const allUseCaseIds = useMemo(() => useCases.map((uc) => uc.use_case_id), [useCases]);
  const allSelected = allUseCaseIds.length > 0 && allUseCaseIds.every((id) => selectedUseCaseIds.has(id));
  const someSelected = allUseCaseIds.some((id) => selectedUseCaseIds.has(id)) && !allSelected;

  const onSort = (field: UseCaseSortField) => {
    if (sortField === field) {
      setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  // Derive a few metrics from segment_attributes
  const segAttrs = selectedSegment?.segment_attributes ?? {};
  const churnRate = safeNum(segAttrs["Avg_ChurnRate"]);
  const churnBadge = churnRiskLabel(churnRate);
  const segmentSize = segAttrs["Segment_Size"] ? `${segAttrs["Segment_Size"]}` : "—";
  const avgTenure = segAttrs["Avg_Tenure"] ? `${Number(segAttrs["Avg_Tenure"]).toFixed(1)}` : "—";
  const avgMonthly = segAttrs["Avg_MonthlyCharges"] ? `${Number(segAttrs["Avg_MonthlyCharges"]).toFixed(2)}` : "—";
  const upsell = segAttrs["Avg_UpsellPropensity"] ? `${Number(segAttrs["Avg_UpsellPropensity"]).toFixed(2)}` : "—";
  const descText = selectedSegment?.segment_description ?? "";

  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      setHasDescOverflow(false);
      return;
    }

    const checkOverflow = () => {
      setHasDescOverflow(el.scrollHeight > el.clientHeight + 1);
    };

    checkOverflow();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(checkOverflow);
      observer.observe(el);
      return () => observer.disconnect();
    }

    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [descText, selectedSegmentKey]);

  useEffect(() => {
    setIsHypExpanded(false);
    setIsCriteriaExpanded(false);
  }, [modalUseCase?.use_case_id]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (!selectedSegmentKey) return;
    if (!hasInitializedSegmentRef.current) {
      hasInitializedSegmentRef.current = true;
      return;
    }

    if (prefersReducedMotion) {
      setIsSegmentSwitching(false);
      return;
    }

    setIsSegmentSwitching(true);
    const timer = window.setTimeout(() => setIsSegmentSwitching(false), 150);
    return () => window.clearTimeout(timer);
  }, [selectedSegmentKey, prefersReducedMotion]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someSelected;
  }, [someSelected, selectedUseCaseIds, useCases]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700">Loading…</div>;
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-slate-700">
        <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-lg font-semibold text-slate-900">Couldn’t load data</div>
          <div className="mt-2 text-sm text-slate-600">{err}</div>
          <div className="mt-4 text-sm text-slate-600">
            Tip: put your JSON at <span className="font-mono">/public/segments.json</span> and set{" "}
            <span className="font-mono">DATA_URL = &quot;/segments.json&quot;</span>.
          </div>
        </div>
      </div>
    );
  }

  if (!data || !selectedSegmentKey || !selectedSegment) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-700">No data found.</div>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      {/* Global header */}
      <header className="flex h-11 items-center border-b border-slate-200 bg-white px-3 text-slate-700 md:px-4">
        {/* Left zone */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            aria-label="Open navigation"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          >
            ☰
          </button>
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-red-200 bg-red-50 text-[11px] font-bold text-red-600">
            A
          </div>
          <div className="truncate text-[13px] font-medium text-slate-800">&lt;Product Name&gt;</div>
        </div>

        {/* Center zone */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex h-8 w-full max-w-[430px] items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
            <span aria-hidden="true">⌕</span>
            <span className="truncate">Search Experience Cloud (Ctrl+/)</span>
          </div>
        </div>

        {/* Right zone */}
        <div className="flex flex-1 items-center justify-end gap-2 text-xs">
          <span className="hidden text-slate-600 lg:inline">&lt;Org Name&gt;</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">Dev</span>
          <span className="hidden max-w-[260px] truncate text-slate-600 xl:inline">&lt;Sandbox Name&gt;</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">Help</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">Alerts</span>
          <span className="hidden rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600 sm:inline">
            Apps
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">User</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left navigation */}
        <aside
          className={`hidden h-full overflow-y-auto overscroll-contain border-r border-slate-200 bg-slate-100 transition-all duration-200 md:block ${
            isSidebarCollapsed ? "w-14" : "w-72"
          }`}
        >
          <nav className={`space-y-3 py-3 ${isSidebarCollapsed ? "px-1.5" : "px-3"}`}>
            <div
              className={`rounded-md py-1.5 text-[13px] text-slate-700 ${
                isSidebarCollapsed ? "flex justify-center px-0" : "flex items-center gap-2 px-2"
              }`}
              title={SIDEBAR_HOME.label}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center text-[12px] text-slate-500">
                {SIDEBAR_HOME.icon}
              </span>
              {!isSidebarCollapsed && <span>{SIDEBAR_HOME.label}</span>}
            </div>

            {SIDEBAR_GROUPS.map((group) => (
              <section key={group.title} className="space-y-1.5">
                <div
                  className={`flex items-center text-[12px] font-medium text-slate-500 ${
                    isSidebarCollapsed ? "justify-center px-0" : "justify-between px-2"
                  }`}
                  title={group.title}
                >
                  {!isSidebarCollapsed && <span>{group.title}</span>}
                  {group.collapsible && <span aria-hidden="true">˅</span>}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    if (item.clickable) {
                      return (
                        <button
                          key={item.label}
                          type="button"
                          title={item.label}
                          className={`w-full rounded-md py-1.5 text-left text-[13px] text-slate-900 ${
                            isSidebarCollapsed ? "flex justify-center px-0" : "flex items-center gap-2 px-2"
                          }`}
                          style={item.active ? { background: VIOLET.tint, outline: `1px solid ${VIOLET.accent}` } : undefined}
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center text-[12px] text-slate-600">
                            {item.icon}
                          </span>
                          {!isSidebarCollapsed && <span className="font-semibold">{item.label}</span>}
                        </button>
                      );
                    }

                    return (
                      <div
                        key={item.label}
                        title={item.label}
                        className={`cursor-default rounded-md py-1.5 text-[13px] text-slate-700 ${
                          isSidebarCollapsed ? "flex justify-center px-0" : "flex items-center gap-2 px-2"
                        }`}
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center text-[12px] text-slate-500">
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900">Predictive Insights Studio</div>
              <div className="mt-1 text-sm text-slate-500">Predictive Segments • Prioritized Use Cases • ROI Signals</div>
            </div>

            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                selectedUseCaseIds.size > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              style={{ background: VIOLET.accent }}
              disabled={selectedUseCaseIds.size === 0}
              title={selectedUseCaseIds.size > 0 ? `Activate ${selectedUseCaseIds.size} selected use case(s)` : "Select at least one use case first"}
              onClick={() => {
                if (selectedUseCaseIds.size === 0) return;
                // Placeholder: activation flow
                const names = selectedUseCases.map((uc) => formatDisplayValue(uc.use_case_title));
                const preview = names.slice(0, 3).join(", ");
                const suffix = names.length > 3 ? ` +${names.length - 3} more` : "";
                alert(`Activate flow for ${names.length} selected use case(s): ${preview}${suffix} (hook this up to AJO action later).`);
              }}
            >
              Activate
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-[320px_1fr] lg:gap-4">
            <div
              className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              title={`Segment: ${selectedSegment.segment_name}`}
            >
              <TruncateText text={`Segment: ${selectedSegment.segment_name}`} as="span" />
            </div>

            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
              <FilterDropdown label="Channel" value={channelFilter} options={channelOptions} onChange={setChannelFilter} />
              <FilterDropdown label="Type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
            </div>
          </div>

          {/* Content grid (same wireframe; modal handles details) */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            {/* Segments list */}
            <section className="rounded-md border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-600">Segments</div>
              <div className="mt-2 space-y-1.5">
                {segmentKeys.map((k) => {
                  const seg = data[k];
                  const selected = k === selectedSegmentKey;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedSegmentKey(k);
                        setIsDescExpanded(false);
                        setSelectedUseCaseIds(new Set());
                        setModalUseCase(null);
                        setChannelFilter("All");
                        setTypeFilter("All");
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "bg-[#eaf2ff] font-semibold text-slate-900 ring-1 ring-inset ring-[#0265dc]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {seg.segment_name}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Right side: segment header + table */}
            <section key={selectedSegmentKey} className="segment-swap-enter space-y-4">
              {isSegmentSwitching ? (
                <>
                  <div className="min-h-[260px] rounded-md border border-slate-200 bg-white p-4">
                    <div className="skeleton-line h-6 w-1/2 rounded" />
                    <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                      <div className="skeleton-line h-14 rounded-md" />
                      <div className="skeleton-line h-14 rounded-md" />
                      <div className="skeleton-line h-14 rounded-md" />
                      <div className="skeleton-line h-14 rounded-md" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="skeleton-line h-4 w-full rounded" />
                      <div className="skeleton-line h-4 w-11/12 rounded" />
                    </div>
                  </div>

                  <div className="min-h-[420px] rounded-md border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="skeleton-line h-5 w-28 rounded" />
                      <div className="skeleton-line h-4 w-14 rounded" />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="skeleton-line h-12 rounded" />
                      <div className="skeleton-line h-12 rounded" />
                      <div className="skeleton-line h-12 rounded" />
                      <div className="skeleton-line h-12 rounded" />
                    </div>
                  </div>
                </>
              ) : (
                <>
              {/* Segment summary */}
              <div className="min-h-[260px] rounded-md border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <TruncateText text={selectedSegment.segment_name} as="div" className="text-base font-bold text-slate-900" />
                  </div>

                  <div className={`text-sm font-semibold ${churnBadge.tone}`}>Churn: {churnBadge.text}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                  {[
                    { label: "Segment Size", value: segmentSize, suffix: "Customers" },
                    { label: "Average Tenure", value: avgTenure, suffix: "Months" },
                    { label: "Average Monthly", value: avgMonthly, suffix: "USD" },
                    { label: "Upsell Propensity", value: upsell, suffix: "" },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{metric.label}</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <TruncateText text={metric.value} as="div" className="text-sm font-semibold text-slate-900" />
                        {metric.suffix ? <span className="text-xs text-slate-500">{metric.suffix}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>

                {descText && (
                  <div className="mt-3">
                    <div ref={descRef} className={`text-sm text-slate-600 ${isDescExpanded ? "" : "line-clamp-2"}`}>
                      {descText}
                    </div>
                    {hasDescOverflow && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                        onClick={() => setIsDescExpanded((prev) => !prev)}
                      >
                        {isDescExpanded ? "Read less" : "Read more"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Use cases table */}
              <div className="min-h-[420px] rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm font-semibold text-slate-500">Use cases</div>
                  <div className="text-xs text-slate-500">{useCases.length} total</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-t border-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="w-[6%] px-4 py-2 text-left font-semibold">
                          <input
                            ref={selectAllRef}
                            type="checkbox"
                            aria-label="Select all use cases"
                            checked={allSelected}
                            onChange={() => {
                              if (allSelected) {
                                setSelectedUseCaseIds(new Set());
                                return;
                              }
                              setSelectedUseCaseIds(new Set(allUseCaseIds));
                            }}
                            className="h-4 w-4 cursor-pointer rounded-sm border border-slate-300 bg-white align-middle accent-[#0265dc]"
                          />
                        </th>
                        <th className="w-[26%] px-4 py-2 text-left font-semibold">
                          <button type="button" onClick={() => onSort("name")} className="inline-flex items-center gap-1 text-slate-700">
                            <SortArrow active={sortField === "name"} direction={sortDirection} />
                            <span>Name</span>
                          </button>
                        </th>
                        <th className="w-[14%] px-4 py-2 text-left font-semibold">
                          <button type="button" onClick={() => onSort("type")} className="inline-flex items-center gap-1">
                            <SortArrow active={sortField === "type"} direction={sortDirection} />
                            <span>Type</span>
                          </button>
                        </th>
                        <th className="w-[12%] px-4 py-2 text-left font-semibold">
                          <button type="button" onClick={() => onSort("channel")} className="inline-flex items-center gap-1">
                            <SortArrow active={sortField === "channel"} direction={sortDirection} />
                            <span>Channel</span>
                          </button>
                        </th>
                        <th className="w-[16%] px-4 py-2 text-left font-semibold">
                          <button type="button" onClick={() => onSort("trigger")} className="inline-flex items-center gap-1">
                            <SortArrow active={sortField === "trigger"} direction={sortDirection} />
                            <span>Trigger</span>
                          </button>
                        </th>
                        <th className="w-[10%] px-4 py-2 text-left font-semibold">
                          <button type="button" onClick={() => onSort("roi")} className="inline-flex items-center gap-1">
                            <SortArrow active={sortField === "roi"} direction={sortDirection} />
                            <span>ROI</span>
                          </button>
                        </th>
                        <th className="w-[16%] px-4 py-2 text-center font-semibold">
                          <button type="button" onClick={() => onSort("confidence")} className="inline-flex items-center gap-1">
                            <SortArrow active={sortField === "confidence"} direction={sortDirection} />
                            <span>Confidence</span>
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUseCases.map((uc) => {
                        const roi = uc.roi_result;
                        const roiVal = roi?.estimated_roi;
                        const conf = roi?.confidence_score ?? 0;
                        const confTone = confidenceColor(conf);
                        const isSelected = selectedUseCaseIds.has(uc.use_case_id);
                        const selectedCellClass = isSelected ? "bg-blue-50 border-y border-blue-300" : "";
                        const leftEdgeClass = isSelected ? "border-l border-blue-300" : "";
                        const rightEdgeClass = isSelected ? "border-r border-blue-300" : "";
                        const toggleRowSelection = () => {
                          setSelectedUseCaseIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(uc.use_case_id)) next.delete(uc.use_case_id);
                            else next.add(uc.use_case_id);
                            return next;
                          });
                        };

                        return (
                          <tr
                            key={uc.use_case_id}
                            className="cursor-pointer border-t border-slate-200 hover:bg-slate-50"
                            onClick={toggleRowSelection}
                          >
                            <td className={`px-4 py-3 ${selectedCellClass} ${leftEdgeClass}`}>
                              <input
                                type="checkbox"
                                aria-label={`Select ${uc.use_case_title}`}
                                checked={isSelected}
                                onClick={(e) => e.stopPropagation()}
                                onChange={toggleRowSelection}
                                className="h-4 w-4 cursor-pointer rounded-sm border border-slate-300 bg-white align-middle accent-[#0265dc]"
                              />
                            </td>
                            <td className={`px-4 py-3 ${selectedCellClass}`}>
                              <button
                                className="block max-w-full font-semibold text-[#0265dc] hover:underline"
                                title={formatDisplayValue(uc.use_case_title)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUseCaseIds((prev) => {
                                    const next = new Set(prev);
                                    next.add(uc.use_case_id);
                                    return next;
                                  });
                                  setModalUseCase(uc);
                                }}
                              >
                                <TruncateText text={formatDisplayValue(uc.use_case_title)} as="span" />
                              </button>
                              {uc.where_to_show?.surface ? (
                                <TruncateText text={formatDisplayValue(uc.where_to_show.surface)} as="div" className="mt-1 text-xs text-slate-500" />
                              ) : (
                                <div className="mt-1 text-xs text-slate-500">—</div>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-slate-700 ${selectedCellClass}`}>
                              <TruncateText text={formatDisplayValue(uc.use_case_type)} as="div" />
                            </td>
                            <td className={`px-4 py-3 text-slate-700 ${selectedCellClass}`}>
                              <TruncateText text={formatDisplayValue(uc.where_to_show?.channel)} as="div" />
                            </td>
                            <td className={`px-4 py-3 text-slate-700 ${selectedCellClass}`}>
                              <TruncateText text={formatDisplayValue(uc.when_to_show?.trigger)} as="div" />
                            </td>
                            <td className={`px-4 py-3 ${selectedCellClass}`}>
                              <div className="font-mono font-semibold text-slate-900">
                                {roiVal != null ? `${roiVal.toFixed(2)}×` : "—"}
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-center ${selectedCellClass} ${rightEdgeClass}`}>
                              {roiVal != null ? (
                                <span
                                  className={`inline-flex w-[88px] items-center justify-start gap-1.5 rounded-full border px-2 py-1 text-[12px] ${confTone.pill}`}
                                >
                                  <span className={`h-2 w-2 rounded-full ${confTone.dot}`} />
                                  {confidenceLabel(conf)}
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {useCases.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-slate-500" colSpan={7}>
                            No use cases found for this segment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* ROI Modal */}
      <Modal
        open={!!modalUseCase}
        onClose={() => setModalUseCase(null)}
        title={formatDisplayValue(modalUseCase?.use_case_title ?? "Use case")}
        footer={
          modalUseCase ? (
            <>
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                onClick={() => alert("Navigate to a full details page (optional).")}
              >
                View Full Details
              </button>

              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                style={{ background: VIOLET.accent }}
                onClick={() => alert("Launch Activate flow (stepper)")}
              >
                Activate
              </button>
            </>
          ) : undefined
        }
      >
        {!modalUseCase?.roi_result ? (
          <div className="text-sm text-slate-600">No ROI result available for this use case.</div>
        ) : (
          <>
            <RoiModule roi={modalUseCase.roi_result} />

            <div className="mt-7 border-t border-slate-200 pt-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">What</div>
                {modalUseCase.what_to_show?.message ? (
                  <div className="mt-2 text-sm text-slate-600" title={modalUseCase.what_to_show.message}>
                    <div className="line-clamp-3">{modalUseCase.what_to_show.message}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">—</div>
                )}
                {modalUseCase.what_to_show?.explanation && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500" title={modalUseCase.what_to_show.explanation}>
                    <div className="line-clamp-3">{modalUseCase.what_to_show.explanation}</div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">Where / When</div>
                <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                  <div>
                    <span className="text-slate-500">Channel:</span>{" "}
                    <span title={formatDisplayValue(modalUseCase.where_to_show?.channel)}>
                      {formatDisplayValue(modalUseCase.where_to_show?.channel)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Surface:</span>{" "}
                    <span title={formatDisplayValue(modalUseCase.where_to_show?.surface)}>
                      {formatDisplayValue(modalUseCase.where_to_show?.surface)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500">Trigger:</span>{" "}
                    <span title={formatDisplayValue(modalUseCase.when_to_show?.trigger)}>
                      {formatDisplayValue(modalUseCase.when_to_show?.trigger)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Frequency:</span>{" "}
                    <span title={formatDisplayValue(modalUseCase.when_to_show?.frequency)}>
                      {formatDisplayValue(modalUseCase.when_to_show?.frequency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 lg:col-span-2">
                <div className="text-sm font-semibold text-slate-900">Hypothesis / Targeting</div>
                <div className="mt-2 text-sm text-slate-600" title={modalUseCase.hypothesis ?? "—"}>
                  <div className={isHypExpanded ? "" : "line-clamp-2"}>{modalUseCase.hypothesis ?? "—"}</div>
                </div>
                {(modalUseCase.hypothesis?.length ?? 0) > 180 && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                    onClick={() => setIsHypExpanded((prev) => !prev)}
                  >
                    {isHypExpanded ? "Show less" : "Read more"}
                  </button>
                )}
                {modalUseCase.target_criteria && (
                  <div
                    className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700"
                    title={modalUseCase.target_criteria}
                  >
                    <div className={`whitespace-pre-wrap break-words ${isCriteriaExpanded ? "" : "line-clamp-2"}`}>
                      {modalUseCase.target_criteria}
                    </div>
                    {modalUseCase.target_criteria.length > 180 && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                        onClick={() => setIsCriteriaExpanded((prev) => !prev)}
                      >
                        {isCriteriaExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
