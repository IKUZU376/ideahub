import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { Idea } from '../types';
import { Lightbulb, Clock, Trophy, Activity, Building2, ArrowRight, AlertTriangle } from 'lucide-react';
import { getDepartmentBadgeColor } from '../lib/colors';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState({ total: 0, activeReviews: 0, implemented: 0, collaboration: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [fetchedIdeas, fetchedStats, fetchedActivities] = await Promise.all([
          ideasService.getIdeas({ limit: 5 }),
          ideasService.getStats(),
          ideasService.getRecentActivity()
        ]);
        setIdeas(fetchedIdeas);
        setStats(fetchedStats);
        setActivities(fetchedActivities);
      } catch (err: any) {
        console.error('Dashboard: Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const unsubscribe = ideasService.subscribe(fetchData);
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-secondary/80 font-semibold animate-pulse">Loading dashboard...</p>
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
          <h3 className="font-display font-bold text-base text-text-primary">Failed to Load Dashboard</h3>
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
    <div 
      onMouseMove={handleMouseMove}
      className="flex flex-col gap-8 relative"
    >
      {/* Interactive Parallax Background Glows */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out animate-float"
        style={{
          transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`
        }}
      />
      <div 
        className="absolute top-1/2 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-transform duration-500 ease-out animate-float"
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`
        }}
      />
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, <span className="text-primary">{user ? user.name.split(' ')[0] : 'Member'}</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">Track club ideas from junior submissions to department review and implementation.</p>
        </div>
        <button 
          onClick={() => navigate('/ideas')}
          className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-primary-hover rounded-xl text-xs font-semibold hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          View All Ideas
          <ArrowRight size={14} className="text-primary-hover" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Lightbulb} label="Club Ideas" value={stats.total.toString()} trend="+8%" trendUp colorClass="bg-primary" />
        <StatCard icon={Clock} label="Active Reviews" value={stats.activeReviews.toString()} subtext="with heads" colorClass="bg-warning" />
        <StatCard icon={Trophy} label="Implemented" value={stats.implemented.toString()} subtext="this term" colorClass="bg-success" />
        <StatCard icon={Activity} label="Collaboration" value={stats.collaboration.toString()} subtext="open items" colorClass="bg-danger" />
      </div>

      {/* Table & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl overflow-hidden glass-card shadow-xl">
            <div className="p-5 border-b border-border-subtle/40 flex justify-between items-center bg-bg-surface/30">
              <h3 className="font-display font-bold text-base text-text-primary">Recent Submissions</h3>
              <button 
                onClick={() => navigate('/ideas')} 
                className="text-primary hover:text-primary-hover text-xs font-semibold hover:underline cursor-pointer focus:outline-none"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              {ideas.length === 0 ? (
                <div className="text-center py-16 bg-bg-surface border border-border-subtle/50 rounded-2xl glass-card m-5">
                  <p className="text-text-secondary text-xs font-semibold mb-3">No recent submissions found.</p>
                  <button 
                    onClick={() => navigate('/submit')}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-md shadow-primary/10 font-body"
                  >
                    Submit the First Proposal
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-left border-collapse">
                    <thead className="bg-bg-base/40 text-text-secondary/70 text-[10px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Idea Title</th>
                        <th className="px-5 py-3 font-semibold">Author</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30">
                      {ideas.map(idea => (
                        <tr 
                          key={idea.id} 
                          onClick={() => navigate(`/ideas/${idea.id}`)}
                          className="hover:bg-bg-elevated/20 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{idea.title}</span>
                              <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getDepartmentBadgeColor(idea.departmentName)}`}>
                                {idea.departmentName}
                              </span>
                            </div>
                            <div className="text-text-secondary text-xs mt-0.5 truncate max-w-xs md:max-w-sm">{idea.description}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <img src={idea.author.avatar} alt={idea.author.name} className="w-6 h-6 rounded-full object-cover border border-border-subtle" />
                              <span className="text-xs text-text-secondary">{idea.author.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/10 border-success/20 text-success' :
                              idea.status === 'In Review' ? 'bg-warning/10 border-warning/20 text-warning' :
                              'bg-bg-elevated/70 border-border-subtle text-text-secondary'
                            }`}>
                              {idea.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-xs text-text-secondary whitespace-nowrap">
                            {idea.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Stacked Card View */}
                  <div className="block md:hidden divide-y divide-border-subtle/30 px-5">
                    {ideas.map(idea => (
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
                            idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/10 border-success/20 text-success' :
                            idea.status === 'In Review' ? 'bg-warning/10 border-warning/20 text-warning' :
                            'bg-bg-elevated/70 border-border-subtle text-text-secondary'
                          }`}>
                            {idea.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <img src={idea.author.avatar} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-border-subtle" />
                            <span className="text-xs text-text-secondary/90 font-medium">{idea.author.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getDepartmentBadgeColor(idea.departmentName)}`}>
                              {idea.departmentName}
                            </span>
                            <span className="text-[10px] text-text-secondary/70">{idea.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/submit')} 
                className="p-4 bg-bg-surface border border-border-subtle rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-hover hover-lift cursor-pointer focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-transparent flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-md">
                  <Lightbulb size={18} />
                </div>
                <span className="text-xs font-semibold text-text-primary mt-1">Submit Idea</span>
              </button>
              <button 
                onClick={() => navigate('/department')} 
                className="p-4 bg-bg-surface border border-border-subtle rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-hover hover-lift cursor-pointer focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-transparent flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-md">
                  <Building2 size={18} />
                </div>
                <span className="text-xs font-semibold text-text-primary mt-1">Department</span>
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 flex-1 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base text-text-primary mb-4">Activity Feed</h3>
            <div className="space-y-5 relative before:absolute before:inset-0 before:left-[11px] before:-translate-x-px before:h-full before:w-[1px] before:bg-border-subtle">
              {activities.length === 0 ? (
                <p className="text-xs text-text-secondary py-4 pl-4">No recent activity recorded yet.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="relative flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary-transparent border border-primary/30 flex items-center justify-center shrink-0 z-10">
                      <Activity size={10} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary leading-relaxed">
                        <span className="font-semibold text-text-primary">{activity.changedBy}</span> changed proposal <span className="italic">"{activity.ideaTitle}"</span> status to <span className="font-medium text-primary">{activity.status}</span>
                      </p>
                      <p className="text-[10px] text-text-secondary/70 mt-1">{activity.createdAt}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, subtext, colorClass }: any) {
  return (
    <div className="bg-bg-surface/50 border border-border-subtle/60 rounded-2xl p-5 relative overflow-hidden group hover-lift glass-card shadow-lg">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${colorClass}`} />
      
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary-transparent flex items-center justify-center text-primary-hover group-hover:rotate-12 transition-transform duration-300">
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold text-text-primary tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'text-success bg-success/10 border border-success/20' : 'text-danger bg-danger/10 border border-danger/20'}`}>
            {trend}
          </span>
        )}
        {subtext && <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">{subtext}</span>}
      </div>
    </div>
  );
}
