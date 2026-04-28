import { useState } from 'react';

const initialState = {
  title: '',
  destination: '',
  budget: '',
  start_date: '',
  end_date: '',
  status: 'Planning',
  min_age: '',
  max_age: '',
  required_college: '',
  preferred_gender: 'Any',
  required_travel_style: '',
  drinking_preference: '',
  smoking_preference: ''
};

export default function TripForm({ theme, onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [showMore, setShowMore] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      budget: Number(form.budget),
      min_age: form.min_age === '' ? null : Number(form.min_age),
      max_age: form.max_age === '' ? null : Number(form.max_age),
      required_college: form.required_college || null,
      preferred_gender: form.preferred_gender || 'Any',
      required_travel_style: form.required_travel_style || null,
      drinking_preference: form.drinking_preference || null,
      smoking_preference: form.smoking_preference || null
    });
    setForm(initialState);
    setShowMore(false);
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 outline-none transition hover:-translate-y-0.5 ${
    theme === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-200 bg-white text-slate-900'
  }`;

  return (
    <form onSubmit={handleSubmit} className={`rounded-[28px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/10' : 'border-slate-200/70 bg-white/65'} backdrop-blur-2xl shadow-xl`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Create Trip</h3>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
            Keep the essentials visible and reveal matching filters only when needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
            theme === 'dark'
              ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {showMore ? 'Hide Details' : 'Add More Details'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input name="title" className={inputClass} placeholder="Trip title" value={form.title} onChange={handleChange} required />
        <input name="destination" className={inputClass} placeholder="Destination" value={form.destination} onChange={handleChange} required />
        <input name="budget" type="number" min="0" step="0.01" className={inputClass} placeholder="Budget" value={form.budget} onChange={handleChange} required />
        <select name="status" className={inputClass} value={form.status} onChange={handleChange}>
          <option>Planning</option>
          <option>Open to Join</option>
          <option>Confirmed</option>
          <option>Completed</option>
        </select>
        <input name="start_date" type="date" className={inputClass} value={form.start_date} onChange={handleChange} required />
        <input name="end_date" type="date" className={inputClass} value={form.end_date} onChange={handleChange} required />
      </div>

      <div
        className={`mt-4 overflow-hidden rounded-3xl border transition-all duration-300 ${
          showMore
            ? theme === 'dark'
              ? 'max-h-[640px] border-white/10 bg-white/5 p-4 opacity-100'
              : 'max-h-[640px] border-slate-200 bg-slate-50 p-4 opacity-100'
            : 'max-h-0 border-transparent p-0 opacity-0'
        }`}
      >
        {showMore && (
          <div className="grid gap-4 md:grid-cols-2">
            <input name="min_age" type="number" min="0" className={inputClass} placeholder="Min age (optional)" value={form.min_age} onChange={handleChange} />
            <input name="max_age" type="number" min="0" className={inputClass} placeholder="Max age (optional)" value={form.max_age} onChange={handleChange} />
            <input name="required_college" className={inputClass} placeholder="Required college (optional)" value={form.required_college} onChange={handleChange} />
            <select name="preferred_gender" className={inputClass} value={form.preferred_gender} onChange={handleChange}>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <select name="required_travel_style" className={inputClass} value={form.required_travel_style} onChange={handleChange}>
              <option value="">Any travel style</option>
              <option value="budget">budget</option>
              <option value="luxury">luxury</option>
              <option value="backpacking">backpacking</option>
            </select>
            <select name="drinking_preference" className={inputClass} value={form.drinking_preference} onChange={handleChange}>
              <option value="">Drinking preference (optional)</option>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
            <select name="smoking_preference" className={inputClass} value={form.smoking_preference} onChange={handleChange}>
              <option value="">Smoking preference (optional)</option>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>
        )}
      </div>

      <button type="submit" className="mt-4 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]">
        Add Trip
      </button>
    </form>
  );
}
