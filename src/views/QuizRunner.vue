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
              @answered="handleAnswer"
          />
        </div>
        <div v-else>
          <h3>Quiz Completed!</h3>
        </div>
      </div>

      <div v-else>
        <QuizQuestion
            v-for="(q, i) in questions"
            :key="i"
            :question="q"
            :mode="quizOptions.mode"
            :reviewMode="quizOptions.reviewMode"
        />
        <button @click="submitQuiz">Submit</button>
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
          text: "What is the capital of Japan?",
          correctAnswer: "Tokyo",
          options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"]
        },
        {
          text: "Which gas do plants absorb from the atmosphere?",
          correctAnswer: "Carbon Dioxide",
          options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"]
        },
        {
          text: "What is the largest mammal on Earth?",
          correctAnswer: "Blue Whale",
          options: ["Elephant", "Blue Whale", "Giraffe", "Shark"]
        },
        {
          text: "Which continent is the Sahara Desert located in?",
          correctAnswer: "Africa",
          options: ["Asia", "Africa", "Australia", "North America"]
        }
      ];

      const trueFalseQuestions = [
        {
          text: "The Great Wall of China is visible from space.",
          correctAnswer: "False",
          options: ["True", "False"]
        },
        {
          text: "Sound travels faster in water than in air.",
          correctAnswer: "True",
          options: ["True", "False"]
        },
        {
          text: "The human body has four lungs.",
          correctAnswer: "False",
          options: ["True", "False"]
        },
        {
          text: "Lightning never strikes the same place twice.",
          correctAnswer: "False",
          options: ["True", "False"]
        }
      ];

      const oneWordQuestions = [
        {
          text: "One-word: What planet is known as the Red Planet?",
          correctAnswer: "Mars",
          options: []
        },
        {
          text: "One-word: Chemical symbol for Gold?",
          correctAnswer: "Au",
          options: []
        },
        {
          text: "One-word: First element on the periodic table?",
          correctAnswer: "Hydrogen",
          options: []
        },
        {
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
    }
  },
  computed: {
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

</style>
