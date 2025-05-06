// src/components/admin/ConfirmDeleteModal.vue (adjust path as needed)
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">
        <font-awesome-icon :icon="getIcon('triangle-exclamation')" class="warning-icon"/> Confirm Deletion
      </h3>
      <p>Are you sure you want to permanently delete the user <strong>{{ user?.username }}</strong> ({{ user?.firstName }} {{ user?.lastName }})?</p>
      <p class="warning-text">This action cannot be undone.</p>
      <div class="modal-buttons">
        <button @click="$emit('close')" class="action-button secondary-button" :disabled="isDeleting">Cancel</button>
        <button @click="$emit('confirm')" class="action-button danger-button confirm-delete-button" :disabled="isDeleting">
          <font-awesome-icon :icon="getIcon(isDeleting ? 'spinner' : 'trash')" :spin="isDeleting" />
          {{ isDeleting ? 'Deleting...' : 'Delete User' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner, faTrash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTrash, faTriangleExclamation);
const icons = { 'spinner': faSpinner, 'trash': faTrash, 'triangle-exclamation': faTriangleExclamation };
function getIcon(iconName) { return icons[iconName] || faTriangleExclamation; }

const props = defineProps({
  user: {
    type: Object,
    default: () => null
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
/* --- Base Variables (Ensure these are defined globally or passed down) --- */
/* Re-declare necessary variables if not global, or import from a central file */
:root { /* Example - Prefer global definition */
  --bg-primary-rgb: 18, 23, 41;
  --bg-secondary: #22293A;
  --modal-bg: var(--bg-secondary);
  --text-primary: #ffffff;
  --text-secondary: #adb5bd;
  --border-color: #3b3e56;
  --warning-color: #ffcc00;
  --sidebar-active: #5f98ef;
  --button-secondary-bg: var(--bg-tertiary, #2b364f);
  --button-secondary-hover-bg: #3a4562;
  --button-danger-bg: var(--error-color, #ff6b6b);
  --button-danger-hover-bg: #e53e3e;
}

/* --- Modal Styling (Copied & Scoped) --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(var(--bg-primary-rgb, 18, 23, 41), 0.8);
  backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; padding: 20px;
}
.modal-content {
  background: var(--modal-bg, var(--bg-secondary)); /* Ensure opaque background */
  padding: 25px 30px; border-radius: 12px;
  width: 100%; max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  opacity: 1; /* Explicitly opaque */
}
.modal-title {
  font-size: 1.4em; font-weight: 600;
  margin: 0 0 20px 0; padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; gap: 10px;
}
.modal-title .warning-icon { color: var(--warning-color); }
.modal-content p { margin-bottom: 15px; line-height: 1.6; color: var(--text-secondary); }
.modal-content p strong { color: var(--text-primary); font-weight: 600; }
.modal-buttons {
  display: flex; justify-content: flex-end; gap: 15px;
  margin-top: 25px; padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.warning-text { color: var(--warning-color); font-weight: 500; margin-top: -5px; font-size: 0.95em; }

/* --- Base Button Styles (Copied - Consider making global) --- */
.action-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 20px; border: 1px solid var(--border-color); border-radius: 6px;
  text-decoration: none; font-weight: 500; transition: all 0.2s ease;
  cursor: pointer; font-size: 0.95em; line-height: 1.5; white-space: nowrap;
}
.action-button:disabled { opacity: 0.5; cursor: not-allowed; }
.action-button .fa-icon { position: relative; top: -1px; }
.action-button.secondary-button { background-color: var(--button-secondary-bg); border-color: var(--button-secondary-bg); color: var(--text-primary); }
.action-button.secondary-button:hover:not(:disabled) { background-color: var(--button-secondary-hover-bg); border-color: var(--button-secondary-hover-bg); }
.action-button.danger-button { background-color: var(--button-danger-bg); border-color: var(--button-danger-bg); color: #fff; }
.action-button.danger-button:hover:not(:disabled) { background-color: var(--button-danger-hover-bg); border-color: var(--button-danger-hover-bg); }
</style>