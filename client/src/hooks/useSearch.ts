import { useState } from "react";
import { searchDocuments } from "../api/search";
import type { SearchResult } from "../types";

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(q: string, topK = 5) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(q);
    try {
      const res = await searchDocuments(q, topK);
      setResults(res.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return { results, query, loading, error, search };
}
