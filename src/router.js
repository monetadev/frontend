import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue'; // Ensure correct import path
import createAccount  from './views/createAccount.vue'
import FlashcardViewer from './views/flashcardViewer.vue';

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  {path: '/signup', component: createAccount},
  {path: '/view', component: FlashcardViewer}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
