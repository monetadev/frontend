import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue';
import createAccount  from './views/createAccount.vue';
import AddFlashcard  from './views/AddFlashcard.vue';
import Settings from './views/Settings.vue';
import Set from './views/flashsetViewer.vue';
import View from './views/flashcardViewer.vue';
import Create from './views/createSet.vue';
import Quizzes from './views/Quizzes.vue';
import QuizRunner from "@/views/QuizRunner.vue";
import DefineView from "@/views/defineView.vue";

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  { path: '/register', component: createAccount},
  { path: '/library/create', component: AddFlashcard},
  { path: '/library/view', component: Set},
  { path: '/library/view/:id', component: View, props: true },
  { path: '/settings', component: Settings},
  {path: '/create', component: Create},
  {path: "/quiz/run", name: "QuizRunner", component: QuizRunner,},
  { path: "/quiz/create", name: "Quizzes", component: Quizzes },
  { path: "/define", name: "Define", component: DefineView }
];
 
const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  console.log('Attempting to navigate to:', to.path);
  next();
});

export default router;
