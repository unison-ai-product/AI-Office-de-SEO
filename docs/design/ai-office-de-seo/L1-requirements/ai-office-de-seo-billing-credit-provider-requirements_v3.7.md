---
document_id: AOS-L1-BILLING-CREDIT-PROVIDER
title: AI Office de SEO 請求・クレジット・AI Provider要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-05
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 請求・クレジット・AI Provider要求 v3.7

## 1. 課金  ［REQ-BILL-01］

決済はStripeを前提にする。

- 月額サブスクリプション
- 追加クレジット購入
- Customer Portal
- Webhookによる決済成功確認
- 返金・チャージバック処理

クレジットの正本はAI Office de SEO側に持つ。Stripeは決済・請求の正本であり、利用クレジット台帳は内部でappend-onlyに管理する。

## 2. クレジット  ［REQ-BILL-02］

ジョブ実行前に、予想トークン、外部API費用、Prompt Cache期待値、品質グレード、再試行余地から消費予定クレジットを算出する。

予約時にクレジットを仮押さえし、成功時に確定消費、失敗・キャンセル時に解放する。

## 3. 品質グレード  ［REQ-BILL-03］

一般ユーザーにはAIモデル名を出さない。

表示するもの:

- 品質グレード
- 予想消費クレジット
- 残りクレジット
- 今月の生成/改善可能目安

AI Provider、model、API key、routing、fallback、cost tableは開発管理者向け設定とする。

## 4. AI Provider拡張  ［REQ-BILL-04］

Providerは固定enumにしない。Provider Registry、Model Catalog、Capability Matrix、Cost Table、Health Check、Canary、Rollbackを持つ。

本文生成・重要判断はClaude-firstとする。ただし、分類、要約、軽量QA、fallback、個別契約用途では他ProviderやOpenAI互換を使える。

## 5. 開発管理者画面  ［REQ-BILL-05］

開発管理者は以下を管理できる。

- Provider
- Model
- API key alias
- cost table
- routing policy
- fallback policy
- monthly budget
- tenant/site usage
- error rate
- Prompt Cache効率
- Token usage
- external API usage

API keyは平文再表示しない。保存後はmask表示のみ。

## 6. クレジット原価前提とキャッシュ下限保護  ［REQ-BILL-06］

クレジット単価は、Prompt Cacheのヒットによるトークン削減を前提に置く。ヒット率が想定を下回ると原価が上振れするため、以下で採算を保護する。

- 品質グレードごとに、想定Prompt Cacheヒット率を原価前提として明示する（初期目標値は運用データで調整する）。
- 開発管理者画面で、想定ヒット率と実測ヒット率、想定原価と実測原価の乖離をtenant/site/workflow別に監視する。
- 実測ヒット率が下限しきい値を継続して下回った場合、原価前提の再計算、単価またはグレード別クレジット係数の見直し、低優先ジョブの抑制のいずれかを発動できる。
- キャッシュ効果を織り込んだ見積は、キャッシュmiss時の上振れ上限も併記し、予約クレジットはmiss上限側で仮押さえする。

原価構造の前提（プロバイダ公式仕様で検証済み・実数はCost Tableで管理）: キャッシュは「書き込み＞通常入力＞読み取り」の3層価格（公式ドキュメント時点の代表値: 5分TTL書き込み1.25×、読み取り0.10×、1時間TTLは追加費用）で、**書き込みプレミアムがあるためヒット率が低いとキャッシュ無しより高コストになりうる**。また書き込みはbest-effortでヒット保証がないため、miss上限側での予約（本節）は設計上の必須である。実数はProvider Cost Table（`REQ-BILL-09`）から解決し、本書へハードコードしない（`REQ-BILL-10`）。

想定ヒット率・下限しきい値・miss上限係数は設定値とし、確定値は運用開始後に較正する（初期値は要調整）。

## 7. Stripe責務分担とクレジット台帳  ［REQ-BILL-07］

決済・カード情報・請求書・領収書・支払い失敗通知はStripeが正本（Checkout / Billing / Customer Portal / Webhooks）。AI Office de SEO側は生成クレジット残高・予約・消費・品質グレード別消費係数・Autopilot枠を正本とする。カード番号・CVC等はSaaSに保存しない。Stripe API key / webhook signing secretはサーバー側で暗号化保存し、フロント・ログ・AIプロンプトに出さない。Webhook署名を検証し、HTTPS必須。

クレジット台帳 `usage_credit_ledger` はappend-onlyで残高を直接書き換えない。エントリ種別: `monthly_grant` / `purchase_grant` / `promo_grant` / `manual_grant` / `reserve` / `release` / `commit` / `adjustment` / `expire` / `refund_reversal` / `chargeback_hold`。ジョブは予約時 `reserve`、成功時 `commit`、失敗/キャンセル時 `release`、品質グレード変更時は差額を追加reserve/release。`stripe_event_id` / `idempotency_key` で同一eventの二重付与を防ぐ。Checkout成功だけでは付与せず、Webhook成功後に付与する。

## 8. サブスクリプション状態とアクセス制御  ［REQ-BILL-08］

`active` のときだけ月次付与する。`past_due` / `unpaid` / `canceled` 時の生成・予約・Autopilot制限を定義する。月次クレジット繰越可否・追加購入/プロモの有効期限・先に消費するクレジット種別をplan/credit_policy versionで管理する。ユーザーにはmodel/provider名を見せず、プラン・品質グレード・本数・クレジット・追加購入価格として提示する。

## 9. LLMプロバイダ拡張（Registry / Adapter / Routing）  ［REQ-BILL-09］

Provider種別を Agent Runtime Adapter と LLM Provider Adapter に分ける。Provider Adapter Registry（`provider_family`: anthropic / openai / openai_compatible / azure_openai / google_vertex / aws_bedrock / local / custom_http / private_gateway、request/response/error/cost mapper version、status）、Provider Profile、Model Catalog、Capability Matrix（agent_loop / tool_calling / structured_output / streaming / long_context / vision / prompt_cache / batch / cost_report / safety / private_network）、Cost Table を持つ。

Adapter Contract 入力は `task_type / messages / system_instruction / json_schema / tools / temperature / max_output_tokens / stream / trace_id / budget_hint`。`tenant_id`/`site_id` は含めずSiteSandboxContextで固定。出力は text/structured/tool_calls/finish_reason/refusal/usage/cost/latency。エラーは authentication / authorization / rate_limited / quota_exceeded / timeout / provider_unavailable / context_length_exceeded / schema_mismatch / safety_blocked / cost_budget_exceeded へ正規化。

Routingは用途別capability要件で解決し、Claude優先: 本文生成・標準/プレミアムリライトのdefault provider familyは `anthropic_claude`。非Claudeは分類・要約・メタ案・QA補助・fallback・個別契約用途とし、本文生成に使う場合は開発管理者の明示許可とRoute Decision Audit理由を要する。Health Check失敗は本番Routing除外、Cost Table未設定は本番不可、Canary→しきい値未満で自動rollback。ジョブ開始時にProvider/Profile/Model/Routing/Cost/Capability/Secret versionをfreeze。APIキー原文・credential・記事本文・プロンプト全文・raw response全文は保存しない。

## 10. 価格・クレジット・原価の設定化（管理画面設定・要求はハードコードしない）  ［REQ-BILL-10］

価格・クレジット単価・原価係数・品質グレード別消費係数・プラン内容・追加パック価格は、要求書・エージェント・一般ロジックにハードコードしない。すべて管理画面から設定する Pricing Configuration（設定レジストリ、`REQ-ADM-09`）から実行時に解決する。要求書が持つのは構造と不変条件のみで、実数は設定値として外に置く。

- 設定対象: `billing_plans`(+versions) / `credit_packs` / `credit_pack_prices` / 1creditあたり原価・売価 / 品質グレード別消費係数 / provider・model別 cost table（`REQ-BILL-09`）/ Autopilotリスク係数・粗利係数 / 追加購入価格・有効期限・繰越可否。
- 版管理と再現性: 設定は version を持ち、`effective_from` / `effective_to` と `status`（draft / active / deprecated / disabled）を持つ。ジョブ開始時に適用 version を freeze し、更新後も過去ジョブの原価・消費計算の再現性を壊さない（`REQ-PACK-04` と同様）。
- 監査: 価格・係数・手動クレジット操作の変更は、理由・対象・承認者つきで監査ログに残す（`REQ-ADM-06`）。
- 提示: 一般ユーザーには model / provider 名でなく、プラン・品質グレード・本数・クレジット・購入価格として提示する（`REQ-BILL-08`）。
- 本要求書・参照ノートに現れる価格・係数はすべて「既定値 / 初期値」であり、設定レジストリの値が優先する。

## 11. 実行レーンとLLM Batch活用（コストダウン）  ［REQ-BILL-11］

LLM実行を2レーンに分け、急がないジョブをプロバイダのBatch実行へ寄せて原価を下げる。

- レーン定義: **interactive**（画面から即時実行するジョブ）と **scheduled**（予約・夜間・Autopilot・ロングテール由来のセクション追補リライト（`REQ-KGA-16`）等の非急ぎジョブ）。scheduledレーンは、Capability Matrixで `batch` 能力を持つProvider（`REQ-BILL-09`）のBatch実行を優先利用する。
- 経済性の前提（プロバイダ公式仕様・検証ログ参照）: Batch割引とPrompt Cacheの価格乗数は**併用（スタック）可能**であり、バッチはターンアラウンドが長く5分TTLでは失効しやすいため、scheduledレーンの既定は**Batch×1時間TTLキャッシュ**の組合せとする。割引率・可否の実数はProvider Cost Tableで管理し、本書へハードコードしない（`REQ-BILL-10`）。なお、バッチ内の項目は並行処理されるため**項目間のキャッシュヒットは保証されない**（書き込みbest-effortと同根）。scheduledレーンの見積もmiss上限側の予約（`REQ-BILL-06`）を前提とし、バッチ内ヒット率は実測で較正する。
- ユーザー提示: モデル名・Batch等の内部用語は出さず（`REQ-BILL-03`）、「今すぐ」「おまかせ（夜間・割安）」等の実行オプションと、レーン別の消費クレジット係数（設定、`REQ-BILL-10`）として提示する。予約投稿（`REQ-WPA-04`）・Autopilotはscheduled既定。
- 見積と予約: Preflight（`REQ-SEC-12`）はレーン別見積を提示し、scheduledはバッチ割引適用後の額で予約する。バッチの失敗・期限超過時の扱い（interactiveフォールバック／再キュー）は設定とし、フォールバック時の差額は追加承認またはポリシーに従う。
- SLAと通知: scheduledレーンは完了目標（初期値・要調整。例: 翌朝まで）を持ち、完了・失敗はジョブ通知（`REQ-PRODUCT-11`）で知らせる。interactive経路にBatchを使わない。
- 状態機械との整合: Batch実行はステージ単位の非同期実行としてOrchestratorが扱い、工程順序・ゲート（`REQ-AGENT-09`）・停止再開（`REQ-AGENT-10`）の意味論は変えない。
