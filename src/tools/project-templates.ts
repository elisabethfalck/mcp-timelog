import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerGetProjectTemplates(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_project_templates",
    {
      description:
        "Get all project templates. A ProjectTemplateID is required by create_project.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await client.get("/v1/project-template/get-all");
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
