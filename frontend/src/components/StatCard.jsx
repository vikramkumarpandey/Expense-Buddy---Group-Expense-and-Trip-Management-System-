export default function StatCard({ theme, title, value, subtext, accent = 'cyan' }) {
  const accentMap = {
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
    blue: 'text-blue-300'
  };

  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur-2xl shadow-xl transition duration-200 hover:-translate-y-1 ${
        theme === 'dark'
          ? 'border-white/10 bg-white/10 shadow-black/10'
          : 'border-slate-200/70 bg-white/60 shadow-slate-200/70'
      }`}
    >
      <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{title}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
      <p className={`mt-2 text-sm ${accentMap[accent]}`}>{subtext}</p>
    </div>
  );
}
