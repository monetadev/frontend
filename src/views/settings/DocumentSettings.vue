<template>
  <main class="document-management-content component-root">
    <h2 class="page-title">Document Management</h2>

    <div class="management-layout">
      <div class="column column-left">
        <section class="settings-section upload-section">
          <div class="section-header">
            <h3 class="section-title-h3">Upload New Document</h3>
            <button @click="toggleUploadSection" class="collapse-button" :aria-expanded="!isUploadSectionCollapsed">
              <font-awesome-icon :icon="isUploadSectionCollapsed ? getIcon('chevron-down') : getIcon('chevron-up')"/>
            </button>
          </div>
          <transition name="collapse">
            <div v-show="!isUploadSectionCollapsed" class="upload-box-wrapper">
              <UploadBox
                  :is-uploading="isUploadingFile"
                  :upload-progress="uploadProgress" :error="uploadError"
                  @file-selected="handleFileSelected"
                  ref="fileUploadComponent"
              />
            </div>
          </transition>
        </section>

        <section class="settings-section document-list-section">
          <h3 class="section-title-h3">My Documents</h3>
          <div v-if="loadingMe && !userDocuments.length" class="loading-indicator list-loading">
            <font-awesome-icon :icon="getIcon('spinner')" spin/>
            Loading documents...
          </div>
          <div v-else-if="meError" class="error-message list-error">
            <font-awesome-icon :icon="getIcon('triangle-exclamation')"/>
            Error loading documents: {{ meError.message }}
          </div>
          <div v-else-if="!loadingMe && !userDocuments.length" class="info-message list-info">
            No documents uploaded yet. Use the uploader above!
          </div>
          <ul v-else class="document-list">
            <li
                v-for="doc in userDocuments"
                :key="doc.id"
                @click="selectDocument(doc)"
                :class="{ 'selected': selectedDocument?.id === doc.id }"
                class="document-list-item"
                tabindex="0"
                @keydown.enter="selectDocument(doc)"
                @keydown.space="selectDocument(doc)"
            >
              <font-awesome-icon :icon="getFileIcon(doc.contentType, doc.originalFilename)" class="file-icon"/>
              <span class="file-name" :title="doc.originalFilename">{{ doc.originalFilename }}</span>
              <font-awesome-icon v-if="selectedDocument?.id === doc.id" :icon="getIcon('chevron-right')"
                                 class="selected-indicator"/>
            </li>
          </ul>
        </section>
      </div>

      <div class="column column-right">
        <section class="settings-section document-details-section">
          <h3 class="section-title-h3">Document Details</h3>
          <div class="details-scroll-container">
            <div v-if="selectedDocument" class="details-content">
              <div class="detail-header">
                <font-awesome-icon :icon="getFileIcon(selectedDocument.contentType, selectedDocument.originalFilename)"
                                   class="detail-file-icon"/>
                <h4 class="detail-filename" :title="selectedDocument.originalFilename">
                  {{ selectedDocument.originalFilename }}</h4>
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">File ID:</span>
                  <span class="detail-value id-value" :title="selectedDocument.id">{{ selectedDocument.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Content Type:</span>
                  <span class="detail-value">{{ selectedDocument.contentType }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Size:</span>
                  <span class="detail-value">{{ formatFileSize(selectedDocument.fileSize) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Uploaded:</span>
                  <span class="detail-value">{{ formatDisplayDate(selectedDocument.uploadedDate) }}</span>
                </div>
              </div>
              <div class="detail-actions">
                <button
                    @click="openDeleteConfirmation(selectedDocument)"
                    class="action-button danger-button icon-button"
                    :disabled="isDeletingDocumentId === selectedDocument.id"
                >
                  <font-awesome-icon :icon="getIcon(isDeletingDocumentId === selectedDocument.id ? 'spinner' : 'trash')"
                                     :spin="isDeletingDocumentId === selectedDocument.id"/>
                  <span class="btn-text">Delete Document</span>
                </button>
              </div>
            </div>
            <div v-else class="info-message details-placeholder">
              Select a document from the list to see its details.
            </div>
          </div>
        </section>
      </div>
    </div>

    <Transition name="modal-fade">
      <ConfirmDeleteDocumentModal
          v-if="showDeleteConfirmModal"
          :document="documentToDelete"
          :is-deleting="isDeletingDocumentId === documentToDelete?.id"
          @close="cancelDeleteDocument"
          @confirm="executeDeleteDocument"
      />
    </Transition>

  </main>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useQuery, useMutation} from '@vue/apollo-composable';
import ConfirmDeleteDocumentModal from '@/components/document/ConfirmDeleteDocumentModal.vue';
import {ME_QUERY, UPLOAD_DOCUMENT, DELETE_DOCUMENT} from "@/graphql/auth.js";
import {useToast} from "@/composables/useToast.js";
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {
  faSpinner, faTriangleExclamation, faTrash, faChevronRight, faChevronUp, faChevronDown,
  faFile, faFilePdf, faFileWord, faFileLines, faFileZipper,
} from '@fortawesome/free-solid-svg-icons';
import UploadBox from "@/components/document/UploadBox.vue";

library.add(
    faSpinner, faTriangleExclamation, faTrash, faChevronRight, faChevronUp, faChevronDown,
    faFile, faFilePdf, faFileWord, faFileLines, faFileZipper,
);

const icons = {
  'spinner': faSpinner, 'triangle-exclamation': faTriangleExclamation, 'trash': faTrash,
  'chevron-right': faChevronRight, 'chevron-up': faChevronUp, 'chevron-down': faChevronDown,
  'file-default': faFile, 'file-pdf': faFilePdf, 'file-word': faFileWord,
  'file-text': faFileLines, 'file-archive': faFileZipper,
};

function getIcon(iconName) {
  return icons[iconName] || icons['triangle-exclamation'];
}

// --- Core Component State ---
const selectedDocument = ref(null);
const fileUploadComponent = ref(null);
const isUploadSectionCollapsed = ref(false);
const {addToast} = useToast();

// --- Modal State ---
const showDeleteConfirmModal = ref(false);
const documentToDelete = ref(null);
const isDeletingDocumentId = ref(null);

// --- Upload State ---
const isUploadingFile = ref(false);
const uploadProgress = ref(0);
const uploadError = ref(null);

// --- GraphQL Setup ---
const {result: meResult, loading: loadingMe, error: meError, refetch: refetchMeQuery} = useQuery(ME_QUERY, null, {
  fetchPolicy: 'cache-and-network',
  notifyOnNetworkStatusChange: true,
});

// Upload mutation function
const {mutate: uploadDocumentMutate} = useMutation(UPLOAD_DOCUMENT, {
  refetchQueries: [{query: ME_QUERY}],
});

// Delete mutation function
const {mutate: deleteDocumentMutate} = useMutation(DELETE_DOCUMENT, {
  refetchQueries: [{query: ME_QUERY}],
});

// --- Computed Properties ---
const userDocuments = computed(() => {
  const docs = meResult.value?.me?.files || [];

  const nonImageDocs = docs.filter(doc => {
    const contentType = doc.contentType?.toLowerCase() || ''; // Get lowercase contentType safely
    return !contentType.startsWith('image/');
  });

  return [...nonImageDocs].sort((a, b) => {
    try {
      const dateA = new Date(a.uploadedDate);
      const dateB = new Date(b.uploadedDate);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB - dateA;
    } catch (e) {
      return 0;
    }
  });
});

// --- UI Methods ---
function selectDocument(doc) {
  selectedDocument.value = doc;
}

function toggleUploadSection() {
  isUploadSectionCollapsed.value = !isUploadSectionCollapsed.value;
}

// --- Formatting Helpers ---
function formatDisplayDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit' // Added time
    }).format(new Date(dateString));
  } catch (e) {
    return typeof dateString === 'string' ? dateString.split('T')[0] : 'Invalid Date';
  }
}

// Format file sizes into human-readable units
function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null || bytes < 0) return 'N/A';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // Units
  // Calculate the appropriate unit index
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  // Use 1 decimal place for KB and above
  const precision = i === 0 ? 0 : 1;
  // Calculate and format the size
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + ' ' + sizes[i];
}

function getFileIcon(contentType, filename) {
  const lc = contentType?.toLowerCase() || '';
  const lf = filename?.toLowerCase() || '';

  if (lc.includes('pdf')) return icons['file-pdf'];
  if (lc.includes('word') || lf.endsWith('.docx') || lf.endsWith('.doc')) return icons['file-word'];
  if (lc.includes('text') || lf.endsWith('.txt')) return icons['file-text'];
  if (lc.includes('zip') || lc.includes('compressed') || lf.endsWith('.zip') || lc.includes('archive')) return icons['file-archive'];

  return icons['file-default'];
}

async function handleFileSelected(file) {
  if (!file) return;

  isUploadingFile.value = true;
  uploadProgress.value = 0;
  uploadError.value = null;

  let uploadInterval = null;
  let processInterval = null;

  try {
    uploadInterval = setInterval(() => {
      if (uploadProgress.value < 60) {
        uploadProgress.value += 10;
      } else {
        clearInterval(uploadInterval);
      }
    }, 150);

    const {data} = await uploadDocumentMutate({input: file});

    clearInterval(uploadInterval);
    if (uploadProgress.value < 60) uploadProgress.value = 60;

    if (!data?.uploadDocument?.filename) {
      throw new Error("Upload mutation returned unexpected data.");
    }

    processInterval = setInterval(() => {
      if (uploadProgress.value < 95) {
        uploadProgress.value += 5;
      } else {
        clearInterval(processInterval);
      }
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 500));
    clearInterval(processInterval);
    uploadProgress.value = 100;
  } catch (error) {
    clearInterval(uploadInterval);
    clearInterval(processInterval);

    console.error(`Error uploading ${file.name}:`, error);
    const errorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Unknown upload error';
    uploadError.value = errorMessage;
    uploadProgress.value = 0;

  } finally {
    setTimeout(() => {
      isUploadingFile.value = false;
    }, 2400);
  }
}


// --- Delete Document Logic ---
function openDeleteConfirmation(docPayload) {
  documentToDelete.value = docPayload;
  showDeleteConfirmModal.value = true;
}

function cancelDeleteDocument() {
  showDeleteConfirmModal.value = false;
  documentToDelete.value = null;
  isDeletingDocumentId.value = null;
}

async function executeDeleteDocument() {
  // Prevent double execution if already deleting
  if (!documentToDelete.value || isDeletingDocumentId.value) return;

  isDeletingDocumentId.value = documentToDelete.value.id;
  const filenameToDelete = documentToDelete.value.originalFilename;

  try {
    const {data} = await deleteDocumentMutate({id: documentToDelete.value.id});
    if (data?.deleteDocument) {
      addToast({msg: `Document '${filenameToDelete}' deleted successfully.`, type: 'success', timeout: 5000});
      if (selectedDocument.value?.id === data.deleteDocument) {
        selectedDocument.value = null;
      }
      cancelDeleteDocument();
    } else {
      throw new Error("Deletion mutation did not return the expected ID.");
    }
  } catch (error) {
    console.error("Delete document error:", error);
    const errorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Unknown error';
    addToast({msg: `Failed to delete '${filenameToDelete}': ${errorMessage}`, type: 'error', timeout: 6000});
    isDeletingDocumentId.value = null;
  }
}

</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header .section-title-h3 {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.collapse-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1em;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.2s, transform 0.3s ease-out;
}

.collapse-button:hover {
  color: var(--text-primary);
}

.collapse-button svg {
  transition: transform 0.3s ease-out;
}

[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.upload-box-wrapper {
  overflow: hidden;
}

.collapse-enter-active, .collapse-leave-active {
  transition: all 0.4s ease-out;
  max-height: 500px;
  opacity: 1;
}

.collapse-enter-from, .collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.component-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.document-management-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
}

.page-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  flex-shrink: 0;
}

.management-layout {
  display: flex;
  gap: 20px;
  width: 100%;
  flex-grow: 1;
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-basis: 0;
  overflow: hidden;
}

.column-left {
  flex-grow: 1;
  min-width: 400px;
}

.column-right {
  flex-grow: 1;
  min-width: 350px;
}

.settings-section {
  background: var(--bg-secondary);
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upload-section {
  flex-shrink: 0;
}

.upload-section .upload-box-wrapper > :deep(.upload-box-container) {
  background: transparent;
  padding: 0;
  width: 100%;
  margin-top: 10px;
}

.document-list-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.document-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--sidebar-active) var(--bg-tertiary);
}

.document-list::-webkit-scrollbar {
  width: 8px;
}

.document-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.document-list::-webkit-scrollbar-thumb {
  background-color: var(--sidebar-active);
  border-radius: 4px;
  border: 2px solid var(--bg-tertiary);
}

.document-list-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color-light, #333c54);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  gap: 15px;
}

.document-list-item:last-child {
  border-bottom: none;
}

.document-list-item:hover {
  background-color: var(--bg-hover-light, #2a335a);
}

.document-list-item.selected {
  background-color: rgba(var(--sidebar-active-rgb), 0.15);
  border-left: 3px solid var(--sidebar-active);
  padding-left: 12px;
}

.document-list-item.selected .file-name {
  font-weight: 600;
  color: var(--text-primary);
}

.file-icon {
  font-size: 1.4em;
  color: var(--sidebar-active);
  flex-shrink: 0;
  width: 25px;
  text-align: center;
}

.file-name {
  flex-grow: 1;
  color: var(--text-secondary);
  font-size: 0.95em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-indicator {
  color: var(--sidebar-active);
  margin-left: auto;
  font-size: 0.9em;
  flex-shrink: 0;
}

.document-details-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.document-details-section .section-title-h3 {
}

.details-scroll-container {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 5px;
  margin-right: -5px;
  scrollbar-width: thin;
  scrollbar-color: var(--sidebar-active) var(--bg-secondary);
}

.details-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.details-scroll-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.details-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--sidebar-active);
  border-radius: 4px;
  border: 2px solid var(--bg-secondary);
}

.details-content {
  padding: 10px 0px 10px 0px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color-light, #333c54);
  flex-shrink: 0;
}

.detail-file-icon {
  font-size: 2.5em;
  color: var(--sidebar-active);
  flex-shrink: 0;
}

.detail-filename {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: normal;
  word-break: break-word;
}

.details-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px 15px;
  align-items: center;
  flex-shrink: 0;
}

.detail-item {
  display: contents;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9em;
  text-align: right;
}

.detail-value {
  font-size: 0.95em;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

.detail-value.id-value {
  font-family: monospace;
  font-size: 0.85em;
  cursor: help;
}

.detail-actions {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color-light, #333c54);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  background: var(--bg-secondary);
}

.details-placeholder {
  text-align: center;
  padding: 40px 20px;
  font-size: 1em;
  margin: auto;
}

.loading-indicator, .error-message, .info-message {
  padding: 15px 20px;
  text-align: center;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
}

.loading-indicator {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.error-message {
  background: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  border: 1px solid rgba(var(--error-color-rgb), 0.3);
}

.info-message {
  background: rgba(var(--info-color-rgb), 0.1);
  color: var(--info-color);
  border: 1px solid rgba(var(--info-color-rgb), 0.3);
}

.list-loading, .list-error, .list-info {
  margin: auto;
  width: calc(100% - 40px);
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.95em;
  line-height: 1.5;
  white-space: nowrap;
  background-color: var(--button-secondary-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.action-button:hover:not(:disabled) {
  background-color: var(--button-secondary-hover-bg);
  border-color: var(--border-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-button.danger-button {
  background-color: var(--button-danger-bg);
  border-color: var(--button-danger-bg);
  color: #fff;
}

.action-button.danger-button:hover:not(:disabled) {
  background-color: var(--button-danger-hover-bg);
  border-color: var(--button-danger-hover-bg);
}

.action-button.danger-button:disabled {
  background-color: var(--button-danger-bg);
  border-color: var(--button-danger-bg);
}

@media (max-width: 992px) {
  .management-layout {
    flex-direction: column;
    overflow: hidden;
  }

  .column {
    flex-basis: auto;
  }

  .column-left, .column-right {
    min-width: unset;
    width: 100%;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .detail-label {
    text-align: left;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 2px;
  }

  .detail-value {
    margin-bottom: 8px;
    white-space: normal;
    word-break: break-all;
  }

  .detail-item {
    display: block;
  }
}

@media (max-width: 768px) {
  .settings-section {
    padding: 20px;
  }

  .page-title {
    font-size: 1.6em;
  }

  .section-header .section-title-h3 {
    font-size: 1.2em;
  }

  .action-button.icon-button .btn-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .action-button.icon-button {
    padding: 8px 10px;
  }

  .detail-actions {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .document-management-content {
    padding: 15px;
    gap: 15px;
  }

  .management-layout {
    gap: 15px;
  }

  .column {
    gap: 15px;
  }

  .settings-section {
    padding: 15px;
  }

  .page-title {
    font-size: 1.4em;
    padding-bottom: 10px;
  }

  .section-header .section-title-h3 {
    font-size: 1.1em;
  }

  .document-list-item {
    padding: 10px;
    gap: 10px;
  }

  .file-icon {
    font-size: 1.2em;
    width: 20px;
  }

  .file-name {
    font-size: 0.9em;
  }

  .detail-file-icon {
    font-size: 2em;
  }

  .detail-filename {
    font-size: 1.1em;
  }
}
</style>