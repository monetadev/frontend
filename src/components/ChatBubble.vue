<template>
    <div 
      class="chat-bubble" 
      :class="{
        'user-bubble': sender === 'user', 
        'bot-bubble': sender === 'bot'
      }"
    >
      {{ message }}
    </div>
  </template>
  
  <script setup>
  defineProps({
    message: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      validator: (value) => ['user', 'bot'].includes(value),
      default: 'bot'
    }
  })
  </script>
  
  <style scoped>
     @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

  .chat-bubble {

    max-width: 70%; 
    margin: 8px; 
    padding: 10px 15px; 
    border-radius: 18px; 
    word-wrap: break-word; 
    clear: both; 
    position: relative; 
    font-size: 14px; 
    line-height: 1.4; 
    font-family: "outfit", sans-serif; 
  }
  
  .user-bubble {
    background-color: #007bff; 
    color: white; 
    align-self: flex-end; 
    margin-left: auto; 
  }
  
  .bot-bubble {
    background-color: #f0f0f0; 
    color: black; 
    align-self: flex-start; 
    margin-right: auto; 
  }
  </style>