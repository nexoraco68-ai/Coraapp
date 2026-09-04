import type { BusinessData, Customer } from './types';
import { formatRWF, formatPct, daysSince } from './format';
import {
  getKPIs,
  getMonthlyBuckets,
  getCustomerSummaries,
  getRevenueByProduct,
  getExpensesByCategory,
  getExpenseAnomalies,
  getInvoiceAnomalies,
  getOverdueInvoices,
  getCustomerName,
} from './analytics';
import type { CustomerSummary } from './analytics';

export interface AIResponse {
  answer: string;
  why: string;
  evidence: string;
  action: string;
}

type Handler = (data: BusinessData) => AIResponse;

const handlers: { keywords: string[]; handler: Handler }[] = [
  {
    keywords: ['how is my business', 'business doing', 'business summary', 'summary of my business', 'give me a summary', 'overview'],
    handler: (data) => {
      const k = getKPIs(data);
      const buckets = getMonthlyBuckets(data);
      const current = buckets[buckets.length - 1];
      const margin = k.profitMargin.toFixed(1);
      const health = k.profitMargin > 15 ? 'healthy' : k.profitMargin > 5 ? 'stable but pressured' : 'at risk';
      return {
        answer: `Your business is ${health}. This month you earned ${formatRWF(k.monthlyRevenue)} in revenue with an estimated profit of ${formatRWF(k.estimatedProfit)} (${margin}% margin). You have ${k.customerCount} customers and ${k.overdueInvoices} overdue invoice${k.overdueInvoices === 1 ? '' : 's'}.`,
        why: `Revenue ${formatPct(k.revenueChange)} and expenses ${formatPct(k.expenseChange)} vs last month. Profit ${formatPct(k.profitChange)}.`,
        evidence: `Revenue: ${formatRWF(k.monthlyRevenue)} | Expenses: ${formatRWF(k.totalExpenses)} | Profit: ${formatRWF(k.estimatedProfit)} | Margin: ${margin}% | Overdue: ${formatRWF(k.overdueAmount)}`,
        action: k.expenseChange !== null && k.expenseChange > k.revenueChange!
          ? 'Focus on controlling expenses — they are growing faster than revenue.'
          : 'Keep pushing sales and follow up on overdue invoices to improve cash flow.',
      };
    },
  },
  {
    keywords: ['who owes me the most', 'owes me', 'most money', 'biggest debt', 'highest outstanding'],
    handler: (data) => {
      const summaries = getCustomerSummaries(data);
      const sorted = summaries.filter((c) => c.outstandingAmount > 0).sort((a, b) => b.outstandingAmount - a.outstandingAmount);
      if (sorted.length === 0) {
        return { answer: 'No customers currently owe you money.', why: 'All invoices are paid in full.', evidence: '0 RWF outstanding across all customers.', action: 'No action needed — keep monitoring new invoices.' };
      }
      const top = sorted[0];
      const overdue = getOverdueInvoices(data).filter((i) => i.customerId === top.customer.id);
      return {
        answer: `${top.customer.name} owes you the most: ${formatRWF(top.outstandingAmount)}${overdue.length > 0 ? ' (overdue)' : ''}.`,
        why: 'They have unpaid or partially paid invoices with the highest outstanding balance.',
        evidence: `${top.customer.name} — ${formatRWF(top.outstandingAmount)} outstanding. Contact: ${top.customer.phone}.`,
        action: `Contact ${top.customer.name} at ${top.customer.phone} and request payment. Use the Payment Recovery page to generate a reminder.`,
      };
    },
  },
  {
    keywords: ['follow up', 'who should i contact', 'customers to contact', 'who to call', 'reach out'],
    handler: (data) => {
      const summaries = getCustomerSummaries(data);
      const inactive = summaries.filter((c) => c.isInactive).sort((a, b) => b.totalSpent - a.totalSpent);
      const overdueCust = summaries.filter((c) => c.outstandingAmount > 0);
      if (inactive.length === 0 && overdueCust.length === 0) {
        return { answer: 'No customers need urgent follow-up right now.', why: 'All customers are active and invoices are current.', evidence: '0 inactive customers, 0 overdue invoices.', action: 'Keep monitoring customer activity weekly.' };
      }
      const topInactive = inactive.slice(0, 3);
      return {
        answer: `You should follow up with ${inactive.length} inactive customer${inactive.length === 1 ? '' : 's'} and ${overdueCust.length} customer${overdueCust.length === 1 ? '' : 's'} with overdue invoices.`,
        why: 'Inactive customers represent lost revenue potential, and overdue invoices tie up your cash flow.',
        evidence: topInactive.map((c) => `${c.customer.name}: last purchase ${c.daysSinceLastPurchase} days ago, ${formatRWF(c.totalSpent)} lifetime value`).join('; '),
        action: `Start with ${topInactive[0].customer.name} (${topInactive[0].customer.phone}) — highest-value inactive customer.`,
      };
    },
  },
  {
    keywords: ['hurting my profit', 'profit fall', 'profit down', 'why did my profit', 'profit decrease', 'low profit'],
    handler: (data) => {
      const k = getKPIs(data);
      const buckets = getMonthlyBuckets(data);
      const current = buckets[buckets.length - 1];
      const prev = buckets[buckets.length - 2];
      const anomalies = getExpenseAnomalies(data);
      const topAnomaly = anomalies[0];
      return {
        answer: k.profitChange !== null && k.profitChange < 0
          ? `Your profit fell ${formatPct(k.profitChange)} this month. The main cause is expenses growing faster than revenue.`
          : `Your profit is ${formatPct(k.profitChange)} but margins are under pressure from rising expenses.`,
        why: `Revenue grew ${formatPct(k.revenueChange)} but expenses grew ${formatPct(k.expenseChange)}.`,
        evidence: topAnomaly ? topAnomaly.evidence : `Revenue: ${formatRWF(prev.revenue)} → ${formatRWF(current.revenue)} | Expenses: ${formatRWF(prev.expenses)} → ${formatRWF(current.expenses)}`,
        action: topAnomaly ? topAnomaly.description : 'Review your expense categories and cut or renegotiate the fastest-growing costs.',
      };
    },
  },
  {
    keywords: ['expense', 'expenses increased', 'which expenses', 'spending', 'cost'],
    handler: (data) => {
      const cats = getExpensesByCategory(data);
      const buckets = getMonthlyBuckets(data);
      const current = buckets[buckets.length - 1];
      const prev = buckets[buckets.length - 2];
      // category-level change
      const catChanges: { category: string; change: number | null }[] = [];
      const curMap = new Map<string, number>();
      const prevMap = new Map<string, number>();
      for (const e of data.expenses) {
        const k = e.date.slice(0, 7);
        if (k === current.key) curMap.set(e.category, (curMap.get(e.category) ?? 0) + e.amount);
        if (k === prev.key) prevMap.set(e.category, (prevMap.get(e.category) ?? 0) + e.amount);
      }
      for (const [cat, cur] of curMap) {
        const p = prevMap.get(cat) ?? 0;
        catChanges.push({ category: cat, change: p > 0 ? ((cur - p) / p) * 100 : null });
      }
      catChanges.sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity));
      const top = catChanges[0];
      return {
        answer: top && top.change !== null
          ? `${top.category} had the biggest increase: ${formatPct(top.change)} vs last month.`
          : 'No significant expense increases detected.',
        why: 'Comparing this month\'s expense categories against last month reveals the fastest-growing costs.',
        evidence: catChanges.slice(0, 3).map((c) => `${c.category}: ${c.change !== null ? formatPct(c.change) : 'N/A'}`).join(' | '),
        action: top ? `Review ${top.category} costs and negotiate or reduce recurring charges.` : 'Keep monitoring expenses monthly.',
      };
    },
  },
  {
    keywords: ['most profitable product', 'profitable product', 'most profitable', 'best margin', 'highest margin'],
    handler: (data) => {
      const productMap = new Map<string, { revenue: number; cost: number; count: number }>();
      for (const s of data.sales) {
        const key = s.product;
        if (!productMap.has(key)) productMap.set(key, { revenue: 0, cost: 0, count: 0 });
        const entry = productMap.get(key)!;
        entry.revenue += s.revenue;
        entry.cost += s.cost;
        entry.count += 1;
      }
      const ranked = Array.from(productMap.entries())
        .map(([product, v]) => ({ product, profit: v.revenue - v.cost, margin: v.revenue > 0 ? ((v.revenue - v.cost) / v.revenue) * 100 : 0, ...v }))
        .sort((a, b) => b.profit - a.profit);
      if (ranked.length === 0) {
        return { answer: 'No sales data available to calculate product profitability.', why: 'No sales have been recorded yet.', evidence: '0 sales recorded.', action: 'Record sales to see profitability analysis.' };
      }
      const top = ranked[0];
      return {
        answer: `${top.product} is your most profitable product, generating ${formatRWF(top.profit)} in profit (${top.margin.toFixed(1)}% margin) across ${top.count} sales.`,
        why: 'Profit is calculated as revenue minus cost for each product. The product with the highest total profit is the most profitable.',
        evidence: ranked.slice(0, 3).map((p) => `${p.product}: ${formatRWF(p.profit)} profit (${p.margin.toFixed(1)}% margin)`).join(' | '),
        action: `Focus on selling more of ${top.product} — it delivers the most profit per sale.`,
      };
    },
  },
  {
    keywords: ['best product', 'best selling', 'top product', 'best products', 'highest revenue product'],
    handler: (data) => {
      const products = getRevenueByProduct(data);
      const top = products[0];
      const second = products[1];
      return {
        answer: `${top.product} is your best-selling product, generating ${formatRWF(top.revenue)} across ${top.count} sales.`,
        why: 'It has the highest total revenue across all recorded sales.',
        evidence: products.slice(0, 3).map((p) => `${p.product}: ${formatRWF(p.revenue)} (${p.count} sales)`).join(' | '),
        action: second ? `Continue promoting ${top.product} and consider bundling with ${second.product}.` : `Continue promoting ${top.product}.`,
      };
    },
  },
  {
    keywords: ['best customer', 'top customer', 'highest value customer', 'best customers', 'most valuable'],
    handler: (data) => {
      const summaries = getCustomerSummaries(data);
      const sorted = [...summaries].sort((a, b) => b.totalSpent - a.totalSpent);
      const top = sorted[0];
      return {
        answer: `${top.customer.name} is your best customer, with ${formatRUF(top.totalSpent)} in total purchases across ${top.purchaseCount} transactions.`,
        why: 'They have the highest lifetime spend of all customers.',
        evidence: sorted.slice(0, 3).map((c) => `${c.customer.name}: ${formatRUF(c.totalSpent)} (${c.purchaseCount} purchases)`).join(' | '),
        action: `Keep ${top.customer.name} happy — offer loyalty perks and check in regularly.`,
      };
    },
  },
  {
    keywords: ['inactive customer', 'inactive', 'not purchased', "haven't purchased", 'churned', 'lost customers'],
    handler: (data) => {
      const summaries = getCustomerSummaries(data);
      const inactive = summaries.filter((c) => c.isInactive).sort((a, b) => b.totalSpent - a.totalSpent);
      if (inactive.length === 0) {
        return { answer: 'All your customers are active.', why: 'No customer has been inactive for 60+ days.', evidence: '0 inactive customers.', action: 'No action needed.' };
      }
      return {
        answer: `${inactive.length} customer${inactive.length === 1 ? '' : 's'} have not purchased in 60+ days.`,
        why: 'These customers may have churned or shifted to competitors.',
        evidence: inactive.slice(0, 3).map((c) => `${c.customer.name}: ${c.daysSinceLastPurchase} days ago, ${formatRUF(c.totalSpent)} lifetime`).join(' | '),
        action: `Contact ${inactive[0].customer.name} first — highest lifetime value among inactive customers (${inactive[0].customer.phone}).`,
      };
    },
  },
  {
    keywords: ['focus on this week', 'what should i do', 'priorities', 'action plan', 'this week', 'what next'],
    handler: (data) => {
      const k = getKPIs(data);
      const summaries = getCustomerSummaries(data);
      const inactive = summaries.filter((c) => c.isInactive);
      const overdue = getOverdueInvoices(data);
      const anomalies = getExpenseAnomalies(data);
      const priorities: string[] = [];
      if (overdue.length > 0) priorities.push(`Follow up on ${overdue.length} overdue invoice${overdue.length === 1 ? '' : 's'} (${formatRUF(k.overdueAmount)} outstanding).`);
      if (inactive.length > 0) priorities.push(`Re-engage ${inactive.length} inactive customer${inactive.length === 1 ? '' : 's'} — start with the highest-value one.`);
      if (anomalies.length > 0) priorities.push(`Review ${anomalies[0].title.toLowerCase()} — it is compressing your margins.`);
      const topProduct = getRevenueByProduct(data)[0];
      if (topProduct) priorities.push(`Focus sales effort on ${topProduct.product} — your highest-revenue product.`);
      return {
        answer: `Here is your action plan for this week:\n${priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
        why: 'These priorities are calculated from overdue invoices, inactive customers, expense anomalies, and product performance.',
        evidence: `${overdue.length} overdue invoices, ${inactive.length} inactive customers, ${anomalies.length} expense anomalies detected.`,
        action: 'Start with overdue invoices — they directly impact your cash flow.',
      };
    },
  },
  {
    keywords: ['overdue', 'late payment', 'unpaid invoice', 'payment overdue'],
    handler: (data) => {
      const overdue = getOverdueInvoices(data);
      const k = getKPIs(data);
      if (overdue.length === 0) {
        return { answer: 'You have no overdue invoices.', why: 'All invoices are current.', evidence: '0 overdue invoices.', action: 'No action needed.' };
      }
      return {
        answer: `You have ${overdue.length} overdue invoice${overdue.length === 1 ? '' : 's'} totaling ${formatRUF(k.overdueAmount)}.`,
        why: 'These invoices are past their due date with unpaid balances.',
        evidence: overdue.map((i) => `${i.invoiceNumber} — ${getCustomerName(data, i.customerId)}: ${formatRUF(i.amount - i.paidAmount)}`).join('; '),
        action: 'Send payment reminders via the Payment Recovery page. Start with the oldest overdue invoice.',
      };
    },
  },
  {
    keywords: ['cash flow', 'cashflow', 'money', 'where is my money', 'liquidity'],
    handler: (data) => {
      const k = getKPIs(data);
      const buckets = getMonthlyBuckets(data);
      const current = buckets[buckets.length - 1];
      return {
        answer: `Your cash flow this month: ${formatRUF(k.monthlyRevenue)} in revenue minus ${formatRUF(k.totalExpenses)} in expenses = ${formatRUF(k.estimatedProfit)} net. However, ${formatRUF(k.outstandingAmount)} is tied up in unpaid invoices.`,
        why: 'Cash flow is revenue minus expenses, but unpaid invoices mean not all revenue has been collected.',
        evidence: `Revenue: ${formatRUF(k.monthlyRevenue)} | Expenses: ${formatRUF(k.totalExpenses)} | Outstanding: ${formatRUF(k.outstandingAmount)} | Overdue: ${formatRUF(k.overdueAmount)}`,
        action: k.overdueAmount > 0 ? `Collect ${formatRUF(k.overdueAmount)} in overdue invoices to improve cash flow.` : 'Keep monitoring receivables closely.',
      };
    },
  },
];

function formatRUF(n: number): string {
  return formatRWF(n);
}

export function answerQuestion(question: string, data: BusinessData): AIResponse {
  const q = question.toLowerCase().trim();
  // Find best matching handler by keyword overlap
  let best: { handler: Handler; score: number } | null = null;
  for (const h of handlers) {
    for (const kw of h.keywords) {
      if (q.includes(kw)) {
        const score = kw.length; // longer keyword = more specific
        if (!best || score > best.score) best = { handler: h.handler, score };
      }
    }
  }
  if (best) return best.handler(data);

  // Fallback: general summary
  const k = getKPIs(data);
  return {
    answer: `I can help with questions about your revenue, expenses, profit, customers, invoices, and sales opportunities. Try asking "How is my business doing?" or "What should I focus on this week?"`,
    why: 'Your question did not match a specific analysis, but here is a quick snapshot.',
    evidence: `Revenue: ${formatRUF(k.monthlyRevenue)} | Profit: ${formatRUF(k.estimatedProfit)} | Customers: ${k.customerCount} | Overdue: ${formatRUF(k.overdueAmount)}`,
    action: 'Try one of the suggested questions above for a detailed answer.',
  };
}

export const suggestedQuestions = [
  'How is my business doing?',
  'What should I focus on this week?',
  'Who owes me the most?',
  'What is hurting my profit?',
  'What is my most profitable product?',
  'Which expenses increased?',
  'What are my best products?',
  'Who are my best customers?',
  'Which customers are inactive?',
  'Where is my money?',
];

// ---- CEO / CFO / Sales structured analysis ----

export interface Diagnosis {
  what: string;
  evidence: string;
  cause: string;
  impact: string;
  action: string;
}

export function getCEODiagnosis(data: BusinessData): Diagnosis {
  const k = getKPIs(data);
  const buckets = getMonthlyBuckets(data);
  const anomalies = [...getExpenseAnomalies(data), ...getInvoiceAnomalies(data)];
  const summaries = getCustomerSummaries(data);
  const inactive = summaries.filter((c) => c.isInactive);

  let what: string;
  let evidence: string;
  let cause: string;
  let impact: string;
  let action: string;

  if (k.profitChange !== null && k.profitChange < 0) {
    what = 'Revenue is growing, but profit is falling.';
    evidence = `Revenue increased ${formatPct(k.revenueChange)} while operating expenses increased ${formatPct(k.expenseChange)}.`;
    cause = 'Expenses are growing faster than sales, compressing your profit margin.';
    impact = `Your profit margin is now ${k.profitMargin.toFixed(1)}%, down from last month. If this continues, your business will burn cash.`;
    action = 'Review the fastest-growing expense categories and renegotiate or cut recurring costs. Collect overdue invoices to free up cash.';
  } else if (k.overdueInvoices > 0 && inactive.length > 3) {
    what = 'Your business is growing but cash is stuck and customers are churning.';
    evidence = `${k.overdueInvoices} overdue invoices (${formatRUF(k.overdueAmount)}) and ${inactive.length} inactive customers.`;
    cause = 'Customers are not paying on time and some have stopped buying entirely.';
    impact = 'Cash flow is constrained and revenue from inactive customers has stopped.';
    action = 'Prioritize collecting overdue payments this week, then re-engage inactive customers with offers or check-ins.';
  } else {
    what = 'Your business is stable and growing steadily.';
    evidence = `Revenue is ${formatRUF(k.monthlyRevenue)} with a ${k.profitMargin.toFixed(1)}% margin. ${k.customerCount} customers, ${k.salesThisMonth} sales this month.`;
    cause = 'No critical issues detected in the current data.';
    impact = 'Your business is on a healthy trajectory.';
    action = 'Keep monitoring expenses and focus on re-engaging any inactive customers.';
  }

  // Add anomaly context
  if (anomalies.length > 0 && k.profitChange !== null && k.profitChange < 0) {
    cause += ` Key issue: ${anomalies[0].title}.`;
  }

  return { what, evidence, cause, impact, action };
}

export interface WeeklyPriority {
  rank: number;
  title: string;
  detail: string;
}

export function getWeeklyPriorities(data: BusinessData): WeeklyPriority[] {
  const k = getKPIs(data);
  const summaries = getCustomerSummaries(data);
  const inactive = summaries.filter((c) => c.isInactive).sort((a, b) => b.totalSpent - a.totalSpent);
  const anomalies = getExpenseAnomalies(data);
  const products = getRevenueByProduct(data);
  const overdue = getOverdueInvoices(data);

  const priorities: WeeklyPriority[] = [];
  let rank = 1;

  if (overdue.length > 0) {
    priorities.push({
      rank: rank++,
      title: `Follow up with ${overdue.length} overdue customer${overdue.length === 1 ? '' : 's'}`,
      detail: `${formatRUF(k.overdueAmount)} in overdue invoices. Start with ${getCustomerName(data, overdue[0].customerId)} (${overdue[0].invoiceNumber}).`,
    });
  }
  if (anomalies.length > 0) {
    priorities.push({
      rank: rank++,
      title: `Reduce ${anomalies[0].title.toLowerCase()}`,
      detail: anomalies[0].description,
    });
  }
  if (inactive.length > 0) {
    priorities.push({
      rank: rank++,
      title: `Contact ${inactive.length} inactive customer${inactive.length === 1 ? '' : 's'}`,
      detail: inactive.slice(0, 3).map((c) => `${c.customer.name} (${c.daysSinceLastPurchase} days, ${formatRUF(c.totalSpent)})`).join('; '),
    });
  }
  if (products.length > 0) {
    priorities.push({
      rank: rank++,
      title: `Focus sales on ${products[0].product}`,
      detail: `Highest revenue product at ${formatRUF(products[0].revenue)} across ${products[0].count} sales.`,
    });
  }
  if (priorities.length === 0) {
    priorities.push({ rank: 1, title: 'No urgent priorities', detail: 'Your business is running smoothly. Keep monitoring weekly.' });
  }
  return priorities;
}

export interface CFOAnalysis {
  healthScore: number; // 0-100
  healthLabel: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  revenueChange: number | null;
  expenseChange: number | null;
  profitChange: number | null;
  outstandingAmount: number;
  overdueAmount: number;
  anomalies: { severity: string; title: string; description: string; evidence: string }[];
  insights: string[];
  actualVsEstimated: string;
}

export function getCFOAnalysis(data: BusinessData): CFOAnalysis {
  const k = getKPIs(data);
  const buckets = getMonthlyBuckets(data);
  const expenseAnomalies = getExpenseAnomalies(data);
  const invoiceAnomalies = getInvoiceAnomalies(data);
  const anomalies = [...expenseAnomalies, ...invoiceAnomalies];

  // Health score calculation
  let score = 50;
  if (k.profitMargin > 20) score += 20;
  else if (k.profitMargin > 10) score += 10;
  else if (k.profitMargin < 0) score -= 20;
  if (k.profitChange !== null && k.profitChange > 0) score += 10;
  else if (k.profitChange !== null && k.profitChange < 0) score -= 10;
  if (k.overdueInvoices === 0) score += 10;
  else if (k.overdueInvoices > 3) score -= 10;
  if (expenseAnomalies.length === 0) score += 5;
  else score -= expenseAnomalies.length * 3;
  score = Math.max(0, Math.min(100, score));

  const healthLabel = score >= 75 ? 'Healthy' : score >= 50 ? 'Stable' : score >= 30 ? 'At Risk' : 'Critical';

  const insights: string[] = [];
  if (k.profitChange !== null && k.profitChange < 0) {
    insights.push(`Profit decreased ${formatPct(k.profitChange)} — expenses are outpacing revenue growth.`);
  }
  if (k.overdueInvoices > 0) {
    insights.push(`${k.overdueInvoices} overdue invoice${k.overdueInvoices === 1 ? '' : 's'} totaling ${formatRUF(k.overdueAmount)} are tying up cash.`);
  }
  if (expenseAnomalies.length > 0) {
    insights.push(expenseAnomalies[0].description);
  }
  const products = getRevenueByProduct(data);
  if (products.length >= 2) {
    insights.push(`${products[0].product} generates the most revenue, but check which product has the best margin.`);
  }
  if (insights.length === 0) {
    insights.push('Your finances are stable. No critical anomalies detected.');
  }

  return {
    healthScore: score,
    healthLabel,
    revenue: k.monthlyRevenue,
    expenses: k.totalExpenses,
    profit: k.estimatedProfit,
    margin: k.profitMargin,
    revenueChange: k.revenueChange,
    expenseChange: k.expenseChange,
    profitChange: k.profitChange,
    outstandingAmount: k.outstandingAmount,
    overdueAmount: k.overdueAmount,
    anomalies,
    insights,
    actualVsEstimated: 'Revenue and expense figures are based on recorded transactions. Profit is calculated as revenue minus expenses. Outstanding amounts are based on invoice balances. Cash flow projections are estimates.',
  };
}

export interface SalesAnalysis {
  bestCustomers: CustomerSummary[];
  inactiveCustomers: CustomerSummary[];
  topProducts: { product: string; revenue: number; count: number }[];
  decliningProducts: string[];
  totalRevenue: number;
  customersToContact: { customer: Customer; lastPurchase: string | null; totalValue: number; reason: string; action: string }[];
}

export function getSalesAnalysis(data: BusinessData): SalesAnalysis {
  const summaries = getCustomerSummaries(data);
  const bestCustomers = [...summaries].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  const inactiveCustomers = summaries.filter((c) => c.isInactive).sort((a, b) => b.totalSpent - a.totalSpent);
  const products = getRevenueByProduct(data);
  const topProducts = products.slice(0, 5);

  // Declining products: compare last 2 months revenue per product
  const buckets = getMonthlyBuckets(data);
  const currentKey = buckets[buckets.length - 1]?.key;
  const prevKey = buckets[buckets.length - 2]?.key;
  const decliningProducts: string[] = [];
  if (currentKey && prevKey) {
    const curRev = new Map<string, number>();
    const prevRev = new Map<string, number>();
    for (const s of data.sales) {
      const k = s.date.slice(0, 7);
      if (k === currentKey) curRev.set(s.product, (curRev.get(s.product) ?? 0) + s.revenue);
      if (k === prevKey) prevRev.set(s.product, (prevRev.get(s.product) ?? 0) + s.revenue);
    }
    for (const [product, cur] of curRev) {
      const prev = prevRev.get(product) ?? 0;
      if (prev > 0 && cur < prev * 0.7) decliningProducts.push(product);
    }
  }

  const totalRevenue = data.sales.reduce((s, x) => s + x.revenue, 0);

  // Customers to contact
  const customersToContact = summaries
    .filter((c) => c.isInactive || c.outstandingAmount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 8)
    .map((c) => {
      let reason: string;
      let action: string;
      if (c.isInactive && c.outstandingAmount > 0) {
        reason = `Inactive ${c.daysSinceLastPurchase} days + ${formatRUF(c.outstandingAmount)} outstanding`;
        action = 'Send payment reminder and re-engagement offer';
      } else if (c.isInactive) {
        reason = `No purchase in ${c.daysSinceLastPurchase} days`;
        action = c.isHighValue ? 'Call personally — high-value customer' : 'Send re-engagement message with offer';
      } else {
        reason = `${formatRUF(c.outstandingAmount)} outstanding on unpaid invoice`;
        action = 'Send payment reminder';
      }
      return {
        customer: c.customer,
        lastPurchase: c.lastPurchaseDate,
        totalValue: c.totalSpent,
        reason,
        action,
      };
    });

  return { bestCustomers, inactiveCustomers, topProducts, decliningProducts, totalRevenue, customersToContact };
}


