// src/config/env.ts
const base = import.meta.env.VITE_API_BASE_URL as string
const prefix = (import.meta.env.VITE_API_PREFIX as string) || ''

if (!base) {
  throw new Error('Missing VITE_API_BASE_URL in .env')
}

export const API_BASE_URL = `${base}${prefix}`
