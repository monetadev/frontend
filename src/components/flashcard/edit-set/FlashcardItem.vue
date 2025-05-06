<template>
  <div
      class="flashcard"
      :class="{
          'deleting': isDeleting,
          'dragging': isDragging,
          'drop-target': isDropTarget,
          'swapping-from': isSwappingFrom,
          'swapping-to': isSwappingTo,
        }"
      :data-index="index"
      @dragover.prevent="$emit('dragover', $event)"
      @drop.prevent="$emit('drop', $event)"
  >
    <div v-if="!isEditingPosition" class="flashcard-number" :draggable="canDrag" @dragstart="$emit('dragstart', $event)" @dragend="$emit('dragend')" @dblclick="startEditingPosition" :class="{ 'not-draggable': !canDrag }">
      {{ index + 1 }} <span v-if="canDrag" class="drag-handle"><i class="fas fa-grip-lines"></i></span>
    </div>
    <div v-else class="flashcard-number editing">
      <input type="number" v-model.number="editPositionValue" class="position-input no-spinners" ref="positionInput" min="1" :max="maxPosition" @keyup.enter="savePositionEdit" @keyup.esc="cancelPositionEdit" @blur="savePositionEdit"/>
    </div>

    <div class="flashcard-content">
      <div class="flashcard-item" :class="{'editing': isEditingTerm}">
        <div v-if="!isEditingTerm" class="editable-field" @click="startEditingCard('term')"><span>{{ displayTerm }}</span><span class="edit-icon"><i class="fas fa-edit"></i></span></div>
        <div v-else class="editing-container">
          <input type="text" v-model="editCardValue.term" class="edit-input question-input" ref="termInput" @keyup.enter="saveCardEdit('term')" @keyup.esc="cancelCardEdit('term')" placeholder="Term"/>
          <div class="edit-actions"><button class="action-btn cancel" @click="cancelCardEdit('term')"><i class="fas fa-times"></i></button><button class="action-btn save" @click="saveCardEdit('term')"><i class="fas fa-check"></i></button></div>
        </div>
      </div>
      <div class="flashcard-item" :class="{'editing': isEditingDefinition}">
        <div v-if="!isEditingDefinition" class="editable-field" @click="startEditingCard('definition')"><span>{{ displayDefinition }}</span><span class="edit-icon"><i class="fas fa-edit"></i></span></div>
        <div v-else class="editing-container">
          <textarea v-model="editCardValue.definition" class="edit-textarea answer-input" ref="definitionInput" @keyup.enter.prevent="saveCardEdit('definition')" @keyup.esc="cancelCardEdit('definition')" placeholder="Definition" @input="autoResizeTextarea"></textarea>
          <div class="edit-actions"><button class="action-btn cancel" @click="cancelCardEdit('definition')"><i class="fas fa-times"></i></button><button class="action-btn save" @click="saveCardEdit('definition')"><i class="fas fa-check"></i></button></div>
        </div>
      </div>
    </div>

    <div v-if="canDelete" class="delete-button" @mousedown="$emit('start-delete-timer')" @mouseup="$emit('cancel-delete')" @mouseleave="$emit('cancel-delete')" :style="{ background: isDeleting ? getDeleteGradient(deleteProgress) : '#121729' }">
      <i class="fas fa-times" :style="{ color: isDeleting ? '#333' : '#555' }"></i>
    </div>
  </div>
</template>

<script setup>
// --- SCRIPT REMAINS THE SAME ---
import { ref, computed, nextTick, watch } from 'vue';

const props = defineProps({
  card: { type: Object, required: true }, index: { type: Number, required: true },
  isEditingTerm: Boolean, isEditingDefinition: Boolean, isEditingPosition: Boolean,
  isDeleting: Boolean, deleteProgress: Number, canDelete: Boolean, canDrag: Boolean,
  maxPosition: { type: Number, required: true }, isDragging: Boolean, isDropTarget: Boolean,
  isSwappingFrom: Boolean, isSwappingTo: Boolean,
});
const emit = defineEmits([
  'start-edit', 'save-edit', 'cancel-edit', 'update:card', 'update:position',
  'start-delete-timer', 'cancel-delete', 'dragstart', 'dragend', 'dragover', 'drop',
  'start-removing'
]);

// Refs
const termInput = ref(null); const definitionInput = ref(null); const positionInput = ref(null);
// State
const editCardValue = ref({ term: '', definition: '' }); const editPositionValue = ref(1); const isRemoving = ref(false); // Still needed internally maybe? Let's keep it but not style it.
// Computed
const displayTerm = computed(() => props.card.term || 'Term'); const displayDefinition = computed(() => props.card.definition || 'Definition');
// Methods
const startEditingCard = (field) => {
  const currentValue = props.card[field];
  editCardValue.value[field] = (currentValue === 'Term' || currentValue === 'Definition') ? '' : currentValue;
  emit('start-edit', { index: props.index, field });
  nextTick(() => {
    if (field === 'term') termInput.value?.focus();
    if (field === 'definition') { definitionInput.value?.focus(); autoResizeTextarea({ target: definitionInput.value }); }
  });
};
const saveCardEdit = (field) => {
  const editedValue = editCardValue.value[field]?.trim();
  const newValue = editedValue || (field === 'term' ? 'Term' : 'Definition');
  emit('update:card', { index: props.index, field, value: newValue });
  emit('save-edit', { index: props.index, field });
};
const cancelCardEdit = (field) => { emit('cancel-edit', { index: props.index, field }); };
const startEditingPosition = () => {
  if (!props.canDrag) return;
  editPositionValue.value = props.index + 1;
  emit('start-edit', { index: props.index, field: 'position' });
  nextTick(() => { positionInput.value?.focus(); positionInput.value?.select(); });
};
const savePositionEdit = () => {
  if (!props.isEditingPosition) return;
  const currentPosition = props.index + 1;
  let targetPosition = Math.max(1, Math.min(editPositionValue.value, props.maxPosition));
  emit('save-edit', { index: props.index, field: 'position' });
  if (targetPosition !== currentPosition) { emit('update:position', { fromIndex: props.index, toIndex: targetPosition - 1 }); }
};
const cancelPositionEdit = () => { emit('cancel-edit', { index: props.index, field: 'position' }); };
const autoResizeTextarea = (event) => {
  const textarea = event?.target;
  if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight + 2}px`; }
};
const getDeleteGradient = (progress) => {
  const easedProgress = Math.min(100, progress || 0);
  return `radial-gradient(circle, #EF5F5F ${easedProgress}%, #121729 ${easedProgress}%)`;
};
watch(() => props.card, (newCard) => {
  if (!props.isEditingTerm) editCardValue.value.term = newCard.term;
  if (!props.isEditingDefinition) editCardValue.value.definition = newCard.definition;
}, { deep: true });
// Method now only emits event, parent handles removal after animation
const triggerRemove = () => {
  // No need to library isRemoving.value = true if we aren't styling it
  emit('start-removing', props.index);
};
defineExpose({ triggerRemove });
// --- END SCRIPT ---
</script>

<style scoped>
.flashcard {
  background: var(--bg-primary, #1a2233); border-radius: 12px; padding: 20px; padding-top: 50px; padding-bottom: 50px;
  /* width: 100%; Let grid handle width */ position: relative; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: box-shadow 0.3s ease, border-color 0.3s ease; /* Removed 'all', only transition needed props */
  border: 1px solid var(--border-color, #3d4663);
  /* Add will-change for smoother transitions during drag/move */
  will-change: transform; /* For TransitionGroup moves */
}
/* Hover effect separate from move transition */
.flashcard:hover:not(.dragging) {
  border-color: var(--primary-color, #5F98EF);
  /* Avoid transform here if it interferes with TransitionGroup */
  /* transform: translateY(-3px); */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.flashcard.deleting { animation: pulse 1.5s infinite alternate; }
/* Removed .removing class style, handled by TransitionGroup .flashcard-list-leave-* */

/* Drag and drop styles */
.flashcard.dragging {
  opacity: 0.7; /* Slightly less transparent */
  /* Scale might interfere with smooth move, consider removing or reducing */
  /* transform: scale(1.03); */
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(var(--primary-color-rgb, 95, 152, 239), 0.5); /* More prominent shadow */
  cursor: grabbing !important; /* Force grabbing cursor */
  border-color: var(--primary-color, #5F98EF); /* Highlight border */
}

.flashcard.drop-target {
  /* More subtle drop target indicator */
  outline: 2px dashed var(--primary-color, #5F98EF);
  outline-offset: 2px;
  /* background: rgba(var(--primary-color-rgb, 95, 152, 239), 0.05); */ /* Very subtle background */
  border-color: var(--primary-color, #5F98EF);
}

/* Removed Swapping animation styles */

@keyframes pulse {
  from { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); }
  to { box-shadow: 0 6px 20px rgba(var(--error-color-rgb, 255, 94, 94), 0.5); }
}


.flashcard-number {
  position: absolute; top: -1px; left: -1px; background: var(--primary-color, #5F98EF); color: white; width: 45px; height: 45px;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 600;
  border-top-left-radius: 12px; border-bottom-right-radius: 12px; z-index: 2; transition: background-color 0.2s ease;
  cursor: grab; user-select: none;
}
.flashcard-number.editing { cursor: text; background-color: var(--success-color, #27AE60); }
.flashcard-number:hover:not(.editing):not(.not-draggable) { background: #4080e0; }
/* No :active needed as .dragging class applies */
/* .flashcard-number:active:not(.editing):not(.not-draggable) { cursor: grabbing; } */
.flashcard-number.not-draggable { cursor: not-allowed; opacity: 0.7; background: var(--bg-tertiary, #121729); border: 1px solid var(--border-color, #3d4663)}
.drag-handle { position: absolute; opacity: 0; font-size: 0.8rem; top: 30px; left: 15px; transition: opacity 0.2s ease; color: rgba(255, 255, 255, 0.7); }
.flashcard-number:hover .drag-handle { opacity: 1; }
.position-input { width: 100%; height: 100%; text-align: center; background: transparent; border: none; color: white; font-size: 1.1rem; font-weight: 600; outline: none; padding: 0; border-radius: inherit; }
.no-spinners::-webkit-outer-spin-button, .no-spinners::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinners { -moz-appearance: textfield; }

.delete-button {
  position: absolute; bottom: -1px; right: -1px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease; background: var(--bg-tertiary, #121729); border-top-left-radius: 12px; border-bottom-right-radius: 12px;
  z-index: 2; border-left: 1px solid var(--border-color, #3d4663); border-top: 1px solid var(--border-color, #3d4663);
}
.delete-button i { color: var(--text-secondary, #555); transition: color 0.2s; }
.delete-button:hover i { color: var(--error-color, #ff5e5e); }

.flashcard-content { display: flex; flex-direction: column; gap: 15px; }
.flashcard-item {
  background: var(--bg-secondary, #22293A); border-radius: 8px; padding: 15px; color: var(--text-primary, white); text-align: left;
  position: relative; overflow: visible; border: 1px solid var(--border-color, #3d4663); min-height: 54px;
}
.flashcard-item.editing { z-index: 5; }
.editable-field { display: flex; align-items: flex-start; cursor: pointer; width: 100%; min-height: 24px; }
.editable-field:hover .edit-icon { opacity: 1; }
.editable-field span:first-child { flex-grow: 1; white-space: pre-wrap; word-break: break-word; }
.editable-field .edit-icon { margin-left: 10px; opacity: 0.6; transition: opacity 0.2s; color: var(--primary-color, #5F98EF); font-size: 0.8em; padding-top: 0.2em; flex-shrink: 0; }
.editing-container { width: 100%; display: flex; align-items: flex-start; position: relative; gap: 10px; }
.edit-input, .edit-textarea {
  flex-grow: 1; background: var(--input-bg, #1a2233); border: 1px solid var(--border-color, #2a335a); border-radius: 8px; padding: 8px 10px;
  color: var(--text-primary, white); font-size: inherit; line-height: 1.5; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.edit-input:focus, .edit-textarea:focus { border-color: var(--primary-color, #5F98EF); box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 95, 152, 239), 0.2); }
.edit-textarea { min-height: 40px; max-height: 150px; overflow-y: auto; resize: none; }
.edit-actions { display: flex; gap: 5px; flex-shrink: 0; padding-top: 3px; }
.action-btn {
  background: none; border: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%; transition: background-color 0.2s, color 0.2s;
}
.action-btn.cancel { color: var(--error-color, #ff5e5e); } .action-btn.save { color: var(--success-color, #27AE60); }
.action-btn:hover { background: rgba(var(--text-primary-rgb, 255, 255, 255), 0.1); }

</style>