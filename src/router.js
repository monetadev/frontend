import {createRouter, createWebHistory} from 'vue-router';

// --- Lazy Load Route Components ---
// Flashcard Components
const CreateSet = () => import('@/views/flashcard/CreateSet.vue');
const MatchSet = () => import('@/views/flashcard/MatchSet.vue');
const ReadSet = () => import('@/views/flashcard/ReadSet.vue');
const StudySet = () => import('@/views/flashcard/StudySet.vue');
const UpdateSet = () => import('@/views/flashcard/UpdateSet.vue');

// Library Components
const ProfileLibrary = () => import('@/views/library/ProfileLibrary.vue');
const SearchLibrary = () => import('@/views/library/SearchLibrary.vue');

// Profile Components
const PrivateProfile = () => import('@/views/profile/PrivateProfile.vue');
const PublicProfile = () => import('@/views/profile/PublicProfile.vue');

// Public Components
const Landing = () => import('@/views/public/Landing.vue');
const Login = () => import('@/views/public/Login.vue');
const NotFound = () => import('@/views/public/NotFound.vue');
const Register = () => import('@/views/public/Register.vue');

// Quiz Components
const QuizLibrary = () => import('@/views/quiz/QuizLibrary.vue');
const QuizOverview = () => import('@/views/quiz/QuizOverview.vue');
const CreateQuiz = () => import('@/views/quiz/CreateQuiz.vue');
const TakeQuiz = () => import('@/views/quiz/TakeQuiz.vue');

// Settings Components
const AccountSettings = () => import('@/views/settings/AccountSettings.vue');
const AdminSettings = () => import('@/views/settings/AdminSettings.vue');
const DocumentSettings = () => import('@/views/settings/DocumentSettings.vue');


// --- Route Definitions ---
const routes = [
    // --- Public / Authentication ---
    {
        path: '/',
        name: 'landing',
        component: Landing,
        meta: {requiresAuth: false}
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {requiresAuth: false, requiresGuest: true}
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {requiresAuth: false, requiresGuest: true}
    },

    // --- Core Authenticated Views ---
    {
        path: '/explore',
        name: 'searchLibrary',
        component: SearchLibrary,
        meta: {requiresAuth: true}
    },
    {
        path: '/documents',
        name: 'documentSettings',
        component: DocumentSettings,
        meta: {requiresAuth: true}
    },

    // --- Library & Sets ---
    {
        path: '/library',
        name: 'privateProfileLibrary',
        component: ProfileLibrary,
        meta: {requiresAuth: true}
    },
    {
        path: '/library/:username',
        name: 'publicProfileLibrary',
        component: ProfileLibrary,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/library/set/:id',
        name: 'readSet',
        component: ReadSet,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/library/set/:id/study',
        name: 'studySet',
        component: StudySet,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/library/set/:id/edit',
        name: 'updateSet',
        component: UpdateSet,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/library/set/:id/match',
        name: 'matchSet',
        component: MatchSet,
        props: true,
        meta: {requiresAuth: true}
    },

    // --- Creation ---
    {
        path: '/create/set',
        name: 'createSet',
        component: CreateSet,
        meta: {requiresAuth: true}
    },
    {
        path: "/create/quiz",
        name: "createQuiz",
        component: CreateQuiz,
        meta: {requiresAuth: true}
    },

    // --- Quizzes ---
    {
        path: "/quiz/:id/take",
        name: "takeQuiz",
        component: TakeQuiz,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: "/quiz/:id",
        name: "quizOverview",
        component: QuizOverview,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: "/quiz",
        name: "quizLibrary",
        component: QuizLibrary,
        meta: {requiresAuth: true}
    },
    {
        path: "/quiz/:id/take/:attempt",
        name: "quizAttemptResult",
        component: TakeQuiz,
        props: true,
        meta: {requiresAuth: true}
    },
    // --- User Profile & Settings ---
    {
        path: "/profile",
        name: "privateProfile",
        component: PrivateProfile,
        meta: {requiresAuth: true}
    },
    {
        path: "/profile/:username",
        name: "publicProfile",
        component: PublicProfile,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/settings',
        name: 'accountSettings',
        component: AccountSettings,
        meta: {requiresAuth: true}
    },

    // --- Admin ---
    {
        path: '/settings/admin',
        name: 'adminSettings',
        component: AdminSettings,
        meta: {requiresAuth: true, requiresAdmin: true}
    },

    // --- Catch-all 404 ---
    {
        path: '/:pathMatch(.*)*',
        name: 'notFound',
        component: NotFound,
        meta: {requiresAuth: false}
    }
];

// --- Helper Function for Auth Check ---
const checkAuthFlag = () => {
    try {
        return sessionStorage.getItem('app_auth_status') === 'logged_in';
    } catch (e) {
        return false;
    }
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {top: 0, behavior: 'smooth'};
        }
    },
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
    const isAuthenticatedByFlag = checkAuthFlag();

    if (requiresGuest && isAuthenticatedByFlag) {
        // Prevent authenticated users from accessing login/register pages
        next({name: 'privateProfileLibrary'});
    } else if (requiresAuth && !isAuthenticatedByFlag) {
        // If route requires public and the quick flag check fails, redirect to login and remember where they wanted to go.
        next({name: 'login', query: {redirect: to.fullPath}});
    } else {
        next();
    }
});

export default router;
