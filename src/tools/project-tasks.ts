import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerGetProjectTasks(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_project_tasks",
    {
      description:
        "Get all tasks (phases) for a project. Returns task IDs, names, parent hierarchy, fixed-price status, and billable defaults. Use the projectId from get_project or from time registrations.",
      inputSchema: z.object({
        projectId: z.number().describe("The project ID to list tasks/phases for"),
        pageSize: z.number().optional().describe("Number of results per page (default 10)"),
        pageNumber: z.number().optional().describe("Page number (default 1)"),
      }),
    },
    async ({ projectId, pageSize, pageNumber }) => {
      const params: Record<string, string> = { projectId: String(projectId) };
      if (pageSize) params.pageSize = String(pageSize);
      if (pageNumber) params.pageNumber = String(pageNumber);
      const data = await client.get("/v1/task", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
