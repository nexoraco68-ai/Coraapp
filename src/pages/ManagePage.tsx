import { useState } from 'react';
import { Users, ShoppingCart, Wallet, FileText, CreditCard, Package, Plus, Check, AlertCircle } from 'lucide-react';
import type { BusinessData, Customer, Sale, Expense, Payment, Product } from '@/lib/types';
import { addCustomer, addSale, addExpense, addInvoice, addPayment, addProduct } from '@/lib/dataLoader';
import { formatRWF } from '@/lib/format';

interface ManagePageProps {
  data: BusinessData;
  onDataChange: () => void;
}

type Tab = 'product' | 'customer' | 'sale' | 'expense' | 'invoice' | 'payment';

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'product', label: 'Product', icon: Package },
  { id: 'customer', label: 'Customer', icon: Users },
  { id: 'sale', label: 'Sale', icon: ShoppingCart },
  { id: 'expense', label: 'Expense', icon: Wallet },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors';

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300 animate-fade-in">
      <Check className="w-4 h-4 shrink-0" /> {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 animate-fade-in">
      <AlertCircle className="w-4 h-4 shrink-0" /> {message}
    </div>
  );
}

export function ManagePage({ data, onDataChange }: ManagePageProps) {
  const [tab, setTab] = useState<Tab>('product');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const businessId = data.business.id;

  const showSuccess = (msg: string) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg: string) => { setError(msg); setSuccess(''); };

  // Product form
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCost, setPCost] = useState('');

  // Customer form
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cLoc, setCLoc] = useState('');
  const [cStatus, setCStatus] = useState<'active' | 'inactive' | 'vip'>('active');

  // Sale form
  const [sCust, setSCust] = useState('');
  const [sProd, setSProd] = useState('');
  const [sQty, setSQty] = useState('1');
  const [sPrice, setSPrice] = useState('');
  const [sDate, setSDate] = useState(todayISO());
  const [sPayStatus, setSPayStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [sPayMethod, setSPayMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('cash');

  // Expense form
  const [eName, setEName] = useState('');
  const [eCat, setECat] = useState('');
  const [eAmount, setEAmount] = useState('');
  const [eDate, setEDate] = useState(todayISO());
  const [eDesc, setEDesc] = useState('');

  // Invoice form
  const [iCust, setICust] = useState('');
  const [iAmount, setIAmount] = useState('');
  const [iIssue, setIIssue] = useState(todayISO());
  const [iDue, setIDue] = useState('');

  // Payment form
  const [payCust, setPayCust] = useState('');
  const [payInv, setPayInv] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('cash');

  const customerOptions = data.customers.map((c) => (
    <option key={c.id} value={c.id}>{c.name}</option>
  ));

  const productOptions = data.products.map((p) => (
    <option key={p.id} value={p.id}>{p.name} — {formatRWF(p.sellingPrice)}</option>
  ));

  const outstandingInvoices = data.invoices.filter((i) => i.status === 'open' || i.status === 'partial' || i.status === 'overdue');
  const invoiceOptions = outstandingInvoices.map((i) => (
    <option key={i.id} value={i.id}>{i.invoiceNumber} — {data.customers.find((c) => c.id === i.customerId)?.name ?? 'Unknown'} ({formatRWF(i.amount - i.paidAmount)} due)</option>
  ));

  const handleAddProduct = async () => {
    if (!pName.trim() || !pPrice) { showError('Name and selling price are required'); return; }
    setSubmitting(true);
    try {
      await addProduct(businessId, pName.trim(), pDesc.trim(), pCat.trim(), parseInt(pPrice), parseInt(pCost) || 0);
      setPName(''); setPDesc(''); setPCat(''); setPPrice(''); setPCost('');
      showSuccess('Product added successfully');
      onDataChange();
    } catch (e) { showError(`Failed to add product: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  const handleAddCustomer = async () => {
    if (!cName.trim() || !cPhone.trim()) { showError('Name and phone are required'); return; }
    setSubmitting(true);
    try {
      await addCustomer(businessId, cName.trim(), cPhone.trim(), cEmail.trim(), cLoc.trim(), cStatus);
      setCName(''); setCPhone(''); setCEmail(''); setCLoc(''); setCStatus('active');
      showSuccess('Customer added successfully');
      onDataChange();
    } catch (e) { showError(`Failed to add customer: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  const handleAddSale = async () => {
    if (!sCust || !sProd || !sPrice) { showError('Customer, product, and price are required'); return; }
    setSubmitting(true);
    try {
      const product = data.products.find((p) => p.id === sProd);
      const qty = parseInt(sQty) || 1;
      const revenue = parseInt(sPrice);
      const cost = product ? product.cost * qty : 0;
      await addSale(businessId, sCust, sProd, product?.name ?? '', qty, revenue, cost, sPayStatus, sPayMethod, sDate);
      setSProd(''); setSQty('1'); setSPrice(''); setSPayStatus('paid'); setSPayMethod('cash');
      showSuccess('Sale recorded successfully');
      onDataChange();
    } catch (e) { showError(`Failed to record sale: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  const handleAddExpense = async () => {
    if (!eName.trim() || !eAmount) { showError('Name and amount are required'); return; }
    setSubmitting(true);
    try {
      await addExpense(businessId, eName.trim(), eCat.trim() || eName.trim(), parseInt(eAmount), eDesc.trim(), eDate);
      setEName(''); setECat(''); setEAmount(''); setEDesc(''); setEDate(todayISO());
      showSuccess('Expense recorded successfully');
      onDataChange();
    } catch (e) { showError(`Failed to record expense: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  const handleAddInvoice = async () => {
    if (!iCust || !iAmount || !iIssue || !iDue) { showError('All fields are required'); return; }
    setSubmitting(true);
    try {
      await addInvoice(businessId, iCust, parseInt(iAmount), iIssue, iDue);
      setICust(''); setIAmount(''); setIDue('');
      showSuccess('Invoice created successfully');
      onDataChange();
    } catch (e) { showError(`Failed to create invoice: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  const handleAddPayment = async () => {
    if (!payCust || !payAmount) { showError('Customer and amount are required'); return; }
    setSubmitting(true);
    try {
      await addPayment(businessId, payCust, payInv, parseInt(payAmount), payMethod);
      setPayCust(''); setPayInv(''); setPayAmount(''); setPayMethod('cash');
      showSuccess('Payment recorded successfully');
      onDataChange();
    } catch (e) { showError(`Failed to record payment: ${(e as Error).message}`); }
    setSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto pb-20 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <Plus className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Business</h1>
          <p className="text-sm text-slate-400">Add products, customers, record sales, expenses, invoices & payments</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSuccess(''); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {success && <div className="mb-4"><SuccessBanner message={success} /></div>}
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
        {tab === 'product' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Add Product / Service</h2>
            <Field label="Name">
              <input className={inputClass} value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Rice 25kg" />
            </Field>
            <Field label="Description">
              <input className={inputClass} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Optional details" />
            </Field>
            <Field label="Category">
              <input className={inputClass} value={pCat} onChange={(e) => setPCat(e.target.value)} placeholder="e.g. Grains" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Selling Price (RWF)">
                <input type="number" min="0" className={inputClass} value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="35000" />
              </Field>
              <Field label="Cost (RWF)">
                <input type="number" min="0" className={inputClass} value={pCost} onChange={(e) => setPCost(e.target.value)} placeholder="26000" />
              </Field>
            </div>
            <button onClick={handleAddProduct} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        )}

        {tab === 'customer' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Add Customer</h2>
            <Field label="Name">
              <input className={inputClass} value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. John Doe" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <input className={inputClass} value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="+250 7XX XXX XXX" />
              </Field>
              <Field label="Email">
                <input className={inputClass} value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="john@example.rw" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location">
                <input className={inputClass} value={cLoc} onChange={(e) => setCLoc(e.target.value)} placeholder="Kigali" />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={cStatus} onChange={(e) => setCStatus(e.target.value as 'active' | 'inactive' | 'vip')}>
                  <option value="active">Active</option>
                  <option value="vip">VIP</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <button onClick={handleAddCustomer} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {submitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        )}

        {tab === 'sale' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Record a Sale</h2>
            {data.products.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300">
                You need to add a product first before recording a sale.
              </div>
            ) : (
              <>
                <Field label="Customer">
                  <select className={inputClass} value={sCust} onChange={(e) => setSCust(e.target.value)}>
                    <option value="">Select customer...</option>
                    {customerOptions}
                  </select>
                </Field>
                <Field label="Product / Service">
                  <select className={inputClass} value={sProd} onChange={(e) => { setSProd(e.target.value); const p = data.products.find((x) => x.id === e.target.value); if (p) setSPrice(String(p.sellingPrice)); }}>
                    <option value="">Select product...</option>
                    {productOptions}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Quantity">
                    <input type="number" min="1" className={inputClass} value={sQty} onChange={(e) => setSQty(e.target.value)} />
                  </Field>
                  <Field label="Selling Price (RWF)">
                    <input type="number" min="0" className={inputClass} value={sPrice} onChange={(e) => setSPrice(e.target.value)} />
                  </Field>
                </div>
                <Field label="Date">
                  <input type="date" className={inputClass} value={sDate} onChange={(e) => setSDate(e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Payment Status">
                    <select className={inputClass} value={sPayStatus} onChange={(e) => setSPayStatus(e.target.value as 'paid' | 'partial' | 'unpaid')}>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </Field>
                  <Field label="Payment Method">
                    <select className={inputClass} value={sPayMethod} onChange={(e) => setSPayMethod(e.target.value as 'cash' | 'mobile_money' | 'bank_transfer')}>
                      <option value="cash">Cash</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </Field>
                </div>
                <button onClick={handleAddSale} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                  {submitting ? 'Recording...' : 'Record Sale'}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'expense' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Record an Expense</h2>
            <Field label="Expense Name">
              <input className={inputClass} value={eName} onChange={(e) => setEName(e.target.value)} placeholder="e.g. Fuel for delivery" />
            </Field>
            <Field label="Category">
              <input className={inputClass} value={eCat} onChange={(e) => setECat(e.target.value)} placeholder="e.g. Transport" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (RWF)">
                <input type="number" min="0" className={inputClass} value={eAmount} onChange={(e) => setEAmount(e.target.value)} placeholder="25000" />
              </Field>
              <Field label="Date">
                <input type="date" className={inputClass} value={eDate} onChange={(e) => setEDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <input className={inputClass} value={eDesc} onChange={(e) => setEDesc(e.target.value)} placeholder="Optional details" />
            </Field>
            <button onClick={handleAddExpense} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {submitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        )}

        {tab === 'invoice' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Create an Invoice</h2>
            <Field label="Customer">
              <select className={inputClass} value={iCust} onChange={(e) => setICust(e.target.value)}>
                <option value="">Select customer...</option>
                {customerOptions}
              </select>
            </Field>
            <Field label="Amount (RWF)">
              <input type="number" min="0" className={inputClass} value={iAmount} onChange={(e) => setIAmount(e.target.value)} placeholder="100000" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issue Date">
                <input type="date" className={inputClass} value={iIssue} onChange={(e) => setIIssue(e.target.value)} />
              </Field>
              <Field label="Due Date">
                <input type="date" className={inputClass} value={iDue} onChange={(e) => setIDue(e.target.value)} />
              </Field>
            </div>
            <button onClick={handleAddInvoice} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        )}

        {tab === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Record a Payment</h2>
            <Field label="Customer">
              <select className={inputClass} value={payCust} onChange={(e) => setPayCust(e.target.value)}>
                <option value="">Select customer...</option>
                {customerOptions}
              </select>
            </Field>
            <Field label="Invoice (optional)">
              <select className={inputClass} value={payInv} onChange={(e) => setPayInv(e.target.value)}>
                <option value="">No specific invoice...</option>
                {invoiceOptions}
              </select>
            </Field>
            <Field label="Amount (RWF)">
              <input type="number" min="0" className={inputClass} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="50000" />
            </Field>
            <Field label="Payment Method">
              <select className={inputClass} value={payMethod} onChange={(e) => setPayMethod(e.target.value as 'cash' | 'mobile_money' | 'bank_transfer')}>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </Field>
            <button onClick={handleAddPayment} disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        )}
      </div>

      {/* Recent data summary */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Products</div>
          <div className="text-xl font-bold text-white">{data.products.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Customers</div>
          <div className="text-xl font-bold text-white">{data.customers.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sales</div>
          <div className="text-xl font-bold text-white">{data.sales.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Invoices</div>
          <div className="text-xl font-bold text-white">{data.invoices.length}</div>
        </div>
      </div>
    </div>
  );
}
