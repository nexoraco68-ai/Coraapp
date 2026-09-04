export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  industry: string;
  country: string;
  city: string;
  currency: string;
  description: string;
  employees: number;
  isDemo: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sellingPrice: number;
  cost: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'inactive' | 'vip';
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  productId: string;
  product: string;
  quantity: number;
  revenue: number;
  cost: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer';
}

export interface Expense {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  description: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidAmount: number;
  status: 'paid' | 'partial' | 'overdue' | 'open';
  paymentStatus: 'paid' | 'partial' | 'overdue' | 'open';
}

export interface Payment {
  id: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'cash' | 'mobile_money' | 'bank_transfer';
}

export interface BusinessData {
  business: BusinessProfile;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  invoices: Invoice[];
  payments: Payment[];
}
