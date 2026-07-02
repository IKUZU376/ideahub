import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profilesService } from '../services/profiles';
import { User, Settings as SettingsIcon, Shield, Camera, Check } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [bio, setBio] = useState('Coordinating department reviews, implementation planning, and junior member collaboration.');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [darkMode, setDarkMode] = useState(true);
  const [notifyApprove, setNotifyApprove] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

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
        name: name.trim(),
        role: role.trim()
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
        <p className="text-text-secondary text-sm">Manage your member profile, workflow notifications, and security settings.</p>
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
          <div className="w-full md:w-1/4 flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-2xl border border-border-subtle overflow-hidden group select-none shadow-md">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <button 
              type="button" 
              className="w-full py-2 px-4 rounded-xl border border-border-strong text-xs font-semibold hover:border-primary/50 hover:bg-bg-elevated/40 transition-all text-text-primary focus:outline-none cursor-pointer"
            >
              Change Avatar
            </button>
            <button 
              type="button" 
              className="w-full py-2 px-4 rounded-xl text-danger hover:bg-danger/5 text-xs font-semibold transition-all focus:outline-none cursor-pointer"
            >
              Remove
            </button>
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
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all" 
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
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Bio</label>
                <textarea 
                  rows={3} 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all resize-none" 
                />
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-3 pt-2">
              {saveSuccess && (
                <span className="text-success text-xs flex items-center gap-1.5 animate-in fade-in duration-300 font-semibold">
                  <Check size={14} /> Profile saved!
                </span>
              )}
              <button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover-lift transition-all cursor-pointer focus:outline-none shadow-md shadow-primary/10 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl overflow-hidden glass-card shadow-xl">
        <div className="p-6 border-b border-border-subtle/40 bg-bg-surface/30">
          <h3 className="font-display font-bold text-base flex items-center gap-2.5 text-text-primary">
            <SettingsIcon className="text-primary" size={18} /> System Preferences
          </h3>
          <p className="text-xs text-text-secondary/80 mt-1 leading-relaxed">Customize your interface and notification settings.</p>
        </div>
        <div className="divide-y divide-border-subtle/40">
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-text-primary">Dark Mode Focus</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Use dark theme across all IdeaHub workspaces.</div>
            </div>
            <div 
              onClick={() => setDarkMode(!darkMode)}
              className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer"
            >
              <input 
                type="checkbox" 
                name="toggle" 
                id="toggle1" 
                checked={darkMode}
                readOnly
                className="hidden"
              />
              <div 
                className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
                style={{borderColor: darkMode ? '#7c3aed' : '#3f3f46'}}
              />
              <div 
                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${
                  darkMode ? 'bg-primary' : 'bg-bg-elevated'
                }`}
              />
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-3">
            <div>
              <div className="font-semibold text-xs text-text-primary">Email Notifications</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Select which events trigger an email alert.</div>
            </div>
            <div className="flex flex-col gap-2 mt-2 ml-1 border-l-2 border-border-strong pl-4 space-y-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-primary">
                <input 
                  type="checkbox" 
                  checked={notifyApprove} 
                  onChange={() => setNotifyApprove(!notifyApprove)}
                  className="w-4 h-4 rounded border-border-strong text-primary bg-bg-base cursor-pointer" 
                />
                <span className="text-xs text-text-secondary hover:text-text-primary transition-colors">When an idea is approved</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-primary">
                <input 
                  type="checkbox" 
                  checked={notifyComments} 
                  onChange={() => setNotifyComments(!notifyComments)}
                  className="w-4 h-4 rounded border-border-strong text-primary bg-bg-base cursor-pointer" 
                />
                <span className="text-xs text-text-secondary hover:text-text-primary transition-colors">Comments on my ideas</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-primary">
                <input 
                  type="checkbox" 
                  checked={notifyDigest}
                  onChange={() => setNotifyDigest(!notifyDigest)}
                  className="w-4 h-4 rounded border-border-strong text-primary bg-bg-base cursor-pointer" 
                />
                <span className="text-xs text-text-secondary hover:text-text-primary transition-colors">Weekly digest</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-bg-surface/50 border border-danger/25 rounded-2xl overflow-hidden relative glass-card shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-danger/5 pointer-events-none"></div>
        <div className="p-6 border-b border-border-subtle/40 bg-bg-surface/30 relative z-10">
          <h3 className="font-display font-bold text-base flex items-center gap-2.5 text-text-primary">
            <Shield className="text-danger" size={18} /> Security & Account
          </h3>
          <p className="text-xs text-text-secondary/80 mt-1 leading-relaxed">Manage your password and authentication settings.</p>
        </div>
        <div className="p-6 flex flex-col gap-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Current Password</label>
              <input type="password" placeholder="********" className="w-full md:w-1/2 bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">New Password</label>
              <input type="password" className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary/80 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input type="password" className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-xs text-text-primary input-glow transition-all" />
            </div>
          </div>
          <div>
            <button className="px-4 py-2 bg-bg-elevated/40 border border-border-strong hover:border-danger/40 hover:bg-danger/5 rounded-xl text-xs font-semibold hover-lift transition-all cursor-pointer focus:outline-none text-text-primary">Update Password</button>
          </div>
          
          <hr className="border-border-subtle/30" />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-text-primary">Two-Factor Authentication</div>
              <div className="text-[10px] text-text-secondary mt-0.5">Add an extra layer of security to your account.</div>
            </div>
            <button className="px-4 py-2 border border-primary text-primary hover:bg-primary-transparent rounded-xl text-xs font-bold hover-lift transition-all cursor-pointer focus:outline-none">Enable 2FA</button>
          </div>
        </div>
      </section>
    </div>
  );
}
