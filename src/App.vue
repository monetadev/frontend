<script setup>
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-container">
    <div class="content-wrapper">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
}
</style>
