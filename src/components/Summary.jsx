import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCard = ({ title, amount, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card flex items-center gap-4 min-w-[240px] flex-1"
  >
    <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-primary/60 dark:text-slate-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-primary dark:text-white">
        R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </h3>
    </div>
  </motion.div>
);

export default function Summary({ transactions }) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expenses;

  return (
    <div className="flex flex-wrap gap-6 mb-8">
      <SummaryCard 
        title="Entradas" 
        amount={income} 
        icon={TrendingUp} 
        colorClass="bg-success" 
      />
      <SummaryCard 
        title="Saídas" 
        amount={expenses} 
        icon={TrendingDown} 
        colorClass="bg-danger" 
      />
      <SummaryCard 
        title="Saldo Total" 
        amount={balance} 
        icon={Wallet} 
        colorClass="bg-primary" 
      />
    </div>
  );
}
