import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Variables de entorno no encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupData() {
    console.log('🧹 Iniciando limpieza de base de datos...');

    // Delete in order of dependencies
    const { error: feedbackError } = await supabase.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (feedbackError) console.error('Error feedback:', feedbackError.message);
    else console.log('✅ Feedback eliminado.');

    const { error: ordersError } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ordersError) console.error('Error orders:', ordersError.message);
    else console.log('✅ Órdenes eliminadas.');

    const { error: profilesError } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profilesError) console.error('Error profiles:', profilesError.message);
    else console.log('✅ Perfiles eliminados.');

    console.log('🚀 Base de datos lista para el primer registro real.');
}

cleanupData();
