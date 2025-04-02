<template>
  <div class="chat-container">
    <div class="chat-launcher" @click="handleToggleChat">
      <span v-if="!chatService.isChatOpen.value">💬</span>
      <span v-else>×</span>
    </div>

    <div v-if="chatService.isChatOpen.value" class="chat-window" :class="{ 'minimized': isMinimized }">
      <ChatHeader
        :title="chatService.chatTitle"
        @minimize="handleMinimize"
        @clear="handleClearChat" 
      />

      <div class="message-list" ref="messageListElement">
        <ChatBubble
          v-for="(msg, index) in chatService.messages.value"
          :key="index"
          :message="msg.text"
          :sender="msg.sender"
        />
      </div>

      <ChatInput
        @send-message="sendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps } from 'vue'
import ChatHeader from '@/components/ChatHeader.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import ChatInput from '@/components/ChatInput.vue'

const props = defineProps({
  currentCardTerm: {
    type: String,
    default: null
  }
})

class ChatService {
  constructor() {
    this.isChatOpen = ref(false)
    this.chatTitle = '🤖Study Bot' 
    this.messages = ref([])
    this.savedMessages = [] // To store messages when minimized
  }

  // Toggle chat open/close
  toggleChat(currentTerm = null) {
    if (!this.isChatOpen.value) {
      this.openChat(currentTerm);
    } else {
      // Now this only hides the chat, same as minimize
      this.minimizeChat();
    }
  }

  // Open chat and restore messages if they exist
  openChat(currentTerm = null) {
    this.isChatOpen.value = true;
    
    // Restore saved messages if they exist
    if (this.savedMessages.length > 0) {
      this.messages.value = [...this.savedMessages];
      this.savedMessages = [];
    } else {
      this.messages.value = [];
      
      if (currentTerm && currentTerm.trim() !== '') {
        this.offerContextualHelp(currentTerm, true); 
      }
    }
  }
  
  minimizeChat() {
    // Save current messages
    this.savedMessages = [...this.messages.value];
    this.isChatOpen.value = false;
  }
  
  clearChat() {
    this.messages.value = [];
    this.savedMessages = [];
  }

  offerContextualHelp(term, isInitialOffer = false) {
    if (!term || term.trim() === '') return; 

    const messageText = isInitialOffer
        ? `Need help with "${term}"`
        : `Want more Info on "${term}"`; 

    setTimeout(() => {
      const lastMessage = this.messages.value[this.messages.value.length - 1];
      if (!lastMessage || !lastMessage.text.includes(`"${term}"`)) {
        this.messages.value.push({
          text: messageText,
          sender: 'bot'
        });
      }
    }, 150);
  }

  sendMessage(newMessage) {
    if (!newMessage.trim()) return;
    this.messages.value.push({ text: newMessage, sender: 'user' });
    this.handleBotResponse(newMessage);
  }

  handleBotResponse(userMessage) {
    setTimeout(() => {
      const botResponses = ["An atom is a particle","Yo mama","bEthpage","I don't know what that is","I don't know what that is", "Can you rephrase that?"];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      this.messages.value.push({ text: randomResponse, sender: 'bot' });
    }, 1000);
  }
}

// --- Component Logic ---
const chatService = new ChatService()
const messageListElement = ref(null)
const isMinimized = ref(false)

const handleToggleChat = () => {
  if (!chatService.isChatOpen.value) {
    chatService.openChat(props.currentCardTerm);
    isMinimized.value = false;
  } else {
    // Close button in launcher now mimics minimize
    chatService.minimizeChat();
    isMinimized.value = true;
  }
}

const handleMinimize = () => {
  chatService.minimizeChat();
  isMinimized.value = true;
}

const handleClearChat = () => {
  chatService.clearChat();
}

const sendMessage = (newMessage) => {
  chatService.sendMessage(newMessage)
}

// --- Watchers ---

watch(() => props.currentCardTerm, (newTerm, oldTerm) => {
  if (chatService.isChatOpen.value && newTerm && newTerm !== oldTerm) {
    console.log(`Flashcard changed to: "${newTerm}". Offering help.`); // For debugging
    chatService.offerContextualHelp(newTerm, false);
  }
});

// Watch for new messages to scroll
watch(chatService.messages, async () => {
  await nextTick();
  if (messageListElement.value) {
    messageListElement.value.scrollTop = messageListElement.value.scrollHeight;
  }
}, { deep: true });

watch(chatService.isChatOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    if (messageListElement.value) {
      messageListElement.value.scrollTop = messageListElement.value.scrollHeight;
    }
  }
})
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-launcher {
  width: 50px;
  height: 50px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-size: 24px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: background-color 0.3s ease;
}

.chat-launcher:hover {
  background-color: #0056b3;
}

.chat-window {
  width: 320px; 
  height: 450px; 
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden; 
  position: absolute; 
  bottom: 60px; 
  right: 0;
  transition: all 0.3s ease;
}

.chat-window.minimized {
  transform: translateY(100%);
  opacity: 0;
  pointer-events: none;
}

.message-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px 10px;
  background-color: #f9f9f9;
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #bdbdbd; 
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}

@media (max-width: 400px) {
  .chat-container {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-window {
    width: calc(100vw - 20px); 
    max-width: 350px; 
    height: calc(100vh - 80px); 
    max-height: 500px;
    position: fixed; 
    bottom: 70px; 
    right: 10px;
    border-radius: 10px; 
  }
}
</style>