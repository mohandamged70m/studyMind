import { Copy, MessageSquare, ThumbsUp } from "lucide-react";
import type { ChatMessage } from "@/types/workspace";
import { CitationBlock } from "./citation-block";

function MessageActions() {
  return (
    <div className="mt-2 flex items-center gap-4 text-[11px] text-muted">
      <button
        type="button"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <ThumbsUp className="h-3 w-3" />
        Thumbs up
      </button>
      <button
        type="button"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Copy className="h-3 w-3" />
        Copy
      </button>
      <button
        type="button"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <MessageSquare className="h-3 w-3" />
        Ask follow-up
      </button>
    </div>
  );
}

function AssistantTextMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
        SM
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-medium text-muted">StudyMind</p>
        <div className="rounded-card border border-border bg-card p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
          {message.citations?.map((citation, i) => (
            <CitationBlock key={i} citation={citation} />
          ))}
        </div>
        <MessageActions />
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-card border border-border bg-card px-4 py-3">
        <p className="text-sm text-foreground">{message.content}</p>
      </div>
    </div>
  );
}

function QuizMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
        SM
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-card border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Quiz mode
            </span>
            {message.quizMeta && (
              <span className="text-xs text-muted">
                Question {message.quizMeta.questionIndex} of{" "}
                {message.quizMeta.total}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-input hover:text-foreground"
            >
              Hint
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-input hover:text-foreground"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackMessage({ message }: { message: ChatMessage }) {
  const correct = message.feedbackMeta?.correct ?? false;
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-[10px] font-bold text-success">
        ✓
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="rounded-card border bg-success-bg p-4"
          style={{ borderColor: "var(--success-border)" }}
        >
          <p className="text-sm font-medium text-success">
            {correct ? "Correct" : "Incorrect"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
          {message.citations?.map((citation, i) => (
            <CitationBlock key={i} citation={citation} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  if (message.type === "quiz") {
    return <QuizMessage message={message} />;
  }

  if (message.type === "feedback") {
    return <FeedbackMessage message={message} />;
  }

  return <AssistantTextMessage message={message} />;
}
