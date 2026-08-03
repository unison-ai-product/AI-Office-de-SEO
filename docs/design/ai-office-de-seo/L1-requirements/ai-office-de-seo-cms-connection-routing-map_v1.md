---
document_id: AOS-L1-CMS-CONNECTION-ROUTING
title: AI Office de SEO CMS接続・取得・投稿経路マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# CMS接続・取得・投稿経路マップ

## 1. 目的

CMS連携を「WordPressに接続済み」という単一boolへ潰さず、変更発見、記事読取り、下書き／更新書込み、Media、Preview、Revision、部分Patch、計測を別Capabilityとして判定する。ユーザーはSite URL、認証、CMS接続、Plugin導入等の必要項目だけを設定し、内部の経路名、優先順位、fallback、rate limitを選択しない。

## 2. Site CMS Connection Profile

Siteごとに次を保持する。

| 領域 | 内容 |
|---|---|
| CMS identity | CMS種別、version、Site URL、認証状態、最終診断 |
| discovery | signed webhook、Plugin push、RSS／Atom、sitemap、REST modified、manual sync |
| read | public crawl、authenticated crawl、CMS REST rendered、Plugin Snapshot push、manual import |
| write | draft create、existing update、schedule、publish、partial patch、taxonomy proposal-only |
| media | upload、featured image、派生size、MIME、上限 |
| editor | Block、Classic、Content-Only、Page Builder、block namespace、post type |
| assurance | Preview、Revision、反映確認、復元、Output Vault |
| measurement | Tracker、CTA／遷移、CV、Plugin version／更新通知 |
| capacity | 記事総数、初回取込量、月間更新量、同時数、rate limit、Plan上限 |

読取り成功をCMS書込み許可として扱わず、書込み可能でも公開済み表示を正確に取得できるとは限らない。用途別にCapabilityを解決する。

## 3. 変更発見と記事読取り

変更発見は軽いmetadata信号を優先し、対象だけを読取る。

1. Thin Plugin署名Webhook／Snapshot notification
2. CMS native webhook
3. RSS／Atom、sitemap、REST modified
4. 低頻度の整合確認、手動同期、再接続、欠落復旧

読取りAdapterは`public_crawl / authenticated_crawl / cms_rest_rendered / plugin_snapshot_push / manual_import`を共通Article Snapshot Contractへ正規化する。Site別Policyがhealth、完全性、freshness、latency、Site負荷、製品費用、rate limit、Planから`primary / standby / disabled`を選ぶ。

一時失敗だけで経路を往復切替せず、連続失敗、error class、cooldown、最小固定期間、回復probe、切替後観測を持つ。全経路不成立時だけユーザーへ、技術名ではなく「再接続」「認証確認」「Plugin更新」「手動取込」等の必要操作を提示する。WAF等のセキュリティを弱めるよう要求しない。

初回は分割同期、通常は差分同期とし、content hash未変更ならArticle Summary再解析を省略する。Headless Browserは後続Capability、外部Archiveはsupport／復旧調査の補助であり通常fallbackにしない。

## 4. 投稿・更新・Preview

記事送信の最小条件は、認証済みCMS write Adapter、対象post typeの下書き作成権限、投稿形式Capabilityである。画像を使う場合はMedia writeも必要とする。

WordPressではCore REST APIを基礎経路とし、Thin PluginはTracker、署名Webhook、標準RESTで不足するCapability、Plugin version／更新通知を補う。REST未接続でも分析・推薦・生成は行えるが、CMS送信は実行しない。

出力はCompatibility Matrixに従い、`full / degraded / update_required / unsupported`をCapability単位で返す。縮退順は、検証済みBuilder Adapter、標準Block別下書き、互換HTML別下書き、HTML／Markdown持ち出しとする。未知Builderへ推測上書きしない。

PreviewはCMS下書き作成後のCMS Preview URLを正規経路とする。CMS送信前は製品側HTML Previewで内容確認できるが、Site themeの完全再現とは呼ばない。CMSへ送信済みの場合、別の擬似Previewを重複生成しない。

## 5. 反映確認と正本

| 用途 | 正本 |
|---|---|
| SEO評価 | 公開表示の取得結果 |
| 編集・更新 | CMS保存値／REST取得値 |
| 変更発見 | Webhook／Plugin Snapshot等のevent metadata |
| 復元 | CMS Revision、契約対象の暗号化backup |

書込みAPI成功だけで反映完了にせず、対象post ID、status、modified、content hashまたは対象partを再確認する。公開表示のcache遅延はCMS保存値失敗と分離する。404、非公開、ゴミ箱、redirect、URL変更を別状態として扱い、一度の取得失敗で削除と確定しない。

## 6. Capacity・Plan

記事総数、初回取込量、月間変更件数、保存容量、処理量、読取／書込rateをPlan ConfigurationのCapacity Dimensionとする。大規模Siteは「自動構築期間」として処理済み領域から機能を開放する。ユーザー画面には記事、Keyword、保存容量、今月の取込・処理の使用率と上限到達予測を表示し、内部経路設定は表示しない。

Premium未満で容量超過が予測される場合はPremium以上を推奨し、Premium以上では容量optionを購入可能にする。具体値は構築後の実測でPlan Configurationへ設定し、要求本文へ固定しない。

## 7. 障害の分離

Connection Healthは`auth_expired / permission_missing / plugin_outdated / webhook_invalid / rate_limited / waf_denied / schema_changed / content_incomplete / cms_unavailable / verification_delayed`を区別する。原因をFAQ Chatへ渡し、製品側対応かSite側操作かを説明する。経路切替・再試行・縮退は内部制御し、ユーザーへ開発用設定を要求しない。

## 8. 根拠

`REQ-INT-01〜09`、`REQ-WPA-01〜14`、`REQ-TECH-04/06/08/11`、`REQ-BILLING-03`、軽量Patch接続マップ。
