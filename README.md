# 今日、3分だけ。 — MVP

今日のニュースを入口に、3分で「世界を見る視点」を1つ増やすWebサービスのMVPです。

## 自動化フロー

1. Vercel Cron が毎日 `/api/cron/generate` を呼ぶ
2. `NEWS_FEEDS` に設定したRSSから直近ニュース候補を収集
3. OpenAI Responses API + Structured Outputsで3テーマを選定・生成
4. Supabase `daily_lessons` にupsert
5. トップ画面に当日3問が自動公開

`vercel.json` は `0 21 * * *`（UTC）なので、日本時間では毎朝06:00実行です。Vercel CronはUTC固定です。

## 1. Supabase

Supabase SQL Editorで `supabase/schema.sql` を実行してください。

## 2. 環境変数

`.env.example` を `.env.local` にコピーして設定します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`（例は `gpt-6-astra`。利用可能なモデルに変更可）
- `CRON_SECRET`
- `NEWS_FEEDS`（信頼するRSS URLをカンマ区切り）
- `MAX_NEWS_AGE_HOURS`（候補ニュースの最大経過時間。初期値48）

## 3. ローカル起動

```bash
npm install
npm run dev
```

## 4. 手動生成テスト

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/generate
```

成功すると当日分3本がSupabaseに保存されます。

再生成して同日の3本を上書きしたい場合：

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/generate?force=1"
```

## 5. Vercel

GitHubへpushしVercelでImport。環境変数を設定してDeployします。

Cronのスケジュールは `vercel.json` に含まれます。

## 運用上の重要事項

- 最初の1〜2週間は完全自動公開より、生成結果を毎日確認する運用を推奨。
- RSS本文を転載せず、ニュースは「学ぶきっかけ」としてタイトル・リンク中心に扱う。
- 重大事故、医療、法律、選挙など高リスクテーマは将来的に自動公開ゲートを追加する。
- 同日3本が既に存在する場合、Cronは再生成をスキップするため重複公開しません。
