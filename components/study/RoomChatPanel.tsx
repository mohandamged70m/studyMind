"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Trash2, ArrowUpRight, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage } from "@/lib/types";
import {
  addRoomChatMessageAction,
  clearRoomChatHistoryAction,
} from "@/app/actions";

interface RoomChatPanelProps {
  roomId: string;
  docIds: string[];
  activeDocId: string;
  initialMessages: ChatMessage[];
  onCite: (docId: string, page: number) => void;
}

export default function RoomChatPanel({
  roomId,
  docIds,
  activeDocId,
  initialMessages,
  onCite,
}: RoomChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    setInput("");
    setIsStreaming(true);

    const userMsgTempId = `user-temp-${Date.now()}`;
    const userMsg: ChatMessage = { id: userMsgTempId, role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);

    const assistantTempId = "assistant-loading";
    setMessages((prev) => [...prev, { id: assistantTempId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docIds, query: userText }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const citedPageHeader = response.headers.get("X-Cited-Page");
      const citedDocHeader = response.headers.get("X-Cited-Doc");
      const citedPage = citedPageHeader ? parseInt(citedPageHeader, 10) : undefined;
      const citedDocId = citedDocHeader || undefined;

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value);
          setMessages((prev) => {
            const filtered = prev.filter(
              (m) => m.id !== assistantTempId && m.id !== "assistant-stream"
            );
            return [
              ...filtered,
              {
                id: "assistant-stream",
                role: "assistant",
                content: assistantText,
                citedPage,
                citedDocId,
              } as ChatMessage,
            ];
          });
        }
      }

      await addRoomChatMessageAction(roomId, "user", userText);
      const finalAssistant = await addRoomChatMessageAction(
        roomId,
        "assistant",
        assistantText,
        citedPage,
        citedDocId
      );

      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => m.id !== userMsgTempId && m.id !== "assistant-stream"
        );
        return [
          ...filtered,
          { id: userMsgTempId, role: "user", content: userText },
          finalAssistant,
        ];
      });
    } catch {
      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => m.id !== assistantTempId && m.id !== "assistant-stream"
        );
        return [
          ...filtered,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I encountered an error while processing your request. Please try again.",
          },
        ];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = async () => {
    if (confirm("Are you sure you want to clear chat history for this room?")) {
      await clearRoomChatHistoryAction(roomId);
      setMessages([]);
    }
  };

  const handleCitationClick = (docId: string | undefined, pageNum: number) => {
    if (docId && docId !== activeDocId) {
      onCite(docId, pageNum);
    } else {
      onCite(activeDocId, pageNum);
    }
  };

  const renderMessageText = (
    content: string,
    citedDocId: string | undefined
  ) => {
    if (!content) {
      return (
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-terracotta" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-terracotta" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-terracotta" style={{ animationDelay: "300ms" }} />
        </span>
      );
    }

    const parts = content.split(/((?:p\.|page)\s*\d+)/gi);
    return parts.map((part, index) => {
      const match = part.match(/(?:p\.|page)\s*(\d+)/i);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        return (
          <button
            key={index}
            onClick={() => handleCitationClick(citedDocId, pageNum)}
            className="mx-0.5 inline-flex min-h-[32px] min-w-[32px] items-center gap-0.5 rounded bg-terracotta/15 px-2 py-0.5 font-bold text-terracotta align-middle transition-all duration-150 hover:bg-terracotta hover:text-paper"
            title="Jump to cited page"
          >
            p. {pageNum}
            <ArrowUpRight className="h-2.5 w-2.5" />
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-card/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-terracotta" />
          <h3 className="font-serif font-bold text-ink">Room Assistant</h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-paper-deep hover:text-terracotta"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/25 p-8 text-center">
            <MessageSquare className="mb-2 h-10 w-10 text-ink-soft/30" />
            <p className="font-serif font-bold text-ink">Ask about your room</p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-soft">
              Questions are answered across all {docIds.length} document(s) in this room. Try keywords like &quot;qubit&quot;, &quot;function&quot;, or &quot;DRY&quot;.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
                    isUser
                      ? "rounded-tr-sm border-terracotta bg-terracotta text-paper"
                      : "rounded-tl-sm border-line bg-card text-ink"
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {renderMessageText(msg.content, (msg as any).citedDocId)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="shrink-0 border-t border-line bg-card p-4">
        <div className="relative flex items-center overflow-hidden rounded-xl border border-line bg-paper shadow-inner focus-within:border-terracotta focus-within:ring-1 focus-within:ring-terracotta">
          <input
            type="text"
            placeholder={isStreaming ? "Streaming response..." : "Ask your room assistant..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent py-3 pl-4 pr-12 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className={clsx(
              "absolute right-2 rounded-lg p-2 transition-colors duration-200",
              input.trim() && !isStreaming
                ? "bg-terracotta text-paper hover:bg-terracotta-deep"
                : "cursor-not-allowed bg-paper-deep text-ink-soft opacity-40"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
