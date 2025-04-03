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


const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  {path: '/signup', component: createAccount},
  {path: '/add-flashcard', component: AddFlashcard},
  { path: '/quizzes', component: Quizzes},
  {path: '/my-stuffs', component: Set, exact : true},
  {path: '/view', component: View},
  { path: '/settings', component: Settings},
  {path: '/create', component: Create},

  


  // { path: '/:pathMatch(.*)*', redirect: '/login' } // Catch-all route to handle undefined routes
  

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
