---
document_id: AOS-PRE-L3-FEATURED-IMAGE-PATTERN-UI-VALIDATION
title: アイキャッチPattern・画像生成・Media登録 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# アイキャッチPattern・画像生成・Media登録 画面検証仕様

## 1. 検証目的

初期リリースを、生成前のFeatured Image Pattern設定、アイキャッチ生成、最適化、CMS Media登録、featured media割当に限定する。画像編集操作のたびにLLM・画像Providerを呼ばず、Pattern版、Image Job、Media Delivery、記事制作を別状態として確認できる画面にする。

## 2. 情報構造

### 2.1 Site既定

Pattern一覧、active版、draft版、廃止版、Style Profile、CMS対応size、記事override数を表示する。active版の編集は新draft versionを作り、保存だけでは既定版を差し替えない。active化時に適用範囲を「次回生成から」と明示し、進行中Jobを変更しない。

### 2.2 Pattern Editor

背景、被写体、文字、ロゴ、余白、安全領域、レイヤー、固定・可変slotをcanvasで扱う。配置、size、表示、並替、複製、undo／redo、wireframeは決定論処理とする。記事タイトル、カテゴリー、キーワード等のslotへfixture値を入れてoverflowを検査する。

variation toleranceは固定・制御・自由度高とし、制御型では変更可能属性と範囲を示す。ロゴはassetを描き直さず、配置領域、外周余白、最小size、aspect、contrastを検査する。合成Capabilityまたは代表品質が不足する場合はロゴなしを選べる状態へ縮退する。

### 2.3 生成と採用

テスト生成と記事用生成の前にPattern version、Profile version、CMS size、quality、生成数、予測Creditを示す。生成後は採用、却下、調整して別Jobを生成、記事画像なしを選べる。ユーザー明示の再生成は新しい見積・reserveを作り、Provider障害の再試行は元Jobへ帰属する。

Automationでは承認済みPatternとpolicy versionを使って採否を記録する。技術的不成立・必須素材欠落・禁止要素一致は停止、主観的差異はadvisoryとし、人物・商品等の分類だけで追加承認を要求しない。

### 2.4 Media登録

生成、採用、最適化、Media登録、Media ID／URL取得、featured media割当を分ける。画像本体を記事payloadへ埋め込まない。同じSite・content hash・用途ではMedia登録を冪等化し、割当だけ失敗した場合は割当から再開する。画像失敗で本文成果を失わせず、画像なし継続または画像工程だけの再開をPolicyに従って選ぶ。

## 3. Release境界

本文中画像、見出し別配置、SNS・広告size、stock画像連携、WordPress内画像編集は「後続提供」とし、初期画面で実行可能に見せない。CMSが返したfeatured media／thumbnail sizeだけを候補表示する。

## 4. 3秒表示

一覧、Editor外枠、Job詳細、Media状態を先に表示し、P95 3秒以内に判断可能状態へ到達させる。実画像、参照画像、version履歴は遅延読込し、画像の読込失敗で設定値・状態・操作を隠さない。

## 5. 検証fixture

| ID | 検証内容 |
|---|---|
| IMG-UI-01 | 初期画面にアイキャッチだけを実行可能表示する |
| IMG-UI-02 | 本文中画像を後続提供として分離する |
| IMG-UI-03 | CMS対応sizeだけを候補にする |
| IMG-UI-04 | SNS・広告sizeを追加しない |
| IMG-UI-05 | Site既定Patternと記事overrideを分ける |
| IMG-UI-06 | active Pattern編集で新draft versionを作る |
| IMG-UI-07 | draft保存だけで既定を変更しない |
| IMG-UI-08 | active化は次回生成から適用する |
| IMG-UI-09 | 進行中JobのPattern versionを維持する |
| IMG-UI-10 | 背景・被写体・文字・ロゴ領域を編集できる |
| IMG-UI-11 | slotの固定・可変を区別する |
| IMG-UI-12 | fixture文字列でoverflowを検査する |
| IMG-UI-13 | undo／redoで画像Providerを呼ばない |
| IMG-UI-14 | wireframe previewでCreditを消費しない |
| IMG-UI-15 | fixedで構図・領域・paletteを固定する |
| IMG-UI-16 | controlledで変更属性と範囲を指定する |
| IMG-UI-17 | creativeでも固定・禁止・ブランド条件を守る |
| IMG-UI-18 | ロゴassetのaspectと余白を検査する |
| IMG-UI-19 | 合成品質不足時にロゴなしへ縮退できる |
| IMG-UI-20 | 生成モデルの描画を正確なロゴ再現と表示しない |
| IMG-UI-21 | 参照画像を指定Media／許可URLに限定する |
| IMG-UI-22 | Style Featureを個別採用・除外できる |
| IMG-UI-23 | Pattern編集と画像生成を別操作にする |
| IMG-UI-24 | テスト生成前に予測Creditを表示する |
| IMG-UI-25 | 記事用生成前にfreeze入力を表示する |
| IMG-UI-26 | 同一requestの二重送信を一Jobにする |
| IMG-UI-27 | ユーザー再生成を新Job・新Creditとして確認する |
| IMG-UI-28 | Provider障害再試行で再課金しない |
| IMG-UI-29 | 採用と却下を別結果として保存する |
| IMG-UI-30 | Automation採用にpolicy versionを残す |
| IMG-UI-31 | advisoryだけで自動投稿を停止しない |
| IMG-UI-32 | 技術的不成立と設定不一致を停止理由にする |
| IMG-UI-33 | 人物・商品分類だけで追加承認を要求しない |
| IMG-UI-34 | 最適化、Media登録、featured割当を別状態で示す |
| IMG-UI-35 | 記事payloadへ画像本体を埋め込まない |
| IMG-UI-36 | 同じcontent hashのMedia二重登録を防ぐ |
| IMG-UI-37 | 割当失敗時にMedia登録からやり直さない |
| IMG-UI-38 | 画像失敗時も本文成果を維持する |
| IMG-UI-39 | 実画像遅延中も3秒以内に設定・状態を表示する |
| IMG-UI-40 | 通常ビューとOfficeで同じPattern・Job・Media状態を使う |

## 6. Finding

検証結果は`SF-UI-15`へ記録する。意味変更は`REQ-SCREEN-15/23`、`REQ-LOGIC-10`、Featured Image Pattern接続マップ、`INV-IMAGE-UI-001`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。
