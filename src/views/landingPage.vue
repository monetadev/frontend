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
  width: 100%; 
}

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



.bottom-hero {
  margin-top: auto; 
  padding-top: 60px; 
  padding-bottom: 60px;
}

.bottom-hero :deep(.hero-text) {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  color: #E2E8F0;
}

</style>