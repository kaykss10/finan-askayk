import { supabase } from '../lib/supabase';
import { format, startOfMonth, parseISO, isAfter, isBefore, addMonths, isSameMonth, setDate } from 'date-fns';
import { profileService } from './profileService';

export const cycleService = {
  async processMonthlyCycle(targetDate = new Date()) {
    const profile = await profileService.getProfile();
    if (!profile || !profile.onboarding_completed) return;

    const targetMonthStr = format(startOfMonth(targetDate), 'yyyy-MM-dd');
    const lastProcessed = profile.last_processed_month;

    // Se já processamos até o targetMonth ou depois, não precisamos fazer nada
    if (lastProcessed && (isAfter(parseISO(lastProcessed), parseISO(targetMonthStr)) || lastProcessed === targetMonthStr)) {
      // Mas se o targetMonth for o mês ATUAL, ainda queremos garantir que os templates estão sincronizados
      // (caso o usuário tenha adicionado um novo template recorrente hoje)
      if (lastProcessed === targetMonthStr) {
        await this.generateTransactionsForMonth(profile, targetMonthStr);
      }
      return;
    }

    // Processa desde o mês seguinte ao último processado até o mês alvo
    let processingMonth = lastProcessed ? addMonths(parseISO(lastProcessed), 1) : parseISO(targetMonthStr);
    
    while (!isAfter(processingMonth, parseISO(targetMonthStr))) {
      const monthStr = format(processingMonth, 'yyyy-MM-dd');
      await this.generateTransactionsForMonth(profile, monthStr);
      processingMonth = addMonths(processingMonth, 1);
    }

    // Atualiza o perfil apenas se avançamos o last_processed_month
    if (!lastProcessed || isAfter(parseISO(targetMonthStr), parseISO(lastProcessed))) {
      await profileService.updateProfile({ last_processed_month: targetMonthStr });
    }
  },

  async generateTransactionsForMonth(profile, monthStr) {
    let userId = profile.user_id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    
    if (!userId) return;

    const monthDate = parseISO(monthStr);

    // 1. Process Salary
    if (profile.salary_amount > 0) {
      const salaryDate = setDate(monthDate, profile.salary_day || 5);
      
      await this.createIfNotExists({
        name: 'Salário Mensal',
        amount: profile.salary_amount,
        category: 'Salário',
        type: 'income',
        date: format(salaryDate, 'yyyy-MM-dd'),
        template_type: 'salary',
        status: 'pendente'
      }, userId);
    }

    // 2. Process Recurring Templates
    const { data: recurring, error: recError } = await supabase
      .from('recurring_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (recError) console.error('Erro ao buscar templates recorrentes:', recError);

    if (recurring) {
      for (const t of recurring) {
        // Use setDate from date-fns to avoid timezone shifts
        const tDate = setDate(monthDate, t.day_of_month);
        
        await this.createIfNotExists({
          name: t.name,
          amount: t.amount,
          category: t.category,
          type: t.type,
          date: format(tDate, 'yyyy-MM-dd'),
          template_id: t.id,
          template_type: 'recurring',
          is_recurring: true,
          status: 'pendente'
        }, userId);
      }
    }

    // 3. Process Installment Templates
    const { data: installments, error: instError } = await supabase
      .from('installment_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (instError) console.error('Erro ao buscar templates de parcelas:', instError);

    if (installments) {
      for (const t of installments) {
        // Calculate if this installment belongs to this month
        const start = parseISO(t.start_date);
        const monthsDiff = this.diffInMonths(monthDate, start);
        
        if (monthsDiff >= 0 && monthsDiff < (t.total_installments - t.current_installment + 1)) {
          const instNum = t.current_installment + monthsDiff;
          
          await this.createIfNotExists({
            name: `${t.name} (${instNum}/${t.total_installments})`,
            amount: t.total_amount,
            category: t.category,
            type: 'expense',
            date: format(monthDate, 'yyyy-MM-dd'),
            template_id: t.id,
            template_type: 'installment',
            installments_total: t.total_installments,
            installments_current: instNum,
            status: 'pendente'
          }, userId);
        }
      }
    }
  },

  async createIfNotExists(transaction, userId) {
    const { data: existing, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('name', transaction.name)
      .eq('date', transaction.date)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar existência de transação:', checkError);
      return;
    }

    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: userId
        });
      
      if (insertError) {
        console.error('Erro ao inserir transação automática:', insertError);
      }
    }
  },

  diffInMonths(d1, d2) {
    let months;
    months = (d1.getFullYear() - d2.getFullYear()) * 12;
    months -= d2.getMonth();
    months += d1.getMonth();
    return months <= 0 ? 0 : months;
  }
};
