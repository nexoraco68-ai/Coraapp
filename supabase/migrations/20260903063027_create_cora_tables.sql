/*
# Create CORA AI business data tables (single-tenant, no auth)

## Overview
Creates the core data tables for CORA AI — an AI business team MVP for small businesses.
This is a demo/single-tenant app with no sign-in screen, so all policies allow
anon + authenticated access (the data is intentionally shared/public).

## New Tables

1. **customers** — Business customers
   - `id` (uuid, primary key)
   - `name` (text, not null)
   - `phone` (text, not null)
   - `status` (text: active | inactive | vip, default 'active')
   - `created_at` (date, default now())

2. **sales** — Individual sales transactions
   - `id` (uuid, primary key)
   - `date` (date, not null)
   - `customer_id` (uuid, FK → customers.id ON DELETE CASCADE)
   - `product` (text, not null)
   - `quantity` (integer, not null)
   - `revenue` (bigint, not null) — RWF amount
   - `payment_status` (text: paid | partial | unpaid, default 'paid')
   - `created_at` (timestamptz, default now())

3. **expenses** — Business expenses
   - `id` (uuid, primary key)
   - `date` (date, not null)
   - `category` (text, not null)
   - `amount` (bigint, not null) — RWF amount
   - `description` (text)
   - `created_at` (timestamptz, default now())

4. **invoices** — Customer invoices
   - `id` (uuid, primary key)
   - `invoice_number` (text, unique, not null)
   - `customer_id` (uuid, FK → customers.id ON DELETE CASCADE)
   - `amount` (bigint, not null) — total invoice amount in RWF
   - `issue_date` (date, not null)
   - `due_date` (date, not null)
   - `paid_amount` (bigint, default 0)
   - `status` (text: paid | partial | overdue | open, default 'open')
   - `created_at` (timestamptz, default now())

5. **payments** — Recorded payments from customers
   - `id` (uuid, primary key)
   - `customer_id` (uuid, FK → customers.id ON DELETE CASCADE)
   - `amount` (bigint, not null) — RWF
   - `date` (date, not null)
   - `method` (text: cash | mobile_money | bank_transfer, default 'cash')
   - `created_at` (timestamptz, default now())

## Indexes
- `sales.customer_id` — frequent join/filter by customer
- `sales.date` — monthly bucketing and trend queries
- `expenses.date` — monthly bucketing
- `expenses.category` — category aggregation
- `invoices.customer_id` — join by customer
- `invoices.status` — filter overdue/partial
- `payments.customer_id` — join by customer

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant demo app with no sign-in — the data is intentionally
  public/shared and the anon-key frontend client must be able to read and write.
*/

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  created_at date NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE
  TO anon, authenticated USING (true);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  revenue bigint NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sales" ON sales;
CREATE POLICY "anon_select_sales" ON sales FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sales" ON sales;
CREATE POLICY "anon_insert_sales" ON sales FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sales" ON sales;
CREATE POLICY "anon_update_sales" ON sales FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sales" ON sales;
CREATE POLICY "anon_delete_sales" ON sales FOR DELETE
  TO anon, authenticated USING (true);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  amount bigint NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount bigint NOT NULL DEFAULT 0,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  paid_amount bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('paid', 'partial', 'overdue', 'open')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
CREATE POLICY "anon_select_invoices" ON invoices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
CREATE POLICY "anon_insert_invoices" ON invoices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
CREATE POLICY "anon_update_invoices" ON invoices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
CREATE POLICY "anon_delete_invoices" ON invoices FOR DELETE
  TO anon, authenticated USING (true);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount bigint NOT NULL DEFAULT 0,
  date date NOT NULL,
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'mobile_money', 'bank_transfer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
  TO anon, authenticated USING (true);
