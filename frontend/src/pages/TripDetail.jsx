export default function TripDetail({ trip, members, theme, currentUser, onBack, onViewAnalysis, onViewSettlements, onJoin, onUpdateStatus, onDeleteTrip, onRemoveMember, hasJoined, cardClass, mutedText }) {
  if (!trip) return null;

  const userMemberInfo = members?.find((m) => String(m.user_id) === String(currentUser?.id));
  const isCoordinator = userMemberInfo?.role === 'Coordinator';
  const canManageMembers = isCoordinator || currentUser?.role === 'admin';
  const isOwner = String(trip.created_by) === String(currentUser?.id) || currentUser?.role === 'admin';

  const handleDeleteTrip = async () => {
    if (!window.confirm('Delete this trip? This will remove its members, expenses, ratings, and settlements.')) {
      return;
    }

    try {
      await onDeleteTrip();
      window.alert('Trip deleted successfully');
    } catch (error) {
      window.alert(error.message || 'Failed to delete trip');
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this trip?`)) {
      return;
    }

    try {
      await onRemoveMember(member.id);
      window.alert('Member removed successfully');
    } catch (error) {
      window.alert(error.message || 'Failed to remove member');
    }
  };

  const compatibilityScore = trip.compatibilityScore;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
      >
        ← Back to Trips
      </button>

      {/* Trip Header */}
      <div className={cardClass}>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold">{trip.title}</h2>
              <span className="rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-300">
                {trip.status}
              </span>
            </div>
            <p className={`mt-2 text-lg ${mutedText}`}>{trip.destination}</p>
            {compatibilityScore !== null && compatibilityScore !== undefined && (
              <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${compatibilityScore >= 80 ? 'bg-emerald-400/20 text-emerald-300' : compatibilityScore >= 60 ? 'bg-amber-400/20 text-amber-300' : 'bg-rose-400/20 text-rose-300'}`}>
                Compatibility: {compatibilityScore}%
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {isCoordinator && trip.status === 'Planning' && (
              <button
                onClick={() => onUpdateStatus('Open to Join')}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Move to Open to Join
              </button>
            )}
            {isCoordinator && trip.status === 'Open to Join' && (
              <button
                onClick={() => onUpdateStatus('Completed')}
                className="rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Complete
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteTrip}
                className="rounded-xl border border-rose-400/30 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Trip Info Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Budget</p>
            <h3 className="mt-2 text-2xl font-bold">₹{trip.budget}</h3>
          </div>
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Duration</p>
            <h3 className="mt-2 text-lg font-semibold">
              {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)}
            </h3>
          </div>
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Members</p>
            <h3 className="mt-2 text-2xl font-bold">{members?.length || 0}</h3>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Age Range</p>
            <h3 className="mt-2 text-lg font-semibold">{trip.min_age ?? 'Any'} - {trip.max_age ?? 'Any'}</h3>
          </div>
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Required College</p>
            <h3 className="mt-2 text-lg font-semibold">{trip.required_college || 'Any'}</h3>
          </div>
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
            <p className="text-sm text-slate-400">Required Travel Style</p>
            <h3 className="mt-2 text-lg font-semibold">{trip.required_travel_style || 'Any'}</h3>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className={cardClass}>
        <h3 className="mb-4 text-xl font-semibold">👥 Members & Roles</h3>
        <div className="space-y-3">
          {members && members.length > 0 ? (
            members.map((member) => (
              <div key={member.user_id} className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className={`text-sm ${mutedText}`}>{member.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      member.role === 'Coordinator'
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : 'bg-blue-400/20 text-blue-300'
                    }`}>
                      {member.role}
                    </span>
                    {canManageMembers && member.role !== 'Coordinator' && String(member.user_id) !== String(currentUser?.id) && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="rounded-full border border-rose-400/30 px-2 py-1 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-4 ${mutedText}`}>No members yet</p>
          )}
        </div>
      </div>

      {/* Join Button */}
      {(trip.status === 'Open to Join' || trip.status === 'Planning') && !hasJoined && (
        <button
          onClick={onJoin}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          {trip.status === 'Planning' ? '🙋 Interested' : '✋ Join This Trip'}
        </button>
      )}
      {hasJoined && (
        <div className="rounded-2xl bg-green-400/20 px-6 py-4 text-center">
          <p className="text-lg font-semibold text-green-300">✅ You are a member of this trip</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={onViewAnalysis}
          className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-4 text-center font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
        >
          📊 View Expenses & Analysis
        </button>
        <button
          onClick={onViewSettlements}
          className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-6 py-4 text-center font-semibold text-blue-300 transition hover:bg-blue-400/20"
        >
          🤝 View Settlements
        </button>
      </div>
    </div>
  );
}
