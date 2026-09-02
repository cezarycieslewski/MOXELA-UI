import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  // Relative base so built asset URLs (JS/CSS/images referenced via
  // import.meta.env.BASE_URL) resolve correctly regardless of the path
  // prefix the app is mounted under (e.g. haproxy proxying VideoIPath's
  // /moxela/ -> this app's /). Do not change this back to '/'.
  base: './',
  server: { host: '0.0.0.0', port: 3000 }
})
