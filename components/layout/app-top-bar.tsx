import Link from "next/link";

interface AppTopBarProps {
  sessionTitle: string;
  materialCount: number;
  messageCount: number;
  location: string;
}

export function AppTopBar({
  sessionTitle,
  materialCount,
  messageCount,
  location,
}: AppTopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-paper px-4">
      <div className="flex items-center gap-6">
        <Link
          href="/library"
          className="text-sm font-semibold tracking-tight text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          StudyMind
        </Link>
      </div>

      <div className="hidden flex-col items-center sm:flex">
        <span className="text-sm font-medium text-ink">
          {sessionTitle}
        </span>
        <span className="text-xs text-ink-soft">
          {materialCount} materials • {messageCount} messages • {location}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Switch language between Arabic and English"
          className="text-xs text-ink-soft transition-colors hover:text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          AR / EN
        </button>
        <button
          type="button"
          aria-label="Open profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-xs font-semibold text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          MD
        </button>
      </div>
    </header>
  );
}