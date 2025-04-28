<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ collapsed: isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <section class="content-wrapper">
        <div class="content-container">
          <header class="content-header">
            <div class="content-text">
              <h1>Test Your Knowledge</h1>
              <p>Pick a flashcard set and quiz yourself!</p>
            </div>
            <img src="@/assets/quizzes.png" class="page-icon" alt="Quiz Icon" />
          </header>

          <section class="modes">
            <ModeSelectionBox
                v-for="mode in modes"
                :key="mode.label"
                :label="mode.label"
                :iconComponent="mode.iconComponent"
                :isSelected="selectedMode === mode.label"
                @click="selectedMode = mode.label"
            />
          </section>

          <section class="settings-section">
            <FilterableDropdown
                label="Flashcard Set"
                :options="flashcardSets"
                v-model="selectedSet"
            />

            <ToggleSwitch label="Enable Timer" v-model="timeEnabled" />

            <div v-if="timeEnabled" class="input-row">
              <label>Time Limit (Minutes)</label>
              <input type="number" v-model.number="timeLimit" min="1" />
            </div>

            <ToggleSwitch label="Lock Navigation" v-model="lockedNav" />

            <div class="number-slider-row">
              <label class="slider-label">Number of Questions: {{ questionCount }}</label>
              <vue-slider
                  v-model="questionCount"
                  :min="5"
                  :max="50"
                  :interval="1"
                  :adsorb="false"
                  :marks="markLabels"
              :process-style="{ backgroundColor: '#5F98EF' }"
              :rail-style="{ backgroundColor: '#2a335a' }"
              :dot-style="dotStyle"
              :height="6"
              :tooltip="'none'"
              />



            </div>
          </section>

          <div class="start-button-container">
            <PrimaryButton text="Start Quiz" @click="goToQuiz" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>


<script>
import VueSlider from 'vue-3-slider-component';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import ModeSelectionBox from "@/components/ModeSelectionBox.vue";
import MultipleChoiceIcon from "@/components/icons/MultipleChoiceIcon.vue";
import TrueFalseIcon from "@/components/icons/TrueFalseIcon.vue";
import OneWordIcon from "@/components/icons/OneWordIcon.vue";
import FilterableDropdown from "@/components/FilterableDropdown.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";

export default {
  name: "Quizzes",
  components: {
    SidebarNavigation,
    NavigationBar,
    PrimaryButton,
    ModeSelectionBox,
    MultipleChoiceIcon,
    TrueFalseIcon,
    OneWordIcon,
    FilterableDropdown,
    ToggleSwitch,
    VueSlider
  },
  data() {
    return {
      isSidebarCollapsed: false,
      selectedMode: null,
      selectedSet: null,
      timeEnabled: true,
      timeLimit: 20,
      lockedNav: false,
      questionCount: 10,
      reviewMode: true,
      modes: [
        { label: "Multiple Choice", iconComponent: MultipleChoiceIcon },
        { label: "True/False", iconComponent: TrueFalseIcon },
        { label: "One-word", iconComponent: OneWordIcon },
      ],
      flashcardSets: [
        "Bio 129 Chapter 2",
        "CHEM 139 Chapter 3",
        "Math 142 Chapter 1",
        "CSC 339 Quiz 2",
      ],
      dotStyle: {
        width: '20px',
        height: '20px',
        backgroundColor: '#5F98EF',
        border: '2px solid #fff',
        boxShadow: '0 0 0 2px rgba(95, 152, 239, 0.3)'
      }
    };
  },
  computed: {
    markLabels() {
      const labels = {};
      for (let i = 5; i <= 50; i += 5) {
        labels[i] = i.toString(); // Only multiples of 5 get a label
      }
      return labels;
    }
  },

  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    goToQuiz() {
      if (!this.selectedMode || !this.selectedSet) {
        alert("Please select a mode and a flashcard set.");
        return;
      }

      this.$router.push({
        name: "QuizRunner",
        query: {
          mode: this.selectedMode,
          set: this.selectedSet,
          timeEnabled: this.timeEnabled,
          timeLimit: this.timeLimit,
          lockedNav: this.lockedNav,
          questionCount: this.questionCount,
          reviewMode: this.reviewMode
        }
      });
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

.page {
  display: flex;
  background-color: #161b29;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  margin-left: 250px;
  width: calc(100% - 250px);
  padding-top: 80px;
  transition: margin-left 0.3s ease;
}

.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.content-wrapper {
  display: flex;
  justify-content: center;
  padding: 30px;
}

.content-container {
  width: 100%;
  background-color: #212837;
  border-radius: 18px;
  padding: 40px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 30px;
  font-family: 'Outfit', sans-serif;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-text h1 {
  font-size: 32px;
  color: #ffffff;
  margin-bottom: 8px;
}

.content-text p {
  font-size: 16px;
  color: #b0b8cc;
}

.page-icon {
  width: 150px;
  height: 150px;
}

.modes {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-row {
  background: #1a1f2e;
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-row label {
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
}

.input-row input {
  width: 80px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #2a3147;
  border: none;
  color: #ffffff;
  font-size: 15px;
  text-align: center;
  outline: none;
}

.input-row input:focus {
  background-color: #2f3a57;
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3);
}

.start-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.start-button-container >>> .primary-button {
  width: 200px;
}
.number-slider-row {
  background: #121729;
  padding: 20px;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  color: white;
  margin-bottom: 16px;
}

.slider-label {
  display: block;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: 500;
}

/* VueSlider deep styles */
:deep(.vue-slider) {
  margin-bottom: 10px;
}

:deep(.vue-slider-mark) {
  top: auto;
  bottom: -18px;
  width: 1px;
}

:deep(.vue-slider-mark-step) {
  width: 1px;
  height: 5px;
  background-color: #666;
  opacity: 0.7;
}

:deep(.vue-slider-mark.vue-slider-mark-active .vue-slider-mark-step) {
  background-color: #5F98EF;
}

:deep(.vue-slider-mark[data-value="5"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="10"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="15"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="20"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="25"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="30"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="35"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="40"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="45"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="50"] .vue-slider-mark-step) {
  width: 2px;
  height: 10px;
  background-color: #aaa;
}

:deep(.vue-slider-mark-label) {
  font-size: 12px;
  color: #aaa;
  font-weight: bold;
  margin-top: 5px;
}

:deep(.vue-slider-mark[data-value="5"] .vue-slider-mark-label) {
  transform: translateX(0);
  left: 0;
}

:deep(.vue-slider-mark[data-value="50"] .vue-slider-mark-label) {
  transform: translateX(-100%);
  right: 0;
}

</style>
