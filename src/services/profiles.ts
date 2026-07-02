import { User } from '../types';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/auth';

const profileListeners = new Set<() => void>();

const notifyListeners = () => {
  profileListeners.forEach(listener => {
    try {
      listener();
    } catch (err) {
      console.error('profilesService: Listener error:', err);
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

const mapFrontendRoleToDb = (frontendRole: string): string => {
  switch (frontendRole) {
    case 'Administrator':
      return 'administrator';
    case 'Department Head':
      return 'department_head';
    case 'Junior Member':
    default:
      return 'junior_member';
  }
};

const mapDbProfileToFrontendUser = (row: any): User => {
  const deptMember = row.department_members?.[0];
  return {
    id: row.id,
    name: row.full_name || 'Member',
    email: row.email || '',
    avatar: row.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
    role: mapDbRoleToFrontend(row.role || 'junior_member'),
    departmentId: deptMember?.department_id || null,
    departmentName: deptMember?.departments?.name || 'None',
  };
};

export const profilesService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        department_members(
          department_id,
          departments(
            name
          )
        )
      `)
      .order('full_name');

    if (error) {
      console.error('profilesService: Failed to fetch users:', error);
      throw error;
    }

    return (data || []).map(mapDbProfileToFrontendUser);
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        department_members(
          department_id,
          departments(
            name
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('profilesService: Failed to fetch user by ID:', error);
      throw error;
    }

    return data ? mapDbProfileToFrontendUser(data) : undefined;
  },

  updateProfile: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) {
      dbUpdates.full_name = updates.name;
    }
    if (updates.role !== undefined) {
      dbUpdates.role = mapFrontendRoleToDb(updates.role);
    }
    if (updates.avatar !== undefined) {
      dbUpdates.avatar_url = updates.avatar;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('profilesService: Error in updateProfile:', error);
      throw error;
    }

    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      auth.updateActiveUser(updates);
    }

    notifyListeners();
    return profilesService.getUserById(id);
  },

  updateUserRole: async (userId: string, newRole: string): Promise<void> => {
    const currentAdminUser = auth.getCurrentUser();
    if (!currentAdminUser) throw new Error('Not authenticated.');

    // Safety Rule 2: Prevent users changing their own Administrator status
    if (userId === currentAdminUser.id) {
      throw new Error('You cannot change your own Administrator status.');
    }

    const dbRole = mapFrontendRoleToDb(newRole);

    // Safety Rule 1: Prevent removing the last Administrator
    if (dbRole !== 'administrator') {
      const { data: adminProfiles, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'administrator');

      if (countError) throw countError;

      const isTargetAdmin = adminProfiles?.some(p => p.id === userId);
      if (isTargetAdmin && (adminProfiles?.length || 0) <= 1) {
        throw new Error('Cannot remove the last Administrator. There must be at least one active administrator.');
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: dbRole })
      .eq('id', userId);

    if (error) {
      console.error('profilesService: Error updating user role:', error);
      throw error;
    }

    // Also update is_head flag in department_members to keep in sync
    const isHead = dbRole === 'department_head';
    try {
      await supabase
        .from('department_members')
        .update({ is_head: isHead })
        .eq('profile_id', userId);
    } catch (syncErr) {
      console.error('profilesService: Error syncing is_head flag on role update:', syncErr);
    }

    // Refresh current user if they were modified (updates navigation/permissions automatically)
    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      auth.updateActiveUser({ role: newRole });
    }

    notifyListeners();
  },

  updateUserDepartment: async (userId: string, departmentId: string | null): Promise<void> => {
    // 1. Delete existing department memberships
    const { error: deleteError } = await supabase
      .from('department_members')
      .delete()
      .eq('profile_id', userId);

    if (deleteError) {
      console.error('profilesService: Error deleting department member record:', deleteError);
      throw deleteError;
    }

    let deptName = 'None';

    // 2. Insert new department membership if departmentId is selected
    if (departmentId) {
      const { data: deptData, error: deptFetchError } = await supabase
        .from('departments')
        .select('name')
        .eq('id', departmentId)
        .maybeSingle();

      if (deptFetchError) throw deptFetchError;
      if (deptData) {
        deptName = deptData.name;
      }

      // Fetch user profile to check if they are a department head
      const userProfile = await profilesService.getUserById(userId);
      const isHead = userProfile?.role === 'Department Head';

      const { error: insertError } = await supabase
        .from('department_members')
        .insert({
          profile_id: userId,
          department_id: departmentId,
          is_head: isHead
        });

      if (insertError) {
        console.error('profilesService: Error inserting department member record:', insertError);
        throw insertError;
      }
    }

    // Refresh current user if they were modified (updates navigation/permissions automatically)
    const currentUser = auth.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      auth.updateActiveUser({ departmentId, departmentName: deptName });
    }

    notifyListeners();
  },

  getDepartments: async (): Promise<{ id: string; name: string }[]> => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('profilesService: Failed to fetch departments:', error);
      throw error;
    }

    return data || [];
  },

  inviteUser: async (name: string, email: string, role: string, departmentName: string): Promise<User> => {
    const id = window.crypto.randomUUID();
    const dbRole = mapFrontendRoleToDb(role);

    const { error: insertError } = await supabase.from('profiles').insert({
      id,
      email,
      full_name: name,
      avatar_url: `https://i.pravatar.cc/150?u=${name.replace(/\s+/g, '')}`,
      role: dbRole,
    });

    if (insertError) {
      console.error('profilesService: Error inviting user profile:', insertError);
      throw insertError;
    }

    let resolvedDeptId: string | null = null;
    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .maybeSingle();

    if (deptData) {
      resolvedDeptId = deptData.id;
      await supabase.from('department_members').insert({
        profile_id: id,
        department_id: resolvedDeptId,
      });
    }

    const newUser = {
      id,
      name,
      email,
      avatar: `https://i.pravatar.cc/150?u=${name.replace(/\s+/g, '')}`,
      role,
      departmentId: resolvedDeptId,
      departmentName,
    };

    notifyListeners();
    return newUser;
  },

  subscribe: (listener: () => void): (() => void) => {
    profileListeners.add(listener);
    return () => {
      profileListeners.delete(listener);
    };
  }
};
