# AI Office de SEO 要求追従・成果物台帳（2026-08-03）

## 1. 目的

要件更新に追従していない文書を「未定義事項」と誤認しないため、リポジトリ内の成果物を役割ごとに分類する。プロトタイプは要求・設計・契約の整合完了後に更新するため、本台帳では実装差分としてのみ管理する。

状態は次の4区分とする。

| 状態 | 意味 |
|---|---|
| `current` | 現行判断を表す正本または正本への接続文書 |
| `baseline` | 旧プロト・旧契約の事実を保存する移行用資料。現行要求の根拠にしない |
| `prototype_follow_up` | 要求・設計は確定済みで、プロト実装だけが未追従 |
| `true_open` | 既存判断から導出できず、設計・実測・外部検証・事業判断が本当に必要 |

## 2. 成果物群の分類

| 成果物群 | 対象 | 状態 | 現行の役割／判定 |
|---|---|---|---|
| L0 | `L0-charter/ai-office-de-seo-charter_v3.7.md`、`ai-office-de-seo-business-requirements_v1.md` | current | SEO運用代行システム、法人・個人、価格階段、AWS、CMS非依存、Feature Object、提供責任を定義 |
| L1分類正本 | `L1-requirements/categories/*.md` 16分類 | current | 分類ごとの要求本文とACの正本。READMEの責務分離に従う |
| L1ロジック詳細 | `L1-requirements/logic/*.md` 5文書 | current | 動的Recommendation、Summary、不足、品質・Repair、Crawler／AI可視性の判定詳細 |
| L1横断判断 | `requirements-decision-summary`、authorization、recommendation、keyword、report、patch、CMS、availability、image、notification、billingの各map | current | 会話で確定した横断判断と分類正本の接続境界 |
| 旧L1詳細要求 | product、navigation、agent runtime、Pack/Ticket、Keyword/GSC/Article、DataForSEO、WP、billing/provider、security/observability、rewrite、Agent Office、Admin、User Journey | current | 詳細仕様を保持するが、分類正本と矛盾する旧Role・旧価格・旧責務は移行mapを介して解決する。本文中の旧表現は順次除去対象 |
| 受入トレース | `ai-office-de-seo-acceptance-trace_v3.7.md` | current | 443 REQとcanonical ACを横断追跡する。旧ACの意味も現行判断へ更新する |
| 開発ロードマップ | `ai-office-de-seo-development-unit-roadmap_v3.7.md` | current | 現行SEO業務Lifecycleと商用成立条件に基づく構築順。コンサル必須・FAQ外出しの旧前提は廃止 |
| L2 | domain model、glossary | current | Site Build、Keyword Report、月次／週次計画、Recommendation、Publication Decision、評価、認可を集約・用語へ写像 |
| L3主要設計 | contract schemas、DDL、config registry、quality gate、decision table、AWS operations、handoff gate | current | 実装へ渡す契約・保存・設定・運用。`partial / missing / TODO(L3)`はtrue_open候補として管理 |
| Gate A | event、repository scope、office layout、design tokens、Ticket/Snapshot baseline | current | 現行監査中のdraft。旧「凍結」は解除し、監査後にversion固定する。A-5は互換baselineで、全契約正本ではない |
| 画面正本 | screen inventory、admin inventory、screen flow | current | 画面責務、通常／Office、管理面、Site導入から評価までの正規遷移 |
| UI設計補助 | UI parts catalog、prototype plan、prototype implementation map | current | 将来の実装変換と差分管理。現行認可・Lifecycleを参照する |
| 旧画面接続実測 | screen connection map | baseline | 2026-07-10プロトの実測。現行遷移の正本ではなく、追随作業時の差分入力 |
| 計画書 | `docs/plans/PLAN-L0-01`〜`PLAN-L3-02` | current | 各層の成果物とDoD。プロト更新は全要求・L2/L3・画面遷移の整合後 |
| review／audit資料 | `docs/reference/*review*`、`*audit*`、verification log | baseline | 当時の指摘と解消証拠。現在値の正本にはしない |
| open items | `ai-office-de-seo-open-items-register_2026-08-03.md` | current | true_open候補、後続機能、実測待ちを区別する作業台帳 |
| prototype modernization register | `ai-office-de-seo-prototype-modernization-register_2026-08-03.md` | prototype_follow_up | 現行要求との差分。要求監査が終わるまでプロト本体を変更しない |
| `prototype/` | DC HTML、support.js、config、Design、CLAUDE、asset refs | prototype_follow_up | 現行製品仕様の証拠に使わない。移行baselineとして保持 |
| 画像asset | `docs/reference/assets/**`、screen reference画像 | baseline | 視覚参照。画面責務・Agent数・業務仕様を決める正本ではない |

## 3. 追従完了の判定規則

1. 現行判断がL0、該当する分類別L1、詳細要求、L2、L3契約／DDL／設定／Event、画面責務／遷移、ACへ一方向に接続されている。
2. 同じ要求本文を複数分類へコピーせず、参照先を明記する。
3. 旧価格、旧Role、旧CMS専用設計、旧Office監視専用、コンサル必須、FAQ外出し、英語可読性基準等を現行値として使用しない。
4. `baseline`に旧値が残る場合、文書冒頭で正本ではないことと現行参照先を示す。
5. `true_open`は、既存回答の再質問、プロト未追従、旧文書の矛盾を含めない。
6. プロト更新は1〜5の監査完了後に別工程として行う。

## 4. 現在の監査状況

- REQ定義／coverage／AC traceの機械監査は通過している。
- 現行価格、契約周期、認可、AWS、CMS非依存、公開責任、15記事解放、月次／週次計画、1・3・6か月評価、FAQチャット、通常／Office同期を意味監査へ追加した。
- 画面遷移は新規Site／既存Siteの導入からRecommendation、制作・更新、CMS、公開判断、評価まで追従済みである。
- プロト本体は未編集であり、意図どおり`prototype_follow_up`に留めている。
- L3 Contract SchemasではTicket、未達Snapshot、Source欠損表現、13状態Workflow、Catalog型、Event payload、検証対応表を既存要求から補完した。DDLでは認可、URL、Snapshot／PostEnvelope一時保存、状態遷移、Config allowlistを補完した。
- 残る物理partition／圧縮／BigQuery境界、通知保持、k匿名・標本しきい値は、要求追従漏れではなく負荷・費用・法務・実データによる`DD-09/10`、`OC-08`として未確定台帳へ移した。
- 次の監査対象は、旧L1詳細本文に残る旧提供方針、L3 Quality／Configの未決分類、Gate Aと画面補助文書の参照整合である。
