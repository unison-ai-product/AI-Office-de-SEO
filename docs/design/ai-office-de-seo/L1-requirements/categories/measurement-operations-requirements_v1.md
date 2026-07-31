---
document_id: AOS-L1-MEASUREMENT-OPERATIONS-REQUIREMENTS
title: AI Office de SEO 計測・運用要求 v1.1
version: 1.1
layer: L1
kind: measurement_operations_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 計測・運用要求

## 責務

製品、SEO、品質、性能、コスト、障害を何で測り、異常時にどう対応するかを定義する。

計測対象:

- レコメンド生成数、採用率、編集率、却下率、反復率、実施後効果
- ArticleSummaryの本文取得省略率、保存量、再解析率、完全性
- GSCマッチ率、カバー率、Query Drift、カニバリ
- 生成品質、Repair収束、hard gate、公開成功率
- API、DB、画面、キュー、バッチの性能
- token、cache、credit、Provider原価、粗利
- SLO、エラー率、再試行、復旧、サポートSLA

運用対象:

- alert、incident、runbook、Kill Switch
- backup、restore、retention、cleanup
- model/config/catalog rolloutとrollback
- support escalationとナレッジ還流
- capacityとスケール判断

incident発生後の封じ込め、顧客連絡、復旧、補償、postmortemは `incident-warranty-requirements_v1.md` を正本とする。

既存ソース: `ai-office-de-seo-admin-console-requirements_v3.7.md`、`ai-office-de-seo-security-observability-requirements_v3.7.md`、`ai-office-de-seo-development-unit-roadmap_v3.7.md`。

## 要求

### REQ-MEASURE-01 確実性優先のページイベント

記事の行動計測は、ページ表示、遷移元・遷移先、明示的に識別できるCTAまたはボタン遷移、指定サンクスページ到達を基本イベントとする。推測によるクリック・CV補完を行わず、重複排除、bot除外、同意状態、計測欠損を記録する。

### REQ-MEASURE-02 CV定義

CVはSiteごとに到達URLまたは明示イベントを設定し、定義versionと有効期間を持つ。サンクスページ到達等の決定条件を満たした場合だけCVとして計上し、複数到達・再読込・戻る操作の重複規則を定義する。

### REQ-MEASURE-03 軽量保持

詳細イベントは推薦・施策効果の判定に必要な最小項目だけを取得し、短期保持後に記事・日・イベント種別単位へ集約する。生イベントの保持期間、Site当たり上限、遅延到着、削除、再集計を定義し、分析要望ごとに無制限なイベント項目を追加しない。

### REQ-MEASURE-04 軽量Tracker

初期計測はCMS内部ロジックへ密結合せず、非同期で読み込む単一のversion付きJavaScript Trackerを使用する。初期自動取得はpage viewとURL遷移に限定し、CTAは明示的なdata属性または登録selector、CVは設定済み到達URLで判定する。送信はページ表示を妨げない `sendBeacon` 等の非同期経路とし、失敗してもページ操作を停止しない。

Trackerはcookie、常時heartbeat、MutationObserverによる全DOM監視、全click自動取得、heatmap、session replay、フォーム入力取得、スクロール高頻度送信を初期機能に含めない。設定はサーバー側のSite Configurationで変更し、計測項目の追加だけを理由にSite側scriptを頻繁に差し替えない。

### REQ-MEASURE-05 運用Telemetry・Dashboard

平常時運用は `REQ-NFR-13/14` のmetrics、logs、tracesを、ユーザー経路、API、queue、AI Provider、CMS、GSC、課金、Tracker、database、cacheごとのdashboardへ集約する。各panelはSLO、error rate、latency、traffic、saturation、queue age、DLQ、cost anomaly、data freshnessを必要な粒度で表示し、tenant/site別調査へ安全にdrill downできる。

### REQ-MEASURE-06 Alert設計

alertは症状、影響範囲、severity候補、owner、runbook、相関IDまたは検索条件を持つ。単一エラーではなく継続時間、割合、件数、error budget消費、queue age等でactionableにし、同一原因のalert stormを集約する。通知先不達、acknowledgeなし、長期継続時のescalationを検証する。

### REQ-MEASURE-07 Runbook・定常操作

再試行、DLQ redrive、接続再認可、Tracker確認、cache失効、job取消、capacity変更、Feature Flag rollback等の定常操作は、前提、権限、対象範囲、実行手順、成功確認、rollback、監査eventを持つrunbookへ接続する。本番DBの直接更新をrunbookの通常手順にしない。

### REQ-MEASURE-08 Backup・Retention・Cleanup検証

backup作成だけでなくrestore test、PITR到達性、object lifecycle、通知90日、監査1年以上、保留job 7日、本文一時領域TTL、集約・削除jobの成功を計測する。失敗・遅延・容量超過はalert化し、削除不能を正常完了として扱わない。incident発生後の復旧判断は `REQ-IRG-*` を参照する。

### REQ-MEASURE-09 Rollout・Rollback観測

model、Prompt、Catalog、Tracker、Plugin、Feature Flag、application releaseは、version、対象tenant/site、canary比率、開始・終了、主要KPI、停止条件を記録する。新旧群の品質、error、latency、costを比較し、停止条件到達時は自動または承認済み操作でrollbackできる。

### REQ-MEASURE-10 Capacity・負荷運用

API、worker、queue、database、storage、Provider quota、WordPress送信、GSC取得のcapacityを予測・実績で監視する。対話APIを優先し、閾値到達前にbatch同時数、優先度、rate limit、scale設定を変更する。増強判断は需要、SLO、費用、運用人数を併記し、単純な常時過剰provisioningを既定にしない。

### REQ-MEASURE-11 Support・改善還流

顧客申告、alert、job失敗、操作問い合わせを相関ID、分類、回避策、原因、解決versionへ接続し、同一問題を検索可能にする。再発傾向は要求、runbook、監視、FAQ、テストへ還流し、個別担当者の記憶だけを運用正本にしない。

### REQ-MEASURE-12 検索・AI可視性ファネル

検索およびAI面を `取得可能 → 実取得 → 検索候補・回答取得 → 順位／引用／言及 → 参照流入 → CV` の段階で計測する。ユーザー画面の主要評価は「SEO／AI取得性」と「検索順位／AI回答表示性」の二軸とするが、内部データでは各段階を分離し、crawlをindex・citationの証拠、citationを流入・CVの証拠として扱わない。

SEO取得性はGooglebot等、AI取得性はProviderおよびBot用途別に、許可状態、probe成功、検証済み実crawl、2xx／3xx／4xx／5xx／429、本文完全性、応答時間、coverage、freshnessを表示する。SEO表示性はGSCのimpression、順位、click、AI表示性はprompt cluster別の回答面出現、ブランド言及、URL引用、引用share、反復時の安定性、AI referralをavailabilityと観測方法付きで表示する。AI面を通常検索実績へ合算するProviderでは、分離不能な値を推定でAI専用値に割り当てない。

二軸は `取得高・表示高=維持／保護`、`取得高・表示低=選択性・内容・根拠・競合を診断`、`取得低・表示高=cache・第三者・過去取得等を確認し技術要監視`、`取得低・表示低=取得障害を先に診断` の決定表へ接続する。総合点だけで原因を隠さず、構成値、confidence、未観測理由、最終観測日時を保持する。

## 受入条件

- [ ] AC-L1-MEASURE-01: 同一のページ遷移から再現可能なイベント結果が得られる。
- [ ] AC-L1-MEASURE-02: CV定義versionと重複規則に従いサンクスページ到達を計上できる。
- [ ] AC-L1-MEASURE-03: 生イベントが期限後に集約・削除され、記事遍歴と施策評価は維持される。
- [ ] AC-L1-MEASURE-04: 単一の非同期Trackerでpage view、明示CTA、到達URL CVを計測でき、未提供の高度計測を読み込まずページ表示を阻害しない。
- [ ] AC-L1-MEASURE-05: 主要経路のSLO、error、latency、queue、Provider、cost、freshnessをdashboardから相関調査できる。
- [ ] AC-L1-MEASURE-06: alertが影響・owner・runbookを持ち、storm集約と未応答escalationを検証できる。
- [ ] AC-L1-MEASURE-07: 定常復旧操作を本番DB直接更新なしでrunbookどおり実行・rollback・監査できる。
- [ ] AC-L1-MEASURE-08: backup restore、保持、TTL、cleanupの失敗・容量超過を検知できる。
- [ ] AC-L1-MEASURE-09: canaryの新旧KPIを比較し、停止条件から対象versionをrollbackできる。
- [ ] AC-L1-MEASURE-10: capacity予測から対話API優先のscale・rate・batch制御を実行できる。
- [ ] AC-L1-MEASURE-11: support事例を相関IDと解決versionへ接続し、要求・runbook・テストへ還流できる。
- [ ] AC-L1-MEASURE-12: SEO／AIについて取得性と表示性を二軸表示し、内部では取得・候補化・順位／引用／言及・流入・CVを分離して、4象限から異なる診断へ接続できる。
