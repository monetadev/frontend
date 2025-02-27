<template>
    <button 
      class="secondary-button" 
      :type="type" 
      @click="$emit('click')"
    >
      {{ text }}
    </button>
  </template>
  
  <script>
  export default {
    props: {
      text: {
        type: String,
        required: true
      },
      type: {
        type: String,
        default: 'button'
      }
    }
  }
  </script>
  
  <style scoped>
  .secondary-button {
    background-color: transparent;
    color: white;
    border: 2px solid #5F98EF;
    font-size: medium;
    padding: 12px 20px;
    margin: 8px 0;
    cursor: pointer;
    border-radius: 4px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 100px;
  }
  
  .secondary-button:hover {
    background-color: rgba(95, 152, 239, 0.1);
  }
  </style>