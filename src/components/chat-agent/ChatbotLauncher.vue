<template>
  <div class="chat-container">
    <button class="chat-launcher" @click="handleToggleChat" aria-label="Toggle chat">
      <div class="launcher-background"></div>
      <div class="launcher-icon-container">
        <svg v-if="!isChatOpen" class="launcher-icon chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg v-else class="launcher-icon close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </button>

    <transition name="chat-fade">
      <div v-if="isChatOpen"
           class="chat-window"
           :class="{ 'minimized': isMinimized }"
           :style="chatWindowStyle"
           ref="chatWindowElement">
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
              @contextToggled="handleContextToggled"
          />
        </div>

        <div class="typing-indicator-container">
          <TypingIndicator :isVisible="isLoading" />
        </div>

        <ChatInput
            @send-message="sendMessage"
            :isDisabled="isLoading"
        />

        <!-- Resize handles -->
        <div class="resize-handle resize-handle-left"
             @mousedown="startResizing('left', $event)"
             @touchstart="startResizing('left', $event)"></div>
        <div class="resize-handle resize-handle-right"
             @mousedown="startResizing('right', $event)"
             @touchstart="startResizing('right', $event)"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { gql } from '@apollo/client/core'
import ChatHeader from '@/components/chat-agent/ChatHeader.vue'
import ChatBubble from '@/components/chat-agent/ChatBubble.vue'
import ChatInput from '@/components/chat-agent/ChatInput.vue'
import TypingIndicator from '@/components/chat-agent/TypingIndicator.vue'
import { v4 as uuidv4 } from 'uuid'
import { FLASHCARD_SET_CHAT } from '@/graphql/auth.js'
import apolloClient from '@/plugins/apollo.js'

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
const chatTitle = ref('Chat with Moneta')
const messages = ref([])
const savedMessages = ref([])
const conversationId = ref(uuidv4())
const isLoading = ref(false)
const subscription = ref(null)
const messageListElement = ref(null)
const isMinimized = ref(false)

// For accumulating tokens before displaying
const tempMessageContent = ref('')
const hasMonetaResponseAppeared = ref(false)

// Resizing variables
const chatWindowElement = ref(null)
const chatWidth = ref(null)
const isResizing = ref(false)
const resizeDirection = ref(null)
const startX = ref(0)
const startWidth = ref(0)
const startPosition = ref(0)

// Flag to prevent auto-scrolling when expanding context
const preventAutoScroll = ref(false)

// Computed styles for the chat window
const chatWindowStyle = computed(() => {
  if (chatWidth.value) {
    return {
      width: `${chatWidth.value}px`
    };
  }
  return {};
})

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

  // Clean up resizing event listeners
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResizing)
  document.removeEventListener('touchend', stopResizing)
  window.removeEventListener('resize', handleWindowResize)
})

// Mounting
onMounted(() => {
  // Get saved width from localStorage if available
  const savedWidth = localStorage.getItem('chatWindowWidth')
  if (savedWidth) {
    chatWidth.value = parseInt(savedWidth)
  }

  // Add window resize listener to ensure chat window stays within bounds
  window.addEventListener('resize', handleWindowResize)
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
  savedMessages.value = [...messages.value]
  isChatOpen.value = false
}

const clearChat = () => {
  console.log("Clearing chat...")

  // Cancel any current subscription
  if (subscription.value) {
    try {
      subscription.value.unsubscribe()
    } catch (e) {
      console.warn("Error unsubscribing:", e)
    }
    subscription.value = null
  }

  // Reset messages with a new array (ensures reactivity)
  messages.value = []
  savedMessages.value = []

  // Create a new conversation ID
  conversationId.value = uuidv4()
  console.log("New conversation ID:", conversationId.value)

  // Add an initial message
  messages.value.push({
    text: "Chat cleared. What would you like to discuss?",
    sender: "bot"
  })

  // Reset the streaming state
  streamingMessageIndex.value = -1
  isLoading.value = false

  // Reset the temp message content and flag
  tempMessageContent.value = ''
  hasMonetaResponseAppeared.value = false

  // Force UI update
  nextTick(() => {
    if (messageListElement.value) {
      messageListElement.value.scrollTop = messageListElement.value.scrollHeight
    }
  })
}

const sendMessage = async (userMessage) => {
  console.log("Message variables:", {
    conversationId: conversationId.value,
    setId: setId,
    message: userMessage,
    messageCount: messages.value.filter(m => m.sender === 'user').length
  })

  if (!userMessage.trim()) return

  messages.value.push({ text: userMessage, sender: 'user' })

  // Show typing indicator
  isLoading.value = true
  streamingMessageIndex.value = -1

  // Reset the temporary message content and flag
  tempMessageContent.value = ''
  hasMonetaResponseAppeared.value = false

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

    console.log("Creating new chat subscription for message:", userMessage)

    // Create a new subscription for this message
    subscription.value = apolloClient
        .subscribe({
          query: FLASHCARD_SET_CHAT,
          variables: {
            conversationId: conversationId.value,
            setId: setId,
            message: userMessage
          },
          fetchPolicy: 'no-cache'
        })
        .subscribe({
          next: (result) => {
            console.log("Token received:", result)

            // Extract token
            const token = result.data?.flashcardSetChat
            if (token === undefined || token === null) {
              console.warn('Missing token in response:', result)
              return
            }

            // Accumulate tokens in the temporary content
            tempMessageContent.value += token

            // Check if "# Moneta's Response" has appeared
            if (!hasMonetaResponseAppeared.value &&
                tempMessageContent.value.includes("# Moneta's Response")) {
              hasMonetaResponseAppeared.value = true

              // Now we can show the message
              isLoading.value = false
              messages.value.push({
                text: tempMessageContent.value,
                sender: 'bot',
                isMarkdown: true
              })
              streamingMessageIndex.value = messages.value.length - 1
            }
            // If we've already started showing the message, continue appending tokens
            else if (hasMonetaResponseAppeared.value) {
              messages.value[streamingMessageIndex.value].text = tempMessageContent.value
            }
            // Otherwise keep accumulating tokens without showing anything

            // Handle end token
            if (token === "[END]") {
              // If we never saw "# Moneta's Response", show the message now
              if (!hasMonetaResponseAppeared.value) {
                isLoading.value = false
                messages.value.push({
                  text: tempMessageContent.value.replace("[END]", ""),
                  sender: 'bot',
                  isMarkdown: true
                })
              } else {
                // Just remove the end token from existing message
                messages.value[streamingMessageIndex.value].text =
                    messages.value[streamingMessageIndex.value].text.replace("[END]", "")
              }

              // Reset for next message
              streamingMessageIndex.value = -1
              tempMessageContent.value = ''
              hasMonetaResponseAppeared.value = false
            }
          },
          error: (error) => {
            console.error("Subscription error:", error)

            // More detailed logging
            if (error.graphQLErrors) {
              console.error("GraphQL errors:", error.graphQLErrors)
            }
            if (error.networkError) {
              console.error("Network error:", error.networkError)
            }

            // Hide typing indicator
            isLoading.value = false

            // Show error message
            messages.value.push({
              text: "Connection error. Please try again later.",
              sender: 'bot'
            })

            // Reset temporary state
            streamingMessageIndex.value = -1
            tempMessageContent.value = ''
            hasMonetaResponseAppeared.value = false
          },
          complete: () => {
            console.log("Subscription completed - ready for next message")
            streamingMessageIndex.value = -1
            isLoading.value = false
            tempMessageContent.value = ''
            hasMonetaResponseAppeared.value = false
          }
        })
  } catch (error) {
    console.error("Failed to create subscription:", error)

    // Hide typing indicator
    isLoading.value = false

    // Show error message
    messages.value.push({
      text: "Sorry, I couldn't process your request. Please try again.",
      sender: 'bot'
    })

    streamingMessageIndex.value = -1
    tempMessageContent.value = ''
    hasMonetaResponseAppeared.value = false
  }
}

// Resizing functions
const startResizing = (direction, event) => {
  if (event.type === 'touchstart') {
    event.preventDefault()
    startX.value = event.touches[0].clientX
  } else {
    startX.value = event.clientX
  }

  isResizing.value = true
  resizeDirection.value = direction

  const windowRect = chatWindowElement.value.getBoundingClientRect()
  startWidth.value = windowRect.width
  startPosition.value = windowRect.left

  // Add event listeners
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('touchmove', handleResize, { passive: false })
  document.addEventListener('mouseup', stopResizing)
  document.addEventListener('touchend', stopResizing)
}

const handleResize = (event) => {
  if (!isResizing.value) return

  let clientX
  if (event.type === 'touchmove') {
    event.preventDefault()
    clientX = event.touches[0].clientX
  } else {
    clientX = event.clientX
  }

  const deltaX = clientX - startX.value

  if (resizeDirection.value === 'right') {
    // Resizing from right edge
    let newWidth = startWidth.value + deltaX

    // Apply constraints
    newWidth = Math.max(newWidth, 320) // Min width
    newWidth = Math.min(newWidth, window.innerWidth * 0.8) // Max width

    chatWidth.value = newWidth
  } else if (resizeDirection.value === 'left') {
    // Resizing from left edge (more complex)
    let newWidth = startWidth.value - deltaX

    // Apply constraints
    newWidth = Math.max(newWidth, 320) // Min width
    newWidth = Math.min(newWidth, window.innerWidth * 0.8) // Max width

    chatWidth.value = newWidth
  }

  // Remember user's preference
  localStorage.setItem('chatWindowWidth', chatWidth.value)

  // Update scrolling in case the chat bubbles reflow
  updateScroll()
}

const stopResizing = () => {
  isResizing.value = false

  // Remove event listeners
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('touchmove', handleResize)
  document.removeEventListener('mouseup', stopResizing)
  document.removeEventListener('touchend', stopResizing)
}

// Handle window resize (ensures chat window stays within viewport)
const handleWindowResize = () => {
  if (chatWidth.value && chatWidth.value > window.innerWidth * 0.8) {
    chatWidth.value = window.innerWidth * 0.8
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

// Handler for context toggle event from ChatBubble
const handleContextToggled = (data) => {
  // If the event explicitly says we should prevent auto-scrolling, do nothing
  if (data && data.preventScroll) {
    return;
  }

  // Otherwise update scroll normally
  updateScroll();
}

// Update scroll function for context toggle and resizing
const updateScroll = () => {
  if (messageListElement.value) {
    messageListElement.value.scrollTop = messageListElement.value.scrollHeight
  }
}

// Watchers
watch(() => props.currentCardTerm, (newTerm, oldTerm) => {
  if (isChatOpen.value && newTerm && newTerm !== oldTerm) {
    console.log(`Flashcard changed to: "${newTerm}". Offering help.`)
  }
})

// Watch for new messages to scroll
watch(messages, async () => {
  await nextTick()
  // Only scroll to bottom if auto-scroll isn't temporarily prevented
  if (messageListElement.value && !preventAutoScroll.value) {
    messageListElement.value.scrollTop = messageListElement.value.scrollHeight
  }
}, { deep: true })

watch(isChatOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    if (messageListElement.value) {
      messageListElement.value.scrollTop = messageListElement.value.scrollHeight
    }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

/* Base styling */
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Outfit', sans-serif;
}

/* Enhanced Chat launcher button */
.chat-launcher {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  cursor: pointer;
  background: linear-gradient(145deg, #5F98EF, #4a7dd6);
  color: white;
  border: none;
  outline: none;
  padding: 0;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(95, 152, 239, 0.4);
  transition: all 0.2s ease;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  transform: translateZ(0);
  will-change: transform;
}

.chat-launcher::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: -1;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chat-launcher:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(95, 152, 239, 0.5);
}

.chat-launcher:hover::before {
  opacity: 1;
}

.chat-launcher:active {
  transform: translateY(1px) scale(0.95);
  box-shadow: 0 2px 8px rgba(95, 152, 239, 0.4);
}

.launcher-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #5F98EF, #4a7dd6);
  border-radius: 50%;
  z-index: -1;
}

.launcher-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.launcher-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-icon {
  animation: subtle-pulse 2s infinite ease-in-out;
}

.close-icon {
  stroke-width: 2.5;
}

/* Pulse animation for the chat icon */
@keyframes subtle-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Chat window */
.chat-window {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  bottom: 70px;
  right: 0;
  background-color: #121729;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 420px;
  height: 600px;
  transition: transform 0.3s ease, opacity 0.2s ease, height 0.2s ease;
  /* Remove width transition to allow smooth resizing */
  border: 1px solid #2a335a;
}

.chat-window.minimized {
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  cursor: ew-resize;
  z-index: 1002;
  touch-action: none;
}

.resize-handle-left {
  left: -4px;
}

.resize-handle-right {
  right: -4px;
}

.resize-handle::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 30px;
  background-color: rgba(95, 152, 239, 0);
  border-radius: 2px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color 0.2s ease;
}

.resize-handle:hover::after {
  background-color: rgba(95, 152, 239, 0.5);
}

.resize-handle:active::after {
  background-color: rgba(95, 152, 239, 0.7);
}

/* Message list */
.message-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #121729;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: #2a335a #121729;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #121729;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #2a335a;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #3d4a7d;
}

/* Typing indicator */
.typing-indicator-container {
  padding: 4px 0;
  background-color: #121729;
}

/* Transitions */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ===== RESPONSIVE DESIGN ===== */

/* Large desktop screens */
@media (min-width: 1440px) {
  .chat-window {
    /* Only apply default width if user hasn't resized */
    width: var(--user-chat-width, 480px);
    height: 700px;
  }

  .chat-launcher {
    width: 60px;
    height: 60px;
  }

  .launcher-icon {
    width: 26px;
    height: 26px;
  }
}

/* Standard desktop screens */
@media (min-width: 1024px) and (max-width: 1439px) {
  .chat-window {
    /* Only apply default width if user hasn't resized */
    width: var(--user-chat-width, 420px);
    height: 600px;
  }
}

/* Tablets and small desktops */
@media (min-width: 768px) and (max-width: 1023px) {
  .chat-window {
    /* Only apply default width if user hasn't resized */
    width: var(--user-chat-width, 360px);
    height: 550px;
  }

  .chat-container {
    bottom: 16px;
    right: 16px;
  }
}

/* Large phones and small tablets */
@media (min-width: 481px) and (max-width: 767px) {
  .chat-window {
    width: 340px;
    height: 500px;
    bottom: 65px;
  }

  .chat-container {
    bottom: 14px;
    right: 14px;
  }

  .chat-launcher {
    width: 48px;
    height: 48px;
  }

  .launcher-icon {
    width: 22px;
    height: 22px;
  }

  .message-list {
    padding: 12px;
  }
}

/* Mobile phones */
@media (max-width: 480px) {
  .resize-handle {
    display: none; /* Hide resize handles on mobile */
  }

  .chat-container {
    bottom: 10px;
    right: 10px;
  }

  .chat-launcher {
    width: 45px;
    height: 45px;
  }

  .launcher-icon {
    width: 20px;
    height: 20px;
  }

  .chat-window {
    width: calc(100vw - 20px) !important; /* Override any custom width */
    height: calc(100vh - 80px);
    max-height: 500px;
    position: fixed;
    bottom: 65px;
    right: 10px;
    left: 10px;
    border-radius: 12px;
  }

  .message-list {
    padding: 10px;
  }
}

/* Special case for very small screens */
@media (max-width: 320px) {
  .chat-window {
    bottom: 60px;
    height: calc(100vh - 70px);
  }

  .chat-launcher {
    width: 40px;
    height: 40px;
  }

  .launcher-icon {
    width: 18px;
    height: 18px;
  }
}

/* Height-based media queries for shorter screens */
@media (max-height: 600px) {
  .chat-window {
    height: calc(100vh - 80px);
    max-height: 450px;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 767px) and (orientation: landscape) {
  .chat-window {
    height: 85vh;
    width: 60vw;
    max-width: 450px;
    right: 10px;
    left: auto;
  }

  .chat-container {
    right: 10px;
    bottom: 10px;
  }
}
</style>