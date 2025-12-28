// src/services/http.ts
const BASE_URL = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token')
}

async function parseError(res: Response) {
  try {
    const data = await res.json()
    return data?.message || data?.error || JSON.stringify(data)
  } catch {
    return null
  }
}

export async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const headers = new Headers(options.headers || {})
  // If body is FormData, browser sets content-type automatically
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const msg = (await parseError(res)) || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  // handle 204 No Content
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}