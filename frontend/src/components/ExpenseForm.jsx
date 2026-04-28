import { useState } from 'react';

const initialState = {
  title: '',
  category: 'Food',
  amount: '',
  expense_date: '',
  notes: '',
  transaction_type: 'expense',
  payment_method: 'Cash'
};

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Clothes', 'Education',
  'Stationary', 'Rent', 'Recharge', 'Groceries', 'Fruits & Vegetables',
  'Fitness', 'Travel', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

export default function TransactionForm({ theme, onSubmit }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, amount: Number(form.amount) });
    setForm(initialState);
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 outline-none transition focus:scale-[1.01] ${
    theme === 'dark'
      ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:border-cyan-400'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
  }`;

  return (
    <form onSubmit={handleSubmit} className={`rounded-[28px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'} backdrop-blur-2xl shadow-xl`}>
      <h3 className="mb-4 text-xl font-semibold">Add Transaction</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <input 
          name="title" 
          placeholder="Transaction title" 
          className={inputClass} 
          value={form.title} 
          onChange={handleChange} 
          required 
        />
        
        <select 
          name="transaction_type" 
          className={inputClass} 
          value={form.transaction_type} 
          onChange={handleChange}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select 
          name="category" 
          className={inputClass} 
          value={form.category} 
          onChange={handleChange}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select 
          name="payment_method" 
          className={inputClass} 
          value={form.payment_method} 
          onChange={handleChange}
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        <input 
          name="amount" 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="Amount" 
          className={inputClass} 
          value={form.amount} 
          onChange={handleChange} 
          required 
        />

        <input 
          name="expense_date" 
          type="date" 
          className={inputClass} 
          value={form.expense_date} 
          onChange={handleChange} 
          required 
        />
      </div>

      <textarea 
        name="notes" 
        placeholder="Notes" 
        className={`${inputClass} mt-4 min-h-20`} 
        value={form.notes} 
        onChange={handleChange} 
      />

      <button
        type="submit"
        onMouseDown={(e) => e.currentTarget.classList.add('scale-95')}
        onMouseUp={(e) => e.currentTarget.classList.remove('scale-95')}
        className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
      >
        Save Transaction
      </button>
    </form>
  );
}
