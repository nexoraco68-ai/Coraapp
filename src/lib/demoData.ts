import type { BusinessData, BusinessProfile, Customer, Expense, Invoice, Payment, Product, Sale } from './types';

const TODAY = new Date('2026-09-02');

function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthsAgo(n: number, day = 15): string {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
}

const business: BusinessProfile = {
  id: 'demo',
  name: 'Amahoro Trading Ltd',
  type: 'Retail',
  industry: 'Wholesale Trade',
  country: 'Rwanda',
  city: 'Kigali',
  currency: 'RWF',
  description: 'A wholesale trading business selling food staples across Rwanda.',
  employees: 8,
  isDemo: true,
};

const products: Product[] = [
  { id: 'prod1', name: 'Maize Flour 10kg', description: 'Premium maize flour in 10kg bags', category: 'Grains', sellingPrice: 18000, cost: 12000 },
  { id: 'prod2', name: 'Rice 25kg', description: 'Long grain rice in 25kg sacks', category: 'Grains', sellingPrice: 35000, cost: 26000 },
  { id: 'prod3', name: 'Cooking Oil 20L', description: 'Refined vegetable cooking oil 20 liters', category: 'Cooking', sellingPrice: 42000, cost: 30000 },
  { id: 'prod4', name: 'Sugar 50kg', description: 'Refined white sugar in 50kg bags', category: 'Staples', sellingPrice: 55000, cost: 42000 },
  { id: 'prod5', name: 'Beans 30kg', description: 'Dried red beans in 30kg sacks', category: 'Legumes', sellingPrice: 38000, cost: 28000 },
  { id: 'prod6', name: 'Soap Carton', description: 'Carton of laundry soap bars', category: 'Household', sellingPrice: 25000, cost: 18000 },
];

const customers: Customer[] = [
  { id: 'c1', name: 'Jean Bizimana', phone: '+250788123456', email: 'jean@example.rw', location: 'Kigali', status: 'vip', createdAt: monthsAgo(14) },
  { id: 'c2', name: 'Grace Uwase', phone: '+250788234567', email: 'grace@example.rw', location: 'Huye', status: 'vip', createdAt: monthsAgo(12) },
  { id: 'c3', name: 'Patrick Nshuti', phone: '+250788345678', email: 'patrick@example.rw', location: 'Musanze', status: 'active', createdAt: monthsAgo(10) },
  { id: 'c4', name: 'Diane Mutesi', phone: '+250788456789', email: 'diane@example.rw', location: 'Rubavu', status: 'active', createdAt: monthsAgo(9) },
  { id: 'c5', name: 'Eric Habimana', phone: '+250788567890', email: 'eric@example.rw', location: 'Kigali', status: 'active', createdAt: monthsAgo(8) },
  { id: 'c6', name: 'Claire Umutoni', phone: '+250788678901', email: 'claire@example.rw', location: 'Nyagatare', status: 'active', createdAt: monthsAgo(7) },
  { id: 'c7', name: 'Olivier Niyonzima', phone: '+250788789012', email: '', location: 'Muhanga', status: 'inactive', createdAt: monthsAgo(6) },
  { id: 'c8', name: 'Aline Ingabire', phone: '+250788890123', email: 'aline@example.rw', location: 'Kigali', status: 'active', createdAt: monthsAgo(6) },
  { id: 'c9', name: 'Felix Tuyisenge', phone: '+250788901234', email: '', location: 'Rusizi', status: 'inactive', createdAt: monthsAgo(5) },
  { id: 'c10', name: 'Beatrice Mukamana', phone: '+250788012345', email: 'beatrice@example.rw', location: 'Kigali', status: 'active', createdAt: monthsAgo(4) },
  { id: 'c11', name: 'Innocent Mugisha', phone: '+250788112233', email: '', location: 'Nyamagabe', status: 'inactive', createdAt: monthsAgo(4) },
  { id: 'c12', name: 'Sandrine Uwase', phone: '+250788223344', email: 'sandrine@example.rw', location: 'Kigali', status: 'active', createdAt: monthsAgo(3) },
  { id: 'c13', name: 'Yves Karangwa', phone: '+250788334455', email: 'yves@example.rw', location: 'Musanze', status: 'active', createdAt: monthsAgo(2) },
  { id: 'c14', name: 'Nadine Ishimwe', phone: '+250788445566', email: '', location: 'Kigali', status: 'inactive', createdAt: monthsAgo(2) },
  { id: 'c15', name: 'Thierry Ndayishimiye', phone: '+250788556677', email: 'thierry@example.rw', location: 'Huye', status: 'active', createdAt: monthsAgo(1) },
  { id: 'c16', name: 'Lucie Murekatete', phone: '+250788667788', email: '', location: 'Rwamagana', status: 'inactive', createdAt: monthsAgo(1) },
  { id: 'c17', name: 'David Rucamara', phone: '+250788778899', email: 'david@example.rw', location: 'Kigali', status: 'active', createdAt: monthsAgo(1) },
  { id: 'c18', name: 'Solange Nyiraneza', phone: '+250788889900', email: '', location: 'Muhanga', status: 'inactive', createdAt: monthsAgo(1) },
];

function generateSales(): Sale[] {
  const sales: Sale[] = [];
  let id = 1;
  const monthlyTargets = [1_850_000, 2_100_000, 2_350_000, 2_500_000, 2_900_000, 3_200_000];
  monthlyTargets.forEach((target, monthIdx) => {
    let remaining = target;
    const txnCount = 14 + monthIdx * 2;
    for (let i = 0; i < txnCount; i++) {
      if (remaining <= 0) break;
      const cust = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 8) + 2;
      const revenue = Math.min(remaining, qty * product.sellingPrice);
      remaining -= revenue;
      const day = Math.floor(Math.random() * 27) + 1;
      const date = monthsAgo(5 - monthIdx, day);
      const r = Math.random();
      const paymentStatus = r > 0.78 ? 'unpaid' : r > 0.62 ? 'partial' : 'paid';
      const methods: Sale['paymentMethod'][] = ['cash', 'mobile_money', 'bank_transfer'];
      sales.push({
        id: `s${id++}`,
        date,
        customerId: cust.id,
        productId: product.id,
        product: product.name,
        quantity: qty,
        revenue: Math.round(revenue / 1000) * 1000,
        cost: product.cost * qty,
        paymentStatus,
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      });
    }
  });
  return sales.sort((a, b) => a.date.localeCompare(b.date));
}

function generateExpenses(): Expense[] {
  const expenses: Expense[] = [];
  let id = 1;
  const monthlyExpenseTargets = [920_000, 1_000_000, 1_080_000, 1_200_000, 1_450_000, 1_680_000];
  monthlyExpenseTargets.forEach((target, monthIdx) => {
    const splits = [
      { cat: 'Transport', pct: 0.22 + monthIdx * 0.02 },
      { cat: 'Rent', pct: 0.18 },
      { cat: 'Salaries', pct: 0.25 },
      { cat: 'Inventory', pct: 0.2 },
      { cat: 'Utilities', pct: 0.08 },
      { cat: 'Marketing', pct: 0.07 },
    ];
    splits.forEach((s) => {
      const amount = Math.round((target * s.pct) / 1000) * 1000;
      const day = Math.floor(Math.random() * 27) + 1;
      expenses.push({
        id: `e${id++}`,
        date: monthsAgo(5 - monthIdx, day),
        name: s.cat,
        category: s.cat,
        amount,
        description: `${s.cat} expense — month ${6 - monthIdx}`,
      });
    });
  });
  return expenses.sort((a, b) => a.date.localeCompare(b.date));
}

function generateInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  let num = 1001;
  const overdueCustomers = ['c1', 'c3', 'c7', 'c9', 'c11'];
  overdueCustomers.forEach((cid, i) => {
    const amount = 60000 + i * 25000;
    const status = 'overdue' as const;
    invoices.push({ id: `inv${num}`, invoiceNumber: `INV-${num}`, customerId: cid, amount, issueDate: daysAgo(45 + i * 5), dueDate: daysAgo(15 + i * 5), paidAmount: 0, status, paymentStatus: status });
    num++;
  });
  const partialCustomers = ['c2', 'c5', 'c8'];
  partialCustomers.forEach((cid, i) => {
    const amount = 120000 + i * 30000;
    const status = 'partial' as const;
    invoices.push({ id: `inv${num}`, invoiceNumber: `INV-${num}`, customerId: cid, amount, issueDate: daysAgo(30 + i * 3), dueDate: daysAgo(2 + i * 3), paidAmount: Math.round(amount * 0.5), status, paymentStatus: status });
    num++;
  });
  const openCustomers = ['c4', 'c6', 'c10'];
  openCustomers.forEach((cid, i) => {
    const amount = 80000 + i * 20000;
    const status = 'open' as const;
    invoices.push({ id: `inv${num}`, invoiceNumber: `INV-${num}`, customerId: cid, amount, issueDate: daysAgo(10 + i), dueDate: daysAgo(-20 + i), paidAmount: 0, status, paymentStatus: status });
    num++;
  });
  const paidCustomers = ['c1', 'c2', 'c3', 'c12', 'c13', 'c15'];
  paidCustomers.forEach((cid, i) => {
    const amount = 90000 + i * 15000;
    const status = 'paid' as const;
    invoices.push({ id: `inv${num}`, invoiceNumber: `INV-${num}`, customerId: cid, amount, issueDate: daysAgo(60 + i * 5), dueDate: daysAgo(30 + i * 5), paidAmount: amount, status, paymentStatus: status });
    num++;
  });
  return invoices;
}

function generatePayments(): Payment[] {
  const payments: Payment[] = [];
  let id = 1;
  const methods: Payment['method'][] = ['cash', 'mobile_money', 'bank_transfer'];
  const invoices = generateInvoices();
  invoices.filter((inv) => inv.paidAmount > 0).forEach((inv) => {
    payments.push({
      id: `p${id++}`,
      customerId: inv.customerId,
      invoiceId: inv.id,
      amount: inv.paidAmount,
      date: inv.issueDate,
      method: methods[Math.floor(Math.random() * methods.length)],
    });
  });
  return payments.sort((a, b) => a.date.localeCompare(b.date));
}

export const demoData: BusinessData = {
  business,
  products,
  customers,
  sales: generateSales(),
  expenses: generateExpenses(),
  invoices: generateInvoices(),
  payments: generatePayments(),
};
