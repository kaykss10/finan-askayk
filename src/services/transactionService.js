import { supabase } from '../lib/supabase';

export const transactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error('Não foi possível carregar as transações.');
    return data;
  },

  async create(transaction) {
    // Validation before sending to server (Defense in Depth)
    if (!transaction.name || transaction.amount <= 0) {
      throw new Error('Dados inválidos para a transação.');
    }

    // Explicitly map fields to prevent Mass Assignment / Prototype Pollution
    const safePayload = {
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      status: transaction.status,
      installments_total: transaction.installments_total,
      installments_current: 1,
      is_fixed: transaction.is_fixed || false,
      date: transaction.date
      // Note: user_id is NOT passed here. The database sets it securely via DEFAULT auth.uid()
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([safePayload])
      .select();

    if (error) throw new Error('Erro ao salvar a transação.');
    return data[0];
  },

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error('Erro ao atualizar o status.');
  },

  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Erro ao excluir a transação.');
  }
};
