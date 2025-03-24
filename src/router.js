import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue';
import createAccount  from './views/createAccount.vue';
import AddFlashcard  from './views/AddFlashcard.vue';
import flash  from './components/GeneratedFlashcard.vue';
import Settings from './views/Settings.vue';
import Set from './views/flashsetViewer.vue';
import View from './views/flashcardViewer.vue';

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  {path: '/signup', component: createAccount},
  {path: '/add-flashcard', component: AddFlashcard},
  {path: '/set', component: Set},
  {path: '/view', component: View},
  { path: '/settings', component: Settings}

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
