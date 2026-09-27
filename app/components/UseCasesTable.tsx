"use client";

import React from "react";
import { Badge } from "@react-spectrum/badge";
import TruncateText from "./ui/TruncateText";
import SortArrow from "./ui/SortArrow";
import { confidenceBadgeVariant, confidenceLabel, formatDisplayValue } from "../lib/helpers";
import type { UseCase, UseCaseSortField, SortDirection } from "../types";

type UseCasesTableProps = {
  useCases: UseCase[];
  sortedUseCases: UseCase[];
  sortField: UseCaseSortField;
  sortDirection: SortDirection;
  onSort: (field: UseCaseSortField) => void;
  selectedUseCaseIds: Set<string>;
  setSelectedUseCaseIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  allUseCaseIds: string[];
  allSelected: boolean;
  selectAllRef: React.RefObject<HTMLInputElement | null>;
  setModalUseCase: (uc: UseCase | null) => void;
  setChannelFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
};

export default function UseCasesTable({
  useCases,
  sortedUseCases,
  sortField,
  sortDirection,
  onSort,
  selectedUseCaseIds,
  setSelectedUseCaseIds,
  allUseCaseIds,
  allSelected,
  selectAllRef,
  setModalUseCase,
  setChannelFilter,
  setTypeFilter,
}: UseCasesTableProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold text-slate-500">Use cases</div>
        <div className="text-xs text-slate-500">{useCases.length} total</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-t border-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-[5%] px-4 py-2 text-left font-semibold">
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
              <th className="w-[28%] px-4 py-2 text-left font-semibold">
                <button type="button" onClick={() => onSort("name")} className="inline-flex items-center gap-1 rounded text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "name"} direction={sortDirection} />
                  <span>Name</span>
                </button>
              </th>
              <th className="w-[16%] px-4 py-2 text-left font-semibold">
                <button type="button" onClick={() => onSort("type")} className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "type"} direction={sortDirection} />
                  <span>Type</span>
                </button>
              </th>
              <th className="w-[14%] px-4 py-2 text-left font-semibold">
                <button type="button" onClick={() => onSort("channel")} className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "channel"} direction={sortDirection} />
                  <span>Channel</span>
                </button>
              </th>
              <th className="w-[14%] px-4 py-2 text-left font-semibold">
                <button type="button" onClick={() => onSort("trigger")} className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "trigger"} direction={sortDirection} />
                  <span>Trigger</span>
                </button>
              </th>
              <th className="w-[9%] px-4 py-2 text-left font-semibold">
                <button type="button" onClick={() => onSort("roi")} className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "roi"} direction={sortDirection} />
                  <span>ROI</span>
                </button>
              </th>
              <th className="w-[14%] px-4 py-2 text-center font-semibold">
                <button type="button" onClick={() => onSort("confidence")} className="inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc]">
                  <SortArrow active={sortField === "confidence"} direction={sortDirection} />
                  <span>Confidence</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUseCases.length === 0 && useCases.length > 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={7}>
                  No use cases match these filters.{" "}
                  <button
                    type="button"
                    className="font-semibold text-[#0265dc] hover:underline"
                    onClick={() => {
                      setChannelFilter("All");
                      setTypeFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
            {sortedUseCases.map((uc) => {
              const roi = uc.roi_result;
              const roiVal = roi?.estimated_roi;
              const conf = roi?.confidence_score ?? 0;
              const confVariant = confidenceBadgeVariant(conf);
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
                      className="block w-full overflow-hidden text-left font-semibold text-[#0265dc] hover:underline"
                      title={formatDisplayValue(uc.use_case_title)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalUseCase(uc);
                      }}
                    >
                      <TruncateText text={formatDisplayValue(uc.use_case_title)} as="div" />
                    </button>
                    {uc.where_to_show?.surface && (
                      <TruncateText text={formatDisplayValue(uc.where_to_show.surface)} as="div" className="mt-0.5 text-xs text-slate-500" />
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
                    {roi ? (
                      <Badge variant={confVariant}>{confidenceLabel(conf)}</Badge>
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
  );
}
