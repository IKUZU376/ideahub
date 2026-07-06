import React, { useState } from 'react';
import { Search, Bell, Settings, Menu, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const isDetailsPage = location.pathname.startsWith('/ideas/') && location.pathname !== '/ideas';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/ideas?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-bg-base/70 backdrop-blur-md border-b border-border-subtle/40 w-full pt-safe">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer w-11 h-11 flex items-center justify-center -ml-2.5 rounded-xl hover:bg-bg-elevated/40 transition-colors"
        >
          <Menu size={22} />
        </button>
        
        {isDetailsPage ? (
          <button 
            onClick={() => navigate('/ideas')}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer group h-10 px-2 rounded-xl"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to My Ideas
          </button>
        ) : (
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/70" size={15} />
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search ideas, tags, departments... (Press Enter)" 
              className="w-full bg-bg-surface/50 border border-border-subtle/85 rounded-xl py-1.5 pl-10 pr-4 text-xs text-text-primary placeholder:text-text-secondary/60 input-glow transition-all"
            />
          </form>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl hover:bg-bg-elevated/40">
          <Bell size={19} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-bg-base animate-pulse" />
        </button>
        
        <button 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="text-text-secondary hover:text-text-primary transition-all focus:outline-none cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl hover:bg-bg-elevated/40"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="text-text-secondary hover:text-text-primary transition-all hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-bg-elevated/40 focus:outline-none cursor-pointer group"
        >
          <Settings size={19} className="group-hover:rotate-45 transition-transform duration-300" />
        </button>
        
        {user && (
          <div 
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full overflow-hidden border border-border-strong cursor-pointer hover:border-primary-hover hover:scale-105 active:scale-95 transition-all relative group shrink-0"
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </header>
  );
}
