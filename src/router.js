import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue'; // Ensure correct import path

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
