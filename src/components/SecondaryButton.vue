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
      }
    }
  }
  </script>
  
  <style scoped>
.secondary-button {
  background-color: transparent; /* Default transparent background */
  color: white; /* Default text color */
  border: 2px solid #5F98EF; /* Blue border */
  font-size: 16px; /* Improved font size for readability */
  padding: 12px 24px; /* Increased padding for a more substantial button */
  margin: 8px;
  cursor: pointer;
  border-radius: 6px; /* Slightly rounded corners for a modern look */
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  min-width: 120px;
  transition: all 0.3s ease; /* Smooth transition for background, color, and shadow */
  outline: none; /* Remove the outline on focus */
}

.secondary-button:hover {
  background-color: #5F98EF; /* Background color when hovered */
  color: white; /* Ensure text remains white */
  border-color: #5F98EF; /* Border color on hover */
  box-shadow: 0px 4px 12px rgba(95, 152, 239, 0.3); /* Add subtle shadow on hover for depth */
}

.secondary-button:focus {
  border-color: #4a7dd6; /* Slightly darker border when focused */
  box-shadow: 0px 0px 0px 3px rgba(95, 152, 239, 0.4); /* Add focus outline for better accessibility */
}

.secondary-button:active {
  background-color: #4a7dd6; /* Darker blue when active (clicked) */
  transform: scale(0.98); /* Slight scale effect to give a "pressed" feeling */
}
  </style>