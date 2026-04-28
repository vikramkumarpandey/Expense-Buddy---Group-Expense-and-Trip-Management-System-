import { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';

export default function AdminUsers({ theme, cardClass, mutedText }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchJson('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This will remove related trips, memberships, expenses, ratings, and settlements.`)) {
      return;
    }

    try {
      setMessage('');
      await fetchJson(`/admin/users/${id}`, { method: 'DELETE' });
      setMessage('User deleted successfully');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className={`rounded-2xl p-6 ${cardClass}`}><p className={mutedText}>Loading users...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-blue-300">👑 Admin Control Panel</p>
        <h2 className="text-3xl font-semibold">Manage Users</h2>
      </div>

      {message && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
      {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'border-b border-white/10 text-slate-300' : 'border-b border-slate-200 text-slate-600'}>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Trips</th>
                <th className="px-4 py-3 text-left">Ratings</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={theme === 'dark' ? 'border-t border-white/10 hover:bg-white/5' : 'border-t border-slate-200 hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.city || '—'}</td>
                  <td className="px-4 py-3">{user.trip_count}</td>
                  <td className="px-4 py-3">{user.rating_count}</td>
                  <td className="px-4 py-3">{user.created_at ? user.created_at.slice(0, 10) : '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id, user.name)}
                      className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="8" className={`px-4 py-8 text-center ${mutedText}`}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
