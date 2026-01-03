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

  if ((res.status === 401 || res.status === 403) && !isPublicEndpoint(path)) {
    clearAuth()
    redirectToLogin()
    throw new Error('Unauthorized: redirecting to login')
  }

  if (!res.ok) {
    const msg = (await parseError(res)) || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
