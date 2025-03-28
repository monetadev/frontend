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
        <!-- <button 
          class="minimize-btn" 
          @click="$emit('minimize')"
          title="Minimize"
        >
          &minus;
        </button> -->
        <button 
          class="close-btn" 
          @click="$emit('close')"
          title="Close"
        >
          &minus;
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      default: 'Chat Support'
    },
    avatarUrl: {
      type: String,
      default: null
    }
  })
  
  // Define emits for close and minimize actions
  defineEmits(['close', 'minimize'])
  
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
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 0 5px;
    transition: color 0.3s ease;
  }
  
  .minimize-btn:hover,
  .close-btn:hover {
    color: #333;
  }
  
  .close-btn {
    color: #666;
  }
  
  .close-btn:hover {
    color:#666;
  }
  </style>