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
import Explore from "@/views/Explore.vue";
import Quizzes from "@/views/Quizzes.vue";
import QuizRunner from "@/views/QuizRunner.vue";

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  { path: '/register', component: createAccount},
  { path: '/library/create', component: AddFlashcard},
  { path: '/flash', component: flash},
  { path: '/library/view', component: Set},
  { path: '/set', component: Set},
  { path: '/library/view/:id', component: View, props: true },
  {path: '/view', component: View},
  { path: '/settings', component: Settings},
  { path: '/', component: Login },
  {path: "/quiz/create", component: Quizzes},
  {path: "/explore", component: Explore},
  { path: '/library/:id/edit', name: 'EditFlashcardSet', component: () => import('@/views/EditFlashcardSet.vue'), meta: { requiresAuth: true } },
  {path: "/quiz", name: "QuizRunner", component: QuizRunner,},
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
