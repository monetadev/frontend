import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";

//HTTP connection to the API
const httpLink = createHttpLink({
    // Replace this with your actual GraphQL API URL
  uri: "https://your-graphql-endpoint.com/graphql", 
});
//Cache Implementation
const cache = new InMemoryCache();


const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
