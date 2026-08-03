---
document_id: AOS-L1-AGENT-OFFICE-UI
title: AI Office de SEO Agent Office UI・2軸要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-08-03
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO Agent Office UI・2軸要求 v3.7

## 分類別正本への移行

Agent Officeと内部Executor／Workflowの境界は `ai-office-de-seo-agent-requirements-map_v1.md` を横断索引とする。部屋、ペルソナ、キャラクタ、会話体験を追加しても、それだけを理由に専用Executor、Ticket、Packまたはruntimeを増やさない。

画面操作と状態は `categories/screen-operation-requirements_v1.md`、視覚表現・Agent Office体験は `categories/design-experience-requirements_v1.md`、性能は `categories/non-functional-requirements_v1.md` を現在の正本とする。本書の `REQ-AOUI-*` は画面固有の詳細・資産参照として維持し、同じ判断を再定義しない。

（正本: 旧 agent-office-information-architecture / ui-two-axis と UI Assets Bundle v3.7 を移植）

## 1. 2つのUIモード  ［REQ-AOUI-01］

同じTask・Agent・工程event・Contextを共有し、役割を分ける2モードを持つ。

- Standard SaaS: サイドメニュー → タブ/一覧 → 詳細。白基調・業務効率重視。
- Agent Office: オフィス表示 → エージェント／部屋を選択 → 会話・設備・Task Panelから、実行中Task、工程、待機、完了、失敗、成果要約を監視する。暗色オフィス背景＋透過パーツ。

通常ビューは簡単な判断、採否、承認、基本設定、成果要約を担う。Agent Officeはエージェントの実行状況を見守りながら、詳細分析、根拠探索、条件・方針変更、Task変更、Agent指示を行う玄人向け運用面とする。定型操作は選択式ポップアップから決定論Serviceへ接続し、自由文は必要な場合だけLLMで型付きProposalへ変換する。両Viewは同じProjectionと共通Commandを使う。

## 2. 第一階層7画面  ［REQ-AOUI-02］

両モードとも次の7領域を持つ: ダッシュボード / キーワード管理 / コンテンツ作成（リライトを含む） / オートメーション / サイトページ管理 / ナレッジ管理 / 設定（第一階層の正式ラベルは`REQ-NAV-01`に従う）。第一階層に内部用語（Pack / Ticket / Dynamic Post Schema 等）を出さない（`REQ-PRODUCT`）。

## 3. Agent Office 部門とキャラクタ  ［REQ-AOUI-03］

Agent Officeは部門（部屋）とエージェント（キャラ）で構成する。UIアセットは、部屋カード（keyword_research / content_creation / automation / traffic_report / knowledge / settings / technical_seo。初期構成の部屋7室は`REQ-AOUI-07`）と、ユーザー向けペルソナ（基本12: planner / keyword_researcher / analyst / traffic_reporter / content_writer / link_architect / qa_checker / publish_manager / automation_operator / knowledge_trainer / security_admin / support_agent、拡張1: technical_seo＝07 テクニカルSEO室担当。以降のペルソナ追加はconfig駆動、`REQ-AOUI-07`）を提供する。

実装方針（アセットバンドル）: キャラ・部屋・背景・アイコン・吹き出し・選択メニュー・進捗線は画像（SVG正本＋透過PNG）。日本語テキスト・表・グラフ・ボタン・フォーム・Task History・課金フィールドは画像化せず、アクセシブルなWeb UIとして描画する。製品要求はReact等の特定フレームワークへ固定せず、採用技術はGate A-4と実装計画で決める。reference_screens は参照であり実装素材にしない。

## 4. ペルソナ⇄内部エージェント/工程マッピング  ［REQ-AOUI-04］

Agent Officeが実状態を反映するため、ユーザー向けペルソナ（基本12＋拡張1=technical_seo、`REQ-AOUI-03`。config追加分も同様）を、内部Executor（`REQ-AGENT-01`）、工程（`REQ-AGENT-09`）、決定論サービス、担当業務へ対応づける。ペルソナは独立runtimeそのものではなく、現在Task、工程、待機理由、完了成果、次の確認先を説明する監視上の窓口である。ペルソナ数だけ専用LLM、常駐processまたは独立記憶を作らない。

| persona | 監視対象 | 読むProjection | Officeで説明する内容 | Officeで作れる型付きProposal | 通常ビューの成果／一覧 | Office設備 |
|---|---|---|---|---|---|---|
| `planner` | 月次計画、Recommendation、制作順 | MonthlyPlan、Recommendation、Production Task | 計画確定状態、今週の実行順、待機理由 | 目的・配分・実行順・Outline変更 | S1月次計画、S3 Recommendation、S4 Outline | 戦略ボード、月次計画卓 |
| `keyword_researcher` | 市場探索、Cluster分析 | Keyword Portfolio、Market／Share Task | 収集・分類の進捗、対象Cluster、取得待ち | Cluster分類・重み・除外・追加調査 | S2 Keyword・戦略・診断 | Market wall、Cluster map |
| `analyst` | 診断・評価Task | Report、Intervention Evaluation | 分析範囲、工程、評価準備中の理由、成果要約 | 診断条件・比較軸・追加分析Task | S1／S2／S5成果詳細 | 分析卓、比較matrix |
| `traffic_reporter` | GSC・CV・市場観測 | Observation Task、Watch Queue | 観測期間、取得状態、異常・欠損、成果要約 | 観測期間・segment・監視継続 | S1／S2／S5成果詳細 | Traffic wall、funnel board |
| `content_writer` | 新規記事・リライト制作 | ContentProductionJob、Outline、Writing Snapshot | 執筆工程、現在のMeaning Unit、停止・再開理由 | 本文限定変更・追加要望・再生成Task | S4記事制作・Outline | Draft desk、Meaning Unit board |
| `link_architect` | 内部Link計算・Patch候補 | Link Analysis Task、Patch Candidate | 候補計算の進捗、対象記事、依存Task | Link候補採否・接続文Repair・順序変更 | S5内部Link候補 | Link graph table、candidate queue |
| `qa_checker` | Quality Gate・Repair | QA Snapshot、Gate Result、Repair Task | Gate結果、指摘理由、Repair進捗、判断待ち | 差し戻し・限定Repair・二段階確認 | S4 QA・差分・承認 | QA console、evidence desk |
| `publish_manager` | CMS下書き・反映確認 | CmsDelivery、Approval、Output Vault | 送信、再送待ち、承認待ち、反映結果 | 送信・再送・予約・承認・公開 | S4承認・公開、S6 CMS接続 | Publishing desk、CMS status |
| `automation_operator` | 自動予定・実行Queue | Automation Task、schedule、Kill Switch | 実行順、停止理由、再開条件、Credit消費 | Policy・予定・停止・再開 | S3週次予定、S4自動運用設定 | Operations board、queue rail |
| `knowledge_trainer` | Site補正・学習更新 | Learning Task、Pack version、correction | 再学習時期、適用version、承認待ち | 採用・無効化・再学習・適用先変更 | S2補正、S6文体・装飾設定 | Knowledge graph、version shelf |
| `security_admin` | 接続・認証・権限診断 | Authorization Decision、Connection Health | 認証切れ、権限不足、必要なユーザー操作 | 再認証・権限・Site付与・同意更新 | S6接続・権限・同意 | Access console、connection health |
| `support_agent` | FAQ・障害切分け | user-visible診断code、Support Ticket、status | 原因区分、解決手順、問い合わせ状態 | 再実行案・Support Ticket | W10 Support、該当設定画面 | Help desk、diagnostic panel |
| `technical_seo` | crawl・index・CMS Capability診断 | Crawler Observation、GSC index、CMS Profile | 診断工程、取得不能理由、影響範囲 | 技術対応Task・記事施策・再診断 | S2技術診断、S6 CMS接続 | Technical lab、crawler console |

設備は画面上の業務入口であり、設備をクリックしただけで権限やTool scopeを増やさない。1 personaが複数Service／Executorへ接続してよく、1 Executorを複数personaが異なる文脈から利用してよい。personaとExecutorを1対1に固定しない。

エージェント活動可視化は、状態機械（`REQ-AGENT-09`）の現工程・遷移を反映する。キャラは待機/作業/完了/エラーの4ステート差分を持つ（初期は基本形、本番制作で追加）。

## 5. 画面の2軸（探索 / おすすめ）  ［REQ-AOUI-05］

各画面は2軸を共通に持つが、記事制作・リライトではシステムおすすめ軸を主導線、ユーザー探索軸を補助導線とする（`REQ-PRODUCT-24`）。

- おすすめ軸: 優先順位付き候補から、根拠・変更範囲・費用・リスクを確認して採用/編集/保留/却下/予約する。
- 探索軸: ユーザーがURL/キーワードを指定して調査・手動起動できる。おすすめにない対象も扱えるが、起動前に既存ArticleSummaryとの重複・保護・競合を検査する。
- 共通状態: おすすめの採用/却下/編集/予約結果は `recommendation_feedback`、探索状態は `saved_views` / `user_exploration_sessions` として最小限保存する（`REQ-SEC`）。セッション単位の詳細行動ログ・クリックログ・遷移ログは保存しない。

## 6. Console Mode / 全画面ワークベンチ  ［REQ-AOUI-06］

通常ビューは簡単な成果要約と標準drill downを提供する。Agent OfficeのTask Panel／Workbenchは進捗、成果詳細、根拠、比較、依存、条件、実行順、停止・再開と型付きProposalを扱う。成果値は通常ビューと同じProjectionから取得し、Officeで別計算しない。Console Mode（開発管理者向け）は別要求（`REQ-ADM`）とする。

## 7. 部門・フロア・ペルソナの拡張性  ［REQ-AOUI-07］

Agent Officeの構成（部屋＝部門、フロア、ペルソナ）は固定数にハードコードせず、config/レジストリ駆動で拡張可能にする（`REQ-ADM-09` の設定レジストリと整合）。部屋の追加・改名・並び替えが、要求本文やコードの変更を要さない。

- 部屋（部門）: サイドメニュー第一階層7画面（`REQ-AOUI-02`）と1:1に固定しない。部屋はconfigで追加・改名・並び替えでき、SECTION番号は連番で拡張する。専門部屋（例: テクニカルSEO室）を7画面外に追加できる。
- フロア: フロア数と各部屋のフロア割り当てはconfig駆動。エレベーターのフロア表示はフロア数から生成する。
- ペルソナ: ペルソナ（キャラ）は部屋にひも付くが、追加・差し替え・再割り当てがconfigで可能。ペルソナ⇄内部Executor/工程マッピング（`REQ-AOUI-04`）もデータとして保持する。
- アセット規約: 追加アセットは命名規約（`sign_NN_*` / `char_*` / `scene_*`）に従う。看板テキスト等の固定ラベルのみ画像化可、実データはHTML/CSS描画（`REQ-AOUI-03`）。
- 不変条件: 拡張してもサイドメニュー第一階層は正本（現状7項目、`REQ-AOUI-02`）を保ち、安全不変条件（`REQ-ADM-09`）は設定対象外のままとする。

初期構成（確定）: 部屋7（01 キーワードリサーチ / 02 コンテンツ制作 / 03 レポート分析 / 04 自動化オペレーション / 05 ナレッジ / 06 設定 / 07 テクニカルSEO）＋ダッシュボード＝ハブ（番号なし）、7フロア（1部屋=1フロア。v3.7.49改訂・レイアウトはoffice_layout.initial.json正本）、サイドメニュー7項目（そのまま）。
