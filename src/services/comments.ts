import { Comment, User } from '../types';
import { supabase } from '../lib/supabase';

const commentListeners = new Set<() => void>();

const notifyListeners = () => {
  commentListeners.forEach(listener => {
    try {
      listener();
    } catch (err) {
      console.error('commentsService: Listener error:', err);
    }
  });
};

const mapDbRoleToFrontend = (dbRole: string): string => {
  switch (dbRole) {
    case 'administrator':
      return 'Administrator';
    case 'department_head':
      return 'Department Head';
    case 'junior_member':
    default:
      return 'Junior Member';
  }
};

const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Just now';
  }
};

export const commentsService = {
  getCommentsForIdea: async (ideaId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('idea_comments')
      .select('*, author:profiles(*)')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('commentsService: Error fetching comments:', error);
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      author: {
        id: row.author?.id || row.author_id || '',
        name: row.author?.full_name || 'Member',
        email: row.author?.email || '',
        avatar: row.author?.avatar_url || `https://i.pravatar.cc/150?u=${row.author_id}`,
        role: mapDbRoleToFrontend(row.author?.role || 'junior_member'),
        departmentId: null,
        departmentName: 'Technical',
      },
      text: row.text,
      createdAt: formatRelativeTime(row.created_at),
    }));
  },

  addComment: async (ideaId: string, text: string, author: User): Promise<Comment> => {
    const { data, error } = await supabase
      .from('idea_comments')
      .insert({
        idea_id: ideaId,
        author_id: author.id,
        text,
      })
      .select('*, author:profiles(*)')
      .single();

    if (error) {
      console.error('commentsService: Error adding comment:', error);
      throw error;
    }

    const newComment = {
      id: data.id,
      author: {
        id: data.author?.id || data.author_id || '',
        name: data.author?.full_name || 'Member',
        email: data.author?.email || '',
        avatar: data.author?.avatar_url || `https://i.pravatar.cc/150?u=${data.author_id}`,
        role: mapDbRoleToFrontend(data.author?.role || 'junior_member'),
        departmentId: null,
        departmentName: 'Technical',
      },
      text: data.text,
      createdAt: formatRelativeTime(data.created_at),
    };

    notifyListeners();
    return newComment;
  },

  subscribe: (listener: () => void): (() => void) => {
    commentListeners.add(listener);
    return () => {
      commentListeners.delete(listener);
    };
  }
};

// Subscribe to Supabase Realtime changes for comments
supabase
  .channel('comments-realtime-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'idea_comments' },
    (payload) => {
      console.log('commentsService: Realtime update received on comments table:', payload);
      notifyListeners();
    }
  )
  .subscribe();
