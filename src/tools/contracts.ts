import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerGetProjectContracts(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_project_contracts",
    {
      description:
        "Get all contracts for a project. Returns contract ID, name, type (Fixed Price / Time & Material), status, and whether it's the main contract. Use the contractId with get_contract_hourly_rates to see rates.",
      inputSchema: z.object({
        projectId: z.number().describe("The project ID to list contracts for"),
      }),
    },
    async ({ projectId }) => {
      const data = await client.get("/v1/contract", { projectId: String(projectId) });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}

export function registerGetContractHourlyRates(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_contract_hourly_rates",
    {
      description:
        "Get all hourly rates configured on a specific contract. Returns rate name (role), amount, currency, type, and active status. Use get_project_contracts first to find the contractId.",
      inputSchema: z.object({
        contractId: z.number().describe("The contract ID to get hourly rates for"),
      }),
    },
    async ({ contractId }) => {
      const data = await client.get("/v1/contract-hourly-rate", { contractId: String(contractId) });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
