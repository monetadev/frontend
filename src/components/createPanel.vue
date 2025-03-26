<template>
  <div class="createPanel">
    <div class="header">
      <div class="left-section">
        <span class="number">{{ number }}</span>
      </div>
      <div class="delete-section" @click="$emit('delete-panel', number)">
        <span class="delete-icon">×</span>
      </div>
    </div>
    <hr class="divider">
    
    <div class="content">
      <div class="flashcard-content">
        <div class="term-section">
          <div class="form__group field">
            <input 
              type="input" 
              class="form__field" 
              placeholder="Term" 
              required="" 
              v-model="flashcard.term"
              @input="updateFlashcard"
            >
            <label for="term" class="form__label">Term</label>
          </div>
        </div>
        <div class="definition-section">
          <div class="form__group field">
            <input 
              type="input" 
              class="form__field" 
              placeholder="Definition" 
              required="" 
              v-model="flashcard.definition"
              @input="updateFlashcard"
            >
            <label for="definition" class="form__label">Definition</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "createPanel",
  props: {
    number: {
      type: Number,
      required: true
    },
    id: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      flashcard: {
        term: '',
        definition: '',
        position: this.number || 1
      }
    };
  },
  methods: {
    updateFlashcard() {
      // Update position in case number prop changed
      this.flashcard.position = this.number || 1;
      this.$emit('update-flashcard', {
        term: this.flashcard.term,
        definition: this.flashcard.definition,
        position: this.flashcard.position
      });
    }
  }
};
</script>
  
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");

.createPanel {
  position: relative;
  width: 90%;
  height: auto;
  min-height: 120px;
  background-color: #1b2233;
  border-radius: 20px;
  padding: 20px;
  color: white;
  font-family: "Outfit", sans-serif;
  margin-bottom: 15px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.left-section {
  display: flex;
  align-items: center;
}

.number {
  font-size: 16px;
  font-weight: 500;
  color: #b8c4e0;
  background-color: #1b2233;
}

.delete-section {
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
  user-select: none;
}

.delete-icon {
  font-size: 24px;
  color: #ff4d4d;
  transition: color 0.2s ease;
}

.delete-icon:hover {
  color: #ff1a1a;
}

.divider {
  width: 100%;
  border: none;
  height: 1px;
  background-color: #3a4257;
  margin: 0 0 15px 0;
}
  
  .content {
    padding: 10px 0;
  }
  
  .flashcard-content {
    display: flex;
    flex-direction: row;
    gap: 30px;
    margin-top: 10px;
  }
  
  .term-section {
    flex: 1.3;
  }
  
  .definition-section {
    flex: 1.5;
  }
  
  /* Floating label form styles */
  .form__group {
    position: relative;
    padding: 20px 0 0;
    width: 100%;
  }
  
  .term-section .form__group {
    max-width: 100%;
  }
  
  .definition-section .form__group {
    max-width: 100%;
  }
  
  .form__field {
    font-family: inherit;
    width: 100%;
    border: none;
    border-bottom: 2px solid #9b9b9b;
    outline: 0;
    font-size: 17px;
    color: #fff;
    padding: 7px 0;
    background: transparent;
    transition: border-color 0.2s;
    height: 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .form__field::placeholder {
    color: transparent;
  }
  
  .form__field:placeholder-shown ~ .form__label {
    font-size: 17px;
    cursor: text;
    top: 20px;
  }
  
  .form__label {
    position: absolute;
    top: 0;
    display: block;
    transition: 0.2s;
    font-size: 17px;
    color: #9b9b9b;
    pointer-events: none;
  }
  
  .form__field:focus {
    padding-bottom: 6px;
    font-weight: 700;
    border-width: 3px;
    border-image: linear-gradient(to right, #116399, #ffffff);
    border-image-slice: 1;
  }
  
  .form__field:focus ~ .form__label {
    position: absolute;
    top: 0;
    display: block;
    transition: 0.2s;
    font-size: 17px;
    color: #ffffff;
    font-weight: 700;
  }
  
  /* reset input */
  .form__field:required, .form__field:invalid {
    box-shadow: none;
  }
  </style>