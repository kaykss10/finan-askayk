import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCategories } from '../hooks/useCategories';

export default function DashboardChart({ transactions }) {
  const { categories } = useCategories();

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        const category = categories.find(c => c.name === t.category);
        acc.push({ 
          name: t.category, 
          value: Number(t.amount),
          color: category?.color || '#111827'
        });
      }
      return acc;
    }, []);

  if (expenseData.length === 0) {
    return (
      <div className="card h-[300px] flex items-center justify-center">
        <p className="text-primary/40 italic text-sm dark:text-dark-dim">Sem dados de despesas para exibir.</p>
      </div>
    );
  }

  return (
    <div className="card h-[400px]">
      <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Despesas por Categoria</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '20px', 
              border: '1px solid rgba(0, 255, 0, 0.1)', 
              boxShadow: '0 20px 40px -4px rgba(0, 0, 0, 0.4)',
              fontSize: '12px',
              fontWeight: '700',
              backgroundColor: '#161912',
              color: '#D4FF9D'
            }}
            itemStyle={{ color: '#D4FF9D' }}
            formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 dark:text-dark-dim">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
