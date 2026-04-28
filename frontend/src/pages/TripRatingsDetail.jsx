import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJson } from '../utils/api.js';
import { Star } from 'lucide-react';

export default function TripRatingsDetail({ trips, theme, cardClass, mutedText }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState([]);
  const [error, setError] = useState('');

  const trip = trips.find(t => String(t.id) === tripId);

  useEffect(() => {
    if (!trip) return;
    const fetchRatings = async () => {
      try {
        const data = await fetchJson(`/ratings/trip/${tripId}`);
        setMemberData(data.members || []);
      } catch (err) {
        setError('Failed to fetch rating aggregation');
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [tripId, trip]);

  if (!trip) return <p className="text-center mt-10">Trip not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/trip-ratings')}
        className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
      >
        ← Back to Trips
      </button>

      {/* Header */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-400">✨ Aggregated Trip Ratings</p>
            <h2 className="text-3xl font-bold mt-1">{trip.title}</h2>
            <p className={`mt-1 text-sm ${mutedText}`}>📍 {trip.destination} • {trip.start_date}</p>
          </div>
          <div className={`px-4 py-3 rounded-xl text-center border ${theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Members Rated</p>
            <p className="text-2xl font-bold text-amber-500 leading-none mt-1">{memberData.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={cardClass}><p className="text-center py-10 opacity-60 font-semibold animate-pulse">Computing Aggregations...</p></div>
      ) : error ? (
        <div className={cardClass}><p className="text-center py-10 font-bold text-rose-500">❌ {error}</p></div>
      ) : memberData.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {memberData.map(member => (
            <div key={member.user_id} className={`flex flex-col gap-5 ${cardClass} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              
              {/* Header: Name, Role, Badges */}
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <span className={`inline-block mt-1 uppercase text-xs font-bold tracking-wider px-2 py-0.5 rounded border ${
                    member.role === 'Coordinator' 
                      ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400' 
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                  }`}>
                    {member.role}
                  </span>
                </div>
                {/* Average overall */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-orange-500/20 px-4 py-2 rounded-2xl border border-amber-400/30">
                  <Star className="text-amber-500 fill-amber-500 drop-shadow-md" size={24} />
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{member.avgRating}</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}>
                <div className="space-y-4">
                  {[
                    { label: '🎭 Behavior', val: member.parameterAverages.behavior },
                    { label: '🤝 Teamwork', val: member.parameterAverages.teamwork },
                    { label: '⚡ Reliability', val: member.parameterAverages.reliability }
                  ].map(param => (
                    <div key={param.label} className="flex items-center text-sm font-semibold">
                      <span className="w-28 opacity-90">{param.label}</span>
                      <div className="flex-1 ml-2 relative h-2.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                            param.val >= 4.5 ? 'bg-emerald-400' : param.val >= 3.0 ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                          style={{ width: `${(param.val / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 w-6 text-right font-mono font-bold opacity-90">{param.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {member.badges.map((badge, i) => (
                  <span key={i} className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm ${
                    i === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400/50' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {i === 0 && '🏆 '}{badge}
                  </span>
                ))}
              </div>

              {/* Comments Section */}
              {member.comments.length > 0 && (
                <div className="mt-2 pt-4 border-t border-slate-300 dark:border-slate-700/50">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3 flex items-center gap-2">
                    💬 Recent Reviews
                  </p>
                  <div className="space-y-3">
                    {member.comments.map((comment, i) => (
                      <div key={i} className={`text-sm italic p-3 rounded-lg border-l-2 bg-slate-50 border-amber-400 dark:bg-black/20 dark:border-amber-500/50 ${mutedText} leading-relaxed`}>
                        "{comment}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className={cardClass}>
          <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <p className="text-xl font-bold opacity-60">No ratings submitted yet.</p>
            <p className="text-sm mt-2 opacity-50 font-medium">Head over to "Post-Trip Ratings" to review your peers!</p>
          </div>
        </div>
      )}

    </div>
  );
}
