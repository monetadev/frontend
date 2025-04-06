<template>
  <div class="question-box">
    <p>{{ question.text }}</p>

    <div v-if="mode === 'Multiple Choice' || mode === 'True/False'">
      <label
          v-for="(opt, index) in question.options"
          :key="index"
          class="radio-option"
      >
        <input
            type="radio"
            :value="opt"
            v-model="userAnswer"
            :disabled="answered"
            @change="checkAnswer(opt)"
        />
        <span class="custom-radio"></span>
        {{ opt }}
      </label>
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
.radio-option {
  display: flex;
  align-items: center;
  background: #1e2238;
  padding: 14px 18px;
  margin: 10px 0;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  color: white;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.radio-option input[type="radio"] {
  display: none;
}

.custom-radio {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  border: 2px solid #5f98ef;
  margin-right: 14px;
  position: relative;
  flex-shrink: 0;
}

input[type="radio"]:checked + .custom-radio {
  background-color: #5f98ef;
  border-color: #5f98ef;
}

input[type="radio"]:checked + .custom-radio::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.radio-option:hover {
  background: #1e2238;
}


</style>
