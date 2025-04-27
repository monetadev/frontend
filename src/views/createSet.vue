<template>
  <div class="create-set">
    <SideNavigation :isCollapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'collapsed': isSidebarCollapsed }">
      <TopNavigation :isSidebarCollapsed="isSidebarCollapsed" />
      <div class="content">
        <div class="header-container">
          <FCTitle title="Create a Flashcard Set" class="FC-Title"/>
          <div class="saved-text">
            <Saved text="Saved" :show="showSaved" />
          </div>
        </div>
        <!-- <div class="button-container">
          <sButton text="Create" />
          <sButton text="Clear" />
        </div> -->
        <div class="input-forms-container">
          <createForm
              v-model="formData.title"
              type="text"
              placeholder="Give your flashcard set a title"
              name="title"
              :required="true"
              id="title"
          />
          <createForm
              v-model="formData.description"
              type="text"
              placeholder="Description"
              name="description"
              :required="false"
              id="description"
          />
        </div>
        <div class="create-Panels">
          <createPanel
              v-for="i in flashcardsCount"
              :key="i"
              :number="i"
              @update-flashcard="handleFlashcardUpdate"
              @delete-panel="handleDeletePanel"
          />
          <addCard @add-card="handleAddCard" />
        </div>
        <div class="button-container">
          <sButton text="Create" @click="handleSubmit" :loading="isSubmitting" />
          <sButton text="Clear" @click="handleClear" :disabled="isSubmitting" />
        </div>

        <!-- Add loading indicator -->
        <div v-if="loading || isSubmitting" class="loading-indicator">
          Creating flashcard set...
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { useRouter } from 'vue-router';
import SideNavigation from '@/components/SideNavigation.vue';
import TopNavigation from '@/components/TopNavigation.vue';
import Saved from '@/components/saved.vue';
import sButton from '@/components/SecondaryButton.vue';
import createForm from '@/components/createForm.vue';
import FCTitle from '@/components/FlashcardTitle.vue';
import createPanel from '@/components/createPanel.vue';
import addCard from '@/components/addCardCreate.vue';
import {CREATE_FLASHCARD_SET} from "@/graphql/auth.js";

// State
const isSidebarCollapsed = ref(true);
const showSaved = ref(false);

const router = useRouter();
const isPublic = ref(true); // Default to public
const isSubmitting = ref(false);
const errorMessage = ref('');

const flashcardsCount = ref(4);
const flashcardsData = ref([]);

const {mutate: createFlashcardSet, loading, error, onDone} = useMutation(CREATE_FLASHCARD_SET);

// Handle successful creation
onDone((result) => {
  showSaved.value = true;
  setTimeout(() => {
    // Navigate to the flashcard view with the new ID
    const newSetId = result.data.createFlashcardSet.id;
    router.push(`/view/${newSetId}`);
  }, 1500);
});


// Add debounce to prevent multiple rapid submissions
let isProcessing = false;

// Submit function
function handleSubmit() {

  if(isProcessing) {
    return;
  }

  isProcessing = true;

  // Validation
  if (!formData.value.title) {
    errorMessage.value = 'Title is required';
    return;
  }

  if (flashcardsData.value.length === 0) {
    errorMessage.value = 'At least one flashcard is required';
    return;
  }

  // Prepare the input
  const input = {
    title: formData.value.title,
    description: formData.value.description || '',
    isPublic: isPublic.value,
    flashcards: flashcardsData.value.map(card => ({
      term: card.term,
      definition: card.definition,
      position: card.position
    }))
  };

  isSubmitting.value = true;
  errorMessage.value = '';

  // Call the mutation
  createFlashcardSet({ input })
      .catch(err => {
        console.error('Error creating flashcard set:', err);
        errorMessage.value = 'Failed to create flashcard set. Please try again.';
      })
      .finally(() => {
        isSubmitting.value = false;
        setTimeout(() => {
          isProcessing = false;
        }, 1000)
      });
}


const formData = ref({
  title: '',
  description: ''
});


// Methods
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  console.log("Sidebar toggled:", isSidebarCollapsed.value);
}

function handleFlashcardUpdate(flashcardData) {
  const existingIndex = flashcardsData.value.findIndex(card => card.position === flashcardData.position);

  if (existingIndex !== -1) {
    flashcardsData.value[existingIndex] = flashcardData;
  } else {
    flashcardsData.value.push(flashcardData);
  }

  console.log("Updated flashcards data:", flashcardsData.value);
}

function handleAddCard() {
  flashcardsCount.value++;
  console.log("Added new card. Total cards:", flashcardsCount.value);
}

// Update your clear function
function handleClear() {
  flashcardsData.value = [];
  flashcardsCount.value = 1; // Reset to one empty card
  errorMessage.value = '';
}

function handleDeletePanel(position) {
  if (flashcardsCount.value > 1) {
    flashcardsCount.value--;

    flashcardsData.value = flashcardsData.value.filter(card => card.position !== position);

    flashcardsData.value.forEach((card, index) => {
      card.position = index + 1;
    });

    console.log("Deleted panel. Remaining cards:", flashcardsData.value);
  }
}
</script>

<style scoped>
.create-set {
  display: flex;
  background-color: #22293A;
  min-height: 100vh;
  color: white;
  font-family: "Outfit", sans-serif;
}
.main-content {
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: 220px;
}

.main-content.collapsed {
  margin-left: 80px;
}

.content {
  padding: 5% 5% 0 5%;
  position: relative;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 30px;
}

.FC-Title {
  margin: 0;
}

.saved-text {
  margin-right: 650px;
}

.input-forms-container {
  padding-left: 12%;
  padding-right: 10%;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding-right: 6%;
  gap: 10px;
}

.create-Panels {
  margin-top: 20px;
  padding-left: 12%;
  padding-bottom: 50px;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .saved-text {
    margin-left: 0;
    margin-top: 10px;
  }

  .input-forms-container {
    padding-left: 0;
    padding-right: 0;
  }
}

/* Add this to your styles */
.error-message {
  color: #ff5252;
  background: rgba(255, 82, 82, 0.1);
  border-radius: 8px;
  padding: 10px;
  margin: 10px 6% 0 12%;
  text-align: center;
}
</style>