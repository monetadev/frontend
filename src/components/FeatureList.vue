<template>
    <div class="feature-list-container">
      <h2 class="section-title">Why Choose Us?</h2>
      <div class="feature-grid">
        <FeaturePanel
          v-for="feature in features"
          :key="feature.id"
          :icon="feature.iconClass"
          :title="feature.title"
          :description="feature.description"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import FeaturePanel from './FeaturePanel.vue'; // Adjust path if needed
  

  const features = ref([
    {
      id: 1,
      // Make sure you have Font Awesome (or your chosen library) set up!
      iconClass: 'fas fa-bolt', // Example Font Awesome icon
      title: 'Instant Card Generation',
      description: 'Get AI- Generated Cards, Games, or studying PDFs in seconds.',
    },
    {
      id: 2,
      iconClass: 'fas fa-eye', // Example Font Awesome icon
      title: 'Live Preview',
      description: 'See your generated code rendered or visualized instantly without leaving the editor.',
    },
    {
      id: 3,
      iconClass: 'fas fa-pencil-alt', // Example Font Awesome icon
      title: 'Seamless Editing',
      description: 'Refine and modify the generated cards with our integrated editing tools and suggestions.',
    },
    {
      id: 4,
      iconClass: 'fas fa-cloud-upload-alt', // Example Font Awesome icon
      title: 'Cloud Sync',
      description: 'Save your work and access your flashcards from anywhere.',
    },
    {
      id: 5,
      iconClass: 'fas fa-share-alt', // Example Font Awesome icon
      title: 'Easy Collaboration',
      description: 'Share your generated Flashcards, PDFs, and Quizzes with your team members effortlessly.',
    },
    {
      id: 6,
      iconClass: 'fas fa-shield-alt', // Example Font Awesome icon
      title: 'Secure & Private',
      description: 'Your Flashcards and Information are kept private and secure with end-to-end encryption.',
    },
  ]);
  </script>
  
  <style scoped>
  .feature-list-container {
    padding: 60px 20px; /* Add vertical and horizontal padding */
    max-width: 1200px; /* Limit maximum width */
    margin: 0 auto; /* Center the container */
  }
  
  .section-title {
    text-align: center;
    font-size: clamp(1.8rem, 5vw, 2.5rem); /* Responsive font size */
    color: #E2E8F0; /* Light text */
    margin-bottom: 3rem; /* Space below the title */
  }
  
  .feature-grid {
    display: grid;
    /* Responsive grid: fits as many columns as possible with min width 280px */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 5rem; /* Space between grid items */
  }
  
  /* Adjust grid for larger screens if needed */
  @media (min-width: 992px) {
    .feature-grid {
      /* Example: Force 3 columns on larger screens */
      /* grid-template-columns: repeat(3, 1fr); */
    }
  }
  </style>