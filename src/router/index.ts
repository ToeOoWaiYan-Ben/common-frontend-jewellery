import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/* -------- Layout -------- */
import AdminLayout from '../components/layout/AdminLayout.vue'

/* -------- Auth -------- */
import LoginView from '../views/LoginView.vue'

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


const routes: RouteRecordRaw[] = [
  /* ---------- Login ---------- */
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },

  /* ---------- Admin Area ---------- */
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
      {
        path: 'users',
        name: 'users',
        component: UsersView,
      },
      {
        path: 'orders',
        name: 'orders',
        component: OrdersView,
      },
      {
        path: 'products',
        name: 'products',
        component: ProductsView,
      },
      {
        path: 'register-form',
        name: 'register-form',
        component: RegisterFormView,
      },

      /* -------- Categories -------- */
      {
        path: 'categories',
        name: 'categories',
        component: CategoriesView,
      },
      {
        path: 'category-form',
        redirect: '/admin/categories',
      },

      /* -------- Crafts -------- */
      {
        path: 'crafts',
        name: 'crafts',
        component: CraftsView,
      },
      {
        path: 'craft-form',
        redirect: '/admin/crafts',
      },

      /* -------- Gem Packages -------- */
      {
        path: 'gems-packages',
        name: 'gems-packages',
        component: GemsPackagesView,
      },
      {
        path: 'gem-type-form',
        name: 'gem-type-form',
        component: GemTypeFormView,
      },
       {
        path: 'seller-form',
        name: 'seller-form',
        component: SellerFormView,
      },
    ],
  },

  /* ---------- Fallback ---------- */
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
