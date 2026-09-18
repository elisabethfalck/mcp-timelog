#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { TimelogClient } from "./client.js";
import { registerGetCurrentUser } from "./tools/user.js";
import { registerGetWeeklyRegistrations } from "./tools/weekly.js";
import { registerGetRegistrationsByDateRange } from "./tools/range.js";
import { registerGetFinancialData } from "./tools/financial.js";
import { registerGetTimesheetStatus } from "./tools/timesheet.js";
import { registerSearchTasks } from "./tools/search-tasks.js";
import { registerCreateTimeRegistration } from "./tools/create-registration.js";
import { registerUpdateTimeRegistration } from "./tools/update-registration.js";
import { registerDeleteTimeRegistration } from "./tools/delete-registration.js";
import { registerSearchAbsenceCodes } from "./tools/search-absence-codes.js";
import { registerCreateAbsenceRegistration } from "./tools/create-absence-registration.js";
import { registerSubmitTimesheet } from "./tools/submit-timesheet.js";
import { registerGetLegalEntities } from "./tools/legal-entity.js";
import { registerGetProject } from "./tools/project.js";
import { registerGetProjectTasks } from "./tools/project-tasks.js";
import { registerGetHourlyRates } from "./tools/hourly-rates.js";
import { registerGetProjectContracts, registerGetContractHourlyRates } from "./tools/contracts.js";
import { registerGetFixedPriceContractDetails } from "./tools/fixed-price-details.js";
import { registerSearchProjects } from "./tools/search-projects.js";
import { registerCreateTask } from "./tools/create-task.js";
import { registerSearchCustomers } from "./tools/search-customers.js";
import { registerGetProjectTemplates } from "./tools/project-templates.js";
import { registerCreateProject } from "./tools/create-project.js";

const config = loadConfig();
const client = new TimelogClient(config);

const server = new McpServer({
  name: "timelog",
  version: "1.0.0",
});

registerGetCurrentUser(server, client);
registerGetWeeklyRegistrations(server, client);
registerGetRegistrationsByDateRange(server, client);
registerGetFinancialData(server, client);
registerGetTimesheetStatus(server, client);
registerSearchTasks(server, client);
registerCreateTimeRegistration(server, client);
registerUpdateTimeRegistration(server, client);
registerDeleteTimeRegistration(server, client);
registerSearchAbsenceCodes(server, client);
registerCreateAbsenceRegistration(server, client);
registerSubmitTimesheet(server, client);
registerGetLegalEntities(server, client);
registerGetProject(server, client);
registerGetProjectTasks(server, client);
registerGetHourlyRates(server, client);
registerGetProjectContracts(server, client);
registerGetContractHourlyRates(server, client);
registerGetFixedPriceContractDetails(server, client);
registerSearchProjects(server, client);
registerCreateTask(server, client);
registerSearchCustomers(server, client);
registerGetProjectTemplates(server, client);
registerCreateProject(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
