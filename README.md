# ゲーム集計アプリ

イベントごとにチームとスコアを管理し、ランキングや結果画像を生成できる Web アプリケーションです。

## 機能

- **イベント管理** — イベントの作成・一覧表示・削除
- **チーム管理** — チームメンバーの登録・チーム画像のアップロード
- **スコア登録** — ゲームごとのチームスコアを入力
- **ランキング表示** — 合計スコアによる自動ランキング算出（同点は同順位）
- **結果画像の生成** — 結果をカード形式の画像として出力
- **ユーザー管理** — ログイン認証・マイページ編集（管理者はユーザー一覧を参照可能）

## 技術スタック

| カテゴリ | 使用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | MUI (Material UI) v7 / Tailwind CSS v4 |
| バックエンド | Supabase (PostgreSQL) |
| 認証 | bcryptjs + jose (JWT) |
| 画像生成 | html-to-image |
| デプロイ | Vercel |

## 環境構築

### 前提条件

- Node.js 20 以上
- Supabase プロジェクト（テーブルの作成が必要）

### セットアップ

1. リポジトリをクローン

```bash
git clone <repository-url>
cd game-totalling-app
```

2. 依存パッケージをインストール

```bash
npm install
```

3. 環境変数を設定

`.env.local` を作成し、以下の変数を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 主要ページ

| パス | 説明 |
|---|---|
| `/login` | ログイン画面 |
| `/top` | イベント一覧 |
| `/event/Regist` | イベント登録 |
| `/event/[id]/score` | スコア一覧・ランキング・結果画像 |
| `/event/[id]/score/[gameId]/regist` | スコア入力 |
| `/event/[id]/team/regist` | チーム登録 |
| `/users` | ユーザー管理（管理者のみ） |
| `/users/[id]/edit` | マイページ |

## スクリプト

```bash
npm run dev    # 開発サーバー起動
npm run build  # プロダクションビルド
npm run start  # プロダクションサーバー起動
npm run lint   # ESLint 実行
```
