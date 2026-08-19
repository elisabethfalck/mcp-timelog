import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerGetProject(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_project",
    {
      description:
        "Get project details by project ID. Returns name, project number, customer, project manager, budget, dates, and type.",
      inputSchema: z.object({
        projectId: z.number().describe("The project ID to look up"),
      }),
    },
    async ({ projectId }) => {
      const data = await client.get(`/v1/project/${projectId}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
