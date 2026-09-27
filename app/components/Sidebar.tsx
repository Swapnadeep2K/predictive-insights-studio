"use client";

import { ChevronDown } from "lucide-react";
import { VIOLET, SIDEBAR_HOME, SIDEBAR_GROUPS } from "../lib/constants";

type SidebarProps = {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  collapsedSections: Set<string>;
  toggleSection: (title: string) => void;
};

export default function Sidebar({
  isSidebarCollapsed,
  collapsedSections,
  toggleSection,
}: SidebarProps) {
  return (
    <aside
      onMouseEnter={(e) => e.currentTarget.classList.add("sidebar-scroll-active")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("sidebar-scroll-active")}
      className={`sidebar-scroll hidden h-full overflow-y-auto overscroll-contain border-r border-slate-200 bg-white transition-all duration-200 md:block ${
        isSidebarCollapsed ? "w-14" : "w-60"
      }`}
    >
      <nav className={`space-y-5 py-3 ${isSidebarCollapsed ? "px-1.5" : "px-3"}`}>
        <div
          className={`rounded-md py-1.5 text-[13px] text-slate-700 ${
            isSidebarCollapsed ? "flex justify-center px-0" : "flex items-center gap-2 px-2"
          }`}
          title={SIDEBAR_HOME.label}
        >
          <SIDEBAR_HOME.icon className="h-4 w-4 shrink-0 text-slate-500" />
          {!isSidebarCollapsed && <span>{SIDEBAR_HOME.label}</span>}
        </div>

        {SIDEBAR_GROUPS.map((group) => {
          const isSectionCollapsed = collapsedSections.has(group.title);
          return (
            <section key={group.title} className="space-y-1.5">
              {group.collapsible ? (
                <button
                  type="button"
                  onClick={() => !isSidebarCollapsed && toggleSection(group.title)}
                  className={`flex w-full items-center gap-3 text-[13px] font-medium text-slate-400 hover:text-slate-600 ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-2"
                  }`}
                  title={group.title}
                  aria-expanded={!isSectionCollapsed}
                >
                  {!isSidebarCollapsed && (
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150"
                      style={{ transform: isSectionCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                      aria-hidden
                    />
                  )}
                  {!isSidebarCollapsed && <span>{group.title}</span>}
                </button>
              ) : (
                <div
                  className={`flex items-center text-[13px] font-medium text-slate-400 ${
                    isSidebarCollapsed ? "justify-center px-0" : "px-2"
                  }`}
                  title={group.title}
                >
                  {!isSidebarCollapsed && <span>{group.title}</span>}
                </div>
              )}
              {!isSectionCollapsed && <div className="space-y-0.5">
                {group.items.map((item) => {
                  if (item.clickable) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        title={item.label}
                        className={`w-full rounded-md py-1.5 text-left text-[13px] text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0265dc] ${
                          isSidebarCollapsed ? "flex justify-center px-0" : "flex items-center gap-2 px-2"
                        }`}
                        style={item.active ? { background: VIOLET.tint, outline: `1px solid ${VIOLET.accent}` } : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-slate-600" />
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
                      <item.icon className="h-4 w-4 shrink-0 text-slate-500" />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  );
                })}
              </div>}
            </section>
          );
        })}

      </nav>
    </aside>
  );
}
