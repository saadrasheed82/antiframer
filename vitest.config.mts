import path from 'node:path'
import { config as dotenvConfig } from 'dotenv'
import { defineConfig } from 'vitest/config'

dotenvConfig({ path: path.resolve(import.meta.dirname, '.env.local') })

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
})
