<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
    <div class="modal-content">
      <h2>Edit Flashcard</h2>
      <div class="modal-body">
        <label for="question">Question</label>
        <textarea id="question" v-model="editedQuestion" class="input-field" placeholder="Enter question..."></textarea>

        <label for="answer">Answer</label>
        <textarea id="answer" v-model="editedAnswer" class="input-field" placeholder="Enter answer..."></textarea>
      </div>

      <div class="modal-actions">
        <div class="button-group">
          <button class="rephrase-button" @click="rephraseAnswer" aria-label="Rephrase">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <g id="icomoon-ignore">
                <line fill="#FFFFFF" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"/>
              </g>
              <path fill="#FFFFFF" d="M44.919,80.563c-0.828,0-1.5-0.672-1.5-1.5c0-0.826,0.672-1.5,1.5-1.5c17.667,0,32.04-14.607,32.04-32.563
	c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5C79.962,64.611,64.242,80.563,44.919,80.563z"/>
              <path fill="#FFFFFF" d="M11.379,46.5c-0.828,0-1.5-0.672-1.5-1.5c0-19.608,15.72-35.562,35.043-35.562c0.828,0,1.5,0.672,1.5,1.5
	s-0.672,1.5-1.5,1.5c-17.67,0-32.043,14.607-32.043,32.562C12.879,45.828,12.207,46.5,11.379,46.5z"/>
              <path fill="#FFFFFF" d="M44.919,55.875c-5.997,0-10.875-4.878-10.875-10.875s4.878-10.875,10.875-10.875
	c6,0,10.875,4.878,10.875,10.875S50.919,55.875,44.919,55.875z M44.919,37.125c-4.344,0-7.875,3.534-7.875,7.875
	s3.531,7.875,7.875,7.875c4.347,0,7.875-3.534,7.875-7.875S49.266,37.125,44.919,37.125z"/>
              <path fill="#FFFFFF" d="M87.559,52.227c-0.276,0-0.553-0.071-0.802-0.233l-8.45-5.316l-9.285,3.688
	c-0.771,0.306-1.642-0.069-1.947-0.837c-0.307-0.774,0.068-1.642,0.84-1.947l9.993-3.966c0.444-0.177,0.948-0.129,1.353,0.126
	l9.096,5.729c0.699,0.438,0.912,1.365,0.465,2.064C88.542,51.979,88.057,52.227,87.559,52.227z"/>
              <path fill="#FFFFFF" d="M11.379,46.5c-0.294,0-0.585-0.084-0.834-0.252l-8.937-5.976c-0.687-0.459-0.873-1.392-0.414-2.079
	s1.392-0.876,2.079-0.414l8.304,5.553l9.381-3.432c0.777-0.282,1.641,0.114,1.926,0.894c0.285,0.78-0.117,1.641-0.894,1.926
	l-10.098,3.69C11.724,46.471,11.553,46.5,11.379,46.5z"/>
            </svg>
          </button>
          <button class="save-button" @click="saveChanges" aria-label="Save">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <g id="icomoon-ignore">
                <line fill="#FFFFFF" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"/>
              </g>
              <path fill="#FFFFFF" d="M88.5,90h-87C0.672,90,0,89.325,0,88.5v-87C0,0.672,0.672,0,1.5,0h73.982c0.436,0,0.847,0.189,1.131,0.516
	l13.018,15C89.868,15.789,90,16.14,90,16.5v72C90,89.325,89.325,90,88.5,90z M3,87h84V17.061L74.802,3H3V87z"/>
              <path fill="#FFFFFF" d="M70.5,33h-48c-0.828,0-1.5-0.672-1.5-1.5v-30C21,0.672,21.672,0,22.5,0h48C71.325,0,72,0.672,72,1.5v30
	C72,32.328,71.325,33,70.5,33z M24,30h45V3H24V30z"/>
              <path fill="#FFFFFF" d="M58.5,27h-18c-0.828,0-1.5-0.672-1.5-1.5v-24C39,0.672,39.672,0,40.5,0h18C59.325,0,60,0.672,60,1.5v24
	C60,26.328,59.325,27,58.5,27z M42,24h15V3H42V24z"/>
              <path fill="#FFFFFF" d="M70.5,90h-48c-0.828,0-1.5-0.675-1.5-1.5v-30c0-0.825,0.672-1.5,1.5-1.5h48c0.825,0,1.5,0.675,1.5,1.5v30
	C72,89.325,71.325,90,70.5,90z M24,87h45V60H24V87z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EditFlashcardModal",
  props: {
    isOpen: Boolean,
    question: String,
    answer: String,
  },
  data() {
    return {
      editedQuestion: this.question,
      editedAnswer: this.answer,
    };
  },
  watch: {
    question(newVal) {
      this.editedQuestion = newVal;
    },
    answer(newVal) {
      this.editedAnswer = newVal;
    }
  },
  methods: {
    saveChanges() {
      this.$emit("save", {
        question: this.editedQuestion,
        answer: this.editedAnswer,
      });
    },
    closeModal() {
      this.$emit("close");
    },
    rephraseAnswer() {
      // backend
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease-in-out;
  z-index: 1000;
}

.modal-content {
  background: #1E1E2F;
  padding: 25px;
  border-radius: 12px;
  width: 600px;
  color: white;
  font-family: "Outfit", sans-serif;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-in-out;
}

h2 {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
}

.input-field {
  width: 100%;
  height: 80px;
  background: #2C2C3E;
  border: 1px solid transparent;
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  resize: none;
  outline: none;
  transition: border-color 0.3s;
  font-family: "Outfit", sans-serif;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #5F98EF;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  width: 100%;
}

.button-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.rephrase-button, .save-button {
  background: #5F98EF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
}

.rephrase-button:hover, .save-button:hover {
  background: #3A6BCB;
}
</style>