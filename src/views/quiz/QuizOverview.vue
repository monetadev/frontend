<template>
  <main class="quiz-overview-content">
    <div v-if="(quizLoading && !quiz) || meLoading" class="loading-indicator full-page-indicator">
      <font-awesome-icon :icon="icons.spinner" spin size="3x" />
      <p>Loading quiz details...</p>
    </div>

    <div v-else-if="(quizError && !quiz) || meError" class="error-message full-page-error">
      <font-awesome-icon :icon="icons.triangleExclamation" size="3x" class="error-icon" />
      <p>Could not load quiz details.</p>
      <pre v-if="quizError">Quiz Error: {{ quizError.message }}</pre>
      <pre v-if="meError">User Error: {{ meError.message }}</pre>
      <router-link :to="{ name: 'quizLibrary' }" class="action-button error-action">Back to My Quizzes</router-link>
    </div>

    <div v-else-if="!quiz && !quizLoading" class="info-state full-page-error">
      <font-awesome-icon :icon="icons.triangleExclamation" size="2x" />
      <p>Quiz not found.</p>
      <router-link :to="{ name: 'quizLibrary' }" class="action-button error-action">Back to My Quizzes</router-link>
    </div>

    <div v-else-if="quiz && currentUser" class="quiz-view-layout">

      <aside class="quiz-sidebar">
        <section class="settings-section attempt-history-section">
          <h3><font-awesome-icon :icon="icons.history" /> Attempt History</h3>

          <button
              v-if="selectedAttemptId"
              @click="deselectAttempt"
              class="action-button secondary back-from-attempt-button"
          >
            <font-awesome-icon :icon="icons.chevronLeft" />
            Back to Quiz Preview
          </button>

          <div v-if="attemptsLoading" class="sidebar-loading">
            <font-awesome-icon :icon="icons.spinner" spin /> Loading history...
          </div>
          <div v-else-if="attemptsError" class="sidebar-error">
            Could not load history.<br/>({{ attemptsError.message }})
          </div>
          <div v-else-if="!attempts || attempts.length === 0" class="sidebar-info">
            No attempts recorded yet for this quiz.
          </div>
          <div v-else class="attempt-list-container">
            <ul class="attempt-list">
              <li v-for="(attempt, index) in attempts" :key="attempt.id" class="attempt-item">
                <button
                    @click="selectAttempt(attempt.id)"
                    class="attempt-link"
                    :class="{ 'active': selectedAttemptId === attempt.id }"
                    :title="`Review Attempt #${ attemptsTotalElements - (attemptsCurrentPage * attemptsPageSize) - index}`"
                >
                  <span class="attempt-number">Attempt #{{ attemptsTotalElements - (attemptsCurrentPage * attemptsPageSize) - index }}</span>
                  <span class="attempt-score">Score: {{ attempt.score }}%</span>
                </button>
              </li>
            </ul>
            <div v-if="attemptsTotalPages > 1" class="attempt-pagination">
              <button @click="prevAttemptsPage" :disabled="attemptsLoading || attemptsCurrentPage === 0" class="pagination-button" aria-label="Previous attempts page">&lt;</button>
              <span>{{ attemptsCurrentPage + 1 }} / {{ attemptsTotalPages }}</span>
              <button @click="nextAttemptsPage" :disabled="attemptsLoading || attemptsCurrentPage >= attemptsTotalPages - 1" class="pagination-button" aria-label="Next attempts page">&gt;</button>
            </div>
          </div>
          <div v-if="selectedAttemptLoading && !selectedAttemptData" class="sidebar-loading attempt-fetch-loading">
            <font-awesome-icon :icon="icons.spinner" spin /> Loading attempt details...
          </div>
          <div v-if="selectedAttemptError" class="sidebar-error attempt-fetch-error">
            Failed to load attempt details. {{ selectedAttemptError.message }}
          </div>
        </section>
      </aside>

      <section class="quiz-main-content">

        <div v-if="selectedAttemptData" class="quiz-details-card attempt-review-card settings-section">
          <header class="quiz-header">
            <div class="header-main">
              <h1 class="quiz-title">Reviewing Attempt</h1>
              <p class="quiz-description">Quiz: {{ selectedAttemptData.quiz?.title || quiz.title }}</p>
            </div>
            <div class="header-info">
              <span class="attempt-score-header">Score: {{ selectedAttemptData.score }}%</span>
              <p class="attempt-date-header">Taken: {{ formatDate(selectedAttemptData.attemptDate) }}</p>
            </div>
          </header>

          <section class="quiz-questions-section">
            <h2 class="section-title">Attempt Details</h2>
            <div v-if="selectedAttemptData.responses && selectedAttemptData.responses.length > 0" class="questions-list">
              <div
                  v-for="(question, index) in sortedBaseQuestions"
                  :key="question.id"
                  class="question-item attempt-question-item"
              >
                <div class="question-header">
                  <div>
                    <span class="question-number">Q{{ question.position || (index + 1) }}.</span>
                    <span class="question-type-badge">{{ formatQuestionType(question.questionType) }}</span>
                  </div>
                  <span class="correctness-badge" :class="getAttemptResponseForQuestion(question.id)?.isCorrect ? 'correct' : 'incorrect'">
                         <font-awesome-icon :icon="getAttemptResponseForQuestion(question.id)?.isCorrect ? icons.checkCircle : icons.timesCircle" />
                         {{ getAttemptResponseForQuestion(question.id)?.isCorrect ? 'Correct' : 'Incorrect' }}
                       </span>
                </div>
                <div class="question-content" v-html="renderMarkdown(question.content)"></div>
                <div class="user-answer-section">
                  <strong class="answer-label">Your Answer:</strong>
                  <div class="user-answer-value">
                    {{ formatUserResponse(getAttemptResponseForQuestion(question.id)?.response, question) || '(No answer submitted)' }}
                  </div>
                </div>
                <div class="correct-answer-section">
                  <div v-if="shouldDisplayOptions(question.questionType) || question.questionType === QuestionTypeEnum.TRUE_FALSE" class="correct-answer-value">
                    <strong class="answer-label">Correct Answer:</strong>
                    {{ getCorrectAnswerString(question) }}
                  </div>
                  <div v-if="question.questionType === QuestionTypeEnum.SHORT_ANSWER" class="correct-answer-value">
                    <strong class="answer-label">Correct Answer:</strong>
                    {{ getCorrectAnswerString(question) }}
                  </div>
                  <div v-if="getAttemptResponseForQuestion(question.id)?.feedback" class="feedback-section">
                    <strong class="answer-label">Feedback:</strong>
                    <div class="feedback-content">{{ getAttemptResponseForQuestion(question.id)?.feedback }}</div>
                  </div>
                </div>
                <ul v-if="shouldDisplayOptions(question.questionType) && question.options && question.options.length > 0" class="options-list review-options">
                  <li v-for="(option, oIndex) in question.options" :key="option.id || oIndex"
                      class="option-item"
                      :class="{
                             'is-correct': option.isCorrect,
                             'user-selected': isOptionUserSelected(getAttemptResponseForQuestion(question.id)?.response, option.id, question.questionType)
                          }">
                    <span class="option-letter">{{ getOptionLetter(oIndex) }}.</span> {{ option.content }}
                  </li>
                </ul>
                <ul v-else-if="question.questionType === QuestionTypeEnum.TRUE_FALSE" class="options-list review-options">
                  <li class="option-item" :class="{ 'is-correct': getCorrectAnswerString(question) === 'True', 'user-selected': getAttemptResponseForQuestion(question.id)?.response === 'True'}">True</li>
                  <li class="option-item" :class="{ 'is-correct': getCorrectAnswerString(question) === 'False', 'user-selected': getAttemptResponseForQuestion(question.id)?.response === 'False'}">False</li>
                </ul>
              </div>
            </div>
          </section>

          <div class="page-actions">
            <button class="action-button secondary" @click="deselectAttempt">
              <font-awesome-icon :icon="icons.chevronLeft" />
              <span>Back to Quiz Preview</span>
            </button>
            <button
                v-if="selectedAttemptData"
                @click="openDeleteAttemptModal(selectedAttemptData)"
                class="action-button danger"
                title="Delete This Attempt"
                :disabled="deleteAttemptLoading"
            >
              <font-awesome-icon :icon="deleteAttemptLoading ? icons.spinner : icons.trashAlt" :spin="deleteAttemptLoading" />
              <span>Delete Attempt</span>
            </button>
          </div>
        </div>

        <div v-else class="quiz-details-card settings-section">
          <header class="quiz-header">
            <div class="header-main">
              <h1 class="quiz-title">{{ quiz.title }}</h1>
              <p v-if="quiz.description" class="quiz-description">{{ quiz.description }}</p>
              <p v-else class="quiz-description_italic">No description provided for this quiz.</p>
            </div>
            <div class="header-actions">
              <PrimaryButton
                  :text="`Start New Quiz (${quiz.questions?.length || 0} Questions)`"
                  @click="startQuiz"
                  class="start-quiz-button"
                  :disabled="quizLoading || !quiz.questions || quiz.questions.length === 0"
                  :title="quizLoading ? 'Loading...' : (!quiz.questions || quiz.questions.length === 0 ? 'This quiz has no questions.' : `Start a new attempt` )"
              />
            </div>
          </header>

          <section class="quiz-meta-section">
            <div class="meta-item"> <font-awesome-icon :icon="icons.user" class="meta-icon" /> <span>Authored by: <strong>{{ quiz.author?.username || 'Unknown Author' }}</strong></span> </div>
            <div class="meta-item"> <font-awesome-icon :icon="icons.layerGroup" class="meta-icon" /> <span>Based on Flashcard Set: <router-link v-if="quiz.flashcardSet?.id" :to="{ name: 'readSet', params: { id: quiz.flashcardSet.id } }"> <strong>{{ quiz.flashcardSet?.title || 'Unknown Set' }}</strong> </router-link> <strong v-else>{{ quiz.flashcardSet?.title || 'Unknown Set' }}</strong> </span> </div>
            <div class="meta-item"> <font-awesome-icon :icon="icons.calendarDays" class="meta-icon" /> <span>Created: <strong>{{ formatDate(quiz.creationDate) }}</strong></span> </div>
          </section>

          <section class="visibility-controls">
            <ToggleSwitch label="Preview Questions" v-model="questionsVisible" label-icon="eye" />
            <ToggleSwitch label="Preview Answers" v-model="answersVisible" :disabled="!questionsVisible" label-icon="eyeCheck" />
          </section>

          <section class="quiz-questions-section">
            <h2 class="section-title">Questions Preview</h2>
            <div v-if="quiz.questions && quiz.questions.length > 0" class="questions-list">
              <div v-for="(question, index) in sortedBaseQuestions"
                   :key="question.id || index"
                   class="question-item-wrapper"
                   :class="{ 'blur-container': !questionsVisible }">
                <div class="question-item">
                  <div class="question-header">
                    <div> <span class="question-number">Q{{ question.position || (index + 1) }}.</span> <span class="question-type-badge">{{ formatQuestionType(question.questionType) }}</span> </div>
                    <button v-if="answersVisible && questionsVisible" @click="toggleAnswer(question.id)" class="toggle-answer-btn" :aria-expanded="answerExpandedState[question.id] ? 'true' : 'false'" :aria-controls="`answer-${question.id}`" :title="answerExpandedState[question.id] ? 'Hide Answer' : 'Show Answer'"> <font-awesome-icon :icon="answerExpandedState[question.id] ? icons.chevronUp : icons.chevronDown" /> {{ answerExpandedState[question.id] ? 'Hide' : 'Show' }} Answer </button>
                  </div>
                  <div class="question-content-area">
                    <div class="question-content" v-html="renderMarkdown(question.content)"></div>
                    <ul v-if="shouldDisplayOptions(question.questionType) && question.options && question.options.length > 0" class="options-list">
                      <li v-for="(option, oIndex) in question.options" :key="option.id || oIndex" class="option-item" :class="{ 'correct-answer-reveal': answersVisible && option.isCorrect, 'incorrect-answer-reveal': answersVisible && !option.isCorrect }">
                        <div> <span class="option-letter">{{ getOptionLetter(oIndex) }}.</span> {{ option.content }} </div>
                        <span v-if="answersVisible && option.isCorrect" class="correct-answer-indicator" title="Correct Answer"> <font-awesome-icon :icon="icons.checkCircle" /> </span>
                      </li>
                    </ul>
                    <div v-else-if="question.questionType === QuestionTypeEnum.TRUE_FALSE" class="options-list">
                      <div v-if="!answersVisible"> <div class="option-item tf-option">True</div> <div class="option-item tf-option">False</div> </div>
                    </div>
                  </div>
                  <div v-if="questionsVisible && answersVisible" class="answer-reveal-container" :id="`answer-${question.id}`" :class="{ 'expanded': answerExpandedState[question.id] }">
                    <div v-if="answerExpandedState[question.id]" class="answer-content">
                      <div v-if="question.questionType === QuestionTypeEnum.TRUE_FALSE"> <strong>Correct Answer:</strong> {{ getCorrectAnswerString(question) }} </div>
                      <div v-if="question.questionType === QuestionTypeEnum.SHORT_ANSWER"> <strong>Correct Answer:</strong> {{ getCorrectAnswerString(question) }} </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="no-questions-text info-state">This quiz currently has no questions.</p>
          </section>

          <div class="page-actions">
            <button class="action-button secondary" @click="goBackToLibrary">
              <font-awesome-icon :icon="icons.chevronLeft" />
              <span>Back to My Quizzes</span>
            </button>
            <button
                v-if="quiz && currentUser && quiz.author?.id === currentUser.id"
                @click="openDeleteQuizModal"
                class="action-button danger"
                title="Delete This Quiz"
                :disabled="deleteQuizLoading"
            >
              <font-awesome-icon :icon="deleteQuizLoading ? icons.spinner : icons.trashAlt" :spin="deleteQuizLoading" />
              <span>Delete Quiz</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="showDeleteQuizModal" class="modal-overlay" @click.self="cancelDeleteQuiz">
        <div class="modal-content">
          <h4>Confirm Delete Quiz</h4>
          <p>
            Are you sure you want to permanently delete the quiz
            <strong>"{{ quizForModal?.title || 'this quiz' }}"</strong>?
            This action cannot be undone and will also delete all associated attempts.
          </p>
          <div class="modal-actions">
            <button @click="cancelDeleteQuiz" class="action-button secondary" :disabled="deleteQuizLoading">
              Cancel
            </button>
            <button @click="confirmDeleteQuiz" class="action-button danger" :disabled="deleteQuizLoading">
              <font-awesome-icon v-if="deleteQuizLoading" :icon="icons.spinner" spin/>
              <span v-else>Delete Quiz</span>
            </button>
          </div>
          <div v-if="deleteQuizError" class="error-message modal-error-message" style="margin-top: 15px;">
            Failed to delete quiz: {{ deleteQuizError.message }}
          </div>
        </div>
      </div>

      <div v-if="showDeleteAttemptModal" class="modal-overlay" @click.self="cancelDeleteAttempt">
        <div class="modal-content">
          <h4>Confirm Delete Attempt</h4>
          <p>
            Are you sure you want to permanently delete <strong>Attempt #{{ getAttemptNumberForModal(attemptToDeleteDetails) }}</strong>
            (Score: {{ attemptToDeleteDetails?.score }}%), taken on {{ formatDate(attemptToDeleteDetails?.attemptDate, { dateStyle: 'medium', timeStyle: 'short' }) }}?
            This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button @click="cancelDeleteAttempt" class="action-button secondary" :disabled="deleteAttemptLoading">
              Cancel
            </button>
            <button @click="confirmDeleteAttempt" class="action-button danger" :disabled="deleteAttemptLoading">
              <font-awesome-icon v-if="deleteAttemptLoading" :icon="icons.spinner" spin/>
              <span v-else>Delete Attempt</span>
            </button>
          </div>
          <div v-if="deleteAttemptError" class="error-message modal-error-message" style="margin-top: 15px;">
            Failed to delete attempt: {{ deleteAttemptError.message }}
          </div>
        </div>
      </div>
    </Teleport>

  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, Teleport } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useLazyQuery, useMutation } from '@vue/apollo-composable';
import { useToast } from "@/composables/useToast.js"; // Assuming this path is correct

// --- Component Imports ---
import PrimaryButton from '@/components/ui/PrimaryButton.vue';
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue';

// --- Libraries ---
import MarkdownIt from 'markdown-it';

// --- GraphQL ---
// IMPORTANT: Add these mutations to your graphql/auth.js file
// export const DELETE_QUIZ_MUTATION = gql`
//   mutation DeleteQuiz($userId: UUID!, $quizId: UUID!) {
//     deleteQuiz(userId: $userId, quizId: $quizId)
//   }
// `;
// export const DELETE_QUIZ_ATTEMPT_MUTATION = gql`
//   mutation DeleteQuizAttempt($attemptId: UUID!) {
//     deleteQuizAttempt(attemptId: $attemptId)
//   }
// `;
import {
  GET_QUIZ_BY_ID,
  GET_USER_QUIZ_ATTEMPTS_BY_QUIZ,
  ME_QUERY,
  GET_QUIZ_ATTEMPT,
  // Presumed names, ensure these are correctly exported from your auth.js
  // DELETE_QUIZ_MUTATION,
  // DELETE_QUIZ_ATTEMPT_MUTATION
} from "@/graphql/auth.js";

// --- Font Awesome ---
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faPlay, faUser, faLayerGroup,
  faCalendarDays, faChevronLeft, faListCheck, faToggleOn, faKeyboard, faTasks,
  faCheckCircle, faEye, faChevronDown, faChevronUp, faHistory, faTimesCircle,
  faTrashAlt // Added for delete
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation, faPlay, faUser, faLayerGroup, faCalendarDays,
    faChevronLeft, faListCheck, faToggleOn, faKeyboard, faTasks, faCheckCircle,
    faEye, faChevronDown, faChevronUp, faHistory, faTimesCircle, faTrashAlt
);

// --- Icons ---
const icons = {
  spinner: faSpinner, triangleExclamation: faTriangleExclamation, play: faPlay, user: faUser,
  layerGroup: faLayerGroup, calendarDays: faCalendarDays, chevronLeft: faChevronLeft,
  checkCircle: faCheckCircle, eye: faEye, eyeCheck: faCheckCircle, // eyeCheck was faCheckCircle, seems fine
  chevronDown: faChevronDown, chevronUp: faChevronUp, history: faHistory,
  timesCircle: faTimesCircle, trashAlt: faTrashAlt,
};

// --- Markdown ---
const md = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: true, quotes: '“”‘’', });

// --- Enums ---
const QuestionTypeEnum = Object.freeze({
  MULTIPLE_CHOICE_SINGLE_ANSWER: "MULTIPLE_CHOICE_SINGLE_ANSWER",
  MULTIPLE_CHOICE_MULTIPLE_ANSWER: "MULTIPLE_CHOICE_MULTIPLE_ANSWER",
  TRUE_FALSE: "TRUE_FALSE",
  SHORT_ANSWER: "SHORT_ANSWER"
});

// --- Router & Route ---
const route = useRoute();
const router = useRouter();
const { addToast } = useToast();

// --- State ---
const quizId = ref(route.params.id);
const questionsVisible = ref(false); // Default to hidden
const answersVisible = ref(false);
const answerExpandedState = ref({});
const attemptsCurrentPage = ref(0);
const attemptsPageSize = ref(10);
const selectedAttemptId = ref(null);
const selectedAttemptData = ref(null);

// Deletion Modals State
const showDeleteQuizModal = ref(false);
const quizForModal = ref(null); // To store quiz details for the modal
const showDeleteAttemptModal = ref(false);
const attemptToDeleteDetails = ref(null);


// --- Data Fetching ---
const { result: meResult, loading: meLoading, error: meError } = useQuery(ME_QUERY, null, { fetchPolicy: 'cache-first' });
const currentUser = computed(() => meResult.value?.me);
const loggedInUserId = computed(() => currentUser.value?.id);

const { result: quizResult, loading: quizLoading, error: quizError, refetch: refetchQuiz, onResult: onQuizResult } = useQuery(GET_QUIZ_BY_ID, { id: quizId.value }, () => ({
  enabled: !!quizId.value,
  fetchPolicy: 'cache-and-network',
  onError: (err) => { console.error("GraphQL error fetching quiz:", err); addToast({ msg: "Error fetching quiz details.", type: 'error'}); }
}));
const quiz = computed(() => quizResult.value?.findQuizById);

const sortedBaseQuestions = computed(() => {
  const questions = quiz.value?.questions;
  if (!Array.isArray(questions) || questions.length === 0) return [];
  return [...questions].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
});

const attemptsVariables = computed(() => ({
  quizId: quizId.value,
  userId: loggedInUserId.value, // Ensure your GQL query for attempts uses this if it's for *user* attempts
  page: attemptsCurrentPage.value,
  size: attemptsPageSize.value,
}));
const { result: attemptsResult, loading: attemptsLoading, error: attemptsError, refetch: refetchAttempts } = useQuery(GET_USER_QUIZ_ATTEMPTS_BY_QUIZ, attemptsVariables, () => ({
  enabled: !!quizId.value && !!loggedInUserId.value,
  fetchPolicy: 'cache-and-network',
  onError: (err) => { console.error("GraphQL error fetching attempts list:", err); addToast({ msg: "Error fetching attempt history.", type: 'error'});}
}));
const attempts = computed(() => attemptsResult.value?.getUserQuizAttemptsByQuizId?.items ?? []);
const attemptsPageInfo = computed(() => attemptsResult.value?.getUserQuizAttemptsByQuizId?.pageInfo);
const attemptsTotalPages = computed(() => attemptsPageInfo.value?.totalPages ?? 0);
const attemptsTotalElements = computed(() => attemptsPageInfo.value?.totalElements ?? 0);

const {
  result: selectedAttemptResult,
  loading: selectedAttemptLoading,
  error: selectedAttemptError,
  load: loadSelectedAttempt,
} = useLazyQuery(GET_QUIZ_ATTEMPT, null, { // Variables will be passed in load()
  fetchPolicy: 'network-only',
  onError: (err) => { console.error("GraphQL error fetching specific attempt:", err); addToast({ msg: "Error fetching attempt details.", type: 'error'});}
});

// --- Mutations ---
// Ensure DELETE_QUIZ_MUTATION and DELETE_QUIZ_ATTEMPT_MUTATION are imported from graphql/auth.js
// For this example, I'll use placeholder strings. Replace with actual imported mutations.
const DELETE_QUIZ_MUTATION_GQL = `mutation DeleteQuiz($userId: UUID!, $quizId: UUID!) { deleteQuiz(userId: $userId, quizId: $quizId) }`; // Placeholder
const DELETE_QUIZ_ATTEMPT_MUTATION_GQL = `mutation DeleteQuizAttempt($attemptId: UUID!) { deleteQuizAttempt(attemptId: $attemptId) }`; // Placeholder


const { mutate: deleteQuizMutate, loading: deleteQuizLoading, error: deleteQuizErrorRaw } = useMutation(
    // DELETE_QUIZ_MUTATION // Replace with actual import
    gql(DELETE_QUIZ_MUTATION_GQL) // Using placeholder
);
const deleteQuizError = computed(() => deleteQuizErrorRaw.value);


const { mutate: deleteAttemptMutate, loading: deleteAttemptLoading, error: deleteAttemptErrorRaw } = useMutation(
    // DELETE_QUIZ_ATTEMPT_MUTATION // Replace with actual import
    gql(DELETE_QUIZ_ATTEMPT_MUTATION_GQL) // Using placeholder
);
const deleteAttemptError = computed(() => deleteAttemptErrorRaw.value);


// --- Watchers & Lifecycle ---
watch(selectedAttemptResult, (newResult) => {
  selectedAttemptData.value = newResult?.getQuizAttempt || null;
});

watch(quiz, (newQuiz) => {
  if (newQuiz?.questions) {
    const initialState = {};
    const questionsToInit = sortedBaseQuestions.value.length > 0 ? sortedBaseQuestions.value : (newQuiz.questions || []);
    questionsToInit.forEach(q => { initialState[q.id] = answerExpandedState.value[q.id] ?? false; });
    answerExpandedState.value = initialState;
  } else {
    answerExpandedState.value = {};
  }
}, { immediate: true, deep: true });

onQuizResult(queryResult => {
  if (queryResult.data && queryResult.data.findQuizById === null && !queryResult.loading) {
    console.warn(`Quiz with ID ${quizId.value} not found or access denied.`);
    // router.replace({ name: 'quizLibrary' }); // Or show a specific message
  }
  if (queryResult.data?.findQuizById?.questions) {
    const initialState = {};
    sortedBaseQuestions.value.forEach(q => { initialState[q.id] = answerExpandedState.value[q.id] ?? false; });
    answerExpandedState.value = initialState;
  }
});

watch(() => route.params.id, (newId) => {
  if (newId && newId !== quizId.value) {
    quizId.value = newId;
    questionsVisible.value = false;
    answersVisible.value = false;
    answerExpandedState.value = {};
    attemptsCurrentPage.value = 0;
    selectedAttemptId.value = null;
    selectedAttemptData.value = null;
    // refetchQuiz({ id: newId }); // Handled by useQuery's reactive variables
  }
}, { immediate: true });

watch(questionsVisible, (newValue) => { if (!newValue) { answersVisible.value = false; } });

onMounted(() => {
  if (!quizId.value) {
    addToast({ msg: "No Quiz ID provided.", type: "error" });
    router.replace({ name: 'quizLibrary' });
  }
});

// --- Helper Functions ---
function formatDate(dateString, options = { dateStyle: 'long', timeStyle: 'short' }) {
  if (!dateString) return 'N/A';
  try { return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString)); }
  catch (e) { console.warn("Invalid date for formatting:", dateString); return 'Invalid Date'; }
}

function formatQuestionType(type) {
  switch (type) {
    case QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER: return "MC (Single)";
    case QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER: return "MC (Multi)";
    case QuestionTypeEnum.TRUE_FALSE: return "True/False";
    case QuestionTypeEnum.SHORT_ANSWER: return "Short Answer";
    default: return type ? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Type';
  }
}

function shouldDisplayOptions(questionType) {
  return [ QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER, QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER, ].includes(questionType);
}

function getOptionLetter(index) { return String.fromCharCode(65 + index); }

function renderMarkdown(content) {
  if (typeof content !== 'string') content = String(content || '');
  return md.render(content);
}

function getCorrectAnswerString(question) {
  if (!question || !question.options || question.options.length === 0) {
    // For SHORT_ANSWER, the correct answer might not be in options if options store potential answers and one is marked correct.
    // This function seems tailored for MC/TF. For Short Answer, it might need direct access to a correct answer field if not in options.
    // Assuming for now that Short Answer correct response is the content of the first 'isCorrect' option.
    const correctOption = question.options.find(opt => opt.isCorrect);
    return correctOption ? correctOption.content : 'N/A';
  }
  const correctOption = question.options.find(opt => opt.isCorrect);
  return correctOption ? correctOption.content : 'No correct answer specified';
}

function toggleAnswer(questionId) {
  if (answerExpandedState.value.hasOwnProperty(questionId)) {
    answerExpandedState.value[questionId] = !answerExpandedState.value[questionId];
  }
}

// --- Attempt Review Helpers ---
function getAttemptResponseForQuestion(questionId) {
  if (!selectedAttemptData.value || !selectedAttemptData.value.responses) return null;
  return selectedAttemptData.value.responses.find(r => r.question?.id === questionId);
}

function formatUserResponse(responseString, question) {
  if (responseString === null || responseString === undefined) return null;
  if (question.questionType === QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER || question.questionType === QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER) {
    try {
      const responseIds = responseString.split(',');
      const responseContents = responseIds.map(id => question.options?.find(opt => opt.id === id)?.content).filter(Boolean);
      return responseContents.join(', ') || responseString;
    } catch (e) {
      console.warn("Error formatting user response for MC: ", responseString, e);
      return responseString; // fallback
    }
  }
  return responseString;
}

function isOptionUserSelected(responseString, optionId, questionType) {
  if (responseString === null || responseString === undefined) return false;
  try {
    if (questionType === QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER) { return responseString === optionId; }
    else if (questionType === QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER) { return responseString.split(',').includes(optionId); }
  } catch (e) {
    console.warn("Error checking if option selected: ", responseString, optionId, e);
  }
  return false;
}

// --- Attempt History / Selection ---
function selectAttempt(attemptIdToSelect) {
  if (!attemptIdToSelect) return;
  selectedAttemptId.value = attemptIdToSelect;
  selectedAttemptData.value = null; // Clear previous
  loadSelectedAttempt({ attemptId: attemptIdToSelect });
}

function deselectAttempt() {
  selectedAttemptId.value = null;
  selectedAttemptData.value = null;
}

// --- Attempt History Pagination ---
function nextAttemptsPage() { if (attemptsCurrentPage.value < (attemptsTotalPages.value || 0) - 1) { attemptsCurrentPage.value++; } }
function prevAttemptsPage() { if (attemptsCurrentPage.value > 0) { attemptsCurrentPage.value--; } }

// --- Delete Quiz ---
function openDeleteQuizModal() {
  if (!quiz.value) return;
  quizForModal.value = quiz.value; // Store current quiz for modal display
  showDeleteQuizModal.value = true;
}
function cancelDeleteQuiz() {
  showDeleteQuizModal.value = false;
  quizForModal.value = null;
}
async function confirmDeleteQuiz() {
  if (!quizForModal.value || !currentUser.value?.id) {
    addToast({ msg: "Cannot delete quiz: Missing information.", type: "error" });
    return;
  }
  try {
    const result = await deleteQuizMutate({ userId: currentUser.value.id, quizId: quizForModal.value.id });
    if (result?.data?.deleteQuiz) { // Check your mutation's return structure
      addToast({ msg: "Quiz deleted successfully.", type: "success" });
      router.push({ name: 'quizLibrary' });
      showDeleteQuizModal.value = false;
    } else {
      const errorMsg = result?.errors?.[0]?.message || "Failed to delete quiz.";
      addToast({ msg: errorMsg, type: "error" });
      // deleteQuizErrorRaw.value = { message: errorMsg }; // To display in modal
    }
  } catch (e) {
    console.error("Exception deleting quiz:", e);
    addToast({ msg: e.message || "An unexpected error occurred while deleting the quiz.", type: "error" });
    // deleteQuizErrorRaw.value = e; // To display in modal
  }
}

// --- Delete Attempt ---
function getAttemptNumberForModal(attempt) {
  if (!attempt) return '';
  const indexInCurrentPage = attempts.value.findIndex(a => a.id === attempt.id);
  if (indexInCurrentPage !== -1) {
    return attemptsTotalElements.value - (attemptsCurrentPage.value * attemptsPageSize.value) - indexInCurrentPage;
  }
  // Fallback if attempt not in current page view (e.g. if loaded directly)
  return `ID: ${attempt.id.substring(0,4)}...`;
}

function openDeleteAttemptModal(attempt) {
  if (!attempt) return;
  attemptToDeleteDetails.value = attempt;
  showDeleteAttemptModal.value = true;
}
function cancelDeleteAttempt() {
  showDeleteAttemptModal.value = false;
  attemptToDeleteDetails.value = null;
}
async function confirmDeleteAttempt() {
  if (!attemptToDeleteDetails.value?.id) {
    addToast({ msg: "Cannot delete attempt: Missing information.", type: "error" });
    return;
  }
  try {
    const result = await deleteAttemptMutate({ attemptId: attemptToDeleteDetails.value.id });
    if (result?.data?.deleteQuizAttempt) { // Check your mutation's return structure
      addToast({ msg: "Attempt deleted successfully.", type: "success" });
      showDeleteAttemptModal.value = false;
      deselectAttempt(); // Go back to quiz preview
      refetchAttempts(); // Refresh the list
    }  else {
      const errorMsg = result?.errors?.[0]?.message || "Failed to delete attempt.";
      addToast({ msg: errorMsg, type: "error" });
      // deleteAttemptErrorRaw.value = { message: errorMsg };
    }
  } catch (e) {
    console.error("Exception deleting attempt:", e);
    addToast({ msg: e.message || "An unexpected error occurred while deleting the attempt.", type: "error" });
    // deleteAttemptErrorRaw.value = e;
  }
}

// --- Navigation ---
function startQuiz() {
  if (!quiz.value || !quiz.value.questions || quiz.value.questions.length === 0) {
    addToast({msg: "This quiz has no questions or is not loaded.", type: "warning"});
    return;
  }
  router.push({ name: 'takeQuiz', params: { id: quiz.value.id } });
}

function goBackToLibrary() { router.push({ name: 'quizLibrary' }); }

// Helper to ensure gql is available if not globally provided by Apollo
import { gql } from '@apollo/client/core';

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

/* --- Root Variables (Aligned with ReadSet.vue) --- */
:root {
  --primary-color: #5F98EF;
  --primary-color-rgb: 95, 152, 239;
  --bg-primary: #181E2E; /* Updated */
  --bg-secondary: #22293A; /* Updated */
  --bg-tertiary: #121729; /* Updated (was QuizOverview's bg-primary) */
  --text-primary: #E0E0E0; /* Updated */
  --text-secondary: #a4aabf; /* Updated */
  --border-color: #3a4359; /* Updated */
  --border-color-light: #4a536b; /* Kept, slightly adjusted from old border-color */
  --error-color: #e74c3c; /* Updated */
  --error-color-rgb: 231, 76, 60; /* Added */
  --success-color: #6cc644; /* Keep or align if ReadSet has a different success */
  --success-color-rgb: 108, 198, 68;
  --info-text-color: var(--text-secondary); /* Use themed secondary text */
  --disabled-opacity: 0.6;
  --blur-amount: 4px;
  --answer-reveal-bg: rgba(var(--primary-color-rgb), 0.1);
  --correct-answer-border: 1px solid var(--success-color);
  --incorrect-answer-opacity: 0.6;
  --correct-bg-light: rgba(var(--success-color-rgb), 0.1);
  --incorrect-bg-light: rgba(var(--error-color-rgb), 0.1);
  --user-answer-border: 1px dashed var(--primary-color);
  --row-highlight-bg: #2a335a; /* From ReadSet, for hover states */
}

.quiz-overview-content, .quiz-overview-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.quiz-overview-content {
  width: 100%;
  max-width: 1200px; /* ReadSet uses 1400px, adjust if needed */
  margin: 20px auto;
  padding: 20px;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

/* --- General Layout --- */
.quiz-view-layout { display: flex; flex-wrap: wrap; gap: 30px; align-items: flex-start; }
.quiz-sidebar { flex: 0 0 300px; /* ReadSet uses 350px */ display: flex; flex-direction: column; gap: 20px; position: sticky; top: 80px; align-self: flex-start; }
.quiz-main-content { flex: 1; min-width: 300px; }


/* --- Loading & Error & Info States (Aligned with ReadSet.vue) --- */
.loading-indicator, .error-message, .info-state {
  padding: 15px; text-align: center; background: var(--bg-secondary);
  color: var(--text-secondary); border-radius: 8px; margin: 0;
  font-size: 0.95em; border: 1px solid var(--border-color);
}
.full-page-indicator, .full-page-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; text-align: center; min-height: 300px; border-radius: 12px;
}
.full-page-indicator p, .full-page-error p, .info-state p {
  margin-top: 15px; font-size: 1.1em; color: var(--text-primary);
}
.error-message .error-icon, .full-page-error .error-icon { color: var(--error-color); }
.error-message pre, .full-page-error pre {
  background-color: rgba(var(--error-color-rgb), 0.1); color: var(--error-color);
  padding: 10px 15px; border-radius: 6px; margin-top: 15px; font-size: 0.9em;
  white-space: pre-wrap; word-break: break-all; text-align: left;
  max-width: 90%; border: 1px solid var(--error-color);
}
.action-link { /* This was an old style, new buttons below */
  margin-top: 20px; color: var(--primary-color); text-decoration: none; font-weight: 500;
  padding: 8px 16px; border: 1px solid var(--primary-color); border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
}
.action-link:hover { background-color: var(--primary-color); color: white; }
.info-state.no-questions-text { padding: 20px; margin-top: 15px; }


/* --- Settings Section (Sidebar & Main Content Cards) --- */
.settings-section {
  background: var(--bg-secondary);
  padding: 25px 30px; /* ReadSet padding */
  border-radius: 12px; /* ReadSet radius */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); /* ReadSet shadow */
  border: 1px solid var(--border-color);
}
.settings-section h3 {
  font-size: 1.2em; font-weight: 600; margin-top: 0; margin-bottom: 20px; /* ReadSet margin */
  color: var(--text-primary); padding-bottom: 10px; border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; gap: 8px;
}
.settings-section h3 .fa-history { font-size: 0.9em; }


/* --- Attempt History Sidebar --- */
.attempt-history-section .sidebar-loading, .attempt-history-section .sidebar-error, .attempt-history-section .sidebar-info {
  font-size: 0.9em; color: var(--text-secondary); text-align: center; padding: 15px 0;
}
.attempt-history-section .sidebar-error { color: var(--error-color); }
.attempt-list-container { }
.attempt-list { list-style: none; padding: 0; margin: 0 0 15px 0; max-height: 400px; overflow-y: auto; }
.attempt-list::-webkit-scrollbar { width: 6px; }
.attempt-list::-webkit-scrollbar-track { background: var(--bg-tertiary); border-radius: 3px; }
.attempt-list::-webkit-scrollbar-thumb { background-color: var(--border-color-light); border-radius: 3px; }
.attempt-item { margin-bottom: -1px; }
.attempt-link {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border: 1px solid var(--border-color); background-color: var(--bg-tertiary);
  color: var(--text-secondary); text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  font-size: 0.9em; width: 100%; text-align: left; cursor: pointer; font-family: inherit;
}
.attempt-item:first-child .attempt-link { border-radius: 6px 6px 0 0; }
.attempt-item:last-child .attempt-link { border-radius: 0 0 6px 6px; border-bottom-width: 1px;}
.attempt-item:only-child .attempt-link { border-radius: 6px; }
.attempt-link:hover, .attempt-link.active {
  background-color: var(--primary-color); border-color: var(--primary-color);
  color: white; z-index: 1; position: relative;
}
.attempt-link:hover .attempt-score, .attempt-link.active .attempt-score { color: white; font-weight: 600; }
.attempt-number { font-weight: 500; }
.attempt-score { font-weight: 600; color: var(--primary-color); }
.attempt-pagination { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-color-light); }
.attempt-pagination span { font-size: 0.85em; color: var(--text-secondary); }
.pagination-button {
  background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-secondary);
  border-radius: 4px; padding: 3px 8px; font-size: 0.9em; cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.pagination-button:hover:not(:disabled) { background: var(--row-highlight-bg); color: var(--primary-color); border-color: var(--primary-color); }
.pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
.attempt-fetch-loading, .attempt-fetch-error { margin-top: 10px; font-size: 0.85em; }

.back-from-attempt-button { /* Renamed from view-preview-button */
  width: 100%; margin-bottom: 15px; justify-content: center;
  font-size: 0.9em; padding: 10px 15px; /* Matched action-button padding */
}


/* --- Quiz Card (Main Content) --- */
/* .quiz-details-card is now .settings-section for consistency */
.quiz-details-card { /* Retained for specificity if needed, but uses .settings-section styles */
  padding: 30px 40px; /* Original padding, if different from settings-section default */
}
.attempt-review-card { /* Specific overrides for attempt review */ }


/* --- Header --- */
.quiz-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); gap: 20px; }
.header-main { flex-grow: 1; }
.quiz-title { font-size: 2em; font-weight: 700; color: var(--text-primary); margin: 0 0 10px 0; line-height: 1.3; }
.quiz-description { font-size: 1em; color: var(--text-secondary); margin-bottom: 0; line-height: 1.6; }
.quiz-description_italic { font-size: 1em; color: var(--text-secondary); margin-bottom: 0; line-height: 1.6; font-style: italic; }
.header-actions .start-quiz-button { min-width: 180px; } /* PrimaryButton style comes from the component */
.header-actions .start-quiz-button[disabled] { cursor: not-allowed; opacity: var(--disabled-opacity); }

.attempt-review-card .quiz-header { margin-bottom: 15px; }
.attempt-review-card .quiz-title { font-size: 1.6em; margin-bottom: 5px; }
.attempt-review-card .quiz-description { font-size: 0.9em; }
.header-info { text-align: right; }
.attempt-score-header { font-size: 1.1em; font-weight: 600; color: var(--primary-color); display: block; margin-bottom: 5px;}
.attempt-date-header { font-size: 0.85em; color: var(--text-secondary); }


/* --- Meta Section (Align with ReadSet.vue) --- */
.quiz-meta-section {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px 25px; margin-bottom: 20px; padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color-light); /* Or var(--border-color) */
}
.meta-item { font-size: 0.95em; color: var(--text-secondary); display: flex; align-items: center; gap: 10px; }
.meta-icon { color: var(--primary-color); font-size: 1.1em; opacity: 0.9; flex-shrink: 0; width: 16px; text-align: center; }
.meta-item strong { color: var(--text-primary); font-weight: 500; }
.meta-item a { color: var(--primary-color); text-decoration: none; font-weight: 500; }
.meta-item a:hover { text-decoration: underline; }


/* --- Visibility Controls (Preview Mode) --- */
.visibility-controls { display: flex; gap: 20px; padding: 15px 0; margin-bottom: 20px; border-bottom: 1px solid var(--border-color-light); flex-wrap: wrap; }

/* --- Questions Section --- */
.quiz-questions-section .section-title {
  font-size: 1.4em; /* ReadSet section title */
  font-weight: 600; color: var(--text-primary); margin-bottom: 20px;
  padding-bottom: 10px; border-bottom: 1px solid var(--border-color);
}
.questions-list { display: flex; flex-direction: column; gap: 25px; }

/* --- Blurring Logic --- */
.question-item-wrapper {
  position: relative;
  /* transition: filter 0.3s ease-out; No longer needed here */
}
.question-item-wrapper.blur-container > .question-item {
  filter: blur(var(--blur-amount));
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
  opacity: 0.6; /* Slightly more visible than original 0.7 to compensate for full item blur */
  transition: filter 0.3s ease-out, opacity 0.3s ease-out;
}

.question-item { background-color: var(--bg-tertiary); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
.question-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
.question-header > div:first-child { display: flex; align-items: center; gap: 10px; }
.question-number { font-weight: 600; color: var(--primary-color); font-size: 1.1em; }
.question-type-badge { background-color: var(--primary-color); color: white; font-size: 0.75em; font-weight: 500; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }

.question-content-area { /* No longer needs blur class */
  transition: opacity 0.3s ease-out; /* Keep if other transitions apply */
}
/* REMOVED .blurred-content CSS rule */

.question-content { font-size: 1em; line-height: 1.7; color: var(--text-secondary); margin-bottom: 15px; }
.question-content > :first-child { margin-top: 0; }
.question-content > :last-child { margin-bottom: 0; }
.question-content :deep(p) { margin-bottom: 0.5em; }
.question-content :deep(ul), .question-content :deep(ol) { margin-left: 20px; margin-bottom: 0.5em;}
.question-content :deep(li) { margin-bottom: 0.25em; }
.question-content :deep(code) { background-color: var(--bg-primary); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; border: 1px solid var(--border-color); color: var(--text-primary); }
.question-content :deep(pre) { background-color: var(--bg-primary); padding: 10px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--border-color); margin: 0.5em 0; }
.question-content :deep(pre code) { padding: 0; background-color: transparent; border: none; font-size: 0.85em; }
.question-content :deep(blockquote) { border-left: 3px solid var(--primary-color); margin-left: 0; padding-left: 1em; color: var(--text-secondary); font-style: italic; }
.question-content :deep(table) { width: auto; border-collapse: collapse; margin-bottom: 1em; }
.question-content :deep(th), .question-content :deep(td) { border: 1px solid var(--border-color-light); padding: 6px 10px; text-align: left; }
.question-content :deep(th) { background-color: var(--bg-tertiary); font-weight: 600; }
.question-content :deep(a) { color: var(--primary-color); text-decoration: none; }
.question-content :deep(a:hover) { text-decoration: underline; }
.question-content :deep(hr) { border: none; border-top: 1px solid var(--border-color-light); margin: 1em 0; }

/* --- Options & Answer Reveal (Preview Mode) --- */
.options-list { list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.option-item {
  font-size: 0.95em; color: var(--text-secondary); padding: 8px 12px;
  background-color: rgba(var(--primary-color-rgb), 0.05); /* Lighter than QO's bg-tertiary */
  border: 1px solid var(--border-color); border-radius: 6px;
  display: flex; justify-content: space-between; align-items: center;
  transition: background-color 0.2s, border-color 0.2s, opacity 0.2s; opacity: 1;
}
.option-item.incorrect-answer-reveal { opacity: var(--incorrect-answer-opacity); background-color: transparent; }
.option-item.correct-answer-reveal { border: var(--correct-answer-border); background-color: var(--answer-reveal-bg); color: var(--text-primary); }
.option-item > div { display: flex; align-items: center; }
.option-letter { font-weight: 500; color: var(--text-primary); margin-right: 8px; flex-shrink: 0; }
.correct-answer-indicator { color: var(--success-color); margin-left: 10px; font-size: 1.1em; flex-shrink: 0; }
.option-item.tf-option { padding: 10px 12px; font-weight: 500; color: var(--text-primary); justify-content: center; }
.no-questions-text { font-style: italic; color: var(--info-text-color); text-align: center; } /* Removed padding here, applied to .info-state if used */
.toggle-answer-btn {
  background: none; border: none; padding: 4px 8px; margin: 0; cursor: pointer;
  color: var(--text-secondary); font-size: 0.8em; font-weight: 500; border-radius: 4px;
  display: inline-flex; align-items: center; gap: 5px;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.toggle-answer-btn:hover, .toggle-answer-btn:focus-visible { background-color: var(--bg-secondary); color: var(--primary-color); outline: none; }
.toggle-answer-btn svg { font-size: 0.9em; }
.answer-reveal-container { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out, margin-top 0.4s ease-out, padding-top 0.4s ease-out, border-top-color 0.4s ease-out; margin-top: 0; padding-top: 0; border-top: 1px solid transparent; }
.answer-reveal-container.expanded { max-height: 200px; margin-top: 15px; padding-top: 15px; border-top-color: var(--border-color-light); }
.answer-content { background-color: var(--answer-reveal-bg); padding: 10px 15px; border-radius: 6px; font-size: 0.95em; color: var(--text-primary); border: 1px dashed var(--primary-color); }
.answer-content strong { color: var(--primary-color); font-weight: 600; }

/* --- Attempt Review Specific Styles --- */
.attempt-review-card .quiz-questions-section .section-title { margin-bottom: 15px; }
.attempt-question-item { border-color: var(--border-color-light); }
.attempt-question-item .question-header { margin-bottom: 10px; }
.correctness-badge { font-size: 0.8em; font-weight: 600; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px; }
.correctness-badge.correct { background-color: var(--success-color); color: white; }
.correctness-badge.incorrect { background-color: var(--error-color); color: white; }
.user-answer-section, .correct-answer-section, .feedback-section { margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color-light); }
.answer-label { display: block; font-size: 0.85em; color: var(--text-secondary); font-weight: 500; margin-bottom: 5px; }
.user-answer-value { font-style: italic; color: var(--primary-color); background-color: rgba(var(--primary-color-rgb), 0.05); padding: 5px 8px; border-radius: 4px; display: inline-block; border: var(--user-answer-border);}
.correct-answer-value { color: var(--text-primary); font-weight: 500; margin-top: 5px; } /* Might be too subtle */
.feedback-section { margin-top: 10px; }
.feedback-content { font-size: 0.9em; color: var(--text-secondary); background-color: var(--bg-tertiary); padding: 8px 10px; border-radius: 4px; border: 1px solid var(--border-color); margin-top: 5px; white-space: pre-wrap; }
.options-list.review-options { margin-top: 15px; }
.review-options .option-item { background: none; border-color: transparent; padding: 4px 0; opacity: 1; }
.review-options .option-item.is-correct { color: var(--success-color); font-weight: 600; }
.review-options .option-item.user-selected { font-weight: 500; border: 1px solid var(--primary-color); background-color: rgba(var(--primary-color-rgb), 0.1); padding-left: 8px; padding-right: 8px; border-radius: 4px; margin: 2px 0; }
.review-options .option-item.user-selected:not(.is-correct) { color: var(--error-color); text-decoration: line-through; border-color: var(--error-color); background-color: var(--incorrect-bg-light); }
.review-options .option-item.is-correct.user-selected { color: var(--success-color); border-color: var(--success-color); background-color: var(--correct-bg-light); }
.review-options .option-item:not(.is-correct):not(.user-selected) { opacity: 0.6; }

/* --- Action Button Styles (from ReadSet.vue) --- */
.action-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 6px;
  text-decoration: none; font-weight: 500; font-size: 0.9em;
  transition: all 0.2s ease-out; cursor: pointer; text-align: center;
  width: auto; /* Default to auto, can be overridden */
}
.action-button:disabled { opacity: var(--disabled-opacity); cursor: not-allowed; transform: none; box-shadow: none;}
.action-button:hover:not(:disabled) {
  transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button.secondary, .action-link.error-action /* For Back to My Quizzes on error page */ {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}
.action-button.secondary:hover:not(:disabled), .action-link.error-action:hover {
  background-color: var(--row-highlight-bg);
  border-color: var(--text-secondary); /* ReadSet uses text-secondary for border hover */
  color: var(--text-primary);
}
/* PrimaryButton component has its own styling, this is for custom primary-like actions if any */
.action-button.primary {
  background-color: var(--primary-color); border-color: var(--primary-color); color: #fff;
}
.action-button.primary:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--primary-color), #000 10%); /* Darken primary */
  border-color: color-mix(in srgb, var(--primary-color), #000 10%);
}
.action-button.danger {
  background-color: transparent;
  border-color: var(--error-color);
  color: var(--error-color);
}
.action-button.danger:hover:not(:disabled) {
  background-color: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color); /* Or color-mix(in srgb, var(--error-color), #fff 10%) for lighter red */
}
.action-button svg { margin-right: 6px; }

/* --- Page Actions --- */
.page-actions {
  margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);
  display: flex; justify-content: flex-start; gap: 15px; /* Added gap */
}

/* Modal Styles (from ReadSet.vue) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(18, 23, 41, 0.7); /* Or var(--bg-primary) with alpha */
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--bg-secondary); color: var(--text-primary);
  padding: 30px 40px; border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  width: 90%; max-width: 500px; text-align: center;
}
.modal-content h4 {
  font-size: 1.4em; font-weight: 600; margin-top: 0; margin-bottom: 15px;
  color: var(--text-primary);
}
.modal-content p {
  font-size: 1em; color: var(--text-secondary); line-height: 1.6; margin-bottom: 30px;
}
.modal-content p strong { color: var(--text-primary); font-weight: 600; }
.modal-actions { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
.modal-error-message { /* Specific for errors inside modal */
  background-color: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  padding: 10px; border-radius: 6px; font-size: 0.9em;
  border: 1px solid var(--error-color);
}


/* --- Responsive --- */
@media (max-width: 992px) {
  .quiz-view-layout { flex-direction: column; }
  .quiz-sidebar { flex: 1 1 auto; order: -1; width: 100%; max-width: 100%; position: static; }
  .quiz-main-content { width: 100%; }
}
@media (max-width: 768px) {
  .quiz-details-card, .settings-section { padding: 20px; } /* Unified padding */
  .quiz-header { flex-direction: column; align-items: stretch; }
  .quiz-title { font-size: 1.7em; }
  .header-actions .start-quiz-button { width: 100%; margin-top: 15px; }
  .visibility-controls { gap: 15px; }
  .attempt-link { padding: 10px; font-size: 0.85em;}
  .page-actions { flex-direction: column; }
  .page-actions .action-button { width: 100%; }

}
@media (max-width: 480px) {
  .quiz-details-card, .settings-section { padding: 15px; } /* Unified padding */
  .quiz-title { font-size: 1.5em; }
  .quiz-meta-section { grid-template-columns: 1fr; gap: 12px; }
  .quiz-questions-section .section-title { font-size: 1.3em; }
  .question-item { padding: 15px; }
  .visibility-controls { flex-direction: column; align-items: flex-start; }
}

</style>