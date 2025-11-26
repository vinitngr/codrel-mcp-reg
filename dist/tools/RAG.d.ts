import type { RagResult, FullChunk } from "../types.js";
export declare class RagService {
    private endpoint;
    private apiToken;
    private authHeader;
    collectionId: string;
    localId: string | null;
    cloud: boolean;
    chunks: Map<string, FullChunk>;
    constructor(collectionId: string);
    init(): Promise<void>;
    private getLocalId;
    private loadFullChunksFromJson;
    fetchRetrievals(projectId: string, query: string): Promise<RagResult[]>;
    filterRetrieval(results: RagResult[], query: string): Promise<import("../filter-engine/scoring-core.js").ScoredChunk[]>;
    createContextPrompt(filteredChunks: any[]): string;
}
//# sourceMappingURL=RAG.d.ts.map