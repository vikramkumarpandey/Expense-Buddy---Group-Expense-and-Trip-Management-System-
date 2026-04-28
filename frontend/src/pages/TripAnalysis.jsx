import { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { fetchJson } from '../utils/api.js';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#06b6d4', '#3b82f6', '#6b7280'];

export default function TripAnalysis({ trip, expenses, members, theme, onBack, onRefresh, cardClass, mutedText, listMode, trips, onSelect }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [expense_date, setExpense_date] = useState(new Date().toISOString().split('T')[0]);
  const [paid_by_user_id, setPaid_by_user_id] = useState((members && members[0]?.user_id) || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddExpense = async () => {
    if (!title || !amount) return;
    setLoading(true);
    setError('');
    try {
      await fetchJson(`/trips/${trip.id}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          amount: Number(amount),
          expense_date,
          paid_by_user_id: Number(paid_by_user_id)
        })
      });
      setTitle('');
      setAmount('');
      setExpense_date(new Date().toISOString().split('T')[0]);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  if (listMode) {
    return (
      <div className="space-y-6">
        <h2 className="mb-4 text-3xl font-bold">📊 Trip Analysis</h2>
        {trips && trips.length > 0 ? (
          <div className="flex flex-col gap-4">
            {(trips || []).map(t => (
              <div key={t.id} onClick={() => onSelect(t.id)} className={`cursor-pointer ${cardClass}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg">{t.title}</h4>
                    <p className={`text-sm ${mutedText} mt-1`}>Total Expense: ₹{t.totalExpense ? Number(t.totalExpense).toFixed(2) : '0'}</p>
                    <p className={`text-sm ${mutedText} mt-1`}>Budget: ₹{t.budget} ({t.totalExpense ? ((Number(t.totalExpense) / t.budget) * 100).toFixed(1) : '0'}% used)</p>
                  </div>
                  <div>
                    <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                      View Analysis →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cardClass}>
            <p className={`text-center py-8 ${mutedText}`}>No trips found to analyze.</p>
          </div>
        )}
      </div>
    );
  }

  if (!trip) {
    return (
      <div className={cardClass}>
        <p className={`text-center py-8 ${mutedText}`}>Select a trip to view expenses and analysis</p>
      </div>
    );
  }

  const categoryData = expenses && expenses.length > 0
    ? Object.entries(
      expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount || 0);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
    : [];

  const totalExpense = expenses ? expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) : 0;
  const usedPercent = trip.budget ? (totalExpense / trip.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
      >
        ← Back to Trip Detail
      </button>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">{trip.title} - Expense Analysis</h2>
        <p className={`mt-2 ${mutedText}`}>Budget used: ₹{totalExpense.toFixed(2)} / ₹{trip.budget} ({usedPercent.toFixed(1)}%)</p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 px-4 py-3">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">❌ {error}</p>
        </div>
      )}

      {/* Add Expense Form */}
      <div className={cardClass}>
        <h3 className="mb-4 text-xl font-semibold">➕ Add Expense</h3>
        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`rounded-xl px-4 py-2 text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-slate-200 text-slate-900'}`}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`rounded-xl px-4 py-2 text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-slate-200 text-slate-900'}`}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Accommodation</option>
              <option>Activities</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`rounded-xl px-4 py-2 text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-slate-200 text-slate-900'}`}
            />
            <input
              type="date"
              value={expense_date}
              onChange={(e) => setExpense_date(e.target.value)}
              className={`rounded-xl px-4 py-2 text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-slate-200 text-slate-900'}`}
            />
            <select
              value={paid_by_user_id}
              onChange={(e) => setPaid_by_user_id(e.target.value)}
              className={`rounded-xl px-4 py-2 text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/70 border border-slate-200 text-slate-900'}`}
            >
              {(members || []).map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddExpense}
            disabled={loading || !title || !amount}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>

      {/* Expenses List */}
      <div className={cardClass}>
        <h3 className="mb-4 text-xl font-semibold">💸 Expenses</h3>
        {expenses && expenses.length > 0 ? (
          <div className="space-y-3">
            {(expenses || []).map((exp) => (
              <div key={exp.id} className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{exp.title}</h4>
                    <p className={`text-sm ${mutedText}`}>{exp.category} • {exp.expense_date?.slice(0, 10)}</p>
                  </div>
                  <span className="font-semibold">₹{Number(exp.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${mutedText}`}>No expenses added yet</p>
        )}
      </div>

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className={cardClass}>
            <h3 className="mb-4 text-lg font-semibold">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={cardClass}>
            <h3 className="mb-4 text-lg font-semibold">Category Totals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#ffffff20' : '#00000020'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#ffffff80' : '#00000080'} />
                <YAxis stroke={theme === 'dark' ? '#ffffff80' : '#00000080'} />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
