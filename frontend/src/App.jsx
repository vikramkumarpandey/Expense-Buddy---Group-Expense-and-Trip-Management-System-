import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminTrips from './pages/AdminTrips.jsx';
import AdminMembers from './pages/AdminMembers.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatCard from './components/StatCard.jsx';
import TransactionForm from './components/ExpenseForm.jsx';
import PersonalAnalysis from './components/PersonalAnalysis.jsx';
import BudgetEditForm from './components/BudgetEditForm.jsx';
import RatingCard from './components/RatingCard.jsx';
import TripsList from './pages/TripsList.jsx';
import TripDetail from './pages/TripDetail.jsx';
import TripAnalysis from './pages/TripAnalysis.jsx';
import GroupSplit from './pages/GroupSplit.jsx';
import TripRatings from './pages/TripRatings.jsx';
import TripRatingsDetail from './pages/TripRatingsDetail.jsx';
import GlobalRatings from './pages/GlobalRatings.jsx';
import TripsToRate from './pages/TripsToRate.jsx';
import TripMembersRating from './pages/TripMembersRating.jsx';
import MemberRatingForm from './pages/MemberRatingForm.jsx';
import { fetchJson } from './utils/api.js';

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const TripDetailRoute = ({ trips, tripMembers, theme, navigate, prefetchTripDetails, handleJoinTrip, handleUpdateTripStatus, handleDeleteTrip, handleRemoveTripMember, joinedTrips, currentUser, cardClass, mutedText }) => {
  const { id } = useParams();
  const trip = trips.find((t) => String(t.id) === id);

  useEffect(() => {
    if (trip) prefetchTripDetails(trip.id);
  }, [trip?.id]);

  if (!trip) return <p className="text-center mt-10">Trip not found.</p>;
  return (
    <TripDetail
      trip={trip}
      members={tripMembers[trip.id] || []}
      theme={theme}
      currentUser={currentUser}
      onBack={() => navigate('/trips')}
      onViewAnalysis={() => navigate(`/trip-analysis/${trip.id}`)}
      onViewSettlements={() => navigate(`/group-settlement/${trip.id}`)}
      onJoin={() => handleJoinTrip(trip.id)}
      onUpdateStatus={(status) => handleUpdateTripStatus(trip.id, status)}
      onDeleteTrip={() => handleDeleteTrip(trip.id)}
      onRemoveMember={(memberId) => handleRemoveTripMember(trip.id, memberId)}
      hasJoined={joinedTrips.includes(trip.id)}
      cardClass={cardClass}
      mutedText={mutedText}
    />
  );
};



const TripAnalysisRoute = ({ trips, tripExpenses, tripMembers, theme, navigate, fetchTripExpenses, refreshTripData, cardClass, mutedText }) => {
  const { id } = useParams();
  if (!id) return <TripAnalysis trips={trips} listMode={true} theme={theme} cardClass={cardClass} mutedText={mutedText} onSelect={(t) => navigate(`/trip-analysis/${t}`)} />;

  const trip = trips.find(t => String(t.id) === id);
  useEffect(() => {
    if (trip && !tripExpenses[trip.id]) fetchTripExpenses(trip.id);
  }, [trip?.id]);

  if (!trip) return <p className="text-center mt-10">Trip not found.</p>;
  return <TripAnalysis trip={trip} expenses={tripExpenses[trip.id] || []} members={tripMembers[trip.id] || []} theme={theme} onBack={() => navigate('/trip-analysis')} onRefresh={() => refreshTripData(trip.id)} cardClass={cardClass} mutedText={mutedText} listMode={false} />;
};

const GroupSplitRoute = ({ trips, settlementData, manualSettlements, tripMembers, refreshTripData, theme, cardClass, mutedText, tripId }) => {
  const { id } = useParams();
  return <GroupSplit trips={trips} settlementData={settlementData} manualSettlements={manualSettlements} tripMembers={tripMembers} refreshTripData={refreshTripData} theme={theme} cardClass={cardClass} mutedText={mutedText} tripId={id || tripId} />;
};

const TripsToRateRoute = ({ trips, theme, cardClass, mutedText }) => {
  return <TripsToRate trips={trips} theme={theme} cardClass={cardClass} mutedText={mutedText} />;
};

const TripRatingsDetailRoute = ({ trips, theme, cardClass, mutedText }) => {
  return <TripRatingsDetail trips={trips} theme={theme} cardClass={cardClass} mutedText={mutedText} />;
};

const TripMembersRatingRoute = ({ trips, tripMembers, prefetchTripDetails, theme, cardClass, mutedText }) => {
  const { tripId } = useParams();
  const trip = trips.find((t) => String(t.id) === tripId);

  useEffect(() => {
    if (trip) prefetchTripDetails(trip.id);
  }, [trip?.id]);

  if (!trip) return <p className="text-center mt-10">Trip not found.</p>;

  return (
    <TripMembersRating
      trip={trip}
      members={tripMembers[trip.id] || []}
      theme={theme}
      cardClass={cardClass}
      mutedText={mutedText}
    />
  );
};

const MemberRatingFormRoute = ({ trips, tripMembers, prefetchTripDetails, theme, cardClass, mutedText }) => {
  const { tripId, userId } = useParams();
  const trip = trips.find((t) => String(t.id) === tripId);

  useEffect(() => {
    if (trip) prefetchTripDetails(trip.id);
  }, [trip?.id]);

  if (!trip) return <p className="text-center mt-10">Trip not found.</p>;

  const members = tripMembers[trip.id] || [];
  const member = members.find((m) => String(m.user_id) === userId);

  if (members.length > 0 && !member) return <p className="text-center mt-10">Member not found in this trip.</p>;

  return (
    <MemberRatingForm
      trip={trip}
      member={member}
      theme={theme}
      cardClass={cardClass}
      mutedText={mutedText}
    />
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Theme
  const [theme, setTheme] = useState('dark');
  const [showEditBudgetsForm, setShowEditBudgetsForm] = useState(false);
  const [error, setError] = useState('');

  // All state
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [tripRankings, setTripRankings] = useState([]);
  const [tripExpenses, setTripExpenses] = useState({});
  const [tripMembers, setTripMembers] = useState({});
  const [settlementData, setSettlementData] = useState({});
  const [manualSettlements, setManualSettlements] = useState({});
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [settledItems, setSettledItems] = useState([]);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setDashboard(null);
    setExpenses([]);
    setBudgets([]);
    setTrips([]);
    navigate('/login');
  };

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!authLoading && !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, location.pathname, navigate]);

  // Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const pageClass = useMemo(() => (
    theme === 'dark'
      ? 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#08111f,#0f172a,#111827)] text-white'
      : 'min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#f8fbff,#eef4ff,#f7faff)] text-slate-900'
  ), [theme]);

  const cardClass = theme === 'dark'
    ? 'rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-2xl shadow-md hover:scale-[1.01] transition-all'
    : 'rounded-2xl border border-slate-200/70 bg-white/65 p-5 backdrop-blur-2xl shadow-md hover:scale-[1.01] transition-all';

  const mutedText = theme === 'dark' ? 'text-slate-300' : 'text-slate-500';

  // Load all data
  const loadAll = async () => {
    try {
      setError('');
      const [dashboardData, expenseData, budgetData, tripData, ratingData, rankingData, analysisDataResp] = await Promise.all([
        fetchJson('/dashboard'),
        fetchJson('/expenses'),
        fetchJson('/budgets'),
        fetchJson('/trips'),
        fetchJson('/ratings'),
        fetchJson('/ratings/trips/rankings'),
        fetchJson('/expenses/analysis')
      ]);

      setDashboard(dashboardData);
      setExpenses(expenseData);
      setBudgets(budgetData);
      setTrips(tripData);
      setRatings(ratingData);
      setTripRankings(rankingData);
      setAnalysisData(analysisDataResp);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAll();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch trip data
  const fetchTripExpenses = async (tripId) => {
    try {
      const data = await fetchJson(`/trips/${tripId}/expenses`);
      setTripExpenses((prev) => ({ ...prev, [tripId]: data }));
    } catch (err) {
      console.error('Failed to fetch trip expenses:', err);
      setError('Failed to fetch expenses: ' + err.message);
    }
  };

  const fetchTripMembers = async (tripId) => {
    try {
      const data = await fetchJson(`/trips/${tripId}/members`);
      setTripMembers((prev) => ({ ...prev, [tripId]: data }));
    } catch (err) {
      console.error('Failed to fetch trip members:', err);
      setTripMembers((prev) => ({ ...prev, [tripId]: [] }));
    }
  };

  const fetchSettlements = async (tripId) => {
    try {
      const data = await fetchJson(`/trips/${tripId}/settlements`);
      setSettlementData((prev) => ({ ...prev, [tripId]: data }));
    } catch (err) {
      console.error('Failed to fetch settlements:', err);
    }
  };

  const fetchManualSettlements = async (tripId) => {
    try {
      const data = await fetchJson(`/settlements/${tripId}`);
      setManualSettlements((prev) => ({ ...prev, [tripId]: data }));
    } catch (err) {
      console.error('Failed to fetch manual settlements:', err);
    }
  };

  // Load settlements for all trips on change
  useEffect(() => {
    if (trips && trips.length > 0) {
      trips.forEach((trip) => {
        fetchSettlements(trip.id);
        fetchManualSettlements(trip.id);
      });
    }
  }, [trips]);

  // Handle trip selection
  const handleSelectTrip = (trip) => {
    navigate(`/trips/${trip.id}`);
  };

  // Helper for Route wrapper to fetch trip specifics
  const prefetchTripDetails = (tripId) => {
    fetchTripExpenses(tripId);
    fetchTripMembers(tripId);
    fetchSettlements(tripId);
    fetchManualSettlements(tripId);
  };

  // Refresh trip data (used after CRUD operations)
  const refreshTripData = async (tripId) => {
    if (tripId) {
      await fetchTripExpenses(tripId);
      await fetchSettlements(tripId);
      await fetchManualSettlements(tripId);
    }
  };

  // Add transaction
  const handleAddTransaction = async (payload) => {
    try {
      await fetchJson('/expenses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await loadAll();
      navigate('/transactions');
    } catch (err) {
      setError(err.message);
    }
  };

  // Update budgets
  const handleBulkUpdateBudgets = async (budgetsData) => {
    try {
      await fetchJson('/budgets/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ budgets: budgetsData })
      });
      await loadAll();
      setShowEditBudgetsForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Add trip
  const handleAddTrip = async (payload) => {
    try {
      await fetchJson('/trips', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await loadAll();
      navigate('/trips');
      window.alert('Trip created successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Join trip
  const handleJoinTrip = async (tripId) => {
    try {
      const updatedMembers = await fetchJson(`/trips/${tripId}/join`, {
        method: 'POST'
      });

      // Update the tripMembers state with the updated members list
      setTripMembers((prev) => ({
        ...prev,
        [tripId]: updatedMembers
      }));

      // Mark trip as joined
      if (!joinedTrips.includes(tripId)) {
        setJoinedTrips((prev) => [...prev, tripId]);
      }

      console.log(`✓ Successfully joined trip ${tripId}`);
      window.alert('Successfully joined trip');
    } catch (err) {
      console.error('Failed to join trip:', err);
      setError(err.message || 'Failed to join trip');
    }
  };

  // Update trip status
  const handleUpdateTripStatus = async (tripId, status) => {
    try {
      const updatedTrip = await fetchJson(`/trips/${tripId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      // Update the trip in state
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === tripId ? { ...t, status: updatedTrip.status || status } : t))
      );

      // Update local dashboard if needed (if it holds trips)
      if (dashboard?.trips) {
        setDashboard((prev) => ({
          ...prev,
          trips: prev.trips.map((t) => (t.id === tripId ? { ...t, status: updatedTrip.status || status } : t))
        }));
      }

      console.log(`✓ Successfully updated trip ${tripId} status to ${status}`);
    } catch (err) {
      console.error('Failed to update trip status:', err);
      setError(err.message || 'Failed to update trip status');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await fetchJson(`/trips/${tripId}`, { method: 'DELETE' });
      setTripMembers((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
      setTripExpenses((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
      setSettlementData((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
      setManualSettlements((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
      await loadAll();
      navigate('/trips');
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setError(err.message || 'Failed to delete trip');
      throw err;
    }
  };

  const handleRemoveTripMember = async (tripId, memberId) => {
    try {
      const updatedMembers = await fetchJson(`/trips/${tripId}/members/${memberId}`, { method: 'DELETE' });
      setTripMembers((prev) => ({
        ...prev,
        [tripId]: updatedMembers
      }));
    } catch (err) {
      console.error('Failed to remove trip member:', err);
      setError(err.message || 'Failed to remove member');
      throw err;
    }
  };

  // Render Dashboard
  const renderDashboard = () => (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Finance & Travel Dashboard</h2>
          <p className={`mt-2 max-w-2xl text-sm ${mutedText}`}>
            Personal Finance (left menu) and Travel Buddy (trips) are clearly separated with distinct UX.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/add-transaction')} className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-300 backdrop-blur-xl transition hover:scale-[1.02]">
            + Add Transaction
          </button>
          <button onClick={() => navigate('/trips')} className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]">
            ✈️ Browse Trips
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard theme={theme} title="Total Income" value={`₹${dashboard?.totalIncome ?? 0}`} subtext="All your income" accent="emerald" />
        <StatCard theme={theme} title="Total Expense" value={`₹${dashboard?.totalExpense ?? 0}`} subtext="All your expenses" accent="rose" />
        <StatCard theme={theme} title="Current Balance" value={`₹${dashboard?.balance ?? 0}`} subtext="Income minus expense" accent="blue" />
        <StatCard theme={theme} title="Active Trips" value={dashboard?.activeTrips ?? 0} subtext="Planning, open or confirmed" accent="cyan" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">💰 Personal Finance Module</p>
                <h3 className="text-xl font-semibold">Financial Summary</h3>
              </div>
            </div>
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-300">Income</p>
                <h4 className="mt-2 text-3xl font-bold">₹{dashboard?.totalIncome ?? 0}</h4>
              </div>
              <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4">
                <p className="text-sm text-rose-300">Expense</p>
                <h4 className="mt-2 text-3xl font-bold">₹{dashboard?.totalExpense ?? 0}</h4>
              </div>
              <div className="rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4">
                <p className="text-sm text-blue-300">Balance</p>
                <h4 className="mt-2 text-3xl font-bold">₹{dashboard?.balance ?? 0}</h4>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-300">📋 Recent Transactions</p>
                  <h3 className="text-xl font-semibold">Latest activity</h3>
                </div>
              </div>
              <div className="space-y-3">
                {(dashboard?.recentTransactions || []).length === 0 ? (
                  <p className={`text-center py-4 ${mutedText}`}>No transactions yet</p>
                ) : (
                  (dashboard?.recentTransactions || []).slice(0, 5).map((txn) => (
                    <div key={txn.id} className={`rounded-2xl p-4 transition ${theme === 'dark' ? 'border border-white/10 bg-white/5 hover:bg-white/10' : 'border border-slate-200 bg-white/70 hover:bg-white'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{txn.title}</h4>
                          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {txn.category} • {txn.payment_method} • {txn.expense_date?.slice(0, 10)}
                          </p>
                        </div>
                        <span className={`rounded-xl px-3 py-1 text-sm font-semibold ${txn.transaction_type === 'income' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                          {txn.transaction_type === 'income' ? '+₹' : '−₹'}{txn.amount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300">📊 Budget Analysis</p>
                  <h3 className="text-xl font-semibold">Category performance</h3>
                </div>
              </div>
              <div className="space-y-3">
                {(budgets || []).slice(0, 5).map((item) => (
                  <div key={item.category} className={`rounded-2xl p-4 ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white/70'}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-sm">₹{item.spent} / ₹{item.monthly_limit}</span>
                    </div>
                    <div className={`h-3 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${Math.min(item.usedPercent, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <div className="mb-4">
              <p className="text-sm text-cyan-200">✈️ Travel Buddy Module</p>
              <h3 className="text-xl font-semibold">Upcoming group plans</h3>
            </div>
            <div className="space-y-4">
              {(trips || []).slice(0, 5).map((trip) => (
                <div key={trip.id} onClick={() => handleSelectTrip(trip)} className={`rounded-2xl p-4 transition cursor-pointer hover:-translate-y-0.5 ${theme === 'dark' ? 'border border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/10' : 'border border-cyan-200/50 bg-cyan-50/50 hover:bg-cyan-100/50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium">{trip.title}</h4>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{trip.members} members • Budget ₹{trip.budget}</p>
                    </div>
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">{trip.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">🤝 Group Settlement</p>
                <h3 className="text-xl font-semibold">Settlement status</h3>
              </div>
            </div>
            <div className={`rounded-2xl p-4 text-center ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-slate-200'}`}>
              <p className={`text-sm ${mutedText}`}>View detailed settlements in Trips module or Group Split page</p>
              <button onClick={() => navigate('/group-split')} className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                Go to Group Split →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  // Render Transaction History
  const renderTransactionHistory = () => (
    <div className={cardClass}>
      <div className="mb-6">
        <p className="text-sm text-emerald-300">💰 Personal Finance Module</p>
        <h2 className="text-3xl font-semibold">Transaction History</h2>
      </div>
      {expenses.length === 0 ? (
        <p className={`text-center py-8 ${mutedText}`}>No transactions yet. Add one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={theme === 'dark' ? 'border-b border-white/10 text-slate-300' : 'border-b border-slate-200 text-slate-600'}>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {(expenses || []).map((expense) => (
                <tr key={expense.id} className={theme === 'dark' ? 'border-t border-white/10 hover:bg-white/5' : 'border-t border-slate-200 hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-medium">{expense.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${expense.transaction_type === 'income' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                      {expense.transaction_type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{expense.category}</td>
                  <td className={`px-4 py-3 font-semibold ${expense.transaction_type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {expense.transaction_type === 'income' ? '+' : '−'}₹{Number(expense.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{expense.expense_date?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render Budgets
  const renderBudgets = () => (
    <div className="space-y-6">
      {!showEditBudgetsForm && (
        <div className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-300">💰 Personal Finance Module</p>
              <h2 className="text-3xl font-semibold">Monthly Budgets</h2>
            </div>
            <button
              onClick={() => setShowEditBudgetsForm(true)}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-300 backdrop-blur-xl transition hover:scale-[1.02]"
            >
              ➕ Add / Edit Budget
            </button>
          </div>

          {budgets.length === 0 ? (
            <p className={`text-center py-8 ${mutedText}`}>No budgets set yet. Click "Edit Budgets" to create one! 📊</p>
          ) : (
            <div className="space-y-3">
              {(budgets || []).map((budget) => (
                <div
                  key={budget.id}
                  className={`rounded-2xl border p-4 ${theme === 'dark'
                    ? 'border-emerald-300/20 bg-emerald-400/5 hover:bg-emerald-400/10'
                    : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    } transition`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-lg">{budget.category}</h4>
                    <span className="text-sm font-medium">₹{Number(budget.spent).toFixed(2)} / ₹{Number(budget.monthly_limit).toFixed(2)}</span>
                  </div>
                  <div className={`h-2 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full transition ${budget.usedPercent > 80
                        ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                        : budget.usedPercent > 50
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-400 to-cyan-500'
                        }`}
                      style={{ width: `${Math.min(budget.usedPercent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEditBudgetsForm && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <BudgetEditForm
            theme={theme}
            budgets={budgets}
            onSubmit={handleBulkUpdateBudgets}
            onCancel={() => setShowEditBudgetsForm(false)}
          />
          <div>
            <div className={cardClass}>
              <p className="text-sm font-semibold text-emerald-300">📝 Tips</p>
              <ul className={`mt-3 space-y-2 text-sm ${mutedText}`}>
                <li>• Edit existing budgets or add new ones</li>
                <li>• Select from predefined categories</li>
                <li>• Use "Other" for custom categories</li>
                <li>• No duplicate categories allowed</li>
                <li>• Click "Save All" when done</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Personal Analysis
  const renderPersonalAnalysis = () => (
    <div>
      <div className="mb-6">
        <p className="text-sm text-emerald-300">💰 Personal Finance Module</p>
        <h2 className="text-3xl font-semibold">Personal Analysis</h2>
        <p className={`mt-2 text-sm ${mutedText}`}>See your income, expenses, and savings breakdown with visual charts</p>
      </div>
      <PersonalAnalysis theme={theme} analysisData={analysisData} />
    </div>
  );

  // Render Add Transaction
  const renderAddTransaction = () => (
    <TransactionForm theme={theme} onSubmit={handleAddTransaction} />
  );

  // Main render
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-600">Initializing Expense Buddy</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden`}>
      {/* Sidebar - Fixed positioning */}
      <Sidebar
        theme={theme}
        setTheme={setTheme}
        personalOpen={personalOpen}
        setPersonalOpen={setPersonalOpen}
        tripsOpen={tripsOpen}
        setTripsOpen={setTripsOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Container */}
      <div className={`${pageClass} flex-1 ml-60 overflow-y-auto`}>
        <div className="p-6 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-100 dark:bg-rose-900/30 px-4 py-3">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">❌ {error}</p>
            </div>
          )}

          <Routes>
            <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard theme={theme} cardClass={cardClass} mutedText={mutedText} /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers theme={theme} cardClass={cardClass} mutedText={mutedText} /> : <Navigate to="/" />} />
            <Route path="/admin/trips" element={user?.role === 'admin' ? <AdminTrips theme={theme} cardClass={cardClass} mutedText={mutedText} /> : <Navigate to="/" />} />
            <Route path="/admin/members" element={user?.role === 'admin' ? <AdminMembers theme={theme} cardClass={cardClass} mutedText={mutedText} /> : <Navigate to="/" />} />
            <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin-dashboard" /> : renderDashboard()} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
            <Route path="/add-transaction" element={renderAddTransaction()} />
            <Route path="/transactions" element={renderTransactionHistory()} />
            <Route path="/budgets" element={renderBudgets()} />
            <Route path="/analysis" element={renderPersonalAnalysis()} />
            <Route path="/trips" element={<TripsList trips={trips} theme={theme} onSelectTrip={handleSelectTrip} onAddTrip={handleAddTrip} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/trips/:id" element={<TripDetailRoute trips={trips} tripMembers={tripMembers} theme={theme} navigate={navigate} prefetchTripDetails={prefetchTripDetails} handleJoinTrip={handleJoinTrip} handleUpdateTripStatus={handleUpdateTripStatus} handleDeleteTrip={handleDeleteTrip} handleRemoveTripMember={handleRemoveTripMember} currentUser={user} joinedTrips={joinedTrips} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/trip-analysis" element={<TripAnalysisRoute trips={trips} tripExpenses={tripExpenses} tripMembers={tripMembers} theme={theme} navigate={navigate} fetchTripExpenses={fetchTripExpenses} refreshTripData={refreshTripData} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/trip-analysis/:id" element={<TripAnalysisRoute trips={trips} tripExpenses={tripExpenses} tripMembers={tripMembers} theme={theme} navigate={navigate} fetchTripExpenses={fetchTripExpenses} refreshTripData={refreshTripData} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/group-split" element={<Navigate to="/group-settlement" />} />
            <Route path="/group-settlement" element={<GroupSplitRoute trips={trips} settlementData={settlementData} manualSettlements={manualSettlements} tripMembers={tripMembers} refreshTripData={refreshTripData} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/group-settlement/:id" element={<GroupSplitRoute trips={trips} settlementData={settlementData} manualSettlements={manualSettlements} tripMembers={tripMembers} refreshTripData={refreshTripData} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/trip-ratings" element={<TripRatings trips={trips} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/trip-ratings/:tripId" element={<TripRatingsDetailRoute trips={trips} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/post-trip-ratings" element={<TripsToRateRoute trips={trips} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/post-trip-ratings/:tripId" element={<TripMembersRatingRoute trips={trips} tripMembers={tripMembers} prefetchTripDetails={prefetchTripDetails} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/post-trip-ratings/:tripId/member/:userId" element={<MemberRatingFormRoute trips={trips} tripMembers={tripMembers} prefetchTripDetails={prefetchTripDetails} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/global-ratings" element={<GlobalRatings tripRankings={tripRankings} theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="/profile" element={<Profile theme={theme} cardClass={cardClass} mutedText={mutedText} />} />
            <Route path="*" element={<p className="text-center mt-10">404 - Page not found</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
