import apiClient from "./client";
import type { SearchResponse } from "../types";

export async function searchDocuments(
  query: string,
  topK = 5
): Promise<SearchResponse> {
  const { data } = await apiClient.post<SearchResponse>("/search", {
    query,
    top_k: topK,
  });
  return data;
}
