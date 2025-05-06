<template>
  <div class="flashcard" @click="flip">
    <div class="flashcard-inner" :class="{ 'flipped': isFlipped }">
      <div class="flashcard-face flashcard-front">
        <div class="content">{{ term }}</div>
      </div>
      <div class="flashcard-face flashcard-back">
        <div class="content">{{ definition }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';

// Define props using Composition API
const props = defineProps({
  term: {
    type: String,
    default: ''
  },
  definition: {
    type: String,
    default: ''
  }
});

// State for flip status
const isFlipped = ref(false);

// Method to flip the card
function flip() {
  isFlipped.value = !isFlipped.value;
}

// Watch for term changes to reset the flip state
watch(() => props.term, () => {
  isFlipped.value = false;
});

// Expose the flip method and isFlipped state if needed by parent via template refs
// (though direct manipulation from parent is less ideal than emitting events)
defineExpose({
  flip,
  isFlipped // Expose reactive state directly
});

</script>

<style scoped>
.flashcard {
  perspective: 1500px; /* Increased perspective for smoother effect */
  width: 1071px;
  height: 584.44px;
  margin: auto;
  cursor: pointer;
  border-radius: 20px; /* Match face radius for consistent look */
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
  transform-style: preserve-3d;
  border-radius: 20px; /* Ensure inner also has radius */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Softer, more spread shadow */
}

.flashcard-inner.flipped {
  transform: rotateY(180deg);
}

.flashcard-face { /* Common styles for front and back */
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* Critical for flip effect */
  border-radius: 20px; /* Consistent, slightly smaller radius */
  /* Elegant Background: Light grey or off-white */
  background-color: #1b2233; /* Light grey */
  /* background: linear-gradient(145deg, #ffffff, #e6e6e6); */ /* Optional subtle gradient */
  border: 1px solid #22293A; /* Light border */
  display: flex; /* Use flex to center content */
  align-items: center;
  justify-content: center;
  padding: 30px; /* Generous padding */
  box-sizing: border-box;
  overflow: hidden; /* Prevent content spill */
}

.content {
  /* Elegant Text: Dark grey, slightly larger, readable font */
  color: #f2f4f8; /* Dark grey */
  font-size: 2.2rem; /* Adjust size as needed */
  font-weight: 500; /* Slightly bolder */
  line-height: 1.4; /* Improve readability */
  font-family: 'Outfit', sans-serif; /* Keep specified font */
  max-width: 100%; /* Ensure content respects padding */
  /* Add handling for potentially long text */
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

.flashcard-back {
  /* Backface specific styles (mainly transform) */
  transform: rotateY(180deg);
}
</style>