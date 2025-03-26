<template>
  <button class="secondary-button" @click="$emit('click')">
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
  </script>
//TODO implement disabling buttons for user when import fields are empty
  <style scoped>
.secondary-button {
  background-color: #5F98EF;
  color: white;
  border: 2px solid #5F98EF;
  font-size: 16px;
  padding: 12px 24px;
  margin: 8px;
  cursor: pointer;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  min-width: 120px;
  transition: all 0.3s ease;
  outline: none;
}



.secondary-button:hover:not(.disabled) {
  background-color: #5F98EF;
  color: white;
  border-color: #5F98EF;
  box-shadow: 0px 4px 12px rgba(95, 152, 239, 0.3);
}

.secondary-button:focus:not(.disabled) {
  border-color: #4a7dd6;
  box-shadow: 0px 0px 0px 3px rgba(95, 152, 239, 0.4);
}

.secondary-button:active:not(.disabled) {
  background-color: #4a7dd6;
  transform: scale(0.98);
}
.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #8a8a8a;
  color: #8a8a8a;
}

  </style>