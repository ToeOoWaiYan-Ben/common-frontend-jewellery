import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import ProductsView from '../views/ProductsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CustomersView from '../views/CustomersView.vue'
import CustomerFormView from '../views/CustomerFormView.vue'
import LoginView from '../views/LoginView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'home', component: HomeView },

  { path: '/products', name: 'products', component: ProductsView },

  { path: '/register-form', name: 'register-form', component: RegisterFormView },

  /* -------- Categories -------- */
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/category-form', redirect: '/categories' },

  /* -------- Customers -------- */
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/customers/new', name: 'customer-new', component: CustomerFormView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router