---
document_id: AOS-L1-AGENT-OFFICE-UI
title: AI Office de SEO Agent Office UI・2軸要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO Agent Office UI・2軸要求 v3.7

## 分類別正本への移行

画面操作と状態は `categories/screen-operation-requirements_v1.md`、視覚表現・Agent Office体験は `categories/design-experience-requirements_v1.md`、性能は `categories/non-functional-requirements_v1.md` を現在の正本とする。本書の `REQ-AOUI-*` は画面固有の詳細・資産参照として維持し、同じ判断を再定義しない。

（正本: 旧 agent-office-information-architecture / ui-two-axis と UI Assets Bundle v3.7 を移植）

## 1. 2つのUIモード  ［REQ-AOUI-01］

同じ情報・詳細画面・データAPI・状態管理を共有し、問い合わせ方式だけを変える2モードを持つ。

- Standard SaaS: サイドメニュー → タブ/一覧 → 詳細。白基調・業務効率重視。
- Agent Office: オフィス表示 → エージェント/部屋を選択 → 「何を見ますか？」の選択メニュー → 同じ詳細を1画面表示。暗色オフィス背景＋透過パーツ。

Agent Officeは代替UIではなく体験レイヤーであり、詳細コンポーネント・取得API・状態は共通化する。

## 2. 第一階層7画面  ［REQ-AOUI-02］

両モードとも次の7領域を持つ: ダッシュボード / キーワード管理 / コンテンツ作成（リライトを含む） / オートメーション / 検索流入分析 / 学習ナレッジ管理 / 設定（第一階層の正式ラベルは`REQ-NAV-01`に従う）。第一階層に内部用語（Pack / Ticket / Dynamic Post Schema 等）を出さない（`REQ-PRODUCT`）。

## 3. Agent Office 部門とキャラクタ  ［REQ-AOUI-03］

Agent Officeは部門（部屋）とエージェント（キャラ）で構成する。UIアセットは、部屋カード（keyword_research / content_creation / automation / traffic_report / knowledge / settings / technical_seo。初期構成の部屋7室は`REQ-AOUI-07`）と、ユーザー向けペルソナ（基本12: planner / keyword_researcher / analyst / traffic_reporter / content_writer / link_architect / qa_checker / publish_manager / automation_operator / knowledge_trainer / security_admin / support_agent、拡張1: technical_seo＝07 テクニカルSEO室担当。以降のペルソナ追加はconfig駆動、`REQ-AOUI-07`）を提供する。

実装方針（アセットバンドル）: キャラ・部屋・背景・アイコン・吹き出し・選択メニュー・進捗線は画像（SVG正本＋透過PNG）。日本語テキスト・表・グラフ・ボタン・フォーム・ログ・課金フィールドは画像化せず React/HTML/CSS で描画する。reference_screens は参照であり実装素材にしない。

## 4. ペルソナ⇄内部エージェント/工程マッピング  ［REQ-AOUI-04］

Agent Officeが実状態を反映するため、ユーザー向けペルソナ（基本12＋拡張1=technical_seo、`REQ-AOUI-03`。config追加分も同様）を内部の Executor（`REQ-AGENT-01`）と工程（`REQ-AGENT-09`）へ対応づける。ペルソナは見せ方であり内部実行単位そのものではない。

- keyword_researcher → Keyword Intent 工程 / Planning Executor
- analyst / traffic_reporter → SERP-TTPS Research・GSC分析 / 一般システム（機械判定, `REQ-KGA-08`）
- planner → Site Strategy・Outline Architect / Planning Executor
- content_writer → Section Brief・Draft Writer / Writing Executor
- link_architect → 内部リンク（`REQ-KGA-09`）
- qa_checker → Quality Gate / QA Executor
- publish_manager → WP Draft / Automation Executor
- automation_operator → Automation・予約 / Automation Executor
- knowledge_trainer → 学習ナレッジ管理
- security_admin / support_agent → セキュリティ・ヘルプ（`REQ-SEC` / 提供方針）
- technical_seo → WP Capability・投稿形式チェック・内部リンク/クロール可能性の技術面（`REQ-WPA-08`, `REQ-KGA-09`）/ 一般システム（機械判定, `REQ-KGA-08`）＋QA Executor

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
