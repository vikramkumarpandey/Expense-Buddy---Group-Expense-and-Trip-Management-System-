import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Zap, Trophy, AlertCircle, DollarSign, Calendar, Target } from 'lucide-react';
import { fetchJson } from '../utils/api.js';

export default function AdminDashboard({ theme, cardClass, mutedText }) {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchJson('/admin/dashboard');
        setAdminData(data);
      } catch (err) {
        setError(err.message || 'Failed to load admin dashboard');
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={mutedText}>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-red-900/30 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
          <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{error}</p>
        </div>
      </div>
    );
  }

  if (!adminData) return null;

  const StatBox = ({ icon: Icon, label, value, color, subtext, onClick }) => (
    <button type="button" onClick={onClick} className={`${cardClass} w-full text-left p-6 border-l-4 ${color} transition hover:scale-[1.01] hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-2 ${mutedText}`}>{label}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          {subtext && <p className={`text-xs mt-1 ${mutedText}`}>{subtext}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color.replace('border-l-4', '').replace('border-', 'text-')}`} />
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold">
            👑
          </div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className={`${mutedText} text-sm`}>Global system overview and statistics</p>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatBox
          icon={Users}
          label="Total Users"
          value={adminData.totalUsers}
          color="border-blue-500"
          subtext="Registered members"
          onClick={() => navigate('/admin/users')}
        />
        <StatBox
          icon={Calendar}
          label="Total Trips"
          value={adminData.totalTrips}
          color="border-cyan-500"
          subtext={`${adminData.activeTrips} active, ${adminData.completedTrips} completed`}
          onClick={() => navigate('/admin/trips')}
        />
        <StatBox
          icon={TrendingUp}
          label="Total Members"
          value={adminData.totalMembers}
          color="border-green-500"
          subtext="Unique trip participants"
          onClick={() => navigate('/admin/members')}
        />
        <StatBox
          icon={DollarSign}
          label="Total Expenses"
          value={`₹${adminData.totalExpenses.toLocaleString()}`}
          color="border-rose-500"
          subtext={`Trip: ₹${adminData.totalTripExpenses.toLocaleString()}`}
          onClick={() => navigate('/admin/trips')}
        />
      </div>

      {/* Trip Status Breakdown */}
      <div className={cardClass}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Trip Status Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(adminData.statusBreakdown).map(([status, count]) => (
            <div
              key={status}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>{status}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Users */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Most Active Users
          </h2>
          {adminData.topUsers && adminData.topUsers.length > 0 ? (
            <div className="space-y-3">
              {adminData.topUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div>
                    <p className="font-medium">{idx + 1}. {user.name}</p>
                    <p className={`text-xs ${mutedText}`}>{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{user.tripCount}</p>
                    <p className={`text-xs ${mutedText}`}>trips</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={mutedText}>No user activity yet</p>
          )}
        </div>

        {/* Budget & Financial Overview */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Summary
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'}`}>
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>Total Trip Expenses</p>
              <p className="text-2xl font-bold text-cyan-400">₹{adminData.totalTripExpenses.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>Total Personal Expenses</p>
              <p className="text-2xl font-bold text-purple-400">₹{adminData.totalPersonalExpenses.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>Total Trip Budgets</p>
              <p className="text-2xl font-bold text-green-400">₹{adminData.totalBudgets.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Most Expensive Trip */}
      {adminData.mostExpensiveTrip && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Most Expensive Trip
          </h2>
          <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-white/5 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{adminData.mostExpensiveTrip.title}</h3>
                <p className={`text-sm ${mutedText}`}>📍 {adminData.mostExpensiveTrip.destination}</p>
              </div>
              <span className="text-2xl font-bold text-amber-400">₹{adminData.mostExpensiveTrip.totalSpent.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={`text-xs ${mutedText}`}>Budget</p>
                <p className="font-semibold">₹{adminData.mostExpensiveTrip.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className={`text-xs ${mutedText}`}>Over/Under</p>
                <p className={adminData.mostExpensiveTrip.totalSpent > adminData.mostExpensiveTrip.budget ? 'text-rose-400 font-semibold' : 'text-green-400 font-semibold'}>
                  {adminData.mostExpensiveTrip.totalSpent > adminData.mostExpensiveTrip.budget 
                    ? `+₹${(adminData.mostExpensiveTrip.totalSpent - adminData.mostExpensiveTrip.budget).toLocaleString()}`
                    : `-₹${(adminData.mostExpensiveTrip.budget - adminData.mostExpensiveTrip.totalSpent).toLocaleString()}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {adminData.topRatedUser && (
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${mutedText}`}>Top Rated User</p>
                <p className="text-2xl font-bold">⭐ {adminData.topRatedUser.avgRating}</p>
                <p className={`text-xs mt-1 ${mutedText}`}>{adminData.topRatedUser.ratingCount} ratings</p>
              </div>
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        )}

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>Pending Settlements</p>
              <p className="text-2xl font-bold">{adminData.pendingSettlements}</p>
              <p className={`text-xs mt-1 ${mutedText}`}>Awaiting resolution</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium mb-1 ${mutedText}`}>Avg Trip Size</p>
              <p className="text-2xl font-bold">{adminData.totalMembers > 0 ? Math.round(adminData.totalMembers / adminData.totalTrips || 0) : 0}</p>
              <p className={`text-xs mt-1 ${mutedText}`}>members per trip</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>


    </div>
  );
}
