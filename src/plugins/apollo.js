import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";


const httpLink = createUploadLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include'
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
    link: httpLink,
    cache
});

export default apolloClient;
