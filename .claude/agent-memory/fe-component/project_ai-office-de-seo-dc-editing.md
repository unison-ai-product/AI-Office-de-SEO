---
name: project-ai-office-de-seo-dc-editing
description: How to safely edit the single-file DC prototype "AI Office de SEO.dc.html" (template dialect, tag-balance verification, i18n rules)
metadata:
  type: project
---

Project: AI-office-de-seo (single-file React18 prototype `prototype/AI Office de SEO.dc.html`, ~10k lines).

**Template dialect**: custom `<sc-if value="{{ flag }}" hint-placeholder-val="{{ false }}">…</sc-if>`, `<sc-for list="{{ items }}" as="x" hint-placeholder-count="N">…</sc-for>`, bindings `{{ name }}`. hint attributes are required. All styling is inline `style="…"`; hover states use a custom `style-hover="…"` attribute (not real CSS). No JSX, no CSS classes.

**Mandatory post-edit check**: after any edit, verify tag balance with counts of `<sc-if` vs `</sc-if>`, `<sc-for` vs `</sc-for>`, `<button` vs `</button>`, `<div` vs `</div>`, `<svg` vs `</svg>` (grep -o ... | wc -l for each pair, must match exactly).

**i18n system**: `TXT.en` is a giant dictionary keyed by the literal Japanese source string (as it appears as a DOM text node after `.trim()`), values are English translations. `applyI18n()` walks text nodes and swaps by exact string match. Rules:
- Never create a key that embeds a trailing colon fragment (e.g. "現在の工程:") if the label and value are meant to be in separate spans — put the label alone in its own `<span>` with no colon, and add the label-only key.
- Before adding a new key, grep the file for `"key":` to confirm it isn't already present (avoid duplicate-key rule violations sometimes required by task specs).
- Data-ish content (keyword strings, article titles, section body text, SERP composition, related queries, numeric stats/labels that are literal exam data) is intentionally NOT translated — only UI chrome labels/headings are added to TXT.en.

**Officeビュー constraint** (repeated user rule across sessions, see also global memory `preview-verify-dc-prototype` note): the neon Office view must never scroll — no `overflow-y`/`max-height` scrollbars anywhere in that view's screens. Any panel that grows must be redesigned to fit (compact pills, grids sized to content) rather than scrolled.

**Verification note**: per this project's task instructions, some FE tasks explicitly say not to launch preview/browser verification (ordering party does it separately) — respect that instruction over the generic "verify in browser" reminder when they conflict.
