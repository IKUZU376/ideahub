import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { profilesService } from '../services/profiles';
import { Info, TrendingUp, UploadCloud, Save, Send, AlertCircle } from 'lucide-react';

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

      await ideasService.createIdea({
        title: title.trim(),
        description,
        author: user,
        departmentId: null,
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-text-secondary text-xs uppercase tracking-wider font-semibold">
          <span className="text-primary font-bold">Club Workflow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-border-strong"></span>
          <span>Stage: Ideation</span>
        </div>
        <h2 className="font-display text-4xl font-extrabold text-text-primary tracking-tight">Submit a New Idea</h2>
        <p className="text-text-secondary text-base max-w-2xl leading-relaxed">Capture the problem, departments involved, and implementation path so heads and admins can move it forward cleanly.</p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger animate-in shake duration-300">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Core Concept Form */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-6 glass-card shadow-xl">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border-subtle/40">
              <Info className="text-primary" size={20} />
              <h3 className="font-display font-bold text-base text-text-primary">Core Concept</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Idea Title <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual Fest Volunteer Command Center" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Problem Statement <span className="text-danger">*</span></label>
                <textarea 
                  rows={3}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What specific problem does this solve?" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 input-glow transition-all resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Proposed Solution <span className="text-danger">*</span></label>
                <textarea 
                  rows={4}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe how your idea addresses the problem..." 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 input-glow transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Value & Impact */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-6 glass-card shadow-xl">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-border-subtle/40">
              <TrendingUp className="text-primary" size={20} />
              <h3 className="font-display font-bold text-base text-text-primary">Value & Impact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Target Audience</label>
                <input 
                  type="text" 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Who will benefit from this?" 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Estimated Effort</label>
                <div className="relative">
                  <select 
                    value={effort} 
                    onChange={(e: any) => setEffort(e.target.value)}
                    className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary input-glow transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select range...</option>
                    <option value="low">Low (&lt; 1 week)</option>
                    <option value="medium">Medium (1-4 weeks)</option>
                    <option value="high">High (&gt; 4 weeks)</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Expected Impact Level</label>
                <div className="relative">
                  <select 
                    value={impact}
                    onChange={(e: any) => setImpact(e.target.value)}
                    className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2.5 text-sm text-text-primary input-glow transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select impact...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Classification */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-6 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base text-text-primary mb-4">Classification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-3">Department Category</label>
                <div className="flex flex-col gap-2">
                  {departments.map(dept => (
                    <label 
                      key={dept} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDept === dept 
                          ? 'border-primary bg-primary-transparent text-text-primary' 
                          : 'border-border-subtle/70 hover:bg-bg-elevated/40 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="dept" 
                        value={dept}
                        checked={selectedDept === dept}
                        onChange={() => setSelectedDept(dept)}
                        className="w-4 h-4 text-primary bg-bg-base border-border-strong focus:ring-primary focus:ring-offset-bg-surface cursor-pointer" 
                      />
                      <span className="text-xs font-semibold">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary/80 mb-2">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="fest, sponsorship, content..." 
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 input-glow transition-all"
                />
              </div>
            </div>
          </div>

          {/* Upload panel */}
          <div className="bg-bg-surface/30 border-2 border-dashed border-border-strong/80 rounded-2xl p-6 hover:border-primary-hover hover:bg-primary-transparent transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-48 shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary-transparent transition-all mb-3 shadow-md">
              <UploadCloud size={22} />
            </div>
            <h4 className="font-semibold text-xs text-text-primary mb-1">Upload Assets</h4>
            <p className="text-[10px] text-text-secondary/80">Drag & drop files or click to browse</p>
            <p className="text-[9px] text-text-secondary/60 mt-1">Max size 10MB (PDF, PNG, JPG)</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-5 border-t border-border-subtle/50 mt-4">
        <button 
          onClick={() => handleSave('Draft')}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl border border-border-strong hover:border-primary/50 text-text-primary font-semibold text-xs hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border border-primary/20 border-t-primary rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
        <button 
          onClick={() => handleSave('Submitted')}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-semibold text-xs hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none shadow-md shadow-primary/10 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {loading ? 'Submitting...' : 'Submit Idea'}
        </button>
      </div>
    </div>
  );
}
