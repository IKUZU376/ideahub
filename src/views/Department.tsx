import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { departmentsService, DepartmentDetails } from '../services/departments';
import { Idea } from '../types';
import { Award, Lightbulb, CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import { getDepartmentBadgeColor } from '../lib/colors';

export function Department() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [deptDetails, setDeptDetails] = useState<DepartmentDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDepartmentName = user?.departmentName || 'TECHNICAL';
  const currentDepartmentId = user?.departmentId;

  useEffect(() => {
    const loadDeptData = async () => {
      try {
        setError(null);
        // Fetch ideas filtered by department on the database level
        const fetchedIdeas = await ideasService.getIdeas({
          departmentId: currentDepartmentId || undefined
        });
        setIdeas(fetchedIdeas);

        const fetchedDetails = await departmentsService.getDepartmentDetails(currentDepartmentName);
        setDeptDetails(fetchedDetails);
      } catch (err: any) {
        console.error('Department: Failed to load department data:', err);
        setError(err.message || 'Failed to load department overview.');
      } finally {
        setLoading(false);
      }
    };

    loadDeptData();
    const unsubscribe = ideasService.subscribe(loadDeptData);
    return unsubscribe;
  }, [currentDepartmentName, currentDepartmentId]);

  if (loading && !deptDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-secondary/80 font-semibold animate-pulse">Loading department...</p>
      </div>
    );
  }

  if (error || !deptDetails) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-12 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">Failed to Load Department</h3>
          <p className="text-xs text-text-secondary/85 mt-1.5 leading-relaxed">{error || 'Department data not found.'}</p>
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

  const totalDeptIdeas = ideas.length;
  const implementedCount = ideas.filter(i => i.status === 'Completed' || i.status === 'In Implementation').length;
  const blockedCount = deptDetails.blockedCount;
  const contributorsCount = deptDetails.contributorsCount;

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-md border mb-2.5 uppercase tracking-wider ${getDepartmentBadgeColor(currentDepartmentName)}`}>
            {currentDepartmentName} Department
          </div>
          <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight">Department Overview</h2>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl leading-relaxed">Review submissions, coordinate with other departments, and move approved club ideas into implementation.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface/50 p-6 rounded-2xl border border-border-subtle/60 shadow-lg hover-lift glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-transparent flex items-center justify-center text-primary">
              <Lightbulb size={18} />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Department Ideas</span>
          </div>
          <div className="text-3xl font-display font-extrabold tracking-tight text-text-primary">{totalDeptIdeas}</div>
          <div className="text-success text-[10px] mt-2 font-semibold flex items-center gap-1">
            <span>+12%</span> <span className="text-text-secondary/70">from last month</span>
          </div>
        </div>
        
        <div className="bg-bg-surface/50 p-6 rounded-2xl border border-border-subtle/60 shadow-lg hover-lift glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-success" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Implemented</span>
          </div>
          <div className="text-3xl font-display font-extrabold tracking-tight text-text-primary">{implementedCount}</div>
          <div className="text-success text-[10px] mt-2 font-semibold flex items-center gap-1">
            <span>+5%</span> <span className="text-text-secondary/70">from last month</span>
          </div>
        </div>
 
        <div className="bg-bg-surface/50 p-6 rounded-2xl border border-border-subtle/60 shadow-lg hover-lift glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-warning" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Contributors</span>
          </div>
          <div className="text-3xl font-display font-extrabold tracking-tight text-text-primary">{contributorsCount}</div>
          <div className="text-text-secondary/70 text-[10px] mt-2 font-semibold">Active Team Size</div>
        </div>
 
        <div className="bg-bg-surface/50 p-6 rounded-2xl border border-border-subtle/60 shadow-lg hover-lift glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-danger" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-danger/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
              <AlertTriangle size={18} />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Blocked Items</span>
          </div>
          <div className="text-3xl font-display font-extrabold tracking-tight text-text-primary relative z-10">{blockedCount}</div>
          <div className="text-danger text-[10px] mt-2 font-semibold relative z-10 font-medium">Requires attention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Queue Table */}
        <div className="lg:col-span-2 bg-bg-surface/50 rounded-2xl border border-border-subtle/50 overflow-hidden flex flex-col glass-card shadow-xl">
          <div className="p-5 border-b border-border-subtle/40 flex justify-between items-center gap-4 flex-wrap bg-bg-surface/30">
            <h3 className="font-display font-bold text-base text-text-primary">Department Queue</h3>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queue..." 
              className="bg-bg-base/60 border border-border-strong/70 rounded-xl px-3.5 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow w-full sm:w-48 lg:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-16 bg-bg-surface border border-border-subtle/50 rounded-2xl glass-card m-5">
                <p className="text-text-secondary text-xs font-semibold mb-3">No department proposals found in queue.</p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 bg-bg-surface border border-border-strong hover:border-primary-hover rounded-xl text-[10px] font-bold hover-lift transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-text-primary font-body"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead className="bg-bg-base/40 text-text-secondary/70 text-[10px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Idea Title</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Author</th>
                      <th className="px-5 py-3 font-semibold text-right">Votes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/30 text-xs">
                    {filteredIdeas.map(idea => (
                      <tr 
                        key={idea.id} 
                        onClick={() => navigate(`/ideas/${idea.id}`)} 
                        className="hover:bg-bg-elevated/20 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-sm group-hover:text-primary transition-colors">{idea.title}</div>
                          <div className="text-text-secondary/80 text-xs mt-0.5 max-w-xs sm:max-w-md truncate">{idea.description}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/15 border-success/20 text-success' : 
                            idea.status === 'In Review' ? 'bg-warning/15 border-warning/20 text-warning' : 
                            'bg-bg-elevated/70 text-text-secondary border-border-subtle'
                          }`}>
                            {idea.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 flex items-center gap-2.5 mt-1.5">
                          <img src={idea.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border-subtle" />
                          <span className="text-text-secondary">{idea.author.name.split(' ')[0]}</span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-text-primary">{idea.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Stacked Card View */}
                <div className="block md:hidden divide-y divide-border-subtle/30 px-5 text-xs">
                  {filteredIdeas.map(idea => (
                    <div 
                      key={idea.id}
                      onClick={() => navigate(`/ideas/${idea.id}`)}
                      className="py-4 flex flex-col gap-3.5 cursor-pointer active:bg-bg-elevated/10"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm text-text-primary hover:text-primary transition-colors leading-snug">{idea.title}</span>
                          <span className="text-[10px] text-text-secondary line-clamp-2">{idea.description}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border shrink-0 ${
                          idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/15 border-success/20 text-success' : 
                          idea.status === 'In Review' ? 'bg-warning/15 border-warning/20 text-warning' : 
                          'bg-bg-elevated/70 text-text-secondary border-border-subtle'
                        }`}>
                          {idea.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <img src={idea.author.avatar} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-border-subtle" />
                          <span className="text-xs text-text-secondary/95">{idea.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-secondary/70 mr-1">Votes:</span>
                          <span className="font-mono text-xs font-bold text-text-primary">{idea.votes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-3 border-t border-border-subtle/40 bg-bg-elevated/10 flex justify-center mt-auto">
            <button 
              onClick={() => navigate('/ideas')}
              className="text-primary hover:text-primary-hover text-xs font-semibold hover:underline cursor-pointer focus:outline-none"
            >
              View All Ideas
            </button>
          </div>
        </div>

        {/* Top Contributors list */}
        <div className="flex flex-col gap-6">
          <div className="bg-bg-surface/50 rounded-2xl border border-border-subtle/50 p-5 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base text-text-primary mb-5 pb-2 border-b border-border-subtle/30">Top Contributors</h3>
            <div className="space-y-4">
              {deptDetails.topContributors.map((contributorUser, idx) => (
                <div key={contributorUser.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={contributorUser.avatar} alt="" className="w-9 h-9 rounded-full border border-border-subtle object-cover" />
                      <div className="absolute -bottom-1 -right-1 bg-bg-elevated text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-border-subtle text-text-primary">{idx + 1}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary">{contributorUser.name}</div>
                      <div className="text-[10px] text-text-secondary/70 truncate max-w-[120px]">{contributorUser.role}</div>
                    </div>
                  </div>
                  <div className="text-primary-hover text-xs font-mono font-bold">{34 - (idx * 6)} pts</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/95 rounded-2xl border border-primary/50 p-6 flex flex-col justify-end min-h-[160px] relative overflow-hidden flex-1 shadow-lg group hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-hover via-primary to-bg-base/20 opacity-90"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <Award className="text-white/90 mb-3 group-hover:rotate-12 transition-transform duration-300" size={32} />
              <h4 className="text-white font-display font-extrabold text-lg mb-1">Strongest Review Queue</h4>
              <p className="text-white/80 text-xs leading-relaxed">Fastest department response time this month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
