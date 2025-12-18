import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import ProductsView from '../views/ProductsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CustomersView from '../views/CustomersView.vue'
import CustomerFormView from '../views/CustomerFormView.vue'
import CraftsView from '../views/CraftsView.vue'


const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },

  { path: '/products', name: 'products', component: ProductsView },

  { path: '/register-form', name: 'register-form', component: RegisterFormView },

  /* -------- Categories -------- */
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/category-form', redirect: '/categories' },

  /* -------- Customers -------- */
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/customers/new', name: 'customer-new', component: CustomerFormView },

  /* -------- Crafts -------- */
{ path: '/crafts', name: 'crafts', component: CraftsView },
{ path: '/craft-form', redirect: '/crafts' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router