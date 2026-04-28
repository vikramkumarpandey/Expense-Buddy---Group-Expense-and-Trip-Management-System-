import { Star } from 'lucide-react';

export default function RatingCard({ theme, member, topRated }) {
  const renderStars = (score) => {
    const fullStars = Math.round(score);
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < fullStars ? 'text-amber-300' : theme === 'dark' ? 'text-white/20' : 'text-slate-300'}
        fill={index < fullStars ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className={`rounded-[28px] p-5 transition hover:-translate-y-1 ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white/75'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold">{member.name}</h4>
            {topRated && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${theme === 'dark' ? 'bg-amber-400/15 text-amber-200' : 'bg-amber-50 text-amber-700'}`}>
                Top Rated
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{member.role || 'Trip Member'}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">{renderStars(member.overall)}</div>
          <p className="mt-2 text-xl font-bold">{member.overall}/5</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-4">
        <p className={`text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>Peer Comment</p>
        <p className="mt-2 text-sm leading-6">{member.comment || 'No comment yet.'}</p>
      </div>

      <div className="mt-4">
        <p className={`mb-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>Badges earned</p>
        <div className="flex flex-wrap gap-2">
          {(member.badges || []).map((badge) => (
            <span key={badge} className={`rounded-full px-3 py-1.5 text-xs font-medium ${theme === 'dark' ? 'bg-white/10 text-cyan-200' : 'bg-cyan-50 text-cyan-700'}`}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ['Behavior', member.behavior],
          ['Teamwork', member.teamwork],
          ['Reliability', member.reliability]
        ].map(([label, value]) => (
          <div key={label} className={`rounded-2xl p-3 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
            <p className="mt-1 font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
