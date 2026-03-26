# RAG ドキュメント検索システム

文書をアップロードし、自然言語検索およびチャット形式の質問応答ができる RAG（Retrieval-Augmented Generation）システムです。
回答時には引用元（文書名・抜粋・ページ情報）を確認でき、検索根拠が分かる UI を備えています。

## 主な機能

- 文書アップロード（PDF / TXT / Markdown）→ S3 保存
- テキスト抽出 → チャンク分割 → Embedding 生成 → OpenSearch インデックス登録
- 自然言語によるセマンティック検索
- チャット形式の質問応答（RAG）と引用元表示
- 文書一覧・削除・再インデックス

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 19 + Mantine 8 + Vite + TanStack Query |
| バックエンド | FastAPI (Python 3.12+) |
| 文書保存 | AWS S3 |
| LLM / Embedding | AWS Bedrock (Claude 3.5 Sonnet / Titan Embeddings V2) |
| 検索基盤 | OpenSearch 2.x (k-NN ベクトル検索) |
| パッケージ管理 | uv (Python) / pnpm (Node) |

## アーキテクチャ

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React App  │────▶│  FastAPI     │────▶│  OpenSearch     │
│  :5173      │     │  :8000       │     │  (Docker) :9200 │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────┴───────┐
                    │  AWS S3      │
                    │  AWS Bedrock │
                    └──────────────┘
```

## セットアップ

### 前提条件

- Node.js + pnpm
- Python 3.12+ + [uv](https://docs.astral.sh/uv/)
- Docker / Docker Compose
- AWS 認証情報（S3 / Bedrock へのアクセス権限）

### 1. OpenSearch 起動

```bash
docker compose up -d
```

### 2. バックエンド

```bash
# 環境変数を設定
cp server/.env.example server/.env  # 必要に応じて編集

# 依存パッケージのインストール & 起動
cd server
uv sync
uv run fastapi dev
```

`server/.env` に以下を設定してください:

```
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_DEFAULT_REGION=ap-northeast-1
AWS_S3_BUCKET=<your-s3-bucket>
OPENSEARCH_URL=http://localhost:9200
```

### 3. フロントエンド

```bash
cd client
pnpm install
pnpm dev
```

`client/.env`:

```
VITE_API_URL=http://localhost:8000
```

### アクセス

- フロントエンド: http://localhost:5173
- バックエンド API: http://localhost:8000
- OpenSearch: http://localhost:9200

## API エンドポイント

| メソッド | パス | 概要 |
|----------|------|------|
| POST | `/documents/upload` | 文書アップロード |
| GET | `/documents` | 文書一覧取得 |
| DELETE | `/documents/{document_id}` | 文書削除 |
| POST | `/documents/{document_id}/reindex` | 再インデックス |
| POST | `/search` | セマンティック検索 |
| POST | `/chat` | チャット質問応答 |

詳細は [docs/api.md](./docs/api.md) を参照してください。

## プロジェクト構成

```
.
├── client/                  # フロントエンド (React + Mantine + Vite)
│   └── src/
│       ├── api/             # API クライアント
│       ├── components/      # 共通コンポーネント
│       ├── hooks/           # カスタムフック (TanStack Query)
│       ├── pages/           # ページコンポーネント
│       ├── types/           # 型定義
│       └── theme/           # Mantine テーマ設定
├── server/                  # バックエンド (FastAPI)
│   └── app/
│       ├── routers/         # HTTP エンドポイント
│       ├── services/        # ビジネスロジック
│       ├── repositories/    # データアクセス層 (インメモリ)
│       ├── clients/         # 外部サービス接続 (S3/Bedrock/OpenSearch)
│       ├── models/          # ドメインモデル
│       ├── schemas/         # リクエスト・レスポンス定義
│       ├── utils/           # テキスト抽出・チャンク分割
│       └── core/            # 設定
├── docs/                    # プロジェクトドキュメント
└── docker-compose.yml       # OpenSearch ローカル起動用
```

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/project-overview.md](./docs/project-overview.md) | プロジェクト概要・ユースケース・実装フェーズ |
| [docs/tech-stack.md](./docs/tech-stack.md) | 技術スタック・依存パッケージ |
| [docs/architecture.md](./docs/architecture.md) | アーキテクチャ・ディレクトリ構成 |
| [docs/features.md](./docs/features.md) | 機能一覧・実装状況 |
| [docs/domain.md](./docs/domain.md) | ドメインモデル・データモデル |
| [docs/api.md](./docs/api.md) | API エンドポイント詳細 |
| [docs/tasks.md](./docs/tasks.md) | 実装タスク一覧 |
