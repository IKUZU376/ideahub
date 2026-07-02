import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { MyIdeas } from './views/MyIdeas';
import { SubmitIdea } from './views/SubmitIdea';
import { IdeaDetails } from './views/IdeaDetails';
import { Department } from './views/Department';
import { Admin } from './views/Admin';
import { Settings } from './views/Settings';

export default function App() {
  const { user, loading } = useAuth();

  // Prevent flash redirection during session restoration
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold animate-pulse">Restoring Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitIdea />} />
          <Route path="/ideas" element={<MyIdeas />} />
          <Route path="/ideas/:id" element={<IdeaDetails />} />
          <Route path="/department" element={<Department />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          {/* Prevent logged-in users from seeing the login route and send them to dashboard */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
