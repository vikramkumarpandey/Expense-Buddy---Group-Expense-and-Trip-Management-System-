import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api.js';

export default function GlobalRatings({ theme, cardClass, mutedText }) {
  const [mode, setMode] = useState('members');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const endpoint = mode === 'members' ? '/ratings/global/members' : '/ratings/global/organisers';
        const result = await fetchJson(endpoint);
        setData(Array.isArray(result) ? result : (result?.data || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [mode]);

  const getRankBadge = (index) => {
    if (index === 0) return '🥇 Rank 1';
    if (index === 1) return '🥈 Rank 2';
    if (index === 2) return '🥉 Rank 3';
    return `#${index + 1}`;
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 4.0) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <p className="text-sm text-cyan-500 font-bold uppercase tracking-wider">🏆 Leaderboard</p>
            <h2 className="text-3xl font-bold mt-1">Global Leaderboard</h2>
            <p className={`mt-1 text-sm ${mutedText}`}>Overall member rankings across all trips</p>
          </div>

          {/* Toggle Buttons */}
          <div className={`flex rounded-xl p-1.5 border shadow-inner ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
            <button
              onClick={() => setMode('members')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'members'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : `text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400`
                }`}
            >
              Members
            </button>
            <button
              onClick={() => setMode('organisers')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'organisers'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : `text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400`
                }`}
            >
              Organisers
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden p-0 sm:p-0`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b border-slate-200 dark:border-slate-700/50 ${theme === 'dark' ? 'bg-black/20 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Rank</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Traveler</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-center">Avg Rating</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-center">Trips</th>
                <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center animate-pulse opacity-60 font-semibold text-lg">
                    Computing analytics...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-rose-500 font-semibold text-lg">
                    No data available.
                  </td>
                </tr>
              ) : (
                data.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${index < 3 ? (theme === 'dark' ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : 'bg-amber-50') : ''
                      }`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-xl font-black ${index === 0 ? 'text-amber-500 drop-shadow-md text-2xl' :
                          index === 1 ? 'text-slate-400 drop-shadow-md text-xl' :
                            index === 2 ? 'text-amber-700 dark:text-amber-600 drop-shadow-md text-xl' :
                              'opacity-50 text-lg'
                        }`}>
                        {getRankBadge(index)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-lg">{user.name}</div>
                      <div className={`text-xs mt-1 font-semibold ${mutedText}`}>Based on {user.totalReviews} reviews</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black ${getScoreColor(user.avgRating)}`}>
                        <span className="text-xl">⭐ {user.avgRating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-bold text-xl">{user.totalTrips}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase font-bold border ${(user.badge || '').includes('Elite')
                          ? 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400'
                          : (user.badge || '').includes('Excellent')
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                            : (user.badge || '').includes('Reliable')
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}>
                        {user.badge || 'No Badge'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
