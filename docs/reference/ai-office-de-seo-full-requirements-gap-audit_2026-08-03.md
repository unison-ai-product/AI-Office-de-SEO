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
2. **L3画面プロトと現行業務Lifecycleの差** — 現行Lifecycle、導入、Report、Intake、Patch、評価の画面要求と受入条件は追加したが、実モックはなおS3起点・旧fixture中心である。要求上の再設計は進んだが、モック実装と操作試験は未完了。
3. **旧要求と現行要求の併存** — Screen Inventoryの現行S7をPrice Catalog／Plan Configuration／現行権限へ差し替え、Office監視専用と2026-07実装追記をsupersededと明示し、`PT-MIG-01〜05`を追加した。旧要求文書群全体の移行台帳と旧fixture migrationは未完了。
4. **認可モデルの画面・Agent・Automationへの伝播** — 操作対応表、L2集約、L3契約・DDL、プロト受入`PT-AUTH-01〜06`を2026-08-03に追加した。実装と負テストによる証明は未完了。
5. **プロト受入条件の現行化** — `PT-LC / AUTH / MARKET / REC / PATCH / REPORT / CMS / MIG`を追加し、旧画面の完成度だけで受入不可とした。fixture、実操作、状態遷移の自動試験は未実装。

### Important

6. Keyword Market Poolの所有、公共／Site ID、Public Cluster／Site Projection、Market／Share、更新、業界補正、Site補正、ユーザー修正学習の接続マップ、L2集約、L3 Source／DDL／event、プロト受入を2026-08-03に追加した。公共Sourceの購入原価・更新SLO・実装試験は未完了。
7. Recommendation TypeはAction Routing Map、L2集約、L3 Intake／DDL／event、`PT-REC-01〜04`へ正規Catalogとaliasを追加した。各Workflow、Patch、ユーザー対応の実装・契約試験は未完了。
8. MonthlyPlan、Recommendation、手動指定Taskは、ユーザー指定維持、自動予定再検証、依存順序相談、version／supersede規則をAction Routing Mapと`PT-REC-05/06`へ集約した。実装・同時更新試験は未完了。
9. 新規Site戦略Reportと既存Site診断Reportは、別の業務目的・章・入力availability・操作をKeyword Report接続マップ、L2集約、L3 schema／DDL／event、画面要件、`PT-REPORT-01〜06`へ追加した。実モック画面の作成と操作試験は未完了。
10. CTA/CVは軽量Patch接続マップ、L2集約、L3 action/result schema、DDL、event、`PT-PATCH-01/05`へ、記事目的、直接CV、認知貢献、月次／累積評価を追加した。実装と母数・判定閾値の較正は未完了。
11. 内部linkはcandidate lifecycle、承認Batch、候補単位の部分失敗、CMS反映確認、再評価を軽量Patch接続マップと`PT-PATCH-02〜05`へ追加した。実装・CMS別Contract Testは未完了。
12. CMS読取り経路はCMS接続Routing Map、L2 CmsConnectionProfile、L3 Profile schema／DDL／event、`PT-CMS-01〜05`へ、Site別選択結果、health、切替履歴、Capacity／Planを追加した。Adapter実装とfailover試験は未完了。
13. WordPress Capability MatrixはCMS接続Profileと画面Capability表示、`PT-CMS-01/05/06`へ接続し、read／write／Media／Editor／Preview／Revision／反映確認を分離した。CMS共通Publication JSON SchemaとCMS別Contract Testは未完了。
14. Office会話変更案は`schema.office.proposal.v1`、DDL、draft／estimate／confirm／dispatch／apply／cancel／supersede event、`PT-OFFICE-02〜07`へ、影響差分、credit／Capacity、認可、取消／rollback、通常ビュー同期を追加した。実装とDomain Command別Adapterは未完了。
15. 基本12＋technical_seo personaはAgent Office UI §4へ、担当業務、正本・Service、Proposal、Executor／Tool、Permission、設備の完全表を追加した。旧Office configが工程表示用`executors/stages`だけで一部personaを空にしていたため、Gate A-3 v1.4と初期configへService、会話能力、Proposal型を追加し、`PT-OFFICE-01`を強化した。残件は全personaの会話・Proposal・Task化を実プロトで操作試験すること。
16. アイキャッチPatternは接続マップ、L2集約、L3 Pattern／Image Job schema、DDL、event、画面規則、`PT-IMAGE-01〜08`へ、version、variation、ロゴ、CMS size、cache、生成結果、Media、再生成creditを追加した。Editor実装、画像回帰評価、Provider／CMS Contract Testは未完了。
17. 画面利用可否はUI Availability State Map、L3 Decision schema／event、画面共通規則、`PT-STATE-01〜06`へ、Scope、停止、障害、権限、Capability、Plan、接続、データ、credit、承認、処理中の優先と複合reasonを追加した。共通resolver実装と全画面fixture試験は未完了。
18. 通知受信者は固定担当者を必須にせず、権限・Site付与・購読設定・必須通知からServer側で解決する正本、Schema、DDL、Event、画面要求、PTまで接続済み。残件は実プロトのRecipient Resolver、設定画面、popup、fallback fixture実装。
19. AWS配置・観測・Runbook・自動復旧・bulkhead・circuit breaker・Backup／Restore・Release rollbackをL3接続マップ、Event、`PT-AWS-01〜06`へ具体化した。残件はcompute／DB／queue等のADR、IaC、障害注入、復元演習による実証。
20. 料金・利用枠・Capacity・追加容量・自動チャージは画面接続マップ、L2集約、L3 read model／Policy／Capacity schema、DDL、event、`PT-BILLUI-01〜08`へ接続した。残件はS7実モック、Stripe test fixture、Capacity集計fixture、権限・step-up操作試験。

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
