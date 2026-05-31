
import { createClient } from '@supabase/supabase-js';
import { CreditCard, ChatMessage } from '../types';

/**
 * SETUP COMPLETED:
 * Using the provided anon key and project reference.
 */
const SUPABASE_URL: string = 'https://rwjigznwlfuohoegakpk.supabase.co';
const SUPABASE_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3amlnem53bGZ1b2hvZWdha3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzUxNTIsImV4cCI6MjA4NDIxMTE1Mn0.UNPrybuuku8AJw8Grp5_G2pP043fce46BUXIBraYAnA';

export const isSupabaseConfigured = 
  SUPABASE_URL !== 'https://your-project.supabase.co' && 
  SUPABASE_KEY !== 'your-anon-key';

const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export interface UserData {
  email: string;
  cards: CreditCard[];
  messages: ChatMessage[];
}

export const syncUserData = async (email: string, cards: CreditCard[], messages: ChatMessage[]): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ 
        email, 
        cards, 
        messages, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'email' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Cloud sync failed:", err);
    return false;
  }
};

export const fetchUserData = async (email: string): Promise<UserData | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('cards, messages')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      return {
        email,
        cards: data.cards || [],
        messages: data.messages || []
      };
    }
    return null;
  } catch (err) {
    console.warn("Cloud fetch failed:", err);
    return null;
  }
};

export const deleteUserData = async (email: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('email', email);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to delete user data:", err);
    return false;
  }
};
