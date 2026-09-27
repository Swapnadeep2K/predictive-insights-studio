"use client";

import { Badge } from "@react-spectrum/badge";
import { VIOLET } from "../lib/constants";
import { confidenceLabel, confidenceBadgeVariant } from "../lib/helpers";
import type { RoiResult } from "../types";

export default function RoiModule({ roi }: { roi: RoiResult }) {
  const roiVal = roi?.estimated_roi ?? 0;
  const conf = roi?.confidence_score ?? 0;
  const lift = roi?.expected_conversion_lift;
  const confTxt = confidenceLabel(conf);
  const confVariant = confidenceBadgeVariant(conf);

  const intervalMin = roiVal * 0.9;
  const intervalMax = roiVal * 1.15;
  const scaleMin = -5;
  const scaleMax = 15;
  const riskMax = 1;
  const clampedRoi = Math.min(scaleMax, Math.max(scaleMin, roiVal));
  const pos = (clampedRoi - scaleMin) / Math.max(1e-9, scaleMax - scaleMin);
  const riskPos = (riskMax - scaleMin) / Math.max(1e-9, scaleMax - scaleMin);

  return (
    <div className="rounded-md border border-slate-200 p-5">
      {/* Hero row: big ROI + confidence badge */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold tracking-tight" style={{ color: VIOLET.accent }}>
          {roiVal.toFixed(2)}×
        </div>
        <div className="flex flex-col gap-1">
          <Badge variant={confVariant}>{confTxt} Confidence</Badge>
          <div className="text-xs text-slate-500">Estimated ROI</div>
        </div>
      </div>

      {/* Key stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Confidence Score", value: conf.toFixed(2) },
          { label: "Expected Lift", value: lift != null ? `+${(lift * 100).toFixed(1)}%` : "—" },
          { label: "95% Interval", value: `${intervalMin.toFixed(2)}× – ${intervalMax.toFixed(2)}×` },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ROI scale */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">Loss Zone: −5× to 1×</span>
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
            style={{ left: `${pos * 100}%`, background: VIOLET.accent }}
            title={`${roiVal.toFixed(2)}× ROI`}
          />
        </div>
        <div className="relative mt-1.5 text-xs text-slate-400">
          <span>{scaleMin}×</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${riskPos * 100}%` }}>1×</span>
          <span className="float-right">{scaleMax}×</span>
        </div>
      </div>
    </div>
  );
}
