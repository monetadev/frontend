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
            roles {
                id
                name
            }
            flashcardSets {
                id
            }
            files {
                id
                filename
                originalFilename
                contentType
                fileSize
                uploadedDate
            }
        }
    }
`;

export const MY_LOGIN_STREAK_QUERY = gql`
    query MyLoginStreak {
        myLoginStreak
    }
`;

export const FIND_MY_SETS_QUERY = gql`
    query FindMySets($id: UUID!, $page: Int, $size: Int) {
        findFlashcardSetByAuthorId(id: $id, page: $page, size: $size) {
            items {
                id
                title
                description
                creationDate
                isPublic
                flashcards {
                    id
                }
                author {
                    id
                    username
                    firstName
                    lastName
                    files {
                        id
                        filename
                        contentType
                    }
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

export const FIND_MY_RECENT_SETS_QUERY = gql`
    query FindMyRecentSets($id: UUID!, $page: Int, $size: Int) {
        findFlashcardSetByAuthorId(id: $id, page: $page, size: $size) {
            items {
                id
                title
                description
                creationDate
                flashcards {
                    id
                }
                author {
                    id
                    username
                    firstName
                    lastName
                    files {
                        id
                        filename
                        contentType
                    }
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

export const FIND_USER_BY_USERNAME = gql`
    query FindUserByUsername($username: String!) {
        findUserByUsername(username: $username) {
            id
            username
            email
            firstName
            lastName
            creationDate
            lastUpdated
            roles {
                id
                name
            }
            flashcardSets {
                id
            }
            files {
                id
                filename
                contentType
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
    }
`;

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
                    firstName
                    lastName
                    files {
                        id
                        filename
                        contentType
                    }
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

export const SEARCH_PUBLIC_FLASHCARD_SETS = gql`
    query SearchPublicFlashcardSets($query: String!, $page: Int, $size: Int) {
        searchPublicFlashcardSets(query: $query, page: $page, size: $size) {
            items {
                id
                title
                description
                creationDate
                author {
                    id
                    username
                    firstName
                    lastName
                    files {
                        id
                        filename
                        contentType
                    }
                }
                flashcards {
                    id
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

export const DELETE_DOCUMENT = gql`
    mutation DeleteDocument($id: UUID!) {
        deleteDocument(id: $id)
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

export const DELETE_USER = gql`
    mutation deleteUser($id: UUID!) {
        deleteUser(id: $id)
    }
`;

export const GET_ROLES = gql`
    query getRoles($page: Int, $size: Int) {
        roles(page: $page, size: $size) {
            items {
                id
                name
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
    mutation assignRoleToUser($userId: UUID!, $roleId: UUID!) {
        assignRoleToUser(userId: $userId, roleId: $roleId) {
            id
            username
            roles {
                id
                name
            }
        }
    }
`;

export const REMOVE_ROLE_FROM_USER = gql`
    mutation removeRoleFromUser($userId: UUID!, $roleId: UUID!) {
        removeRoleFromUser(userId: $userId, roleId: $roleId) {
            id
            username
            roles {
                id
                name
            }
        }
    }
`;

export const GENERATE_QUIZ_MUTATION = gql`
    mutation GenerateQuiz($options: QuizGenOptions!) {
        generateQuiz(options: $options) {
            id
            title
            description
            questions {
                content
                position
                questionType
                options {
                    content
                    position
                }
            }
        }
    }
`;

export const GET_MY_QUIZZES = gql`
    query GetMyQuizzes($page: Int, $size: Int) {
        getMyQuizzes(page: $page, size: $size) {
            items {
                id
                title
                description
                creationDate
                author {
                    id
                    username
                    firstName
                    lastName
                    files {
                        id
                        filename
                        contentType
                    }
                }
                flashcardSet {
                    id
                    title
                    author {
                        id
                        username
                        firstName
                        lastName
                        files {
                            id
                            filename
                            contentType
                        }
                    }
                }
                questions {
                    id
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

export const GET_QUIZ_BY_ID = gql`
    query GetQuizById($id: UUID!) {
        findQuizById(id: $id) {
            id
            title
            description
            creationDate
            author {
                id
                username
                # Consider adding firstName, lastName for more complete author display
            }
            flashcardSet {
                id
                title
            }
            questions {
                id
                content
                position
                questionType
                options {
                    id
                    content
                    position
                    isCorrect
                }
            }
        }
    }
`;

export const GRADE_QUIZ_MUTATION = gql`
    mutation GradeQuiz($quiz: QuizAttemptInput!) {
        gradeQuiz(quiz: $quiz) {
            id
            score
            quiz {
                id
                title
            }
            user {
                id
                username
            }
        }
    }
`;

export const GET_USER_QUIZ_ATTEMPTS_BY_QUIZ = gql`
    query GetUserQuizAttemptsByQuizId($userId: UUID, $quizId: UUID, $page: Int, $size: Int) {
        # Fetches attempts made by a specific user on a specific quiz
        getUserQuizAttemptsByQuizId(userId: $userId, quizId: $quizId, page: $page, size: $size) {
            items {
                id
                score
                attemptDate
            }
            pageInfo {
                totalPages
                totalElements
                currentPage
            }
        }
    }
`;

export const GET_QUIZ_ATTEMPT = gql`
    query GetQuizAttempt($attemptId: UUID!) {
        getQuizAttempt(attemptId: $attemptId) {
            id
            score
            attemptDate
            quiz { id title }
            user { id username }
            responses {
                id
                response
                isCorrect
                feedback
                question {
                    id
                    position
                    questionType
                    content
                    options {
                        id
                        content
                        position
                        isCorrect
                    }
                }
            }
        }
    }
`;

export const DELETE_QUIZ_MUTATION = gql`
    mutation DeleteQuiz($userId: UUID!, $quizId: UUID!) {
        deleteQuiz(userId: $userId, quizId: $quizId) # Ensure return type matches schema
    }
`;

export const DELETE_QUIZ_ATTEMPT_MUTATION = gql`
    mutation DeleteQuizAttempt($attemptId: UUID!) {
        deleteQuizAttempt(attemptId: $attemptId) # Ensure return type matches schema
    }
`;

// export const CHANGE_PASSWORD = gql`
//     mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
//         changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
//              id
//         }
//     }
// `;