// src/stores/useUsersStore.ts
import { defineStore } from 'pinia'
import type { UserDto } from '../dtos/UserDto'

interface UsersState {
  items: UserDto[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalUsers: (state) => state.items.length
  },

  actions: {
    async loadUsers() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('http://localhost:8080/api/customers')
        if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`)

       this.items= (await res.json()) as UserDto[]

      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading users.'
      } finally {
        this.loading = false
      }
    },
    async createUser( payload:{
      name: string
      phone: string
      address: string
      role: string
      hashPassword: string
    }){
      this.loading = true
      this. error=null
      try {
        const res = await fetch('http://localhost:8080/api/customers',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if(!res.ok){
        throw new Error(`Failed to create category (${res.status})`)
      }
      const created =(await res.json() ) as UserDto
      this.items.push(created)
    }catch(e:any){
      this.error =
      e?.message ?? 'Something went wrong while creating category.'
      throw e
    }finally {
      this.loading = false
    }
  },
  async updateUser(
    id:number,
    payload: {
        name: string
        phone: string
        address: string
        role: string
    }
  ){
    this.loading=true
    this.error=null
    try{
      const res = await fetch(`http://localhost:8080/api/customers/${id}`,{
        method :'PUT', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        throw new Error(`Failed to update category (${res.status})`)
      }
      const updated = (await res.json()) as UserDto
      const idx=this.items.findIndex((c)=> c.id===id)
      if(idx!=-1){
        this.items[idx]=updated
      }
    }catch(e:any){
      e?.message ?? 'Something went wrong while updating user.'
      throw e
    }finally{
      this.loading =false
    }
  },
  async deleteUser(id: number){
    this.loading =true
    this.error= null
    try{
      const res= await fetch(`http://localhost:8080/api/users/${id}`,{
        method: 'DELETE'
      })
      if (!res.ok){
        throw new Error(`Failed to delete user (${res.status})`)
      }
      this.items = this.items.filter((c) => c.id !== id)
        } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while deleting category.'
        throw e
      } finally {
        this.loading = false
      }
  }

}})


