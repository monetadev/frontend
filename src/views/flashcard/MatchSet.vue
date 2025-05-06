<template>
  <main class="view-content matching-game-view">

    <h2 v-if="deckTitle" class="page-title">{{ deckTitle }} - Match Game</h2>
    <h2 v-else class="page-title">Match Game</h2>

    <div v-if="loading" class="loading-indicator full-page-indicator">
      <font-awesome-icon :icon="['fas', 'spinner']" spin size="3x"/>
      <p>Loading Matching Game...</p>
    </div>

    <div v-else-if="error" class="error-message full-page-error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="3x" class="error-icon"/>
      <p>Oops! Couldn't load the flashcard set for the game.</p>
      <pre>Error: {{ error.message }}</pre>
      <button @click="goBackToSet" class="action-button error-action">Back to Set</button>
    </div>

    <div v-else-if="!loading && (!flashcards || flashcards.length < 2)" class="info-state full-page-error">
      <font-awesome-icon :icon="['fas', 'box-open']" size="2x"/>
      <p>You need at least 2 cards in this set to play the matching game.</p>
      <button @click="goBackToSet" class="action-button error-action">Back to Set</button>
    </div>

    <div v-else class="game-area">

      <div v-if="gameReady && !gameHasStarted && !gameOver" class="start-game-container">
        <button @click="startGame" class="start-button pulse-animation">
          <font-awesome-icon :icon="['fas', 'play']"/>
          <span>Start Game</span>
        </button>
      </div>

      <template v-if="gameHasStarted && !gameOver">
        <div class="game-status-bar">
          <button @click="goBackToSet" class="action-button secondary back-button-status-bar"
                  title="Back to Set Details">
            <font-awesome-icon :icon="['fas', 'arrow-left']"/>
          </button>

          <div class="game-stats">
            <div class="stat-item">
              <font-awesome-icon :icon="['far', 'clock']"/>
              <span>Time: {{ formatTime(timer) }}</span>
            </div>
            <div class="stat-item">
              <font-awesome-icon :icon="['fas', 'bullseye']"/>
              <span>Question: {{ currentQuestionIndex + 1 }} / {{ totalMatchesInRound }}</span>
            </div>
            <div class="stat-item">
              <font-awesome-icon :icon="['fas', 'check-double']"/>
              <span>Matches: {{ matchesFound }} / {{ totalMatchesInRound }}</span>
            </div>
            <div class="stat-item">
              <font-awesome-icon :icon="['fas', 'mouse-pointer']"/>
              <span>Moves: {{ moves }}</span>
            </div>
          </div>
          <div class="game-controls">
            <button
                v-if="gameHasStarted && !gameOver && !isPaused && hasRemovedCards"
                @click="consolidateGrid"
                class="action-button"
                title="Consolidate Grid (Fill Empty Spaces)">
              <font-awesome-icon :icon="['fas', 'compress-alt']"/>
            </button>
            <button v-if="!isPaused" @click="pauseGame" class="action-button" title="Pause Game">
              <font-awesome-icon :icon="['fas', 'pause']"/>
            </button>
            <button v-else @click="resumeGame" class="action-button" title="Resume Game">
              <font-awesome-icon :icon="['fas', 'play']"/>
            </button>
            <button @click="restartGame" class="action-button" title="Restart This Round"
                    :disabled="!gameHasStarted || gameOver">
              <font-awesome-icon :icon="['fas', 'redo']"/>
            </button>
          </div>
        </div>

        <div class="game-content-area">
          <div v-if="isPaused" class="pause-overlay">
            <div class="pause-text">Paused</div>
            <button @click="resumeGame" class="action-button resume-button-overlay">
              <font-awesome-icon :icon="['fas', 'play']"/>
              Resume
            </button>
          </div>

          <div class="current-definition-display">
            <div class="definition-label">Definition:</div>
            <div class="definition-content">{{ currentDefinitionContent }}</div>
          </div>

          <div class="answer-grid-container">
            <div class="answer-grid">
              <div
                  v-for="termCard in answerOptions"
                  :key="termCard.id"
                  class="answer-card"
                  :class="{
                              'correct': termCard.correct,
                              'incorrect': termCard.incorrect,
                              'disabled': termCard.disabled || termCard.correct || isChecking || isPaused,
                              'removing': termCard.isRemoving
                          }"
                  @click="selectAnswer(termCard)"
              >
                <div class="card-content">
                  {{ termCard.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>


      <div v-else-if="gameOver" class="game-over-overlay">
        <div class="game-over-container">
          <div class="confetti-container">
            <div v-for="n in 60" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
          </div>
          <div class="celebration-content">
            <div class="trophy-icon">
              <font-awesome-icon :icon="['fas', 'trophy']"/>
            </div>
            <h2 class="celebration-title">Challenge Complete!</h2>
            <p v-if="playedCardIndices.size >= allFlashcardsWithIndex.length" class="celebration-text">
              You've matched all the terms in the set!
            </p>
            <p v-else class="celebration-text">
              You finished this round! Click Play Again to continue with the remaining terms.
            </p>
            <div class="final-stats">
              <div class="final-stat"><span class="stat-label">Time</span><span class="stat-value">{{
                  formatTime(timer)
                }}</span></div>
              <div class="final-stat"><span class="stat-label">Moves</span><span class="stat-value">{{ moves }}</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{{ calculateAccuracy() }}%</span>
              </div>
            </div>
            <div class="game-over-actions">
              <button @click="restartGame" class="action-button primary">
                <font-awesome-icon :icon="['fas', 'play']"/>
                {{
                  playedCardIndices.size >= allFlashcardsWithIndex.length ? 'Play Full Set Again' : 'Play Next Round'
                }}
              </button>
              <button @click="goBackToSet" class="action-button secondary">
                <font-awesome-icon :icon="['fas', 'arrow-left']"/>
                Back to Set
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </main>
</template>

<script setup>
import {ref, computed, watch, onMounted, onBeforeUnmount, nextTick} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useQuery} from '@vue/apollo-composable';
import {GET_FLASHCARD_SET_BY_ID} from "@/graphql/auth.js";
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {faCompressAlt} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';

library.add(
    fas.faSpinner, fas.faTriangleExclamation, fas.faBoxOpen, fas.faPlay,
    fas.faRedo, fas.faArrowLeft, fas.faCheckDouble, fas.faMousePointer,
    fas.faTrophy, fas.faArrowRight, fas.faBullseye, fas.faPause,
    far.faClock, faCompressAlt
);

const route = useRoute();
const router = useRouter();
const flashcardSetId = computed(() => route.params.id);

const allFlashcardsWithIndex = ref([]);
const currentRoundCards = ref([]);
const playedCardIndices = ref(new Set());

const currentQuestionIndex = ref(0);
const answerOptions = ref([]);

const matchesFound = ref(0);
const moves = ref(0);
const madeIncorrectAttemptThisQuestion = ref(false);

const timer = ref(0);
const timerInterval = ref(null);

const gameOver = ref(false);
const isChecking = ref(false);
const gameReady = ref(false);
const gameHasStarted = ref(false);
const isPaused = ref(false);

const MAX_CARDS_IN_ROUND = 40;
const AUTO_ADVANCE_DELAY = 1200;

const {result: queryResult, loading, error} = useQuery(
    GET_FLASHCARD_SET_BY_ID,
    () => ({id: flashcardSetId.value}),
    () => ({
      enabled: !!flashcardSetId.value,
      fetchPolicy: 'cache-and-network',
    })
);

const deckTitle = computed(() => queryResult.value?.findFlashcardSetById?.title || '');
const flashcards = computed(() => queryResult.value?.findFlashcardSetById?.flashcards || []);
const hasRemovedCards = computed(() => answerOptions.value.some(card => card.correct));
const totalMatchesInRound = computed(() => currentRoundCards.value.length);
const currentDefinition = computed(() => {
  if (currentRoundCards.value.length > 0 && currentQuestionIndex.value < currentRoundCards.value.length) {
    return currentRoundCards.value[currentQuestionIndex.value];
  }
  return null;
});
const currentDefinitionContent = computed(() => currentDefinition.value?.definition || 'Loading...');
const currentPairId = computed(() => {
  const card = currentDefinition.value;
  return card?.originalIndex !== undefined ? `pair-${card.originalIndex}` : null;
});

const goBackToSet = () => {
  router.push({name: 'readSet', params: {id: flashcardSetId.value}});
};

const consolidateGrid = () => {
  if (!hasRemovedCards.value) return;

  const activeCards = answerOptions.value.filter(card => !card.correct);
  const removedCards = answerOptions.value.filter(card => card.correct);

  answerOptions.value = [...activeCards, ...removedCards];
};

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const prepareGame = () => {
  if (allFlashcardsWithIndex.value.length < 2) {
    gameReady.value = false;
    return;
  }

  stopTimer();
  timer.value = 0;
  isPaused.value = false;
  gameOver.value = false;
  gameHasStarted.value = false;
  currentQuestionIndex.value = 0;
  matchesFound.value = 0;
  moves.value = 0;
  isChecking.value = false;
  madeIncorrectAttemptThisQuestion.value = false;

  let unplayedCards = allFlashcardsWithIndex.value.filter(
      card => !playedCardIndices.value.has(card.originalIndex)
  );
  if (unplayedCards.length === 0 && allFlashcardsWithIndex.value.length > 0) {
    playedCardIndices.value.clear();
    unplayedCards = [...allFlashcardsWithIndex.value];
  }
  if (unplayedCards.length === 0) {
    gameReady.value = false;
    return;
  }

  let roundData = shuffleArray(unplayedCards).slice(0, MAX_CARDS_IN_ROUND);
  currentRoundCards.value = shuffleArray(roundData);

  prepareAnswerOptions();

  gameReady.value = true;
};

const prepareAnswerOptions = () => {
  answerOptions.value = shuffleArray(currentRoundCards.value).map(card => ({
    id: `pair-${card.originalIndex}`,
    content: card.term,
    correct: false,
    incorrect: false,
    disabled: false,
    isRemoving: false
  }));
};

const startGame = () => {
  if (!gameReady.value) {
    return;
  }
  gameHasStarted.value = true;
  gameOver.value = false;
  isPaused.value = false;
  timer.value = 0;
  startOrResumeTimer();
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const startOrResumeTimer = () => {
  stopTimer();
  timerInterval.value = setInterval(() => {
    if (gameHasStarted.value && !isPaused.value && !gameOver.value) {
      timer.value++;
    }
  }, 1000);
};

const pauseGame = () => {
  if (!gameHasStarted.value || gameOver.value) return;
  isPaused.value = true;
  stopTimer();
};

const resumeGame = () => {
  if (!gameHasStarted.value || gameOver.value || !isPaused.value) return;
  isPaused.value = false;
  startOrResumeTimer();
};

const selectAnswer = (termCard) => {
  if (isPaused.value || isChecking.value || termCard.disabled || termCard.correct) {
    return;
  }

  moves.value++;
  isChecking.value = true;

  if (termCard.id === currentPairId.value) {
    termCard.correct = true;
    termCard.isRemoving = true;

    if (!madeIncorrectAttemptThisQuestion.value) {
      matchesFound.value++;
    }

    termCard.disabled = true;

    setTimeout(() => {
      advanceToNextDefinition();
    }, AUTO_ADVANCE_DELAY);

  } else {
    termCard.incorrect = true;
    madeIncorrectAttemptThisQuestion.value = true;
    termCard.disabled = true;

    setTimeout(() => {
      termCard.incorrect = false;
      if (!termCard.correct) {
        termCard.disabled = false;
      }
      isChecking.value = false;
    }, 800);
  }
};

const advanceToNextDefinition = () => {
  if (currentQuestionIndex.value >= totalMatchesInRound.value - 1) {
    endGame();
  } else {
    currentQuestionIndex.value++;
    madeIncorrectAttemptThisQuestion.value = false;
    isChecking.value = false;
  }
};

const endGame = () => {
  stopTimer();
  currentRoundCards.value.forEach(card => playedCardIndices.value.add(card.originalIndex));
  gameOver.value = true;
  gameHasStarted.value = false;
  isPaused.value = false;
};

const restartGame = () => {
  prepareGame();
  nextTick(() => {
    if (gameReady.value) {
      startGame();
    }
  });
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const calculateAccuracy = () => {
  if (moves.value === 0) return 0;
  const accuracy = (matchesFound.value / moves.value) * 100;
  return Math.max(0, Math.min(100, Math.round(accuracy)));
};

const getConfettiStyle = (n) => {
  const randomColor = ['#5F98EF', '#27AE60', '#f8e71c', '#EA6192', '#8A2BE2', '#FF7F50', '#ffffff'];
  const size = 6 + Math.random() * 8 + 'px';
  const animationDelay = Math.random() * 3 + 's';
  const animationDuration = 4 + Math.random() * 4 + 's';
  const left = Math.random() * 100 + '%';
  return {
    '--color': randomColor[Math.floor(Math.random() * randomColor.length)],
    '--size': size, '--animation-delay': animationDelay, '--animation-duration': animationDuration,
    '--left': left, '--rotation': Math.random() * 360 + 'deg', '--sway': (Math.random() - 0.5) * 150 + 'px'
  };
};

watch([flashcards, loading], ([newCards, newLoading]) => {
  if (!newLoading && newCards && newCards.length > 0) {
    const needsProcessing = allFlashcardsWithIndex.value.length === 0 || allFlashcardsWithIndex.value[0]?.id !== newCards[0]?.id;
    if (needsProcessing) {
      allFlashcardsWithIndex.value = newCards.map((card, index) => ({...card, originalIndex: index}));
      playedCardIndices.value.clear();
    }

    if (!gameReady.value && !gameHasStarted.value) {
      prepareGame();
    }
  } else if (!newLoading && (!newCards || newCards.length < 2)) {
    gameReady.value = false;
    gameHasStarted.value = false;
    stopTimer();
  } else if (newLoading) {
    gameReady.value = false;
    gameHasStarted.value = false;
    stopTimer();
  }
}, {immediate: false});

onMounted(() => {
  if (!loading.value && flashcards.value.length >= 2 && !gameReady.value) {
    allFlashcardsWithIndex.value = flashcards.value.map((card, index) => ({...card, originalIndex: index}));
    prepareGame();
  } else if (!loading.value && flashcards.value.length < 2) {
    gameReady.value = false;
  } else if (loading.value) {
    gameReady.value = false;
  }
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style scoped>
:root {
  --bg-primary: #181E2E;
  --bg-secondary: #22293A;
  --bg-tertiary: #2A334A;
  --text-primary: #E0E0E0;
  --text-secondary: #A4ABBF;
  --border-color: #3a4359;
  --primary-color: #5F98EF;
  --primary-color-darker: #4a86e8;
  --success-color: #27AE60;
  --success-color-light: rgba(39, 174, 96, 0.15);
  --error-color: #f44336;
  --error-color-light: rgba(244, 67, 54, 0.15);
  --warning-color: #f8e71c;
  --matched-color: var(--success-color);
  --matched-bg: var(--success-color-light);
  --selected-color: var(--primary-color);
  --selected-border: var(--primary-color);
  --incorrect-color: var(--error-color);
  --incorrect-bg: var(--error-color-light);
  --trophy-color: #FFD700;
  --overlay-bg: rgba(24, 30, 46, 0.85);
}

.matching-game-view, .matching-game-view * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.view-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
  overflow: hidden;
  flex-grow: 1;
  min-height: 0;
}

.page-title {
  font-size: 1.6em;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  margin-top: 0;
}

.loading-indicator, .error-message, .info-state {
  padding: 15px;
  text-align: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  margin: 0;
  font-size: 0.95em;
  border: 1px solid var(--border-color);
}

.full-page-indicator, .full-page-error, .info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
  border-radius: 12px;
}

.full-page-indicator p, .full-page-error p, .info-state p {
  margin-top: 15px;
  font-size: 1.1em;
  color: var(--text-primary);
}

.full-page-error .error-icon {
  color: var(--error-color);
}

.full-page-error pre {
  background-color: rgba(244, 67, 54, 0.1);
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

.error-action {
  margin-top: 20px;
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.error-action:hover:not(:disabled) {
  background-color: var(--row-highlight-bg, #2a335a);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.start-game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  min-height: 300px;
}

.start-button {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-darker));
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 8px 20px rgba(95, 152, 239, 0.3);
}

.start-button:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 25px rgba(95, 152, 239, 0.4);
}

.start-button:active {
  transform: translateY(0) scale(1);
  box-shadow: 0 5px 15px rgba(95, 152, 239, 0.2);
}

.pulse-animation {
  animation: pulse 1.8s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 8px 20px rgba(95, 152, 239, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(95, 152, 239, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 8px 20px rgba(95, 152, 239, 0.3);
  }
}

.game-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 15px;
  min-height: 0;
}

.game-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 15px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.back-button-status-bar {
  margin-right: 10px;
  padding: 8px 10px;
  flex-shrink: 0;
}

.game-stats {
  display: flex;
  align-items: center;
  gap: 5px 15px;
  flex-wrap: wrap;
  flex-grow: 1;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.85em;
  white-space: nowrap;
  min-width: 95px;
  text-align: center;
}

.stat-item span {
  color: var(--text-primary);
  font-weight: 500;
}

.game-controls {
  display: flex;
  gap: 8px;
  margin-left: 10px;
  flex-shrink: 0;
}

.game-controls .action-button {
  margin-right: 0;
}

.game-controls .action-button:not(:has(span)) {
  padding: 8px 10px;
}

.game-controls .action-button:has(span) {
  margin-right: 5px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9em;
  transition: all 0.2s ease-out;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.action-button:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-secondary) !important;
  transform: none !important;
  box-shadow: none !important;
}

.action-button.primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.action-button.primary:hover:not(:disabled) {
  background-color: var(--primary-color-darker);
  border-color: var(--primary-color-darker);
}

.action-button.secondary {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.action-button.secondary:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.game-content-area {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 15px;
  min-height: 0;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--overlay-bg);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 50;
  border-radius: 8px;
}

.pause-text {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 25px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.resume-button-overlay {
  font-size: 1.1rem;
  padding: 12px 25px;
}

.current-definition-display {
  background-color: var(--bg-secondary);
  padding: 15px 20px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--border-color);
  width: 100%;
  flex-shrink: 0;
}

.definition-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.definition-content {
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  min-height: 30px;
  word-wrap: break-word;
}

.answer-grid-container {
  overflow: hidden;
  display: flex;
  background-color: var(--bg-primary);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  flex-grow: 1;
  min-height: 0;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: minmax(70px, auto);
  gap: 10px;
  width: 100%;
  overflow-y: auto;
  padding: 5px;
  align-content: start;
}

.answer-card {
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
  user-select: none;
  min-height: 70px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.answer-card:not(.disabled):not(.correct):hover {
  transform: translateY(-2px);
  border-color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.answer-card .card-content {
  font-size: 0.85em;
  line-height: 1.3;
  color: var(--text-primary);
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.answer-card.correct {
  border-color: var(--success-color);
  background-color: var(--success-color-light);
  cursor: default;
}

.answer-card.correct .card-content {
  font-weight: 600;
  color: var(--success-color);
}

.answer-card.incorrect {
  border-color: var(--error-color) !important;
  background-color: var(--error-color-light) !important;
}

.answer-card.incorrect .card-content {
  color: var(--error-color);
}

.answer-card.disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-color) !important;
  transform: none !important;
  box-shadow: none !important;
}

.answer-card.disabled:hover {
  border-color: var(--border-color) !important;
}

.answer-card.removing {
  animation: fadeOutCorrect 0.8s ease-out forwards;
  cursor: default;
}

@keyframes fadeOutCorrect {
  from {
    opacity: 1;
    transform: scale(1);
    visibility: visible;
  }
  to {
    opacity: 0;
    transform: scale(0.8);
    visibility: hidden;
  }
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(18, 23, 41, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.game-over-container {
  position: relative;
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-primary));
  border-radius: 15px;
  padding: 40px 50px;
  text-align: center;
  width: 100%;
  max-width: 650px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.celebration-content {
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.8s ease-out both;
}

.trophy-icon {
  font-size: 4.5rem;
  color: var(--trophy-color);
  margin-bottom: 20px;
  animation: bounceIn 1s ease-out 0.2s both, shine 3s infinite 1.2s;
}

.celebration-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--primary-color);
  animation: pulsate 2.5s infinite ease-in-out;
  text-shadow: 0 0 10px rgba(95, 152, 239, 0.4);
}

.celebration-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 25px;
  animation: fadeIn 1s ease-out 0.5s both;
  line-height: 1.5;
}

.final-stats {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin-bottom: 30px;
  animation: fadeIn 1s ease-out 0.7s both;
  padding: 15px;
  background-color: rgba(18, 23, 41, 0.3);
  border-radius: 10px;
  flex-wrap: wrap;
}

.final-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 5px;
}

.final-stat .stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  width: 100%;
}

.final-stat .stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  width: 100%;
}

.game-over-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
  animation: fadeIn 1s ease-out 0.9s both;
  flex-wrap: wrap;
}

.game-over-actions .action-button {
  padding: 10px 20px;
  font-size: 0.95em;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  top: -15%;
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  opacity: 0.9;
  animation: confettiFall var(--animation-duration) linear infinite;
  animation-delay: var(--animation-delay);
  transform: rotate(var(--rotation));
  left: var(--left);
}

.confetti:nth-child(odd) {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.confetti:nth-child(even) {
  border-radius: 50%;
}

.confetti:nth-child(3n) {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.confetti:nth-child(4n) {
  width: calc(var(--size) * 0.6);
  height: calc(var(--size) * 1.5);
}

@keyframes confettiFall {
  0% {
    top: -15%;
    transform: translateX(0) rotate(var(--rotation));
    opacity: 1;
  }
  100% {
    top: 110%;
    transform: translateX(var(--sway)) rotate(calc(var(--rotation) + 360deg));
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulsate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shine {
  0%, 100% {
    text-shadow: 0 0 5px var(--trophy-color), 0 0 10px var(--trophy-color);
  }
  50% {
    text-shadow: 0 0 15px var(--trophy-color), 0 0 25px #FFA500;
  }
}

@media (max-width: 992px) {
  .answer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .view-content {
    padding: 15px;
  }

  .page-title {
    font-size: 1.5em;
  }

  .game-status-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 10px;
  }

  .back-button-status-bar {
    margin-right: 0;
    margin-bottom: 10px;
    width: fit-content;
  }

  .game-stats {
    justify-content: space-around;
    width: 100%;
    margin-bottom: 10px;
    gap: 8px 12px;
  }

  .game-controls {
    justify-content: center;
    width: 100%;
    margin-left: 0;
  }

  .current-definition-display {
    padding: 15px;
  }

  .definition-content {
    font-size: 1.1rem;
  }

  .answer-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .answer-card {
    min-height: 65px;
  }

  .answer-card .card-content {
    font-size: 0.8em;
    -webkit-line-clamp: 3;
  }

  .answer-grid-container {
    padding: 8px;
  }

  .start-button {
    padding: 15px 30px;
    font-size: 1.2rem;
    gap: 12px;
  }

  .game-over-container {
    padding: 30px 20px;
    max-width: 95%;
  }

  .celebration-title {
    font-size: 2rem;
  }

  .celebration-text {
    font-size: 1.1rem;
  }

  .final-stats {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    padding: 15px;
  }

  .final-stat {
    flex-basis: 30%;
  }

  .final-stat .stat-value {
    font-size: 1.8rem;
  }

  .game-over-actions {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .game-over-actions .action-button {
    width: 80%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .view-content {
    padding: 10px;
    gap: 10px;
  }

  .page-title {
    font-size: 1.3em;
  }

  .definition-content {
    font-size: 1rem;
  }

  .answer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .answer-card {
    min-height: 60px;
    padding: 6px;
  }

  .answer-card .card-content {
    font-size: 0.75em;
  }

  .answer-grid-container {
    padding: 6px;
  }

  .stat-item {
    font-size: 0.8em;
    gap: 4px;
    min-width: 80px;
  }

  .game-stats {
    gap: 6px 10px;
  }

  .game-controls {
    gap: 5px;
  }

  .start-button {
    padding: 12px 25px;
    font-size: 1.1rem;
    gap: 10px;
  }

  .trophy-icon {
    font-size: 3.5rem;
  }

  .celebration-title {
    font-size: 1.8rem;
  }

  .final-stats {
    gap: 10px;
  }

  .final-stat {
    flex-basis: 45%;
  }

  .final-stat .stat-value {
    font-size: 1.6rem;
  }

  .game-over-actions .action-button {
    width: 90%;
  }
}
</style>
