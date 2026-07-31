import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const designRoot = path.join(repoRoot, "docs", "design", "ai-office-de-seo");
const l1Root = path.join(designRoot, "L1-requirements");
const tracePath = path.join(l1Root, "ai-office-de-seo-acceptance-trace_v3.7.md");

function markdownFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(target));
    else if (entry.name.endsWith(".md")) files.push(target);
  }
  return files;
}

function fail(errors, message) {
  errors.push(message);
}

const allDocuments = markdownFiles(designRoot);
const reqDefinitions = new Map();
const duplicateRequirements = [];

for (const file of allDocuments) {
  const text = fs.readFileSync(file, "utf8");
  const patterns = [
    /^#{2,6}\s+(REQ-[A-Z0-9-]+(?:\.\d+)?)\b/gm,
    /^#{2,6}.*［(REQ-[A-Z0-9-]+(?:\.\d+)?)］\s*$/gm,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (reqDefinitions.has(match[1]) && reqDefinitions.get(match[1]) !== file) {
        duplicateRequirements.push(
          `${match[1]}: ${path.relative(repoRoot, reqDefinitions.get(match[1]))} / ${path.relative(repoRoot, file)}`,
        );
      } else {
        reqDefinitions.set(match[1], file);
      }
    }
  }
}

const canonicalSources = [
  ...markdownFiles(path.join(l1Root, "categories")),
  ...markdownFiles(path.join(l1Root, "logic")),
];
const sourceAcceptance = new Map();
const duplicateAcceptance = [];

for (const file of canonicalSources) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/^- \[ \] (AC-L1-[A-Z0-9-]+): (.+)$/gm)) {
    if (sourceAcceptance.has(match[1])) {
      duplicateAcceptance.push(match[1]);
    }
    sourceAcceptance.set(match[1], { text: match[2], file });
  }
}

const traceText = fs.readFileSync(tracePath, "utf8");
const traceAcceptance = new Map();
const coveredRequirements = new Set();
const errors = [];
const tracePattern =
  /^- \[ \] (AC-L1-[A-Z0-9-]+): (.*?) ｜ 検証: (.*?) ｜ 正本: `([^`]+)`$/gm;

for (const match of traceText.matchAll(tracePattern)) {
  const [, id, text, rawRefs, canonicalPath] = match;
  if (traceAcceptance.has(id)) fail(errors, `duplicate trace AC: ${id}`);
  const refs = rawRefs.split(/\s*,\s*/);
  for (const reqId of refs) {
    if (!reqDefinitions.has(reqId)) fail(errors, `${id}: undefined requirement ${reqId}`);
    coveredRequirements.add(reqId);
  }
  const resolvedCanonicalPath = path.resolve(l1Root, canonicalPath);
  if (!fs.existsSync(resolvedCanonicalPath)) {
    fail(errors, `${id}: missing canonical path ${canonicalPath}`);
  }
  traceAcceptance.set(id, { text, refs, canonicalPath });
}

for (const match of traceText.matchAll(
  /^- \[ \] (AC-(?!L1-)[A-Z0-9-]+): .*? ｜ 検証: ([^｜\r\n]+)$/gm,
)) {
  const [, id, rawRefs] = match;
  if (traceAcceptance.has(id)) fail(errors, `duplicate trace AC: ${id}`);
  const refs = [...rawRefs.matchAll(/REQ-[A-Z0-9-]+(?:\.\d+)?/g)].map((item) => item[0]);
  for (const reqId of refs) {
    if (!reqDefinitions.has(reqId)) fail(errors, `${id}: undefined requirement ${reqId}`);
    coveredRequirements.add(reqId);
  }
  traceAcceptance.set(id, { text: "", refs, canonicalPath: "" });
}

for (const item of duplicateRequirements) fail(errors, `duplicate REQ: ${item}`);
for (const id of duplicateAcceptance) fail(errors, `duplicate source AC: ${id}`);

for (const [id, source] of sourceAcceptance) {
  const trace = traceAcceptance.get(id);
  if (!trace) {
    fail(errors, `${id}: missing from acceptance trace`);
    continue;
  }
  if (trace.text !== source.text) fail(errors, `${id}: source/trace text mismatch`);
  const expectedPath = path.relative(l1Root, source.file).replaceAll("\\", "/");
  if (trace.canonicalPath !== expectedPath) {
    fail(errors, `${id}: canonical path mismatch (${trace.canonicalPath} != ${expectedPath})`);
  }
}

for (const id of traceAcceptance.keys()) {
  if (id.startsWith("AC-L1-") && !sourceAcceptance.has(id)) {
    fail(errors, `${id}: trace entry has no canonical source AC`);
  }
}

for (const reqId of reqDefinitions.keys()) {
  if (!coveredRequirements.has(reqId)) fail(errors, `${reqId}: no acceptance condition verifies this requirement`);
}

if (errors.length) {
  console.error(`Requirements audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Requirements audit passed: ${reqDefinitions.size} REQ definitions, ${coveredRequirements.size} covered REQ, ${sourceAcceptance.size} canonical AC, ${traceAcceptance.size} traced AC.`,
);
