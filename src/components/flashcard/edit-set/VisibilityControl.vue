<template>
  <div class="visibility-control-minimal">
    <div class="toggle-group" role="radiogroup" aria-label="Set Visibility">
      <button
          @click="selectVisibility(true)"
          :class="['toggle-btn icon-only', { 'active': modelValue }]"
          role="radio"
          :aria-checked="modelValue.toString()"
          :aria-label="`Set visibility to Public (${publicTooltip})`"
          :title="`Set visibility to Public (${publicTooltip})`"
          :tabindex="0"
      >
        <i class="fas fa-globe-americas"></i>
      </button>
      <button
          @click="selectVisibility(false)"
          :class="['toggle-btn icon-only', { 'active': !modelValue }]"
          role="radio"
          :aria-checked="(!modelValue).toString()"
          :aria-label="`Set visibility to Private (${privateTooltip})`"
          :title="`Set visibility to Private (${privateTooltip})`"
          :tabindex="0"
      >
        <i class="fas fa-lock"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

defineProps({
  modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue']);

const publicTooltip = "Anyone can find and view";
const privateTooltip = "Only you can view and edit";

function selectVisibility(isPublic) {
  emit('update:modelValue', isPublic);
}
</script>

<style scoped>
/* Minimal container, positioning done by parent */
.visibility-control-minimal {
  display: inline-block; /* Allows parent to position it */
}

.toggle-group {
  display: inline-flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  /* Add a subtle shadow for better visibility on varied backgrounds */
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-btn.icon-only {
  background: var(--button-secondary-bg); /* Use secondary button background */
  color: var(--text-secondary);
  border: none;
  padding: 6px 8px; /* Reduced padding for icons */
  font-size: 1em; /* Adjust icon size */
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  line-height: 1; /* Ensure icon is centered */
}

.toggle-btn.icon-only + .toggle-btn.icon-only {
  border-left: 1px solid var(--border-color);
}

.toggle-btn.icon-only.active {
  background: var(--primary-color);
  color: white;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.toggle-btn.icon-only:not(.active):hover {
  background-color: var(--button-secondary-hover-bg);
  color: var(--text-primary);
}

.toggle-btn.icon-only:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
  z-index: 1;
}

</style>