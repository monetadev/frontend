<script setup>
import MainLayout from '@/layouts/MainLayout.vue';
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Toast from "@/components/ui/Toast.vue";

const route = useRoute();

const noLayoutRoutes = ['/', '/login', '/register'];

const layout = computed(() => {
  return noLayoutRoutes.includes(route.path) ? null : MainLayout;
});

const updateBodyScroll = () => {
  if (route.path === '/') {
    document.body.classList.add('scroll-enabled');
  } else {
    document.body.classList.remove('scroll-enabled');
  }
};

onMounted(updateBodyScroll);
watch(() => route.path, updateBodyScroll);
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
