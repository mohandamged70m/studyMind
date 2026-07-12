import type { Citation } from "@/types/workspace";

export function CitationBlock({ citation }: { citation: Citation }) {
  return (
    <div className="mt-3 rounded-lg border border-citation/40 bg-citation-bg p-3">
      <p className="text-[11px] font-medium text-citation">
        {citation.documentTitle} — page {citation.page} — chunk{" "}
        {citation.chunkIndex}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        &ldquo;{citation.excerpt}&rdquo;
      </p>
    </div>
  );
}
