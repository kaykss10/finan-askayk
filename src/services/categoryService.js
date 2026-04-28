import { supabase } from '../lib/supabase';

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw new Error('Erro ao carregar categorias.');
    return data;
  },

  async upsert(category) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: category.name,
        color: category.color,
      }, { onConflict: 'name,user_id' })
      .select();

    if (error) throw new Error('Erro ao salvar categoria.');
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Erro ao excluir categoria.');
  }
};
