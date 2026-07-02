import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { profilesService } from '../services/profiles';
import { Idea } from '../types';
import { getDepartmentBadgeColor, getDepartmentColorClass } from '../lib/colors';

export function MyIdeas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [counts, setCounts] = useState({ all: 0, review: 0, approved: 0, implementation: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'In Review' | 'Approved' | 'Implementation' | 'Draft'>('all');
  
  const [onlyMyIdeas, setOnlyMyIdeas] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const depts = await profilesService.getDepartments();
        setDepartments(depts.map(d => d.name));
      } catch (err) {
        console.error('MyIdeas: Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setError(null);
        let status: string | undefined;
        let statusIn: string[] | undefined;

        if (activeTab === 'In Review') {
          status = 'In Review';
        } else if (activeTab === 'Approved') {
          status = 'Approved';
        } else if (activeTab === 'Implementation') {
          statusIn = ['In Implementation', 'Completed'];
        } else if (activeTab === 'Draft') {
          status = 'Draft';
        }

        const [fetchedIdeas, fetchedCounts] = await Promise.all([
          ideasService.getIdeas({
            authorId: onlyMyIdeas ? user.id : undefined,
            search: searchQuery.trim() || undefined,
            status,
            statusIn,
            department: selectedDeptFilter !== 'all' ? selectedDeptFilter : undefined,
          }),
          ideasService.getIdeasCounts(onlyMyIdeas ? user.id : undefined)
        ]);

        setIdeas(fetchedIdeas);
        setCounts(fetchedCounts);
      } catch (err: any) {
        console.error('MyIdeas: Failed to load ideas:', err);
        setError(err.message || 'Failed to load ideas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const unsubscribe = ideasService.subscribe(fetchData);
    return unsubscribe;
  }, [user?.id, searchQuery, activeTab, onlyMyIdeas, selectedDeptFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  if (loading && ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-secondary/80 font-semibold animate-pulse">Loading ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-12 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">Failed to Load Ideas</h3>
          <p className="text-xs text-text-secondary/85 mt-1.5 leading-relaxed">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-primary-hover rounded-xl text-xs font-semibold hover-lift cursor-pointer focus:outline-none"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight">Explore Ideas</h2>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">Follow your club ideas through drafts, department review, collaboration, and implementation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          <label className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={onlyMyIdeas}
              onChange={(e) => setOnlyMyIdeas(e.target.checked)}
              className="rounded bg-bg-base/60 border-border-strong text-primary focus:ring-primary/50 w-3.5 h-3.5 cursor-pointer accent-primary"
            />
            <span>My Ideas Only</span>
          </label>
          
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-bg-surface border border-border-subtle/70 hover:border-primary-hover px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer font-semibold input-glow h-[32px]"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-60 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/70" size={15} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search ideas..." 
              className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl py-1.5 pl-10 pr-4 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {[
          { id: 'all', label: `All Ideas`, count: counts.all },
          { id: 'In Review', label: `In Review`, count: counts.review },
          { id: 'Approved', label: `Approved`, count: counts.approved },
          { id: 'Implementation', label: `Implementation`, count: counts.implementation },
          { id: 'Draft', label: `Drafts`, count: counts.draft },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none cursor-pointer border ${
              activeTab === tab.id 
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                : 'bg-bg-surface/50 border-border-subtle/80 text-text-secondary hover:text-text-primary hover:bg-bg-elevated/35'
            }`}
          >
            {tab.label} <span className={`ml-1 text-[10px] opacity-75 ${activeTab === tab.id ? 'text-white' : 'text-primary'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Idea Cards Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface/30 border border-border-subtle/50 rounded-2xl glass-card">
          <p className="text-text-secondary text-xs font-semibold mb-3">No ideas match your current filters.</p>
          {(searchQuery || activeTab !== 'all' || selectedDeptFilter !== 'all' || !onlyMyIdeas) ? (
            <button 
              onClick={() => { setSearchQuery(''); setActiveTab('all'); setSelectedDeptFilter('all'); setOnlyMyIdeas(true); setSearchParams({}); }}
              className="px-3.5 py-1.5 bg-bg-surface border border-border-strong hover:border-primary-hover rounded-xl text-[10px] font-bold hover-lift transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-text-primary font-body"
            >
              Clear Filters
            </button>
          ) : (
            <button 
              onClick={() => navigate('/submit-idea')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl text-[10px] font-bold hover-lift transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-md shadow-primary/10 font-body"
            >
              Submit Your First Idea
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => (
            <div 
              key={idea.id}
              onClick={() => navigate(`/ideas/${idea.id}`)}
              className="bg-bg-surface/50 border border-border-subtle/60 rounded-2xl p-5 hover-lift cursor-pointer group flex flex-col h-full relative overflow-hidden glass-card shadow-lg"
            >
              {/* Department accent indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getDepartmentColorClass(idea.departmentName)}`} />

              <div className="flex justify-between items-center mb-4">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                  idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/15 border-success/20 text-success' :
                  idea.status === 'In Review' ? 'bg-warning/15 border-warning/20 text-warning' :
                  'bg-bg-elevated/70 border-border-subtle text-text-secondary'
                }`}>
                  {idea.status}
                </span>
                <span className="text-[10px] text-text-secondary/70">{idea.createdAt}</span>
              </div>
              
              <h3 className="font-display font-bold text-base text-text-primary mb-2.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{idea.title}</h3>
              <p className="text-xs text-text-secondary/90 leading-relaxed mb-5 flex-1 line-clamp-3">{idea.description}</p>
              
              <div className="mt-auto pt-4 border-t border-border-subtle/40 flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getDepartmentBadgeColor(idea.departmentName)}`}>{idea.departmentName}</span>
                <div className="flex gap-1.5">
                  {idea.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-bg-elevated/60 rounded-md text-[9px] font-medium text-text-secondary/90 border border-border-subtle">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
