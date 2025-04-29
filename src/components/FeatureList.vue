<template>
    <div class="feature-list-container">
      <h2 class="section-title">Why Choose Us?</h2>
      <div class="feature-grid">
        <FeaturePanel
          v-for="(feature, index) in features" 
          :key="feature.id"
          :icon="feature.iconClass"
          :title="feature.title"
          :description="feature.description"
          v-scroll-animation 
          :style="{ transitionDelay: `${index * 0.1}s` }" 
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
      iconClass: 'fas fa-bolt', 
      title: 'Instant Card Generation',
      description: 'Get AI- Generated Cards, Games, or studying PDFs in seconds.',
    },
    {
      id: 2,
      iconClass: 'fas fa-eye', 
      title: 'Live Preview',
      description: 'See your generated code rendered or visualized instantly without leaving the editor.',
    },
    {
      id: 3,
      iconClass: 'fas fa-pencil-alt', 
      title: 'Seamless Editing',
      description: 'Refine and modify the generated cards with our integrated editing tools and suggestions.',
    },
    {
      id: 4,
      iconClass: 'fas fa-cloud-upload-alt', 
      title: 'Cloud Sync',
      description: 'Save your work and access your flashcards from anywhere.',
    },
    {
      id: 5,
      iconClass: 'fas fa-share-alt',
      title: 'Easy Collaboration',
      description: 'Share your generated Flashcards, PDFs, and Quizzes with your team members effortlessly.',
    },
    {
      id: 6,
      iconClass: 'fas fa-shield-alt',
      title: 'Secure & Private',
      description: 'Your Flashcards and Information are kept private and secure with end-to-end encryption.',
    },
  ]);
  </script>

  <style scoped>
  .feature-list-container {
    padding: 60px 20px; 
    max-width: 1200px; 
    margin: 0 auto; 
  }

  .section-title {
    text-align: center;
    font-size: clamp(1.8rem, 5vw, 2.5rem); 
    color: #E2E8F0; 
    margin-bottom: 3rem; 
  }

  .feature-grid {
    display: grid;
    
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 5rem; 
  }

  @media (min-width: 992px) {
    .feature-grid {
     
    }
  }
  </style>'