/**
 * MOXELA API client
 *
 * All requests go to /api/v1/* on the same origin (relative URL).
 * nginx proxies /api/ → MOXELA_BACKEND_URL/api/ server-side,
 * so the browser never makes a cross-origin request and CORS is not an issue.
 *
 * The "Server URL" field on the login screen is shown for UX feedback only;
 * the actual routing is configured via the MOXELA_BACKEND_URL Docker env var.
 */

const API_BASE = '/api/v1'

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
