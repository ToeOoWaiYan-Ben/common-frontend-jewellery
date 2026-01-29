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
import ProductListView from '../views/ProductListView.vue'
import ProductRegisterView from '../views/ProductRegisterView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CraftsView from '../views/CraftsView.vue'
import GemsPackagesView from '../views/GemPackagesView.vue'
import JewelryTypesView from '../views/JewelryTypesView.vue'
import ProductTagsView from '../views/ProductTagsView.vue'
import SettingsView from '../views/SettingsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import GemTypeFormView from '../views/GemTypeFormView.vue'
import SellerFormView from '../views/SellerFormView.vue'

/* -------- User Storefront -------- */
import CatalogView from '../views/user/CatalogView.vue'
import ProductDetailView from '../views/user/ProductDetailView.vue'

const routes: RouteRecordRaw[] = [
  /* ---------- Default ---------- */
  { path: '/', redirect: '/user/catalog' },

  /* ---------- Auth ---------- */
  { path: '/login', name: 'login', component: LoginView },

  /* ---------- USER STOREFRONT ---------- */
  {
    path: '/user',
    redirect: '/user/catalog',
    children: [
      {
        path: 'catalog',
        name: 'user-catalog',
        component: CatalogView,
      },
      {
        path: 'product/:id',
        name: 'user-product-detail',
        component: ProductDetailView,
        props: true,
      },
    ],
  },

  /* ---------- ADMIN AREA ---------- */
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'home', component: HomeView },

      { path: 'users', name: 'users', component: UsersView },
      { path: 'orders', name: 'orders', component: OrdersView },
      { path: 'products', name: 'products', component: ProductListView },
      { path: 'products/new', name: 'product-new', component: ProductRegisterView },
      {
        path: 'products/:id/edit',
        name: 'product-edit',
        component: ProductRegisterView,
        props: true,
      },

      { path: 'categories', name: 'categories', component: CategoriesView },
      { path: 'crafts', name: 'crafts', component: CraftsView },
      { path: 'gems-packages', name: 'gems-packages', component: GemsPackagesView },
      { path: 'jewelry-types', name: 'jewelry-types', component: JewelryTypesView },
      { path: 'product-tags', name: 'product-tags', component: ProductTagsView },

      /* --- forms that are standalone pages --- */
      { path: 'register-form', name: 'register-form', component: RegisterFormView },
      { path: 'gem-type-form', name: 'gem-type-form', component: GemTypeFormView },
      { path: 'seller-form', name: 'seller-form', component: SellerFormView },

      { path: 'settings', name: 'admin-settings', component: SettingsView },
    ],
  },

  /* ---------- Fallback ---------- */
  { path: '/:pathMatch(.*)*', redirect: '/user/catalog' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

/* ---------- Route Guard ---------- */
router.beforeEach((to) => {
  // user storefront is public
  if (to.path.startsWith('/user')) return true

  const auth = useAuthStore()

  // admin requires login
  if (!auth.isLoggedIn && to.path.startsWith('/admin')) {
    return '/login'
  }

  // logged-in users should not see login page
  if (auth.isLoggedIn && to.path === '/login') {
    return '/admin'
  }

  return true
})

export default router
