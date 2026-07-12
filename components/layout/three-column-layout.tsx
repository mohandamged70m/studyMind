import type { ReactNode } from "react";

interface ThreeColumnLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function ThreeColumnLayout({
  left,
  center,
  right,
}: ThreeColumnLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line bg-card lg:flex">
        {left}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col bg-paper">
        {center}
      </main>
      <aside className="hidden w-[280px] shrink-0 flex-col border-l border-line bg-card xl:flex">
        {right}
      </aside>
    </div>
  );
}