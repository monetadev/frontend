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
        <Transition name="card-transition" mode="out-in" @after-enter="onCardAnimationComplete">
          <div class="flashcard-container" :key="currentFlashcard.id || currIndex">
            <FlashCard
                :term="currentFlashcard.term"
                :definition="currentFlashcard.definition"
                ref="flashcardRef"
            />
            <div v-if="isProgressVisible" class="border-progress-container">
              <svg class="border-progress" :viewBox="`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`">
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
          <CounterDisplay :current="flashcards.length > 0 ? currIndex + 1 : 0" :total="flashcards.length"/>
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
              :disabled="isAnimatingCardTransition || flashcards.length === 0"
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
          <div class="speed-control" v-if="flashcards.length > 0 && (!isAtLastCard || isAtStart)">
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
import {ref, computed, onMounted, onBeforeUnmount, watch, nextTick} from 'vue';
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
  faArrowLeft
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

// SVG Dimensions (should match FlashCard.vue's explicit dimensions if fixed)
const svgViewBoxWidth = 1071;
const svgViewBoxHeight = 584.44;

const currentDeck = computed(() => flashcardSetResult.value?.findFlashcardSetById ?? null);

const flashcards = computed(() => {
  const originalCards = (currentDeck.value?.flashcards ?? [])
      .slice()
      .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  if (isShuffled.value) {
    const originalIds = new Set(originalCards.map(c => c.id));
    const validShuffled = shuffledCards.value.filter(c => originalIds.has(c.id));
    const shuffledIds = new Set(validShuffled.map(c => c.id));
    const newCardsToAppend = originalCards.filter(c => !shuffledIds.has(c.id));
    for (let i = newCardsToAppend.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCardsToAppend[i], newCardsToAppend[j]] = [newCardsToAppend[j], newCardsToAppend[i]];
    }
    const result = [...validShuffled, ...newCardsToAppend];
    return result.length > 0 ? result : originalCards;
  } else {
    return originalCards;
  }
});

const currentFlashcard = computed(() => {
  if (flashcards.value.length === 0) {
    return {id: 'empty-placeholder', term: "No cards", definition: "Please add cards to this set."};
  }
  return flashcards.value[currIndex.value] || {id: `empty-${currIndex.value}`, term: "Error", definition: "Card not found"};
});

const isAtStart = computed(() => currIndex.value === 0);
const isAtLastCard = computed(() => flashcards.value.length > 0 && currIndex.value === flashcards.value.length - 1);

const borderPathOffset = 4; // Center of 6px stroke is 4px from edge (1px card border + 3px half stroke)
const borderPathRadius = 20; // Should match FlashCard's border-radius

const borderPath = computed(() => {
  const w = svgViewBoxWidth;
  const h = svgViewBoxHeight;
  const r = borderPathRadius;
  const o = borderPathOffset; // Use the defined offset

  // Path starts from top-center, moves right, top-right arc, down, bottom-right arc, left, bottom-left arc, up, top-left arc, to center
  return `M ${w / 2} ${o} ` +
      `H ${w - r - o} A ${r} ${r} 0 0 1 ${w - o} ${r + o} ` +
      `V ${h - r - o} A ${r} ${r} 0 0 1 ${w - r - o} ${h - o} ` +
      `H ${r + o} A ${r} ${r} 0 0 1 ${o} ${h - r - o} ` +
      `V ${r + o} A ${r} ${r} 0 0 1 ${r + o} ${o} ` +
      `H ${w / 2}`;
});

const borderLength = computed(() => {
  const w = svgViewBoxWidth;
  const h = svgViewBoxHeight;
  const r = borderPathRadius;
  const o = borderPathOffset;
  // Perimeter of a rounded rectangle: 2 * (width_straight + height_straight) + 2 * PI * r
  const straightWidth = w - 2 * r - 2 * o;
  const straightHeight = h - 2 * r - 2 * o;
  if (straightWidth < 0 || straightHeight < 0) { // If offset/radius too large for dimensions
    return 2 * (w - 2*o) + 2 * (h - 2*o); // Fallback to simple perimeter of the offset box
  }
  return 2 * straightWidth + 2 * straightHeight + 2 * Math.PI * r;
});

const borderDashOffset = computed(() => borderLength.value * (1 - (progress.value / 100)));
const isProgressVisible = computed(() => isPlaying.value && !isAnimatingCardTransition.value && !isTransitioning.value && (progressInterval.value !== null || progress.value > 0));


function goBackToSetView() {
  if (flashcardSetId.value) {
    router.push({name: 'readSet', params: {id: flashcardSetId.value}});
  } else {
    router.push({name: 'privateProfileLibrary'});
  }
}

function triggerNextCard() {
  if (isNavigating.value || isAnimatingCardTransition.value || isAtLastCard.value || flashcards.value.length === 0) return;
  isNavigating.value = true;
  isAnimatingCardTransition.value = true;
  nextCard();
  setTimeout(() => { isNavigating.value = false; }, 300);
}

function triggerPrevCard() {
  if (isNavigating.value || isAnimatingCardTransition.value || isAtStart.value || flashcards.value.length === 0) return;
  isNavigating.value = true;
  isAnimatingCardTransition.value = true;
  prevCard();
  setTimeout(() => { isNavigating.value = false; }, 300);
}

function nextCard() {
  if (currIndex.value < flashcards.value.length - 1) {
    currIndex.value++;
  }
}

function prevCard() {
  if (currIndex.value > 0) {
    currIndex.value--;
  }
}

function goToBeginning() {
  if (isAnimatingCardTransition.value || flashcards.value.length === 0) return;
  if (isPlaying.value) stopAutoPlay();
  if (currIndex.value === 0) return;
  isAnimatingCardTransition.value = true;
  currIndex.value = 0;
}

async function shuffleCards() {
  if (isAnimatingCardTransition.value || flashcards.value.length < 2) return;
  if (isPlaying.value) stopAutoPlay();

  const originalCardsBasis = (currentDeck.value?.flashcards ?? [])
      .slice()
      .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  if (originalCardsBasis.length < 2) return;

  const cardsToShuffle = [...originalCardsBasis];

  for (let i = cardsToShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
  }

  shuffledCards.value = cardsToShuffle;
  isShuffled.value = true;
  isAnimatingCardTransition.value = true;

  if (currIndex.value === 0) {
    currIndex.value = -1;
    await nextTick();
    currIndex.value = 0;
  } else {
    currIndex.value = 0;
  }
}


function handleScroll(event) {
  if (isPlaying.value || isTransitioning.value || isNavigating.value || isAnimatingCardTransition.value || flashcards.value.length === 0) return;
  if (scrollTimeout.value) return;
  const delta = event.deltaY;
  const scrollThreshold = 20;

  if (Math.abs(delta) > scrollThreshold) {
    let triggered = false;
    if (delta < 0 && !isAtLastCard.value) {
      isAnimatingCardTransition.value = true; nextCard(); triggered = true;
    } else if (delta > 0 && !isAtStart.value) {
      isAnimatingCardTransition.value = true; prevCard(); triggered = true;
    }
    if (triggered) {
      scrollTimeout.value = setTimeout(() => { scrollTimeout.value = null; }, 500);
    }
  }
}

function handleKeydown(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target.isContentEditable) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isAnimatingCardTransition.value || isTransitioning.value) return;

  let handled = false;
  switch (event.key) {
    case 'ArrowLeft':
      if (!event.shiftKey && !isAtStart.value && flashcards.value.length > 0) { triggerPrevCard(); handled = true; }
      break;
    case 'ArrowRight':
      if (!event.shiftKey && !isAtLastCard.value && flashcards.value.length > 0) { triggerNextCard(); handled = true; }
      break;
    case 'ArrowUp':
    case 'ArrowDown':
    case ' ': // Space bar also flips
      if (flashcards.value.length > 0 && flashcardRef.value?.flip) {
        flashcardRef.value.flip();
        handled = true;
      }
      break;
  }
  if (handled) event.preventDefault();
}

function togglePlay() {
  if (isAnimatingCardTransition.value || flashcards.value.length === 0) return;
  if (isPlaying.value) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

function startAutoPlay() {
  if (flashcards.value.length === 0) return;
  if (isAtLastCard.value && autoPlayStep.value === 'definition') {
    isAnimatingCardTransition.value = true;
    currIndex.value = 0;
  }

  isPlaying.value = true;
  autoPlayStep.value = 'term';
  progress.value = 0;
  isTransitioning.value = false;

  if (flashcardRef.value && flashcardRef.value.isFlipped) {
    flashcardRef.value.flip();
    clearTimeout(playInterval.value);
    playInterval.value = setTimeout(() => {
      if (isPlaying.value && !isAnimatingCardTransition.value) startProgressBar();
    }, 800);
  } else {
    if (isPlaying.value && !isAnimatingCardTransition.value) startProgressBar();
  }
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
  if (isTransitioning.value || !isPlaying.value || isAnimatingCardTransition.value || flashcards.value.length === 0) return;
  progress.value = 0;
  clearInterval(progressInterval.value);

  const updateFrequency = 30;
  const totalDuration = playSpeed.value;
  if (totalDuration <= 0) return;
  const step = (100 * updateFrequency) / totalDuration;

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
      processNextStep();
    }
  }, updateFrequency);
}

function processNextStep() {
  if (!isPlaying.value || isAnimatingCardTransition.value) return;

  isTransitioning.value = true;

  if (autoPlayStep.value === 'term') {
    autoPlayStep.value = 'definition';
    if (flashcardRef.value && !flashcardRef.value.isFlipped) {
      flashcardRef.value.flip();
    }
    clearTimeout(playInterval.value);
    playInterval.value = setTimeout(() => {
      isTransitioning.value = false;
      if (isPlaying.value && !isAnimatingCardTransition.value) startProgressBar();
    }, 800);
  } else if (autoPlayStep.value === 'definition') {
    autoPlayStep.value = 'term';
    if (isAtLastCard.value) {
      isAnimatingCardTransition.value = true;
      currIndex.value = 0;
      isTransitioning.value = false;
      return;
    }
    isAnimatingCardTransition.value = true;
    nextCard();
    isTransitioning.value = false;
  }
}

function adjustSpeed(newSpeedValue) {
  const newSpeedMs = parseFloat(newSpeedValue) * 1000;
  if (newSpeedMs >= 3000 && newSpeedMs <= 10000) {
    playSpeed.value = newSpeedMs;
    if (isPlaying.value && !isTransitioning.value && !isAnimatingCardTransition.value && progressInterval.value !== null) {
      progress.value = 0;
      clearInterval(progressInterval.value);
      startProgressBar();
    }
  }
}

function onCardAnimationComplete() {
  isAnimatingCardTransition.value = false;

  if (isPlaying.value && autoPlayStep.value === 'term' && !isTransitioning.value && progressInterval.value === null) {
    if (flashcardRef.value && flashcardRef.value.isFlipped) {
      flashcardRef.value.flip();
      clearTimeout(playInterval.value);
      playInterval.value = setTimeout(() => {
        if (isPlaying.value) startProgressBar();
      }, 800);
    } else {
      if (isPlaying.value) startProgressBar();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  const mainContainer = document.querySelector('.flashcard-viewer-content');
  if (mainContainer) mainContainer.focus();
});

onBeforeUnmount(() => {
  stopAutoPlay();
  clearTimeout(scrollTimeout.value);
  window.removeEventListener('keydown', handleKeydown);
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    stopAutoPlay();
    flashcardSetId.value = newId;
    currIndex.value = 0;
    isShuffled.value = false;
    shuffledCards.value = [];
    isAnimatingCardTransition.value = false;
    isNavigating.value = false;
    isTransitioning.value = false;
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
    isTransitioning.value = false;
    nextTick(() => {
      if (flashcardRef.value && flashcardRef.value.isFlipped) {
        flashcardRef.value.flip();
      }
    });
  } else if (newDeck && oldDeck && newDeck.flashcards.length !== oldDeck.flashcards.length) {
    if (isShuffled.value) {
      const originalCards = (newDeck.flashcards ?? [])
          .slice()
          .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
      const originalIds = new Set(originalCards.map(c => c.id));
      const validShuffled = shuffledCards.value.filter(c => originalIds.has(c.id));
      const shuffledIds = new Set(validShuffled.map(c => c.id));
      const newCardsToAppend = originalCards.filter(c => !shuffledIds.has(c.id));
      for (let i = newCardsToAppend.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCardsToAppend[i], newCardsToAppend[j]] = [newCardsToAppend[j], newCardsToAppend[i]];
      }
      shuffledCards.value = [...validShuffled, ...newCardsToAppend];
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

.flashcard-area {
  position: relative;
  width: 100%;
  max-width: 1071px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
  perspective: 2000px;
  height: 584.44px;
  margin-bottom: 5px;
  overflow: hidden;
}

.flashcard-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
}

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

.card-transition-enter-active,
.card-transition-leave-active {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-transition-leave-active {
  transition: transform 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.35s ease-out;
  z-index: 1;
}

.card-transition-leave-to {
  opacity: 0;
  transform: scale(0.85) translateX(-120px) rotateY(25deg);
}

.card-transition-enter-active {
  animation: cardEnterOvershoot 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
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
  /* Match the FlashCard's border-radius (assuming 20px from FlashCard.vue styles) */
  clip-path: inset(0 0 0 0 round 20px);
}

.border-progress {
  width: 100%;
  height: 100%;
}

.border-progress path {
  transition: stroke-dashoffset 0.03s linear;
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
    gap: 10px;
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
  .flashcard-area {
    height: auto;
    min-height: 45vh;
  }
}

@media (max-width: 480px) {
  :deep(.flashcard-title h1) {
    font-size: 1.1em;
  }

  .flashcard-area {
    height: auto;
    min-height: 300px;
  }
  .flashcard-container {
    width: 95%;
    height: auto;
  }


  .viewer-layout {
    padding: 0 10px 10px 10px;
  }

  .controls-container {
    padding: 10px;
    gap: 15px;
  }
  .navigation-controls, .action-controls {
    gap: 5px;
  }
  .control-button {
    width: 40px;
    height: 40px;
    font-size: 1.3em;
  }
  .speed-slider {
    width: 80px;
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