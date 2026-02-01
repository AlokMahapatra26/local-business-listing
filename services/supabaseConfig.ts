import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase keys
const supabaseUrl = 'https://inkiwbsnbrbtrrwtrdjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlua2l3YnNuYnJidHJyd3RyZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjU2NzUsImV4cCI6MjA4NTU0MTY3NX0.6kSNYoH9GTEzIL-ljUniIwl077yhH88ZSE0ceKjHaE0';

export const supabase = createClient(supabaseUrl, supabaseKey);
