<template>
    <button class="create-button" @click="$emit('click')">
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
        },
        disabled: {
          type: Boolean,
          default: false
        }
      }
    }

      //TODO:  implement disabling buttons for user when import fields are empty
    </script>
    <style scoped>
  .create-button {
    background-color: #5F98EF;
    color: white;
    border: 2px solid #5F98EF;
    font-size: 24px;
    padding: 2px 10px;
    margin: 8px;
    cursor: pointer;
    border-radius: 6px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    min-width: 30px;
    transition: all 0.3s ease;
    outline: none;
  }
  
  
  .create-button:hover:not(.disabled) {
    background-color: #5F98EF;
    color: white;
    border-color: #5F98EF;
    box-shadow: 0px 4px 12px rgba(95, 152, 239, 0.3);
  }
  
  .create-button:focus:not(.disabled) {
    border-color: #4a7dd6;
    box-shadow: 0px 0px 0px 3px rgba(95, 152, 239, 0.4);
  }
  
  .create-button:active:not(.disabled) {
    background-color: #4a7dd6;
    transform: scale(0.98);
  }
  .create-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #8a8a8a;
    color: #8a8a8a;
  }
  
    </style>