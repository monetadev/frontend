
<template>
  <div class="edit-flashcard-set">
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
    <div v-else class="form-container">
      <h1>Edit Flashcard Set</h1>

      <!-- Set Details Section -->
      <div class="set-details">
        <div class="form-group">
          <label for="title">Title</label>
          <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="Enter title"
              class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter description"
              class="form-control"
          ></textarea>
        </div>

        <div class="form-group visibility">
          <label class="toggle-label">
            <input type="checkbox" v-model="formData.isPublic">
            <span class="slider"></span>
            <span class="toggle-text">{{ formData.isPublic ? 'Public' : 'Private' }}</span>
          </label>
        </div>
      </div>

      <!-- Flashcards Section -->
      <div class="flashcards-section">
        <h2>Flashcards <span v-if="formData.flashcards.length">({{ formData.flashcards.length }})</span></h2>

        <div
            v-for="(card, index) in formData.flashcards"
            :key="index"
            class="flashcard-item"
        >
          <div class="card-header">
            <span class="card-number">{{ index + 1 }}</span>
            <button
                @click="removeFlashcard(index)"
                class="delete-card-btn"
                type="button"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="card-content">
            <div class="form-group">
              <label :for="`term-${index}`">Term</label>
              <input
                  :id="`term-${index}`"
                  v-model="card.term"
                  type="text"
                  placeholder="Enter term"
                  class="form-control"
              />
            </div>

            <div class="form-group">
              <label :for="`definition-${index}`">Definition</label>
              <textarea
                  :id="`definition-${index}`"
                  v-model="card.definition"
                  placeholder="Enter definition"
                  class="form-control"
              ></textarea>
            </div>
          </div>
        </div>

        <button @click="addFlashcard" class="add-card-btn" type="button">
          <i class="fas fa-plus"></i> Add Flashcard
        </button>
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
</template>

<script setup>
import { ref, computed, onMounted} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { GET_FLASHCARD_SET_BY_ID, UPDATE_FLASHCARD_SET } from '@/graphql/auth';
import eventBus from "@/eventBus.js";
import apolloClient from '@/plugins/apollo.js';

const route = useRoute();
const router = useRouter();
const setId = route.params.id;

const flashcardSetData = ref(null);

// Form data
const formData = ref({
  title: '',
  description: '',
  isPublic: false,
  flashcards: []
});

const originalData = ref(null);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);

// Load flashcard set data
async function loadFlashcardSet() {
  loading.value = true;
  error.value = null;

  try {
    const { data } = await apolloClient.query({
      query: GET_FLASHCARD_SET_BY_ID,
      variables: { id: setId },
      fetchPolicy: 'network-only' // Force a fresh request
    });

    console.log("Query result:", data);

    if (data?.findFlashcardSetById) {
      flashcardSetData.value = data.findFlashcardSetById;

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

// Call on component mount
onMounted(() => {
  loadFlashcardSet();
});

// Validation
const isValid = computed(() => {
  // Title is required
  if (!formData.value.title.trim()) return false;

  // At least one flashcard required
  if (formData.value.flashcards.length === 0) return false;

  // Each flashcard must have term and definition
  return formData.value.flashcards.every(
      card => card.term.trim() && card.definition.trim()
  );
});

// Check if form has changes
const hasChanges = computed(() => {
  if (!originalData.value) return false;
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

// Add a new flashcard
function addFlashcard() {
  const newPosition = formData.value.flashcards.length + 1;
  formData.value.flashcards.push({
    term: '',
    definition: '',
    position: newPosition
  });
}

// Remove a flashcard
function removeFlashcard(index) {
  formData.value.flashcards.splice(index, 1);

  // Update positions
  formData.value.flashcards.forEach((card, idx) => {
    card.position = idx + 1;
  });
}

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
    // Clone the flashcards array and sort by position
    const sortedFlashcards = [...formData.value.flashcards].sort((a, b) => a.position - b.position);

    // Create a NEW array with ONLY the necessary fields (term, definition, position)
    const simplifiedFlashcards = sortedFlashcards.map((card, index) => ({
      term: card.term,
      definition: card.definition,
      position: index + 1  // Important: Start from 1 and increment sequentially
    }));

    // Prepare the final input object
    const flashcardSetInput = {
      title: formData.value.title,
      description: formData.value.description,
      isPublic: formData.value.isPublic,
      flashcards: simplifiedFlashcards
    };

    console.log("Sending update with:", flashcardSetInput);

    // Execute the mutation
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_FLASHCARD_SET,
      variables: {
        id: setId,
        flashcardSetInput
      }
    });

    console.log("Update result:", data);

    if (data?.updateFlashcardSet) {
      toastFunction("Flashcard set updated successfully", "success");
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

.edit-flashcard-set {
  background-color: #22293A;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  font-family: "Outfit", sans-serif;
  color: white;
}

.form-container {
  width: 100%;
  max-width: 800px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 30px;
  font-weight: 600;
}

h2 {
  font-size: 1.5rem;
  margin: 30px 0 20px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #3a445c;
  background-color: #1b2233;
  color: white;
  font-family: inherit;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.visibility {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-label input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background-color: #3a445c;
  border-radius: 13px;
  transition: .4s;
  margin-right: 10px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .slider {
  background-color: #5F98EF;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.toggle-text {
  font-weight: normal;
}

.flashcards-section {
  margin-top: 40px;
}

.flashcard-item {
  background-color: #1b2233;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #3a445c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-number {
  font-weight: 600;
  font-size: 1.1rem;
  background: #3a445c;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-card-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.delete-card-btn:hover {
  background-color: #c0392b;
}

.add-card-btn {
  background-color: #5F98EF;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.add-card-btn:hover {
  background-color: #4a86e8;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
}

.cancel-btn {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn {
  background-color: #5F98EF;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
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

@media (max-width: 600px) {
  .actions {
    flex-direction: column;
  }

  .cancel-btn, .save-btn {
    width: 100%;
  }
}

.debug-info {
  background-color: #34495e;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  font-family: monospace;
  color: white;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow: auto;
}

.debug-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: white;
}

.error-container {
  color: #e74c3c;
}
</style>
