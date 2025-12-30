// src/services/authApi.ts
import { API_BASE_URL } from '../config/env'
import type { LoginRequestDto } from '../dtos/auth/LoginDto'

export type LoginResponseDto = {
  token?: string
  accessToken?: string
}

export async function loginApi(payload: LoginRequestDto): Promise<LoginResponseDto> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let msg = `Login failed (${res.status})`
    try {
      const data = await res.json()
      msg = data?.message || data?.error || msg
    } catch {}
    throw new Error(msg)
  }

  return await res.json()
}
