import React, { useEffect, useState } from 'react';
import api from '../api';
import { User, Save } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // To update header immediately if they change name
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        setFirstName(res.data.firstName || '');
        setLastName(res.data.lastName || '');
        setEmail(res.data.email || '');
      })
      .catch(err => {
        console.error("Failed to load profile", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/auth/profile', { firstName, lastName });
      setMessage('Profile updated successfully!');
      if (user) {
        setUser({ ...user, name: `${firstName} ${lastName}` });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors) 
        : err.response?.data || err.message;
      setMessage('Failed to update profile: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-12 animate-pulse text-xl text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-primary" /> My Profile
      </h1>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              disabled 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {saving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
