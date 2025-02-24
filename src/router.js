import { createRouter, createWebHistory } from 'vue-router';
import Home from "./views/Home.vue";
import ResetPassword from './views/ResetPassword.vue'; // Update path

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/home", component: Home },
  { path: '/reset-password', component: ResetPassword }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
