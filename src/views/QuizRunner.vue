<template>
  <div class="quiz-runner">
    <h2>Quiz Mode: {{ quizOptions.mode }}</h2>
    <p>Flashcard Set: {{ quizOptions.set }}</p>
    <p v-if="quizOptions.timeEnabled">Time Limit: {{ quizOptions.timeLimit }} min</p>
    <p>Locked Navigation: {{ quizOptions.lockedNav ? 'Yes' : 'No' }}</p>
    <p>Review Mode: {{ quizOptions.reviewMode ? 'Enabled' : 'Disabled' }}</p>

    <div v-if="quizOptions.timeEnabled" class="timer-bar">
      <div class="progress" :style="{ width: timeProgress + '%' }"></div>
      <span class="time-label">{{ formattedTime }}</span>
    </div>

    <div v-if="questions.length">
      <div v-if="quizOptions.lockedNav">
        <div v-if="currentIndex < questions.length">
          <QuizQuestion
              :question="questions[currentIndex]"
              :mode="quizOptions.mode"
              :reviewMode="quizOptions.reviewMode"
              :questionNumber="questions[currentIndex].questionNo"
              @answered="handleAnswer"
          />
        </div>
        <div v-else>
          <h3>Quiz Completed!</h3>
        </div>
      </div>

      <div v-else class="quiz-container">
        <div class="question-nav" :style="navHeightStyle">

        <div
              v-for="(q, i) in questions"
              :key="i"
              class="nav-number"
              :class="{ answered: answeredQuestions.includes(i) }"
              @click="scrollToQuestion(i)"
          >
            {{ q.questionNo }}
          </div>
        </div>

        <div class="questions-area">
          <div
              v-for="(q, i) in questions"
              :key="i"
              :ref="'question-' + i"
              class="question-wrapper"
          >
            <QuizQuestion
                :question="q"
                :mode="quizOptions.mode"
                :reviewMode="quizOptions.reviewMode"
                :questionNumber="q.questionNo"
                @answered="markAnswered(i)"
            />
          </div>
          <button class="submit-button" @click="submitQuiz">Submit</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showToast" class="toast">
    {{ toastMessage }}
  </div>
</template>

<script>
import QuizQuestion from "@/components/QuizQuestion.vue";

export default {
  name: "QuizRunner",
  components: { QuizQuestion },
  data() {
    return {
      quizOptions: {},
      questions: [],
      currentIndex: 0,
      timeLeft: 0,
      timerInterval: null,
      toastMessage: "",
      showToast: false,
      answeredQuestions: [],
    };
  },
  created() {
    const query = this.$route.query;
    this.quizOptions = {
      mode: query.mode,
      set: query.set,
      timeEnabled: query.timeEnabled === "true",
      timeLimit: parseInt(query.timeLimit),
      lockedNav: query.lockedNav === "true",
      questionCount: parseInt(query.questionCount),
      reviewMode: query.reviewMode === "true"
    };

    this.loadQuestions();

    if (this.quizOptions.timeEnabled) {
      this.timeLeft = this.quizOptions.timeLimit * 60;
      this.startTimer();
    }
  },
  methods: {
    loadQuestions() {
      const mcqQuestions = [
        {
          questionNo: 1,
          text: "What is the capital of Japan?",
          correctAnswer: "Tokyo",
          options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"]
        },
        {
          questionNo: 2,
          text: "Which gas do plants absorb from the atmosphere?",
          correctAnswer: "Carbon Dioxide",
          options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"]
        },
        {
          questionNo: 3,
          text: "What is the largest mammal on Earth?",
          correctAnswer: "Blue Whale",
          options: ["Elephant", "Blue Whale", "Giraffe", "Shark"]
        },
        {
          questionNo: 4,
          text: "Which continent is the Sahara Desert located in?",
          correctAnswer: "Africa",
          options: ["Asia", "Africa", "Australia", "North America"]
        },

      ];

      const trueFalseQuestions = [
        {
          questionNo: 1,
          text: "The Great Wall of China is visible from space.",
          correctAnswer: "False",
          options: ["True", "False"]
        },
        {
          questionNo: 2,
          text: "Sound travels faster in water than in air.",
          correctAnswer: "True",
          options: ["True", "False"]
        },
        {
          questionNo: 3,
          text: "The human body has four lungs.",
          correctAnswer: "False",
          options: ["True", "False"]
        },
        {
          questionNo: 4,
          text: "Lightning never strikes the same place twice.",
          correctAnswer: "False",
          options: ["True", "False"]
        }
      ];

      const oneWordQuestions = [
        {
          questionNo: 1,
          text: "One-word: What planet is known as the Red Planet?",
          correctAnswer: "Mars",
          options: []
        },
        {
          questionNo: 2,
          text: "One-word: Chemical symbol for Gold?",
          correctAnswer: "Au",
          options: []
        },
        {
          questionNo: 3,
          text: "One-word: First element on the periodic table?",
          correctAnswer: "Hydrogen",
          options: []
        },
        {
          questionNo: 4,
          text: "One-word: Author of 'Romeo and Juliet'?",
          correctAnswer: "Shakespeare",
          options: []
        }
      ];

      const mode = this.quizOptions.mode;

      if (mode === "Multiple Choice") {
        this.questions = mcqQuestions.slice(0, this.quizOptions.questionCount);
      } else if (mode === "True/False") {
        this.questions = trueFalseQuestions.slice(0, this.quizOptions.questionCount);
      } else if (mode === "One-word") {
        this.questions = oneWordQuestions.slice(0, this.quizOptions.questionCount);
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;

          const half = (this.quizOptions.timeLimit * 60) / 2;
          if (this.timeLeft === half) {
            this.triggerToast("Halfway through!");
          }

          if (this.timeLeft === 60) {
            this.triggerToast("Only 1 minute left!");
          }

        } else {
          clearInterval(this.timerInterval);
          this.triggerToast("Time's up!");
          this.submitQuiz();
        }
      }, 1000);
    },
    triggerToast(message) {
      this.toastMessage = message;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
        this.toastMessage = "";
      }, 4000);
    },
    handleAnswer() {
      this.currentIndex++;
    },
    submitQuiz() {
      this.toastMessage("Quiz submitted!");
    },
    markAnswered(index) {
      if (!this.answeredQuestions.includes(index)) {
        this.answeredQuestions.push(index);
      }
    },
    scrollToQuestion(index) {
      const el = this.$refs['question-' + index]?.[0];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  },
  computed: {
    navHeightStyle() {
      if (this.questions.length <= 10) {
        const height = this.questions.length * 40 + (this.questions.length - 1) * 10;
        return { maxHeight: `${height}px` };
      }
      return { maxHeight: '460px' };
    },
    timeProgress() {
      if (!this.quizOptions.timeEnabled) return 100;
      return (this.timeLeft / (this.quizOptions.timeLimit * 60)) * 100;
    },
    formattedTime() {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      return `${min}:${sec < 10 ? "0" + sec : sec}`;
    }
  }
};
</script>

<style scoped>
.quiz-runner {
  padding: 30px;
  font-family: 'Outfit', sans-serif;
  color: white;
}
.timer-bar {
  position: relative;
  height: 24px;
  background: #121729;
  border-radius: 10px;
  margin: 20px 0;
  overflow: hidden;
  border: 1px solid #4caf50;
}

.timer-bar .progress {
  height: 100%;
  background: #4caf50;
  border-right: 2px solid #4caf50;
  transition: width 1s linear;
  border-radius: 10px 0 0 10px;
}


.timer-bar .time-label {
  position: absolute;
  width: 100%;
  text-align: center;
  color: white;
  top: 0;
  line-height: 24px;
  font-weight: bold;
}
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  min-width: 260px;
  max-width: 320px;
  background: linear-gradient(135deg, #1f2434, #2b3146);
  color: #ffffff;
  padding: 16px 20px;
  border-left: 6px solid #5f98ef;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  font-family: "Outfit", sans-serif;
  font-size: 18px;
  font-weight: 500;
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 12px;

  animation: slideIn 0.5s ease, fadeOut 0.5s ease 3.5s;
  transition: all 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
.quiz-container {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.question-nav {
  position: sticky;
  top: 100px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-rows: 40px;
  grid-template-rows: repeat(10, 40px);
  gap: 10px;
  background: #1e2238;
  padding: 16px 10px;
  border-radius: 12px;
  width: fit-content;
}


.nav-number {
  background: #2c2f4a;
  color: white;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.nav-number.answered {
  background: #5f98ef;
  color: white;
}

.questions-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.question-wrapper {
  scroll-margin-top: 100px;
}

.submit-button {
  margin-top: 30px;
  padding: 12px 20px;
  background: #5f98ef;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  align-self: flex-end;
  cursor: pointer;
}

</style>
