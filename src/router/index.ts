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
import GoldSourceView from '../views/GoldSourceView.vue'
import ProductGoldView from '../views/ProductGoldView.vue'
import SettingsView from '../views/SettingsView.vue'
import RegisterFormView from '../views/RegisterFormView.vue'
import GemTypeFormView from '../views/GemTypeFormView.vue'
import SellerFormView from '../views/SellerFormView.vue'
import CustomersView from '../views/CustomersView.vue'
import GoldPriceHistoryView from '../views/GoldPriceHistoryView.vue'
import PromotionsView from '../views/PromotionsView.vue'

import PurchaseListView from '@/views/PurchaseListView.vue'
import PurchaseRegisterView from '@/views/PurchaseRegisterView.vue'

import ImageUploadView from '../views/AdminImagesView.vue'
/* -------- User Storefront -------- */
import CatalogView from '../views/user/CatalogView.vue'
import ProductDetailView from '../views/user/ProductDetailView.vue'
import UserCollectionView from '../views/user/UserCollectionView.vue'
import Operations from '../views/selection/Operations.vue'
import Products from '../views/selection/Products.vue'
import Suppliers from '../views/selection/Suppliers.vue'
import Pricing from '../views/selection/Pricing.vue'
import UsersSelection from '../views/selection/Users.vue'

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
      {
        path: '/user/collection',
        name: 'user-collection',
        component: UserCollectionView,
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
      { path: 'gold-source', name: 'gold-source', component: GoldSourceView },
      { path: 'product-gold', name: 'product-gold', component: ProductGoldView },
      { path: 'customers', name: 'customers', component: CustomersView },
      { path: 'gold-price-history', name: 'gold-price-history', component: GoldPriceHistoryView },
      { path: 'promotions', name: 'promotions', component: PromotionsView },
      { path: 'images', name: 'images', component: ImageUploadView },

      /* ✅ PURCHASES (ADMIN) */
      { path: 'purchases', name: 'purchaseListView', component: PurchaseListView },
      { path: 'purchases/new', name: 'purchaseRegisterNew', component: PurchaseRegisterView },
      {
        path: 'purchases/:id/edit',
        name: 'purchaseRegisterEdit',
        component: PurchaseRegisterView,
        props: true,
      },

      /* --- forms that are standalone pages --- */
      { path: 'register-form', name: 'register-form', component: RegisterFormView },
      { path: 'gem-type-form', name: 'gem-type-form', component: GemTypeFormView },
      { path: 'seller-form', name: 'seller-form', component: SellerFormView },

      { path: 'settings', name: 'admin-settings', component: SettingsView },
      /* ---------- SELECTION PAGES ---------- */
      { path: 'selection/operations', name: 'selection-operations', component: Operations },
      { path: 'selection/products', name: 'selection-products', component: Products },
      { path: 'selection/suppliers', name: 'selection-suppliers', component: Suppliers },
      { path: 'selection/pricing', name: 'selection-pricing', component: Pricing },
      { path: 'selection/users', name: 'selection-users', component: UsersSelection },
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
