<template>
  <main class="quizzes-content">
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Test Your Knowledge</h1>
        <p class="page-subtitle">Configure your quiz settings and select a set to begin.</p>
      </div>
      <img src="../../assets/quizzes.png" class="header-icon" alt="Quiz Icon"/>
    </header>

    <div class="quiz-setup-card">

      <section class="config-section mode-selection-section">
        <h2 class="section-title">
          <font-awesome-icon :icon="faListCheck" class="title-icon"/>
          Choose Quiz Mode
        </h2>
        <div class="modes-grid">
          <ModeSelectionBox
              v-for="mode in modes"
              :key="mode.label"
              :label="mode.label"
              :iconComponent="mode.iconComponent"
              :isSelected="selectedMode === mode.label"
              @click="selectedMode = mode.label"
              class="mode-box"
          />
        </div>
      </section>

      <section class="config-section settings-section">
        <h2 class="section-title">
          <font-awesome-icon :icon="faSliders" class="title-icon"/>
          Configure Settings
        </h2>

        <div class="settings-grid">
          <FilterableDropdown
              label="Flashcard Set"
              :options="flashcardSets"
              v-model="selectedSet"
              placeholder="Select a set..."
              class="settings-item span-2"
              label-icon="layer-group"/>

          <div class="settings-item span-2 slider-container">
            <label class="slider-label" id="question-count-label">
              <font-awesome-icon :icon="faListOl" class="label-icon"/>
              Number of Questions: {{ questionCount }}
            </label>
            <vue-slider
                v-model="questionCount"
                :min="5"
                :max="maxQuestions"
                :interval="1"
                :marks="markLabels"
                :process-style="{ backgroundColor: 'var(--primary-color, #5F98EF)' }"
                :rail-style="{ backgroundColor: 'var(--bg-tertiary, #2a335a)' }"
                :dot-style="dotStyle"
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
            text="Start Quiz"
            @click="goToQuiz"
            :disabled="!selectedMode || !selectedSet"
            :title="disabledTooltipText" class="start-button"
        >
          <template #icon>
            <font-awesome-icon :icon="faPlay"/>
          </template>
        </PrimaryButton>
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, computed, shallowRef} from 'vue';
import {useRouter} from 'vue-router';

// --- Font Awesome ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faListCheck, faSliders, faLayerGroup, faListOl, faStopwatch, faLock, faPlay
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faListCheck, faSliders, faLayerGroup, faListOl, faStopwatch, faLock, faPlay
);

// --- Components ---
import VueSlider from 'vue-3-slider-component';
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import ModeSelectionBox from "@/components/quiz/ModeSelectionBox.vue";
import FilterableDropdown from "@/components/quiz/FilterableDropdown.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import MultipleChoiceIcon from "@/components/icons/MultipleChoiceIcon.vue";
import TrueFalseIcon from "@/components/icons/TrueFalseIcon.vue";
import OneWordIcon from "@/components/icons/OneWordIcon.vue";

// --- Router ---
const router = useRouter();

// --- State ---
const selectedMode = ref(null);
const selectedSet = ref(null);
const timeEnabled = ref(true);
const timeLimit = ref(20);
const lockedNav = ref(false);
const questionCount = ref(10);
const reviewMode = ref(true);

// --- Configuration ---
const modes = ref([
  {label: "Multiple Choice", iconComponent: shallowRef(MultipleChoiceIcon)},
  {label: "True/False", iconComponent: shallowRef(TrueFalseIcon)},
  {label: "One-word", iconComponent: shallowRef(OneWordIcon)},
]);

// TODO: Fetch flashcard sets dynamically
const flashcardSets = ref([
  "Bio 129 Chapter 2",
  "CHEM 139 Chapter 3",
  "Math 142 Chapter 1",
  "CSC 339 Quiz 2",
]);

const maxQuestions = ref(35);

// --- Computed Properties ---
const markLabels = computed(() => {
  const labels = {5: '5'};
  const max = maxQuestions.value;
  for (let i = 10; i <= max; i += 5) {
    labels[i] = i.toString();
  }
  if (!labels[max]) {
    labels[max] = max.toString();
  }
  return labels;
});

const dotStyle = computed(() => ({
  width: '20px',
  height: '20px',
  backgroundColor: 'var(--primary-color, #5F98EF)',
  border: '3px solid var(--bg-secondary, #fff)',
  boxShadow: '0 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.3)',
  borderRadius: '50%',
  cursor: 'pointer'
}));

const disabledTooltipText = computed(() => {
  if (!selectedMode.value && !selectedSet.value) {
    return "Please select a quiz mode and a flashcard library.";
  }
  if (!selectedMode.value) {
    return "Please select a quiz mode.";
  }
  if (!selectedSet.value) {
    return "Please select a flashcard library.";
  }
  return null;
});

// --- Methods ---
function goToQuiz() {
  if (!selectedMode.value || !selectedSet.value) {
    console.warn("Attempted to start quiz without required selections.");
    return;
  }
  router.push({
    name: "createQuiz",
    query: {
      mode: selectedMode.value,
      set: selectedSet.value,
      timeEnabled: timeEnabled.value,
      timeLimit: timeLimit.value,
      lockedNav: lockedNav.value,
      questionCount: questionCount.value,
      reviewMode: reviewMode.value
    }
  });
}
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

/* --- Page Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0 20px 0;
  border-bottom: 1px solid var(--border-color);
  gap: 20px;
}

.header-text {
  flex-grow: 1;
}

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

/* --- Main Config Card --- */
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

/* --- Section Styling --- */
.config-section {
}

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
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 25px;
}

.mode-box {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
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

.settings-item.span-2 {
  grid-column: span 2;
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

/* --- Labels with Icons --- */
.slider-label,
:deep(.toggle-switch) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.95em;
  font-weight: 500;
  margin-bottom: 5px;
  width: auto;
}

.settings-item.align-center :deep(.toggle-switch),
.settings-item.align-center .slider-label {
  margin-bottom: 0;
}

.label-icon {
  color: var(--text-secondary);
  opacity: 0.8;
  font-size: 0.9em;
  flex-shrink: 0;
}

/* --- Input Styling --- */
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

/* --- Slider Styling --- */
.slider-container {
  padding: 15px 5px 10px 5px; /* Adjust padding if needed */
  width: 100%;
  box-sizing: border-box;
}

.slider-container .slider-label {
  margin-bottom: 15px;
}

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
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid var(--border-color);
}

.start-button {
  min-width: 200px;
}

.start-button[disabled] {
  cursor: not-allowed;
}

/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .quiz-setup-card {
    padding: 25px 20px;
    gap: 35px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 15px;
  }

  .header-icon {
    display: none;
  }

  .settings-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .settings-item.span-2 {
    grid-column: span 1;
  }

  .settings-item.align-center {
  }

  .time-input {
    width: 60px;
  }

  .start-button-container {
    justify-content: center;
  }

  .start-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.6em;
  }

  .section-title {
    font-size: 1.2em;
    margin-bottom: 25px;
  }

  .modes-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .quiz-setup-card {
    padding: 20px 15px;
    gap: 30px;
  }

  .settings-item {
    min-height: 45px;
  }

  .grid-placeholder {
    min-height: 45px;
  }
}
</style>