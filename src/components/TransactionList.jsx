import { Trash2, CheckCircle, Clock, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TransactionList({ transactions, onDelete, onToggleStatus }) {
  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-primary/40 italic">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div key={t.id} className="card p-4 flex items-center justify-between hover:border-primary/20 transition-all group">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${
              t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              {t.type === 'income' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-primary dark:text-white">{t.name}</h4>
              <div className="flex items-center gap-2 text-xs text-primary/40 dark:text-slate-400">
                <span className="capitalize">{t.category}</span>
                <span>•</span>
                <span>{format(new Date(t.date), "dd 'de' MMMM", { locale: ptBR })}</span>
                {t.is_fixed ? (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> Fixo</span>
                  </>
                ) : t.installments_total > 1 ? (
                   <>
                    <span>•</span>
                    <span>{t.installments_current}/{t.installments_total} parc.</span>
                   </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className={`font-bold ${
                t.type === 'income' ? 'text-success' : 'text-danger'
              }`}>
                {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <button 
                onClick={() => onToggleStatus(t.id, t.status === 'pago' ? 'pendente' : 'pago')}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  t.status === 'pago' ? 'bg-success text-white' : 'bg-surface-dim/20 text-primary/40'
                }`}
              >
                {t.status}
              </button>
            </div>
            <button 
              onClick={() => onDelete(t.id)}
              className="p-2 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
