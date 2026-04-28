import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PersonalAnalysis({ theme, analysisData }) {
  if (!analysisData) {
    return (
      <div className={`rounded-[28px] border p-8 text-center ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'}`}>
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>No data available</p>
      </div>
    );
  }

  const { totalIncome, totalExpense, savings, categoryBreakdown } = analysisData;

  // Pie chart data
  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Savings', value: Math.max(0, savings) }
  ];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

  // Bar chart data
  const barData = categoryBreakdown || [];

  const textColor = theme === 'dark' ? '#ffffff' : '#1e293b';
  const gridColor = theme === 'dark' ? '#ffffff20' : '#e2e8f0';
  const bgColor = theme === 'dark' ? '#0f172a' : '#f8fbff';

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-6 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Total Income</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className={`rounded-2xl border p-6 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Total Expense</p>
          <p className="mt-2 text-2xl font-bold text-rose-400">₹{totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className={`rounded-2xl border p-6 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Balance</p>
          <p className={`mt-2 text-2xl font-bold ${savings >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            ₹{Math.abs(savings).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* PIE CHART */}
      <div className={`rounded-[28px] border p-6 ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'}`}>
        <h3 className="mb-6 text-lg font-semibold">Income vs Expense vs Savings</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ₹${value.toLocaleString('en-IN')} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BAR CHART */}
      {barData.length > 0 ? (
        <div className={`rounded-[28px] border p-6 ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'}`}>
          <h3 className="mb-6 text-lg font-semibold">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="category" 
                stroke={textColor}
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={textColor} />
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#ffffff20' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  color: textColor
                }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={`rounded-[28px] border p-8 text-center ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'}`}>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>No expense data available</p>
        </div>
      )}
    </div>
  );
}
