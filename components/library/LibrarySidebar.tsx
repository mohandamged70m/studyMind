"use client";

import type { Collection } from "@/lib/types";
import CollectionNav from "./CollectionNav";

interface LibrarySidebarProps {
  collections: Collection[];
  activeCollection: string | null;
  onSelect: (id: string | null) => void;
  collectionCounts: Record<string, number>;
  totalCount: number;
  uncategorizedCount: number;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function LibrarySidebar(props: LibrarySidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-card/40 py-5 pr-3">
      <CollectionNav {...props} />
    </aside>
  );
}
