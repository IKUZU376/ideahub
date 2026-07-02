import { User } from '../types';
import { supabase } from './supabase';

console.log('auth.ts: Initializing module');

let activeUser: User | null = null;
let initialized = false;

const hasLocalSession = (): boolean => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth-token') || key.startsWith('sb-'))) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          return !!(parsed && (parsed.access_token || parsed.user || parsed.currentSession));
        }
      }
    }
  } catch (e) {
    console.error('auth.ts: Error checking local storage session:', e);
  }
  return false;
};

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

const ADMIN_EMAILS = [
  // Add your email address here to be automatically promoted to Administrator
  'saumitrap33@gmail.com',
];

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

    const isExplicitAdmin = supabaseUser.email && ADMIN_EMAILS.includes(supabaseUser.email.toLowerCase());

    if (!profile) {
      console.log('auth.ts: No profile found. Creating public.profiles row...');
      
      // Count existing profiles to see if this is the first one
      let defaultRole = 'junior_member';
      try {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && count === 0) {
          defaultRole = 'administrator';
          console.log('auth.ts: First user detected. Auto-assigning administrator role.');
        }
      } catch (err) {
        console.error('auth.ts: Error checking user count:', err);
      }

      if (isExplicitAdmin) {
        defaultRole = 'administrator';
        console.log('auth.ts: Auto-assigning administrator role from ADMIN_EMAILS list.');
      }

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
    
    // Promote user if they are in the explicit admin list but not marked as admin in DB yet
    if (isExplicitAdmin && profile.role !== 'administrator') {
      console.log('auth.ts: Promoting existing user to administrator via ADMIN_EMAILS config.');
      await supabase
        .from('profiles')
        .update({ role: 'administrator' })
        .eq('id', supabaseUser.id);
      return { role: 'administrator' };
    }

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
      initialized = true;
    } else {
      activeUser = null;
      if (!hasLocalSession() || initialized) {
        initialized = true;
      }
    }
  } catch (err) {
    console.error('auth.ts: Error in handleAuthUserChange:', err);
    activeUser = null;
    initialized = true;
  } finally {
    console.log('auth.ts: Module initialized status:', initialized, 'Active user email:', activeUser?.email || 'None');
    if (initialized || activeUser) {
      authListeners.forEach(listener => {
        try {
          listener(activeUser);
        } catch (listenerErr) {
          console.error('auth.ts: Error in auth listener call:', listenerErr);
        }
      });
    }
  }
};

let sessionRestorePromise: Promise<void> | null = null;

// Handle initial session restoration explicitly on startup
const initializeSession = () => {
  if (sessionRestorePromise) return sessionRestorePromise;
  
  sessionRestorePromise = (async () => {
    console.log('auth.ts: initializeSession check starting...');
    let sessionFound = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('auth.ts: getSession completed. Session found:', !!session);
      sessionFound = !!session;
      await handleAuthUserChange(session?.user || null);
    } catch (err) {
      console.error('auth.ts: Failed to restore initial session:', err);
      await handleAuthUserChange(null);
    } finally {
      const isExchanging = typeof window !== 'undefined' && window.location.search.includes('code=');
      if (!initialized && !sessionFound && !isExchanging) {
        console.log('auth.ts: Session check completed. Forcing initialized to true.');
        initialized = true;
        authListeners.forEach(listener => listener(activeUser));
      }
    }
  })();
  
  return sessionRestorePromise;
};

initializeSession();

// Fallback safety timeout: If session check is completely blocked, force initialization to prevent page hangs.
setTimeout(() => {
  if (!initialized) {
    console.warn('auth.ts: Initialization timeout (2.5s) reached. Forcing session restore resolution.');
    initialized = true;
    authListeners.forEach(listener => listener(activeUser));
  }
}, 2500);

// Listen to Supabase Auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('auth.ts: onAuthStateChange event fired:', event);
  
  if (sessionRestorePromise) {
    await sessionRestorePromise;
  }
  
  if (event !== 'INITIAL_SESSION') {
    await handleAuthUserChange(session?.user || null);
  }
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
