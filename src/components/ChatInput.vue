<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <input
          type="text"
          v-model="messageText"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          class="message-input"
          :disabled="isDisabled"
      />

      <button
          @click="sendMessage"
          class="send-btn"
          :disabled="!messageText.trim() || isDisabled"
          title="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Define props
const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false
  }
})

// Define emits
const emit = defineEmits([
  'send-message'
])

const messageText = ref('')

const sendMessage = () => {
  const trimmedMessage = messageText.value.trim()
  if (trimmedMessage) {
    emit('send-message', trimmedMessage)
    messageText.value = ''
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

.chat-input-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.input-wrapper {
  display: flex;
  flex-grow: 1;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 4px 0 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.input-wrapper:focus-within {
  background-color: #f8f8f8;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.2);
}

.message-input {
  flex-grow: 1;
  height: 36px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
  color: #333;
  padding: 0;
}

.message-input::placeholder {
  color: #aaa;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 0;
}

.send-btn:hover:not(:disabled) {
  background-color: #0069d9;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.send-btn svg {
  transition: transform 0.2s ease;
}

.send-btn:active:not(:disabled) svg {
  transform: scale(0.9);
}
</style>