"use client";

import React from "react";
import { Menu } from "lucide-react";
import SpectrumHelp from "@spectrum-icons/workflow/Help";
import SpectrumBell from "@spectrum-icons/workflow/Bell";
import SpectrumApps from "@spectrum-icons/workflow/Apps";
import SpectrumMore from "@spectrum-icons/workflow/More";
import SpectrumSearch from "@spectrum-icons/workflow/Search";
import { ActionButton } from "@react-spectrum/button";

type AppHeaderProps = {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isHeaderOverflowOpen: boolean;
  setIsHeaderOverflowOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headerOverflowRef: React.RefObject<HTMLDivElement | null>;
};

export default function AppHeader({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isHeaderOverflowOpen,
  setIsHeaderOverflowOpen,
  headerOverflowRef,
}: AppHeaderProps) {
  return (
    <header className="flex h-11 items-center border-b border-slate-200 bg-white px-3 text-slate-700 md:px-4">
      {/* Left zone */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="Open navigation"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex h-5 w-5 items-center justify-center rounded-sm text-[11px] font-bold text-slate-700">
          A
        </div>
        <div className="truncate text-[13px] font-medium text-slate-800">Journey Optimizer <span className="text-slate-400 font-normal">(reference UI)</span></div>
      </div>

      {/* Center zone */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex h-8 w-full max-w-[430px] items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
          <SpectrumSearch size="S" aria-hidden />
          <span className="truncate">Search Experience Cloud (Ctrl+/)</span>
        </div>
      </div>

      {/* Right zone */}
      <div className="flex flex-1 items-center justify-end gap-1.5 text-xs">
        {/* Org + sandbox — visible at xl; overflow menu below xl */}
        <span className="hidden text-slate-600 xl:inline">Demo Org</span>
        <div className="hidden items-center gap-1 xl:flex">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">Dev</span>
          <span className="max-w-[160px] truncate text-slate-600">Demo Sandbox</span>
        </div>
        <div className="mx-1 hidden h-5 w-px bg-slate-200 xl:block" aria-hidden="true" />

        {/* Overflow button — shown below xl */}
        <div ref={headerOverflowRef} className="relative xl:hidden">
          <button
            type="button"
            aria-label="More options"
            aria-expanded={isHeaderOverflowOpen}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            onClick={() => setIsHeaderOverflowOpen((prev) => !prev)}
          >
            <SpectrumMore size="S" aria-hidden />
          </button>
          {isHeaderOverflowOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-slate-200 bg-white py-2 shadow-md"
              onMouseLeave={() => setIsHeaderOverflowOpen(false)}
            >
              <div className="border-b border-slate-100 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Context</div>
              <div className="px-3 pt-2 space-y-1.5">
                <div className="text-[13px] text-slate-700">Demo Org</div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">Dev</span>
                  <span className="text-[13px] text-slate-600">Demo Sandbox</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <ActionButton isQuiet aria-label="Launch AI Assistant">
          {/* Adobe AI Assistant — 4-pointed sparkle matching the real AJO icon */}
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M10 2c-.3 1.8-1.2 3.5-2.5 4.8C6.2 8.1 4.5 9 2 9.5c2.5.5 4.2 1.5 5.5 2.8C8.8 13.5 9.7 15.2 10 17c.3-1.8 1.2-3.5 2.5-4.8 1.3-1.3 3-2.2 5.5-2.7-2.5-.5-4.2-1.5-5.5-2.8C11.2 5.5 10.3 3.8 10 2z"/>
          </svg>
        </ActionButton>
        <ActionButton isQuiet aria-label="Help">
          <SpectrumHelp />
        </ActionButton>
        <div className="relative">
          <ActionButton isQuiet aria-label="Notifications">
            <SpectrumBell />
          </ActionButton>
          <span className="pointer-events-none absolute right-0.5 top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#0265dc] px-0.5 text-[9px] font-bold leading-none text-white">
            9+
          </span>
        </div>
        <ActionButton isQuiet aria-label="App switcher">
          <SpectrumApps />
        </ActionButton>
        <button
          type="button"
          aria-label="Profile"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0265dc] text-[11px] font-bold text-white"
        >
          S
        </button>
      </div>
    </header>
  );
}
