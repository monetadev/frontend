<template>
  <main class="quizzes-content">
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Test Your Knowledge</h1>
        <p class="page-subtitle">Configure your quiz settings and select question types to begin.</p>
      </div>
      <img src="../../assets/quizzes.png" class="header-icon" alt="Quiz Icon"/>
    </header>

    <div class="quiz-setup-card">

      <section class="config-section mode-selection-section">
        <h2 class="section-title">
          <font-awesome-icon :icon="icons.listCheck" class="title-icon"/>
          Choose Question Types
        </h2>
        <div class="modes-grid">
          <ModeSelectionBox
              v-for="mode in modes"
              :key="mode.enumValue"
              :label="mode.label"
              :icon="mode.icon"
              :isSelected="selectedModes.includes(mode.enumValue)"
              @click="toggleModeSelection(mode.enumValue)"
              class="mode-box"
              :title="mode.description"
          />
        </div>
      </section>

      <section class="config-section settings-section">
        <h2 class="section-title">
          <font-awesome-icon :icon="icons.sliders" class="title-icon"/>
          Configure Settings
        </h2>

        <div class="settings-grid">
          <div class="settings-item span-2" style="display: flex; flex-direction: column; gap: 8px;">
            <label for="search-sets-input-create-quiz" class="slider-label" style="margin-bottom: 0;">
              <font-awesome-icon :icon="icons.search" class="label-icon"/> Search Public Sets
            </label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input
                  id="search-sets-input-create-quiz"
                  type="text"
                  v-model="searchSetQuery"
                  placeholder="Type to search sets and press Enter"
                  @keyup.enter="triggerSearchNow"
                  class="styled-input"
                  style="flex-grow: 1;"
                  aria-label="Search public sets input"
              />
              <PrimaryButton
                  text="Search"
                  @click="triggerSearchNow"
                  :disabled="isSearchButtonDisabled"
                  style="min-width: auto; padding: 0 15px; height: 40px;"
              >
                <template #icon>
                  <font-awesome-icon :icon="searchingSets ? icons.spinner : icons.search" :spin="searchingSets"/>
                </template>
              </PrimaryButton>
            </div>
            <small v-if="searchingSets && !publicFlashcardSetOptions.length && !isLoadingSetById" class="loading-text">Searching...</small>
            <small v-if="isLoadingSetById" class="loading-text">Loading set...</small>
            <small v-if="searchErrorText" class="error-text">{{ searchErrorText }}</small>
            <small v-if="searchAttempted && !searchingSets && !publicFlashcardSetOptions.length && !searchErrorText && !isLoadingSetById" class="info-text">No sets found for your query.</small>
          </div>

          <FilterableDropdown
              v-if="publicFlashcardSetOptions.length > 0 || (searchAttempted && !searchErrorText) || isLoadingSetById"
              label="Select Flashcard Set"
              :options="publicFlashcardSetOptions"
              v-model="selectedSetId"
              placeholder="Select a set..."
              class="settings-item span-2"
              option-label="label"
              option-value="value"
              :disabled="isLoadingSetById"
          />

          <div v-if="showPaginationControls" class="pagination-controls settings-item span-2">
            <button
                @click="searchPrevPage"
                :disabled="searchingSets || isLoadingSetById || searchCurrentPage <= 0"
                class="pagination-button"
            >
              <font-awesome-icon :icon="icons.chevronLeft" /> Previous
            </button>
            <span v-if="searchTotalElements > 0" class="page-info">
              Page {{ searchCurrentPage + 1 }} of {{ searchTotalPages }}
              ({{ searchTotalElements }} result{{ searchTotalElements !== 1 ? 's' : '' }})
            </span>
            <span v-else-if="searchAttempted && !searchingSets && !isLoadingSetById && publicFlashcardSetOptions.length === 0" class="page-info">
               0 results
             </span>
            <button
                @click="searchNextPage"
                :disabled="searchingSets || isLoadingSetById || searchCurrentPage >= searchTotalPages - 1"
                class="pagination-button"
            >
              Next <font-awesome-icon :icon="icons.chevronRight" />
            </button>
          </div>


          <div class="settings-item span-2 slider-container">
            <label class="slider-label" id="question-count-label">
              <font-awesome-icon :icon="icons.listOl" class="label-icon"/>
              Number of Questions: {{ questionCount }}
            </label>
            <vue-slider
                v-model="questionCount"
                :min="SLIDER_MIN_QUESTIONS"
                :max="maxQuestionsForSlider"
                :interval="1"
                :marks="sliderMarkLabels"
                :process-style="{ backgroundColor: 'var(--primary-color, #5F98EF)' }"
                :rail-style="{ backgroundColor: 'var(--bg-tertiary, #2a335a)' }"
                :dot-style="sliderDotStyle"
                :height="8"
                :tooltip="'none'"
                :lazy="true"
                aria-labelledby="question-count-label"
            />
          </div>

          <ToggleSwitch
              label="Enable Timer"
              v-model="timeEnabled"
              class="settings-item align-center"
              label-icon="stopwatch"/>

          <div v-if="timeEnabled" class="settings-item input-group align-center">
            <input
                id="time-limit-input"
                type="number"
                v-model.number="timeLimit"
                min="1"
                max="120"
                class="styled-input time-input"
                aria-label="Time Limit in Minutes"
            />
            <label for="time-limit-input" class="input-unit-label">Minutes</label>
          </div>
          <div v-else class="settings-item grid-placeholder"></div>

          <ToggleSwitch
              label="Lock Navigation During Quiz"
              v-model="lockedNav"
              class="settings-item span-2 align-center"
              label-icon="lock"/>
        </div>
      </section>

      <div class="start-button-container">
        <PrimaryButton
            text="Generate Quiz" @click="goToQuiz"
            :disabled="isStartQuizButtonDisabled"
            :title="startQuizDisabledTooltip" class="start-button"
        >
          <template #icon>
            <font-awesome-icon :icon="generatingQuiz ? icons.spinner : icons.play" :spin="generatingQuiz"/>
          </template>
        </PrimaryButton>
        <small v-if="generateQuizErrorText" class="error-text">Error generating quiz: {{ generateQuizErrorText }}</small>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import { useMutation, useApolloClient } from '@vue/apollo-composable';
import { SEARCH_PUBLIC_FLASHCARD_SETS, GENERATE_QUIZ_MUTATION, GET_FLASHCARD_SET_BY_ID } from '../../graphql/auth'; // Added GET_FLASHCARD_SET_BY_ID

// --- Font Awesome ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faListCheck, faSliders, faLayerGroup, faListOl, faStopwatch, faLock, faPlay,
  faListUl, faToggleOn, faKeyboard, faTasks, faSearch, faSpinner, faChevronLeft, faChevronRight, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faListCheck, faSliders, faLayerGroup, faListOl, faStopwatch, faLock, faPlay,
    faListUl, faToggleOn, faKeyboard, faTasks, faSearch, faSpinner, faChevronLeft, faChevronRight, faTriangleExclamation
);

const icons = {
  listCheck: faListCheck, sliders: faSliders, layerGroup: faLayerGroup, listOl: faListOl,
  stopwatch: faStopwatch, lock: faLock, play: faPlay, listUl: faListUl, toggleOn: faToggleOn,
  keyboard: faKeyboard, tasks: faTasks, search: faSearch, spinner: faSpinner,
  chevronLeft: faChevronLeft, chevronRight: faChevronRight, triangleExclamation: faTriangleExclamation
};

// --- Components ---
import VueSlider from 'vue-3-slider-component';
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import ModeSelectionBox from "@/components/quiz/ModeSelectionBox.vue";
import FilterableDropdown from "@/components/quiz/FilterableDropdown.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";

// --- Router ---
const router = useRouter();
const route = useRoute(); // Added for accessing URL query parameters
const { client: apolloClient } = useApolloClient();

const QuestionTypeEnum = Object.freeze({
  MULTIPLE_CHOICE_SINGLE_ANSWER: "MULTIPLE_CHOICE_SINGLE_ANSWER",
  MULTIPLE_CHOICE_MULTIPLE_ANSWER: "MULTIPLE_CHOICE_MULTIPLE_ANSWER",
  TRUE_FALSE: "TRUE_FALSE",
  SHORT_ANSWER: "SHORT_ANSWER"
});
const SLIDER_MIN_QUESTIONS = 5;
const DEFAULT_MAX_QUESTIONS = 35;

const selectedModes = ref([]);
const selectedSetId = ref(null);
const timeEnabled = ref(true);
const timeLimit = ref(20);
const lockedNav = ref(false);
const questionCount = ref(10);
const maxQuestionsForSlider = ref(DEFAULT_MAX_QUESTIONS);

// Search State
const searchSetQuery = ref('');
const publicFlashcardSetOptions = ref([]);
const rawSearchResults = ref([]); // To store full set objects for details like flashcard count
const searchErrorText = ref('');
const searchAttempted = ref(false); // Indicates if a search (or direct load) has been tried
const searchingSets = ref(false); // For text-based search
const isLoadingSetById = ref(false); // For loading set by ID from URL
const searchCurrentPage = ref(0);
const searchPageSize = ref(10);
const searchTotalPages = ref(0);
const searchTotalElements = ref(0);

const generateQuizErrorText = ref('');

const {
  mutate: generateQuizGQLMutate,
  loading: generatingQuiz,
  onError: onGenerateQuizError,
} = useMutation(GENERATE_QUIZ_MUTATION);

onGenerateQuizError(error => {
  const gqlError = error.graphQLErrors && error.graphQLErrors[0];
  if (gqlError) {
    generateQuizErrorText.value = gqlError.message;
  } else if (error.networkError) {
    generateQuizErrorText.value = error.networkError.message || "Network error. Failed to generate quiz.";
  } else {
    generateQuizErrorText.value = "Failed to generate quiz. Please try again.";
  }
});

const modes = ref([
  { label: "Multiple Choice (Single)", icon: icons.listUl, enumValue: QuestionTypeEnum.MULTIPLE_CHOICE_SINGLE_ANSWER, description: "Select one correct answer from several options." },
  { label: "Multiple Choice (Multi)", icon: icons.tasks, enumValue: QuestionTypeEnum.MULTIPLE_CHOICE_MULTIPLE_ANSWER, description: "Select one or more correct answers from several options." },
  { label: "True/False", icon: icons.toggleOn, enumValue: QuestionTypeEnum.TRUE_FALSE, description: "Answer if a statement is true or false." },
  { label: "Short Answer", icon: icons.keyboard, enumValue: QuestionTypeEnum.SHORT_ANSWER, description: "Type a brief answer, often one or two words." },
]);

function toggleModeSelection(modeEnumValue) {
  const index = selectedModes.value.indexOf(modeEnumValue);
  if (index === -1) {
    selectedModes.value.push(modeEnumValue);
  } else {
    selectedModes.value.splice(index, 1);
  }
}

async function fetchAndSelectSetById(setId) {
  if (!setId) return;

  isLoadingSetById.value = true;
  searchErrorText.value = '';
  publicFlashcardSetOptions.value = [];
  rawSearchResults.value = [];
  selectedSetId.value = null; // Clear previous selection

  try {
    const { data, errors } = await apolloClient.query({
      query: GET_FLASHCARD_SET_BY_ID,
      variables: { id: setId },
      fetchPolicy: 'network-only',
    });

    searchAttempted.value = true;

    if (errors && errors.length > 0) {
      searchErrorText.value = errors.map(e => e.message).join(", ") || "Failed to load set by ID.";
    } else if (data?.findFlashcardSetById) {
      const set = data.findFlashcardSetById;
      rawSearchResults.value = [set]; // Store the full set object
      publicFlashcardSetOptions.value = [{ value: set.id, label: set.title }];
      selectedSetId.value = set.id; // Auto-select this set
      searchSetQuery.value = `"${set.title}" (Loaded by ID)`; // Optionally update search query display

      // Update pagination to reflect single loaded set
      searchTotalElements.value = 1;
      searchTotalPages.value = 1;
      searchCurrentPage.value = 0;

    } else {
      searchErrorText.value = "Set not found or an unexpected error occurred.";
    }
  } catch (e) {
    searchErrorText.value = (e.networkError?.message || e.message || "An unexpected error occurred while fetching the set.");
    searchAttempted.value = true;
  } finally {
    isLoadingSetById.value = false;
  }
}

async function executeSearch(pageToFetch = 0) {
  const queryToSearch = searchSetQuery.value.trim();

  if (queryToSearch.length < 2 && queryToSearch !== '*' && !queryToSearch.includes("(Loaded by ID)")) {
    if (pageToFetch === 0) { // Only show this specific error on a new search attempt
      searchErrorText.value = "Please enter at least 2 characters to search, or use '*' for all sets.";
      publicFlashcardSetOptions.value = [];
      rawSearchResults.value = [];
      searchTotalPages.value = 0;
      searchTotalElements.value = 0;
      searchAttempted.value = true; // Mark that an attempt was made
    }
    searchingSets.value = false; // Ensure searching is false if validation fails
    return;
  }

  searchingSets.value = true;
  searchErrorText.value = ''; // Clear previous errors

  // If it's a new search (page 0), clear previous selection and results
  if (pageToFetch === 0) {
    selectedSetId.value = null;
    publicFlashcardSetOptions.value = [];
    rawSearchResults.value = [];
  }

  try {
    const { data, errors } = await apolloClient.query({
      query: SEARCH_PUBLIC_FLASHCARD_SETS,
      variables: {
        query: queryToSearch.replace(" (Loaded by ID)", "").replace(/"/g, ""), // Clean up query if it was from direct load
        page: pageToFetch,
        size: searchPageSize.value,
      },
      fetchPolicy: 'network-only',
    });

    searchAttempted.value = true;

    if (errors && errors.length > 0) {
      searchErrorText.value = errors.map(e => e.message).join(", ") || "Search failed with errors.";
      publicFlashcardSetOptions.value = [];
      rawSearchResults.value = [];
      searchTotalPages.value = 0;
      searchTotalElements.value = 0;
    } else if (data?.searchPublicFlashcardSets) {
      const { items, pageInfo } = data.searchPublicFlashcardSets;
      rawSearchResults.value = items || [];
      publicFlashcardSetOptions.value = rawSearchResults.value.map(set => ({
        value: set.id,
        label: set.title,
      }));

      if (pageInfo) {
        searchTotalPages.value = pageInfo.totalPages;
        searchTotalElements.value = pageInfo.totalElements;
        searchCurrentPage.value = pageInfo.currentPage;
      } else { // Fallback if pageInfo is missing (should ideally not happen with spec)
        searchTotalPages.value = (items && items.length > 0) ? pageToFetch + 1 : pageToFetch;
        searchTotalElements.value = items ? items.length : 0;
        searchCurrentPage.value = pageToFetch;
      }
    } else {
      searchErrorText.value = "Search returned an unexpected result structure.";
      publicFlashcardSetOptions.value = [];
      rawSearchResults.value = [];
      searchTotalPages.value = 0;
      searchTotalElements.value = 0;
    }
  } catch (e) {
    searchErrorText.value = (e.networkError?.message || e.message || "An unexpected error occurred during search.");
    searchAttempted.value = true; // Mark attempt even on critical failure
    publicFlashcardSetOptions.value = [];
    rawSearchResults.value = [];
    searchTotalPages.value = 0;
    searchTotalElements.value = 0;
  } finally {
    searchingSets.value = false;
  }
}

async function triggerSearchNow() {
  searchAttempted.value = false; // Reset for new search
  // If search query was previously from a direct load, allow typing to clear it
  if (searchSetQuery.value.includes("(Loaded by ID)")) {
    // Heuristic: if user types something new, assume they want a new search
    // This might need refinement based on exact desired UX
  }
  await executeSearch(0); // Search from the first page
}

function searchNextPage() {
  if (searchCurrentPage.value < searchTotalPages.value - 1) {
    executeSearch(searchCurrentPage.value + 1);
  }
}

function searchPrevPage() {
  if (searchCurrentPage.value > 0) {
    executeSearch(searchCurrentPage.value - 1);
  }
}

async function goToQuiz() {
  if (isStartQuizButtonDisabled.value) {
    return;
  }
  generateQuizErrorText.value = '';

  const quizGenOptions = {
    setId: selectedSetId.value,
    questionTypes: selectedModes.value,
    kQuestions: questionCount.value,
    // Assuming your GQL mutation expects these parameters
    // Add other parameters like timeEnabled, timeLimit, lockedNav if your backend supports them for quiz generation
  };

  try {
    const result = await generateQuizGQLMutate({ options: quizGenOptions });
    const quizData = result?.data?.generateQuiz;

    if (quizData?.id && quizData?.questions?.length > 0) {
      await router.push({
        name: 'quizOverview', // Ensure this route name is correct
        params: {id: quizData.id}
      });
    } else {
      const serverErrorMessage = result?.errors?.[0]?.message;
      if (serverErrorMessage) {
        generateQuizErrorText.value = serverErrorMessage;
      } else if (!quizData?.id) {
        generateQuizErrorText.value = "Quiz generation succeeded but did not return a valid ID.";
      } else if (!quizData?.questions?.length > 0) {
        generateQuizErrorText.value = "Quiz generation failed to produce any questions.";
      } else if (!generateQuizErrorText.value) { // Fallback if no specific error caught
        generateQuizErrorText.value = "Quiz generation failed or returned incomplete data.";
      }
    }
  } catch (error) {
    // This catch block might be redundant if onGenerateQuizError handles all mutation errors,
    // but good for safety.
    if (!generateQuizErrorText.value) { // Only set if not already set by onGenerateQuizError
      const networkMsg = error.networkError?.message;
      const gqlMsg = error.graphQLErrors?.map(e => e.message).join(', ');
      generateQuizErrorText.value = gqlMsg || networkMsg || error.message || "An unexpected error occurred while generating the quiz.";
    }
  }
}

watch(selectedSetId, (newId) => {
  if (newId) {
    const chosenSetData = rawSearchResults.value.find(s => s.id === newId);
    if (chosenSetData?.flashcards) {
      const numCards = chosenSetData.flashcards.length;
      maxQuestionsForSlider.value = Math.max(numCards > 0 ? numCards : SLIDER_MIN_QUESTIONS, SLIDER_MIN_QUESTIONS);
    } else {
      maxQuestionsForSlider.value = DEFAULT_MAX_QUESTIONS;
    }
  } else {
    maxQuestionsForSlider.value = DEFAULT_MAX_QUESTIONS;
  }
  if (questionCount.value > maxQuestionsForSlider.value) {
    questionCount.value = maxQuestionsForSlider.value;
  }
  if (questionCount.value < SLIDER_MIN_QUESTIONS) {
    questionCount.value = SLIDER_MIN_QUESTIONS;
  }
});

const isSearchButtonDisabled = computed(() => {
  const query = searchSetQuery.value.trim();
  return searchingSets.value || isLoadingSetById.value || (query.length < 2 && query !== '*' && !query.includes("(Loaded by ID)"));
});
const isStartQuizButtonDisabled = computed(() => {
  return selectedModes.value.length === 0 || !selectedSetId.value || generatingQuiz.value || isLoadingSetById.value;
});
const startQuizDisabledTooltip = computed(() => {
  if (generatingQuiz.value) return "Generating quiz...";
  if (isLoadingSetById.value) return "Loading set data...";
  const missing = [];
  if (selectedModes.value.length === 0) missing.push("at least one question type");
  if (!selectedSetId.value) missing.push("a flashcard set");
  return missing.length > 0 ? `Please select ${missing.join(" and ")}.` : "";
});

const sliderMarkLabels = computed(() => {
  const labels = {}; const min = SLIDER_MIN_QUESTIONS; const max = maxQuestionsForSlider.value;
  labels[min] = String(min);
  if (max > min) { // Only add more marks if max is greater than min
    const step = Math.max(1, Math.floor((max - min) / 5)); // Aim for around 5 marks
    for (let i = min + step; i < max; i += step) {
      if (i > min) labels[Math.round(i / step) * step] = String(Math.round(i / step) * step); // Snap to nice numbers
    }
    labels[max] = String(max);
  }
  return labels;
});

const sliderDotStyle = computed(() => ({
  width: '20px', height: '20px', backgroundColor: 'var(--primary-color, #5F98EF)',
  border: '3px solid var(--bg-secondary, #fff)',
  boxShadow: '0 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.3)',
  borderRadius: '50%', cursor: 'pointer'
}));

const showPaginationControls = computed(() => {
  // Show if more than one page, or if a search has been attempted and there are results (even if only one page of results)
  // Do not show if actively loading a single set by ID and it hasn't resolved to a page count yet
  if (isLoadingSetById.value && searchTotalPages.value <=1) return false; // Don't show while initial single set is loading unless it results in multiple pages (not expected for byID)
  return searchTotalPages.value > 1 || (searchAttempted.value && searchTotalElements.value > 0 && searchTotalPages.value === 1 && !searchSetQuery.value.includes("(Loaded by ID)"));
});


onMounted(async () => {
  // Adjust initial question count based on slider constraints
  questionCount.value = Math.max(SLIDER_MIN_QUESTIONS, Math.min(questionCount.value, maxQuestionsForSlider.value));

  // Check for setId in URL query parameters
  const setIdFromQuery = route.query.setId;
  if (setIdFromQuery) {
    await fetchAndSelectSetById(setIdFromQuery);
  }
});
</script>

<style scoped>
:root {
  --primary-color: #5F98EF;
  --primary-color-rgb: 95, 152, 239;
  --bg-primary: #121729;
  --bg-secondary: #1b2233;
  --bg-tertiary: #2a335a;
  --text-primary: #ffffff;
  --text-secondary: #a0a8c2;
  --border-color: #303854;
  --error-color: #ff6b6b;
  --success-color: #6cc644;
  --info-text-color: #a0a8c2;
  --disabled-bg-color: #2c3e50; /* Example disabled background */
  --disabled-text-color: #7f8c8d; /* Example disabled text */
}
.quizzes-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0 20px 0;
  border-bottom: 1px solid var(--border-color);
  gap: 20px;
}
.header-text { flex-grow: 1; }
.page-title {
  font-size: 1.9em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}
.page-subtitle {
  font-size: 1em;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}
.header-icon {
  width: 120px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 5px;
  opacity: 0.9;
}
.quiz-setup-card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 35px 45px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 45px;
}
.config-section { }
.section-title {
  font-size: 1.4em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 30px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-icon {
  color: var(--primary-color);
  font-size: 0.9em;
}
.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.mode-box {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  cursor: pointer;
}
.mode-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(var(--primary-color-rgb), 0.25);
}
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px 25px;
  align-items: start;
}
.settings-item {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.settings-item.span-2 { grid-column: span 2; }
@media (max-width: 600px) {
  .settings-item.span-2 { grid-column: span 1; }
}
.settings-item.align-center {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.input-group label.input-unit-label {
  color: var(--text-secondary);
  font-size: 0.9em;
  font-weight: 400;
  flex-shrink: 0;
  margin-top: 0;
}
.time-input {
  width: 80px;
  text-align: center;
  -moz-appearance: textfield;
}
.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.grid-placeholder {
  min-height: 50px;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
}
.slider-label,
:deep(.toggle-switch-label) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.95em;
  font-weight: 500;
  margin-bottom: 5px;
  width: auto;
}
.settings-item.align-center :deep(.toggle-switch-label),
.settings-item.align-center .slider-label {
  margin-bottom: 0;
}
.label-icon {
  color: var(--text-secondary);
  opacity: 0.8;
  font-size: 0.9em;
  flex-shrink: 0;
}
.styled-input {
  padding: 10px 14px;
  border-radius: 8px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1em;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  height: 40px;
  box-sizing: border-box;
}
.styled-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.3);
}
.loading-text, .error-text, .info-text {
  font-size: 0.85em;
  padding-left: 2px;
  margin-top: 4px;
  display: block;
}
.error-text { color: var(--error-color); }
.info-text { color: var(--info-text-color); }
.loading-text { color: var(--primary-color); }

.slider-container {
  padding: 15px 5px 10px 5px;
  width: 100%;
  box-sizing: border-box;
}
.slider-container .slider-label { margin-bottom: 15px; }

:deep(.vue-slider-mark-label) {
  color: var(--text-secondary);
  font-size: 0.85em;
  margin-top: 12px;
}
:deep(.vue-slider-mark-step) {
  background-color: var(--border-color);
  height: 6px;
  width: 2px;
  border-radius: 1px;
}
:deep(.vue-slider-mark.vue-slider-mark-active .vue-slider-mark-step) {
  background-color: var(--primary-color);
}
:deep(.vue-slider-dot) {
  cursor: grab;
}
.start-button-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid var(--border-color);
}
.start-button {
  min-width: 200px;
}
/* Enhanced disabled styles for the start button */
.start-button:disabled,
.start-button[disabled] { /* Redundant but ensures coverage if PrimaryButton uses disabled attribute differently */
  cursor: not-allowed !important;
  background-color: var(--disabled-bg-color) !important; /* Assuming PrimaryButton uses background-color */
  color: var(--disabled-text-color) !important;
  opacity: 0.6 !important;
  /* If PrimaryButton uses border, you might want to style that too */
  /* border-color: var(--disabled-border-color) !important; */
}

.start-button-container .error-text {
  margin-top: 8px;
  width: 100%;
  text-align: right;
}

@media (max-width: 768px) {
  .quiz-setup-card { padding: 25px 20px; gap: 35px; }
  .modes-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  .page-header { flex-direction: column; align-items: flex-start; padding-bottom: 15px; }
  .header-icon { display: none; }
  .settings-grid { grid-template-columns: 1fr; gap: 25px; }
  .settings-item.span-2 { grid-column: span 1; }
  .time-input { width: 60px; }
  .start-button-container { align-items: center; }
  .start-button-container .error-text { text-align: center; }
  .start-button { width: 100%; }
}

@media (max-width: 480px) {
  .page-title { font-size: 1.6em; }
  .section-title { font-size: 1.2em; margin-bottom: 25px; }
  .modes-grid { grid-template-columns: 1fr; gap: 15px; }
  .quiz-setup-card { padding: 20px 15px; gap: 30px; }
  .settings-item { min-height: 45px; }
  .grid-placeholder { min-height: 45px; }
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  gap: 10px;
}
.pagination-button {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s, border-color 0.2s;
}
.pagination-button:hover:not(:disabled) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-info {
  color: var(--text-secondary);
  font-size: 0.9em;
  flex-grow: 1;
  text-align: center;
}
</style>