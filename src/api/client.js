/**
 * MOXELA API client
 *
 * All requests go to api/v1/* on the same origin, resolved relative to
 * ASSET_BASE (see src/config.js) rather than a hardcoded leading-slash
 * path — this lets the app run behind a reverse proxy (e.g. haproxy)
 * mounted at any path prefix, not just the domain root.
 * nginx proxies /api/ → MOXELA_BACKEND_URL/api/ server-side,
 * so the browser never makes a cross-origin request and CORS is not an issue.
 *
 * The "Server URL" field on the login screen is shown for UX feedback only;
 * the actual routing is configured via the MOXELA_BACKEND_URL Docker env var.
 */
import { ASSET_BASE } from '../config'

export const API_BASE = `${ASSET_BASE}api/v1`

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export const api = {
  about:              ()       => request('/about'),
  getPipelines:       ()       => request('/config/pipelines'),
  savePipelines:      (config) => request('/config/pipelines', { method: 'PATCH', body: JSON.stringify(config) }),
  getElementDescriptors: ()   => request('/descriptors/elements'),
}
