import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiMiddleware } from './server/vite-api.js'
export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '')
  for (const key of [
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_KEY',
    'DEEPSEEK_API_KEY',
    'DEEPSEEK_MODEL',
  ])
    if (process.env[key] === undefined && localEnv[key] !== undefined)
      process.env[key] = localEnv[key]
  return {
    plugins: [
      react(),
      {
        name: 'stax-api',
        configureServer(server) {
          server.middlewares.use(apiMiddleware())
        },
        configurePreviewServer(server) {
          server.middlewares.use(apiMiddleware())
        },
      },
    ],
  }
})
