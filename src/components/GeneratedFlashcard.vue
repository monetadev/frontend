<template>
  <div class="flashcard">
    <div class="number-container" @mouseover="showEdit = true" @mouseleave="showEdit = false">
      <span v-if="!showEdit" class="number">{{ number }}</span>
      <button v-if="showEdit" class="edit-button" @click="openEditModal">
        <svg viewBox="0 0 90 90" width="30" height="30" fill="white">
          <g id="icomoon-ignore">
            <line fill="#FFFFFF" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"/>
          </g>
          <path fill="#FFFFFF" d="M17.304,59.457c-0.135,0.135-0.249,0.291-0.336,0.459L5.412,82.08c-0.378,0.727-0.243,1.611,0.336,2.193
	c0.36,0.356,0.84,0.549,1.326,0.549c0.294,0,0.594-0.066,0.87-0.213l22.158-11.56c0.168-0.084,0.321-0.2,0.459-0.336l3.099-3.099
	L20.403,56.361L17.304,59.457z"/>
          <path fill="#FFFFFF" d="M82.563,7.452c-3.539-3.546-10.4-2.865-14.696,1.437l-5.043,5.04l-3.978-3.978
	C58.494,9.6,58.02,9.402,57.521,9.402s-0.975,0.195-1.322,0.549L33.657,32.493c-0.732,0.732-0.732,1.92,0,2.652
	c0.366,0.366,0.846,0.552,1.326,0.552s0.96-0.187,1.323-0.552l21.209-21.213l2.655,2.655L23.046,53.712l13.257,13.254l37.128-37.119
	c0.731,0.732,1.571,0.732,2.307,0c0.734-0.732-0.348-1.917-0.348-2.649v-0.006l5.385-5.043C85.23,17.697,86.221,11.115,82.563,7.452
	z"/>
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


    <EditFlashcardModal
        :isOpen="isEditModalOpen"
        :question="question"
        :answer="answer"
        @save="updateFlashcard"
        @close="isEditModalOpen = false"
    />
  </div>
</template>

<script>
import EditFlashcardModal from './EditFlashcardModal.vue';

export default {
  name: "Flashcard",
  components: {
    EditFlashcardModal
  },
  props: {
    number: Number,
    question: String,
    answer: String,
  },
  data() {
    return {
      showEdit: false,
      isApproved: false,
      isEditModalOpen: false
    };
  },
  methods: {
    toggleApproval(status) {
      this.isApproved = status;
      this.$emit(status ? "approve" : "reject", this.number);
    },
    openEditModal() {
      this.isEditModalOpen = true;
    },
    updateFlashcard(updatedData) {
      this.$emit("update", { number: this.number, ...updatedData });
      this.isEditModalOpen = false;
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
  background: #6B9B4F;
  border-radius: 20px 0 20px 0px;
}

.reject {
  background: #CD5951;
  border-radius: 20px 0 20px 0px;
}
</style>
