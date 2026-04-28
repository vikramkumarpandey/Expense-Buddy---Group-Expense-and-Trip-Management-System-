import { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';

export default function AdminTrips({ theme, cardClass, mutedText }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchJson('/admin/trips');
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete trip ${title}? This will remove trip members, expenses, ratings, and settlements.`)) {
      return;
    }

    try {
      setMessage('');
      await fetchJson(`/admin/trips/${id}`, { method: 'DELETE' });
      setMessage('Trip deleted successfully');
      await loadTrips();
    } catch (err) {
      setError(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return <div className={`rounded-2xl p-6 ${cardClass}`}><p className={mutedText}>Loading trips...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-cyan-300">👑 Admin Control Panel</p>
        <h2 className="text-3xl font-semibold">Manage Trips</h2>
      </div>

      {message && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
      {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'border-b border-white/10 text-slate-300' : 'border-b border-slate-200 text-slate-600'}>
                <th className="px-4 py-3 text-left">Trip</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Budget</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-left">Expense</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className={theme === 'dark' ? 'border-t border-white/10 hover:bg-white/5' : 'border-t border-slate-200 hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium">{trip.title}</td>
                  <td className="px-4 py-3">{trip.destination}</td>
                  <td className="px-4 py-3">₹{Number(trip.budget).toLocaleString()}</td>
                  <td className="px-4 py-3">{trip.status}</td>
                  <td className="px-4 py-3">{trip.member_count}</td>
                  <td className="px-4 py-3">₹{Number(trip.total_expense).toLocaleString()}</td>
                  <td className="px-4 py-3">{trip.created_by_name || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(trip.id, trip.title)}
                      className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td colSpan="8" className={`px-4 py-8 text-center ${mutedText}`}>No trips found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
