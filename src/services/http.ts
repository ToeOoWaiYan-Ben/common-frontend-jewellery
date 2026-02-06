// src/services/http.ts
import { API_BASE_URL } from '../config/env'

function getToken() {
  return localStorage.getItem('token')
}

function clearAuth() {
  localStorage.removeItem('token')
}

function redirectToLogin() {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/login?next=${next}`
}

function isPublicEndpoint(path: string) {
  return (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh')
  )
}

// ✅ read JSON safely (only ONCE)
async function parseErrorJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})

  // ✅ set JSON content-type automatically
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  // ✅ attach token for protected APIs
  if (!isPublicEndpoint(path)) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // ✅ auth handling
  if ((res.status === 401 || res.status === 403) && !isPublicEndpoint(path)) {
    clearAuth()
    redirectToLogin()
    throw new Error('Unauthorized: redirecting to login')
  }

  // ✅ error handling with backend json preserved
  if (!res.ok) {
    const data = await parseErrorJson(res)

    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      (typeof data === 'string' ? data : null) ||
      `${res.status} ${res.statusText}`

    const err: any = new Error(msg)
    err.status = res.status
    err.data = data // ✅ important: now UI can do e.data.errors
    throw err
  }

  // ✅ handle empty responses safely (DELETE often returns 200 with empty body)
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  if (!text) return undefined as T
  if (!contentType.includes('application/json')) return text as unknown as T

  return JSON.parse(text) as T
}
