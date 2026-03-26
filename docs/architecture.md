# アーキテクチャ

## 全体構成

```
.
├── client/                     # フロントエンド (React + Mantine + Vite)
├── server/                     # バックエンド (FastAPI)
├── docs/                       # プロジェクトドキュメント
├── docker-compose.yml          # OpenSearch ローカル起動用
└── .kiro/
    └── steering/               # プロジェクトガイドライン
```

## バックエンド — レイヤードアーキテクチャ

### レイヤー間の依存関係

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

### 各レイヤーの責務

| レイヤー | ディレクトリ | 責務 |
|----------|-------------|------|
| Routers | `app/routers/` | HTTP の入出力、リクエスト検証、レスポンス整形 |
| Schemas | `app/schemas/` | リクエスト・レスポンスの Pydantic モデル定義 |
| Services | `app/services/` | アプリケーションロジック、ワークフロー制御 |
| Repositories | `app/repositories/` | 文書メタデータの永続化（PoC: インメモリ） |
| Clients | `app/clients/` | 外部サービス（S3 / Bedrock / OpenSearch）との接続 |
| Models | `app/models/` | ドメインモデル、内部表現 |
| Core | `app/core/` | 設定値、共通処理 |
| Utils | `app/utils/` | ステートレスな汎用ユーティリティ |

### 設計方針

- Router に業務ロジックや外部接続を直接書かない
- 外部サービス接続は `clients/` に隔離し、差し替え・モック化を容易にする
- `repositories/` は PoC ではインメモリ実装、将来的に DB 実装に差し替え可能
- `utils/` はステートレスな汎用処理のみ配置

### ディレクトリ構成

```
server/
├── main.py
├── app/
│   ├── core/
│   │   └── config.py
│   ├── models/
│   │   └── document.py
│   ├── schemas/
│   │   ├── document.py
│   │   ├── search.py
│   │   └── chat.py
│   ├── routers/
│   │   ├── documents.py
│   │   ├── search.py
│   │   └── chat.py
│   ├── services/
│   │   ├── document_service.py
│   │   ├── pipeline_service.py
│   │   ├── search_service.py
│   │   └── chat_service.py
│   ├── repositories/
│   │   └── document_repository.py
│   ├── clients/
│   │   ├── s3_client.py
│   │   ├── bedrock_client.py
│   │   └── opensearch_client.py
│   └── utils/
│       ├── text_extractor.py
│       └── chunker.py
└── tests/
    ├── test_services/
    ├── test_routers/
    └── test_utils/
```

## フロントエンド構成

### 設計方針

- ページ単位でコンポーネントを分割し `pages/` に配置
- API 呼び出しは `api/` に集約し、`hooks/` から TanStack Query 経由で利用
- 共通 UI パーツは `components/` に配置
- 型定義は `types/` に集約
- Mantine テーマカスタマイズは `theme/` で管理

### ディレクトリ構成

```
client/src/
├── main.tsx
├── App.tsx
├── api/
│   ├── client.ts
│   ├── documents.ts
│   ├── search.ts
│   └── chat.ts
├── pages/
│   ├── UploadPage.tsx
│   ├── DocumentListPage.tsx
│   └── SearchChatPage.tsx
├── components/
│   ├── DocumentTable.tsx
│   ├── FileDropzone.tsx
│   ├── ChatMessage.tsx
│   ├── CitationCard.tsx
│   └── Layout.tsx
├── hooks/
│   ├── useDocuments.ts
│   ├── useSearch.ts
│   └── useChat.ts
├── types/
│   └── index.ts
└── theme/
    └── index.ts
```

## Docker Compose（ローカル開発）

```yaml
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
