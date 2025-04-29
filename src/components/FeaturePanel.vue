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
 
  });
  </script>
  <style scoped>
  .feature-panel {
    background-color: #2d3748;
    padding: 2rem 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
    opacity: 0; 
    transform: translateY(40px); 
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    
}


.feature-panel.is-visible {
    opacity: 1; 
    transform: translateY(0); 
}



.feature-panel:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

  
  .icon-wrapper {
    margin-bottom: 1rem;
  }
  
  .icon-wrapper i {
    font-size: 2.5rem; 
    color: #3182CE; 
  }
  
  
  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #E2E8F0; 
    margin-top: 0;
    margin-bottom: 0.75rem;
  }
  
  .feature-description {
    font-size: 0.95rem;
    color: #A0AEC0; 
    line-height: 1.6;
    flex-grow: 1; 
  }
  </style>