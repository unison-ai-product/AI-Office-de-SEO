---
document_id: AOS-PRE-L3-ACTION-EXECUTION-UI-VALIDATION
title: Recommendation Action・Agentic Workflow・軽量施策 画面検証仕様
kind: ui_validation
layer: pre-L3
lifecycle_stage: pre_l3_ui_validation
status: current-draft
updated_at: 2026-08-05
---

# Recommendation Action・Agentic Workflow・軽量施策 画面検証仕様

## 1. 目的

Recommendation採用後の施策を、すべて記事生成や「Agentの仕事」へ丸めず、Actionの意味に合う実行経路へ接続する画面を検証する。旧Agent要求のWorkflow、Ticket、Snapshot、Executor責務を維持しつつ、Officeペルソナ数、LLM呼出し数、Executor責務数を混同しない。

## 2. 実行主体の分離

| 主体 | 画面上の意味 | LLM | 業務正本か |
|---|---|---:|---:|
| Officeペルソナ | 専門領域の説明、探索、選択式操作、型付き変更案の窓口 | 必要な会話だけ | いいえ |
| Office Conversation Runtime | ペルソナ・Site・Contextを受け、回答／Proposal／Ticket候補を返す共通基盤 | 必要時だけ | いいえ |
| Orchestrator | Workflow状態、Ticket、停止・再開を決定論的に制御 | 原則不要 | Workflow状態の制御主体 |
| Planning／Writing／QA／Repair Executor | 意味判断、生成、意味検査、限定修正 | 必要工程だけ | Snapshotを介して成果を返す |
| Automation Executor | 許可済みCommandをCMS等へ実行 | 常設しない | Command Resultを返す |
| 決定論Service | 取得、集計、分類、score、権限、課金、Capacity、状態遷移 | 使わない | 各BCの正本処理 |

6つのExecutor名称は責務Catalogであり、6体のキャラクター、6個の常駐LLM、6種類のProvider modelを意味しない。Officeペルソナは既存Service／Workflow／Executorへ多対多で対応する。

## 3. Action別の画面経路

| Action | class | 通常ビュー | Office詳細 | 実行経路 |
|---|---|---|---|---|
| 新規記事 | agentic content | 実行準備、工程、確認、成果 | Brief、Outline、Meaning Unit、QA、根拠、Task変更案 | `workflow.new_article.v2` |
| リライト | agentic content | 原因、変更範囲、差分、承認 | Article Read、対象Unit、保持対象、QA、復元 | `workflow.rewrite.v2` |
| CTA／内部link | lightweight patch | 対象part、差分、承認、反映 | 候補根拠、Batch、部分結果 | 軽量Patch。記事全文Workflowを起動しない |
| 観測 | observation | 観測理由、次回確認、状態 | 時系列、条件、Source | 要監視Queue。Agent Jobなし |
| 保護 | policy | 保護理由、対象、解除条件 | Preflightへの影響 | Policy更新。生成Jobなし |
| 見送り | terminal | 理由、再評価条件 | 判断根拠 | Taskなし |
| 構造変更提案 | user escalation | 影響URL、ユーザー対応 | 根拠、統合／canonical候補 | Site構造を自動変更しない |
| 技術対応依頼 | user escalation | 原因候補、影響、確認手順 | crawl／index根拠 | Site設定を自動修復しない |
| 自動運用変更 | configuration proposal | 変更内容、費用、対象、確認 | Policy差分、停止条件 | 権限者確定後にPolicy新version |

## 4. 通常ビュー

Recommendation採用後はAction名を平易に表示し、共通の「Agentを起動」へ送らない。新規記事・リライトでは工程を業務語で段階表示し、CTA／内部linkは小さな変更として差分確認へ、観測・保護・見送りは状態更新へ、ユーザー対応は手順へ遷移する。

採用、Execution Admission、Task開始、成果提供、CMS送信、公開／更新確認を別状態にする。`実行準備中／入力が必要／Creditが必要／接続確認／実行待ち／作業中／確認待ち／成果完成`を使い、内部のPack、Ticket、Executor名を第一階層へ出さない。

## 5. Agent Office

OfficeはActionごとの同じProjectionを詳しく表示する。記事制作では工程SnapshotとTask、軽量Patchでは候補partとBatch、観測では時系列と再判定条件、ユーザー対応では診断根拠を表示する。Office内のペルソナへ話しかける操作は、質問回答、選択式操作、型付きProposal、Ticket候補のいずれかへ限定し、会話結果から業務状態やCMSを直接変更しない。

Office内の「Agentの動きを変える」は、対象Actionの方針、優先順、許可された工程条件、停止・再開、追加確認を変更する意味である。Executor構成、Provider model、Toolの内部routingを一般ユーザーが編集する意味ではない。

## 6. LLM利用を減らす原則

- 状態遷移、権限、credit、Capacity、hash、差分、重複、順位集計、カバー率、Query Drift、通知は決定論Serviceで処理する。
- 画面の選択、並べ替え、絞込み、停止、再開、定型理由選択はLLMを呼ばない。
- LLMはResearch、Outline、本文生成、意味変化、根拠整合、限定Repair、自由記述からのProposal構造化等、意味処理が必要な箇所だけで使う。
- QAは決定論Gateを先に実行し、意味検査が必要な箇所だけLLMへ渡す。
- Officeペルソナの吹き出し、移動、作業演出だけを理由にLLMを呼ばない。

## 7. 検証fixture

| ID | 条件 | 期待する経路 | 禁止する実装 |
|---|---|---|---|
| ACT-UI-01 | 新規記事採用 | Intake→Admission→new article Workflow | S3でKeyword等を再入力 |
| ACT-UI-02 | リライト採用 | Article Read→対象Unit→QA→CMS下書き→承認 | 新規記事Workflowへ流用 |
| ACT-UI-03 | CTA追加 | 軽量Patch差分と承認 | 全文再生成 |
| ACT-UI-04 | 既存記事への内部link追加 | 候補Batch→個別結果→承認 | link専用LLM Agent常設 |
| ACT-UI-05 | 内部link削除 | 追加と別確認 | 追加権限で自動削除 |
| ACT-UI-06 | observe | 観測期限と条件を表示 | 架空Agent Jobを作成 |
| ACT-UI-07 | protect | Policy登録と影響表示 | 記事を生成 |
| ACT-UI-08 | no_action | 理由と再評価条件で終端 | Taskを発行 |
| ACT-UI-09 | index障害 | ユーザー対応手順へ | WordPress設定を自動修復 |
| ACT-UI-10 | category／slug提案 | 構造提案として表示 | CMS構造を変更 |
| ACT-UI-11 | 自動運用変更 | Policy差分→権限者確定 | 会話から直接有効化 |
| ACT-UI-12 | Officeで質問 | 同じContextの回答のみ | 設定を暗黙更新 |
| ACT-UI-13 | Officeで自由指示 | 型付きProposalと影響Preview | 生テキストをCommand化 |
| ACT-UI-14 | 選択式の順序変更 | 決定論UIで変更案作成 | LLMを毎回呼ぶ |
| ACT-UI-15 | QA構造検査 | 決定論Gate | 全項目をLLM判定 |
| ACT-UI-16 | 意味整合検査 | 必要箇所だけQA Executor | regexだけで意味合格 |
| ACT-UI-17 | Repair対象あり | 不合格Unitだけ修正 | 全文を再生成 |
| ACT-UI-18 | Officeペルソナ13体表示 | 共通Conversation Runtime | 13個の常駐LLM |
| ACT-UI-19 | Automation実行 | 許可Commandと再認可 | Writing Executorが直接公開 |
| ACT-UI-20 | 手動記事指定 | Manual Intake→共通Preflight | 採用Recommendationを捏造 |

## 8. Finding記録

検証結果は`SF-UI-08`へ記録する。意味変更はAgent Requirements Map、Recommendation Action Routing Map、`REQ-AGENT-*`、`REQ-SCREEN-04/18`、`INV-PRODUCTION-001`へ先に戻す。ブラウザ操作前は`open`とし、静的文書だけで`validated`にしない。

