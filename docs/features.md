# 機能一覧

## 実装状況

| # | 機能 | 状態 | Phase | 備考 |
|---|------|------|-------|------|
| 1 | 文書アップロード | ✅ 実装済み | Phase 1 | multipart/form-data で受信、S3 に保存 |
| 2 | 文書一覧表示 | ✅ 実装済み | Phase 1 | メタデータ一覧取得 |
| 3 | テキスト抽出 | ✅ 実装済み | Phase 2 | PDF (pymupdf) / TXT / Markdown |
| 4 | チャンク分割 | ✅ 実装済み | Phase 2 | 1500 文字目安（≈512 token）、300 文字オーバーラップ |
| 5 | Embedding 生成 | ✅ 実装済み | Phase 2 | Bedrock Titan Embeddings V2 (1024 次元) |
| 6 | OpenSearch インデックス登録 | ✅ 実装済み | Phase 2 | k-NN ベクトルインデックス (HNSW + cosinesimil) |
| 7 | 文書検索 | ✅ 実装済み | Phase 3 | セマンティック検索 |
| 8 | チャット質問応答 | ✅ 実装済み | Phase 3 | RAG: 検索 + Bedrock Claude 3.5 Sonnet 回答生成 |
| 9 | 引用元表示 | ✅ 実装済み | Phase 3 | 文書名・抜粋・ページ情報（折りたたみ表示） |
| 10 | 文書削除 | ✅ 実装済み | Phase 4 | S3 + OpenSearch から削除 |
| 11 | 再インデックス | ✅ 実装済み | Phase 4 | 既存文書を再処理 |

## API エンドポイント

| メソッド | パス | 概要 | Phase |
|----------|------|------|-------|
| POST | `/documents/upload` | 文書アップロード（multipart/form-data） | Phase 1 |
| GET | `/documents` | 文書一覧取得 | Phase 1 |
| DELETE | `/documents/{document_id}` | 文書削除（S3 + OpenSearch） | Phase 4 |
| POST | `/documents/{document_id}/reindex` | 再インデックス | Phase 4 |
| POST | `/search` | 自然言語検索（ベクトル検索） | Phase 3 |
| POST | `/chat` | チャット形式の質問応答 | Phase 3 |

## 画面一覧

### 1. Document Upload（文書アップロード画面）
- ファイル選択・ドラッグ&ドロップによるアップロード
- 対応形式: PDF / TXT / Markdown
- アップロード結果（成功・失敗）の通知表示

### 2. Document List（文書一覧画面）
- 登録済み文書のテーブル表示
- 文書状態（uploaded / processing / indexed / failed）のバッジ表示
- 文書ごとの削除・再インデックスアクション
- 処理中文書は 3 秒ごとに自動ポーリング

### 3. Search / Chat（検索・チャット画面）
- タブ切り替えによるセマンティック検索と RAG チャットの切り替え
- 自然言語による検索クエリ入力
- チャット形式の質問応答 UI（スクロールエリア）
- 回答本文の表示
- 引用元カード（文書名・抜粋・ページ情報・スコア）の折りたたみ表示

## 文書処理パイプライン

```
Upload → S3 保存 → テキスト抽出 → チャンク分割 → Embedding 生成 → OpenSearch 登録
                                                                         │
                                                              status: indexed
```
