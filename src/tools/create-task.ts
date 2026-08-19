import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

export function registerCreateTask(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "create_task",
    {
      description:
        "Create a new task (phase) on a project. Use search_projects to find the ProjectID first.",
      inputSchema: z.object({
        ProjectID: z.number().describe("The project ID to create the task on"),
        TaskName: z.string().describe("Name of the task/phase"),
        TaskNo: z.string().optional().describe("Task number (optional)"),
        Description: z.string().optional().describe("Task description"),
        StartDate: z.string().describe("Start date (YYYY-MM-DD)"),
        EndDate: z.string().describe("End date (YYYY-MM-DD)"),
        BudgetHours: z.number().describe("Budget hours for the task"),
        BudgetAmount: z.number().describe("Budget amount for the task"),
        HourlyRateID: z.number().describe("Hourly rate ID for the task"),
        IsBillable: z.boolean().optional().describe("Whether the task is billable (default from project)"),
        ParentTaskID: z.number().optional().describe("Parent task ID to create a sub-task under"),
      }),
    },
    async ({ ProjectID, TaskName, TaskNo, Description, StartDate, EndDate, BudgetHours, BudgetAmount, HourlyRateID, IsBillable, ParentTaskID }) => {
      const body: Record<string, unknown> = {
        ProjectID,
        TaskName,
        StartDate,
        EndDate,
        BudgetHours,
        BudgetAmount,
        HourlyRateID,
      };
      if (TaskNo !== undefined) body.TaskNo = TaskNo;
      if (Description !== undefined) body.Description = Description;
      if (IsBillable !== undefined) body.IsBillable = IsBillable;

      const endpoint = ParentTaskID !== undefined ? "/v1/task/create-sub-task" : "/v1/task";
      if (ParentTaskID !== undefined) body.ParentTaskID = ParentTaskID;

      const data = await client.post(endpoint, body);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
