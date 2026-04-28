import { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function SettlementEditForm({ theme, manualSettlements, members, onSubmit, onCancel }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (manualSettlements && manualSettlements.length > 0) {
      setRows(manualSettlements.map(s => ({ ...s, isDeleted: false, isNew: false })));
    } else {
      setRows([{
        id: null,
        from_user_id: '',
        to_user_id: '',
        amount: 0,
        status: 'pending',
        isNew: true,
        isDeleted: false
      }]);
    }
  }, [manualSettlements]);

  const cardClass = theme === 'dark'
    ? 'border border-white/10 bg-white/5 p-4 rounded-xl'
    : 'border border-slate-200 bg-white/50 p-4 rounded-xl';

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${theme === 'dark'
      ? 'border-white/10 bg-black/20 text-white focus:border-cyan-400'
      : 'border-slate-200 bg-white text-slate-900 focus:border-cyan-500'
    }`;

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: null,
        from_user_id: '',
        to_user_id: '',
        amount: 0,
        status: 'pending',
        isNew: true,
        isDeleted: false
      }
    ]);
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const removeRow = (index) => {
    const newRows = [...rows];
    if (newRows[index].isNew) {
      newRows.splice(index, 1);
    } else {
      newRows[index].isDeleted = true;
    }
    setRows(newRows);
  };

  const activeRows = rows.filter(r => !r.isDeleted);

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let r of activeRows) {
      if (!r.from_user_id || !r.to_user_id || !r.amount) {
        alert("Please fill in all fields (From, To, Amount) for each settlement row.");
        return;
      }
      if (r.from_user_id === r.to_user_id) {
        alert("A user cannot settle with themselves.");
        return;
      }
      if (Number(r.amount) <= 0) {
        alert("Amount must be greater than zero.");
        return;
      }
    }
    onSubmit(rows);
  };

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">➕ Edit Manual Settlements</h3>
          <p className="text-sm mt-1 opacity-70">Add custom manual payments between members</p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 shadow-md"
        >
          <Plus size={16} /> Add Row
        </button>
      </div>

      <div className="space-y-3">
        {activeRows.map((row) => {
          const originalIndex = rows.indexOf(row);
          return (
            <div key={originalIndex} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center bg-slate-100/50 dark:bg-black/20 p-3 rounded-xl border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div>
                <select
                  value={row.from_user_id}
                  onChange={(e) => updateRow(originalIndex, 'from_user_id', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Payer (From)...</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={row.to_user_id}
                  onChange={(e) => updateRow(originalIndex, 'to_user_id', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value="">Receiver (To)...</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold opacity-50">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={row.amount}
                  onChange={(e) => updateRow(originalIndex, 'amount', e.target.value)}
                  className={`${inputClass} pl-7 font-mono font-bold`}
                  placeholder="0"
                />
              </div>

              <div>
                <select
                  value={row.status}
                  onChange={(e) => updateRow(originalIndex, 'status', e.target.value)}
                  className={inputClass}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="paid">✅ Paid</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeRow(originalIndex)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition self-center"
                title="Delete Row"
              >
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}

        {activeRows.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <p className="text-sm font-semibold opacity-60">No manual settlements configured.</p>
            <p className="text-xs mt-1 opacity-50">Click "Add Row" to assign a custom manual payment.</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-slate-500/20 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-6 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-700 transition hover:bg-slate-500/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2 text-sm font-bold text-white transition hover:bg-cyan-600 shadow-lg hover:shadow-cyan-500/40"
        >
          <Save size={18} /> Save All Settlements
        </button>
      </div>
    </form>
  );
}
