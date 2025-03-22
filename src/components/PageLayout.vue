<template>
  <div class="page-layout">
    <slot></slot>
  </div>
</template>

<script setup>
// Simple layout component to ensure consistent page structure
</script>

<style scoped>
.page-layout {
  min-height: calc(100vh - 350px); /* Adjust based on footer height */
  padding-bottom: 2rem;
}
</style> 