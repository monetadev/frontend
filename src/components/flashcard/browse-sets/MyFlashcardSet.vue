<template>
  <div class="flashcard-sets-display">
    <div v-if="loading" class="content-loading-indicator">
      <font-awesome-icon :icon="getIcon('spinner')" spin /> Loading your sets...
    </div>

    <div v-else-if="error" class="content-error-message">
      <font-awesome-icon :icon="getIcon('triangle-exclamation')" /> Error loading sets: {{ error.message }}
    </div>

    <div v-else-if="groupedFlashcardSets && groupedFlashcardSets.length > 0">
      <div v-for="group in groupedFlashcardSets" :key="group.title" class="date-group">
        <h3 class="group-title">{{ group.title }}</h3>
        <div class="flashcard-sets-grid">
          <FlashcardSetCard
              v-for="set in group.sets"
              :key="set.id"
              :set="set"
              :hide-visibility="false"
              :logged-in-user-id="loggedInUserId"
          />
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && flashcardSetsRaw.length > 0" class="no-content-message">
      <p>No sets found matching "{{ searchQuery }}".</p>
    </div>
    <div v-else class="no-content-message">
      <p>You haven't created any flashcard sets yet.</p>
      <router-link to="/create/set" class="action-button create-button">
        Create Your First Set
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
// Import necessary queries and components
import { FIND_MY_SETS_QUERY, ME_QUERY } from '@/graphql/auth.js';
import FlashcardSetCard from "@/components/flashcard/browse-sets/FlashcardSetCard.vue";

// Font Awesome Setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation
);

// Icon map
const icons = {
  'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation
};
// Helper
function getIcon(iconName) { return icons[iconName] || faTriangleExclamation; }

// Props definition
const props = defineProps({
  userId: { type: String, required: true },
  searchQuery: { type: String, default: '' },
  // Accept page and size from parent
  page: { type: Number, default: 0 }, // Default to page 0
  size: { type: Number, default: 12 } // Default page size
});

// --- Define Emits ---
const emit = defineEmits(['update:page-info']);

// --- Fetch Logged-in User ID ---
const { result: meResult } = useQuery(ME_QUERY, null, { fetchPolicy: 'cache-first' });
const loggedInUserId = computed(() => meResult.value?.me?.id ?? null);

// GraphQL Query Logic for fetching sets based on props
const queryVariables = computed(() => {
  // Use page and size from props
  return {
    id: props.userId,
    page: props.page,
    size: props.size
  };
});
const { result: setsResult, loading, error } = useQuery(
    FIND_MY_SETS_QUERY,
    queryVariables,
    // Use watch to refetch if props change, enabled if userId is valid
    () => ({
      enabled: !!props.userId,
      fetchPolicy: 'cache-and-network',
      // Consider adding debounce if props change rapidly, though unlikely for pagination
      // debounce: 300,
    })
);

// Date Grouping Logic (remains the same)
function getRelativeDateGroup(dateString) { /* ... */
  if (!dateString) return "Unknown Date";
  const now = new Date(); const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate() - 1);
  const sevenDaysAgoStart = new Date(todayStart); sevenDaysAgoStart.setDate(todayStart.getDate() - 7);
  const thirtyDaysAgoStart = new Date(todayStart); thirtyDaysAgoStart.setDate(todayStart.getDate() - 30);
  const date = new Date(dateString); if (isNaN(date.getTime())) return "Invalid Date";
  if (date >= todayStart) return "Today"; if (date >= yesterdayStart) return "Yesterday";
  if (date >= sevenDaysAgoStart) return "Previous 7 Days"; if (date >= thirtyDaysAgoStart) return "Previous 30 Days";
  return date.toLocaleDateString(navigator.language || 'en-US', { month: 'long', year: 'numeric' });
}

// Computed Properties for Filtering, Sorting, Grouping (remains the same)
const flashcardSetsRaw = computed(() => setsResult.value?.findFlashcardSetByAuthorId?.items ?? []);
const filteredSets = computed(() => { /* ... */
  const query = props.searchQuery.trim().toLowerCase();
  if (!query) { return flashcardSetsRaw.value; }
  return flashcardSetsRaw.value.filter(set =>
      set.title?.toLowerCase().includes(query) || set.description?.toLowerCase().includes(query)
  );
});
const sortedFlashcardSets = computed(() => { /* ... */
  return [...filteredSets.value].sort((a, b) => {
    const dateA = a.creationDate ? new Date(a.creationDate).getTime() : 0;
    const dateB = b.creationDate ? new Date(b.creationDate).getTime() : 0;
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });
});
const groupedFlashcardSets = computed(() => { /* ... */
  const groups = {};
  sortedFlashcardSets.value.forEach(set => {
    const groupTitle = getRelativeDateGroup(set.creationDate);
    if (!groups[groupTitle]) { groups[groupTitle] = { title: groupTitle, sets: [] }; }
    groups[groupTitle].sets.push(set);
  });
  const relativeOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days"];
  const relativeGroups = []; const monthlyGroups = [];
  for (const title in groups) {
    if (relativeOrder.includes(title)) { relativeGroups.push(groups[title]); }
    else if (title !== "Unknown Date" && title !== "Invalid Date") { monthlyGroups.push(groups[title]); }
  }
  relativeGroups.sort((a, b) => relativeOrder.indexOf(a.title) - relativeOrder.indexOf(b.title));
  monthlyGroups.sort((a, b) => {
    try { return new Date(`1 ${b.title}`).getTime() - new Date(`1 ${a.title}`).getTime(); }
    catch(e) { console.error("Error parsing month group title:", e); return 0; }
  });
  return [...relativeGroups, ...monthlyGroups];
});

// Date Formatting Helper (remains the same)
function formatDate(dateString, options = {}) { /* ... */
  if (!dateString) return 'N/A';
  try { return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString)); }
  catch (e) { console.error("Error formatting date:", e); return 'Invalid Date'; }
}

// --- Watchers ---
// Watch for query result changes to emit page info
watch(setsResult, (newResult) => {
  const pageInfo = newResult?.findFlashcardSetByAuthorId?.pageInfo;
  if (pageInfo) {
    emit('update:page-info', {
      totalPages: pageInfo.totalPages ?? 0,
      currentPage: pageInfo.currentPage ?? 0, // Emit current page from result as well
      totalElements: pageInfo.totalElements ?? 0
    });
  } else {
    // Emit default/empty info if result clears or lacks pageInfo
    emit('update:page-info', { totalPages: 0, currentPage: 0, totalElements: 0 });
  }
}, { immediate: true }); // immediate: true to emit initial state

// Watch for errors
watch(error, (e) => { if(e) console.error("MyFlashcardSet Component Error:", JSON.stringify(e, null, 2)); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.flashcard-sets-display, .flashcard-sets-display * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.flashcard-sets-display { width: 100%; }

.date-group { margin-bottom: 30px; }
.group-title {
  font-size: 1.3em; font-weight: 500; color: var(--text-primary, #e0e0e0);
  margin-bottom: 15px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color-lighter, #4a4e69);
}
.date-group:last-child { margin-bottom: 10px; }

.content-loading-indicator, .content-error-message {
  padding: 15px; text-align: center; background: var(--bg-tertiary, #1f2640);
  color: var(--text-secondary, #adb5bd); border-radius: 8px; margin: 15px 0; font-size: 0.95em;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.content-error-message {
  color: var(--error-color, #ff6b6b); background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid var(--error-color, #ff6b6b);
}

.flashcard-sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.no-content-message {
  text-align: center; padding: 40px 20px; background-color: var(--bg-secondary, #1a2036);
  border-radius: 12px; margin-top: 20px; border: 1px dashed var(--border-color, #3b3e56);
  color: var(--text-secondary, #adb5bd);
}
.no-content-message p {
  margin: 0 0 20px 0;
  font-size: 1.05em;
}
.no-content-message p:only-child {
  margin-bottom: 0;
}

.action-button {
  display: inline-block; background-color: var(--sidebar-active, #5f98ef);
  color: var(--text-primary, #ffffff); padding: 10px 22px; border: none;
  border-radius: 6px; text-decoration: none; font-weight: 500;
  transition: background-color 0.3s ease, transform 0.1s ease; cursor: pointer; font-size: 0.95em;
}
.action-button:hover {
  background-color: #4a8adf; transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(95, 152, 239, 0.3);
}
</style>