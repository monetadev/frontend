<template>
  <div class="search-container">
    <div class="search-box">
      <span class="icon search-icon">
        <font-awesome-icon :icon="getIcon('search')" />
      </span>

      <input
          type="text"
          :placeholder="placeholderText"
          v-model="searchInputValue"
          @keyup.enter="performSearch"
          aria-label="Search Public Sets"
      />

      <span v-if="searchInputValue" class="icon reset-icon" @click="clearSearch" role="button" aria-label="Clear search">
        <font-awesome-icon :icon="getIcon('times')" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter

// --- Font Awesome Setup ---
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

library.add(faSearch, faTimes);

const faIcons = {
  'search': faSearch,
  'times': faTimes
};

function getIcon(iconName) {
  return faIcons[iconName];
}
// --- End Font Awesome Setup ---

// --- Component State ---
const searchInputValue = ref("");
const router = useRouter(); // Initialize router

// Placeholder text
const placeholderText = "Search public sets...";

// --- Methods ---
function performSearch() {
  const query = searchInputValue.value.trim();
  if (query) {
    // Redirect to explore page with query parameter 'q'
    router.push({ path: '/explore', query: { q: query } });
  }
  // Optionally clear input after search, or leave it
  // searchInputValue.value = "";
}

function clearSearch() {
  searchInputValue.value = "";
}

// Define emits if needed elsewhere (not used for this redirection)
// const emit = defineEmits(['searchPerformed']);

</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  font-family: "Outfit", sans-serif;
  /* Define dark theme variables specific to search */
  --search-bg: #22293A; /* Darker bg, similar to sidebar */
  --search-bg-focus: #22293A; /* Match navbar bg on focus */
  --search-border: #1b2233; /* Match navbar border */
  --search-border-focus: #1b2233; /* Highlight color */
  --search-text-color: #e0e0e0; /* Match navbar text */
  --search-placeholder-color: #8a92a3; /* Dimmer grey */
  --search-icon-color: #a0a8b8; /* Icon color */
  /* Dropdown variables removed as dropdown is gone */
}

.search-box {
  display: flex;
  align-items: center;
  background-color: var(--search-bg);
  border: 1px solid var(--search-border);
  padding: 0 12px;
  border-radius: 20px;
  height: 38px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.search-box:focus-within {
  background-color: var(--search-bg-focus);
  border-color: var(--search-border-focus);
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3); /* Focus ring using highlight color */
}

/* Input field styling */
input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--search-text-color);
  font-size: 14px;
  height: 100%;
  padding: 0 8px;
}
input::placeholder {
  color: var(--search-placeholder-color);
  opacity: 1; /* Ensure placeholder is visible */
}

/* Icon styling */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--search-icon-color);
  font-size: 16px;
}

.search-icon {
  margin-left: 4px;
}

.reset-icon {
  margin-left: 8px;
  margin-right: 4px;
  cursor: pointer;
  color: var(--search-icon-color);
  transition: color 0.2s ease;
}
.reset-icon:hover {
  color: #ffffff; /* Brighten clear icon on hover */
}

</style>