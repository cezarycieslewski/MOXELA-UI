import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

export default defineConfig({
  plugins: [react()],
  // Relative base so built asset URLs (JS/CSS/images referenced via
  // import.meta.env.BASE_URL) resolve correctly regardless of the path
  // prefix the app is mounted under (e.g. haproxy proxying VideoIPath's
  // /moxela/ -> this app's /). Do not change this back to '/'.
  base: './',
  define: {
    // Baked in at build time from package.json so the About dialog can show
    // the UI's own version alongside the backend's (from GET /about).
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: { host: '0.0.0.0', port: 3000 }
})
