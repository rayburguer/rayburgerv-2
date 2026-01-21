
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    const tables = ['orders', 'order_items', 'payment_reports', 'user_rewards', 'profiles'];

    console.log('--- RLS STATUS CHECK ---');

    for (const table of tables) {
        // Query sys tables directly via RPC or just assume if we can query pg_class
        // Since we can't easily query pg_class without SQL execution, 
        // we'll try to query policies again and infer.

        const { data: policies, error } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', table);

        console.log(`Table: ${table}`);
        console.log(`Policies: ${policies?.length || 0}`);
        if (policies && policies.length > 0) {
            policies.forEach(p => console.log(` - ${p.policyname} (${p.cmd})`));
        } else {
            console.log(' - No active policies found.');
        }
        console.log('----------------');
    }
}

checkRLS();
