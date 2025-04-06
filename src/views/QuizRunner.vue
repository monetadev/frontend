<template>
  <div class="quiz-runner">
    <h2>Quiz Mode: {{ quizOptions.mode }}</h2>
    <p>Flashcard Set: {{ quizOptions.set }}</p>
    <p v-if="quizOptions.timeEnabled">Time Limit: {{ quizOptions.timeLimit }} min</p>
    <p>Locked Navigation: {{ quizOptions.lockedNav ? 'Yes' : 'No' }}</p>
    <p>Review Mode: {{ quizOptions.reviewMode ? 'Enabled' : 'Disabled' }}</p>

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
    handleAnswer() {
      this.currentIndex++;
    },
    submitQuiz() {
      alert("Quiz submitted!");
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
</style>
