import { DOC_EXTS, CODE_EXTS } from "../utils/keywords.js";
import { basename, normalize, containsKeyword, deriveHints, normalizeSimilarity, tinyPathSpread, } from "./scoring-helpers.js";
export function similarityScore(chunk, w, hints) {
    const ext = chunk.extension || "";
    const sim = normalizeSimilarity(chunk.score) * w.similarity;
    if (hints.isDocQuery && DOC_EXTS.includes(ext))
        return sim + w.docBoost;
    if (hints.isCodeQuery && CODE_EXTS.includes(ext))
        return sim + w.codeBoost;
    return sim;
}
export function extMatchScore(chunk, w) {
    const ext = chunk.extension || "";
    if (DOC_EXTS.includes(ext))
        return w.extMatch;
    if (CODE_EXTS.includes(ext))
        return w.extMatch * 0.75;
    return 0;
}
export function keywordMatchScore(chunk, w) {
    const rel = normalize(chunk.relativePath || "");
    if (!rel)
        return 0;
    return containsKeyword(rel, DOC_EXTS)
        ? w.keywordMatch * 1.1
        : containsKeyword(rel, CODE_EXTS)
            ? w.keywordMatch
            : 0;
}
export function filenameMatchScore(chunk, w, hints) {
    const name = normalize(basename(chunk.relativePath || ""));
    if (!name)
        return 0;
    return hints.queryTokens.some((q) => name.includes(q))
        ? w.filenameMatch
        : 0;
}
export function pathMatchScore(chunk, w, hints) {
    const treePathStr = Array.isArray(chunk.treePath)
        ? chunk.treePath.join("/")
        : (chunk.treePath || "");
    const tp = normalize(treePathStr);
    return hints.queryTokens.some((q) => q && tp.includes(q))
        ? w.pathMatch
        : 0;
}
export function sameFileScore(chunk, w) {
    const name = basename(chunk.relativePath || chunk.filePath || "");
    if (!name)
        return 0;
    return chunk.neighbors?.some((n) => n.startsWith(name)) ? w.sameFile : 0;
}
export function neighborScore(chunk, w) {
    return chunk.neighbors && chunk.neighbors.length ? w.neighbor : 0;
}
export function depthScore(chunk, w) {
    return (chunk.depth || 0) * w.depth;
}
export function computeChunkScore(chunk, w, hints) {
    return (similarityScore(chunk, w, hints) +
        extMatchScore(chunk, w) +
        keywordMatchScore(chunk, w) +
        filenameMatchScore(chunk, w, hints) +
        pathMatchScore(chunk, w, hints) +
        sameFileScore(chunk, w) +
        neighborScore(chunk, w) +
        depthScore(chunk, w) +
        tinyPathSpread(chunk.relativePath));
}
export function scoreAll(retrievedChunks, query, weights) {
    const hints = deriveHints(query);
    return retrievedChunks.map((chunk) => ({
        ...chunk,
        _finalScore: computeChunkScore(chunk, weights, hints),
    }));
}
//# sourceMappingURL=scoring-core.js.map