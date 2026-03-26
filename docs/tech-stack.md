# 技術スタック

## 一覧

| レイヤー | 技術 | バージョン目安 | 選定理由 |
|----------|------|---------------|----------|
| フロントエンド | React | 19.x | コンポーネント指向、エコシステムの成熟度 |
| UI ライブラリ | Mantine | 8.x | 高品質コンポーネント群、TypeScript ファースト、テーマカスタマイズ容易 |
| ビルドツール | Vite | 8.x | 高速 HMR、ESM ネイティブ |
| 状態管理 | TanStack Query | 5.x | サーバー状態管理に特化、キャッシュ・再取得が宣言的 |
| バックエンド | FastAPI | 0.115+ | 非同期対応、型安全、自動 OpenAPI ドキュメント生成 |
| Python ランタイム | Python | 3.12+ | 最新の型ヒント・パフォーマンス改善 |
| パッケージ管理 (Python) | uv | latest | 高速な依存解決、lockfile サポート |
| パッケージ管理 (Node) | pnpm | latest | 高速、ディスク効率の良い依存管理 |
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

## Python 依存パッケージ（追加予定）

| パッケージ | 用途 |
|-----------|------|
| `fastapi[standard]` | Web フレームワーク |
| `boto3` | AWS SDK（S3, Bedrock） |
| `opensearch-py` | OpenSearch クライアント |
| `pymupdf` | PDF テキスト抽出 |
| `markdown` | Markdown → HTML 変換 |
| `beautifulsoup4` | HTML → プレーンテキスト化 |
| `python-multipart` | ファイルアップロード |

## npm パッケージ（追加予定）

| パッケージ | 用途 |
|-----------|------|
| `@tanstack/react-query` | サーバー状態管理 |
| `@mantine/dropzone` | ファイルアップロード UI |
| `react-router` | ルーティング |
| `axios` | HTTP クライアント |

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
