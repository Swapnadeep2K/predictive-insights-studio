"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { VIOLET } from "./lib/constants";
import { safeNum, churnRiskLabel, formatDisplayValue } from "./lib/helpers";
import type { SegmentsPayload, UseCase, UseCaseSortField, SortDirection } from "./types";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import SegmentList from "./components/SegmentList";
import SegmentSummary from "./components/SegmentSummary";
import UseCasesTable from "./components/UseCasesTable";
import UseCaseModal from "./components/UseCaseModal";
import TruncateText from "./components/ui/TruncateText";
import SelectDropdown from "./components/ui/SelectDropdown";

export default function PlaybooksDashboard() {
  // Option A: put JSON in /public/segments.json and set:
  // const DATA_URL = "/segments.json";
  //
  // Option B: use Drive "uc?export=download&id=..."
  const DATA_URL = "https://www.googleapis.com/drive/v3/files/1SnS2I6IvWmq_rTFHnju-Z-szN3sijC7n?alt=media&key=AIzaSyDHca9gfn2daxIZr17_mbPop4dkDUtR-SU";

  const [data, setData] = useState<SegmentsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHeaderOverflowOpen, setIsHeaderOverflowOpen] = useState(false);
  const headerOverflowRef = useRef<HTMLDivElement | null>(null);

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = (title: string) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
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
            "Set DATA_URL to the hosted JSON (recommended: /public/segments.json or a CORS-friendly URL)."
          );
        }

        const res = await fetch(DATA_URL);
        const contentType = res.headers.get("content-type");

        const raw = await res.text();

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
  }, [DATA_URL, retryCount]);

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
    localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isHeaderOverflowOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!headerOverflowRef.current?.contains(e.target as Node)) {
        setIsHeaderOverflowOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isHeaderOverflowOpen]);

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
          <div className="text-lg font-semibold text-slate-900">Couldn&apos;t load data</div>
          <div className="mt-2 text-sm text-slate-600">{err}</div>
          <div className="mt-4 text-sm text-slate-600">
            Tip: put the JSON at <span className="font-mono">/public/segments.json</span> and set{" "}
            <span className="font-mono">DATA_URL = &quot;/segments.json&quot;</span>.
          </div>
          <button
            type="button"
            className="mt-4 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            onClick={() => setRetryCount((n) => n + 1)}
          >
            Retry
          </button>
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
      <AppHeader
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isHeaderOverflowOpen={isHeaderOverflowOpen}
        setIsHeaderOverflowOpen={setIsHeaderOverflowOpen}
        headerOverflowRef={headerOverflowRef}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left navigation */}
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
        />

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900">Predictive Insights Studio</div>
              <div className="mt-1 text-sm text-slate-500">Predictive Segments • Prioritized Use Cases • ROI Signals</div>
            </div>

            <button
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
                selectedUseCaseIds.size > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              style={{ background: VIOLET.accent }}
              disabled={selectedUseCaseIds.size === 0}
              title={selectedUseCaseIds.size > 0 ? `Activate ${selectedUseCaseIds.size} selected use case(s)` : "Select at least one use case first"}
              onClick={() => {
                if (selectedUseCaseIds.size === 0) return;
                const n = selectedUseCaseIds.size;
                setToastMessage(`${n} use case${n > 1 ? "s" : ""} queued for activation.`);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
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
              <SelectDropdown label="Channel" value={channelFilter} options={channelOptions} onChange={setChannelFilter} />
              <SelectDropdown label="Type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
            </div>
          </div>

          {/* Content grid (same wireframe; modal handles details) */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            {/* Segments list */}
            <SegmentList
              segments={data}
              segmentKeys={segmentKeys}
              selectedSegmentKey={selectedSegmentKey}
              setSelectedSegmentKey={setSelectedSegmentKey}
              setIsDescExpanded={setIsDescExpanded}
              setSelectedUseCaseIds={setSelectedUseCaseIds}
              setModalUseCase={setModalUseCase}
              setChannelFilter={setChannelFilter}
              setTypeFilter={setTypeFilter}
            />

            {/* Right side: segment header + table */}
            <section key={selectedSegmentKey} className="segment-swap-enter space-y-4">
              {isSegmentSwitching ? (
                <>
                  <div className="rounded-md border border-slate-200 bg-white p-4">
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

                  <div className="rounded-md border border-slate-200 bg-white p-4">
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
                  <SegmentSummary
                    selectedSegment={selectedSegment}
                    descRef={descRef}
                    descText={descText}
                    isDescExpanded={isDescExpanded}
                    setIsDescExpanded={setIsDescExpanded}
                    hasDescOverflow={hasDescOverflow}
                    churnBadgeTone={churnBadge.tone}
                    churnBadgeText={churnBadge.text}
                    segmentSize={segmentSize}
                    avgTenure={avgTenure}
                    avgMonthly={avgMonthly}
                    upsell={upsell}
                  />

                  {/* Use cases table */}
                  <UseCasesTable
                    useCases={useCases}
                    sortedUseCases={sortedUseCases}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    selectedUseCaseIds={selectedUseCaseIds}
                    setSelectedUseCaseIds={setSelectedUseCaseIds}
                    allUseCaseIds={allUseCaseIds}
                    allSelected={allSelected}
                    selectAllRef={selectAllRef}
                    setModalUseCase={setModalUseCase}
                    setChannelFilter={setChannelFilter}
                    setTypeFilter={setTypeFilter}
                  />
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-md"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
          <button
            type="button"
            aria-label="Dismiss"
            className="ml-2 text-emerald-600 hover:text-emerald-800"
            onClick={() => {
              setToastMessage(null);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ROI Dialog */}
      <UseCaseModal
        modalUseCase={modalUseCase}
        setModalUseCase={setModalUseCase}
        isHypExpanded={isHypExpanded}
        setIsHypExpanded={setIsHypExpanded}
        isCriteriaExpanded={isCriteriaExpanded}
        setIsCriteriaExpanded={setIsCriteriaExpanded}
        toastTimerRef={toastTimerRef}
        setToastMessage={setToastMessage}
        formatDisplayValue={formatDisplayValue}
      />
    </div>
  );
}
