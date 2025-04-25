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
            files{
                id
                filename
                filePath
                contentType
            }
            roles{
                name
            }
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

export const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($input: Upload!) {
    uploadProfilePicture(input: $input) {
        filename
        originalFilename
        size
        contentType
        path
    }
  }
`;

export const DELETE_PROFILE_PICTURE = gql`
  mutation DeleteCurrentUserProfilePicture {
    deleteCurrentUserProfilePicture
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
            id
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
            isPublic
            creationDate
            lastUpdated
            author{
                id
                username
            }
            flashcards{
                id
                term
                definition
                position
                updatedAt
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

export const CREATE_FLASHCARD_SET = gql`
    mutation CreateFlashcardSet($input: FlashcardSetInput!) {
        createFlashcardSet(flashcardSetInput: $input) {
            id
            title
            description
            isPublic
            flashcards {
                term
                definition
                position
            }
        }
    }
`;

export const DELETE_FLASHCARD_SET = gql`
    mutation DeleteFlashcardSet($userId: UUID!, $setId: UUID!) {
        deleteFlashcardSet(userId: $userId, setId: $setId) 
}`


export const UPDATE_FLASHCARD_SET = gql`
    mutation UpdateFlashcardSet($id: UUID!, $flashcardSetInput: FlashcardSetInput!) {
        updateFlashcardSet(id: $id, flashcardSetInput: $flashcardSetInput) {
            id
            title
            description
            isPublic
            lastUpdated
            flashcards {
                id
                term
                definition
                position
                updatedAt
            }
        }
    }
`;


export const FLASHCARD_SET_CHAT = gql`
    subscription FlashcardSetChat($conversationId: UUID!, $setId: UUID!, $message: String!) {
        flashcardSetChat(conversationId: $conversationId, setId: $setId, message: $message)
    }
`;

export const FIND_PUBLIC_FLASHCARD_SETS = gql`
    query FindPublicFlashcardSets($page: Int!, $size: Int!) {
        findPublicFlashcardSets(page: $page, size: $size) {
            items {
                id
                title
                description
                creationDate
                author {
                    id
                    username
                }
                flashcards {
                    id
                    term
                    definition
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

export const UPLOAD_DOCUMENT = gql`
    mutation uploadDocument($input: Upload!) {
        uploadDocument(input: $input) {
            filename
            originalFilename
            size
            contentType
            path
        }
    }
`;

export const GENERATE_FLASHCARDS = gql`
    mutation generateFlashcards($options: FlashcardGenOptions!) {
        generateFlashcardSet(options: $options) {
            title
            description
            generatedFlashcards {
                term
                definition
                position
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