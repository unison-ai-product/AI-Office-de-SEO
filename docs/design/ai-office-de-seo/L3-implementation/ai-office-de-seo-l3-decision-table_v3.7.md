---
document_id: AOS-L3-DECISION-TABLE
title: AI Office de SEO L3未決事項テーブル（owner付き） v3.7
version: 3.7
layer: L3
kind: design
status: living
updated_at: 2026-08-03
related_plan: PLAN-L3-01-ai-office-de-seo-implementation-design
---

# L3未決事項テーブル

要求全体に散在するL3未決（`TODO(L3)`・検証ログのオープン項目・Gate B/C）を、**owner付きの技術判断台帳**として管理する。横断的な分類とLaunch可否は `docs/reference/ai-office-de-seo-open-items-register_2026-08-03.md`、個別判断のID・owner・期限は本書を正本とし、同Registerの全件対応表で取りこぼしを検査する。各項目はここで採否・実数・選定を確定し、確定値はConfig Registry / Cost Table / Catalogへ吸収する（現行正本は`REQ-BILLING-*`、`REQ-PAC-*`。旧`REQ-BILL-*`／`REQ-ADM-*`は詳細移行参照に限る）。ownerは役割プレースホルダであり、担当者アサインは運用開始時に確定する。

凡例——区分: GateB（着手直前に確定）/ GateC（後から吸収可）/ 検証（外部仕様の再確認）/ **Launch（商用登録開放前に確定必須＝販売開始のブロッカー）**。状態: open / in-progress / decided。

| # | 項目 | 区分 | 根拠 | owner（役割） | 確定期限（フェーズ） | 状態 |
|---|---|---|---|---|---|---|
| D-01 | config_key命名規約、型、許可scope、allowlist強制 | GateB B-1 | REQ-ADM-09 | TL（アーキテクト） | フェーズ0着手前 | decided（Config Registry §1、Data DDL §7。migration実装待ち） |
| D-02 | new_article_workflow 13状態のLayer A instance | GateB B-2 | REQ-AGENT-09, REQ-PACK-11.6 | TL（エージェント基盤） | フェーズ2着手前 | contract decided（状態・gate・格納契約確定。機械可読JSON artifact／test待ち） |
| D-03 | 認可判定APIの実装形（基本権限`契約者/サイトオーナー/ユーザー`＋業務Permission＋Site Assignment＋内部Role分離を、Repository/API/worker/Agent tool/UI Availabilityへ同じPolicyで強制する方式） | GateB B-3 | REQ-ORG-03〜07, REQ-ACCESS-14〜18, Authorization Operation Matrix | TL（アーキテクト） | フェーズ0〜1 | contract decided（Gate A-2で`resolveCustomerScope`／`resolveDelegatedScope`／`resolveSiteScope`／`authorize`／`createSandbox`、Session分離、RLS併用、負テスト契約を確定。実装・負テスト証拠はLB-05） |
| D-04 | Source Extract JSON Schema第一陣（keyword.map / gsc.query_group / assignment / page_query_matrix / snapshot.qa） | GateB B-4 | REQ-PACK-07 | TL（データ契約） | PT-1/DU-04着手前 | contract decided（共通欠損・availability・主要payload確定。JSON Schema file／fixture test待ち） |
| D-05 | 形態素解析エンジン選定（決定論・辞書versionの持ち方） | GateB B-5 | REQ-KGA-15 | TL（検索基盤） | マッチカスケード実装前 | open |
| D-06 | Provider非依存Routingの初期Model Registry・Cost Table実数（OpenAI／Anthropicを含む検証済みroute、将来のKimi／Grok／Qwen／local互換、Batch割引・cache乗数・fallbackをversion化） | GateC | REQ-TECH-10, REQ-COST-11, REQ-BILLING-04/09 | PO＋TL（プロバイダ） | 商用化前 | open |
| D-07 | メール送信プロバイダ選定（SPF/DKIM/DMARC・抑制リスト連携） | 検証/GateC | REQ-PRODUCT-21 | TL（インフラ） | 通知実装前 | open |
| D-08 | MQ移行トリガ実数（PGキュー→専用MQのキュー水位・遅延しきい値） | GateC | REQ-DUR-07 | TL（インフラ） | 負荷計測後 | open |
| D-09 | AWSを配置前提とし、Web/API、非同期worker、DB、object storage、queue、監視を疎結合にする方向を確定。具体サービス構成と段階的scale条件はAWS Operations／Recovery Mapと負荷試験で確定する | GateC | REQ-TECH-11, REQ-NFR-01〜15, AWS Operations／Recovery Map | TL（インフラ） | Production Hardening前 | decided（AWS前提。具体サービスは未確定） |
| D-10 | 埋め込みモデル・ベクトル索引方式の選定（version固定・再計算バッチ） | GateC | REQ-PRODUCT-20 | TL（検索基盤） | 意味索引の実装前 | open |
| D-11 | 日本語可読性指標の選定（Flesch代替。確定まで可読性ゲートはadvisory運用） | 検証 | REQ-PACK-10, AOS-L3-QUALITY-GATE-IMPL | TL（品質） | 較正開始前 | open |
| D-12 | DataForSEO等プロバイダの契約プラン・アカウント上限実数（グローバル予算初期値） | 検証 | REQ-SRC-07 | PO（契約）＋TL | 外部取得の本番化前 | open |
| D-13 | News/YouTube観測のエンドポイント可否・上限実数 | 検証 | REQ-KGA-18, REQ-SRC-01 | TL（外部取得） | 起点多元化の本番化前 | open |
| D-14 | データ保持・TTL実数（GSC日次正本の自前保持期間の16か月からの分離可否を含む） | GateC | REQ-KGA-08, REQ-SEC-11, REQ-ADM-09 | PO＋TL（データ） | DU-04前に方針、実数は運用較正 | open |
| D-15 | クレジット原価単位・価格・グレード係数の実数（Cost Table/Pricing Configuration） | GateC | REQ-BILL-06, REQ-BILL-10 | PO（事業） | フェーズ5前 | open |
| D-16 | 法務一式の確定——利用規約 / プライバシーポリシー（APPI: 利用目的・第三者提供・**LLMプロバイダ等への委託/国外移転の開示**）/ 特定商取引法表記 / 登録同意書（`REQ-PRODUCT-09`）・匿名集計/公表条項（`REQ-PRODUCT-13`）・事例許諾（`REQ-PRODUCT-23`）/ 解約・返金条項 | Launch | REQ-PRODUCT-09/13/23, REQ-SEC-10 | PO＋法務 | 商用登録開放前 | open |
| D-17 | URL検査系APIのクォータ実数・Googleランキング更新情報の取得経路 | 検証 | REQ-KGA-20, REQ-KGA-21 | TL（検索基盤） | インデックス監視の本番化前 | open |
| D-18 | Generative AIレポートの提供範囲・API化の再確認（四半期ごと） | 検証 | REQ-KGA-17, 検証ログ | TL（検索基盤） | 四半期レビュー | open |
| D-19 | Prompt Cache価格・TTL仕様の再確認（原価較正時） | 検証 | REQ-AGENT-03, REQ-BILL-06 | TL（原価） | 較正サイクルごと | open |
| D-20 | テナント資源プロファイル・ノード密度の実測（負荷試験） | GateC | REQ-DUR-06 | TL（インフラ） | Production Hardening前 | open |
| D-21 | 初期内部目標RPO 1時間／RTO 4時間（`REQ-IRG-06`）の達成可能性を復元演習で検証し、未達時は設計・運用または目標変更を意思決定する | GateC | REQ-DUR-08, REQ-IRG-06 | TL（インフラ） | Production Hardening前 | open |
| D-22 | エージェント実行ランタイム方式の選定——(a)自作Process Manager on PGキュー（`REQ-DUR-07`初期方針と一致・既定候補） (b)Temporal等の耐久実行エンジン (c)LangGraph等のグラフ実行系。**LLM呼び出し層は候補に含めない**（プロバイダSDK直＋自前Adapter=`REQ-BILL-09`で確定済み。フレームワーク側プロバイダ抽象との二重化は不可） | GateB | REQ-AGENT-01/03/09/10, REQ-PACK-15, REQ-DUR-07 | TL（エージェント基盤） | フェーズ2（DU-07）着手前 | open |
| D-23 | LLM観測・トレーシング手段の選定——OTel（`REQ-ADM-07`既定）＋自前契約検証を正とし、専用トレーシングツールは**プロンプト全文を永続化しない構成が可能な場合のみ**採用可（`REQ-SEC-11`保存禁止が採用条件。記録項目は`REQ-SEC-02`に限定） | GateC | REQ-SEC-02/11/13, REQ-ADM-07 | TL（観測） | フェーズ2〜3 | open |
| D-24 | Mock Executor実装形の確定（DU-07先行）——L3 Contract Schemas準拠のSnapshotを返すスタブ形式・Gate A-1イベント発火・fixture（PT-X）との共用方式。Gate A-5は旧互換baselineに限定 | GateB | REQ-DUR-05, REQ-PACK-01, L3 Contract Schemas, Gate A-1 | TL（エージェント基盤） | フェーズ2着手時 | open |
| D-25 | ゴールデン評価セットの初期構築（代表キーワード×記事タイプの固定タスク群・人手評価サンプルの運用形） | GateC | REQ-ADM-10, REQ-DUR-02 | PO＋TL（品質） | DU-10完了まで（3計測と同時） | open |
| D-26 | 技法principles実文・検品レンズ構成・手書きfew-shot例示本文の執筆と登録（ADM-S8経由。例示はValidateゲート合格が登録条件・ゴールデン評価と素材重複禁止） | GateC | REQ-PACK-19/20, REQ-ADM-10 | PO（執筆=帝王様）＋TL（品質） | 該当article_typeの本番生成開放前 | open |
| D-27 | セグメント初期定義（リテラシー/心理/シチュエーション/デモグラ）・転生プロンプト実文・AI定型表現辞書の初期構築（セグメント別手書き例示の執筆計画を含む） | GateC | REQ-PACK-21, REQ-PACK-09 | PO（執筆=帝王様）＋TL（品質） | human_voiceゲート較正開始前 | open |
| D-28 | アクセシビリティ準拠レベルの正式確定（WCAG AA目安→確定水準）、対象画面・例外、手動／自動検証方式の選定（キーボード、focus、コントラスト、ラベル、error関連付け、reduced motion） | GateB / DD-14 | REQ-NAV-08, REQ-NFR-11 | TL（フロントエンド） | 画面実装着手前 | open（最低品質項目は要求済み。正式conformanceと検証契約が未決） |
| D-29 | **Google OAuth検証・API規約適合**——GSC読み取り（sensitiveスコープ）のOAuthアプリ審査（審査リードタイム長・最優先着手）、Search Console/URL Inspection APIの利用規約適合、YouTube Data API利用時のコンプライアンス＋Limited Use要件、年次再確認の運用 | Launch | REQ-SEC-09, REQ-KGA-11/18/21 | PO＋TL（外部連携） | 商用登録開放前（着手はβ前） | open |
| D-30 | WordPressプラグインの配布経路確定——wp.org公開（審査・GPL互換ライセンス整理）or 自前配布＋署名付き更新チャネル（`REQ-WPA-07`）。選択に応じた審査/更新運用 | Launch | REQ-WPA-01/07 | TL（WP） | β提供前 | open |
| D-31 | 顧客向けSLA/稼働率の公約方針（保証の有無・水準・未達時の扱い）と公開ステータスページの運用（in-appステータス案内`REQ-PRODUCT-22`との接続） | Launch | REQ-ADM-07, REQ-DUR-08/10 | PO＋TL（インフラ） | 商用登録開放前 | open |
| D-32 | 請求適格性——適格請求書（インボイス）発行事業者登録・Stripe税/請求書設定・領収書表記、特商法ページ（Stripe本番審査要件と連動、D-16） | Launch | REQ-BILL-01/08 | PO（事業） | 商用登録開放前 | open |
| D-33 | Trialは初期検証の累計10社、1〜3か月、Standard相当＋固定credit、通常の15記事承認を適用し、自動有償化・枠再利用をしない。期間とcreditはcohortごとにAdmin設定し、開発者スーパーアカウントのサービス紹介運用とはデータ・契約を分離する | Launch | REQ-BILLING-15, REQ-PRODUCT-23 | PO（事業） | 販売開始前 | decided（cohort別実数登録はLaunch作業） |
| D-34 | 商標・ブランド保護（「AI Office de SEO」商標調査/出願・ドメイン確保）と**マーケティング表現規約**——製品原則「順位・成果を保証しない」（`REQ-KGA-17`/`REQ-PRODUCT-17`）を広告・LP・営業資料へも適用（景表法・優良誤認の回避。D-16と連動） | Launch | REQ-KGA-17, REQ-PRODUCT-17 | PO＋法務 | 販売開始前 | open |
| D-35 | L0事業章は中小企業Web担当者／新規Site立上げを主対象、SEO運用代行システム、39,800／98,000／198,000／398,000円〜の価格階段まで反映済み。残る北極星指標、activation、利用継続・churnの算式と目標値を実データ取得前に定義する | Launch | L0事業要求、REQ-BILLING-01/02 | PO（事業） | β計測設計前 | in-progress |
| D-36 | Semantic Metric実行方式とAnalytics Store段階移行——初期はPostgreSQLの有界rollup／cacheで開始し、scan量、ingestion backlog、storage、query P95、AWS費用、運用工数のversion付き観測が閾値を超えた領域だけColumnar Store／pre-aggregation engineへAdapter移行する。Plausible／Cube／PostHog／Metabaseは構造参考であり初期必須依存にしない | GateC / GateB B-7・B-8 | REQ-TECH-21, REQ-BILLING-17, OSS Analytics Review | TL（データ基盤）＋PO（原価） | Metric実装前に契約、製品採否は負荷計測後 | contract decided（4 Schema、DDL境界、Event、Portを確定。移行閾値実数と製品採否はopen） |

D-22の採用判定テスト（要求由来・全候補共通）: (1) system prompt・prefixのバイト単位の完全制御（Layer A/B/C/D明示4点、`REQ-AGENT-03`/`REQ-PACK-15`） (2) ステージ境界checkpointからfreeze済みversionで再開（`REQ-AGENT-10`） (3) プロンプト全文を永続化しない構成（`REQ-SEC-11`） (4) 自前Provider Adapterの背後に置ける（抽象の二重化なし、`REQ-BILL-09`） (5) Batchレーンの非同期実行を状態機械の意味論を変えずに扱える（`REQ-BILL-11`） (6) Workflow定義由来のdefault-denyツール権限の強制（`REQ-AGENT-06`/`REQ-AGENT-07`）。1つでも満たせない候補は不採用とし、既定候補(a)との比較は「耐久実行の実装コスト削減」対「制約適合の確実性」で行う。

運用規約: 本表の追加・decided化はREADMEの変更伝播チェックリストに従い、decided時は確定値の吸収先（Config Registry / Cost Table / Catalog / 検証ログ）を「状態」列の後注に記録する。Gate C項目は着手をブロックしない（AOS-L3-HANDOFF-GATE）。
