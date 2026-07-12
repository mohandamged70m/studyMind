"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { createStudySet } from "@/app/actions/study-sets";

interface CreateStudySetModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateStudySetModal({ open, onClose }: CreateStudySetModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      await createStudySet(formData);
      setTitle("");
      setDescription("");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "var(--card)",
            backgroundImage: "none",
            borderRadius: "16px",
            p: 1,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, color: "var(--foreground)", fontWeight: 700 }}>
          Create new study set
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ color: "var(--muted)", mb: 2 }}>
            Organize your learning materials into a study set.
          </Typography>

          <TextField
            autoFocus
            label="Title"
            placeholder="e.g. Biology Chapter 5"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            fullWidth
            required
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                sx: {
                  bgcolor: "var(--input)",
                  borderRadius: "10px",
                  color: "var(--foreground)",
                  "&:before, &:after": { display: "none" },
                  "&.Mui-focused": { outline: "1px solid var(--accent)" },
                },
              },
              inputLabel: { sx: { color: "var(--muted)", "&.Mui-focused": { color: "var(--accent)" } } },
            }}
          />

          <TextField
            label="Description (optional)"
            placeholder="Brief description of this study set"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            slotProps={{
              input: {
                sx: {
                  bgcolor: "var(--input)",
                  borderRadius: "10px",
                  color: "var(--foreground)",
                  "&:before, &:after": { display: "none" },
                  "&.Mui-focused": { outline: "1px solid var(--accent)" },
                },
              },
              inputLabel: { sx: { color: "var(--muted)", "&.Mui-focused": { color: "var(--accent)" } } },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={submitting} sx={{ color: "var(--muted)" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "var(--accent)",
              color: "#fff",
              "&:hover": { bgcolor: "var(--accent-hover)" },
              "&.Mui-disabled": { opacity: 0.5 },
            }}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
