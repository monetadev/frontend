<template>
  <svg
   width="50"
   height="50"
   viewBox="0 0 50 50"
   fill="none"
   xmlns="http://www.w3.org/2000/svg"
   :class="{ 'disabled': disabled }"
   @click.stop="handleClick"
  >
   <g clip-path="url(#clip0_419_603)">
    <path
     d="M25.2273 36.85C24.9419 36.85 24.6585 36.7313 24.4523 36.5042L15.6627 26.7375C15.3064 26.3417 15.3064 25.7396 15.6627 25.3438L24.4523 15.5771C24.8377 15.1501 25.496 15.1167 25.9231 15.5001C26.3523 15.8855 26.3856 16.5438 26.0002 16.9709L17.8398 26.0396L26.0002 35.1105C26.3856 35.5376 26.3502 36.1959 25.9231 36.5792C25.7252 36.7605 25.4773 36.85 25.2273 36.85Z"
     :fill="disabled ? '#6D7486' : 'white'"
    />
    <path
     d="M33.5608 36.85C33.2754 36.85 32.992 36.7313 32.7837 36.5042L23.9962 26.7375C23.6399 26.3417 23.6399 25.7396 23.9962 25.3438L32.7837 15.5771C33.1733 15.1501 33.8254 15.1167 34.2566 15.5001C34.6837 15.8855 34.7191 16.5438 34.3337 16.9709L26.1712 26.0396L34.3337 35.1105C34.7191 35.5376 34.6837 36.1959 34.2566 36.5792C34.0587 36.7605 33.8108 36.85 33.5608 36.85Z"
     :fill="disabled ? '#6D7486' : 'white'"
    />
    <path
     d="M25 2.08333C37.6333 2.08333 47.9167 12.3646 47.9167 25C47.9167 37.6333 37.6333 47.9167 25 47.9167C12.3646 47.9167 2.08333 37.6333 2.08333 25C2.08333 12.3646 12.3646 2.08333 25 2.08333ZM25 0C11.1937 0 0 11.1937 0 25C0 38.8062 11.1937 50 25 50C38.8062 50 50 38.8062 50 25C50 11.1937 38.8062 0 25 0Z"
     :fill="disabled ? '#6D7486' : 'white'"
    />
   </g>
   <defs>
    <clipPath id="clip0_419_603">
     <rect width="50" height="50" fill="white" />
    </clipPath>
   </defs>
  </svg>
 </template>
 
 <script>
 export default {
  props: {
   active: Boolean,
   disabled: Boolean
  },
  methods: {
   handleClick(event) {
    if (this.disabled) {
     event.preventDefault();
     event.stopPropagation();
     return;
    }
    this.$emit('click');
   }
  }
 };
 </script>
 
 <style scoped>
 .disabled {
   opacity: 0.5;
   cursor: not-allowed;
   pointer-events: none; 
 }
 </style>