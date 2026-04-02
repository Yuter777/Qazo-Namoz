import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from '../services/authService';

// Lazy load page components
const Login = () => import('../pages/Login.vue');
const Dashboard = () => import('../pages/Dashboard.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const user = getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !user) {
    // Redirect to login if trying to access protected route
    next({ name: 'Login' });
  } else if (requiresGuest && user) {
    // Redirect to dashboard if already logged in
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;