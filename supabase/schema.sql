-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  status TEXT CHECK (status IN ('pago', 'pendente')) DEFAULT 'pendente',
  installments_total INTEGER DEFAULT 1 CHECK (installments_total >= 1),
  installments_current INTEGER DEFAULT 1 CHECK (installments_current >= 1 AND installments_current <= installments_total),
  is_fixed BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create secure policies
CREATE POLICY "Users can only see their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- SECURITY: Trigger to prevent manipulation of core financial values after insertion
CREATE OR REPLACE FUNCTION prevent_financial_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount <> OLD.amount OR NEW.type <> OLD.type THEN
    RAISE EXCEPTION 'Manipulação de valores financeiros não permitida. Apenas o status pode ser alterado.';
  END IF;
  
  -- Ensure user_id cannot be transferred
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Não é permitido transferir a propriedade da transação.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_financial_immutability ON transactions;
CREATE TRIGGER enforce_financial_immutability
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_financial_manipulation();
