"use client";

import type { SortDirection } from "../../types";

export default function SortArrow({ active, direction }: { active: boolean; direction: SortDirection }) {
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
