
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    fs.writeFileSync('audit_results.json', JSON.stringify({ error: 'Missing Credentials' }));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const results: any = {};
    try {
        // 1. PROFILES
        const { data: pData } = await supabase.from('profiles').select('*').limit(1);
        const pKeys = pData && pData[0] ? Object.keys(pData[0]) : [];
        results.profiles = {
            has_wallet_balance: pKeys.includes('wallet_balance'),
            has_points: pKeys.includes('points'),
            has_role: pKeys.includes('role'),
            all_keys: pKeys
        };

        // 2. PRODUCTS
        const { data: prData } = await supabase.from('products').select('*').limit(1);
        const prKeys = prData && prData[0] ? Object.keys(prData[0]) : [];
        results.products = {
            has_is_archived: prKeys.includes('is_archived'),
            has_is_active: prKeys.includes('is_active'),
            has_is_available: prKeys.includes('is_available'),
            all_keys: prKeys
        };

        fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));

    } catch (err: any) {
        fs.writeFileSync('audit_results.json', JSON.stringify({ error: err.message }));
    }
}

inspect();
