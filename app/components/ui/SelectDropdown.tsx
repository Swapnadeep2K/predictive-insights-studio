"use client";

import React, { useEffect, useRef, useState } from "react";
import SpectrumChevronDown from "@spectrum-icons/workflow/ChevronDown";

export default function SelectDropdown({
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
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listboxId = React.useId();

  const currentIndex = options.indexOf(value);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, currentIndex]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[role='option']");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) { onChange(options[activeIndex]); setOpen(false); }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const activeOptionId = open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  return (
    <div
      ref={rootRef}
      className="group relative flex h-10 min-w-[220px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300"
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc] rounded-sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
      >
        <span className="flex items-center gap-2">
          <span className="min-w-[62px] text-slate-500">{label}:</span>
          <span className="max-w-[120px] truncate font-medium text-slate-800">{value}</span>
        </span>
        <SpectrumChevronDown size="XS" UNSAFE_className="text-slate-500" aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-56 overflow-y-auto py-1"
          >
            {options.map((option, i) => (
              <li
                key={option}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={option === value}
                className={`cursor-pointer px-3 py-2 text-left text-sm ${
                  i === activeIndex ? "bg-slate-100" : ""
                } ${option === value ? "font-semibold text-[#0265dc]" : "text-slate-700"}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => { onChange(option); setOpen(false); }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
