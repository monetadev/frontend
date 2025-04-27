<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar"/>
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed"/>
      <div class="content-wrapper">
        <div class="content-container">
          <div class="content-header">
            <div class="content-text">
              <h1>Create Flashcard Set</h1>
              <p>Generate flashcards based on your uploaded documents, or create your own!</p>
            </div>
            <img src="@/assets/book.svg" class="page-icon" alt="Book Icon"/>
          </div>

          <div class="progress-container">
            <ProgressCircle :number="1" :isActive="progressStep >= 1" subText="Options"/>
            <ProgressLine :isActive="progressStep >= 2"/>
            <ProgressCircle :number="2" :isActive="progressStep >= 2" subText="Review Flashcards"/>
          </div>

          <!-- Step 1: Create -->
          <div v-if="progressStep === 1" class="creation-container">
            <!-- Document Upload (Optional) -->
            <div class="upload-section">
              <div class="section-header">
                <h2>Upload Document</h2>
                <span class="optional-badge">Optional</span>
              </div>
              <UploadBox
                  @file-selected="handleFileSelected"
                  :isUploading="isUploading"
                  :uploadProgress="uploadProgress"
                  :uploadedFile="uploadedDocument"
                  :error="uploadError"
              />
            </div>

            <!-- Prompt Generator (Optional) -->
            <div class="prompt-section">
              <div class="section-header">
                <h2>Generate Flashcards</h2>
                <span class="optional-badge">Optional</span>
              </div>
              <PromptGenerator
                  v-model:prompt="generationPrompt"
                  v-model:count="flashcardCount"
              />
            </div>

            <!-- Generate Button -->
            <div class="button-container">
              <PrimaryButton
                  :text="generationPrompt.trim().length > 0 ? 'Generate' : 'Skip'"
                  @click="handleContinue"
                  :disabled="isGenerating || isUploading"
              />
              <p v-if="generationError" class="generation-error">{{ generationError }}</p>
            </div>
          </div>

          <!-- Step 2: Review & Create -->
          <div v-if="progressStep === 2" class="review-container">
            <!-- Set Details with Editable Fields -->
            <div class="set-details">
              <!-- Editable Title -->
              <div class="editable-field">
                <h2 v-if="!editingTitle" class="set-title" @click="startEditingTitle">
                  {{ generatedSetTitle || 'Title' }}
                  <span class="edit-icon"><i class="fas fa-edit"></i></span>
                </h2>
                <div v-else class="editing-container">
                  <input
                      type="text"
                      v-model="editTitleValue"
                      class="edit-input"
                      ref="titleInput"
                      @keyup.enter="saveTitle"
                      @keyup.esc="cancelTitleEdit"
                      placeholder="Title"
                  />
                  <div class="edit-actions">
                    <button class="action-btn cancel" @click="cancelTitleEdit"><i class="fas fa-times"></i></button>
                    <button class="action-btn save" @click="saveTitle"><i class="fas fa-check"></i></button>
                  </div>
                </div>
              </div>

              <!-- Editable Description -->
              <div class="editable-field">
                <p v-if="!editingDescription" class="set-description" @click="startEditingDescription">
                  {{ generatedSetDescription || 'Description' }}
                  <span class="edit-icon"><i class="fas fa-edit"></i></span>
                </p>
                <div v-else class="editing-container">
                  <textarea
                      v-model="editDescriptionValue"
                      class="edit-textarea"
                      ref="descriptionInput"
                      @keyup.enter="saveDescription"
                      @keyup.esc="cancelDescriptionEdit"
                      placeholder="Description"
                      @input="autoResizeTextarea"
                  ></textarea>
                  <div class="edit-actions">
                    <button class="action-btn cancel" @click="cancelDescriptionEdit"><i class="fas fa-times"></i>
                    </button>
                    <button class="action-btn save" @click="saveDescription"><i class="fas fa-check"></i></button>
                  </div>
                </div>
              </div>

              <div class="set-stats">
                <span class="stat-item">{{ flashcards.length - (isLastEmptyCard(flashcards.length - 1) ? 1 : 0) }} Flashcards</span>
                <span class="stat-divider">•</span>
                <span class="stat-item">Created {{ formattedDate }}</span>
              </div>
            </div>

            <!-- Visibility Toggle -->
            <div class="visibility-control">
              <div class="visibility-label">Set Visibility:</div>
              <div class="toggle-group">
                <button
                    @click="isPublic = true"
                    :class="['toggle-btn', isPublic ? 'active' : '']"
                >
                  Public
                </button>
                <button
                    @click="isPublic = false"
                    :class="['toggle-btn', !isPublic ? 'active' : '']"
                >
                  Private
                </button>
              </div>
              <div class="visibility-description">
                {{ isPublic ? 'Anyone can view this set' : 'Only you can view this set' }}
              </div>
            </div>

            <!-- Flashcards -->
            <div class="flashcard-container">
              <div
                  v-for="(card, index) in flashcards"
                  :key="index"
                  class="flashcard"
                  :class="{
                  'deleting': deletingIndex === index && deleteProgress > 0,
                  'dragging': draggedIndex === index,
                  'drop-target': dragOverIndex === index && draggedIndex !== index,
                  'swapping-from': swappingCardIndices.from === index,
                  'swapping-to': swappingCardIndices.to === index
                }"
                  :data-index="index"
                  @dragover.prevent="handleDragOver($event, index)"
                  @drop.prevent="handleDrop($event, index)"
              >
                <!-- Number Display (Top-Left) - Draggable or Editable -->
                <div
                    v-if="editingPositionIndex !== index"
                    class="flashcard-number"
                    draggable="true"
                    @dragstart="handleDragStart($event, index)"
                    @dragend="handleDragEnd"
                    @dblclick="startEditingPosition(index)"
                    :class="{ 'not-draggable': isEmptyCard(card) || isLastEmptyCard(index) }"
                >
                  {{ index + 1 }}
                  <span class="drag-handle">
                    <i class="fas fa-grip-lines"></i>
                  </span>
                </div>
                <div v-else class="flashcard-number editing">
                  <input
                      type="number"
                      v-model="editPositionValue"
                      class="position-input no-spinners"
                      min="1"
                      :max="getLastNonEmptyIndex() + 1"
                      @keyup.enter="savePositionEdit"
                      @keyup.esc="cancelPositionEdit"
                      @blur="savePositionEdit"
                  />
                </div>

                <div class="flashcard-content">
                  <!-- Term section (previously Question) -->
                  <div class="flashcard-item" :class="{'editing': editingCardIndices.term.includes(index)}">
                    <div v-if="!editingCardIndices.term.includes(index)" class="editable-field"
                         @click="startEditingCard(index, 'term')">
                      <span>{{ card.term || 'Term' }}</span>
                      <span class="edit-icon"><i class="fas fa-edit"></i></span>
                    </div>
                    <div v-else class="editing-container">
                      <input
                          type="text"
                          v-model="editCardValues[index].term"
                          class="edit-input question-input"
                          @keyup.enter="saveCardEdit(index, 'term')"
                          @keyup.esc="cancelCardEdit(index, 'term')"
                          placeholder="Term"
                      />
                      <div class="edit-actions">
                        <button class="action-btn cancel" @click="cancelCardEdit(index, 'term')"><i
                            class="fas fa-times"></i></button>
                        <button class="action-btn save" @click="saveCardEdit(index, 'term')"><i
                            class="fas fa-check"></i></button>
                      </div>
                    </div>
                  </div>

                  <!-- Definition section (previously Answer) -->
                  <div class="flashcard-item" :class="{'editing': editingCardIndices.definition.includes(index)}">
                    <div v-if="!editingCardIndices.definition.includes(index)" class="editable-field"
                         @click="startEditingCard(index, 'definition')">
                      <span>{{ card.definition || 'Definition' }}</span>
                      <span class="edit-icon"><i class="fas fa-edit"></i></span>
                    </div>
                    <div v-else class="editing-container">
                      <textarea
                          v-model="editCardValues[index].definition"
                          class="edit-textarea answer-input"
                          @keyup.enter="saveCardEdit(index, 'definition')"
                          @keyup.esc="cancelCardEdit(index, 'definition')"
                          placeholder="Definition"
                          @input="autoResizeTextarea"
                      ></textarea>
                      <div class="edit-actions">
                        <button class="action-btn cancel" @click="cancelCardEdit(index, 'definition')"><i
                            class="fas fa-times"></i></button>
                        <button class="action-btn save" @click="saveCardEdit(index, 'definition')"><i
                            class="fas fa-check"></i></button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Delete Button (Bottom-Right) -->
                <div
                    class="delete-button"
                    @mousedown="startDeleteTimer(index)"
                    @mouseup="cancelDelete"
                    @mouseleave="cancelDelete"
                    :style="{ background: (deletingIndex === index) ? getDeleteGradient(deleteProgress) : '#121729' }"
                >
                  <i class="fas fa-times" :style="{ color: (deletingIndex === index) ? '#333' : '#555' }"></i>
                </div>
              </div>
            </div>

            <div class="button-container">
              <p v-if="setError" class="generation-error">{{ setError }}</p>
              <PrimaryButton
                  :text="isSubmitting ? 'Creating...' : 'Create Flashcard Set'"
                  @click="createFlashcardSet"
                  :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {ref, computed, onMounted, nextTick, watch} from 'vue';
import apolloClient from '@/plugins/apollo.js';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ProgressLine from "@/components/ProgressLine.vue";
import UploadBox from "@/components/UploadBox.vue";
import PromptGenerator from "@/components/PromptGenerator.vue"
import PrimaryButton from "@/components/PrimaryButton.vue";
import eventBus from "@/eventBus.js";
import {useRouter} from 'vue-router';
import {UPLOAD_DOCUMENT, GENERATE_FLASHCARDS, CREATE_FLASHCARD_SET} from "@/graphql/auth.js";

// Reactive state
const router = useRouter();
const isSidebarCollapsed = ref(false);
const progressStep = ref(1);
const flashcards = ref([]);
const isPublic = ref(true);

// Document upload state
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadedDocument = ref(null);
const uploadError = ref(null);

// Flashcard generation state
const generationPrompt = ref('');
const flashcardCount = ref(10);
const isGenerating = ref(false);
const generationError = ref(null);
const generatedSetTitle = ref('');
const generatedSetDescription = ref('');
const generationDate = ref(new Date());

// Editing state for title and description
const editingTitle = ref(false);
const editingDescription = ref(false);
const editTitleValue = ref('');
const editDescriptionValue = ref('');

// Editing state for flashcards
const editingCardIndices = ref({
  term: [],
  definition: []
});
const editCardValues = ref({});

// Delete flashcard state
const deleteTimer = ref(null);
const deleteProgress = ref(0);
const deletingIndex = ref(null);

// Drag-and-drop state
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const swappingCardIndices = ref({from: null, to: null});

// Position editing state
const editingPositionIndex = ref(null);
const editPositionValue = ref(1);

// Flashcard set creation state
const isSubmitting = ref(false);
const setError = ref('');
const showSaved = ref(false);

// Initialize with 2 empty cards
onMounted(() => {
  // Initialize with 2 empty cards
  flashcards.value.push({
    term: '',
    definition: '',
    position: 1
  });
});

// Check if a card is empty (both term and definition are placeholders)
const isEmptyCard = (card) => {
  return (card.term === 'Term' || card.term === '') &&
      (card.definition === 'Definition' || card.definition === '');
};

// Check if this is the last empty card (usually the one at the end for adding new cards)
const isLastEmptyCard = (index) => {
  return index === flashcards.value.length - 1 && isEmptyCard(flashcards.value[index]);
};

// Get the index of the last non-empty card
const getLastNonEmptyIndex = () => {
  for (let i = flashcards.value.length - 1; i >= 0; i--) {
    if (!isEmptyCard(flashcards.value[i])) {
      return i;
    }
  }
  return 0;
};

// Function to handle double-click to edit position
const startEditingPosition = (index) => {
  // Don't allow editing position of empty cards or the last empty card
  if (isEmptyCard(flashcards.value[index]) || isLastEmptyCard(index)) {
    return;
  }

  editingPositionIndex.value = index;
  editPositionValue.value = index + 1; // 1-based for display

  nextTick(() => {
    const input = document.querySelector('.position-input');
    if (input) {
      input.focus();
      input.select();
    }
  });
};

// Save the edited position
const savePositionEdit = () => {
  if (editingPositionIndex.value === null) return;

  const currentIndex = editingPositionIndex.value;
  let targetPosition = Math.max(1, Math.min(parseInt(editPositionValue.value), getLastNonEmptyIndex() + 1));

  // Convert to 0-based index
  targetPosition = targetPosition - 1;

  // If position didn't change, just cancel
  if (targetPosition === currentIndex) {
    cancelPositionEdit();
    return;
  }

  // Save the card to move
  const cardToMove = {...flashcards.value[currentIndex]};

  // Execute the move with animation
  moveCardWithAnimation(currentIndex, targetPosition);

  // Reset editing state
  cancelPositionEdit();
};

// Cancel position editing
const cancelPositionEdit = () => {
  editingPositionIndex.value = null;
};

// Function to handle drag start event
const handleDragStart = (event, index) => {
  // Don't allow dragging of empty cards or the last empty card
  if (isEmptyCard(flashcards.value[index]) || isLastEmptyCard(index)) {
    event.preventDefault();
    return;
  }

  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());

  // Add a delay to show the dragging visual effect
  setTimeout(() => {
    document.querySelector(`.flashcard[data-index="${index}"]`).classList.add('dragging');
  }, 0);
};

// Function to handle drag over event
const handleDragOver = (event, index) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;

  // Don't allow dropping on the empty card at the end
  if (isLastEmptyCard(index)) {
    event.dataTransfer.dropEffect = 'none'; // Show not-allowed cursor
    return;
  }

  event.dataTransfer.dropEffect = 'move';
  dragOverIndex.value = index;
};

// Function to handle drop event
const handleDrop = (event, dropIndex) => {
  event.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return;

  // Don't allow dropping on the empty card at the end
  if (isLastEmptyCard(dropIndex)) {
    return;
  }

  // Execute the move with animation
  moveCardWithAnimation(draggedIndex.value, dropIndex);

  // Reset drag state
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

// Function to handle drag end event
const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  document.querySelectorAll('.flashcard').forEach(card => {
    card.classList.remove('dragging');
    card.classList.remove('drop-target');
  });
};

// Function to move a card with animation
const moveCardWithAnimation = (fromIndex, toIndex) => {
  // Record indices for animation
  swappingCardIndices.value = {
    from: fromIndex,
    to: toIndex
  };

  // Get the card being moved
  const cardToMove = {...flashcards.value[fromIndex]};

  // Wait for animation setup before data changes
  nextTick(() => {
    // Set animation duration through CSS
    setTimeout(() => {
      // Remove the card from its original position
      flashcards.value.splice(fromIndex, 1);

      // Insert it at the new position
      flashcards.value.splice(toIndex, 0, cardToMove);

      // Update positions after moving
      updateCardPositions();

      // Reset swapping state after animation completes
      setTimeout(() => {
        swappingCardIndices.value = {from: null, to: null};
      }, 300);
    }, 50); // Small delay to ensure animation classes are applied
  });
};

// Function to update all card positions
const updateCardPositions = () => {
  flashcards.value.forEach((card, index) => {
    card.position = index;
  });
};

// Function to get a smooth gradient for delete animation
const getDeleteGradient = (progress) => {
  // Use cubic-bezier easing for smoother animation
  const easedProgress = Math.min(100, progress); // Ensure it doesn't exceed 100%
  return `radial-gradient(circle, #EF5F5F ${easedProgress}%, #121729 ${easedProgress}%)`;
};

// Function to auto-resize textareas to fit content
const autoResizeTextarea = (event) => {
  const textarea = event.target;
  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto';
  // Set the height to match content (plus a little extra for padding)
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
};

// Watch for changes to flashcards to auto-add new ones if needed
watch(flashcards, (newVal) => {
  // Check if last card is being edited and not empty
  const lastCard = newVal[newVal.length - 1];
  if (lastCard && (lastCard.term !== 'Term' && lastCard.term !== '') &&
      (lastCard.definition !== 'Definition' && lastCard.definition !== '')) {
    // Add a new empty card
    flashcards.value.push({
      term: 'Term',
      definition: 'Definition',
      position: newVal.length
    });
  }
}, {deep: true});

// Methods for editing title and description
const startEditingTitle = () => {
  editTitleValue.value = generatedSetTitle.value === 'Title' ? '' : generatedSetTitle.value;
  editingTitle.value = true;
  nextTick(() => {
    document.querySelector('.edit-input')?.focus();
  });
};

const saveTitle = () => {
  // Don't allow empty title
  if (!editTitleValue.value.trim()) {
    editTitleValue.value = 'Title';
  }
  generatedSetTitle.value = editTitleValue.value;
  editingTitle.value = false;
};

const cancelTitleEdit = () => {
  editingTitle.value = false;
};

const startEditingDescription = () => {
  editDescriptionValue.value = generatedSetDescription.value === 'Description' ? '' : generatedSetDescription.value;
  editingDescription.value = true;
  nextTick(() => {
    document.querySelector('.edit-textarea')?.focus();

    // Initialize textarea height
    const textarea = document.querySelector('.edit-textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    }
  });
};

const saveDescription = () => {
  // Don't allow empty description
  if (!editDescriptionValue.value.trim()) {
    editDescriptionValue.value = 'Description';
  }
  generatedSetDescription.value = editDescriptionValue.value;
  editingDescription.value = false;
};

const cancelDescriptionEdit = () => {
  editingDescription.value = false;
};

// Methods for editing flashcards
// Methods for editing flashcards
const startEditingCard = (index, field) => {
  // Remove the restriction on editing the last empty card
  // This allows users to edit the last card to create new ones

  // Initialize edit values if not already done
  if (!editCardValues.value[index]) {
    editCardValues.value[index] = {
      term: '',
      definition: ''
    };
  }

  // Set the edit value - if the field contains placeholder text, make it empty
  const currentValue = flashcards.value[index][field];
  editCardValues.value[index][field] =
      (field === 'term' && currentValue === 'Term') ||
      (field === 'definition' && currentValue === 'Definition')
          ? ''
          : currentValue;

  // Mark this field as being edited
  editingCardIndices.value[field].push(index);

  // Focus the input on next tick
  nextTick(() => {
    const selector = field === 'term' ? '.question-input' : '.answer-input';
    const inputs = document.querySelectorAll(selector);
    const editingIndex = editingCardIndices.value[field].indexOf(index);

    if (inputs[editingIndex]) {
      inputs[editingIndex].focus();

      // Initialize textarea height if it's a definition field
      if (field === 'definition' && inputs[editingIndex]) {
        inputs[editingIndex].style.height = 'auto';
        inputs[editingIndex].style.height = `${inputs[editingIndex].scrollHeight + 2}px`;
      }
    }
  });
};

const saveCardEdit = (index, field) => {
  // Get the edited value
  const newValue = editCardValues.value[index][field];

  // Check if the card previously had content and now is being emptied
  const currentValue = flashcards.value[index][field];
  const isEmptyingField =
      (currentValue !== 'Term' && currentValue !== 'Definition' && currentValue !== '') &&
      (!newValue || newValue.trim() === '');

  // Don't allow emptying a card that previously had content
  if (isEmptyingField) {
    toastFunction("Field cannot be empty. Delete the card instead.", "error");
    cancelCardEdit(index, field);
    return;
  }

  // Save the edited value, using placeholder if empty (for new cards)
  flashcards.value[index][field] = newValue || (field === 'term' ? 'Term' : 'Definition');

  // Remove this field from editing state
  const fieldIndex = editingCardIndices.value[field].indexOf(index);
  if (fieldIndex !== -1) {
    editingCardIndices.value[field].splice(fieldIndex, 1);
  }
};

const cancelCardEdit = (index, field) => {
  // Just remove this field from editing state without saving
  const fieldIndex = editingCardIndices.value[field].indexOf(index);
  if (fieldIndex !== -1) {
    editingCardIndices.value[field].splice(fieldIndex, 1);
  }
};

// Methods for deleting flashcards
const startDeleteTimer = (index) => {
  deletingIndex.value = index;
  deleteProgress.value = 0;

  if (deleteTimer.value) {
    clearInterval(deleteTimer.value);
  }

  deleteTimer.value = setInterval(() => {
    // Smoother animation with more frequent updates
    deleteProgress.value += (100 / 1.5) / 20; // 100% over 1.5 seconds, updated every 50ms
    if (deleteProgress.value >= 100) {
      clearInterval(deleteTimer.value);
      deleteFlashcard(index);
      cancelDelete();
    }
  }, 50);
};

const cancelDelete = () => {
  if (deleteTimer.value) {
    clearInterval(deleteTimer.value);
    deleteTimer.value = null;
  }
  deletingIndex.value = null;
  deleteProgress.value = 0;
};

const deleteFlashcard = (index) => {
  // Animate the flashcard out before removing it
  const flashcardEl = document.querySelectorAll('.flashcard')[index];
  if (flashcardEl) {
    flashcardEl.classList.add('removing');

    // Wait for animation to complete before removing from data
    setTimeout(() => {
      flashcards.value.splice(index, 1);

      // Update positions
      updateCardPositions();

      // Ensure there's always at least one card
      if (flashcards.value.length === 0) {
        flashcards.value.push({
          term: 'Term',
          definition: 'Definition',
          position: 0
        });
      }
    }, 300); // Match this with CSS animation duration
  }
};

// Handle Continue or Generate
const handleContinue = async () => {
  if (generationPrompt.value.trim().length > 0) {
    // If there's text in the prompt, generate flashcards
    await generateFlashcards();
  } else {
    // Otherwise, just continue to review step with default empty cards
    progressStep.value = 2;
  }
};

// Computed properties
const formattedDate = computed(() => {
  if (!generationDate.value) return '';

  const date = new Date(generationDate.value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

// Methods
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleFileSelected = async (file) => {
  if (!file) {
    // Reset upload state
    uploadedDocument.value = null;
    uploadError.value = null;
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  uploadError.value = null;

  try {
    toastFunction("Uploading document...", "info");

    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 300);

    const {data} = await apolloClient.mutate({
      mutation: UPLOAD_DOCUMENT,
      variables: {
        input: file
      }
    });

    clearInterval(progressInterval);
    uploadProgress.value = 90;
    toastFunction("Creating embeddings...", "info");

    const embeddingsInterval = setInterval(() => {
      if (uploadProgress.value < 100) {
        uploadProgress.value += 1;
      } else {
        clearInterval(embeddingsInterval);
      }
    }, 500);

    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(embeddingsInterval);
    uploadProgress.value = 100;

    // Process the upload result
    const uploadResult = data.uploadDocument;
    console.log("Document upload successful:", uploadResult);

    // Store the uploaded document info
    uploadedDocument.value = {
      filename: uploadResult.filename,
      originalFilename: uploadResult.originalFilename,
      size: uploadResult.size,
      contentType: uploadResult.contentType,
      path: `http://localhost:8080/docs/${uploadResult.filename}`
    };

    toastFunction("Document uploaded successfully!", "success");
  } catch (error) {
    console.error("Document upload error:", error);
    uploadError.value = error.message || "Failed to upload document";
    toastFunction("Failed to upload document", "error");
  } finally {
    if (uploadError.value) {
      isUploading.value = false;
    } else {
      setTimeout(() => {
        isUploading.value = false;
      }, 500);
    }
  }
};

const generateFlashcards = async () => {
  if (!generationPrompt.value.trim()) {
    toastFunction("Please enter what flashcards you want to generate", "error");
    return;
  }

  isGenerating.value = true;
  generationError.value = null;

  try {
    toastFunction("Generating flashcards...", "info");

    const options = {
      query: generationPrompt.value,
      kQuestions: flashcardCount.value
    };

    const {data} = await apolloClient.mutate({
      mutation: GENERATE_FLASHCARDS,
      variables: {options}
    });

    const result = data.generateFlashcardSet;
    console.log("Flashcard generation successful:", result);

    generatedSetTitle.value = result.title || 'Generated Flashcard Set';
    generatedSetDescription.value = result.description || `Generated ${result.generatedFlashcards.length} flashcards`;

    // Set generation date
    generationDate.value = new Date();

    // Transform the generated flashcards to match the expected format
    flashcards.value = result.generatedFlashcards.map((card, index) => ({
      term: card.term,
      definition: card.definition,
      position: index
    }));

    // Add empty card at the end
    flashcards.value.push({
      term: 'Term',
      definition: 'Definition',
      position: flashcards.value.length
    });

    // Move to the review step
    progressStep.value = 2;

    toastFunction("Flashcards generated successfully!", "success");
  } catch (error) {
    console.error("Flashcard generation error:", error);
    generationError.value = error.message || "Failed to generate flashcards";
    toastFunction("Failed to generate flashcards", "error");
  } finally {
    isGenerating.value = false;
  }
};

const createFlashcardSet = async () => {
  isSubmitting.value = true;
  setError.value = '';

  try {
    // Filter out empty flashcards before submitting
    const validFlashcards = flashcards.value.filter(card =>
        !isEmptyCard(card)
    );

    // Create flashcard data in the format needed for the mutation
    const flashcardData = validFlashcards.map((card, index) => ({
      term: card.term === 'Term' ? '' : card.term,
      definition: card.definition === 'Definition' ? '' : card.definition,
      position: index // Zero-based position as required by the schema
    }));

    const {data} = await apolloClient.mutate({
      mutation: CREATE_FLASHCARD_SET,
      variables: {
        input: {
          title: generatedSetTitle.value === 'Title' ? '' : generatedSetTitle.value,
          description: generatedSetDescription.value === 'Description' ? '' : generatedSetDescription.value,
          isPublic: isPublic.value,
          flashcards: flashcardData
        }
      }
    });

    console.log("Flashcard set created:", data.createFlashcardSet);

    showSaved.value = true;
    toastFunction("Flashcard set created successfully!", "success");

    setTimeout(() => {
      router.push(`/library/view/${data.createFlashcardSet.id}`);
    }, 1500);

  } catch (error) {
    console.error("Error creating flashcard set:", error);
    setError.value = error.message || "Failed to create flashcard set";
    toastFunction("Failed to create flashcard set", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const toastFunction = (message, type) => {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.page {
  display: flex;
  background-color: #181E2E;
}

.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 250px;
  display: flex;
  width: calc(100% - 250px);
  padding-top: 80px;
  background-color: #181E2E;
}

.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.content-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #181E2E;
}

.content-container {
  background: #22293A;
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.content-text {
  text-align: left;
  max-width: 70%;
}

.content-text h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  font-family: "Outfit", sans-serif;
}

.content-text p {
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 0;
  font-family: "Outfit", sans-serif;
}

.page-icon {
  width: 170px;
  height: 110px;
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 30px 0;
}

.creation-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.upload-section, .prompt-section {
  width: 90%;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  text-align: left;
}

.section-header h2 {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  font-family: "Outfit", sans-serif;
}

.optional-badge {
  background-color: rgba(39, 174, 96, 0.15);
  color: #27AE60;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
}

.required-badge {
  background-color: rgba(239, 95, 95, 0.15);
  color: #ef5f5f;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
}

.flashcard-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 90%;
  gap: 20px;
  min-height: 400px;
}

.button-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  margin-top: 20px;
}

.button-container :deep(.primary-button) {
  width: 30%;
  max-width: 200px;
}

.generation-error {
  color: #ff5e5e;
  background: rgba(255, 94, 94, 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  width: 100%;
  max-width: 400px;
  font-family: "Outfit", sans-serif;
  text-align: center;
  align-self: center;
}

.review-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.set-details {
  width: 90%;
  background: #121729;
  border-radius: 12px;
  padding: 25px;
  text-align: left;
}

.set-title {
  color: white;
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 10px 0;
  font-family: "Outfit", sans-serif;
}

.set-description {
  color: #a4aabf;
  font-size: 16px;
  margin: 0 0 15px 0;
  font-family: "Outfit", sans-serif;
  line-height: 1.5;
}

.set-stats {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #5F98EF;
  font-family: "Outfit", sans-serif;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-divider {
  margin: 0 10px;
  color: #3d4663;
}

.success-message {
  color: #27AE60;
  background: rgba(39, 174, 96, 0.1);
  padding: 15px;
  border-radius: 8px;
  font-family: "Outfit", sans-serif;
  text-align: center;
  width: 90%;
  margin-top: 20px;
}

.visibility-control {
  width: 90%;
  background-color: #121729;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.visibility-label {
  color: white;
  font-size: 16px;
  font-weight: 500;
  font-family: "Outfit", sans-serif;
}

.toggle-group {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2a335a;
}

.toggle-btn {
  background: #1a2233;
  color: #9aa1b3;
  border: none;
  padding: 8px 20px;
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #5F98EF;
  color: white;
}

.visibility-description {
  color: #a4aabf;
  font-size: 14px;
  font-family: "Outfit", sans-serif;
}

/* Editable fields */
.editable-field {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.editable-field:hover .edit-icon {
  opacity: 1;
}

.edit-icon {
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #5F98EF;
  font-size: 0.8em;
}

.editing-container {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.edit-input, .edit-textarea {
  width: 100%;
  background: #1a2233;
  border: 1px solid #2a335a;
  border-radius: 8px;
  padding: 10px;
  color: white;
  font-family: "Outfit", sans-serif;
  font-size: 16px;
  outline: none;
}

.edit-textarea {
  min-height: 60px;
  max-height: 350px;
  overflow-y: auto;
  resize: none; /* Disable manual resizing since we're auto-resizing */
  line-height: 1.5;
}

/* Position edit actions outside of the container */
.edit-actions {
  display: flex;
  position: absolute;
  right: 0;
  bottom: -35px; /* Position below the input */
  gap: 8px;
  z-index: 10;
  background: #1a2233;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background 0.2s;
}

.action-btn.cancel {
  color: #ff5e5e;
}

.action-btn.save {
  color: #27AE60;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Flashcard styles */
.flashcard {
  background: #1a2233;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  will-change: transform, opacity;
}

.flashcard.deleting {
  animation: pulse 1.5s infinite alternate;
}

.flashcard.removing {
  transform: scale(0.9);
  opacity: 0;
}

/* Drag and drop styles */
.flashcard.dragging {
  opacity: 0.6;
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 8px 20px rgba(95, 152, 239, 0.3);
}

.flashcard.drop-target {
  border: 2px dashed #5F98EF;
  background: #1e2844;
}

/* Swapping animation styles */
.flashcard.swapping-from {
  animation: swap-from 0.3s ease-in-out;
}

.flashcard.swapping-to {
  animation: swap-to 0.3s ease-in-out;
}

@keyframes swap-from {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-30px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes swap-to {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(30px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 8px rgba(239, 95, 95, 0.1);
  }
  100% {
    box-shadow: 0 4px 12px rgba(239, 95, 95, 0.4);
  }
}

/* Number display with drag handle */
.flashcard-number {
  position: absolute;
  top: 0;
  left: 0;
  background: #5F98EF;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  border-top-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 2;
  transition: background-color 0.3s ease;
  cursor: grab;
}

.flashcard-number.editing {
  cursor: text;
}

.flashcard-number:hover {
  background: #4080e0;
}

.flashcard-number:active {
  cursor: grabbing;
}

.flashcard-number.not-draggable {
  cursor: not-allowed;
  opacity: 0.7;
}

.drag-handle {
  position: absolute;
  opacity: 0;
  font-size: 12px;
  top: 28px;
  transition: opacity 0.2s;
}

.flashcard-number:hover .drag-handle {
  opacity: 1;
}

/* Position input styling */
.position-input {
  width: 95%;
  height: 90%;
  text-align: center;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  outline: none;
  padding: 0;
}

/* Hide input spinners for number inputs */
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinners {
  -moz-appearance: textfield; /* Firefox */
}

/* Delete button */
.delete-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  transition: background 0.3s ease, color 0.3s ease;
  background: #121729;
  border-top-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 2;
}

.flashcard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 25px;
  margin-bottom: 25px;
}

.flashcard-item {
  background: #22293A;
  border-radius: 8px;
  padding: 15px;
  color: white;
  font-family: "Outfit", sans-serif;
  text-align: left;
  position: relative;
  overflow: visible; /* Allow content to overflow for edit actions */
}

.flashcard-item.editing {
  z-index: 5; /* Ensure it appears above other items while editing */
  box-shadow: 0 0 0 2px #5F98EF; /* Highlight the item being edited */
}

/* Ensure prompt generator elements are centered properly */
:deep(.prompt-generator) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.number-control) {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>