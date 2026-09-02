/**
 * Shared runtime base path.
 *
 * Equals Vite's `base` config (see vite.config.js), which is set to './'
 * so the app works when reverse-proxied under an arbitrary path prefix
 * (e.g. haproxy mounting this app at /moxela/ inside VideoIPath). Every
 * public asset (images) and same-origin API call is built from this
 * constant instead of a hardcoded leading-slash path, so nothing assumes
 * the app is served from the domain root.
 */
export const ASSET_BASE = import.meta.env.BASE_URL
