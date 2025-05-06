<template>
  <div class="prompt-generator-container">
    <div class="label-control-wrapper">
      <label for="prompt-textarea" class="prompt-label">
        What should the flashcards be about?
        <span v-if="!hasDocument">(Required for generation)</span>
        <span v-else>(Required if generating from document)</span>
      </label>
      <ResponseControl
          :modelValue="generationType"
          @update:modelValue="updateGenerationType"
          class="response-type-control"
      />
    </div>
    <div class="input-wrapper">
      <textarea
          id="prompt-textarea"
          :value="prompt"
          @input="updatePrompt($event.target.value)"
          class="prompt-input"
          :disabled="isGenerating || isUploading"
          :placeholder="inputPlaceholder"
          rows="6"
      ></textarea>
      <div v-if="isGenerating" class="loading-overlay">
        <FontAwesomeIcon :icon="faSpinner" spin size="lg" />
        <span>Generating...</span>
      </div>
    </div>
    <p class="input-hint">
      Be specific! E.g., "Key terms from Chapter 3 on photosynthesis", "Important figures in the American Revolution", "Top 15 Spanish verbs". If using a document, describe what to extract, e.g., "Define the key terms mentioned".
    </p>
  </div>
</template>

<script>
const GenerationType = {
  BRIEF: 'BRIEF',
  VERBOSE: 'VERBOSE'
};
</script>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'; // Removed ref
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ResponseControl from './ResponseControl.vue';

const props = defineProps({
  prompt: {
    type: String,
    default: ''
  },
  generationType: {
    type: String,
    default: GenerationType.VERBOSE,
    validator: (value) => Object.values(GenerationType).includes(value)
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  hasDocument: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:prompt', 'update:generationType']);

// Removed the local test ref

const inputPlaceholder = computed(() => {
  if (props.hasDocument) {
    return "Describe what to generate from the document...\nExample: Define the key technical terms mentioned, Summarize the main sections, List important dates and events described...";
  } else {
    return "Describe the topic for flashcard generation...\nExample: Key concepts of quantum physics, Important dates in World War II, Spanish vocabulary for beginners...";
  }
});

function updatePrompt(value) {
  emit('update:prompt', value);
}

// Restore the function to emit the event upwards
function updateGenerationType(value) {
  console.log('[PromptGenerator] Received update:modelValue from ResponseControl with:', value); // Keep log for confirmation
  console.log('[PromptGenerator] Emitting update:generationType with:', value); // Keep log for confirmation
  emit('update:generationType', value);
}

</script>

<style scoped>
.prompt-generator-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
}

.label-control-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.prompt-label {
  color: var(--text-secondary);
  font-size: 0.9em;
  font-weight: 500;
}
.prompt-label span {
  font-style: italic;
  opacity: 0.8;
  margin-left: 5px;
}

.response-type-control {
  margin-left: 10px;
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
  display: flex;
}

.prompt-input {
  width: 100%;
  height: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: "Outfit", sans-serif;
  font-size: 1rem;
  padding: 12px 15px;
  resize: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.prompt-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.prompt-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-secondary);
}

.prompt-input::placeholder {
  color: var(--text-placeholder);
  font-size: 0.95em;
}

.input-hint {
  font-size: 0.8em;
  color: var(--text-secondary);
  margin: 5px 0 0 0;
  line-height: 1.4;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(var(--bg-secondary-rgb), 0.8);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 0.9em;
  gap: 10px;
  z-index: 2;
}
</style>