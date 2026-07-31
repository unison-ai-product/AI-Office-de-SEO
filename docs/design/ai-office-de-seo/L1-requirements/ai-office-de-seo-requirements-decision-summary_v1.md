---
document_id: AOS-L1-REQUIREMENTS-DECISION-SUMMARY
title: AI Office de SEO 要求決定サマリー v1.0
version: 1.0
layer: L1
kind: requirements_decision_summary
status: draft
updated_at: 2026-07-30
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO 要求決定サマリー

## 1. 目的

本書は、企画・要求整理で確定した横断的な判断を監査するための一覧である。進捗管理表ではない。要求本文の正本は `categories/` 配下および既存の詳細要求文書に置き、本書は決定内容、正本、未確定事項の所在を示す。

## 2. 製品の位置づけ

- 法人・個人が利用できるSEO運用システムとする。代理店利用、OEM、完全委託は初期スコープに含めない。
- `UNISON-TECHNOLOGY/seo-agent` の社内運用で得た知見を発展させる。
- 記事制作・リライトはRecommendationを業務起点とし、採用後の工程をイベント駆動Workflowで接続する。
- 製品はWordPress専用品として内部設計せず、CMS非依存のPublication Contractを持つ。初期AdapterはWordPressとし、最新安定版を主検証基準にしながら保守中の旧系列の最新security patchまで広く受け入れる。
- 重い本文・生HTMLを恒久保持するデータベースを避け、記事の構造、要点、イベント、検索・CV遍歴を中心に保持する。

正本: `categories/business-requirements_v1.md`、`categories/technical-architecture-requirements_v1.md`、`categories/data-requirements_v1.md`

## 3. SEO業務ライフサイクル

業務は次の循環で構成する。

`Site導入 → 現状把握 → 月次目的設定・配分 → Recommendation → 採否 → 新規制作／リライト → 確認・公開 → 1か月／3か月／6か月評価 → Recommendation更新 → 月次再計画`

- 業務要求を画面、Workflow、Cron、Event、Loopの上位正本とする。
- 目的はSiteごとに月次設定し、流入、CV、情報充足、既存記事保護、費用対効果等から単純選択する。
- 選択目的を実現する記事・施策配分はシステムが傾向として算出する。達成保証や根拠のない数値予測は行わない。
- 急変は即時Recommendationへ入れず要監視とする。通常判断は記事の1か月、中期3か月、長期6か月サイクルで行う。
- 順位なしはインデックス障害としてユーザーへエスカレーションする。システムはサイト自体を自動修復しない。

正本: `categories/business-requirements_v1.md`、`categories/logic-requirements_v1.md`

## 4. 顧客組織・権限

- Customer Organizationは法人・個人の両方に作成する。
- 配下の組織ノードはユーザーが自由に追加・命名し、Siteを任意ノードへ所属させる。
- 上位権限の継承方式はユーザーが選択できる。
- 顧客側と開発運用側の認証・認可・画面を分離する。
- 開発側RoleはAdmin、Manager、Operatorとする。ManagerはAdminから対象・操作・期限付きで顧客アクセス権限を付与される。Operatorは開発側ログ確認を担当し、顧客本文へアクセスしない。

正本: `categories/customer-organization-governance-requirements_v1.md`、`categories/security-access-requirements_v1.md`

## 5. 業界・業種分類

- Siteは2階層の「業界／業種」を複数保持でき、ユーザー追加も許可する。
- 複数業界の優先方式はユーザー指定または自動算出から選択する。
- 横断軸は対象顧客、共通課題、商品・サービス、地域、ファネル、補足自由記述を持つ。
- 未設定時はサイトとキーワードから推定するが、精度を保証しない。
- ユーザー修正を正本とし、自動推定で上書きしない。修正結果は匿名全体較正とSite固有補正の学習材料にする。
- 記事は主担当分類1件と関連分類複数を保持できる。

正本: `categories/logic-requirements_v1.md`、`logic/keyword-dynamic-recommendation-logic-requirements_v1.md`

## 6. キーワード・Recommendation

- 市場影響としてAIO、リスティング、ドメイン信用性、検索需要、表示回数、季節性を扱う。
- プライマリキーワードと3〜5件程度の補助キーワードを検索意図・SERPからクラスタ化し、記事へ割り当てる。
- 獲得キーワードが意図したクラスタで順位を得ることを記事評価の第一条件とし、CV可能な記事はCV取得を次の評価軸とする。
- 想定外のキーワード獲得は単純な主従入替えにせず、業界・Site実績を再計算してロジック補正へ使う。
- 匿名全体補正は管理者承認を必要とする。Site固有補正は未実行Recommendationと次回配分へ自動適用できるが、順位悪化リスクがある場合はユーザー承認を必要とする。
- 数値予測は直近1か月1,000クリックを解放条件とし、予測可能な記事とデータ不足の記事を分離して表示する。

正本: `categories/logic-requirements_v1.md`、`logic/keyword-dynamic-recommendation-logic-requirements_v1.md`

## 7. 記事データ

- 本文は解析中の一時データとし、恒久保持しない。
- 見出し構造、要点、CTA等のイベント発生ポイント、主従キーワード、順位、クリック、表示回数、CV、公開・更新履歴、評価履歴を保持する。
- GSCと軽量な自前計測を判定材料とする。自前計測はページ表示、遷移、CTA識別子、指定サンクスページ到達を中心とし、個人行動やフォーム内容を保持しない。
- WordPress更新日は記事変更履歴へ追加するが、過去Snapshot、施策、評価記録を上書きしない。

正本: `categories/data-requirements_v1.md`、`categories/measurement-operations-requirements_v1.md`

## 8. 新規記事制作

- 文体は「です・ます調／だ・である調」と「文語体／口語体」の組合せで指定する。
- Site固有の言い回し学習はON/OFF設定とする。ON時にサンプル記事を使用し、3か月ごとに見直しを通知して再学習はユーザーが判断する。
- 新規Siteは本システム経由で人が完成記事を承認・公開した新規記事15件まで個別承認を必須とする。既存記事とリライトは算入しない。
- Outline承認はSite単位の任意設定とし、有効時は見出しを編集・確定して再開できる。
- 15件到達後、権限者が版付き同意書へ同意した場合に新規記事の自動投稿を解放できる。
- 本文生成後に装飾を行い、WordPress下書きへ送信して完成記事を確認する。

正本: `categories/business-requirements_v1.md`、`categories/logic-requirements_v1.md`、`ai-office-de-seo-agent-runtime-requirements_v3.7.md`

## 9. リライト・全文再生成

- 通常リライトは限定Patchを既定とする。
- 全文再生成も実行可能だが、記事置換に近い高リスク操作として変更範囲、順位影響、復元可否を表示する。
- 部分リライト・全文再生成はWordPress下書きまで自動生成できるが、公開記事への更新は常にユーザー承認を必要とする。
- WordPressリビジョンを第一復元経路とし、専用バックアップは上位プランで提供する。
- リビジョンも専用バックアップもない場合、復元不能リスクへの同意があれば実行を許可する。
- 専用バックアップはSite容量上限を持ち、最長3か月、容量超過時は古いものから削除する。
- 悪化時の復元は自動実行せず、ユーザー判断とする。

正本: `ai-office-de-seo-rewrite-runtime-requirements_v3.7.md`、`categories/business-requirements_v1.md`

## 10. 品質・Repair・責任

- Research、Outline、Section Brief、入力検証でRepair頻度を低くする。
- Preflightで固定価格内に成立しない見込みの生成を開始しない。
- 1回の生成価格は内部Repair回数で変えない。
- ユーザー希望の再生成は新しい有償ジョブとする。
- 当社障害による中断はcheckpointから無償再開し、成果未提供時はクレジット返還対象とする。
- hard gateの判定自体は消さない。同一権限者による二段階確認と版付き同意書で例外手動公開を許可する。
- 公開責任は公開者へ帰属し、順位、流入、CV、売上等のSEO成果を保証しない。

正本: `ai-office-de-seo-agent-runtime-requirements_v3.7.md`、`categories/billing-accounting-requirements_v1.md`、`categories/incident-warranty-requirements_v1.md`

## 11. 装飾・画像

- テーマ、標準・独自ブロック、ショートコード、CSS classを解析し、互換性とPreview可否を示してユーザーが利用パーツを選択する。
- 装飾学習は言い回し学習と分離し、頻出ブロック、配色、CTA、画像比率、装飾パターンからユーザーが採用対象を選択する。
- 初期リリースではアイキャッチだけをGPT Image 2（`gpt-image-2`）で生成する。評価済みsnapshotとprompt versionをModel Registryで管理する。
- ユーザーはSiteまたは記事単位で目的、生成トーン、画風、構図、色、明暗、人物、文字入れ、比率、配置、枚数、禁止要素、参照画像を調整できる。
- ユーザーが許可したWordPress Mediaまたは指定URLの画像をREST取得し、Style Feature候補を抽出してユーザー選択後にProfileへ登録する。
- 画像生成前にFeatured Image Pattern Editorで背景、被写体、文字、ロゴ、配色、構図、余白、安全領域、比率、固定・可変slotを設定する。Patternごとに固定、制御、自由度高のバリエーション許容度を持たせる。
- ロゴは配置領域と外周余白を定義するが、合成品質が基準未達なら強制しない。出力sizeはCMSの対応・要求sizeだけとし、自動投稿の画像gateを技術破損・明確な禁止要素等へ限定する。
- 画像生成・Pattern設定・WordPress送信は制作ツールの機能提供であり、画像の採否と公開判断はユーザーに帰属する。人物、商品、実績等を含むことだけを理由に個別承認や公開停止を追加しない。
- 自動停止はファイル破損、CMS非対応、アップロード失敗等の技術的不成立と、ユーザーがPatternへ明示した禁止要素・必須素材条件への不一致に限定する。
- Pattern編集と簡易ワイヤーフレームでは生成費を発生させず、テスト生成または記事生成時だけGPT Image 2を呼ぶ。
- アイキャッチは最適化後、本文とは別にWordPress Media APIへ登録し、返却されたMedia IDをfeatured mediaへ設定する。本文JSONへ画像本体を埋め込まない。
- 本文中画像はリリース後のversion up対象とし、将来もユーザー指定の見出し位置・間隔・記事タイプ等の決定論ルールで配置する。初期はFeatured Image Pattern基盤だけを整備する。
- 画像解析結果、Profile、prompt template、同一条件の生成成果をcacheし、再取得・再解析・二重生成を避ける。ただし新しい画像outputの生成原価は毎回見積もる。

正本: `ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`

## 12. WordPress・CMS連携

- CMS共通Publication Contractを内部境界とし、WordPress固有形式を内部記事モデルの正本にしない。
- WordPress互換性は最新安定版を主検証基準とし、保守中の旧系列をCompatibility MatrixとCapability Testで `full`、`degraded`、`update_required`、`unsupported` に分類する。
- Core REST APIと軽量Trackingを最小構成とし、Thin Pluginは標準RESTで不足するCapability、イベント通知、独自構造検証等だけを補う。
- WordPressの変更検知はThin Pluginの署名付きWebhookを主経路とし、通知後に変更対象だけをREST取得する。PluginなしではRSS／Atomを公開記事の発見へ利用し、手動同期・再接続・欠落復旧・低頻度の整合確認でREST差分同期する。常時の全件Pollingは標準経路にしない。
- REST外部認証はHTTPS上の取消可能なApplication Password等を利用する。
- Classic Editor、Block Editor、iframe／non-iframe、Content-Only、Visual Revisions、独自ブロック、第三者Page BuilderをCapabilityとして判別する。
- 未対応Page Builderへ推測で書き込まず、既存記事を上書きしない。標準ブロックの別下書き、互換HTMLの別下書き、HTML／Markdown持ち出しへ段階的に縮退する。
- Builder判定は記事単位とし、分析・Recommendationは継続して、構造破壊の可能性がある公開・更新操作だけを保留する。
- 他CMSは実環境がない段階で対応済みと表示しない。将来Adapter追加時に当該CMSのSandboxまたはStagingでE2E検証する。

正本: `categories/integration-requirements_v1.md`、`categories/technical-architecture-requirements_v1.md`、`ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`

## 13. 非機能・障害

- 一般的なWeb指標を使用し、主要画面の表示・操作・ジョブ受付を計測する。
- 重い非同期処理はAgent Officeビューで進行を可視化し、待ち時間を作業体験へ変換する。
- 障害を機能単位に封じ込め、全体停止を避ける。
- 機械的に復旧可能な障害は即時自動復旧を目指す。人・金銭対応は営業日単位の運用とする。
- 初期内部SLOは月間99.5%とし、機能別に計測する。契約上のSLA・service creditとは分離する。
- 認証、権限、契約、課金台帳、クレジット、公開命令、同意記録等の正本データは初期内部目標RPO 1時間、RTO 4時間とする。
- AWSを第一配置先とし、CloudWatchを中心にmetrics、logs、tracesを相関させる。対象tenant、Site、記事、job、stage、Provider、失敗分類を相関IDから即時に追跡し、MTTD、MTTA、MTTI、MTTRを計測する。
- 非同期処理はmanaged queueとDLQで隔離・再実行可能にし、静的配信・cache可能な読取はCloudFront等を利用してorigin負荷とlatencyを抑える。重いobjectや本文をtransaction databaseへ置かない。
- 通常通知は90日、課金・権限・公開・同意・代理操作の監査記録は最低1年保持する。保留jobは標準7日とし、期限前通知と再開見積りを行う。

正本: `categories/non-functional-requirements_v1.md`、`categories/incident-warranty-requirements_v1.md`

## 13.1 初期計測方式

- 一般的なWeb計測と同様、CMSへ密結合しない単一の非同期JavaScript Trackerを使用する。
- 初期対象はpage view、URL遷移、明示CTA識別子、設定済み到達URLのCVとする。
- WordPressではThin Pluginを標準導線とし、Trackerの自動設置、Siteペアリング、version・更新通知を提供する。計測ロジック自体はPluginへ重複実装しない。
- cookie、全click自動取得、常時heartbeat、全DOM監視、heatmap、session replay、フォーム内容取得は初期対象外とする。
- 高度計測は人員と運用余力を確保したリリース後のversion upで追加する。

## 13.2 デザイン・Agent Office体験

- 通常ビューを初回ログインと日常業務の標準画面とし、Recommendationの採否、承認、設定等の「選ぶ・決める」を行う。
- Agent Officeは実行中Task、詳細情報、進捗、Loop、Knowledgeを確認するだけでなく、通常ビューでは複雑になる条件探索、推薦方針、Agent指示、Workflow構成を変更する詳細運用面とする。業務事実は通常ビューと共有するが、部屋、会話、探索、詳細設定等のOffice固有状態を持つ。
- 既存モックのフロア、部屋、エレベーター、役割別Agent、ライブフィードを基線とし、ゲーム内のオフィスを訪れてNPCが自律的に働いているような立体表現と、Agentへ話しかけて動き方を変更する操作へ発展させる。
- 通常ビューで推薦Keywordを簡単に採否できる一方、Officeでは一覧・cluster・根拠を確認し、選択条件、重み、除外、推薦方向を調整できるようにする。ゲームのショップや装備構成に近い発見性を持たせるが、表示内容と結果はSEO業務用語で説明する。
- 3D表現は業務状態の正本にせず、標準3D、簡略3D、軽量2Dへ端末性能・通信・設定に応じて縮退しても同じ情報と操作を維持する。
- Task、Recommendation、Keyword cluster、記事、計測、評価、学習、再推薦の関係を、内部ログではなく実entityに基づくLoop／Knowledge Graphとして表現する。
- 初期リリースはdesktop標準とし、mobileでの全業務完結は対象外とする。後続versionで通知、チェック、簡易説明、修正指示を中心とするAgent Office Chatを提供する。

正本: `categories/design-experience-requirements_v1.md`、`categories/screen-operation-requirements_v1.md`、`categories/non-functional-requirements_v1.md`

## 14. 課金・アップセル

- プラン内利用上限と、超過分の追加クレジットを持つ。
- 品質段階ごとの生成クレジット予測から作成可能本数を算出し、週次作成上限でWordPress・外部API負荷を制御する。
- 品質段階は安定した商品コードで管理し、実Provider名・モデル名を商品IDに固定しない。`GPT Luna → GPT tera → Sonnet → Opus` は当初想定した品質順の表示ラベル／routing aliasとして保持できるが、各aliasから実Provider、model、snapshot、調査量、検査、Repair、fallbackへの対応をModel Registryで版管理する。
- 将来の原価率改善に向け、Kimi、Grok、Qwen系等の外部APIおよび自己管理・ローカルLLMを共通Model Capability Contractへ接続できる技術互換性を維持する。routeは必要能力、品質評価、latency、実効原価から選び、特定ProviderやOpenAI互換APIだけへ中核Workflowを固定しない。
- 顧客請求はappend-only ledgerを正本とし、credit lot、reserve、commit、release、失効、繰越、refund、manual adjustmentを追跡する。障害要求が返還可否を判断し、課金要求が元取引を参照して返還を記帳する。
- 初期価格階段はEntry 39,800円、Standard 98,000円、Premium 198,000円、Enterprise 398,000円〜（月額・税別）とする。EntryとStandardはセルフ月契約、Premiumはセルフ年契約のみ、Enterpriseは問い合わせによる年契約のみとする。公開画面では各税込総額を同一領域へ明瞭に併記する。
- 12か月契約はシステム利用料を10%割引し、追加credit、初期設定、導入支援、コンサル、オプション、従量利用は対象外とする。
- Stripe標準構成の初期決済原価は国内カード3.6%＋Billing 0.7%＝4.3%を仮置きし、顧客へカード手数料として都度上乗せせず価格・粗利へ含める。Enterprise等の高額契約では銀行振込を含めた回収原価を比較する。
- 価格、契約期間、年割引、申込経路、Site・ユーザー上限、credit、品質、機能ロック、自動投稿、バックアップ、予測、監査、外部連携、サポートはversion付きPlan Configurationから変更可能にする。既存契約は契約時versionを維持し、新規・更新・個別overrideの適用対象を分ける。
- サーバー負荷とPlan上限は記事本数だけで決めず、管理記事・キーワード、GSC・同期取込、履歴・画像・バックアップ保存、再計算・AI job、同時実行・DB走査等をCapacity Dimensionとして分離する。追加creditは技術的安全上限を解除しない。
- 容量接近時はEntry／StandardへPremiumを推奨し、Premium／Enterpriseは管理記事・キーワード・保存領域・画像・バックアップ等の追加容量を購入可能にする。同時実行・瞬間取込等の安全上限は販売しない。ユーザー画面にはDimension別使用量、上限、到達予測を表示する。
- Planは固定4段階にせず、安定IDを持つCatalogとして管理画面から追加・複製・改版・販売終了できるようにする。
- 初期Plan上限はSite／ユーザーをEntry 1／3、Standard 3／10、Premium 5／30、Enterprise個別とする。
- 自動投稿はEntryを含む全Planで提供し、最初の新規15記事の承認後に同意・設定を経て解放する。専用バックアップはPremium以上、数値予測はStandard以上で提供し、予測のデータ十分性判定はPlan解放と別に適用する。
- Entryは基本品質、Standard以上は品質段階を選択可能とし、選択品質に応じてcreditを消費する。WordPress・GSCは全Plan、汎用Webhook・外部APIはPremium以上で提供する。
- 顧客に見せる履歴はエージェントTask Historyであり、Agent Office演出は実Task・eventから導出する。開発側の監査ログ、trace、stack等は顧客面と分離し、顧客向け監査ログ一括出力は提供しない。
- 大規模Siteの初回取込は「自動構築期間」として数日へ分散でき、進捗・完了見込み・制限中の機能を表示しながら、成立した機能から段階開放する。
- 価格は汎用生成AIのtoken原価ではなく、SEO戦略、制作・リライト、WordPress入稿、計測、評価、再推薦までの代行業務価値を基準に設計する。汎用AI、SEO分析ツール、記事制作代行、SEO運用代行との担当範囲を比較可能にする。
- 月額付与creditは請求期間末、追加購入creditは購入から180日で失効する初期方針とする。追加購入creditは販売開始前に資金決済法上の取扱いを法務・決済確認する。
- Entry Planでは上位機能を完全に隠さず、価値が分かるぼかし・Preview・ロック表示と解放条件を置く。実行可否はサーバー側Entitlementで強制する。
- 追加クレジットの自動チャージは初期OFFとし、権限者が残高しきい値、1回の購入額、月間課金上限または無制限を設定して有効化する。上限到達・決済失敗時は新規有償jobを保留する。
- 更新支払失敗は14日間・最大8回の再試行を初期値とし、期間中は閲覧・export・支払修正を維持して、新規有償job、自動投稿、追加費用発生を停止する。
- 専用バックアップ、保持延長、復元支援を上位プランの「安心保証」として提案できる。
- 安心保証は復元可能性と支援範囲の保証であり、SEO成果保証ではない。
- 標準サポートは製品内FAQチャットを主導線とし、SEO戦略、人間review、WordPress修正・運用代行は有償支援へ分離する。製品不具合や課金誤りの是正は有償化しない。
- FAQチャットは全Planへ提供し、Premiumは1営業日以内の初回回答を目標とする優先有人対応、Enterpriseはseverity・時間帯・初動・復旧・報告・補償を個別合意するSLAを提供する。
- 無料Trialは一般公開・常設せず、初期検証全体で累計10社へ招待制で提供し、終了枠を再利用しない。期間は対象ごとに1～3カ月、機能はStandard相当、利用量は固定creditとし、上位機能は検証目的に限り個別付与する。最初の新規15記事の承認と自動投稿解放条件は通常契約と同じとする。Trial終了時の自動有償化は行わず、通常契約への明示申込を必要とする。
- 主な集客経路はTrialではなく、開発者スーパーアカウント配下のマスターテナントが別途構築したサービス紹介Siteを本製品で実運用し、紹介・機能・実績・事例記事を制作する循環とする。マスターテナントも一般顧客と同じ制作・品質・承認・公開・計測経路を通り、内部請求を行わず実原価を記録する。
- 顧客実績の紹介利用は匿名集計または明示許諾済みShowcase Snapshotに限定し、開発者スーパーアカウントから顧客tenantを直接参照する経路を設けない。
- Entry／Standardの月契約は支払済み期間末で解約し、日割り返金を行わず、期間末までは解約予約を取消可能とする。年契約は自動更新とし、30日前までに更新条件を通知し、解約後も契約満了まで利用可能とする。
- 年契システム利用料の返金候補は、初回契約または年次更新から14日以内で、当該請求期間にcredit消費、有償成果、公開・更新、購入外部データ等の利用履歴がない場合に限定する。
- Upgradeは差額と影響をPreviewし、指定日時または安全な処理境界へ計画適用する。実行中jobは開始時の利用権限を維持し、Downgradeは次回更新時に適用する。

正本: `categories/billing-accounting-requirements_v1.md`、`categories/cost-requirements_v1.md`、`categories/growth-upsell-requirements_v1.md`

## 15. 未確定事項

次は要求の欠落ではなく、今後の判断または設計較正が必要な項目である。

1. プラン別利用枠、品質別クレジット単価、バックアップ容量・保持量。
   - 計測方法: 品質別Preflight見積、実績credit、Provider原価、週次利用率、追加購入率、backup使用量、復元件数を商品・tenant・Site単位で集計する。
   - 設定箇所: `REQ-BILLING-01` のPrice Catalog、`REQ-BILLING-03` のcredit lot・利用枠、`REQ-COST-04/05` の見積・実績、Plan Configuration。
   - 確定時期: 価格表公開前に初期値を承認し、β運用の実績較正後、一般販売開始前に販売versionを固定する。

## 16. 監査上の注意

- 本書と分類別正本が矛盾する場合は分類別正本を優先し、本書を修正する。
- 「要調整」は要求未定義を意味せず、計測方法、設定箇所、確定時期を持たなければならない。
- WordPress以外のCMS、未検証Page Builder、将来のWordPress機能を対応済みとして販売表示しない。
- 推薦、予測、品質スコア、安心保証をSEO成果保証として表示しない。
