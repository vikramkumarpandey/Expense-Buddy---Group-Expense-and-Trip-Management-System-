import { useNavigate } from 'react-router-dom';

export default function TripMembersRating({ trip, members, theme, cardClass, mutedText }) {
  const navigate = useNavigate();

  if (!trip) return null;

  // Mock logged-in user (Vikram) should not rate themselves.
  const LOGGED_IN_USER_ID = 1;

  const otherMembers = (members || []).filter(m => m.user_id !== LOGGED_IN_USER_ID);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/post-trip-ratings')}
        className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
      >
        ← Back to Trips
      </button>

      <div className={cardClass}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{trip.title}</h2>
            <p className={`mt-1 ${mutedText}`}>📍 {trip.destination}</p>
          </div>
          <span className="rounded-full bg-emerald-400/20 px-4 py-1.5 text-sm font-semibold text-emerald-500 dark:text-emerald-400">
            {trip.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">👥 Members to Rate</h3>
        
        {otherMembers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {otherMembers.map(member => (
              <div key={member.user_id} className={`flex items-center justify-between ${cardClass}`}>
                <div>
                  <h4 className="text-lg font-bold">{member.name}</h4>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    member.role === 'Coordinator'
                      ? 'bg-cyan-400/20 text-cyan-500 dark:text-cyan-300'
                      : 'bg-blue-400/20 text-blue-500 dark:text-blue-300'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/post-trip-ratings/${trip.id}/member/${member.user_id}`)}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-105"
                >
                  ⭐ Rate Member
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={cardClass}>
            <p className={`text-center py-6 ${mutedText}`}>No other members to rate in this trip.</p>
          </div>
        )}
      </div>
    </div>
  );
}
