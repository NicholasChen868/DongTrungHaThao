import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfwihaamswskmospcqfo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2loYWFtc3dza21vc3BjcWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk2NDgsImV4cCI6MjA4NzEwNTY0OH0.3zpOBv-C4dby3_WljUVFlN8CyxKurBbVPX8CPyIv_rk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sha256_mock(str) {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(str).digest('hex');
}

async function run() {
    const pwhash = await sha256_mock("123456");
    const phone = "0999888777";
    
    // 1. Dùng register
    console.log("---- REGISTER CTV ----");
    const { data: reg, error: regE } = await supabase.rpc('register_ctv', {
        p_name: "Test CTV 2", p_phone: phone, p_email: null, p_password_hash: pwhash, p_referrer_code: null
    });
    console.log("Reg result:", reg, "Err:", regE);

    // 2. Thử Login
    console.log("---- LOGIN CTV ----");
    const { data: log, error: logE } = await supabase.rpc('authenticate_ctv', {
        p_phone: phone, p_password_hash: pwhash
    });
    console.log("Login result:", log, "Err:", logE);
}
run();
