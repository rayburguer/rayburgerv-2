import { supabase } from '../api/supabase';

interface LoyaltyResult {
    customerCashback: number;
    referrerBonus: number;
    newLevel: number;
    error?: string;
}

/**
 * Motor de Lealtad v1.0
 * Calcula cashback dinámico por niveles y bonos de referido
 */
export async function processLoyalty(
    userId: string,
    orderAmount: number
): Promise<LoyaltyResult> {
    try {
        // 1. Get customer profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
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

        // FOUNDER LOGIC: Double cashback for first month
        if (profile.is_founder) {
            const joinDate = new Date(profile.created_at || new Date());
            const oneMonthLater = new Date(joinDate);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            console.log('🔎 DEBUG LOYALTY - FOUNDER DETECTED');
            console.log('Join Date:', joinDate.toISOString());
            console.log('One Month Limit:', oneMonthLater.toISOString());
            console.log('Current Date:', new Date().toISOString());

            if (new Date() < oneMonthLater) {
                console.log('🚀 FOUNDER BENEFIT ACTIVE: Doubling cashback rate');
                console.log('Original Rate:', cashbackRate);
                cashbackRate *= 2;
                console.log('New Rate (x2):', cashbackRate);
            } else {
                console.log('⌛ FOUNDER BENEFIT EXPIRED: Normal rate applies');
            }
        }

        const customerCashback = orderAmount * cashbackRate;
        console.log('💰 FINAL CALCULATION:', {
            orderAmount,
            cashbackRate,
            customerCashback,
            newLevel
        });

        // 4. Update customer profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                total_spent: newTotalSpent,
                level: newLevel,
                wallet_balance: (profile.wallet_balance || 0) + customerCashback,
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
                .from('profiles')
                .select('role, wallet_balance')
                .eq('id', profile.referred_by)
                .single();

            // Only give bonus if referrer is not admin
            if (referrer && referrer.role !== 'admin') {
                const { error: referrerError } = await supabase
                    .from('profiles')
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
        };
    } catch (err: any) {
        console.error('Loyalty processing error:', err);
        return {
            customerCashback: 0,
            referrerBonus: 0,
            newLevel: 1,
            error: err.message,
        };
    }
}

/**
 * Get level name for display
 */
export function getLevelName(level: number): string {
    switch (level) {
        case 1:
            return 'Bronce';
        case 2:
            return 'Plata';
        case 3:
            return 'Oro';
        default:
            return 'Bronce';
    }
}

/**
 * Get cashback rate for level
 */
export function getCashbackRate(level: number): number {
    switch (level) {
        case 1:
            return 3;
        case 2:
            return 5;
        case 3:
            return 8;
        default:
            return 3;
    }
}
