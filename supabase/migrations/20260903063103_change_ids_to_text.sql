/*
# Change ID columns from uuid to text

## Overview
The CORA frontend uses string IDs like 'c1', 's1', 'inv1001' for its data types.
The initial migration used uuid columns, but these don't accept string IDs.
This migration changes all id columns and foreign key columns from uuid to text
so the existing frontend data layer works without changes.

## Changes
1. **customers.id** — uuid → text (primary key)
2. **sales.id** — uuid → text (primary key)
3. **sales.customer_id** — uuid → text (FK → customers.id)
4. **expenses.id** — uuid → text (primary key)
5. **invoices.id** — uuid → text (primary key)
6. **invoices.customer_id** — uuid → text (FK → customers.id)
7. **payments.id** — uuid → text (primary key)
8. **payments.customer_id** — uuid → text (FK → customers.id)

## Notes
- All DEFAULT gen_random_uuid() removed — the frontend provides its own IDs
- Foreign key constraints preserved with ON DELETE CASCADE
- Indexes preserved
- RLS policies preserved (they don't reference column types)
- No data to migrate (tables are empty)
*/

-- Drop foreign keys first
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_customer_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_customer_id_fkey;

-- Drop indexes that reference the columns (they'll be recreated)
DROP INDEX IF EXISTS idx_sales_customer_id;
DROP INDEX IF EXISTS idx_invoices_customer_id;
DROP INDEX IF EXISTS idx_payments_customer_id;

-- Change id columns to text
ALTER TABLE customers ALTER COLUMN id TYPE text;
ALTER TABLE customers ALTER COLUMN id DROP DEFAULT;

ALTER TABLE sales ALTER COLUMN id TYPE text;
ALTER TABLE sales ALTER COLUMN id DROP DEFAULT;
ALTER TABLE sales ALTER COLUMN customer_id TYPE text;

ALTER TABLE expenses ALTER COLUMN id TYPE text;
ALTER TABLE expenses ALTER COLUMN id DROP DEFAULT;

ALTER TABLE invoices ALTER COLUMN id TYPE text;
ALTER TABLE invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE invoices ALTER COLUMN customer_id TYPE text;

ALTER TABLE payments ALTER COLUMN id TYPE text;
ALTER TABLE payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN customer_id TYPE text;

-- Recreate foreign keys
ALTER TABLE sales ADD CONSTRAINT sales_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT payments_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
