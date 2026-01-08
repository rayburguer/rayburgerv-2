import { supabase } from '../api/supabase';

/**
 * TEST VERSION - Uses test_profiles table
 * Motor de Lealtad v1.0 - Laboratory Edition
 */
export async function processLoyaltyTest(
    userId: string,
    orderAmount: number
): Promise<{
    customerCashback: number;
    referrerBonus: number;
    newLevel: number;
    newTotalSpent: number;
    newWalletBalance: number;
    error?: string;
}> {
    try {
        // 1. Get customer profile from TEST table
        const { data: profile, error: profileError } = await supabase
            .from('test_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            throw new Error('Profile not found');
        }

        // SECURITY: Admins don't generate cashback
        if (profile.role === 'admin') {
            return {
                customerCashback: 0,
                referrerBonus: 0,
                newLevel: profile.level || 1,
                newTotalSpent: profile.total_spent || 0,
                newWalletBalance: profile.wallet_balance || 0,
            };
        }

        // 2. Calculate new total_spent
        const currentSpent = profile.total_spent || 0;
        const newTotalSpent = currentSpent + orderAmount;

        // 3. Determine level and cashback rate
        let cashbackRate = 0.03; // Default: Level 1 = 3%
        let newLevel = 1;

        if (newTotalSpent > 500) {
            cashbackRate = 0.08; // Level 3 = 8%
            newLevel = 3;
        } else if (newTotalSpent > 100) {
            cashbackRate = 0.05; // Level 2 = 5%
            newLevel = 2;
        }

        const customerCashback = orderAmount * cashbackRate;
        const newWalletBalance = (profile.wallet_balance || 0) + customerCashback;

        // 4. Update customer profile in TEST table
        const { error: updateError } = await supabase
            .from('test_profiles')
            .update({
                total_spent: newTotalSpent,
                level: newLevel,
                wallet_balance: newWalletBalance,
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating customer:', updateError);
        }

        // 5. Process referrer bonus (if exists)
        let referrerBonus = 0;
        if (profile.referred_by) {
            referrerBonus = orderAmount * 0.02; // 2% for referrer

            // Get referrer profile to check if admin
            const { data: referrer } = await supabase
                .from('test_profiles')
                .select('role, wallet_balance')
                .eq('id', profile.referred_by)
                .single();

            // Only give bonus if referrer is not admin
            if (referrer && referrer.role !== 'admin') {
                const { error: referrerError } = await supabase
                    .from('test_profiles')
                    .update({
                        wallet_balance: (referrer.wallet_balance || 0) + referrerBonus,
                    })
                    .eq('id', profile.referred_by);

                if (referrerError) {
                    console.error('Error updating referrer:', referrerError);
                }
            } else {
                referrerBonus = 0; // Don't count if referrer is admin
            }
        }

        return {
            customerCashback,
            referrerBonus,
            newLevel,
            newTotalSpent,
            newWalletBalance,
        };
    } catch (err: any) {
        console.error('Loyalty processing error:', err);
        return {
            customerCashback: 0,
            referrerBonus: 0,
            newLevel: 1,
            newTotalSpent: 0,
            newWalletBalance: 0,
            error: err.message,
        };
    }
}

/**
 * Simulate purchases for laboratory testing
 */
export async function simulatePurchases() {
    console.log('🧪 INICIANDO SIMULACIÓN DE LABORATORIO\n');
    console.log('═══════════════════════════════════════\n');

    // Simulate purchases
    const purchases = [
        { client: 'B', userId: 'user-b-id', amount: 50 },
        { client: 'C', userId: 'user-c-id', amount: 150 },
        { client: 'D', userId: 'user-d-id', amount: 600 },
        { client: 'E', userId: 'user-e-id', amount: 20 },
    ];

    for (const purchase of purchases) {
        console.log(`\n📦 Procesando compra de Cliente ${purchase.client}: $${purchase.amount}`);
        const result = await processLoyaltyTest(purchase.userId, purchase.amount);

        if (result.error) {
            console.error(`❌ Error: ${result.error}`);
        } else {
            console.log(`   ├─ Cashback Cliente: $${result.customerCashback.toFixed(2)} (${result.newLevel === 1 ? '3%' : result.newLevel === 2 ? '5%' : '8%'})`);
            console.log(`   ├─ Bono Padrino A: $${result.referrerBonus.toFixed(2)} (2%)`);
            console.log(`   ├─ Nivel: ${result.newLevel} (${result.newLevel === 1 ? 'Bronce' : result.newLevel === 2 ? 'Plata' : 'Oro'})`);
            console.log(`   ├─ Total Gastado: $${result.newTotalSpent.toFixed(2)}`);
            console.log(`   └─ Wallet Balance: $${result.newWalletBalance.toFixed(2)}`);
        }
    }

    // Get final balances
    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 BALANCE FINAL DE TODOS LOS CLIENTES\n');

    const clients = ['user-a-id', 'user-b-id', 'user-c-id', 'user-d-id', 'user-e-id'];
    const clientNames = ['A (Padrino)', 'B', 'C', 'D', 'E'];

    for (let i = 0; i < clients.length; i++) {
        const { data: profile } = await supabase
            .from('test_profiles')
            .select('*')
            .eq('id', clients[i])
            .single();

        if (profile) {
            console.log(`\n👤 Cliente ${clientNames[i]}:`);
            console.log(`   ├─ Total Gastado: $${(profile.total_spent || 0).toFixed(2)}`);
            console.log(`   ├─ Wallet Balance: $${(profile.wallet_balance || 0).toFixed(2)}`);
            console.log(`   ├─ Nivel: ${profile.level || 1} (${profile.level === 1 ? 'Bronce' : profile.level === 2 ? 'Plata' : 'Oro'})`);
            console.log(`   └─ Código Referido: ${profile.referral_code || 'N/A'}`);
        }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ SIMULACIÓN COMPLETADA\n');
}
