<template>
  <div class="flashcard-summary">
    <div class="header-container">
      <h1 class="set-title">{{ flashcardSet?.title }}</h1>
      <p class="set-description">{{ flashcardSet?.description }}</p>
      <div class="set-info">
        <span>{{ flashcardSet?.flashcards?.length || 0 }} terms</span>
        <span class="author">Created by {{ flashcardSet?.author?.username }}</span>
      </div>
    </div>

    <div class="actions">
      <button class="practice-button" @click="startPractice">
        <i class="fas fa-play"></i> Start Practice
      </button>
    </div>

    <div class="terms-container">
      <h2>Terms and Definitions</h2>
      <div v-if="loading" class="loading">Loading flashcard content...</div>
      <div v-else-if="error" class="error">Error loading flashcard content: {{ error.message }}</div>
      <div v-else-if="!flashcardSet?.flashcards?.length" class="empty">
        This set doesn't contain any flashcards yet.
      </div>
      <div v-else class="terms-list">
        <div v-for="(card, index) in flashcardSet.flashcards" :key="index" class="term-card">
          <div class="term">
            <h3>Term {{ index + 1 }}</h3>
            <p>{{ card.term }}</p>
          </div>
          <div class="definition">
            <h3>Definition</h3>
            <p>{{ card.definition }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_FLASHCARD_SET } from '@/graphql/auth'; // Assuming this query exists

const route = useRoute();
const router = useRouter();
const setId = computed(() => route.params.id);

// Fetch the flashcard set data
const { result, loading, error } = useQuery(GET_FLASHCARD_SET, () => ({
  id: setId.value
}));

const flashcardSet = computed(() => result.value?.flashcardSet);

// Navigate to practice view
function startPractice() {
  router.push(`/library/view/${setId.value}`);
}
</script>

<style scoped>
.flashcard-summary {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  color: white;
  font-family: "Outfit", sans-serif;
}

.header-container {
  margin-bottom: 30px;
}

.set-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
}

.set-description {
  font-size: 18px;
  color: #b8c4e0;
  margin-bottom: 15px;
}

.set-info {
  display: flex;
  gap: 20px;
  color: #b8c4e0;
}

.actions {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-start;
}

.practice-button {
  background-color: #5F98EF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
}

.practice-button:hover {
  background-color: #4a86e8;
}

.terms-container {
  background-color: #1b2233;
  border-radius: 12px;
  padding: 25px;
}

.terms-container h2 {
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.term-card {
  display: flex;
  background-color: #22293A;
  border-radius: 10px;
  overflow: hidden;
}

.term, .definition {
  flex: 1;
  padding: 20px;
}

.term {
  background-color: #263045;
  border-right: 1px solid #1b2233;
}

.term h3, .definition h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #b8c4e0;
}

.loading, .error, .empty {
  text-align: center;
  padding: 30px;
  color: #b8c4e0;
}
</style>
