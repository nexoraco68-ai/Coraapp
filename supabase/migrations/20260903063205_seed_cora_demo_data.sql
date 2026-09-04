/*
# Seed CORA AI with demo data

## Overview
Populates all CORA tables with realistic demo data for an African small business
(Amahoro Trading Ltd) using RWF. Customers, invoices, and payments are deterministic.
Sales and expenses are generated via SQL to cover 6 months of activity with a
realistic upward revenue trend and rising expenses that compress profit margins.

## Data Seeded
1. **customers** — 18 customers with Rwandan names, phone numbers, and statuses
2. **invoices** — 17 invoices: 5 overdue, 3 partial, 3 open, 6 paid
3. **payments** — 9 payments matching paid/partial invoices
4. **sales** — ~108 sales across 6 months with 6 products, revenue growing monthly
5. **expenses** — 36 expenses across 6 months, 6 categories, growing faster than revenue
*/

-- Insert customers
INSERT INTO customers (id, name, phone, status, created_at) VALUES
  ('c1',  'Jean Bizimana',       '+250788123456', 'vip',      '2025-07-15'),
  ('c2',  'Grace Uwase',         '+250788234567', 'vip',      '2025-09-15'),
  ('c3',  'Patrick Nshuti',      '+250788345678', 'active',   '2025-11-15'),
  ('c4',  'Diane Mutesi',        '+250788456789', 'active',   '2025-12-15'),
  ('c5',  'Eric Habimana',       '+250788567890', 'active',   '2026-01-15'),
  ('c6',  'Claire Umutoni',      '+250788678901', 'active',   '2026-02-15'),
  ('c7',  'Olivier Niyonzima',   '+250788789012', 'inactive', '2026-03-15'),
  ('c8',  'Aline Ingabire',      '+250788890123', 'active',   '2026-03-15'),
  ('c9',  'Felix Tuyisenge',     '+250788901234', 'inactive', '2026-04-15'),
  ('c10', 'Beatrice Mukamana',   '+250788012345', 'active',   '2026-05-15'),
  ('c11', 'Innocent Mugisha',    '+250788112233', 'inactive', '2026-05-15'),
  ('c12', 'Sandrine Uwase',      '+250788223344', 'active',   '2026-06-15'),
  ('c13', 'Yves Karangwa',       '+250788334455', 'active',   '2026-07-15'),
  ('c14', 'Nadine Ishimwe',      '+250788445566', 'inactive', '2026-07-15'),
  ('c15', 'Thierry Ndayishimiye','+250788556677', 'active',   '2026-08-15'),
  ('c16', 'Lucie Murekatete',    '+250788667788', 'inactive', '2026-08-15'),
  ('c17', 'David Rucamara',      '+250788778899', 'active',   '2026-08-15'),
  ('c18', 'Solange Nyiraneza',   '+250788889900', 'inactive', '2026-08-15')
ON CONFLICT (id) DO NOTHING;

-- Insert invoices
INSERT INTO invoices (id, invoice_number, customer_id, amount, issue_date, due_date, paid_amount, status) VALUES
  ('inv1001', 'INV-1001', 'c1',  60000,  '2026-07-20', '2026-08-18', 0,      'overdue'),
  ('inv1002', 'INV-1002', 'c3',  85000,  '2026-07-25', '2026-08-23', 0,      'overdue'),
  ('inv1003', 'INV-1003', 'c7',  110000, '2026-07-30', '2026-08-28', 0,      'overdue'),
  ('inv1004', 'INV-1004', 'c9',  135000, '2026-08-04', '2026-09-02', 0,      'overdue'),
  ('inv1005', 'INV-1005', 'c11', 160000, '2026-08-09', '2026-09-07', 0,      'overdue'),
  ('inv1006', 'INV-1006', 'c2',  120000, '2026-08-04', '2026-09-01', 60000,  'partial'),
  ('inv1007', 'INV-1007', 'c5',  150000, '2026-08-07', '2026-09-04', 75000,  'partial'),
  ('inv1008', 'INV-1008', 'c8',  180000, '2026-08-10', '2026-09-07', 90000,  'partial'),
  ('inv1009', 'INV-1009', 'c4',  80000,  '2026-08-23', '2026-09-12', 0,      'open'),
  ('inv1010', 'INV-1010', 'c6',  100000, '2026-08-24', '2026-09-13', 0,      'open'),
  ('inv1011', 'INV-1011', 'c10', 120000, '2026-08-25', '2026-09-14', 0,      'open'),
  ('inv1012', 'INV-1012', 'c1',  90000,  '2026-07-04', '2026-08-03', 90000,  'paid'),
  ('inv1013', 'INV-1013', 'c2',  105000, '2026-07-09', '2026-08-08', 105000, 'paid'),
  ('inv1014', 'INV-1014', 'c3',  120000, '2026-07-14', '2026-08-13', 120000, 'paid'),
  ('inv1015', 'INV-1015', 'c12', 135000, '2026-07-19', '2026-08-18', 135000, 'paid'),
  ('inv1016', 'INV-1016', 'c13', 150000, '2026-07-24', '2026-08-23', 150000, 'paid'),
  ('inv1017', 'INV-1017', 'c15', 165000, '2026-07-29', '2026-08-28', 165000, 'paid')
ON CONFLICT (id) DO NOTHING;

-- Insert payments (matching paid and partial invoices)
INSERT INTO payments (id, customer_id, amount, date, method) VALUES
  ('p1',  'c1',  90000,  '2026-07-04', 'mobile_money'),
  ('p2',  'c2',  105000, '2026-07-09', 'bank_transfer'),
  ('p3',  'c3',  120000, '2026-07-14', 'cash'),
  ('p4',  'c12', 135000, '2026-07-19', 'mobile_money'),
  ('p5',  'c13', 150000, '2026-07-24', 'bank_transfer'),
  ('p6',  'c15', 165000, '2026-07-29', 'cash'),
  ('p7',  'c2',  60000,  '2026-08-04', 'mobile_money'),
  ('p8',  'c5',  75000,  '2026-08-07', 'cash'),
  ('p9',  'c8',  90000,  '2026-08-10', 'mobile_money')
ON CONFLICT (id) DO NOTHING;

-- Generate sales: ~18 sales per month across 6 months with growing revenue
INSERT INTO sales (id, date, customer_id, product, quantity, revenue, payment_status)
SELECT
  's' || row_number,
  sale_date,
  customer_id,
  product,
  quantity,
  (revenue / 1000) * 1000,
  payment_status
FROM (
  SELECT
    ROW_NUMBER() OVER () AS row_number,
    (DATE '2026-04-01' + (month_offset || ' month')::interval + (floor(random() * 28) || ' days')::interval)::date AS sale_date,
    (ARRAY['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18'])[1 + floor(random() * 18)::int] AS customer_id,
    (ARRAY['Maize Flour 10kg','Rice 25kg','Cooking Oil 20L','Sugar 50kg','Beans 30kg','Soap Carton'])[1 + floor(random() * 6)::int] AS product,
    (2 + floor(random() * 8)::int) AS quantity,
    CASE month_offset
      WHEN 0 THEN 120000 + floor(random() * 80000)::int
      WHEN 1 THEN 130000 + floor(random() * 90000)::int
      WHEN 2 THEN 140000 + floor(random() * 100000)::int
      WHEN 3 THEN 150000 + floor(random() * 100000)::int
      WHEN 4 THEN 160000 + floor(random() * 120000)::int
      WHEN 5 THEN 170000 + floor(random() * 130000)::int
    END AS revenue,
    (ARRAY['paid','paid','paid','paid','partial','partial','unpaid'])[1 + floor(random() * 7)::int] AS payment_status
  FROM generate_series(0, 5) AS month_offset
  CROSS JOIN generate_series(1, 18) AS txn_num
) AS gen
ON CONFLICT DO NOTHING;

-- Generate expenses: 6 categories per month across 6 months
INSERT INTO expenses (id, date, category, amount, description)
SELECT
  'e' || row_number,
  expense_date,
  category,
  (amount / 1000) * 1000,
  category || ' expense — month ' || (month_offset + 1)
FROM (
  SELECT
    ROW_NUMBER() OVER () AS row_number,
    (DATE '2026-04-01' + (month_offset || ' month')::interval + (floor(random() * 28) || ' days')::interval)::date AS expense_date,
    category,
    CASE category
      WHEN 'Transport'  THEN (920000 + month_offset * 76000) * (0.22 + month_offset * 0.02)
      WHEN 'Rent'       THEN (920000 + month_offset * 76000) * 0.18
      WHEN 'Salaries'   THEN (920000 + month_offset * 76000) * 0.25
      WHEN 'Inventory'  THEN (920000 + month_offset * 76000) * 0.20
      WHEN 'Utilities'  THEN (920000 + month_offset * 76000) * 0.08
      WHEN 'Marketing'  THEN (920000 + month_offset * 76000) * 0.07
    END AS amount,
    month_offset
  FROM generate_series(0, 5) AS month_offset
  CROSS JOIN (VALUES ('Transport'), ('Rent'), ('Salaries'), ('Inventory'), ('Utilities'), ('Marketing')) AS cat(category)
) AS gen
ON CONFLICT DO NOTHING;
