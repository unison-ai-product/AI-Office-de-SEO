---
document_id: AOS-L1-KEYWORD-REPORT-CONNECTION
title: AI Office de SEO 新規Site戦略・既存Site診断Report接続マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# 新規Site戦略・既存Site診断Report接続マップ

## 1. 共通原則

Reportは分析結果の静的な説明資料ではなく、Keyword Market／Site Shareから月次計画とRecommendationへ移る業務判断面である。基本単位は単一KeywordではなくSite Clusterとし、代表Keyword＋補助Keyword、検索インテント、ファネル、業界／業種、商品、顧客、地域、横断軸を同じContextで表示する。

新規Siteと既存Siteは、実績の有無と判断目的が異なるため同じ章立てへ数値を差し替えるだけにしない。共通の`report_id + version`、対象Site、source availability、分析期間、Market／Cluster version、計算versionを持つ。

## 2. 新規Site Keyword戦略Report

### 業務目的

実績がない状態で、どの市場領域をSiteへ配置し、どの順序で記事資産を構築するかを決める。順位、click、CVの実績不足を赤字の異常として表示しない。

### 章

1. 市場概要: 対象市場、需要、traffic potential、季節性、競争性、AIO・広告圧力、観測範囲
2. Market Map: 業界／業種、商品、顧客、ファネル、地域、横断軸別のCluster分布
3. Site適合: Siteとして必要、流入機会、CV機会、記事成立性、信用適合
4. 優先Cluster: 代表＋補助Keyword、検索intent、記事目的、期待役割、不足入力
5. Site構造提案: 推奨カテゴリと記事配置。構造を自動変更せず、記事を現行構造へ割り当てる
6. 制作順序: 前提記事、内部link前後関係、依存、保護、月次の傾向配分
7. 推薦準備: 実行可能、入力待ち、観測、除外と予測credit

数値予測は直近1か月1,000 click等の解放条件を満たさないため出さず、方向性・レンジ・confidenceを表示する。

## 3. 既存Site Keyword・Site診断Report

### 業務目的

市場Keyword母集団に対してSiteがどの需要を記事・Queryで獲得し、どこを失い、どの資産を守り、どこへ新規・更新・軽量施策を配分するかを決める。記事一覧から始めず、Market→Cluster→Share→記事／Queryの順で掘る。

### 章

1. 市場と対象範囲: 新規Siteと同じMarket基線、観測期間、Source coverage
2. Cluster別Share: GSC Observed Share、外部推定Search Share、記事配分を混合せず表示
3. 獲得Keyword: 主＋補助Keyword、Observed Query、担当記事、順位、表示、click、CV、記事目的
4. 未獲得・未配置: 市場には存在するが未獲得、記事未割当、記事成立性不足、除外を分離
5. 資産状態: protected／winning／quick win／weak／missing／untapped／emerging／declining／lost
6. 診断: Query Drift、カニバリ、index障害、順位はあるがclick不足、流入はあるがCV接続不足、内部link／CTA不足
7. 外部要因: 季節性、需要変化、AIO、広告、SERP構成、競合変化を記事固有変化と分離
8. 施策配分: 新規、リライト、CTA Patch、内部link Patch、保護、監視、ユーザー対応、見送り
9. 月次実行順: 依存関係、週次上限、予算、ユーザー指定予定との関係

順位なしはindex診断が正常と確認されるまで記事失敗へ帰属しない。CVなしは通常状態として許容し、母数がある場合だけ改善判断へ使う。

## 4. 操作と再計算

通常ビューで求める操作はCluster単位の`優先 / 通常 / 保留 / 除外`と、複数業界時の`手動優先 / 自動配分`である。大量の個別Keyword承認を必須にしない。Officeでは個別Keyword、根拠、Source、式、Report、成果を玄人向けに詳細分析し、分類・優先度・除外の変更案を型付きProposalとして作成できる。両Viewは同じReport／成果Projectionを使う。

修正後は実行済み施策と当時のReport versionを維持し、未実行Recommendationと次回月次配分だけを再計算する。ユーザー確定分類を自動推定で上書きせず、修正差分をSite補正と匿名全体補正候補へ分けて還流する。

Reportは`draft / partially_available / ready / user_adjusted / superseded`を持つ。大規模SiteではCluster領域ごとに段階開放し、全件完了を待たせない。部分開放時はcoverageと未分析領域を明示する。

## 5. 画面接続

- S2 Report入口で新規／既存を自動判定し、Report種別、version、分析期間、coverage、source不足を表示する。
- ReportのCluster cardからMarket、Share、Keyword、記事、根拠、Office Keyword roomへ同一Contextで遷移する。
- Cluster状態変更は影響する未実行推薦数、月次配分、予測credit差分を提示して確定する。
- `月次計画を作成`は調整後のReport versionを`MonthlyPlan.source_report_ref`へ渡す。
- `Recommendationを見る`は同じCluster filterとReport versionを保持する。

## 6. 根拠

`REQ-BUS-02/04/05/06`、`REQ-SCREEN-02/09/18`、`REQ-KRL-01〜10`、Keyword Market・Site Share接続マップ、Recommendation Action Routing Map。
