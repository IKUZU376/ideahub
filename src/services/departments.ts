import { mockUsers } from '../data';
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
    return ['Technical', 'Events', 'Content', 'Public Relations', 'Operations'];
  },
  getDepartmentDetails: async (departmentName: string): Promise<DepartmentDetails> => {
    return {
      name: departmentName,
      contributorsCount: 18,
      blockedCount: 3,
      implementedCount: 11,
      totalCount: 24,
      topContributors: mockUsers.slice(0, 3),
    };
  }
};
