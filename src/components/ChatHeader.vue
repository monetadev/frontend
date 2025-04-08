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
          class="minimize-btn"
          @click="$emit('minimize')"
          title="Minimize"
      >
        &minus;
      </button>
      <button
          ref="clearBtn"
          class="clear-btn"
          @mousedown="startClearTimer"
          @mouseup="cancelClearTimer"
          @mouseleave="cancelClearTimer"
          :class="{ 'clearing': isClearingActive }"
          title="Hold to clear chat"
      >
        Clear
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
const clearProgress = ref(0);
const clearBtn = ref(null);

const startClearTimer = () => {
  isClearingActive.value = true;
  clearProgress.value = 0;

  clearTimer.value = setTimeout(() => {
    emit('clear');
    isClearingActive.value = false;
  }, 3000); // 3 seconds hold or change to what u want
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
  padding: 10px 15px;
  background-color: #f0f0f0;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 1px solid #e0e0e0;
  font-family: "Outfit", sans-serif;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-header-actions {
  display: flex;
  gap: 10px;
}

.minimize-btn,
.clear-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  padding: 2px 8px;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.minimize-btn:hover,
.clear-btn:hover {
  color: #333;
  background-color: #e0e0e0;
}

.clear-btn {
  position: relative;
  overflow: hidden;
}

.clear-btn.clearing {
  background-color: #ff6b6b;
  color: white;
}

.clear-btn.clearing::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: clear-progress 3s linear forwards;
}

@keyframes clear-progress {
  0% { width: 0%; }
  100% { width: 100%; }
}
</style>