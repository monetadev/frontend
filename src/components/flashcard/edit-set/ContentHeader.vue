<template>
  <div class="content-header">
    <div class="content-text">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <img :src="iconSrc" class="page-icon" :alt="iconAlt"/>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  iconSrc: {
    type: String,
    required: true
  },
  iconAlt: {
    type: String,
    default: 'Icon'
  }
});
</script>

<style scoped>
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 20px; /* Add padding below header */
  border-bottom: 1px solid var(--border-color, #3d4663); /* Add separator */
}

.content-text {
  text-align: left;
  flex: 1; /* Allow text to take available space */
  padding-right: 20px; /* Space before icon */
}

.content-text h1 {
  color: var(--text-primary, #ffffff);
  font-size: 2rem; /* Use rem */
  font-weight: 600; /* Slightly bolder */
  margin-bottom: 8px; /* Adjusted margin */
}

.content-text p {
  color: var(--text-secondary, #a4aabf); /* Use secondary text color */
  font-size: 1rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.page-icon {
  width: 150px; /* Slightly smaller */
  height: auto; /* Maintain aspect ratio */
  flex-shrink: 0; /* Prevent shrinking */
}
</style>