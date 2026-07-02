import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

interface Toast {
  id: string;
  type: 'idea' | 'comment';
  message: string;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'idea' | 'comment', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const activeUser = auth.getCurrentUser();
    if (!activeUser) return;

    // Listen to real-time database insert events on ideas and comments
    const channel = supabase
      .channel('app-notifications-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ideas' },
        (payload) => {
          console.log('Layout: Realtime new idea payload:', payload);
          if (payload.new && payload.new.author_id !== activeUser.id) {
            addToast('idea', '💡 A new proposal has been submitted by a club member!');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'idea_comments' },
        (payload) => {
          console.log('Layout: Realtime new comment payload:', payload);
          if (payload.new && payload.new.author_id !== activeUser.id) {
            addToast('comment', '💬 A new comment has been added to a proposal discussion!');
          }
        }
      )
      .subscribe((status) => {
        console.log('Layout: Realtime notifications channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-bg-base text-text-primary">
      {/* Sidebar - handles both desktop and mobile drawer overlay */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
        />
      )}
      
      <div className="flex-1 flex flex-col md:ml-[240px] w-full min-w-0">
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Slide-in Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="p-4 bg-bg-surface/90 border border-border-subtle/80 text-text-primary rounded-xl glass-card shadow-2xl flex items-center justify-between gap-3 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <span className="text-xs font-semibold leading-relaxed pl-1.5">{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-text-secondary hover:text-text-primary font-bold text-[10px] uppercase shrink-0 focus:outline-none cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
