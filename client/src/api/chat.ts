import apiClient from "./client";
import type { ChatResponse } from "../types";

export async function sendChatMessage(
  message: string,
  topK = 5
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat", {
    message,
    top_k: topK,
  });
  return data;
}
