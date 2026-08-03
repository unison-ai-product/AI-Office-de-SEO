---
document_id: AOS-L3-ADMIN-SCREEN-INVENTORY
title: AI Office de SEO 開発管理者コンソール 画面一覧 v3.7
version: 3.7
layer: L3
kind: design
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L3-02-ai-office-de-seo-screen-prototype
---

# AI Office de SEO 開発管理者コンソール 画面一覧

ユーザー向け画面（AOS-L3-SCREEN-INVENTORY）と分離した運用面（REQ-ADM-01）。「コードを見なくても運用できる」ことを設計目標とし、ログ閲覧・モデル/プロンプト調整・入金/コスト管理をすべて画面から行えるようにする。

## 0. 全画面共通の不変条件（先に固定）

- 表示禁止: APIキー原文 / secret復号値 / master key / 記事本文全文 / プロンプト全文 / provider raw response全文（REQ-ADM-01/03, REQ-SEC-11。検証: AC-ADM-01）。シークレットはmask表示のみ（REQ-BILL-05）。
- 内部ロールと顧客ロールを分離する。Platform Adminが、対象顧客・Site・操作・期限を指定してManagerへ顧客アクセスを付与し、Operatorは開発・運用ログ確認に限定する。顧客ユーザーは内部管理領域へアクセスできない（REQ-ADM-06。検証: AC-ADM-02）。
- 重要操作（手動クレジット・provider変更・Flag/Kill Switch・価格改定・Pack公開）は理由・承認者つき監査ログ必須（REQ-ADM-05/06/10）。
- 安全不変条件（サンドボックス・本文非保持・境界・監査・承認制御・APIキー非表示）はどの画面からも緩められない（REQ-ADM-09。検証: AC-ADM-06）。
- 全画面で内部キー・開発用語は日本語ラベル＋キー併記で表示する（表示ラベルレジストリ、REQ-ADM-11。未登録キーは「ラベル未登録」印でfail-visible。検証: AC-ADM-10）。
- レイアウトは左サイドメニュー（ADM-S1〜S12）＋画面内タブ（REQ-NAV-02の同型）。**編集第一原則**: 運用上の差し替え・追加でコードを触らない対象（下記§1.5）は、対象の一覧→詳細→編集→統制フロー（draft→Preview/影響確認→Validate→Approve→Publish）まで各画面に実装する。閲覧専用にしない（AC-NAV-05）。

## 1. 画面台帳

| # | 画面 | できること | 主データ | 根拠 |
|---|---|---|---|---|
| ADM-S1 | 運用ダッシュボード | golden signals（レイテンシ/トラフィック/エラー/飽和）、SLO・アラート状況、ステータス、インシデント一覧・runbook導線（**起票・更新・クローズ、アラートのack操作**）、**運営お知らせの作成・対象選択・配信（REQ-PRODUCT-16）**、公開ステータスページの更新、**メール送達性の監視（バウンス/苦情率・DMARCレポート・抑制リスト。REQ-PRODUCT-21）**、**自動復旧・保守イベント（再起動/再スケジュール/証明書更新/クリーンアップ、フラッピング検知と自動化一時停止。REQ-DUR-10）**、異常ログイン/不正利用検知、**管理者向け通知の集約**（Webhook失敗・Health Check失敗/Canary rollback・原価乖離・境界違反試行・接続サイト別プラグインversion更新有無） | メトリクス集約、SLO定義、インシデント記録、通知イベント | REQ-ADM-07, REQ-PRODUCT-11, REQ-WPA-07（AC-ADM-04, AC-NOTIF-01） |
| ADM-S2 | 課金・プラン・原価管理 | Stripe Product/PriceとPrice Catalog／Plan Configurationの対応付け、税・coupon・dunning・返金／chargeback、Webhook状態・reconciliation、Subscription、credit lot、利用明細、失効予定、自動チャージ、課金上限、限定Trial、Capacity商品、プラン別販売価格・決済原価・AI原価・粗利を管理する。初期CatalogはEntry 39,800円／Standard 98,000円／Premium 198,000円／Enterprise 398,000円〜（月額換算・税別）、Entry／Standardは月契約または年契約、Premium／Enterpriseは年契約とする。価格・付与credit・品質別消費・Site／ユーザー／容量上限はdraft→影響Preview→Approve→effective_from指定でversion改定し、既存契約へ遡及しない。手動調整は理由・元取引・実行者・承認者を必須とする。導入支援・カスタマイズは本体月額と分離した商品／Statement of Workとして扱う | Price Catalog、Plan Configuration、Subscription、credit ledger、Capacity、Stripe対応表、原価集計 | REQ-ADM-02, REQ-BILLING-01〜16, REQ-COST-* |
| ADM-S3 | LLMプロバイダ・モデル管理 | Provider Adapter Registry / Provider Profile / Model Catalog / Capability Matrix / Cost Table の登録・編集、Health Check状況、Canary/Rollout・自動rollback（**手動rollback・モデルの有効/無効切替の操作**）、Provider非依存Routing Policy（品質・Capability・原価・latency・health・契約条件から解決し、Kimi／Grok／Qwen系／local LLM等も同じ評価契約へ載せる）、**Routing Impact Preview（変更前に対象tenant/site/workflow・予測コスト・latency差分を提示）**、API key alias管理（原文非表示・mask） | provider系テーブル一式 | REQ-ADM-03, REQ-TECH-10, REQ-COST-11, REQ-BILL-04/05/09 |
| ADM-S4 | コスト・観測ダッシュボード | preflight estimate vs actual、workflow/ticket/provider/model別 token・cost、**Prompt Cache hit率・creation/read tokens・miss理由・想定vs実測ヒット率と原価乖離（tenant/site/workflow別）**、error/retry率、schema validation fail率、QA fail率、repair loop平均回数、DataForSEO cost、crawler fallback率、WP validation fail率、budget overrun件数、**GSCクエリ⇔キーワードのマッチ率（クリック加重・段別内訳・tenant/site別。辞書較正の入力、REQ-KGA-15）**、**実行レーン別のtoken・cost・割引効果と、バッチ失敗・SLA超過・interactiveフォールバック率（差額監視。REQ-BILL-11）**、**監視・増分計算の運用原価（クレジット外）と全件再計算の発生監視、自動変更予算の消費・振動検知（REQ-PRODUCT-18）、導出事実ストアのサイズ・ヒット率＝再調査省略効果（REQ-PRODUCT-19）**、**プラットフォーム負荷平準化ビュー（テナント別バッチ窓ヒートマップ・窓内オフセット分散状況。REQ-SRC-10）、ノード密度・利用率とキャパシティしきい値接近（1社あたり基盤原価の配賦単価表示。REQ-DUR-06）、サマリー参照による本文取得省略効果（REQ-PRODUCT-20）**。設定: workflow別max token、tier別budget、DataForSEO日次上限、cache TTL、retry/repair上限、circuit breaker、debug snapshot export（本文全文除く） | usage_traces、REQ-SEC-02の記録項目一式 | REQ-ADM-04, REQ-SEC-03, REQ-BILL-06（AC-ADM-08, AC-COST-02/03, AC-BILL-01/02） |
| ADM-S5 | 監査ログビューア | append-only監査ログの検索・閲覧（actor / action / resource / tenant / changes diff / ip / user_agent）。対象: 境界違反試行・シークレットアクセス・Role変更・Flag/Kill Switch・課金操作・full_auto有効化・期限付き顧客アクセスの付与/操作/失効記録。テナント分離ビュー | audit_logs（REQ-ADM-06スキーマ） | REQ-SEC-10, REQ-ADM-06（AC-SEC-06, AC-ADM-03） |
| ADM-S6 | ジョブ・トレースビューア | **構造化ジョブログの閲覧**: job_id / ticket_id / executor_kind / workflow_key / prompt_pack_keys / schema_keys / token・cache・credit実績 / error_code / qa_result / snapshot_hash。request_id・tenant_idで相関するログ/メトリクス/トレースの横断（OpenTelemetry等）、**検索・フィルタ操作とdebug snapshot export（本文除く）への導線**、契約検証結果（forbidden output / hallucinated source / sandbox境界 等）。**注: 本文・プロンプト全文は保存禁止のため表示不可＝hashとメタデータで追う設計**（これは制約ではなく安全不変条件） | usage_traces、契約検証結果 | REQ-SEC-02/13, REQ-ADM-07（AC-COST-02, AC-SEC-12, AC-ADM-04） |
| ADM-S7 | 設定レジストリ（数値パラメータ） | 価格・クレジット単価・品質グレード係数・品質しきい値・Fanout facet重み・GSC取り込みスコープ・Batch優先度・クォータ・TTL・retry/loop上限・Autopilot許可レベル等の閲覧・**編集（値エディタ・差分表示・新キー追加はスキーマ制約内）**・改版。version/effective_from/effective_to/status、draft→active、影響プレビュー、グローバル→プラン→テナント/サイト上書き。**安全不変条件キーは一覧に出さない（設定対象外の技術的強制）**、ネットワーク学習由来のprior・しきい値較正提案の承認キュー（REQ-PRODUCT-13） | config_registry | REQ-ADM-09, REQ-BILL-10（AC-ADM-06, AC-BILL-07） |
| ADM-S8 | Pack・プロンプト・ゲート管理 | **Prompt Pack / Catalog（article_type / heading_flow / purpose_element / quality_gate / writing_method / review_lens / reader_segment）/ AI定型表現辞書 / UIテキストレジストリ（ui.text.*） / few-shot / Workflow定義を、コード変更なしで編集**。draft→Preview→Validate→Approve→Publish（新version発行）。影響プレビュー（対象Workflowバインディング・tenant/site・Prompt Cache無効化範囲）。few-shot↔gate定義の単一ソース整合検証（正例がLowestを模範化していないか）。ネットワーク学習由来のグローバル辞書候補（k匿名昇格）の承認キュー（REQ-PRODUCT-13）。表示ラベルレジストリの追補・改版（REQ-ADM-11）。**編集操作の明記: 新規作成・複製・テンプレート/本文編集エディタ・few-shot正例/反例の追加/削除・辞書/タクソノミ行編集・通知テンプレート編集・差分プレビュー・Validate結果表示・承認→公開→版履歴→ロールバック（旧版を新版として再公開）。**公開済みversion不変・freeze済みジョブの再現性保持、**ゴールデン評価の実行・現行版比較・回帰デルタ表示、段階ロールアウト（canary割合）の指定と活性化後QA fail率監視・ロールバック提案（REQ-ADM-10拡張）** | Pack/Catalog/Workflow各Registry | REQ-ADM-10, REQ-PACK-04/11/12, REQ-AGENT-06（AC-ADM-09） |
| ADM-S9 | 顧客・ユーザー運用 | 登録ユーザー・顧客組織情報、利用状況、Platform AdminによるManagerへの期限付き顧客アクセス付与（対象顧客・Site・操作・期限を指定し、開始/終了と全操作を記録）、Operatorの顧客データ・顧客画面アクセス禁止、**オーナー回復手続き（本人確認記録→統制付き移譲・双方通知・全監査。REQ-SEC-16）**、**マスターテナントのプロビジョニング（開発者アカウント配下・internal区分）と事例掲載許諾の台帳（許諾範囲・撤回状態。REQ-PRODUCT-23）**、顧客組織オフボーディング（tenant_idスコープ削除・エクスポートの**実行と完了確認**）、同意ログ | tenants / memberships / consent_log | REQ-ADM-05/06/08, REQ-SEC-10（AC-ADM-02/03/05, AC-SEC-07） |
| ADM-S10 | Feature Flag / Kill Switch | DU別・機能別Flagの状態と切替（**ロールアウト順序: master→canary→一般。REQ-PRODUCT-23**）、Kill Switch（外部取得 / 生成・リライト / 投稿予約 / full_auto / Agent Office / 分散バッチ）のtenant/site単位・サービス全体の作動・**解除**、作動時の進行中ジョブ安全停止と理由記録、直接公開の承認・停止制御 | feature_flags / kill_switches | REQ-DUR-04, REQ-ADM-05（AC-REL-01〜03） |
| ADM-S11 | データ保護・DR運用 | データエクスポート/削除の**実行・再実行**と実行状況、保持ポリシー、シークレットローテーション状況、バックアップ・復元リハーサル記録（**記録の追加**。RPO/RTO目標と実測・PITR/テナント単位復元の演習結果・未実施アラート。REQ-DUR-08） | 保持ポリシー・DR記録 | REQ-ADM-08（AC-ADM-05） |
| ADM-S12 | サポートデスク | チケットキュー（優先度=severity×プラン・SLA監視・担当割当・状態）、AI会話要約と文脈参照の閲覧、定型返信、期限付き顧客調査の権限申請（ADM-S9）への導線、**解決ナレッジのFAQ還流起票（ADM-S8統制で公開）**、deflection率・エスカレーション率・SLA遵守の計測 | support_tickets、SLA定義 | REQ-PRODUCT-22（AC-SUPPORT-02） |

## 1.5 編集可能オブジェクト台帳（コードを触らず差し替え・追加できる対象の正本）

| 対象 | 画面 | 統制 |
|---|---|---|
| Prompt Pack本文・注入テンプレート / few-shot / Workflow定義 / Quality Gate定義 | ADM-S8 | draft→Preview→Validate→Approve→Publish（REQ-ADM-10） |
| 辞書・タクソノミ（modifier/entity/業界/類語）/ 表示ラベル / 通知テンプレート / カスタムレシピ（コンサル登録） | ADM-S8 | 同上（Catalog版固定） |
| 価格・単価・グレード係数・プラン・Credit Pack・Stripe対応付け | ADM-S2（＋ADM-S7） | effective_from・影響プレビュー・承認（REQ-BILL-10） |
| しきい値・クォータ・TTL・優先度・レーン係数・k値等の数値 | ADM-S7 | version・影響プレビュー（REQ-ADM-09） |
| Model Catalog・Cost Table・Routing Policy | ADM-S3 | Canary/Rollback・Routing Impact Preview（REQ-BILL-09） |
| office_layout（部屋・ペルソナ・フロア） | ADM-S8 | JSON編集＋Validate（REQ-AOUI-07） |
| Feature Flag / Kill Switch | ADM-S10 | 理由必須・監査（REQ-DUR-04） |

※安全不変条件（REQ-ADM-09）はこの台帳に載らない＝どの画面からも編集不可。
※プロト確認事項: 管理コンソールに「Agent Officeビュー」切替が存在するが要求外。ManagerがADM-S9で対象顧客・Site・操作・期限を限定した権限を付与された場合のみ対象状態を確認でき、独立のビュー切替としては実装しない。

## 2. ユーザーからの主要な問いへの対応（設計根拠）

- **ログは見れるか** → ADM-S5（監査）＋ADM-S6（ジョブ・トレース）で網羅。ただし本文全文・プロンプト全文・APIキー原文は保存禁止（REQ-SEC-11）のため、hash・メタデータ・差分で追跡する。「見れない」のではなく「保存しない」が正であり、デバッグはdebug snapshot export（本文除く、ADM-S4）とsnapshot_hash照合で行う。
- **プロンプト・AIモデルの細かな調整** → モデル・ルーティング・コスト＝ADM-S3（既存REQ-ADM-03/BILL-09）。プロンプト内容（Pack/few-shot/ゲート定義）＝ADM-S8（本改訂で新設のREQ-ADM-10）。数値しきい値＝ADM-S7。3画面でコード変更なしの調整範囲を完結させる。
- **入金・コスト** → 入金＝ADM-S2のWebhook受信状態・reconciliation・台帳・手動クレジット。コスト＝ADM-S4の原価実測・乖離監視＋ADM-S7の単価・係数改定。いずれも要求上「要求書・コードにハードコードしない」（REQ-BILL-10）ため、実数の変更は画面から完結する。

## 3. プロトへの組み込み

管理コンソールは AOS-L3-PROTOTYPE-PLAN のPT-6（管理面トラック）で扱う。優先はADM-S8（Pack管理＝運用の中核で新設要求の検証が必要）→ ADM-S4（コスト観測）→ ADM-S2（課金・入金）。ADM-S1/S11は一般SaaS標準のため後段。

プロト実装追記（2026-07-10）: 縦積み解消のため ADM-S1（`opsTab`: システム状態/通知・お知らせ/インシデント）・ADM-S4（`costTab`: 概要/コスト内訳/キャッシュ・GSC）・ADM-S8（`packTab`: Pack管理/UI・評価/表示ラベル/通知テンプレート/類語辞書/オフィス構成）の3画面を画面内タブ化（他9画面は単一ビューのまま）。ヘッダーに常設グローバル検索（画面12＋タブ9＋Pack4＋設定キー10＋プロバイダ4=39件インデックス）とテナント（企業）スコープ切替（`tScope`＝監査ログ・コスト内訳・サポートデスク・設定レジストリの4画面を絞り込み）を新設。サイドメニュー・全タブに`window.scrollTo(0,0)`のスクロールリセット適用。詳細は screen-connection-map v1.7 §8 を参照。

要求写像追記（2026-08-03）: ADM-S2は `REQ-BILLING-01〜16` の現行Price Catalog、Plan Configuration、Subscription、credit lot、自動チャージ、Capacity、限定Trialを正本とする。2026-07-13時点の旧68,000／128,000／198,000／298,000円、Credit Pack S/M/L/XL、完全委託固定商品は廃止済み履歴であり、現行画面へ投入しない。初期価格はEntry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜（月額換算・税別）で、すべて管理設定からversion改定可能とする。プロト実装の旧プラン名・価格はプロト追随待ちとして扱う。
