---
document_id: AOS-L2-GLOSSARY
title: AI Office de SEO 用語一覧（ユビキタス言語） v3.7
version: 3.7
layer: L2
kind: design
status: current-draft
updated_at: 2026-08-03
related_plan: PLAN-L2-01-ai-office-de-seo-domain-model
---

# AI Office de SEO 用語一覧（ユビキタス言語）

L2ドメインモデルの共通語彙。定義はL1要求（根拠REQ）に基づく。文脈＝所属する境界づけられたコンテキスト（BC）。

分類別L1要求を現行判断の正本とし、旧v3.7 IDはLegacy Requirement Migration Mapに従う詳細参照とする。用語定義が旧価格、旧Role、WordPress固定、Office監視専用等を復活させてはならない。

## テナント・アクセス（Tenancy & Access）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Tenant | 契約単位。ID型論理分離で他テナントと越境不可 | REQ-PRODUCT-10 / REQ-SEC-07 |
| Site | 顧客組織がSEO運用対象として登録するWebサイト。分析・生成・計画・評価・CMS接続の境界であり、CMS種別には依存しない。初期の書込AdapterはWordPressを対象とする | REQ-ORG-01〜04 / REQ-INT-01・05 / REQ-PRODUCT-02 |
| Site Connection Readiness | `site_identified / analysis_ready / content_read_ready / delivery_ready`をCapability別に保持する導入状態。Site登録、分析入力、記事読取り、CMS書込みを一つの「接続済み」へ丸めない | REQ-BUS-02 / REQ-LOGIC-03 / REQ-INT-05 |
| SiteSandboxContext | ジョブ実行時に固定される `tenant_id`/`site_id`/`job_id` の境界。実行中に変更不可 | REQ-PRODUCT-02 / REQ-SEC-11 |
| 基本権限・業務Permission・Site Assignment | 顧客認可の3要素。基本権限は契約者／サイトオーナー／ユーザー、業務Permissionは目標管理／キーワード・サイト戦略／記事制作／サイト分析、Site Assignmentは対象Siteを限定する | REQ-ORG-03〜07 / REQ-ACCESS-14〜18 |
| User Order | ユーザー要望（soft/normal/strong）。SEO証跡・規制・境界を上書き不可 | REQ-PRODUCT-07 / REQ-PACK-02 |
| Target Axis / Claim Axis | ユーザー自己サーブの戦略入力（誰向け・何を主張/避けるか）。Domain Positioningへ写像し、ゲート検証・影響帰属の対象 | REQ-PRODUCT-12 |
| Master Tenant | 運営自身のドッグフーディング用内部テナント（特別扱いは課金のみ・ゲート/境界/監査は同一経路） | REQ-PRODUCT-23 |
| Showcase Consent / Case | 事例転用の明示オプトイン許諾（範囲指定・撤回で停止/削除）と転用時点スナップショット | REQ-PRODUCT-23 |
| Invitation Token / Owner Recovery | 期限付き単回の招待トークンと、Googleロックアウト時のオーナー回復手続き（管理者統制・自動化なし） | REQ-SEC-16 |

## コンテンツ索引（Content Index）
| 用語 | 定義 | 根拠 |
|---|---|---|
| URL Master Key | `canonical_url_hash` を主キーとするURL正本。照会はURL・管理はID | REQ-PRODUCT-03 |
| Article Summary | 記事のメタ（title/meta/見出し/要約/content_hash）。本文全文は保持しない | REQ-PRODUCT-04 / REQ-SEC-11 |
| Keyword（正規化） | 表記ゆれを寄せた正規化キーワード。修飾語違いは別キーワード | REQ-KGA-02 |
| Keyword Map / Graph | keyword⇔GSCクエリ⇔記事URLを結ぶグラフ | REQ-KGA-03 / REQ-KGA-12 |
| Same SERPs Cluster | 同一SERPsで競合するキーワード群 | REQ-KGA-03 |
| Article Map | サイト内記事の構造・対象キーワード・カバー率の一覧 | REQ-KGA-07 |
| Keyword Attribute | 辞書・SERP構成・GSC共起から決定論付与する属性（intent/ターゲット適合/業界適合/YMYL近接） | REQ-KGA-13 |
| Assignment Ledger | キーワードグループ⇔主担当記事の台帳（1グループ高々1・状態管理・Intake Gateプレチェック） | REQ-KGA-14 |
| Match Cascade | GSCクエリ⇔キーワードの多段決定論マッチ（exact/synonym/containment/co-landing/限定serp/unmatched。method・confidence記録） | REQ-KGA-15 |
| Long-tail Promotion | 未マッチ裾のクラスタ集計昇格（親ありはセクション/FAQ候補、親なしはバックログ） | REQ-KGA-16 |
| Keyword Market Pressure | キーワード市場の外部圧力。AIOのゼロクリック/引用機会、リスティング広告占有、対象トピックに対する自サイトのドメイン信用適合を別軸で保持する | REQ-KGA-17 |
| Keyword Strategic Need | サイト基盤としての必要性、流入機会、CV機会の3目的。現在の戦略プロファイルで配分し、動的優先度へ変換する | REQ-KGA-23 |
| Keyword Value Score | 需要、市場圧力、戦略目的、実現可能性を成分別に持つ決定論の価値評価。単一スコアだけを判断根拠にしない | REQ-KGA-17/23 |
| Topic Origin（起点3類型） | keyword / news_trend（鮮度期限つき）/ video_demand のトピック発生源。採用判断はユーザー | REQ-KGA-18 |
| Site Topology | 幹→枝→葉の階層とカテゴリ×タグ網目。生成順序（CV近接）とリンク再調整ループの正本 | REQ-KGA-19 |
| Derived Facts（導出事実） | 調査由来の低変化事実のコンパクト蓄積。鮮度期限内は外部再取得を省略 | REQ-PRODUCT-19 |
| Intervention Ledger（施策台帳） | 施策タイプ×文脈×効果デルタの記録。較正・好調分析・成果較正の入力 | REQ-PRODUCT-19 |
| Article Summary Contract | 記事が持つトピック・意図・読者・問い・主張・意味ユニット・エンティティ・CTA・リンク可能性・鮮度・不足を、上限つきの構造化インベントリとして保持する契約。本文は保持せず、推薦の一次入力と軽量意味索引の入力に使う | REQ-PRODUCT-20 |

## 検索実績（Search Performance / GSC）
| 用語 | 定義 | 根拠 |
|---|---|---|
| GSC Data Mart | GSC実績の日次蓄積（都度API参照でなく蓄積） | REQ-PRODUCT-05 / REQ-KGA-11 |
| Coverage | 登録被覆率／クリック加重被覆率。未カバー主題を検出 | REQ-KGA-05 |
| Query Drift | 記事の獲得クエリのずれ分類 | REQ-KGA-06 |
| Cannibalization | 被覆重複>50%かつ流入分散のカニバリ | REQ-KGA-07 |
| Rewrite Candidate | GSC／登録Keyword等の分析信号と、取得済みArticle Summary・本文構造・公開状態・施策履歴・競合差分等から原因分類したリライト候補。本文変更を伴う候補は対象記事の読取りSnapshotが成立していることを必要とし、GSCまたはKeyword実績だけでは成立しない | REQ-BUS-02 / REQ-KGA-08 / REQ-RWR-06 / REQ-LOGIC-02 |
| Anonymized Query | GSCが匿名化するクエリ（合計と一致しない前提） | REQ-KGA-11 |
| Watchlist | ユーザーが手動ピン留めするキーワード監視（しきい値通知・下落時導線） | REQ-KGA-20 |
| Volatility Guard | SERP/アルゴ変動期間中にリライト・統合の重大判定を保留する判断ガード | REQ-KGA-20 |
| Index Status | 公開URLのインデックス登録状況・技術ヘルスの監視（クォータ配下・決定論） | REQ-KGA-21 |
| Monthly Plan | 月次目標・配分・参考レンジ予測（保証しない）・実績乖離の計画単位 | REQ-PRODUCT-17 |
| Site Build Run | Site設定からKeyword分析・Report段階開放までの構築実行。新規／既存、入力成立、big keyword確認、coverageを追跡する | REQ-BUS-02〜05 |
| Keyword Strategy Report | 新規Siteの市場、適合、必要領域、優先Cluster、構造提案、制作順、月次配置を示すversion付きReport | REQ-BUS-04 |
| Keyword Site Diagnosis Report | 既存SiteのMarket／Share、獲得・未獲得Keyword、記事・Query対応、保護、Drift、カニバリ、index、施策配分を示すversion付きReport | REQ-BUS-05 |
| Weekly Execution Selection | 月次計画とRecommendationから、当週のcredit、Capacity、依存、保護、品質条件に収まる実行候補と順序をfreezeした単位 | REQ-BUS-07 / REQ-UJ-09 |
| Intervention Evaluation | confirmed Publication Factを起点に介入別Evaluation Laneを束ねる施策評価。`seo_content`は1／3／6か月、`cta_cv / internal_link / awareness`は変更月・累積で評価し、外部変更は交絡要因として分離する | REQ-LOGIC-06〜09, REQ-MEASURE-13/14 |
| Evaluation Lane | SEO本文、CTA／CV、内部link、認知を別の起点・周期・指標で追跡する評価単位。記事へ単一の評価時計を置かず、別Laneの変更でSEO周期をresetしない | REQ-LOGIC-13, REQ-MEASURE-02/13/14 |

## 外部情報（External Intelligence）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Source Pack | 外部/内部データを抽象化しJSONで返す取得系Pack | REQ-PACK-06 / REQ-PACK-07 |
| Query Fanout | シード/GSCクエリをfacet別サブクエリへ分解（Google公開ロジック準拠） | REQ-SRC-02 / REQ-SRC-09 |
| Competitor Structure Pack | 競合上位5記事の抽象構造（本文非保持） | REQ-SRC-03 |
| DataForSEO Cache | 外部取得のTTL付きキャッシュ | REQ-SRC-08 |
| Batch Priority | 事前計算の優先度 P0〜P5 | REQ-SRC-05 / REQ-SRC-08 |

## 生成（Generation）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Workflow | ステージ・遷移・ループ・停止条件を定義する実行手順（版固定） | REQ-AGENT-06 |
| State Machine / 工程 | Workflowの遷移図。13状態（実務工程9＋強制ゲート4、Intake→…→Cleanup）を強制 | REQ-AGENT-09 |
| Semantic Executor | WorkflowからTicketを受け、LLMを利用して意味判断・生成・意味検査を行う内部実行責務（Planning/Writing/QA/Repair）。Officeペルソナや常駐する人格と同義にしない | REQ-AGENT-01 |
| Action Executor | Ticket／Commandを受け、許可Toolによる外部副作用を実行する責務。Automation Executorは原則として決定論で動作し、LLMへ公開判断を委ねない | REQ-AGENT-01/06 |
| Officeペルソナ | Agent Officeでユーザーが話しかける詳細運用上の担当窓口。Task状態を説明し、変更指示を型付きProposalへ変換するが、独立runtimeや業務正本を持たない | REQ-AOUI-03/04 |
| Office Conversation Runtime | 全Officeペルソナが共有し、persona別Role Profile、Permission、Task Projection、Proposal Schemaを解決して回答・変更案・Ticket候補を返す会話実行基盤。確定操作は所有BCの共通Commandへ渡す | Agent Requirements Map §3.0/§6 |
| Orchestrator | Workflow工程、Ticket、Snapshot、停止・再開を調停する内部制御。Officeのplannerとは別物 | REQ-AGENT-01/06 |
| Session Summary | Officeペルソナとの1会話セッションを圧縮した文脈復元用要約。業務設定・知識・実行状態の正本ではない | Agent Requirements Map §7.1 |
| Ticket | 作業命令。本文を内包せずキー（workflow/prompt/source/schema）のみ発行 | REQ-PACK-01 / REQ-PACK-03 |
| Pack | Prompt Pack（注入系）/ Source Pack（取得系）/ Catalog（参照集合） | REQ-PACK-01 / REQ-PACK-02 |
| Catalog / Registry | 版固定の参照集合（Quality Gate/Article Type/Meaning Unit等） | REQ-PACK-01 |
| PackExtract | Executorへ渡す最小限のPack（構造+few-shot+制約、本文全文は渡さない） | REQ-PACK-15 |
| Router / Injector | 選択キーを解決しsystem promptへ固定制約を強制注入する機構 | REQ-AGENT-07 |
| Prompt Cache Layer | A:Global Runtime/B:Site Policy/C:Research&Outline/D:Task Dynamic | REQ-AGENT-03 |
| Suspend / Resume | 保留系状態の統合とステージ境界checkpointからの再開。同一Jobの追加顧客課金はなく、cache再ウォームは内部原価として計測する | REQ-AGENT-10 |
| Execution Lane | interactive / scheduled（Batch×1hキャッシュで割安）。ユーザーには「今すぐ/おまかせ」 | REQ-BILL-11 |
| Meaning Unit（記述タイプ） | H2/H3でなく執筆の作業単位（主張+理由/具体例/比較等、39種（video_reference含む・拡張可能な初期集合）） | REQ-PACK-11 / REQ-PACK-18 |
| Article Type / Heading Flow | 記事構成型／H2·H3内の意味ユニット並び（アウトライン層） | REQ-PACK-11 / REQ-PACK-13 |
| Outline Contract | freezeされたアウトライン（MeaningUnitPlanを持つ） | REQ-PACK-18 |
| Pack Compiler | 見本記事・User Knowledgeから用途別Packを圧縮生成（版固定） | REQ-PACK-16 |
| Snapshot | Executorが返す成果・自己チェック・メタ | REQ-PACK-01 |

## 品質（Quality）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Quality Gate | hard（生成禁止）/advisory/修飾ゲート。Google公式ベースの機械判定シグナル | REQ-PACK-09 / REQ-AGENT-08 |
| 計測指標 | keyword密度・可読性・カバー率・独自性・近似度等（初期値・要調整） | REQ-PACK-10 |
| few-shot | 生成の教示（正例/反例）。QAと同一のgate定義を単一ソースにする | REQ-PACK-12 |
| Writing Method（執筆技法） | 3層階層と直交する横断修飾レイヤ（technical/logical/content_marketing/sales/seo/storytelling）。primary 1＋modifier≤2、ゲート＞技法の優先固定 | REQ-PACK-19 |
| Composition Frame（構成フレームワーク） | PREP/SDS/PAS/AIDA等。新レイヤでなくheading_flow拡張列挙＋ユニット並びテンプレで表現 | REQ-PACK-11 / REQ-PACK-19 |
| Review Lens（検品レンズ） | 校正/校閲/推敲/Web原則/SEO/論文/マーケの7観点。既存ゲートの束ね方（view）であり合否は常にgate単位 | REQ-PACK-20 |
| Accessibility Quality Floor | キーボード到達・フォーカス可視・WCAG AA目安・reduced-motion尊重の最低品質線（Gate A-4実装既定・要求正本はNAV-08） | REQ-NAV-08 |
| UI Text Registry | ユーザー面文言のkey→文言カタログ（ui.text.*）。版activateでデプロイなし差し替え・2層フォールバック・禁止語/変数Validate・**型付きアクセサ生成（関数⇄日本語の双方向変換）と逆引き**。法務文言は対象外 | REQ-NAV-09 |
| Method Variant | 同一技法内の強度・姿勢パターン（sales: push/pull/assist_only=左手は添えるだけ）。列挙爆発を防ぐ軸 | REQ-PACK-19 |
| Reader Segment | 読者セグメントのカタログ（リテラシー/心理パターン/シチュエーション/デモグラ。属性は検証用途限定） | REQ-PACK-21 |
| Persona Simulation（転生検証） | LLMをセグメント読者に転生させ構造化出力で受け取られ方を検証。advisory＝合否の正はゲート | REQ-PACK-21 |
| Style Color | サンプル記事の代表抜粋＋構造化文体特徴。サイトの声の実例アンカー（Layer B・human_voice対比素材） | REQ-PACK-16 |
| human_voice | AIらしさ除去ゲート（定型表現の決定論検出＋例示/Style Color対比。初期advisory・較正後hard昇格可） | REQ-PACK-09 |
| QA / Repair | 検査と、落ちた意味ユニットだけの修復ループ | REQ-AGENT-02 |
| Cohesion QA / Term Lock | 組立後の全体読み通し検査（coherence_flowゲート）と、Outline凍結時に確定する用語・表記の固定リスト | REQ-AGENT-11 |
| Golden Eval Set | Pack/ゲート改版時に品質回帰を検知する固定タスク群の評価セット（Validate段で実行・段階ロールアウトと併用） | REQ-ADM-10 |

## リライト（Rewrite）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Article-as-Code | 既存記事を一時ワークスペースでコードのように部分編集する方式 | REQ-RWR-02 |
| Article Workspace | tenant/site/job固定の一時編集領域。完了・承認・期限で破棄 | REQ-RWR-02 |
| Patch Operation | Edit Plan宣言のsection_id内に限定した編集操作 | REQ-RWR-03 |
| Rewrite Cause Analysis | リライト対象・種別を決める原因分析 | REQ-RWR-06 |
| Winner Protection（好調保護） | 好調記事の保護フラグ・慎重警告・変更範囲限定と、波及リンク強化・リライトブリーフ | REQ-RWR-08 |
| Flash Rewrite（TDH） | 本文非変更でTitle/Description/H1のみ差し替える軽量リライト（CTR負残差起点・同順位帯比較） | REQ-RWR-09 |

## 公開・自動化（Publishing & Automation）
| 用語 | 定義 | 根拠 |
|---|---|---|
| WP Capability Snapshot | WPの対応能力の取得。未対応は代替HTMLで補わない | REQ-WPA-08 |
| Dynamic Post Schema | 生成物をWP slot/block/fieldへ封入する動的スキーマ | REQ-WPA-02 / REQ-WPA-09 |
| Post Envelope | slot割当済みの投稿封入体（一時保存、最終HTMLは非保持） | REQ-WPA-09 |
| Scheduled Action / Automation Policy | 予約投稿・自動化ポリシー（承認ゲート付き） | REQ-WPA-04 |
| Publication Decision | CMS公開／更新の副作用前に、15記事解放、Automation同意、リライト承認、hard gate確認、権限・予算・接続を評価する不変の判定version。実行結果を後書きしない | REQ-LOGIC-04/05 |
| Publication Job | Decisionに基づく公開／更新の予約、実行、再試行、外部反映確認を担うJob。予約・API受付だけでは公開成功にならない | REQ-LOGIC-03/04, REQ-WPA-04 |
| Publication Fact | 外部検証済みの公開／更新事実。結果hash、effective time、証拠、`ai_office_publication / external_change / unknown_source`の帰属を持ち、実績・Activation・評価起点の正本になる | REQ-MEASURE-13/14 |
| CV Event | コンバージョン計測イベント | REQ-WPA-05 |
| Engagement計測 | 滞在・スクロールの個人非特定集計（任意有効化・相関補助） | REQ-WPA-11 |
| Partial Patch（部分パッチ） | 公開済み記事へのブロック/要素レベル小粒更新（リビジョン保存・競合検知・分散適用） | REQ-WPA-12 |
| CV Point Ledger | CVポイントカタログと記事×割当台帳（CTA Placementの解決先・有効期間つき） | REQ-WPA-13 |

## 課金・クレジット（Billing & Credit）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Plan / Subscription | プランと購読状態（active時のみ月次付与） | REQ-BILL-01 / REQ-BILL-08 |
| Credit | 生成消費の単位。品質グレード別消費係数を持つ | REQ-BILL-02 / REQ-BILL-03 |
| Credit Ledger | append-onlyの台帳（reserve/commit/release/grant/expire等） | REQ-BILL-07 |
| Preflight Estimate | 実行前の決定論的な消費見積（予約額の根拠） | REQ-SEC-12 / REQ-BILL-02 |

## プロバイダ（Provider）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Provider Adapter / Registry | LLMプロバイダの正規化アダプタと登録簿 | REQ-BILL-09 |
| Routing Policy | 品質段階、用途別Capability、原価、latency、health、契約条件によるversion付き振り分け。特定Provider名を不変条件にしない | REQ-TECH-10 / REQ-AGENT-04 |
| Cost Table / Capability Matrix | プロバイダ別原価表・能力表 | REQ-BILL-09 |

## 設定・ガバナンス（Config & Governance）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Config Registry | 価格・しきい値・クォータ等をversion/effective/statusで管理する設定 | REQ-BILL-10 / REQ-ADM-09 |
| Feature Flag / Kill Switch | 機能フラグと緊急停止 | REQ-DUR-04 |
| Safety Invariant | 設定で緩められない安全境界（サンドボックス/本文非保持/監査/承認/APIキー非表示） | REQ-ADM-09 |
| Network Learning / Global Signal Store | テナント横断のk匿名集約（辞書候補・セグメントprior・較正提案）。一方向・提案のみ・承認付き適用 | REQ-PRODUCT-13 |
| Change Budget / Oscillation Detection | full_autoの自動変更予算・同一記事クールダウン・振動検知（相互打ち消し→自動停止） | REQ-PRODUCT-18 |
| Quiet Window（静穏時間帯） | テナントTZ別のバッチ配置窓。窓内オフセット分散でプラットフォーム全体を平準化 | REQ-SRC-10 |

## 観測・監査（Observability & Audit）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Token / Cache Tracker | トークン・キャッシュ消費の追跡 | REQ-SEC-03 / REQ-SEC-13 |
| Contract Validation | Ticket/Snapshot/Source Extract等の契約検証 | REQ-SEC-13 |
| Audit Log | 不変・テナント分離の監査ログ（本文・プロンプト全文は残さない） | REQ-SEC-10 / REQ-ADM-06 |
| Notification / 通知センター | ドメインイベントから導出する通知。in-app正本・境界内配信・Role別受信者解決 | REQ-PRODUCT-11 |
| Mail Suppression（抑制リスト） | 連続バウンス・苦情によるメールチャネル自動停止（in-app正本は不変・再有効化導線） | REQ-PRODUCT-21 |

## サポート（Support）
| 用語 | 定義 | 根拠 |
|---|---|---|
| Support Ticket | in-appサポートパネル/メール窓口を統合するチケット（本文/プロンプト非含有） | REQ-PRODUCT-22 |
| Deflection（一次解決率） | AI一次応答による自己解決の割合。「少人数で回る」の検証KPI | REQ-PRODUCT-22 |

## 体験・UI（Experience / Agent Office）
| 用語 | 定義 | 根拠 |
|---|---|---|
| View Mode | 通常SaaSビュー / Agent Officeビュー（同一詳細・API・状態を共有） | REQ-AOUI-01 |
| Room / Department | Agent Officeの部門（7室、config駆動で拡張可） | REQ-AOUI-03 / REQ-AOUI-07 |
| Persona | 部屋のエージェント表現。内部Executor/工程へマッピング | REQ-AOUI-04 |
| Choice Menu | 「何を見ますか？」→同じ詳細画面へ導く体験レイヤー | REQ-AOUI-01 |

## UI表記対応表（ドメイン用語 → 画面表示。REQ-NAV-01の平易化正本・2026-07-08制定）

書面・イベント名・スキーマは左列（ドメイン用語）を使い続ける。**画面のUI文字列は右列に統一**する（SEO非専門者向け。高度なビジネス用語・英略語・内部語を出さない）。プロト実装済み。

| ドメイン用語（書面・内部） | UI表記 | 備考 |
|---|---|---|
| ジョブ（Job） | タスク | ID体系 `J-####`・`generation.job_*` イベント名は不変 |
| scheduledレーン（Batch実行） | おまかせ（夜間割安） | 2026-07-08 表記統一（旧: 「おまかせ（夜間）」混在）。夜間チェックタブとは別概念 |
| 要求ID（REQ-*） | （UIに表示しない） | 2026-07-08 制定: UI注記に要求IDを出さない。対応は書面側で保持 |
| プライマリサイト／サブサイト | （使用しない） | Siteの主従呼称を廃止。契約・Plan Configurationに基づくSite利用枠とSite Assignmentを表示し、Site削除と契約解約を同義にしない |
| リライトブリーフ（Rewrite Brief） | リライトの指示書 | S5タブ名含む |
| アサイン（Assignment） | 割当 | 「割当の健全性」「二重割当」等 |
| バックログ（Backlog） | 未割当／未割当の一覧／リライト候補の一覧 | 文脈で使い分け |
| ガバナンス（Change Budget Governance） | 自動変更の安全ルール | REQ-PRODUCT-18 |
| クールダウン（Cooldown） | 同一記事の変更間隔 | |
| 承認キュー（Approval Queue） | 承認待ち | W4。「〜を承認待ちに送りました」 |
| 実行キュー／保留候補キュー | 実行予定／保留中の候補 | |
| レギュレーション（Content Regulation） | 執筆ルール | S6タブ名含む |
| エスカレーション（Escalation） | 担当者への引き継ぎ | W10 |
| オプトアウト（Opt-out） | 参加を停止 | REQ-PRODUCT-13 |
| ダイジェスト（Digest） | まとめ通知 | REQ-PRODUCT-11 |
| オーガニック（Organic） | 自然検索 | |
| SERP | 検索結果 | 「検索結果の構成/変動」 |
| 順位（GSC由来） | 掲載順位／平均掲載順位 | GSC公式表記。順位トラッカー系は「順位」のまま |
| 検索ボリューム（Search Volume） | 月間検索数／検索数 | 英略語 `Vol` は禁止 |
| CTR | CTR（クリック率） | 初出は併記 |
| Kill Switch | 緊急停止 | 既存方針（Design.md §6.5） |
| Ticket（Support） | お問い合わせ（受付番号） | 既存方針 |
| Preflight | まとめて見積もり | 既存方針 |
| TDH（Title/Description/H1） | タイトル・説明・H1 | 既存方針 |
| AIO（AI Overviews） | AI検索（の影響） | 既存方針 |
| Orphan | 孤立ページ | 既存方針 |
| checkpoint / fail-close | 途中経過の保存／安全側で遮断・拒否 | 内部語は非表示 |
| Output Vault（成果物の一時保持。REQ-WPA-14） | 本文保持 〜M/D／退避中（再送待ち） | 生成完了成果を暗号化して既定14日保持する受渡し領域（コピー／DL・失敗時再送）。Article Read／Workspace、Recovery Backupとは目的・期限を分離し、分析・学習・復元へ転用しない |
| Recovery Backup | 変更前バックアップ／復元可能 〜M/D | CMS Revisionが使えない場合に変更前データを暗号化保持する復元専用領域。Site容量上限内かつ最長3か月で、古いものから削除する |
| noindex / canonical | noindex（検索結果に出さない指定）／canonical（正規URLの指定） | 技術タブのみ・補足併記 |
| キーワードマップ（旧UI名） | クラスター図 | 2026-07-08改名。業界では「キーワードマップ」=記事×キーワードの割当一覧を指すため、俯瞰バブル図の呼称として不適切だった。割当一覧はS5「ページ一覧」タブが担う（同日移設・旧S2「記事×キーワード」） |
| トポロジープランナー（Topology Planner。REQ-KGA-19） | カテゴリーツリー | 2026-07-08改名（旧タブ名: トピッククラスター→サイト構造ツリー→同日「カテゴリーツリー」に再改名）。**中身はカテゴリ構造のツリー**（幹=トップカテゴリ／枝=サブカテゴリ）で、各カテゴリに主要キーワードをプルダウンで紐づける。キーワード間の関連性はクラスター図タブの責務。「トピッククラスター」は設計概念としてキャプション・説明文でのみ使用。2026-07-08にS2からS5サイトページ管理へ移設 |
| 検索流入分析（旧第一階層名） | サイトページ管理 | 2026-07-08 IA再編で解体。クエリ側はS2「クエリ分析」、ページ側はS5に集約。ページ本文は持たず情報圧縮したサマリのみ保持（Article Summary契約=REQ-PRODUCT-04/20）。GSCビューア化（サチコで代替可能な画面）を避け、操作（割当・リライト起動・リンク採用・CRO）とセットで構成する |
| クエリ・マッチ品質（旧S5タブ名） | クエリ分析 | 2026-07-08にキーワード管理へ移設。キーワード=これから狙う語／クエリ=実際に来た検索語、の2起点を1画面に集約 |
| 記事×キーワード（旧S2タブ名）＝アサイン台帳 | ページ一覧 | 2026-07-08にサイトページ管理へ移設。UI見出しは「ページ一覧（サマリー×キーワード割当）」 |
| 通常ビュー（Standard/SaaS View） | 日常判断の簡単操作面 | Recommendationの採否、承認、基本設定、費用確認等を少ない操作で行う正規入口。Officeと同じ業務正本・権限・Command／Eventを使い、Officeで確定した変更も即時反映する |
| Agent Officeビュー（Office View） | 玄人向け詳細分析・運用・Agent操作面 | Agentが働く仮想Office体験としてTaskの進行を監視し、成果、Keyword、Recommendation、記事、根拠、設定を詳細分析できる。選択式または自由文会話から変更案を型付きProposalとして作り、影響・Credit・権限確認後に共通Domain Commandへ接続する。業務正本、認可、Command、成果計算をOfficeへ複製しない |
