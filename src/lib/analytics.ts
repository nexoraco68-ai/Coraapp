import type { BusinessData, Customer, Expense, Invoice, Sale } from './types';
import { daysSince, pctChange } from './format';

export interface MonthBucket {
  label: string;       // "Mar"
  key: string;         // "2026-03"
  revenue: number;
  expenses: number;
  profit: number;
  salesCount: number;
  customerCount: number; // unique customers that month
}

export interface KPIData {
  monthlyRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitMargin: number;
  customerCount: number;
  salesThisMonth: number;
  customerGrowth: number | null; // pct vs last month
  outstandingInvoices: number;
  overdueInvoices: number;
  outstandingAmount: number;
  overdueAmount: number;
  revenueChange: number | null;
  expenseChange: number | null;
  profitChange: number | null;
}

export interface ProductRevenue {
  product: string;
  revenue: number;
  count: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  pct: number;
}

export interface CustomerSummary {
  customer: Customer;
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseDate: string | null;
  daysSinceLastPurchase: number | null;
  outstandingAmount: number;
  isInactive: boolean; // no purchase in 60+ days
  isHighValue: boolean; // totalSpent > threshold
}

export interface RecentTransaction {
  id: string;
  date: string;
  type: 'sale' | 'expense' | 'payment';
  description: string;
  amount: number;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[parseInt(m, 10) - 1] ?? key;
}

export function getMonthlyBuckets(data: BusinessData): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  const ensure = (key: string): MonthBucket => {
    if (!map.has(key)) {
      map.set(key, { label: monthLabel(key), key, revenue: 0, expenses: 0, profit: 0, salesCount: 0, customerCount: 0 });
    }
    return map.get(key)!;
  };
  for (const s of data.sales) {
    const b = ensure(monthKey(s.date));
    b.revenue += s.revenue;
    b.salesCount += 1;
  }
  for (const e of data.expenses) {
    const b = ensure(monthKey(e.date));
    b.expenses += e.amount;
  }
  // unique customers per month
  const custMap = new Map<string, Set<string>>();
  for (const s of data.sales) {
    const k = monthKey(s.date);
    if (!custMap.has(k)) custMap.set(k, new Set());
    custMap.get(k)!.add(s.customerId);
  }
  const buckets = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  for (const b of buckets) {
    b.profit = b.revenue - b.expenses;
    b.customerCount = custMap.get(b.key)?.size ?? 0;
  }
  return buckets;
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getKPIs(data: BusinessData): KPIData {
  const buckets = getMonthlyBuckets(data);
  const current = buckets[buckets.length - 1] ?? { revenue: 0, expenses: 0, profit: 0, customerCount: 0 };
  const prev = buckets[buckets.length - 2] ?? { revenue: 0, expenses: 0, profit: 0, customerCount: 0 };

  const overdue = data.invoices.filter((i) => i.status === 'overdue');
  const partial = data.invoices.filter((i) => i.status === 'partial');
  const outstandingInvoices = overdue.length + partial.length;
  const outstandingAmount =
    overdue.reduce((s, i) => s + (i.amount - i.paidAmount), 0) +
    partial.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const overdueAmount = overdue.reduce((s, i) => s + (i.amount - i.paidAmount), 0);

  const profitMargin = current.revenue > 0 ? (current.profit / current.revenue) * 100 : 0;

  return {
    monthlyRevenue: current.revenue,
    totalExpenses: current.expenses,
    estimatedProfit: current.profit,
    profitMargin,
    customerCount: data.customers.length,
    salesThisMonth: current.salesCount,
    customerGrowth: pctChange(current.customerCount, prev.customerCount),
    outstandingInvoices,
    overdueInvoices: overdue.length,
    outstandingAmount,
    overdueAmount,
    revenueChange: pctChange(current.revenue, prev.revenue),
    expenseChange: pctChange(current.expenses, prev.expenses),
    profitChange: pctChange(current.profit, prev.profit),
  };
}

export function getRevenueByProduct(data: BusinessData): ProductRevenue[] {
  const map = new Map<string, ProductRevenue>();
  for (const s of data.sales) {
    if (!map.has(s.product)) {
      map.set(s.product, { product: s.product, revenue: 0, count: 0 });
    }
    const p = map.get(s.product)!;
    p.revenue += s.revenue;
    p.count += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export function getExpensesByCategory(data: BusinessData): ExpenseByCategory[] {
  const map = new Map<string, number>();
  let total = 0;
  for (const e of data.expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    total += e.amount;
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getCustomerSummaries(data: BusinessData): CustomerSummary[] {
  return data.customers.map((customer) => {
    const custSales = data.sales.filter((s) => s.customerId === customer.id);
    const totalSpent = custSales.reduce((s, x) => s + x.revenue, 0);
    const purchaseCount = custSales.length;
    const lastPurchaseDate = custSales.length
      ? custSales.sort((a, b) => b.date.localeCompare(a.date))[0].date
      : null;
    const daysSinceLastPurchase = lastPurchaseDate ? daysSince(lastPurchaseDate) : null;
    const outstandingAmount = data.invoices
      .filter((i) => i.customerId === customer.id && (i.status === 'overdue' || i.status === 'partial'))
      .reduce((s, i) => s + (i.amount - i.paidAmount), 0);
    const avgSpend = data.sales.length > 0
      ? data.sales.reduce((s, x) => s + x.revenue, 0) / new Set(data.sales.map((s) => s.customerId)).size
      : 0;
    return {
      customer,
      totalSpent,
      purchaseCount,
      lastPurchaseDate,
      daysSinceLastPurchase,
      outstandingAmount,
      isInactive: daysSinceLastPurchase !== null && daysSinceLastPurchase >= 60,
      isHighValue: totalSpent > avgSpend * 1.5,
    };
  });
}

export function getRecentTransactions(data: BusinessData, limit = 10): RecentTransaction[] {
  const sales: RecentTransaction[] = data.sales.map((s) => {
    const c = data.customers.find((x) => x.id === s.customerId);
    return {
      id: s.id,
      date: s.date,
      type: 'sale' as const,
      description: `${s.product} × ${s.quantity} — ${c?.name ?? 'Unknown'}`,
      amount: s.revenue,
    };
  });
  const expenses: RecentTransaction[] = data.expenses.map((e) => ({
    id: e.id,
    date: e.date,
    type: 'expense' as const,
    description: e.description || e.name || e.category,
    amount: -e.amount,
  }));
  const all = [...sales, ...expenses].sort((a, b) => b.date.localeCompare(a.date));
  return all.slice(0, limit);
}

export function getOverdueInvoices(data: BusinessData): Invoice[] {
  return data.invoices.filter((i) => i.status === 'overdue').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getCustomerName(data: BusinessData, customerId: string): string {
  return data.customers.find((c) => c.id === customerId)?.name ?? 'Unknown';
}

// ---- Anomaly detection ----

export interface Anomaly {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence: string;
}

export function getExpenseAnomalies(data: BusinessData): Anomaly[] {
  const buckets = getMonthlyBuckets(data);
  const anomalies: Anomaly[] = [];
  if (buckets.length < 2) return anomalies;

  const current = buckets[buckets.length - 1];
  const prev = buckets[buckets.length - 2];

  // Category-level comparison
  const catMap = new Map<string, { current: number; prev: number }>();
  for (const e of data.expenses) {
    const k = monthKey(e.date);
    if (k === current.key || k === prev.key) {
      if (!catMap.has(e.category)) catMap.set(e.category, { current: 0, prev: 0 });
      const entry = catMap.get(e.category)!;
      if (k === current.key) entry.current += e.amount;
      else entry.prev += e.amount;
    }
  }
  for (const [cat, { current: c, prev: p }] of catMap) {
    const change = pctChange(c, p);
    if (change !== null && change > 25) {
      anomalies.push({
        severity: change > 40 ? 'high' : 'medium',
        title: `${cat} expenses surged`,
        description: `${cat} expenses increased ${change.toFixed(0)}% compared with the previous month.`,
        evidence: `Previous: ${p.toLocaleString()} RWF → Current: ${c.toLocaleString()} RWF`,
      });
    }
  }

  // Overall expense growth vs revenue growth
  const expChange = pctChange(current.expenses, prev.expenses);
  const revChange = pctChange(current.revenue, prev.revenue);
  if (expChange !== null && revChange !== null && expChange > revChange + 10) {
    anomalies.push({
      severity: 'high',
      title: 'Expenses growing faster than revenue',
      description: `Expenses grew ${expChange.toFixed(0)}% while revenue grew only ${revChange.toFixed(0)}%. Your profit margin is being compressed.`,
      evidence: `Revenue: ${prev.revenue.toLocaleString()} → ${current.revenue.toLocaleString()} RWF | Expenses: ${prev.expenses.toLocaleString()} → ${current.expenses.toLocaleString()} RWF`,
    });
  }

  return anomalies;
}

export function getInvoiceAnomalies(data: BusinessData): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const overdue = data.invoices.filter((i) => i.status === 'overdue');
  if (overdue.length > 0) {
    anomalies.push({
      severity: 'high',
      title: `${overdue.length} overdue invoice${overdue.length > 1 ? 's' : ''}`,
      description: `${overdue.length} invoice${overdue.length > 1 ? 's are' : ' is'} past their due date with unpaid balances.`,
      evidence: overdue.map((i) => `${i.invoiceNumber}: ${(i.amount - i.paidAmount).toLocaleString()} RWF`).join(', '),
    });
  }
  const partial = data.invoices.filter((i) => i.status === 'partial');
  if (partial.length > 0) {
    anomalies.push({
      severity: 'medium',
      title: `${partial.length} partially paid invoice${partial.length > 1 ? 's' : ''}`,
      description: `Customers have not fully paid ${partial.length} invoice${partial.length > 1 ? 's' : ''}.`,
      evidence: partial.map((i) => `${i.invoiceNumber}: ${(i.amount - i.paidAmount).toLocaleString()} RWF outstanding`).join(', '),
    });
  }
  return anomalies;
}
