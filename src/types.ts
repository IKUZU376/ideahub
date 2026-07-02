export type View = 
  | 'dashboard'
  | 'submit'
  | 'my-ideas'
  | 'idea-details'
  | 'department'
  | 'admin'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  departmentId: string | null;
  departmentName: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  author: User;
  departmentId: string | null;
  departmentName: string;
  status: 'Draft' | 'Submitted' | 'In Review' | 'Needs Collaboration' | 'Approved' | 'In Implementation' | 'Completed' | 'Rejected';
  votes: number;
  createdAt: string;
  tags: string[];
  impact: 'High' | 'Medium' | 'Low';
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}
