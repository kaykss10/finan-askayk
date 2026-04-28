import { useState } from 'react';
import { X, Plus, Calendar, Tag, Hash, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionForm({ onSubmit, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense',
    status: 'pendente',
    installments_total: 1,
    is_fixed: false,
    date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (parseFloat(formData.amount) <= 0 || isNaN(formData.amount)) {
      setError('O valor deve ser maior que zero.');
      return;
    }
    if (!formData.category.trim()) {
      setError('A categoria é obrigatória.');
      return;
    }

    onSubmit({ 
      ...formData, 
      name: formData.name.trim(),
      category: formData.category.trim(),
      amount: parseFloat(formData.amount) 
    });
    
    setFormData({
      name: '',
      amount: '',
      category: '',
      type: 'expense',
      status: 'pendente',
      installments_total: 1,
      is_fixed: false,
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
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
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-ambient p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Nova Transação</h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-dim/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-primary/60" />
              </button>
            </div>

            {error && (
              <div className="bg-danger/10 text-danger p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary/60 mb-1 block">Nome</label>
                <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Aluguel, Salário..."
                    className="input pl-11"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-primary/40">R$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="input pl-10"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Tipo</label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      required
                      type="text"
                      placeholder="Ex: Alimentação"
                      className="input pl-11"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                      required
                      type="date"
                      className="input pl-11"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Recorrência</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_fixed: false})}
                      className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${!formData.is_fixed ? 'bg-primary/5 border-primary/20 text-primary dark:bg-slate-800 dark:border-slate-600 dark:text-white' : 'border-surface-dim/20 text-primary/40 hover:bg-surface-dim/5 dark:border-slate-700 dark:text-slate-500'}`}
                    >
                      Parcelado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_fixed: true, installments_total: 1})}
                      className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${formData.is_fixed ? 'bg-primary/5 border-primary/20 text-primary dark:bg-slate-800 dark:border-slate-600 dark:text-white' : 'border-surface-dim/20 text-primary/40 hover:bg-surface-dim/5 dark:border-slate-700 dark:text-slate-500'}`}
                    >
                      Fixo
                    </button>
                  </div>
                </div>
                {!formData.is_fixed && (
                  <div>
                    <label className="text-sm font-medium text-primary/60 mb-1 block">Parcelas</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                      <input
                        type="number"
                        min="1"
                        className="input pl-11"
                        value={formData.installments_total}
                        onChange={e => setFormData({...formData, installments_total: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                )}
                <div className={formData.is_fixed ? 'col-span-2' : ''}>
                  <label className="text-sm font-medium text-primary/60 mb-1 block">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago / Recebido</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-4 mt-4 text-lg">
                Salvar Transação
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
