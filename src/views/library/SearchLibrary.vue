<template>
  <main class="explore-content">
    <div class="view-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p v-if="searchQuery" class="search-query-subtext">
        for "{{ searchQuery }}"
      </p>
    </div>

    <div class="content-tab">

      <div v-if="loading" class="loading-indicator full-page-indicator">
        <font-awesome-icon :icon="getIcon('spinner')" spin size="3x"/>
        <p>Loading public sets...</p>
      </div>

      <div v-else-if="error" class="error-message full-page-error">
        <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="3x" class="error-icon"/>
        <p>Could not load public sets.</p>
        <pre>Error: {{ error.message }}</pre>
      </div>

      <div v-else-if="setsToDisplay && setsToDisplay.length > 0">
        <div v-for="group in groupedFlashcardSets" :key="group.title" class="date-group">
          <h3 class="group-title">{{ group.title }}</h3>
          <div class="flashcard-sets-grid">
            <div v-for="set in group.sets" :key="set.id" class="flashcard-set-card-wrapper">
              <router-link :to="{ name: 'readSet', params: { id: set.id }}" class="flashcard-set-card-link">
                <div class="flashcard-set-card">
                  <h4 class="set-title">{{ set.title || 'Untitled Set' }}</h4>
                  <p class="set-description">{{ set.description || 'No description.' }}</p>
                  <div class="set-footer">
                    <div class="author-section">
                      <div v-if="set.author" class="author-info-link-wrapper">
                        <router-link
                            :to="getAuthorLink(set.author)"
                            class="author-info-link"
                            @click.stop>
                          <div class="author-profile-icon">
                            <img
                                v-if="getAuthorPictureUrl(set.author)"
                                :src="getAuthorPictureUrl(set.author)"
                                :alt="`${set.author.username}'s profile picture`"
                                class="author-pic-small"
                                @error="onAuthorPicError"/>
                            <span v-else class="author-initials-small">
                                       {{ getAuthorInitials(set.author) }}
                                   </span>
                          </div>
                          <span class="author-username">@{{ set.author.username }}</span>
                        </router-link>
                      </div>
                      <div v-else class="author-info-link-wrapper">
                              <span class="author-info-link author-unknown">
                                 <div class="author-profile-icon">
                                      <span class="author-initials-small">?</span>
                                 </div>
                                 <span class="author-username">@Unknown Author</span>
                              </span>
                      </div>
                    </div>

                    <div class="set-metadata">
                        <span class="meta-item tooltip-container card-count"
                              :data-tooltip="`${set.flashcards?.length ?? 0} Cards`">
                          <font-awesome-icon :icon="getIcon('layer-group')" fixed-width/>
                          {{ set.flashcards?.length ?? 0 }}
                        </span>
                      <span class="meta-item tooltip-container creation-date"
                            :data-tooltip="`Created: ${formatDate(set.creationDate, { dateStyle: 'long', timeStyle: 'short' })}`">
                           <font-awesome-icon :icon="getIcon('calendar-days')" fixed-width/>
                           {{ formatDate(set.creationDate, {month: 'short', day: 'numeric', year: 'numeric'}) }}
                        </span>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 0" class="pagination-button">
            <font-awesome-icon :icon="getIcon('chevron-left')"/>
            Previous
          </button>
          <div class="pagination-info">
            Page {{ currentPage + 1 }} of {{ totalPages }}
          </div>
          <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="pagination-button">
            Next
            <font-awesome-icon :icon="getIcon('chevron-right')"/>
          </button>
        </div>
      </div>

      <div v-else class="no-content-message full-page-error">
        <p>{{ searchQuery ? `No public sets found matching "${searchQuery}".` : 'No public flashcard sets found.' }}</p>
      </div>

    </div>
  </main>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useQuery} from '@vue/apollo-composable';
import {FIND_PUBLIC_FLASHCARD_SETS, SEARCH_PUBLIC_FLASHCARD_SETS, ME_QUERY} from '@/graphql/auth.js';

// --- Font Awesome Icons ---
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faSearch, faChevronLeft, faChevronRight, faCalendarDays, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation, faSearch, faChevronLeft, faChevronRight, faCalendarDays, faLayerGroup
);
const icons = {
  'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation,
  'search': faSearch, 'chevron-left': faChevronLeft, 'chevron-right': faChevronRight,
  'layer-group': faLayerGroup, 'calendar-days': faCalendarDays
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

// --- Component State ---
const route = useRoute();
const currentPage = ref(0);
const pageSize = ref(12);

// --- GraphQL Queries ---
const {result: meResult} = useQuery(ME_QUERY, null, {fetchPolicy: 'cache-first'});
const loggedInUserId = computed(() => meResult.value?.me?.id ?? null);

const searchQuery = computed(() => (route.query.q || '').toString().trim());

const currentQuery = computed(() => {
  return searchQuery.value ? SEARCH_PUBLIC_FLASHCARD_SETS : FIND_PUBLIC_FLASHCARD_SETS;
});

const queryVariables = computed(() => {
  const variables = {
    page: currentPage.value,
    size: pageSize.value
  };
  if (searchQuery.value) {
    variables.query = searchQuery.value;
  }
  return variables;
});

const {result, loading, error} = useQuery(
    currentQuery,
    queryVariables,
    {
      fetchPolicy: 'cache-first',
      enabled: computed(() => true)
    }
);

// --- Computed Data Processing ---
const queryResultData = computed(() => {
  if (!result.value) return null;
  return searchQuery.value
      ? result.value.searchPublicFlashcardSets
      : result.value.findPublicFlashcardSets;
});

// Extract the list of sets to display from the query result
const setsToDisplay = computed(() => queryResultData.value?.items ?? []);

// Get the total number of pages from the query result for pagination
const totalPages = computed(() => queryResultData.value?.pageInfo?.totalPages ?? 0);

// Determine the page title based on whether a search is active
const pageTitle = computed(() => {
  return searchQuery.value ? 'Search Results' : 'Explore Public Sets';
});

// Sort by creation date (descending)
const sortedFlashcardSets = computed(() => {
  if (!Array.isArray(setsToDisplay.value)) return [];
  return [...setsToDisplay.value].sort((a, b) => {
    const dateA = a?.creationDate ? new Date(a.creationDate).getTime() : 0;
    const dateB = b?.creationDate ? new Date(b.creationDate).getTime() : 0;
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });
});

// Group the sorted sets into relative date categories for display
const groupedFlashcardSets = computed(() => {
  const groups = {};
  sortedFlashcardSets.value.forEach(set => {
    const groupTitle = getRelativeDateGroup(set.creationDate);
    if (!groups[groupTitle]) {
      groups[groupTitle] = {title: groupTitle, sets: []};
    }
    groups[groupTitle].sets.push(set);
  });

  const relativeOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days"];
  const relativeGroups = [];
  const monthlyGroups = [];

  for (const title in groups) {
    if (relativeOrder.includes(title)) {
      relativeGroups.push(groups[title]);
    } else if (title !== "Unknown Date" && title !== "Invalid Date") {
      monthlyGroups.push(groups[title]);
    }
  }

  relativeGroups.sort((a, b) => relativeOrder.indexOf(a.title) - relativeOrder.indexOf(b.title));
  monthlyGroups.sort((a, b) => {
    try {
      return new Date(`1 ${b.title}`).getTime() - new Date(`1 ${a.title}`).getTime();
    } catch (e) {
      return 0;
    }
  });

  return [...relativeGroups, ...monthlyGroups];
});

// --- Watcher ---
watch(() => route.query.q, (newQuery, oldQuery) => {
  if (newQuery !== oldQuery) {
    currentPage.value = 0;
  }
});

// --- Helper Functions ---
function getRelativeDateGroup(dateString) {
  if (!dateString) return "Unknown Date";
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const sevenDaysAgoStart = new Date(todayStart);
  sevenDaysAgoStart.setDate(todayStart.getDate() - 7);
  const thirtyDaysAgoStart = new Date(todayStart);
  thirtyDaysAgoStart.setDate(todayStart.getDate() - 30);
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  if (date >= sevenDaysAgoStart) return "Previous 7 Days";
  if (date >= thirtyDaysAgoStart) return "Previous 30 Days";

  return date.toLocaleDateString(navigator.language || 'en-US', {month: 'long', year: 'numeric'});
}

function getAuthorLink(author) {
  if (!author?.id || !author?.username) return '#';
  return author.id === loggedInUserId.value ? '/profile' : `/profile/${author.username}`;
}

function getAuthorPictureUrl(author) {
  if (!author?.files || !author?.id) {
    return null;
  }
  const profilePicFile = author.files.find(file => file?.contentType?.startsWith('image/'));
  if (profilePicFile?.filename) {
    // TODO: Use variable for prod.
    const baseUrl = 'http://localhost:8080';
    return `${baseUrl}/profile/${profilePicFile.filename}?userId=${author.id}&t=${Date.now()}`;
  }
  return null;
}

function getAuthorInitials(author) {
  const first = author?.firstName?.[0] || '';
  const last = author?.lastName?.[0] || '';
  return (first + last).toUpperCase() || author?.username?.[0]?.toUpperCase() || '?';
}

function onAuthorPicError(event) {
  event.target.style.display = 'none';
}

function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString));
  } catch (e) {
    return 'Invalid Date'; // Fallback for errors
  }
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.explore-content, .explore-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.explore-content {
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
  gap: 5px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  padding: 0;
  color: var(--text-primary, white);
  margin: 0;
}

.search-query-subtext {
  font-size: 0.95em;
  font-weight: 400;
  color: var(--text-secondary, #adb5bd);
  margin: 0;
  padding: 0;
  line-height: 1.2;
}

.content-tab {
}

.tabs-wrapper > .content-tab:first-child {
  padding-top: 0;
}


.loading-indicator, .error-message, .no-content-message {
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
  border: 1px dashed var(--border-color, #3b3e56);
}

.loading-indicator p, .error-message p, .no-content-message p {
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

.no-content-message p {
  margin: 0;
}

.date-group {
  margin-bottom: 30px;
}

.group-title {
  font-size: 1.3em;
  font-weight: 500;
  color: var(--text-primary, #e0e0e0);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color-lighter, #4a4e69);
}

.content-tab > div:first-child > .date-group:first-child {
  margin-top: 0;
}

.date-group:last-child {
  margin-bottom: 10px;
}

.flashcard-sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  padding: 15px 0;
  gap: 15px;
}

.pagination-button {
  background-color: var(--bg-tertiary, #1f2640);
  color: var(--sidebar-active, #5f98ef);
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
  border-color: var(--sidebar-active, #5f98ef);
  color: white;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary, #adb5bd);
  font-size: 0.9em;
}

.flashcard-set-card-wrapper {
  display: block;
  height: 100%;
}

.flashcard-set-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.flashcard-set-card {
  background: var(--bg-secondary, #1a2036);
  border-radius: 12px;
  border: 1px solid var(--border-color, #3b3e56);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 20px 25px;
}

.flashcard-set-card-wrapper:hover .flashcard-set-card {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  border-color: var(--sidebar-active, #5f98ef);
}

.set-title {
  font-size: 1.15em;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.set-description {
  font-size: 0.9em;
  color: var(--text-secondary, #adb5bd);
  line-height: 1.5;
  margin-bottom: 15px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 4.05em;
}

.set-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #3b3e56);
  margin-top: auto;
  min-height: 30px;
  gap: 10px;
}

.author-section {
  min-width: 0;
  flex-shrink: 1;
  overflow: hidden;
}

.author-info-link-wrapper {
  min-width: 0;
}

.author-info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  max-width: 100%;
}

.author-unknown {
  cursor: default;
}

.author-username {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-secondary, #adb5bd);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.author-info-link:not(.author-unknown):hover .author-username {
  color: var(--link-color, #5f98ef);
  text-decoration: underline;
}

.author-profile-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #4a5a78;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 9px;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.author-profile-icon .author-pic-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-profile-icon .author-initials-small {
  line-height: 1;
}

.set-metadata {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85em;
  color: var(--text-secondary, #adb5bd);
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.meta-item svg {
  color: var(--sidebar-active, #5f98ef);
}

.tooltip-container {
  position: relative;
  cursor: default;
}

.tooltip-container::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-tertiary, #1f2640);
  color: var(--text-primary, #ffffff);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: nowrap;
  z-index: 15;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
  pointer-events: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.card-count.tooltip-container::before {
  left: 0;
  transform: translateX(0);
}

.creation-date.tooltip-container::before {
  left: auto;
  right: 0;
  transform: translateX(0);
}

.tooltip-container:hover::before {
  opacity: 1;
  visibility: visible;
}
</style>
