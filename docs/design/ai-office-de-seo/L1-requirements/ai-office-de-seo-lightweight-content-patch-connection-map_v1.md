---
document_id: AOS-L1-LIGHTWEIGHT-CONTENT-PATCH
title: AI Office de SEO CTA・内部link軽量Patch接続マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# CTA・内部link軽量Patch接続マップ

## 1. 境界

公開済み記事に対するCTA変更と内部link変更を、全文リライトとは別の限定Patchとして扱う。CTA専用Agent、CTA専用Writing Ticketまたは新しい作業Packを必須化しない。意味を伴う接続文が必要な場合だけ既存Repair Ticketを使用し、候補抽出、重複排除、権限、承認、CMS反映、計測は共通基盤で処理する。

新規記事またはリライト成果内のCTA・内部linkは、その記事WorkflowのOutline／Placement／QAへ含める。本書の独立Patchは、主に既存公開記事の一部だけを更新する施策を対象とする。

## 2. 共通Patch Lifecycle

`candidate → proposed → accepted / rejected / held / expired → approved → scheduled → applying → applied / failed / conflict → measuring → evaluated`

- `candidate`: Article Summary、Keyword Cluster、CV Point、link graph、記事目的および実績から機械的に抽出する。
- `proposed`: 根拠、対象part、before／after、目的、影響、権限、費用、計測方法を表示できる状態。
- `accepted`: Recommendationを`schema.intake.recommendation.v1`へfreezeした状態。CMS更新許可ではない。
- `approved`: 記事制作PermissionとCMS write Scopeを副作用直前にも満たす。戦略条件自体を変更する場合はキーワード・サイト戦略Permissionも必要。
- `scheduled`: Site別rate limitとCMS負荷制御へ入った状態。公開処理と同期直列にしない。
- `applied`: CMSが成功を返しただけでなく、再取得またはPlugin Snapshotで対象差分を確認した状態。
- `failed / conflict`: 一部成功を成功全体へ丸めず、対象part別結果と再試行可否を保持する。
- `measuring / evaluated`: 介入前baseline、反映日、評価窓、月次値、累積値、availabilityを保持する。

候補、承認Batch、Patch Job、CMS結果および評価は`patch_action_id`で相関し、Recommendation由来の場合は`recommendation_id + version / intake_ref / correlation_id`も引き継ぐ。

## 3. CTA Patch

### 入力

- 記事目的、検索インテント、ファネル、月次目的
- Siteの複数CV Goalと優先CV
- CTA partとlink先。有効期間、リンク健全性、現在の配置
- ページ遷移、識別可能CTA、サンクスページ到達の月次／累積値
- Article SummaryのCTA周辺要点。本文全文は恒久保持しない

### 操作

`add_cta / replace_cta_part / replace_cta_destination / move_cta / remove_cta`を区別する。接続文を変更する場合だけ`repair_ticket_ref`を付ける。商品、人物、実績等を自由生成してCTA assetへ追加しない。

### 評価

CTA反映でSEO評価周期をリセットしない。`cta_evaluation_started_at`だけを更新し、月次と累積で遷移率、CV到達、母数、記事目的との一致を表示する。CVなしだけで失敗とせず、母数不足は`insufficient_data`とする。直接CVが難しい記事は、関連ページ遷移、指名・認知への寄与、Cluster充足を記事役割として表示し、直接CV未獲得と混同しない。

## 4. 内部link Patch

### 候補

Article Summary、Keyword Cluster、主担当記事、検索インテント、記事目的、link graphおよび公開状態から、`source_article_ref → destination_article_ref`を生成する。リンク先が未公開、canonical不明、同一URL、既存link重複、循環による価値なし、カニバリ懸念、保護条件違反の場合は実行可能にしない。

### 操作

`add_internal_link / replace_internal_link / remove_internal_link`を区別する。追加は新規・リライトWorkflowへ内包できる。既存公開記事への追加・差替えは候補Batchから承認後に限定Patchする。削除は順位・導線への影響を表示して追加とは別確認にする。

### Batchと部分失敗

Batchは承認操作の単位であり、成功判定の単位ではない。各候補が独立した`patch_action_id`、対象記事hash、対象part、状態、CMS結果を持つ。一部失敗時は成功分を巻き戻さず、失敗分だけ再試行または再提案できる。対象記事が変更済みなら`conflict`へ止め、古い位置指定で適用しない。

### 評価

追加・差替え後はlink graph、リンク元／先Article Summary、遷移実績を更新する。SEO評価周期は本文・見出し・titleの変更がない限りリセットせず、内部link介入として月次／累積評価する。削除は保護対象、流入、CV経路への影響を次回Recommendationへ戻す。

## 5. CMS・復元・負荷

- 適用前にCMS Revisionを優先し、利用不能時の専用バックアップは契約Planと容量に従う。復元は候補提示後にユーザーが実行する。
- CMS Capabilityが対象block／fieldの安全な部分更新を証明できない場合は、別下書きまたはユーザー対応へ縮退し、推測更新しない。
- PatchはSite別scheduled laneで分散適用し、429、timeout、接続障害は原因別に記録する。
- 反映確認に失敗した場合、CMS応答成功だけで`applied`にしない。

## 6. 画面

通常ビューはCTA改善と内部link改善を別の施策として表示するが、共通して次を持つ。

- 候補件数、実行可能／不足／保留、対象記事
- 推奨理由、記事目的、before／after、影響、予測credit
- 個別／一括採否、個別／一括承認、失敗分だけ再実行
- `候補 → 承認 → 適用 → 反映確認 → 評価`の進捗
- Officeへ同一Contextで遷移し、通常ビューと別状態を作らない

## 7. 根拠

`REQ-BUS-04/05/09/10`、`REQ-WPA-02/05/11/12/13`、`REQ-KGA-09/19`、`REQ-RWR-08/09`、`REQ-PRODUCT-18/19`、`REQ-KRL-07〜10`。
