import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lightbulb, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = (clientX / width) - 0.5;
    const y = (clientY / height) - 0.5;
    setMousePos({ x, y });
  };

  // Check if Supabase credentials have been provided in the environment
  const isConfigured = 
    !!import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-ref.supabase.co' &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      setError(
        'Supabase keys are not set up yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your local environment settings (.env file).'
      );
      return;
    }

    setLoading(true);
    try {
      await login();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google OAuth redirect.');
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none transition-transform duration-500 ease-out" 
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`
        }}
      />
      <div 
        className="absolute top-1/4 left-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out animate-float" 
        style={{
          transform: `translate(calc(-50% + ${mousePos.x * 50}px), calc(-50% + ${mousePos.y * 50}px))`
        }}
      />
      
      <div 
        className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 animate-float">
            <Lightbulb size={24} className="fill-current" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">IdeaHub</h1>
          <p className="text-xs uppercase tracking-widest text-text-secondary mt-1 font-semibold">Club Workflow Management</p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-2xl" />
          
          <h2 className="text-xl font-bold text-text-primary mb-2">Welcome to IdeaHub</h2>
          <p className="text-sm text-text-secondary mb-6">Log in to collaborate on club initiatives, manage reviews, and track implementation timelines.</p>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger mb-6 animate-in fade-in duration-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="text-xs font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {!isConfigured && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs rounded-xl leading-relaxed">
                <strong>Developer Note:</strong> Set your keys in your <code>.env</code> file or environment variables to connect to your real Supabase instance.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 px-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none cursor-pointer focus:outline-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
