import http from '@/services/http'

export const getProducts = (params?: any) => {
  return http.get('/products', { params })
}