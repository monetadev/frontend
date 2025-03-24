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
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon" />
          </div>

          <div class="modes">
            <ModeSelectionBox
                v-for="mode in modes"
                :key="mode.label"
                :label="mode.label"
                :isSelected="selectedMode === mode.label"
                @click="selectedMode = mode.label"
            />
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
export default {
  name: "Quizzes",
  components: {
    SidebarNavigation,
    NavigationBar,
    PrimaryButton,
    ModeSelectionBox,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      selectedMode: null,
      selectedSet: null,
      timeEnabled: false,
      timeLimit: 10,
      lockedNav: false,
      questionCount: 10,
      reviewMode: false,
      modes: [
        { label: "Multiple Choice", },
        { label: "True/False",},
        { label: "One-word", },
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
  height: 110px;
}

.modes {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

</style>
