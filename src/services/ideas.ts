import { Idea } from '../types';
import { supabase } from '../lib/supabase';

const ideaListeners = new Set<() => void>();

const notifyListeners = () => {
  ideaListeners.forEach(listener => {
    try {
      listener();
    } catch (err) {
      console.error('ideasService: Error in event listener:', err);
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

const formatRelativeTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) return `${diffHrs}h ago`;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (err) {
    return 'Just now';
  }
};

const mapDbIdeaToFrontend = (row: any): Idea => {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    author: {
      id: row.author?.id || row.author_id || '',
      name: row.author?.full_name || 'Member',
      email: row.author?.email || '',
      avatar: row.author?.avatar_url || `https://i.pravatar.cc/150?u=${row.author_id}`,
      role: mapDbRoleToFrontend(row.author?.role || 'junior_member'),
      departmentId: null,
      departmentName: 'Technical',
    },
    departmentId: row.department_id,
    departmentName: row.department?.name || 'Technical',
    status: row.status,
    votes: row.votes_count || 0,
    createdAt: formatRelativeTime(row.created_at),
    tags: row.tags || [],
    impact: row.impact || 'Medium',
  };
};

const getDepartmentIdByName = async (name: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (error || !data) {
      console.error('ideasService: Failed to resolve department by name:', name, error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error('ideasService: Exception in getDepartmentIdByName:', err);
    return null;
  }
};

export const ideasService = {
  getIdeas: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    statusIn?: string[];
    authorId?: string;
    departmentId?: string;
    department?: string;
  }): Promise<Idea[]> => {
    let query = supabase
      .from('ideas')
      .select(`
        *,
        department:departments(name),
        author:profiles(*)
      `);

    if (options?.authorId) {
      query = query.eq('author_id', options.authorId);
    }
    
    if (options?.departmentId) {
      query = query.eq('department_id', options.departmentId);
    } else if (options?.department) {
      const deptId = await getDepartmentIdByName(options.department);
      if (deptId) {
        query = query.eq('department_id', deptId);
      } else {
        return [];
      }
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.statusIn) {
      query = query.in('status', options.statusIn);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      const start = options.offset || 0;
      query = query.range(start, start + options.limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error('ideasService: Error fetching ideas:', error);
      throw error;
    }

    return (data || []).map(mapDbIdeaToFrontend);
  },

  getIdeaById: async (id: string): Promise<Idea | undefined> => {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        department:departments(name),
        author:profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('ideasService: Error fetching idea by ID:', error);
      throw error;
    }

    return data ? mapDbIdeaToFrontend(data) : undefined;
  },

  createIdea: async (idea: Omit<Idea, 'id' | 'votes' | 'createdAt'>): Promise<Idea> => {
    // Resolve departmentId
    let departmentId = idea.departmentId;
    if (!departmentId) {
      departmentId = await getDepartmentIdByName(idea.departmentName);
    }
    if (!departmentId) {
      throw new Error(`Department '${idea.departmentName}' not found.`);
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        title: idea.title,
        description: idea.description,
        author_id: idea.author.id,
        department_id: departmentId,
        status: idea.status,
        impact: idea.impact,
        tags: idea.tags,
      })
      .select(`
        *,
        department:departments(name),
        author:profiles(*)
      `)
      .single();

    if (error) {
      console.error('ideasService: Error creating idea:', error);
      throw error;
    }

    const newIdea = mapDbIdeaToFrontend(data);
    notifyListeners();
    return newIdea;
  },

  updateIdeaStatus: async (id: string, status: Idea['status']): Promise<Idea | undefined> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('ideas')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        department:departments(name),
        author:profiles(*)
      `)
      .single();

    if (error) {
      console.error('ideasService: Error updating idea status:', error);
      throw error;
    }

    try {
      if (currentUser) {
        await supabase.from('idea_status_history').insert({
          idea_id: id,
          status,
          changed_by: currentUser.id,
          notes: `Status changed to ${status}`,
        });
      }
    } catch (historyErr) {
      console.error('ideasService: Failed to insert status audit history:', historyErr);
    }

    const updatedIdea = mapDbIdeaToFrontend(data);
    notifyListeners();
    return updatedIdea;
  },

  voteIdea: async (id: string): Promise<Idea | undefined> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('You must be logged in to vote.');
    }

    const { data: existingVote, error: checkError } = await supabase
      .from('idea_votes')
      .select('id')
      .eq('idea_id', id)
      .eq('profile_id', currentUser.id)
      .maybeSingle();

    if (checkError) {
      console.error('ideasService: Error checking existing vote:', checkError);
      throw checkError;
    }

    if (existingVote) {
      const { error: deleteError } = await supabase
        .from('idea_votes')
        .delete()
        .eq('id', existingVote.id);

      if (deleteError) {
        console.error('ideasService: Error deleting vote record:', deleteError);
        throw deleteError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('idea_votes')
        .insert({
          idea_id: id,
          profile_id: currentUser.id,
        });

      if (insertError) {
        console.error('ideasService: Error inserting vote record:', insertError);
        throw insertError;
      }
    }

    const updatedIdea = await ideasService.getIdeaById(id);
    notifyListeners();
    return updatedIdea;
  },

  deleteIdea: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('ideasService: Error deleting idea:', error);
      throw error;
    }

    notifyListeners();
  },

  getStats: async (): Promise<{ total: number; activeReviews: number; implemented: number; collaboration: number }> => {
    try {
      const [totalRes, activeRes, implRes, collabRes] = await Promise.all([
        supabase.from('ideas').select('*', { count: 'exact', head: true }),
        supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'In Review'),
        supabase.from('ideas').select('*', { count: 'exact', head: true }).in('status', ['In Implementation', 'Completed']),
        supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'Needs Collaboration')
      ]);

      return {
        total: totalRes.count || 0,
        activeReviews: activeRes.count || 0,
        implemented: implRes.count || 0,
        collaboration: collabRes.count || 0,
      };
    } catch (err) {
      console.error('ideasService: Error fetching stats:', err);
      return { total: 0, activeReviews: 0, implemented: 0, collaboration: 0 };
    }
  },

  getIdeasCounts: async (authorId?: string): Promise<{ all: number, review: number, approved: number, implementation: number, draft: number }> => {
    try {
      let qAll = supabase.from('ideas').select('*', { count: 'exact', head: true });
      let qReview = supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'In Review');
      let qApproved = supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
      let qImpl = supabase.from('ideas').select('*', { count: 'exact', head: true }).in('status', ['In Implementation', 'Completed']);
      let qDraft = supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'Draft');

      if (authorId) {
        qAll = qAll.eq('author_id', authorId);
        qReview = qReview.eq('author_id', authorId);
        qApproved = qApproved.eq('author_id', authorId);
        qImpl = qImpl.eq('author_id', authorId);
        qDraft = qDraft.eq('author_id', authorId);
      }

      const [allRes, reviewRes, approvedRes, implRes, draftRes] = await Promise.all([
        qAll, qReview, qApproved, qImpl, qDraft
      ]);

      return {
        all: allRes.count || 0,
        review: reviewRes.count || 0,
        approved: approvedRes.count || 0,
        implementation: implRes.count || 0,
        draft: draftRes.count || 0,
      };
    } catch (err) {
      console.error('ideasService: Error fetching ideas counts:', err);
      return { all: 0, review: 0, approved: 0, implementation: 0, draft: 0 };
    }
  },

  subscribe: (listener: () => void): (() => void) => {
    ideaListeners.add(listener);
    return () => {
      ideaListeners.delete(listener);
    };
  }
};

// Subscribe to Supabase Realtime changes for ideas and votes
supabase
  .channel('ideas-realtime-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'ideas' },
    (payload) => {
      console.log('ideasService: Realtime update received on ideas table:', payload);
      notifyListeners();
    }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'idea_votes' },
    (payload) => {
      console.log('ideasService: Realtime update received on idea_votes table:', payload);
      notifyListeners();
    }
  )
  .subscribe((status) => {
    console.log('ideasService: Realtime subscription status:', status);
  });
