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
import Create from './views/createSet.vue'
import Quizzes from "@/views/Quizzes.vue";

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  { path: '/signup', component: createAccount},
  { path: '/add-flashcard', component: AddFlashcard},
  { path: '/flash', component: flash},
  { path: '/myLibrary', component: Set},
  { path: '/set', component: Set},
  { path: '/view/:id', component: View, props: true },
  { path: '/view', component: View, props: true},
  // {path: '/view', redirect: '/myLibrary'}, // Redirect old path to sets
  { path: '/settings', component: Settings},
  { path: '/', component: Login },
  { path: '/create', component: Create },
  {path: "/quizzes", component: Quizzes},
  { path: '/edit-flashcard-set/:id', name: 'EditFlashcardSet', component: () => import('@/views/EditFlashcardSet.vue'), meta: { requiresAuth: true } }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
