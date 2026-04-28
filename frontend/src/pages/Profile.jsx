import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api.js';
import { User, Mail, BookOpen, Calendar, FileText, Edit3, Save, X } from 'lucide-react';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const TRAVEL_STYLE_OPTIONS = ['budget', 'luxury', 'backpacking'];
const FOOD_OPTIONS = ['veg', 'non-veg', 'vegan'];
const SLEEP_OPTIONS = ['early', 'late'];
const YES_NO_OPTIONS = ['yes', 'no'];

export default function Profile({ theme, cardClass, mutedText }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    college: '',
    age: '',
    bio: '',
    gender: '',
    city: '',
    state: '',
    country: '',
    degree: '',
    branch: '',
    interests: '',
    hobbies: '',
    travel_style: '',
    food_preference: '',
    sleep_preference: '',
    drinking_preference: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/auth/profile');
      setProfile(data);
      setForm({
        name: data.name || '',
        college: data.college || '',
        age: data.age || '',
        bio: data.bio || '',
        gender: data.gender || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        degree: data.degree || '',
        branch: data.branch || '',
        interests: data.interests || '',
        hobbies: data.hobbies || '',
        travel_style: data.travel_style || '',
        food_preference: data.food_preference || '',
        sleep_preference: data.sleep_preference || '',
        drinking_preference: data.drinking_preference || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await fetchJson('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      setProfile(data);
      setEditing(false);
      setSuccess('Profile updated successfully!');

      // Update localStorage user info
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.name = data.name;
      localStorage.setItem('user', JSON.stringify(storedUser));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className={mutedText}>Loading profile...</p>
      </div>
    );
  }

  const fieldStyle = `w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-400/50 transition ${
    theme === 'dark'
      ? 'border-white/10 bg-black/20 text-white placeholder-slate-500'
      : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
  }`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-blue-300">👤 My Account</p>
        <h2 className="text-3xl font-semibold">Profile</h2>
        <p className={`mt-2 text-sm ${mutedText}`}>View and manage your account details</p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500 font-semibold">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-500 font-semibold">
          ✕ {error}
        </div>
      )}

      <div className={cardClass}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Account Details</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-400/20"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); setForm({
                  name: profile.name || '',
                  college: profile.college || '',
                  age: profile.age || '',
                  bio: profile.bio || '',
                  gender: profile.gender || '',
                  city: profile.city || '',
                  state: profile.state || '',
                  country: profile.country || '',
                  degree: profile.degree || '',
                  branch: profile.branch || '',
                  interests: profile.interests || '',
                  hobbies: profile.hobbies || '',
                  travel_style: profile.travel_style || '',
                  food_preference: profile.food_preference || '',
                  sleep_preference: profile.sleep_preference || '',
                  drinking_preference: profile.drinking_preference || ''
                }); }}
                className="flex items-center gap-1 rounded-xl border border-slate-400/30 bg-slate-400/10 px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-400/20"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
              <User size={18} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>Full Name</label>
              {editing ? (
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldStyle} />
              ) : (
                <p className="text-base font-semibold mt-1">{profile?.name || 'N/A'}</p>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-violet-500/15' : 'bg-violet-50'}`}>
              <Mail size={18} className="text-violet-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>Email</label>
              <p className="text-base font-semibold mt-1">{profile?.email || 'N/A'}</p>
              <p className={`text-xs mt-1 ${mutedText}`}>Email cannot be changed</p>
            </div>
          </div>

          {/* College */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
              <BookOpen size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>College</label>
              {editing ? (
                <input type="text" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Your college" className={fieldStyle} />
              ) : (
                <p className="text-base font-semibold mt-1">{profile?.college || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Age */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
              <Calendar size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>Age</label>
              {editing ? (
                <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Your age" min="10" max="100" className={fieldStyle} />
              ) : (
                <p className="text-base font-semibold mt-1">{profile?.age || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-rose-500/15' : 'bg-rose-50'}`}>
              <FileText size={18} className="text-rose-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>Bio</label>
              {editing ? (
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell something about yourself..." className={`${fieldStyle} resize-none`} rows="3" />
              ) : (
                <p className="text-base font-semibold mt-1">{profile?.bio || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
              <User size={18} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <label className={`text-xs font-medium ${mutedText}`}>Gender</label>
              {editing ? (
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={fieldStyle}>
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <p className="text-base font-semibold mt-1">{profile?.gender || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>City</label>
              {editing ? <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.city || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>State</label>
              {editing ? <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.state || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Country</label>
              {editing ? <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.country || 'Not set'}</p>}
            </div>
          </div>

          {/* Academic */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Degree</label>
              {editing ? <input type="text" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.degree || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Branch</label>
              {editing ? <input type="text" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Branch" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.branch || 'Not set'}</p>}
            </div>
          </div>

          {/* Interests */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Interests</label>
              {editing ? <input type="text" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Comma separated interests" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.interests || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Hobbies</label>
              {editing ? <input type="text" value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} placeholder="Hobbies" className={fieldStyle} /> : <p className="text-base font-semibold mt-1">{profile?.hobbies || 'Not set'}</p>}
            </div>
          </div>

          {/* Preferences */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Travel Style</label>
              {editing ? (
                <select value={form.travel_style} onChange={(e) => setForm({ ...form, travel_style: e.target.value })} className={fieldStyle}>
                  <option value="">Select style</option>
                  {TRAVEL_STYLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : <p className="text-base font-semibold mt-1">{profile?.travel_style || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Food Preference</label>
              {editing ? (
                <select value={form.food_preference} onChange={(e) => setForm({ ...form, food_preference: e.target.value })} className={fieldStyle}>
                  <option value="">Select food preference</option>
                  {FOOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : <p className="text-base font-semibold mt-1">{profile?.food_preference || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Sleep Preference</label>
              {editing ? (
                <select value={form.sleep_preference} onChange={(e) => setForm({ ...form, sleep_preference: e.target.value })} className={fieldStyle}>
                  <option value="">Select preference</option>
                  {SLEEP_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : <p className="text-base font-semibold mt-1">{profile?.sleep_preference || 'Not set'}</p>}
            </div>
            <div>
              <label className={`text-xs font-medium ${mutedText}`}>Drinking Preference</label>
              {editing ? (
                <select value={form.drinking_preference} onChange={(e) => setForm({ ...form, drinking_preference: e.target.value })} className={fieldStyle}>
                  <option value="">Select preference</option>
                  {YES_NO_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : <p className="text-base font-semibold mt-1">{profile?.drinking_preference || 'Not set'}</p>}
            </div>
          </div>

          {/* Role & Member Since */}
          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex items-center gap-4 flex-wrap`}>
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-500 dark:text-blue-300">
              {profile?.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
            {profile?.created_at && (
              <span className={`text-xs ${mutedText}`}>
                Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
