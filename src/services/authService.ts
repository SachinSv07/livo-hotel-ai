import type { UserRole } from '../types';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface StaffProfile {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  status: string;
  propertyId: string | null;
  avatar: string | null;
}

type StaffProfileRow = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  status: string;
  property_id: string | null;
  avatar: string | null;
};

const toStaffProfile = (row: StaffProfileRow): StaffProfile => ({
  id: row.id,
  authUserId: row.auth_user_id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
  status: row.status,
  propertyId: row.property_id,
  avatar: row.avatar
});

export const authService = {
  isConfigured: isSupabaseConfigured,

  async signIn(email: string, password: string): Promise<StaffProfile> {
    if (!supabase) throw new Error('Supabase Auth is not configured.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No authenticated user returned.');

    return this.fetchStaffProfile(data.user.id);
  },

  async fetchStaffProfile(authUserId: string): Promise<StaffProfile> {
    if (!supabase) throw new Error('Supabase Auth is not configured.');

    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, auth_user_id, name, email, role, department, status, property_id, avatar')
      .eq('auth_user_id', authUserId)
      .single();

    if (error) throw error;
    return toStaffProfile(data as StaffProfileRow);
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
