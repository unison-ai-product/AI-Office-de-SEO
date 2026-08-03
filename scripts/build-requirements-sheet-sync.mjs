import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const reqRoot = path.join(root, "docs", "design", "ai-office-de-seo", "L1-requirements");
const traceText = fs.readFileSync(
  path.join(reqRoot, "ai-office-de-seo-acceptance-trace_v3.7.md"),
  "utf8",
);
const acceptanceRequirement = new Map();
for (const line of traceText.split(/\r?\n/)) {
  const match = line.match(
    /\b(AC-[A-Z0-9-]+)\b.*?検証:\s*((?:REQ-[A-Z0-9-]+(?:\.\d+)?)(?:\s*,\s*REQ-[A-Z0-9-]+(?:\.\d+)?)*)/,
  );
  if (match) acceptanceRequirement.set(match[1], match[2].replace(/\s*,\s*/g, ", "));
}

const sources = [
  ["01_業務", 2001, "categories/business-requirements_v1.md"],
  ["02_ロジック", 2002, "categories/logic-requirements_v1.md"],
  ["03_データ", 2003, "categories/data-requirements_v1.md"],
  ["04_画面操作", 2004, "categories/screen-operation-requirements_v1.md"],
  ["05_外部連携", 2005, "categories/integration-requirements_v1.md"],
  ["06_非機能", 2006, "categories/non-functional-requirements_v1.md"],
  ["07_セキュリティ", 2007, "categories/security-access-requirements_v1.md"],
  ["08_デザイン体験", 2008, "categories/design-experience-requirements_v1.md"],
  ["09_課金会計", 2009, "categories/billing-accounting-requirements_v1.md"],
  ["10_計測運用", 2010, "categories/measurement-operations-requirements_v1.md"],
  ["11_コスト", 2011, "categories/cost-requirements_v1.md"],
  ["12_障害保証", 2012, "categories/incident-warranty-requirements_v1.md"],
  ["13_成長アップセル", 2013, "categories/growth-upsell-requirements_v1.md"],
  ["14_組織権限", 2014, "categories/customer-organization-governance-requirements_v1.md"],
  ["15_開発管理", 2015, "categories/platform-administration-control-requirements_v1.md"],
  ["16_技術", 2016, "categories/technical-architecture-requirements_v1.md"],
  ["17_KW推薦ロジック", 2017, "logic/keyword-dynamic-recommendation-logic-requirements_v1.md"],
  ["18_記事要約ロジック", 2018, "logic/article-summary-completeness-logic-requirements_v1.md"],
  ["19_KW診断ロジック", 2019, "logic/keyword-portfolio-diagnostics-logic-requirements_v1.md"],
  ["20_品質修復ロジック", 2020, "logic/content-quality-repair-routing-logic-requirements_v1.md"],
];

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const meta = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: match ? text.slice(match[0].length) : text };
}

function cleanBlock(lines) {
  return lines.join("\n").trim();
}

function parseMarkdown(relativePath) {
  const absolutePath = path.join(reqRoot, relativePath);
  const text = fs.readFileSync(absolutePath, "utf8");
  const { meta, body } = parseFrontmatter(text);
  const lines = body.split(/\r?\n/);
  const rows = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const req = line.match(/^#{2,3}\s+(REQ-[A-Z0-9-]+)\s+(.+?)\s*$/);
    const embeddedReq = line.match(/^##\s+(.+?)\s+［(REQ-[A-Z0-9-]+)］\s*$/);
    const heading = line.match(/^##\s+(.+?)\s*$/);

    if (embeddedReq) {
      const content = [];
      i += 1;
      while (i < lines.length && !/^##\s+/.test(lines[i])) content.push(lines[i++]);
      rows.push({
        type: "要求",
        id: embeddedReq[2],
        heading: embeddedReq[1].replace(/^\d+(?:\.\d+)*\.\s*/, ""),
        body: cleanBlock(content),
      });
      continue;
    }

    if (req) {
      const content = [];
      i += 1;
      while (i < lines.length && !/^#{2,3}\s+/.test(lines[i])) content.push(lines[i++]);
      rows.push({ type: "要求", id: req[1], heading: req[2], body: cleanBlock(content) });
      continue;
    }

    if (heading) {
      const title = heading[1];
      const content = [];
      i += 1;
      while (i < lines.length && !/^#{2,3}\s+/.test(lines[i])) content.push(lines[i++]);
      if (title.includes("受入条件")) {
        for (const raw of content) {
          const ac = raw.match(/^\s*-\s*\[[ xX]\]\s*(AC-[A-Z0-9-]+):\s*(.+?)\s*$/);
          if (ac) {
            rows.push({
              type: "受入条件",
              id: ac[1],
              requirementId: acceptanceRequirement.get(ac[1]) || "",
              heading: "",
              body: ac[2],
            });
          }
        }
      } else {
        rows.push({ type: "章", id: "", heading: title, body: cleanBlock(content) });
      }
      continue;
    }
    i += 1;
  }

  return {
    relativePath,
    fileName: path.basename(relativePath),
    meta,
    rows,
    requirementCount: rows.filter((r) => r.type === "要求").length,
    acceptanceCount: rows.filter((r) => r.type === "受入条件").length,
    uncertainCount: (body.match(/TBD|要調整|未確定/g) || []).length,
  };
}

const documents = sources.map(([sheetName, sheetId, relativePath]) => ({
  sheetName,
  sheetId,
  ...parseMarkdown(relativePath),
}));

const requestedSheet = process.argv[2];
const requestedStart = process.argv[3] === undefined ? null : Number(process.argv[3]);
const requestedCount = process.argv[4] === undefined ? null : Number(process.argv[4]);
if (
  (requestedStart !== null && (!Number.isInteger(requestedStart) || requestedStart < 0)) ||
  (requestedCount !== null && (!Number.isInteger(requestedCount) || requestedCount < 1))
) {
  throw new Error("row chunk must be: <sheetName> <zeroBasedStart> <positiveCount>");
}

const selectedDocuments = requestedSheet
  ? documents.filter((document) => document.sheetName === requestedSheet)
  : documents;

process.stdout.write(JSON.stringify({
  documents: selectedDocuments.map((document) => ({
    ...document,
    rows:
      requestedStart === null
        ? document.rows
        : document.rows.slice(
            requestedStart,
            requestedCount === null ? undefined : requestedStart + requestedCount,
          ),
    rowChunk:
      requestedStart === null
        ? null
        : {
            start: requestedStart,
            count: requestedCount,
            total: document.rows.length,
          },
  })),
}));
