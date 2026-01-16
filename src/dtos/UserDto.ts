export interface UserDto {
  id: number
  name: string
  email: string

  // only used when creating/updating (do NOT display in table)
  password?: string

  nrc?: string | null
  phone?: string | null
  address?: string | null
}