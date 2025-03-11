<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content-wrapper">
        <div class="content-container">
          <div class="content-header">
            <div class="content-text">
              <h1>Upload Document</h1>
              <p>Drop in your study document and instantly turn it into smart flashcards!</p>
            </div>
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon" />
          </div>

          <div class="progress-container">
            <ProgressCircle :number="1" :isActive="progressStep >= 1" subText="Upload" />
            <ProgressLine :isActive="progressStep >= 2" />
            <ProgressCircle :number="2" :isActive="progressStep >= 2" subText="Review" />
            <ProgressLine :isActive="progressStep >= 3" />
            <ProgressCircle :number="3" :isActive="progressStep >= 3" subText="Organize" />
          </div>

          <UploadBox v-if="progressStep === 1" />

          <div v-if="progressStep === 2" class="flashcard-container">
            <Flashcard
                v-for="(card, index) in flashcards"
                :key="index"
                :number="index + 1"
                :question="card.question"
                :answer="card.answer"
                @accept="handleAccept"
                @reject="handleReject"
            />
          </div>

          <div class="button-container">
            <PrimaryButton text="Generate" @click="goToReview" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ProgressLine from "@/components/ProgressLine.vue";
import UploadBox from "@/components/UploadBox.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import Flashcard from "@/components/GeneratedFlashcard.vue";

export default {
  name: "AddFlashcard",
  components: {
    PrimaryButton,
    ProgressLine,
    ProgressCircle,
    SidebarNavigation,
    NavigationBar,
    UploadBox,
    Flashcard,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      progressStep: 1,
      flashcards: [],
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    goToReview() {
      if (this.progressStep === 1) {
        this.progressStep = 2;
        this.flashcards = [
          {
            question: "What is atomic theory?",
            answer: "A theoretical model stating that atoms are tiny, submicroscopic particles that make up all chemical substances and everything in the macroscopic world.",
          },
          {
            question: "What does the plum pudding model show?",
            answer: "An atom is a ball of positively charged material with negatively charged particles floating around inside.",
          },
          {
            question: "What did Lavoisier contribute toward the Atomic Theory?",
            answer: "Proposed the Law of Conservation of Matter and created the metric system.",
          },
        ];
      }
    },
    handleAccept(number) {
      //backend
    },
    handleReject(number) {
      //backend
    }
  }
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
  display: flex;
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
  align-items: center;
  padding: 20px;
}

.content-container {
  background: #22293A;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.content-text {
  text-align: left;
  max-width: 70%;
}

.content-text h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  font-family: "Outfit", sans-serif;
}

.content-text p {
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 0;
  font-family: "Outfit", sans-serif;
}

.page-icon {
  width: 170px;
  height: 110px;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 30px 0;
}

.flashcard-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 90%;
  gap: 20px;

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
