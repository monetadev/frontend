<template>
  <div class="page">
    <SidebarNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar"/>
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <NavigationBar :isSidebarCollapsed="isSidebarCollapsed"/>
      <div class="content-wrapper">
        <div class="content-container">
          <!-- Loading state -->
          <div v-if="loading" class="loading-container">
            <p>Loading flashcard set...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-container">
            <p>Error loading flashcard set: {{ error.message }}</p>
            <button @click="goBack" class="cancel-btn">Go Back</button>
          </div>

          <!-- Edit form -->
          <div v-else class="edit-flashcard-set">
            <div class="content-header">
              <div class="content-text">
                <h1>Edit Flashcard Set</h1>
                <p>Update your flashcard set or add more cards</p>
              </div>
              <img src="@/assets/book.svg" class="page-icon" alt="Book Icon"/>
            </div>

            <!-- Set Details with Editable Fields -->
            <div class="set-details">
              <!-- Editable Title -->
              <div class="editable-field">
                <h2 v-if="!editingTitle" class="set-title" @click="startEditingTitle">
                  {{ formData.title || 'Title' }}
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
                  {{ formData.description || 'Description' }}
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
                <span class="stat-item">{{ formData.flashcards.length - (isLastEmptyCard(formData.flashcards.length - 1) ? 1 : 0) }} Flashcards</span>
                <span class="stat-divider">•</span>
                <span class="stat-item">Last Updated {{ formattedDate }}</span>
              </div>
            </div>

            <!-- Visibility Toggle -->
            <div class="visibility-control">
              <div class="visibility-label">Set Visibility:</div>
              <div class="toggle-group">
                <button
                    @click="formData.isPublic = true"
                    :class="['toggle-btn', formData.isPublic ? 'active' : '']"
                >
                  Public
                </button>
                <button
                    @click="formData.isPublic = false"
                    :class="['toggle-btn', !formData.isPublic ? 'active' : '']"
                >
                  Private
                </button>
              </div>
              <div class="visibility-description">
                {{ formData.isPublic ? 'Anyone can view this set' : 'Only you can view this set' }}
              </div>
            </div>

            <!-- Flashcards -->
            <div class="flashcard-container">
              <div
                  v-for="(card, index) in formData.flashcards"
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
                  <!-- Term section -->
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

                  <!-- Definition section -->
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

            <!-- Actions Section -->
            <div class="actions">
              <button @click="goBack" class="cancel-btn" type="button">Cancel</button>
              <button
                  @click="saveChanges"
                  class="save-btn"
                  type="button"
                  :disabled="saving || !isValid"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { GET_FLASHCARD_SET_BY_ID, UPDATE_FLASHCARD_SET } from '@/graphql/auth';
import eventBus from "@/eventBus.js";
import apolloClient from '@/plugins/apollo.js';
import SidebarNavigation from "@/components/SideNavigation.vue";
import NavigationBar from "@/components/TopNavigation.vue";

const route = useRoute();
const router = useRouter();
const setId = route.params.id;
const isSidebarCollapsed = ref(false);

// Form data
const formData = ref({
  title: '',
  description: '',
  isPublic: false,
  flashcards: []
});

// Component state
const originalData = ref(null);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);

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

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// Load flashcard set data
async function loadFlashcardSet() {
  loading.value = true;
  error.value = null;

  try {
    const { data } = await apolloClient.query({
      query: GET_FLASHCARD_SET_BY_ID,
      variables: { id: setId },
      fetchPolicy: 'network-only'
    });

    if (data?.findFlashcardSetById) {
      // Populate form data
      formData.value = {
        title: data.findFlashcardSetById.title || '',
        description: data.findFlashcardSetById.description || '',
        isPublic: !!data.findFlashcardSetById.isPublic,
        flashcards: Array.isArray(data.findFlashcardSetById.flashcards)
            ? data.findFlashcardSetById.flashcards.map(card => ({
              id: card.id,
              term: card.term || '',
              definition: card.definition || '',
              position: card.position || 0
            }))
            : []
      };

      formData.value.flashcards.sort((a, b) => a.position - b.position);

      // Add an empty card at the end if needed
      ensureEmptyCardAtEnd();

      // Store original data for comparison
      originalData.value = JSON.parse(JSON.stringify(formData.value));
    }
    else {
      throw new Error("Flashcard set not found");
    }
  } catch (err) {
    console.error("Error loading flashcard set:", err);
    error.value = err;
  } finally {
    loading.value = false;
  }
}

// Ensure there's always an empty card at the end for adding new ones
function ensureEmptyCardAtEnd() {
  const lastCard = formData.value.flashcards[formData.value.flashcards.length - 1];
  if (!lastCard || (lastCard.term && lastCard.definition)) {
    formData.value.flashcards.push({
      term: '',
      definition: '',
      position: formData.value.flashcards.length
    });
  }
}

// Call on component mount
onMounted(() => {
  loadFlashcardSet();
});

// Watch for changes to flashcards to auto-add new ones if needed
watch(() => formData.value.flashcards, (newVal) => {
  const lastCard = newVal[newVal.length - 1];
  if (lastCard && lastCard.term && lastCard.definition) {
    // Add a new empty card
    formData.value.flashcards.push({
      term: '',
      definition: '',
      position: newVal.length
    });
  }
}, { deep: true });

// Check if a card is empty
const isEmptyCard = (card) => {
  return !card.term && !card.definition;
};

// Check if this is the last empty card
const isLastEmptyCard = (index) => {
  return index === formData.value.flashcards.length - 1 && isEmptyCard(formData.value.flashcards[index]);
};

// Get the index of the last non-empty card
const getLastNonEmptyIndex = () => {
  for (let i = formData.value.flashcards.length - 1; i >= 0; i--) {
    if (!isEmptyCard(formData.value.flashcards[i])) {
      return i;
    }
  }
  return 0;
};

// Format the date
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

// Validation
const isValid = computed(() => {
  // Title is required
  if (!formData.value.title.trim()) return false;

  // At least one flashcard required
  if (formData.value.flashcards.length === 0) return false;

  // Each flashcard must have term and definition (except the last empty one)
  const validCards = formData.value.flashcards.filter(
      (card, index) => !(index === formData.value.flashcards.length - 1 && isEmptyCard(card))
  );

  return validCards.every(card => card.term.trim() && card.definition.trim());
});

// Check if form has changes
const hasChanges = computed(() => {
  if (!originalData.value) return false;

  // Get non-empty flashcards for comparison
  const currentFlashcards = formData.value.flashcards.filter(card => !isEmptyCard(card));
  const originalFlashcards = originalData.value.flashcards;

  // Compare basic properties
  if (formData.value.title !== originalData.value.title ||
      formData.value.description !== originalData.value.description ||
      formData.value.isPublic !== originalData.value.isPublic ||
      currentFlashcards.length !== originalFlashcards.length) {
    return true;
  }

  // Compare each flashcard
  for (let i = 0; i < currentFlashcards.length; i++) {
    if (currentFlashcards[i].term !== originalFlashcards[i].term ||
        currentFlashcards[i].definition !== originalFlashcards[i].definition ||
        currentFlashcards[i].position !== originalFlashcards[i].position) {
      return true;
    }
  }

  return false;
});

// Edit title methods
const startEditingTitle = () => {
  editTitleValue.value = formData.value.title;
  editingTitle.value = true;
  nextTick(() => {
    document.querySelector('.edit-input')?.focus();
  });
};

const saveTitle = () => {
  if (!editTitleValue.value.trim()) {
    toastFunction("Title cannot be empty", "error");
    return;
  }
  formData.value.title = editTitleValue.value;
  editingTitle.value = false;
};

const cancelTitleEdit = () => {
  editingTitle.value = false;
};

// Edit description methods
const startEditingDescription = () => {
  editDescriptionValue.value = formData.value.description;
  editingDescription.value = true;
  nextTick(() => {
    const textarea = document.querySelector('.edit-textarea');
    if (textarea) {
      textarea.focus();
      autoResizeTextarea({ target: textarea });
    }
  });
};

const saveDescription = () => {
  formData.value.description = editDescriptionValue.value;
  editingDescription.value = false;
};

const cancelDescriptionEdit = () => {
  editingDescription.value = false;
};

// Auto-resize textarea
const autoResizeTextarea = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
};

// Edit card methods
const startEditingCard = (index, field) => {
  // Initialize edit values if not already done
  if (!editCardValues.value[index]) {
    editCardValues.value[index] = {
      term: '',
      definition: ''
    };
  }

  // Set the edit value
  editCardValues.value[index][field] = formData.value.flashcards[index][field];

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
      if (field === 'definition') {
        autoResizeTextarea({ target: inputs[editingIndex] });
      }
    }
  });
};

const saveCardEdit = (index, field) => {
  // Get the edited value
  const newValue = editCardValues.value[index][field];

  // Don't allow emptying a required field
  if (!newValue.trim() && index !== formData.value.flashcards.length - 1) {
    toastFunction("Field cannot be empty. Delete the card instead.", "error");
    cancelCardEdit(index, field);
    return;
  }

  // Save the edited value
  formData.value.flashcards[index][field] = newValue;

  // Remove this field from editing state
  const fieldIndex = editingCardIndices.value[field].indexOf(index);
  if (fieldIndex !== -1) {
    editingCardIndices.value[field].splice(fieldIndex, 1);
  }
};

const cancelCardEdit = (index, field) => {
  // Remove this field from editing state without saving
  const fieldIndex = editingCardIndices.value[field].indexOf(index);
  if (fieldIndex !== -1) {
    editingCardIndices.value[field].splice(fieldIndex, 1);
  }
};

// Delete card methods
const startDeleteTimer = (index) => {
  // Don't allow deleting the last empty card
  if (isLastEmptyCard(index)) {
    return;
  }

  deletingIndex.value = index;
  deleteProgress.value = 0;

  if (deleteTimer.value) {
    clearInterval(deleteTimer.value);
  }

  deleteTimer.value = setInterval(() => {
    deleteProgress.value += (100 / 1.5) / 20; // 100% over 1.5 seconds
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
  const flashcardEl = document.querySelectorAll('.flashcard')[index];
  if (flashcardEl) {
    flashcardEl.classList.add('removing');

    setTimeout(() => {
      formData.value.flashcards.splice(index, 1);
      updateCardPositions();
      ensureEmptyCardAtEnd();
    }, 300);
  }
};

// Get a gradient for the delete animation
const getDeleteGradient = (progress) => {
  const easedProgress = Math.min(100, progress);
  return `radial-gradient(circle, #EF5F5F ${easedProgress}%, #121729 ${easedProgress}%)`;
};

// Drag and drop methods
const startEditingPosition = (index) => {
  if (isLastEmptyCard(index)) return;

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

  // Execute the move with animation
  moveCardWithAnimation(currentIndex, targetPosition);
  cancelPositionEdit();
};

const cancelPositionEdit = () => {
  editingPositionIndex.value = null;
};

const handleDragStart = (event, index) => {
  if (isLastEmptyCard(index)) {
    event.preventDefault();
    return;
  }

  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());

  setTimeout(() => {
    document.querySelector(`.flashcard[data-index="${index}"]`).classList.add('dragging');
  }, 0);
};

const handleDragOver = (event, index) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;

  if (isLastEmptyCard(index)) {
    event.dataTransfer.dropEffect = 'none';
    return;
  }

  event.dataTransfer.dropEffect = 'move';
  dragOverIndex.value = index;
};

const handleDrop = (event, dropIndex) => {
  event.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return;

  if (isLastEmptyCard(dropIndex)) return;

  moveCardWithAnimation(draggedIndex.value, dropIndex);
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  document.querySelectorAll('.flashcard').forEach(card => {
    card.classList.remove('dragging');
    card.classList.remove('drop-target');
  });
};

const moveCardWithAnimation = (fromIndex, toIndex) => {
  swappingCardIndices.value = {
    from: fromIndex,
    to: toIndex
  };

  const cardToMove = {...formData.value.flashcards[fromIndex]};

  nextTick(() => {
    setTimeout(() => {
      formData.value.flashcards.splice(fromIndex, 1);
      formData.value.flashcards.splice(toIndex, 0, cardToMove);
      updateCardPositions();

      setTimeout(() => {
        swappingCardIndices.value = {from: null, to: null};
      }, 300);
    }, 50);
  });
};

const updateCardPositions = () => {
  formData.value.flashcards.forEach((card, index) => {
    card.position = index;
  });
};

// Navigate back
function goBack() {
  if (hasChanges.value) {
    if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
      router.back();
    }
  } else {
    router.back();
  }
}

// Save changes
async function saveChanges() {
  if (!isValid.value) return;
  saving.value = true;

  try {
    // Filter out the empty card at the end
    const validFlashcards = formData.value.flashcards.filter(card => !isEmptyCard(card));

    // Prepare flashcards data
    const flashcardsInput = validFlashcards.map((card, index) => ({
      term: card.term,
      definition: card.definition,
      position: index + 1  // Start from 1
    }));

    // Prepare the update input
    const flashcardSetInput = {
      title: formData.value.title,
      description: formData.value.description,
      isPublic: formData.value.isPublic,
      flashcards: flashcardsInput
    };

    // Execute the mutation
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_FLASHCARD_SET,
      variables: {
        id: setId,
        flashcardSetInput
      }
    });

    if (data?.updateFlashcardSet) {
      toastFunction("Flashcard set updated successfully", "success");

      // Update the original data to reflect the new state
      originalData.value = JSON.parse(JSON.stringify({
        ...formData.value,
        flashcards: validFlashcards
      }));

      router.push(`/view/${setId}`);
    } else {
      toastFunction("Failed to update flashcard set", "error");
    }
  } catch (error) {
    console.error("Error updating flashcard set:", error);
    toastFunction("Failed to update flashcard set: " + error.message, "error");
  } finally {
    saving.value = false;
  }
}

function toastFunction(message, type) {
  eventBus.emit('toast', {
    msg: message,
    type: type,
    duration: 3000
  });
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.page {
  display: flex;
  background-color: #181E2E;
  min-height: 100vh;
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
  padding: 20px;
  background-color: #181E2E;
}

.content-container {
  background: #22293A;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1000px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
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

.edit-flashcard-set {
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

.visibility-control {
  width: 90%;
  background-color: #121729;
  border-radius: 12px;
  padding: 20px;
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
  resize: none;
  line-height: 1.5;
}

.edit-actions {
  display: flex;
  position: absolute;
  right: 0;
  bottom: -35px;
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

.flashcard.swapping-from {
  animation: swap-from 0.3s ease-in-out;
}

.flashcard.swapping-to {
  animation: swap-to 0.3s ease-in-out;
}

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

.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinners {
  -moz-appearance: textfield;
}

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
  overflow: visible;
}

.flashcard-item.editing {
  z-index: 5;
  box-shadow: 0 0 0 2px #5F98EF;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  width: 90%;
}

.cancel-btn {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Outfit", sans-serif;
}

.save-btn {
  background-color: #5F98EF;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Outfit", sans-serif;
}

.cancel-btn:hover {
  background-color: #2c3e50;
}

.save-btn:hover {
  background-color: #4a86e8;
}

.save-btn:disabled {
  background-color: #3a445c;
  cursor: not-allowed;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: white;
  font-family: "Outfit", sans-serif;
}

.error-container {
  color: #e74c3c;
}

@keyframes swap-from {
  0% { transform: translateX(0); opacity: 1; }
  50% { transform: translateX(-30px); opacity: 0.7; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes swap-to {
  0% { transform: translateX(0); opacity: 1; }
  50% { transform: translateX(30px); opacity: 0.7; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 4px 8px rgba(239, 95, 95, 0.1); }
  100% { box-shadow: 0 4px 12px rgba(239, 95, 95, 0.4); }
}

@media (max-width: 600px) {
  .actions {
    flex-direction: column;
  }

  .cancel-btn, .save-btn {
    width: 100%;
  }
}
</style>
