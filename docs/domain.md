# ドメインモデル

## エンティティ

### Document（文書）

システムが管理する文書の単位。アップロードされたファイル1つに対して1つの Document が生成される。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `document_id` | `str (UUID)` | 文書の一意識別子 |
| `file_name` | `str` | アップロード時の元ファイル名 |
| `s3_key` | `str` | S3 上のオブジェクトキー |
| `file_type` | `str` | ファイル種別（`pdf` / `txt` / `md`） |
| `status` | `DocumentStatus` | 文書の処理状態 |
| `created_at` | `datetime` | 作成日時 |
| `updated_at` | `datetime` | 最終更新日時 |

### DocumentStatus（文書状態）

```
uploaded → processing → indexed
                    └→ failed
```

| 値 | 説明 |
|----|------|
| `uploaded` | S3 にアップロード済み、未処理 |
| `processing` | テキスト抽出〜インデックス登録の処理中 |
| `indexed` | OpenSearch へのインデックス登録完了 |
| `failed` | 処理中にエラーが発生 |

### Chunk（チャンク）

文書から抽出・分割されたテキスト断片。OpenSearch に格納される検索単位。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `document_id` | `str (UUID)` | 所属する文書の ID |
| `chunk_id` | `str (UUID)` | チャンクの一意識別子 |
| `file_name` | `str` | 元ファイル名（検索結果表示用） |
| `content` | `str` | チャンクのテキスト内容 |
| `embedding` | `list[float]` | Embedding ベクトル（1024 次元） |
| `page_number` | `int` | 元文書でのページ番号（PDF の場合） |
| `chunk_index` | `int` | 文書内でのチャンク順序 |
| `created_at` | `datetime` | 作成日時 |

## OpenSearch インデックス

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

## サービス層

### DocumentService
- 文書メタデータの CRUD 操作
- 文書状態の管理・遷移

### PipelineService
- 文書処理パイプラインの実行制御
- テキスト抽出 → チャンク分割 → Embedding 生成 → OpenSearch 登録

### SearchService
- クエリの Embedding 化
- OpenSearch への k-NN 検索実行
- スコア付きチャンク一覧の返却

### ChatService
- SearchService を利用した関連チャンク取得
- Bedrock LLM へのプロンプト構築・問い合わせ
- 回答テキスト + 引用元情報の返却

## クライアント層（外部サービス接続）

### S3Client
- ファイルのアップロード・ダウンロード・削除

### BedrockClient
- Embedding 生成（Titan Embeddings V2）
- LLM 呼び出し（Claude 3.5 Sonnet）

### OpenSearchClient
- インデックスの作成・削除
- チャンクドキュメントの登録・削除
- k-NN ベクトル検索の実行

## リポジトリ層

### DocumentRepository
- 文書メタデータの永続化
- PoC ではインメモリ辞書で実装
- 将来的に DynamoDB / PostgreSQL へ差し替え可能
