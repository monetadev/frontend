<template>
  <main class="create-set-content component-root">
    <h2 v-if="progressStep === 1" class="page-title">Create Flashcard Set</h2>
    <p v-if="progressStep === 1" class="page-subtitle">
      Generate flashcards based on your uploaded documents, or create your own from scratch!
    </p>

    <div v-if="progressStep === 1" class="step-1-layout">
      <CreationStep
          :fileDetails="fileDetails"
          v-model:prompt="generationPrompt"
          v-model:count="flashcardCount"
          v-model:generationType="generationType"
          :isGenerating="isGenerating"
          :generationError="generationError"
          @file-selected="handleFileSelected"
          @continue="handleContinue"
      />
    </div>

    <div v-if="progressStep === 2" class="step-2-layout">
      <section class="settings-section set-details-section">
        <SetDetailsEditor
            :title="generatedSetTitle"
            @update:title="generatedSetTitle = $event"
            :description="generatedSetDescription"
            @update:description="generatedSetDescription = $event"
            :cardCount="validFlashcardCount"
            :creationDate="generationDate"
        />
        <VisibilityControl v-model="isPublic" class="visibility-control-overlay"/>
      </section>

      <section class="settings-section flashcard-list-section">
        <h3 class="section-title-h3">
          {{ validFlashcardCount }} Flashcard{{ validFlashcardCount !== 1 ? 's' : '' }}
        </h3>
        <FlashcardList v-model="flashcards"/>
      </section>

      <div class="step-2-actions">
        <PrimaryButton
            text="Back"
            @click="handleBackClick"
            buttonStyle="secondary"
            class="action-button"
            type="button"
        />
        <div class="right-actions">
          <p v-if="setError" class="set-error error-message">{{ setError }}</p>
          <PrimaryButton
              :text="isSubmitting ? 'Creating...' : 'Create Flashcard Set'"
              @click="createFlashcardSet"
              :disabled="isSubmitting || !hasValidFlashcards"
              type="button"
              class="action-button primary"
          />
        </div>
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="showLeaveConfirmationModal" class="modal-overlay" @click.self="showLeaveConfirmationModal = false">
        <div class="modal-content">
          <h3>Discard Changes?</h3>
          <p>Going back will discard the current set details and flashcards. Are you sure?</p>
          <div class="modal-actions">
            <PrimaryButton text="Cancel" @click="showLeaveConfirmationModal = false" buttonStyle="secondary" type="button" class="action-button"/>
            <PrimaryButton text="Discard & Go Back" @click="confirmGoBack" buttonStyle="danger" type="button" class="action-button danger"/>
          </div>
        </div>
      </div>
    </Transition>

  </main>
</template>

<script setup>
import {ref, computed} from 'vue';
import apolloClient from '@/plugins/apollo.js';
import {useToast} from "@/composables/useToast.js";
import {useRouter} from 'vue-router';
import {GENERATE_FLASHCARDS, CREATE_FLASHCARD_SET} from "@/graphql/auth.js";
import CreationStep from '@/components/flashcard/edit-set/CreationStep.vue';
import SetDetailsEditor from '@/components/flashcard/edit-set/SetDetailsEditor.vue';
import VisibilityControl from '@/components/flashcard/edit-set/VisibilityControl.vue';
import FlashcardList from '@/components/flashcard/edit-set/FlashcardList.vue';
import PrimaryButton from "@/components/ui/PrimaryButton.vue";

const GenerationType = {
  BRIEF: 'BRIEF',
  VERBOSE: 'VERBOSE'
};

const router = useRouter();
const progressStep = ref(1);
const flashcards = ref([]);
const isPublic = ref(true);
const generationDate = ref(new Date());
const {addToast} = useToast();

const selectedFile = ref(null);
const fileDetails = ref(null);
const generationPrompt = ref('');
const flashcardCount = ref(10);
const generationType = ref(GenerationType.VERBOSE);
const isGenerating = ref(false);
const generationError = ref(null);

const generatedSetTitle = ref('');
const generatedSetDescription = ref('');
const isSubmitting = ref(false);
const setError = ref('');
const showLeaveConfirmationModal = ref(false);

const isCardContentEmpty = (card) => {
  if (!card) return true;
  const termIsEmpty = !card.term?.trim() || card.term === 'Term';
  const defIsEmpty = !card.definition?.trim() || card.definition === 'Definition';
  return termIsEmpty && defIsEmpty;
};
const isPlaceholderCard = (index, cards = flashcards.value) => {
  if (!Array.isArray(cards)) return false;
  return index === cards.length - 1 && isCardContentEmpty(cards[index]);
};
const validFlashcards = computed(() => {
  if (!Array.isArray(flashcards.value)) return [];
  return flashcards.value.filter((card, index, arr) => !isPlaceholderCard(index, arr));
});
const validFlashcardCount = computed(() => validFlashcards.value.length);
const hasValidFlashcards = computed(() => validFlashcardCount.value > 0);

async function handleFileSelected(file) {
  if (!file) {
    selectedFile.value = null;
    fileDetails.value = null;
    return;
  }
  selectedFile.value = file;
  fileDetails.value = { originalFilename: file.name, size: file.size, contentType: file.type };
};

async function generateFlashcards() {
  if (!generationPrompt.value.trim() && !selectedFile.value) {
    generationError.value = "Please provide a prompt or select a file to generate flashcards.";
    addToast({msg: generationError.value, type: 'error', duration: 5000});
    throw new Error(generationError.value);
  }
  if (selectedFile.value && !generationPrompt.value.trim()) {
    generationError.value = "Please describe what flashcards you want generated from the document.";
    addToast({msg: generationError.value, type: 'error', duration: 5000});
    throw new Error(generationError.value);
  }

  generationError.value = null;
  isGenerating.value = true;

  try {
    addToast({msg: "Generating flashcards...", type: 'info', duration: 5000});
    const options = {
      query: generationPrompt.value.trim(),
      kQuestions: flashcardCount.value,
      generationType: generationType.value,
      ...(selectedFile.value && { referenceFile: selectedFile.value })
    };

    const {data, errors} = await apolloClient.mutate({
      mutation: GENERATE_FLASHCARDS,
      variables: {options},
      context: { hasUpload: !!selectedFile.value }
    });

    if (errors) throw new Error(errors[0].message);

    const result = data.generateFlashcardSet;
    if (!result || !result.generatedFlashcards || result.generatedFlashcards.length === 0) {
      throw new Error("Generation returned no flashcards. Try a different prompt or document.");
    }

    generatedSetTitle.value = result.title || 'Generated Set';
    generatedSetDescription.value = result.description || `Generated based on: "${generationPrompt.value}"`;
    generationDate.value = new Date();
    flashcards.value = result.generatedFlashcards.map((card, index) => ({
      term: card.term || 'Term', definition: card.definition || 'Definition', position: index
    }));

    addToast({msg: `Generated ${flashcards.value.length} flashcards successfully!`, type: 'success', duration: 5000});
  } catch (error) {
    const message = error.message || "Failed to generate flashcards.";
    generationError.value = message;
    addToast({msg: message, type: 'error', duration: 5000});
    throw error;
  } finally {
    isGenerating.value = false;
  }
};

async function handleContinue() {
  generationError.value = null;
  setError.value = null;

  if (generationPrompt.value.trim().length > 0 || selectedFile.value) {
    try {
      await generateFlashcards();
      progressStep.value = 2;
    } catch (error) {

    }
  } else {
    addToast({msg: "Skipping generation. Add cards manually.", type: 'info', duration: 5000});
    progressStep.value = 2;
    if (!generatedSetTitle.value) generatedSetTitle.value = 'My Flashcard Set Title';
    if (!generatedSetDescription.value) generatedSetDescription.value = 'My Flashcard Set Description';
    generationDate.value = new Date();
    if (!Array.isArray(flashcards.value) || flashcards.value.length === 0) { flashcards.value = []; }
  }
};

function handleBackClick() {
  const hasEnteredDataStep2 = validFlashcardCount.value > 0 ||
      (generatedSetTitle.value.trim().length > 0 && generatedSetTitle.value !== 'My Flashcard Set Title') ||
      (generatedSetDescription.value.trim().length > 0 && generatedSetDescription.value !== 'My Flashcard Set Description');

  if (hasEnteredDataStep2) {
    showLeaveConfirmationModal.value = true;
  } else {
    progressStep.value = 1;
  }
};

function confirmGoBack() {
  generatedSetTitle.value = '';
  generatedSetDescription.value = '';
  flashcards.value = [];
  generationDate.value = new Date();

  progressStep.value = 1;
  showLeaveConfirmationModal.value = false;
};

async function createFlashcardSet() {
  if (!hasValidFlashcards.value) {
    setError.value = "Please add at least one valid flashcard before creating the set.";
    addToast({msg: setError.value, type: 'error', duration: 5000});
    return;
  }

  isSubmitting.value = true;
  setError.value = '';

  try {
    const cardsToSave = validFlashcards.value;
    const flashcardsInput = cardsToSave.map((card, index) => ({
      term: card.term.trim(),
      definition: card.definition.trim(),
      position: index
    }));

    const finalTitle = (!generatedSetTitle.value.trim() || generatedSetTitle.value === 'My Flashcard Set Title')
        ? 'Untitled Set' : generatedSetTitle.value.trim();
    const finalDescription = generatedSetDescription.value.trim();

    const input = {
      title: finalTitle,
      description: finalDescription,
      isPublic: isPublic.value,
      flashcards: flashcardsInput
    };

    const {data, errors} = await apolloClient.mutate({
      mutation: CREATE_FLASHCARD_SET,
      variables: {input}
    });

    if (errors) throw new Error(errors[0].message);

    const createdSet = data.createFlashcardSet;
    if (!createdSet || !createdSet.id) {
      throw new Error("Failed to create set. Response missing ID.");
    }

    addToast({msg: `Flashcard set created successfully!`, type: 'success', duration: 5000});
    setTimeout(() => {
      router.push({name: 'readSet', params: {id: createdSet.id}});
    }, 1000);

  } catch (error) {
    const message = error.message || "An unexpected error occurred while saving the set.";
    setError.value = message;
    addToast({msg: message, type: 'error', duration: 5000});
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.component-root { display: flex; flex-direction: column; height: 100%; overflow: hidden; gap: 20px; }
.create-set-content { width: 100%; max-width: 1400px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; flex-grow: 1; overflow: hidden; }
.page-title { font-size: 1.8em; font-weight: 600; margin-bottom: -5px; padding-bottom: 0; border-bottom: none; color: var(--text-primary); flex-shrink: 0; }
.page-subtitle { font-size: 1em; color: var(--text-secondary); margin: 0 0 10px 0; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }

.step-1-layout, .step-2-layout { flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; gap: 20px; }

.settings-section {
  background: var(--bg-secondary); padding: 20px 25px; border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border: 1px solid var(--border-color);
  display: flex; flex-direction: column; gap: 15px; overflow: hidden;
}

.set-details-section {
  overflow: visible;
  position: relative;
  padding-bottom: 45px;
}
.flashcard-list-section { flex-grow: 1; overflow-y: auto; }
.section-title-h3 {
  font-size: 1.3em; font-weight: 600; color: var(--text-primary); margin: 0 0 5px 0;
  padding-bottom: 10px; border-bottom: 1px solid var(--border-color-light); flex-shrink: 0;
}

.visibility-control-overlay {
  position: absolute;
  bottom: 15px;
  left: 25px;
  z-index: 10;
}

.step-2-actions { display: flex; justify-content: space-between; align-items: center; padding: 15px 0 0 0; margin-top: 10px; gap: 15px; flex-shrink: 0; border-top: 1px solid var(--border-color); }
.right-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.error-message, .set-error { background: rgba(var(--error-color-rgb), 0.1); color: var(--error-color); border: 1px solid rgba(var(--error-color-rgb), 0.3); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; text-align: right; width: 100%; }

.action-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 18px; border: 1px solid transparent; border-radius: 6px; text-decoration: none; font-weight: 500; transition: all 0.2s ease; cursor: pointer; font-size: 0.95em; line-height: 1.4; white-space: nowrap; }
.action-button:disabled { opacity: 0.5; cursor: not-allowed; }
.action-button:not(.primary):not(.danger) { background-color: var(--button-secondary-bg); color: var(--text-primary); border-color: var(--border-color); }
.action-button:not(.primary):not(.danger):hover:not(:disabled) { background-color: var(--button-secondary-hover-bg); }
.action-button.primary { background-color: var(--primary-color); color: #fff; border-color: var(--primary-color); }
.action-button.primary:hover:not(:disabled) { background-color: var(--primary-hover-color); border-color: var(--primary-hover-color); }
.action-button.danger { background-color: var(--button-danger-bg); border-color: var(--button-danger-bg); color: #fff; }
.action-button.danger:hover:not(:disabled) { background-color: var(--button-danger-hover-bg); border-color: var(--button-danger-hover-bg); }
:deep(.primary-button) { padding: 0; border: none; background: none; display: contents; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1050; backdrop-filter: blur(3px); }
.modal-content { background: var(--bg-secondary, #22293A); padding: 30px 40px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); width: 90%; max-width: 450px; text-align: center; border: 1px solid var(--border-color, #3d4663); }
.modal-content h3 { margin-top: 0; margin-bottom: 15px; font-size: 1.4rem; font-weight: 600; color: var(--text-primary, #ffffff); }
.modal-content p { margin-bottom: 30px; color: var(--text-secondary, #a4aabf); font-size: 1rem; line-height: 1.6; }
.modal-actions { display: flex; justify-content: space-around; gap: 15px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-content, .modal-fade-leave-active .modal-content { transition: transform 0.3s ease; }
.modal-fade-enter-from .modal-content, .modal-fade-leave-to .modal-content { transform: scale(0.95); }

@media (max-width: 768px) {
  .step-2-actions { flex-direction: column-reverse; align-items: stretch; gap: 10px; }
  .right-actions { width: 100%; align-items: stretch; }
  .error-message, .set-error { text-align: center; }
  .action-button { width: 100%; }
  .step-2-layout { overflow-y: auto; }
}
</style>