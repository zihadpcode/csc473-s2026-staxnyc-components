import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseKey)
export const configurationMessage =
  'The data connection is not configured yet. You can still explore the site and the saved standings snapshot.'
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

export function requireClient() {
  if (!supabase) throw new Error(configurationMessage)
  return supabase
}
