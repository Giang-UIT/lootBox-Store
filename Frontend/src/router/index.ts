/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import ProductPage from '../pages/productpage.vue'
import Cart from '../components/Cart.vue'
import Account from '@/pages/index.vue'
import ProductManagement from '../components/ProductManagement.vue'
import ProductDetail from '../pages/productdetail.vue'
import addresspage from '../pages/addresspage.vue'
import addresses from '@/pages/addresses.vue'
import adminAccount from '@/pages/adminAccount.vue'
import Login from '@/pages/Login.vue'
import CreateAccount from '@/pages/CreateAccount.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',
      component: ProductPage },
    { path: '/cart',
       component: Cart },
    { path: '/account',
       component: Account },
    { path: '/productmanagement',
       component: ProductManagement },
    { path: '/product/:id',
       component: ProductDetail },
    { path: '/address',
       component: addresspage },
    { path: '/addresses',
       component: addresses },
   { path: '/adminAccount',
      component: adminAccount },
    { path: '/login', 
       component: Login },
    { path: '/createaccount',
       component: CreateAccount },
    { path: '/product/:id',
       component: () => import('../pages/productdetail.vue') },
  ],
})


// Navigation guard to check for admin access and protected routes
router.beforeEach((to, from, next) => {
  const protectedRoutes = ['/cart', '/address', '/account']
  const adminRoutes = ['/productmanagement', '/adminAccount']
  if (protectedRoutes.includes(to.path)) {
    const account = localStorage.getItem('account')
    if (!account) {
      next('/login')
    } else {
      next()
    }
  } else if (adminRoutes.includes(to.path)) {
    const account = localStorage.getItem('account')
    if (account) {
      const parsed = JSON.parse(account)
      if (parsed.admin_status === true) {
        next()
      } else {
        next('/')
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
