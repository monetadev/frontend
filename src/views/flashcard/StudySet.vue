<template>
  <div class="flashcard-viewer-content" tabindex="0" @keydown="handleKeydown">

    <div class="top-left-controls">
      <button
          v-if="currentDeck"
          @click="goBackToSetView"
          class="control-button icon-button back-button"
          aria-label="Back to Set Details"
          title="Back to Set Details"
      >
        <font-awesome-icon :icon="getIcon('arrow-left')"/>
      </button>
      <div class="flashcard-title-container">
        <FlashcardTitle v-if="currentDeck" :title="currentDeck.title"/>
      </div>
    </div>

    <div v-if="loading" class="loading-indicator full-page-indicator">
      <font-awesome-icon :icon="getIcon('spinner')" spin size="3x"/>
      <p>Loading flashcard set...</p>
    </div>

    <div v-else-if="error" class="error-message full-page-error">
      <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="3x" class="error-icon"/>
      <p>Could not load flashcard set.</p>
      <pre>Error: {{ error.message }}</pre>
      <button @click="goBackToSetView" class="action-button error-action" style="margin-top: 20px;">
        Go Back
      </button>
    </div>

    <div v-else-if="currentDeck" class="viewer-layout">
      <div
          class="flashcard-area"
          @wheel.prevent.stop="handleScroll"
      >
        <Transition name="card-transition" mode="out-in" @after-leave="onCardAnimationComplete">
          <div class="flashcard-container" :key="currIndex">
            <FlashCard
                :term="currentFlashcard.term"
                :definition="currentFlashcard.definition"
                ref="flashcardRef"
            />
            <div v-if="isProgressVisible" class="border-progress-container">
              <svg class="border-progress" viewBox="0 0 1071 584">
                <path
                    :d="borderPath"
                    fill="none"
                    stroke="var(--primary-color, #5f98ef)"
                    stroke-width="6"
                    stroke-linecap="round"
                    :stroke-dasharray="borderLength"
                    :stroke-dashoffset="borderDashOffset"
                />
              </svg>
            </div>
          </div>
        </Transition>
      </div>

      <div class="controls-container">
        <div class="navigation-controls">
          <button
              class="control-button icon-button"
              :disabled="isAtStart || isNavigating || isAnimatingCardTransition"
              @click="triggerPrevCard"
              aria-label="Previous Card (Left Arrow)"
          >
            <font-awesome-icon :icon="getIcon('chevron-left')"/>
          </button>
          <CounterDisplay :current="currIndex + 1" :total="flashcards.length"/>
          <button
              class="control-button icon-button"
              :disabled="isAtLastCard || isNavigating || isAnimatingCardTransition"
              @click="triggerNextCard"
              aria-label="Next Card (Right Arrow)"
          >
            <font-awesome-icon :icon="getIcon('chevron-right')"/>
          </button>
        </div>

        <div class="action-controls">
          <button
              class="control-button icon-button"
              @click="shuffleCards"
              aria-label="Shuffle Cards"
              :disabled="isAnimatingCardTransition || flashcards.length < 2"
          >
            <font-awesome-icon :icon="getIcon('shuffle')"/>
          </button>
          <button
              class="control-button icon-button play-pause-button"
              @click="togglePlay"
              :aria-label="isPlaying ? 'Pause Autoplay' : 'Start Autoplay'"
              :disabled="isAnimatingCardTransition"
          >
            <font-awesome-icon :icon="getIcon(isPlaying ? 'pause' : 'play')"/>
          </button>
          <button
              v-if="isAtLastCard && !isAtStart"
              @click="goToBeginning"
              class="control-button icon-button restart-button"
              aria-label="Go to Beginning"
              :disabled="isAnimatingCardTransition"
              title="Go to Beginning"
          >
            <font-awesome-icon :icon="getIcon('rotate-left')"/>
          </button>
          <div class="speed-control" v-if="!isAtLastCard || isAtStart">
            <span class="speed-label">{{ (playSpeed / 1000).toFixed(1) }}s</span>
            <input
                type="range" min="3" max="10" step="0.5"
                :value="playSpeed / 1000"
                @input="adjustSpeed($event.target.value)"
                :disabled="isPlaying || isAnimatingCardTransition"
                class="speed-slider" aria-label="Autoplay Speed"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="info-state full-page-error">
      <font-awesome-icon :icon="getIcon('question-circle')" size="3x"/>
      <p>No flashcard data found for this set.</p>
      <button @click="goBackToSetView" class="action-button error-action" style="margin-top: 20px;">
        Go Back
      </button>
    </div>

  </div>
  <chat :current-card-term="currentFlashcard?.term ?? ''"/>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useQuery} from '@vue/apollo-composable';
import {GET_FLASHCARD_SET_BY_ID} from "@/graphql/auth.js";
import FlashCard from "@/components/flashcard/study-set/FlashCard.vue";
import FlashcardTitle from "@/components/flashcard/study-set/FlashcardTitle.vue";
import CounterDisplay from "@/components/icons/CounterDisplay.vue";
import chat from '@/components/chat-agent/ChatbotLauncher.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faChevronLeft, faChevronRight, faPlay, faPause, faShuffle,
  faSpinner, faTriangleExclamation, faQuestionCircle, faRotateLeft,
  faArrowLeft // Added Back Arrow Icon
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faChevronLeft, faChevronRight, faPlay, faPause, faShuffle,
    faSpinner, faTriangleExclamation, faQuestionCircle, faRotateLeft,
    faArrowLeft
);
const icons = {
  'chevron-left': faChevronLeft, 'chevron-right': faChevronRight, 'play': faPlay,
  'pause': faPause, 'shuffle': faShuffle, 'spinner': faSpinner,
  'triangle-exclamation': faTriangleExclamation, 'question-circle': faQuestionCircle,
  'rotate-left': faRotateLeft, 'arrow-left': faArrowLeft
};

function getIcon(iconName) {
  return icons[iconName] || faQuestionCircle;
}

// Route, Query, State refs
const route = useRoute();
const router = useRouter();
const flashcardSetId = ref(route.params.id);
const {result: flashcardSetResult, loading, error} = useQuery(
    GET_FLASHCARD_SET_BY_ID,
    {id: flashcardSetId.value},
    {fetchPolicy: 'cache-and-network', enabled: computed(() => !!flashcardSetId.value)}
);
const currIndex = ref(0);
const shuffledCards = ref([]);
const isShuffled = ref(false);
const isNavigating = ref(false);
const isPlaying = ref(false);
const playInterval = ref(null);
const playSpeed = ref(5000);
const progress = ref(0);
const progressInterval = ref(null);
const autoPlayStep = ref('term');
const isTransitioning = ref(false);
const flashcardRef = ref(null);
const scrollTimeout = ref(null);
const isAnimatingCardTransition = ref(false);

// Computed Properties
const currentDeck = computed(() => flashcardSetResult.value?.findFlashcardSetById ?? null);
const flashcards = computed(() => {
  const originalCards = (currentDeck.value?.flashcards ?? [])
      .slice()
      .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  if (isShuffled.value) {
    const originalIds = new Set(originalCards.map(c => c.id));
    const validShuffled = shuffledCards.value.filter(c => originalIds.has(c.id));

    const shuffledIds = new Set(validShuffled.map(c => c.id));
    const newCards = originalCards.filter(c => !shuffledIds.has(c.id));

    // Fisher-Yates shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    return [...validShuffled, ...newCards];
  } else {
    return originalCards;
  }
});
const currentFlashcard = computed(() => flashcards.value[currIndex.value] || {term: "", definition: ""});
const isAtStart = computed(() => currIndex.value === 0);
const isAtLastCard = computed(() => flashcards.value.length > 0 && currIndex.value === flashcards.value.length - 1);

// Progress Bar Calc. & Visibility
const borderPath = computed(() => {
  // TODO: Questionable way to get the border path, but it works for now. Replace with maintainable logic at some point. (Thank you, Gemini 2.5 Pro!)
  const w = 1071, h = 584, r = 20;
  return `M ${w / 2} 3 H ${w - r - 3} A ${r} ${r} 0 0 1 ${w - 3} ${r + 3} V ${h - r - 3} A ${r} ${r} 0 0 1 ${w - r - 3} ${h - 3} H ${r + 3} A ${r} ${r} 0 0 1 3 ${h - r - 3} V ${r + 3} A ${r} ${r} 0 0 1 ${r + 3} 3 H ${w / 2}`;
});

const borderLength = computed(() => {
  const w = 1071, h = 584;
  return 2 * w + 2 * h;
});

const borderDashOffset = computed(() => borderLength.value * (1 - (progress.value / 100)));
const isProgressVisible = computed(() => isPlaying.value && !isTransitioning.value && (progressInterval.value !== null || progress.value > 0));

// --- Methods ---
function goBackToSetView() {
  if (flashcardSetId.value) {
    router.push({name: 'readSet', params: {id: flashcardSetId.value}})
  } else {
    // Fallback to private library if ID is somehow missing
    router.push({name: 'privateProfileLibrary'});
  }
}

function triggerNextCard() {
  if (isNavigating.value || isAnimatingCardTransition.value || isAtLastCard.value) return;
  isNavigating.value = true;
  isAnimatingCardTransition.value = true;
  nextCard();
  setTimeout(() => {
    isNavigating.value = false;
  }, 300);
}

function triggerPrevCard() {
  if (isNavigating.value || isAnimatingCardTransition.value || isAtStart.value) return;
  isNavigating.value = true;
  isAnimatingCardTransition.value = true;
  prevCard();
  setTimeout(() => {
    isNavigating.value = false;
  }, 300);
}

/* --- Card Logic --- */
function nextCard() {
  if (currIndex.value < flashcards.value.length - 1) currIndex.value++;
}

function prevCard() {
  if (currIndex.value > 0) currIndex.value--;
}

function goToBeginning() {
  if (isAnimatingCardTransition.value) return;
  if (isPlaying.value) stopAutoPlay();
  isAnimatingCardTransition.value = true;
  currIndex.value = 0;
}

function shuffleCards() {
  if (isAnimatingCardTransition.value || flashcards.value.length < 2) return;
  if (isPlaying.value) stopAutoPlay();

  isAnimatingCardTransition.value = true;

  const cardsToShuffle = [...flashcards.value];

  // Fisher-Yates shuffle
  for (let i = cardsToShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
  }

  shuffledCards.value = cardsToShuffle;
  isShuffled.value = true;
  currIndex.value = 0;

  setTimeout(() => {
    if (flashcardRef.value && flashcardRef.value.isFlipped) {
      flashcardRef.value.flip();
    }
  }, 50);
}

// Scroll navigation
function handleScroll(event) {
  if (isPlaying.value || isTransitioning.value || isNavigating.value || isAnimatingCardTransition.value) return;
  if (scrollTimeout.value) return;
  const delta = event.deltaY;
  const scrollThreshold = 20;
  if (Math.abs(delta) > scrollThreshold) {
    let triggered = false;
    if (delta < 0 && !isAtLastCard.value) { // SCROLL UP = NEXT
      isAnimatingCardTransition.value = true;
      nextCard();
      triggered = true;
    } else if (delta > 0 && !isAtStart.value) { // SCROLL DOWN = PREV
      isAnimatingCardTransition.value = true;
      prevCard();
      triggered = true;
    }
    if (triggered) {
      scrollTimeout.value = setTimeout(() => {
        scrollTimeout.value = null;
      }, 500);
    }
  }
}

// Keyboard navigation
function handleKeydown(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  if (isAnimatingCardTransition.value || isTransitioning.value) return;

  let handled = false;
  switch (event.key) {
    case 'ArrowLeft':
      if (!isAtStart.value && !isAnimatingCardTransition.value) {
        triggerPrevCard();
        handled = true;
      }
      break;
    case 'ArrowRight':
      if (!isAtLastCard.value && !isAnimatingCardTransition.value) {
        triggerNextCard();
        handled = true;
      }
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      if (flashcardRef.value?.flip) {
        flashcardRef.value.flip();
        handled = true;
      }
      break;
  }
  if (handled) event.preventDefault();
}

/* --- Autoplay Controls --- */
function togglePlay() {
  if (isAnimatingCardTransition.value) return;
  if (isPlaying.value) stopAutoPlay(); else startAutoPlay();
}

function startAutoPlay() {
  if (!flashcardRef.value || flashcards.value.length === 0) return;
  if (isAtLastCard.value) {
    currIndex.value = 0;
    setTimeout(() => {
      if (flashcardRef.value && flashcardRef.value.isFlipped) flashcardRef.value.flip();
    }, 50);
  }
  isPlaying.value = true;
  autoPlayStep.value = 'term';
  progress.value = 0;
  isTransitioning.value = false;
  if (flashcardRef.value && flashcardRef.value.isFlipped) flashcardRef.value.flip();
  setTimeout(() => {
    if (isPlaying.value) startProgressBar();
  }, flashcardRef.value.isFlipped ? 800 : 50);
}

function stopAutoPlay() {
  isPlaying.value = false;
  progress.value = 0;
  clearInterval(progressInterval.value);
  progressInterval.value = null;
  clearTimeout(playInterval.value);
  playInterval.value = null;
  isTransitioning.value = false;
}

function startProgressBar() {
  if (isTransitioning.value || !isPlaying.value || isAnimatingCardTransition.value) return;
  progress.value = 0;
  clearInterval(progressInterval.value);
  const updateFrequency = 30, totalDuration = playSpeed.value, step = (100 * updateFrequency) / totalDuration;
  progressInterval.value = setInterval(() => {
    if (!isPlaying.value) {
      clearInterval(progressInterval.value);
      progressInterval.value = null;
      return;
    }
    progress.value += step;
    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(progressInterval.value);
      progressInterval.value = null;
      if (isAtLastCard.value) {
        stopAutoPlay();
      } else {
        processNextStep();
      }
    }
  }, updateFrequency);
}

function processNextStep() {
  if (!isPlaying.value || isAnimatingCardTransition.value) return;
  isTransitioning.value = true;
  if (autoPlayStep.value === 'term') {
    autoPlayStep.value = 'definition';
    if (flashcardRef.value && !flashcardRef.value.isFlipped) flashcardRef.value.flip();
    playInterval.value = setTimeout(() => {
      isTransitioning.value = false;
      if (isPlaying.value) startProgressBar();
    }, 800);
  } else if (autoPlayStep.value === 'definition') {
    autoPlayStep.value = 'term';
    if (isAtLastCard.value) {
      stopAutoPlay();
      isTransitioning.value = false;
      return;
    }
    isAnimatingCardTransition.value = true;
    nextCard();
    playInterval.value = setTimeout(() => {
      isTransitioning.value = false;
      if (flashcardRef.value && flashcardRef.value.isFlipped) flashcardRef.value.flip();
    }, 50);
  }
}

function adjustSpeed(newSpeedValue) {
  const newSpeedMs = parseFloat(newSpeedValue) * 1000;
  if (newSpeedMs >= 3000 && newSpeedMs <= 10000) {
    playSpeed.value = newSpeedMs;
    if (isPlaying.value && !isTransitioning.value && progressInterval.value !== null) {
      clearInterval(progressInterval.value);
      progress.value = 0;
      startProgressBar();
    }
  }
}

function onCardAnimationComplete() {
  isAnimatingCardTransition.value = false;

  if (isPlaying.value && autoPlayStep.value === 'term' && !isTransitioning.value && progressInterval.value === null) {
    startProgressBar();
  }

  if (!isPlaying.value && flashcardRef.value && flashcardRef.value.isFlipped) {
  } else if (isPlaying.value && autoPlayStep.value === 'term' && flashcardRef.value && flashcardRef.value.isFlipped) {
    flashcardRef.value.flip();
  }
}

/* --- Lifecycle Hooks --- */
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  stopAutoPlay();
  clearTimeout(scrollTimeout.value);
  window.removeEventListener('keydown', handleKeydown);
});

watch(() => route.params.id, (newId) => {
  if (newId && newId !== flashcardSetId.value) {
    stopAutoPlay();
    flashcardSetId.value = newId;
    currIndex.value = 0;
    isShuffled.value = false;
    shuffledCards.value = [];
    isAnimatingCardTransition.value = false;
    isNavigating.value = false;
  }
});
watch(currentDeck, (newDeck, oldDeck) => {
  if (newDeck && (!oldDeck || newDeck.id !== oldDeck.id)) {
    currIndex.value = 0;
    isShuffled.value = false;
    shuffledCards.value = [];
    stopAutoPlay();
    isAnimatingCardTransition.value = false;
    isNavigating.value = false;
    setTimeout(() => {
      if (flashcardRef.value && flashcardRef.value.isFlipped) {
        flashcardRef.value.flip();
      }
    }, 50);
  } else if (newDeck && oldDeck && newDeck.flashcards.length !== oldDeck.flashcards.length) {
    if (isShuffled.value) {
      const originalCards = (newDeck.flashcards ?? [])
          .slice()
          .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
      const originalIds = new Set(originalCards.map(c => c.id));
      const validShuffled = shuffledCards.value.filter(c => originalIds.has(c.id));
      const shuffledIds = new Set(validShuffled.map(c => c.id));
      const newCards = originalCards.filter(c => !shuffledIds.has(c.id));
      for (let i = newCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
      }
      shuffledCards.value = [...validShuffled, ...newCards];
    }
    if (currIndex.value >= newDeck.flashcards.length) {
      currIndex.value = Math.max(0, newDeck.flashcards.length - 1);
    }
  }
}, {deep: true});

</script>

<style scoped>
:root {
  --primary-color: #5f98ef;
  --bg-primary: #1B2233;
  --bg-secondary: #22293A;
  --bg-tertiary: #2C3A54;
  --text-primary: #E0E0E0;
  --text-secondary: #A0AEC0;
  --border-color: #3C4A64;
  --error-color: #F56565;
  --error-color-rgb: 245, 101, 101;
  --primary-color-rgb: 95, 152, 239;
}

.flashcard-viewer-content {
  color: var(--text-primary);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  outline: none;
  padding-top: 70px;
}

.top-left-controls {
  position: absolute;
  top: 15px;
  left: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 15px;
  max-width: calc(100% - 40px);
}

.back-button {
  padding: 8px;
  width: 40px;
  height: 40px;
  font-size: 1.2em;
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.back-button:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.flashcard-title-container {
  max-width: calc(100% - 60px);
  flex-grow: 1;
  min-width: 0;
}

:deep(.flashcard-title h1) {
  margin: 0;
  font-size: 1.5em;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.viewer-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  flex-shrink: 0;
  gap: 20px;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}

/* --- Loading/Error/Info States --- */
.loading-indicator, .error-message, .info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
  min-height: 300px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 800px;
  margin: auto;
}

.loading-indicator p, .error-message p, .info-state p {
  margin-top: 15px;
  font-size: 1.1em;
  color: var(--text-primary);
}

.error-message .error-icon {
  color: var(--error-color);
}

.error-message pre {
  background-color: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid var(--error-color);
}

.action-button.error-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--bg-tertiary, #121729);
  color: var(--text-secondary, #a4aabf);
  padding: 10px 20px;
  border: 1px solid var(--border-color, #3a4359);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9em;
  transition: all 0.2s ease-out;
  cursor: pointer;
  text-align: center;
  max-width: 150px;
}

.action-button.error-action:hover:not(:disabled) {
  background-color: var(--row-highlight-bg, #2a335a);
  border-color: var(--text-secondary, #a4aabf);
  color: var(--text-primary, #E0E0E0);
}


/* --- Flashcard Area & Transition --- */
.flashcard-area {
  position: relative;
  width: 100%;
  max-width: 1071px;
  display: flex;
  justify-content: center;
  cursor: ns-resize;
  perspective: 2000px;
  height: 584.44px;
  margin-bottom: 5px;
}

.flashcard-container {
  position: relative;
  width: 1071px;
  height: 584.44px;
  transform-style: preserve-3d;
}

/* --- Card Transition Keyframes & Styles --- */
@keyframes cardEnterOvershoot {
  0% {
    opacity: 0;
    transform: translateY(60px) translateZ(-100px) rotateX(-45deg) scale(0.9);
  }
  70% {
    opacity: 1;
    transform: translateY(0) translateZ(0) rotateX(0deg) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateZ(0) rotateX(0deg) scale(1);
  }
}

.border-progress-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  clip-path: inset(0 0 0 0 round 20px);
}

.border-progress {
  width: 100%;
  height: 100%;
}

.border-progress path {
  transition: stroke-dashoffset 0.05s linear;
  shape-rendering: geometricPrecision;
}

.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1071px;
  padding: 12px 20px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 15px;
  flex-shrink: 0;
  z-index: 20;
  position: relative;
}

.navigation-controls,
.action-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* --- Responsive Design --- */
@media (max-width: 768px) {
  .controls-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 15px;
  }

  .navigation-controls, .action-controls {
    width: 100%;
    justify-content: center;
    gap: 20px;
  }

  .top-left-controls {
    top: 10px;
    left: 10px;
    gap: 10px;
    max-width: calc(100% - 20px);
  }

  .back-button {
    width: 36px;
    height: 36px;
    font-size: 1.1em;
  }

  :deep(.flashcard-title h1) {
    font-size: 1.3em;
  }

  .flashcard-viewer-content {
    padding-top: 60px;
  }
}

@media (max-width: 480px) {
  :deep(.flashcard-title h1) {
    font-size: 1.1em;
  }

  .flashcard-area {
    height: auto;
    min-height: 400px;
  }

  .flashcard-container {
    height: auto;
    width: 95%;
  }

  .viewer-layout {
    padding: 0 10px 10px 10px;
  }

  .controls-container {
    padding: 10px;
  }
}

.control-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s, opacity 0.2s;
  font-size: 1.4em;
  width: 44px;
  height: 44px;
}

.control-button:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.control-button:disabled {
  color: var(--text-secondary);
  opacity: 0.4;
  cursor: not-allowed;
}

.control-button.icon-button svg {
  display: block;
}

.play-pause-button {
  background-color: var(--primary-color);
  color: white;
}

.play-pause-button:hover:not(:disabled) {
  background-color: #4a8add;
}

.restart-button {
  color: var(--primary-color);
}

.restart-button:hover:not(:disabled) {
  background-color: rgba(var(--primary-color-rgb), 0.15);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.speed-label {
  font-size: 0.85em;
  font-weight: 500;
  min-width: 30px;
  text-align: right;
}

.speed-slider {
  width: 100px;
  cursor: pointer;
  accent-color: var(--primary-color);
  height: 5px;
  border-radius: 2.5px;
  background: var(--bg-tertiary);
  outline: none;
  vertical-align: middle;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.speed-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.speed-slider:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.speed-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.speed-slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}
</style>
