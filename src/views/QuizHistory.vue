<template>
  <div class="quiz-history-wrapper">
    <SideNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

    <div class="quiz-main" :class="{ collapsed: isSidebarCollapsed }">
      <TopNavigation :isSidebarCollapsed="isSidebarCollapsed" />

      <div class="quiz-content-wrapper" :class="{ collapsed: isSidebarCollapsed }">
        <main class="quiz-content">
          <h1 class="page-title">
            <i class="fas fa-history"></i>
            Quiz History
          </h1>

          <div class="quiz-list">
            <div v-for="(quiz, index) in quizHistory" :key="index" class="quiz-card">
              <div class="quiz-info">
                <div class="quiz-icon">
                  <i class="fas fa-book-open"></i>
                </div>
                <div>
                  <div class="quiz-title">{{ quiz.title }}</div>
                  <div class="quiz-datetime">{{ formatDate(quiz.timestamp) }}</div>
                </div>
              </div>

              <div class="quiz-mode">
                <i class="fas fa-list-ul"></i>
                {{ quiz.mode }}
              </div>

              <div class="quiz-score">
                <i class="fas fa-star"></i>
                {{ quiz.correct }}/{{ quiz.total }}
                <span class="percentage">({{ calculatePercentage(quiz.correct, quiz.total) }}%)</span>
              </div>
            </div>

            <div v-if="quizHistory.length === 0" class="no-data">
              No quiz history yet.
            </div>
          </div>
        </main>
      </div>
    </div>

    <Footer :class="[isSidebarCollapsed ? 'footer-collapsed' : 'footer-expanded']" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SideNavigation from '@/components/SideNavigation.vue';
import TopNavigation from '@/components/TopNavigation.vue';
import Footer from '@/components/Footer.vue';

const isSidebarCollapsed = ref(false);

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

const quizHistory = ref([
  {
    title: 'Mobile Dev',
    timestamp: new Date('2025-04-25T14:30:00'),
    mode: 'Multiple Choice',
    correct: 8,
    total: 10,
  },
  {
    title: 'CSC211',
    timestamp: new Date('2025-04-24T09:00:00'),
    mode: 'True/False',
    correct: 5,
    total: 6,
  },
  {
    title: 'A.I/ML',
    timestamp: new Date('2025-04-23T16:45:00'),
    mode: 'One Word',
    correct: 10,
    total: 10,
  },
]);

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const calculatePercentage = (correct, total) => {
  return ((correct / total) * 100).toFixed(0);
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.quiz-history-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.quiz-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
}

.quiz-content-wrapper {
  display: flex;
  justify-content: center;
  flex-grow: 1;
  padding: 20px;
  transition: padding-left 0.3s ease-in-out;
}

.quiz-content-wrapper.collapsed {
  padding-left: 80px;
}

.quiz-content-wrapper:not(.collapsed) {
  padding-left: 230px;
}

.quiz-content {
  width: 100%;
  max-width: 800px;
  padding: 30px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.3);
  min-height: calc(100vh - 100px);
  overflow-y: auto;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.quiz-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.quiz-card:hover {
  box-shadow: 0 6px 12px var(--shadow-color);
}

.quiz-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.quiz-icon {
  background-color: var(--bg-tertiary);
  padding: 0.8rem;
  border-radius: 0.8rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-active);
}

.quiz-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.quiz-datetime {
  font-size: 0.9rem;
  color: #aaa;
}

.quiz-mode,
.quiz-score {
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-primary);
  min-width: 140px;
  justify-content: flex-end;
}

.quiz-mode i {
  color: var(--sidebar-active);
}

.quiz-score i {
  color: #facc15;
}

.percentage {
  color: #aaa;
  font-size: 0.85rem;
}

.no-data {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 2rem;
}

.footer-expanded {
  margin-left: 230px;
  transition: margin-left 0.3s ease-in-out;
}

.footer-collapsed {
  margin-left: 80px;
  transition: margin-left 0.3s ease-in-out;
}
</style>
