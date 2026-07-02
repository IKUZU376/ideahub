import React, { useState } from 'react';
import { Search, Bell, Settings, Menu, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-bg-base/70 backdrop-blur-md border-b border-border-subtle/40 w-full">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer"
        >
          <Menu size={22} />
        </button>
        
        {isDetailsPage ? (
          <button 
            onClick={() => navigate('/ideas')}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer group"
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

      <div className="flex items-center gap-5">
        <button className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none relative cursor-pointer">
          <Bell size={19} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-bg-base animate-pulse" />
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className="text-text-secondary hover:text-text-primary transition-colors hidden sm:block focus:outline-none cursor-pointer"
        >
          <Settings size={19} className="hover:rotate-45 transition-transform duration-300" />
        </button>
        {user && (
          <div 
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full overflow-hidden border border-border-strong cursor-pointer hover:border-primary-hover hover:scale-105 active:scale-95 transition-all relative group"
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </header>
  );
}
