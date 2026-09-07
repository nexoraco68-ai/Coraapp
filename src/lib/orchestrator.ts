import type { BusinessData } from './types';
import { formatRWF, formatPct } from './format';
import {
  AGENT_DEFINITIONS,
  checkPermission,
  isAllowed,
  filterContextForAgent,
  sharedOSAdapter,
  type AgentId,
  type FilteredContext,
  type ResourceId,
} from './permissions';

export type StepStatus = 'pending' | 'running' | 'done' | 'denied' | 'failed';

export interface PermissionCheck {
  agent: AgentId;
  resource: ResourceId;
  action: string;
  granted: boolean;
  reason: string;
  source: string;
  timestamp: string;
}

export interface AgentStep {
  id: string;
  agent: AgentId;
  agentName: string;
  task: string;
  status: StepStatus;
  result?: AgentResult;
  permissionChecks: PermissionCheck[];
  startedAt?: string;
  completedAt?: string;
}

export interface AgentResult {
  agent: AgentId;
  summary: string;
  insights: string[];
  evidence: string;
  recommendations: string[];
  proposedActions?: ProposedAction[];
}

export interface ProposedAction {
  id: string;
  title: string;
  description: string;
  agent: AgentId;
  requiresApproval: boolean;
  actionType: 'send_message' | 'execute_payment' | 'modify_records' | 'trigger_external' | 'review_only';
  status: 'pending_approval' | 'approved' | 'rejected';
  simulation: boolean;
  payload?: Record<string, string>;
}

export interface OrchestrationResult {
  query: string;
  steps: AgentStep[];
  finalRecommendation: FinalRecommendation;
  approvalActions: ProposedAction[];
  startedAt: string;
  completedAt: string;
}

export interface FinalRecommendation {
  topPriority: string;
  why: string;
  agentInsights: { agent: AgentId; agentName: string; insight: string }[];
  recommendedAction: string;
  requiresApproval: boolean;
  proposedActions: ProposedAction[];
}

const AGENT_NAMES: Record<AgentId, string> = {
  ceo: 'CORA CEO',
  cfo: 'CORA CFO',
  sales: 'CORA Sales',
  assistant: 'CORA Assistant',
};

function executeCFO(ctx: FilteredContext): AgentResult {
  const f = ctx.financials!;
  const k = f.kpis;
  const insights: string[] = [];
  const recommendations: string[] = [];
  const evidence: string[] = [];

  if (k.overdueInvoices > 0) {
    insights.push(`${k.overdueInvoices} overdue invoice${k.overdueInvoices === 1 ? '' : 's'} totaling ${formatRWF(k.overdueAmount)} are tying up cash.`);
    recommendations.push('Prioritize collecting overdue payments to free up working capital.');
    evidence.push(`Overdue: ${formatRWF(k.overdueAmount)} across ${k.overdueInvoices} invoices`);
  }

  if (f.expenseAnomalies.length > 0) {
    insights.push(f.expenseAnomalies[0].description);
    recommendations.push(`Review ${f.expenseAnomalies[0].title.toLowerCase()} — it is the fastest-growing cost.`);
    evidence.push(f.expenseAnomalies[0].evidence);
  }

  if (k.profitChange !== null && k.profitChange < 0) {
    insights.push(`Profit decreased ${formatPct(k.profitChange)} — expenses are growing faster than revenue.`);
    recommendations.push('Control expenses before they further compress margins.');
    evidence.push(`Revenue: ${formatPct(k.revenueChange)} | Expenses: ${formatPct(k.expenseChange)} | Profit: ${formatPct(k.profitChange)}`);
  } else if (k.profitMargin < 10) {
    insights.push(`Profit margin is thin at ${k.profitMargin.toFixed(1)}%. Small revenue dips could push the business into a loss.`);
    recommendations.push('Look for ways to improve pricing or reduce costs.');
    evidence.push(`Margin: ${k.profitMargin.toFixed(1)}% | Profit: ${formatRWF(k.estimatedProfit)}`);
  }

  if (k.outstandingAmount > 0 && k.overdueInvoices === 0) {
    insights.push(`${formatRWF(k.outstandingAmount)} is outstanding in partially-paid invoices — not yet overdue but worth monitoring.`);
    evidence.push(`Outstanding (partial): ${formatRWF(k.outstandingAmount)}`);
  }

  if (insights.length === 0) {
    insights.push('Finances are stable. No critical financial risks detected.');
    recommendations.push('Continue monitoring monthly financial trends.');
    evidence.push(`Revenue: ${formatRWF(k.monthlyRevenue)} | Expenses: ${formatRWF(k.totalExpenses)} | Profit: ${formatRWF(k.estimatedProfit)}`);
  }

  return {
    agent: 'cfo',
    summary: `Financial pressure is ${k.overdueInvoices > 0 ? 'driven by delayed collections' : f.expenseAnomalies.length > 0 ? 'driven by rising expenses' : 'not currently a major concern'}.`,
    insights,
    evidence: evidence.join(' | '),
    recommendations,
  };
}

function executeSales(ctx: FilteredContext): AgentResult {
  const c = ctx.customers!;
  const s = ctx.sales!;
  const insights: string[] = [];
  const recommendations: string[] = [];
  const evidence: string[] = [];
  const proposedActions: ProposedAction[] = [];

  const overdueCustomers = c.summaries.filter((cs) => cs.outstandingAmount > 0).sort((a, b) => b.outstandingAmount - a.outstandingAmount);
  const inactiveCustomers = c.summaries.filter((cs) => cs.isInactive).sort((a, b) => b.totalSpent - a.totalSpent);

  if (overdueCustomers.length > 0) {
    const top = overdueCustomers[0];
    insights.push(`${top.customer.name} owes ${formatRWF(top.outstandingAmount)} — the highest outstanding balance.`);
    recommendations.push(`Contact ${top.customer.name} first to recover the largest overdue amount.`);
    evidence.push(`${top.customer.name}: ${formatRWF(top.outstandingAmount)} outstanding`);

    proposedActions.push({
      id: `draft-${top.customer.id}`,
      title: `Draft follow-up message for ${top.customer.name}`,
      description: `Create a personalized payment reminder for ${top.customer.name} who has ${formatRWF(top.outstandingAmount)} outstanding.`,
      agent: 'sales',
      requiresApproval: true,
      actionType: 'send_message',
      status: 'pending_approval',
      simulation: true,
      payload: {
        customer: top.customer.name,
        amount: formatRWF(top.outstandingAmount),
        phone: top.customer.phone,
      },
    });
  }

  if (inactiveCustomers.length > 0) {
    const top = inactiveCustomers[0];
    insights.push(`${inactiveCustomers.length} customer${inactiveCustomers.length === 1 ? '' : 's'} inactive for 60+ days. ${top.customer.name} is the highest-value inactive customer.`);
    recommendations.push(`Re-engage ${top.customer.name} — they have ${formatRWF(top.totalSpent)} in lifetime value.`);
    evidence.push(`${top.customer.name}: ${top.daysSinceLastPurchase} days inactive, ${formatRWF(top.totalSpent)} lifetime`);
  }

  if (s.revenueByProduct.length > 0) {
    const top = s.revenueByProduct[0];
    insights.push(`${top.product} is the top revenue product with ${formatRWF(top.revenue)} across ${top.count} sales.`);
    recommendations.push(`Focus sales effort on ${top.product} — highest revenue generator.`);
    evidence.push(`${top.product}: ${formatRWF(top.revenue)} (${top.count} sales)`);
  }

  if (insights.length === 0) {
    insights.push('No urgent sales opportunities or customer follow-ups needed.');
    recommendations.push('Continue monitoring customer activity and sales trends.');
    evidence.push(`${c.customerCount} customers, ${s.salesCount} total sales`);
  }

  return {
    agent: 'sales',
    summary: overdueCustomers.length > 0
      ? 'The highest-priority follow-ups are customers with overdue invoices.'
      : inactiveCustomers.length > 0
      ? 'Re-engagement opportunity with high-value inactive customers.'
      : 'Sales performance is steady with no urgent follow-ups.',
    insights,
    evidence: evidence.join(' | '),
    recommendations,
    proposedActions,
  };
}

function executeCEO(cfoResult: AgentResult, salesResult: AgentResult): AgentResult {
  const insights: string[] = [];
  const recommendations: string[] = [];
  const evidence: string[] = [];

  const cfoIssues = cfoResult.insights.filter((i) => i.includes('overdue') || i.includes('decreased') || i.includes('surged') || i.includes('thin'));
  const salesIssues = salesResult.insights.filter((i) => i.includes('owes') || i.includes('inactive') || i.includes('overdue'));

  if (cfoIssues.length > 0 && salesIssues.length > 0) {
    insights.push('Cash pressure from overdue payments and expense growth are the top combined risk.');
    recommendations.push('Contact the highest-priority customers first and review spending before purchasing additional inventory.');
    evidence.push(`CFO: ${cfoIssues[0]}`);
    evidence.push(`Sales: ${salesIssues[0]}`);
  } else if (cfoIssues.length > 0) {
    insights.push('Financial pressure is the primary risk — expenses are growing faster than revenue.');
    recommendations.push('Focus on expense control this week before expanding operations.');
    evidence.push(`CFO: ${cfoIssues[0]}`);
  } else if (salesIssues.length > 0) {
    insights.push('Customer follow-up is the primary opportunity — overdue payments and inactive customers need attention.');
    recommendations.push('Prioritize customer outreach to recover revenue and re-engage inactive accounts.');
    evidence.push(`Sales: ${salesIssues[0]}`);
  } else {
    insights.push('Business is stable. No critical risks detected across financial and sales analysis.');
    recommendations.push('Continue monitoring trends and maintain current operations.');
    evidence.push('No critical issues from CFO or Sales analysis');
  }

  return {
    agent: 'ceo',
    summary: 'Combined analysis prioritized. The most urgent issue has been identified.',
    insights,
    evidence: evidence.join(' | '),
    recommendations,
  };
}

type QueryType = 'priorities' | 'cash_pressure' | 'financial' | 'sales' | 'general';

function classifyQuery(query: string): QueryType {
  const q = query.toLowerCase();
  if (q.includes('focus') || q.includes('today') || q.includes('priority') || q.includes('what should i do') || q.includes('action plan') || q.includes('this week')) {
    return 'priorities';
  }
  if (q.includes('cash') || q.includes('money') || q.includes('pressure') || q.includes('liquidity') || q.includes('flow')) {
    return 'cash_pressure';
  }
  if (q.includes('profit') || q.includes('expense') || q.includes('revenue') || q.includes('margin') || q.includes('cost') || q.includes('financial')) {
    return 'financial';
  }
  if (q.includes('customer') || q.includes('sales') || q.includes('product') || q.includes('follow up') || q.includes('contact')) {
    return 'sales';
  }
  return 'general';
}

export function orchestrate(query: string, data: BusinessData): OrchestrationResult {
  const startedAt = new Date().toISOString();
  const queryType = classifyQuery(query);
  const steps: AgentStep[] = [];
  let stepCounter = 0;

  function makeStep(agent: AgentId, task: string): AgentStep {
    return {
      id: `step-${++stepCounter}`,
      agent,
      agentName: AGENT_NAMES[agent],
      task,
      status: 'pending',
      permissionChecks: [],
    };
  }

  function runPermissionCheck(step: AgentStep, resource: ResourceId, action: string): PermissionCheck {
    const actionType = action as 'READ' | 'WRITE' | 'EXECUTE' | 'DRAFT';
    const result = sharedOSAdapter.checkAccess(step.agent, resource, actionType);
    const rule = checkPermission(step.agent, resource, actionType);
    const check: PermissionCheck = {
      agent: step.agent,
      resource,
      action,
      granted: result.granted,
      reason: rule.reason,
      source: result.source,
      timestamp: result.timestamp,
    };
    step.permissionChecks.push(check);
    return check;
  }

  let cfoResult: AgentResult | undefined;
  let salesResult: AgentResult | undefined;
  let ceoResult: AgentResult | undefined;

  if (queryType === 'priorities' || queryType === 'cash_pressure' || queryType === 'general') {
    const cfoStep = makeStep('cfo', 'Analyze revenue, expenses, and outstanding invoices for financial risks.');
    cfoStep.status = 'running';
    cfoStep.startedAt = new Date().toISOString();
    const cfoCtxCheck = runPermissionCheck(cfoStep, 'financial_summary', 'READ');
    runPermissionCheck(cfoStep, 'expenses', 'READ');
    runPermissionCheck(cfoStep, 'invoices', 'READ');
    runPermissionCheck(cfoStep, 'customer_contact_info', 'READ');

    if (cfoCtxCheck.granted) {
      const ctx = filterContextForAgent('cfo', data);
      cfoResult = executeCFO(ctx);
      cfoStep.result = cfoResult;
      cfoStep.status = 'done';
    } else {
      cfoStep.status = 'denied';
    }
    cfoStep.completedAt = new Date().toISOString();
    steps.push(cfoStep);

    const salesStep = makeStep('sales', 'Analyze which customers and invoices require follow-up.');
    salesStep.status = 'running';
    salesStep.startedAt = new Date().toISOString();
    const salesCtxCheck = runPermissionCheck(salesStep, 'customer_data', 'READ');
    runPermissionCheck(salesStep, 'sales_data', 'READ');
    runPermissionCheck(salesStep, 'invoices', 'READ');
    runPermissionCheck(salesStep, 'financial_summary', 'READ');
    runPermissionCheck(salesStep, 'send_message', 'DRAFT');

    if (salesCtxCheck.granted) {
      const ctx = filterContextForAgent('sales', data);
      salesResult = executeSales(ctx);
      salesStep.result = salesResult;
      salesStep.status = 'done';
    } else {
      salesStep.status = 'denied';
    }
    salesStep.completedAt = new Date().toISOString();
    steps.push(salesStep);

    const ceoStep = makeStep('ceo', 'Prioritize the combined findings from CFO and Sales.');
    ceoStep.status = 'running';
    ceoStep.startedAt = new Date().toISOString();
    runPermissionCheck(ceoStep, 'agent_summaries', 'READ');
    runPermissionCheck(ceoStep, 'business_profile', 'READ');
    runPermissionCheck(ceoStep, 'expenses', 'READ');

    if (cfoResult && salesResult) {
      ceoResult = executeCEO(cfoResult, salesResult);
      ceoStep.result = ceoResult;
      ceoStep.status = 'done';
    } else {
      ceoStep.status = 'failed';
    }
    ceoStep.completedAt = new Date().toISOString();
    steps.push(ceoStep);
  } else if (queryType === 'financial') {
    const cfoStep = makeStep('cfo', 'Analyze financial data for the requested question.');
    cfoStep.status = 'running';
    cfoStep.startedAt = new Date().toISOString();
    runPermissionCheck(cfoStep, 'financial_summary', 'READ');
    runPermissionCheck(cfoStep, 'expenses', 'READ');

    const ctx = filterContextForAgent('cfo', data);
    cfoResult = executeCFO(ctx);
    cfoStep.result = cfoResult;
    cfoStep.status = 'done';
    cfoStep.completedAt = new Date().toISOString();
    steps.push(cfoStep);
  } else if (queryType === 'sales') {
    const salesStep = makeStep('sales', 'Analyze customer and sales data for the requested question.');
    salesStep.status = 'running';
    salesStep.startedAt = new Date().toISOString();
    runPermissionCheck(salesStep, 'customer_data', 'READ');
    runPermissionCheck(salesStep, 'sales_data', 'READ');

    const ctx = filterContextForAgent('sales', data);
    salesResult = executeSales(ctx);
    salesStep.result = salesResult;
    salesStep.status = 'done';
    salesStep.completedAt = new Date().toISOString();
    steps.push(salesStep);
  }

  const agentInsights: { agent: AgentId; agentName: string; insight: string }[] = [];
  if (cfoResult) agentInsights.push({ agent: 'cfo', agentName: 'CORA CFO', insight: cfoResult.summary });
  if (salesResult) agentInsights.push({ agent: 'sales', agentName: 'CORA Sales', insight: salesResult.summary });
  if (ceoResult) agentInsights.push({ agent: 'ceo', agentName: 'CORA CEO', insight: ceoResult.summary });

  const approvalActions: ProposedAction[] = [];
  if (salesResult?.proposedActions) {
    approvalActions.push(...salesResult.proposedActions);
  }

  let topPriority = 'No urgent issues detected. Continue monitoring your business.';
  let why = 'No critical risks were identified across the analyzed data.';
  let recommendedAction = 'Continue regular monitoring of your business metrics.';
  let requiresApproval = false;

  if (cfoResult && cfoResult.insights.some((i) => i.includes('overdue'))) {
    topPriority = 'Recover overdue customer payments before increasing spending.';
    why = 'Several customer invoices are overdue while expenses are increasing.';
    recommendedAction = 'Create personalized customer follow-up messages for overdue accounts.';
    requiresApproval = true;
  } else if (cfoResult && cfoResult.insights.some((i) => i.includes('decreased') || i.includes('surged'))) {
    topPriority = 'Control expense growth before it further compresses profit margins.';
    why = 'Expenses are growing faster than revenue, reducing profitability.';
    recommendedAction = 'Review the fastest-growing expense categories and reduce or renegotiate costs.';
  } else if (salesResult && salesResult.insights.some((i) => i.includes('inactive'))) {
    topPriority = 'Re-engage inactive customers to recover lost revenue.';
    why = 'High-value customers have not purchased in 60+ days.';
    recommendedAction = 'Contact the highest-value inactive customer with a re-engagement offer.';
    requiresApproval = true;
  }

  const finalRecommendation: FinalRecommendation = {
    topPriority,
    why,
    agentInsights,
    recommendedAction,
    requiresApproval,
    proposedActions: approvalActions,
  };

  return {
    query,
    steps,
    finalRecommendation,
    approvalActions,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  agent: AgentId;
  agentName: string;
  action: string;
  detail: string;
  type: 'analysis' | 'permission_check' | 'recommendation' | 'approval' | 'collaboration';
}

export function generateActivityLog(result: OrchestrationResult): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  let id = 0;

  for (const step of result.steps) {
    for (const check of step.permissionChecks) {
      entries.push({
        id: `act-${++id}`,
        timestamp: check.timestamp,
        agent: check.agent,
        agentName: AGENT_NAMES[check.agent],
        action: `Permission check: ${check.action} on ${check.resource.replace(/_/g, ' ')}`,
        detail: check.granted ? 'ALLOWED' : 'DENIED',
        type: 'permission_check',
      });
    }

    if (step.status === 'done' && step.result) {
      entries.push({
        id: `act-${++id}`,
        timestamp: step.completedAt ?? new Date().toISOString(),
        agent: step.agent,
        agentName: step.agentName,
        action: step.task,
        detail: step.result.summary,
        type: 'analysis',
      });
    }
  }

  entries.push({
    id: `act-${++id}`,
    timestamp: result.completedAt,
    agent: 'ceo',
    agentName: 'CORA Orchestrator',
    action: 'Generated final recommendation',
    detail: result.finalRecommendation.topPriority,
    type: 'recommendation',
  });

  for (const action of result.approvalActions) {
    entries.push({
      id: `act-${++id}`,
      timestamp: result.completedAt,
      agent: action.agent,
      agentName: AGENT_NAMES[action.agent],
      action: `Proposed action: ${action.title}`,
      detail: action.simulation ? 'Simulation — external integration not connected' : 'Pending approval',
      type: 'approval',
    });
  }

  return entries;
}

export interface AgentStatus {
  agent: AgentId;
  name: string;
  role: string;
  icon: string;
  status: 'idle' | 'analyzing' | 'waiting_approval' | 'done';
  responsibility: string;
  currentTask: string;
  authorizedResources: string[];
  deniedResources: string[];
  recentActivity: string;
}

export function getAgentStatuses(data: BusinessData, lastResult?: OrchestrationResult): AgentStatus[] {
  const agents: AgentId[] = ['ceo', 'cfo', 'sales', 'assistant'];

  return agents.map((agent) => {
    const def = AGENT_DEFINITIONS[agent];
    const allowed = def.permissions.filter((p) => p.allowed).map((p) => p.resource);
    const denied = def.permissions.filter((p) => !p.allowed).map((p) => p.resource);

    let status: AgentStatus['status'] = 'idle';
    let currentTask = 'No active task';
    let recentActivity = 'No recent activity';

    if (lastResult) {
      const step = lastResult.steps.find((s) => s.agent === agent);
      if (step) {
        if (step.status === 'done') {
          status = 'done';
          currentTask = step.task;
          recentActivity = step.result?.summary ?? 'Analysis completed';
        } else if (step.status === 'running') {
          status = 'analyzing';
          currentTask = step.task;
        } else if (step.status === 'denied') {
          status = 'idle';
          currentTask = 'Access denied';
          recentActivity = 'Permission denied for required resource';
        }
      }
    }

    return {
      agent,
      name: def.name,
      role: def.role,
      icon: def.icon,
      status,
      responsibility: def.description,
      currentTask,
      authorizedResources: allowed,
      deniedResources: denied,
      recentActivity,
    };
  });
}
