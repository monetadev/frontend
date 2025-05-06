import {
    ApolloClient,
    InMemoryCache,
    split
} from "@apollo/client/core";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import {getMainDefinition} from '@apollo/client/utilities';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';

// --- Configuration ---
const VITE_GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:8080/graphql';
const VITE_GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql';
const isDevelopment = import.meta.env.DEV;

// --- HTTP Link (with Upload Support) ---
const httpLink = createUploadLink({
    uri: VITE_GRAPHQL_HTTP_URL,
    credentials: 'include',
    headers: {
        "Apollo-Require-Preflight": "true"
    },
});

// --- WebSocket Link (Subscriptions) ---
const wsLink = new GraphQLWsLink(createClient({
    url: VITE_GRAPHQL_WS_URL,
    shouldRetry: () => true, // Automatic retries on disconnect
    connectionParams: async () => {
        return {}; // Cookie auth on handshake is enough
    },
}));

// --- Split Link ---
// Directs operations to WebSocket or HTTP link based on operation type
const splitLink = split(
    ({query}) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink, // if subscription, use WebSocket link
    httpLink
);

// --- Apollo Cache ---
const cache = new InMemoryCache({
    typePolicies: {
        Subscription: {
            fields: {
                flashcardSetChat: {
                    merge: false,
                },
            },
        },
    }
});

// --- Apollo Client Instance ---
const apolloClient = new ApolloClient({
    link: splitLink,
    cache: cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
    connectToDevTools: isDevelopment,
});

export default apolloClient;