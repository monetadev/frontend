
<template>
  <div class="flashcard" @click="flip">
    <div class="flashcard-inner" :class="{ 'flipped': isFlipped }">
      <div class="flashcard-front">
        <div class="content">{{ term }}</div>
      </div>
      <div class="flashcard-back">
        <div class="content">{{ definition }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlashCard',
  props: {
    term: {
      type: String,
      default: ''
    },
    definition: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFlipped: false
    }
  },
  methods: {
    // Keep original method for click handling
    flip() {
      this.isFlipped = !this.isFlipped;
    },

    // Add this method to match what the parent component is trying to call
    flipCard() {
      this.flip();
    }
  },
  watch: {
    term() {
      this.isFlipped = false;
    }
  }
};
</script>

<style scoped>
.flashcard {
  perspective: 1000px;
  width: 1071px;
  height: 584.44px;
  margin: auto;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flashcard-inner.flipped {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 50px;
  border: 1px solid #000;
  background: var(--Black, #121729);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.content {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Outfit', sans-serif;
}

.flashcard-back {
  transform: rotateY(180deg);
}
</style>