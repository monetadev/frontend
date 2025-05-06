<template>
  <div class="creation-step-content">
    <div class="columns-container">
      <div class="column column-left">
        <section class="settings-section upload-section">
          <h3 class="section-title-h3">Upload Document (Optional)</h3>
          <UploadGenerator
              @file-selected="handleFileSelect"
              :isUploading="isUploading"
              :uploadedFile="fileDetails"
              :error="uploadError"
              :compact="true"
          />
        </section>

        <section class="settings-section count-section">
          <h3 class="section-title-h3">Number of Flashcards</h3>
          <label for="count-slider" class="slider-label">Amount: {{ localCount }}</label>
          <div class="slider-wrapper">
            <vue-slider
                id="count-slider"
                v-model="localCount"
                :min="5"
                :max="30"
                :interval="1"
                :adsorb="true"
                :tooltip="'none'"
                :marks="[5, 10, 15, 20, 25, 30]"
                :process-style="{ backgroundColor: 'var(--primary-color)' }"
                :rail-style="{ backgroundColor: 'var(--border-color)' }"
                :dot-style="dotStyle"
                :mark-style="{ backgroundColor: 'var(--border-color)' }"
                :active-mark-style="{ backgroundColor: 'var(--primary-color)' }"
                :height="6"
                @change="updateCount"
            />
          </div>
        </section>
      </div>

      <div class="column column-right">
        <section class="settings-section prompt-section">
          <h3 class="section-title-h3">Generation Prompt</h3>
          <PromptGenerator
              :prompt="prompt"
              @update:prompt="$emit('update:prompt', $event)"
              :generationType="generationType"
              @update:generationType="$emit('update:generationType', $event)"
              :isGenerating="isGenerating"
              :isUploading="isUploading"
              :hasDocument="!!fileDetails"
          />
        </section>
      </div>
    </div>

    <div class="step-actions">
      <p v-if="generationError" class="generation-error error-message">{{ generationError }}</p>
      <PrimaryButton
          :text="actionButtonText"
          @click="$emit('continue')"
          :disabled="isGenerating || isUploading"
          class="continue-button"
          type="button"
      />
    </div>
  </div>
</template>

<script>
const GenerationType = {
  BRIEF: 'BRIEF',
  VERBOSE: 'VERBOSE'
};
</script>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import PromptGenerator from "@/components/flashcard/edit-set/PromptGenerator.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import VueSlider from 'vue-3-slider-component';
import UploadGenerator from "@/components/flashcard/edit-set/UploadGenerator.vue";

const props = defineProps({
  isUploading: Boolean,
  uploadProgress: Number,
  fileDetails: Object, // Changed from uploadedDocument
  uploadError: String,
  prompt: String,
  count: { type: Number, default: 10 },
  generationType: {
    type: String,
    default: GenerationType.VERBOSE,
    validator: (value) => Object.values(GenerationType).includes(value)
  },
  isGenerating: Boolean,
  generationError: String
});

const emit = defineEmits([
  'file-selected',
  'update:prompt',
  'update:count',
  'update:generationType',
  'continue'
]);

const localCount = ref(props.count);

const dotStyle = computed(() => ({
  width: '18px',
  height: '18px',
  backgroundColor: 'var(--primary-color)',
  border: '2px solid var(--bg-primary)',
  boxShadow: '0 0 0 3px var(--bg-secondary)',
  borderRadius: '50%'
}));

const actionButtonText = computed(() => {
  if (props.isGenerating) return 'Generating...';
  if (props.prompt?.trim().length > 0 || props.fileDetails) return 'Generate & Continue'; // Changed from uploadedDocument
  return 'Continue Manually';
});

watch(() => props.count, (newVal) => {
  localCount.value = newVal;
});

function updateCount(value) {
  emit('update:count', value);
}

function handleFileSelect(file) {
  emit('file-selected', file);
}

</script>

<style scoped>
.creation-step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.columns-container {
  display: flex;
  gap: 20px;
  flex-grow: 1;
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.column-left {
  flex: 0 0 450px;
  min-width: 400px;
}

.column-right {
  flex: 1 1 auto;
  min-width: 300px;
}

.settings-section {
  background: var(--bg-secondary);
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

.column-right .prompt-section {
  flex-grow: 1;
}
.column-right .prompt-section :deep(.prompt-generator-container) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.column-right .prompt-section :deep(.prompt-input) {
  flex-grow: 1;
  min-height: 150px;
}

.section-title-h3 {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 5px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;
}

.slider-label {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin-bottom: 10px;
  display: block;
}

.slider-wrapper {
  padding: 5px 10px 15px 10px;
}

.step-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.error-message, .generation-error {
  background: rgba(var(--error-color-rgb), 0.1);
  color: var(--error-color);
  border: 1px solid rgba(var(--error-color-rgb), 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
  max-width: 600px;
  font-size: 0.9rem;
  text-align: center;
  box-sizing: border-box;
  order: -1;
}

/* Class specifically for layout/sizing of the continue button */
.continue-button {
  min-width: 200px;
  padding: 10px 25px;
  font-size: 1em;
}

@media (max-width: 992px) {
  .columns-container {
    flex-direction: column;
    overflow-y: auto;
    flex-grow: 1;
  }
  .column-left {
    flex: 1 1 auto;
    min-width: unset;
    width: 100%;
  }
  .column-right {
    flex: 1 1 auto;
    min-width: unset;
    width: 100%;
  }
}

</style>