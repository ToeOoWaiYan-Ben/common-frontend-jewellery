// src/services/http.ts
import { API_BASE_URL } from '../config/env'

function getToken() {
  return localStorage.getItem('token')
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
    return data?.message || data?.error || JSON.stringify(data)
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

  if (!res.ok) {
    const msg = (await parseError(res)) || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
