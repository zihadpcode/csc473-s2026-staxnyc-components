import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseKey)
export const configurationMessage =
  'The data connection is not configured yet. You can still explore the site and the saved standings snapshot.'
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: async (input, options = {}) => {
          const controller = new AbortController()
          const abort = () => controller.abort()
          if (options.signal?.aborted) controller.abort()
          else options.signal?.addEventListener('abort', abort, { once: true })
          const timer = setTimeout(abort, 12000)
          try {
            return await fetch(input, { ...options, signal: controller.signal })
          } finally {
            clearTimeout(timer)
            options.signal?.removeEventListener('abort', abort)
          }
        },
      },
    })
  : null

export function requireClient() {
  if (!supabase) throw new Error(configurationMessage)
  return supabase
}
