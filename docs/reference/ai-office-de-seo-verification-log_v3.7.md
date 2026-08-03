---
document_id: AOS-REF-VERIFICATION-LOG
title: AI Office de SEO 外部事実 検証ログ v3.7
version: 3.7
kind: reference
status: living
updated_at: 2026-07-05
---

# 外部事実 検証ログ

要求が依拠する外部仕様・外部事実を、Web検索・一次情報で検証した記録。要求の当該箇所と対応づけ、変更されうる事実は再検証日を持つ。**要求書の実数はレジストリ/Cost Table優先の原則（REQ-BILL-10）は本ログの値にも適用される。**

## 検証済み（2026-07-02）

### GSC Search Analytics API 制約 → REQ-KGA-11
- 5万行/日/プロパティ/検索タイプ（クリック降順上位）、1リクエスト25,000行＋startRowページング、UI上限1,000行: **一次情報で確認**（Google Search Central Blog "Performance data deep dive"）。
- 匿名化クエリ: 数十ユーザー未満（2〜3か月間）のクエリはテーブル/APIから除外、チャート合計には包含（クエリフィルター適用時は除外）: **一次情報で確認**（同上）。
- Bulk Export（BigQuery）: 行数上限なし・**非遡及**（設定以降のみ）・匿名化クエリのメトリクス行を含む（クエリ文字列は非表示）・約2〜3日遅延: **確認**（Google発表2023/3＋複数実務ソースで一致）。
- Bulk Exportの匿名化クエリ（2026-07-04 一次情報で再検証・表現差を明記）: Google公式の**概要ページ/発表ブログ**は「匿名化クエリを除く（filtered out）」と表現するが、これは**クエリ文字列**の話であり、**テーブル仕様（table reference）が正**——匿名化クエリは `is_anonymized_query=true` のメトリクス行として**含まれ**、`query` フィールドはnull（site表では空文字列）になる。したがって集計totalは完全で、匿名化シェアは `is_anonymized_query` で正確に計測できる。REQ-KGA-11はこの意味論（メトリクス行あり・クエリ文字列なし・欠損を流入ゼロと誤判定しない）で記述し、「含む/含まない」の二値で断定しない。
- 判定: REQ-KGA-11の記述は正確。修正不要。

### GSCにおけるAIO/AI Modeの計上 → REQ-KGA-17（v3.7.9で反映）
- AIO/AI Modeのクリック・インプレッションはweb検索タイプへ**混合計上され、分離フィルターなし**（Google公式ヘルプ＋Google担当者言及で確認。「AIOフィルター」のスクリーンショットは偽物とMuellerが否定）。
- AIOは1ブロック＝1ポジション・全リンク同一position。インプレッションはスクロール/展開で表示された場合に計上（引用の可視性3階層により計測CTRに artefact が乗る）。同一URLがAIOと通常結果に併出しても1インプレッション（URL単位重複排除）。AI Modeは要素ごとに個別position・フォローアップは新クエリ扱い。Search Labs実験は非計上。（Google公式ヘルプ "What are impressions, position, and clicks?"）
- 計上方法は2025年に変更あり（AI由来クリックのweb計上開始）。**過去期間との比較は遷移期間を含む**。
- **2026-06-03: Search Console「Generative AI」レポート（Beta）登場**（知識カットオフ後の変化。複数ソース一致）: インプレッションのみ（ページ/国/デバイス/日付）。クリック・CTR・position・クエリ次元なし。AIO/AI Mode/Discover-AIをレポート内で分離不可。AI応答へのオプトアウトトグル併設。段階提供中。→ `source.gsc.ai_report.v1` として取り込み（availability付き）。
- AIOによるCTR低下の外部研究は38%減〜61%減など**幅が大きく方法論依存**。固定低下率を採用しない設計（自サイト残差較正、REQ-KGA-17）を維持。

### Anthropic Prompt Caching → REQ-AGENT-03 / REQ-BILL-06（v3.7.9で反映）
- 一次情報（platform.claude.com公式docs）: プレフィックスキャッシュ（tools→system→messages順・完全一致）、**ブレイクポイント最大4個**、既定TTL 5分（読み取り時無償リフレッシュ）／延長1時間（追加費用）、**1時間エントリは5分エントリより前方**の順序制約、最小キャッシュ長 約1,024トークン（モデル依存）、書き込みは**best-effortでヒット保証なし**、tool定義・tool_choice・画像有無・モデル切替で無効化、組織間（およびワークスペース間）でキャッシュ分離、本文は保存されずKV表現のみメモリ保持。
- 価格構造（公式時点の代表値・変更されうる）: 5分TTL書き込み=基本入力の1.25×、**1時間TTL書き込み=2×**、読み取り=0.10×。→ **ヒット率が低いと無キャッシュより高コスト**になりうる構造で、REQ-BILL-06のmiss上限予約・下限保護の設計は必須と裏付け。実数はCost Table（REQ-BILL-09）管理。
- Layer A/B/C/D（REQ-AGENT-03）＝ブレイクポイント4個と1:1対応可能。A/B=1時間TTL・C=5分TTL既定、Dは非キャッシュ、が仕様に整合。
- 明示ブレイクポイントと自動照合（2026-07-04追記）: キャッシュ境界は`cache_control`の**明示ブレイクポイント**で定義するのが正。プロバイダは明示ブレイクポイント以前のコンテンツブロック境界（直近約20ブロック）を**自動でヒット照合**するが、これはbest-effortの補助であり、本設計は明示4点（Layer A/B/C/D）に依存し自動ヒットを前提にしない（REQ-AGENT-03へ条件を追記）。
- キャッシュ価格乗数はBatch API割引等の他の価格修飾と**スタック可能**（公式docs明記）。バッチは非対話・長ターンアラウンドのため1時間TTLとの組合せが定石（実務ソース一致）。→ REQ-BILL-11のscheduledレーン既定（Batch×1hキャッシュ）の根拠。

## 未検証・継続監視（オープン項目）

注: 本節のオープン項目のowner・期限つき追跡は L3未決事項テーブル（AOS-L3-DECISION-TABLE）へ集約済み（v3.7.37）。本節は外部仕様の検証状態の記録として維持する。

- 日本語可読性指標: Flesch Reading Easeは英語基準。日本語代替（jReadability等）の妥当性・実装可能性は**未検証**。L3で調査・選定（AOS-L3-QUALITY-GATE-IMPL のTODOを維持。検証まで可読性ゲートはadvisoryのまま運用）。
- Generative AIレポートの提供範囲・API化: Beta段階提供のため、取得経路（UI/API/Bulk Export統合）は変わりうる。availability設計で吸収し、四半期ごとに再確認。
- Prompt Cacheの価格・TTL仕様: プロバイダ側で変更実績があるため（TTL既定の変動報告あり）、原価前提の較正時に公式docsを再確認する運用とする（REQ-BILL-06の監視項目）。
- URL検査系APIのクォータ実数・Google公式ランキング更新情報（Search Status等）の取得経路: **未検証**。REQ-KGA-20/21はクォータ配下・availability前提で設計済みのため実数はL3確認でCost Table/Configへ。
- AWS上の初期実行基盤、マネージドサービス境界、段階的スケール方式の選定（REQ-DUR-09）: **未確定**。VPS先行を前提にせずL3 ADRで選定する。
- メール送信プロバイダ選定・MQ移行トリガ実数（REQ-PRODUCT-21/REQ-DUR-07）: **未確定**。L3選定・計測でCost Table/Configへ。
- 埋め込みモデル・ベクトル索引方式の選定（REQ-PRODUCT-20）、テナント資源プロファイルとノード密度の実数（REQ-DUR-06）: **未計測**。L3の負荷試験・PoCで確定しConfig/Cost Tableへ。
- News/YouTube観測の取得経路: 既存要求REQ-SRC-01の列挙（YouTube検索/動画情報/字幕、Googleニュース）の範囲内で設計し新規外部依存なし。エンドポイント可否・上限実数は契約確定時にCost Tableへ（REQ-KGA-18の前提）。
- DataForSEO等プロバイダのアカウント上限実数: 契約プランに依存。契約確定時にREQ-SRC-07のグローバル予算初期値を設定。

## 再検証ルール

外部仕様に依拠する要求（本ログ記載分）は、L3着手時と運用開始前に本ログの各項目を再検証し、更新日を追記する。数値が変わった場合、要求本文は構造のみ維持し、実数はレジストリ/Cost Tableの更新で吸収する。
