import { ChevronDown, ChevronRight, Moon, Sun, Trophy, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({
  theme,
  setTheme,
  personalOpen,
  setPersonalOpen,
  tripsOpen,
  setTripsOpen,
  user,
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // MODULE A: Personal Finance menu items
  const personalMenu = [
    { name: 'Add Transaction', path: '/add-transaction' },
    { name: 'Transaction History', path: '/transactions' },
    { name: 'Budgets', path: '/budgets' },
    { name: 'Personal Analysis', path: '/analysis' }
  ];
  
  // MODULE B: Travel Buddy menu items
  const tripMenu = [
    { name: 'Trips', path: '/trips' },
    { name: 'Group Split', path: '/group-split' },
    { name: 'Trip Analysis', path: '/trip-analysis' },
    { name: 'Post-Trip Ratings', path: '/post-trip-ratings' },
    { name: 'Trip Ratings', path: '/trip-ratings' },
    { name: 'Global Leaderboard', path: '/global-ratings' }
  ];

  const adminMenu = [
    { name: 'Admin Dashboard', path: '/admin-dashboard' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Manage Trips', path: '/admin/trips' },
    { name: 'Manage Members', path: '/admin/members' }
  ];

  const navClass = (active) =>
    `w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
      active
        ? 'bg-blue-600 dark:bg-blue-500 text-white'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white'
    }`;

  return (
    <aside className="w-60 fixed left-0 top-0 h-full border-r border-slate-200/70 dark:border-white/10 bg-white dark:bg-gray-900 text-black dark:text-white backdrop-blur-2xl z-[9999] overflow-y-auto">
      <div className="p-6">
        {/* Header with branding */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/20">
            ₹
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-wide">Expense Buddy</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Finance + Travel</p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <span className="truncate">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          {theme === 'dark' ? <Sun size={14} className="ml-1 flex-shrink-0" /> : <Moon size={14} className="ml-1 flex-shrink-0" />}
        </button>

        <nav className="space-y-1">
          {/* Admin Dashboard (only for admins) */}
          {user?.role === 'admin' && (
            <div className="space-y-1">
              {adminMenu.map((item) => (
                <button key={item.name} className={navClass(location.pathname === item.path)} onClick={() => navigate(item.path)}>
                   {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Dashboard link */}
          {user?.role !== 'admin' && (
            <button className={navClass(location.pathname === '/' || location.pathname === '/dashboard')} onClick={() => navigate('/')}>
              📊 Dashboard
            </button>
          )}

          {/* MODULE A: Personal Finance Section */}
          <div className="rounded-lg overflow-hidden border border-transparent">
            <button className={navClass(personalOpen)} onClick={() => setPersonalOpen(!personalOpen)}>
              <div className="flex items-center justify-between">
                <span className="truncate">💰 Finance</span>
                {personalOpen ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
              </div>
            </button>
            {personalOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {personalMenu.map((item) => (
                  <button key={item.name} className={navClass(location.pathname === item.path)} onClick={() => navigate(item.path)}>
                    <span className="truncate text-xs">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MODULE B: Travel Buddy Section */}
          <div className="rounded-lg overflow-hidden border border-transparent">
            <button className={navClass(tripsOpen)} onClick={() => setTripsOpen(!tripsOpen)}>
              <div className="flex items-center justify-between">
                <span className="truncate">✈️ Travel Buddy</span>
                {tripsOpen ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
              </div>
            </button>
            {tripsOpen && (
              <div className="mt-1 space-y-1 pl-2">
                {tripMenu.map((item) => (
                  <button key={item.name} className={navClass(location.pathname === item.path)} onClick={() => navigate(item.path)}>
                    {item.name === 'Trip Ratings' ? (
                      <span className="inline-flex items-center gap-1 truncate text-xs">
                        <Trophy size={12} className="flex-shrink-0" /> {item.name}
                      </span>
                    ) : item.name === 'Global Leaderboard' ? (
                      <span className="inline-flex items-center gap-1 truncate text-xs">
                        🏆 {item.name}
                      </span>
                    ) : (
                      <span className="truncate text-xs">{item.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User Info & Logout (at the bottom) */}
        {user && (
          <div className="mt-6 border-t border-slate-200 dark:border-white/10 pt-4">
            <div className="mb-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-2 rounded-full px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-300">
                {user.role === 'admin' ? ' Admin' : '👤 User'}
              </span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 mb-2"
            >
              <span>👤 Profile</span>
              <User size={14} className="flex-shrink-0" />
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40"
            >
              <span>Logout</span>
              <LogOut size={14} className="flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
