import './assets/main.css';
import { createApp, provide, h } from 'vue';
import apolloClient from './plugins/apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router.js'; // Import the router

const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient);
    },
    render: () => h(App)
});

app.use(router);
app.mount('#app');
