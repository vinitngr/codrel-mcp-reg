import type { FullChunk, RetrievedChunk, ScoringWeights } from "../types.js";
import { type ScoredChunk } from "./scoring-core.js";
export interface PreprocessOptions {
    retrievedChunks: RetrievedChunk[];
    fullChunks?: Map<string, FullChunk>;
    query: string;
    topK?: number | null;
    tokenMax?: number | null;
    weights?: ScoringWeights;
}
export declare function filterTopK(scored: ScoredChunk[], k: number): ScoredChunk[];
export declare function filterByToken(scored: ScoredChunk[], tokenMax: number): ScoredChunk[];
export declare function ProcessRetrieved(options: PreprocessOptions): ScoredChunk[];
//# sourceMappingURL=preprocess.d.ts.map