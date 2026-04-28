import { useEffect, useState } from 'react';
import { fetchJson } from '../utils/api.js';

export default function AdminMembers({ theme, cardClass, mutedText }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchJson('/admin/members');
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = async (id, name, tripTitle) => {
    if (!window.confirm(`Delete ${name} from ${tripTitle}?`)) {
      return;
    }

    try {
      setMessage('');
      await fetchJson(`/admin/members/${id}`, { method: 'DELETE' });
      setMessage('Member deleted successfully');
      await loadMembers();
    } catch (err) {
      setError(err.message || 'Failed to delete member');
    }
  };

  if (loading) {
    return <div className={`rounded-2xl p-6 ${cardClass}`}><p className={mutedText}>Loading members...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-emerald-300"> Admin Control Panel</p>
        <h2 className="text-3xl font-semibold">Manage Members</h2>
      </div>

      {message && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
      {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'border-b border-white/10 text-slate-300' : 'border-b border-slate-200 text-slate-600'}>
                <th className="px-4 py-3 text-left">Trip</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Trip Status</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={theme === 'dark' ? 'border-t border-white/10 hover:bg-white/5' : 'border-t border-slate-200 hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium">{member.trip_title}</td>
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.trip_status}</td>
                  <td className="px-4 py-3">{member.created_by_name || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name, member.trip_title)}
                      className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="7" className={`px-4 py-8 text-center ${mutedText}`}>No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
