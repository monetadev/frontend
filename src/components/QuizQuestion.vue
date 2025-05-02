<template>
  <div class="question-box">

    <div class="number-container">
      <span class="question-number-text">
        {{ questionNumber }}
      </span>
    </div>

    <p class="question-text" >{{ question.text }}</p>

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
            :disabled="reviewMode && answered"
            @change="checkAnswer(opt)"
        />
        <span class="custom-radio"></span>
        {{ opt }}
      </label>
    </div>


    <div v-else-if="mode === 'One-word'">
      <div class="short-answer-container">
        <input
            type="text"
            v-model="userAnswer"
            :disabled="reviewMode && answered"
            placeholder="Type your answer..."
            class="short-answer-input"
        />
        <button :disabled="answered" @click="checkAnswer(userAnswer)">Submit</button>
      </div>
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
    reviewMode: Boolean,
    questionNumber: Number,
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
      this.userAnswer = answer;

      if (this.reviewMode) {
        this.answered = true;
        this.isCorrect = answer.toLowerCase() === this.question.correctAnswer.toLowerCase();
        this.$emit("answered");
      } else {
        this.$emit("answered");
      }

    }
  }
};
</script>

<style scoped>
.question-box {
  position: relative;
  margin-bottom: 30px;
  padding: 40px 20px 20px 20px;
  background: #2c2f4a;
  border-radius: 20px;
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

.number-container {
  position: absolute;
  top: 0;
  left: 0;
  background: #5f98ef;
  width: 76px;
  height: 53px;
  border-radius: 20px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.3s ease-in-out;
}

.question-number-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
}
.question-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
  line-height: 1.6;
  padding-top: 20px;
}
.short-answer-container {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.short-answer-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  background-color: #1e2238;
  border: 2px solid transparent;
  color: white;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;
}

.short-answer-input:focus {
  border-color: #5f98ef;
}

button {
  background-color: #5f98ef;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #4a82c8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>