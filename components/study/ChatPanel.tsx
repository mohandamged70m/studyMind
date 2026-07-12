"use client";

import { useState, useRef, useEffect } from "react";
import { useActivePage } from "./ActivePageContext";
import { ChatMessage } from "@/lib/types";
import { addChatMessageAction, clearChatHistoryAction } from "@/app/actions";
import { Send, MessageSquare, Trash2, ArrowUpRight, Sparkles } from "lucide-react";
import clsx from "clsx";

export default function ChatPanel({
  docId,
  initialMessages = []
}: {
  docId: string;
  initialMessages?: ChatMessage[];
}) {
  const { setActivePage } = useActivePage();
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
        body: JSON.stringify({ docId, query: userText, history: messages })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const citedPageHeader = response.headers.get("X-Cited-Page");
      const citedPage = citedPageHeader ? parseInt(citedPageHeader, 10) : undefined;

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantText += chunk;
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== assistantTempId && m.id !== "assistant-stream");
            return [...filtered, { id: "assistant-stream", role: "assistant", content: assistantText, citedPage }];
          });
        }
      }

      await addChatMessageAction(docId, "user", userText);
      const finalAssistantMsg = await addChatMessageAction(docId, "assistant", assistantText, citedPage);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMsgTempId && m.id !== "assistant-stream");
        return [...filtered, { id: userMsgTempId, role: "user", content: userText }, finalAssistantMsg];
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== assistantTempId && m.id !== "assistant-stream");
        return [...filtered, { id: `err-${Date.now()}`, role: "assistant", content: "Sorry, I encountered an error while processing your request. Please try again." }];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = async () => {
    if (confirm("Are you sure you want to clear chat history for this document?")) {
      await clearChatHistoryAction(docId);
      setMessages([]);
    }
  };

  const handleCitationClick = (pageNum: number) => {
    setActivePage(pageNum);
    // Trigger soft highlight flash on the target page
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) {
      el.classList.remove("animate-citation-flash");
      // Force reflow
      void el.offsetWidth;
      el.classList.add("animate-citation-flash");
    }
  };

  const renderMessageText = (content: string) => {
    if (!content) {
      return (
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-1.5 w-1.5 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
            onClick={() => handleCitationClick(pageNum)}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 text-[var(--text-micro)] font-bold bg-terracotta/15 hover:bg-terracotta hover:text-paper text-terracotta rounded transition-all duration-150 cursor-pointer align-middle"
            style={{ minHeight: "32px", minWidth: "32px" }}
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
    <div className="flex flex-col h-full">
      {/* Fixed header — chat header */}
      <div className="px-5 py-4 border-b border-line bg-card/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-terracotta" />
          <h3 className="font-serif font-bold text-[var(--text-label)] text-ink">AI Assistant</h3>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClearChat} className="p-1.5 text-ink-soft hover:text-terracotta hover:bg-paper-deep rounded-lg transition-colors" title="Clear Chat History">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable messages body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-line border-dashed rounded-2xl h-60 bg-card/25">
            <MessageSquare className="h-10 w-10 text-ink-soft/30 mb-2" />
            <p className="font-serif font-bold text-[var(--text-label)] text-ink mb-1">Ask about your document</p>
            <p className="text-[var(--text-caption)] text-ink-soft max-w-xs leading-relaxed">
              Ask summaries, specific concepts, or keywords (e.g. try searching &quot;DRY&quot; or &quot;function&quot; if reading clean code) to see citations in action!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-[var(--text-body)] leading-relaxed shadow-sm border",
                  isUser
                    ? "bg-terracotta text-paper border-terracotta rounded-tr-sm"
                    : "bg-card text-ink border-line rounded-tl-sm"
                )}>
                  <p className="whitespace-pre-wrap">{renderMessageText(msg.content)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed footer — chat input */}
      <form onSubmit={handleSend} className="p-4 border-t border-line bg-card shrink-0">
        <div className="relative flex items-center bg-paper border border-line rounded-xl shadow-inner focus-within:ring-1 focus-within:ring-terracotta focus-within:border-terracotta overflow-hidden">
          <input
            type="text"
            placeholder={isStreaming ? "Streaming response..." : "Ask your PDF assistant..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent py-3 pl-4 pr-12 text-[var(--text-body)] text-ink focus:outline-none placeholder:text-ink-soft/50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className={clsx(
              "absolute right-2 p-2 rounded-lg transition-colors duration-200",
              input.trim() && !isStreaming
                ? "bg-terracotta hover:bg-terracotta-deep text-paper"
                : "bg-paper-deep text-ink-soft opacity-40 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
