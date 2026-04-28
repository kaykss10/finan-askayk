import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#111827', '#10B981', '#E11D48', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function DashboardChart({ transactions }) {
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({ name: t.category, value: Number(t.amount) });
      }
      return acc;
    }, []);

  if (expenseData.length === 0) {
    return (
      <div className="card h-[300px] flex items-center justify-center">
        <p className="text-primary/40 italic text-sm">Sem dados de despesas para exibir.</p>
      </div>
    );
  }

  return (
    <div className="card h-[400px]">
      <h3 className="text-lg font-bold text-primary mb-4">Despesas por Categoria</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 40px -4px rgba(17, 24, 39, 0.1)',
              fontSize: '12px',
              fontWeight: '600'
            }}
            formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs font-medium text-primary/60">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
