import { supabase } from '../lib/supabase';
import { addMonths, format, parseISO, isBefore, startOfMonth } from 'date-fns';

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
    if (!transaction.name || transaction.amount <= 0) {
      throw new Error('Dados inválidos para a transação.');
    }

    const installments = transaction.installments_total || 1;
    const isFixed = transaction.is_fixed || false;
    const isRecurring = transaction.is_recurring || false;
    const groupId = installments > 1 ? crypto.randomUUID() : null;
    
    const payloads = [];
    const baseDate = parseISO(transaction.date);

    for (let i = 0; i < installments; i++) {
      payloads.push({
        name: transaction.name,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        status: i === 0 ? transaction.status : 'pendente',
        installments_total: installments,
        installments_current: i + 1,
        installment_group_id: groupId,
        is_fixed: isFixed,
        is_recurring: isRecurring,
        date: format(addMonths(baseDate, i), 'yyyy-MM-dd')
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 1. If it's recurring (forever), create a template
    if (isRecurring) {
      const { error: templateError } = await supabase.from('recurring_templates').insert({
        user_id: user.id,
        name: transaction.name,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        day_of_month: parseISO(transaction.date).getDate(),
        category_color: transaction.category_color
      });
      if (templateError) console.error('Erro ao criar template recorrente:', templateError);
    }

    // 2. If it has installments, create an installment template
    if (installments > 1) {
      const { error: instError } = await supabase.from('installment_templates').insert({
        user_id: user.id,
        name: transaction.name,
        total_amount: transaction.amount,
        total_installments: installments,
        current_installment: 1,
        category: transaction.category,
        category_color: transaction.category_color,
        start_date: transaction.date
      });
      if (instError) console.error('Erro ao criar template de parcelas:', instError);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(payloads)
      .select();

    if (error) throw new Error('Erro ao salvar a transação.');
    return data[0];
  },

  async update(id, updates, updateAllInGroup = false) {
    // Sanitize updates to only include valid columns
    const allowedColumns = [
      'name', 'amount', 'category', 'type', 'status', 
      'installments_total', 'installments_current', 
      'installment_group_id', 'is_fixed', 'is_recurring', 'date'
    ];

    const cleanUpdates = Object.keys(updates)
      .filter(key => allowedColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (updateAllInGroup && updates.installment_group_id) {
      const { error } = await supabase
        .from('transactions')
        .update({
          name: cleanUpdates.name,
          amount: cleanUpdates.amount,
          category: cleanUpdates.category,
          type: cleanUpdates.type,
          is_fixed: cleanUpdates.is_fixed,
          is_recurring: cleanUpdates.is_recurring
        })
        .eq('installment_group_id', updates.installment_group_id);
      
      if (error) throw new Error('Erro ao atualizar grupo de transações.');
    } else {
      const { error } = await supabase
        .from('transactions')
        .update(cleanUpdates)
        .eq('id', id);

      if (error) throw new Error('Erro ao atualizar a transação.');
    }
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
  },

  async deleteGroup(groupId) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('installment_group_id', groupId);

    if (error) throw new Error('Erro ao excluir o grupo de parcelas.');
  },

  // Logic to generate the next month's transaction for recurring items
  async syncRecurringTransactions() {
    const { data: recurring, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_recurring', true);

    if (error) return;

    const today = new Date();
    const currentMonth = startOfMonth(today);

    for (const trans of recurring) {
      const transDate = parseISO(trans.date);
      const nextMonthDate = addMonths(transDate, 1);

      // Simple logic: if next month date is before or in current month, 
      // check if it already exists for that month
      if (isBefore(nextMonthDate, addMonths(currentMonth, 1))) {
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('name', trans.name)
          .eq('user_id', trans.user_id)
          .eq('date', format(nextMonthDate, 'yyyy-MM-dd'))
          .limit(1);

        if (!existing || existing.length === 0) {
          // Create next month's entry
          await this.create({
            ...trans,
            date: format(nextMonthDate, 'yyyy-MM-dd'),
            status: 'pendente',
            installments_total: 1, // Recurrence is usually month by month
            is_recurring: true
          });
        }
      }
    }
  }
};
