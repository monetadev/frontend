
<template>
  <div class="dashboard">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
        <FlashcardTitle :title="currentDeck.title" />

        <!-- Wrapper div for flashcard and border progress -->
        <!-- Wrapper div for flashcard and border progress -->
        <div class="flashcard-with-progress">
          <!-- Flashcard -->
          <div class="flashcard-container">
            <FlashCard
                :term="currentFlashcard.term"
                :definition="currentFlashcard.definition"
                ref="flashcard"
            />

            <!-- Border progress indicator positioned directly on top of flashcard -->
            <div v-if="isPlaying && !isTransitioning" class="border-progress-container">
              <svg class="border-progress" viewBox="0 0 1071 584">
                <!-- Progress border -->
                <path
                    :d="borderPath"
                    fill="none"
                    stroke="#5f98ef"
                    stroke-width="4"
                    stroke-linecap="round"
                    :stroke-dasharray="borderLength"
                    :stroke-dashoffset="borderDashOffset"
                />
              </svg>
            </div>
          </div>
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
            <PlayButtonIcon
                :active="!isPlaying"
                :playing="isPlaying"
                @click="togglePlay"
            />
            <!-- Speed control slider -->
            <div class="speed-control">
              <span class="speed-label">{{ playSpeed / 1000 }}s</span>
              <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  :value="playSpeed / 1000"
                  @input="adjustSpeed($event.target.value)"
                  :disabled="isPlaying"
              />
            </div>
            <GameControllerIcon active @click="goToMatchingGame" />
          </div>
        </div>
      </div>
    </div>
    <chat :current-card-term="currentFlashcard.term" />
  </div>
</template>

<script>
import {useRoute, useRouter} from 'vue-router';
import GameControllerIcon from "@/components/icons/GameControllerIcon.vue";
import { useQuery } from '@vue/apollo-composable';
import { GET_FLASHCARD_SET_BY_ID } from "@/graphql/auth.js";
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import FlashCard from "@/components/FlashCard.vue";
import FlashcardTitle from "@/components/FlashcardTitle.vue";
import NextIcon from "@/components/icons/NextIcon.vue";
import PrevIcon from "@/components/icons/prevIcon.vue";
import PlayButtonIcon from "@/components/icons/playButton.vue";
import counterDisplay from "@/components/icons/counterDisplay.vue";
import shuffle from "@/components/icons/shuffle.vue";
import chat from '@/components/ChatbotLauncher.vue';

export default {
  name: "Dashboard",
  components: {
    GameControllerIcon,
    SidebarNavigation,
    FlashCard,
    NavigationBar,
    FlashcardTitle,
    NextIcon,
    PrevIcon,
    PlayButtonIcon,
    counterDisplay,
    shuffle,
    chat,
  },
  setup() {
    const router = useRouter(); // Add router
    const route = useRoute();
    const flashcardSetId = route.params.id;

    console.log('Viewing flashcard set with ID:', flashcardSetId);

    // If we have an ID, fetch the data
    let flashcardSet = null;

    if (flashcardSetId) {
      const { result, loading, error } = useQuery(
          GET_FLASHCARD_SET_BY_ID,
          { id: flashcardSetId }
      );

      // Make this data available to the template
      flashcardSet = { result, loading, error };
    }

    return {
      flashcardSetId,
      flashcardSet,
      router
    };
  },

  data() {
    return {
      isSidebarCollapsed: true,
      currIndex: 0,
      shuffledCards: [],
      isShuffled: false,
      isNavigating: false,
      isPlaying: false,
      playInterval: null,
      playSpeed: 5000,
      progress: 0,
      progressInterval: null,
      autoPlayStep: 'term',
      isTransitioning: false,
    };
  },
  computed: {
    flashcards() {
      if (this.isShuffled) return this.shuffledCards;

      if (this.flashcardSetId && this.flashcardSet?.result?.value?.findFlashcardSetById?.flashcards) {
        return this.flashcardSet.result.value.findFlashcardSetById.flashcards;
      }
      return this.fallbackFlashcards;
    },
    currentDeck() {
      if (this.flashcardSetId && this.flashcardSet?.result?.value?.findFlashcardSetById) {
        return this.flashcardSet.result.value.findFlashcardSetById;
      }
      return this.fallbackDeck;
    },
    currentFlashcard() {
      return this.flashcards[this.currIndex] || { term: "", definition: "" };
    },

    // Border path properties for rectangular progress
    borderPath() {
      // Match exact flashcard dimensions (1071px × 584.44px from your FlashCard component)
      const width = 1071;
      const height = 584;
      const radius = 50; // Match the border radius from your flashcard

      // Start at top middle, move counter-clockwise
      return `M ${width/2} 0
              H ${width - radius}
              Q ${width} 0, ${width} ${radius}
              V ${height - radius}
              Q ${width} ${height}, ${width - radius} ${height}
              H ${radius}
              Q 0 ${height}, 0 ${height - radius}
              V ${radius}
              Q 0 0, ${radius} 0
              H ${width/2}`;
    },

    borderLength() {
      // Perimeter of rounded rectangle (approximate)
      const width = 1071;
      const height = 584;
      const radius = 50;
      return 2 * width + 2 * height - 8 * radius + 2 * Math.PI * radius;
    },

    borderDashOffset() {
      // For counter-clockwise progress starting from top
      return this.borderLength * (1 - (this.progress / 100));
    }
  },

  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    togglePlay() {
      if (this.isPlaying) {
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    },

    startAutoPlay() {
      this.isPlaying = true;
      this.autoPlayStep = 'term';

      // Make sure we start with the term side showing
      if (this.$refs.flashcard.isFlipped) {
        this.$refs.flashcard.flip(); // Using the correct method name
      }

      this.startProgressBar();
    },

    stopAutoPlay() {
      this.isPlaying = false;
      this.progress = 0;
      clearInterval(this.progressInterval);
      clearTimeout(this.playInterval);
    },

    startProgressBar() {
      // Don't start if we're in a transition
      if (this.isTransitioning) return;

      // Reset progress
      this.progress = 0;

      // Clear any existing intervals
      clearInterval(this.progressInterval);

      // Set up smooth progress animation
      const updateFrequency = 30; // Update every 30ms for smooth animation
      const progressStep = (100 * updateFrequency) / this.playSpeed;

      this.progressInterval = setInterval(() => {
        this.progress += progressStep;

        // When progress completes
        if (this.progress >= 100) {
          this.progress = 0;
          this.processNextStep();
        }
      }, updateFrequency);
    },

    processNextStep() {
      if (this.autoPlayStep === 'term') {
        // Step 1 complete: Switch from term to definition
        this.autoPlayStep = 'definition';

        // Set transitioning state
        this.isTransitioning = true;

        // Flip the card
        this.$refs.flashcard.flip();

        // Reset transitioning state after flip animation completes
        setTimeout(() => {
          this.isTransitioning = false;
          this.startProgressBar();
        }, 800); // Match flip animation duration
      }
      else if (this.autoPlayStep === 'definition') {
        // Step 2 complete: Move to next card and show term
        this.autoPlayStep = 'term';

        // Set transitioning state
        this.isTransitioning = true;

        // Move to next card
        this.nextCard();

        // Make sure the next card shows the term side
        if (this.$refs.flashcard.isFlipped) {
          this.$refs.flashcard.flip();
        }

        // Reset transitioning state after card change and potential flip
        setTimeout(() => {
          this.isTransitioning = false;
          this.startProgressBar();
        }, 800); // Match flip animation duration
      }
    },

    adjustSpeed(newSpeed) {
      // Ensure speed is within allowed range (3-10 seconds)
      const speedMs = newSpeed * 1000;
      if (speedMs >= 3000 && speedMs <= 10000) {
        this.playSpeed = speedMs;

        // Restart progress if currently playing
        if (this.isPlaying) {
          this.startProgressBar();
        }
      }
    },

    nextCardDebounced() {
      if (this.isNavigating) return;
      this.isNavigating = true;

      this.nextCard();

      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
    },

    prevCardDebounced() {
      if (this.isNavigating) return;
      this.isNavigating = true;

      this.prevCard();

      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
    },

    //Methods for Navigation
    nextCard() {
      if (this.currIndex < this.flashcards.length - 1) {
        this.currIndex++;
      } else {
        this.currIndex = 0;
      }
    },
    prevCard() {
      if (this.currIndex > 0) {
        this.currIndex--;
      } else {
        this.currIndex = this.flashcards.length - 1;
      }
    },

    shuffleCards() {
      // Get current cards (whether from API or fallback)
      const currentCards = [...this.flashcards];

      // Fisher-Yates shuffle algorithm
      for (let i = currentCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
      }

      // Set shuffled state
      this.shuffledCards = currentCards;
      this.isShuffled = true;
      this.currIndex = 0;
    },

    goToMatchingGame() {
      // Navigate to matching game with current flashcard set ID
      this.router.push(`/matching-game/${this.flashcardSetId}`);
    }

  },

  beforeUnmount() {
    // Clean up all intervals and timeouts when component is destroyed
    this.stopAutoPlay();
  },
};
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

.speed-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
}

.speed-label {
  margin-bottom: 5px;
  color: #fff;
}

input[type="range"] {
  width: 100px;
  accent-color: #5f98ef;
}

/* Border Progress Styles */
.border-progress-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 6; /* Place it above the flashcard */
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* So it doesn't interfere with clicks */
}

.border-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.border-progress path {
  transition: stroke-dashoffset 0.03s linear;
}

.flashcard-container {
  position: relative;
  margin: 0 auto;
  width: 1071px; /* Match exact flashcard width */
  height: 584.44px; /* Match exact flashcard height */
  z-index: 5;
}

.flashcard-with-progress {
  position: relative;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>