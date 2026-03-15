import { supabase } from './supabase';

// Syncs local zustand state to a per-user JSON row in Supabase.
// Table: `user_data` with columns: id (uuid, FK to auth.users), data (jsonb), updated_at
//
// RLS policy ensures each user can only read/write their own row.

const TABLE = 'user_data';

export interface UserDataPayload {
  lifeModel: any;
  coach: any;
  ideas: any;
}

export async function loadUserData(userId: string): Promise<UserDataPayload | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load user data:', error.message);
    return null;
  }

  return data?.data ?? null;
}

export async function saveUserData(userId: string, payload: UserDataPayload): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { id: userId, data: payload, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    );

  if (error) {
    console.warn('Failed to save user data:', error.message);
  }
}
