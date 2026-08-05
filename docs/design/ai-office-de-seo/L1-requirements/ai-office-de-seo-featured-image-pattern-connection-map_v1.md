---
document_id: AOS-L1-FEATURED-IMAGE-PATTERN
title: AI Office de SEO アイキャッチPattern・画像生成接続マップ v1
version: 1.0
layer: L1
kind: connection-map
status: current
updated_at: 2026-08-03
---

# アイキャッチPattern・画像生成接続マップ

## 1. Release境界

初期リリースはFeatured Image Pattern、アイキャッチ生成、最適化、CMS Media登録、featured media割当までを対象とする。本文中画像の自動生成・配置、SNS・広告size展開、見出しごとの配置rule、第三者画像stock連携は後続versionとする。将来用設定を初期画面で有効に見せない。

画像を生成してから毎回自由文で直すことを基本導線にせず、生成前にSiteのアイキャッチPatternを設定する。ユーザーはSite既定Patternを選び、必要な記事だけoverrideできる。

## 2. 構成

| entity | 責務 |
|---|---|
| Image Style Profile | トーン、画風、palette、質感、被写体傾向、明暗等。言い回し・装飾学習とは別version |
| Featured Image Pattern | canvas上の領域、構図、slot、固定・可変、禁止、variation tolerance |
| Image Generation Request | Pattern＋Profile＋記事slot＋CMS size＋quality＋model route＋予算をfreeze |
| Image Generation Result | output、技術検査、advisory、採否、費用、Media登録結果 |

Patternは背景、被写体、文字、ロゴ、余白、安全領域、レイヤー、palette、構図、禁止要素、参照画像、記事タイトル／カテゴリ／Keyword等の可変slotを持つ。Pattern Editorの配置、サイズ、表示、固定、並替、複製、undo／redoは決定論編集であり、操作ごとに画像Providerを呼ばない。

## 3. バリエーションとロゴ

variation toleranceは`fixed / controlled / creative`とする。

- fixed: 構図、領域、paletteを固定
- controlled: ユーザーが許可した属性と範囲だけ変更
- creative: 固定要素、禁止要素、ブランドトーン以外の裁量を拡大

複数Patternの登録数をバリエーションの代替にしない。生成promptとQAへ許容度を伝える。

ロゴはasset、配置領域、外周余白、最小size、aspect維持、背景contrastを持つ。合成は代表出力の品質評価とProvider／post-process Capabilityを満たす場合だけ有効化する。精度不足時はロゴなし生成へ縮退し、粗い合成を強制しない。生成モデルへロゴを描き直させることを正確なロゴ再現として保証しない。

## 4. 参照画像解析・cache

ユーザーが指定したCMS Mediaまたは許可URLだけをREST等で取得して一時解析する。全Mediaを無断で走査しない。原画像を恒久複製せず、content／perceptual hash、Media参照、解析model／prompt version、Style Feature、権利・出典、失効条件を保持する。

Pattern Editorの修正、Style Feature選択、正規化prompt fragmentはcacheできるため、設定調整自体では画像生成費用を発生させない。実画像のテスト生成と記事用生成だけを有償Image Jobとする。同一Pattern version＋同一記事入力＋同一size等の二重送信を冪等化するが、ユーザーが明示した再生成は新Job・新credit消費とする。サービス障害による同一成果の再開は再課金しない。

## 5. Aggregateと状態

Pattern、画像生成Job、CMS Media登録を一つの状態機械にしない。Patternは複数記事から再利用され、画像Jobと同時に進行しない。

| Aggregate | 状態 |
|---|---|
| Featured Image Pattern | `draft → active → superseded / retired`。active版を直接変更せず、編集時は新しいdraft versionを作る |
| Image Generation Job | `estimated → reserved → generating → generated / failed → selected / rejected`。Automation Policyによる採用も判定主体とpolicy versionを残す |
| CMS Media Delivery | `pending → optimizing → media_registering → media_registered → featured_assigning → featured_assigned / failed` |

記事生成時は使用するPattern version、Profile version、記事slot、CMS sizeをfreezeする。後からSite既定Patternを改版しても進行中・完了済み画像の意味を上書きせず、次の生成から新versionを使う。ユーザー希望の再生成は元Jobを書き換えず、新しいImage Generation Jobとして見積・reserveする。

## 6. 生成・CMS登録

初期Provider routeは`gpt-image-2`をModel Registryから解決する。商品・PatternへProvider snapshotを固定せず、回帰評価後にrouteを改版する。

技術的不成立またはユーザー設定不一致だけを`blocked`とし、主観的な構図・トーン差は`advisory`とする。自動投稿時にadvisoryだけで過剰停止しない。

出力sizeはCMS Connection Profileが返すfeatured media／thumbnail要件だけを候補にする。画像本体を記事JSONへbase64で埋め込まず、Media API等へ別リクエストで登録し、Media ID／URL／派生sizeを記事へ参照設定する。アップロード失敗で本文生成・下書き成果を失わせない。

Media登録とfeatured media割当は別Commandとして冪等化する。同じcontent hash・Site・用途の再送でMediaを重複登録せず、既にMedia登録済みで割当だけ失敗した場合は割当から再開する。記事下書き、画像生成、Media登録のいずれかが失敗しても、完成済み成果を失わせたり別工程を完了扱いにしたりしない。

## 7. 画面

- Site既定Pattern一覧、既定指定、複製、version履歴、記事override
- canvas領域とslot、固定／可変、variation tolerance、ロゴ余白
- CMS対応sizeだけの選択
- wireframe previewは無料、GPT Image 2テスト生成前にcredit見積
- 生成結果の採用、却下、調整して再生成、Media登録状態
- `blocked`と`advisory`の区別
- Pattern version、採用主体、生成Credit確定、Media登録、featured media割当の別状態
- 進行中記事が使用中の版と、次回から適用される新しい既定版の区別

## 8. 根拠

`REQ-LOGIC-10`、`REQ-SCREEN-15/23`、`REQ-DATA-12`、`REQ-INT-07`、`REQ-COST-10`、`REQ-WPA-08/09`。
