
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwybtedqtmwtusuowhab.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eWJ0ZWRxdG13dHVzdW93aGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjYzNDMsImV4cCI6MjA1NjEwMjM0M30.ooqikxOaS5ksv4aPqnEB3HkxuJ6lGvn759o3lF3-QwQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
