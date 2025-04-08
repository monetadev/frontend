<template>
  <div class="chat-container">
    <div class="chat-launcher" @click="handleToggleChat">
      <span v-if="!isChatOpen">💬</span>
      <span v-else>×</span>
    </div>

    <div v-if="isChatOpen" class="chat-window" :class="{ 'minimized': isMinimized }">
      <ChatHeader
          :title="chatTitle"
          @minimize="handleMinimize"
          @clear="handleClearChat"
      />

      <div class="message-list" ref="messageListElement">
        <ChatBubble
            v-for="(msg, index) in messages"
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
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { gql } from '@apollo/client/core'
import ChatHeader from '@/components/ChatHeader.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import ChatInput from '@/components/ChatInput.vue'
import { v4 as uuidv4 } from 'uuid'
import { FLASHCARD_SET_CHAT } from '@/graphql/auth'
import apolloClient from '@/plugins/apollo'

const props = defineProps({
  currentCardTerm: {
    type: String,
    default: null
  }
})

const route = useRoute()
const setId = route.params.id
const streamingMessageIndex = ref(-1)

// Reactive state
const isChatOpen = ref(false)
const chatTitle = ref('🤖Study Bot')
const messages = ref([])
const savedMessages = ref([]) // Make this a ref
const conversationId = ref(uuidv4())
const isLoading = ref(false)
const subscription = ref(null)
const messageListElement = ref(null)
const isMinimized = ref(false)

// Cleanup
onBeforeUnmount(() => {
  if (subscription.value) {
    try {
      subscription.value.unsubscribe()
    } catch (error) {
      console.error("Error unsubscribing:", error)
    }
    subscription.value = null
  }
})

// Functions
const openChat = (currentTerm = null) => {
  isChatOpen.value = true

  if (savedMessages.value.length > 0) {
    messages.value = [...savedMessages.value]
    savedMessages.value = []
  } else {
    messages.value = []
  }
}

const minimizeChat = () => {
  savedMessages.value = [...messages.value] // Fixed assignment
  isChatOpen.value = false
}

const clearChat = () => {
  console.log("Clearing chat...");

  // Cancel any current subscription
  if (subscription.value) {
    try {
      subscription.value.unsubscribe();
    } catch (e) {
      console.warn("Error unsubscribing:", e);
    }
    subscription.value = null;
  }

  // Reset messages with a new array (ensures reactivity)
  messages.value = [];
  savedMessages.value = [];

  // Create a new conversation ID
  conversationId.value = uuidv4();
  console.log("New conversation ID:", conversationId.value);

  // Add an initial message
  messages.value.push({
    text: "Chat cleared. What would you like to discuss?",
    sender: "bot"
  });

  // Reset the streaming state
  streamingMessageIndex.value = -1;
  isLoading.value = false;

  // Force UI update
  nextTick(() => {
    if (messageListElement.value) {
      messageListElement.value.scrollTop = messageListElement.value.scrollHeight;
    }
  });
}

const sendMessage = async (userMessage) => {

  console.log("Message variables:", {
    conversationId: conversationId.value,
    setId: setId,
    message: userMessage,
    messageCount: messages.value.filter(m => m.sender === 'user').length
  });

  if (!userMessage.trim()) return

  messages.value.push({ text: userMessage, sender: 'user' })

  isLoading.value = true
  messages.value.push({ text: "...", sender: 'bot', isLoading: true })

  streamingMessageIndex.value = -1

  try {
    // Always clean up any existing subscription
    if (subscription.value) {
      try {
        subscription.value.unsubscribe()
      } catch (e) {
        console.warn("Error unsubscribing:", e)
      }
      subscription.value = null
    }

    console.log("Creating new chat subscription for message:", userMessage);

    // Create a new subscription for this message
    subscription.value = apolloClient
        .subscribe({
          query: FLASHCARD_SET_CHAT,
          variables: {
            conversationId: conversationId.value, // Keep the same conversation ID
            setId: setId,
            message: userMessage
          },
          fetchPolicy: 'no-cache'
        })
        .subscribe({
          next: (result) => {
            console.log("Token received:", result);

            // Extract token
            const token = result.data?.flashcardSetChat;
            if (token === undefined || token === null) {
              console.warn('Missing token in response:', result);
              return;
            }

            // Handle token display
            if (streamingMessageIndex.value === -1) {
              // Remove loading indicator
              const loadingIndex = messages.value.findIndex(msg => msg.isLoading)
              if (loadingIndex !== -1) {
                messages.value.splice(loadingIndex, 1)
              }

              // Create new message
              messages.value.push({
                text: token,
                sender: 'bot',
                isMarkdown: true
              })
              streamingMessageIndex.value = messages.value.length - 1
            } else {
              // Append to existing message
              messages.value[streamingMessageIndex.value].text += token
            }

            // Handle end token
            if (token === "[END]") {
              messages.value[streamingMessageIndex.value].text =
                  messages.value[streamingMessageIndex.value].text.replace("[END]", "")
              streamingMessageIndex.value = -1
            }
          },
          error: (error) => {
            console.error("Subscription error:", error);

            // More detailed logging
            if (error.graphQLErrors) {
              console.error("GraphQL errors:", error.graphQLErrors);
            }
            if (error.networkError) {
              console.error("Network error:", error.networkError);
            }

            // Remove loading indicator
            const loadingIndex = messages.value.findIndex(msg => msg.isLoading)
            if (loadingIndex !== -1) {
              messages.value.splice(loadingIndex, 1)
            }

            // Show error message
            messages.value.push({
              text: "Connection error. Please try again later.",
              sender: 'bot'
            })

            isLoading.value = false
            streamingMessageIndex.value = -1
          },
          complete: () => {
            console.log("Subscription completed - ready for next message");
            streamingMessageIndex.value = -1;
            isLoading.value = false;
            // Subscription is now completed and ready for the next message
          }
        })
  } catch (error) {
    console.error("Failed to create subscription:", error);

    // Remove loading indicator
    const loadingIndex = messages.value.findIndex(msg => msg.isLoading)
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1)
    }

    // Show error message
    messages.value.push({
      text: "Sorry, I couldn't process your request. Please try again.",
      sender: 'bot'
    })

    isLoading.value = false
    streamingMessageIndex.value = -1
  }
}

// UI handlers
const handleToggleChat = () => {
  if (!isChatOpen.value) {
    openChat(props.currentCardTerm)
    isMinimized.value = false
  } else {
    minimizeChat()
    isMinimized.value = true
  }
}

const handleMinimize = () => {
  minimizeChat()
  isMinimized.value = true
}

const handleClearChat = () => {
  clearChat()
}

// Watchers
watch(() => props.currentCardTerm, (newTerm, oldTerm) => {
  if (isChatOpen.value && newTerm && newTerm !== oldTerm) {
    console.log(`Flashcard changed to: "${newTerm}". Offering help.`)
  }
})

// Watch for new messages to scroll
watch(messages, async () => {
  await nextTick();
  if (messageListElement.value) {
    messageListElement.value.scrollTop = messageListElement.value.scrollHeight;
  }
}, { deep: true });

watch(isChatOpen, async (isOpen) => {
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