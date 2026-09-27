"use client";

import type { Segment, SegmentsPayload } from "../types";

type SegmentListProps = {
  segments: SegmentsPayload;
  segmentKeys: string[];
  selectedSegmentKey: string;
  setSelectedSegmentKey: (key: string) => void;
  setIsDescExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedUseCaseIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setModalUseCase: (uc: null) => void;
  setChannelFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
};

export default function SegmentList({
  segments,
  segmentKeys,
  selectedSegmentKey,
  setSelectedSegmentKey,
  setIsDescExpanded,
  setSelectedUseCaseIds,
  setModalUseCase,
  setChannelFilter,
  setTypeFilter,
}: SegmentListProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-600">Segments</div>
      <div className="mt-2 space-y-1.5">
        {segmentKeys.map((k) => {
          const seg: Segment = segments[k];
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
              className={`w-full rounded-md py-2 text-left text-sm transition-colors ${
                selected
                  ? "border-l-2 border-[#0265dc] bg-[#eaf2ff] pl-2 pr-3 font-semibold text-slate-900"
                  : "pl-3 pr-3 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {seg.segment_name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
