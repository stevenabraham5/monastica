import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  /** Local-first: user's name, captured on first launch (no account needed). */
  userName: string | null;
  hasCompletedWelcome: boolean;

  initialize: () => void;
  setUserName: (name: string) => void;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const redirectUri = makeRedirectUri({ preferLocalhost: Platform.OS === 'web' });

async function signInWithProvider(provider: 'apple' | 'google') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) throw error;

  // On native, open the OAuth URL in an in-app browser
  if (Platform.OS !== 'web' && data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    if (result.type === 'success' && result.url) {
      // Extract tokens from the redirect URL
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,
  userName: null,
  hasCompletedWelcome: false,

  initialize: () => {
    // Get current session — with catch so we don't hang if Supabase isn't configured
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        set({ session, user: session?.user ?? null, loading: false });
      })
      .catch(() => {
        set({ loading: false });
      });

    // Fallback timeout — if Supabase never responds, stop loading after 3s
    setTimeout(() => {
      set((state) => state.loading ? { loading: false } : {});
    }, 3000);

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false, error: null });
    });
  },

  signInWithApple: async () => {
    try {
      set({ error: null, loading: true });
      await signInWithProvider('apple');
    } catch (e: any) {
      set({ error: e.message ?? 'Apple sign-in failed', loading: false });
    }
  },

  setUserName: (name: string) => set({ userName: name, hasCompletedWelcome: true }),

  signInWithGoogle: async () => {
    try {
      set({ error: null, loading: true });
      await signInWithProvider('google');
    } catch (e: any) {
      set({ error: e.message ?? 'Google sign-in failed', loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
