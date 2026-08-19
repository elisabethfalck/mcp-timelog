import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TimelogClient } from "../client.js";

interface ContractEntity {
  Properties: {
    ContractID: number;
    ContractName: string;
    ContractModelType: number;
    ContractStatus: number;
    IsMainContract: boolean;
    ProjectID: number;
  };
}

interface PaymentEntity {
  Properties: {
    PaymentID: number;
    Amount: number;
    InvoiceDate: string;
    IsReadyForInvoicing: boolean;
    TaskID: number;
    Quantity: number;
    Rate: number;
    IsFixedPricePayment: boolean;
    ProjectSubContractID: number;
  };
}

interface TaskEntity {
  Properties: {
    TaskID: number;
    Name: string;
    IsFixedPrice: boolean;
    IsDefaultBillable: boolean;
  };
}

interface ContractHourlyRateEntity {
  Properties: {
    ContractHourlyRateID: number;
    Name: string;
    Amount: number;
    CurrencyISO: string;
    IsActive: boolean;
    Type: string;
  };
}

interface PaginatedResponse<T> {
  Properties: { TotalRecord: string; TotalPage: string; PageNumber: string };
  Entities: T[];
}

export function registerGetFixedPriceContractDetails(server: McpServer, client: TimelogClient) {
  server.registerTool(
    "get_fixed_price_contract_details",
    {
      description:
        "Get complete details for a fixed-price contract: contract value (from payment plan), payment schedule, linked fixed-price tasks/phases, and configured hourly rates. The contract value is the total price agreed with the client. For FP contracts, hourly rates are typically 0 (billing isn't per-hour) — use the overall project financial data to compute effective rates.",
      inputSchema: z.object({
        contractId: z.number().describe("The contract ID (from get_project_contracts)"),
        projectId: z.number().describe("The project ID the contract belongs to"),
      }),
    },
    async ({ contractId, projectId }) => {
      // 1. Get contract info
      const contract = await client.get<{ Properties: ContractEntity["Properties"] }>(`/v1/contract/${contractId}`);

      // 2. Get payment plan (contract value)
      const payments = await client.get<PaginatedResponse<PaymentEntity>>("/v1/payment", {
        contractId: String(contractId),
      });

      // Deduplicate payments by PaymentID (API returns duplicates with different ProductNumberIDs)
      const uniquePayments = new Map<number, PaymentEntity["Properties"]>();
      for (const p of payments.Entities || []) {
        if (!uniquePayments.has(p.Properties.PaymentID)) {
          uniquePayments.set(p.Properties.PaymentID, p.Properties);
        }
      }
      const totalContractValue = [...uniquePayments.values()].reduce((sum, p) => sum + p.Amount, 0);

      // 3. Get project tasks and filter to fixed-price ones
      const tasks = await client.get<PaginatedResponse<TaskEntity>>("/v1/task", {
        projectId: String(projectId),
        pageSize: "100",
      });
      const fpTasks = (tasks.Entities || []).filter(t => t.Properties.IsFixedPrice);

      // 4. Get contract hourly rates
      const rates = await client.get<PaginatedResponse<ContractHourlyRateEntity>>("/v1/contract-hourly-rate", {
        contractId: String(contractId),
      });

      const statusMap: Record<number, string> = { 0: "Quotation", 1: "Quotation", 2: "Active", 3: "Completed", 4: "Cancelled" };

      const result = {
        contract: {
          contractId: contract.Properties.ContractID,
          name: contract.Properties.ContractName,
          type: contract.Properties.ContractModelType === 2 ? "Fixed Price" : contract.Properties.ContractModelType === 1 ? "Time & Material" : `Type ${contract.Properties.ContractModelType}`,
          status: statusMap[contract.Properties.ContractStatus] || `Status ${contract.Properties.ContractStatus}`,
          isMainContract: contract.Properties.IsMainContract,
        },
        paymentPlan: {
          totalContractValue,
          currency: "DKK",
          payments: [...uniquePayments.values()].map(p => ({
            paymentId: p.PaymentID,
            amount: p.Amount,
            rate: p.Rate,
            quantity: p.Quantity,
            invoiceDate: p.InvoiceDate?.slice(0, 10),
            isReadyForInvoicing: p.IsReadyForInvoicing,
          })),
        },
        fixedPriceTasks: fpTasks.map(t => ({
          taskId: t.Properties.TaskID,
          taskName: t.Properties.Name.trim(),
          isBillable: t.Properties.IsDefaultBillable,
        })),
        configuredHourlyRates: (rates.Entities || []).map(r => ({
          name: r.Properties.Name,
          amount: r.Properties.Amount,
          currency: r.Properties.CurrencyISO,
          isActive: r.Properties.IsActive,
          type: r.Properties.Type,
        })),
        note: "For fixed-price contracts, hourly rates are often 0 DKK (billing is a lump sum, not per hour). To see the effective hourly rate being consumed, use get_financial_data with the project to compare total hours worked against the contract value.",
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
