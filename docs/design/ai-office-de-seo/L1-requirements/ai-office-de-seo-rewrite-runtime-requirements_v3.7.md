---
document_id: AOS-L1-REWRITE-RUNTIME
title: AI Office de SEO リライト・パッチランタイム要求 v3.7
version: 3.7
layer: L1
kind: design
status: draft
updated_at: 2026-07-01
related_plan: PLAN-L1-01-ai-office-de-seo-requirements
---

# AI Office de SEO リライト・パッチランタイム要求 v3.7

（正本: 旧 rewrite-patch-runtime / rewrite-cause-analysis-pack を v3.7 へ移植）

## 1. 位置づけ  ［REQ-RWR-01］

新規生成は `new_article_workflow`（`REQ-AGENT-09`）、リライトは `rewrite_patch`（別の状態機械）で行う。リライトは既存記事の部分修正であり、記事を一時ワークスペース化し、対象セクションへ限定パッチを適用し、diffプレビューと品質ゲートを通してWP下書きへ反映する。通常リライトのdefaultは `rewrite_patch`、`rewrite_full_regenerate` は明示承認または管理ポリシーがない限り実行しない。

## 2. Article-as-Code とワークスペース  ［REQ-RWR-02］

既存記事本文は恒久保存せず、一時ワークスペース上で編集する。ワークスペースは `tenant_id`/`site_id`/`job_id` に固定し、ジョブ完了・承認後・期限切れで破棄する（`REQ-SEC`）。Article Workspace Tool Server は次に限定する: `workspace.read/grep/list_sections/read_section/edit_section/apply_patch/diff/assert_unchanged/validate_blocks/validate_tables/validate_links/render_html/revert_patch/destroy`。任意Bash・任意WebSearch・任意外部URL取得・任意DB接続・他サイト記事読込・WPへの直接公開は禁止する。

## 3. Patch operation  ［REQ-RWR-03］

パッチはEdit Planに宣言された `section_id` の範囲内に限定する。許可: `rewrite_lead` / `rewrite_meta` / `replace_paragraphs` / `insert_paragraph_after` / `rewrite_h2_section` / `rewrite_faq_item` / `add_faq_item` / `adjust_cta_copy`（リンク先変更は別承認）/ `add_internal_link`（URLはArticle Data Server候補のみ）/ `fix_table_markup`（新規表はPremiumまたは承認付き）。禁止（未承認時）: 全文置換、H2大規模並び替え、CTA削除、外部リンク追加、canonical変更、WP公開、他記事本文を読み込んだ統合生成。

## 4. 差分プレビュー  ［REQ-RWR-04］

WP下書き前に差分をユーザーが確認できる。提示: リライト理由、対象URL、対象キーワード、該当GSCクエリ、変更対象セクション、変更前/後要約、title/meta差分、H2/H3差分、CTA差分、内部リンク差分、Quality Gate結果、予想消費credits、WP下書きURL、予約日時。

## 5. 品質ゲート（fail-close）  ［REQ-RWR-05］

次を検出したらfailする: Edit Planにないセクションの変更、未変更セクションのhash変化、Gutenbergブロックコメント破壊、未承認のCTAリンク変更、canonical変更、内部リンク候補以外のURL追加、表の1行潰れ、H2/H3階層破綻、FAQ構造破壊、禁止表現・法務NG・レギュレーション違反、本文変更率のモード上限超過、SiteSandboxContext外参照。監査ログに patch_id / section_id / operation / reason / quality result / cost / approved_by を残す。

## 6. リライト原因分析  ［REQ-RWR-06］

リライト対象と種別は、GSC実績（弱いクエリ・CTR・順位・CV導線）とカニバリ（`REQ-KGA-07`）から機械判定する（`REQ-KGA-08`）。Original Article Structure Pack（既存記事の構造）と Rewrite Cause Analysis Pack（原因）から、対象セクションと Rewrite Type を決める。強い部分は残し、弱い箇所だけ直す。

## 7. コスト・クレジット  ［REQ-RWR-07］

リライトも実行前にPreflight Estimateを算出し、クレジットを予約、成功時commit・失敗時release（`REQ-SEC`, `REQ-BILL`）。モード（patch / full_regenerate）で消費係数が異なる。

## 8. 好調記事の保護と波及  ［REQ-RWR-08］

- 好調判定と保護: 順位上昇・CV/エンゲージメント良好（`REQ-WPA-05`/`REQ-WPA-11`）の記事に**保護フラグ**を付し、リライト起動時に「好調につき変更は慎重に」の警告と変更範囲の限定（差分最小化）を既定にする。「上げればさらに成果が出るか／触ると危険か」の判断材料（好調要因ビュー: 流入クエリ・CVポイント・滞在/スクロール）を提示する。
- 波及: 好調記事へ到達する内部リンク導線の強化候補（周辺トピック・カテゴリからのリンク追加、`REQ-KGA-19`）を提案し、承認制の小リライトとして適用する。
- リライトブリーフ: リライト起動時に、落としたクエリ・追加キーワード候補（containment余剰・競合見出し差分 `REQ-SRC-03`）・AIO/引用状況・上位の狙いキーワードを1枚に集約して提示する（`REQ-RWR-06`の解析出力の提示形）。

## 9. フラッシュリライト（TDH: Title / Description / H1）  ［REQ-RWR-09］

本文を変更せず、タイトル・メタディスクリプション・H1のみを素早く差し替えてCTRを改善する軽量リライト。

- 候補選定（決定論、`REQ-KGA-08`）: 順位別期待CTR基線への**負残差**（`REQ-KGA-17`）が継続するページ。ただし `aio_suppressed` を切り分け、AIO起因のCTR低下はTDHで救えないため別扱いとして提示する。ウォッチリスト（`REQ-KGA-20`）・リライト候補（`REQ-RWR-06`）からも導線を持つ。
- 生成: 検索意図・主張軸（`REQ-PRODUCT-12`）・文字数規約に整合する複数案を提示し、ユーザー選択（full_autoは変更予算内で自動選択可）。釣り・誇大・詰め込みは deceptive_claim / keyword_stuffing ゲート配下（`REQ-PACK-09`）とし、タイトルと本文内容の乖離を整合検査する。
- 適用と費用: 部分パッチ（`REQ-WPA-12`）で本文非変更のまま適用する。低クレジットの軽量ジョブとしてinteractive即時実行可、複数一括はscheduled（`REQ-BILL-11`）。
- 効果測定: 前後CTR比較は**同順位帯での比較**とし、順位変動によるCTR変化と切り分ける（28日、`REQ-RWR-06`）。結果は施策台帳（`REQ-PRODUCT-19`）へ。
