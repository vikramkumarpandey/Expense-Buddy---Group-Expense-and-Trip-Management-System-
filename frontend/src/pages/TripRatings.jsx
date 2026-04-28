import { useNavigate } from 'react-router-dom';

export default function TripRatings({ trips, theme, cardClass, mutedText }) {
  const navigate = useNavigate();
  const completedTrips = (trips || []).filter(t => t.status === 'Completed');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">⭐ Trip Ratings</h2>
        <p className={`mt-2 text-sm ${mutedText}`}>Select a completed trip to view its aggregated member ratings.</p>
      </div>

      {completedTrips.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completedTrips.map(trip => (
            <div 
              key={trip.id} 
              onClick={() => navigate(`/trip-ratings/${trip.id}`)} 
              className={`cursor-pointer ${cardClass} border-transparent hover:border-emerald-400/50 transition-colors`}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xl font-bold">{trip.title}</h3>
                  <p className={`mt-1 text-sm ${mutedText}`}>📍 {trip.destination}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">✅ Completed</span>
                  <button className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500/30 dark:text-emerald-300">
                    View Ratings →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cardClass}>
          <p className={`text-center py-10 ${mutedText}`}>No completed trips available yet.</p>
        </div>
      )}
    </div>
  );
}
