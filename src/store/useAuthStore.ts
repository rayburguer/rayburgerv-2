import { create } from 'zustand';
import { supabase } from '../api/supabase';
import type { Profile } from '../types';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    initialized: boolean;
    signIn: (phone: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    profile: null,
    loading: false,
    initialized: false,

    initializeAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null });

        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            set({ profile });
        }

        set({ initialized: true });

        supabase.auth.onAuthStateChange(async (_event, session) => {
            set({ session, user: session?.user ?? null });

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                set({ profile });
            } else {
                set({ profile: null });
            }
        });
    },

    signIn: async (phone, password) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({
                phone,
                password,
            });
            return { error };
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
    },
}));
