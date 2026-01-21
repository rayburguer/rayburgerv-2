
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env to get URL (we will inject KEY manually)
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the key passed via environment variable for safety in logs
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing URL or Key.');
    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('\n🔎 --- DIAGNOSTIC START ---');
    console.log('Connecting to:', supabaseUrl);

    try {
        // 1. Check Profiles Count
        const { count: profileCount, error: profileError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (profileError) {
            console.error('❌ Error checking profiles:', profileError.message);
        } else {
            console.log(`✅ Profiles count: ${profileCount}`);
        }

        // 2. Check Admin Users
        const { data: admins, error: adminError } = await supabase
            .from('profiles')
            .select('id, email, role, full_name')
            .eq('role', 'admin');

        if (adminError) {
            console.error('❌ Error checking admins:', adminError.message);
        } else {
            console.log(`✅ Admins found: ${admins?.length}`);
            admins?.forEach(a => console.log(`   - ${a.email} (${a.full_name}) [ID: ${a.id}]`));
        }

        // 3. Check Orders
        const { count: orderCount, error: orderError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        if (orderError) {
            console.error('❌ Error checking orders:', orderError.message);
        } else {
            console.log(`✅ Orders count: ${orderCount}`);
        }

        console.log('🔎 --- DIAGNOSTIC END ---');

    } catch (err: any) {
        console.error('❌ Unexpected error:', err.message);
    }
}

checkData();
