# AI Office de SEO Agent機能監査（2026-08-03）

> **履歴スナップショット**: 本書はAgent要求を再発見・接続した監査時点の記録であり、現行のAgent数、工程、画面、権限、Workflow契約の正本ではない。現在値はAgent Requirements Map、Agent Runtime要求、Agent Office UI要求、分類別L1、L3 Contract Schemas、画面台帳・画面遷移図を参照する。

## 1. 監査目的

旧Agent要求、Pack/Ticket要求、Agent Office要求、画面台帳・遷移・接続マップ、プロトタイプ実装資料および画面アセットを突合し、Agentが関与する製品機能とAgentic Workflowの境界を再確認した。

## 2. 結論

- `新規記事 / リライト / Automation`は主要なAgentic Workflowであり、Agentが関与する機能の全範囲ではない。
- Agentは、ダッシュボード・月次計画、キーワード戦略、コンテンツ、Automation、検索流入分析、ナレッジ、設定・サポート、技術SEOの各領域で、説明、探索、提案、変更案作成、Task化、進行確認を担う。
- キーワード収集、集計、差分検知、重複判定などを機械処理にすることと、Agentを介さないことは同義ではない。決定論的な結果をAgentが説明し、条件変更や次のTaskへ接続する。
- Recommendationは単なる画面表示ではなくIntake Contractである。採用後は、目的、対象Keyword Cluster、検索インテント、記事目的、推薦理由、CTA、内部リンク、品質、予算、保護条件、実行可能状態を再入力なしでAgent Workflowへ渡す。
- OfficeのAgentキャラクターは飾りや単なる実行状態アイコンではない。玄人向けの詳細分析・運用窓口として、担当Task、工程、根拠、成果、条件を説明し、選択式操作または自由文から変更案を作る。各キャラクターは独立Runtimeや変更Commandを持たず、共通ServiceとDomain Commandへ接続する。

## 3. 機能領域別のAgent関与

| 機能領域 | 機械処理・正本 | Agentの役割 | Agentic Executionの例 |
|---|---|---|---|
| Dashboard・月次計画 | KPI集計、期限、利用量、Recommendation Queue | 状況説明、優先判断支援、計画変更案 | 採用施策のTask化、月次計画の再構成 |
| Keyword | 市場データ収集、クラスタリング、順位・AIO・広告影響計算 | 戦略説明、除外・追加・重み変更案、方向性調整 | 戦略レポート作成、推薦抽出の再実行 |
| Content | 記事・Summary・CTA・内部リンク・履歴 | Brief、Outline、執筆、QA、Repair、配置指示 | 新規記事、リライト、CTA/Internal Link施策 |
| Automation | Schedule、依存関係、上限、状態遷移 | 実行順・停止理由・影響説明、変更案 | 予定作成、停止・再開、例外処理 |
| 検索流入分析 | GSC/CV/順位/変更履歴の集計 | 結果解釈、原因仮説、次施策提案 | 評価レポート、改善Task化 |
| Knowledge | Site設定、商品・顧客・文体・装飾・学習結果 | 不足確認、更新提案、学習内容の説明 | 学習更新、Context整備Task |
| 設定・Support | 接続状態、権限、プラン、診断ログ | 設定案内、FAQ、障害切り分け | 再接続・再実行案、問い合わせ起票 |
| 技術SEO | crawl/index/取得性の機械診断 | 原因・影響説明、対応手順の提示 | ユーザー対応Task、将来Packへの接続 |

## 4. 発見した齟齬

| 重要度 | 齟齬 | 処置 |
|---|---|---|
| Critical | 主要3 WorkflowをAgent関与範囲全体として扱いかけていた | Agent Interaction / Advisory / Agentic Executionを分離し、全機能領域の関与を要求マップへ追記 |
| Critical | 2026-07-09のL3モック記録がOfficeを監視専用・決定操作なしとしていた | 後続の`REQ-DESIGN-09`・`REQ-SCREEN-18`を現行正本とし、旧記述を履歴・実装差分へ変更 |
| Important | RecommendationからAgentへの引継ぎ情報が図上で弱かった | RecommendationをIntake Contractと定義し、再入力禁止と引継ぎ項目を明記 |
| Important | Office personaを既存Executorの表示だけと読める記述があった | 業務責任を持つ継続的なユーザー接点として定義し直し、共通基盤との関係を明記 |
| Important | 現行プロトは監視・詳細表示中心で、詳細設定・会話変更・Task構成変更が未追随 | L3接続マップ上で要求未定義ではなくプロト追随待ちとして管理 |
| Critical | `office_layout.json`が`executors/stages`だけを持ち、analyst、traffic_reporter、knowledge_trainer、security_admin、support_agent等のmappingが空だった | Gate A-3 v1.4でService、会話能力、Proposal型をconfigへ追加し、工程のないAgentも実業務へ接続する |

## 4.1 モックconfig修正方針

旧configはキャラクターの稼働アニメを生成工程から導出する目的には足りていたが、Agentの業務能力を表現できていなかった。現行では各personaに次の4種類を分離して持たせる。

1. `service_keys`: 読取、分析、説明、探索、Task化に使う業務Service。
2. `interaction_capabilities`: 質問回答、深掘り、比較、変更相談等の会話能力。
3. `proposal_types`: 状態変更前に作れる型付きProposal。
4. `executors/stages`: Agentic Executionまたは進行表示へ接続する既存Executor／工程。

これにより「機械計算をする機能だからAgent不在」「生成Workflowを持たないから飾り」という誤った分離を防ぐ。計算の正本は機械処理のまま維持し、その結果の解釈、対話、条件変更、Task化を担当Agentへ接続する。

## 5. モック確認範囲と制約

- `prototype/AI Office de SEO.dc.html`、`prototype/CLAUDE.md`、Office layout、画面台帳・遷移・接続マップを確認した。
- `docs/reference/screen_office.webp`と`docs/reference/assets/screen_detail.webp`を視覚確認し、複数部屋、Agent、稼働指標、キャラクター表現を確認した。
- セッション上で対話ブラウザを起動できなかったため、クリック操作による全ページ実機確認は未実施である。HTML・実装資料・画面資産による監査結果と、実機操作の未確認範囲を混同しない。

## 6. 次の扱い

現段階では追加質問を行わない。まず本監査結果をAgent要求、Office要求、L3画面資料へ反映し、旧要求と現行決定の正本関係を安定させる。
