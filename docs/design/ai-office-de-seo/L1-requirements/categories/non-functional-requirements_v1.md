---
document_id: AOS-L1-NON-FUNCTIONAL-REQUIREMENTS
title: AI Office de SEO 非機能要求 v1.0
version: 1.0
layer: L1
kind: non_functional_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 非機能要求

## 責務

機能が成立するための性能、可用性、拡張性、保守性、復旧性、移植性を定義する。

重点:

- 主要一覧初期表示、操作応答、ジョブ投入のP95
- 画面シェル先行表示と部分読込
- クライアント配信量、API本数、DBクエリ数の予算
- DB容量、走査行数、保持量、増加率
- 増分計算、非同期化、キャッシュ、事前計算
- 可用性、RPO/RTO、バックアップ、復元演習
- graceful drain、後方互換migration、ロールバック
- VPSからクラウドへ移せる境界

性能はProduction Hardeningで後付けせず、各開発ユニットの受入条件に含める。

可用性目標に対するincident対応、SLA補償、成果非保証の境界は `incident-warranty-requirements_v1.md` を参照する。

既存ソース: `ai-office-de-seo-security-observability-requirements_v3.7.md` §6、`ai-office-de-seo-development-unit-roadmap_v3.7.md` §6〜10。

## 要求

### REQ-NFR-01 体感性能

画面シェル、現在Site、主要ナビゲーション、操作可能な既存データを先に表示し、推薦再計算、集計、外部取得の完了を待たせない。長時間処理は非同期化し進行状態を表示する。

### REQ-NFR-02 画面性能目標

通常利用条件における主要画面は一般的なWeb指標を使用し、Core Web VitalsのLCP、INP、CLSと、TTFB、初期操作可能時間、ジョブ受付時間をP50/P75/P95で計測する。目標値はGoogleが公開する「良好」基準を基線とし、対象画面、端末、ネットワーク条件を固定して継続評価する。重い処理の処理時間そのものをUI演出で隠さず、非同期化とAgent Officeビューの実状態表示によって待ち時間を理解可能な体験へ変換する。

### REQ-NFR-03 配信・取得予算

主要画面ごとに初期JavaScript、初期API本数、API payload、DB query、走査行数の予算を持つ。一覧はページングし、Article Summary等の一覧表示に記事本文取得を使用しない。

### REQ-NFR-04 バックグラウンド性能

記事同期、解析、推薦生成、AI実行はキュー滞留時間と処理時間をP50/P95で計測する。負荷増加時はUI/APIを優先し、バッチの同時実行、優先度、rate limitを調整して対話操作への影響を抑える。

### REQ-NFR-05 容量効率

Site当たりの記事、キーワード、推薦、施策、監査、Article Summaryの基準容量と上限を定義し、保存量と増加率を監視する。本文非保持、差分更新、ロールアップ、世代削除によりデータ量が利用期間に比例して無制限に増えないようにする。

### REQ-NFR-06 可用性

初期リリースの内部SLOは月間99.5%を基線とする。ユーザーAPI、ジョブ受付、管理面、課金、公開、AI生成、WordPress連携、計測を機能別に計測し、一部機能の障害をサービス全停止と集計しない。計測、error budget、違反検知、顧客通知経路を販売開始前に実装する。内部SLOと契約上のSLA・service creditは分離し、販売プランごとの保証値は別途版管理する。

販売開始前と主要構成変更時にSPOF台帳を更新し、認証、認可、DB、queue、object storage、cache、Feature Object Registry、Pack Resolver、secret、DNS、edge、外部Provider、運用者権限について、単一故障時の影響、検知、冗長化、再生成、failover、手動代替、許容停止時間を記録する。SPOFを一律に二重化せず、RTO／RPO、費用、復旧可能性に応じて除去・冗長化・迅速復旧を選ぶ。

### REQ-NFR-07 復旧性

認証、権限、契約、課金台帳、クレジット、公開命令、同意記録等の正本データは、初期内部目標をRPO 1時間、RTO 4時間とする。記事生成、解析、推薦等はcheckpointと冪等再実行で復旧し、正本データと同じ復元方式を強制しない。プロセス・worker・接続等の機械的に回復可能な障害はhealth check、再起動、再試行、failoverで即時の自動復旧を試行する。返金、契約、顧客連絡等の人間・金銭対応は営業日単位の期限を別に定義する。

### REQ-NFR-08 劣化時動作

外部Provider、GSC、WordPress、メール、検索データが利用不能でも、既存データの閲覧、状態確認、取消、障害案内を可能な範囲で維持する。重い機能を停止し、stale表示、再試行予定、代替手段を提示する。

障害は機能、Provider、キュー、Site等の障害ドメイン内へ封じ込め、単一機能の異常でサービス全体を停止させない。circuit breaker、bulkhead、独立Kill Switch、キュー分離を適用し、依存しない機能を継続する。

Feature Objectごとにtimeout、concurrency、queue、credit／cost、memory、storage、external call、error budget、Kill Switchを分離する。Objectの初期化失敗、例外連鎖、event storm、schema不一致、依存停止時は当該Objectと依存経路だけを停止し、Core起動、ログイン、契約・課金正本、既存データ閲覧、他Objectを継続する。

### REQ-NFR-09 拡張性・移植性

初期構成を過剰に分散させず、API、worker、DB、cache、queue、object storage、Provider Adapterの境界を保つ。負荷または可用性要求が上がった際に、責務単位で分離・移行でき、単一VPS等の初期配置へ不可逆に密結合しない。

初期実装はモジュラーモノリスとmanaged queueを基本候補とし、Feature Objectごとの契約・所有データ・実行budget・障害境界をコード上で強制する。Object化を物理microservice化と同義にせず、負荷、障害頻度、独立deploy、権限隔離の実測根拠があるObjectだけを後から別process／serviceへ抽出できるようにする。

### REQ-NFR-10 保守性

API・イベント・DB変更は後方互換期間とロールバックを持ち、設定・Prompt・Provider変更をコードデプロイから分離する。主要な運用操作は管理画面または承認済みCLIで再現可能にし、属人的なDB直接更新へ依存しない。

Feature Objectには契約テスト、依存グラフ検査、install／upgrade／uninstallテスト、障害注入、Coreなし／Objectなし双方の起動試験を要求する。Object数、依存深度、循環、Core変更率、Object別障害件数、upgrade失敗率を保守性指標として計測し、Object化そのものを保守性向上の証拠にしない。

### REQ-NFR-11 アクセシビリティ

主要ユーザー画面はキーボード操作、可視focus、適切なcontrast、フォームラベル、エラー関連付け、reduced motionに対応する。アクセシビリティは画面完成後の追加対応ではなく、共通コンポーネントと受入試験へ含める。

### REQ-NFR-12 性能回帰防止

各開発単位で代表データ量の性能計測を行い、画面、API、query、ジョブ、保存量の予算超過を検出する。重大な回帰はリリースを停止し、例外は期限、理由、改善計画を記録する。

### REQ-NFR-13 原因特定速度

障害・遅延・外部連携失敗は、検知から相関IDによる対象tenant、Site、記事、ジョブ、処理stage、Provider、直前の再試行、失敗分類へ到達できなければならない。主要alertは担当者が追加の本番DB調査や本文閲覧をせず原因候補と影響範囲を確認できるdashboard、trace、構造化log、runbookリンクを持つ。検知時刻、調査開始、原因特定、封じ込め、復旧の所要時間を計測し、MTTD、MTTA、MTTI、MTTRとして継続改善する。

### REQ-NFR-14 AWS運用基線

本番配置はAWSを前提とし、AWS Well-Architected Frameworkの運用、信頼性、性能効率、コスト最適化を定期確認する。観測はCloudWatchを中心にmetrics、logs、tracesを統合し、OpenTelemetry互換のinstrumentationを採用する。静的配信とcache可能な読取はCloudFront等のedge cacheを利用し、API・画面originへの負荷とlatencyを抑える。非同期処理はqueueとdead-letter queueで隔離し、滞留、再試行、失敗理由、redriveを観測可能にする。

### REQ-NFR-15 データ量・処理量Capacity

プランと実行基盤の容量は記事生成本数だけで表さず、少なくとも次の独立したCapacity Dimensionを持つ。

- 管理規模: Site数、公開・管理記事数、キーワード・Query数、ユーザー数
- 保存量: Article Summary、施策・順位・CV履歴、監査、画像、バックアップ、索引、object storage
- 取込量: GSC行数、WordPress同期件数、外部検索・市場データ、計測event
- 計算量: 差分解析、推薦再計算、集計、embedding、AI job、画像job
- 瞬間負荷: 同時job、queue投入率、API request、DB走査行数、外部Provider rate

各Dimensionは使用量、soft limit、hard limit、期間、集計単位、超過時動作をversion付き設定として持つ。単一の不透明な総合点だけへ集約せず、DB、worker、storage、network、Providerのどこが制約かを判別可能にする。追加creditはAI実行可能量を増やしても、同時実行、DB走査、外部rate等の安全上限を解除しない。

記事同期は初回全体取込と通常の更新差分を別meterで計測し、管理記事数、月間変更記事数、取得bytes、render取得数、再試行数をPlan Capacityの入力とする。通常同期を定期全件crawlの回数で販売せず、Site規模と実際の更新量に応じてPlan推奨・自動構築期間・処理待機を決定する。

soft limitでは予測到達日と削減・Plan変更候補を通知する。hard limitでは既存データを削除せず、新規取込・低優先再計算・生成jobを対象Dimensionごとに遅延または保留する。ロールアップ、期限削除、archive、増枠、Plan変更後に安全に再開できるようにする。

負荷試験は基準Site、上限近傍Site、急増Site、複数tenant同時実行を含み、特定tenantの大量データまたは再計算が他tenantの対話API、公開、課金、権限操作を劣化させないことを確認する。初期上限値は実装・β測定で決定し、CPU、memory、DB latency・IO、queue滞留、storage増加、egress、Provider rate、原価から較正する。

## 受入条件

- [ ] AC-L1-NFR-01: 推薦再計算中でも画面シェルと既存データを操作できる。
- [ ] AC-L1-NFR-02: Core Web Vitalsと主要画面・ジョブ受付のP50/P75/P95を継続計測できる。
- [ ] AC-L1-NFR-03: 主要画面の配信量、API、query、走査行数に予算がある。
- [ ] AC-L1-NFR-04: バッチ負荷時も対話APIの性能目標を維持できる。
- [ ] AC-L1-NFR-05: 基準容量で保存量が設定上限内に収まる。
- [ ] AC-L1-NFR-06: 商用開始前にSLO、error budget、通知経路が確定している。
- [ ] AC-L1-NFR-07: 自動回復可能な障害は即時復旧を試行し、人間・金銭対応は定義した営業日期限内に完了する。
- [ ] AC-L1-NFR-08: 外部・個別機能障害時も非依存機能、既存データ閲覧、状態確認を継続できる。
- [ ] AC-L1-NFR-09: Providerまたは実行基盤を責務境界内で交換できる。
- [ ] AC-L1-NFR-10: 通常運用が本番DB直接更新を必要としない。
- [ ] AC-L1-NFR-11: 主要操作のキーボード・focus・contrast検査を通過する。
- [ ] AC-L1-NFR-12: 性能予算の重大回帰がリリースゲートで検出される。
- [ ] AC-L1-NFR-13: 相関IDから対象顧客・Site・記事・ジョブ・stage・外部依存の原因候補へ到達でき、MTTD/MTTA/MTTI/MTTRを計測できる。
- [ ] AC-L1-NFR-14: AWS上でmetrics、logs、traces、queue滞留、DLQ、edge cache hit率をdashboardとalertから確認できる。
- [ ] AC-L1-NFR-15: 管理規模・保存量・取込量・計算量・瞬間負荷をDimension別に計測・制限し、上限近傍tenantの処理中も他tenantの対話・公開・課金経路を維持できる。
