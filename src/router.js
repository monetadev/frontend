import { createRouter, createWebHistory } from 'vue-router';
import ResetPassword from './components/ResetPassword.vue'; // Update path

const routes = [
  { path: '/', redirect: '/reset-password' },
  { path: '/reset-password', component: ResetPassword }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
