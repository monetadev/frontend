import { createApp, h } from "vue";
import { ApolloProvider } from "@vue/apollo-option";  // Import ApolloProvider
import apolloClient from "./apolloClient";  // Import your Apollo Client instance
import App from "./App.vue";

const app = createApp({
  setup() {
    return () => h(App);
  },
});

app.use(ApolloProvider, { defaultClient: apolloClient });  // Use ApolloProvider with the Apollo Client
app.mount("#app");
