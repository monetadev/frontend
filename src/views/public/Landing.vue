<template>
  <div class="landing-page">
    <div class="main-content">
      <LandingTopNav :isSidebarCollapsed="true"/>

      <LandingLargeText mainText="Make your studying easier">
        <p class="sub-headline">Generate, preview, and edit flashcards instantly.</p>
      </LandingLargeText>


      <FeatureList/>

      <LandingLargeText
          mainText="Breaking the boundaries between AI and Studying"
          class="bottom-hero"
      />

      <TechSection/>

      <AboutSection/>

    </div>
  </div>
</template>

<script setup>
import LandingTopNav from '@/components/landing/LandingTopNav.vue';
import LandingLargeText from '@/components/landing/LandingLargeText.vue';
import FeatureList from '@/components/landing/FeatureList.vue';
import AboutSection from '@/components/landing/AboutSection.vue';
import TechSection from '@/components/landing/TechSection.vue';
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.landing-page {
  font-family: "Outfit", sans-serif;
  display: flex;
  min-height: 100vh;
  background-color: #22293A;
  overflow-x: hidden;
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