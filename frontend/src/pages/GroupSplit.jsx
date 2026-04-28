import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SettlementEditForm from '../components/SettlementEditForm.jsx';
import { fetchJson } from '../utils/api.js';

export default function GroupSplit({ trips, settlementData, manualSettlements, tripMembers, refreshTripData, theme, cardClass, mutedText, tripId }) {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [settledItems, setSettledItems] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [fetchedSettlements, setFetchedSettlements] = useState([]);
  const [memberTrips, setMemberTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJson('/trips?memberOnly=1')
      .then((data) => {
        setMemberTrips(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setMemberTrips([]);
      });
  }, []);

  useEffect(() => {
    if (tripId && memberTrips) {
      const trip = memberTrips.find(t => String(t.id) === String(tripId));
      setSelectedTripId(trip ? trip.id : null);
    } else {
      setSelectedTripId(null);
    }
  }, [tripId, memberTrips]);

  useEffect(() => {
    if (!tripId) return;
    fetchJson(`/trips/${tripId}/settlements`)
      .then(data => {
        setFetchedSettlements(data);
      })
      .catch(err => console.error(err));
  }, [tripId]);

  const selectedTrip = memberTrips.find((t) => t.id === selectedTripId);
  const autoSettlements = selectedTripId ? (fetchedSettlements.length ? fetchedSettlements : settlementData[selectedTripId] || []) : [];
  const currManualSettlements = selectedTripId ? (manualSettlements && manualSettlements[selectedTripId]) || [] : [];

  const formattedAuto = autoSettlements.map((s, idx) => ({
    id: `auto-${idx}`,
    from: s.from,
    to: s.to,
    amount: s.amount,
    status: settledItems.includes(`${selectedTripId}-${idx}`) ? 'paid' : 'pending',
    isAuto: true,
    originalIndex: idx
  }));

  const formattedManual = currManualSettlements.map(s => ({
    id: s.id,
    from: s.from_user_name,
    to: s.to_user_name,
    amount: s.amount,
    status: s.status,
    isAuto: false
  }));

  const finalSettlements = [...formattedAuto, ...formattedManual];

  const handleSettleClick = async (settlement) => {
    if (settlement.isAuto) {
      const key = `${selectedTripId}-${settlement.originalIndex}`;
      if (!settledItems.includes(key)) setSettledItems([...settledItems, key]);
    } else {
      try {
        await fetchJson(`/settlements/${settlement.id}/mark-paid`, { method: 'PUT' });
        if (refreshTripData) refreshTripData(selectedTripId);
      } catch (e) { console.error("Failed to mark paid", e); }
    }
  };

  const handleUnsettleClick = (settlement) => {
    if (settlement.isAuto) {
      const key = `${selectedTripId}-${settlement.originalIndex}`;
      setSettledItems(settledItems.filter((k) => k !== key));
    } else {
      alert("Manual settlements cannot be un-done. Use Add/Edit Settlements instead.");
    }
  };

  const handleBulkSubmit = async (rows) => {
    try {
      await fetchJson('/settlements/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ trip_id: selectedTripId, settlements: rows })
      });
      setShowEditForm(false);
      if (refreshTripData) refreshTripData(selectedTripId);
    } catch (e) {
      alert("Failed to save settlements.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button if a trip is selected */}
      {selectedTrip && (
        <button
          onClick={() => navigate('/group-settlement')}
          className="rounded-xl border border-slate-300/30 bg-slate-300/10 px-4 py-2 text-sm font-medium transition hover:bg-slate-300/20"
        >
          ← Back to All Settlements
        </button>
      )}

      {!selectedTrip && (
        <div className="space-y-6">
          <h2 className="mb-4 text-3xl font-bold">🤝 Group Settlements</h2>
          {memberTrips.length > 0 ? (
            <div className="flex flex-col gap-4">
              {memberTrips.map((trip) => {
                const pending = (settlementData[trip.id] || []).length;
                return (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/group-settlement/${trip.id}`)}
                    className={`cursor-pointer ${cardClass}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg">{trip.title}</h4>
                        <p className={`text-sm ${mutedText} mt-1`}>
                          Settlements Pending: {pending}
                        </p>
                      </div>
                      <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                        View Settlements
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={cardClass}>
              <p className={`text-center py-8 ${mutedText}`}>No settlements available</p>
            </div>
          )}
        </div>
      )}

      {selectedTrip && (
        <>
          {showEditForm ? (
            <SettlementEditForm
              theme={theme}
              manualSettlements={currManualSettlements}
              members={tripMembers ? tripMembers[selectedTripId] || [] : []}
              onSubmit={handleBulkSubmit}
              onCancel={() => setShowEditForm(false)}
            />
          ) : (
            <>
              {/* Summary */}
              <div className={cardClass}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-xl font-semibold">📊 Summary</h3>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-cyan-600 hover:scale-[1.02]"
                  >
                    ➕ Add / Edit Settlements
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
                    <p className="text-sm text-slate-400">Total Transactions</p>
                    <h3 className="mt-2 text-2xl font-bold">{finalSettlements.length}</h3>
                  </div>
                  <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
                    <p className="text-sm text-slate-400">Settled (Paid)</p>
                    <h3 className="mt-2 text-2xl font-bold text-green-400">
                      {finalSettlements.filter(s => s.status === 'paid').length}
                    </h3>
                  </div>
                  <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
                    <p className="text-sm text-slate-400">Pending</p>
                    <h3 className="mt-2 text-2xl font-bold text-rose-400">
                      {finalSettlements.filter(s => s.status === 'pending').length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Settlements List */}
              <div className={cardClass}>
                <h3 className="mb-4 text-xl font-semibold">💳 Final Settlements</h3>
                {finalSettlements.length > 0 ? (
                  <div className="space-y-3">
                    {finalSettlements.map((settlement) => {
                      const isSettled = settlement.status === 'paid';

                      return (
                        <div
                          key={settlement.id}
                          className={`rounded-2xl p-4 transition ${isSettled
                              ? theme === 'dark'
                                ? 'bg-green-400/10 border border-green-400/30'
                                : 'bg-green-50 border border-green-200'
                              : theme === 'dark'
                                ? 'bg-white/5 border border-white/10'
                                : 'bg-white/70 border border-slate-200'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-lg flex items-center gap-2">
                                <span>{settlement.from}</span>
                                <span className={theme === 'dark' ? 'opacity-50' : 'text-slate-400'}>➡️</span>
                                <span>{settlement.to}</span>
                                {!settlement.isAuto && (
                                  <span className="ml-2 rounded-md bg-amber-400/20 px-2 py-0.5 text-xs text-amber-500 font-bold border border-amber-400/30">Manual</span>
                                )}
                              </p>
                              <p className={`text-base font-mono font-bold mt-1 ${mutedText}`}>
                                Amount: ₹{Number(settlement.amount || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              {!isSettled ? (
                                <button
                                  onClick={() => handleSettleClick(settlement)}
                                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 hover:scale-105"
                                >
                                  ✅ Mark Paid
                                </button>
                              ) : (
                                <>
                                  <div className="flex flex-col items-center">
                                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-semibold text-emerald-500">Paid</span>
                                  </div>
                                  {settlement.isAuto && (
                                    <button
                                      onClick={() => handleUnsettleClick(settlement)}
                                      className="ml-2 rounded-lg bg-slate-500 px-3 py-1 text-sm font-bold text-white transition hover:bg-slate-600"
                                    >
                                      Undo
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <p className={`font-semibold ${mutedText}`}>No settlements needed for this trip</p>
                    <p className="text-sm opacity-60 mt-1">Click "Add / Edit Settlements" to define payments manually.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
