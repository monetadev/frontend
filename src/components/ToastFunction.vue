<template>
  <div class="toast-container">
    <div
        v-for="(toast, index) in toasts"
        :key="index"
        class="toast"
        :class="toast.type"
    >
      <div class="toast-left">
        <div class="icon">{{ iconMap[toast.type] }}</div>
        <div class="message">
          <strong class="toast-title">{{ toast.type.toUpperCase() }}:</strong>
          <span class="toast-msg">{{ toast.msg }}</span>
        </div>
      </div>

      <button class="close" @click="removeToast(index)">×</button>
      <div class="progress-bar" :class="toast.type" />
    </div>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import eventBus from '../eventBus'

const toasts = ref([])

const iconMap = {
  success: '✔️',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

eventBus.on('toast', ({ msg, type = 'info', duration = 3000 }) => {
  const toast = { msg, type }
  toasts.value.push(toast)

  setTimeout(() => {
    toasts.value.shift()
  }, duration)
})

function removeToast(index) {
  toasts.value.splice(index, 1)
}
</script>

<style scoped>


@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
  font-family: 'Outfit', sans-serif;
}

.toast {
  display: flex;
  justify-content: space-between; /* Space between message and close button */
  align-items: center;
  background: #fff;
  color: #333;
  padding: 16px 20px;
  border-left: 6px solid;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 16px;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

.toast-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.icon {
  font-size: 22px;
  margin-right: 6px;
  flex-shrink: 0;
}

.message {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 6px;
  line-height: 1.4;
}

.toast-title {
  font-weight: 700;
}

.toast-msg {
  font-weight: 400;
}

.close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  margin-left: 16px;
  flex-shrink: 0;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  animation: shrink 3s linear forwards;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Type Styles */
.success {
  border-color: #4caf50;
}

.success .progress-bar {
  background: #4caf50;
}

.error {
  border-color: #f44336;
}

.error .progress-bar {
  background: #f44336;
}

.warning {
  border-color: #ff9800;
}

.warning .progress-bar {
  background: #ff9800;
}

.info {
  border-color: #2196f3;
}

.info .progress-bar {
  background: #2196f3;
}
</style>
