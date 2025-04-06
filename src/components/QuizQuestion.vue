<template>
  <div class="question-box">
    <p>{{ question.text }}</p>

    <div v-if="mode === 'Multiple Choice'">
      <button
          v-for="(opt, index) in question.options"
          :key="index"
          :disabled="answered"
          @click="checkAnswer(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <div v-else-if="mode === 'True/False'">
      <button :disabled="answered" @click="checkAnswer('True')">True</button>
      <button :disabled="answered" @click="checkAnswer('False')">False</button>
    </div>

    <div v-else-if="mode === 'One-word'">
      <input type="text" v-model="userAnswer" :disabled="answered" />
      <button :disabled="answered" @click="checkAnswer(userAnswer)">Submit</button>
    </div>

    <p v-if="answered && reviewMode">
      <strong>{{ isCorrect ? 'Correct!' : 'Wrong!' }}</strong>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    question: Object,
    mode: String,
    reviewMode: Boolean
  },
  data() {
    return {
      userAnswer: "",
      answered: false,
      isCorrect: false
    };
  },
  methods: {
    checkAnswer(answer) {
      this.answered = true;
      this.isCorrect = answer.toLowerCase() === this.question.correctAnswer.toLowerCase();
      this.$emit("answered");
    }
  }
};
</script>

<style scoped>
.question-box {
  margin-bottom: 30px;
  padding: 20px;
  background: #2c2f4a;
  border-radius: 10px;
}
.question-box button {
  margin-right: 10px;
  margin-top: 10px;
}
</style>
