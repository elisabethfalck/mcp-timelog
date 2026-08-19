import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerSearchProjects(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "search_projects",
    {
      description:
        "Search for projects by name or number. Returns project IDs, names, numbers, and customer info.",
      inputSchema: z.object({
        searchText: z.string().optional().describe("Project name or number to search for"),
      }),
    },
    async ({ searchText }) => {
      const params: Record<string, string> = {};
      if (searchText) params.searchText = searchText;
      const data = await client.get("/v1/project-header/search-for-time-tracking", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
