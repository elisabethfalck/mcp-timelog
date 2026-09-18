# Timelog MCP Server

An [MCP](https://modelcontextprotocol.io) server that exposes the [Timelog](https://www.timelog.com) time registration API as tools for agentic use. It lets you view, create, and manage time registrations, absences, and timesheet approvals through natural language.

## Capabilities

- **View time registrations** — by week or arbitrary date range, including financial/billable data
- **Create, update, and delete** time registrations on any task you have access to
- **Absence management** — search absence codes and register vacation, sick leave, etc.
- **Timesheet approval** — check submission status and submit timesheets, with filtering by employee, department, approver, or legal entity
- **Organization** — look up legal entities and the current user profile
- **Task search** — find tasks to register time on by name or number
- **Projects** — search, view, and create projects, and create tasks/phases on them
- **Contracts & rates** — view project contracts, hourly rates, and fixed-price contract details

## Tools

**User & Organization**
- `get_current_user` — get the authenticated user's profile
- `get_legal_entities` — list legal entities

**Projects & Tasks**
- `search_projects` — find projects by name or number
- `get_project` — get project details by ID
- `get_project_tasks` — list tasks/phases on a project
- `create_task` — create a task or sub-task on a project
- `search_customers` — find customers by name
- `get_project_templates` — list project templates
- `create_project` — create a project from a template

**Contracts & Rates**
- `get_project_contracts` — list contracts for a project
- `get_contract_hourly_rates` — list hourly rates on a contract
- `get_fixed_price_contract_details` — get value, payments, and rates for a fixed-price contract
- `get_hourly_rates` — search hourly rates across the organization

**Time Registrations**
- `get_weekly_registrations` — view a week's registrations
- `get_registrations_by_date_range` — view registrations in a date range, with optional filtering by project/task
- `get_financial_data` — view billable/invoice status for a date range
- `search_tasks` — find tasks you can register time on
- `create_time_registration` — log time on a task
- `update_time_registration` — edit a registration
- `delete_time_registration` — remove a registration

**Absence**
- `search_absence_codes` — find absence codes (vacation, sick leave, etc.)
- `create_absence_registration` — register an absence

**Timesheet Approval**
- `get_timesheet_status` — check submission/approval status (yourself or, as a manager, your team)
- `submit_timesheet` — submit a timesheet for approval, for yourself or on behalf of an employee

## Setup

### Via npx (recommended)

Add to your Claude Code `.mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "timelog": {
      "command": "npx",
      "args": ["-y", "timelog-mcp"],
      "env": {
        "TIMELOG_PAT": "<your-personal-access-token>",
        "TIMELOG_BASE_URL": "https://app[X].timelog.com/<your-account>/api"
      }
    }
  }
}
```

### From source

```bash
git clone git@github.com:Amoeslund/Timelog-MCP-server.git
cd Timelog-MCP-server
npm install
npm run build
```

Then point your MCP config at the built file:

```json
{
  "mcpServers": {
    "timelog": {
      "command": "node",
      "args": ["/path/to/Timelog-MCP-server/dist/index.js"],
      "env": {
        "TIMELOG_PAT": "<your-personal-access-token>",
        "TIMELOG_BASE_URL": "https://app[X].timelog.com/<your-account>/api"
      }
    }
  }
}
```

## Configuration

### Personal Access Token

Generate a PAT at https://login.timelog.com/personaltoken.

### Base URL

Your URL follows the pattern `https://app[X].timelog.com/<your-account>/api` where `[X]` is a server number (1–10) and `<your-account>` is your Timelog account name. See the [Timelog API docs](https://api.timelog.com/rest/swagger) for details.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TIMELOG_PAT` | Yes | Personal Access Token (see above) |
| `TIMELOG_BASE_URL` | Yes | API base URL (see above) |

## License

ISC
