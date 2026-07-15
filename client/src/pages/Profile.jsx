
// client/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
      setName(res.data.name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await api.put('/auth/profile', { name });
      setProfile(res.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-6">Profile</h1>

      <form onSubmit={handleSave} className="bg-white border rounded-lg p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-sm font-medium">{profile.email}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Member since</label>
          <p className="text-sm font-medium">
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <label htmlFor="name" className="text-sm text-gray-500">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
}