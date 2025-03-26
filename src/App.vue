<script setup>
import Footer from './components/Footer.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Toast from "@/components/ToastFunction.vue";

const route = useRoute();

// List of routes where the footer should be hidden
const hideFooterRoutes = ['/signup', '/settings', '/reset-password'];

// Computed property to determine if the footer should be shown
const showFooter = computed(() => {
  return !hideFooterRoutes.includes(route.path);
});
</script>

<template>
  <div class="app-container">
    <div class="content-wrapper">
      <router-view />
      <Toast />
    </div>
    <Footer v-if="showFooter" />
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
