import { Idea, User, Comment } from './types';

export const currentUser: User = {
  id: 'u1',
  name: 'Aarav Mehta',
  email: 'aarav@collegeclub.edu',
  avatar: 'https://i.pravatar.cc/150?u=aarav',
  role: 'Technical Department Head',
  departmentId: null,
  departmentName: 'Technical',
};

export const mockUsers: User[] = [
  currentUser,
  { id: 'u2', name: 'Nisha Rao', email: 'nisha@collegeclub.edu', avatar: 'https://i.pravatar.cc/150?u=nisha', role: 'Junior Member', departmentId: null, departmentName: 'Content' },
  { id: 'u3', name: 'Kabir Sethi', email: 'kabir@collegeclub.edu', avatar: 'https://i.pravatar.cc/150?u=kabir', role: 'Events Department Head', departmentId: null, departmentName: 'Events' },
  { id: 'u4', name: 'Meera Iyer', email: 'meera@collegeclub.edu', avatar: 'https://i.pravatar.cc/150?u=meera', role: 'Admin Coordinator', departmentId: null, departmentName: 'Administration' },
];

export const mockIdeas: Idea[] = [
  {
    id: 'id1',
    title: 'Inter-Department Freshers Mixer',
    description: 'A structured mixer where juniors rotate through mini workstations run by each department before choosing project teams.',
    author: mockUsers[1],
    departmentId: null,
    departmentName: 'Events',
    status: 'In Review',
    votes: 42,
    createdAt: '2 hrs ago',
    tags: ['Freshers', 'Onboarding', 'Collaboration'],
    impact: 'High',
  },
  {
    id: 'id2',
    title: 'Sponsor Outreach Tracker',
    description: 'Create a shared workflow for sponsorship leads, follow-ups, owner assignment, and approval notes.',
    author: currentUser,
    departmentId: null,
    departmentName: 'Public Relations',
    status: 'Approved',
    votes: 124,
    createdAt: '1 day ago',
    tags: ['Sponsorship', 'PR', 'Workflow'],
    impact: 'Medium',
  },
  {
    id: 'id3',
    title: 'Weekly Content Sprint Board',
    description: 'A repeatable sprint board for captions, posters, reels, approvals, and publishing deadlines.',
    author: mockUsers[2],
    departmentId: null,
    departmentName: 'Content',
    status: 'Draft',
    votes: 12,
    createdAt: '3 days ago',
    tags: ['Content', 'Planning'],
    impact: 'Low',
  },
  {
    id: 'id4',
    title: 'Annual Fest Volunteer Command Center',
    description: 'A live coordination board for volunteer assignments, venue issues, task handoffs, and admin approvals during the fest.',
    author: currentUser,
    departmentId: null,
    departmentName: 'Operations',
    status: 'In Implementation',
    votes: 89,
    createdAt: 'Oct 12, 2026',
    tags: ['Fest', 'Operations', 'Implementation'],
    impact: 'High',
  }
];

export const mockComments: Comment[] = [
  { id: 'c1', author: mockUsers[2], text: 'Events can own the venue desk, but we need Operations tagged for runner assignments.', createdAt: '2 days ago' },
  { id: 'c2', author: currentUser, text: 'Agreed. I added Operations as the implementation lead and kept PR as a collaborator for announcements.', createdAt: '1 day ago' }
];
