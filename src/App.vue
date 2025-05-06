<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Toast from "@/components/ui/Toast.vue";

const route = useRoute();

const layout = computed(() => {
  const noLayoutRoutes = ['/login', '/register'];
  if (noLayoutRoutes.includes(route.path)) {
    return null;
  }

  return MainLayout;
});
</script>

<template>
  <component :is="layout" v-if="layout">
    <router-view></router-view>
  </component>

  <div v-else class="plain-content-wrapper">
    <router-view></router-view>
  </div>

  <Toast />
</template>

<style>
.plain-content-wrapper {
  height: 100%;
}
</style>
