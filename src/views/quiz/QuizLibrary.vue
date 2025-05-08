<template>
  <main class="quiz-library-content">
    <div class="view-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="content-tab">
      <div v-if="loading" class="loading-indicator full-page-indicator">
        <font-awesome-icon :icon="getIcon('spinner')" spin size="3x"/>
        <p>Loading your quizzes...</p>
      </div>

      <div v-else-if="error" class="error-message full-page-error">
        <font-awesome-icon :icon="getIcon('triangle-exclamation')" size="3x" class="error-icon"/>
        <p>Could not load your quizzes.</p>
        <pre>Error: {{ error.message }}</pre>
      </div>

      <div v-else-if="quizzesToDisplay && quizzesToDisplay.length > 0">
        <div v-for="group in groupedQuizzes" :key="group.title" class="date-group">
          <h3 class="group-title">{{ group.title }}</h3>
          <div class="quiz-grid">
            <div v-for="quiz in group.quizzes" :key="quiz.id" class="quiz-card-wrapper">
              <router-link :to="{ name: 'quizOverview', params: { id: quiz.id }}" class="quiz-card-link" :title="`View details for ${quiz.title}`">
                <div class="quiz-card">
                  <h4 class="quiz-card-title">{{ quiz.title || 'Untitled Quiz' }}</h4>
                  <p v-if="quiz.description" class="quiz-card-description">{{ quiz.description }}</p>
                  <p v-else class="quiz-card-description no-description">No description provided.</p>

                  <div class="quiz-card-source-set">
                    <font-awesome-icon :icon="getIcon('layer-group')" class="source-set-icon"/>
                    <span>Based on set: <strong>{{ quiz.flashcardSet?.title || 'Untitled Set' }}</strong></span>
                  </div>

                  <div class="quiz-card-footer">
                    <div class="author-section">
                       <span class="meta-item tooltip-container"
                             :data-tooltip="`Source set by: @${quiz.flashcardSet?.author?.username || 'Unknown'}`">
                        <div v-if="quiz.flashcardSet?.author" class="author-info-link-wrapper">
                           <router-link
                               :to="getAuthorLink(quiz.flashcardSet.author)"
                               class="author-info-link"
                               @click.stop>
                          <div class="author-profile-icon">
                            <img
                                v-if="getAuthorPictureUrl(quiz.flashcardSet.author)"
                                :src="getAuthorPictureUrl(quiz.flashcardSet.author)"
                                :alt="`${quiz.flashcardSet.author.username}'s profile picture`"
                                class="author-pic-small"
                                @error="onAuthorPicError($event, quiz.flashcardSet.author)"/>
                            <span v-else class="author-initials-small">
                                {{ getAuthorInitials(quiz.flashcardSet.author) }}
                            </span>
                          </div>
                          <span class="author-username">@{{ quiz.flashcardSet.author.username }}</span>
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
                       </span>
                    </div>

                    <div class="quiz-card-metadata">
                      <span class="meta-item tooltip-container"
                            :data-tooltip="`${quiz.questions?.length ?? 0} Questions`">
                        <font-awesome-icon :icon="getIcon('list-ol')" fixed-width/>
                        {{ quiz.questions?.length ?? 0 }}
                      </span>
                      <span class="meta-item tooltip-container"
                            :data-tooltip="`Created: ${formatDate(quiz.creationDate, { dateStyle: 'long', timeStyle: 'short' })}`">
                         <font-awesome-icon :icon="getIcon('calendar-days')" fixed-width/>
                         {{ formatDate(quiz.creationDate, {month: 'short', day: 'numeric', year: 'numeric'}) }}
                      </span>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button @click="prevPage" :disabled="loading || currentPage === 0" class="pagination-button">
            <font-awesome-icon :icon="getIcon('chevron-left')"/>
            Previous
          </button>
          <div class="pagination-info">
            Page {{ currentPage + 1 }} of {{ totalPages }}
          </div>
          <button @click="nextPage" :disabled="loading || currentPage >= totalPages - 1" class="pagination-button">
            Next
            <font-awesome-icon :icon="getIcon('chevron-right')"/>
          </button>
        </div>
      </div>

      <div v-else class="no-content-message full-page-error">
        <font-awesome-icon :icon="getIcon('file-circle-question')" size="3x" class="info-icon"/>
        <p>You haven't created any quizzes yet.</p>
        <router-link :to="{ name: 'createQuiz' }" class="primary-action-link">
          Create Your First Quiz
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { GET_MY_QUIZZES, ME_QUERY } from '@/graphql/auth.js';

// --- Font Awesome Icons ---
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faChevronLeft, faChevronRight,
  faCalendarDays, faLayerGroup, faListOl, faFileCircleQuestion, faBookOpenReader
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faSpinner, faTriangleExclamation, faChevronLeft, faChevronRight,
    faCalendarDays, faLayerGroup, faListOl, faFileCircleQuestion, faBookOpenReader
);

const icons = {
  'spinner': faSpinner,
  'triangle-exclamation': faTriangleExclamation,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  'calendar-days': faCalendarDays,
  'layer-group': faLayerGroup,
  'list-ol': faListOl,
  'file-circle-question': faFileCircleQuestion,
  'book-open-reader': faBookOpenReader,
};

function getIcon(iconName) {
  return icons[iconName] || faTriangleExclamation;
}

const route = useRoute();
const router = useRouter();
const currentPage = ref(0);
const pageSize = ref(9);

const { result: meResult } = useQuery(ME_QUERY, null, { fetchPolicy: 'cache-first' });
const loggedInUserId = computed(() => meResult.value?.me?.id ?? null);

const queryVariables = computed(() => ({
  page: currentPage.value,
  size: pageSize.value,
}));

const { result, loading, error, refetch } = useQuery(
    GET_MY_QUIZZES,
    queryVariables,
    {
      fetchPolicy: 'cache-and-network',
      onError: (err) => {
        console.error("Error fetching GET_MY_QUIZZES:", JSON.stringify(err, null, 2));
      }
    }
);

const queryResultData = computed(() => result.value?.getMyQuizzes);
const quizzesToDisplay = computed(() => queryResultData.value?.items ?? []);
const totalPages = computed(() => queryResultData.value?.pageInfo?.totalPages ?? 0);

const pageTitle = computed(() => 'My Quizzes');

const sortedQuizzes = computed(() => {
  if (!Array.isArray(quizzesToDisplay.value)) return [];
  return [...quizzesToDisplay.value].sort((a, b) => {
    const dateA = a?.creationDate ? new Date(a.creationDate).getTime() : 0;
    const dateB = b?.creationDate ? new Date(b.creationDate).getTime() : 0;
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });
});

const groupedQuizzes = computed(() => {
  const groups = {};
  sortedQuizzes.value.forEach(quiz => {
    const groupTitle = getRelativeDateGroup(quiz.creationDate);
    if (!groups[groupTitle]) {
      groups[groupTitle] = { title: groupTitle, quizzes: [] };
    }
    groups[groupTitle].quizzes.push(quiz);
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
      const dateBParts = b.title.split(" ");
      const dateAParts = a.title.split(" ");
      return new Date(`${dateBParts[0]} 1, ${dateBParts[1]}`).getTime() - new Date(`${dateAParts[0]} 1, ${dateAParts[1]}`).getTime();
    } catch (e) { return 0; }
  });

  const unknownGroup = groups["Unknown Date"] || groups["Invalid Date"];
  return [...relativeGroups, ...monthlyGroups, ...(unknownGroup ? [unknownGroup] : [])];
});

watch(currentPage, () => { refetch(); });

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
  return date.toLocaleDateString(navigator.language || 'en-US', { month: 'long', year: 'numeric' });
}

function getAuthorLink(author) {
  if (!author?.id || !author?.username) return { path: '#' }; // Return a non-functional link object
  // Corrected to use route names from router.js
  return author.id === loggedInUserId.value
      ? { name: 'privateProfile' }
      : { name: 'publicProfile', params: { username: author.username } };
}

function getAuthorPictureUrl(author) {
  if (!author?.id) { // Only need author.id based on new backend logic
    return null;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  // Corrected URL structure: VITE_API_BASE_URL/profile/{userId}
  return `${baseUrl}/profile/${author.id}?t=${new Date().getTime()}`; // Added cache-busting
}

function getAuthorInitials(author) {
  if (!author) return '?';
  const first = author.firstName?.[0] || '';
  const last = author.lastName?.[0] || '';
  return (first + last).toUpperCase() || author.username?.[0]?.toUpperCase() || '?';
}

function onAuthorPicError(event, author) {
  // This function is called when the <img> tag fails to load an image.
  // It hides the <img> tag and ensures the initials are displayed.
  event.target.style.display = 'none'; // Hide the broken image
  const iconContainer = event.target.closest('.author-profile-icon');
  if (iconContainer) {
    let initialsSpan = iconContainer.querySelector('.author-initials-small');
    if (!initialsSpan) { // If initials span doesn't exist, create and append it
      initialsSpan = document.createElement('span');
      initialsSpan.className = 'author-initials-small';
      initialsSpan.textContent = getAuthorInitials(author); // Ensure author is passed or accessible
      iconContainer.appendChild(initialsSpan);
    }
    initialsSpan.style.display = 'inline'; // Make sure it's visible
  }
}

function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', options).format(new Date(dateString));
  } catch (e) { return 'Invalid Date'; }
}

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
/* Styles remain the same as previously provided */
:root {
  --primary-color: #5F98EF;
  --primary-color-rgb: 95, 152, 239; /* Added for rgba */
  --bg-primary: #121729;
  --bg-secondary: #1b2233; /* Card background */
  --bg-tertiary: #2a335a; /* Button, pagination bg */
  --text-primary: #ffffff;
  --text-secondary: #a0a8c2; /* Subtitles, meta text */
  --border-color: #303854; /* Card borders, dividers */
  --border-color-lighter: #4a4e69; /* Group title border */
  --error-color: #ff6b6b;
  --link-color-hover: var(--primary-color);
}

.quiz-library-content, .quiz-library-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.quiz-library-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  color: var(--text-primary);
}

.view-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.content-tab { }

.loading-indicator, .error-message, .no-content-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
  min-height: 300px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
  margin-top: 20px;
}

.loading-indicator p, .error-message p, .no-content-message p {
  margin-top: 20px;
  font-size: 1.15em;
  color: var(--text-primary);
}
.no-content-message .info-icon {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.error-message .error-icon {
  color: var(--error-color);
}

.error-message pre {
  background-color: rgba(255, 107, 107, 0.05);
  color: var(--error-color);
  padding: 12px 18px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.primary-action-link {
  margin-top: 25px;
  padding: 12px 25px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.primary-action-link:hover {
  background-color: color-mix(in srgb, var(--primary-color), #000 10%);
}


.date-group {
  margin-bottom: 35px;
}

.group-title {
  font-size: 1.35em;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.quiz-card-wrapper {
  display: block;
  height: 100%;
}

.quiz-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.quiz-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 20px 25px;
}

.quiz-card-wrapper:hover .quiz-card {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(var(--primary-color-rgb), 0.2);
  border-color: var(--primary-color);
}

.quiz-card-title {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quiz-card-description {
  font-size: 0.9em;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.5em * 3);
}
.quiz-card-description.no-description {
  font-style: italic;
}

.quiz-card-source-set {
  font-size: 0.85em;
  color: var(--text-secondary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-top: auto;
}
.quiz-card-source-set .source-set-icon {
  color: var(--primary-color);
  opacity: 0.8;
}
.quiz-card-source-set strong {
  color: var(--text-primary);
  font-weight: 500;
}

.quiz-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: auto;
  min-height: 30px;
  gap: 10px;
}

.author-section {
  min-width: 0;
  flex-shrink: 1;
  overflow: hidden;
}
.author-info-link-wrapper { min-width: 0; }
.author-info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  max-width: 100%;
}
.author-unknown { /* Style for when author data is missing */
  cursor: default;
}
.author-username {
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}
.author-info-link:not(.author-unknown):hover .author-username {
  color: var(--link-color-hover);
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
.author-pic-small { width: 100%; height: 100%; object-fit: cover; }
.author-initials-small { line-height: 1; display: inline; }


.quiz-card-metadata {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.85em;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta-item svg {
  color: var(--primary-color);
  opacity: 0.9;
}


.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 35px;
  padding: 20px 0;
  gap: 20px;
  border-top: 1px solid var(--border-color);
}

.pagination-button {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.pagination-button:hover:not(:disabled) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}
.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-info {
  color: var(--text-secondary);
  font-size: 0.95em;
}

.tooltip-container {
  position: relative;
  cursor: default;
}
.tooltip-container::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 140%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8em;
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
  pointer-events: none;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}
.tooltip-container:hover::before {
  opacity: 1;
  visibility: visible;
}
.author-section .tooltip-container::before {
  left: 0;
  transform: translateX(0);
}
.quiz-card-metadata .meta-item:last-child .tooltip-container::before {
  left: auto;
  right: 0;
  transform: translateX(0);
}


@media (max-width: 768px) {
  .quiz-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .page-title { font-size: 1.6em; }
  .group-title { font-size: 1.2em; }
  .pagination-button { padding: 8px 15px; font-size: 0.9em; }
}

@media (max-width: 480px) {
  .quiz-library-content { padding: 15px; }
  .quiz-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .quiz-card { padding: 15px 20px; }
  .quiz-card-title { font-size: 1.1em; }
  .quiz-card-description { font-size: 0.85em; -webkit-line-clamp: 2; min-height: calc(1.5em * 2); }
  .quiz-card-footer { flex-direction: column; align-items: flex-start; gap: 8px;}
  .quiz-card-metadata { width: 100%; justify-content: space-between;}
  .pagination-controls { flex-direction: column; gap: 10px; }
}
</style>