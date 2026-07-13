---
document_id: AOS-L1-ADMIN-CONSOLE
title: AI Office de SEO 開発管理者コンソール要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-05
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 開発管理者コンソール要求 v3.7

（正本: 旧 ui-admin / dev-admin-llm-provider の管理画面要求を移植。ユーザー向け画面は `REQ-AOUI` / `REQ-PRODUCT`）

## 1. 位置づけ  ［REQ-ADM-01］

開発管理者コンソールは、一般ユーザー画面とは分離した運用面である。プラン・原価・プロバイダ・コスト・監査・運用ログを扱い、`tenant_id`/`site_id` 境界と機微情報の非表示（APIキー原文・secret復号値・master key）を守る（`REQ-SEC`）。

## 2. 課金・プラン・原価管理  ［REQ-ADM-02］

Stripe Product/Price と AI Office de SEO plan/credit_pack の対応付け、Credit Pack catalog、税・クーポン設定、dunning方針、返金/チャージバック方針、Webhook受信状態・失敗率・reconciliation状態を管理する。プラン/クレジットパックごとに販売価格・Stripe手数料見込み・想定AI原価・想定品質ゲート原価・想定粗利・1creditあたり原価/売価を可視化する（`REQ-BILL`）。手動クレジット操作は理由・対象・量・有効期限・承認者・監査ログ必須。

## 3. LLMプロバイダ管理  ［REQ-ADM-03］

Provider Adapter Registry、Provider Profile、Model Catalog、Capability Matrix、Cost Table、Health Check、Canary/Rollout、Routing Impact Preview、Audit Log を扱う（`REQ-BILL` プロバイダ拡張）。Capability不足のProviderを不適切用途へRoutingさせない、Health Check失敗を本番Routingから除外、Cost Table未設定を本番不可、変更前に影響範囲（tenant/site/workflow/予約キュー/Autopilot policy/予測コスト・latency差分）をプレビュー、Canary→しきい値未満で自動rollback。APIキー原文・credential・記事本文・プロンプト全文・raw response全文は表示・保存しない。

## 4. コスト・観測ダッシュボード  ［REQ-ADM-04］

preflight estimate vs actual、workflow/ticket/provider別 token・cost、Prompt Cache hit率・creation/read tokens、error/retry rate、schema validation fail率、QA fail率、repair loop平均回数、DataForSEO cost、crawler fallback rate、WP validation fail率、budget overrun件数を横断監視する（`REQ-SEC` 観測）。設定として workflow別max token、quality tier別budget、DataForSEO日次上限、cache TTL policy、retry上限、repair loop上限、circuit breaker、debug snapshot export（本文全文を除く）。

## 5. 運用・監査・登録情報  ［REQ-ADM-05］

開発運用ダッシュボード、登録ユーザー情報、利用者運用ログを扱う。Feature Flag / Kill Switch（`REQ-DUR`）、直接公開の承認・停止制御、Provider/APIキー/routing変更・返金・手動クレジット操作の監査ログを持つ。ログには本文全文・プロンプト全文を残さず、hashと処理結果を残す（`REQ-SEC`）。

## 6. 認可・監査・なりすまし（一般SaaS標準）  ［REQ-ADM-06］

一般的なB2B SaaS運用ベストプラクティスに基づく（要調整）。本製品の `tenant_id`/`site_id` 境界（`REQ-SEC-11`）に適合させる。

- 内部（プラットフォーム運用）ロールと、テナント内ロールを分離する。内部ロールは顧客組織へ漏らさない。最小権限（least privilege）を原則とする。
- クロステナントの運用操作は常時付与せず、break-glass / just-in-time昇格（時間制限つき・理由必須・全操作監査）で行う。
- 監査ログは不変（immutable）・テナント分離・非同期書き込みとし、スキーマは `{ id, timestamp, actor_id, actor_type(user/system/api_key), action, resource_type, resource_id, tenant_id, changes(diff), ip, user_agent, metadata }`。本文全文・プロンプト全文・APIキー原文は残さない（`REQ-SEC-11`）。
- サポートのなりすまし（impersonation）は原則read-only、UIに明示表示、acting/target両ユーザーと理由を記録する。生トークン・共有セッションを使わない。
- 権限変更は Preview → Validate → Approve → Apply → Audit → Rollback の順に扱い、ロール/権限定義はversion管理する。secretはsecrets managerで管理し環境変数平文に置かない。

## 7. 可観測性・SLO・インシデント（運用面）  ［REQ-ADM-07］

- ログ・メトリクス・トレースを OpenTelemetry等で相関し、`request_id` と `tenant_id`（サイトに閉じるものは `site_id`）でタグ付けする（`REQ-SEC-13`）。golden signals（レイテンシ/トラフィック/エラー/飽和）を可視化する。
- エラートラッキング（例外→トレース→ログの導線）、ステータスページ、最低1つのSLO定義とアラートを持つ。
- オンコール/インシデント対応のrunbook、重大インシデントの検知・エスカレーション・事後レビューを定義する。
- 公開エンドポイントにレート制限、異常ログイン/不正利用（フリートライアル濫用・アカウントファーム）の検知を持つ。

## 8. データ保護・保持・事業継続（運用面）  ［REQ-ADM-08］

- 個人情報・法令対応の基本機能: データエクスポート、アカウント/テナント削除、同意ログ（consent log）。データクラス別の保持期間ポリシー（`REQ-SEC-11` 保存禁止/一時本文と整合）。
- 秘密情報のローテーション（APIキー・webhook secret・DB資格情報）と、バックアップ＋復元リハーサル（DR）。
- Webサイト・Webhook・課金副作用は冪等キーで二重実行を防ぎ（`REQ-BILL-07`）、長時間処理はジョブキューへ退避する。
- セキュリティレビュー（OWASP Top 10等）の観点を運用に組み込む。数値・頻度・保持期間は初期値でありL3/運用で較正する。

## 9. 設定レジストリと安全不変条件  ［REQ-ADM-09］

価格・係数（`REQ-BILL-10`）に加え、調整可能な運用パラメータを一元的に管理画面から設定する。要求書はこれらをハードコードせず「初期値」として持ち、レジストリの値で上書きする。

- 設定対象（調整可能パラメータ）: 品質しきい値（keyword密度・近似度・カバー率・可読性・独自要素数など、`REQ-PACK-10`）、Query Fanout の facet重み・サブクエリ数（`REQ-SRC-09`）、GSC取り込みの次元スコープ・優先度（`REQ-KGA-11`）、Batch Priority・同時実行・レート・クォータ・TTL・フェアシェア重み（`REQ-SRC-07` / `REQ-SRC-08`）、cache TTL・retry上限・repair loop上限・circuit breaker（`REQ-ADM-04`）、Autopilot許可レベル・投稿頻度・承認ゲート。
- 版管理・freeze・監査・`effective_from`/`effective_to`・`status` を持ち、変更前に影響範囲（対象 tenant / site / workflow / 予約キュー / Autopilot、予測コスト差分）をプレビューする（`REQ-BILL-09` の Routing Impact Preview と同様）。
- スコープと上書き順: グローバル既定 → プラン別 → テナント / サイト別 の順に上書きできる。
- 安全不変条件（設定で緩めてはならない）: SiteSandboxContext、記事本文非保持、GSC / WP のテナント・サイト境界、Stripe / credit 台帳の監査、直接公開の承認・停止制御、Provider APIキー原文非表示（`REQ-SEC-11`）。価格・しきい値は設定可能だが、これら安全境界は設定対象外とする。

## 10. Pack・プロンプト・ゲート管理画面  ［REQ-ADM-10］

Prompt Pack / Catalog / few-shot / Quality Gate の内容調整を、コード変更なしで開発管理者コンソールから行えるようにする。これは設定レジストリ（`REQ-ADM-09`＝数値パラメータ）と対をなす、**構造化コンテンツ（Pack本文・few-shot・ゲート定義）の管理面**である。

管理対象:

- Prompt Pack（`prompt.*`）: Domain Positioning / Content Regulation / User Order の注入テンプレート構造。
- Catalog（`catalog.*`）: article_type / heading_flow / purpose_element / quality_gate の各タイプ定義（`REQ-PACK-11`）。
- few-shot: 正例/反例エントリの追加・改訂・gate_tags付け替え（`REQ-PACK-12`。QA実績に基づく較正の実施面）。
- Workflow定義（`workflow.*`）: ステージ・遷移・ループ・停止ガードの登録・改版（`REQ-AGENT-06`）。
- Quality Gate Registry: ゲートのhard/advisory区分・シグナル構成（しきい値実数は`REQ-ADM-09`のレジストリ側）。
- Writing Method Catalog（`catalog.writing_method.*`）: 技法principles・unit_guidance・適用可否・few-shot参照の登録改版（`REQ-PACK-19`。手書き例示のValidate=ゲート合格検査を含む）。
- Review Lens Catalog（`catalog.review_lens.*`）: レンズ→ゲート束の構成・実行順・article_type適合（`REQ-PACK-20`。ゲート定義の複製禁止）。
- Reader Segment Catalog（`catalog.reader_segment.*`）と転生プロンプト: セグメント定義・persona_brief・実行上限の登録改版（`REQ-PACK-21`。デモグラ軸のsensitivity_notes必須）。
- AI定型表現辞書: `human_voice`ゲートの決定論シグナル用辞書の追加・改版（`REQ-PACK-09`。誤検知の較正はゴールデン評価と併用）。
- UIテキストレジストリ（ui.text.*）: ユーザー面文言・通知/メールテンプレの版管理と差し替え（`REQ-NAV-09` / `REQ-PRODUCT-21`。禁止語・変数整合のValidate付き。法務文言は対象外）。

編集の統制（`REQ-PACK-04`のversion規約に従う）:

- 全編集はdraft版として作成し、Preview → Validate（スキーマ検証・few-shot正例がLowestを模範化していないかの検査）→ Approve → Publish（新version発行）→ Audit の順で適用する（`REQ-ADM-06`の権限変更手順と同型）。
- 公開済みversionは不変。ジョブ開始時にfreezeされた旧versionは保持し、過去ジョブの再現性を壊さない（`REQ-PACK-04`）。
- 影響プレビュー: 改版が影響するWorkflowバインディング（`REQ-PACK-08`/`REQ-PACK-14`）・対象tenant/site・Prompt Cache無効化範囲（Layer A/B/C、`REQ-AGENT-03`）を適用前に提示する。
- few-shotとQuality Gateは単一ソース原則（`REQ-PACK-12`）を画面上でも強制し、gate定義の改版時に対応するfew-shotのgate_tags整合を検証する。
- ゴールデン評価（品質リグレッション検知）: Validate段で、固定タスク群（ゴールデン評価セット＝代表キーワード×記事タイプの評価用ジョブ定義。版管理・`REQ-ADM-09`でサイズ設定）を新版で実行し、Quality Gateスコア（`schema.snapshot.qa.v1`のgates/metrics）を現行版と比較する。しきい値超の悪化はPublishをブロックまたは警告付き承認とする。「教える基準＝検査する基準」の単一ソース（`REQ-PACK-12`）を、改版時の回帰検知にも用いる。
- 段階ロールアウト: Publishは全テナント一斉を既定としない。master→canary（対象割合は設定）→一般の段階適用を選択でき（Feature Flagのロールアウト順序`REQ-PRODUCT-23`と同型）、活性化後のQA fail率・hard gate率のスパイクを監視して（ADM-S4）、しきい値超過で管理者へ通知しロールバック（旧version再活性化）を提案する。
- 変更は理由・対象・承認者つきで監査ログに残す（`REQ-ADM-06`）。

安全境界: 本画面から編集できるのはPack/Catalog/few-shot/Workflowの内容であり、安全不変条件（サンドボックス・本文非保持・境界・Layer Aの基本NG、`REQ-ADM-09`）は編集対象外とする。プロンプト全文の恒久ログ保存はしない（保存するのはPack定義そのもの＝バージョン管理された正本であり、実行時に組み立てられたプロンプト全文ではない。`REQ-SEC-11`）。

価格・係数（`REQ-BILL-10`）に加え、調整可能な運用パラメータを一元的に管理画面から設定する。要求書はこれらをハードコードせず「初期値」として持ち、レジストリの値で上書きする。

## 11. 表示ラベルレジストリ（内部キーの日本語変換層）  ［REQ-ADM-11］

開発管理者コンソールの全画面で、内部キー・開発用語を日本語ラベルに変換して表示する層を持つ。ユーザーUIが内部用語を「隠す」（`REQ-BILL-03`）のに対し、管理面は「訳して併記する」——運用者が意味を理解でき、かつキーでの検索・照合可能性を失わない。

- 対象: config_key（`REQ-ADM-09`）、event_type（イベントカタログ）、Quality Gateキー、Provider能力・Cost Table項目、エラーコード、契約検証項目（forbidden output / hallucinated source 等）、ジョブ・トレースのメトリクス名。
- 表示形: 日本語ラベル＋必要に応じて1行説明。内部キーは等幅フォントで併記し、隠さない（例: 「予算超過（budget overrun）」「出典捏造の検知（hallucinated source）」）。
- 管理: ラベル対応はCatalogとして版管理し、編集はPack・プロンプト・ゲート管理画面の統制（`REQ-ADM-10`: draft→Preview→Validate→Approve→Publish）に従う。コード変更なしで追補できる。
- fail-visible: ラベル未登録のキーは生キーのまま表示し「ラベル未登録」印を付けて欠落を可視化する（黙って隠さない）。ラベルカバレッジ（登録済み/出現キー）を観測ダッシュボード（`REQ-ADM-04`）で計測し、較正対象とする。
- 通知・監査ログの管理者向け表示にも同一レジストリを適用し、画面間で訳語が揺れないこと（単一ソース）。単一ソースの範囲はユーザー面へも及ぶ——UIテキストレジストリ（`REQ-NAV-09`）と共通の術語辞書基盤を参照し、同一内部キーの訳語を面間で一致させる（ユーザー面は「隠す/言い換える」・管理面は「訳して併記」という表示方針の差は維持したまま、訳語自体は単一とする）。
