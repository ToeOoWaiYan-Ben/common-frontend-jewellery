// src/services/http.ts
import { API_BASE_URL } from '../config/env'

function getToken() {
  return localStorage.getItem('token')
}

function clearAuth() {
  localStorage.removeItem('token')
}

function redirectToLogin() {
  // simplest (no router import needed)
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

async function parseError(res: Response) {
  try {
    const data = await res.json()
    return data?.message || data?.error || data?.detail || JSON.stringify(data)
  } catch {
    return null
  }
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  if (!isPublicEndpoint(path)) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // ✅ Only 401 means "not logged in" (token missing/expired)
  if (res.status === 401 && !isPublicEndpoint(path)) {
    clearAuth()
    redirectToLogin()
    throw new Error('Unauthorized: redirecting to login')
  }

  // ✅ 403 means "logged in but not allowed" (DON'T logout)
  if (res.status === 403 && !isPublicEndpoint(path)) {
    const msg = (await parseError(res)) || 'Forbidden'
    throw new Error(msg)
  }

  if (!res.ok) {
    const msg = (await parseError(res)) || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  // ✅ handle empty responses safely (DELETE often returns 200 with empty body)
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  if (!text) return undefined as T
  if (!contentType.includes('application/json')) return text as unknown as T

  return JSON.parse(text) as T
}
