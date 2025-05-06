<template>
  <main class="edit-flashcard-content">
    <div v-if="loading" class="loading-container">
      <p>Loading flashcard set...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error loading flashcard set: {{ error.message }}</p>
      <button @click="goBack" class="cancel-btn">Go Back</button>
    </div>

    <div v-else class="edit-flashcard-set">
      <ContentHeader
          title="Edit Flashcard Set"
          subtitle="Update your flashcard set or add more cards"
          :iconSrc="bookIcon"
          iconAlt="Book Icon"
      />

      <SetDetailsEditor
          :title="formData.title"
          @update:title="formData.title = $event"
          :description="formData.description"
          @update:description="formData.description = $event"
          :cardCount="validFlashcardCount"
          :creationDate="creationDate"
      />

      <VisibilityControl v-model="formData.isPublic"/>

      <FlashcardList v-model="formData.flashcards"/>

      <div class="actions">
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
        <PrimaryButton
            text="Cancel"
            @click="goBack"
            buttonStyle="secondary"
            type="button"
        />
        <PrimaryButton
            :text="saving ? 'Saving...' : 'Save Changes'"
            @click="saveChanges"
            :disabled="saving || !isValid || !hasChanges"
            type="button"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {GET_FLASHCARD_SET_BY_ID, UPDATE_FLASHCARD_SET} from '@/graphql/auth.js';
import {useToast} from "@/composables/useToast.js";
import apolloClient from '@/plugins/apollo.js';

import ContentHeader from '@/components/flashcard/edit-set/ContentHeader.vue'; // Ensure path is correct
import SetDetailsEditor from '@/components/flashcard/edit-set/SetDetailsEditor.vue'; // Ensure path is correct
import VisibilityControl from '@/components/flashcard/edit-set/VisibilityControl.vue'; // Ensure path is correct
import FlashcardList from '@/components/flashcard/edit-set/FlashcardList.vue'; // Ensure path is correct
import PrimaryButton from '@/components/ui/PrimaryButton.vue'; // Ensure path is correct

import bookIcon from '@/assets/book.svg';

const route = useRoute();
const router = useRouter();
const {addToast} = useToast();
const setId = route.params.id;

// --- State ---
const formData = ref({
  title: '',
  description: '',
  isPublic: false,
  flashcards: [],
  createdAt: null
});
const originalData = ref(null);
const loading = ref(true);
const error = ref(null);
const saving = ref(false);
const saveError = ref(null);

const creationDate = computed(() => formData.value.createdAt ? new Date(formData.value.createdAt) : new Date());

// --- Helper Functions ---
const isCardContentEmpty = (card) => {
  if (!card) return true;
  const termIsEmpty = !card.term?.trim() || card.term === 'Term';
  const defIsEmpty = !card.definition?.trim() || card.definition === 'Definition';
  return termIsEmpty && defIsEmpty;
};

const isPlaceholderCard = (card, index, arr) => {
  return index === arr.length - 1 && isCardContentEmpty(card);
};

// --- Computed Properties ---
const validFlashcards = computed(() => {
  if (!Array.isArray(formData.value.flashcards)) return [];
  return formData.value.flashcards.filter((card, index, arr) => !isPlaceholderCard(card, index, arr));
});

const validFlashcardCount = computed(() => validFlashcards.value.length);

const isValid = computed(() => {
  if (!formData.value.title?.trim()) return false;
  if (validFlashcardCount.value === 0) return false;

  return validFlashcards.value.every(card => card.term?.trim() && card.term !== 'Term' && card.definition?.trim() && card.definition !== 'Definition');
});

const hasChanges = computed(() => {
  if (loading.value || error.value || !originalData.value) return false;

  if (formData.value.title !== originalData.value.title ||
      formData.value.description !== originalData.value.description ||
      formData.value.isPublic !== originalData.value.isPublic) {
    return true;
  }

  const currentValidCards = validFlashcards.value;
  const originalValidCards = originalData.value.flashcards.filter((card, index, arr) => !isPlaceholderCard(card, index, arr));

  if (currentValidCards.length !== originalValidCards.length) {
    return true;
  }

  for (let i = 0; i < currentValidCards.length; i++) {
    const current = currentValidCards[i];
    const original = originalValidCards[i];

    const originalMatch = originalValidCards.find(oc => oc.id && oc.id === current.id) || originalValidCards[i];
    if (!originalMatch) return true;

    if (current.term !== originalMatch.term ||
        current.definition !== originalMatch.definition ||
        current.position !== originalMatch.position) {
      return true;
    }
  }

  if (originalValidCards.length > currentValidCards.length) {
    const currentIds = new Set(currentValidCards.map(c => c.id).filter(id => id));
    if (originalValidCards.some(oc => oc.id && !currentIds.has(oc.id))) {
      return true;
    }
  }

  return false;
});

// --- Methods ---
async function loadFlashcardSet() {
  loading.value = true;
  error.value = null;
  originalData.value = null;

  try {
    const {data, errors} = await apolloClient.query({
      query: GET_FLASHCARD_SET_BY_ID,
      variables: {id: setId},
      fetchPolicy: 'network-only'
    });

    if (errors) throw new Error(errors[0].message);

    if (data?.findFlashcardSetById) {
      const fetchedData = data.findFlashcardSetById;
      const sortedCards = Array.isArray(fetchedData.flashcards)
          ? [...fetchedData.flashcards].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          : [];

      formData.value = {
        title: fetchedData.title || '',
        description: fetchedData.description || '',
        isPublic: !!fetchedData.isPublic,
        flashcards: sortedCards.map(card => ({
          id: card.id,
          term: card.term || '',
          definition: card.definition || '',
          position: card.position || 0
        })),
        createdAt: fetchedData.createdAt
      };

      originalData.value = JSON.parse(JSON.stringify({
        ...formData.value,
        flashcards: formData.value.flashcards.slice()
      }));

    } else {
      throw new Error("Flashcard library not found or access denied.");
    }
  } catch (err) {
    console.error("Error loading flashcard library:", err);
    error.value = err;
    addToast({msg: err.message || "Failed to load flashcard library.", type: "error", duration: 5000});
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (hasChanges.value) {
    if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
      router.back();
    }
  } else {
    router.back();
  }
}

async function saveChanges() {
  if (!isValid.value) {
    addToast({
      msg: "Please ensure the title is library and all flashcards (except the last empty one) have both a term and definition.",
      type: "warning",
      duration: 5000
    });
    return;
  }
  if (!hasChanges.value) {
    addToast({msg: "No changes detected to save.", type: "info", duration: 5000});
    return;
  }

  saving.value = true;
  saveError.value = null;

  try {
    const cardsToSave = validFlashcards.value;
    const flashcardsInput = cardsToSave.map((card, index) => ({
      term: card.term,
      definition: card.definition,
      position: index
    }));

    const flashcardSetInput = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      isPublic: formData.value.isPublic,
      flashcards: flashcardsInput
    };

    const {data, errors} = await apolloClient.mutate({
      mutation: UPDATE_FLASHCARD_SET,
      variables: {
        id: setId,
        flashcardSetInput
      },
    });

    if (errors) throw new Error(errors[0].message); // Handle GraphQL errors

    if (data?.updateFlashcardSet) {
      addToast({msg: "Flashcard library updated successfully!", type: "success", duration: 5000});

      originalData.value = JSON.parse(JSON.stringify({
        ...formData.value,
        flashcards: cardsToSave
      }));

      await router.push({name: 'readSet', params: {id: setId}})
    } else {
      throw new Error("Update mutation returned no data.");
    }
  } catch (err) {
    console.error("Error updating flashcard library:", err);
    saveError.value = err.message || "An unexpected error occurred during saving.";
    addToast({msg: saveError.value, type: "error", duration: 5000});
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadFlashcardSet();
});

</script>

<style scoped>
.edit-flashcard-content {
  background: var(--bg-secondary, #22293A);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1100px;
  margin: 20px auto;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary, #ffffff);
}

.edit-flashcard-content * {
  box-sizing: border-box;
}


.edit-flashcard-set {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 35px;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-primary, white);
  padding: 40px;
  text-align: center;
}

.error-container p {
  color: var(--error-color, #e74c3c);
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  padding: 0 30px;
  position: relative;
}

.save-error {
  color: var(--error-color, #ff5e5e);
  background: rgba(var(--error-color-rgb, 255, 94, 94), 0.1);
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid rgba(var(--error-color-rgb, 255, 94, 94), 0.3);
  width: 100%;
  order: -1;
  margin-bottom: 15px;
}

.error-container .cancel-btn {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.error-container .cancel-btn:hover {
  background-color: #2c3e50;
}

.edit-flashcard-set {
  width: 100%;
}
</style>
