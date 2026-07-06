import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideasService } from '../services/ideas';
import { commentsService } from '../services/comments';
import { Idea, Comment } from '../types';
import { getDepartmentBadgeColor } from '../lib/colors';
import { CalendarDays, Share, Play, FileText, MessageSquare, Send, ThumbsUp, CheckSquare, AlertTriangle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

const mapStatusToDisplay = (status: Idea['status']): string => {
  switch (status) {
    case 'In Review':
      return 'Under Review';
    case 'Needs Collaboration':
      return 'Changes Requested';
    case 'In Implementation':
      return 'In Progress';
    default:
      return status; // 'Draft', 'Submitted', 'Approved', 'Completed', 'Rejected'
  }
};

export function IdeaDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setError(null);
        const fetchedIdea = await ideasService.getIdeaById(id);
        if (fetchedIdea) {
          setIdea(fetchedIdea);
        } else {
          setError('Idea not found.');
        }
      } catch (err: any) {
        console.error('IdeaDetails: Error loading idea:', err);
        setError(err.message || 'Failed to load idea details.');
      } finally {
        setLoading(false);
      }

      try {
        const fetchedComments = await commentsService.getCommentsForIdea(id);
        setComments(fetchedComments);
      } catch (commentErr) {
        console.error('IdeaDetails: Error loading comments:', commentErr);
      }
    };

    loadData();

    const unsubscribeIdeas = ideasService.subscribe(loadData);
    const unsubscribeComments = commentsService.subscribe(loadData);

    return () => {
      unsubscribeIdeas();
      unsubscribeComments();
    };
  }, [id, navigate]);

  const handleVote = async () => {
    if (!idea || !idea.id) return;
    try {
      const updatedIdea = await ideasService.voteIdea(idea.id);
      if (updatedIdea) setIdea(updatedIdea);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle vote.');
    }
  };

  const handleUpdateStatus = async (newStatus: Idea['status']) => {
    if (!idea || !idea.id) return;
    try {
      const updatedIdea = await ideasService.updateIdeaStatus(idea.id, newStatus);
      if (updatedIdea) setIdea(updatedIdea);
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !idea) return;

    await commentsService.addComment(idea.id, commentText.trim(), user);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteDraft = () => {
    setShowDeleteModal(true);
  };

  const executeDeleteDraft = async () => {
    if (!idea || !idea.id) return;
    try {
      await ideasService.deleteIdea(idea.id);
      navigate('/ideas');
    } catch (err: any) {
      console.error('IdeaDetails: Error deleting draft:', err);
    }
  };

  if (loading && !idea) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-12 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-text-primary">Failed to Load Proposal</h3>
          <p className="text-xs text-text-secondary/85 mt-1.5 leading-relaxed">{error || 'Proposal not found.'}</p>
        </div>
        <button 
          onClick={() => navigate('/ideas')}
          className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-primary-hover rounded-xl text-xs font-semibold hover-lift cursor-pointer focus:outline-none"
        >
          Back to My Ideas
        </button>
      </div>
    );
  }

  const isAuthor = user?.id === idea.author.id;
  const isDeptHead = user?.role === 'Department Head' && user?.departmentId === idea.departmentId;
  const isAdmin = user?.role === 'Administrator';
  
  // Department Heads (within their department) or Admins can review ideas
  const hasReviewPermission = isDeptHead || isAdmin;
  const canSubmitDraft = isAuthor && idea.status === 'Draft';

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${
              idea.status === 'Approved' || idea.status === 'Completed' || idea.status === 'In Implementation' ? 'bg-success/15 text-success border-success/20' :
              idea.status === 'In Review' || idea.status === 'Needs Collaboration' ? 'bg-warning/15 text-warning border-warning/20' :
              idea.status === 'Rejected' ? 'bg-danger/15 text-danger border-danger/20' :
              'bg-bg-elevated/70 border-border-subtle text-text-secondary'
            }`}>{mapStatusToDisplay(idea.status)}</span>
            <span className="text-text-secondary/70 text-[9px] font-mono tracking-widest">ID-{idea.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-text-primary tracking-tight mb-2.5 leading-snug">{idea.title}</h2>
          <div className="flex items-center gap-4 text-xs text-text-secondary/80">
            <div className="flex items-center gap-1.5">
              <img src={idea.author.avatar} alt={idea.author.name} className="w-5 h-5 rounded-full object-cover border border-border-subtle" />
              <span className="font-medium">{idea.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              <span>Submitted {idea.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-primary-hover rounded-xl text-xs font-semibold hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <Share size={14} /> {copied ? 'Copied Link!' : 'Share'}
          </button>
          
          {hasReviewPermission && (
            <div className="flex gap-2 flex-wrap">
              {/* Transition to Under Review if status is Submitted */}
              {idea.status === 'Submitted' && (
                <button 
                  onClick={() => handleUpdateStatus('In Review')}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className="animate-spin duration-1000" /> Start Review
                </button>
              )}

              {/* Approve / Changes Requested / Reject buttons if Under Review */}
              {(idea.status === 'In Review' || idea.status === 'Needs Collaboration') && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('Approved')}
                    className="px-3.5 py-1.5 bg-success text-white rounded-xl text-xs font-bold hover:bg-success/90 hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                  >
                    <CheckSquare size={13} /> Approve
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('Needs Collaboration')}
                    className="px-3.5 py-1.5 bg-warning text-white rounded-xl text-xs font-bold hover:bg-warning/90 hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                  >
                    Request Changes
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('Rejected')}
                    className="px-3.5 py-1.5 bg-danger text-white rounded-xl text-xs font-bold hover:bg-danger/90 hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </>
              )}

              {/* Move to In Progress if status is Approved */}
              {idea.status === 'Approved' && (
                <button 
                  onClick={() => handleUpdateStatus('In Implementation')}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                >
                  <Play size={13} /> Move to In Progress
                </button>
              )}

              {/* Mark Completed if status is In Progress */}
              {idea.status === 'In Implementation' && (
                <button 
                  onClick={() => handleUpdateStatus('Completed')}
                  className="px-3.5 py-1.5 bg-success text-white rounded-xl text-xs font-bold hover:bg-success/90 hover-lift transition-all shadow-md cursor-pointer focus:outline-none flex items-center gap-1.5"
                >
                  <CheckSquare size={13} /> Mark Completed
                </button>
              )}
            </div>
          )}

          {/* Junior Member / Author submit draft button */}
          {canSubmitDraft && (
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteDraft}
                className="px-4 py-2 bg-danger/10 border border-danger/20 hover:border-danger/40 text-danger rounded-xl text-xs font-bold hover-lift transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <Trash2 size={14} /> Delete Draft
              </button>
              <button 
                onClick={() => handleUpdateStatus('Submitted')}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/10 cursor-pointer focus:outline-none"
              >
                <Play size={14} /> Submit Idea
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Executive Summary */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-6 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base flex items-center gap-2 mb-4 text-text-primary">
              <FileText className="text-primary" size={18} /> Executive Summary
            </h3>
            <p className="text-xs text-text-secondary/90 leading-relaxed mb-6 whitespace-pre-wrap">
              {idea.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-bg-elevated/20 rounded-xl border border-border-subtle/50">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary/80 mb-1.5">Impact Level</div>
                <div className={`font-display font-extrabold text-base ${
                  idea.impact === 'High' ? 'text-success' :
                  idea.impact === 'Medium' ? 'text-warning' :
                  'text-text-secondary'
                }`}>{idea.impact}</div>
              </div>
              <div className="p-4 bg-bg-elevated/20 rounded-xl border border-border-subtle/50 flex flex-col justify-center">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary/80 mb-2">Reviewing Department</div>
                <div>
                  <span className={`px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${getDepartmentBadgeColor(idea.departmentName)}`}>
                    {idea.departmentName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Discussion comments section */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-6 glass-card shadow-xl">
            <h3 className="font-display font-bold text-base flex items-center gap-2 mb-4 text-text-primary">
              <MessageSquare className="text-primary" size={18} /> Discussion ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <div className="p-10 text-center text-text-secondary/80 text-xs border border-dashed border-border-subtle/60 rounded-xl mb-6">
                No discussion comments yet. Start the conversation below!
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 animate-in fade-in duration-300">
                    <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full border border-border-subtle object-cover shrink-0 mt-0.5" />
                    <div className="bg-bg-elevated/20 rounded-xl p-3 border border-border-subtle/40 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-text-primary">{comment.author.name}</span>
                        <span className="text-[9px] text-text-secondary/70">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-text-secondary/90 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleAddComment} className="flex gap-3 items-start">
              {user && (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-border-subtle object-cover shrink-0 mt-0.5" />
              )}
              <div className="flex-1 relative">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-bg-base/60 border border-border-strong/70 rounded-xl p-3 pr-11 text-xs text-text-primary placeholder:text-text-secondary/50 input-glow resize-none h-16"
                  placeholder="Add to the discussion... (Shift+Enter for new line)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  className="absolute bottom-2.5 right-2.5 p-1.5 text-primary hover:text-primary-hover hover:bg-primary-transparent rounded-lg transition-all cursor-pointer focus:outline-none"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Metadata info */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-border-subtle/30">Classification Details</h4>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-text-secondary mb-1">Owner Department</div>
                <div className="text-xs font-semibold text-text-primary">{idea.departmentName}</div>
              </div>
              
              <div>
                <div className="text-[10px] text-text-secondary mb-1">Community Feedback</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-mono text-base font-bold text-text-primary">{idea.votes}</span>
                  <button 
                    onClick={handleVote}
                    className="flex items-center gap-1.5 px-3.5 py-2 md:py-1 bg-primary-transparent hover:bg-primary/15 text-primary border border-primary/20 hover:border-primary/45 rounded-lg text-xs md:text-[10px] font-bold transition-all focus:outline-none cursor-pointer h-10 md:h-[28px]"
                  >
                    <ThumbsUp size={11} className="fill-current" /> Upvote
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-text-secondary mb-2">Metadata Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.length === 0 ? (
                    <span className="text-xs text-text-secondary">No tags</span>
                  ) : (
                    idea.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-bg-elevated/40 rounded-md border border-border-subtle text-[10px] text-text-secondary/90">{tag}</span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-text-secondary mb-2">Author details</div>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <img src={idea.author.avatar} alt={idea.author.name} className="w-7 h-7 rounded-full object-cover border border-border-subtle" />
                  <div>
                    <div className="font-semibold text-xs text-text-primary leading-none">{idea.author.name}</div>
                    <div className="text-[9px] text-text-secondary mt-1">{idea.author.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline details */}
          <div className="bg-bg-surface/50 border border-border-subtle/50 rounded-2xl p-5 glass-card shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-border-subtle/30">Implementation Timeline</h4>
            <div className="relative border-l border-border-subtle ml-2.5 space-y-6">
              <div className="relative pl-5">
                <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-success"></div>
                <div className="text-xs font-semibold text-text-primary">Idea Submitted</div>
                <div className="text-[9px] text-text-secondary/70 mt-0.5">{idea.createdAt === 'Just now' ? 'Today' : idea.createdAt}</div>
              </div>
              <div className="relative pl-5">
                <div className={`absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full ${
                  idea.status === 'Approved' || idea.status === 'In Implementation' || idea.status === 'Completed' ? 'bg-success' :
                  idea.status === 'Rejected' ? 'bg-danger' :
                  idea.status === 'Needs Collaboration' ? 'bg-warning' : 'bg-border-strong'
                }`}></div>
                <div className="text-xs font-semibold text-text-primary">Department Approval</div>
                <div className="text-[9px] text-text-secondary/70 mt-0.5">
                  {idea.status === 'Approved' || idea.status === 'In Implementation' || idea.status === 'Completed' ? 'Approved' :
                   idea.status === 'Rejected' ? 'Rejected' :
                   idea.status === 'Needs Collaboration' ? 'Changes Requested' : 'Pending Review'}
                </div>
              </div>
              <div className="relative pl-5">
                <div className={`absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full ${
                  idea.status === 'In Implementation' || idea.status === 'Completed' ? 'bg-primary animate-pulse' : 'bg-border-strong'
                }`}></div>
                <div className={`text-xs ${
                  idea.status === 'In Implementation' ? 'font-bold text-primary' : 'font-semibold text-text-primary'
                }`}>Implementation Sprint</div>
                <div className="text-[9px] text-text-secondary/70 mt-0.5">
                  {idea.status === 'In Implementation' ? 'In Progress' : 
                   idea.status === 'Completed' ? 'Completed' : 'Not started'}
                </div>
              </div>
              <div className={`relative pl-5 ${idea.status !== 'Completed' ? 'opacity-40' : ''}`}>
                <div className={`absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full ${
                  idea.status === 'Completed' ? 'bg-success' : 'bg-border-strong'
                }`}></div>
                <div className="text-xs font-semibold text-text-primary">Completed / Rolled Out</div>
                <div className="text-[9px] text-text-secondary/70 mt-0.5">
                  {idea.status === 'Completed' ? 'Today' : 'Est. End of Term'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-bg-surface border border-border-subtle rounded-2xl p-6 pb-8 glass-card shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-base text-text-primary mb-2">Delete Draft</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Are you sure you want to permanently delete this draft? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border-strong rounded-xl text-xs font-semibold hover:border-primary/50 hover-lift transition-colors cursor-pointer bg-bg-surface/50 text-text-primary focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteDraft}
                className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-danger/10 hover-lift cursor-pointer focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
