---
document_id: AOS-PRE-L3-INTERNAL-SEARCH-UI-VALIDATION
title: 内部横断検索・一覧絞込み・検索結果遷移 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# 内部横断検索・一覧絞込み・検索結果遷移 画面検証仕様

分類別L1と`AOS-L1-INTERNAL-SEARCH-INDEX-CONNECTION-MAP`を現行要求の正本とし、本書はpre-L3の画面検証入力である。顧客向け検索と内部管理検索、製品内部IndexとSEO index診断を混同しない。

## 1. 目的

Keyword、カテゴリー／テーマ戦略、記事、Recommendation、Task、顧客成果を、現在のSiteと権限を守りながら横断検索し、該当する通常ビューまたはOffice詳細へ同じ対象Contextで移動できる画面を検証する。検索は推薦ホームを置換する主導線ではなく、既知対象を探す補助導線とする。

## 2. 検索面

| 検索面 | 役割 | Scope | 結果 |
|---|---|---|---|
| Header横断検索 | 既知のKeyword・領域・記事・Recommendation・Task・成果を探す | 現在Siteが既定。明示操作で付与済み全Site | 種別group＋上位候補＋全結果 |
| 各一覧検索 | 現在の業務一覧を絞り込む | 現在Site・現在tab | 表示中Document typeだけ |
| Office検索／関連対象 | 詳細分析中に同じ対象や関連対象へ移る | 現在Site・許可されたWorkbench | 共通Search結果をOffice routeへ投影 |
| 管理面検索 | 内部画面・設定・認可済み管理対象を探す | 内部Role・期限付き対象 | 顧客検索と別Index／契約 |

全Site検索はユーザーが付与されたSiteだけを対象にし、結果へSite名を表示する。Site Assignmentが0件なら全Siteという既定権限規則はserver認可で解決し、検索UIが独自解釈しない。顧客面から内部管理対象を検索できず、内部管理面の検索結果をOfficeへ混在させない。

## 3. Query・結果表示

入力は日本語の全角／半角、大小、空白、URL、既知ID、表記揺れを正規化し、完全一致・title・代表Keywordを優先する。候補語、関連語、typo、同義語は適用した辞書／analyzer versionから返し、LLMを検索入力ごとに呼ばない。

結果は少なくとも種別、名称、Site、現在状態、短い一致理由、最終更新、遷移先を表示する。Articleは本文断片でなくtitle、見出し名、Article Summary、Keyword等の許可fieldからsnippetを作る。順位scoreやembedding距離をユーザーへ意味のある成果値として表示しない。

結果groupは`カテゴリー／テーマ戦略、Keyword、記事、Recommendation、Task、成果`とし、内部のDocument type名を第一表示にしない。Sortは関連度、更新日、業務優先度等をユーザーが選べる。大量結果はserver-side paging／cursorを使い、全件を初期取得しない。

## 4. 状態と0件

| 状態 | 表示 | 次操作 |
|---|---|---|
| true empty | 条件に一致する対象がありません | 語・filter・Siteを見直す |
| indexing | 検索情報を更新中。現在確認できる結果を表示 | 更新時刻を確認、再読込 |
| stale | 最終更新時刻付きの結果 | 詳細で正本の最新状態を確認 |
| partial | 利用可能な種別だけ表示 | 未完了種別と見込みを確認 |
| permission excluded | 許可範囲内に結果なし | 他対象の存在件数を示さない |
| unavailable | 検索を利用できません | 主要一覧、最近見た項目、exact-ID等へ縮退 |

未接続、indexing、権限除外、障害をすべて0件へ丸めない。許可されていない対象の名称、件数、候補語、facetを漏らさない。検索Index障害でもNavigationと各主要一覧を残し、ページそのものを隠さない。

## 5. 遷移と操作

検索結果から遷移するときは`tenant_id、site_id、document type、entity ID、source version、source=search、query、filter、result position`をContextとして保持する。通常ビューは対象の正本画面・tabへ、Officeは対応Workbenchへ移る。戻る操作でquery、filter、scroll位置を復元する。

検索結果を選択しただけでRecommendation採用、Task開始、記事公開、設定変更を行わない。結果からActionを選ぶ場合は対象Aggregateを再読込し、Permission、状態、version、Credit、接続、Capacityを正規Command経路で再判定する。stale hit、削除済み、Site移管済みの場合は現在状態と代替導線を表示し、古い内容で実行しない。

## 6. 通常ビューとOffice

通常ビューは横断結果から対象の要約・簡単操作へ着地する。Officeは同じSearch Documentと正本Projectionを使い、根拠、関連Keyword／記事／Task／成果、期間、比較軸を詳しく表示する。Office専用の検索Corpus、別ranking、別権限を作らない。ただし同じhitを通常画面routeとOffice Workbench routeへ異なる表示密度で投影できる。

Officeの関連対象表示は検索結果を利用できるが、関連対象ごとにLLM会話を起動しない。自由文で分析依頼をした場合だけ、選択済み検索結果をContext参照としてConversation Runtimeへ渡す。

## 7. 3秒表示契約

横断検索、全結果、各一覧、Office関連対象ページを常時到達可能にする。標準利用条件P95で検索開始から3秒以内に、検索結果、cache済み結果＋更新中、部分結果、または理由付き利用不能状態を表示する。3秒を超える再index、vector検索、関連展開を待って全面spinnerにせず、lexical結果とfilterを先に利用可能にする。

## 8. 検証fixture

| ID | 条件 | 期待表示・操作 | 禁止する実装 |
|---|---|---|---|
| SEARCH-UI-01 | Header検索を開く | 現在Siteで横断検索 | 全tenant検索 |
| SEARCH-UI-02 | 全Siteへ切替 | 付与済みSiteだけ＋Site名 | 無権限Siteの件数表示 |
| SEARCH-UI-03 | Keyword完全一致 | Keywordを上位表示 | vectorだけで順位付け |
| SEARCH-UI-04 | 記事title一致 | 記事と状態を表示 | 本文全文snippet |
| SEARCH-UI-05 | URL入力 | 該当記事へ | URLを外部crawlへ毎回送信 |
| SEARCH-UI-06 | カテゴリー名入力 | カテゴリー／テーマ戦略group | 内部Cluster IDだけ表示 |
| SEARCH-UI-07 | Recommendation理由語 | Recommendation group | 生成本文を検索対象化 |
| SEARCH-UI-08 | Task ID | Task stageへ | 顧客に内部traceを表示 |
| SEARCH-UI-09 | 成果段階語 | 成果groupへ | 運営KPIと混合 |
| SEARCH-UI-10 | 日本語表記揺れ | version付き正規化結果 | LLMを毎回呼ぶ |
| SEARCH-UI-11 | typo候補 | 候補適用を選択可能 | 原queryを黙って変更 |
| SEARCH-UI-12 | filter併用 | 種別・状態・期間・Siteを保持 | client全件filter |
| SEARCH-UI-13 | 結果多数 | paging／cursor | 全件初期取得 |
| SEARCH-UI-14 | true empty | 条件見直しを表示 | 未接続と表示 |
| SEARCH-UI-15 | indexing中 | 現在結果＋更新中 | 0件に丸める |
| SEARCH-UI-16 | stale hit | 最終更新を表示 | 最新と偽装 |
| SEARCH-UI-17 | 部分index | 利用可能groupを先行表示 | 全group完了まで隠す |
| SEARCH-UI-18 | 権限外のみ一致 | 許可範囲内に結果なし | 他対象の存在を開示 |
| SEARCH-UI-19 | Index停止 | 主要一覧・最近見た項目へ縮退 | 全ページ停止 |
| SEARCH-UI-20 | vector停止 | lexical＋filter結果 | 検索不能 |
| SEARCH-UI-21 | 通常結果を選択 | 正本画面・tabへ | 検索結果内で状態変更 |
| SEARCH-UI-22 | Officeで開く | 同一対象のWorkbench | 別集計・別権限 |
| SEARCH-UI-23 | 戻る | query・filter・位置を復元 | 検索初期化 |
| SEARCH-UI-24 | stale結果からAction | 正本再読込・再認可 | hit内容で直接実行 |
| SEARCH-UI-25 | 削除済み結果 | 現在状態と代替導線 | 404だけ |
| SEARCH-UI-26 | Site移管済み | denyまたは現Scopeへ案内 | 旧Scopeで表示 |
| SEARCH-UI-27 | Recommendation採用 | 正規Decision／Admissionへ | 検索clickで採用 |
| SEARCH-UI-28 | 記事公開 | 承認・Publication経路へ | 検索から直接公開 |
| SEARCH-UI-29 | 検索処理10秒 | 3秒以内にlexical部分結果 | 全面spinner |
| SEARCH-UI-30 | 初回index未構築 | 構築状態＋主要一覧 | 検索ページを隠す |
| SEARCH-UI-31 | 顧客面検索 | 顧客Documentだけ | 管理設定・監査対象混入 |
| SEARCH-UI-32 | 管理面検索 | 内部Roleと対象Scopeを強制 | 顧客Headerへ結果共有 |

## 9. Finding記録

検証結果は`SF-UI-12`へ記録する。意味変更は`REQ-SCREEN-09/10/21`、`REQ-DATA-16`、`REQ-TECH-20`、Internal Search Index Connection Map、`INV-CONTENT-002`、`INV-SEARCH-UI-001`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
