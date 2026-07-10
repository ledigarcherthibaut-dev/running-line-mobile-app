import { supabase } from './client';

export function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signUp(email: string, password: string, name?: string) {
  return supabase.auth.signUp({ email, password, options: { data: { name } } });
}

export function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export function signOut() {
  return supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession();
}

export function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}
