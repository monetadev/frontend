import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = createUploadLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include'
});

const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:8080/graphql',
    connectionParams: {
        // Add authentication if needed
    },
}));

const splitLink = split(
    // Check if it's a subscription
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink, // Use WebSocket for subscriptions
    httpLink // Use HTTP for queries and mutations
);

const cache = new InMemoryCache({
    typePolicies: {
        Subscription: {
            fields: {
                flashcardSetChat: {
                    merge: false
                }
            }
        }
    }
});

const apolloClient = new ApolloClient({
    link: splitLink,
    cache
});

export default apolloClient;
