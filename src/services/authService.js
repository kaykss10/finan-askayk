import { supabase } from '../lib/supabase';

export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this.handleAuthError(error));
    return data;
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(this.handleAuthError(error));
    return data;
  },

  async updateUser(attributes) {
    const { data, error } = await supabase.auth.updateUser({ data: attributes });
    if (error) throw new Error('Não foi possível atualizar o perfil.');
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  handleAuthError(error) {
    // Sanitize error messages for production
    switch (error.message) {
      case 'Invalid login credentials':
        return 'E-mail ou senha inválidos.';
      case 'User already registered':
        return 'Este e-mail já está em uso.';
      default:
        return 'Ocorreu um erro na autenticação. Tente novamente.';
    }
  }
};
