import path from "path";
import fs from "fs/promises";
import os from "os";
import { ProcessRetrieved } from "../filter-engine/preprocess.js";
import { DEFAULT_WEIGHTS } from "../utils/constants.js";
const ROOT = path.join(os.homedir(), ".codrel");
export class RagService {
    constructor(collectionId) {
        this.endpoint = "http://localhost:3000/api/ask";
        this.apiToken = "ae3c12a8fe1e0a196e9b9d0c0bd09da6";
        this.authHeader = "ae3c12a8fe1e0a196e9b9d0c0bd09da6";
        this.localId = null;
        this.cloud = true;
        this.chunks = new Map();
        this.collectionId = collectionId;
    }
    async init() {
        this.localId = await this.getLocalId(this.collectionId);
        this.cloud = !this.localId;
        if (!this.cloud)
            await this.loadFullChunksFromJson();
    }
    async getLocalId(serverId) {
        const mappingPath = path.join(ROOT, "projects", "mapping.json");
        try {
            const map = JSON.parse(await fs.readFile(mappingPath, "utf8"));
            return map[serverId] ?? null;
        }
        catch {
            return null;
        }
    }
    async loadFullChunksFromJson() {
        if (!this.localId)
            throw new Error("localId is not set");
        const jsonPath = path.join(os.homedir(), ".codrel", "projects", this.localId, "chunks.json");
        try {
            const raw = await fs.readFile(jsonPath, "utf8");
            const all = JSON.parse(raw);
            this.chunks = new Map(all.map((x) => [x.id, x]));
        }
        catch (err) {
            console.error("Failed to load chunks.json:", err);
            this.chunks = new Map();
        }
    }
    async fetchRetrievals(projectId, query) {
        const body = {
            token: this.apiToken,
            query,
            k: 20,
            projectId,
            cloud: this.cloud,
        };
        const res = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${this.authHeader}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`RAG HTTP ${res.status}`);
        const json = (await res.json());
        if (!json.success || !Array.isArray(json.results))
            throw new Error("Malformed RAG response");
        return json.results;
    }
    async filterRetrieval(results, query) {
        const retrievedChunks = results.map((r) => {
            const m = r.metadata;
            let treePath;
            if (Array.isArray(m.treePath)) {
                treePath = m.treePath;
            }
            else if (typeof m.treePath === "string") {
                treePath = [m.treePath];
            }
            else {
                treePath = undefined;
            }
            return {
                id: m.id,
                score: r.vectorScore ?? 0,
                filePath: m.relativePath ?? "",
                relativePath: m.relativePath ?? "",
                extension: m.extension ?? "",
                treePath,
                tokenLength: m.tokenLength,
                email: m.email,
                docId: m.docId,
                neighbors: [],
                depth: 0,
            };
        });
        const fullChunks = this.cloud ? undefined : this.chunks;
        const scored = ProcessRetrieved({
            retrievedChunks,
            fullChunks,
            query,
            topK: 20,
            tokenMax: null,
            weights: DEFAULT_WEIGHTS,
        });
        return scored;
    }
    createContextPrompt(filteredChunks) {
        const out = [];
        for (const c of filteredChunks) {
            if (this.cloud) {
                out.push(`// ${c.relativePath} (${c.startLine ?? "?"}-${c.endLine ?? "?"})\n` +
                    (c.pageContent || ""));
                continue;
            }
            const full = this.chunks.get(c.id);
            if (!full)
                continue;
            out.push(`// ${full.relativePath} (${full.startLine}-${full.endLine})\n` +
                (full.text || ""));
        }
        return out.join("\n\n");
    }
}
//# sourceMappingURL=RAG.js.map