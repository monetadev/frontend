import './assets/main.css';
import { createApp, provide, h } from 'vue';
import apolloClient from './plugins/apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router.js'; // Import the router
import '@fortawesome/fontawesome-free/css/all.css';
import { createPinia } from 'pinia'

const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient);
    },
    render: () => h(App)
});

app.use(createPinia());
app.use(router);

const storedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.classList.add(`${storedTheme}--theme`);

app.mount('#app');
