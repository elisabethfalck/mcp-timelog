import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

interface RegistrationEntity {
  Properties?: {
    ProjectID?: number;
    ProjectNo?: string;
    TaskID?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RegistrationPage {
  Properties?: { TotalRecord?: string; TotalPage?: string; PageNumber?: string };
  Entities?: RegistrationEntity[];
  [key: string]: unknown;
}

export function registerGetRegistrationsByDateRange(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_registrations_by_date_range",
    {
      description:
        "Get time registrations between two dates. Results are paginated by the API (default page size ~20); pass pageNumber/pageSize to page manually, or projectId/taskId to have the tool auto-page through all results and return only matching registrations.",
      inputSchema: z.object({
        startDate: z.string().describe("Start date YYYY-MM-DD"),
        endDate: z.string().describe("End date YYYY-MM-DD"),
        pageNumber: z.number().optional().describe("Page number to fetch (default 1). Ignored when projectId or taskId is set."),
        pageSize: z.number().optional().describe("Results per page (default ~20). Ignored when projectId or taskId is set."),
        projectId: z.number().optional().describe("Only return registrations for this project. Auto-paginates through all results."),
        taskId: z.number().optional().describe("Only return registrations for this task. Auto-paginates through all results."),
        projectNo: z.string().optional().describe("Only return registrations whose ProjectNo matches this value. Auto-paginates through all results."),
        maxPages: z.number().optional().describe("Safety cap on pages fetched when auto-paginating (default 100)"),
      }),
    },
    async ({ startDate, endDate, pageNumber, pageSize, projectId, taskId, projectNo, maxPages }) => {
      if (projectId === undefined && taskId === undefined && projectNo === undefined) {
        const params: Record<string, string> = { startDate, endDate };
        if (pageNumber) params.pageNumber = String(pageNumber);
        if (pageSize) params.pageSize = String(pageSize);
        const data = await client.get("/v1/time-tracking-item/get-by-date", params);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        };
      }

      const cap = maxPages ?? 100;
      const matched: RegistrationEntity[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const data = await client.get<RegistrationPage>("/v1/time-tracking-item/get-by-date", {
          startDate,
          endDate,
          pageNumber: String(page),
        });
        totalPages = Number(data.Properties?.TotalPage ?? "1") || 1;
        for (const entity of data.Entities ?? []) {
          const props = entity.Properties;
          if (projectId !== undefined && props?.ProjectID !== projectId) continue;
          if (taskId !== undefined && props?.TaskID !== taskId) continue;
          if (projectNo !== undefined && props?.ProjectNo !== projectNo) continue;
          matched.push(entity);
        }
        page++;
      } while (page <= totalPages && page <= cap);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { matchCount: matched.length, pagesScanned: page - 1, totalPages, entities: matched },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
