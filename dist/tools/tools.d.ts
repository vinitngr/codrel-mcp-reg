import z from "zod";
export declare const tools: {
    getContext: {
        tool: {
            title: string;
            description: string;
            inputSchema: {
                collectionId: z.ZodString;
                RaqQuery: z.ZodString;
            };
        };
        handler: ({ collectionId, RaqQuery }: {
            collectionId: string;
            RaqQuery: string;
        }) => Promise<{
            content: {
                type: string;
                text: string;
            }[];
        }>;
    };
};
//# sourceMappingURL=tools.d.ts.map