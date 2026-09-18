import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerCreateProject(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "create_project",
    {
      description:
        "Create a new project from a project template. Use search_customers to find the CustomerID and get_project_templates to find the ProjectTemplateID first.",
      inputSchema: z.object({
        Name: z.string().describe("Project name"),
        CustomerID: z.number().describe("Customer ID the project belongs to"),
        ProjectTemplateID: z.number().describe("Project template ID to create from"),
        ProjectStartDate: z.string().describe("Start date (YYYY-MM-DD)"),
        ProjectEndDate: z.string().describe("End date (YYYY-MM-DD)"),
        LegalEntityID: z.number().describe("Legal entity ID"),
        ProjectNo: z.string().optional().describe("Project number (optional)"),
        Description: z.string().optional().describe("Project description"),
        ProjectManagerID: z.number().optional().describe("Project manager user ID"),
        AccountManagerID: z.number().optional().describe("Account manager user ID"),
        ContactID: z.number().optional().describe("Contact person ID"),
        CurrencyID: z.number().optional().describe("Currency ID"),
        DepartmentID: z.number().optional().describe("Department ID"),
        ProjectTypeID: z.number().optional().describe("Project type ID"),
        ProjectCategoryID: z.number().optional().describe("Project category ID"),
      }),
    },
    async (params) => {
      const data = await client.post("/v1/project/create-from-template", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
