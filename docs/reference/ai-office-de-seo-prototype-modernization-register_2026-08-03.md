# AI Office de SEO 現行要求→画面プロト改修台帳（2026-08-03）

## 1. 結論

現行プロトはビジュアル、画面部品、Officeの部屋・詳細ページ、Keyword／記事データの深掘りに再利用価値がある。一方、業務Lifecycle、契約、権限、Recommendation Intake、Office操作能力は旧要求のままであり、現行要求の受入プロトとしては未完成である。

本台帳は「画面を作り直す理由」と「再利用する部分」を分離し、見た目の全面作り直しではなく、業務正本と操作を現行化するための改修順を示す。

## 2. P0 — 現行要求と正面衝突

| ID | 実コード証拠 | 問題 | 必要な改修 | 接続正本 |
|---|---|---|---|---|
| PROTO-01 | `PLAN_DEFS`が68,000／128,000／198,000／298,000円、プライム | 現行価格・名称・契約周期・税込併記と衝突 | Price Catalog fixture＋Plan Configuration fixtureから39,800／98,000／198,000／398,000円〜を表示。税別主表示＋税込併記 | Billing Capacity UI Map、PT-MIG／BILLUI |
| PROTO-02 | invoice fixtureが旧Standard 128,000円 | 旧価格を履歴ではなく現行請求として表示 | Subscriptionが参照したCatalog versionから請求fixtureを作る | `schema.billing.overview.v1` |
| PROTO-03 | member Roleがオーナー／管理者／編集者／閲覧者を循環 | 現行の契約者／サイトオーナー／ユーザー＋4業務権限＋Site付与と衝突 | 基本3区分、業務権限、Site付与を別controlにし、閲覧のみは業務権限なしで表現 | Authorization Operation Matrix、PT-AUTH |
| PROTO-04 | Office説明が「選ぶ・決めるは通常ビュー」「実行状況の確認」 | Officeを監視専用にしており現行の玄人向け詳細分析・運用と衝突 | 成果詳細、根拠探索、選択式操作、型付きProposal、共通Command接続を実装する | Agent Requirements Map、REQ-SCREEN-18 |
| PROTO-05 | Office詳細の多数CTAが通常ビューへ遷移 | Office内で完結すべき詳細分析・調整を外へ逃がしている | 同一ContextでOffice内Workbenchを開き、共通Projection／Commandへ接続する | PT-OFFICE-02〜07 |
| PROTO-06 | Content起点が手動Keyword選択中心 | Site導入→Report→月次計画→Recommendation→IntakeのLifecycleが見えない | Recommendation Queueを既定入口にし、採用時にfreeze済みIntakeを表示／引継ぐ | Action Routing Map、PT-REC |
| PROTO-07 | 新規／既存Site導入、戦略Report／診断Reportが画面として未成立 | GSCや市場母集団なしで推薦が出るように見える | 新規／既存の導入step、source availability、自動構築、Report、段階開放を追加 | Keyword Report Map、PT-REPORT／MARKET |
| PROTO-08 | 一律の承認fixture中心 | 新規15記事、解放後自動投稿、リライト承認、hard gate二段階確認の差が出ない | lifecycle別fixtureと承認条件、同意、残数、解放状態を表示 | PT-LC-05/06 |

## 3. P1 — 操作と状態が未接続

| ID | 現状 | 必要な改修 | 接続正本 |
|---|---|---|---|
| PROTO-09 | Recommendation採用は画面遷移とtoast中心 | Recommendation／version／Intake／Job／評価のcorrelationを保持 | Intake Schema、PT-REC-01〜06 |
| PROTO-10 | 新規、リライト、内部link、CTAが画面上で混在 | Agent Workflow、軽量Patch、User escalation、MonitoringをAction typeで分岐 | Action Routing／Patch Map |
| PROTO-11 | 利用不可が個別ハードコード | Scope、incident、Permission、Capability、Plan、接続、data、credit、approval、processingの共通resolverを利用 | UI Availability State Map |
| PROTO-12 | 通知は固定fixture・既読中心 | 受信者resolver、popup、必須通知、購読、確認済み／対応済み、fallbackを追加 | Notification Routing Map |
| PROTO-13 | 課金はPlan選択とcredit購入中心 | Lot失効、自動チャージ、Dimension別Capacity、soft/hard、支払猶予、Plan変更影響を追加 | Billing Capacity UI Map |
| PROTO-14 | CMSはWordPress接続の単一状態 | read／write／Media／Editor／Preview／Revision／CapacityをCapability表示し、縮退と反映確認を分ける | CMS Routing Map |
| PROTO-15 | アイキャッチPattern Editorなし | Pattern、variation、ロゴsafe area、wireframe、見積、生成、Media割当を追加 | Featured Image Pattern Map |
| PROTO-16 | 評価は順位・click中心の固定story | 公開／更新起点、1/3/6か月、SEO、CTA/CV、認知、要監視、月次／累積を分離 | Business Lifecycle、Evaluation events |

## 4. P2 — 体験強化

| ID | 再利用するもの | 強化 |
|---|---|---|
| PROTO-17 | 7フロア、部屋、Agent、エレベーター、詳細ページ | 13 personaのService・会話・Proposal configを画面から実際に消費する |
| PROTO-18 | Keyword／記事の全件Office page生成 | Market→Share→Report→Plan→Recommendation→実行→評価のKnowledge Graphへ拡張 |
| PROTO-19 | WORK LOG、吹き出し、状態演出 | 手書き文言でなくTask／Event／Snapshot／Proposalから導出 |
| PROTO-20 | 暗色ネオンと通常ビューの業務SaaS theme | 3Dを段階強化しつつ、性能・reduced motion・2D縮退で同じ操作を保つ |

## 5. 改修順序

1. fixture正本化: Price、Plan、Entitlement、Authorization、Site、Report、Recommendation、Intake。
2. 共通resolver: Availability、Recipient、Authorization、CMS Capability。
3. 通常ビューLifecycle: 導入、Report、月次計画、Recommendation、実行、評価。
4. Office専門分析・微調整: 通常ビューのRecommendation、成果、Keyword、記事、設定、TaskからContextを維持して入り、persona別Task説明、工程、待機理由、根拠、詳細分析、選択式の条件調整・Task操作を行う。通常ビューの結果と双方向同期し、監視専用面にはしない。
5. Billing／Capacity、Notification、CMS、Image等の横断画面。
6. Knowledge Graphと3D演出の強化。

## 6. 受入方法

見た目の目視だけで完了判定しない。`PT-LC / MIG / AUTH / MARKET / REPORT / REC / PATCH / CMS / OFFICE / STATE / NOTIFY / BILLUI / AWS / IMAGE`のfixtureを操作し、通常ビューとOfficeが同じ業務entity、Command、Event、状態を使用することを確認する。
