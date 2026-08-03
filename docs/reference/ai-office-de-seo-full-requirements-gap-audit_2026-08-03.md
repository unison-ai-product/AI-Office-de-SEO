# AI Office de SEO 要求全体・新旧差分・画面／ロジック接続監査（2026-08-03）

## 1. 監査目的

要求を分類別に読むだけでなく、SEO業務Lifecycle、画面、Agent、ロジック、データ、外部連携、権限、課金、計測、運用が一つの製品として閉じるかを確認する。旧v3.7文書は設計資産として残すが、後から確定した分類別L1要求・決定サマリーと衝突する箇所を現行判断に使用しない。

## 2. 正本順位

1. `L1-requirements/ai-office-de-seo-requirements-decision-summary_v1.md`
2. `L1-requirements/categories/*.md`と`L1-requirements/logic/*.md`
3. 現行判断へ移行済みのv3.7 L1詳細要求
4. L2ドメイン設計
5. L3実装・画面プロト資料
6. 旧モックの実装記録

下位資料に実装済みの良い具体化がある場合は上位へ昇格させる。一方、下位に旧判断が残る場合は「実装済み」を理由に現行要求を巻き戻さない。

## 3. 新旧で変わった主要事項

| 領域 | 旧資料・旧モック | 現行要求 | 必要な移行 |
|---|---|---|---|
| 製品 | WordPress中心のSEO生成SaaS | SEO運用代行システム。初期AdapterはWPだが内部はCMS非依存 | L2/L3/UIのWP固有語をPort/Adapter境界へ寄せる |
| 業務起点 | 画面からkeyword/news/videoを選び生成 | Site導入→市場／既存診断→月次計画→Recommendation→採否→実行→評価→再推薦 | 画面遷移とイベントをLifecycle起点へ組み替える |
| Recommendation | 一覧・スコア・生成起動の入力 | Agent Interaction／Advisory／ExecutionをつなぐIntake Contract | L2集約、L3 schema、DDL、event、UI相関を追加 |
| Agent | 記事生成工程中心 | 製品全域で説明、探索、変更案、Task化、実行を担当 | Dashboard、Keyword、分析、Knowledge、Support、技術SEOまで接続 |
| Office | 監視専用・決定操作なし | 通常ビューの詳細操作面。会話・条件・方針・Task変更が可能 | 旧モックを履歴化し、Office詳細操作を再設計 |
| 公開 | 原則承認必須／旧full_auto表現 | 新規15記事承認後に自動投稿解放。リライトは下書き＋承認。hard gateは二段階確認＋同意で手動公開可 | L2不変条件、画面、event、承認状態を更新 |
| Provider | Claude優先 | 品質段階とCapability・原価・latency・healthによる交換可能Routing | Claude優先の旧本文・AC・用語を移行注記化 |
| 権限 | Owner/Admin/Editor/Viewer等の旧Role中心 | 契約者／管理者／利用者の基本区分＋目標管理、キーワード・サイト戦略、記事制作・検収、サイト分析等の業務権限 | 旧Role名を認可正本として残さずPermissionへ写像 |
| 課金 | 旧4価格・旧credit条件 | 39,800／98,000／198,000／398,000円～、変更可能なPlan Configuration | L0・旧L1・画面表示を現行Catalog参照へ統一 |
| データ | 記事中心 | 記事本文非保持＋Article Summary、記事遍歴、共有Keyword Market Pool | shared poolとtenant dataの境界・匿名補正をL2/L3へ明示 |
| 計測 | GSC中心＋多機能計測案 | 軽量Tracker、確実な遷移/CV、GSC、市場、月次／累積評価 | 初期計測と後続高度計測をUI・Plan・Adapterで分離 |

## 4. End-to-End接続監査

| 接続 | 必須入力 | 必須出力 | 現状 | 不備／処置 |
|---|---|---|---|---|
| Site設定→探索／取込 | Site、業界／業種、商品、顧客、地域、横断軸、CMS/GSC状態 | 新規探索seedまたは既存keyword集合 | L1あり | プロトの導入フローが旧画面構成のまま |
| 探索／取込→Keyword Cluster | market pool、GSC、upload、Site記事 | 主＋補助keyword、intent、funnel、業界、既存記事対応、availability | 詳細ロジックあり | shared poolのL2集約と更新・重複・価格原価境界が弱い |
| Cluster→戦略／診断Report | 市場規模、Site share、AIO/広告、記事対応、CV | 新規Site戦略Report／既存Site診断Report | L1あり | 既存Site Reportの「市場Keyword母集団→自社share」の画面構造がモックへ未反映 |
| Report→月次計画 | 目的、傾向配分、予算、Plan上限、ユーザー優先 | 重点領域、施策・記事・予算配分 | L1あり | MonthlyPlanとRecommendationのversion／再計算関係をL2/L3でさらに固定する必要 |
| 月次計画→Recommendation | cluster、記事、CV/CTA、内部link、品質、費用、保護、依存 | 理由付き施策候補 | KRLあり | Recommendation Aggregate／Intakeが欠落していたため本監査で追加 |
| Recommendation→Agent Workflow | 採用Recommendationのfreeze済み全情報 | Intake、Ticket、Job、correlation | **本監査で接続** | JSON Schema実ファイルとContract Testはまだ未作成 |
| Workflow→QA／Repair | Brief、Outline、Meaning Unit、Site規則、根拠 | QA Snapshot、限定Repair | 詳細要求あり | 品質別route、Preflight、Repair上限の設定正本と画面表示の対応表が未完成 |
| QA→CMS下書き／公開 | QA、装飾、画像、Capability、承認／Automation Policy | Draft、Preview、公開結果 | L1あり | 旧L2の一律承認を本監査で修正。プロトは15記事解放・リライト別承認を再現できていない |
| 公開／更新→計測 | correlation、公開日時、変更分類、cluster、CV Goal | GSC、順位、遷移、CV、認知貢献 | L1あり | CTA評価とSEO評価の起点分離、月／累計表示が画面未反映 |
| 計測→評価→学習 | 1/3/6か月、月次・累積、季節性、AIO/広告、Site/全体補正 | success/observe/悪化、Site補正、匿名補正候補 | L1あり | Recommendation評価eventとcorrelationが欠落していたため本監査で追加。判定式・母数は一部未確定 |
| 例外→Support／運用 | 接続診断、job、FAQ、システム／Site原因 | 自己解決、再実行、問い合わせ、運用Task | L1あり | FAQ Chatと診断code、Runbook、開発ログの具体接続がL3未定義 |

## 5. 現在の要求不備台帳

### Critical

1. **Recommendation Intakeの下流契約欠落** — L1では採用後引継ぎを要求するが、L2集約、L3 schema、DDL、eventがなかった。本監査で骨格を追加。実JSON SchemaとContract Testは残る。
2. **L3画面プロトが現行業務Lifecycleを表していない** — S3起点の生成、旧7画面、Office監視専用の実装が中心。新規／既存Siteの導入、戦略／診断Report、月次計画、Recommendation Intake、15記事解放、段階評価を一本の画面遷移として再設計する必要がある。
3. **旧要求と現行要求が同じ文書群に有効形で併存** — Claude優先、一律承認、旧Role、旧価格、Office監視専用等。移行注記がある文書とない文書が混在し、L2/L3が旧IDを参照する。
4. **認可モデルの画面・Agent・Automationへの伝播** — 操作対応表、L2集約、L3契約・DDL、プロト受入`PT-AUTH-01〜06`を2026-08-03に追加した。実装と負テストによる証明は未完了。
5. **プロト受入条件が旧画面の完成度を検証している** — 現行Lifecycleに必要な画面がないまま、旧モックの導線・監視面の完成を受入可能にしている。Prototype Acceptanceを現行Journey単位へ改訂する必要がある。

### Important

6. Keyword Market Poolの所有、公共／Site ID、Public Cluster／Site Projection、Market／Share、更新、業界補正、Site補正、ユーザー修正学習の接続マップ、L2集約、L3 Source／DDL／event、プロト受入を2026-08-03に追加した。公共Sourceの購入原価・更新SLO・実装試験は未完了。
7. Recommendation TypeのCatalogが未確定。新規、リライト、CTA Patch、内部link Patch、観測、技術エスカレーション、Automation変更等を、何でも記事生成へ流さない契約が必要。
8. MonthlyPlan、Recommendation、手動指定Taskの競合・優先・supersede規則が複数文書へ散在。
9. 新規Site戦略Reportと既存Site診断Reportの画面情報設計が不足。既存Siteも市場Keyword母集団に対する自社shareを基線にする必要がある。
10. CTA/CVはパーツ・リンク先・検索intent・記事目的へ接続済みだが、記事目的別の直接CV／認知貢献評価と画面表示が未完成。
11. 内部linkは提案・Patch方針があるが、link candidateの状態、承認batch、公開結果、失敗、再評価の契約が不足。
12. CMS読取り経路の自動選択はL1にあるが、Siteごとの選択結果、health、切替履歴、料金／Plan制御のL2集約がない。
13. WordPress Capability Matrixは詳細だが、CMS共通Publication ContractとUI表示項目の完全対応表がない。
14. Officeの会話変更案はL1にあるが、Proposal schema、影響差分、credit見積、取消／rollback、通常ビュー同期eventがL3未定義。
15. Agent personaと「担当業務・利用Service・Tool・Workflow・Permission・Office設備」の完全Mappingがない。
16. 画像Pattern Editorはアイキャッチ基盤として決定しているが、Pattern version、variation tolerance、ロゴ余白、CMS size、生成結果、cache、再生成creditのL3 schemaが未確定。
17. 画面のプランロック、データ不足、接続不足、権限不足、処理中、障害の状態優先順位が統一されていない。
18. 通知はevent型を持つが、誰へ出すかを固定担当者概念へ寄せず、権限・購読設定・通知Center・必須通知から解決する規則のプロト反映が不足。
19. L3のAWS配置・観測・Runbook・自動復旧・bulkhead・circuit breakerは要求に対して骨格段階。
20. 料金・利用枠・Capacity・追加容量・自動チャージの画面モックとPlan Configurationの対応が不足。

### Structural / Audit

21. `audit-requirements.mjs`はID・参照・AC集合の構造整合を証明するが、意味上の正本順位、新旧衝突、Lifecycle接続、画面カバレッジは証明しない。
22. `TODO/open/未確定/要調整`はL1〜L3・プロトに多数残る。単純件数ではなくLaunch blocker、設計時確定、運用較正、将来構想へ分類する台帳が必要。
23. L2/L3の根拠REQが旧`REQ-PRODUCT/KGA/WPA/BILL/SEC`中心で、分類別現行REQとの双方向参照が不足。
24. 旧レビュー指摘が修正済みかを、レビュー文書自身に`resolved/superseded/open`で返していない。

## 6. 画面プロトを磨くために必要な再構成

### 通常ビュー

1. Dashboard: 判断待ち、月次計画、今週予定、Recommendation、完了・評価、利用量を優先順で表示。
2. Site構築: 新規／既存を分け、接続・入力・分析・Report・Recommendationまで段階開放。
3. Keyword: Market全体と自社Shareを同じ基線で表示。Clusterを基本単位に、個別Keywordは詳細へ。
4. Strategy/Diagnosis Report: 新規と既存で章立てを分け、修正は大分類の優先・保留・除外程度に抑える。
5. Recommendation: 理由、役割、依存、内部link、CTA、credit、実行可否を表示し、採用でIntakeへ接続。
6. Content/Automation: 新規、リライト、軽量Patchを別Workflowとして見せ、15記事解放と承認条件を明示。
7. Evaluation: 公開／更新起点、1/3/6か月、SEO、CTA/CV、認知貢献、要監視を分離。

### Agent Office

1. 通常ビューの各対象からContextを保持して担当部屋・Agentへ移動。
2. Agentごとに担当業務、見られる情報、変更できる条件、発行できるTaskを定義。
3. 会話は質問回答と状態変更を分け、変更時はProposal→影響／費用→確定→共通Command/Eventとする。
4. Keyword roomは市場、Share、Cluster、根拠、配分、除外、方向性を詳細操作できるようにする。
5. Content roomはRecommendation IntakeからBrief、Outline、Meaning Unit、QA、Placement、公開、評価まで相関表示する。
6. Knowledge Graphは演出ログではなく、Recommendation、Keyword Cluster、記事、Task、評価、学習の実entityで構成する。
7. 3Dを業務成立条件にせず、軽量2Dへ縮退しても同じ情報・操作を保つ。

## 7. 次の修正順序

1. Recommendation IntakeのJSON Schema、DDL制約、event payload、Contract Testを完成させる。
2. 現行Lifecycleを画面Journey／Inventory／Flow／Prototype Acceptanceへ全面反映する。
3. 権限の基本区分＋業務Permissionを、画面、Agent、Automation、CMS write、課金へ一枚で接続する。
4. Keyword Market Poolと市場→Share→戦略→Recommendation→評価のデータ／ロジック契約を完成させる。
5. 旧要求の移行台帳を作り、旧本文ごとに`current / partially migrated / superseded / historical`を付ける。
6. 残るTODOをLaunch blocker／L2確定／L3確定／運用較正／後続releaseへ分類する。

## 8. 本監査で直した箇所

- L2へRecommendation Aggregateと状態、不変条件、BC間接続、eventを追加。
- L2のClaude優先、一律承認、Office独自状態なしを現行決定へ修正。
- L3へ`schema.intake.recommendation.v1`骨格とTicketの`intakeRef`を追加。
- DDLへRecommendation version、Intake freeze、correlation、所有Contextを追加。
- Event EnvelopeへRecommendationの提案、採用、保留、失効、dispatch、評価、学習を追加。

本書は不備を隠す完了報告ではない。各項目が要求、画面、契約、試験へ反映された時点で状態を更新する。
