import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjnulvpjyxtsagbvbyrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbnVsdnBqeXh0c2FnYnZieXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mzc4OTcsImV4cCI6MjA5ODQxMzg5N30.95wfAyCEmh1zPPDDSLejz8t3VY1BuQlZuvjUl6Hnbm8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('--- DIAGNOSIS START ---');
  
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*');
    
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else {
    console.log('Profiles currently in DB:');
    console.table(profiles.map(p => ({
      id: p.id,
      email: p.email,
      name: p.full_name,
      role: p.role
    })));
  }
  console.log('--- DIAGNOSIS END ---');
}

diagnose();
