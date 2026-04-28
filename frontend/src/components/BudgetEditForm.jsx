import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api.js';

const ALL_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Clothes', 'Education',
  'Stationary', 'Rent', 'Recharge', 'Groceries', 'Fruits & Vegetables',
  'Fitness', 'Travel', 'Other'
];

export default function BudgetEditForm({ theme, budgets, onSubmit, onCancel }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize rows from existing budgets
    const initialRows = budgets.map((b) => ({
      id: b.id,
      category: b.category,
      customCategory: '',
      monthly_limit: b.monthly_limit,
      isNew: false
    }));
    setRows(initialRows);
  }, [budgets]);

  const addRow = () => {
    setRows([...rows, {
      id: null,
      category: 'Food',
      customCategory: '',
      monthly_limit: 0,
      isNew: true
    }]);
  };

  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    if (field === 'category' && value !== 'Other') {
      updated[index].customCategory = '';
    }
    setRows(updated);
  };

  const getDuplicateCategories = () => {
    const categories = rows.map((row) => 
      row.category === 'Other' ? row.customCategory : row.category
    );
    return categories.filter((cat, idx) => categories.indexOf(cat) !== idx && cat);
  };

  const validateForm = () => {
    const duplicates = getDuplicateCategories();
    if (duplicates.length > 0) {
      setError(`Duplicate categories: ${duplicates.join(', ')}`);
      return false;
    }

    for (const row of rows) {
      const category = row.category === 'Other' ? row.customCategory : row.category;
      if (!category) {
        setError('Please fill in all categories');
        return false;
      }
      if (row.monthly_limit <= 0) {
        setError('All monthly limits must be greater than 0');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const budgetData = rows.map((row) => ({
        category: row.category === 'Other' ? row.customCategory : row.category,
        monthly_limit: Number(row.monthly_limit)
      }));

      await onSubmit(budgetData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `rounded-lg px-3 py-2 text-sm outline-none transition ${
    theme === 'dark'
      ? 'border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-emerald-400'
      : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
  }`;

  const cardClass = `rounded-[28px] border p-5 ${
    theme === 'dark'
      ? 'border-white/10 bg-white/10'
      : 'border-slate-200/70 bg-white/65'
  } backdrop-blur-2xl shadow-xl`;

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      <div className="mb-4">
        <p className="text-sm text-emerald-300">💰 Personal Finance Module</p>
        <h3 className="text-xl font-semibold">Edit All Budgets</h3>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage all your budgets in one place. Add, edit, or remove categories as needed.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
          ⚠️ {error}
        </div>
      )}

      {/* Table-like layout */}
      <div className="mb-6 overflow-x-auto">
        <div className="min-w-full space-y-3">
          {/* Header */}
          <div className={`grid grid-cols-[1.4fr_1.2fr_0.5fr] gap-3 px-4 py-3 rounded-lg font-semibold text-sm ${
            theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'
          }`}>
            <div>Category</div>
            <div>Monthly Limit (₹)</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className={`grid grid-cols-[1.4fr_1.2fr_0.5fr] gap-3 items-end px-4 py-3 rounded-lg ${
                theme === 'dark' ? 'border border-white/10 bg-white/5 hover:bg-white/10' : 'border border-slate-200 bg-slate-50 hover:bg-white'
              } transition`}>
                <div>
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(idx, 'category', e.target.value)}
                    className={`w-full ${inputClass}`}
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {row.category === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      value={row.customCategory}
                      onChange={(e) => updateRow(idx, 'customCategory', e.target.value)}
                      className={`mt-2 w-full ${inputClass}`}
                    />
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  step="100"
                  value={row.monthly_limit}
                  onChange={(e) => updateRow(idx, 'monthly_limit', Number(e.target.value))}
                  className={`w-full ${inputClass}`}
                />

                <button
                  type="button"
                  onClick={() => deleteRow(idx)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    theme === 'dark'
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Row Button */}
      <button
        type="button"
        onClick={addRow}
        className={`mb-6 rounded-lg px-4 py-2 text-sm font-medium transition ${
          theme === 'dark'
            ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
            : 'border border-emerald-400/30 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
        }`}
      >
        + Add Row
      </button>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50'
          }`}
        >
          {loading ? 'Saving...' : '💾 Save All'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
            theme === 'dark'
              ? 'border border-slate-400/30 bg-slate-400/10 text-slate-300 hover:bg-slate-400/20'
              : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
