<template>
  <div class="quiz-runner">
    <h2>{{ quizOptions.mode }}</h2>
    <p>{{ quizOptions.set }}</p>

    <div v-if="quizOptions.timeEnabled" class="timer-bar">
      <div class="progress" :style="{ width: timeProgress + '%' }"></div>
      <span class="time-label">{{ formattedTime }}</span>
    </div>

    <div v-if="questions.length">
      <div v-if="quizOptions.lockedNav">
        <div v-if="currentIndex < questions.length">
          <QuizQuestion
              :key="currentIndex"
              :question="questions[currentIndex]"
              :mode="quizOptions.mode"
              :reviewMode="quizOptions.reviewMode"
              :questionNumber="questions[currentIndex].questionNo"
              @answered="handleAnswer"
          />
        </div>
        <div v-if="quizOptions.lockedNav && currentIndex < questions.length - 1" class="next-btn-wrapper">
          <button class="next-button" @click="goToNextQuestion">Next Question</button>
        </div>
        <div v-else>
          <button class="submit-button" @click="submitQuiz">Submit Quiz</button>
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
          "questionNo": 1,
          "text": "Who developed the theory of relativity?",
          "correctAnswer": "Albert Einstein",
          "options": [
            "Albert Einstein",
            "Isaac Newton",
            "Galileo Galilei",
            "Nikola Tesla"
          ]
        },
        {
          "questionNo": 2,
          "text": "What is the hardest natural substance on Earth?",
          "correctAnswer": "Diamond",
          "options": [
            "Gold",
            "Iron",
            "Diamond",
            "Quartz"
          ]
        },
        {
          "questionNo": 3,
          "text": "Which planet is known as the Red Planet?",
          "correctAnswer": "Mars",
          "options": [
            "Earth",
            "Mars",
            "Venus",
            "Jupiter"
          ]
        },
        {
          "questionNo": 4,
          "text": "How many continents are there?",
          "correctAnswer": "7",
          "options": [
            "5",
            "7",
            "8",
            "6"
          ]
        },
        {
          "questionNo": 5,
          "text": "What is the main language spoken in Brazil?",
          "correctAnswer": "Portuguese",
          "options": [
            "Portuguese",
            "French",
            "Spanish",
            "English"
          ]
        },
        {
          "questionNo": 6,
          "text": "What is the chemical symbol for water?",
          "correctAnswer": "H2O",
          "options": [
            "O2",
            "NaCl",
            "H2O",
            "CO2"
          ]
        },
        {
          "questionNo": 7,
          "text": "Who painted the Mona Lisa?",
          "correctAnswer": "Leonardo da Vinci",
          "options": [
            "Pablo Picasso",
            "Leonardo da Vinci",
            "Michelangelo",
            "Vincent Van Gogh"
          ]
        },
        {
          "questionNo": 8,
          "text": "Which animal is known as the 'King of the Jungle'?",
          "correctAnswer": "Lion",
          "options": [
            "Panther",
            "Elephant",
            "Lion",
            "Tiger"
          ]
        },
        {
          "questionNo": 9,
          "text": "What is the currency of Japan?",
          "correctAnswer": "Yen",
          "options": [
            "Won",
            "Yuan",
            "Dollar",
            "Yen"
          ]
        },
        {
          "questionNo": 10,
          "text": "What is the freezing point of water?",
          "correctAnswer": "0\u00b0C",
          "options": [
            "10\u00b0C",
            "-10\u00b0C",
            "100\u00b0C",
            "0\u00b0C"
          ]
        },
        {
          "questionNo": 11,
          "text": "What is the square root of 64?",
          "correctAnswer": "8",
          "options": [
            "7",
            "6",
            "8",
            "9"
          ]
        },
        {
          "questionNo": 12,
          "text": "In which country is the Great Pyramid of Giza located?",
          "correctAnswer": "Egypt",
          "options": [
            "China",
            "India",
            "Mexico",
            "Egypt"
          ]
        },
        {
          "questionNo": 13,
          "text": "What is the tallest mountain in the world?",
          "correctAnswer": "Mount Everest",
          "options": [
            "Lhotse",
            "K2",
            "Mount Everest",
            "Kangchenjunga"
          ]
        },
        {
          "questionNo": 14,
          "text": "How many legs does a spider have?",
          "correctAnswer": "8",
          "options": [
            "12",
            "10",
            "8",
            "6"
          ]
        }

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
          text: "What planet is known as the Red Planet?",
          correctAnswer: "Mars",
          options: []
        },
        {
          questionNo: 2,
          text: "Chemical symbol for Gold?",
          correctAnswer: "Au",
          options: []
        },
        {
          questionNo: 3,
          text: "First element on the periodic table?",
          correctAnswer: "Hydrogen",
          options: []
        },
        {
          questionNo: 4,
          text: "Author of 'Romeo and Juliet'?",
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
      if (!this.answeredQuestions.includes(this.currentIndex)) {
        this.answeredQuestions.push(this.currentIndex);
      }
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
    goToNextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
      }
    }

  },
  computed: {
    navHeightStyle() {
      if (this.questions.length <= 10) {
        const height = this.questions.length * 40 + (this.questions.length - 1) * 10;
        return { maxHeight: `${height}px` };
      }
      return { maxHeight: '490px' };
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
  background-color: #121729;
  padding: 30px;
  font-family: 'Outfit', sans-serif;
  color: white;
}
.timer-bar {
  position: sticky;
  top: 0;
  z-index: 999;
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
.next-btn-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.next-button {
  background-color: #5f98ef;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.next-button:hover {
  background-color: #4a82c8;
}

</style>