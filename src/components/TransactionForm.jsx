import { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, Hash, AlertCircle, Repeat, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../hooks/useCategories';

const PRESET_COLORS = [
  '#111827', '#10B981', '#E11D48', '#F59E0B', 
  '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'
];

export default function TransactionForm({ onSubmit, isOpen, onClose, initialData = null, onDelete = null }) {
  const { categories, saveCategory } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense',
    status: 'pendente',
    installments_total: 1,
    current_installment: 1,
    is_fixed: false,
    is_recurring: false,
    date: new Date().toISOString().split('T')[0],
    category_color: '#111827'
  });

  const [error, setError] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      const cat = categories.find(c => c.name === initialData.category);
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        category_color: cat?.color || '#111827'
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        category: '',
        type: 'expense',
        status: 'pendente',
        installments_total: 1,
        current_installment: 1,
        is_fixed: false,
        is_recurring: false,
        date: new Date().toISOString().split('T')[0],
        category_color: '#111827'
      });
    }
  }, [initialData, isOpen, categories]);

  const handleCategorySelect = (cat) => {
    setFormData({ 
      ...formData, 
      category: cat.name, 
      category_color: cat.color 
    });
    setShowColorPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('O nome é obrigatório.');
    if (parseFloat(formData.amount) <= 0 || isNaN(formData.amount)) return setError('O valor deve ser maior que zero.');
    if (!formData.category.trim()) return setError('A categoria é obrigatória.');

    // Save category color first
    await saveCategory({ 
      name: formData.category.trim(), 
      color: formData.category_color 
    });

    try {
      await onSubmit({ 
        ...formData, 
        name: formData.name.trim(),
        category: formData.category.trim(),
        amount: parseFloat(formData.amount) 
      });
      
      // Force immediate cycle sync after adding a recurring/fixed item
      if (formData.is_recurring || formData.is_fixed) {
        try {
          const { cycleService } = await import('../services/cycleService');
          const { parseISO } = await import('date-fns');
          await cycleService.processMonthlyCycle(parseISO(formData.date));
        } catch (syncErr) {
          console.error('Erro na sincronização pós-venda:', syncErr);
        }
      }
      
      onClose();
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md dark:bg-dark-bg/80"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl p-8 md:p-10 overflow-y-auto max-h-[90vh] border border-white/10 dark:border-dark-border"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-primary dark:text-white font-headline tracking-tight">
                {initialData ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <button onClick={onClose} className="p-3 hover:bg-surface-dim/10 dark:hover:bg-dark-bg rounded-2xl transition-all">
                <X className="w-6 h-6 text-primary/40 dark:text-dark-dim" />
              </button>
            </div>

            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-2xl flex items-center gap-3 mb-8 text-sm font-bold border border-danger/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Nome da Transação</label>
                <div className="relative group">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Aluguel, Salário..."
                    className="input pl-12"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Valor</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/30 dark:text-dark-dim group-focus-within:text-dark-accent transition-colors">R$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="input pl-11 font-bold"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select
                    className="input font-bold"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <label className="label">Categoria</label>
                  <div className="relative group">
                    <div 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-inner"
                      style={{ backgroundColor: formData.category_color }}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Ex: Alimentação"
                      className="input pl-12"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      onFocus={() => setShowColorPicker(true)}
                    />
                  </div>
                  
                  {showColorPicker && (
                    <div className="absolute top-full left-0 right-0 mt-3 p-5 bg-white dark:bg-dark-surface border border-surface-dim/20 dark:border-dark-border rounded-[2rem] shadow-2xl z-20">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 dark:text-dark-dim">Sugestões</span>
                        <button type="button" onClick={() => setShowColorPicker(false)} className="p-1 hover:bg-surface-dim/10 dark:hover:bg-dark-bg rounded-lg"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {categories.slice(0, 5).map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            className="px-3 py-1.5 bg-surface-dim/5 dark:bg-dark-bg rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/60 dark:text-dark-dim hover:text-primary dark:hover:text-dark-accent transition-all"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 dark:text-dark-dim block mb-3">Escolher Cor</span>
                      <div className="grid grid-cols-4 gap-3">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({...formData, category_color: color})}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${formData.category_color === color ? 'ring-2 ring-primary ring-offset-2 dark:ring-dark-accent dark:ring-offset-dark-surface' : ''}`}
                            style={{ backgroundColor: color }}
                          >
                            {formData.category_color === color && <Check className="w-4 h-4 text-white dark:text-black" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Data</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
                    <input
                      required
                      type="date"
                      className="input pl-12"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="label">Tipo de Lançamento</label>
                  <div className="flex gap-3 p-1.5 bg-surface-dim/5 dark:bg-dark-bg rounded-2xl border border-surface-dim/10 dark:border-dark-border">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_fixed: false, is_recurring: false})}
                      className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!formData.is_fixed && !formData.is_recurring ? 'bg-white dark:bg-dark-accent text-primary dark:text-black shadow-sm' : 'text-primary/40 dark:text-dark-dim hover:text-primary dark:hover:text-white'}`}
                    >
                      Único
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_fixed: false, is_recurring: true, installments_total: 1})}
                      className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.is_recurring ? 'bg-white dark:bg-dark-accent text-primary dark:text-black shadow-sm' : 'text-primary/40 dark:text-dark-dim hover:text-primary dark:hover:text-white'}`}
                    >
                      <Repeat className="w-3 h-3 inline mr-1" /> Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_fixed: true, is_recurring: false})}
                      className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.is_fixed ? 'bg-white dark:bg-dark-accent text-primary dark:text-black shadow-sm' : 'text-primary/40 dark:text-dark-dim hover:text-primary dark:hover:text-white'}`}
                    >
                      Parcelas
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {formData.is_fixed && (
                    <>
                      <div>
                        <label className="label">Qtd. Parcelas</label>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
                          <input
                            type="number"
                            min="2"
                            max="60"
                            className="input pl-12"
                            value={formData.installments_total || ''}
                            onChange={e => setFormData({...formData, installments_total: e.target.value ? parseInt(e.target.value) : ''})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Próxima Parcela</label>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
                          <input
                            type="number"
                            min="1"
                            max={formData.installments_total}
                            className="input pl-12"
                            value={formData.current_installment || ''}
                            onChange={e => setFormData({...formData, current_installment: e.target.value ? parseInt(e.target.value) : ''})}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className={!formData.is_fixed ? 'col-span-2' : 'col-span-2 md:col-span-1'}>
                    <label className="label">Status</label>
                    <select
                      className="input font-bold"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago / Recebido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button type="submit" className="btn btn-primary w-full py-5 mt-4 text-xl shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20">
                  <span className="font-bold">{initialData ? 'Atualizar Transação' : 'Salvar Transação'}</span>
                </button>

                {initialData && onDelete && (
                  <button 
                    type="button" 
                    onClick={onDelete}
                    className="w-full py-4 bg-danger/5 hover:bg-danger/10 text-danger rounded-3xl font-bold transition-all flex items-center justify-center gap-2 border border-danger/10"
                  >
                    <Trash2 className="w-5 h-5" />
                    Excluir Transação
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
