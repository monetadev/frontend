<template>
  <div class="upload-box-container">
    <div
        class="upload-box"
        :class="{ 'drag-over': isDragging, 'uploading': isUploading, 'compact': uploadedFile && !processingQueue, 'has-files': selectedFiles.length > 0 }"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >
      <!-- Initial state with no files -->
      <div v-if="!isUploading && selectedFiles.length === 0 && !uploadedFile && !processingQueue && !showCompletionStatus" class="upload-content">
        <div class="upload-icon">
          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
               width="90px" height="90px" viewBox="0 0 90 90"  xml:space="preserve">
            <g id="icomoon-ignore">
              <line fill="#5F98EF" stroke="#449FDB" x1="0" y1="0" x2="0" y2="0"/>
            </g>
            <path fill="#5F98EF" d="M75.314,70.044c-0.264,0-0.527-0.065-0.768-0.207L66,64.746l-8.55,5.088
          c-0.712,0.426-1.636,0.189-2.062-0.521s-0.188-1.633,0.522-2.056l9.315-5.547c0.471-0.285,1.062-0.285,1.535,0l9.313,5.547
          c0.711,0.423,0.945,1.341,0.525,2.056C76.323,69.786,75.825,70.044,75.314,70.044z"/>
            <path fill="#5F98EF" d="M66,88.5c-0.825,0-1.5-0.675-1.5-1.5V63c0-0.825,0.675-1.5,1.5-1.5s1.5,0.675,1.5,1.5v24
          C67.5,87.825,66.825,88.5,66,88.5z"/>
            <path fill="#5F98EF" d="M49.5,90H12c-0.828,0-1.5-0.675-1.5-1.5V22.434c0-0.384,0.147-0.753,0.411-1.032L30.753,0.468
          C31.035,0.168,31.431,0,31.842,0H78c0.825,0,1.5,0.672,1.5,1.5V57c0,0.825-0.675,1.5-1.5,1.5s-1.5-0.675-1.5-1.5V3H32.487
          L13.5,23.031V87h36c0.825,0,1.5,0.675,1.5,1.5S50.325,90,49.5,90z"/>
            <path fill="#5F98EF" d="M33,24H13.5c-0.828,0-1.5-0.672-1.5-1.5s0.672-1.5,1.5-1.5h18V3c0-0.828,0.672-1.5,1.5-1.5
          s1.5,0.672,1.5,1.5v19.5C34.5,23.328,33.828,24,33,24z"/>
          </svg>
        </div>
        <h2>Drag & Drop to Upload Files</h2>

        <p class="or-text">OR</p>

        <button class="browse-btn" @click="triggerFileInput">
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
               width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
            <g>
              <g>
                <path fill="#FFFFFF" d="M23.5,10.5c-0.275,0-0.5-0.224-0.5-0.5V7c0-1.654-1.346-3-3-3h-8.375c-0.276,0-0.5-0.224-0.5-0.5
                  c0-0.781-1.239-2.5-2.563-2.5h-5C2.246,1,1,2.367,1,3.813v6.188c0,0.276-0.224,0.5-0.5,0.5S0,10.277,0,10.001V3.813
                  C0,1.818,1.697,0,3.563,0h5c1.673,0,3.165,1.695,3.495,3H20c2.207,0,4,1.794,4,4v3C24,10.276,23.775,10.5,23.5,10.5z"/>
                <path fill="#FFFFFF" d="M3.521,24C1.562,24,0,22.439,0,20.521V10c0-0.276,0.224-0.5,0.5-0.5S1,9.724,1,10v10.521
                  C1,21.889,2.112,23,3.479,23C4.889,23,6,21.889,6,20.521V9.5C6,7.57,7.57,6,9.5,6h11C22.432,6,24,7.57,24,9.5V14
                  c0,0.275-0.225,0.5-0.5,0.5S23,14.275,23,14V9.5C23,8.122,21.879,7,20.5,7h-11C8.123,7,7,8.122,7,9.5v11.021
                  C7,22.439,5.439,24,3.521,24z"/>
                <path fill="#FFFFFF" d="M14,24H4c-0.276,0-0.5-0.225-0.5-0.5S3.725,23,4,23h10c0.275,0,0.5,0.225,0.5,0.5S14.275,24,14,24z"/>
              </g>
              <g>
                <path fill="#FFFFFF" d="M17.918,20.68c-0.801,0-1.555-0.312-2.121-0.878c-0.566-0.563-0.879-1.319-0.879-2.12
                  c0-0.803,0.313-1.556,0.879-2.123c1.133-1.133,3.107-1.133,4.242,0c0.566,0.567,0.879,1.32,0.879,2.123
                  c0,0.801-0.313,1.555-0.879,2.12C19.475,20.368,18.721,20.68,17.918,20.68z M17.918,15.682c-0.533,0-1.037,0.207-1.414,0.584
                  c-0.377,0.379-0.586,0.881-0.586,1.416c0,0.533,0.209,1.036,0.586,1.414c0.756,0.754,2.074,0.754,2.828,0
                  c0.377-0.378,0.586-0.881,0.586-1.414c0-0.535-0.209-1.037-0.586-1.416C18.955,15.889,18.453,15.682,17.918,15.682z"/>
                <path fill="#FFFFFF" d="M22.852,23.111c-0.129,0-0.258-0.049-0.354-0.146l-2.828-2.827c-0.194-0.195-0.194-0.513,0-0.707
                  c0.194-0.195,0.513-0.195,0.707,0l2.828,2.827c0.194,0.195,0.194,0.513,0,0.707C23.105,23.063,22.979,23.111,22.852,23.111z"/>
              </g>
            </g>
          </svg>
          Browse Files
        </button>

        <input type="file" ref="fileInput" @change="onFileSelect" hidden accept=".pdf,.doc,.docx,.txt" multiple />

        <p class="file-types">.pdf, .doc, .docx, .txt</p>
      </div>

      <!-- State with selected files -->
      <div v-if="!isUploading && selectedFiles.length > 0 && !uploadedFile && !processingQueue && !showCompletionStatus" class="files-grid-view">
        <div class="files-grid-container">
          <div class="files-grid">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-card">
              <div class="file-card-content">
                <div class="file-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5F98EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div class="file-name-wrapper">
                  <p class="file-name" :title="file.name">
                    {{ getFileName(file.name) }}
                  </p>
                </div>
                <div class="file-details">
                  <p class="file-size">{{ formatFileSize(file.size) }}</p>
                  <p class="file-extension">{{ getFileExtension(file.name) }}</p>
                </div>
                <button class="remove-file-btn" @click="removeSelectedFile(index)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="file-actions">
          <button class="upload-more-btn" @click="triggerFileInput">
            Upload More Files
          </button>
          <button class="upload-btn" @click="startUploadSequence">
            Upload to Moneta
          </button>
        </div>
      </div>

      <!-- Upload in progress state -->
      <div v-else-if="isUploading" class="upload-progress">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36" class="circular-progress">
            <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle"
                  :stroke-dasharray="`${uploadProgress}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="percentage">{{ Math.round(uploadProgress) }}%</div>
        </div>

        <h3 v-if="uploadProgress >= 90 && uploadProgress < 100">Creating embeddings...</h3>
        <h3 v-else>Uploading {{ currentFileIndex + 1 }}/{{ totalFiles }}...</h3>

        <div class="current-file-info">
          <p class="current-file">{{ currentFileName }}</p>
        </div>

        <p v-if="uploadProgress >= 90 && uploadProgress < 100" class="embeddings-message">
          Our AI is processing your document to create intelligent flashcards
        </p>
      </div>

      <!-- Upload failed state for current file -->
      <div v-else-if="uploadFailed" class="upload-failed">
        <div class="failed-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ff5e5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Upload Failed</h3>
        <p class="failed-message">{{ currentFileName }} failed to upload</p>
        <div class="failed-actions">
          <button class="continue-btn" @click="continueAfterFailure">Continue</button>
          <button class="upload-more-btn" @click="resetUpload">Upload More Files</button>
        </div>
      </div>

      <!-- Timer between uploads -->
      <div v-else-if="processingQueue" class="timer-container">
        <div class="file-transition">
          <div class="timer-circle">
            <svg viewBox="0 0 36 36" class="timer-progress">
              <path class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                    :stroke-dasharray="`${timerProgress}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <div class="queue-status">
            <p>Processing file {{ currentFileIndex + 1 }} of {{ totalFiles }}</p>
            <p class="next-file-name">{{ currentFileName }}</p>
          </div>
        </div>
      </div>

      <!-- Upload complete state with status -->
      <div v-else-if="showCompletionStatus" class="upload-complete">
        <div class="success-content">
          <!-- Success Icon (Green) -->
          <div class="status-icon" v-if="allFilesSuccessful">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <!-- Partial Success Icon (Yellow) -->
          <div class="status-icon" v-else-if="someFilesSuccessful">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <!-- Failed Icon (Red) -->
          <div class="status-icon" v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="status-text">
            <h3 v-if="allFilesSuccessful">Files uploaded successfully!</h3>
            <h3 v-else-if="someFilesSuccessful">Some files failed!</h3>
            <h3 v-else>All files failed!</h3>
            <p class="uploaded-count">{{ successfulFiles.length }} of {{ totalFiles }} files uploaded</p>
          </div>
        </div>

        <!-- List of failed files -->
        <div v-if="failedFiles.length > 0" class="failed-files-list">
          <h4 class="failed-files-header">Failed Files:</h4>
          <div v-for="(file, index) in failedFiles" :key="index" class="failed-file-item">
            <span class="failed-file-name">{{ file }}</span>
          </div>
        </div>


        <button class="upload-more-btn" @click="resetUpload">
          Upload More Files
        </button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="upload-error">
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
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
  }
});

// Emits
const emit = defineEmits(['file-selected']);

// Reactive state
const isDragging = ref(false);
const fileInput = ref(null);
const selectedFiles = ref([]);
const fileQueue = ref([]);
const processingQueue = ref(false);
const timerProgress = ref(0);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const currentFileName = ref('');
const uploadFailed = ref(false);
const showCompletionStatus = ref(false);
const successfulFiles = ref([]);
const failedFiles = ref([]);

// Timer interval reference
let timerInterval = null;

// Computed properties
const allFilesSuccessful = computed(() => {
  return failedFiles.value.length === 0 && successfulFiles.value.length > 0;
});

const someFilesSuccessful = computed(() => {
  return failedFiles.value.length > 0 && successfulFiles.value.length > 0;
});

// Methods
const triggerFileInput = () => {
  // Clear the file input value first to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

const onFileSelect = (event) => {
  const files = event.target.files;
  if (files.length) {
    for (let i = 0; i < files.length; i++) {
      selectedFiles.value.push(files[i]);
    }
  }
  // Reset file input value so same file can be selected again if needed
  event.target.value = '';
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length) {
    for (let i = 0; i < files.length; i++) {
      selectedFiles.value.push(files[i]);
    }
  }
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const resetUpload = () => {
  selectedFiles.value = [];
  fileQueue.value = [];
  processingQueue.value = false;
  currentFileIndex.value = 0;
  uploadFailed.value = false;
  showCompletionStatus.value = false;
  successfulFiles.value = [];
  failedFiles.value = [];
  emit('file-selected', null);
};

const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// Get just the filename without extension
const getFileName = (fullName) => {
  if (!fullName) return '';

  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex === -1) return fullName;

  return fullName.substring(0, lastDotIndex);
};

// Get just the file extension without the period
const getFileExtension = (fullName) => {
  if (!fullName) return '';

  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';

  // Return without the leading period
  return fullName.substring(lastDotIndex + 1);
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Start the sequential upload process
const startUploadSequence = () => {
  if (selectedFiles.value.length > 0) {
    // Reset tracking arrays
    successfulFiles.value = [];
    failedFiles.value = [];

    // Create a queue of files to process
    fileQueue.value = [...selectedFiles.value];
    totalFiles.value = fileQueue.value.length;
    currentFileIndex.value = 0;
    uploadFailed.value = false;
    showCompletionStatus.value = false;

    // Start with the first file
    uploadNextFile();
  }
};

// Upload the next file in the queue
const uploadNextFile = () => {
  if (fileQueue.value.length > 0) {
    const nextFile = fileQueue.value.shift();
    currentFileName.value = nextFile.name;

    // Emit the file selected event to trigger the upload
    emit('file-selected', nextFile);
  } else {
    // All files have been processed
    processingQueue.value = false;
  }
};

// Handle upload success or failure
const handleUploadResult = (success) => {
  if (success) {
    successfulFiles.value.push(currentFileName.value);
  } else {
    failedFiles.value.push(currentFileName.value);
    uploadFailed.value = true;
  }
};

// Continue after failure
const continueAfterFailure = () => {
  uploadFailed.value = false;
  currentFileIndex.value++;

  if (fileQueue.value.length === 0) {
    // If this was the last file, show completion status
    completionSequence();
  } else {
    uploadNextFile();
  }
};

// Show completion status with success/failure indicators
const completionSequence = () => {
  processingQueue.value = false;
  showCompletionStatus.value = true;
};

// Start the timer animation
const startTimer = () => {
  timerProgress.value = 0;
  processingQueue.value = true;

  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Use 3500ms for failed files, 1000ms for successful ones
  const duration = failedFiles.value.includes(currentFileName.value) ? 3500 : 1000;
  const startTime = performance.now();

  timerInterval = setInterval(() => {
    const elapsed = performance.now() - startTime;
    timerProgress.value = Math.min((elapsed / duration) * 100, 100);

    if (elapsed >= duration) {
      clearInterval(timerInterval);

      // If this was the last file, show completion status
      if (currentFileIndex.value === totalFiles.value - 1) {
        completionSequence();
      } else {
        // Move to the next file when timer completes
        currentFileIndex.value++;
        uploadNextFile();
      }
    }
  }, 20); // Update timer roughly 50 times per second
};

// Watch for changes in the upload state
watch(() => props.isUploading, (newValue, oldValue) => {
  // When upload completes (changes from true to false)
  if (oldValue === true && newValue === false) {
    handleUploadResult(!props.error);
    startTimer();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.upload-box-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
}

.upload-box {
  background: var(--bg-primary);
  border: 2px dashed var(--primary-color);
  padding: 50px;
  border-radius: 12px;
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease-in-out, background-color 0.3s ease-in-out, padding 0.3s ease;
}

/* Compact mode for uploaded state */
.upload-box.compact {
  padding: 25px;
}

.upload-content, .upload-progress, .timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.uploaded-file, .upload-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.success-content {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  justify-content: center;
}

.status-icon {
  margin-right: 15px;
}

.status-text {
  text-align: left;
}

/* Failed files list - improved styling */
.failed-files-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 15px 0 25px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  max-width: 450px;
  background: rgba(244, 67, 54, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.failed-files-header {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  font-family: "Outfit", sans-serif;
  width: 100%;
  text-align: left;
}

.failed-file-item {
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 6px;
  padding: 10px 15px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  border-left: 3px solid #F44336;
}

.failed-file-name {
  color: #F44336;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

h2, h3 {
  font-size: 22px;
  color: white;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  margin-bottom: 10px;
}

.upload-complete h3 {
  font-size: 20px;
  margin: 0 0 5px 0;
}

.uploaded-count {
  color: #9aa1b3;
  font-size: 14px;
  margin: 0;
  font-family: "Outfit", sans-serif;
}

.or-text {
  color: white;
  font-size: 14px;
  margin-bottom: 15px;
  font-family: "Outfit", sans-serif;
}

.file-types {
  font-size: 14px;
  color: #888;
  margin-top: 10px;
  font-family: "Outfit", sans-serif;
}

.upload-icon {
  margin-bottom: 15px;
}

.browse-btn {
  background: #5F98EF;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 250px;
}

.browse-btn:hover {
  background: var(--primary-hover-color);
}

.upload-box.drag-over {
  border-color: #88b6ff;
  background-color: #1a2233;
}

.progress-circle, .timer-circle {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.timer-circle {
  width: 50px;
  height: 50px;
}

.timer-progress {
  width: 50px;
  height: 50px;
}

.circular-progress, .timer-progress {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #2a335a;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #5F98EF;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: bold;
  color: white;
  font-family: "Outfit", sans-serif;
}

.upload-more-btn, .generate-more-btn {
  background: #2a335a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
  transition: background 0.3s;
  white-space: nowrap;
}

.upload-more-btn:hover, .generate-more-btn:hover {
  background: #3d4a7d;
}

.upload-error {
  color: #ff5e5e;
  background: rgba(255, 94, 94, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  width: 100%;
  max-width: 400px;
}

.embeddings-message {
  color: #9aa1b3;
  font-size: 14px;
  margin-top: 8px;
  max-width: 300px;
  text-align: center;
  font-family: "Outfit", sans-serif;
  animation: pulse 2s infinite;
}

/* Timer styles */
.file-transition {
  display: flex;
  align-items: center;
}

.queue-status {
  text-align: left;
}

.queue-status p {
  color: white;
  margin: 5px 0;
  font-family: "Outfit", sans-serif;
}

.next-file-name {
  color: #9aa1b3;
  font-size: 14px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Files grid view styles */
.files-grid-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.files-grid-container {
  width: 100%;
  max-height: 450px;
  overflow-y: auto;
  padding-right: 5px;
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.files-grid-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Limit to 3 columns */
  gap: 15px;
  width: 100%;
  margin-bottom: 20px;
  grid-auto-rows: min-content; /* Allow height to vary */
}

.file-card {
  position: relative;
  width: 100%;
  padding: 3px; /* Add padding for the border */
}

.file-card-content {
  background: #1a2233;
  border: 1px dashed #3a4562; /* Thin dashed border */
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: background-color 0.2s;
  min-height: 130px; /* Minimum height to accommodate content */
}

.file-card:hover .file-card-content {
  background: #232b42;
}

.file-icon {
  margin-bottom: 10px;
}

.file-name-wrapper {
  width: 100%;
  margin-bottom: 8px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  font-family: "Outfit", sans-serif;
  overflow: hidden;
  word-wrap: break-word;
}

.file-details {
  width: 100%;
  margin-top: auto;
  text-align: center;
}

.file-size {
  color: #9aa1b3;
  font-size: 12px;
  margin: 0 0 3px 0;
  font-family: "Outfit", sans-serif;
}

.file-extension {
  color: #5F98EF;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  font-family: "Outfit", sans-serif;
  text-transform: uppercase;
}

.remove-file-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 94, 94, 0.2);
  color: #ff5e5e;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-card:hover .remove-file-btn {
  opacity: 1;
}

.remove-file-btn:hover {
  background: rgba(255, 94, 94, 0.4);
}

.file-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
}

.upload-btn {
  background: #5F98EF;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #4a7dd6;
}

/* Current file info */
.current-file-info {
  margin-top: 10px;
  background: #1a2233;
  padding: 8px 15px;
  border-radius: 6px;
  max-width: 80%;
}

.current-file {
  color: #9aa1b3;
  font-size: 14px;
  margin: 0;
  font-family: "Outfit", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Upload failed state */
.upload-failed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.failed-icon {
  margin-bottom: 15px;
}

.failed-message {
  color: #9aa1b3;
  font-size: 16px;
  margin: 10px 0 20px;
  font-family: "Outfit", sans-serif;
}

.failed-actions {
  display: flex;
  gap: 15px;
}

.continue-btn {
  background: #5F98EF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
  transition: background 0.3s;
}

.continue-btn:hover {
  background: #4a7dd6;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style>
