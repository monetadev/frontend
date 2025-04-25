<template>
  <div class="chat-header">
    <div class="chat-header-left">
      <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Chat Avatar"
          class="chat-avatar"
      />
      <h2 class="chat-title">{{ title }}</h2>
    </div>
    <div class="chat-header-actions">
      <button
          class="action-btn minimize-btn"
          @click="$emit('minimize')"
          title="Minimize"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button
          ref="clearBtn"
          class="action-btn clear-btn"
          @mousedown="startClearTimer"
          @mouseup="cancelClearTimer"
          @mouseleave="cancelClearTimer"
          :class="{ 'clearing': isClearingActive }"
          title="Hold to clear chat"
      >
        <div class="clear-bg-animation"></div>
        <svg class="clear-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    default: 'Chat Support'
  },
  avatarUrl: {
    type: String,
    default: null
  }
});

// Define emits for minimize and clear actions
const emit = defineEmits(['minimize', 'clear']);

// Clear button
const clearTimer = ref(null);
const isClearingActive = ref(false);
const clearBtn = ref(null);

const startClearTimer = () => {
  isClearingActive.value = true;

  clearTimer.value = setTimeout(() => {
    emit('clear');
    isClearingActive.value = false;
  }, 1500);
};

const cancelClearTimer = () => {
  if (clearTimer.value) {
    clearTimeout(clearTimer.value);
    clearTimer.value = null;
    isClearingActive.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 1px solid #eaeaea;
  font-family: "Outfit", sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  background-color: transparent;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.clear-btn {
  position: relative;
}

.clear-icon {
  position: relative;
  z-index: 2;
}

.clear-bg-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px; /* Start with a visible circle ~1/4 of the final size */
  height: 8px;
  background-color: #ff5757;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0; /* Still start invisible until clearing state is active */
  pointer-events: none;
}

@keyframes grow-bg {
  0% {
    width: 8px;
    height: 8px;
    opacity: 0.9; /* Start mostly visible */
  }
  100% {
    width: 32px;
    height: 32px;
    opacity: 1;
  }
}

.clearing .clear-bg-animation {
  animation: grow-bg 1.5s linear forwards;
  opacity: 1;
}

.clearing {
  color: white;
}
</style>