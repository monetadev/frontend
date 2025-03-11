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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 1l4 4-4 4"/>
              <path d="M3 11v-1a4 4 0 014-4h14"/>
              <path d="M7 23l-4-4 4-4"/>
              <path d="M21 13v1a4 4 0 01-4 4H3"/>
            </svg>
          </button>
          <button class="save-button" @click="saveChanges" aria-label="Save">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h9l7 7v9a2 2 0 01-2 2z"/>
              <path d="M17 21v-8H7v8"/>
              <path d="M7 3v5h8"/>
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
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.rephrase-button:hover, .save-button:hover {
  background: #3A6BCB;
}
</style>