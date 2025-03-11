import gql from 'graphql-tag';

export const LOGIN_USER = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token
            user {
                id
                username
                email
                firstName
                lastName
            }
        }
    }
`;

export const REGISTER_USER = gql`
    mutation Register($input: UserRegInput!) {
        register(input: $input) {
            token
            user {
                id
                username
                email
                firstName
                lastName
            }
        }
    }
`;

export const ME_QUERY = gql`
    query Me {
        me {
            id
            username
            email
            firstName
            lastName
        }
    }
`;