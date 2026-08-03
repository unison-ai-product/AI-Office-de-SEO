---
document_id: AOS-L1-PRODUCT-BUSINESS-METRICS-MAP
title: AI Office de SEO 運営・顧客価値・成果指標対応表 v1.0
version: 1.0
layer: L1
kind: metrics_map
status: draft
updated_at: 2026-08-03
---

# AI Office de SEO 運営・顧客価値・成果指標対応表

## 1. 目的

本書は `REQ-MEASURE-13` と `BR-BIZ` 受入条件4に対し、視点、算式、データ源、集計周期、除外条件を固定する。運営側指標、顧客の初回価値到達、顧客Siteの成果指標を混合しない。公開SLOとWordPress Plugin配布は指標ではなく提供条件であり、本書の指標体系へ含めない。

## 2. 運営側のNorth Starと運営指標

| 指標 | 算式・判定 | 主なデータ源 | 集計周期 | 除外・補足 |
|---|---|---|---|---|
| 運用Loop完了Site数（North Star） | 集計月内に `loop_completed` が1件以上あるdistinct `site_id` 数 | Recommendation version、採用event、CMS Publication Result、Intervention Evaluation基準値・評価予定 | 月次。日次rolling値も内部表示 | CMS反映成功後、評価基準値・起点・1/3/6カ月予定の登録をもって発火する。GSC取得開始、下書き、閲覧だけは除外。同一Siteの複数Loopは1 Siteとして数える |
| Recommendation採用率 | `adopted` または `adopted_with_edit` となったRecommendation version数 ÷ 期間中にユーザー判断可能な状態で提示されたRecommendation version数 | Recommendation Queue、Decision Event | 週次・月次 | 提示前に失効・重複排除・自動取消されたversionは分母外。再計算versionは別versionとしてdecision eligibilityを持つ |
| アップセルevent | Plan Upgradeの支払・Entitlement反映完了件数と、追加credit購入の支払・Lot発行完了件数を別系列で計上 | Subscription、Payment、Entitlement、Credit Lot、append-only ledger | 日次・月次 | Preview、購入画面閲覧、決済失敗は除外。件数と金額を混ぜず双方を表示する |
| 継続稼働率 | 月初時点でActivation済みかつ有効契約に属するSiteのうち、月内に強いsignalが1件以上あるdistinct Site数 ÷ 同条件のdistinct Site数 | Recommendation採用、CMS Publication Result、Monthly Plan確定event、Entitlement | 月次 | 強いsignalは採用、公開／更新反映、月次計画確定のみ。閲覧、ログイン、通知既読、施策評価確認は除外。当月Activation Siteはcohort別に表示し翌月から通常分母へ入れる |

MRR、契約数、契約churnは運営側の経営指標である。ただし営業、価格、外部要因の影響が大きいためNorth Starにはせず、運用Loop完了、採用、継続稼働、アップセルとの相関・従属結果として経営Dashboardで扱う。

## 3. 顧客視点のActivationファネル

| 段階 | 到達event | 判定 |
|---|---|---|
| ① Site設定完了 | `site_setup_completed` | 必須Site設定の保存と検証が完了 |
| ② CMS接続完了 | `cms_connection_verified` | 認証、対象Site、必要Capabilityの接続検証が完了 |
| ③ 分析・Recommendation提示 | `first_recommendation_presented` | 初回分析結果からユーザー判断可能なRecommendationを1件以上提示 |
| ④ 初回公開／更新反映（Activation） | `site_activated` | 初回Recommendation採用に由来する公開または更新がCMSで反映済みと検証された |

各段階の到達率、前段階からの転換率、到達時間、滞留理由をSite cohort別に集計する。③到達・④未到達を最優先改善ファネルとして管理Dashboardへ表示する。下書き保存や成果物downloadだけでは④へ到達しない。

Activationは運営側の契約獲得や画面利用ではなく、顧客がSEO代行の初回価値を受け取った時点を表す。そのためCMSへの公開・更新反映を必須とする。

## 4. 継続・休眠・churn対応表

| 指標 | 分母 | 分子・判定 | データ源 | 周期 | 関係 |
|---|---|---|---|---|---|
| 継続稼働率 | 月初時点のActivation済み・有効契約配下Site | 月内にRecommendation採用、CMS公開／更新反映、月次計画確定のいずれかがあるSite | Product Event Store、CMS Publication Result | 月次 | プロダクトが直接改善する指標。契約churnの分母・分子には直接混入させない |
| 休眠Site数・率 | Activation済みで有効契約配下のSite | `max(activation_at, last_strong_activity_at)` から30日経過したSite | Activation、強いsignal、Entitlement | 日次判定・月次報告 | 解約の先行指標。未Activation SiteはOnboarding停滞へ分離し、休眠・churnへ含めない |
| 月次契約churn率（BR-KPI-002/008） | 月初時点の有効な有償契約数 | 月内に契約終了日へ到達した契約数 | Subscription／Contract正本 | 月次 | 休眠、Site削除、Site停止、未Activationを分子へ含めない。複数Site契約も契約単位で1件 |
| 財務churnシナリオ（BR-FIN-007） | 財務model上の月初有効契約数 | 同model期間の契約解約数 | version付きFinancial Model、Subscription実績 | 月次 | 基準5%・保守10%は契約解約だけで計算。休眠率は別の感応度入力または先行指標として表示する |

## 5. 顧客側の成果指標

顧客成果は、顧客Siteに対する代行結果として顧客へ見せる指標であり、運営側KPIとは別の表示・評価契約を持つ。検索流入、表示回数、獲得keyword、keyword／cluster順位、公開・更新数、CV、内部link・cluster充足を対象とし、市場全体の検索量、AIO・広告出現、季節性、外部変更、計測欠損を併記する。正式な算式、評価周期、S1／S2／S5への画面割当て、通常ビューの要約とOfficeの専門分析境界は `REQ-MEASURE-14` と `ai-office-de-seo-customer-outcome-metrics-map_v1.md` を正本とする。3位以内から導出するprotectは成果指標ではなく運用flagとして分離する。

## 6. 実装契約

- 全eventは `tenant_id`、`site_id`、`occurred_at`、`event_id`、`source`、`correlation_id`、schema versionを持つ。契約eventは `contract_id`、Recommendationは `recommendation_id/version`、CMS反映は `publication_id` を追加する。
- `site_activated` と `loop_completed` は同一ではない。初回CMS反映でActivationへ到達し、その施策の評価対象登録まで完了して初回Loop完了となる。
- 遅延eventはevent timeで再集計し、再送は `event_id` で冪等化する。欠損、遅延、分母0、接続解除は0へ丸めずavailabilityを表示する。
- 一般ユーザー画面は到達段階、必要操作、稼働状況を平易に表示する。算式、重複排除、補正、内部eventは開発・管理Dashboardの責務とする。
