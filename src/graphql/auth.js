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

export const FIND_ALL_USERS = gql`
    query FindAllUsers ($page: Int!, $size: Int!){
        findAllUsers(page: $page, size: $size) {
            items{
                id
                username
                email
                firstName
                lastName
                creationDate
                lastUpdated
                roles{
                    id
                    name
                }
            }
            pageInfo{
                totalPages
                totalElements
                currentPage
            }
        }
    }
`;

export const GET_ALL_MY_SETS = gql`
    query Me {
        me{
            flashcardSets{
                id
                author{
                    id
                    username
                }
                creationDate
                title
                description
                flashcards{
                    id
                    term
                    definition
                    updatedAt
                }
            }
        }
    }
`;

export const GET_FLASHCARD_SET_BY_ID = gql`
    query findFlashcardSetByID($id: UUID!){
        findFlashcardSetById(id: $id) {
            id
            title
            description
            creationDate
            author{
                username
            }
            flashcards{
                id
                term
                definition
                position
            }
        }
    }
`;

//Uses default pagination values (page 0, size 10)
export const GET_ROLES = gql`
    query roles {
        roles{
            items{
                id
                name
                privileges{
                    id
                    name
                }
            }
            pageInfo{
                totalPages
                totalElements
                currentPage
            }
        }
    }
`;

//Custom pagination values

export const GET_ROLES_PAGINATED = gql`
    query GetRolesPaginated($page: Int, $size: Int) {
        roles(page: $page, size: $size) {
            items {
                id
                name
                privileges {
                    id
                    name
                }
            }
            pageInfo {
                totalPages
                totalElements
                currentPage
            }
        }
    }
`;


export const ASSIGN_ROLE_TO_USER = gql`
    mutation AssignRoleToUser($userId: UUID!, $roleId: UUID!) {
        assignRoleToUser(userId: $userId, roleId: $roleId) {
            id
            username
            creationDate
            roles {
                id
                name
            }
        }
    }
`;

// export const CHANGE_PASSWORD = gql`
//     mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
//         changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
//              id
//         }
//     }
// `;