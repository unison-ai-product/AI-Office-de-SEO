# AI Office de SEO 要求追従・成果物台帳（2026-08-03）

## 1. 目的

要件更新に追従していない文書を「未定義事項」と誤認しないため、リポジトリ内の成果物を役割ごとに分類する。プロトタイプは要求・設計・契約の整合完了後に更新するため、本台帳では実装差分としてのみ管理する。

状態は次の4区分とする。

| 状態 | 意味 |
|---|---|
| `current` | 現行判断を表す正本または正本への接続文書 |
| `baseline` | 旧プロト・旧契約の事実を保存する移行用資料。現行要求の根拠にしない |
| `prototype_follow_up` | 要求・設計は確定済みで、プロト実装だけが未追従 |
| `true_open` | 既存判断から導出できず、設計・実測・外部検証・事業判断が本当に必要 |
| `current_with_migration` | 有効な詳細を含むが、同じ文書内にsupersededな旧判断も履歴として残る。Migration Mapを介さず現行判断に使用しない |

## 2. 成果物群の分類

`manifest.json`でもこの区分を機械可読に分離する。`canonical_paths`はL0・分類別L1・ロジック詳細だけを指し、旧L1詳細は`current_detail_paths`、横断判断は`cross_cutting_paths`、L2は`domain_paths`へ置く。配列間の重複は監査エラーとし、旧詳細や接続表を分類別要求の正本として誤読させない。

| 成果物群 | 対象 | 状態 | 現行の役割／判定 |
|---|---|---|---|
| L0 | `L0-charter/ai-office-de-seo-charter_v3.7.md`、`ai-office-de-seo-business-requirements_v1.md` | current | SEO運用代行システム、法人・個人、価格階段、AWS、CMS非依存、Feature Object、提供責任を定義 |
| L1分類正本 | `L1-requirements/categories/*.md` 16分類 | current | 分類ごとの要求本文とACの正本。READMEの責務分離に従う |
| L1ロジック詳細 | `L1-requirements/logic/*.md` 5文書 | current | 動的Recommendation、Summary、不足、品質・Repair、Crawler／AI可視性の判定詳細 |
| L1横断判断 | `requirements-decision-summary`、authorization、recommendation、keyword、report、patch、CMS、availability、image、notification、billingの各map | current | 会話で確定した横断判断と分類正本の接続境界 |
| 旧L1詳細要求 | product、navigation、agent runtime、Pack/Ticket、Keyword/GSC/Article、DataForSEO、WP、billing/provider、security/observability、rewrite、Agent Office、Admin、User Journey | current_with_migration | Agent／Pack等の有効な詳細を保持する一方、分類正本と矛盾する旧Role・旧価格・旧責務はMigration Mapを介して解決する。旧IDだけから新しい横断判断を作らない |
| 受入トレース | `ai-office-de-seo-acceptance-trace_v3.7.md` | current | 443 REQとcanonical ACを横断追跡する。旧ACの意味も現行判断へ更新する |
| 開発ロードマップ | `ai-office-de-seo-development-unit-roadmap_v3.7.md` | current | 現行SEO業務Lifecycleと商用成立条件に基づく構築順。コンサル必須・FAQ外出しの旧前提は廃止 |
| L2 | domain model、glossary | current | Site Build、Keyword Report、月次／週次計画、Recommendation、Publication Decision、評価、認可を集約・用語へ写像 |
| L3主要設計 | contract schemas、DDL、config registry、quality gate、decision table、AWS operations、handoff gate | current | 実装へ渡す契約・保存・設定・運用。`partial / missing / TODO(L3)`はtrue_open候補として管理 |
| Gate A | event、repository scope、office layout、design tokens、Ticket/Snapshot baseline | current | 現行監査中のdraft。旧「凍結」は解除し、監査後にversion固定する。A-5は互換baselineで、全契約正本ではない |
| 画面正本 | screen inventory、admin inventory、screen flow | current | 画面責務、通常／Office、管理面、Site導入から評価までの正規遷移 |
| UI設計補助 | UI parts catalog、prototype plan、prototype implementation map | current | 将来の実装変換と差分管理。現行認可・Lifecycleを参照する |
| 旧画面接続実測 | screen connection map | baseline | 2026-07-10プロトの実測。現行遷移の正本ではなく、追随作業時の差分入力 |
| 計画書 | `docs/plans/PLAN-L0-01`〜`PLAN-L3-02` | current | 各層の成果物とDoD。プロト更新は全要求・L2/L3・画面遷移の整合後 |
| review／audit資料 | `docs/reference/*review*`、`*audit*`、verification log | baseline | 当時の指摘と解消証拠。現在値の正本にはしない |
| open items | `ai-office-de-seo-open-items-register_2026-08-03.md` | current | true_open候補、後続機能、実測待ちを区別する作業台帳 |
| 機能一覧 | `docs/reference/FEATURE-LIST.md` | current | 443 REQの全数転記ではなく、現行Lifecycleと機能境界を利用者向けに要約する。全数coverageはacceptance traceを参照 |
| prototype modernization register | `ai-office-de-seo-prototype-modernization-register_2026-08-03.md` | prototype_follow_up | 現行要求との差分。要求監査が終わるまでプロト本体を変更しない |
| `prototype/` | DC HTML、support.js、config、Design、CLAUDE、asset refs | prototype_follow_up | 現行製品仕様の証拠に使わない。移行baselineとして保持 |
| 画像asset | `docs/reference/assets/**`、screen reference画像 | baseline | 視覚参照。画面責務・Agent数・業務仕様を決める正本ではない |

## 3. 追従完了の判定規則

1. 現行判断がL0、該当する分類別L1、詳細要求、L2、L3契約／DDL／設定／Event、画面責務／遷移、ACへ一方向に接続されている。
2. 同じ要求本文を複数分類へコピーせず、参照先を明記する。
3. 旧価格、旧Role、旧CMS専用設計、旧Office監視専用、コンサル必須、FAQ外出し、英語可読性基準等を現行値として使用しない。
4. `baseline`に旧値が残る場合、文書冒頭で正本ではないことと現行参照先を示す。
5. `true_open`は、既存回答の再質問、プロト未追従、旧文書の矛盾を含めない。
6. プロト更新は1〜5の監査完了後に別工程として行う。

## 4. 現在の監査状況

- REQ定義／coverage／AC traceの機械監査は通過している。
- 現行価格、契約周期、認可、AWS、CMS非依存、公開責任、15記事解放、月次／週次計画、1・3・6か月評価、FAQチャット、通常／Office同期を意味監査へ追加した。
- 画面遷移は新規Site／既存Siteの導入からRecommendation、制作・更新、CMS、公開判断、評価まで追従済みである。
- プロト本体は未編集であり、意図どおり`prototype_follow_up`に留めている。
- L3 Contract SchemasではTicket、未達Snapshot、Source欠損表現、13状態Workflow、Catalog型、Event payload、検証対応表を既存要求から補完した。DDLでは認可、URL、Snapshot／PostEnvelope一時保存、状態遷移、Config allowlistを補完した。
- 残る物理partition／圧縮／BigQuery境界、通知保持、k匿名・標本しきい値は、要求追従漏れではなく負荷・費用・法務・実データによる`DD-09/10`、`OC-08`として未確定台帳へ移した。
- 旧監査資料は履歴bannerを持ち、Officeの固定6部屋／固定Agent数を現行仕様として使用しない。UI Partsはframework非依存、Gate Aは現行要求境界を明示した。
- L3 Decision Table 35件はOpen Items Registerへ全件分類し、Configの`TODO(L3)` key familyも確定証拠と改版先へ接続した。
- L2／L3で旧IDを参照する文書には現行要求境界を必須化し、Site定義をCMS非依存へ修正した。
- 画面遷移のSource診断はSite接続を維持しつつ、Keyword分析開始とCMS write Capabilityを分離した。CMS送信だけを`connection_required`で保留し、成立済みSourceの分析・Reportを止めない。
- 共通DDL／event／Office configに残っていた`wp_post_id`、`wp_capability_snapshots`、`wp_draft`、`wp_url`等をCMS共通ref／stateへ移し、WordPress固有値は初期Adapter extensionへ限定した。
- Event EnvelopeとRepository Scope APIを顧客User、内部User、Service、AI Executor、期限付きManager代理へ追従させ、acting principalを顧客本人へ書き換えない契約、Site Assignment、業務Permission、authorization epochの負テストを追加した。
- Agent Workflowの旧「Assembly」混在を、QA前のSemantic AssemblyとQA後のPresentation Assembly／装飾／アイキャッチ／CTA・内部link Placement／CMS送信へ分離した。既存13状態keyは互換維持し、工程11の内部phaseとEventで詳細進捗を表す。

## 5. 主要決定の縦方向追従証拠

| 決定領域 | L1正本 | L2／L3証拠 | 画面／受入証拠 | 判定 |
|---|---|---|---|---|
| 製品・価格・契約 | BILLING-01〜03、BUS | Config pricing／Plan、Billing schema／DDL | S7、Feature List、Trace | aligned |
| 法人・個人と顧客組織 | ORG-01〜10 | Membership、Organization、Site Assignment | S7組織・Site、Screen Flow導入 | aligned |
| 3基本権限＋4業務権限 | ORG-03〜05、ACCESS-14〜16 | Authorization Decision、DDL、Repository scope | Authorization Matrix、Screen Flow §8 | aligned |
| 内部Admin／Manager／Operator分離 | ACCESS-01〜03、PAC-01 | internal role、期限付き代理、audit | Admin Inventory、顧客面→管理面遷移禁止 | aligned |
| 新規／既存Site Lifecycle | BUS-02〜08、SCREEN-01 | SiteBuildRun、KeywordReport、MonthlyPlan | Screen Flow §0・§5・§8 | aligned |
| Keyword Market／Site Share | KRL、KPD、KGA詳細 | Market／Share aggregate、Source schema、DDL | 戦略／診断Report、Office drilldown | aligned |
| Recommendation Intake | LOGIC-01〜03、BUS-08 | recommendation／intake schema、event、DDL | Queue→freeze→Preflight遷移 | aligned |
| Article Summary・本文非恒久保持 | DATA-03〜06、ASUM | Summary schema、一時PostEnvelope、TTL | 記事遍歴・Recommendation表示 | aligned |
| 新規15記事と自動投稿 | LOGIC-04、ORG-06 | Publication Decision、Automation delegation | Dashboard進捗、CMS下書き→公開分岐 | aligned |
| リライト・全文再生成 | LOGIC-05〜07、BUS-09 | Rewrite Ticket、Diff、backup／Revision contract | 下書き、差分、承認、安心保証 | aligned |
| 公開／更新後評価 | LOGIC-08〜10、KRL | InterventionEvaluation、evaluation event | 1・3・6か月、月次／累積、要監視 | aligned |
| CMS非依存・WP初期Adapter | INT-01・05・06、TECH | Publication Contract、CMS Connection Profile | Capability、縮退、再接続、持ち出し | aligned |
| 軽量計測 | MEASURE-01〜04、INT-03 | Tracker event、集約、本文／form非取得 | ページ表示・遷移・CTA・thanks | aligned |
| 通常／Office | DESIGN-01・09〜11、SCREEN-18・19 | 共通Command／Event、Office Proposal | Context保持・双方向遷移 | aligned |
| Agent／Officeペルソナ／実行責務 | AGENT-01〜11、PACK-01〜21、AOUI-01〜07、Agent Requirements Map | 共通Office Conversation Runtime、6実行責務、Ticket／Snapshot、persona別Service・Proposal mapping | 初期7部屋・13ペルソナはconfig baseline。ペルソナ数、Executor責務数、LLM同時呼出数を分離 | aligned（業務能力mappingは現行、プロト反映は後工程） |
| AWS・性能・障害封じ込め | NFR-01〜15、TECH-19、IRG | AWS Operations Map、bulkhead、RPO／RTO | 状態表示、Support、Admin運用面 | aligned（実証はtrue_open） |
| Feature Object拡張 | TECH-01〜09、GROWTH | Registry、Manifest、Execution Context、slot | App／Pack導線、Office拡張 | aligned（第三者Storeはpost-release） |
| AI表示性／Crawler | CAV、INT-08、MEASURE-12 | availability、観測schema構想 | 未提供を0件・測定済みと誤表示しない | aligned（提供技術はpost-release） |

`aligned`は要求・設計・画面の意味が一致したことを表し、実装済み、外部審査済み、負荷試験済みを意味しない。それらはOpen Items RegisterのLaunch blocker／Design decision／Operational calibrationで別管理する。
