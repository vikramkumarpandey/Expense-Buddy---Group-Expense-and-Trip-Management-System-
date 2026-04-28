import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { fetchJson } from '../utils/api.js';

const StarRating = ({ label, score, setScore, mutedText }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setScore(star)}
            className={`transition hover:scale-110 focus:outline-none`}
          >
            <Star
              size={28}
              className={star <= score ? "fill-amber-400 text-amber-400 drop-shadow-md" : "fill-transparent text-slate-400/50"}
            />
          </button>
        ))}
        <span className={`ml-3 text-sm font-bold ${score > 0 ? "text-amber-500 dark:text-amber-400" : mutedText}`}>
          {score > 0 ? `${score}/5` : "Unrated"}
        </span>
      </div>
    </div>
  );
};

export default function MemberRatingForm({ trip, member, theme, cardClass, mutedText }) {
  const navigate = useNavigate();
  const [behaviorScore, setBehaviorScore] = useState(0);
  const [teamworkScore, setTeamworkScore] = useState(0);
  const [reliabilityScore, setReliabilityScore] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!trip || !member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (behaviorScore === 0 || teamworkScore === 0 || reliabilityScore === 0) {
      setError('Please provide a rating for all 3 categories.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await fetchJson('/ratings', {
        method: 'POST',
        body: JSON.stringify({
          trip_id: trip.id,
          rated_user_id: member.user_id,
          behavior_score: behaviorScore,
          teamwork_score: teamworkScore,
          reliability_score: reliabilityScore,
          comment_text: commentText
        })
      });
      navigate(`/post-trip-ratings/${trip.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit rating. You might have already rated this user for this trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/post-trip-ratings/${trip.id}`)}
        className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
      >
        ← Back to Members
      </button>

      <div className={cardClass}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Rate {member.name}</h2>
          <p className={`mt-2 ${mutedText}`}>Trip: {trip.title} • {trip.destination}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-500 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-black/20' : 'bg-slate-50'}`}>
            <div className="space-y-6">
              <StarRating label="🎭 Behavior & Attitude" score={behaviorScore} setScore={setBehaviorScore} mutedText={mutedText} />
              <StarRating label="🤝 Teamwork & Cooperation" score={teamworkScore} setScore={setTeamworkScore} mutedText={mutedText} />
              <StarRating label="⚡ Reliability & Punctuality" score={reliabilityScore} setScore={setReliabilityScore} mutedText={mutedText} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Review Comment (Optional)</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Share your experience traveling with ${member.name.split(' ')[0]}...`}
              className={`w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-amber-400/50 transition ${theme === 'dark'
                  ? 'border-white/10 bg-black/20 text-white placeholder-slate-500'
                  : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                }`}
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Submitting Rating...' : '✨ Submit Final Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}
