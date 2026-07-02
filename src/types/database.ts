export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      department_members: {
        Row: {
          id: string
          profile_id: string
          department_id: string
          is_head: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          department_id: string
          is_head?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          department_id?: string
          is_head?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          title: string
          description: string
          author_id: string
          department_id: string | null
          status: Database['public']['Enums']['idea_status']
          votes_count: number
          impact: Database['public']['Enums']['idea_impact']
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          author_id: string
          department_id?: string | null
          status?: Database['public']['Enums']['idea_status']
          votes_count?: number
          impact?: Database['public']['Enums']['idea_impact']
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          author_id?: string
          department_id?: string | null
          status?: Database['public']['Enums']['idea_status']
          votes_count?: number
          impact?: Database['public']['Enums']['idea_impact']
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      idea_collaborators: {
        Row: {
          id: string
          idea_id: string
          profile_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          profile_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          profile_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      idea_votes: {
        Row: {
          id: string
          idea_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          profile_id?: string
          created_at?: string
        }
      }
      idea_comments: {
        Row: {
          id: string
          idea_id: string
          author_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          author_id: string
          text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          author_id?: string
          text?: string
          created_at?: string
          updated_at?: string
        }
      }
      idea_status_history: {
        Row: {
          id: string
          idea_id: string
          status: Database['public']['Enums']['idea_status']
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          status: Database['public']['Enums']['idea_status']
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          status?: Database['public']['Enums']['idea_status']
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['user_role']
      }
      is_department_head: {
        Args: {
          dept_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'junior_member' | 'department_head' | 'administrator'
      idea_status:
        | 'Draft'
        | 'Submitted'
        | 'In Review'
        | 'Needs Collaboration'
        | 'Approved'
        | 'In Implementation'
        | 'Completed'
      idea_impact: 'Low' | 'Medium' | 'High'
    }
  }
}
