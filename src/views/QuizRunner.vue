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
      const dummy = Array.from({ length: this.quizOptions.questionCount }).map((_, i) => ({
        text: `Question ${i + 1}`,
        correctAnswer: "Answer",
        options: ["Answer", "Wrong 1", "Wrong 2", "Wrong 3"]
      }));

      this.questions = dummy;
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
