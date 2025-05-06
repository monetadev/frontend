<template>
  <main class="view-content">

    <h2 v-if="flashcardSet" class="page-title">{{ flashcardSet.title }}</h2>
    <h2 v-else class="page-title">Flashcard Set</h2>

    <div v-if="loading || meLoading" class="loading-indicator full-page-indicator">
      <font-awesome-icon :icon="['fas', 'spinner']" spin size="3x"/>
      <p>Loading Set Details...</p>
    </div>

    <div v-else-if="error || meError" class="error-message full-page-error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="3x" class="error-icon"/>
      <p>Could not load flashcard set.</p>
      <pre v-if="error">Error: {{ error.message }}</pre>
      <pre v-if="meError">User Error: {{ meError.message }}</pre>
      <button @click="goBack" class="action-button error-action">Go Back</button>
    </div>

    <div v-else-if="!flashcardSet && !loading" class="info-state full-page-error">
      <font-awesome-icon :icon="['fas', 'search']" size="2x"/>
      <p>Flashcard set not found or access denied.</p>
      <button @click="goBack" class="action-button error-action">Go Back</button>
    </div>

    <div v-else-if="flashcardSet && currentUser" class="set-view-layout">
      <aside class="set-sidebar">
        <section class="settings-section set-info-section">
          <h3>Set Info</h3>
          <p v-if="flashcardSet.description" class="set-description">{{ flashcardSet.description }}</p>
          <div class="set-meta-info">
            <span><font-awesome-icon :icon="['fas', 'layer-group']"/> {{
                flashcards.length
              }} {{ flashcards.length === 1 ? 'Term' : 'Terms' }}</span>
            <span v-if="flashcardSet.author" class="author-container"><font-awesome-icon :icon="['fas', 'user-edit']"/> By <router-link
                :to="{ name: 'publicProfile', params: { username: flashcardSet.author.username } }" class="author-link">{{
                flashcardSet.author.username
              }}</router-link></span>
            <span><font-awesome-icon
                :icon="['fas', 'calendar-plus']"/> Created {{ formatCreationDate(flashcardSet.creationDate) }}</span>
            <template v-if="flashcardSet.lastUpdated"><span><font-awesome-icon :icon="['fas', 'calendar-check']"/> Updated {{
                formatUpdateDate(flashcardSet.lastUpdated)
              }}</span></template>
            <span><font-awesome-icon :icon="flashcardSet.isPublic ? ['fas', 'globe-americas'] : ['fas', 'lock']"/> {{
                flashcardSet.isPublic ? 'Public' : 'Private'
              }}</span>
          </div>
        </section>
        <section class="settings-section action-section">
          <h3>Actions</h3>
          <div class="action-buttons-layout">
            <div class="action-row">
              <button @click="navigateToFlashcards" class="action-button primary" title="Study Flashcards">
                <font-awesome-icon :icon="['fas', 'clone']"/>
                Study Cards
              </button>
              <button @click="navigateToMatchGame" class="action-button" title="Play Matching Game">
                <font-awesome-icon :icon="['fas', 'puzzle-piece']"/>
                Match Game
              </button>
            </div>
            <div class="action-row">
              <button @click="navigateToQuiz" class="action-button" title="Generate Quiz">
                <font-awesome-icon :icon="['fas', 'question-circle']"/>
                Take Quiz
              </button>
              <button @click="shareSet" class="action-button" title="Share Set">
                <font-awesome-icon :icon="['fas', 'share-alt']"/>
                Share Set
              </button>
            </div>
            <div class="action-row">
              <button @click="exportToJson" class="action-button" title="Export as JSON">
                <font-awesome-icon :icon="['fas', 'file-code']"/>
                Export JSON
              </button>
              <button @click="exportToCsv" class="action-button" title="Export as CSV">
                <font-awesome-icon :icon="['fas', 'file-csv']"/>
                Export CSV
              </button>
            </div>
            <template v-if="currentUser.id === flashcardSet.author?.id">
              <div class="action-row author-actions">
                <button @click="editSet" class="action-button" title="Edit Set">
                  <font-awesome-icon :icon="['fas', 'edit']"/>
                  Edit Set
                </button>
                <button @click="openDeleteConfirmation" class="action-button danger" title="Delete Set"
                        :disabled="deleteLoading">
                  <font-awesome-icon :icon="deleteLoading ? ['fas', 'spinner'] : ['fas', 'trash-alt']"
                                     :spin="deleteLoading"/>
                  Delete Set
                </button>
              </div>
            </template>
          </div>
        </section>
      </aside>
      <section class="set-main-content settings-section">
        <h2 class="section-title">{{ flashcards.length }} {{ flashcards.length === 1 ? 'Term' : 'Terms' }}</h2>
        <div v-if="flashcards.length > 0">
          <div class="terms-list-header">
            <div class="header-number">#</div>
            <div class="header-term">Term</div>
            <div class="header-definition">Definition</div>
          </div>
          <div class="terms-list-body">
            <div v-for="(card, index) in sortedFlashcards" :key="card.id" class="term-definition-row"
                 :class="{ 'even-row': index % 2 === 1 }">
              <div class="term-number">{{ index + 1 }}</div>
              <div class="term-column">{{ card.term }}</div>
              <div class="definition-column">{{ card.definition }}</div>
            </div>
          </div>
        </div>
        <div v-else class="info-state no-terms">
          <font-awesome-icon :icon="['fas', 'box-open']" size="2x"/>
          <p>This set currently has no terms.</p>
          <button v-if="currentUser.id === flashcardSet.author?.id" @click="editSet" class="action-button primary">
            <font-awesome-icon :icon="['fas', 'plus']"/>
            Add Terms
          </button>
        </div>
      </section>
    </div>

    <div v-else-if="!loading && !meLoading" class="info-state full-page-error">
      <font-awesome-icon :icon="['fas', 'question-circle']" size="2x"/>
      <p>No set data available or user not loaded.</p>
      <button @click="goBack" class="action-button error-action">Go Back</button>
    </div>

    <chat v-if="flashcardSet" :topic="flashcardSet.title || 'Flashcard Set'"/>

    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDeleteAction">
        <div class="modal-content">
          <h4>Confirm Deletion</h4>
          <p>
            Are you sure you want to permanently delete the flashcard set
            <strong>"{{ flashcardSet?.title || 'this library' }}"</strong>?
            This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button @click="cancelDeleteAction" class="action-button secondary" :disabled="deleteLoading">
              Cancel
            </button>
            <button @click="executeDeleteSet" class="action-button danger" :disabled="deleteLoading">
              <font-awesome-icon v-if="deleteLoading" :icon="['fas', 'spinner']" spin/>
              <span v-else>Delete Set</span>
            </button>
          </div>
          <div v-if="deleteError" class="error-message" style="margin-top: 15px; padding: 10px; font-size: 0.9em;">
            Error deleting set: {{ deleteError.message }}
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import {ref, computed, watch, onMounted, Teleport} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useQuery, useMutation} from '@vue/apollo-composable';
import {useToast} from "@/composables/useToast.js";

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faSpinner, faTriangleExclamation, faLayerGroup, faUserEdit, faCalendarAlt,
  faGlobeAmericas, faLock, faClone, faPuzzlePiece, faQuestionCircle, faEdit,
  faTrashAlt, faShareAlt, faPlus, faBoxOpen, faSearch,
  faCalendarPlus, faCalendarCheck, faFileCode, faFileCsv
} from '@fortawesome/free-solid-svg-icons';

import chat from '@/components/chat-agent/ChatbotLauncher.vue';

library.add(
    faSpinner, faTriangleExclamation, faLayerGroup, faUserEdit, faCalendarAlt,
    faGlobeAmericas, faLock, faClone, faPuzzlePiece, faQuestionCircle, faEdit,
    faTrashAlt, faShareAlt, faPlus, faBoxOpen, faSearch, faCalendarPlus, faCalendarCheck,
    faFileCode, faFileCsv
);

// GraphQL
import {GET_FLASHCARD_SET_BY_ID, DELETE_FLASHCARD_SET, ME_QUERY} from '@/graphql/auth.js';

// Routing & State
const route = useRoute();
const router = useRouter();
const deckId = computed(() => route.params.id);
const flashcardSet = ref(null);
const flashcards = ref([]);
const currentUser = ref(null);
const showDeleteModal = ref(false);

// Toast
const {addToast} = useToast();

// Data Fetching
const {
  result: meResult,
  loading: meLoading,
  error: meError
} = useQuery(ME_QUERY, null, {fetchPolicy: 'cache-and-network'});
const {
  result: setQueryResult,
  loading,
  error,
  refetch: refetchSet
} = useQuery(GET_FLASHCARD_SET_BY_ID, () => ({id: deckId.value}), () => ({
  enabled: !!deckId.value,
  fetchPolicy: 'cache-and-network',
}));

watch(meResult, (newResult) => {
  currentUser.value = newResult?.me || null;
});
watch(setQueryResult, (newResult) => {
  if (newResult?.findFlashcardSetById) {
    const setData = newResult.findFlashcardSetById;
    flashcardSet.value = setData;
    flashcards.value = setData.flashcards
        ? [...setData.flashcards].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
        : [];
  } else if (!loading.value && !error.value) {
    flashcardSet.value = null;
    flashcards.value = [];
  }
}, {deep: true});


// Computed Properties
const sortedFlashcards = computed(() => {
  return flashcards.value;
});

const goBack = () => {
  router.back();
}

const formatCreationDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(navigator.language || 'en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  } catch (e) {
    console.error("Error formatting creation date:", e);
    return dateString;
  }
}

const formatUpdateDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)}h ago`;

    const diffDays = Math.round(diffSeconds / (60 * 60 * 24));
    if (diffDays <= 30) return `${diffDays}d ago`;

    // Fallback to absolute date for older updates
    return date.toLocaleDateString(navigator.language || 'en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  } catch (e) {
    console.error("Error formatting update date:", e);
    return dateString; // Return original string on error
  }
}

const navigateToFlashcards = () => {
  if (!deckId.value || !flashcardSet.value) return;
  router.push({name: 'studySet', params: {deckId: deckId.value}});
};
const navigateToMatchGame = () => {
  if (!deckId.value) return;
  router.push({name: 'matchSet', params: {deckId: deckId.value}})
};
const navigateToQuiz = () => {
  if (!deckId.value) return;
  router.push({name: 'createQuiz', query: {setId: deckId.value}});
};
const editSet = () => {
  if (!deckId.value) return;
  router.push({name: 'updateSet', params: {deckId: deckId.value}});
};

const shareSet = async () => {
  if (!flashcardSet.value) return;
  const shareUrl = window.location.href; // URL of the current page
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }
    await navigator.clipboard.writeText(shareUrl);
    addToast({msg: 'Link copied to clipboard!', type: 'success', duration: 3000});

  } catch (err) {
    console.error('Failed to copy share link: ', err);
    addToast({msg: 'Could not copy link automatically.', type: 'error', duration: 3000});
  }
};

const sanitizeFilename = (name) => {
  if (!name || typeof name !== 'string') return 'export';
  return name.replace(/[\\/?%*:|"<>]/g, '_').replace(/\s+/g, '_').trim() || 'export';
};

const getBaseFilename = () => {
  const title = sanitizeFilename(flashcardSet.value?.title);
  const username = sanitizeFilename(currentUser.value?.username);
  return `${title || 'flashcard_set'}${username ? `-${username}` : ''}`;
};

const createDownloadLink = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Append required for Firefox
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up
};

const exportToJson = () => {
  if (!flashcardSet.value || !flashcards.value) {
    addToast({msg: 'Flashcard data not available for export.', type: 'error', duration: 3000});
    return;
  }
  if (flashcards.value.length === 0) {
    addToast({msg: 'Cannot export an empty library.', type: 'warning', duration: 3000});
    return;
  }

  try {
    const exportData = {
      title: flashcardSet.value.title || "Untitled Set",
      description: flashcardSet.value.description || "",
      isPublic: flashcardSet.value.isPublic,
      flashcards: flashcards.value.map(card => ({
        term: card.term,
        definition: card.definition
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], {type: 'application/json;charset=utf-8;'});
    const filename = `${getBaseFilename()}.json`;

    createDownloadLink(blob, filename);
    addToast({msg: 'Exported as JSON.', type: 'success', duration: 3000});

  } catch (e) {
    addToast({msg: 'Failed to export JSON.', type: 'error', duration: 3000});
  }
};

const exportToCsv = () => {
  if (!flashcardSet.value || !flashcards.value) {
    addToast({msg: 'Flashcard data not available for export.', type: 'error', duration: 3000});
    return;
  }
  if (flashcards.value.length === 0) {
    addToast({msg: 'Cannot export an empty library.', type: 'warning', duration: 3000});
    return;
  }

  try {
    const header = `"Term","Definition"`;
    const escapeCsvField = (field) => {
      const stringField = String(field || '');
      const escapedQuotes = stringField.replace(/"/g, '""');
      return `"${escapedQuotes}"`;
    };
    const rows = flashcards.value.map(card => {
      const term = escapeCsvField(card.term);
      const definition = escapeCsvField(card.definition);
      return `${term},${definition}`;
    });

    const csvString = [header, ...rows].join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], {type: 'text/csv;charset=utf-8;'});
    const filename = `${getBaseFilename()}.csv`;

    createDownloadLink(blob, filename);
    addToast({msg: 'Exported as CSV.', type: 'success', duration: 3000});

  } catch (e) {
    console.error("Error exporting to CSV:", e);
    addToast({msg: 'Failed to export CSV.', type: 'error', duration: 3000});
  }
};

const {mutate: deleteSetMutate, loading: deleteLoading, error: deleteError} = useMutation(DELETE_FLASHCARD_SET);

const openDeleteConfirmation = () => {
  if (!flashcardSet.value || !currentUser.value || currentUser.value.id !== flashcardSet.value.author?.id) {
    addToast({msg: 'Permission error during delete execution.', type: 'error', duration: 3000});
    return;
  }
  showDeleteModal.value = true;
};

const cancelDeleteAction = () => {
  showDeleteModal.value = false;
};

const executeDeleteSet = async () => {
  if (!flashcardSet.value || !currentUser.value || currentUser.value.id !== flashcardSet.value.author?.id) {
    addToast({msg: 'Permission error during delete execution.', type: 'error', duration: 3000});
    showDeleteModal.value = false;
    return;
  }
  if (!currentUser.value.id) {
    addToast({msg: 'Cannot delete: User ID is missing.', type: 'error', duration: 3000});
    showDeleteModal.value = false;
    return;
  }

  try {
    const result = await deleteSetMutate({
      setId: deckId.value,
      userId: currentUser.value.id
    });

    showDeleteModal.value = false;

    if (result?.data?.deleteFlashcardSet === true || (result && !result.errors)) {
      addToast({msg: 'Flashcard set deleted successfully.', type: 'success', duration: 3000});
      await router.push({name: 'privateProfileLibrary'});
    } else {
      const backendError = result?.errors?.[0]?.message || 'Deletion failed. Please try again.';
      addToast({msg: 'Delete failed: ' + backendError, type: 'error', duration: 3000});
    }
  } catch (e) {
    showDeleteModal.value = false;
    const exceptionError = e.message || 'An unexpected error occurred.';
    addToast({msg: 'Delete failed: ' + exceptionError, type: 'error', duration: 3000});
  }
};

onMounted(() => {
  if (!deckId.value) {
    addToast({msg: 'Invalid flashcard library ID.', type: 'error', duration: 3000});
    router.push({name: 'privateProfileLibrary'});
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.view-content, .view-content * {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
}

.view-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
  color: var(--text-primary, #E0E0E0);
  background-color: var(--bg-primary, #181E2E);
  padding-bottom: 80px;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #3a4359);
  color: var(--text-primary, #E0E0E0);
}

.loading-indicator, .error-message, .info-state {
  padding: 15px;
  text-align: center;
  background: var(--bg-secondary, #22293A);
  color: var(--text-secondary, #a4aabf);
  border-radius: 8px;
  margin: 0;
  font-size: 0.95em;
  border: 1px solid var(--border-color, #3a4359);
}

.full-page-indicator, .full-page-error, .info-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
  border-radius: 12px;
}

.full-page-indicator p, .full-page-error p, .info-state p {
  margin-top: 15px;
  font-size: 1.1em;
  color: var(--text-primary, #E0E0E0);
}

.full-page-error .error-icon {
  color: var(--error-color, #e74c3c);
}

.full-page-error pre {
  background-color: rgba(var(--error-color-rgb, 231, 76, 60), 0.1);
  color: var(--error-color, #e74c3c);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-all;
  text-align: left;
  max-width: 90%;
  border: 1px solid var(--error-color, #e74c3c);
}

.info-state {
  background-color: var(--bg-secondary, #22293A);
}

.error-action {
  margin-top: 20px;
  background-color: var(--bg-tertiary, #121729);
  border-color: var(--border-color, #3a4359);
  color: var(--text-secondary, #a4aabf);
}

.error-action:hover:not(:disabled) {
  background-color: var(--row-highlight-bg, #2a335a);
  border-color: var(--text-secondary, #a4aabf);
  color: var(--text-primary, #E0E0E0);
}

.no-terms {
  padding: 40px 20px;
}

.no-terms p {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
}

.no-terms .action-button {
  margin-top: 0;
  max-width: 200px;
  align-self: center;
}

.set-view-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  align-items: flex-start;
  width: 100%;
}

.set-sidebar {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.set-main-content {
  flex: 1;
  min-width: 300px;
}

.settings-section {
  background: var(--bg-secondary, #22293A);
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color, #3a4359);
}

.settings-section h3 {
  font-size: 1.2em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary, #E0E0E0);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color, #3a4359);
}

/* Set Info Section */
.set-info-section .set-description {
  font-size: 0.95em;
  color: var(--text-secondary, #a4aabf);
  margin-top: 10px;
  margin-bottom: 20px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.author-link {
  font-size: 0.95em;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-decoration: underline;
  color: var(--text-primary, #E0E0E0);
}

.no-gap {
  display: inline;
}

.set-meta-info .author-container {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 5px !important;
}

.set-meta-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.9em;
  color: var(--text-secondary, #a4aabf);
  padding-top: 15px;
  border-top: 1px solid var(--border-color, #3a4359);
}

.set-meta-info span svg {
  color: var(--primary-color, #5F98EF);
  width: 16px;
  text-align: center;
  opacity: 0.9;
  flex-shrink: 0;
}

.set-meta-info span {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* --- Actions Section --- */
.action-buttons-layout {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.author-actions {
  margin-top: 5px;
  padding-top: 15px;
  border-top: 1px dashed var(--border-color, #3a4359);
}

/* --- Action Button --- */
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--bg-tertiary, #121729);
  color: var(--text-primary, #E0E0E0);
  padding: 10px 15px;
  border: 1px solid var(--border-color, #3a4359);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9em;
  transition: all 0.2s ease-out;
  cursor: pointer;
  text-align: center;
  width: 100%;
}

.action-button:hover:not(:disabled) {
  background-color: var(--row-highlight-bg, #2a335a);
  border-color: var(--primary-color, #5F98EF);
  color: var(--text-primary, #E0E0E0);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  background-color: var(--primary-color, #5F98EF);
  border-color: var(--primary-color, #5F98EF);
  color: #fff;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #4a8adf;
  border-color: #4a8adf;
}

.action-button.danger {
  background-color: transparent;
  border-color: var(--error-color, #e74c3c);
  color: var(--error-color, #e74c3c);
}

.action-button.danger:hover:not(:disabled) {
  background-color: rgba(var(--error-color-rgb, 231, 76, 60), 0.1);
  color: #ff6b6b;
}

.action-button.secondary {
  background-color: var(--bg-tertiary, #121729);
  border-color: var(--border-color, #3a4359);
  color: var(--text-secondary, #a4aabf);
}

.action-button.secondary:hover:not(:disabled) {
  background-color: var(--row-highlight-bg, #2a335a);
  border-color: var(--text-secondary, #a4aabf);
  color: var(--text-primary, #E0E0E0);
}

/* --- Terms List --- */
.section-title {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary, #E0E0E0);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color, #3a4359);
}

.terms-list-header {
  display: flex;
  padding: 10px 15px;
  margin-bottom: 0;
  color: var(--text-secondary, #a4aabf);
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 2px solid var(--border-color, #3a4359);
  background-color: var(--bg-secondary, #22293A);
  position: sticky;
  top: -43px;
  z-index: 5;
}

.header-number {
  flex: 0 0 40px;
  text-align: center;
  padding-right: 10px;
}

.header-term {
  flex: 2;
  padding: 0 10px;
}

.header-definition {
  flex: 3;
  padding-left: 10px;
}

.terms-list-body {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color, #3a4359);
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

/* --- Term/Definition Row --- */
.term-definition-row {
  display: flex;
  align-items: stretch;
  background: var(--bg-tertiary, #121729);
  border-bottom: 1px solid var(--border-color, #3a4359);
  transition: background-color 0.15s ease;
}

.term-definition-row:last-child {
  border-bottom: none;
}

.term-definition-row:hover {
  background-color: var(--row-highlight-bg, #2a335a);
}

.term-definition-row.even-row {
  background-color: var(--bg-primary, #181E2E);
}

.term-definition-row.even-row:hover {
  background-color: var(--row-highlight-bg, #2a335a);
}

.term-number {
  flex: 0 0 40px;
  padding: 15px 10px 15px 15px;
  text-align: right;
  color: var(--text-secondary, #a4aabf);
  font-size: 0.9em;
  font-weight: 500;
  border-right: 1px solid var(--border-color, #3a4359);
  align-self: center;
}

.term-column, .definition-column {
  padding: 15px 15px;
  font-size: 0.95em;
  line-height: 1.6;
  word-wrap: break-word;
  display: flex;
  align-items: center;
}

.term-column {
  flex: 2;
  border-right: 1px solid var(--border-color, #3a4359);
  color: var(--text-primary, #E0E0E0);
  font-weight: 500;
}

.definition-column {
  flex: 3;
  color: var(--text-secondary, #a4aabf);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(18, 23, 41, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-secondary, #22293A);
  color: var(--text-primary, #E0E0E0);
  padding: 30px 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #3a4359);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.modal-content h4 {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-primary, #E0E0E0);
}

.modal-content p {
  font-size: 1em;
  color: var(--text-secondary, #a4aabf);
  line-height: 1.6;
  margin-bottom: 30px;
}

.modal-content p strong {
  color: var(--text-primary, #E0E0E0);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

/* --- Responsive Design --- */
@media (max-width: 992px) {
  .set-view-layout {
    flex-direction: column;
  }

  .set-sidebar {
    flex: 1 1 auto;
    order: -1;
    width: 100%;
    max-width: 100%;
    flex-basis: auto;
    position: static;
  }

  .set-main-content {
    width: 100%;
  }

  .terms-list-header {
    top: 0;
  }
}

@media (max-width: 768px) {
  .view-content {
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 90px;
  }

  .page-title {
    font-size: 1.5em;
    margin-bottom: 20px;
  }

  .settings-section {
    padding: 20px;
  }

  .action-buttons-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
  }

  .action-row {
    display: contents;
  }

  .author-actions {
    grid-column: 1 / -1;
  }

  .terms-list-header {
    display: none;
  }

  .term-definition-row {
    flex-direction: column;
    padding: 0;
  }

  .term-number {
    display: none;
  }

  .term-column, .definition-column {
    flex-basis: auto;
    border-right: none;
    padding: 12px 15px;
    width: 100%;
  }

  .term-column {
    border-bottom: 1px dashed var(--border-color, #3a4359);
    font-weight: 600;
  }

  .definition-column {
    padding-top: 10px;
  }

  .term-definition-row.even-row {
    background-color: var(--bg-tertiary);
  }

  .term-definition-row.even-row .term-column {
    background: var(--bg-tertiary);
  }

  .term-definition-row.even-row .definition-column {
    background: var(--bg-tertiary);
  }
}
</style>
