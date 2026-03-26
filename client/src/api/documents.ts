import apiClient from "./client";
import type {
  Document,
  DocumentListResponse,
  DeleteDocumentResponse,
  ReindexResponse,
} from "../types";

export async function uploadDocument(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<Document>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listDocuments(): Promise<Document[]> {
  const { data } = await apiClient.get<DocumentListResponse>("/documents");
  return data.documents;
}

export async function deleteDocument(
  documentId: string
): Promise<DeleteDocumentResponse> {
  const { data } = await apiClient.delete<DeleteDocumentResponse>(
    `/documents/${documentId}`
  );
  return data;
}

export async function reindexDocument(
  documentId: string
): Promise<ReindexResponse> {
  const { data } = await apiClient.post<ReindexResponse>(
    `/documents/${documentId}/reindex`
  );
  return data;
}
