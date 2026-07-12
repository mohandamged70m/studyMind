"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { StudySet } from "@/types/study-set";
import { renameStudySet, deleteStudySet, duplicateStudySet } from "@/app/actions/study-sets";
import { cn } from "@/lib/utils";

interface StudySetCardProps {
  studySet: StudySet;
}

export function StudySetCard({ studySet }: StudySetCardProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [renaming, setRenaming] = useState(false);

  const lastOpened = new Date(studySet.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleRename = async () => {
    handleMenuClose();
    const next = prompt("Rename study set:", studySet.title);
    if (next?.trim() && next.trim() !== studySet.title) {
      setRenaming(true);
      try {
        await renameStudySet(studySet.id, next.trim());
        router.refresh();
      } finally {
        setRenaming(false);
      }
    }
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (!confirm(`Delete "${studySet.title}"? This cannot be undone.`)) return;
    await deleteStudySet(studySet.id);
    router.refresh();
  };

  const handleDuplicate = async () => {
    handleMenuClose();
    await duplicateStudySet(studySet.id);
    router.refresh();
  };

  return (
    <Card
      onClick={() => router.push(`/study/${studySet.id}`)}
      sx={{
        bgcolor: "var(--card)",
        border: "1px solid var(--border)",
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          borderColor: "var(--accent)",
          boxShadow: "0 4px 20px rgba(124, 93, 250, 0.15)",
        },
      }}
      className="group relative flex flex-col rounded-card"
    >
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
          style={{ backgroundColor: studySet.color_tag }}
        >
          {studySet.title.charAt(0).toUpperCase()}
        </div>

        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{ color: "var(--muted)", opacity: 0, transition: "opacity 0.15s", ".group:hover &": { opacity: 1 } }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                minWidth: 160,
              },
            },
          }}
        >
          <MenuItem onClick={handleRename} disabled={renaming}>
            <ListItemIcon sx={{ minWidth: 32, color: "var(--muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </ListItemIcon>
            <ListItemText primary="Rename" />
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon sx={{ minWidth: 32, color: "var(--muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </ListItemIcon>
            <ListItemText primary="Duplicate" />
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "#ef4444" }}>
            <ListItemIcon sx={{ minWidth: 32, color: "#ef4444" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </div>

      <CardContent sx={{ pt: 0, pb: "12px !important", px: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "var(--foreground)", mb: 0.5, lineHeight: 1.3 }}
        >
          {studySet.title}
        </Typography>
        {studySet.description && (
          <Typography
            variant="body2"
            sx={{ color: "var(--muted)", mb: 1, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {studySet.description}
          </Typography>
        )}
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
          <span>{studySet.source_count} {studySet.source_count === 1 ? "source" : "sources"}</span>
          <span>Updated {lastOpened}</span>
        </div>
      </CardContent>
    </Card>
  );
}
