export declare function basename(p: string | undefined): string;
export declare function normalize(s: string | undefined): string;
export declare function containsKeyword(text: string, list: string[]): boolean;
export declare function deriveHints(query: string): {
    isDocQuery: boolean;
    isCodeQuery: boolean;
    queryTokens: string[];
};
export declare function normalizeSimilarity(score: number): number;
export declare function tinyPathSpread(relativePath?: string): number;
//# sourceMappingURL=scoring-helpers.d.ts.map