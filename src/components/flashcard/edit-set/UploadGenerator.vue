<template>
  <div class="upload-box-container" :class="{ 'compact-mode': compact }">
    <div
        class="upload-area"
        :class="{
          'drag-over': isDragging,
          'is-uploading': isUploadingInternal,
          'has-file': !!internalFile
        }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="handleAreaClick"
    >
      <div v-if="!isUploadingInternal && !internalFile" class="initial-state">
        <input type="file" ref="fileInputRef" @change="onFileSelect" hidden :accept="acceptedTypes" />
        <FontAwesomeIcon :icon="getIcon('upload')" class="upload-icon"/>
        <p class="main-text">Drag & Drop File Here</p>
        <p class="sub-text">or <span class="browse-link">Browse Files</span></p>
        <p class="file-types-info">{{ acceptedTypesLabel }}</p>
      </div>

      <div v-else-if="isUploadingInternal" class="uploading-state">
        <FontAwesomeIcon :icon="getIcon('spinner')" spin size="2x" class="spinner-icon"/>
        <p class="main-text">Uploading...</p>
        <p v-if="internalFile?.name" class="sub-text filename" :title="internalFile.name">{{ internalFile.name }}</p>
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="simple-progress-bar">
          <div class="simple-progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
      </div>

      <div v-else-if="internalFile" class="file-present-state" @click.stop="removeFile" title="Click to remove file">
        <FontAwesomeIcon :icon="getFileIcon(internalFile.type || internalFile.contentType, internalFile.name || internalFile.originalFilename)" class="file-icon"/>
        <p class="main-text filename" :title="internalFile.name || internalFile.originalFilename">{{ internalFile.name || internalFile.originalFilename }}</p>
      </div>

      <div v-if="internalError" class="upload-error-display">
        <FontAwesomeIcon :icon="getIcon('exclamation-circle')" class="error-icon"/>
        <span>{{ internalError }}</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faUpload, faSpinner, faTimes, faFile, faFilePdf, faFileWord, faFileLines, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

const ICONS = {
  'upload': faUpload, 'spinner': faSpinner, 'times': faTimes,
  'file-default': faFile, 'file-pdf': faFilePdf, 'file-word': faFileWord,
  'file-text': faFileLines, 'exclamation-circle': faExclamationCircle
};
const getIcon = (name) => ICONS[name] || ICONS['file-default'];

const props = defineProps({
  isUploading: {
    type: Boolean,
    default: false
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  uploadedFile: {
    type: Object,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  },
  acceptedTypes: {
    type: String,
    default: ".pdf,.doc,.docx,.txt"
  },
  acceptedTypesLabel: {
    type: String,
    default: "PDF, DOCX, TXT supported"
  }
});

const emit = defineEmits(['file-selected']);

const isDragging = ref(false);
const fileInputRef = ref(null);
const internalFile = ref(props.uploadedFile);
const isUploadingInternal = ref(props.isUploading);
const internalError = ref(props.error);

watch(() => props.uploadedFile, (newVal) => {
  internalFile.value = newVal;
  if (newVal) internalError.value = null;
});
watch(() => props.isUploading, (newVal) => {
  isUploadingInternal.value = newVal;
  if (newVal) internalError.value = null;
});
watch(() => props.error, (newVal) => {
  internalError.value = newVal;
  if (newVal) {
    isUploadingInternal.value = false;
  }
});

const handleAreaClick = () => {
  if (!isUploadingInternal.value && !internalFile.value && fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const onFileSelect = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectFile(files[0]);
  }
  if (event.target) event.target.value = '';
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    selectFile(files[0]);
  }
};

const selectFile = (file) => {
  if (!file) return;
  internalFile.value = { name: file.name, size: file.size, type: file.type };
  internalError.value = null;
  emit('file-selected', file);
};

const removeFile = () => {
  internalFile.value = null;
  internalError.value = null;
  isUploadingInternal.value = false;
  emit('file-selected', null);
};

const onDragOver = () => {
  if (!isUploadingInternal.value && !internalFile.value) {
    isDragging.value = true;
  }
};

const onDragLeave = () => {
  isDragging.value = false;
};

function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null || bytes < 0) return '';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1));
  const precision = i === 0 ? 0 : 1;
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + ' ' + sizes[i];
}

function getFileIcon(contentType, filename) {
  const lcType = contentType?.toLowerCase() || '';
  const lcName = filename?.toLowerCase() || '';

  if (lcType.includes('pdf') || lcName.endsWith('.pdf')) return getIcon('file-pdf');
  if (lcType.includes('word') || lcType.includes('msword') || lcName.endsWith('.docx') || lcName.endsWith('.doc')) return getIcon('file-word');
  if (lcType.includes('text') || lcName.endsWith('.txt')) return getIcon('file-text');

  return getIcon('file-default');
}

</script>

<style scoped>
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08); /* Slightly smaller pulse */
    opacity: 0.85;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.upload-box-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.upload-area {
  flex-grow: 1;
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary-alpha);
  transition: border-color 0.3s ease, background-color 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 150px;
}

.upload-area.compact-mode {
  padding: 15px;
  min-height: 120px;
}

.upload-area:not(.has-file):not(.is-uploading):hover {
  border-color: var(--primary-color);
  background-color: var(--bg-secondary);
}

.upload-area.drag-over {
  border-color: var(--primary-hover-color);
  background-color: var(--bg-secondary);
  border-style: solid;
}

.upload-area.has-file {
  cursor: default;
  border-style: solid;
  border-color: var(--border-color-light);
  background-color: var(--bg-secondary);
  padding: 0;
  justify-content: center; /* Center content vertically */
  align-items: center; /* Center content horizontally */
}

/* States */
.initial-state, .uploading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 8px;
  padding: 20px;
  box-sizing: border-box;
}
.compact-mode .initial-state,
.compact-mode .uploading-state {
  gap: 5px;
  padding: 15px;
}


.upload-icon {
  font-size: 2.5em;
  color: var(--primary-color);
  margin-bottom: 5px;
}
.compact-mode .upload-icon {
  font-size: 2em;
  margin-bottom: 2px;
}

.main-text {
  font-size: 1em;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.compact-mode .main-text { font-size: 0.95em; }

.sub-text {
  font-size: 0.85em;
  color: var(--text-secondary);
  margin: 0;
}
.compact-mode .sub-text { font-size: 0.8em; }

.browse-link {
  color: var(--link-color);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.file-types-info {
  font-size: 0.75em;
  color: var(--text-placeholder);
  margin-top: 10px;
}
.compact-mode .file-types-info { margin-top: 5px; font-size: 0.7em; }

/* Uploading State */
.spinner-icon {
  color: var(--primary-color);
  margin-bottom: 10px;
}
.compact-mode .spinner-icon { margin-bottom: 5px; font-size: 1.5em; }

.filename {
  max-width: 90%;
}

.simple-progress-bar {
  width: 80%;
  max-width: 200px;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
}
.compact-mode .simple-progress-bar { margin-top: 5px; height: 3px; }

.simple-progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* File Present State - Revised Styling */
.file-present-state {
  display: flex;
  flex-direction: column; /* Stack icon and text vertically */
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  gap: 8px; /* Space between icon and text */
  padding: 15px; /* Padding around content */
  text-align: center; /* Center text */
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.compact-mode .file-present-state {
  gap: 5px;
  padding: 10px;
}

.file-present-state:hover {
  background-color: var(--bg-tertiary);
}

.file-present-state .file-icon {
  font-size: 2.5em; /* Larger icon */
  color: var(--sidebar-active);
  flex-shrink: 0;
  animation: pulse 2.2s infinite ease-in-out; /* Apply pulse animation */
}
.compact-mode .file-present-state .file-icon {
  font-size: 2em;
}

.file-present-state .main-text.filename {
  /* Allow wrapping */
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  /* Remove flex-grow as layout is column */
  text-align: center;
  font-size: 0.9em;
  line-height: 1.4; /* Adjust line height for wrapped text */
  max-width: 90%; /* Prevent text touching edges */
  color: var(--text-secondary); /* Slightly dimmer text */
}
.compact-mode .file-present-state .main-text.filename {
  font-size: 0.85em;
  max-width: 95%;
}


/* Error Display */
.upload-error-display {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(var(--error-color-rgb), 0.15);
  color: var(--error-color);
  border-top: 1px solid rgba(var(--error-color-rgb), 0.3);
  padding: 5px 10px;
  font-size: 0.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
  text-align: center;
}
.error-icon {
  font-size: 1em;
}
</style>