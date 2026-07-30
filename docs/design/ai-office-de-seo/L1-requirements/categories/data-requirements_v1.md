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

### REQ-DATA-10 共有データ制約

テナント横断で利用できるのは公共観測キャッシュまたはk匿名・識別子除去済み集計に限定する。記事内容、URL、クエリ内訳、サイト戦略、Prompt Packを横断共有しない。

### REQ-DATA-11 Site業界分類

Siteは「業界／業種」の2階層分類を持つ。業界は上位分類、業種はその配下の下位分類とし、3階層以上へ深くしない。標準Catalogから選択できるほか、ユーザーがSiteに必要な業界・業種を追加できる。ユーザー追加値は作成者、Site、親分類、正規化名、作成日時、状態を持ち、標準Catalogを直接改変しない。匿名全体較正への昇格は通常のk匿名・Catalog改版手順を通す。

## 受入条件

- [ ] AC-DATA-01: 主要データの所有者、正本、tenant/site境界が定義される。
- [ ] AC-DATA-02: 見出し構造、要点、イベント発生ポイントを機械抽出したArticle Summaryだけで記事の役割・不足・推薦根拠を判定できる。
- [ ] AC-DATA-03: DB、ログ、キュー、一時領域を検査し本文恒久保持がない。
- [ ] AC-DATA-04: stale・incompleteな派生値を識別し再取得できる。
- [ ] AC-DATA-05: 未変更記事が再取得・再解析されない。
- [ ] AC-DATA-06: Recommendation Itemから理由、費用、リスクを表示できる。
- [ ] AC-DATA-07: 施策、獲得キーワード、順位、確実なページ遷移・CV、公開・更新の遍歴が、過剰な詳細ログなしで追跡できる。
- [ ] AC-DATA-08: 保存量と索引量が設定上限を超えて無制限に増加しない。
- [ ] AC-DATA-09: エクスポート、削除、移管の対象と結果を監査できる。
- [ ] AC-DATA-10: 横断集計から顧客、Site、URLを特定できない。
- [ ] AC-DATA-11: Siteへ業界／業種の2階層を設定でき、ユーザー追加分類が標準Catalogを直接変更しない。
