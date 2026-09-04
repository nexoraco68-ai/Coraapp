import { supabase } from './supabase';
import { demoData } from './demoData';
import type { BusinessData, BusinessProfile, Customer, Expense, Invoice, Payment, Product, Sale } from './types';

interface DbBusiness {
  id: string;
  name: string;
  type: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  currency: string;
  description: string | null;
  employees: number | null;
  is_demo: boolean;
}

interface DbProduct {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  category: string | null;
  selling_price: number;
  cost: number;
}

interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  location: string | null;
  status: string;
  created_at: string;
  business_id: string | null;
}

interface DbSale {
  id: string;
  date: string;
  customer_id: string;
  product_id: string | null;
  product: string;
  quantity: number;
  revenue: number;
  cost: number | null;
  payment_status: string;
  payment_method: string | null;
  business_id: string | null;
}

interface DbExpense {
  id: string;
  date: string;
  name: string | null;
  category: string;
  amount: number;
  description: string | null;
  business_id: string | null;
}

interface DbInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  issue_date: string;
  due_date: string;
  paid_amount: number;
  status: string;
  payment_status: string | null;
  business_id: string | null;
}

interface DbPayment {
  id: string;
  customer_id: string;
  invoice_id: string | null;
  amount: number;
  date: string;
  method: string;
  business_id: string | null;
}

function mapBusiness(b: DbBusiness): BusinessProfile {
  return {
    id: b.id,
    name: b.name,
    type: b.type ?? '',
    industry: b.industry ?? '',
    country: b.country ?? '',
    city: b.city ?? '',
    currency: b.currency,
    description: b.description ?? '',
    employees: b.employees ?? 0,
    isDemo: b.is_demo,
  };
}

function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    category: p.category ?? '',
    sellingPrice: Number(p.selling_price),
    cost: Number(p.cost),
  };
}

function mapCustomer(c: DbCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email ?? '',
    location: c.location ?? '',
    status: c.status as Customer['status'],
    createdAt: c.created_at,
  };
}

function mapSale(s: DbSale): Sale {
  return {
    id: s.id,
    date: s.date,
    customerId: s.customer_id,
    productId: s.product_id ?? '',
    product: s.product,
    quantity: s.quantity,
    revenue: Number(s.revenue),
    cost: Number(s.cost ?? 0),
    paymentStatus: s.payment_status as Sale['paymentStatus'],
    paymentMethod: (s.payment_method ?? 'cash') as Sale['paymentMethod'],
  };
}

function mapExpense(e: DbExpense): Expense {
  return {
    id: e.id,
    date: e.date,
    name: e.name ?? e.category,
    category: e.category,
    amount: Number(e.amount),
    description: e.description ?? '',
  };
}

function mapInvoice(i: DbInvoice): Invoice {
  return {
    id: i.id,
    invoiceNumber: i.invoice_number,
    customerId: i.customer_id,
    amount: Number(i.amount),
    issueDate: i.issue_date,
    dueDate: i.due_date,
    paidAmount: Number(i.paid_amount),
    status: i.status as Invoice['status'],
    paymentStatus: (i.payment_status ?? i.status) as Invoice['paymentStatus'],
  };
}

function mapPayment(p: DbPayment): Payment {
  return {
    id: p.id,
    customerId: p.customer_id,
    invoiceId: p.invoice_id ?? '',
    amount: Number(p.amount),
    date: p.date,
    method: p.method as Payment['method'],
  };
}

export async function loadBusinessData(businessId: string): Promise<BusinessData> {
  try {
    const [bizRes, productsRes, customersRes, salesRes, expensesRes, invoicesRes, paymentsRes] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', businessId).single(),
      supabase.from('products').select('*').eq('business_id', businessId),
      supabase.from('customers').select('*').eq('business_id', businessId),
      supabase.from('sales').select('*').eq('business_id', businessId),
      supabase.from('expenses').select('*').eq('business_id', businessId),
      supabase.from('invoices').select('*').eq('business_id', businessId),
      supabase.from('payments').select('*').eq('business_id', businessId),
    ]);

    if (bizRes.error) {
      console.warn('Business not found, falling back to demo:', bizRes.error);
      return demoData;
    }

    const business = mapBusiness(bizRes.data as DbBusiness);
    const products = (productsRes.data as DbProduct[] ?? []).map(mapProduct);
    const customers = (customersRes.data as DbCustomer[] ?? []).map(mapCustomer);
    const sales = (salesRes.data as DbSale[] ?? []).map(mapSale);
    const expenses = (expensesRes.data as DbExpense[] ?? []).map(mapExpense);
    const invoices = (invoicesRes.data as DbInvoice[] ?? []).map(mapInvoice);
    const payments = (paymentsRes.data as DbPayment[] ?? []).map(mapPayment);

    return { business, products, customers, sales, expenses, invoices, payments };
  } catch (err) {
    console.warn('Failed to load from Supabase, using demo data:', err);
    return demoData;
  }
}

export async function createBusiness(profile: Omit<BusinessProfile, 'id' | 'isDemo'>): Promise<BusinessProfile> {
  const id = `biz_${Date.now()}`;
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      id,
      name: profile.name,
      type: profile.type,
      industry: profile.industry,
      country: profile.country,
      city: profile.city,
      currency: profile.currency,
      description: profile.description,
      employees: profile.employees,
      is_demo: false,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapBusiness(data as DbBusiness);
}

export async function addProduct(businessId: string, name: string, description: string, category: string, sellingPrice: number, cost: number): Promise<Product> {
  const id = `prod_${Date.now()}`;
  const { data, error } = await supabase
    .from('products')
    .insert({ id, business_id: businessId, name, description: description || null, category: category || null, selling_price: sellingPrice, cost })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProduct(data as DbProduct);
}

export async function addCustomer(businessId: string, name: string, phone: string, email: string, location: string, status: Customer['status']): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert({ business_id: businessId, name, phone, email: email || null, location: location || null, status, created_at: new Date().toISOString().slice(0, 10) })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapCustomer(data as DbCustomer);
}

export async function addSale(
  businessId: string,
  customerId: string,
  productId: string,
  product: string,
  quantity: number,
  revenue: number,
  cost: number,
  paymentStatus: Sale['paymentStatus'],
  paymentMethod: Sale['paymentMethod'],
  date?: string,
): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      product_id: productId || null,
      product,
      quantity,
      revenue,
      cost,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      date: date ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapSale(data as DbSale);
}

export async function addExpense(
  businessId: string,
  name: string,
  category: string,
  amount: number,
  description: string,
  date?: string,
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      business_id: businessId,
      name,
      category,
      amount,
      description: description || null,
      date: date ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapExpense(data as DbExpense);
}

export async function addInvoice(
  businessId: string,
  customerId: string,
  amount: number,
  issueDate: string,
  dueDate: string,
): Promise<Invoice> {
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      business_id: businessId,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      amount,
      issue_date: issueDate,
      due_date: dueDate,
      paid_amount: 0,
      status: 'open',
      payment_status: 'open',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapInvoice(data as DbInvoice);
}

export async function addPayment(
  businessId: string,
  customerId: string,
  invoiceId: string,
  amount: number,
  method: Payment['method'],
  date?: string,
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      invoice_id: invoiceId || null,
      amount,
      method,
      date: date ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPayment(data as DbPayment);
}

export async function listBusinesses(): Promise<BusinessProfile[]> {
  const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbBusiness[]).map(mapBusiness);
}
