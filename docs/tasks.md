# タスク一覧

## Phase 1 — 基盤構築

### 1.1 プロジェクト基盤

- [ ] 1.1.1 docker-compose.yml に OpenSearch サービスを定義する
- [ ] 1.1.2 バックエンド: `server/app/` 配下のディレクトリ構成を作成する（core, models, schemas, routers, services, repositories, clients, utils）
- [ ] 1.1.3 バックエンド: `app/core/config.py` に環境変数・設定値を定義する（S3 バケット名、OpenSearch URL、Bedrock リージョン等）
- [ ] 1.1.4 バックエンド: `main.py` を FastAPI アプリケーションとして構成し、router を登録する
- [ ] 1.1.5 バックエンド: Python 依存パッケージを追加する（boto3, opensearch-py, pymupdf, markdown, beautifulsoup4, python-multipart）
- [ ] 1.1.6 フロントエンド: npm パッケージを追加する（@tanstack/react-query, @mantine/dropzone, react-router, axios）
- [ ] 1.1.7 フロントエンド: `src/api/client.ts` に axios インスタンスを作成する
- [ ] 1.1.8 フロントエンド: `src/types/index.ts` に共通型定義を作成する（Document, ChatMessage, Citation 等）
- [ ] 1.1.9 フロントエンド: `src/theme/index.ts` に Mantine テーマ設定を作成する
- [ ] 1.1.10 フロントエンド: `App.tsx` に react-router でルーティングを設定する
- [ ] 1.1.11 フロントエンド: `src/components/Layout.tsx` に共通レイアウト（ナビゲーション）を作成する

### 1.2 ドメインモデル・スキーマ

- [ ] 1.2.1 `app/models/document.py` に Document, DocumentStatus, Chunk モデルを定義する
- [ ] 1.2.2 `app/schemas/document.py` に文書関連のリクエスト・レスポンススキーマを定義する
- [ ] 1.2.3 `app/repositories/document_repository.py` にインメモリ DocumentRepository を実装する

### 1.3 S3 クライアント・文書アップロード

- [ ] 1.3.1 `app/clients/s3_client.py` に S3Client を実装する（upload, download, delete）
- [ ] 1.3.2 `app/services/document_service.py` に DocumentService を実装する（アップロード処理、メタデータ登録）
- [ ] 1.3.3 `app/routers/documents.py` に `POST /documents/upload` エンドポイントを実装する
- [ ] 1.3.4 フロントエンド: `src/api/documents.ts` に文書アップロード API クライアントを実装する
- [ ] 1.3.5 フロントエンド: `src/components/FileDropzone.tsx` にファイルドロップゾーンを実装する
- [ ] 1.3.6 フロントエンド: `src/hooks/useDocuments.ts` にアップロード用カスタムフックを実装する
- [ ] 1.3.7 フロントエンド: `src/pages/UploadPage.tsx` にアップロード画面を実装する

### 1.4 文書一覧

- [ ] 1.4.1 `app/routers/documents.py` に `GET /documents` エンドポイントを実装する
- [ ] 1.4.2 フロントエンド: `src/api/documents.ts` に文書一覧取得 API を追加する
- [ ] 1.4.3 フロントエンド: `src/hooks/useDocuments.ts` に一覧取得用カスタムフックを追加する
- [ ] 1.4.4 フロントエンド: `src/components/DocumentTable.tsx` に文書一覧テーブルを実装する
- [ ] 1.4.5 フロントエンド: `src/pages/DocumentListPage.tsx` に文書一覧画面を実装する

---

## Phase 2 — 文書処理パイプライン

### 2.1 テキスト抽出

- [ ] 2.1.1 `app/utils/text_extractor.py` に PDF テキスト抽出を実装する（pymupdf、ページ単位）
- [ ] 2.1.2 `app/utils/text_extractor.py` に TXT テキスト抽出を実装する
- [ ] 2.1.3 `app/utils/text_extractor.py` に Markdown テキスト抽出を実装する（markdown + beautifulsoup4）
- [ ] 2.1.4 ファイル形式に応じた抽出関数のディスパッチを実装する

### 2.2 チャンク分割

- [ ] 2.2.1 `app/utils/chunker.py` にチャンク分割ロジックを実装する（512 トークン目安、128 オーバーラップ）
- [ ] 2.2.2 段落・改行を優先的に分割点として利用するロジックを実装する
- [ ] 2.2.3 PDF のページ境界を考慮したチャンク分割を実装する

### 2.3 Embedding 生成

- [ ] 2.3.1 `app/clients/bedrock_client.py` に BedrockClient を実装する
- [ ] 2.3.2 Embedding 生成メソッドを実装する（Titan Embeddings V2、1024 次元）

### 2.4 OpenSearch インデックス登録

- [ ] 2.4.1 `app/clients/opensearch_client.py` に OpenSearchClient を実装する
- [ ] 2.4.2 `rag-documents` インデックスの作成処理を実装する（k-NN 有効、マッピング定義）
- [ ] 2.4.3 チャンクドキュメントの一括登録（bulk index）を実装する

### 2.5 パイプライン統合

- [ ] 2.5.1 `app/services/pipeline_service.py` に PipelineService を実装する（テキスト抽出 → チャンク分割 → Embedding → OpenSearch 登録）
- [ ] 2.5.2 アップロード後に自動でパイプラインを実行し、文書状態を遷移させる（uploaded → processing → indexed / failed）

---

## Phase 3 — 検索・チャット

### 3.1 検索 API

- [ ] 3.1.1 `app/schemas/search.py` に検索リクエスト・レスポンススキーマを定義する
- [ ] 3.1.2 `app/services/search_service.py` に SearchService を実装する（クエリ Embedding 化 → k-NN 検索）
- [ ] 3.1.3 `app/routers/search.py` に `POST /search` エンドポイントを実装する

### 3.2 チャット API

- [ ] 3.2.1 `app/schemas/chat.py` にチャットリクエスト・レスポンススキーマを定義する（引用元情報含む）
- [ ] 3.2.2 `app/services/chat_service.py` に ChatService を実装する（検索 → コンテキスト構築 → Bedrock LLM 問い合わせ → 引用元付き回答返却）
- [ ] 3.2.3 BedrockClient に LLM 呼び出しメソッドを追加する（Claude 3.5 Sonnet）
- [ ] 3.2.4 `app/routers/chat.py` に `POST /chat` エンドポイントを実装する

### 3.3 検索・チャット UI

- [ ] 3.3.1 フロントエンド: `src/api/search.ts` に検索 API クライアントを実装する
- [ ] 3.3.2 フロントエンド: `src/api/chat.ts` にチャット API クライアントを実装する
- [ ] 3.3.3 フロントエンド: `src/hooks/useSearch.ts` に検索用カスタムフックを実装する
- [ ] 3.3.4 フロントエンド: `src/hooks/useChat.ts` にチャット用カスタムフックを実装する
- [ ] 3.3.5 フロントエンド: `src/components/ChatMessage.tsx` にチャットメッセージコンポーネントを実装する
- [ ] 3.3.6 フロントエンド: `src/components/CitationCard.tsx` に引用元カードコンポーネントを実装する
- [ ] 3.3.7 フロントエンド: `src/pages/SearchChatPage.tsx` に検索・チャット画面を実装する

---

## Phase 4 — 管理・改善

### 4.1 文書削除

- [ ] 4.1.1 OpenSearchClient にドキュメント ID 指定の一括削除メソッドを追加する
- [ ] 4.1.2 DocumentService に文書削除ロジックを実装する（メタデータ + S3 + OpenSearch）
- [ ] 4.1.3 `app/routers/documents.py` に `DELETE /documents/{document_id}` エンドポイントを実装する
- [ ] 4.1.4 フロントエンド: DocumentTable に削除ボタン・確認ダイアログを追加する
- [ ] 4.1.5 フロントエンド: useDocuments に削除用ミューテーションを追加する

### 4.2 再インデックス

- [ ] 4.2.1 PipelineService に再インデックスロジックを実装する（既存チャンク削除 → 再処理）
- [ ] 4.2.2 `app/routers/documents.py` に `POST /documents/{document_id}/reindex` エンドポイントを実装する
- [ ] 4.2.3 フロントエンド: DocumentTable に再インデックスボタンを追加する
- [ ] 4.2.4 フロントエンド: useDocuments に再インデックス用ミューテーションを追加する

### 4.3 エラーハンドリング改善

- [ ] 4.3.1 バックエンド: 共通エラーハンドラーを実装する（HTTPException の統一フォーマット）
- [ ] 4.3.2 バックエンド: パイプライン処理の失敗時に文書状態を `failed` に遷移させ、エラー内容を記録する
- [ ] 4.3.3 フロントエンド: API エラー時の通知表示を実装する（Mantine Notifications）
- [ ] 4.3.4 フロントエンド: アップロード・削除・再インデックスのローディング状態を表示する
