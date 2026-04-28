import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api.js';

export default function BudgetForm({ theme, onSubmit }) {
  const [form, setForm] = useState({
    category: '',
    monthly_limit: ''
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchJson('/budgets/available-categories');
        setAvailableCategories(data.available);
        if (data.available.length > 0) {
          setForm((prev) => ({ ...prev, category: data.available[0] }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        category: form.category,
        monthly_limit: Number(form.monthly_limit)
      });
      setForm({ category: availableCategories[0] || '', monthly_limit: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 outline-none transition focus:scale-[1.01] ${
    theme === 'dark'
      ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:border-emerald-400'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
  }`;

  if (availableCategories.length === 0) {
    return (
      <div className={`rounded-[28px] border p-5 text-center ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'} backdrop-blur-2xl shadow-xl`}>
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
          All categories already have budgets! 🎉
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`rounded-[28px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'} backdrop-blur-2xl shadow-xl`}>
      <h3 className="mb-4 text-xl font-semibold">Add Budget</h3>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            name="category"
            className={inputClass}
            value={form.category}
            onChange={handleChange}
            required
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Monthly Limit (₹)</label>
          <input
            name="monthly_limit"
            type="number"
            min="1"
            step="100"
            placeholder="e.g., 3000"
            className={inputClass}
            value={form.monthly_limit}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        onMouseDown={(e) => e.currentTarget.classList.add('scale-95')}
        onMouseUp={(e) => e.currentTarget.classList.remove('scale-95')}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
      >
        {loading ? 'Adding...' : '+ Add Budget'}
      </button>
    </form>
  );
}
