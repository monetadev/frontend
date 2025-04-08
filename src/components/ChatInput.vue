<template>
  <div class="chat-input-container">
    <div class="input-actions">

      <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
      >
    </div>

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
      >
        ➤
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
const fileInput = ref(null)

const sendMessage = () => {
  const trimmedMessage = messageText.value.trim()
  if (trimmedMessage) {
    emit('send-message', trimmedMessage)
    messageText.value = ''
  }
}

</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.input-actions {
  margin-right: 10px;
}

.attachment-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.attachment-btn:hover {
  opacity: 1;
}

.input-wrapper {
  display: flex;
  flex-grow: 1;
}

.message-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px 0 0 20px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #007bff;
}

.send-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>