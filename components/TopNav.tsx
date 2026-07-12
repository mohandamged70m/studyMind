"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Library as LibraryIcon, User } from "lucide-react";
import clsx from "clsx";

export default function TopNav({ activeDocId }: { activeDocId?: string }) {
  const pathname = usePathname();

  // Extract docId from current pathname if in /study/ or /review/
  const studyMatch = pathname.match(/^\/study\/([^/]+)/);
  const reviewMatch = pathname.match(/^\/review\/([^/]+)/);
  const currentDocId = studyMatch?.[1] || reviewMatch?.[1] || activeDocId;

  const tabs = [
    {
      name: "Library",
      href: "/library",
      icon: LibraryIcon,
      active: pathname.startsWith("/library")
    },
    {
      name: "Study Room",
      href: currentDocId ? `/study/${currentDocId}` : "#",
      icon: BookOpen,
      active: pathname.startsWith("/study"),
      disabled: !currentDocId
    },
    {
      name: "Review",
      href: currentDocId ? `/review/${currentDocId}` : "#",
      icon: GraduationCap,
      active: pathname.startsWith("/review"),
      disabled: !currentDocId
    }
  ];

  return (
    <nav className="w-full bg-card border-b border-line px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link href="/library" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-lg">
        <div className="bg-terracotta text-paper p-2 rounded-lg group-hover:bg-terracotta-soft group-hover:text-terracotta transition-colors duration-200" aria-hidden="true">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-ink">
          Study<span className="text-terracotta">Mind</span>
        </span>
      </Link>

      {/* Tabs */}
      <div className="flex items-center gap-1 md:gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.disabled) {
            return (
              <button
                key={tab.name}
                type="button"
                aria-disabled="true"
                tabIndex={0}
                onClick={(e) => e.preventDefault()}
                className="group relative flex items-center gap-1.5 md:gap-2 px-3 py-2 text-sm font-medium text-ink-soft opacity-40 cursor-not-allowed select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{tab.name}</span>
                {/* Micro tooltip — visible on hover and keyboard focus */}
                <span
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-ink text-paper text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none text-center shadow-lg"
                >
                  Select a document first
                </span>
              </button>
            );
          }

          const isActive = tab.active;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                isActive
                  ? "bg-paper-deep text-terracotta shadow-inner font-semibold border-b-2 border-terracotta"
                  : "text-ink-soft hover:text-ink hover:bg-paper/50"
              )}
            >
              <Icon className={clsx("h-4 w-4", isActive ? "text-terracotta" : "text-ink-soft")} aria-hidden="true" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right" aria-hidden="true">
          <span className="text-xs font-semibold text-ink">Scholar Mode</span>
          <span className="text-[10px] text-sage font-medium">Librarian level 4</span>
        </div>
        <button
          type="button"
          aria-label="Open profile"
          className="h-9 w-9 rounded-full bg-sage text-paper flex items-center justify-center font-bold font-serif hover:bg-sage-deep transition-colors duration-200 border border-line shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <User className="h-4 w-4 text-paper" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
