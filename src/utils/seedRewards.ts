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

async function seedRewards() {
    console.log('Iniciando carga de premios Ferrari...');

    const rewards = [
        // 10 Extras
        ...Array(10).fill(null).map(() => ({
            code: `EXTRA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            description: 'Un extra gratis en tu próximo pedido',
        })),
        // 7 Descuentos
        ...Array(7).fill(null).map(() => ({
            code: `PROMO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            description: '15% de descuento en tu total',
        })),
        // 3 Burgers Gratis
        ...Array(3).fill(null).map(() => ({
            code: `RAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            description: '¡Una hamburguesa gratis!',
        })),
    ];

    const { error } = await supabase.from('rewards').insert(rewards);

    if (error) {
        console.error('Error al insertar premios:', error);
    } else {
        console.log('✅ 20 Premios Ferrari cargados exitosamente.');
    }
}

seedRewards();
