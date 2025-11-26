import type { RetrievedChunk, ScoringWeights } from "../types.js";
import { deriveHints } from "./scoring-helpers.js";
export interface ScoredChunk extends RetrievedChunk {
    _finalScore: number;
}
export declare function similarityScore(chunk: RetrievedChunk, w: ScoringWeights, hints: ReturnType<typeof deriveHints>): number;
export declare function extMatchScore(chunk: RetrievedChunk, w: ScoringWeights): number;
export declare function keywordMatchScore(chunk: RetrievedChunk, w: ScoringWeights): number;
export declare function filenameMatchScore(chunk: RetrievedChunk, w: ScoringWeights, hints: ReturnType<typeof deriveHints>): number;
export declare function pathMatchScore(chunk: RetrievedChunk, w: ScoringWeights, hints: ReturnType<typeof deriveHints>): number;
export declare function sameFileScore(chunk: RetrievedChunk, w: ScoringWeights): number;
export declare function neighborScore(chunk: RetrievedChunk, w: ScoringWeights): number;
export declare function depthScore(chunk: RetrievedChunk, w: ScoringWeights): number;
export declare function computeChunkScore(chunk: RetrievedChunk, w: ScoringWeights, hints: ReturnType<typeof deriveHints>): number;
export declare function scoreAll(retrievedChunks: RetrievedChunk[], query: string, weights: ScoringWeights): ScoredChunk[];
//# sourceMappingURL=scoring-core.d.ts.map