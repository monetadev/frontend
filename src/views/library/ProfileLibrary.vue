<template>
  <main class="library-content">
    <div class="view-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="content-tab">

      <div v-if="isLoadingTargetUser" class="loading-indicator full-page-indicator">
        <font-awesome-icon :icon="getIcon('spinner')" spin size="3x"/>
        <p>Loading user data...</p>
      </div>

      <div v-else-if="targetUserError" class="error-message full-page-error">
        <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="3x" class="error-icon"/>
        <p>Could not load user library data.</p>
        <pre v-if="targetUserError.message">Error: {{ targetUserError.message }}</pre>
      </div>

      <div v-else-if="targetUserId">
        <MyFlashcardSet
            :user-id="targetUserId"
            :page="currentPage"
            :size="pageSize"
            @update:page-info="handlePageInfoUpdate"/>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 0" class="pagination-button">
            <font-awesome-icon :icon="getIcon('chevron-left')"/>
            Previous
          </button>
          <div class="pagination-info">
            Page {{ currentPage + 1 }} of {{ totalPages }}
            <span v-if="totalElements !== null" class="total-elements">({{ totalElements }} total sets)</span>
          </div>
          <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="pagination-button">
            Next
            <font-awesome-icon :icon="getIcon('chevron-right')"/>
          </button>
        </div>
      </div>

      <div v-else class="info-state full-page-error">
        <p v-if="!isLoadingTargetUser && (routeUsername ? !targetUserResult?.findUserByUsername : !meResult?.me)">
          Could not find the specified user's library.
        </p>
        <p v-else>Could not determine the user for the library.</p>
      </div>

    </div>
  </main>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useQuery} from '@vue/apollo-composable';
import {ME_QUERY, FIND_USER_BY_USERNAME} from '@/graphql/auth.js';
import MyFlashcardSet from "@/components/flashcard/browse-sets/MyFlashcardSet.vue"; // Displays sets for a user

// --- Font Awesome Icons ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faSpinner, faTriangleExclamation, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTriangleExclamation, faChevronLeft, faChevronRight);
const icons = {
  'spinner': faSpinner,
  'triangle-exclamation': faTriangleExclamation,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

// --- Component State ---
const route = useRoute();
const currentPage = ref(0);
const pageSize = ref(12);
const totalPages = ref(0);
const totalElements = ref(null);

// --- Queries & User Logic ---
const routeUsername = computed(() => route.params.username);

const {
  result: meResult,
  loading: loadingMe,
  error: errorMe
} = useQuery(ME_QUERY, null, {
  fetchPolicy: 'cache-first',
  enabled: computed(() => !routeUsername.value)
});

const {
  result: targetUserResult,
  loading: loadingTargetUsername,
  error: errorTargetUsername
} = useQuery(FIND_USER_BY_USERNAME, () => ({
  username: routeUsername.value
}), {
  fetchPolicy: 'cache-first',
  enabled: computed(() => !!routeUsername.value)
});

const targetUserId = computed(() => {
  if (routeUsername.value) {
    return targetUserResult.value?.findUserByUsername?.id ?? null;
  } else {
    return meResult.value?.me?.id ?? null;
  }
});

const targetUsernameDisplay = computed(() => {
  if (routeUsername.value) {
    return targetUserResult.value?.findUserByUsername?.username ?? routeUsername.value;
  } else {
    return meResult.value?.me?.username ?? 'Unknown User';
  }
});

const isLoadingTargetUser = computed(() => {
  return routeUsername.value ? loadingTargetUsername.value : loadingMe.value;
});

const targetUserError = computed(() => {
  return routeUsername.value ? errorTargetUsername.value : errorMe.value;
});

// --- Computed Properties for UI ---
const pageTitle = computed(() => {
  if (isLoadingTargetUser.value) {
    return 'Loading Library...';
  }
  if (routeUsername.value) {
    // Someone else's library
    if (targetUserResult.value?.findUserByUsername) {
      return `@${targetUsernameDisplay.value}'s Sets`;
    } else if (!loadingTargetUsername.value) {
      return 'User Not Found';
    } else {
      return 'Loading Library...';
    }
  } else {
    if (meResult.value?.me || !loadingMe.value) {
      return 'Library';
    } else {
      return 'Loading Library...';
    }
  }
});

// --- Event Handlers ---
function handlePageInfoUpdate(pageInfo) {
  totalPages.value = pageInfo.totalPages;
  totalElements.value = pageInfo.totalElements;
}

// --- Pagination Methods ---
function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
}

// --- Watchers ---
// Reset pagination if the target user ID changes
watch(targetUserId, (newUserId, oldUserId) => {
  if (newUserId !== oldUserId && oldUserId !== undefined) {
    currentPage.value = 0;
    totalPages.value = 0;
    totalElements.value = null;
  }
}, {deep: true});

watch(() => route.params.username, (newUsername, oldUsername) => {
  if (newUsername !== oldUsername) {
    currentPage.value = 0;
    totalPages.value = 0;
    totalElements.value = null;
  }
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.library-content, .library-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.library-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.view-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #3b3e56);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin: 0;
  padding: 0;
  border-bottom: none;
  color: var(--text-primary, white);
}

.content-tab {
}

.tabs-wrapper > .content-tab:first-child {
  padding-top: 0;
}

.loading-indicator,
.error-message,
.info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary, #adb5bd);
  min-height: 250px;
  background-color: var(--bg-tertiary, #1a2036);
  border-radius: 8px;
  border: 1px dashed var(--border-color-lighter, #4a4e69);
  margin-top: 1.5rem;
}

.tabs-wrapper > .content-tab > .loading-indicator:only-child,
.tabs-wrapper > .content-tab > .error-message:only-child,
.tabs-wrapper > .content-tab > .info-state:only-child {
  margin-top: 0;
}


.loading-indicator p,
.error-message p,
.info-state p {
  margin-top: 15px;
  font-size: 1.1em;
  color: var(--text-primary, white);
}

.error-message .error-icon {
  color: var(--error-color, #ff6b6b);
}

.error-message pre {
  background-color: rgba(var(--error-color-rgb, 255, 107, 107), 0.1);
  color: var(--error-color, #ff6b6b);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid var(--error-color, #ff6b6b);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  padding: 15px 0;
  gap: 15px;
  border-top: 1px solid var(--border-color, #3b3e56);
}

.pagination-button {
  background-color: var(--bg-tertiary, #1f2640);
  color: var(--link-color, #5f98ef);
  border: 1px solid var(--border-color-lighter, #4a4e69);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--border-color-lighter, #4a4e69);
  border-color: var(--link-color, #5f98ef);
  color: white;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--bg-tertiary, #1f2640);
  border-color: var(--border-color-lighter, #4a4e69);
  color: var(--link-color, #5f98ef);
}

.pagination-info {
  color: var(--text-secondary, #adb5bd);
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-elements {
  font-size: 0.9em;
  color: var(--text-tertiary, #888);
}

.full-page-indicator, .full-page-error {
  border: none;
  background-color: transparent;
  min-height: 300px;
}
</style>
