import { User } from '../types';
import { supabase } from './supabase';

console.log('auth.ts: Initializing module');

let activeUser: User | null = null;
let initialized = false;

const authListeners = new Set<(user: User | null) => void>();

// Helper to map DB role to UI role
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

// Check if a profile exists, if not create it, and return the profile role
const ensureProfileExists = async (supabaseUser: any): Promise<{ role: string }> => {
  try {
    console.log('auth.ts: Querying user profile for id:', supabaseUser.id);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('auth.ts: Error fetching user profile:', error);
      return { role: 'junior_member' };
    }

    if (!profile) {
      console.log('auth.ts: No profile found. Creating public.profiles row...');
      const defaultRole = 'junior_member';
      const nowString = new Date().toISOString();
      const { error: insertError } = await supabase.from('profiles').insert({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Member',
        avatar_url: supabaseUser.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${supabaseUser.id}`,
        role: defaultRole,
        created_at: nowString,
        updated_at: nowString,
      });

      if (insertError) {
        console.error('auth.ts: Error inserting user profile:', insertError);
      }
      return { role: defaultRole };
    }

    console.log('auth.ts: Found profile role:', profile.role);
    return { role: profile.role };
  } catch (err) {
    console.error('auth.ts: Unhandled exception checking user profile:', err);
    return { role: 'junior_member' };
  }
};

// Query the user's department ID and name from Supabase tables
const getUserDepartmentDetails = async (userId: string): Promise<{ id: string | null; name: string }> => {
  try {
    const { data, error } = await supabase
      .from('department_members')
      .select('department_id, departments(name)')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error || !data) {
      // Fallback: Resolve 'TECHNICAL' department ID
      const { data: techDept } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'TECHNICAL')
        .maybeSingle();
      return { id: techDept?.id || null, name: 'TECHNICAL' };
    }
    
    return {
      id: data.department_id,
      name: (data.departments as any)?.name || 'Technical'
    };
  } catch (err) {
    console.error('auth.ts: Failed to get user department details:', err);
    return { id: null, name: 'Technical' };
  }
};

const handleAuthUserChange = async (supabaseUser: any) => {
  console.log('auth.ts: handleAuthUserChange event triggered. User present:', !!supabaseUser);
  try {
    if (supabaseUser) {
      const { role } = await ensureProfileExists(supabaseUser);
      const deptDetails = await getUserDepartmentDetails(supabaseUser.id);
      
      activeUser = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Member',
        email: supabaseUser.email || '',
        avatar: supabaseUser.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${supabaseUser.id}`,
        role: mapDbRoleToFrontend(role),
        departmentId: deptDetails.id,
        departmentName: deptDetails.name,
      };
    } else {
      activeUser = null;
    }
  } catch (err) {
    console.error('auth.ts: Error in handleAuthUserChange:', err);
    activeUser = null;
  } finally {
    initialized = true;
    console.log('auth.ts: Module fully initialized. Active user email:', activeUser?.email || 'None');
    authListeners.forEach(listener => {
      try {
        listener(activeUser);
      } catch (listenerErr) {
        console.error('auth.ts: Error in auth listener call:', listenerErr);
      }
    });
  }
};

// Handle initial session restoration explicitly on startup
const initializeSession = async () => {
  console.log('auth.ts: initializeSession check starting...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('auth.ts: getSession completed. Session found:', !!session);
    await handleAuthUserChange(session?.user || null);
  } catch (err) {
    console.error('auth.ts: Failed to restore initial session:', err);
    await handleAuthUserChange(null);
  }
};

initializeSession();

// Fallback safety timeout: If session check is completely blocked, force initialization to prevent page hangs.
setTimeout(() => {
  if (!initialized) {
    console.warn('auth.ts: Initialization timeout (2.5s) reached. Forcing session restore resolution.');
    handleAuthUserChange(null);
  }
}, 2500);

// Listen to Supabase Auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('auth.ts: onAuthStateChange event fired:', event);
  await handleAuthUserChange(session?.user || null);
});

export const auth = {
  getCurrentUser: (): User | null => {
    return activeUser;
  },
  isInitialized: (): boolean => {
    return initialized;
  },
  loginWithGoogle: async (): Promise<void> => {
    console.log('auth.ts: Triggering Google OAuth flow');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      }
    });
    if (error) throw error;
  },
  logout: async (): Promise<void> => {
    console.log('auth.ts: Triggering logout');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    activeUser = null;
    authListeners.forEach(listener => listener(activeUser));
  },
  updateActiveUser: (updates: Partial<User>): void => {
    if (activeUser) {
      activeUser = { ...activeUser, ...updates };
      authListeners.forEach(listener => listener(activeUser));
    }
  },
  subscribe: (listener: (user: User | null) => void): (() => void) => {
    authListeners.add(listener);
    listener(activeUser);
    return () => {
      authListeners.delete(listener);
    };
  }
};
