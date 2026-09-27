"use client";

import React from "react";
import SpectrumUserGroup from "@spectrum-icons/workflow/UserGroup";
import SpectrumMonitoring from "@spectrum-icons/workflow/Monitoring";
import SpectrumCalculator from "@spectrum-icons/workflow/Calculator";
import SpectrumSubscribe from "@spectrum-icons/workflow/Subscribe";
import TruncateText from "./ui/TruncateText";
import type { Segment } from "../types";

type SegmentSummaryProps = {
  selectedSegment: Segment;
  descRef: React.RefObject<HTMLDivElement | null>;
  descText: string;
  isDescExpanded: boolean;
  setIsDescExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  hasDescOverflow: boolean;
  churnBadgeTone: string;
  churnBadgeText: string;
  segmentSize: string;
  avgTenure: string;
  avgMonthly: string;
  upsell: string;
};

export default function SegmentSummary({
  selectedSegment,
  descRef,
  descText,
  isDescExpanded,
  setIsDescExpanded,
  hasDescOverflow,
  churnBadgeTone,
  churnBadgeText,
  segmentSize,
  avgTenure,
  avgMonthly,
  upsell,
}: SegmentSummaryProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <TruncateText text={selectedSegment.segment_name} as="div" className="text-base font-bold text-slate-900" />
        </div>

        <div className={`text-sm font-semibold ${churnBadgeTone}`}>Churn: {churnBadgeText}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
          { label: "Segment Size", value: segmentSize, suffix: "Customers", Icon: SpectrumUserGroup },
          { label: "Avg. Tenure", value: avgTenure, suffix: "Months", Icon: SpectrumMonitoring },
          { label: "Avg. Monthly", value: avgMonthly, suffix: "USD", Icon: SpectrumCalculator },
          { label: "Upsell Score", value: upsell, suffix: "", Icon: SpectrumSubscribe },
        ].map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{metric.label}</div>
              <span className="icon-sm text-slate-400"><metric.Icon /></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-slate-900">{metric.value}</span>
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
  );
}
