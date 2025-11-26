import { DEFAULT_WEIGHTS } from "../utils/constants.js";
import { scoreAll } from "./scoring-core.js";
export function filterTopK(scored, k) {
    return scored
        .slice()
        .sort((a, b) => b._finalScore - a._finalScore)
        .slice(0, k);
}
export function filterByToken(scored, tokenMax) {
    let acc = 0;
    const out = [];
    for (const c of scored.sort((a, b) => b._finalScore - a._finalScore)) {
        const t = c.tokenLength || 0;
        if (acc + t > tokenMax)
            break;
        out.push(c);
        acc += t;
    }
    return out;
}
export function ProcessRetrieved(options) {
    const { retrievedChunks, fullChunks, query, weights = DEFAULT_WEIGHTS, tokenMax = null, topK = 5, } = options;
    let scored = scoreAll(retrievedChunks, query, weights);
    if (topK != null)
        scored = filterTopK(scored, topK);
    if (tokenMax != null)
        scored = filterByToken(scored, tokenMax);
    return scored.map((s) => {
        const full = fullChunks?.get(s.id);
        return full ? { ...full, ...s } : s;
    });
}
//# sourceMappingURL=preprocess.js.map