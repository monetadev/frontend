<template>
  <div class="response-control">
    <div class="toggle-group" role="radiogroup" aria-label="Generation Verbosity">
      <button
          @click="selectType(GenerationType.VERBOSE)"
          :class="['toggle-btn', { 'active': modelValue === GenerationType.VERBOSE }]"
          role="radio"
          :aria-checked="(modelValue === GenerationType.VERBOSE).toString()"
          :aria-label="`Set generation type to Lengthy (${verboseTooltip})`"
          :title="`Set generation type to Lengthy (${verboseTooltip})`"
          :tabindex="0"
      >
        <FontAwesomeIcon :icon="faAlignLeft" class="btn-icon" />
        <span class="btn-text">Lengthy</span>
      </button>
      <button
          @click="selectType(GenerationType.BRIEF)"
          :class="['toggle-btn', { 'active': modelValue === GenerationType.BRIEF }]"
          role="radio"
          :aria-checked="(modelValue === GenerationType.BRIEF).toString()"
          :aria-label="`Set generation type to Concise (${briefTooltip})`"
          :title="`Set generation type to Concise (${briefTooltip})`"
          :tabindex="0"
      >
        <FontAwesomeIcon :icon="faEllipsisH" class="btn-icon" />
        <span class="btn-text">Concise</span>
      </button>
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
import { defineProps, defineEmits } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAlignLeft, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (value) => Object.values(GenerationType).includes(value)
  }
});
const emit = defineEmits(['update:modelValue']);

const verboseTooltip = "Generate detailed definitions";
const briefTooltip = "Generate concise definitions";

function selectType(type) {
  if (Object.values(GenerationType).includes(type)) {
    emit('update:modelValue', type);
  }
}
</script>

<style scoped>
.response-control {
  display: inline-block;
}

.toggle-group {
  display: inline-flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toggle-btn {
  background: var(--button-secondary-bg);
  color: var(--text-secondary);
  border: none;
  padding: 6px 12px; /* Adjusted padding */
  font-size: 0.9em; /* Adjusted base font size */
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  line-height: 1;
  display: inline-flex; /* Use flex for icon + text */
  align-items: center;
  justify-content: center;
  gap: 6px; /* Space between icon and text */
  white-space: nowrap; /* Prevent text wrapping */
}

.toggle-btn + .toggle-btn {
  border-left: 1px solid var(--border-color);
}

.toggle-btn .btn-icon {
  font-size: 1.1em; /* Slightly larger icon relative to text */
  /* Fix alignment if needed */
  vertical-align: middle;
}

.toggle-btn .btn-text {
  /* Styles for text if needed */
  font-weight: 500;
}


.toggle-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.toggle-btn:not(.active):hover {
  background-color: var(--button-secondary-hover-bg);
  color: var(--text-primary);
}

.toggle-btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
  z-index: 1;
}

</style>