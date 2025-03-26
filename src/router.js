import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue';
import createAccount  from './views/createAccount.vue';
import AddFlashcard  from './views/AddFlashcard.vue';
import Settings from './views/Settings.vue';
import Set from './views/flashsetViewer.vue';
import View from './views/flashcardViewer.vue';

=======


const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
const routes = [
  { path: '/signup', component: createAccount },
  { path: '/add-flashcard', component: AddFlashcard },
  { path: '/quizzes', component: Quizzes },
  { path: '/flash', component: flash }, 
  { path: '/my-stuffs', component: Set }, // Using 'my-stuffs' instead of 'myLibrary'
  { path: '/set', component: Set },
  { path: '/view/:id', component: View, props: true }, 
  { path: '/view', component: View, props: true }, 
  { path: '/settings', component: Settings },
  { path: '/create', component: Create }, 
  { path: '/', component: Dashboard }
];


];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
