# シンプルでバイラルな匿名掲示板「Say aaaaaaaaaa」

公開URL：https://say-aaaaaaaaaa.kurachiweb.com

## このサービスについて

匿名でメッセージを投稿する単一ページの掲示板サイト。
アカウントも、プロフィール入力も、管理画面も、詳細ページも、課金も、何も無い。ただメッセージを投稿するだけ。

## 仕様

メッセージは、同じ文字(アルファベット・漢字・ひらがな・カタカナ・ハングル)が10文字以上連続していないと投稿できない。
メッセージの文字数は最大500文字。
投稿操作には1分に10回までのレート制限を設定する。
投稿済みメッセージの10文字以上連続している部分は、太字で表示される。

## デザイン

トップページのみ。
プライマリカラーは#dd4104、背景色は#f5f5f4、文字色は#0c0a09。
文字サイズは20px、10文字以上連続している部分は32px。
最上部はメッセージ入力欄とその直下の送信ボタン。
その下に、投稿済みメッセージ一覧が最新のものから順に表示される。
メッセージの各項目は、メッセージ内容と投稿日時である。
一覧は20件ずつ、スクロールによる無限ローディングで表示する。
超長いアルファベットの連続でも端で折り返されるようCSSを設計する。

## 技術スタック・インフラ環境

ローカル環境と本番環境のみ。

- Hono
- Inversify
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- ESLint + Prettier(`eslint-config-prettier`を使い`eslint-plugin-prettier`は使わない)
- Husky + lint-staged(`pre-commit`フック)
- Betterleaks(シークレット検出、`pre-commit`フック駆動でコマンドオプション`--staged`を添える)
- Cloudflare Workers
- Cloudflare Durable Objects(SQLiteストレージ)
