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
  background-color: #121729;
  border-top: 1px solid #2a335a;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.input-wrapper {
  display: flex;
  flex-grow: 1;
  background-color: #1a2233;
  border-radius: 18px;
  padding: 0 4px 0 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.input-wrapper:focus-within {
  background-color: #202942;
  box-shadow: 0 1px 3px rgba(95, 152, 239, 0.3);
}

.message-input {
  flex-grow: 1;
  height: 36px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
  color: white;
  padding: 0;
}

.message-input::placeholder {
  color: #9aa1b3;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #5F98EF;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 0;
}

.send-btn:hover:not(:disabled) {
  background-color: #4a7dd6;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #2a335a;
  color: #9aa1b3;
  cursor: not-allowed;
}

.send-btn svg {
  transition: transform 0.2s ease;
}

.send-btn:active:not(:disabled) svg {
  transform: scale(0.9);
}
</style>