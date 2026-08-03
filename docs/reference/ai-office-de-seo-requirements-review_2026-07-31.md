# 要求ファイルレビュー 2026-07-31

> **履歴スナップショット**: 件数、未解消指摘、ファイル数、正本関係は2026-07-31時点の監査結果である。後続修正後の現在値として使用しない。指摘の解消状態は本書§「解消状態」、現在の全量値は要求監査スクリプト、現行の未確定事項はOpen Items Registerを参照する。元の指摘本文は監査証拠として保持する。

## 対象・方法

対象は `docs/design/ai-office-de-seo/` 配下の全61 markdown文書（L0企画書・ビジネス要求、L1要求16分類＋詳細ロジック4件＋既存v3.7要求12件＋受入条件トレース、L2ドメイン、L3実装・UI台帳）。

方法は次の2段構え。

1. **機械検査**: REQ定義417件・AC定義482件を抽出し、ID重複、定義なし参照、正本パス到達性、検証欄欠落、AC本文の正本↔トレース一致、REQ被検証カバレッジ、番号連続性、frontmatter必須項目を全量照合。
2. **意味照合**: 分類別L1正本の全AC-L1-*（240件）について、トレースの `検証` 欄が指すREQのセクション本文を読み、ACが主張する内容と検証先が実際に対応しているかを1件ずつ突合。加えて横断数値（価格、契約期間、credit有効期限、RPO/RTO、原価率、しきい値）を文書間でクロスチェック。

---

## サマリー

| 区分 | 件数 | 概要 |
|---|---|---|
| Critical | 3 | トレース検証欄の誤対応39件、ロジック要求1文書のトレース断絶、L0↔L1の課金条件衝突5点 |
| Important | 7 | RPO/RTO二重定義、REQ-PACK-11サブID未宣言、AC本文不一致、欠番の記録なし、CI未実装ほか |
| Minor | 5 | 見出し規約の二系統、frontmatter欠落、README記載の旧プラン名ほか |

構造面の健全性は高い。**REQ定義417件でID重複ゼロ／正本パス参照切れゼロ／検証欄欠落ゼロ**、AC本文の正本↔トレース一致は240件中239件。壊れているのは「IDの張り方」ではなく「IDの指し先」である。

## 2026-08-03 解消状況

本節を本レビュー指摘の状態正本とする。元の指摘本文は監査履歴として変更しない。

| ID | 状態 | 解消根拠／残件 |
|---|---|---|
| C1 | resolved | AC検証先を振り直し、要求監査が全REQ被覆・重複なし・参照切れなしで通過する。現行結果は443 REQ、443 covered REQ。 |
| C2 | resolved | KRL受入条件を現行prefixで横断Traceへ収録し、未被覆REQを解消。 |
| C3 | resolved | L0冒頭と旧価格章へ廃止済み移行注記を追加し、`REQ-BILLING-01/02/03/16`を現行正本として明記。 |
| I1 | resolved | RPO 1時間／RTO 4時間へ一本化し、AWS Operations Recovery Mapと復元演習へ接続。旧24時間／8時間例示は現行資料から撤去。 |
| I2 | resolved | `REQ-PACK-11.1〜11.7`を各見出しへ宣言。監査対象として解決可能。 |
| I3 | resolved | Design AC本文を正本へ同期し、狭幅で非対応操作を対応済みと誤表示しない条件を維持。 |
| I4 | resolved | Trace §0.1に`AC-SEC-08〜10`、`AC-WPA-01〜07`、`AC-AOUI-05/06`を予約欠番・再利用禁止として記録。 |
| I5 | resolved | `scripts/audit-requirements.mjs`と`.github/workflows/requirements-audit.yml`を追加し、正本／Trace、複数REQ、参照、被覆をCI検査。 |
| I6 | accepted_migration_debt | `REQ-BILLING-*`を現行正本、`REQ-BILL-*`を旧詳細・移行未完IDとして明示。下流新規参照は禁止するが、監査履歴と旧詳細のIDは破壊改番しない。完全移行台帳は継続対象。 |
| I7 | resolved | `REQ-KGA-22`、`REQ-WPA-14`を含め全443 REQが受入条件へ接続済み。 |
| M1 | accepted_migration_debt | パーサは両見出し形式を検査可能。既存IDの一括整形は差分リスクが高いため、新規は見出し式、旧埋込式は改版時移行とする。 |
| M2 | resolved | L0 business requirementsとGate A全Markdownへ共通frontmatterを補完。 |
| M3 | resolved | リポジトリ入口の現行Plan表現をEntry／Standard／Premium／Enterpriseへ更新。 |
| M4 | resolved | L0を「初期主検証CMSはWordPress、内部はCMS非依存Publication Contract／Adapter」と修正。 |
| M5 | resolved | Decision Summary §15へ原価350円、決済4.3%、credit180日、Dunning 14日／8回、RPO／RTOを計測方法・設定箇所・確定時期付きで登録。 |

`accepted_migration_debt`は要求不明ではなく、正本順位と新規利用禁止が確定した移行債務を表す。完了と誤表示せず、旧ID／旧見出しを触る変更時に解消する。

---

## Critical

### C1. 受入条件トレースの `検証` 欄が約39件で誤ったREQを指す

分類別L1正本5文書で、AC-L1-*の検証先が実際の要求と対応していない。

| 正本 | 誤対応 | 内訳 |
|---|---|---|
| `categories/cost-requirements_v1.md` | 10 / 12 | AC-01〜10が1つずれ |
| `categories/incident-warranty-requirements_v1.md` | 10 / 11 | AC-01〜06・08・09が1つずれ、10・11は全REQ列挙 |
| `categories/growth-upsell-requirements_v1.md` | 7 / 11 | AC-01〜05・07がずれ、10は全REQ列挙 |
| `categories/business-requirements_v1.md` | 8 / 13 | AC-02・04・06・08〜12 |
| `categories/customer-organization-governance-requirements_v1.md` | 4 / 12 | AC-08〜11が1つずれ |

代表例。

- `AC-L1-COST-05`「soft/hard limitとKill Switchが追加費用発生前に機能する」 → 検証先は `REQ-COST-05`「5. 実績精算」。正しくは `REQ-COST-06`「6. 予算と停止」。
- `AC-L1-COST-10`「商品・プラン別粗利を実績原価から算出できる」 → 検証先は `REQ-COST-10`「9.1 画像生成原価」。正しくは `REQ-COST-09`「9. 原価KPI」。
- `AC-L1-IRG-01`「障害をSEV-1〜4へ一貫した基準で分類できる」 → 検証先は `REQ-IRG-01`「1. 責務」。正しくは `REQ-IRG-02`「2. 障害分類」。
- `AC-L1-UPSELL-01`「提案がcapacity/execution/governance/support/economic fitへ分解される」 → 検証先は `REQ-UPSELL-01`「1. 責務」。これらの成分は `REQ-UPSELL-04`「4. 判定ロジック」で定義されている。
- `AC-L1-BUS-09`「新規Siteの新規記事15件まで個別承認され…」 → 検証先は `REQ-BUS-09`「公開ページの更新・改善」。15記事承認は `REQ-BUS-02`「Site導入」と `REQ-BUS-08`「新規記事制作・公開」で定義されている。
- `AC-L1-ORG-11`「Ownerが権限棚卸しを実行し、是正履歴を確認できる」 → 検証先は `REQ-ORG-11`「組織変更の安全性」。棚卸しは `REQ-ORG-12`「監査と棚卸し」。

**根本原因**: cost / growth-upsell / incident-warranty の3文書だけが `## 1. 責務 ［REQ-X-01］` の埋込式で**責務セクションにREQ-IDを付与**している（他13文書は `### REQ-X-01 <章題>` 形式で責務にIDを振らない）。この3文書でACを01から振ると、AC-01が「責務」に、以降が全て1つ後ろへずれる。BUS・ORGは規約は同じだが個別の割当ミス。

`L1-requirements/README.md` §3 は「REQとACは1対1を必須としない。…番号一致だけで対応を推測しない」と明文で禁じており、そこが守られていない。

**影響**: トレース §0 が「下流（L3要件・L8〜L14テスト設計）は、AC-IDとREQ-IDを安定キーとして双方向に辿る」と規定しているため、この状態でテスト設計へ進むと約16%のACが無関係な要求へ紐づく。さらに副作用として次の2要求が実質未検証になっている。

- `REQ-IRG-03`「検知と起票」— incident recordの必須フィールド、alert storm集約を検証するACが存在しない。
- `REQ-ORG-08`「情報可視性」— 部門・ブランド間非公開、External Memberの可視範囲を検証するACが存在しない。

**修正方針**: (a) 3文書の責務セクションからREQ-IDを外す（または`REQ-X-00`へ退避）か、他13文書へ規約統一する。(b) 39件の検証欄を本文突合で振り直す。(c) 上記2要求へACを追加する。

---

### C2. `logic/keyword-dynamic-recommendation-logic-requirements_v1.md` がトレース体系から断絶

- `AC-KRL-01`〜`AC-KRL-16`（16件）が横断一覧 `ai-office-de-seo-acceptance-trace_v3.7.md` に**1件も掲載されていない**。他の詳細ロジック3文書（ASUM / KPD / CQR）は全件掲載済み。
- 結果として `REQ-KRL-01`〜`REQ-KRL-10`（10件）が、トレース上どのACからも検証されていない。全REQ417件のうち未検証は12件で、そのうち10件がこの1文書に集中している。
- ID命名も逸脱している。README §3 は「分類別L1正本の受入条件は `AC-L1-{領域}-{番号}`」「世代を示さないIDを分類別正本へ新設しない」と規定するが、本文書は `AC-KRL-*` を使用。同格の3文書は `AC-L1-ASUM` / `AC-L1-KPD` / `AC-L1-CQR` を使っており、本文書だけ不整合。

この文書はキーワード動的レコメンドという製品の中核ロジック（市場実現性、戦略配分、動的優先度、行動決定）を担っており、未接続のまま下流へ渡すと中核ロジックのテスト設計が抜ける。

**修正方針**: `AC-KRL-*` を `AC-L1-KRL-*` へ改番し、16件を検証REQ・正本パス付きでトレースへ追記する。

---

### C3. L0ビジネス要求 v1.0 が L1 課金・会計要求 v1.3 と5点で衝突し、L0側に廃止マーカーがない

`L0-charter/ai-office-de-seo-business-requirements_v1.md`（2026-07-13、status: approved_with_assumptions）が保持する `MUST` が、`categories/billing-accounting-requirements_v1.md`（v1.3、2026-07-31）の現行決定と正面から矛盾する。

| 項目 | L0（MUST） | L1 現行 |
|---|---|---|
| システムプラン価格 | エントリー68,000／スタンダード128,000／プライム198,000／エンタープライズ298,000円 | Entry 39,800／Standard 98,000／Premium 198,000／Enterprise 398,000円〜 |
| 最低契約期間 | 通常6か月（BR-PRC-008） | Entry・Standardは1か月単位。Premium・Enterpriseは12か月のみ |
| 月額付与creditの繰越 | 翌月まで繰越可能、保有上限は月次付与量の150%（BR-PRC-006） | 当該請求期間末に失効（繰越なし） |
| 追加購入creditの期限 | 購入月を含む3か月（BR-PRC-007） | 購入から180日 |
| 同一期限lotの消費順 | プロモーション→月額付与→追加購入（BR-PRC-019） | 付与時刻順 |

同じ旧プラン名・旧価格を持つ `ai-office-de-seo-billing-credit-provider-requirements_v3.7.md` §10.1 には「**旧初期商用設定値（廃止済み参考値）**」「本節の価格、プラン名、付与クレジット、品質倍率および契約条件は…販売条件・実装条件として使用してはならない」という明示的な移行注記がある。**L0側には同等の注記がない**。

L0はL1の上位層であり、README の読み順でもL1より前に置かれている（「2. L0 ビジネス要求 — 商品、価格、収益、販売条件」）。実装者・営業がL0を正本として読む経路が生きているため、廃止済み条件が採用されるリスクがある。

L0 §1 には「料金・係数の実行時正本は `REQ-BILL-10` の Pricing Configuration とし、本書の金額は承認対象の初期商用設定値である」という逃げ道があるが、(a) `REQ-BILL-10` は旧IDで、現行正本は `REQ-BILLING-01` である（I6参照）、(b) 契約期間・繰越・消費順は「料金・係数」ではないため逃げ道の射程外、という2点で機能していない。

**修正方針**: L0 §3の該当行へ v3.7 §10.1 と同じ移行注記を付け、現行正本（`REQ-BILLING-01`〜`03`）への参照を張る。または該当BR-IDを改訂して現行値へ合わせる。

---

## Important

### I1. RPO/RTO の初期目標が2つ併存し、どちらが有効か決定不能

- `categories/incident-warranty-requirements_v1.md`:56 — 「正本データは初期内部目標**RPO 1時間、RTO 4時間**で復旧可能にする」
- `ai-office-de-seo-development-unit-roadmap_v3.7.md`:171 — 「例示: **RPO≦24h/RTO≦8h** から開始し実測で締める」

24倍・2倍の差があり、どちらも「初期目標」と書かれている。`L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md` D-21「RPO/RTO実数の確定」は `open` のまま。決定サマリー §13 は前者のみを記載しており、ロードマップ側の例示が更新されずに残った形。バックアップ設計（日次フル＋WAL）はRPO 1時間を満たさない可能性があるため、実装判断に直結する。

### I2. `REQ-PACK-11.1`〜`.7` がどの見出しにも宣言されていない

トレース §0 は「`REQ-PACK-11` は `REQ-PACK-11.1`〜`REQ-PACK-11.7` のドット付きサブセクションIDを持つ（ID文法の登録済み例外）。監査・照合ツールはドット付きサブIDを解析対象に含めること」と明記している。しかし `ai-office-de-seo-pack-ticket-schema-requirements_v3.7.md` の該当見出しは `### 11.1 catalog.article_type.*（記事タイプ）` 等で、`［REQ-PACK-11.x］` の注記がない。

そのため `REQ-PACK-11.1 / .2 / .3 / .6 / .7` は以下から参照されているのに定義解決できない。

- `L1-requirements/ai-office-de-seo-keyword-gsc-article-map-requirements_v3.7.md`:345
- `L1-requirements/ai-office-de-seo-agent-runtime-requirements_v3.7.md`:56, 254
- `L1-requirements/ai-office-de-seo-pack-ticket-schema-requirements_v3.7.md`:399, 417
- `L3-implementation/ai-office-de-seo-contract-schemas_v3.7.md`:18, 28, 44
- `L3-implementation/ai-office-de-seo-handoff-gate_v3.7.md`:33
- `L3-implementation/ai-office-de-seo-l3-decision-table_v3.7.md`:21
- `L3-implementation/gate-a/gate-a-5-contract-freeze_v1.md`:31

トレース §0 が「v3.7.23の教訓と同型の解析漏れを防ぐ」ために書かれた注意書きである以上、見出し側にIDを付けて宣言を完結させるのが筋。

### I3. `AC-L1-DESIGN-04` の本文が正本とトレースで食い違い、条件が弱まっている

- 正本 `categories/design-experience-requirements_v1.md`:101 — 「desktopの主要操作がkeyboard、screen reader、reduced motionで完了でき、**狭幅でも重要状態を失わず、初期mobile非対応範囲を誤表示しない**。」
- トレース:444 — 「主要操作が**狭幅**、keyboard、screen reader、reduced motionで**完了できる**。」

トレース版は「狭幅で主要操作が完了できる」と読めるため、正本の「初期はmobile非対応で、非対応範囲を誤表示しない」という方針と逆向きに解釈されうる。240件中唯一の本文不一致であり、同期精度自体は極めて高い。

### I4. AC番号の欠番が記録なしで存在する

`AC-SEC-08/09/10`、`AC-WPA-01〜07`、`AC-AOUI-05/06` が欠番。トレース §0 は「世代の異なるACへ同一IDを割り当てない」とID再利用を禁じているが、廃止台帳がないため**「廃止済みで再利用禁止」なのか「単に抜け落ちた」のかを読み手が判別できない**。特に `AC-WPA` は01〜07が存在せず08〜11のみで、`AC-WPA-10` が `REQ-WPA-01` を検証しているなど番号と対象の対応も崩れている。欠番一覧を §0 へ明記するか、廃止記録を残すべき。

### I5. README §3 が要求する整合CIが未実装

README §3 は「分類別正本のAC追加・変更時は同一変更で横断一覧を更新し、**CIで欠落・重複・参照切れを検査する**」と規定するが、`.github/` は存在せずCIはない。C2（16件の掲載漏れ）とI3（本文不一致）はこの検査があれば機械的に検出できた種類の欠陥である。

唯一の関連ツール `scripts/build-requirements-sheet-sync.mjs` は**未コミット（untracked）**で、かつ次の2つの穴がある。

- `sources` に16分類＋KW推薦ロジックの17件しか登録されておらず、`logic/` 配下の残り3文書（article-summary / keyword-portfolio / content-quality）が対象外。
- AC→REQの抽出正規表現が `検証:\s*(REQ-[A-Z0-9-]+)` で**先頭1件しか取らない**。複数REQを検証するAC（`AC-L1-ASUM-01`、`AC-L1-CQR-03` 等）で対応が落ちる。

### I6. REQ-ID命名が二重系（`REQ-BILL-*` / `REQ-BILLING-*`）

v3.7課金文書が `REQ-BILL-01`〜`11`、分類別v1が `REQ-BILLING-01`〜`16` を使用。両者は同一ドメインで内容も重なるため、参照時に取り違えやすい。実際にL0 §1が「実行時正本は `REQ-BILL-10`」と旧ID側を指しており、C3の逃げ道が機能しない一因になっている。移行完了までは併存する設計と理解できるが、README §6 の移行方針にID系の扱いを明記しておきたい。

### I7. ACのない要求が2件（C2の10件を除く）

- `REQ-KGA-22`「ローカルSEO（地域検索最適化）」 — 地域別のローカルパック／地図／自然検索の分離表示を定義しているが検証ACなし。画面台帳 S2「順位モニタリング」へ移設済みの機能。
- `REQ-WPA-14`「成果物の一時保持（Output Vault）とWP送信フェイルセーフ」 — 画面台帳に「生成履歴（Output Vault）タブ」として実装計画があるのに検証ACなし。送信失敗時の成果物保全という失うと痛い性質の要求。

---

## Minor

### M1. REQセクションの見出し規約が2系統

埋込式 `## N. 章題 ［REQ-X-NN］`（cost / growth-upsell / incident-warranty の3件）と、見出し式 `### REQ-X-NN 章題`（残り13件）が混在。C1の根本原因であり、パーサも両対応が必要になっている。見出し式へ統一するのが望ましい。

### M2. frontmatter の欠落

- `L0-charter/ai-office-de-seo-business-requirements_v1.md`: `document_id` / `version` / `layer` / `kind` / `updated_at` がない。他の全L0・L1文書は保持しており、この文書だけ `title` / `status` / `source` / `source_date` / `defined_at` という独自スキーマ。`document_id` がないため他文書からの機械参照ができない。
- `L3-implementation/gate-a/gate-a-1〜5_v1.md`（5件）: `version` / `kind` がない。
- `L3-implementation/gate-a/GATE-A-README.md`: frontmatter自体がない。

### M3. リポジトリ入口の README.md が廃止済みプラン名を掲載

`README.md`:17 — 「二層課金: システム利用料（プラン4種: **エントリー/スタンダード/プライム/エンタープライズ**）」。現行は Entry / Standard / Premium / Enterprise。最初に読まれる箇所であり、C3と同じ誤解経路になる。

### M4. プロダクト位置づけの表現が層間で不一致

- `L0-charter/ai-office-de-seo-charter_v3.7.md` §1 — 「**WordPressサイト向けの**SEOコンテンツ運用SaaSである」
- 決定サマリー §2 / `categories/technical-architecture-requirements_v1.md` — 「WordPress専用品として内部設計せず、CMS非依存のPublication Contractを持つ。初期AdapterはWordPress」

初期スコープの説明と設計方針の差と読めるが、L0の一文だけを見ると設計境界を誤読させる。L0側に「初期対応CMSはWordPress、内部はCMS非依存」の一句を補いたい。

### M5. 決定サマリー §15「未確定事項」が本文の仮置き値を捕捉できていない

§16 は「『要調整』は要求未定義を意味せず、**計測方法、設定箇所、確定時期を持たなければならない**」と規定する。しかし §15 の登録は1項目（プラン別利用枠・品質別クレジット単価・バックアップ容量）のみで、本文中の次の仮置き値は登録されていない。

- 記事生成1件当たり提供原価 約350円（`categories/cost-requirements_v1.md` §4「仮置き」）
- 決済原価 4.3%（同 §2、`REQ-BILLING-02` とも「仮置き」）
- 追加購入credit 180日（`REQ-BILLING-03`「初期方針」・法務確認前）
- 支払失敗の再試行 14日間・最大8回（「初期値」）
- RPO 1時間 / RTO 4時間（I1のとおり二重定義かつ D-21 open）

いずれも販売開始前に確定が必要な値であり、§15へ計測方法・設定箇所・確定時期付きで登録すれば I1 のような取り残しを防げる。

---

## 良い点

公平に見て、この規模（要求417件・受入条件482件・61文書）での整合水準は高い。

- **AC本文の同期精度**: 分類別正本とトレースで240件を照合し、不一致は1件のみ（I3）。手作業でこの水準を維持しているのは相当な規律。
- **ID体系の健全性**: REQ定義417件で重複ゼロ。トレースの `検証` 欄が指すREQの未定義ゼロ、`正本` パスの参照切れゼロ、検証欄の欠落ゼロ。壊れているのは指し先の妥当性だけで、骨格は無傷。
- **カバレッジ**: 未検証REQは12/417（2.9%）。うち10件はC2の1文書に集中しており、その1文書を繋げば0.5%になる。
- **移行管理**: v3.7課金文書の「分類別正本への移行」節と §10.1 の廃止注記は、旧値を消さずに監査用途と実装用途を分離するという良い形。同じ処理をL0へ適用すればC3は解消する（C3の指摘は「その良い運用がL0に及んでいない」という趣旨）。
- **分類境界の明文化と遵守**: README §3 の境界規則（原価と請求、障害と通常運用、顧客組織と運営組織、UI制御と認可、技術方針と詳細設計）は宣言だけで終わらず、各文書が実際に守っている。`cost-requirements` が請求を語らず、`billing-accounting` が原価を `cost-requirements` へ委ねている等、境界侵犯は見つからなかった。
- **記述可能性の水準**: 詳細ロジック4文書は入力・前提・正規化・判定式・状態・例外・出力・再計算・受入条件という枠を実際に埋めており、しきい値（drift share 30%、query被覆率50%、既知重み60%）も具体値で書かれている。実装可能な粒度に達している。

---

## 推奨アクション（優先順）

1. **C1の検証欄振り直し**（39件）。同時にM1の見出し規約統一を行えば再発しない。`REQ-IRG-03` / `REQ-ORG-08` のAC追加も併せて。
2. **C2のトレース接続**。`AC-KRL-*` → `AC-L1-KRL-*` 改番と16件のトレース追記。
3. **C3のL0注記**。v3.7 §10.1と同型の移行注記をL0 §3・§5へ追加、または該当BR-IDの改訂。あわせてM3のREADME修正。
4. **I5のCI導入**。最低限、(a) 正本↔トレースのAC集合差分、(b) AC本文一致、(c) `検証` REQの定義存在、(d) `正本` パス到達性、(e) 複数REQ対応の抽出。今回の検査スクリプトはこの5点を実装済みなので、`scripts/` へコミットしてCIから呼ぶだけで足りる。
5. **I1のRPO/RTO一本化**、**I2のサブID宣言**、**I3の本文同期**、**I4の欠番記録**。
6. M2・M4・M5・I6・I7 は次回の文書更新タイミングでまとめて。

---

## 検査スクリプト

本レビューで使用した機械検査は次の4本（セッション作業領域に生成、リポジトリ未追加）。

| 用途 | 内容 |
|---|---|
| `audit.mjs` | ID重複、未定義参照、AC集合差分、正本パス、番号連続性、frontmatter |
| `map.mjs` | AC-L1-* と検証先REQのセクション見出しを対にして出力（意味照合用） |
| `coverage.mjs` | ACから検証されていないREQの列挙 |
| `textdiff.mjs` | 正本↔トレースのAC本文照合 |

I5の対応時にリポジトリへ取り込む場合は、`scripts/build-requirements-sheet-sync.mjs` のパーサ（埋込式・見出し式の両対応、frontmatter解析）が再利用できる。
