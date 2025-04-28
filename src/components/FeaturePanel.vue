<template>
    <div class="feature-panel">
      <div v-if="icon" class="icon-wrapper">
        <i :class="icon" aria-hidden="true"></i>
        </div>
      <h3 class="feature-title">{{ title }}</h3>
      <p class="feature-description">{{ description }}</p>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  defineProps({
    // Icon class name (e.g., 'fas fa-bolt' for Font Awesome) or potentially an image URL/SVG path
    icon: {
      type: String,
      default: '', // Make icon optional
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Example for image:
    // iconSource: {
    //   type: String,
    //   default: ''
    // }
  });
  </script>
  
  <style scoped>
  .feature-panel {
    background-color: #2d3748; /* Slightly lighter than main background */
    padding: 2rem 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    height: 100%; /* Ensure panels in the same row have the same height */
    display: flex;
    flex-direction: column;
  }
  
  .feature-panel:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
  }
  
  .icon-wrapper {
    margin-bottom: 1rem;
  }
  
  .icon-wrapper i {
    font-size: 2.5rem; /* Adjust icon size */
    color: #3182CE; /* Icon color - match your theme */
  }
  
  /* Example for image icon */
  /*
  .icon-wrapper img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }
  */
  
  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #E2E8F0; /* Light text for dark background */
    margin-top: 0;
    margin-bottom: 0.75rem;
  }
  
  .feature-description {
    font-size: 0.95rem;
    color: #A0AEC0; /* Lighter grey text */
    line-height: 1.6;
    flex-grow: 1; /* Allows description to push title/icon up */
  }
  </style>