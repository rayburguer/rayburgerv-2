
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    const { data, error } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'order_items');

    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

checkPolicies();
