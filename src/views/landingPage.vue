<template>
  <div class="landing-page">
    <div class="main-content">
      <NavigationBar :isSidebarCollapsed="true" />

      <HeroText mainText="Make your studying easier">
        <p class="sub-headline">Generate, preview, and edit flashcards instantly.</p>
      </HeroText>


      <FeatureList />

      <HeroText
        mainText="Breaking the boundaries between AI and Studying"
        class="bottom-hero"
      />

      <TechStackSection />
      
      <AboutSection />

    </div>
  </div>
</template>

<script setup>
// Ensure the paths to your components are correct
import NavigationBar from '@/components/landingNav.vue';
import HeroText from '@/components/landinglargeText.vue';
import FeatureList from '@/components/FeatureList.vue';
import AboutSection from '@/components/aboutSection.vue';
import TechStackSection from '@/components/techSection.vue'; 

</script>

<style scoped>
/* Keep your existing scoped styles for landing-page, main-content, etc. */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.landing-page {
  font-family: "Outfit", sans-serif;
  display: flex;
  min-height: 100vh;
  background-color: #22293A; /* Dark background */
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%; /* Ensure it takes full width */
}

/* Styles from previous examples (.sub-headline, .content, .bottom-hero, etc.) */
.sub-headline {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: #A0AEC0;
  font-weight: 400;
  margin-top: 0.5rem;
  max-width: 100%;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

/* Remove .content styles if it's truly unused now */
/*
.content {
  padding: 40px 20px;
  text-align: center;
  color: #CBD5E0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
*/

.bottom-hero {
  margin-top: auto; /* This will push the bottom hero down after all content */
  padding-top: 60px; /* Increased padding for better spacing */
  padding-bottom: 60px;
}

.bottom-hero :deep(.hero-text) {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  color: #E2E8F0;
}

</style>