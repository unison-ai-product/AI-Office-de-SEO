---
document_id: AOS-L1-LEGACY-REQUIREMENT-MIGRATION-MAP
title: AI Office de SEO 旧v3.7要求・分類別正本移行マップ
version: 1.0
layer: L1
kind: migration_map
status: current-draft
updated_at: 2026-08-03
---

# AI Office de SEO 旧v3.7要求・分類別正本移行マップ

## 1. 原則

旧IDは監査・詳細仕様の参照安定性のため一括改番しない。業務判断が分類別正本へ移った領域では分類別REQを優先し、旧文書に残る詳細は衝突しない範囲だけ有効とする。新規L2／L3は分類別REQと接続マップを根拠にし、旧IDだけを根拠に新しい横断判断を作らない。

`REQ-AGENT-*`と`REQ-PACK-*`は名称上はv3.7文書内にあるが、現行分類別要求が代替していないAgent実行・Ticket・Packの詳細正本である。これらを機械的に廃止対象へ含めない。それ以外の旧ID群は、本表の現行判断正本と併記して初めて新規L2／L3判断の根拠にできる。

## 2. ID群別の移行先

| 旧ID群 | 旧責務 | 現行判断の正本 | 旧詳細の扱い |
|---|---|---|---|
| `REQ-PRODUCT-*` | 製品全般、設定、通知、運用 | business、customer organization governance、security access、data、billing accounting、screen、platform administration、design | 詳細が残るが分類別判断と衝突時はsuperseded |
| `REQ-KGA-*` | Keyword／GSC／記事map | logic、data、business、Keyword Market／Report接続マップ | 数式・データ詳細は有効、業務flowは分類別正本 |
| `REQ-AGENT-*` | Executor、Workflow、状態機械 | Agent Runtime＋Agent Requirements Map | 現在も実行詳細の正本。分類別業務判断を入力として受ける |
| `REQ-PACK-*` | Pack、Ticket、Schema、Catalog | Pack/Ticket要求＋Agent Requirements Map | 現在も実行詳細の正本 |
| `REQ-WPA-*` | WP、Automation、計測 | integration、logic、business、screen、technical architecture、CMS Routing Map | WP Adapter詳細は有効、CMS共通判断は接続マップ優先 |
| `REQ-RWR-*` | Rewrite／Patch | business、logic、data、integration、Lightweight Patch Map | Rewrite実行詳細は有効、承認・評価は分類別正本 |
| `REQ-BILL-*` | Plan、credit、Provider原価 | `REQ-BILLING-*`、`REQ-COST-*`、integration、technical Provider routing（`REQ-TECH-10`）、Billing Capacity UI Map | 旧価格・商品条件は廃止。reserve等の未移行詳細だけ参照可 |
| `REQ-SEC-*` | security、budget、observability | security access、non-functional、measurement operations | 詳細controlは有効、顧客権限は現行認可modelへ移行 |
| `REQ-DUR-*` | 開発順、可用性、復旧 | non-functional、technical architecture、incident warranty、AWS Operations／Recovery Map（L3: `../L3-implementation/ai-office-de-seo-aws-operations-recovery-map_v1.md`） | Roadmap履歴は監査用。RPO/RTO等は分類別正本 |
| `REQ-ADM-*` | 内部管理、設定、監査 | platform administration、measurement operations、security access | 管理画面詳細は有効、顧客面と分離 |
| `REQ-AOUI-*` | Office UI | design experience、screen operation、Agent Office UI | 通常ビューはRecommendation中心の簡単操作、Officeは玄人向け詳細分析・運用・Agent操作。同じProjection・Commandを使用する |
| `REQ-NAV-*`／`REQ-UJ-*` | Navigation／Journey | screen operation、design experience、business lifecycle | アクセシビリティ・遷移詳細は有効、業務順はLifecycle優先 |
| `REQ-SRC-*` | 外部Source／Crawler | integration、cost、technical architecture | Source詳細は有効、販売範囲は分類別正本 |

## 3. 下流参照規則

1. L2集約は分類別REQを最低1件根拠に持ち、必要な旧詳細IDを併記する。
2. L3 Schema、DDL、Event、画面、PTは、分類別REQまたは接続マップ→旧詳細の順で辿れるようにする。
3. 旧値をfixtureへ残す場合は`legacy/superseded`を付け、現行Catalogへ昇格させない。
4. 同一本文を分類別文書へコピーせず、接続マップまたは旧詳細IDを参照する。
5. 移行済みの旧文書には冒頭で現行正本を示し、移行未完の詳細範囲を限定する。

## 4. 完了条件

- 新規実装の根拠が旧IDだけになっていない。
- 旧価格、旧Role、一律承認、Office内の成果分析・詳細設定、WP専用内部設計が現行fixtureへ入らない。
- 旧詳細を削除する場合も、Trace、Contract、testから参照されていないことをCIで確認する。
