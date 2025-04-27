<template>
  <div class="matching-game">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed" />

      <div class="game-container">
        <!-- Game Header -->
        <div class="game-header">
          <h1>{{ deckTitle }} Matching Game</h1>

          <!-- Game settings panel when not yet started -->
          <div v-if="!gameStarted && !loading && !error" class="game-settings-panel">
            <div class="settings-header">
              <h2>Game Settings</h2>
              <p class="settings-description">Match the correct term to each definition shown at the top.</p>
            </div>

            <div class="settings-options">
              <div class="setting-group">
                <h3>Card Visibility</h3>
                <div class="modern-radio-options">
                  <label class="modern-radio-label">
                    <input
                        type="radio"
                        name="hideCards"
                        :value="true"
                        v-model="hideCards"
                    >
                    <span class="radio-custom"></span>
                    <span class="radio-text">Hide cards until selected</span>
                  </label>

                  <label class="modern-radio-label">
                    <input
                        type="radio"
                        name="hideCards"
                        :value="false"
                        v-model="hideCards"
                    >
                    <span class="radio-custom"></span>
                    <span class="radio-text">Show all cards</span>
                  </label>
                </div>
              </div>
            </div>

            <button @click="startGame" class="start-button">
              <i class="fas fa-play"></i> Start Game
            </button>
          </div>
        </div>

        <!-- Stats when game is in progress -->
        <div v-if="gameStarted && !gameOver" class="game-stats">
          <div class="stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ formatTime(timer) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Matches:</span>
            <span class="stat-value">{{ matchesFound }} / {{ totalMatches }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Moves:</span>
            <span class="stat-value">{{ moves }}</span>
          </div>
        </div>

        <!-- Controls when game is in progress -->
        <div v-if="gameStarted && !gameOver" class="game-controls">
          <button @click="resetGame" class="reset-button">
            <i class="fas fa-redo"></i> Reset Game
          </button>
          <button @click="changeSettings" class ="settings-button">
            <i class="fas fa-cog"></i> Settings
          </button>
          <button @click="backToDeck" class="back-button">
            <i class="fas fa-arrow-left"></i> Back to Flashcards
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading your matching game...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p>Error loading flashcard set: {{ error.message }}</p>
        <button @click="backToDeck" class="back-button">
          Back to Flashcards
        </button>
      </div>

      <!-- Game board - new question-grid format -->
      <div v-else-if="gameStarted && !gameOver" class="question-grid-layout">
        <!-- Current question to match -->
        <div class="current-question">
          <div class="question-label">Definition:</div>
          <div class="question-content">{{ currentQuestion.content }}</div>
        </div>

        <!-- Grid of possible answers -->
        <div class="answer-grid">
          <div
              v-for="(card, index) in answerCards"
              :key="index"
              class="grid-card"
              :class="{
                'correct': card.correct,
                'incorrect': card.incorrect,
                'disabled': card.disabled || card.correct
              }"
              @click="selectAnswer(index)"
          >
            <div class="card-inner">
              <div v-if="hideCards && !card.revealed && !card.correct" class="card-hidden">
                <span>?</span>
              </div>
              <div v-else class="card-content" :class="{ 'small-text': card.content.length > 70 }">
                {{ card.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Next button appears after correct match -->
        <div v-if="showNextButton" class="next-question-container">
          <button @click="nextQuestion" class="next-button">
            <span v-if="matchesFound < totalMatches">Next Question</span>
            <span v-else>Finish Game</span>
          </button>
        </div>
      </div>

      <!-- Game Over State with Animation -->
      <div v-else-if="gameOver" class="game-over-container">
        <!-- Confetti animation -->
        <div class="confetti-container">
          <div v-for="n in 50" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
        </div>

        <div class="celebration-content">
          <h2 class="celebration-title">Congratulations!</h2>
          <p class="celebration-text">You've completed the matching game!</p>

          <div class="final-stats">
            <div class="final-stat">
              <span class="stat-label">Time:</span>
              <span class="stat-value">{{ formatTime(timer) }}</span>
            </div>
            <div class="final-stat">
              <span class="stat-label">Moves:</span>
              <span class="stat-value">{{ moves }}</span>
            </div>
            <div class="final-stat">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ calculateAccuracy() }}%</span>
            </div>
          </div>

          <div class="trophy-icon">
            <i class="fas fa-trophy"></i>
          </div>

          <div class="game-over-actions">
            <button @click="resetGameToConfig" class="reset-button">
              Play Again
            </button>
            <button @click="changeSettings" class="settings-button">
              Change Settings
            </button>
            <button @click="backToDeck" class="back-button">
              Back to Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_FLASHCARD_SET_BY_ID } from "@/graphql/auth.js";
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";

export default {
  name: "MatchingGame",
  components: {
    SidebarNavigation,
    NavigationBar
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const flashcardSetId = route.params.id;

    // State
    const isSidebarCollapsed = ref(true);
    const gameStarted = ref(false);
    const gameMode = ref('definition-to-term'); // Fixed to match definitions to terms
    const hideCards = ref(true); // Default: hide cards until selected
    const questionCards = ref([]);
    const answerCards = ref([]);
    const currentQuestionIndex = ref(0);
    const matchesFound = ref(0);
    const moves = ref(0);
    const timer = ref(0);
    const timerInterval = ref(null);
    const gameOver = ref(false);
    const showNextButton = ref(false);

    // Fetch flashcard data
    const { result, loading, error } = useQuery(
        GET_FLASHCARD_SET_BY_ID,
        { id: flashcardSetId }
    );

    // Computed properties
    const deckTitle = computed(() => {
      return result.value?.findFlashcardSetById?.title || 'Flashcard';
    });

    const flashcards = computed(() => {
      return result.value?.findFlashcardSetById?.flashcards || [];
    });

    const totalMatches = computed(() => {
      return questionCards.value.length;
    });

    const currentQuestion = computed(() => {
      return questionCards.value[currentQuestionIndex.value] || { content: '' };
    });

    // Methods
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    const backToDeck = () => {
      router.push(`/view/${flashcardSetId}`);
    };

    const startGame = () => {
      gameStarted.value = true;
      initializeGame();
    };

    const changeSettings = () => {
      gameStarted.value = false;
      gameOver.value = false;
      stopTimer();
    };

    const initializeGame = () => {
      if (flashcards.value.length === 0) return;

      // Reset game state
      questionCards.value = [];
      answerCards.value = [];
      currentQuestionIndex.value = 0;
      matchesFound.value = 0;
      moves.value = 0;
      timer.value = 0;
      gameOver.value = false;
      showNextButton.value = false;

      // Always prepare cards with definition-to-term mode
      flashcards.value.forEach((card, index) => {
        questionCards.value.push({
          id: index,
          content: card.definition,
          matched: false
        });

        answerCards.value.push({
          id: index,
          content: card.term,
          revealed: !hideCards.value,
          correct: false,
          incorrect: false,
          disabled: false
        });
      });

      // Shuffle only the answer cards
      answerCards.value = shuffleArray([...answerCards.value]);

      // Shuffle question order too
      questionCards.value = shuffleArray([...questionCards.value]);

      // Start timer
      startTimer();
    };

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const selectAnswer = (index) => {
      const card = answerCards.value[index];

      // Don't allow selecting disabled or already correct cards
      if (card.disabled || card.correct) return;

      // Always reveal card on selection
      card.revealed = true;

      // Increment moves
      moves.value++;

      // Check if answer matches current question
      const currentQuestion = questionCards.value[currentQuestionIndex.value];

      if (card.id === currentQuestion.id) {
        // Correct match
        card.correct = true;
        currentQuestion.matched = true;
        matchesFound.value++;
        showNextButton.value = true;

        // If this was the last match, end the game
        if (matchesFound.value === questionCards.value.length) {
          setTimeout(() => {
            endGame();
          }, 1500);
        }
      } else {
        // Incorrect match
        card.incorrect = true;

        // Reset incorrect status after a delay
        setTimeout(() => {
          card.incorrect = false;
          if (hideCards.value) {
            card.revealed = false;
          }
        }, 1000);
      }
    };

    const nextQuestion = () => {
      // If all questions are answered, end the game
      if (matchesFound.value >= questionCards.value.length) {
        endGame();
        return;
      }

      // Find next unanswered question
      let nextIndex = (currentQuestionIndex.value + 1) % questionCards.value.length;

      // Keep looking until we find an unanswered question
      while (questionCards.value[nextIndex].matched && nextIndex !== currentQuestionIndex.value) {
        nextIndex = (nextIndex + 1) % questionCards.value.length;
      }

      // Set the new current question
      currentQuestionIndex.value = nextIndex;
      showNextButton.value = false;

      // Reset incorrect states on answer cards
      answerCards.value.forEach(card => {
        if (!card.correct) {
          card.incorrect = false;
          if (hideCards.value) {
            card.revealed = false;
          }
        }
      });
    };

    const startTimer = () => {
      // Clear any existing timer
      stopTimer();

      timer.value = 0;
      timerInterval.value = setInterval(() => {
        timer.value++;
      }, 1000);
    };

    const stopTimer = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
    };

    const endGame = () => {
      stopTimer();
      gameOver.value = true;
    };

    const resetGame = () => {
      initializeGame();
    };

    const resetGameToConfig = () => {
      gameOver.value = false;
      initializeGame();
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateAccuracy = () => {
      if (moves.value === 0) return 0;
      const accuracy = (questionCards.value.length / moves.value) * 100;
      return Math.round(accuracy);
    };

    // Confetti animation helper
    const getConfettiStyle = (n) => {
      const randomColor = ['#5F98EF', '#27AE60', '#f8e71c', '#EA6192', '#8A2BE2', '#FF7F50'];
      const size = 5 + Math.random() * 10 + 'px';
      const animationDelay = Math.random() * 2 + 's';
      const animationDuration = 5 + Math.random() * 5 + 's';
      const left = Math.random() * 100 + '%';

      return {
        '--color': randomColor[Math.floor(Math.random() * randomColor.length)],
        '--size': size,
        '--animation-delay': animationDelay,
        '--animation-duration': animationDuration,
        '--left': left,
        '--rotation': Math.random() * 360 + 'deg'
      };
    };

    // Watch for data loading
    watch(flashcards, (newCards) => {
      if (newCards.length > 0 && gameStarted.value && !gameOver.value) {
        initializeGame();
      }
    });

    // Lifecycle hooks
    onMounted(() => {
      if (flashcards.value.length > 0 && gameStarted.value) {
        initializeGame();
      }
    });

    onBeforeUnmount(() => {
      stopTimer();
    });

    return {
      isSidebarCollapsed,
      gameStarted,
      gameMode,
      hideCards,
      questionCards,
      answerCards,
      currentQuestionIndex,
      currentQuestion,
      matchesFound,
      moves,
      timer,
      gameOver,
      showNextButton,
      loading,
      error,
      deckTitle,
      totalMatches,
      toggleSidebar,
      selectAnswer,
      nextQuestion,
      resetGame,
      resetGameToConfig,
      startGame,
      changeSettings,
      backToDeck,
      formatTime,
      calculateAccuracy,
      getConfettiStyle
    };
  }
};
</script>
<style scoped>
.matching-game {
  display: flex;
  background-color: #22293A;
  min-height: 100vh;
  font-family: "Outfit", sans-serif;
  color: white;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 220px;
  padding: 20px;
  padding-top: 80px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.game-container {
  max-width: 1200px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.game-header h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

/* Settings Panel Styles - Improved */
.game-settings-panel {
  background: linear-gradient(145deg, #2d3850, #262e42);
  border-radius: 18px;
  padding: 30px;
  max-width: 700px;
  margin: 30px auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-settings-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.3);
}

.settings-header {
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 20px;
}

.settings-header:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 3px;
  background: #5F98EF;
  border-radius: 3px;
}

.settings-header h2 {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 12px;
  color: white;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.settings-description {
  color: #b4bdce;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 80%;
}

.settings-options {
  margin-bottom: 35px;
}

.setting-group {
  position: relative;
  padding: 25px;
  background-color: rgba(21, 25, 35, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid rgba(95, 152, 239, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.setting-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.setting-group h3 {
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.setting-group h3:before {
  content: '\f013'; /* FontAwesome gear icon */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  margin-right: 10px;
  color: #5F98EF;
  font-size: 1.1rem;
}

.modern-radio-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 10px;
}

.modern-radio-label {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.modern-radio-label:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(95, 152, 239, 0.3);
}

.modern-radio-label input {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
}

.modern-radio-label input:checked ~ .radio-custom {
  background-color: rgba(95, 152, 239, 0.15);
  border-color: #5F98EF;
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3);
}

.modern-radio-label input:checked ~ .radio-custom:after {
  display: block;
}

.modern-radio-label input:checked ~ .radio-text {
  color: #5F98EF;
}

.modern-radio-label input:checked ~ .radio-custom:before {
  transform: scale(1);
  opacity: 1;
}

.radio-custom {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  background-color: transparent;
  margin-right: 15px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-custom:after {
  content: "";
  position: absolute;
  display: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #5F98EF;
  box-shadow: 0 0 10px rgba(95, 152, 239, 0.5);
  animation: pulseRadio 1s ease infinite;
}

.radio-text {
  font-size: 1.15rem;
  font-weight: 500;
  color: #ffffff;
  transition: color 0.2s ease;
}

.start-button {
  background: linear-gradient(135deg, #5F98EF, #4a86e8);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 8px 20px rgba(95, 152, 239, 0.3);
  position: relative;
  overflow: hidden;
}

.start-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transition: left 0.7s ease;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(95, 152, 239, 0.4);
  background: linear-gradient(135deg, #6aa3f5, #5F98EF);
}

.start-button:hover:before {
  left: 100%;
}

.start-button:active {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(95, 152, 239, 0.2);
}

.fa-play {
  font-size: 1rem;
}

@keyframes pulseRadio {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/* Game Stats Styles */
.game-stats {
  display: flex;
  gap: 30px;
  background-color: #2c364c;
  border-radius: 10px;
  padding: 15px 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: 500;
  color: #9ea8c1;
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem;
}

/* Game Controls Styles */
.game-controls {
  display: flex;
  gap: 15px;
}

.reset-button, .back-button, .settings-button, .next-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.2s ease;
}

.reset-button {
  background-color: #5F98EF;
  color: white;
}

.reset-button:hover {
  background-color: #4a86e8;
}

.settings-button {
  background-color: #5c6785;
  color: white;
}

.settings-button:hover {
  background-color: #4c566f;
}

.next-button {
  background-color: #4CAF50;
  color: white;
  padding: 12px 30px;
  font-size: 1.1rem;
}

.next-button:hover {
  background-color: #3e8e41;
}

.back-button {
  background-color: #3a4358;
  color: white;
}

.back-button:hover {
  background-color: #303a4c;
}

/* Question-Grid Layout */
.question-grid-layout {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;
  width: 100%;
}

.current-question {
  background-color: #2c364c;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 1500px; /* Increased to match answer grid */
  margin: 0 auto;
  width: 100%;
}

.question-label {
  font-size: 1.2rem;
  color: #9ea8c1;
  margin-bottom: 10px;
}

.question-content {
  font-size: 1.8rem;
  font-weight: 600;
  word-break: break-word;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  width: 100%;
  max-width: 1500px; /* Increased to accommodate wider cards */
  margin: 0 auto;
  justify-items: center;
}

/* Fixed column count with adjusted widths for different screen sizes */
@media (min-width: 576px) {
  .answer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .answer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 992px) {
  .answer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1200px) {
  .answer-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.grid-card {
  width: 100%; /* Full width of grid cell */
  max-width: 220px; /* Reduced from 280px */
  height: 180px; /* Reduced from 240px */
  background-color: #2c364c;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .grid-card {
    max-width: 240px; /* Reduced from 300px */
    height: 200px; /* Reduced from 260px */
  }
}

.grid-card:not(.disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.grid-card.correct {
  background-color: #27AE60;
  cursor: default;
}

.grid-card.incorrect {
  background-color: #f44336;
}

.grid-card.disabled {
  opacity: 0.6;
  cursor: default;
}

.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  position: relative;
}

.card-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
  background-color: #2c364c;
  transition: opacity 0.3s ease;
  z-index: 5;
}

.card-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px; /* Add more padding around the text */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  font-size: 1.2rem; /* Further increased font size */
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

.small-text {
  font-size: 1rem; /* Increased from 1rem */
}

/* Next button container */
.next-question-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* Loading, Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
  min-height: 400px;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #5F98EF;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Game Over Animation Styles */
.game-over-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  text-align: center;
  min-height: 500px;
  overflow: hidden;
}

.celebration-content {
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.8s ease-out both;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.celebration-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #5F98EF;
  animation: pulsate 2s infinite;
  text-shadow: 0 0 15px rgba(95, 152, 239, 0.5);
  text-align: center;
}

.celebration-text {
  font-size: 1.5rem;
  color: #ffffff;
  animation: fadeIn 1s ease-out 0.3s both;
  text-align: center;
}

.trophy-icon {
  font-size: 5rem;
  color: #FFD700;
  margin: 25px 0;
  animation: bounceIn 1s ease-out 0.5s both, shine 3s infinite 1s;
  text-align: center;
}

.final-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
  animation: fadeIn 1s ease-out 0.6s both;
  width: 100%;
}

.final-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.final-stat .stat-label {
  font-size: 1.2rem;
  color: #9ea8c1;
  margin-bottom: 8px;
  text-align: center;
}

.final-stat .stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.game-over-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  animation: fadeIn 1s ease-out 0.9s both;
  width: 100%;
}

/* Confetti Animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -10%;
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  opacity: 0.8;
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

@keyframes confettiFall {
  0% {
    top: -10%;
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateX(100px) rotate(180deg);
    opacity: 0.7;
  }
  100% {
    top: 100%;
    transform: translateX(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
    transform: scale(1.1);
  }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes pulsate {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shine {
  0% { text-shadow: 0 0 5px #FFD700; }
  50% { text-shadow: 0 0 20px #FFD700, 0 0 30px #FFA500; }
  100% { text-shadow: 0 0 5px #FFD700; }
}

/* Media queries */
@media (max-width: 768px) {
  .game-settings-panel {
    padding: 25px 20px;
    margin: 20px auto;
  }

  .settings-header h2 {
    font-size: 1.6rem;
  }

  .settings-description {
    max-width: 100%;
    font-size: 1rem;
  }

  .setting-group {
    padding: 20px 15px;
  }

  .start-button {
    padding: 14px 24px;
  }

  .final-stats {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .game-over-actions {
    flex-direction: column;
    gap: 10px;
    align-items: center;
    width: 100%;
    max-width: 300px;
  }

  .celebration-title {
    font-size: 2.5rem;
  }

  .trophy-icon {
    font-size: 4rem;
  }
}
</style>