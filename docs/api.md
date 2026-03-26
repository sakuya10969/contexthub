# API リファレンス

ベース URL: `http://localhost:8000`

---

## 文書管理

### POST /documents/upload

文書ファイルをアップロードし、S3 に保存する。アップロード完了後、文書処理パイプライン（テキスト抽出 → チャンク分割 → Embedding 生成 → OpenSearch 登録）が実行される。

| 項目 | 値 |
|------|-----|
| Phase | Phase 1 |
| Content-Type | `multipart/form-data` |
| 対応形式 | PDF (`.pdf`), TXT (`.txt`), Markdown (`.md`) |

#### リクエスト

```
POST /documents/upload
Content-Type: multipart/form-data
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `file` | `UploadFile` | ✅ | アップロードするファイル |

#### レスポンス

```json
// 200 OK
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "report.pdf",
  "s3_key": "documents/550e8400-e29b-41d4-a716-446655440000/report.pdf",
  "file_type": "pdf",
  "status": "uploaded",
  "created_at": "2026-03-26T10:00:00Z",
  "updated_at": "2026-03-26T10:00:00Z"
}
```

#### エラー

| ステータス | 説明 |
|-----------|------|
| `400` | 未対応のファイル形式 |
| `500` | S3 アップロード失敗 |

---

### GET /documents

登録済み文書の一覧を取得する。

| 項目 | 値 |
|------|-----|
| Phase | Phase 1 |

#### リクエスト

```
GET /documents
```

パラメータなし。

#### レスポンス

```json
// 200 OK
{
  "documents": [
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440000",
      "file_name": "report.pdf",
      "s3_key": "documents/550e8400-e29b-41d4-a716-446655440000/report.pdf",
      "file_type": "pdf",
      "status": "indexed",
      "created_at": "2026-03-26T10:00:00Z",
      "updated_at": "2026-03-26T10:05:00Z"
    },
    {
      "document_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "file_name": "notes.md",
      "s3_key": "documents/6ba7b810-9dad-11d1-80b4-00c04fd430c8/notes.md",
      "file_type": "md",
      "status": "processing",
      "created_at": "2026-03-26T11:00:00Z",
      "updated_at": "2026-03-26T11:00:30Z"
    }
  ]
}
```

#### 文書状態 (status)

| 値 | 説明 |
|----|------|
| `uploaded` | S3 にアップロード済み、未処理 |
| `processing` | テキスト抽出〜インデックス登録の処理中 |
| `indexed` | OpenSearch へのインデックス登録完了 |
| `failed` | 処理中にエラーが発生 |

---

### DELETE /documents/{document_id}

指定した文書を削除する。S3 上のファイル、OpenSearch 上の関連チャンク、メタデータをすべて削除する。

| 項目 | 値 |
|------|-----|
| Phase | Phase 4 |

#### リクエスト

```
DELETE /documents/{document_id}
```

| パスパラメータ | 型 | 必須 | 説明 |
|--------------|-----|------|------|
| `document_id` | `str (UUID)` | ✅ | 削除対象の文書 ID |

#### レスポンス

```json
// 200 OK
{
  "message": "Document deleted successfully",
  "document_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### エラー

| ステータス | 説明 |
|-----------|------|
| `404` | 指定された document_id が存在しない |
| `500` | S3 または OpenSearch の削除処理に失敗 |

---

### POST /documents/{document_id}/reindex

指定した文書を再処理する。既存のチャンクを OpenSearch から削除し、テキスト抽出からインデックス登録までのパイプラインを再実行する。

| 項目 | 値 |
|------|-----|
| Phase | Phase 4 |

#### リクエスト

```
POST /documents/{document_id}/reindex
```

| パスパラメータ | 型 | 必須 | 説明 |
|--------------|-----|------|------|
| `document_id` | `str (UUID)` | ✅ | 再インデックス対象の文書 ID |

#### レスポンス

```json
// 200 OK
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "report.pdf",
  "status": "processing",
  "message": "Reindex started"
}
```

#### エラー

| ステータス | 説明 |
|-----------|------|
| `404` | 指定された document_id が存在しない |
| `409` | 文書が現在処理中（status が `processing`） |
| `500` | パイプライン実行に失敗 |

---

## 検索

### POST /search

自然言語クエリによるセマンティック検索を実行する。クエリを Bedrock Embedding でベクトル化し、OpenSearch の k-NN 検索で関連チャンクを取得する。

| 項目 | 値 |
|------|-----|
| Phase | Phase 3 |
| Content-Type | `application/json` |

#### リクエスト

```json
POST /search
{
  "query": "プロジェクトの進捗報告について",
  "top_k": 5
}
```

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|----------|------|
| `query` | `str` | ✅ | — | 検索クエリ（自然言語） |
| `top_k` | `int` | — | `5` | 取得する上位チャンク数 |

#### レスポンス

```json
// 200 OK
{
  "query": "プロジェクトの進捗報告について",
  "results": [
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440000",
      "chunk_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "file_name": "report.pdf",
      "content": "第3四半期のプロジェクト進捗は順調で...",
      "page_number": 3,
      "chunk_index": 7,
      "score": 0.92
    },
    {
      "document_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "chunk_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "file_name": "notes.md",
      "content": "進捗報告のまとめ: 主要マイルストーンは...",
      "page_number": null,
      "chunk_index": 2,
      "score": 0.87
    }
  ]
}
```

#### エラー

| ステータス | 説明 |
|-----------|------|
| `400` | クエリが空 |
| `500` | Embedding 生成または OpenSearch 検索に失敗 |

---

## チャット

### POST /chat

チャット形式の質問応答を実行する。関連チャンクを検索し、コンテキストとして Bedrock LLM に送信して回答を生成する。回答には引用元情報が付与される。

| 項目 | 値 |
|------|-----|
| Phase | Phase 3 |
| Content-Type | `application/json` |
| LLM | Claude 3.5 Sonnet (Bedrock) |

#### リクエスト

```json
POST /chat
{
  "message": "プロジェクトの主要なリスクは何ですか？",
  "top_k": 5
}
```

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|----------|------|
| `message` | `str` | ✅ | — | ユーザーの質問メッセージ |
| `top_k` | `int` | — | `5` | 検索で取得する上位チャンク数 |

#### レスポンス

```json
// 200 OK
{
  "answer": "プロジェクトの主要なリスクとして、以下の3点が文書から確認できます。\n\n1. スケジュール遅延のリスク...\n2. 技術的な課題...\n3. リソース不足...",
  "citations": [
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440000",
      "chunk_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "file_name": "report.pdf",
      "content": "主要リスクとして、スケジュール遅延が挙げられる...",
      "page_number": 5,
      "chunk_index": 12,
      "score": 0.94
    },
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440000",
      "chunk_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "file_name": "report.pdf",
      "content": "技術選定に関するリスク評価では...",
      "page_number": 8,
      "chunk_index": 20,
      "score": 0.89
    }
  ]
}
```

#### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `answer` | `str` | LLM が生成した回答テキスト |
| `citations` | `Citation[]` | 回答の根拠となったチャンク一覧 |

#### Citation オブジェクト

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `document_id` | `str` | 元文書の ID |
| `chunk_id` | `str` | チャンクの ID |
| `file_name` | `str` | 元ファイル名 |
| `content` | `str` | チャンクのテキスト抜粋 |
| `page_number` | `int \| null` | ページ番号（PDF の場合） |
| `chunk_index` | `int` | 文書内でのチャンク順序 |
| `score` | `float` | 検索スコア（0〜1、高いほど関連度が高い） |

#### エラー

| ステータス | 説明 |
|-----------|------|
| `400` | メッセージが空 |
| `500` | 検索、Embedding 生成、または LLM 呼び出しに失敗 |

---

## 共通エラーレスポンス

すべてのエンドポイントで、エラー時は以下の形式で返却する。

```json
{
  "detail": "エラーメッセージ"
}
```

| ステータス | 説明 |
|-----------|------|
| `400` | リクエスト不正（バリデーションエラー、未対応形式等） |
| `404` | リソースが見つからない |
| `409` | 競合（処理中の文書に対する操作等） |
| `500` | サーバー内部エラー（外部サービス障害等） |
