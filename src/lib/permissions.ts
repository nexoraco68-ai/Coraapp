import type { BusinessData } from './types';
import {
  getKPIs,
  getMonthlyBuckets,
  getExpensesByCategory,
  getExpenseAnomalies,
  getInvoiceAnomalies,
  getOverdueInvoices,
  getCustomerSummaries,
  getRevenueByProduct,
} from './analytics';

export type AgentId = 'ceo' | 'cfo' | 'sales' | 'assistant';
export type ActionType = 'READ' | 'WRITE' | 'EXECUTE' | 'DRAFT';

export type ResourceId =
  | 'financial_summary'
  | 'expenses'
  | 'revenue'
  | 'invoices'
  | 'customer_data'
  | 'customer_contact_info'
  | 'sales_data'
  | 'product_data'
  | 'agent_summaries'
  | 'business_profile'
  | 'send_message'
  | 'execute_payment'
  | 'modify_records'
  | 'trigger_external'
  | 'request_analysis';

export interface PermissionRule {
  resource: ResourceId;
  action: ActionType;
  allowed: boolean;
  reason: string;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  description: string;
  responsibilities: string[];
  permissions: PermissionRule[];
}

const ALLOW = (resource: ResourceId, action: ActionType, reason: string): PermissionRule => ({
  resource, action, allowed: true, reason,
});

const DENY = (resource: ResourceId, action: ActionType, reason: string): PermissionRule => ({
  resource, action, allowed: false, reason,
});

export const AGENT_DEFINITIONS: Record<AgentId, AgentDefinition> = {
  cfo: {
    id: 'cfo',
    name: 'CORA CFO',
    role: 'Chief Financial Officer',
    icon: 'Wallet',
    description: 'Analyzes revenue, expenses, cash flow, profit margins, and outstanding invoices to detect financial risks.',
    responsibilities: [
      'Analyze revenue and expense trends',
      'Detect cash flow pressure points',
      'Identify expense anomalies',
      'Flag overdue invoice risks',
      'Calculate profit margins',
    ],
    permissions: [
      ALLOW('financial_summary', 'READ', 'CFO needs financial summaries to analyze business health'),
      ALLOW('expenses', 'READ', 'CFO needs expense data to detect cost anomalies'),
      ALLOW('revenue', 'READ', 'CFO needs revenue data to calculate profit'),
      ALLOW('invoices', 'READ', 'CFO needs invoice data to assess outstanding payments'),
      ALLOW('request_analysis', 'READ', 'CFO can request analysis from other agents'),
      DENY('customer_contact_info', 'READ', 'CFO does not need private customer contact details'),
      DENY('send_message', 'EXECUTE', 'CFO cannot send messages to customers'),
      DENY('execute_payment', 'EXECUTE', 'CFO cannot execute payments'),
      DENY('modify_records', 'WRITE', 'CFO cannot modify business records'),
      DENY('trigger_external', 'EXECUTE', 'CFO cannot trigger external services'),
    ],
  },
  sales: {
    id: 'sales',
    name: 'CORA Sales',
    role: 'Sales Director',
    icon: 'TrendingUp',
    description: 'Analyzes customer behavior, sales performance, product trends, and follow-up opportunities to grow revenue.',
    responsibilities: [
      'Analyze customer purchase patterns',
      'Identify inactive customers for re-engagement',
      'Rank products by revenue and profitability',
      'Recommend follow-up actions',
      'Draft customer communication messages',
    ],
    permissions: [
      ALLOW('customer_data', 'READ', 'Sales needs customer data to identify opportunities'),
      ALLOW('sales_data', 'READ', 'Sales needs sales records to analyze performance'),
      ALLOW('product_data', 'READ', 'Sales needs product data to rank performance'),
      ALLOW('invoices', 'READ', 'Sales needs invoice data to identify overdue follow-ups'),
      ALLOW('send_message', 'DRAFT', 'Sales can draft customer messages for approval'),
      ALLOW('request_analysis', 'READ', 'Sales can request analysis from other agents'),
      DENY('financial_summary', 'READ', 'Sales does not have access to full financial records'),
      DENY('expenses', 'READ', 'Sales does not have access to expense data'),
      DENY('revenue', 'READ', 'Sales does not have access to revenue totals'),
      DENY('send_message', 'EXECUTE', 'Sales can draft messages but cannot send them without approval'),
      DENY('execute_payment', 'EXECUTE', 'Sales cannot execute payments'),
      DENY('modify_records', 'WRITE', 'Sales cannot modify business records'),
    ],
  },
  ceo: {
    id: 'ceo',
    name: 'CORA CEO',
    role: 'Chief Executive Officer',
    icon: 'Crown',
    description: 'Synthesizes findings from specialist agents, evaluates business health, and prioritizes strategic actions.',
    responsibilities: [
      'Evaluate overall business health',
      'Prioritize findings from specialist agents',
      'Identify strategic risks and opportunities',
      'Produce actionable recommendations',
      'Coordinate agent collaboration',
    ],
    permissions: [
      ALLOW('agent_summaries', 'READ', 'CEO reads approved summaries from specialist agents'),
      ALLOW('business_profile', 'READ', 'CEO can read the business profile for context'),
      ALLOW('request_analysis', 'READ', 'CEO can request analysis from any specialist agent'),
      ALLOW('financial_summary', 'READ', 'CEO has access to financial summaries for strategic decisions'),
      DENY('expenses', 'READ', 'CEO does not directly access raw expense records — uses CFO summaries'),
      DENY('customer_contact_info', 'READ', 'CEO does not need private customer contact details directly'),
      DENY('send_message', 'EXECUTE', 'CEO cannot send messages directly'),
      DENY('execute_payment', 'EXECUTE', 'CEO cannot execute payments'),
      DENY('modify_records', 'WRITE', 'CEO cannot modify business records'),
      DENY('trigger_external', 'EXECUTE', 'CEO cannot trigger external services'),
    ],
  },
  assistant: {
    id: 'assistant',
    name: 'CORA Assistant',
    role: 'AI Assistant',
    icon: 'MessageSquare',
    description: 'Natural-language interface that understands business context and coordinates with specialist agents.',
    responsibilities: [
      'Understand user questions in natural language',
      'Route questions to the appropriate specialist agent',
      'Coordinate multi-agent collaboration',
      'Explain results in clear, non-technical language',
      'Manage human approval workflow',
    ],
    permissions: [
      ALLOW('request_analysis', 'READ', 'Assistant can ask specialist agents questions'),
      ALLOW('agent_summaries', 'READ', 'Assistant can read approved agent results'),
      ALLOW('business_profile', 'READ', 'Assistant can read business profile for context'),
      DENY('financial_summary', 'READ', 'Assistant does not have direct access to financial data — routes to CFO'),
      DENY('expenses', 'READ', 'Assistant does not have direct access to expense records'),
      DENY('revenue', 'READ', 'Assistant does not have direct access to revenue records'),
      DENY('customer_data', 'READ', 'Assistant does not have direct access to customer records — routes to Sales'),
      DENY('sales_data', 'READ', 'Assistant does not have direct access to sales records'),
      DENY('send_message', 'EXECUTE', 'Assistant cannot send messages'),
      DENY('execute_payment', 'EXECUTE', 'Assistant cannot execute payments'),
      DENY('modify_records', 'WRITE', 'Assistant cannot modify business records'),
      DENY('trigger_external', 'EXECUTE', 'Assistant cannot trigger external services'),
    ],
  },
};

export function checkPermission(agent: AgentId, resource: ResourceId, action: ActionType): PermissionRule {
  const def = AGENT_DEFINITIONS[agent];
  const explicit = def.permissions.find((p) => p.resource === resource && p.action === action);
  if (explicit) return explicit;
  return {
    resource,
    action,
    allowed: false,
    reason: `No explicit permission granted to ${def.name} for ${action} on ${resource}`,
  };
}

export function isAllowed(agent: AgentId, resource: ResourceId, action: ActionType): boolean {
  return checkPermission(agent, resource, action).allowed;
}

export interface FilteredContext {
  agent: AgentId;
  businessName: string;
  isDemo: boolean;
  financials?: {
    kpis: ReturnType<typeof getKPIs>;
    monthlyBuckets: ReturnType<typeof getMonthlyBuckets>;
    expensesByCategory: ReturnType<typeof getExpensesByCategory>;
    expenseAnomalies: ReturnType<typeof getExpenseAnomalies>;
    invoiceAnomalies: ReturnType<typeof getInvoiceAnomalies>;
    overdueInvoices: ReturnType<typeof getOverdueInvoices>;
  };
  customers?: {
    summaries: ReturnType<typeof getCustomerSummaries>;
    customerCount: number;
  };
  sales?: {
    revenueByProduct: ReturnType<typeof getRevenueByProduct>;
    totalRevenue: number;
    salesCount: number;
  };
  products?: {
    list: { id: string; name: string; category: string; sellingPrice: number; cost: number }[];
  };
  invoices?: {
    overdue: ReturnType<typeof getOverdueInvoices>;
    outstanding: { invoiceNumber: string; customerId: string; amount: number; paidAmount: number; status: string }[];
  };
  businessProfile?: {
    name: string;
    type: string;
    industry: string;
    country: string;
    city: string;
    currency: string;
    description: string;
    employees: number;
  };
}

export function filterContextForAgent(agent: AgentId, data: BusinessData): FilteredContext {
  const ctx: FilteredContext = {
    agent,
    businessName: data.business.name,
    isDemo: data.business.isDemo,
  };

  if (isAllowed(agent, 'financial_summary', 'READ') || isAllowed(agent, 'expenses', 'READ') || isAllowed(agent, 'revenue', 'READ')) {
    ctx.financials = {
      kpis: getKPIs(data),
      monthlyBuckets: getMonthlyBuckets(data),
      expensesByCategory: getExpensesByCategory(data),
      expenseAnomalies: getExpenseAnomalies(data),
      invoiceAnomalies: getInvoiceAnomalies(data),
      overdueInvoices: getOverdueInvoices(data),
    };
  }

  if (isAllowed(agent, 'customer_data', 'READ')) {
    ctx.customers = {
      summaries: getCustomerSummaries(data),
      customerCount: data.customers.length,
    };
  }

  if (isAllowed(agent, 'sales_data', 'READ')) {
    ctx.sales = {
      revenueByProduct: getRevenueByProduct(data),
      totalRevenue: data.sales.reduce((s, x) => s + x.revenue, 0),
      salesCount: data.sales.length,
    };
  }

  if (isAllowed(agent, 'product_data', 'READ')) {
    ctx.products = {
      list: data.products.map((p) => ({ id: p.id, name: p.name, category: p.category, sellingPrice: p.sellingPrice, cost: p.cost })),
    };
  }

  if (isAllowed(agent, 'invoices', 'READ')) {
    ctx.invoices = {
      overdue: getOverdueInvoices(data),
      outstanding: data.invoices
        .filter((i) => i.status === 'overdue' || i.status === 'partial')
        .map((i) => ({ invoiceNumber: i.invoiceNumber, customerId: i.customerId, amount: i.amount, paidAmount: i.paidAmount, status: i.status })),
    };
  }

  if (isAllowed(agent, 'business_profile', 'READ')) {
    ctx.businessProfile = {
      name: data.business.name,
      type: data.business.type,
      industry: data.business.industry,
      country: data.business.country,
      city: data.business.city,
      currency: data.business.currency,
      description: data.business.description,
      employees: data.business.employees,
    };
  }

  return ctx;
}

export interface PermissionMatrixEntry {
  agent: AgentId;
  agentName: string;
  resource: ResourceId;
  action: ActionType;
  status: 'ALLOWED' | 'DENIED';
  reason: string;
}

const ALL_RESOURCES: { resource: ResourceId; action: ActionType }[] = [
  { resource: 'financial_summary', action: 'READ' },
  { resource: 'expenses', action: 'READ' },
  { resource: 'revenue', action: 'READ' },
  { resource: 'invoices', action: 'READ' },
  { resource: 'customer_data', action: 'READ' },
  { resource: 'customer_contact_info', action: 'READ' },
  { resource: 'sales_data', action: 'READ' },
  { resource: 'product_data', action: 'READ' },
  { resource: 'agent_summaries', action: 'READ' },
  { resource: 'business_profile', action: 'READ' },
  { resource: 'send_message', action: 'DRAFT' },
  { resource: 'send_message', action: 'EXECUTE' },
  { resource: 'execute_payment', action: 'EXECUTE' },
  { resource: 'modify_records', action: 'WRITE' },
  { resource: 'trigger_external', action: 'EXECUTE' },
  { resource: 'request_analysis', action: 'READ' },
];

export function getFullPermissionMatrix(): PermissionMatrixEntry[] {
  const agents: AgentId[] = ['cfo', 'sales', 'ceo', 'assistant'];
  const entries: PermissionMatrixEntry[] = [];
  for (const agent of agents) {
    const def = AGENT_DEFINITIONS[agent];
    for (const { resource, action } of ALL_RESOURCES) {
      const rule = checkPermission(agent, resource, action);
      entries.push({
        agent,
        agentName: def.name,
        resource,
        action,
        status: rule.allowed ? 'ALLOWED' : 'DENIED',
        reason: rule.reason,
      });
    }
  }
  return entries;
}

export const RESOURCE_LABELS: Record<string, string> = {
  financial_summary: 'Financial Data',
  expenses: 'Expense Records',
  revenue: 'Revenue Records',
  invoices: 'Invoice Data',
  customer_data: 'Customer Data',
  customer_contact_info: 'Customer Private Notes',
  sales_data: 'Sales Records',
  product_data: 'Product Catalog',
  agent_summaries: 'Agent Summaries',
  business_profile: 'Business Profile',
  send_message: 'Send Messages',
  execute_payment: 'Execute Payments',
  modify_records: 'Modify Records',
  trigger_external: 'Trigger External Services',
  request_analysis: 'Request Agent Analysis',
};

export interface SharedOSPermissionResult {
  granted: boolean;
  agent: AgentId;
  resource: ResourceId;
  action: ActionType;
  source: 'local-policy' | 'sharedos-sdk';
  timestamp: string;
}

export interface SharedOSAdapter {
  checkAccess(agent: AgentId, resource: ResourceId, action: ActionType): SharedOSPermissionResult;
  isSDKConnected: boolean;
  sdkVersion: string | null;
}

export const sharedOSAdapter: SharedOSAdapter = {
  isSDKConnected: false,
  sdkVersion: null,
  checkAccess(agent: AgentId, resource: ResourceId, action: ActionType): SharedOSPermissionResult {
    const rule = checkPermission(agent, resource, action);
    return {
      granted: rule.allowed,
      agent,
      resource,
      action,
      source: 'local-policy',
      timestamp: new Date().toISOString(),
    };
  },
};
