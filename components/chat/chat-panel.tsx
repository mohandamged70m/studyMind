"use client";

import { ArrowUp, Loader2, Paperclip, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/workspace";
import { ChatMessageItem } from "./chat-message";

interface ChatPanelProps {
  conversationId: string;
  notebookTitle: string;
  charCount: number;
  messageCount: number;
  messages: ChatMessage[];
  onMessageSent?: () => void;
}

export function ChatPanel({
  conversationId,
  notebookTitle,
  charCount,
  messageCount,
  messages,
  onMessageSent,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamBuffer]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || streaming) return;

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      type: "text",
      content,
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreaming(true);
    setStreamBuffer("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamBuffer(accumulated);
      }

      setStreamBuffer("");
      onMessageSent?.();
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          type: "text",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setStreaming(false);
      setStreamBuffer("");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            {notebookTitle}
          </h2>
          <p className="text-xs text-muted">
            {charCount.toLocaleString()} chars • {messageCount} messages
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-card hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {localMessages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {streaming && streamBuffer && (
          <ChatMessageItem
            message={{
              id: "streaming",
              role: "assistant",
              type: "text",
              content: streamBuffer,
            }}
          />
        )}

        {streaming && !streamBuffer && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            StudyMind is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-pill border border-border bg-input px-4 py-2">
          <button
            type="button"
            className="shrink-0 text-muted transition-colors hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={streaming}
            placeholder="Ask anything about your materials..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            aria-label="Send message"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
