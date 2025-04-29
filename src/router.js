import { createRouter, createWebHistory } from 'vue-router';

// --- Merged Imports ---
import Dashboard from './views/Dashboard.vue';
import ResetPassword from './views/ResetPassword.vue';
import Login from './views/Login.vue';
import createAccount from './views/createAccount.vue';
import AddFlashcard from './views/AddFlashcard.vue';
import Settings from './views/Settings.vue';
import Set from './views/flashsetViewer.vue';
import View from './views/flashcardViewer.vue';
import Create from './views/createSet.vue';
import Quizzes from './views/Quizzes.vue';
import QuizRunner from "@/views/QuizRunner.vue";
import DefineView from "@/views/defineView.vue";
import landing from "@/views/landingPage.vue"; // Keep landing page import
import MatchingGame from "@/views/MatchingGame.vue"; // Keep main's imports
import EditFlashcardSet from "@/views/EditFlashcardSet.vue"; // Keep main's imports
import Explore from "@/views/Explore.vue"; // Keep main's imports
// --- End Merged Imports ---

const routes = [
  // --- Routes from 63-landing-page ---
  { path: '/', component: landing },
  { path: '/dashboard', component: Dashboard },
  // --- End Routes from 63-landing-page ---

  // --- Common/Main Routes ---
  { path: '/login', component: Login },
  { path: '/reset-password', component: ResetPassword },
  { path: '/register', component: createAccount },
  { path: '/library/summary/:id', component: () => import('@/views/FlashcardSummary.vue') }, // Keep this
  { path: '/library/create', component: AddFlashcard },
  { path: '/library/view', component: Set },
  { path: '/library/view/:id', component: View, props: true },
  { path: '/library/view/:id/edit', component: EditFlashcardSet }, // Keep this
  { path: '/explore', component: Explore }, // Keep this
  { path: '/settings', component: Settings },
  { path: '/create', component: Create },
  { path: "/quiz/run", name: "QuizRunner", component: QuizRunner },
  { path: "/quiz/create", name: "Quizzes", component: Quizzes },
  { path: "/define", name: "Define", component: DefineView },
  { path: "/matching-game/:id", component: MatchingGame }, // Keep this route from main
  
];

const router = createRouter({
  history: createWebHistory(),
  routes // Use the updated routes array
});

router.beforeEach((to, from, next) => {
  console.log('Attempting to navigate to:', to.path);
  next();
});

export default router;