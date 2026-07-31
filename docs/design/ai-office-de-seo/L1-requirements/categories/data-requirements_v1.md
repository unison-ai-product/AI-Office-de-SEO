---
document_id: AOS-L1-DATA-REQUIREMENTS
title: AI Office de SEO データ要求 v1.0
version: 1.0
layer: L1
kind: data_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO データ要求

## 責務

データの正本、境界、保持、鮮度、容量、履歴、削除を定義する。

必須項目:

- データ所有者とtenant/site境界
- 業務上の正本と外部正本
- 主キー、参照キー、version
- 増加単位と想定増加率
- 保持期間、容量上限、ロールアップ、削除
- freshness、availability、confidence、source reference
- 本文非保持、一時本文TTL、ArticleSummary
- 移行、エクスポート、復元、オフボーディング

原則:

- DBを取得データの無制限保管庫にしない。
- 本文、生HTML、LLM raw response、プロンプト全文を恒久DBへ置かない。
- 検索・推薦に必要な小さい事実と事前計算read modelを保持する。

既存ソース: `ai-office-de-seo-product-requirements_v3.7.md`、`ai-office-de-seo-keyword-gsc-article-map-requirements_v3.7.md`、`ai-office-de-seo-security-observability-requirements_v3.7.md`。

## 要求

### REQ-DATA-01 データ所有と境界

顧客由来データはContract Account、Customer Organization、tenant、必要なsiteの所有境界を持つ。外部正本、製品内正本、派生データ、共有可能な公共観測を区別し、所有境界のない顧客データを作らない。

### REQ-DATA-02 Article Summary

記事本文の代わりに、URL、title、meta、見出し構造、記事タイプ、更新日、content hash、見出し単位の要点、イベント発生ポイント、トピック、意図、対象読者、問い、主張、根拠種別、CTA、内部リンク、鮮度、不足分類を有界なArticle Summaryとして機械抽出し保持する。抽出器とschema versionを記録し、LLMの自由要約だけを正本にしない。

### REQ-DATA-03 本文非保持

本文全文、段落全文、生HTML、長い引用、LLM raw response、プロンプト全文を恒久DBへ保持しない。本文は隔離された一時領域で解析し、Article Summaryと必要なhash・位置参照を生成後に削除する。

### REQ-DATA-04 鮮度・完全性・根拠

派生データは `observed_at`、`source_ref`、`schema_version`、`confidence`、`completeness`、鮮度期限を持つ。取得失敗または部分解析時は旧値を無条件に削除せず、staleまたはincompleteとして再取得対象にする。

### REQ-DATA-05 差分更新

WordPress同期、生成、公開、リライト時にcontent hashとcheckpointを比較し、未変更記事を再取得・再解析しない。変更された対象と依存する派生データだけを更新する。

### REQ-DATA-06 推薦データ

Recommendation Itemは対象、推薦種別、根拠、期待改善、使用したsummary field、実績またはルール根拠、信頼度、鮮度、費用、リスク、反証条件、状態を持つ。本文の再取得なしに一覧と基本説明を生成できるデータ量に抑える。

### REQ-DATA-07 施策台帳

実行施策は推薦、Ticket、対象記事、変更種別、実行日、費用、承認、公開結果、事前・事後指標へ参照可能なappend-only履歴を持つ。後から算定した効果は元記録を上書きせず追記する。

記事ごとに獲得キーワード、検索順位、表示、クリック、CTR、CV、公開・更新、推薦、施策、品質結果の時系列を記事遍歴として参照できる。イベント計測はページ遷移を正本にし、遷移元・遷移先・対象ページ・時刻・Site・匿名セッションまたは集計単位を最小データとして持つ。特定ボタンからの遷移は確実に識別できる場合だけbutton/CTA識別子を付与し、サンクスページ等の明示された到達ページをCVとして判定する。高頻度の生データを無期限保持せず、期間別集計と重要イベントへロールアップする。

### REQ-DATA-08 容量と世代管理

配列、文字列、記事当たり保存量、Site当たり件数、履歴世代、検索索引に上限を持つ。古い高頻度データは日次から月次等へロールアップし、再現・監査に不要な派生データを期限で削除する。

### REQ-DATA-09 エクスポート・削除・移管

顧客は権限範囲内の組織、設定、記事メタデータ、推薦、施策、分析を機械可読形式で取得できる。契約終了、削除要求、組織・Site移管では、法定・会計・監査保持を除くデータの削除または所有先変更を追跡可能にする。

通知センターの通常通知は初期値90日で削除または集約する。課金、権限変更、公開操作、同意、開発・運用側の代理操作等の監査記録は最低1年保持し、法定・契約要件または上位プランで延長できるようにする。保持値は設定versionと適用開始日を持つ。

### REQ-DATA-10 共有データ制約

テナント横断で利用できるのは公共観測キャッシュまたはk匿名・識別子除去済み集計に限定する。記事内容、URL、クエリ内訳、サイト戦略、Prompt Packを横断共有しない。

### REQ-DATA-11 Site業界分類

Siteは「業界／業種」の2階層分類を複数持てる。業界は上位分類、業種はその配下の下位分類とし、3階層以上へ深くしない。複数分類はユーザーが優先順を設定し、割合を直接入力しない。横断軸は対象顧客、共通課題、商品・サービス、地域、ファネルの構造化項目と補足自由記述を持つ。

標準Catalogから選択できるほか、ユーザーがSiteに必要な業界・業種を追加できる。ユーザー追加値は作成者、Site、親分類、正規化名、作成日時、状態を持ち、当該Site内の分類として保持して標準Catalogを直接改変しない。匿名全体較正への昇格は通常のk匿名・Catalog改版手順を通す。

ユーザーが業界／業種を設定しない場合、キーワード、Article Summary、商品・サービス、対象顧客、サイト構造等から推定分類、推定横断軸、confidence、根拠を生成する。推定値はユーザー設定と区別し、精度を保証せず、ユーザーが確認・修正できる。

記事は主担当の業界／業種を1組、関連する業界／業種を複数持てる。ユーザーが推定分類を確認・修正した後はユーザー確定値を正本とし、自動推定で上書きしない。推定値、ユーザー修正前後、修正理由、使用した入力、推定versionを教師データとして保持し、キーワード分配、Site分析、業界推定のSite固有補正と、同意・匿名化条件を満たす全体較正へ還流する。

### REQ-DATA-12 画像Style Profileとcache

Site画像Style Profileは目的、トーン、画風、構図、palette、明暗、被写体、人物、文字入れ、比率、配置、枚数、禁止要素、参照Media ID／URL／hash、権利・出典、ユーザー確定状態、versionを持つ。記事単位overrideは差分だけを保持する。

既存画像の原本は解析中の一時領域へ限定し、WordPress等の外部正本を無期限複製しない。恒久保持する解析cacheはperceptual hash、content hash、Style Feature、解析model／prompt version、observed_at、source_ref、権利・出典、失効条件に限定する。生成画像はWordPress Mediaを公開正本とし、製品側は生成job、model、prompt version、Profile version、Media ID／URL、content hash、採否、費用、権利表示に必要な来歴を保持する。

Featured Image PatternはCMS要求size、layer、領域、位置、比率、余白、安全領域、固定・可変slot、palette、トーン、参照画像hash、variation tolerance、可変属性と範囲、ロゴ配置・余白、合成方式、作成者、確定者、version、既定状態を保持する。編集中、確定、廃止を区別し、生成jobが使用したPattern versionを追跡する。

## 受入条件

- [ ] AC-L1-DATA-01: 主要データの所有者、正本、tenant/site境界が定義される。
- [ ] AC-L1-DATA-02: 見出し構造、要点、イベント発生ポイントを機械抽出したArticle Summaryだけで記事の役割・不足・推薦根拠を判定できる。
- [ ] AC-L1-DATA-03: DB、ログ、キュー、一時領域を検査し本文恒久保持がない。
- [ ] AC-L1-DATA-04: stale・incompleteな派生値を識別し再取得できる。
- [ ] AC-L1-DATA-05: 未変更記事が再取得・再解析されない。
- [ ] AC-L1-DATA-06: Recommendation Itemから理由、費用、リスクを表示できる。
- [ ] AC-L1-DATA-07: 施策、獲得キーワード、順位、確実なページ遷移・CV、公開・更新の遍歴が、過剰な詳細ログなしで追跡できる。
- [ ] AC-L1-DATA-08: 保存量と索引量が設定上限を超えて無制限に増加しない。
- [ ] AC-L1-DATA-09: エクスポート、削除、移管の対象と結果を監査できる。
- [ ] AC-L1-DATA-10: 横断集計から顧客、Site、URLを特定できない。
- [ ] AC-L1-DATA-11: Siteと記事へ主担当・関連の業界／業種を保持でき、構造化横断軸と非保証の推定根拠を持ち、ユーザー修正を正本・較正データとして保持し、ユーザー追加分類が標準Catalogを直接変更しない。
- [ ] AC-L1-DATA-12: 原画像を無期限複製せず、版付きImage Style Profile、Featured Image Pattern、解析cache、生成画像の来歴とWordPress Media参照を保持できる。
