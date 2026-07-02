import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface DepartmentDetails {
  name: string;
  contributorsCount: number;
  blockedCount: number;
  implementedCount: number;
  totalCount: number;
  topContributors: User[];
}

export const departmentsService = {
  getDepartments: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('departments')
      .select('name')
      .order('name');
    if (error) {
      console.error('departmentsService: Error getting departments:', error);
      throw error;
    }
    return (data || []).map(d => d.name);
  },
  
  getDepartmentDetails: async (departmentName: string): Promise<DepartmentDetails> => {
    // 1. Fetch department ID by name
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .maybeSingle();

    if (deptError) {
      console.error('departmentsService: Error fetching department ID:', deptError);
      throw deptError;
    }
    if (!deptData) {
      throw new Error(`Department ${departmentName} not found`);
    }
    const deptId = deptData.id;

    // 2. Fetch all ideas with department_id
    const { data: ideasData, error: ideasError } = await supabase
      .from('ideas')
      .select('id, status, author_id, department_id');

    if (ideasError) {
      console.error('departmentsService: Error fetching department ideas:', ideasError);
      throw ideasError;
    }

    const deptIdeas = (ideasData || []).filter((idea: any) => idea.department_id === deptId);
    
    const totalCount = deptIdeas.length;
    const implementedCount = deptIdeas.filter((i: any) => i.status === 'Completed' || i.status === 'In Implementation').length;
    const blockedCount = deptIdeas.filter((i: any) => i.status === 'Changes Requested' || i.status === 'Rejected').length;
    
    const uniqueAuthors = new Set(deptIdeas.map((i: any) => i.author_id));
    const contributorsCount = uniqueAuthors.size;

    // 3. Fetch top contributors from department members
    const { data: membersData, error: membersError } = await supabase
      .from('department_members')
      .select(`
        profile_id,
        profiles (
          id,
          full_name,
          email,
          avatar_url,
          role
        )
      `)
      .eq('department_id', deptId)
      .limit(3);

    if (membersError) {
      console.error('departmentsService: Error fetching department members:', membersError);
      throw membersError;
    }

    const topContributors: User[] = (membersData || []).map((m: any) => {
      const p = m.profiles;
      return {
        id: p.id,
        name: p.full_name || 'Member',
        email: p.email || '',
        avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
        role: p.role === 'administrator' ? 'Administrator' : p.role === 'department_head' ? 'Department Head' : 'Junior Member',
        departmentId: deptId,
        departmentName: departmentName
      };
    });

    return {
      name: departmentName,
      contributorsCount,
      blockedCount,
      implementedCount,
      totalCount,
      topContributors
    };
  }
};
