import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Lightbulb, 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Building2, 
  ShieldCheck, 
  Settings,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'submit', label: 'Submit Idea', path: '/submit', icon: PlusCircle },
    { id: 'my-ideas', label: 'My Ideas', path: '/ideas', icon: ListTodo },
    { id: 'department', label: 'Department', path: '/department', icon: Building2 },
    { id: 'admin', label: 'Admin', path: '/admin', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  ] as const;

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const checkActive = (itemPath: string) => {
    if (itemPath === '/ideas') {
      return location.pathname === '/ideas' || location.pathname.startsWith('/ideas/');
    }
    return location.pathname === itemPath;
  };

  const isAdmin = user?.role?.toLowerCase().includes('admin') || user?.role?.toLowerCase().includes('coordinator');

  return (
    <aside className={`fixed md:flex flex-col left-0 top-0 h-screen w-[240px] bg-bg-surface/80 backdrop-blur-xl border-r border-border-subtle/50 p-5 z-40 transition-transform duration-300 md:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      {/* Header section with brand */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Lightbulb size={18} className="fill-current" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wide text-text-primary">IdeaHub</h1>
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Club Workflow</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Primary submit action */}
      <button 
        onClick={() => handleNavClick('/submit')}
        className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl py-2.5 px-4 mb-6 flex items-center justify-center gap-2 transition-all font-semibold text-sm focus:outline-none shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <PlusCircle size={16} />
        New Idea
      </button>

      {/* Navigation menu */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          if (item.id === 'admin' && !isAdmin) return null;

          const isActive = checkActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none w-full text-left relative overflow-hidden group cursor-pointer ${
                isActive 
                  ? 'bg-primary-transparent text-primary border-l-2 border-primary pl-2.5 font-semibold' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40'
              }`}
            >
              <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom utilities */}
      <div className="mt-auto pt-4 border-t border-border-subtle/50 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40 transition-all focus:outline-none w-full text-left cursor-pointer">
          <HelpCircle size={18} />
          Help
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/5 transition-all focus:outline-none w-full text-left cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
