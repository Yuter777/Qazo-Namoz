import { createRouter, createWebHistory } from 'vue-router'
import { authReady, useAuth } from '../composables/useAuth'

const AppShell      = () => import('../components/AppShell.vue')
const LoginPage     = () => import('../pages/Login.vue')
const DashboardPage = () => import('../pages/Dashboard.vue')
const TrackerPage   = () => import('../pages/TrackerPage.vue')
const ProfilePage   = () => import('../pages/ProfilePage.vue')
const InfoPage      = () => import('../pages/InfoPage.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: DashboardPage },
      { path: 'tracker',   name: 'Tracker',   component: TrackerPage   },
      { path: 'profile',   name: 'Profile',   component: ProfilePage   },
      { path: 'info',      name: 'Info',      component: InfoPage      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  // Wait for Firebase to resolve the initial auth state before any navigation.
  // Without this, auth.currentUser is null on hard refresh and the user
  // gets bounced to /login even though they are logged in.
  await authReady

  const { currentUser } = useAuth()
  const user = currentUser.value

  const requiresAuth  = to.matched.some(r => r.meta.requiresAuth)
  const requiresGuest = to.matched.some(r => r.meta.requiresGuest)

  if (requiresAuth  && !user) return next({ name: 'Login' })
  if (requiresGuest && user)  return next({ name: 'Dashboard' })
  next()
})

export default router
