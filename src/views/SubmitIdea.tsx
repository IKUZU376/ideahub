import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { profilesService } from '../services/profiles';
import { Info, TrendingUp, Save, Send, AlertCircle, HelpCircle } from 'lucide-react';

export function SubmitIdea() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [audience, setAudience] = useState('');
  const [effort, setEffort] = useState<'low' | 'medium' | 'high' | ''>('');
  const [impact, setImpact] = useState<'Low' | 'Medium' | 'High' | ''>('');
  const [selectedDept, setSelectedDept] = useState(user?.departmentName || '');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const depts = await profilesService.getDepartments();
        const names = depts.map(d => d.name);
        setDepartments(names);
        if (names.length > 0 && !selectedDept) {
          setSelectedDept(user?.departmentName && names.includes(user.departmentName) ? user.departmentName : names[0]);
        }
      } catch (err) {
        console.error('SubmitIdea: Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, [user, selectedDept]);

  const handleSave = async (status: 'Draft' | 'Submitted') => {
    setError(null);

    if (!title.trim()) {
      setError('Idea title is required.');
      return;
    }
    if (status === 'Submitted') {
      if (!problem.trim()) {
        setError('Problem statement is required for submission.');
        return;
      }
      if (!solution.trim()) {
        setError('Proposed solution is required for submission.');
        return;
      }
    }

    if (!user) {
      setError('You must be logged in to perform this action.');
      return;
    }

    setLoading(true);

    try {
      const description = `Problem Statement:\n${problem.trim() || 'No problem statement provided.'}\n\nProposed Solution:\n${solution.trim() || 'No solution provided.'}\n\nTarget Audience:\n${audience.trim() || 'No target audience specified.'}`;
      
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Find department ID mapping
      const allDepts = await profilesService.getDepartments();
      const matchedDept = allDepts.find(d => d.name === selectedDept);

      await ideasService.createIdea({
        title: title.trim(),
        description,
        author: user,
        departmentId: matchedDept ? matchedDept.id : null,
        departmentName: selectedDept,
        status: status,
        tags: parsedTags.length > 0 ? parsedTags : [selectedDept, 'Idea'],
        impact: impact || 'Medium',
      });

      setTitle('');
      setProblem('');
      setSolution('');
      setAudience('');
      setEffort('');
      setImpact('');
      setTags('');

      navigate('/ideas');
    } catch (err: any) {
      setError(err.message || 'Failed to save the idea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto animate-in fade-in duration-500 pb-6">
      {/* Header Info with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border-subtle/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-wider font-semibold">
            <span className="text-primary font-bold">Club Workflow</span>
            <span className="w-1 h-1 rounded-full bg-border-strong"></span>
            <span>Stage: Ideation</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-text-primary tracking-tight">Submit a New Idea</h2>
        </div>

        {/* Buttons in Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('Draft')}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border-strong hover:border-primary/50 text-text-primary font-semibold text-xs hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={() => handleSave('Submitted')}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-semibold text-xs hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none shadow-md shadow-primary/10 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {loading ? 'Submitting...' : 'Submit Idea'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger animate-in shake duration-300 text-xs font-medium">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Core Concept Form */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle/40">
              <Info className="text-primary" size={18} />
              <h3 className="font-display font-bold text-sm text-text-primary">Core Concept</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Idea Title <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual Fest Volunteer Command Center" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Problem Statement <span className="text-danger">*</span></label>
                <textarea 
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What specific problem does this solve?" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Proposed Solution <span className="text-danger">*</span></label>
                <textarea 
                  rows={3}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe how your idea addresses the problem..." 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Value & Impact */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle/40">
              <TrendingUp className="text-primary" size={18} />
              <h3 className="font-display font-bold text-sm text-text-primary">Value & Impact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Target Audience</label>
                <input 
                  type="text" 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Who will benefit from this?" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Estimated Effort</label>
                <div className="relative">
                  <select 
                    value={effort} 
                    onChange={(e: any) => setEffort(e.target.value)}
                    className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary input-glow transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select range...</option>
                    <option value="low">Low (&lt; 1 week)</option>
                    <option value="medium">Medium (1-4 weeks)</option>
                    <option value="high">High (&gt; 4 weeks)</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Expected Impact Level</label>
                <div className="relative">
                  <select 
                    value={impact}
                    onChange={(e: any) => setImpact(e.target.value)}
                    className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary input-glow transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select impact...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Classification */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl">
            <h3 className="font-display font-bold text-sm text-text-primary mb-4">Classification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Department Category</label>
                <div className="relative">
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary input-glow transition-all appearance-none cursor-pointer"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="fest, sponsorship, content..." 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submission Guidelines Box */}
          <div className="bg-bg-elevated/30 border border-border-subtle/50 rounded-2xl p-5 text-xs text-text-secondary leading-relaxed shadow-md">
            <div className="flex items-center gap-2 font-semibold text-text-primary mb-3">
              <HelpCircle size={16} className="text-primary" />
              <span>Guidelines</span>
            </div>
            <ul className="list-disc pl-4 space-y-2 text-[11px] text-text-secondary/90">
              <li>Define the problem statement clearly.</li>
              <li>Outline concrete steps in the proposed solution.</li>
              <li>Estimated effort helps coordinators assign sprint sprints.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
