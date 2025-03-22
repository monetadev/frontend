<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
        <!-- Loading state -->
        <div v-if="loading" class="loading">Loading flashcards...</div>

        <!-- Error state -->
        <div v-else-if="error" class="error">{{ error.message }}</div>

        <!-- Content when loaded -->
        <template v-else-if="flashcards.length > 0">
          <FlashcardTitle :title="currentDeck.title" />

          <div class="flashcard-container">
            <FlashCard
                :term="currentFlashcard.term"
                :definition="currentFlashcard.definition"
                ref="flashcard"
            />
          </div>

          <div class="icon-container">
            <div class="prev-next">
              <PrevIcon
                  active
                  :disabled="currIndex === 0"
                  @click="prevCardDebounced"
              />
              <counterDisplay :current="currIndex+1" :total="flashcards.length" />
              <NextIcon active @click="nextCardDebounced"/>
            </div>

            <div class="full-screen-container">
              <shuffle active @click="shuffleCards" />
              <PlayButtonIcon active />
              <FullScreenIcon active />
            </div>
          </div>
        </template>
        
        <!-- No flashcards state -->
        <div v-else-if="!loading && !error" class="no-flashcards">
          This flashcard set has no cards.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_FLASHCARD_SET_BY_ID} from "@/graphql/auth.js";

import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import FlashCard from "@/components/FlashCard.vue";
import FlashcardTitle from "@/components/FlashcardTitle.vue";
import NextIcon from "@/components/icons/NextIcon.vue";
import PrevIcon from "@/components/icons/prevIcon.vue";
import FullScreenIcon from "@/components/icons/fullScreen.vue";
import PlayButtonIcon from "@/components/icons/playButton.vue";
import counterDisplay from "@/components/icons/counterDisplay.vue";
import shuffle from "@/components/icons/shuffle.vue";

// Get the flashcard set ID from route params
const route = useRoute();
const flashcardSetId = computed(() => route.params.id);

// State
const isSidebarCollapsed = ref(true);
const currIndex = ref(0);
const isNavigating = ref(false);
const shuffledIndexes = ref([]);

// Fetch the flashcard set with GraphQL
const { result, loading, error } = useQuery(GET_FLASHCARD_SET_BY_ID, () => ({
  id: flashcardSetId.value
}), {
  enabled: computed(() => !!flashcardSetId.value), // Only run query when ID is available
  fetchPolicy: 'network-only' // Always fetch from network
});

// Initialize shuffledIndexes when flashcards are loaded
watchEffect(() => {
  if (flashcards.value.length > 0) {
    shuffledIndexes.value = Array.from(
        { length: flashcards.value.length },
        (_, i) => i
    );
    // Reset current index when loading a new set
    currIndex.value = 0;
  }
});

// Computed properties
const currentDeck = computed(() => {
  return result.value?.findFlashcardSetById || { title: 'Loading...' };
});

const flashcards = computed(() => {
  return result.value?.findFlashcardSetById?.flashcards || [];
});

const currentFlashcard = computed(() => {
  if (flashcards.value.length === 0) return { term: "", definition: "" };

  const index = shuffledIndexes.value[currIndex.value] || 0;
  return flashcards.value[index] || { term: "", definition: "" };
});

// Methods
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function nextCardDebounced() {
  if (isNavigating.value || flashcards.value.length === 0) return;
  isNavigating.value = true;

  nextCard();

  setTimeout(() => {
    isNavigating.value = false;
  }, 300);
}

function prevCardDebounced() {
  if (isNavigating.value || flashcards.value.length === 0) return;
  isNavigating.value = true;

  prevCard();

  setTimeout(() => {
    isNavigating.value = false;
  }, 300);
}

function nextCard() {
  if (currIndex.value < shuffledIndexes.value.length - 1) {
    currIndex.value++;
  } else {
    currIndex.value = 0;
  }
}

function prevCard() {
  if (currIndex.value > 0) {
    currIndex.value--;
  } else {
    currIndex.value = shuffledIndexes.value.length - 1;
  }
}

function shuffleCards() {
  // Create a copy of indexes array and shuffle it
  const indexes = [...shuffledIndexes.value];

  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }

  shuffledIndexes.value = indexes;
  currIndex.value = 0;
}
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background-color: #22293A;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 220px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.content {
  padding-top: 5%;
  color: white;
  padding-left: 1%;
  position: relative;
  height: 100%;
}

.flashcard-container {
  margin-top: 20px;
  position: relative;
  z-index: 5;
}

.icon-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding-left: 500px;
  padding-top: 30px;
  z-index: 10;
}

.prev-next,
.full-screen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  padding-left: 75px;
}

.prev-next svg,
.full-screen-container svg {
  width: 40px;
  height: 40px;
}

.full-screen-container {
  margin-left: auto;
  padding-right: 20%;
}

.prev-next svg:hover,
.full-screen-container svg:hover {
  cursor: pointer;
  fill: #F9F9F9;
}

.loading, .error, .no-flashcards {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: white;
}

.error {
  color: #ff6b6b;
}
</style>

