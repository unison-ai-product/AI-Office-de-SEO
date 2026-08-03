---
document_id: AOS-L1-AGENT-REQUIREMENTS-MAP
title: AI Office de SEO エージェント要求体系・正本マップ
version: 1.0
layer: L1
kind: requirements_map
status: draft
updated_at: 2026-07-31
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO エージェント要求体系・正本マップ

## 1. 目的

本書は新しいAgent要求を定義する文書ではない。既存の `REQ-AGENT-*`、`REQ-PACK-*`、`REQ-AOUI-*` と分類別正本の責務境界を示し、分類別要求をゼロベースで追加して既存Agent設計と競合させないための横断索引である。

Agent関連の変更は、必ず本書から既存要求を確認し、次の順序で扱う。

1. 既存Workflow、Ticket、Pack、Schema、Executor、Agent Office mappingで実現できるか確認する。
2. 実現できる場合は既存REQ-IDを参照し、別のAgent、Ticket、Pack、状態を作らない。
3. 業務上の入力、判断、結果だけが不足する場合は分類別正本へ追加し、Agent実行方式は既存要求へ接続する。
4. 既存実行モデルで表現できない場合だけ、影響する状態機械、Schema、権限、費用、受入条件を示して旧要求を改版する。

## 2. 正本の優先関係

| 判断対象 | 正本 | 境界 |
|---|---|---|
| SEO業務の開始契機、担当、成果、Loop | `categories/business-requirements_v1.md` | Agent／Ticket構造を定義しない |
| 推薦、判定式、状態分類、再計算 | `categories/logic-requirements_v1.md` と `logic/*.md` | LLM実行単位を新設しない |
| Agentic Workflow、Executor、工程、checkpoint | `ai-office-de-seo-agent-runtime-requirements_v3.7.md` | `REQ-AGENT-01〜11` は現在も有効 |
| Pack、Ticket、Source Need、Schema、Gate、Catalog | `ai-office-de-seo-pack-ticket-schema-requirements_v3.7.md` | `REQ-PACK-01〜21` は現在も有効 |
| Agent Officeの部屋、ペルソナ、工程表示 | `ai-office-de-seo-agent-office-ui-requirements_v3.7.md` | `REQ-AOUI-01〜07` は見せ方でありExecutorではない |
| job、queue、冪等性、Provider境界 | `categories/technical-architecture-requirements_v1.md` | 業務判断・Prompt本文を持たない |
| tenant／Site境界、tool認可 | `categories/security-access-requirements_v1.md` | Promptだけを強制点にしない |
| 原価、reserve、実績、再開費用 | `categories/cost-requirements_v1.md` と課金正本 | Agentが価格を決めない |
| 通常ビューと顧客操作 | `categories/screen-operation-requirements_v1.md` | Pack／Ticket等の内部用語を第一階層へ出さない |

分類別正本が優先するのは当該分類の業務判断であり、既存Agent実行詳細を無効化する意味ではない。Agent／Pack文書と競合する新文を分類別正本へ追加した場合は、Agent／Pack要求を確認したうえで既存構造へ接続するか、同一変更で両方を明示改版する。

## 3. 実行モデル

### 3.0 用語の主語を省略しない

本製品では「Agent」単独を要求・質問・設計判断の主語にしない。最低でも次の種別まで明記する。

| 用語 | 指すもの | 例 | 指さないもの |
|---|---|---|---|
| Officeペルソナ | ユーザーがOfficeで話しかける担当窓口 | planner、keyword_researcher、content_writer | 独立process、LLM model |
| Executor | WorkflowからTicketを受けて意味判断・生成・検査する内部実行役 | Planning、Writing、QA、Repair、Automation Executor | Officeのキャラクター |
| Orchestrator | Workflowの工程・Ticket・停止・再開を制御する実行調停 | new article workflowの進行 | ユーザー向けプランナー |
| 決定論Service | 収集、集計、分類、score、権限、課金、状態遷移を行う機械処理 | Keyword service、Capacity resolver | LLM会話 |
| Automation Job | schedule／policyに従う非同期実行 | CMS送信、差分同期、月次再計算 | 自律人格 |
| Support Chat | FAQ、診断、問い合わせの会話 | support_agentの窓口 | SEO戦略や記事生成Workflow全体 |

「Agentが変更する」「Agentが記憶する」「Agent同士で委譲する」「Agentの動きを変える」のような記述は禁止する。誰が、どの正本を読み、何のProposal／Ticket／Commandを作り、どのExecutor／Serviceが実行するかまで書く。

### 3.1 Officeペルソナ関与とAgentic Workflowを分ける

製品機能へのAgent関与を、記事生成用Agentic Workflowの本数だけで数えない。Agentは次の3層で全業務領域へ関与する。

| 層 | 役割 | 例 |
|---|---|---|
| Office Persona Interaction | Officeペルソナによる会話、説明、探索、詳細操作、変更案、Task化 | キーワード選定理由の説明、月次方針の調整、分析結果の深掘り |
| Advisory Reasoning | 指定されたOfficeペルソナまたはPlanning／QA Executorが決定論的な集計・診断を読み、意味付け、仮説、Recommendation、追加確認を提示 | 順位低下要因、CV導線、サイト認知への貢献、改善順序 |
| Agentic Execution | Workflow、Ticket、Pack、Executorで成果を生成・検査・配置する | 新規記事、リライト、QA、Repair、CMS Automation |

基礎データの取得、集計、差分検知、スコア計算、権限、課金、状態遷移は決定論的に実行しても、ユーザーが結果を理解し、条件を変え、次のTaskへ接続する場面ではOffice Persona Interaction／Advisory Reasoningを使用できる。「機械処理である」ことを「Officeペルソナが説明・操作窓口にならない」と読み替えない。

### 3.2 Executor

実行役は次の少数Executorへ固定する。SEO機能、Officeのキャラクタ、商品Packごとに専用Executorを増やさない。

| Executor | 責務 | 主な出力先 |
|---|---|---|
| Orchestrator | Workflow遷移、Ticket発行、Snapshot受領、停止・再開・保留 | 次工程、再dispatch、承認待ち |
| Planning Executor | Research Brief、Outline Contract、Section Brief | freeze済みPlanning Snapshot |
| Writing Executor | Meaning Unit単位の生成 | Writing Snapshot |
| QA Executor | Gate、CTA、内部link、構造、根拠、整合性検査 | QA Snapshot、Instruction |
| Repair Executor | 不合格箇所だけの限定修正 | Repair Snapshot |
| Automation Executor | CMS下書き、配置、予約、公開・計測event | Command Result |

正本: `REQ-AGENT-01/02/06/09`。

### 3.3 標準工程

`Research & Outline → Meaning Unit Writing → QA → 限定Repair Loop → Assembly／Placement → Automation → 承認／公開 → Cleanup`

- Research BriefとOutline ContractをfreezeしてからWritingへ進む。
- H2／H3ではなくMeaning UnitをWriting単位とする。
- QA不合格は該当Meaning Unitまたは接続箇所だけをRepairする。
- CTAはWriting Ticketにしない。
- Agent Officeの表示状態は、この状態機械から導出する。
- 停止・再開はfreeze済みversionとcheckpointを維持する。

正本: `REQ-AGENT-02/09/10/11`、`REQ-PACK-17/18`。

## 4. Pack・Ticket・Schema境界

| 概念 | 役割 | 禁止事項 | 正本 |
|---|---|---|---|
| Workflow | 工程、遷移、Loop、停止条件、tool scope | 機能ごとの場当たり的な手順追加 | `REQ-AGENT-06`, `REQ-PACK-11.6` |
| Ticket | 実行依頼と参照key | Pack本文、SQL、無制限なraw本文を入れない | `REQ-PACK-01/03/11.7` |
| Source Need／Source Pack | Site scopeのJSONデータ取得 | ExecutorのDB直参照 | `REQ-AGENT-05`, `REQ-PACK-06/07` |
| Prompt Pack | 固定制約・方針の注入 | user promptとの混在 | `REQ-AGENT-03/07`, `REQ-PACK-02` |
| Catalog | 記事type、Meaning Unit、Gate、技法等の版付き選択肢 | ユーザー入力からの無統制な自動追加 | `REQ-PACK-11/19/20/21` |
| Snapshot | 工程結果、根拠、状態、次工程入力 | ExecutorからのDB直接更新 | `REQ-PACK-01/11.7` |
| Pack Compiler | Site知識を用途別Packへ圧縮 | 本文全文の恒久保持 | `REQ-PACK-16` |
| Pack Resolver | key解決、version、scope、Entitlement検証 | 不足Packの推測補完 | `REQ-PACK-15` |

Packは顧客向けの「作業メニュー」や任意の小機能名ではない。業務施策を追加するだけで新しいPackを作らず、既存Workflow／Ticket／Catalog／Source Needの組合せで表現する。

## 5. 機能全体とAgent関与

| 製品領域 | 機械処理・正本 | Agent Interaction／Advisory | Agentic Execution |
|---|---|---|---|
| Dashboard／月次計画 | KPI集計、期限、予算、Recommendation Queue | planner／analystが重点領域、配分、乖離、次の判断を説明し変更案を作る | 確定後のTask群を既存Workflowへdispatch |
| Keyword管理 | 市場pool、GSC、SERP、cluster、順位、AIO、分類、score | keyword_researcher／analystが根拠を説明し、条件・重み・除外・方向性の変更案を作る | Research／Planning Ticket、採用RecommendationのIntake |
| Content制作 | Article Summary、重複・保護・Preflight | planner／writer／QA／link architectが構成、進捗、問題、修正案を対話 | new article／rewrite／QA／Repair／Placement |
| Automation | schedule、権限、接続、予算、Kill Switch | automation_operator／publish_managerが予定、停止理由、影響を説明し変更案を作る | Automation Ticket、CMS command |
| 検索流入分析 | GSC・Tracker・順位・CV・市場差分の集計 | analyst／traffic_reporterが要因仮説、目的別評価、次施策を提示 | 採用施策をRecommendation／既存Workflowへ接続 |
| Knowledge | Derived Facts、成功施策、Site補正、Pack version | knowledge_trainerが根拠、適用先、矛盾、再学習候補を説明し修正案を作る | Pack Compiler／Validate／管理承認済みPublish |
| Setting／Support | 接続状態、契約、権限、通知、診断code | security_admin／support_agentが必要設定、影響、復旧方法を案内 | 承認済み設定command、support escalation |
| Technical SEO | crawl／index／link graph／CWV等の機械診断 | technical_seoが影響、優先度、サイト側対応、記事側施策を説明 | 記事側施策だけ既存Recommendation／Workflowへ接続 |

RecommendationはAgentへの任意追加情報ではなく、Agent Interaction／Advisory／ExecutionをつなぐIntake Contractである。採用時に対象、目的、keyword cluster、検索インテント、記事目的、根拠、CTA、内部link、品質、予算、保護、availabilityを再入力なしで引き継ぐ。

### 5.1 代表実行の既存接続

| 業務 | 既存接続 | 新設してはいけないもの |
|---|---|---|
| 新規記事 | `workflow.new_article.v1` → Planning → Meaning Unit Writing → QA → Repair → Assembly | 記事type別専用Agent |
| リライト | `workflow.rewrite.v1` → 原因分析 → 対象Unit → Repair Writing → QA | 全文再生成専用Agent |
| CTA配置 | QA Ticket → `CTAPlacementInstruction`／`WPBlockPlacementInstruction` → Placement／Automation | CTA Writing Ticket、CTA専用Agent、CTA作業Pack |
| CTA接続文修正 | CTA QA → 対象箇所だけRepair Ticket | 記事全文Repair |
| 内部link | Article Summary／link graph → internal_link_qa → 新規記事内配置または承認付き既存記事patch | link専用Executor |
| CMS送信・公開 | `workflow.automation.v1`／Automation Ticket | Writing Executorの直接公開 |
| 通常判定・集計 | 決定論的ロジック／batch | LLM Agentによる全件判定 |
| Feature Object | Context Envelope／Source Need key／承認済みPack・Tool key | Objectごとの無条件な独立runtime |

## 6. LLMを使う境界

- LLMによる生成・意味判断はExecutor内へ限定する。
- Recommendation候補抽出、順位集計、カバー率、カニバリ、Query Drift、差分検知、容量判定、通知、料金判定は機械処理を正本とする。
- 機械結果の説明、横断的な意味付け、仮説、対話による条件変更案、Task化はAgent Interaction／Advisoryで扱える。Recommendationの最終的な理由文や施策構成も、機械的根拠を失わない範囲でAgentが組み立てられる。
- Research、Outline、Meaning Unit生成、意味変化、主張・根拠、QAの一部はAgentic Workflowで扱う。
- Agentを使う理由が「画面で働いて見せたい」「機能名を分けたい」だけの場合、runtimeを増やさない。Officeのペルソナを既存Executor／工程へmappingする。

正本: `REQ-AGENT-01`、`REQ-AOUI-04`、`REQ-KGA-08`。

## 7. Prompt Cache・記憶

- Layer A: Global／Workflow／状態機械。
- Layer B: Site Policy、文体、CTA、内部link方針。
- Layer C: freeze済みResearch／Outline／Section Brief。
- Layer D: Ticket固有の対象、差分、issue、userPrompt。

Prompt Cacheは費用・latency最適化であり、状態・知識の正本ではない。状態はSnapshot／checkpoint、Site知識はDerived Facts／Pack、横断知識は許可された共有資産で保持する。

### 7.1 会話・実行種別ごとの保持

| 主体／会話 | 既定保持 | 正本への反映 |
|---|---|---|
| Officeペルソナとの一般会話 | セッション中の生会話＋終了時の短いSession Summary | Summaryは次回の文脈復元用であり、業務設定を変更しない |
| planner／keyword_researcher等との方針相談 | Session Summary、確定したProposal／Command | 方針変更は確定CommandだけをMonthlyPlan、Site Policy等へ反映 |
| content_writer／qa_checkerへの記事指示 | Taskに必要なUser Order、差分指示、確定Proposal | 記事Taskへscopeし、承認なしにSite全体の文体学習へ昇格しない |
| Executor実行 | Ticket、Snapshot、checkpoint、version、usage | 「会話履歴」として保存せず、工程成果と監査事実として保持 |
| support_agentとの問い合わせ | Support Ticketと必要なmessage／要約 | Support保持Policyへ従い、SEO学習や記事生成Contextへ流用しない |

生会話をSiteの永久記憶として一律保存しない。Session Summaryは`tenant_id / site_id / persona_id / task_ref? / created_at / expires_at?`を持ち、ユーザーが確認・削除できるようにする。業務正本は確定済み設定、Proposal結果、Ticket、Snapshot、Derived Factであり、Summaryの文章から暗黙再構築しない。保持期間の実数はデータ保持Policyで確定する。

正本: `REQ-AGENT-03/07`、`REQ-PACK-14/15/16`。

## 8. Agent Officeとの分離

- 通常ビューとAgent Officeは同じ業務状態・APIを使用する。
- Officeのペルソナは独立runtimeではないが、単なる状態アイコンでもない。担当領域の説明、探索、会話、変更案、Task化、実行監視を担う継続的なユーザー窓口として、既存Executor、決定論サービス、Workflow、Toolへmappingする。
- OfficeでAgentへ話した内容は、質問回答、設定変更案、既存Task修正案、追加Ticket候補へ構造化し、影響と費用を確認してから確定する。
- Officeは監視専用に限定しない。通常ビューが簡単操作を担い、Officeは同じ業務正本を使って詳細探索、条件・方針変更、Agent指示、Task構成変更を行う。
- Pack、Ticket、Schema、Executor、primary／standby等の内部用語を顧客の第一階層へ出さない。
- personaごとの担当業務、正本、Proposal、Executor／Tool、Permission、設備の正本は`ai-office-de-seo-agent-office-ui-requirements_v3.7.md` §4の完全対応表とする。persona名だけの対応表や、キャラクターとExecutorの1対1表を別途作らない。

正本: `REQ-AOUI-01〜07`、`categories/design-experience-requirements_v1.md`、`categories/screen-operation-requirements_v1.md`。

## 9. 変更時の必須監査

Agent関連要求を追加・変更する前に、次を確認する。

- [ ] 既存 `REQ-AGENT-*` と `REQ-PACK-*` を検索したか。
- [ ] 新しい専門性をPack／Workflow／Schema／Catalogで表現できない理由があるか。
- [ ] 新しいExecutor、Agent、Ticket、Pack、状態を不必要に増やしていないか。
- [ ] Recommendationから既存Ticketへ再入力なしで接続できるか。
- [ ] Source Pack経由、SiteSandboxContext、DB直参照禁止を守るか。
- [ ] Workflow version、Pack version、Model／Tool集合をジョブ開始時にfreezeできるか。
- [ ] tool権限をPromptではなく実行層で強制できるか。
- [ ] retry／再開で二重LLM費用、二重credit、二重公開を起こさないか。
- [ ] 通常ビューとAgent Officeが同じ状態を参照するか。
- [ ] 顧客へ内部構造の設定を要求していないか。
- [ ] 分類別正本、旧要求、受入トレースを同一変更で更新したか。

## 10. 今回の棚卸し結果

- `REQ-AGENT-01〜11`、`REQ-PACK-01〜21`、`REQ-AOUI-01〜07`は廃止されておらず、現在も有効である。
- 分類別正本への移行は業務判断の正本移動であり、Agent実行詳細をゼロから再設計する許可ではない。
- CTAは既に `REQ-AGENT-02` と `REQ-PACK-17` でQA／Placement／Automation／限定Repairへ定義済みである。分類別 `REQ-LOGIC-14` はCV Goalと検索インテントの入力・割当だけを追加し、実行方式は既存要求へ接続する。
- Feature Object／App拡張は `REQ-AGENT-06` と `REQ-PACK-15` に既に接続境界があり、専用Agentまたは独立runtimeを既定にしない。
- 今後、分類別要求へAgent関連文を追加する場合は、本書の既存接続表と変更監査を先に通す。
