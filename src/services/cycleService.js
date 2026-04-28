import { supabase } from '../lib/supabase';
import { format, startOfMonth, parseISO, isAfter, addMonths, isSameMonth } from 'date-fns';
import { profileService } from './profileService';

export const cycleService = {
  async processMonthlyCycle() {
    const profile = await profileService.getProfile();
    if (!profile || !profile.onboarding_completed) return;

    const today = new Date();
    const currentMonthStr = format(startOfMonth(today), 'yyyy-MM-dd');
    const lastProcessed = profile.last_processed_month;

    // If already processed current month, skip
    if (lastProcessed && isAfter(parseISO(lastProcessed), parseISO(currentMonthStr)) || lastProcessed === currentMonthStr) {
      return;
    }

    // Process from lastProcessed until currentMonth
    let processingMonth = lastProcessed ? addMonths(parseISO(lastProcessed), 1) : parseISO(currentMonthStr);
    
    while (!isAfter(processingMonth, parseISO(currentMonthStr))) {
      const monthStr = format(processingMonth, 'yyyy-MM-dd');
      await this.generateTransactionsForMonth(profile, monthStr);
      processingMonth = addMonths(processingMonth, 1);
    }

    // Update profile with last processed month
    await profileService.updateProfile({ last_processed_month: currentMonthStr });
  },

  async generateTransactionsForMonth(profile, monthStr) {
    const monthDate = parseISO(monthStr);
    const userId = profile.user_id;

    // 1. Generate Salary
    if (profile.salary_amount > 0) {
      const salaryDate = new Date(monthDate);
      salaryDate.setDate(profile.salary_day);
      
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
    const { data: recurring } = await supabase
      .from('recurring_templates')
      .select('*')
      .eq('active', true);

    if (recurring) {
      for (const t of recurring) {
        const tDate = new Date(monthDate);
        tDate.setDate(t.day_of_month);
        
        await this.createIfNotExists({
          name: t.name,
          amount: t.amount,
          category: t.category,
          type: t.type,
          date: format(tDate, 'yyyy-MM-dd'),
          template_id: t.id,
          template_type: 'recurring',
          status: 'pendente'
        }, userId);
      }
    }

    // 3. Process Installment Templates
    const { data: installments } = await supabase
      .from('installment_templates')
      .select('*')
      .eq('active', true);

    if (installments) {
      for (const t of installments) {
        // Calculate if this installment belongs to this month
        const start = parseISO(t.start_date);
        const monthsDiff = this.diffInMonths(monthDate, start);
        
        if (monthsDiff >= 0 && monthsDiff < (t.total_installments - t.current_installment + 1)) {
          const instNum = t.current_installment + monthsDiff;
          
          await this.createIfNotExists({
            name: `${t.name} (${instNum}/${t.total_installments})`,
            amount: t.total_amount / t.total_installments,
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
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('name', transaction.name)
      .eq('date', transaction.date)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('transactions').insert({
        ...transaction,
        user_id: userId
      });
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
