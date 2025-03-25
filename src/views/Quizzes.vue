<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content-wrapper">
        <div class="content-container">
          <div class="content-header">
            <div class="content-text">
              <h1>Test Your Knowledge</h1>
              <p>Choose a flashcard set to start your quiz and challenge yourself!</p>
            </div>
            <img src="@/assets/quizzes.png" class="page-icon" alt="Book Icon" />
          </div>

          <div class="modes">
            <ModeSelectionBox
                v-for="mode in modes"
                :key="mode.label"
                :label="mode.label"
                :iconComponent="mode.iconComponent"
                :isSelected="selectedMode === mode.label"
                @click="selectedMode = mode.label"
            />
          </div>

          <FilterableDropdown
              label="Choose Flashcard Set"
              :options="flashcardSets"
              v-model="selectedSet"
          />

          <ToggleSwitch
              label="Set Time Limit"
              v-model="timeEnabled"
          />

          <div v-if="timeEnabled" class="time-limit-input">
            <label>Time Limit (Minutes)</label>
            <input type="number" v-model.number="timeLimit" min="1" />
          </div>

          <ToggleSwitch label="Locked Navigation" v-model="lockedNav" />

          <div class="number-input-row">
            <label>Number of Questions</label>
            <input type="number" v-model.number="questionCount" min="1" />
          </div>

          <ToggleSwitch label="Review Mode" v-model="reviewMode" />
          <div class="button-container">
            <PrimaryButton text="Start Quiz" @click="goToQuiz" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.page {
  display: flex;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 250px;
  width: calc(100% - 250px);
  padding-top: 80px;
}

.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.content-container {
  background: #22293A;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
  font-family: "Outfit", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-text h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.content-text p {
  color: #ffffff;
  font-size: 16px;
}

.page-icon {
  width: 170px;
  height: 180px;
}

.modes {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
.time-limit-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #121729;
  padding: 14px 20px;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  color: white;
  margin-bottom: 16px;
}

.time-limit-input input:focus {
  border-color: #5f98ef;
  outline: none;
}

.time-limit-input label {
  font-size: 15px;
  font-weight: 500;
}

.time-limit-input input {
  width: 100px;
  padding: 8px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  font-family: inherit;
  background-color: #252939;
  color: white;
  text-align: right;
}

.number-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #121729;
  padding: 14px 20px;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  color: white;
  margin-bottom: 16px;
}

.number-input-row label {
  font-size: 15px;
  font-weight: 500;
}

.number-input-row input {
  width: 100px;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-size: 15px;
  font-family: inherit;
  background-color: #252939;
  color: white;
  text-align: right;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.number-input-row input:focus {
  border-color: #5f98ef;
  outline: none;
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3);
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  margin-top: 20px;
}

.button-container >>> .primary-button {
  width: 30%;
  max-width: 200px;
}
</style>
