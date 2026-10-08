import { requireClient } from './supabase'
export async function signUp(email, password, displayName) {
  const { data, error } = await requireClient().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  })
  if (error) throw error
  return data
}
export async function signIn(email, password) {
  const { data, error } = await requireClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data
}
export async function signOut() {
  const { error } = await requireClient().auth.signOut()
  if (error) throw error
}
export async function getProfile(userId) {
  const { data, error } = await requireClient()
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}
