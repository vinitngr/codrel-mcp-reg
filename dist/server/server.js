import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "../tools/tools.js";
export function createStdioMcpServer() {
    const server = new McpServer({
        name: "@codrel-mcp",
        version: "1.0.0",
    });
    let allTools = { ...tools };
    console.error("🔍 Tools available before registration:", Object.keys(allTools));
    for (const [name, data] of Object.entries(allTools)) {
        if (!data || typeof data !== "object" || !data.tool || !data.handler) {
            console.error(`⚠️ Skipping invalid tool: ${name}`);
            continue;
        }
        try {
            server.registerTool(name, data.tool, data.handler);
            console.error(`✅ Registered tool: ${name}`);
        }
        catch (err) {
            console.error(`❌ Failed to register tool: ${name}`, err);
        }
    }
    return server;
}
export async function createStdioMcpTransport(server) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return transport;
}
//# sourceMappingURL=server.js.map