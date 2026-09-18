import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerSearchCustomers(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "search_customers",
    {
      description:
        "Search for customers by name. Returns customer IDs and names. Use the CustomerID with create_project.",
      inputSchema: z.object({
        searchText: z.string().optional().describe("Customer name to search for"),
      }),
    },
    async ({ searchText }) => {
      const params: Record<string, string> = {};
      if (searchText) params.searchText = searchText;
      const data = await client.get("/v1/customer/search-for-time-tracking", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
