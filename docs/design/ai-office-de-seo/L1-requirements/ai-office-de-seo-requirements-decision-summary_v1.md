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
- 製品はWordPress専用品として内部設計せず、CMS非依存のPublication Contractを持つ。ただし初期実装・検証・動作保証はWordPress 7.0.2に限定する。
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
- 記事画像はGPT Image 2（`gpt-image-2`）で生成・編集する。評価済みsnapshotとprompt versionをModel Registryで管理する。
- ユーザーはSiteまたは記事単位で目的、生成トーン、画風、構図、色、明暗、人物、文字入れ、比率、配置、枚数、禁止要素、参照画像を調整できる。
- ユーザーが許可したWordPress Mediaまたは指定URLの画像をREST取得し、Style Feature候補を抽出してユーザー選択後にProfileへ登録する。
- 画像生成前にFeatured Image Pattern Editorで背景、被写体、文字、ロゴ、配色、構図、余白、安全領域、比率、固定・可変slotを設定する。Pattern編集と簡易ワイヤーフレームでは生成費を発生させず、テスト生成または記事生成時だけGPT Image 2を呼ぶ。
- 画像は最適化後、本文とは別にWordPress Media APIへ画像単位で登録し、返却されたMedia ID・URLを記事へ参照設定する。
- 本文JSONへ画像本体を埋め込まない。Site負荷、容量、タイムアウト時は本文画像を減らし、最終的にアイキャッチのみへ縮退する。
- 画像解析結果、Profile、prompt template、同一条件の生成成果をcacheし、再取得・再解析・二重生成を避ける。ただし新しい画像outputの生成原価は毎回見積もる。

正本: `ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`

## 12. WordPress・CMS連携

- CMS共通Publication Contractを内部境界とし、WordPress固有形式を内部記事モデルの正本にしない。
- 初期互換検証はWordPress 7.0.2を基準とする。
- Core REST APIと軽量Trackingを最小構成とし、Thin Pluginは標準RESTで不足するCapability、イベント通知、独自構造検証等だけを補う。
- REST外部認証はHTTPS上の取消可能なApplication Password等を利用する。
- Classic Editor、Block Editor、iframe／non-iframe、Content-Only、Visual Revisions、独自ブロック、第三者Page BuilderをCapabilityとして判別する。
- 未対応Page Builderへ推測で書き込まない。
- 他CMSは実環境がない段階で対応済みと表示しない。将来Adapter追加時に当該CMSのSandboxまたはStagingでE2E検証する。

正本: `categories/integration-requirements_v1.md`、`categories/technical-architecture-requirements_v1.md`、`ai-office-de-seo-wp-automation-dynamic-post-requirements_v3.7.md`

## 13. 非機能・障害

- 一般的なWeb指標を使用し、主要画面の表示・操作・ジョブ受付を計測する。
- 重い非同期処理はAgent Officeビューで進行を可視化し、待ち時間を作業体験へ変換する。
- 障害を機能単位に封じ込め、全体停止を避ける。
- 機械的に復旧可能な障害は即時自動復旧を目指す。人・金銭対応は営業日単位の運用とする。
- RPO、RTO、SLOの確定値は販売プランと運用体制の決定前に確定する。

正本: `categories/non-functional-requirements_v1.md`、`categories/incident-warranty-requirements_v1.md`

## 14. 課金・アップセル

- プラン内利用上限と、超過分の追加クレジットを持つ。
- 品質段階ごとの生成クレジット予測から作成可能本数を算出し、週次作成上限でWordPress・外部API負荷を制御する。
- 品質段階の主モデル順は `GPT Luna → GPT tera → Sonnet → Opus` とし、詳細Routingは設計時に版管理する。
- 専用バックアップ、保持延長、復元支援を上位プランの「安心保証」として提案できる。
- 安心保証は復元可能性と支援範囲の保証であり、SEO成果保証ではない。

正本: `categories/billing-accounting-requirements_v1.md`、`categories/cost-requirements_v1.md`、`categories/growth-upsell-requirements_v1.md`

## 15. 未確定事項

次は要求の欠落ではなく、今後の判断または設計較正が必要な項目である。

1. WordPress Connection Profileの初期既定を `rest_tracking` とするか、Thin Plugin導入を推奨既定にするか。
2. プラグインなしTrackingの初期対応経路をGTM、手動script、その他タグ管理のどこまで含めるか。
3. REST Pollingの通常周期と、公開・更新直後の短期監視周期。
4. 未対応Page Builderへ提供する初期縮退形式の優先順。
5. 生成画像における人物、商品、実績等の誤認リスクと個別確認条件。
6. SLO、RPO、RTO、通知保持、ジョブ保留期限等の商用初期値。
7. プラン別利用枠、品質別クレジット単価、バックアップ容量・保持量。

## 16. 監査上の注意

- 本書と分類別正本が矛盾する場合は分類別正本を優先し、本書を修正する。
- 「要調整」は要求未定義を意味せず、計測方法、設定箇所、確定時期を持たなければならない。
- WordPress以外のCMS、未検証Page Builder、将来のWordPress機能を対応済みとして販売表示しない。
- 推薦、予測、品質スコア、安心保証をSEO成果保証として表示しない。
