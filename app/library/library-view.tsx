"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import UploadDropzone from "@/components/library/UploadDropzone";
import DocumentCard from "@/components/library/DocumentCard";
import LibrarySidebar from "@/components/library/LibrarySidebar";
import LibraryCollectionsSheet from "@/components/library/LibraryCollectionsSheet";
import LibraryToolbar, { SortKey } from "@/components/library/LibraryToolbar";
import BulkActionBar from "@/components/library/BulkActionBar";
import { Document, Collection } from "@/lib/types";
import {
  uploadDocumentAction,
  createCollectionAction,
  renameCollectionAction,
  deleteCollectionAction,
  renameDocumentAction,
  bulkDeleteDocumentsAction,
  bulkAssignToCollectionAction,
} from "@/app/actions";
import { FolderOpen, SearchX } from "lucide-react";

export type DocStats = Record<string, { flashcards: number; highlights: number }>;

export default function LibraryView({
  initialDocs,
  collections: initialCollections,
  docStats,
}: {
  initialDocs: Document[];
  collections: Collection[];
  docStats: DocStats;
}) {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [optimisticDoc, setOptimisticDoc] = useState<Document | null>(null);

  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collectionsSheetOpen, setCollectionsSheetOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(initialDocs);
  }, [initialDocs]);

  // ── Derived data ────────────────────────────────────────────
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      if (d.collectionId) counts[d.collectionId] = (counts[d.collectionId] ?? 0) + 1;
    });
    return counts;
  }, [documents]);

  const uncategorizedCount = useMemo(
    () => documents.filter((d) => !d.collectionId).length,
    [documents]
  );

  const visibleDocs = useMemo(() => {
    let list = documents;

    if (activeCollection === "__none__") {
      list = list.filter((d) => !d.collectionId);
    } else if (activeCollection) {
      list = list.filter((d) => d.collectionId === activeCollection);
    }

    const q = query.trim().toLowerCase();
    if (q) list = list.filter((d) => d.title.toLowerCase().includes(q));

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "progress") return b.progress - a.progress;
      // recent
      const at = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
      const bt = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
      return bt - at;
    });
    return sorted;
  }, [documents, activeCollection, query, sort]);

  // ── Upload ──────────────────────────────────────────────────
  const handleUploadStart = async (title: string, pageCount: number, type: "pdf" | "audio" | "video") => {
    const tempId = `optimistic-${Date.now()}`;
    const newOptimisticDoc: Document = {
      id: tempId,
      title,
      pageCount,
      status: "new",
      progress: 0,
      lastOpenedAt: null,
      type,
      collectionId: activeCollection && activeCollection !== "__none__" ? activeCollection : null,
    };
    setOptimisticDoc(newOptimisticDoc);
    try {
      await uploadDocumentAction(title, pageCount, type);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setOptimisticDoc(null);
    }
  };

  // ── Collections ─────────────────────────────────────────────
  const handleCreateCollection = (name: string) => {
    startTransition(async () => {
      const col = await createCollectionAction(name);
      if (col) setCollections((prev) => [...prev, col]);
    });
  };

  const handleRenameCollection = (id: string, name: string) => {
    startTransition(async () => {
      const col = await renameCollectionAction(id, name);
      if (col) setCollections((prev) => prev.map((c) => (c.id === id ? col : c)));
    });
  };

  const handleDeleteCollection = (id: string) => {
    startTransition(async () => {
      await deleteCollectionAction(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (activeCollection === id) setActiveCollection(null);
    });
  };

  // ── Documents ───────────────────────────────────────────────
  const handleRenameDoc = (id: string, title: string) => {
    startTransition(async () => {
      const doc = await renameDocumentAction(id, title);
      if (doc) setDocuments((prev) => prev.map((d) => (d.id === id ? doc : d)));
    });
  };

  const handleDeletedDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkDeleteDocumentsAction(ids);
      setDocuments((prev) => prev.filter((d) => !ids.includes(d.id)));
      setSelected(new Set());
    });
  };

  const handleBulkAssign = (collectionId: string | null) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBulkError(null);
    startTransition(async () => {
      try {
        await bulkAssignToCollectionAction(ids, collectionId);
        setDocuments((prev) =>
          prev.map((d) => (ids.includes(d.id) ? { ...d, collectionId } : d))
        );
        setSelected(new Set());
      } catch (err) {
        console.error("Bulk assign failed", err);
        setBulkError("Couldn't move the selected documents. Please try again.");
      }
    });
  };

  const displayDocs = optimisticDoc ? [optimisticDoc, ...visibleDocs] : visibleDocs;

  return (
    <div className="flex-1 flex min-h-0">
      <LibrarySidebar
        collections={collections}
        activeCollection={activeCollection}
        onSelect={setActiveCollection}
        collectionCounts={collectionCounts}
        totalCount={documents.length}
        uncategorizedCount={uncategorizedCount}
        onCreate={handleCreateCollection}
        onRename={handleRenameCollection}
        onDelete={handleDeleteCollection}
      />

      <LibraryCollectionsSheet
        open={collectionsSheetOpen}
        onClose={() => setCollectionsSheetOpen(false)}
        collections={collections}
        activeCollection={activeCollection}
        onSelect={setActiveCollection}
        collectionCounts={collectionCounts}
        totalCount={documents.length}
        uncategorizedCount={uncategorizedCount}
        onCreate={handleCreateCollection}
        onRename={handleRenameCollection}
        onDelete={handleDeleteCollection}
      />

      <div className="animate-page-enter flex-1 w-full mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-6 overflow-y-auto" style={{ maxWidth: "1280px" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif font-bold text-[var(--text-display)] text-ink tracking-tight mb-1">
              Your Library
            </h1>
            <p className="text-[var(--text-body)] text-ink-soft leading-relaxed max-w-xl">
              Upload textbooks, research papers, or syllabus guides to highlight passages, generate flashcards, and run citation-backed chats.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-card border border-line rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-[var(--text-subhead)] font-bold text-ink">{documents.length}</span>
              <span className="text-[var(--text-micro)] text-ink-soft uppercase tracking-wider">Documents</span>
            </div>
            <div className="bg-card border border-line rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-[var(--text-subhead)] font-bold text-sage">
                {documents.filter((d) => d.status === "mastered").length}
              </span>
              <span className="text-[var(--text-micro)] text-ink-soft uppercase tracking-wider">Mastered</span>
            </div>
          </div>
        </div>

        {/* Upload */}
        <UploadDropzone onUploadStart={handleUploadStart} onUploadComplete={() => {}} />

        {/* Toolbar */}
        <LibraryToolbar
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
          viewMode={viewMode}
          onViewMode={setViewMode}
          selectMode={selectMode}
          onToggleSelectMode={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
          resultCount={visibleDocs.length}
          onOpenCollections={() => setCollectionsSheetOpen(true)}
        />

        {/* Document area */}
        {displayDocs.length === 0 ? (
          <EmptyState filtered={documents.length > 0} />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid"
                : "flex flex-col gap-2"
            }
            style={
              viewMode === "grid"
                ? { gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "18px" }
                : undefined
            }
          >
            {displayDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isOptimistic={doc.id.startsWith("optimistic")}
                flashcardCount={docStats[doc.id]?.flashcards ?? 0}
                highlightCount={docStats[doc.id]?.highlights ?? 0}
                viewMode={viewMode}
                selectMode={selectMode}
                selected={selected.has(doc.id)}
                onToggleSelect={toggleSelect}
                onRename={handleRenameDoc}
                onDeleted={handleDeletedDoc}
              />
            ))}
          </div>
        )}
      </div>

      <BulkActionBar
        selectedCount={selected.size}
        collections={collections}
        onClear={() => {
          setSelected(new Set());
          setBulkError(null);
        }}
        onDelete={handleBulkDelete}
        onAssign={handleBulkAssign}
        pending={pending}
        error={bulkError}
        onDismissError={() => setBulkError(null)}
      />
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex-1 border border-line/80 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/45 min-h-[300px]">
      {filtered ? (
        <SearchX className="h-12 w-12 text-ink-soft/40 mb-3" />
      ) : (
        <FolderOpen className="h-12 w-12 text-ink-soft/40 mb-3" />
      )}
      <p className="font-serif font-bold text-[var(--text-body)] text-ink mb-1">
        {filtered ? "No matching documents" : "No documents yet"}
      </p>
      <p className="text-[var(--text-caption)] text-ink-soft max-w-xs">
        {filtered
          ? "Try a different search term or collection filter."
          : "Upload a file above to index your first study set."}
      </p>
    </div>
  );
}
