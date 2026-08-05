---
document_id: AOS-L3-AWS-OPERATIONS-RECOVERY-MAP
title: AI Office de SEO AWS配置・観測・障害封じ込め・復旧接続マップ
version: 1.0
layer: L3
kind: implementation_map
status: draft
updated_at: 2026-08-03
---

# AI Office de SEO AWS配置・観測・障害封じ込め・復旧接続マップ

## 1. 目的

`REQ-NFR-06/07/08/13/14/15`、`REQ-TECH-19`、`REQ-MEASURE-05〜11`、`REQ-IRG-01〜09`を、AWS上の実装境界、観測、Runbook、復旧演習へ接続する。初期段階で特定compute／database製品を固定せず、負荷試験、運用人数、費用を根拠にADRで選択できる契約とする。

## 2. 初期論理配置

| 境界 | 責務 | 正本禁止 | 必須特性 |
|---|---|---|---|
| Edge | 静的配信、cache、TLS、WAF、origin保護 | 認可結果、契約、課金状態 | cache hit率、origin latency、4xx/5xx、WAF分類を観測 |
| Web/API | 通常ビュー、Office、API、認証済みCommand受付 | instance memory上の業務状態 | 複数instance再開、graceful drain、request correlation |
| Worker | Agent、分析、同期、CMS副作用、集約job | process local checkpoint | queue駆動、冪等、checkpoint、資源クラス別concurrency |
| Queue/DLQ | 非同期隔離、retry、遅延、優先度 | payload内の本文全文・secret | queue age、retry、DLQ、redrive監査、dedupe |
| Transaction Store | 契約、権限、credit ledger、公開命令、同意、短い業務正本 | 本文、生HTML、長いProvider response | PITR、暗号化、AZ障害対応、復元演習 |
| Analytics Projection | 初期からMetric別の有界rollup、pre-aggregation、watermark、検索read modelを保持。初期物理実装はPostgreSQL集計table／cacheを候補とし、閾値超過領域だけ列指向Storeへ移行 | 契約、権限、credit ledger、公開命令、Recommendation、記事状態の正本 | 再構築可能、世代切替、tenant／Site Scope、partial／stale状態、Analytics Store Port |
| Object Store | 期限付き成果物、export、backup、隔離保管 | 無期限本文保管 | encryption、TTL、version、別障害domain copy |
| Cache | 読取・Prompt cache、rate control | 業務正本 | TTL、tenant/site key、miss時再生成、容量監視 |
| Telemetry | metrics、logs、traces、audit参照 | 本文、prompt全文、secret、不要PII | OpenTelemetry互換、CloudWatch集約、相関ID |

Web/API、Worker、Queue、DB、Object Store、Registry／Resolverのいずれも、単一process instanceまたはlocal diskを正本にしない。

事前集計は将来最適化ではなく初期表示契約の一部とする。日次／月次、Site／カテゴリー・テーマ戦略／記事等の利用頻度が高いMetricをversion付きでrollupし、画面要求ごとのad hoc full scanを避ける。列指向性は初期からSchema／Port／移行testへ備えるが、物理的な列指向DBを全領域の必須依存にしない。scan量、ingestion backlog、storage、query P95、AWS費用、運用工数を同一versionで比較し、利益が出るMetric familyだけを二重書込み・検証・読取切替・rollbackの順で移行する。

## 3. 障害ドメインと封じ込め

| Domain | bulkhead単位 | circuit breaker／停止 | 継続する範囲 |
|---|---|---|---|
| tenant／Site | tenant/site concurrency、queue partition、rate budget | 異常Siteの同期・CMS write停止 | 他tenant／Site |
| Feature Object | Object key/version、専用queueまたはrouting key | Object Kill Switch | Coreと非依存Object |
| Provider | Provider、capability、route | timeout率、rate limit、healthでopen／half-open | 代替routeまたはdegraded機能 |
| CMS connection | Site connection profile、write queue | 認証切れ、429、schema不整合で保留 | 分析、既存データ閲覧、他Site |
| Agent Workflow | workflow、stage、quality lane | loop／token／credit／timeout guard | 他Workflow、完了checkpoint |
| Billing／authorization | 独立Command、台帳transaction | fail-close。推測継続禁止 | 閲覧、export等の許可済み非課金操作 |
| Analytics／Search | source ingest、metric rollup、pre-aggregation、search rebuild、exportを別routing／concurrency／DB budgetへ分離 | backlog、scan、DB latency、watermark遅延で低優先処理を保留 | 対話API、認可、課金、公開Command、既存Projection、現在Object基本検索 |

circuit breakerは失敗を隠すretry装置ではない。open理由、対象、開始時刻、probe、復帰条件、手動override、監査eventを持つ。全体Kill Switchは最後の手段とし、機能・Provider・Site単位の停止を先に適用する。

## 4. 観測契約

全E2Eに`correlation_id`、`request_id`、`tenant_id`、`site_id?`、`job_id?`、`workflow/stage`、`provider?`、`result_class`を付ける。顧客画面へ開発logを出さず、顧客にはTask履歴、処理状態、ユーザー対応可能な診断codeだけを表示する。

管理dashboardは次を分離する。

1. User journey: API latency、error、主要画面、Command成功率。
2. Queue/worker: queue age、depth、concurrency、retry、DLQ、checkpoint resume。
3. Provider/CMS: latency、rate limit、circuit state、fallback、反映確認。
4. Data: DB connection、slow query、storage増加、PITR、TTL／cleanup。
5. Billing/auth: ledger不整合、reserve滞留、webhook重複、認可拒否急増。
6. Edge/cache: cache hit率、origin負荷、WAF、asset delivery。
7. Analytics/search: ingest lag、source watermark、rollup／rebuild queue age、scan rows、statement timeout、pre-aggregation state、cache hit、Plan別wait distribution、age昇格、starvation検知。

alertは単発errorではなく、継続時間、割合、件数、queue age、error budget消費でactionableにする。alertにはimpact、owner、runbook key、検索済み相関条件を付け、stormを同一incidentへ集約する。

## 5. 自動復旧とRunbook

| 操作 | 自動化 | 成功確認 | 失敗時 |
|---|---|---|---|
| process／task再起動 | 即時 | health＋代表probe | flapping停止、incident化 |
| queue retry／DLQ redrive | policy範囲内 | idempotency＋下流結果 | 保留、対象限定runbook |
| checkpoint resume | 同一Job | 完了stage非再実行、二重課金なし | 顧客Taskを保留＋通知 |
| Provider failover | route policy内 | schema／品質／費用条件 | degradedまたは対象機能停止 |
| cache失効 | 対象keyだけ | origin再取得と整合 | cache bypass、調査 |
| connection再認可 | ユーザー操作 | scope／probe成功 | Site側対応へescalation |
| Feature Flag rollback | 承認済みpolicy | error率と代表journey回復 | deployment rollback |
| Analytics overload shedding | 非緊急rebuild／長期履歴／exportから自動保留 | 対話・課金・認可・公開SLO回復、watermark保持 | 当該分析class停止、既存Projection＋stale表示、runbook |
| Metric／Search projection rebuild | source watermarkから世代別に再構築 | 件数・hash・coverage・Metric fixture一致後にatomic切替 | 旧世代継続、失敗世代破棄、原因class別再試行 |

各Runbookは`runbook_key/version`、前提、実行権限、対象scope、手順、成功確認、rollback、監査eventを持つ。本番DB直接更新を通常手順にしない。

## 6. Backup／Restore／DR

- 契約、権限、課金台帳、credit、公開命令、同意記録の初期内部目標はRPO 1時間、RTO 4時間。
- Transaction StoreはPITR、暗号化backup、別障害domainへの隔離copyを持つ。
- tenant単位復元は日次論理export等の選択復元経路を持ち、全体restoreと分ける。
- Agent生成、解析、Recommendationはcheckpointと冪等再計算を優先し、正本DBと同じbackup方式を強制しない。
- restore演習は全体／tenantの双方で行い、開始、復元点、整合検査、実測RPO/RTO、差分、是正期限を記録する。未実施期間と目標未達をalert化する。
- backup作成成功だけで復旧可能と判定しない。restore test、PITR到達性、object lifecycle、TTL cleanupまで検証する。

## 7. Release／Rollback

dev、staging、prodを分離しIaC管理する。deploymentは受付drain→checkpoint保留→切替→代表journey canary→自動再開とする。DDLはexpand→migrate→contract、event/schemaは後方互換期間を持つ。canaryでerror、latency、boundary violation、ledger不整合が閾値を超えた場合は自動rollbackし、実行中Jobを失敗完了にしない。

## 8. 実装前にADRで確定するもの

- compute、managed DB、queue、cacheの具体サービスと最小冗長構成。
- Multi-AZ、backup retention、隔離先account／regionの費用対効果。
- tenant/site queue partition方式とFeature Object分離基準。
- `interactive_read / business_command / publication_write / billing_authorization / source_ingest / metric_rollup / search_rebuild / export`のworker／queue／DB pool対応、最低枠、weighted fair share、age昇格、hard cap。
- SLO、error budget、alert閾値、runbook owner、演習周期。
- traffic、記事数、keyword数、同時Job、Provider latencyを用いた基準負荷試験。

これらは未確定値であり、要求欠落ではなくADR／運用較正対象として管理する。

## 9. 検証証拠

- representative E2E traceとcorrelation検索。
- Site／Provider／Object障害注入で他domainが継続する証拠。
- DLQ redrive、checkpoint resume、二重課金・二重公開防止。
- circuit open／half-open／closeとKill Switch監査event。
- full／tenant restore演習記録とRPO/RTO実測。
- deployment canary失敗時のrollbackとJob再開。
- rollup／search rebuild／export同時飽和時も対話、認可、課金、公開の最低枠を維持し、Plan別weight適用下で下位Planがage昇格する負荷試験。
- Analytics Store／pre-aggregation停止時に業務Commandを維持し、旧Projectionをstale表示したままwatermarkから再構築・世代切替できる証拠。
