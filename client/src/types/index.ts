export type DocumentStatus = "uploaded" | "processing" | "indexed" | "failed";

export interface Document {
  document_id: string;
  file_name: string;
  s3_key: string;
  file_type: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
}

export interface DeleteDocumentResponse {
  message: string;
  document_id: string;
}

export interface ReindexResponse {
  document_id: string;
  file_name: string;
  status: DocumentStatus;
  message: string;
}

export interface SearchResult {
  document_id: string;
  chunk_id: string;
  file_name: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface Citation {
  document_id: string;
  chunk_id: string;
  file_name: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  score: number;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}
