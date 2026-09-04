/*
# Add business profiles, products, and enhanced fields

## Overview
Extends the existing schema to support multiple businesses (real user businesses + demo).
Adds a products table, email/location fields to customers, and product_id/cost/payment_method to sales.

## New Tables
1. **businesses** — Business profiles created by users
2. **products** — Products/services for each business

## Column Changes (additive only — no drops, no type changes)
- customers: + business_id, + email, + location
- sales: + business_id, + product_id, + cost, + payment_method
- expenses: + business_id
- invoices: + business_id, + payment_status
- payments: + business_id, + invoice_id
*/

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text,
  industry text,
  country text,
  city text,
  currency text NOT NULL DEFAULT 'RWF',
  description text,
  employees integer,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_businesses" ON businesses;
CREATE POLICY "anon_select_businesses" ON businesses FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_businesses" ON businesses;
CREATE POLICY "anon_insert_businesses" ON businesses FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_businesses" ON businesses;
CREATE POLICY "anon_update_businesses" ON businesses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_businesses" ON businesses;
CREATE POLICY "anon_delete_businesses" ON businesses FOR DELETE
  TO anon, authenticated USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  selling_price bigint NOT NULL DEFAULT 0,
  cost bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Add business_id to existing tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_id text REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS location text;
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);

ALTER TABLE sales ADD COLUMN IF NOT EXISTS business_id text REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS product_id text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cost bigint DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer'));
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS business_id text REFERENCES businesses(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS business_id text REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'open' CHECK (payment_status IN ('paid', 'partial', 'overdue', 'open'));
CREATE INDEX IF NOT EXISTS idx_invoices_business_id ON invoices(business_id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS business_id text REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_id text REFERENCES invoices(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);

-- Insert demo business profile
INSERT INTO businesses (id, name, type, industry, country, city, currency, description, employees, is_demo)
VALUES ('demo', 'Amahoro Trading Ltd', 'Retail', 'Wholesale Trade', 'Rwanda', 'Kigali', 'RWF', 'A wholesale trading business selling food staples across Rwanda.', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Link existing demo data to demo business
UPDATE customers SET business_id = 'demo' WHERE business_id IS NULL;
UPDATE sales SET business_id = 'demo' WHERE business_id IS NULL;
UPDATE expenses SET business_id = 'demo' WHERE business_id IS NULL;
UPDATE invoices SET business_id = 'demo' WHERE business_id IS NULL;
UPDATE payments SET business_id = 'demo' WHERE business_id IS NULL;

-- Insert demo products
INSERT INTO products (id, business_id, name, description, category, selling_price, cost) VALUES
  ('prod1', 'demo', 'Maize Flour 10kg', 'Premium maize flour in 10kg bags', 'Grains', 18000, 12000),
  ('prod2', 'demo', 'Rice 25kg', 'Long grain rice in 25kg sacks', 'Grains', 35000, 26000),
  ('prod3', 'demo', 'Cooking Oil 20L', 'Refined vegetable cooking oil 20 liters', 'Cooking', 42000, 30000),
  ('prod4', 'demo', 'Sugar 50kg', 'Refined white sugar in 50kg bags', 'Staples', 55000, 42000),
  ('prod5', 'demo', 'Beans 30kg', 'Dried red beans in 30kg sacks', 'Legumes', 38000, 28000),
  ('prod6', 'demo', 'Soap Carton', 'Carton of laundry soap bars', 'Household', 25000, 18000)
ON CONFLICT DO NOTHING;

-- Update existing sales with product_id and cost based on product name
UPDATE sales SET product_id = 'prod1', cost = 12000 * sales.quantity WHERE product = 'Maize Flour 10kg' AND product_id IS NULL;
UPDATE sales SET product_id = 'prod2', cost = 26000 * sales.quantity WHERE product = 'Rice 25kg' AND product_id IS NULL;
UPDATE sales SET product_id = 'prod3', cost = 30000 * sales.quantity WHERE product = 'Cooking Oil 20L' AND product_id IS NULL;
UPDATE sales SET product_id = 'prod4', cost = 42000 * sales.quantity WHERE product = 'Sugar 50kg' AND product_id IS NULL;
UPDATE sales SET product_id = 'prod5', cost = 28000 * sales.quantity WHERE product = 'Beans 30kg' AND product_id IS NULL;
UPDATE sales SET product_id = 'prod6', cost = 18000 * sales.quantity WHERE product = 'Soap Carton' AND product_id IS NULL;

-- Update existing payments with invoice_id where matching
UPDATE payments SET invoice_id = 'inv1012' WHERE id = 'p1' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1013' WHERE id = 'p2' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1014' WHERE id = 'p3' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1015' WHERE id = 'p4' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1016' WHERE id = 'p5' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1017' WHERE id = 'p6' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1006' WHERE id = 'p7' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1007' WHERE id = 'p8' AND invoice_id IS NULL;
UPDATE payments SET invoice_id = 'inv1008' WHERE id = 'p9' AND invoice_id IS NULL;
