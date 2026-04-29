import { supabase } from '../lib/supabase';

export const profileService = {
  async getProfile() {
    const { data, error } = await supabase
      .from('user_financial_profile')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('user_financial_profile')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error('Erro ao atualizar perfil financeiro');
    return data;
  },

  async completeOnboarding(profileData, installments = []) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // 1. Save profile
    // Define o mês processado como o mês anterior para que o ciclo mensal rode para o mês atual
    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastProcessed = prevMonth.toISOString().split('T')[0].substring(0, 7) + '-01';

    await this.updateProfile({
      ...profileData,
      onboarding_completed: true,
      last_processed_month: lastProcessed
    });

    // 2. Criar transação de Saldo Inicial (Ajuste)
    if (profileData.current_balance > 0) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        name: 'Saldo Inicial (Onboarding)',
        amount: profileData.current_balance,
        type: 'income',
        category: 'Outros',
        date: today.toISOString().split('T')[0],
        status: 'pago'
      });
    }

    // 3. Save installments as templates if any
    if (installments.length > 0) {
      const { error: instError } = await supabase
        .from('installment_templates')
        .insert(installments.map(inst => ({
          name: inst.name,
          total_amount: inst.total_amount,
          total_installments: inst.total_installments,
          current_installment: inst.current_installment,
          category: inst.category,
          start_date: inst.start_date,
          active: true,
          user_id: user.id
        })));
      if (instError) throw new Error('Erro ao salvar parcelas iniciais');
    }

    return true;
  },

  async resetOnboarding() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // 1. Limpar dados financeiros
    await supabase.from('transactions').delete().eq('user_id', user.id);
    await supabase.from('installment_templates').delete().eq('user_id', user.id);
    await supabase.from('recurring_templates').delete().eq('user_id', user.id);

    // 2. Resetar perfil
    await supabase.from('user_financial_profile').update({
      onboarding_completed: false,
      salary_amount: 0,
      current_balance: 0,
      last_processed_month: null
    }).eq('user_id', user.id);

    return true;
  }
};
