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

同じ情報・詳細画面・データAPI・状態管理を共有し、問い合わせ方式だけを変える2モードを持つ。

- Standard SaaS: サイドメニュー → タブ/一覧 → 詳細。白基調・業務効率重視。
- Agent Office: オフィス表示 → エージェント／部屋を選択 → 会話・設備・詳細Panelから、同じ業務正本の詳細探索、条件・方針変更、Task構成変更、実行監視を行う。暗色オフィス背景＋透過パーツ。

Agent Officeは通常ビューの単純な複製でも監視専用画面でもない。通常ビューは簡単操作、Agent Officeは詳細運用を担う。詳細コンポーネント、command、取得API、権限、業務状態は共通化し、Office独自の部屋、会話、探索、設備、表示状態を持つ。

## 2. 第一階層7画面  ［REQ-AOUI-02］

両モードとも次の7領域を持つ: ダッシュボード / キーワード管理 / コンテンツ作成（リライトを含む） / オートメーション / 検索流入分析 / 学習ナレッジ管理 / 設定（第一階層の正式ラベルは`REQ-NAV-01`に従う）。第一階層に内部用語（Pack / Ticket / Dynamic Post Schema 等）を出さない（`REQ-PRODUCT`）。

## 3. Agent Office 部門とキャラクタ  ［REQ-AOUI-03］

Agent Officeは部門（部屋）とエージェント（キャラ）で構成する。UIアセットは、部屋カード（keyword_research / content_creation / automation / traffic_report / knowledge / settings / technical_seo。初期構成の部屋7室は`REQ-AOUI-07`）と、ユーザー向けペルソナ（基本12: planner / keyword_researcher / analyst / traffic_reporter / content_writer / link_architect / qa_checker / publish_manager / automation_operator / knowledge_trainer / security_admin / support_agent、拡張1: technical_seo＝07 テクニカルSEO室担当。以降のペルソナ追加はconfig駆動、`REQ-AOUI-07`）を提供する。

実装方針（アセットバンドル）: キャラ・部屋・背景・アイコン・吹き出し・選択メニュー・進捗線は画像（SVG正本＋透過PNG）。日本語テキスト・表・グラフ・ボタン・フォーム・Task History・課金フィールドは画像化せず、アクセシブルなWeb UIとして描画する。製品要求はReact等の特定フレームワークへ固定せず、採用技術はGate A-4と実装計画で決める。reference_screens は参照であり実装素材にしない。

## 4. ペルソナ⇄内部エージェント/工程マッピング  ［REQ-AOUI-04］

Agent Officeが実状態と業務能力を反映するため、ユーザー向けペルソナ（基本12＋拡張1=technical_seo、`REQ-AOUI-03`。config追加分も同様）を、内部Executor（`REQ-AGENT-01`）、工程（`REQ-AGENT-09`）、決定論サービス、利用可能Tool、担当業務へ対応づける。ペルソナは独立runtimeそのものではないが、説明、探索、会話、変更案、Task化、実行監視を担うユーザー窓口である。会話実行は全ペルソナ共通のOffice Conversation Runtimeを使用し、`persona_id`別Role Profileと許可されたService／Proposal Schemaをセッション開始時に解決する。ペルソナ数だけ専用LLM、常駐processまたは独立記憶を作らない。

| persona | 主な業務 | 読む正本・Service | 会話から作れるもの | Executor／Tool接続 | 変更時の業務Permission | Office設備・詳細面 |
|---|---|---|---|---|---|---|
| `planner` | Site目的、月次方針、記事配分、制作順、記事構成 | MonthlyPlan、Keyword Report、Recommendation、Intake、Research Brief | 方針・配分変更Proposal、実行順変更、Outline変更案 | Planning Executor、Plan／Recommendation service | 目標管理。記事構成は記事制作、Keyword配分はキーワード・サイト戦略も必要 | 戦略ボード、月次計画卓、Outline table |
| `keyword_researcher` | 市場探索、Cluster、主＋補助Keyword、intent、除外、方向性 | Keyword Asset Pool、Market／Share、SERP、GSC Query、分類・補正 | Cluster状態、重み、除外、追加調査、Recommendation方向のProposal | 決定論Keyword service、Planning Executor、Source Need | キーワード・サイト戦略 | Market wall、Cluster map、Keyword terminal |
| `analyst` | 市場・Site・記事の横断診断、要因仮説 | Report、Market／Share、記事／Query、AIO・広告・季節性、Intervention | 診断条件、比較軸、評価解釈、追加分析Task | 集計service、Planning／QA Executor | 閲覧は全Member。条件変更・評価確定はサイト分析 | 分析卓、比較matrix、evidence panel |
| `traffic_reporter` | 順位、表示、click、CV、認知貢献、月次／累積説明 | GSC、Tracker、CV、Evaluation、Watch Queue | 期間・segment変更、観測継続、次施策候補 | 集計service、Recommendation service | サイト分析 | Traffic wall、funnel board、trend console |
| `content_writer` | Meaning Unit制作、ユーザー修正反映、限定再生成 | Intake、Outline Contract、Section Brief、Site rule、Source Pack | 本文限定変更案、追加要望、再生成Task | Writing／Repair Executor | 記事制作 | Draft desk、Meaning Unit board、diff editor |
| `link_architect` | 新規／更新記事の内部link、既存記事Patch候補 | Article Summary、Keyword Cluster、link graph、Patch Action | link候補採否、接続文Repair、Batch／順序変更案 | QA／Repair／Automation Executor、Patch service | 記事制作。戦略条件変更はキーワード・サイト戦略も必要 | Link graph table、candidate queue |
| `qa_checker` | Quality Gate、根拠、構造、文体、CTA／link整合 | Draft Snapshot、QA Snapshot、Gate Catalog、hard gate状態 | 差し戻し、限定Repair、二段階確認案 | QA／Repair Executor | 記事制作 | QA console、evidence desk、gate board |
| `publish_manager` | CMS下書き、Preview、承認、予約、公開結果 | Publication Job、CMS Connection Profile、Approval、Output Vault | 送信・再送・予約・承認・公開Proposal | Automation Executor、CMS write Tool | 記事制作＋Site付与。自動運用設定は契約者／サイトオーナー条件も必要 | Publishing desk、calendar、CMS status |
| `automation_operator` | 自動予定、実行順、停止・再開、変更予算 | Automation Policy、schedule、queue、budget、Kill Switch | Policy／予定／停止・再開Proposal | Orchestrator、Automation Executor | 個別Taskは記事制作。Policy変更は契約者／サイトオーナー＋対象Permission | Operations board、queue rail、kill switch |
| `knowledge_trainer` | Site補正、成功学習、文体・装飾・方針のversion | Derived Facts、Intervention、Site rule、Pack version、correction | 採用・無効化・再学習・適用先変更Proposal | Pack Compiler／Validate、管理承認済みPublish | キーワード・サイト戦略。記事表現だけは記事制作 | Knowledge graph、version shelf、training table |
| `security_admin` | 顧客向け接続・認証・権限・同意の案内 | Authorization Decision、Membership、Connection Profile、同意状態 | 再認証、権限・Site付与、同意更新Proposal | Authorization／Connection command | 質問は可視範囲内。変更は契約者／サイトオーナー等の操作別条件 | Access console、connection health。内部監査logは出さない |
| `support_agent` | FAQ、障害切分け、自己解決、問い合わせ | user-visible診断code、FAQ、Task、Connection Health、status | 解決手順、再実行案、Support Ticket | FAQ Chat、Support service | 質問は可視範囲内。状態変更は対象操作のPermissionへ委譲 | Help desk、diagnostic panel |
| `technical_seo` | crawl、index、CMS Capability、link・表示速度等の診断 | Crawler観測、GSC index、CMS Profile、link graph、CWV | 技術対応Task、記事側施策Recommendation、再診断案 | 決定論診断、QA Executor、Support escalation | 閲覧・診断条件はサイト分析。CMS設定は契約者／サイトオーナー条件。Site構造は提案のみ | Technical lab、crawler console、capability matrix |

設備は画面上の業務入口であり、設備をクリックしただけで権限やTool scopeを増やさない。1 personaが複数Service／Executorへ接続してよく、1 Executorを複数personaが異なる文脈から利用してよい。personaとExecutorを1対1に固定しない。

エージェント活動可視化は、状態機械（`REQ-AGENT-09`）の現工程・遷移を反映する。キャラは待機/作業/完了/エラーの4ステート差分を持つ（初期は基本形、本番制作で追加）。

## 5. 画面の2軸（探索 / おすすめ）  ［REQ-AOUI-05］

各画面は2軸を共通に持つが、記事制作・リライトではシステムおすすめ軸を主導線、ユーザー探索軸を補助導線とする（`REQ-PRODUCT-24`）。

- おすすめ軸: 優先順位付き候補から、根拠・変更範囲・費用・リスクを確認して採用/編集/保留/却下/予約する。
- 探索軸: ユーザーがURL/キーワードを指定して調査・手動起動できる。おすすめにない対象も扱えるが、起動前に既存ArticleSummaryとの重複・保護・競合を検査する。
- 共通状態: おすすめの採用/却下/編集/予約結果は `recommendation_feedback`、探索状態は `saved_views` / `user_exploration_sessions` として最小限保存する（`REQ-SEC`）。セッション単位の詳細行動ログ・クリックログ・遷移ログは保存しない。

## 6. Console Mode / 全画面ワークベンチ  ［REQ-AOUI-06］

詳細作業は全画面ワークベンチ（1画面分）で行い、両モードで同一コンポーネントを使う。Console Mode（開発管理者向け）は別要求（`REQ-ADM`）とする。

## 7. 部門・フロア・ペルソナの拡張性  ［REQ-AOUI-07］

Agent Officeの構成（部屋＝部門、フロア、ペルソナ）は固定数にハードコードせず、config/レジストリ駆動で拡張可能にする（`REQ-ADM-09` の設定レジストリと整合）。部屋の追加・改名・並び替えが、要求本文やコードの変更を要さない。

- 部屋（部門）: サイドメニュー第一階層7画面（`REQ-AOUI-02`）と1:1に固定しない。部屋はconfigで追加・改名・並び替えでき、SECTION番号は連番で拡張する。専門部屋（例: テクニカルSEO室）を7画面外に追加できる。
- フロア: フロア数と各部屋のフロア割り当てはconfig駆動。エレベーターのフロア表示はフロア数から生成する。
- ペルソナ: ペルソナ（キャラ）は部屋にひも付くが、追加・差し替え・再割り当てがconfigで可能。ペルソナ⇄内部Executor/工程マッピング（`REQ-AOUI-04`）もデータとして保持する。
- アセット規約: 追加アセットは命名規約（`sign_NN_*` / `char_*` / `scene_*`）に従う。看板テキスト等の固定ラベルのみ画像化可、実データはHTML/CSS描画（`REQ-AOUI-03`）。
- 不変条件: 拡張してもサイドメニュー第一階層は正本（現状7項目、`REQ-AOUI-02`）を保ち、安全不変条件（`REQ-ADM-09`）は設定対象外のままとする。

初期構成（確定）: 部屋7（01 キーワードリサーチ / 02 コンテンツ制作 / 03 レポート分析 / 04 自動化オペレーション / 05 ナレッジ / 06 設定 / 07 テクニカルSEO）＋ダッシュボード＝ハブ（番号なし）、7フロア（1部屋=1フロア。v3.7.49改訂・レイアウトはoffice_layout.initial.json正本）、サイドメニュー7項目（そのまま）。
