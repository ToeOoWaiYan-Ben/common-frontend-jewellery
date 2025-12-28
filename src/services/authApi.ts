// src/services/authApi.ts
import { http } from './http'
import type { LoginRequestDto, LoginResponseDto } from '../dtos/auth/LoginDto'

export function loginApi(payload: LoginRequestDto) {
  return http<LoginResponseDto>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
