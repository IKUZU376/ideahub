import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profilesService } from '../services/profiles';
import { User, Settings as SettingsIcon, Check } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      await profilesService.updateProfile(user.id, {
        name: name.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Settings: Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight mb-2">Settings</h2>
        <p className="text-text-secondary text-sm">Manage your profile details and account settings.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl overflow-hidden glass-card shadow-xl">
        <div className="p-6 border-b border-border-subtle/40 bg-bg-surface/30">
          <h3 className="font-display font-bold text-base flex items-center gap-2.5 text-text-primary">
            <User className="text-primary" size={18} /> Profile Details
          </h3>
          <p className="text-xs text-text-secondary/80 mt-1 leading-relaxed">This information is visible to club members collaborating on ideas.</p>
        </div>
        <form onSubmit={handleSaveProfile} className="p-6 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/4 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-2xl border border-border-subtle overflow-hidden shadow-md">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="w-full md:w-3/4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Club Role</label>
                <input 
                  type="text" 
                  value={user.role}
                  disabled
                  className="w-full bg-bg-elevated/40 border border-border-strong/50 rounded-xl px-4 py-2 text-xs text-text-secondary cursor-not-allowed opacity-60" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Department</label>
                <input 
                  type="text" 
                  value={user.departmentName} 
                  disabled 
                  className="w-full bg-bg-elevated/40 border border-border-strong/50 rounded-xl px-4 py-2 text-xs text-text-secondary cursor-not-allowed opacity-60" 
                />
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-3 pt-2">
              {saveSuccess && (
                <span className="text-success text-xs flex items-center gap-1.5 animate-in fade-in duration-300 font-semibold">
                  <Check size={14} /> Profile updated successfully.
                </span>
              )}
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
