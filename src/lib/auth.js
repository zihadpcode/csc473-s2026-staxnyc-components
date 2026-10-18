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

export async function ensureMyProfile(user) {
  const current = await getProfile(user.id)
  if (current) return current
  const displayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim().slice(0, 80)
      : 'STAX member'
  const { error } = await requireClient()
    .from('user_profiles')
    .upsert(
      { id: user.id, display_name: displayName || 'STAX member' },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  if (error)
    throw new Error(
      'Your account is signed in, but its profile could not be created. ' +
        error.message,
    )
  return getProfile(user.id)
}
export async function requestPasswordReset(email) {
  const { error } = await requireClient().auth.resetPasswordForEmail(
    email.trim(),
    { redirectTo: new URL('/reset-password', window.location.origin).href },
  )
  if (error) throw error
}
export async function updatePassword(password) {
  const { error } = await requireClient().auth.updateUser({ password })
  if (error) throw error
}
