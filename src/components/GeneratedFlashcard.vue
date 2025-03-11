<template>
  <div class="flashcard">
    <div class="number-container" @mouseover="showEdit = true" @mouseleave="showEdit = false">
      <span v-if="!showEdit" class="number">{{ number }}</span>
      <button v-if="showEdit" class="edit-button" @click="$emit('edit', number)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
          <path d="M3 17.25V21h3.75l11.02-11.02-3.75-3.75L3 17.25zM21.71 4.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
    </div>

    <div class="question-container">
      <h2 class="question">{{ question }}</h2>
      <div class="divider"></div>
    </div>

    <p class="answer">{{ answer }}</p>

    <div class="action-buttons">
      <button v-if="!isApproved" class="approve" @click="toggleApproval(true)">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M9 19l-5-5 1.41-1.41L9 16.17l9.59-9.59L20 8l-11 11z"/>
        </svg>
      </button>

      <button v-if="isApproved" class="reject" @click="toggleApproval(false)">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M6 6l12 12M18 6l-12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Flashcard",
  props: {
    number: Number,
    question: String,
    answer: String,
  },
  data() {
    return {
      showEdit: false,
      isApproved: false,
    };
  },
  methods: {
    toggleApproval(status) {
      this.isApproved = status;
      this.$emit(status ? "approve" : "reject", this.number);
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

.flashcard {
  position: relative;
  width: 874px;
  height: 200px;
  background-color: #1b2233;
  border-radius: 20px;
  padding: 20px;
  color: white;
  font-family: "Outfit", sans-serif;
  overflow: hidden;
}

.number-container {
  position: absolute;
  top: 0;
  left: 0;
  background: #5f98ef;
  border-radius: 20px 0 20px 0;
  display: flex;
  align-items: center;
  transition: background 0.3s ease-in-out;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

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

.number-container:hover .number {
  display: none;
}

.number-container:hover .edit-button {
  opacity: 1;
}

.question-container {
  text-align: left;

  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.question {
  margin-left: 70px;
  max-height: 80px;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: left;
}

.divider {
  width: 100%;
  height: 2px;
  background-color: #ffffff40;
  align-self: center;
  margin: 10px 0;
}

.answer {
  margin-top: 10px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 18px;
  line-height: 1.5;
  text-align: left;
}

.action-buttons {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
}

button {
  border: none;
  cursor: pointer;
  width: 76px;
  height: 53px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.approve {
  background: #5cb85c;
  border-radius: 20px 0 20px 0px;
}

.reject {
  background: #d9534f;
  border-radius: 20px 0 20px 0px;
}
</style>
