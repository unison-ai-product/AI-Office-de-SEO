---
document_id: AOS-L1-INTEGRATION-REQUIREMENTS
title: AI Office de SEO 外部連携要求 v1.0
version: 1.0
layer: L1
kind: integration_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 外部連携要求

## 責務

外部システムとの認証、入力、出力、同期、制限、障害、再試行、整合を定義する。

対象:

- WordPress
- Googleログイン、GSC、URL Inspection
- SERP、PAA、AIO、ニュース、動画、競合構造
- LLM Provider
- Stripe
- メール、Webhook、オブジェクトストレージ

必須項目:

- API/Plugin責務境界
- 認証・scope・secret
- request/response契約
- quota、rate limit、cost
- freshness、availability、欠損
- timeout、retry、idempotency、circuit breaker
- 差分同期、再認可、切断、監査

外部取得値の解釈・優先順位計算はロジック要求へ置く。

既存ソース: `ai-office-de-seo-dataforseo-competitor-batch-requirements_v3.7.md`、`ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`、`ai-office-de-seo-billing-credit-provider-requirements_v3.7.md`。

## 要求

### REQ-INT-01 WordPress軽量計測

リリース時のWordPress Pluginは、ページ表示、遷移元・遷移先、明示CTA・button識別子、指定サンクスページ到達を取得できなければならない。記事本文、フォーム入力内容、不要な個人情報を送信せず、同意状態、Site識別子、イベントID、発生時刻、plugin versionを付与する。

### REQ-INT-02 計測契約の更新

計測イベントschemaとPluginはversion管理し、後方互換期間、対応するサーバーversion、段階更新、失敗時停止、rollbackを持つ。計測項目の追加は、データ量、保守負担、確実性、利用目的を評価し、状況に応じてリリース後に追加できる。

### REQ-INT-03 補助分析連携

GA4等の外部分析は補助連携として扱い、初期のページ遷移・CV計測の必須経路にしない。外部分析値と自前イベントが異なる場合は混合せず、sourceと定義versionを表示する。

### REQ-INT-04 GSCインデックス状況

GSCおよびURL Inspectionの利用可能な観測結果から、公開URLのインデックス状態、問題種別、確認日時、quota状態を取得する。クォータ配下では新規公開、順位なし、要監視URLを優先する。取得不能時は推測で正常・異常を確定せずavailability理由を返す。診断結果はユーザーエスカレーションへ渡し、本連携からサイト設定を自動修復しない。

## 受入条件

- [ ] AC-INT-01: 初期Pluginが本文・フォーム値を送らず、ページ遷移と指定CVを取得できる。
- [ ] AC-INT-02: Pluginとイベントschemaを互換性確認後に段階更新・rollbackできる。
- [ ] AC-INT-03: 外部分析連携が停止しても初期の自前計測を継続できる。
- [ ] AC-INT-04: GSC／URL Inspectionのクォータとavailabilityを保持してインデックス状態を取得し、取得不能を正常扱いせずユーザー対応へ接続できる。
