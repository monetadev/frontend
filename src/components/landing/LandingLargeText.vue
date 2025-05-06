<template>
  <div class="hero-text-container">
      <h1 class="hero-text">
        {{ mainText }}
      </h1>
      <div v-if="$slots.default" class="hero-subtext">
         <slot></slot>
      </div>
    </div>
  </template>

  <script setup>
  import { defineProps } from 'vue';

  defineProps({
    mainText: {
      type: String,
      required: true
    }
  });
  </script>

  <style scoped>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero-text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
    text-align: center;
    overflow: hidden;
  }

  .hero-text {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 0.5rem;
    color: white; 
    max-width: 90%;

    /* --- Animation Here --- */
    animation: fadeInUp 0.5s ease-out 1s backwards;
    
  }

  .hero-subtext {
    font-size: clamp(1rem, 3vw, 1.5rem);
    color: #A0AEC0;
    margin-top: 0.5rem;
    max-width: 80%;
    animation: fadeInUp 0.8s 0.2s ease-out backwards;
    
  }
  </style>'