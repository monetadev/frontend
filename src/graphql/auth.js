import gql from 'graphql-tag';

export const LOGIN_USER = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            id
            username
            email
            firstName
            lastName
        }
    }
`;

export const REGISTER_USER = gql`
    mutation Register($input: UserRegInput!) {
        register(input: $input) {
            id
            username
            email
            firstName
            lastName
            
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
            creationDate
            lastUpdated
        }
    }
`;

export const UPDATE_USER = gql`
    mutation UpdateUser($id: UUID!, $username: String, $email: String, $firstName: String, $lastName: String) {
        updateUser(id: $id, username: $username, email: $email, firstName: $firstName, lastName: $lastName) {
            firstName
            lastName
            username
            email
            lastUpdated
        }
    }
`;

// export const FIND_ALL_USERS = gql`
//     query FindAllUsers ($page: Int!, $size: Int!){
//         findAllUsers(page: $page, size: $size) {
//             items{
//
//             }
//             pageInfo{
//
//             }
//         }
//     }
// `;




// export const CHANGE_PASSWORD = gql`
//     mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
//         changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
//              id
//         }
//     }
// `;