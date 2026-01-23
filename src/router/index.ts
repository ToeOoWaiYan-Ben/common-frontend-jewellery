// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/* -------- Layout -------- */
import AdminLayout from '../components/layout/AdminLayout.vue'

/* -------- Auth -------- */
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/useAuthStore'

/* -------- Admin Views -------- */
import HomeView from '../views/HomeView.vue'
import UsersView from '../views/UsersView.vue'
import OrdersView from '../views/OrdersView.vue'
import ProductsView from '../views/ProductsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CraftsView from '../views/CraftsView.vue'
import GemsPackagesView from '../views/GemPackagesView.vue'
import GemTypeFormView from '../views/GemTypeFormView.vue'
import SellerFormView from '../views/SellerFormView.vue'
import ProductTagsView from '../views/ProductTagsView.vue'

import SettingsView from '../views/SettingsView.vue'

/* -------- User Storefront Views -------- */
import CatalogView from '../views/user/CatalogView.vue'
import ProductDetailView from '../views/user/ProductDetailView.vue'

const routes: RouteRecordRaw[] = [
  /* ---------- Default ---------- */
  { path: '/', redirect: '/user/catalog' },

  /* ---------- Auth ---------- */
  { path: '/login', name: 'login', component: LoginView },

  /* ---------- USER STOREFRONT (NO LOGIN REQUIRED) ---------- */
  { path: '/user', redirect: '/user/catalog' },

  {
    path: '/user/catalog',
    name: 'user-catalog',
    component: CatalogView,
  },

  {
    path: '/user/product/:id',
    name: 'user-product-detail',
    component: ProductDetailView,
    props: true,
  },

  /* ---------- ADMIN AREA (LOGIN REQUIRED) ---------- */
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'users', name: 'users', component: UsersView },
      { path: 'orders', name: 'orders', component: OrdersView },
      { path: 'products', name: 'products', component: ProductsView },
      { path: 'register-form', name: 'register-form', component: RegisterFormView },

      { path: 'categories', name: 'categories', component: CategoriesView },
      { path: 'category-form', redirect: '/admin/categories' },

      { path: 'crafts', name: 'crafts', component: CraftsView },
      { path: 'craft-form', redirect: '/admin/crafts' },

      { path: 'gems-packages', name: 'gems-packages', component: GemsPackagesView },
      { path: 'gem-type-form', name: 'gem-type-form', component: GemTypeFormView },
      { path: 'seller-form', name: 'seller-form', component: SellerFormView },

      { path: 'product-tags', name: 'product-tags', component: ProductTagsView },
 

      { path: 'settings', name: 'admin-settings', component: SettingsView },
    ],
  },

  /* ---------- Fallback ---------- */
  // ✅ If unknown URL, send to storefront instead of login
  { path: '/:pathMatch(.*)*', redirect: '/user/catalog' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  // ✅ Reset scroll when changing pages (catalog/detail)
  scrollBehavior() {
    return { top: 0 }
  },
})

/* ---------- Route Guard ---------- */
router.beforeEach((to) => {
  // ✅ allow all /user pages without login
  if (to.path.startsWith('/user')) return true

  const auth = useAuthStore()

  // ✅ admin requires login
  if (!auth.isLoggedIn && to.path.startsWith('/admin')) return '/login'

  // ✅ if already logged in and tries to go /login
  if (auth.isLoggedIn && to.path === '/login') return '/admin'

  return true
})

export default router
