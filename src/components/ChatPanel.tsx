import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const ENDPOINT = `${import.meta.env.VITE_CONVEX_SITE_URL}/chat/editTemplate`;

export default function ChatPanel({ code, onCodeChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  async function handleSend() {
    const instruction = input.trim();
    if (!instruction || pending) return;
    setInput("");
    setError(null);
    const history = messages;
    setMessages([...history, { role: "user", content: instruction }]);
    setPending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCode: code, instruction, history }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { code: string; message: string };
      if (data.code && data.code !== code) onCodeChange(data.code);
      setMessages((m) => [...m, { role: "assistant", content: data.message || "Updated." }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-t border-border-app">
      <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface border-b border-border-app">
        AI Chat
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-xs text-text-muted">
            Describe a change — e.g. "add an invoice total row" or "make the header blue".
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-[6px] px-2.5 py-2 whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary/20 text-text-app self-end max-w-[85%]"
                : "bg-surface-2 text-text-app self-start max-w-[85%]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && <div className="text-xs text-text-muted self-start">Thinking…</div>}
        {error && <div className="text-xs text-red-400 self-start">{error}</div>}
      </div>
      <div className="flex gap-2 p-2 border-t border-border-app bg-surface shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask the AI to change the template…"
          rows={2}
          className="flex-1 bg-surface-2 border border-border-app rounded-[6px] px-2.5 py-2 text-text-app text-sm resize-none outline-none focus:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={pending || !input.trim()}
          className="px-3 py-1.5 rounded-[6px] bg-primary text-white text-[13px] font-medium disabled:opacity-50 hover:bg-primary-hover"
        >
          Send
        </button>
      </div>
    </div>
  );
}
