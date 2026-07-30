---
document_id: AOS-L1-WP-AUTOMATION-DYNAMIC-POST
title: AI Office de SEO WordPress・オートメーション・投稿形式要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-01
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO WordPress・オートメーション・投稿形式要求 v3.7

## 1. WP連携の位置づけ  ［REQ-WPA-01］

WP連携は、ユーザー向け第一階層では「オートメーション」配下に置く。

扱うもの:

- WordPress接続
- プラグイン状態
- 文体指定と個別Siteの言い回し学習ON/OFF。ON時はサンプル記事10本を使用
- 記事サマリー同期
- 投稿形式チェック
- 下書き作成
- 予約投稿
- 承認・差し戻し
- CVイベント
- 公開イベント
- おまかせ運用

## 2. Dynamic Post Schema  ［REQ-WPA-02］

内部的には、WPプラグインから取得した投稿能力をもとに、動的な投稿スキーマを導出する。

ユーザー画面では、この名称を表示しない。表示名は「投稿形式チェック」「WordPress投稿形式」「投稿プレビュー」とする。

導出対象:

- post type
- category / tag
- SEO meta
- table support
- FAQ support
- CTA slot
- internal link slot
- related article slot
- Gutenberg block support
- scheduled post support
- custom field support

Writing Snapshot / Repair Snapshotは、Assembly工程で投稿スキーマのslotに封入される。Executorに自由HTMLを出させない。

## 3. Schema fallback  ［REQ-WPA-03］

サイトによって使える投稿形式が違うため、fallbackを持つ。

- FAQ block非対応 → 通常見出し＋本文へ変換
- table block非対応 → HTML tableまたはlistへ変換
- CTA box非対応 → paragraph + button slotへ変換
- SEO plugin非対応 → metaはWP標準または手動入力へ委譲

## 4. 投稿予約と承認  ［REQ-WPA-04］

投稿予約・自動化は承認フローを持つ。

- suggest_only
- assisted_schedule
- auto_draft
- auto_schedule_after_approval
- full_auto

full_autoは初期OFF。Owner/Adminの明示許可、プラン許可、品質ゲート、公開頻度上限、緊急停止を必須にする。

## 5. CV計測  ［REQ-WPA-05］

CVは詳細トラッキングではなく、日別・URL別・ゴール別の集計を基本とする。

保存しないもの:

- 個別ユーザー行動
- セッションログ
- クリックログ
- フォーム入力内容
- ヒートマップ

CVは日別・URL別・ゴール別の集計であり、個別セッションを持たない。したがってリライトや施策とCV増減の関係は相関ベースの補助指標として扱い、リライト単位の厳密な因果帰属は主張しない。改善判断の主指標はGSCのURL×クエリ実績とし、CVは方向性確認の補助として提示する。

## 6. 文体指定と言い回し学習  ［REQ-WPA-06］

生成時の基本文体は、文末の「です・ます調／だ・である調」と、文章表現の文語体／口語体の組合せで指定する。

- 個別Siteの記事から固有の言い回しを学習する機能は、Site単位でON/OFFできる。
- OFF時は公開記事由来の言い回しを生成へ適用せず、指定文体、Domain Positioning、User Order、レギュレーションだけを使用する。
- ON時は公開記事からサンプル記事10本を学習対象として選定する。10本未満でも導入を停止せず、利用可能な記事だけで暫定プロファイルを作り、信頼度を「暫定」として明示する。
- 記事が増えた時点でプロファイルを再導出できる。
- 暫定プロファイルであることは、生成・リライトのプレビューおよび学習ナレッジ管理画面で確認できる。

## 7. WordPressプラグインの責務  ［REQ-WPA-07］

WordPressプラグインは、SaaSとWPの間のデータ交換エンドポイント（ソケットに近い薄い連結点）である。業務ロジック・判定・生成の利用はすべてシステム（SaaS）側で行い、プラグインは持たない。

プラグインが担うもの:

- 取得: 記事サマリー、見出し構造、投稿能力（Dynamic Post Schema導出用）、公開/更新/CVイベント等の取得。
- 公開: 下書き作成・更新・予約・公開の実行（投稿形式チェックを通した内容の反映）。
- メディア: 生成画像のWordPressメディア登録、Media ID・URL・派生サイズの返却、Image blockとfeatured mediaへの参照設定。
- トラッキング: トラッキングパラメータの挿入と、CV等の計測データの蓄積・送出（日別・URL別・ゴール別の集計前提。個別行動ログは持たない。`REQ-WPA-05`）。
- 初期リリース境界: WordPress内の独自編集UI、AI生成版との差分表示、編集履歴のSaaS同期は別機構として後続提供し、初期プラグインの必須責務に含めない。

接続と権限:

- プラグインは導入するだけで連携される仕様とする。インストール時にサイトを当該Tenant/Siteへペアリングし、以降は設定作業なしで連携が有効になる。
- プラグイン↔SaaSの接続は認証され、Tenant/Siteスコープに限定する（`REQ-SEC-09`）。プラグインは正本（WP）へ書き込む経路のため、最小権限とチャネル完全性（署名・改竄検知）を前提にする（`REQ-SEC-01`）。

配布と更新通知:

- プラグインはZIP配布とする（公式リポジトリ経由に限定しない）。
- 自前の更新チェッカ（アップデートサーバ）を持ち、更新の有無をWP標準の更新通知経路に載せてWP管理画面へ通知する。
- 同時に、システム側（開発管理者コンソール）でも接続サイトごとのプラグインversionと更新有無を集約し、通知する。
- 更新はTenant/Siteスコープの認証・署名付き配信とし、改竄されたパッケージを適用しない。

## 8. WP Capability Snapshot  ［REQ-WPA-08］

WP接続時・プラグイン更新時・テーマ/SEOプラグイン/カスタムブロック変更検知時に `WPCapabilitySnapshot` を再取得する。`snapshotKey` と `schemaVersion` をDynamic Post Schemaに記録し、投稿反映時に照合する。取得できない能力は「未対応」と扱い、生成側が勝手にHTMLで代替しない。古いプラグインが必要能力を返せない場合、その機能のTicketは `blocked` / `degraded` とする。

装飾能力として、利用中テーマ、標準・独自ブロック、ショートコード、登録済みCSS class、依存プラグイン、Preview可否を取得する。検出した独自パーツは一律排除せず候補化するが、互換性を表示してユーザーが採用したものだけをDynamic Post Schemaへ含める。

メディア能力として、アップロード上限、許可MIME、画像サイズ、派生サイズ、featured media対応、画像最適化プラグインの有無を取得する。生成画像は記事本文と別リクエストで順次登録し、画像本体を投稿JSONへ埋め込まない。登録済み画像はcontent hashとSiteスコープの冪等キーで二重登録を防ぎ、本文送信失敗時も再利用できる。負荷・容量・タイムアウト時は同時数を下げ、本文画像を減らし、最終的にアイキャッチのみへ縮退する。

## 9. Dynamic Post Schema と封入フロー  ［REQ-WPA-09］

Outline Contract作成後、Orchestratorが `dynamicPostSchemaKey` を確定する。Writing TicketはHTML構造を自由に決めずSchemaを変更しない。Assembly TicketがWriting SnapshotをPostSlotへ割り当てる。CTAはWriting Ticketで生成せずQA/Placement後に `cta_box` slotへ（`REQ-PACK-17`）。FAQは `faq` slot（能力があればFAQ block/schema、無ければdegrade/人手確認）、tableは `table` slot（能力がある場合のみtable block化、非対応/破壊時はfail-close）。WP能力にないslot/blockを出力したらfail-close。WP Plugin validation失敗時はDraft Applyを止めRepair Ticketを発行する。最終HTML/Gutenbergブロックは恒久保存せず、`dynamicPostSchemaKey`・slot assignment metadata・content hash・validation result・WP draft URL・job resultのみ保存する（`PostEnvelopeSnapshot` は一時保存）。

## 10. Keyword Map Pack と結合  ［REQ-WPA-10］

キーワードマップは単一データでなくPack群で組む: `keyword_same_serps_pack`（統合すべき/分離すべきキーワード判断）、`keyword_intent_cluster_pack`、`keyword_paa_pack`（FAQ/質問意図）、`keyword_aio_pack`（取得不可なら空状態＋availability理由を返し捏造しない）、`keyword_synonym_related_pack`（自然な言い換え候補、過剰SEO挿入はQA）。結合: Article Type Structure Pack＝骨格、Heading Structure Pack＝H2/H3内の意味ユニット順、Keyword Map Packs＝どのキーワード/質問/関連語をどこで扱うか、Dynamic Post Schema＝どのslot/WP block/fieldへ変換するか。すべてKey方式でOrchestrator Catalogに登録しKey参照で実行する。本節の旧称は`REQ-PACK-04`命名規則の正式キーへ対応づける: `keyword_same_serps_pack`＝`source.keyword.same_serps.v1`、`keyword_intent_cluster_pack`＝`source.keyword.intent_cluster.v1`、`keyword_paa_pack`＝`source.serp.paa.v1`、`keyword_aio_pack`＝`source.serp.aio.v1`、`keyword_synonym_related_pack`＝`source.keyword.synonym_related.v1`（いずれも`REQ-PACK-07`）。Keyword Map Coverageで重要意図が抜けたら該当Meaning UnitにRepair、AIO/PAA不可のQAはwarning/degradedにし捏造補完しない。

## 11. エンゲージメント計測（滞在・スクロール）  ［REQ-WPA-11］

WPプラグイン（`REQ-WPA-01`）で、記事単位の滞在時間・スクロール深度を**任意有効化**で計測し、CV（`REQ-WPA-05`）と同じく**相関ベースの補助指標**として扱う（因果を主張しない）。個人を特定しない集計値のみを送信し（`REQ-SEC-11`の本文非保持・プライバシー原則）、計測の有効/無効はサイト単位設定。用途: 好調記事の要因分析（`REQ-RWR-08`）・リライト効果の前後比較（`REQ-RWR-06`）。

## 12. 既存記事への部分パッチ適用（波及更新のWP操作）  ［REQ-WPA-12］

リンク再調整（`REQ-KGA-19`）・波及リンク（`REQ-RWR-08`）・フラッシュリライト（`REQ-RWR-09`）・CVポイント差し替え（`REQ-WPA-13`）は、公開済み記事への小粒な部分更新であり、新規投稿の封入フロー（`REQ-WPA-09`）とは別の操作特性を持つ。

- プラグイン操作: ブロック/要素レベルの部分更新をプラグインの操作として定義する。適用前にWPリビジョンを保存し、WordPressのrevision取得と復元機能を第一復元経路として使用する。リビジョンが無効・削除済み・非対応の場合は、変更前データを専用の暗号化バックアップ領域へ保存する。バックアップはSite単位の容量上限を持ち最長3か月で削除する。容量超過時は古いバックアップから削除し、容量追加は上位プランで提供する。悪化時は復元候補を提示し、復元はユーザーが実行する。適用時に取得時点との**更新競合を検知**し、安全側で停止して人へ提示する。
- タイミングと負荷: 新記事公開イベント→再調整候補生成→承認（W4）またはfull_auto変更予算内（`REQ-PRODUCT-18`）→**scheduledレーンでの分散適用**とする。同時大量更新でユーザーのWPサーバーへ負荷をかけないよう、適用レート・同時数を制御する（しきい値は`REQ-ADM-09`）。公開処理と同期直列では行わない。
- 環境差: キャッシュ/最適化系プラグインとの連携（更新後パージ等）は環境依存のため、WP Capability Snapshot（`REQ-WPA-08`）で検出して任意連携とし、非対応環境では反映遅延の注意を表示する。
- 記録: 部分更新もSnapshot・施策台帳（`REQ-PRODUCT-19`）へ記録し、反映1か月後の一次評価、3か月後の二次評価、6か月後の長期評価（`REQ-RWR-06`）の対象とする。

## 13. CVポイント台帳と管理CRO  ［REQ-WPA-13］

- CVポイントカタログ: サイト単位で、オファー・フォーム・LP・電話等のCVポイントを登録する（識別子・リンク先・計測タグ=`REQ-WPA-05`接続・**有効期間**=季節バナーの差し替え `REQ-KGA-20` に対応）。
- 割当台帳: 記事×CVポイントの割当を管理する。生成時のCTA Placement（`REQ-PACK-17`）はこの台帳を解決先とし、トポロジーtier・intent・CV近接（`REQ-KGA-13`/`REQ-KGA-17`/`REQ-KGA-19`）と接続する。
- CRO提案: CV相関・エンゲージメント（`REQ-WPA-11`）から、CVポイントの差し替え・位置変更の候補を提案する（相関ベースの補助であり因果を主張しない=`REQ-WPA-05`原則）。適用は部分パッチ（`REQ-WPA-12`）＋承認または変更予算配下（`REQ-PRODUCT-18`）。
- 健全性: 有効期限切れ・リンク切れのCVポイントを検知し（`REQ-KGA-21`の技術チェックに含める）、差し替え候補を提示する。

## 14. 成果物の一時保持（Output Vault）とWP送信フェイルセーフ  ［REQ-WPA-14］

生成が完了した成果物（封入ペイロード=本文含む）を、**送信の成否に関わらず**一定期間保持する。目的は2つ: (a) WP送信失敗時に消費クレジット済みの成果物を失わせない（フェイルセーフ）、(b) ユーザーが自分のコンテンツを**コピー・ダウンロードで持ち出せる**可搬性（ユーザーにやさしい既定）。

- **標準保持（Output Vault）**: 生成完了時点の成果物を暗号化してテナント境界内に保持する。保持期間は既定 **14日**（Config Registry=`REQ-ADM-09`・テナント別変更可）。期限到達で本文を完全削除する（メタ・監査記録・消費記録は保持）。
- **持ち出し**: 保持期間内は、S3成果物一覧から**本文の表示（プレビュー）**・**コピー（クリップボード）**・**ダウンロード（Markdown / HTML）**ができる。自テナントの成果物のみ・Role配下（Viewer可）。持ち出し操作は監査記録の対象（`REQ-SEC-10`）。期限切れは「保持期限切れ」を表示し、WordPress側からの取得を案内する。
- **送信フェイルセーフ**: WP送信（下書き作成=`REQ-WPA-09`・部分パッチ=`REQ-WPA-12`）が失敗した成果物は「退避中（再送待ち）」とし、接続回復・再認可完了イベント（`REQ-WPA-07`）で**自動再送**する（指数バックオフ・回数上限はConfig）。**手動再送**と、**自動再送の停止/再開**の操作を画面から提供する（停止中は保持期限のみ進行し、期限前に再通知）。
- **通知**: 送信失敗時（要対応）と期限3日前（`wp.vault_expiring`）に通知する（`REQ-PRODUCT-11`）。期限失効時は本文を破棄し、checkpoint（`REQ-AGENT-10`）からの再生成導線を提示する。
- **原則との関係**: 本要求は本文非保持原則（`REQ-PRODUCT-04` / `REQ-SEC-11`）の**唯一の例外**であり、目的限定（喪失防止・ユーザー可搬性）・期間限定（既定14日）・暗号化・テナント境界内・監査対象の5条件を満たす場合に限り許容される。学習・分析等の他用途には使用しない。
- **画面**: S3「成果物・履歴」で、各成果物に保持期限・「本文をコピー」「ダウンロード（.md）」を表示。退避中の成果物は失敗理由・退避期限・再送/停止/再開を表示。W7通知（要対応）と連動する。
