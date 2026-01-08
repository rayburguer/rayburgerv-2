import { create } from 'zustand';
import { supabase } from '../api/supabase';

interface SettingsState {
    exchangeRate: number;
    fetchExchangeRate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    exchangeRate: 0, // Valor inicial seguro
    fetchExchangeRate: async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('exchange_rate')
                .eq('id', 1)
                .single();

            if (error) throw error;

            if (data) {
                set({ exchangeRate: data.exchange_rate });
            } else {
                console.warn('No exchange rate found, using default');
                set({ exchangeRate: 60 }); // Fallback seguro
            }
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
            set({ exchangeRate: 60 }); // Fallback en error
        }
    },
}));

