---
inclusion: always
---

# ディレクトリ構成 — RAG ドキュメント検索システム

## 全体構成

```
.
├── client/                     # フロントエンド (React + Mantine + Vite)
├── server/                     # バックエンド (FastAPI)
├── docker-compose.yml          # OpenSearch ローカル起動用
└── .kiro/
    └── steering/               # プロジェクトガイドライン
```

## フロントエンド構成

```
client/src/
├── main.tsx                    # エントリーポイント
├── App.tsx                     # ルーティング定義
├── api/                        # API クライアント
│   ├── client.ts               # axios インスタンス
│   ├── documents.ts            # 文書関連 API
│   ├── search.ts               # 検索 API
│   └── chat.ts                 # チャット API
├── pages/                      # ページコンポーネント
│   ├── UploadPage.tsx          # 文書アップロード画面
│   ├── DocumentListPage.tsx    # 文書一覧画面
│   └── SearchChatPage.tsx      # 検索・チャット画面
├── components/                 # 共通コンポーネント
│   ├── DocumentTable.tsx       # 文書一覧テーブル
│   ├── FileDropzone.tsx        # ファイルドロップゾーン
│   ├── ChatMessage.tsx         # チャットメッセージ
│   ├── CitationCard.tsx        # 引用元カード
│   └── Layout.tsx              # 共通レイアウト（ナビゲーション含む）
├── hooks/                      # カスタムフック
│   ├── useDocuments.ts         # 文書 CRUD
│   ├── useSearch.ts            # 検索
│   └── useChat.ts              # チャット
├── types/                      # 型定義
│   └── index.ts                # 共通型（Document, ChatMessage, Citation 等）
└── theme/                      # Mantine テーマ設定
    └── index.ts
```

### フロントエンド設計方針

- ページ単位でコンポーネントを分割し、`pages/` に配置
- API 呼び出しは `api/` に集約し、`hooks/` から TanStack Query 経由で利用
- 共通 UI パーツは `components/` に配置
- 型定義は `types/` に集約
- Mantine テーマカスタマイズは `theme/` で管理

## バックエンド構成

```
server/
├── main.py                     # FastAPI アプリケーション起動
├── app/
│   ├── __init__.py
│   ├── core/                   # 設定・共通処理
│   │   ├── __init__.py
│   │   └── config.py           # 環境変数・設定値
│   ├── models/                 # ドメインモデル・内部表現
│   │   ├── __init__.py
│   │   └── document.py         # Document, Chunk, DocumentStatus
│   ├── schemas/                # リクエスト・レスポンス定義
│   │   ├── __init__.py
│   │   ├── document.py         # 文書関連スキーマ
│   │   ├── search.py           # 検索スキーマ
│   │   └── chat.py             # チャットスキーマ
│   ├── routers/                # HTTP エンドポイント
│   │   ├── __init__.py
│   │   ├── documents.py        # /documents/*
│   │   ├── search.py           # /search
│   │   └── chat.py             # /chat
│   ├── services/               # アプリケーションロジック
│   │   ├── __init__.py
│   │   ├── document_service.py # 文書管理ロジック
│   │   ├── pipeline_service.py # テキスト抽出→チャンク→Embedding→登録
│   │   ├── search_service.py   # 検索ロジック
│   │   └── chat_service.py     # チャット・RAG ロジック
│   ├── repositories/           # データアクセス層
│   │   ├── __init__.py
│   │   └── document_repository.py  # 文書メタデータ管理（PoC: インメモリ）
│   ├── clients/                # 外部サービス接続
│   │   ├── __init__.py
│   │   ├── s3_client.py        # AWS S3 操作
│   │   ├── bedrock_client.py   # AWS Bedrock (LLM / Embedding)
│   │   └── opensearch_client.py # OpenSearch 操作
│   └── utils/                  # 汎用ユーティリティ
│       ├── __init__.py
│       ├── text_extractor.py   # PDF / TXT / MD テキスト抽出
│       └── chunker.py          # チャンク分割
├── tests/                      # テスト
│   ├── __init__.py
│   ├── test_services/
│   ├── test_routers/
│   └── test_utils/
├── pyproject.toml
└── uv.lock
```

### バックエンド設計方針

- 責務を明確に分離したレイヤードアーキテクチャ
- `routers` → `services` → `repositories` / `clients` の依存方向
- 外部サービス接続は `clients/` に隔離し、差し替え・モック化を容易にする
- `repositories/` は PoC ではインメモリ実装、将来的に DB 実装に差し替え可能
- `utils/` はステートレスな汎用処理のみ配置
- router に業務ロジックや外部接続を直接書かない

## Docker Compose 構成

```yaml
# docker-compose.yml
services:
  opensearch:
    image: opensearchproject/opensearch:2
    environment:
      - discovery.type=single-node
      - DISABLE_SECURITY_PLUGIN=true
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=Admin_1234
    ports:
      - "9200:9200"
      - "9600:9600"
    volumes:
      - opensearch-data:/usr/share/opensearch/data

volumes:
  opensearch-data:
```

- ローカル開発ではセキュリティプラグインを無効化
- シングルノード構成
- データはボリュームで永続化

## レイヤー間の依存関係

```
Router (HTTP I/O)
  │
  ▼
Service (ビジネスロジック)
  │
  ├──▶ Repository (メタデータ管理)
  ├──▶ Client (S3 / Bedrock / OpenSearch)
  └──▶ Utils (テキスト抽出 / チャンク分割)
```

- Router は Service のみに依存
- Service は Repository, Client, Utils に依存
- Repository, Client, Utils は互いに依存しない
