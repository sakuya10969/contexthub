import { useState } from "react";
import { sendChatMessage } from "../api/chat";
import type { ChatMessage } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(message: string, topK = 5) {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    setError(null);
    try {
      const res = await sendChatMessage(message, topK);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, citations: res.citations },
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "チャットに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setMessages([]);
    setError(null);
  }

  return { messages, loading, error, send, clear };
}
