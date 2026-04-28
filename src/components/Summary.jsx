import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCard = ({ title, amount, icon: Icon, colorClass, delay = 0, isMain = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`card flex items-center gap-6 p-6 min-w-[240px] flex-1 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 border border-white/5 dark:border-dark-border ${isMain ? 'dark:bg-dark-accent dark:border-none' : ''}`}
  >
    <div className={`p-5 rounded-[1.5rem] ${isMain ? 'bg-black/10' : colorClass + ' bg-opacity-10 dark:bg-dark-bg'} shrink-0 group-hover:rotate-12 transition-transform duration-500`}>
      <Icon className={`w-8 h-8 ${isMain ? 'text-black' : colorClass.replace('bg-', 'text-') + ' dark:text-dark-accent'}`} />
    </div>
    <div className="min-w-0 relative z-10">
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 ${isMain ? 'text-black/40' : 'text-primary/30 dark:text-dark-dim'}`}>{title}</p>
      <h3 className={`text-2xl md:text-3xl font-bold tracking-tight truncate ${isMain ? 'text-black' : 'text-primary dark:text-white'}`}>
        <span className="text-sm mr-1 opacity-40">R$</span>
        {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </h3>
    </div>
    {!isMain && <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${colorClass} opacity-[0.05] blur-2xl group-hover:opacity-10 transition-opacity`} />}
    {isMain && <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />}
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
    <div className="flex flex-col sm:flex-row flex-wrap gap-6 mb-12">
      <SummaryCard 
        title="Entradas" 
        amount={income} 
        icon={TrendingUp} 
        colorClass="bg-success" 
        delay={0.1}
      />
      <SummaryCard 
        title="Saídas" 
        amount={expenses} 
        icon={TrendingDown} 
        colorClass="bg-danger" 
        delay={0.2}
      />
      <SummaryCard 
        title="Saldo Líquido" 
        amount={balance} 
        icon={Wallet} 
        colorClass="bg-primary" 
        delay={0.3}
        isMain={true}
      />
    </div>
  );
}
