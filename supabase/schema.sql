-- User Financial Profile
CREATE TABLE IF NOT EXISTS user_financial_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salary_amount DECIMAL(12, 2) DEFAULT 0,
  salary_day INTEGER DEFAULT 5 CHECK (salary_day >= 1 AND salary_day <= 31),
  current_balance DECIMAL(12, 2) DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  last_processed_month DATE, -- Format: YYYY-MM-01
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template for monthly recurring items (Salário, Netflix, etc.)
CREATE TABLE IF NOT EXISTS recurring_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  category_color TEXT DEFAULT '#111827',
  day_of_month INTEGER DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template for items with fixed number of installments
CREATE TABLE IF NOT EXISTS installment_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount > 0),
  total_installments INTEGER NOT NULL CHECK (total_installments >= 1),
  current_installment INTEGER DEFAULT 1 CHECK (current_installment >= 1),
  category TEXT NOT NULL,
  category_color TEXT DEFAULT '#111827',
  start_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist in case table was created before
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installments_total INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installments_current INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_group_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS template_type TEXT; -- 'recurring' or 'installment'

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#111827',
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_financial_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can only see their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only delete their own transactions" ON transactions;
CREATE POLICY "Users can only see their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own profile" ON user_financial_profile;
CREATE POLICY "Users can manage their own profile" ON user_financial_profile FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own recurring templates" ON recurring_templates;
CREATE POLICY "Users can manage their own recurring templates" ON recurring_templates FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own installment templates" ON installment_templates;
CREATE POLICY "Users can manage their own installment templates" ON installment_templates FOR ALL USING (auth.uid() = user_id);

-- Indices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_user ON recurring_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_installment_templates_user ON installment_templates(user_id);

-- SECURITY: Ensure user_id cannot be transferred
CREATE OR REPLACE FUNCTION protect_user_id()
RETURNS TRIGGER AS $body$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Não é permitido transferir a propriedade dos dados.';
  END IF;
  RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_transaction_owner ON transactions;
CREATE TRIGGER tr_protect_transaction_owner
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION protect_user_id();

DROP TRIGGER IF EXISTS enforce_financial_immutability ON transactions;
DROP FUNCTION IF EXISTS prevent_financial_manipulation();
