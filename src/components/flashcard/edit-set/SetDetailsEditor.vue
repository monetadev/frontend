<template>
  <div class="set-details-editor">
    <div class="details-header">
      <div class="editable-field title-field">
        <h2 v-if="!editingTitle" class="set-title" @click="startEditingTitle">
          {{ displayTitle }}
          <span class="edit-icon-inline"><i class="fas fa-pencil-alt"></i></span>
        </h2>
        <div v-else class="editing-container full-width">
          <input
              type="text"
              v-model="editTitleValue"
              class="edit-input title-input"
              ref="titleInput"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelTitleEdit"
              @blur="saveTitle"
              placeholder="Enter Set Title"
          />
        </div>
      </div>

      <div class="set-stats">
        <span class="stat-item"><i class="fas fa-layer-group stat-icon"></i>{{ cardCount }} Card{{ cardCount !== 1 ? 's' : '' }}</span>
        <span class="stat-item"><i class="fas fa-calendar-alt stat-icon"></i>{{ formattedDate }}</span>
      </div>
    </div>

    <div class="editable-field description-field">
      <p v-if="!editingDescription" class="set-description" @click="startEditingDescription">
        {{ displayDescription }}
        <span class="edit-icon-inline"><i class="fas fa-pencil-alt"></i></span>
      </p>
      <div v-else class="editing-container full-width">
        <textarea
            v-model="editDescriptionValue"
            class="edit-textarea description-input"
            ref="descriptionInput"
            @keyup.esc="cancelDescriptionEdit"
            @blur="saveDescription"
            placeholder="Add a description..."
            @input="autoResizeTextarea"
        ></textarea>
      </div>
    </div>

  </div>
</template>

<script setup>
// Script remains the same as previous version
import { ref, computed, nextTick, watch } from 'vue';

const props = defineProps({
  title: { type: String, default: '' }, description: { type: String, default: '' },
  cardCount: { type: Number, required: true }, creationDate: { type: Date, required: true }
});
const emit = defineEmits(['update:title', 'update:description']);

const editingTitle = ref(false); const editingDescription = ref(false);
const editTitleValue = ref(props.title); const editDescriptionValue = ref(props.description);
const titleInput = ref(null); const descriptionInput = ref(null);

const displayTitle = computed(() => props.title || 'Click to add title');
const displayDescription = computed(() => props.description || 'Click to add description');
const formattedDate = computed(() => {
  if (!(props.creationDate instanceof Date) || isNaN(props.creationDate)) { return 'Unknown Date'; }
  return props.creationDate.toLocaleDateString(navigator.language || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

const startEditingTitle = () => {
  editTitleValue.value = props.title; editingTitle.value = true;
  nextTick(() => { titleInput.value?.focus(); titleInput.value?.select(); });
};
const saveTitle = () => {
  if (!editingTitle.value) return;
  const newTitle = editTitleValue.value.trim();
  if (newTitle !== props.title) { emit('update:title', newTitle); }
  editingTitle.value = false;
};
const cancelTitleEdit = () => {
  if (!editingTitle.value) return; editTitleValue.value = props.title; editingTitle.value = false;
};
const startEditingDescription = () => {
  editDescriptionValue.value = props.description; editingDescription.value = true;
  nextTick(() => { descriptionInput.value?.focus(); autoResizeTextarea({ target: descriptionInput.value }); });
};
const saveDescription = () => {
  if (!editingDescription.value) return; const newDescription = editDescriptionValue.value.trim();
  if (newDescription !== props.description) { emit('update:description', newDescription); }
  editingDescription.value = false;
};
const cancelDescriptionEdit = () => {
  if (!editingDescription.value) return; editDescriptionValue.value = props.description; editingDescription.value = false;
};
const autoResizeTextarea = (event) => {
  const textarea = event?.target;
  if (textarea) {
    textarea.style.height = 'auto'; const currentScrollHeight = textarea.scrollHeight;
    textarea.style.height = `${currentScrollHeight + 2}px`;
  }
};
watch(() => props.title, (newVal) => { if (!editingTitle.value) { editTitleValue.value = newVal; } });
watch(() => props.description, (newVal) => {
  if (!editingDescription.value) {
    editDescriptionValue.value = newVal;
    nextTick(() => { if (descriptionInput.value && document.activeElement !== descriptionInput.value) { autoResizeTextarea({ target: descriptionInput.value }); } });
  }
});
</script>

<style scoped>
/* Editor Container */
.set-details-editor { width: 100%; display: flex; flex-direction: column; }

/* Header Row: Title + Stats */
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to the top */
  gap: 20px;
  border-bottom: 1px solid var(--border-color-light); /* Add separator below header */
  padding-bottom: 10px;
  margin-bottom: 5px;
}

.title-field { flex-grow: 1; /* Allow title to take available space */ }

.set-stats {
  display: flex;
  flex-direction: column; /* Stack stats vertically */
  align-items: flex-end; /* Align text to the right */
  gap: 3px; /* Reduced gap */
  font-size: 0.8em; /* Smaller font */
  color: var(--text-secondary);
  text-align: right;
  white-space: nowrap; /* Prevent wrapping */
  flex-shrink: 0; /* Don't shrink stats */
  padding-top: 4px; /* Align baseline roughly with title */
}
.stat-item { display: inline-flex; align-items: center; gap: 5px; }
.stat-icon { color: var(--primary-color); font-size: 0.9em; }
/* Removed stat divider */

/* Editable Field General */
.editable-field { position: relative; }

.set-title, .set-description {
  color: var(--text-primary); margin: 0; padding: 4px 0; /* Adjust padding */
  cursor: pointer; position: relative; word-break: break-word;
  border-radius: 4px; /* Rounding for hover */
  transition: background-color 0.2s ease;
}
.editable-field:hover .set-title:not(input):not(textarea),
.editable-field:hover .set-description:not(input):not(textarea) {
  background-color: var(--bg-hover-light);
}


.set-title { font-size: 1.5em; font-weight: 600; line-height: 1.3; }
.set-description { color: var(--text-secondary); font-size: 0.95em; line-height: 1.6; white-space: pre-wrap; min-height: calc(1.6em + 8px); /* Min height based on line height + padding */ }
.set-title:empty::before { content: 'Click to add title'; color: var(--text-placeholder); font-style: italic; opacity: 0.7; }
.set-description:empty::before { content: 'Click to add description'; color: var(--text-placeholder); font-style: italic; opacity: 0.7; }

/* Edit Icon Inline */
.edit-icon-inline {
  display: inline-block; /* Allows it to sit next to text */
  margin-left: 8px;
  font-size: 0.7em; /* Smaller icon */
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  vertical-align: middle; /* Align with text */
}
.editable-field:hover .edit-icon-inline { opacity: 0.7; }
.editable-field .edit-icon-inline:hover { opacity: 1; color: var(--primary-color); }

/* Editing Container */
.editing-container { width: 100%; position: relative; }
.editing-container.full-width { /* Ensure it takes full width */ width: 100%; }

.edit-input, .edit-textarea {
  width: 100%; background: var(--input-bg); border: 1px solid var(--border-color);
  border-radius: 6px; padding: 8px 12px; color: var(--text-primary);
  font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.edit-input:focus, .edit-textarea:focus {
  border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}
.title-input { font-size: 1.5em; font-weight: 600; line-height: 1.3; padding: 4px 12px; } /* Match h2 padding */
.description-input {
  font-size: 0.95em; line-height: 1.6; min-height: 60px;
  max-height: 150px; /* Limit height, enable scroll */
  overflow-y: auto; /* Enable vertical scroll */
  resize: none; padding: 4px 12px; /* Match p padding */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) var(--input-bg);
}
.description-input::-webkit-scrollbar { width: 6px; }
.description-input::-webkit-scrollbar-track { background: var(--input-bg); border-radius: 3px;}
.description-input::-webkit-scrollbar-thumb { background-color: var(--primary-color); border-radius: 3px; }
</style>