// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfwihaamswskmospcqfo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2loYWFtc3dza21vc3BjcWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk2NDgsImV4cCI6MjA4NzEwNTY0OH0.3zpOBv-C4dby3_WljUVFlN8CyxKurBbVPX8CPyIv_rk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
