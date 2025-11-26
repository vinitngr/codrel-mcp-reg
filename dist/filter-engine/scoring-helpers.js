import { DOC_KEYWORDS, CODE_KEYWORDS } from "../utils/keywords.js";
export function basename(p) {
    if (!p)
        return "";
    const parts = p.split(/[/\\]/);
    return parts.pop() || "";
}
export function normalize(s) {
    return (s || "").toLowerCase();
}
export function containsKeyword(text, list) {
    const t = normalize(text);
    return list.some((k) => t.includes(k));
}
export function deriveHints(query) {
    const q = normalize(query);
    const isDocQuery = containsKeyword(q, DOC_KEYWORDS);
    const isCodeQuery = containsKeyword(q, CODE_KEYWORDS);
    const tokens = q
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 10);
    return { isDocQuery, isCodeQuery, queryTokens: tokens };
}
export function normalizeSimilarity(score) {
    if (typeof score !== "number")
        return 0;
    if (score > 1)
        return 1;
    if (score < 0)
        return 0;
    return score;
}
export function tinyPathSpread(relativePath) {
    const p = relativePath || "";
    if (!p)
        return 0;
    const depth = p.split(/[/\\]/g).length;
    return depth * 0.002;
}
//# sourceMappingURL=scoring-helpers.js.map