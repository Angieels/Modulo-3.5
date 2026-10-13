import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztdjogcjczsljisvzrty.supabase.co';
const supabaseAnonKey = 'sb_publishable_PEWbmTyq_u9ze0X2Tm8-dA_f1Bowz9O'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);