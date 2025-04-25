<template>
  <div v-if="isVisible" class="typing-indicator">
    <span class="typing-text">Moneta is thinking<span class="dots">{{ dots }}</span></span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const dots = ref('');
let intervalId = null;

const animateDots = () => {
  if (dots.value.length >= 3) {
    dots.value = '';
  } else {
    dots.value += '.';
  }
};

watch(() => props.isVisible, (visible) => {
  if (visible && !intervalId) {
    intervalId = setInterval(animateDots, 500);
  } else if (!visible && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

onMounted(() => {
  if (props.isVisible) {
    intervalId = setInterval(animateDots, 500);
  }
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  font-size: 14px;
  color: #72767d;
  font-family: "Outfit", sans-serif;
  text-align: left;
}

.typing-text {
  display: flex;
  align-items: center;
}

.dots {
  display: inline-block;
  min-width: 18px;
}
</style>