import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import UsersView from '../views/UsersView.vue'
import OrdersView from '../views/OrdersView.vue'
import ProductsView from '../views/ProductsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import CategoriesView from '../views/CategoriesView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/users', name: 'users', component: UsersView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/products', name: 'products', component: ProductsView },
  { path: '/register-form', name: 'register-form', component: RegisterFormView },
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/category-form', redirect: '/categories' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
