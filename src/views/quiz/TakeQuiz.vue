<template>
  <main class="take-quiz-view">
    <div v-if="quizLoading && !quizData" class="loading-indicator">
      <font-awesome-icon :icon="icons.spinner" spin size="3x" />
      <p>Loading Quiz...</p>
    </div>
    <div v-else-if="quizError" class="error-message">
      <font-awesome-icon :icon="icons.triangleExclamation" size="3x" class="error-icon" />
      <p>Error loading quiz:</p>
      <pre>{{ quizError.message || 'An unknown error occurred.' }}</pre>
      <router-link :to="{ name: 'quizLibrary' }" class="action-link">Go to Quiz Library</router-link>
    </div>
    <div v-else-if="!quizLoading && !quizData" class="error-message">
      <font-awesome-icon :icon="icons.triangleExclamation" size="3x" class="error-icon" />
      <p>Quiz not found or could not be loaded.</p>
      <router-link :to="{ name: 'quizLibrary' }" class="action-link">Go to Quiz Library</router-link>
    </div>

    <div v-else-if="quizData && currentQuestion" class="quiz-container">
      <header class="quiz-header">
        <h1 class="quiz-title">{{ quizData.title }}</h1>
        <div class="quiz-meta">
          <span class="progress-indicator">
            <font-awesome-icon :icon="icons.questionCircle" />
            Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
          </span>
        </div>
      </header>

      <div class="question-display-area">
        <div class="question-card">
          <p class="question-prompt">Question {{ currentQuestionIndex + 1 }}:</p>
          <div class="question-content" v-html="renderMarkdown(currentQuestion.content)"></div>

          <div class="answer-options-area">
            <div v-if="currentQuestion.questionType === QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER" class="options-group radio-group">
              <label v-for="option in currentQuestion.options" :key="option.id" class="option-label">
                <input
                    type="radio"
                    :name="`q_${currentQuestion.id}`"
                    :value="option.id"
                    :checked="userResponses[currentQuestion.position] === option.id"
                    @change="updateSelection(currentQuestion.position, option.id)"
                    :disabled="isSubmitting"
                />
                <span class="option-text">{{ option.content }}</span>
              </label>
            </div>

            <div v-else-if="currentQuestion.questionType === QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER" class="options-group checkbox-group">
              <label v-for="option in currentQuestion.options" :key="option.id" class="option-label">
                <input
                    type="checkbox"
                    :name="`q_${currentQuestion.id}`"
                    :value="option.id"
                    :checked="isOptionSelectedMCMA(currentQuestion.position, option.id)"
                    @change="updateSelectionMCMA(currentQuestion.position, option.id, $event.target.checked)"
                    :disabled="isSubmitting"
                />
                <span class="option-text">{{ option.content }}</span>
              </label>
            </div>

            <div v-else-if="currentQuestion.questionType === QuestionTypeEnum.TRUE_FALSE" class="options-group radio-group">
              <label class="option-label">
                <input
                    type="radio"
                    :name="`q_${currentQuestion.id}`"
                    value="True"
                    :checked="userResponses[currentQuestion.position] === 'True'"
                    @change="updateSelection(currentQuestion.position, 'True')"
                    :disabled="isSubmitting"
                />
                <span class="option-text">True</span>
              </label>
              <label class="option-label">
                <input
                    type="radio"
                    :name="`q_${currentQuestion.id}`"
                    value="False"
                    :checked="userResponses[currentQuestion.position] === 'False'"
                    @change="updateSelection(currentQuestion.position, 'False')"
                    :disabled="isSubmitting"
                />
                <span class="option-text">False</span>
              </label>
            </div>

            <div v-else-if="currentQuestion.questionType === QuestionTypeEnum.SHORT_ANSWER" class="short-answer-group">
              <label :for="`q_input_${currentQuestion.id}`" class="short-answer-label">Your Answer:</label>
              <input
                  type="text"
                  :id="`q_input_${currentQuestion.id}`"
                  class="styled-input short-answer-input"
                  :value="userResponses[currentQuestion.position] || ''"
                  @input="updateSelection(currentQuestion.position, $event.target.value)"
                  :disabled="isSubmitting"
                  placeholder="Type your answer here..."
              />
            </div>
          </div>
        </div>
      </div>

      <footer class="quiz-navigation">
        <button
            @click="goToPrevQuestion"
            :disabled="isSubmitting || currentQuestionIndex === 0"
            class="nav-button prev-button"
            title="Previous Question"
        >
          <font-awesome-icon :icon="icons.chevronLeft" />
          Previous
        </button>
        <button
            v-if="!isLastQuestion"
            @click="goToNextQuestion"
            :disabled="isSubmitting"
            class="nav-button next-button"
            title="Next Question"
        >
          Next
          <font-awesome-icon :icon="icons.chevronRight" />
        </button>
        <button
            v-if="isLastQuestion"
            @click="submitQuiz"
            :disabled="isSubmitting"
            class="nav-button submit-button"
            title="Finish and Grade Quiz"
        >
          <font-awesome-icon :icon="isSubmitting ? icons.spinner : icons.checkCircle" :spin="isSubmitting" />
          {{ isSubmitting ? 'Submitting...' : 'Submit Quiz' }}
        </button>
      </footer>
      <div v-if="submissionErrorMsg" class="submission-error">
        {{ submissionErrorMsg }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { GET_QUIZ_BY_ID, GRADE_QUIZ_MUTATION } from '@/graphql/auth.js'; // Assuming auth.js is in src/graphql

// Libraries
import MarkdownIt from 'markdown-it';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faQuestionCircle,
  faChevronLeft, faChevronRight, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation, faQuestionCircle,
    faChevronLeft, faChevronRight, faCheckCircle
);

const icons = {
  spinner: faSpinner, triangleExclamation: faTriangleExclamation, questionCircle: faQuestionCircle,
  chevronLeft: faChevronLeft, chevronRight: faChevronRight, checkCircle: faCheckCircle,
};

const md = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: true, quotes: '“”‘’', });

const QuestionTypeEnum = Object.freeze({
  MULTIPLE_CHOICE_SINGLE_ANSWER: "MULTIPLE_CHOICE_SINGLE_ANSWER",
  MULTIPLE_CHOICE_MULTIPLE_ANSWER: "MULTIPLE_CHOICE_MULTIPLE_ANSWER",
  TRUE_FALSE: "TRUE_FALSE",
  SHORT_ANSWER: "SHORT_ANSWER"
});

const router = useRouter();
const route = useRoute();

const quizId = ref(route.params.id);
const quizData = ref(null);
const submissionErrorMsg = ref('');
const currentQuestionIndex = ref(0);
const userResponses = ref({}); // Will store option IDs for MCSA/MCMA, text for True/False & Short Answer
const isSubmitting = ref(false);
const quizSubmitted = ref(false);

const {
  loading: quizLoading,
  error: quizError,
  onResult: onQuizFetchResult,
  onError: onQuizFetchError
} = useQuery(GET_QUIZ_BY_ID, { id: quizId.value }, () => ({
  enabled: !!quizId.value,
  fetchPolicy: 'network-only',
}));

onQuizFetchResult(queryResult => {
  if (queryResult.data?.findQuizById) {
    const fetchedData = queryResult.data.findQuizById;
    if (!fetchedData.questions || fetchedData.questions.length === 0) {
      console.error("Quiz data loaded, but it contains no questions.");
      quizData.value = null;
      return;
    }
    const sortedQuestions = [...fetchedData.questions]
        .filter(q => q.position !== null && q.position !== undefined)
        .sort((a, b) => a.position - b.position);

    if (sortedQuestions.length !== fetchedData.questions.length) {
      console.warn("Some questions were filtered out due to missing position.");
    }
    quizData.value = { ...fetchedData, questions: sortedQuestions };
    const initialResponses = {};
    quizData.value.questions.forEach(q => {
      if (q.position !== null && q.position !== undefined) {
        initialResponses[q.position] = null; // Initialize all answers to null
      }
    });
    userResponses.value = initialResponses;
    currentQuestionIndex.value = 0;
  } else if (!queryResult.loading) {
    console.warn(`Quiz with ID ${quizId.value} not found or returned no data.`);
    quizData.value = null;
  }
});

onQuizFetchError(error => {
  console.error("Error fetching quiz data (onQuizFetchError):", error);
  quizData.value = null;
});

const { mutate: gradeQuizMutate, loading: gradeLoading, /* error: gradeError (handled by onGradeError) */ onDone: onGradeDone, onError: onGradeError } = useMutation(GRADE_QUIZ_MUTATION);

const totalQuestions = computed(() => quizData.value?.questions?.length ?? 0);
const currentQuestion = computed(() => {
  if (quizData.value?.questions && totalQuestions.value > 0 && currentQuestionIndex.value < totalQuestions.value) {
    return quizData.value.questions[currentQuestionIndex.value];
  }
  return null;
});
const isLastQuestion = computed(() => totalQuestions.value > 0 && currentQuestionIndex.value === totalQuestions.value - 1);

function renderMarkdown(content) {
  return md.render(String(content || ''));
}

// For MCSA, True/False, Short Answer: stores option.id for MCSA, "True"/"False", or text
function updateSelection(questionPosition, value) {
  console.log(`Updating response for Q Pos ${questionPosition} (raw value):`, value);
  userResponses.value[questionPosition] = value;
}

// For MCMA: checks if an option ID is in the comma-separated string of selected IDs
function isOptionSelectedMCMA(questionPosition, optionId) {
  const currentResponse = userResponses.value[questionPosition]; // This is a CSV of IDs or null
  if (!currentResponse) return false;
  const selectedIds = String(currentResponse).split(',').filter(id => id.trim() !== '');
  return selectedIds.includes(String(optionId));
}

// For MCMA: updates the comma-separated string of selected option IDs
function updateSelectionMCMA(questionPosition, optionId, isChecked) {
  const currentResponse = userResponses.value[questionPosition];
  let selectedIds = currentResponse ? String(currentResponse).split(',').filter(id => id.trim() !== '') : [];
  const optionIdStr = String(optionId);

  if (isChecked) {
    if (!selectedIds.includes(optionIdStr)) {
      selectedIds.push(optionIdStr);
    }
  } else {
    selectedIds = selectedIds.filter(id => id !== optionIdStr);
  }
  userResponses.value[questionPosition] = selectedIds.length > 0 ? selectedIds.join(',') : null;
  console.log(`Updating MCMA response for Q Pos ${questionPosition} (IDs):`, userResponses.value[questionPosition]);
}

function goToNextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++;
  }
}
function goToPrevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}

function formatResponseForMutation() {
  const responsesInput = [];
  if (!quizData.value?.questions) {
    console.error("Cannot format responses: quizData.questions is not available.");
    return [];
  }
  console.log("Current userResponses state before formatting for submission:", JSON.parse(JSON.stringify(userResponses.value)));

  quizData.value.questions.forEach(question => {
    const position = question.position;
    const questionType = question.questionType;
    const rawResponseValue = userResponses.value[position]; // This is option ID(s) or literal answer
    let finalAnswerContent = null;

    if (rawResponseValue !== null && rawResponseValue !== undefined) {
      switch (questionType) {
        case QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER:
          const selectedOption = question.options.find(opt => opt.id === rawResponseValue);
          if (selectedOption) {
            finalAnswerContent = selectedOption.content; // Use the text content of the option
          } else {
            // This case should ideally not happen if UI is correct
            console.warn(`Selected option ID '${rawResponseValue}' not found for question position ${position}.`);
            finalAnswerContent = ""; // Or null, depending on how backend handles "answered but invalid"
          }
          break;
        case QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER:
          if (rawResponseValue) { // rawResponseValue is a CSV of IDs
            const selectedIds = String(rawResponseValue).split(',').filter(id => id.trim() !== '');
            const selectedContents = selectedIds.map(id => {
              const opt = question.options.find(o => o.id === id);
              return opt ? opt.content : null; // Get text content
            }).filter(content => content !== null); // Filter out any nulls if an ID wasn't found
            finalAnswerContent = selectedContents.join(',');
          } else {
            finalAnswerContent = ""; // No options selected
          }
          break;
        case QuestionTypeEnum.TRUE_FALSE:
        case QuestionTypeEnum.SHORT_ANSWER:
          finalAnswerContent = String(rawResponseValue); // Already the correct text content
          break;
        default:
          console.warn(`Unhandled question type: ${questionType} for question position ${position}. Sending raw value.`);
          finalAnswerContent = String(rawResponseValue);
      }
    } else {
      // Question was not answered, send null or empty string based on backend expectation for nullable String
      finalAnswerContent = null; // Let's assume null is fine for unanswered.
    }

    responsesInput.push({
      position: position,
      content: finalAnswerContent, // This is now the user's actual answer text or CSV of texts
      questionType: questionType,
      // 'options' field is intentionally omitted here as per GraphQL schema for QuestionInput
      // and user log showing it as null in the request.
    });
  });
  console.log("Formatted responses for mutation (with text content):", responsesInput);
  return responsesInput;
}

async function submitQuiz() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  submissionErrorMsg.value = '';

  const formattedResponses = formatResponseForMutation();

  if (!quizId.value) {
    submissionErrorMsg.value = "Cannot submit quiz: Quiz ID is missing.";
    isSubmitting.value = false;
    return;
  }

  const attemptInput = {
    quizId: quizId.value,
    responses: formattedResponses
  };

  console.log("Submitting quiz attempt input:", JSON.stringify(attemptInput, null, 2));

  try {
    await gradeQuizMutate({ quiz: attemptInput });
  } catch (e) {
    console.error("Error during gradeQuizMutate call (try-catch):", e);
    submissionErrorMsg.value = `Failed to submit quiz. ${e.message || 'An unexpected error occurred.'}`;
    isSubmitting.value = false; // Reset on catastrophic failure of the call itself
  }
}

onGradeDone(result => {
  console.log("Quiz graded successfully (onGradeDone):", result);
  isSubmitting.value = false;
  quizSubmitted.value = true; // Mark as submitted for navigation guard

  const attemptId = result.data?.gradeQuiz?.id;
  if (attemptId) {
    router.push({ name: 'quizOverview', params: { id: quizId.value } }); // Or a dedicated result page
  } else {
    console.error("Grading succeeded but no attempt ID received:", result.data);
    submissionErrorMsg.value = "Grading process completed, but couldn't retrieve result ID.";
  }
});

onGradeError(error => {
  console.error("Error grading quiz (onGradeError hook):", JSON.stringify(error, null, 2));
  isSubmitting.value = false;
  quizSubmitted.value = false; // Submission failed
  let specificMessage = 'Unknown error';
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    specificMessage = error.graphQLErrors.map(e => e.message + (e.extensions?.validationErrors ? ` (Validation: ${e.extensions.validationErrors.map(ve => `${ve.field}: ${ve.message}`).join(', ')})` : '')).join('; ');
  } else if (error.networkError) {
    specificMessage = `Network error: ${error.networkError.message}`;
  } else {
    specificMessage = error.message || 'An unknown error occurred during submission.';
  }
  submissionErrorMsg.value = `Error submitting quiz: ${specificMessage}`;
});

onMounted(() => {
  if (!quizId.value) {
    console.error("No Quiz ID provided in the route. Cannot load quiz.");
    // UI should reflect this via the v-if chain for loading/error/no-data states.
  }
});

onBeforeUnmount(() => { /* Cleanup if needed */ });

onBeforeRouteLeave((to, from, next) => {
  if (!quizSubmitted.value && !quizLoading.value && quizData.value && totalQuestions.value > 0) {
    const leave = window.confirm(
        'Are you sure you want to leave? Your current quiz progress will be lost.'
    );
    if (leave) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});
</script>

<style scoped>
/* Styles remain the same */
:root {
  --primary-color: #5F98EF;
  --bg-primary: #121729;
  --bg-secondary: #1b2233;
  --bg-tertiary: #2a335a;
  --text-primary: #ffffff;
  --text-secondary: #a0a8c2;
  --border-color: #303854;
  --border-color-light: #4a4e69;
  --error-color: #ff6b6b;
  --disabled-opacity: 0.6;
  --success-color: #6cc644;
  --primary-color-rgb: 95, 152, 239;
}

.take-quiz-view { width: 100%; max-width: 800px; margin: 20px auto; padding: 20px; color: var(--text-primary); display: flex; flex-direction: column; }
.loading-indicator, .error-message { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; color: var(--text-secondary); min-height: 250px; background-color: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color); }
.loading-indicator p, .error-message p { margin-top: 15px; font-size: 1.1em; color: var(--text-primary); }
.error-message .error-icon { color: var(--error-color); }
.error-message pre { background-color: rgba(255, 107, 107, 0.1); color: var(--error-color); padding: 10px 15px; border-radius: 6px; margin-top: 15px; font-size: 0.9em; white-space: pre-wrap; word-break: break-all; text-align: left; max-width: 90%; border: 1px solid var(--error-color); }
.action-link { margin-top: 20px; color: var(--primary-color); text-decoration: none; font-weight: 500; padding: 8px 16px; border: 1px solid var(--primary-color); border-radius: 6px; transition: background-color 0.2s, color 0.2s; }
.action-link:hover { background-color: var(--primary-color); color: white; }
.quiz-container { background-color: var(--bg-secondary); border-radius: 12px; padding: 25px 35px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); border: 1px solid var(--border-color); }
.quiz-header { padding-bottom: 15px; margin-bottom: 25px; border-bottom: 1px solid var(--border-color-light); }
.quiz-title { font-size: 1.6em; font-weight: 600; margin: 0 0 15px 0; text-align: center; }
.quiz-meta { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 15px; font-size: 0.9em; color: var(--text-secondary); } /* Centered progress */
.progress-indicator { display: flex; align-items: center; gap: 6px; background-color: var(--bg-tertiary); padding: 5px 12px; border-radius: 15px; }
.question-display-area { margin-bottom: 30px; }
.question-card { background-color: var(--bg-primary); padding: 25px; border-radius: 8px; border: 1px solid var(--border-color); }
.question-prompt { font-size: 0.9em; color: var(--text-secondary); margin: 0 0 10px 0; font-weight: 500; }
.question-content { font-size: 1.1em; line-height: 1.7; color: var(--text-primary); margin-bottom: 25px; }
.question-content > :first-child { margin-top: 0; }
.question-content > :last-child { margin-bottom: 0; }
.question-content :deep(p) { margin-bottom: 0.5em; }
.question-content :deep(ul), .question-content :deep(ol) { margin-left: 20px; margin-bottom: 0.5em;}
.question-content :deep(li) { margin-bottom: 0.25em; }
.question-content :deep(code) { background-color: var(--bg-secondary); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; border: 1px solid var(--border-color); color: var(--text-primary); }
.question-content :deep(pre) { background-color: var(--bg-secondary); padding: 10px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--border-color); margin: 0.5em 0; }
.question-content :deep(pre code) { padding: 0; background-color: transparent; border: none; font-size: 0.85em; }
.answer-options-area { }
.options-group { display: flex; flex-direction: column; gap: 12px; }
.option-label { display: flex; align-items: center; background-color: var(--bg-tertiary); padding: 12px 15px; border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer; transition: border-color 0.2s, background-color 0.2s; }
.option-label:has(input:checked) { border-color: var(--primary-color); background-color: rgba(var(--primary-color-rgb), 0.1); }
.option-label:hover { border-color: var(--text-secondary); }
.option-label input[type="radio"], .option-label input[type="checkbox"] { margin-right: 12px; flex-shrink: 0; accent-color: var(--primary-color); width: 16px; height: 16px; }
.option-text { color: var(--text-secondary); line-height: 1.5; }
.option-label:has(input:checked) .option-text { color: var(--text-primary); font-weight: 500; }
.short-answer-group { }
.short-answer-label { display: block; font-size: 0.9em; color: var(--text-secondary); margin-bottom: 8px; }
.styled-input.short-answer-input { width: 100%; padding: 10px 14px; border-radius: 8px; background-color: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 1em; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.styled-input.short-answer-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.3); }
.quiz-navigation { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--border-color-light); }
.nav-button { appearance: none; -webkit-appearance: none; border: none; background: none; padding: 10px 20px; border-radius: 8px; font-size: 1em; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background-color 0.2s, color 0.2s, opacity 0.2s; }
.nav-button:disabled { opacity: var(--disabled-opacity); cursor: not-allowed; }
.prev-button { background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color); }
.prev-button:hover:not(:disabled) { background-color: var(--bg-secondary); color: var(--text-primary); }
.next-button { background-color: var(--primary-color); color: white; border: 1px solid var(--primary-color); }
.next-button:hover:not(:disabled) { background-color: color-mix(in srgb, var(--primary-color), #000 10%); border-color: color-mix(in srgb, var(--primary-color), #000 10%); }
.submit-button { background-color: var(--success-color, #6cc644); color: white; border: 1px solid var(--success-color, #6cc644); }
.submit-button:hover:not(:disabled) { background-color: color-mix(in srgb, var(--success-color, #6cc644), #000 10%); border-color: color-mix(in srgb, var(--success-color, #6cc644), #000 10%); }
.submission-error { color: var(--error-color); text-align: right; font-size: 0.9em; margin-top: 10px; }
@media (max-width: 600px) { .quiz-container { padding: 15px 20px; } .quiz-title { font-size: 1.4em; } .quiz-meta { font-size: 0.85em; justify-content: center; } .question-card { padding: 15px; } .question-content { font-size: 1em; } .quiz-navigation { flex-direction: column; gap: 10px; } .nav-button { width: 100%; justify-content: center; } }
</style>