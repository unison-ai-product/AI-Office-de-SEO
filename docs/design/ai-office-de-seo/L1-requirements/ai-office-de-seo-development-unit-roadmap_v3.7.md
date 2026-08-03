---
document_id: AOS-L1-DEV-UNIT-ROADMAP
title: AI Office de SEO 開発ユニットロードマップ v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 開発ユニットロードマップ v3.7

## 分類別正本への移行

可用性・性能・RPO/RTOは `categories/non-functional-requirements_v1.md`、実装アーキテクチャ境界は `categories/technical-architecture-requirements_v1.md`、障害対応・保証は `categories/incident-warranty-requirements_v1.md`、AWS運用・復旧の対応付けは `../L3-implementation/ai-office-de-seo-aws-operations-recovery-map_v1.md`（AWS Operations／Recovery Map）を現在の正本とする。本書の `REQ-DUR-*` は開発順序の履歴・監査用として維持し、RPO/RTO等の数値判断は分類別正本を優先する。

## 1. 原則  ［REQ-DUR-01］

一発で全部作らない。開発ユニット単位で、基盤から順番に積む。

プロトタイプで概念実証済みのため、本ロードマップは実現可能性の検証ではなく、本番システムの構築順序を定める。プロトで最もリスクが下がっている本質部分（エージェントの仕組みとデータ整備）を、最優先の価値スパインとして先に本番化する。本質でない出力・課金・体験・自動化は後段に置く。

段階リリースのためのMVP境界は設けない。プロトタイプが存在し、価値検証のための市場投入区切りを別途切る必要がないためである。段階性はMVP区切りではなく、依存順とFeature Flag / Kill Switchで担保する。

## 2. 開発ユニット  ［REQ-DUR-02］

### DU-00 UT-TDD準備

要求・設計・受入条件・テスト対応を整える。

### DU-01 SiteSandboxContext

tenant/site/jobスコープを固定し、境界を越えないRepository層を作る。

### DU-02 URLマスター・本文非保持境界

canonical URL hash、article digest、temporary content TTLを作る。

### DU-03 WordPress連携・投稿形式チェック

WP接続、記事サマリー同期、投稿形式導出、下書き作成を実装する。

### DU-04 GSC Data Mart

サイト、URL、クエリ、URL×クエリの日次実績を蓄積する。

### DU-05 Keyword Map

正規化、SERPs集約、候補生成、メインキーワード軸、キーワード分類を作る。

### DU-06 競合Top5・Article Map

競合構造Pack、自サイトArticle Map、記事タイプ判定、カバー率を作る。

### DU-07 Pack / Ticket / Schema / Router

Catalog、Pack、Ticket、Source Extract、Snapshot、System Prompt Routerを作る。まずMock Executorで動かす。

### DU-08 Token / Credit / Observability

事前シミュレーション、Token Tracker、Prompt Cache Tracker、Credit予約を作る。

### DU-09 Research / Outline固定ワークフロー

Query Fanout、Research Brief、Outline Contractを作る。

### DU-10 新規記事の最小縦切り

ArticleSummary / Keyword Map / GSC → 新規記事recommendation → 採用 → Research → Outline → Meaning Unit Writing → QA → WP Draft。手動Keyword起点は補助経路として同じ下流契約へ合流する。

計測ファースト（本設計の3つの経験的仮説の検証をDU-10の受入に含める）:

1. レイヤー別の実測Prompt Cacheヒット率と原価前提（`REQ-BILL-06`）の乖離。
2. Repairループの収束率・停止ガード到達率・平均ループ回数（`REQ-AGENT-06`）。
3. 組立記事のコヒーレンス指標（`REQ-AGENT-11`のinter_unit_redundancy / term_consistency / coherence_flow合否）＋人手評価サンプル（件数は設定・要調整）。

3計測が取れない実装はDU-10完了と認めない。結果はしきい値・グレード係数・few-shotの初期較正（`REQ-ADM-10`）の入力とする。

### DU-11 リライトの最小縦切り

ArticleSummary / GSC Query Drift → リライトrecommendation → 採用 → Cause Analysis → Repair Ticket / Edit Plan → QA → WP Draft。

### DU-12 投稿予約・承認

承認、差し戻し、予約投稿、公開イベントを作る。

### DU-13 Stripe / Credit

サブスク、追加クレジット、台帳、Webhook、Customer Portal。

### DU-14 分散バッチ

keyword map、competitor top5、article map、GSC link、rewrite candidateをcheckpoint付きで回す。

### DU-15 Agent Office UI

通常ビュー完成後にAgent Officeビューを乗せる。演出は実イベントログと連動する。

### DU-16 Autopilot

manual運用の実績後に、制限付き自動化を追加する。

### DU-17 Production Hardening

検索・AI可視性は初期リリースの開発単位に含めず、リリース後にProvider仕様・日本対応・規約・原価を再調査する構想枠とする。採用する場合は次の依存順で試験し、Feature FlagでSite単位に開放する。

1. **DU-17A Crawler外形診断**: SEO／AI Bot別のrobots、meta、canonical、HTTP、redirect、本文可読性、JavaScript依存、WAF／認証兆候を外部probeで診断し、GSC・SERP／AIO・AI回答観測と取得性×表示性の二軸を成立させる。
2. **DU-17B 任意Crawler log実測**: AWS CloudFront／WAF、XServer等から取得可能なaccess logをConnectorまたは手動取込で受け、公式情報等で検証したBotだけを日次カウントへ集約して生logを削除する。設定難度があるため必須導入にせず、任意高度機能または問い合わせ案件とする。
3. **DU-17C Edge／Hosting Adapter拡張**: Cloudflare等を共通Crawler Observation Contractへ追加し、実環境のContract Test後に対応済みと表示する。
4. **DU-17D 可視性較正**: crawl、検索候補・順位、AI取得・引用・言及、referral、CVを時系列で接続し、Site／業界別のconfidence付き診断へ発展させる。

前段のデータモデルとURL／cluster識別子を後段でも継続し、upgrade時の再登録を要求しない。外形probeを実crawl、crawlをindex・引用、引用を流入・CVの証拠として扱わない。

監査、レート制限、コスト制御、失敗時復旧、運用監視を強化する。

## 3. 本質と推奨実装順序  ［REQ-DUR-03］

### 3.1 本質と非本質の切り分け

今回の本質は次の2領域である。実装はこの2領域を最優先の価値スパインとして先行させる。

- 本質A データ整備: URLマスター・本文非保持境界、GSC Data Mart、Keyword Map、競合Top5・Article Map、カバー率、Query Drift。エージェントが判断に使う一次データを、サイト境界内で正しく整える。
- 本質B エージェントの仕組み: Pack / Ticket / Schema / Router、Research / Outline固定ワークフロー、Meaning Unit生成・QA・Repairループ、エージェント観測（Token / Cache / QA fail / Schema validationの構造化ログ）、事前見積・予算ガード。

非本質・後段は、WP出力（投稿形式チェック・下書き・予約・承認）、分散バッチによるスケール、Stripe課金、Agent Office UI、Autopilotである。これらは本質が動いた後に載せる。

スコープ外（本ロードマップの構築対象に含めない）:

- 自己完結型オンボーディングUX。オンボーディングはコンサルティングとして提供し、そこで価格を取る。製品側は、接続・取り込み・レギュレーション設定の各機能を提供し、コンサルがそれを使う。
- アプリ内ヘルプ・FAQ。専用サイト構築で対応する。記事内のFAQ生成（faq_answer意味ユニット、FAQブロック、FAQハブ記事タイプ）は本質側の生成機能であり、これとは別物として維持する。

### 3.2 推奨実装順序（本質先行のフェーズ）

依存順を保ちつつ、本質A・Bを前段に寄せる。フェーズはリリース区切りではなく構築順序である。

- フェーズ0 土台: DU-00 UT-TDD準備 → DU-01 SiteSandboxContext → DU-02 URLマスター・本文非保持境界。全AIジョブと全データの境界・トレースの土台。
- フェーズ1 データ整備【本質A】: DU-04 GSC Data Mart → WP取り込み（DU-03のうち接続・記事サマリー同期・サンプル記事取り込み）→ DU-05 Keyword Map → DU-06 競合Top5・Article Map。オンボーディングはコンサル同伴で行い、製品はこの取り込み機能を提供する。
- フェーズ2 エージェント中核【本質B】: DU-07 Pack / Ticket / Schema / Router（まずMock Executor）→ エージェント観測と事前見積（DU-08のうちToken / Cache / Observability・事前シミュレーション）→ DU-09 Research / Outline固定ワークフロー。
- フェーズ3 生成の実証【本質Bの縦切り】: DU-10 新規記事の最小縦切り → DU-11 リライトの最小縦切り（GSC Query Drift → Cause Analysis → Repair → QA）。ここまでで本質A・Bが実データで一気通貫する。
- フェーズ4 出力・スケール【後段】: WP出力（DU-03のうち投稿形式チェック・下書き・予約）＋ DU-12 投稿予約・承認 → DU-14 分散バッチ事前計算。
- フェーズ5 商用化・体験・自動化【後段】: DU-13 Stripe / Credit（クレジット台帳・追加購入。オンボーディングのコンサル課金と併存）→ DU-15 Agent Office UI → DU-16 Autopilot → DU-17 Production Hardening。

補足: DU-03「WordPress連携」は、取り込み側（フェーズ1）と出力側（フェーズ4）に分けて実装する。DU-08「Token / Credit / Observability」は、観測・事前見積（フェーズ2）とクレジット台帳・課金（フェーズ5）に分けて実装する。

## 4. Feature Flag / Kill Switch  ［REQ-DUR-04］

各開発ユニットおよびユーザー影響のある機能は、独立したFeature Flagの背後で出荷する。

- 各DUはFeature Flagで有効化・無効化できる。無効化時は、直前の安定状態へgracefulに縮退する。
- 少なくとも、外部情報源取得、生成・リライト実行、投稿予約、Autopilot（full_auto）、Agent Officeビュー、分散バッチは、それぞれ独立したKill Switchを持つ。
- Kill Switchはtenant/site単位とサービス全体の両粒度で作動できる。作動時は進行中ジョブを安全に停止・解放し、監査ログに理由を残す。
- full_autoのKill Switch作動は、承認済み予約を保留へ戻し、公開を止める。
- Flag/Kill Switchの状態変更は監査ログに残す。

## 5. 禁止事項  ［REQ-DUR-05］

- 実LLM接続より前にPack / Ticket / Schemaを飛ばさない。
- WP反映より前に投稿形式チェックを飛ばさない。
- Autopilotを手動ワークフロー完成前に作らない。
- Agent Office演出を実イベントログなしに先行しない。
- 夜間バッチをcheckpointなしに全量化しない。
- 本質（データ整備・エージェント仕組み）より先にWP出力・課金・Agent Office・Autopilotを本番化しない。
- Kill Switchを持たない自動化・外部取得・生成経路を本番に出さない。

## 6. キャパシティモデルとインフラ段階構成  ［REQ-DUR-06］

- 資源プロファイル: テナント1社あたりの標準負荷モデル（サイト数・記事数・キーワード数・GSC日次行数・夜間バッチCPU分・DB行数/ストレージ・ベクトル索引サイズ）を定義し、負荷試験と実運用計測で実数を確定する（実数はL3計測・Config/Cost Table吸収。常駐メモリを持たない設計 `REQ-PRODUCT-18` が前提）。
- 密度の健全域: ノード（初期はVPS）あたりの**健全テナント数**を、利用率しきい値（CPU・メモリ・DB接続・ストレージ・バッチ窓の消化率）で定義する。しきい値超過の接近をADM-S4で監視し、超過前にスケール判断（垂直→水平分割）を行う移行トリガを持つ。
- 段階構成: 初期=単一VPS（アプリ＋ワーカー＋PostgreSQL同居・グローバル信号ストアは同居別スキーマ=Gate A-2決定）→ 第2段階=DB分離・ワーカー分離 → 第3段階=テナントシャーディング。各段階の移行は境界API（Gate A-2）を変えずに行えることを要件とする。ネットワークは外向き（WP/外部API egress・許可先管理）と内向き（HTTPS終端）を分離し、集約パイプラインはアプリから到達不能（`REQ-SEC-07`）。
- インフラ原価の配賦: ノード費÷健全テナント数＝**1社あたり基盤原価**として原価モデル（`REQ-BILL-06`/`REQ-ADM-04`）へ組み込み、プラン粗利の計算に反映する。密度実測が変われば配賦単価をCost Table側で更新する（要求へのハードコード禁止 `REQ-BILL-10`）。

## 7. 実行基盤の実装規約（環境・デプロイ・キュー・ストレージ）  ［REQ-DUR-07］

- 環境分離: dev / staging / prod を分離し、staging はダミーテナントで本番同型（外部APIはスタブ/低予算）。構成はコード管理（IaC）し、手作業構成変更を禁止する。
- デプロイとジョブの整合: デプロイは**graceful drain**——新規ジョブ受付を停止→実行中はステージ境界checkpointで安全に一時保留（`REQ-AGENT-10`）→切替→自動再開。バッチ窓（`REQ-SRC-10`）を避けたデプロイ時間帯を既定とする。ロールバックは直前版へ即時復帰可能であること。
- マイグレーション: DDL変更は後方互換（expand→migrate→contract）を原則とし、破壊的変更は保留ジョブゼロを確認して適用。version固定資産（Pack/Workflow/Config）の再現性を壊さない（`REQ-PACK-04`）。
- ジョブキュー: 初期はPostgreSQLベースのキュー（同一クラスタ・運用単純化）とし、キュー水位・遅延が しきい値を超えた段階で専用MQへ移行する（移行トリガは`REQ-DUR-06`の段階構成と同期。実数は計測）。
- オブジェクトストレージ: 一時本文・debug snapshot・エクスポート成果物・バックアップはS3互換オブジェクトストレージへ置き、VPSローカルディスクを恒久置き場にしない（DR・スケール・容量分離）。TTL物はライフサイクルで自動削除（`REQ-SEC-11`）。
- 時刻規約: 保存はUTC、表示・スケジュールはテナントのタイムゾーン（`REQ-SRC-10`）で解決する。

## 8. バックアップとリカバリ目標  ［REQ-DUR-08］

- 目標値: 認証、権限、契約、課金台帳、クレジット、公開命令、同意記録等の正本データは、分類別正本 `REQ-IRG-06` の初期内部目標 **RPO 1時間、RTO 4時間** を使用する。値は `REQ-ADM-09` で版管理し、負荷試験・復元演習で達成可能性を検証する。DBは日次フルバックアップに加えてWALによるPITR（ポイントインタイム復旧）を備え、日次フルだけをRPO達成根拠にしない。
- 隔離保管: バックアップは稼働ノードと**別の障害ドメイン**（別リージョン/別プロバイダのオブジェクトストレージ）へ暗号化保管し、同一VPS内のみの保管を禁止する。
- テナント単位復旧の設計判断: 共有DBのPITRは全体巻き戻しになるため、**日次のテナント別論理エクスポート**（tenant_idスコープ）を併用し、単一テナントの誤操作・破損はエクスポートからの選択復元で対応する（`REQ-SEC-10`のオフボーディングエクスポートと同型式）。
- 演習: 復元リハーサル（全体PITR・テナント単位の双方）を定期実施し、結果・所要時間をADM-S11へ記録する（`REQ-ADM-08`）。演習未実施期間のアラートを持つ。

## 9. コンテナ化と移管性（VPS→クラウド）  ［REQ-DUR-09］

- 不変イメージ: 全サービス（アプリ・ワーカー・集約パイプライン）をコンテナイメージとしてビルド・配布し、環境差は設定注入のみで吸収する（イメージにシークレット・環境固有値を焼き込まない）。パッチ適用は「イメージ再ビルド→再デプロイ」で行う（`REQ-DUR-07`のデプロイ規約に従う）。
- 段階実行: VPS段階はCompose相当のコンテナ実行、クラウド段階はマネージドコンテナ実行環境へ**同一イメージのまま**移行する。移行時に境界API（Gate A-2）・イメージ・データ契約を変えないことを要件とする（`REQ-DUR-06`の段階構成の実装形）。
- 状態の外部化: コンテナは使い捨て（ステートレス）とし、状態はPostgreSQL・S3互換ストレージ・キューに置く（`REQ-DUR-07`/`REQ-PRODUCT-18`）。**クラウド中立プロトコル**（PostgreSQL互換・S3互換API・SMTP/送信アダプタ）を選定基準とし、特定クラウド専用APIへの直接依存はアダプタ層に隔離する（例示: マネージドPostgreSQL・オブジェクトストレージへの差し替えが設定変更で済むこと）。
- 移管リハーサル: クラウド側にstaging同型を構築してバックアップからの復元・切替を演習し（`REQ-DUR-08`の演習と統合）、移管手順書を保守する。

## 10. 自動復旧と自動保守  ［REQ-DUR-10］

- 自動復旧（self-healing）: 全サービスにヘルスチェックを備え、異常時はコンテナ自動再起動・ジョブの再スケジュールを行う。実行中ジョブはcheckpoint（`REQ-AGENT-10`）から**無人で再開**し、再開不能なものは保留＋通知に落とす（fail-close）。ノード追加・交換はIaC（`REQ-DUR-07`）から自動プロビジョニングできること。
- 自動保守: TLS証明書の自動更新、ログローテーションと保持期間、TTL物・一時領域の自動クリーンアップ（`REQ-SEC-11`）、DB定期メンテナンス（vacuum/analyze相当）、ディスク・リソースの自己監視としきい値前アラート（`REQ-ADM-07`）。
- 統制: すべての自動アクション（再起動・再スケジュール・クリーンアップ・証明書更新）は監査ログ・イベントに記録し、頻発（フラッピング）は管理者へ通知して自動化を一時停止できる（Kill Switch配下、`REQ-DUR-04`）。
