import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerGetHourlyRates(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_hourly_rates",
    {
      description:
        "Get hourly rates defined in Timelog. Returns rate name, amount, currency, customer, and active status. Use searchText to filter by name. Results are paginated.",
      inputSchema: z.object({
        searchText: z.string().optional().describe("Filter rates by name (case-insensitive substring match)"),
        pageSize: z.number().optional().describe("Number of results per page (default 10)"),
        pageNumber: z.number().optional().describe("Page number (default 1)"),
      }),
    },
    async ({ searchText, pageSize, pageNumber }) => {
      const params: Record<string, string> = {};
      if (pageSize) params.pageSize = String(pageSize);
      if (pageNumber) params.pageNumber = String(pageNumber);
      const data = await client.get<{ Properties: Record<string, string>; Entities?: Array<{ Properties: Record<string, unknown> }> }>("/v1/hourly-rate", params);

      // Client-side filter since the API doesn't support server-side text filtering
      if (searchText && data.Entities) {
        const lower = searchText.toLowerCase();
        data.Entities = data.Entities.filter(
          (e) => String(e.Properties.HourlyRateName ?? "").toLowerCase().includes(lower),
        );
        (data.Properties as Record<string, string>).TotalRecord = String(data.Entities.length);
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
