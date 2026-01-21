
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenu() {
    console.log('Checking v_menu_completo...');
    const { data, error } = await supabase.from('v_menu_completo').select('*').limit(5);

    if (error) {
        console.error('❌ View Error:', error);
    } else {
        console.log(`✅ View works. Found ${data.length} items.`);
        if (data.length > 0) {
            console.log('Sample item:', data[0].name, '| Price:', data[0].price_usd);
        } else {
            console.warn('⚠️ View is empty!');
        }
    }
}

checkMenu();
