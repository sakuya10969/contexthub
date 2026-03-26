---
inclusion: always
---

# 技術選定・システム構成 — RAG ドキュメント検索システム

## 技術スタック

| レイヤー | 技術 | バージョン目安 | 選定理由 |
|----------|------|---------------|----------|
| フロントエンド | React | 19.x | コンポーネント指向、エコシステムの成熟度 |
| UI ライブラリ | Mantine | 8.x | 高品質コンポーネント群、TypeScript ファースト、テーマカスタマイズ容易 |
| ビルドツール | Vite | 8.x | 高速 HMR、ESM ネイティブ |
| 状態管理 | TanStack Query | 5.x | サーバー状態管理に特化、キャッシュ・再取得が宣言的 |
| バックエンド | FastAPI | 0.115+ | 非同期対応、型安全、自動 OpenAPI ドキュメント生成 |
| Python ランタイム | Python | 3.12+ | 最新の型ヒント・パフォーマンス改善 |
| パッケージ管理 | uv | latest | 高速な依存解決、lockfile サポート |
| 文書保存 | AWS S3 | — | スケーラブルなオブジェクトストレージ |
| LLM / Embedding | AWS Bedrock | — | マネージド LLM、Embedding モデル利用可能 |
| 検索基盤 | OpenSearch | 2.x | k-NN ベクトル検索対応、全文検索との併用可能 |
| コンテナ | Docker Compose | — | ローカル開発での OpenSearch 起動用 |

## Bedrock モデル

| 用途 | モデル | モデル ID |
|------|--------|----------|
| Embedding | Amazon Titan Embeddings V2 | `amazon.titan-embed-text-v2:0` |
| LLM (回答生成) | Claude 3.5 Sonnet | `anthropic.claude-3-5-sonnet-20241022-v2:0` |

Embedding の次元数: 1024（Titan Embeddings V2 デフォルト）

## API 一覧

| メソッド | パス | 概要 |
|----------|------|------|
| POST | `/documents/upload` | 文書アップロード（multipart/form-data） |
| GET | `/documents` | 文書一覧取得 |
| DELETE | `/documents/{document_id}` | 文書削除（S3 + OpenSearch） |
| POST | `/documents/{document_id}/reindex` | 再インデックス |
| POST | `/search` | 自然言語検索（ベクトル検索） |
| POST | `/chat` | チャット形式の質問応答 |

## データモデル

### 文書メタデータ（バックエンド内部管理）

```python
class Document:
    document_id: str        # UUID
    file_name: str          # 元ファイル名
    s3_key: str             # S3 オブジェクトキー
    file_type: str          # pdf / txt / md
    status: str             # uploaded / processing / indexed / failed
    created_at: datetime
    updated_at: datetime
```

PoC ではインメモリ辞書で管理し、将来的に DB（DynamoDB / PostgreSQL）へ移行可能な repository 層で抽象化する。

### OpenSearch チャンクドキュメント

```json
{
  "document_id": "uuid",
  "chunk_id": "uuid",
  "file_name": "example.pdf",
  "content": "チャンクのテキスト内容",
  "embedding": [0.012, -0.034, ...],
  "page_number": 1,
  "chunk_index": 0,
  "created_at": "2026-03-26T00:00:00Z"
}
```

## OpenSearch インデックス設計

インデックス名: `rag-documents`

```json
{
  "settings": {
    "index": {
      "knn": true,
      "number_of_shards": 1,
      "number_of_replicas": 0
    }
  },
  "mappings": {
    "properties": {
      "document_id": { "type": "keyword" },
      "chunk_id": { "type": "keyword" },
      "file_name": { "type": "keyword" },
      "content": { "type": "text", "analyzer": "standard" },
      "embedding": {
        "type": "knn_vector",
        "dimension": 1024,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "nmslib"
        }
      },
      "page_number": { "type": "integer" },
      "chunk_index": { "type": "integer" },
      "created_at": { "type": "date" }
    }
  }
}
```

## ローカル開発構成

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React App  │────▶│  FastAPI     │────▶│  OpenSearch     │
│  localhost:  │     │  localhost:  │     │  (Docker)       │
│  5173       │     │  8000        │     │  localhost:9200  │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────┴───────┐
                    │  AWS S3      │
                    │  (dev bucket)│
                    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │  AWS Bedrock │
                    │  (LLM/Embed) │
                    └──────────────┘
```

- フロントエンド: `pnpm dev` でローカル起動
- バックエンド: `uv run fastapi dev` でローカル起動
- OpenSearch: `docker compose up` で起動
- S3 / Bedrock: AWS 開発環境を直接利用

## 文書処理パイプライン

```
Upload → S3 保存 → テキスト抽出 → チャンク分割 → Embedding 生成 → OpenSearch 登録
                                                                         │
                                                              status: indexed
```

### テキスト抽出

| ファイル形式 | ライブラリ |
|-------------|-----------|
| PDF | `pymupdf` (PyMuPDF) — ページ単位抽出、高速 |
| TXT | 標準ライブラリ（`open()` で読み込み） |
| Markdown | `markdown` + `beautifulsoup4` でプレーンテキスト化 |

### チャンク分割戦略

- 固定長分割: 512 トークン目安、128 トークンのオーバーラップ
- 区切り: 段落・改行を優先的に分割点として利用
- PDF はページ境界も考慮

## 検索・回答フロー

### 検索 (POST /search)
1. クエリテキストを Bedrock Embedding でベクトル化
2. OpenSearch に k-NN 検索を実行（上位 k 件取得）
3. スコア付きチャンク一覧を返却

### チャット (POST /chat)
1. クエリテキストを Bedrock Embedding でベクトル化
2. OpenSearch に k-NN 検索を実行（上位 k 件取得）
3. 取得チャンクをコンテキストとして Bedrock LLM に送信
4. LLM の回答 + 引用元チャンク情報を返却

## 主要 Python 依存パッケージ（追加予定）

```
fastapi[standard]
boto3              # AWS SDK (S3, Bedrock)
opensearch-py      # OpenSearch クライアント
pymupdf            # PDF テキスト抽出
markdown           # Markdown → HTML
beautifulsoup4     # HTML → プレーンテキスト
python-multipart   # ファイルアップロード
```

## 主要 npm パッケージ（追加予定）

```
@tanstack/react-query    # サーバー状態管理
@mantine/dropzone        # ファイルアップロード UI
react-router             # ルーティング
axios                    # HTTP クライアント
```
