---
document_id: AOS-L1-SCREEN-OPERATION-REQUIREMENTS
title: AI Office de SEO 画面・操作要求 v1.0
version: 1.0
layer: L1
kind: screen_operation_requirements
status: draft
updated_at: 2026-07-30
---

# AI Office de SEO 画面・操作要求

## 責務

画面の情報責務、表示状態、操作、入力、確認、遷移、権限別表示を定義する。

必須項目:

- 画面目的と対象Role
- 入力データと表示データ
- 通常、読込中、計算中、空、エラー、stale
- 作成、編集、採用、保留、却下、承認、取消
- 破壊的操作の確認
- レコメンド主導線と手動探索補助線
- 一覧上限、ページング、仮想化
- 画面間の文脈引き継ぎ

画面内で独自の業務判定・優先順位計算を行わない。ロジック要求の結果を表示する。

既存ソース: `ai-office-de-seo-navigation-ui-requirements_v3.7.md`、`ai-office-de-seo-agent-office-ui-requirements_v3.7.md`、L3画面台帳。

