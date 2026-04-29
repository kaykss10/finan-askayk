import { useMemo } from 'react';
import { Trash2, CheckCircle, Clock, Repeat, Edit2, ChevronRight } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCategories } from '../hooks/useCategories';

export default function TransactionList({ transactions, onDelete, onToggleStatus, onEdit }) {
  const { categories } = useCategories();

  // Group by date for visual organization - memoized for performance
  const grouped = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    }, {});
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-primary/40 italic dark:text-dark-dim">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
        <div key={date} className="space-y-2">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary/30 dark:text-dark-dim px-1">
            {format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}
          </h5>
          <div className="space-y-3">
            {items.map((t) => {
              const category = categories.find(c => c.name === t.category);
              const color = category?.color || '#111827';
              
              return (
                <div key={t.id} className="card p-4 flex items-center justify-between hover:border-primary/20 dark:hover:border-dark-accent/40 transition-all group cursor-pointer" onClick={() => onEdit(t)}>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className={`p-2 rounded-xl shrink-0 ${
                      t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {t.type === 'income' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-primary dark:text-white truncate">{t.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary/40 dark:text-dark-dim">
                        <span style={{ color }}>{t.category}</span>
                        {t.is_recurring ? (
                          <span className="flex items-center gap-1 bg-primary/5 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[8px]"><Repeat className="w-2 h-2" /> Fixo</span>
                        ) : t.installments_total > 1 ? (
                          <span className="bg-primary/5 dark:bg-dark-bg px-1.5 py-0.5 rounded text-[8px]">{t.installments_current}/{t.installments_total} Parc.</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-sm md:text-base ${
                        t.type === 'income' ? 'text-success' : 'text-danger'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(t.id, t.status === 'pago' ? 'pendente' : 'pago');
                        }}
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                          t.status === 'pago' ? 'bg-success text-white dark:bg-dark-accent dark:text-black' : 'bg-surface-dim/20 text-primary/40 dark:bg-dark-surface dark:text-dark-dim'
                        }`}
                      >
                        {t.status}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(t);
                        }}
                        className="p-2 text-primary/40 hover:text-primary dark:text-dark-dim dark:hover:text-white hover:bg-surface-dim/10 dark:hover:bg-dark-bg rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(t.id, t.installment_group_id);
                        }}
                        className="p-2 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary/20 dark:text-dark-border md:hidden" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
