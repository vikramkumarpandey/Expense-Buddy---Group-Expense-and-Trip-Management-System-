import { useState } from 'react';
import TripForm from '../components/TripForm.jsx';

export default function TripsList({ trips, theme, onSelectTrip, onAddTrip, cardClass, mutedText }) {
  const groupedTrips = {
    'Open to Join': trips.filter((t) => t.status === 'Open to Join'),
    'Planning': trips.filter((t) => t.status === 'Planning'),
    'Completed': trips.filter((t) => t.status === 'Completed')
  };

  return (
    <div className="space-y-6">
      {/* Create Trip Form at Top */}
      <TripForm theme={theme} onSubmit={onAddTrip} />

      {/* Trips grouped by status */}
      {trips.length === 0 ? (
        <div className={cardClass}>
          <p className={`text-center py-8 ${mutedText}`}>No trips yet. Create one to get started.</p>
        </div>
      ) : (
        <>
          {/* Open to Join Section */}
          {groupedTrips['Open to Join'].length > 0 && (
            <div className={cardClass}>
              <h3 className="mb-4 text-xl font-semibold text-cyan-300">🔓 Open to Join ({groupedTrips['Open to Join'].length})</h3>
              <div className="space-y-3">
                {groupedTrips['Open to Join'].map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className={`rounded-2xl p-5 shadow-md hover:scale-[1.01] transition-all cursor-pointer ${theme === 'dark' ? 'border border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/15' : 'border border-cyan-200 bg-cyan-50 hover:bg-cyan-100'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{trip.title}</h4>
                        <p className={`mt-1 text-sm ${mutedText}`}>{trip.destination} • {trip.start_date?.slice(0, 10)} to {trip.end_date?.slice(0, 10)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{trip.budget}</p>
                        <p className="text-xs text-cyan-300 font-medium">{trip.members} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planning Section */}
          {groupedTrips['Planning'].length > 0 && (
            <div className={cardClass}>
              <h3 className="mb-4 text-xl font-semibold text-amber-300">📋 Planning ({groupedTrips['Planning'].length})</h3>
              <div className="space-y-3">
                {groupedTrips['Planning'].map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className={`rounded-2xl p-5 shadow-md hover:scale-[1.01] transition-all cursor-pointer ${theme === 'dark' ? 'border border-amber-400/20 bg-amber-400/5 hover:bg-amber-400/15' : 'border border-amber-200 bg-amber-50 hover:bg-amber-100'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{trip.title}</h4>
                        <p className={`mt-1 text-sm ${mutedText}`}>{trip.destination} • {trip.start_date?.slice(0, 10)} to {trip.end_date?.slice(0, 10)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{trip.budget}</p>
                        <p className="text-xs text-amber-300 font-medium">{trip.members} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {groupedTrips['Completed'].length > 0 && (
            <div className={cardClass}>
              <h3 className="mb-4 text-xl font-semibold text-green-300">✅ Completed ({groupedTrips['Completed'].length})</h3>
              <div className="space-y-3">
                {groupedTrips['Completed'].map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className={`rounded-2xl p-5 shadow-md hover:scale-[1.01] transition-all cursor-pointer ${theme === 'dark' ? 'border border-green-400/20 bg-green-400/5 hover:bg-green-400/15' : 'border border-green-200 bg-green-50 hover:bg-green-100'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{trip.title}</h4>
                        <p className={`mt-1 text-sm ${mutedText}`}>{trip.destination} • {trip.start_date?.slice(0, 10)} to {trip.end_date?.slice(0, 10)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{trip.budget}</p>
                        <p className="text-xs text-green-300 font-medium">{trip.members} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
