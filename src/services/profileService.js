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
    await this.updateProfile({
      ...profileData,
      onboarding_completed: true,
      last_processed_month: new Date().toISOString().split('T')[0].substring(0, 7) + '-01'
    });

    // 2. Save installments as templates if any
    if (installments.length > 0) {
      const { error: instError } = await supabase
        .from('installment_templates')
        .insert(installments.map(inst => ({
          ...inst,
          user_id: user.id
        })));
      if (instError) throw new Error('Erro ao salvar parcelas iniciais');
    }

    return true;
  }
};
