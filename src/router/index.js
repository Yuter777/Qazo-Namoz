import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from '../services/authService';

// Lazy load page components
const Home = () => import('../pages/Home.vue');
const Login = () => import('../pages/Login.vue');
const Dashboard = () => import('../pages/Dashboard.vue');
const Profile = () => import('../pages/Profile.vue');
const Start = () => import('../pages/Start.vue');
const Info = () => import('../pages/Info.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { layout: 'desktop-mobile' },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true, layout: 'auth' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, layout: 'desktop-mobile' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, layout: 'desktop-mobile' },
  },
  {
    path: '/start',
    name: 'Start',
    component: Start,
    meta: { layout: 'desktop-mobile' },
  },
  {
    path: '/info',
    name: 'Info',
    component: Info,
    meta: { layout: 'desktop-mobile' },
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