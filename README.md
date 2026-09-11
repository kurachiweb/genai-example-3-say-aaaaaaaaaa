# Say aaaaaaaaaa

シンプルでバイラルな匿名掲示板。アカウントも、プロフィール入力も、管理画面も、詳細ページも、課金も、何も無い。ただメッセージを投稿するだけの単一ページサービス。

公開URL: https://say-aaaaaaaaaa.kurachiweb.com

## 仕様

- メッセージは、同じ文字（アルファベット・漢字・ひらがな・カタカナ・ハングル）が10文字以上連続していないと投稿できない
- メッセージの文字数は最大500文字
- 投稿操作には1分に10回までのレート制限（IPアドレス単位）
- 投稿済みメッセージの10文字以上連続している部分は太字・32pxで表示
- 投稿済みメッセージ一覧は20件ずつ、無限スクロールで表示

## 技術スタック

- [Hono](https://hono.dev/) — APIルーティング
- [Inversify](https://inversify.io/) — DIコンテナ
- [React](https://react.dev/) + [Vite](https://vite.dev/) — フロントエンド
- TypeScript / [Tailwind CSS v4](https://tailwindcss.com/) / [shadcn/ui](https://ui.shadcn.com/)
- [Zod](https://zod.dev/) — バリデーション
- ESLint + Prettier（`eslint-config-prettier`でフォーマットとlintを分離）
- Husky + lint-staged（`pre-commit`フック）
- [Betterleaks](https://betterleaks.com/)（シークレット検出、`pre-commit`フック内で`betterleaks git --staged`を実行）
- Cloudflare Workers（[@cloudflare/vite-plugin](https://developers.cloudflare.com/workers/vite-plugin/)で単一Workerに静的アセットとAPIを統合）
- Cloudflare Durable Objects（SQLiteストレージ。メッセージ保存とレート制限カウンタを保持する`BoardDurableObject`をグローバルに1つ使用）

## ディレクトリ構成

```
src/
  react-app/   # フロントエンド（Vite + React）
  worker/      # バックエンド（Hono + Inversify + Durable Object）
  shared/      # フロント/バック共通のバリデーション・型定義
```

## ローカル開発

### 必要なもの

- Node.js 22以降
- [Betterleaks](https://github.com/betterleaks/betterleaks)（`brew install betterleaks`。コミット前フックで使用するため事前にインストールしておく）

### セットアップ

```sh
npm install
```

初回`npm install`時に`prepare`スクリプトでHuskyのgit hooksが有効化される。

### 開発サーバー起動

```sh
npm run dev
```

`@cloudflare/vite-plugin`により、フロントエンドのHMRとHono API・Durable Objectが同一のworkerdランタイム上でまとめて起動する。

### その他コマンド

```sh
npm run typecheck  # tsc -b（フロント/ワーカー/設定ファイルそれぞれのtsconfigで型チェック）
npm run lint       # ESLint
npm run format     # Prettier
npm run build      # 型チェック + 本番ビルド（dist/client, dist/<worker名>を生成）
npm run check      # 型チェック + ビルド + wrangler deploy --dry-run
```

Cloudflareの型定義（`worker-configuration.d.ts`）は`wrangler.jsonc`のbindingsを変更した際に再生成する。

```sh
npm run cf-typegen
```

## デプロイ

### 初回のみ

1. Cloudflareアカウントにログインする

   ```sh
   npx wrangler login
   ```

2. 本番URL（`say-aaaaaaaaaa.kurachiweb.com`）を配信するには、`kurachiweb.com`がそのCloudflareアカウントのゾーンとして登録されている必要がある。未登録の場合は`wrangler.jsonc`の`routes`を削除するか、実際のドメインに書き換える。

### デプロイ実行

```sh
npm run deploy
```

`vite build`でフロントエンドと動作確認用のワーカービルドを生成した後、`wrangler deploy`でCloudflare Workersへ本番デプロイする。`wrangler.jsonc`の`migrations`により、初回デプロイ時に`BoardDurableObject`用のSQLiteストレージが作成される。

デプロイ前に問題がないか確認したい場合は、実際にデプロイせず検証だけ行う`--dry-run`付きのチェックコマンドが使える。

```sh
npm run check
```

### 本番前チェックリスト

- [ ] `wrangler.jsonc`の`compatibility_date`を最新化しているか
- [ ] `wrangler.jsonc`の`routes`が実際に使うドメインになっているか（`kurachiweb.com`以外で使う場合は書き換えが必要）
- [ ] `npm run check`が通るか

## Git hooks

`pre-commit`フックで以下を実行する。

1. `lint-staged`（ステージ済みファイルにPrettier/ESLintを適用）
2. `betterleaks git --staged`（ステージ済みの変更にシークレットが含まれていないか検出）
