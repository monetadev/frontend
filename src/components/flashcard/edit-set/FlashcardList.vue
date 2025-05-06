<template>
  <div class="flashcard-list-container">
    <TransitionGroup
        name="flashcard-list"
        tag="div"
        class="flashcard-container"
        ref="scrollContainerRef"
        @dragover.prevent="handleDragOverContainer"
        @drop.prevent="handleDropContainer"
        @dragleave="handleDragLeaveContainer"
    >
      <FlashcardItem
          v-for="(card, index) in mutableFlashcards"
          :key="card.internalKey" :ref="el => { if (el) flashcardItemRefs[index] = el }"
          :card="card"
          :index="index"
          :isEditingTerm="editingCardIndices.term.includes(index)"
          :isEditingDefinition="editingCardIndices.definition.includes(index)"
          :isEditingPosition="editingPositionIndex === index"
          :isDeleting="deletingIndex === index"
          :deleteProgress="deletingIndex === index ? deleteProgress : 0"
          :canDelete="!isLastEmptyCard(index, mutableFlashcards)"
          :canDrag="!isLastEmptyCard(index, mutableFlashcards)"
          :maxPosition="getLastNonEmptyIndex(mutableFlashcards) + 1"
          :isDragging="draggedIndex === index"
          :isDropTarget="dragOverIndex === index && draggedIndex !== index"
          :isSwappingFrom="swappingCardIndices.from === index"
          :isSwappingTo="swappingCardIndices.to === index"
          @start-edit="handleStartEdit"
          @save-edit="handleSaveEdit"
          @cancel-edit="handleCancelEdit"
          @update:card="handleUpdateCard"
          @update:position="handleUpdatePosition"
          @start-delete-timer="startDeleteTimer(index)"
          @cancel-delete="cancelDelete"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @dragover="handleDragOverItem($event, index)"
          @drop="handleDropItem($event, index)"
          @start-removing="handleStartRemoving"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, reactive, onUnmounted } from 'vue';
import FlashcardItem from './FlashcardItem.vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

// --- Refs ---
const scrollContainerRef = ref(null);

// --- Helpers ---
const isEmptyCard = (card) => {
  if (!card) return true;
  return (!card.term || card.term === 'Term') &&
      (!card.definition || card.definition === 'Definition');
};
const ensurePlaceholderCard = (cardsRef) => {
  if (!cardsRef?.value || !Array.isArray(cardsRef.value)) return false;
  const cards = cardsRef.value;
  if (cards.length === 0 || !isEmptyCard(cards[cards.length - 1])) {
    cards.push({ term: 'Term', definition: 'Definition', position: cards.length, internalKey: `${Date.now()}-placeholder-${Math.random()}` });
    return true;
  }
  return false;
};
const isLastEmptyCard = (index, cards) => {
  if (!Array.isArray(cards) || index === undefined || index === null) return false;
  return index === cards.length - 1 && isEmptyCard(cards[index]);
};
const getLastNonEmptyIndex = (cards) => {
  if (!Array.isArray(cards)) return -1;
  for (let i = cards.length - 1; i >= 0; i--) {
    if (cards[i] && !isEmptyCard(cards[i])) { return i; }
  }
  return -1; // Return -1 if all are empty, so maxPosition becomes 0, input clamps to 1 correctly.
};

// --- State ---
const mutableFlashcards = ref([]);
const editingCardIndices = ref({ term: [], definition: [] });
const editingPositionIndex = ref(null); // State for which card's position is being edited
const deletingIndex = ref(null);      // State for which card is being held down for deletion
const deleteProgress = ref(0);      // Progress of the delete timer
const deleteTimer = ref(null);        // Interval timer for deletion
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const swappingCardIndices = ref({ from: null, to: null }); // May not be needed with TransitionGroup
const flashcardItemRefs = reactive({}); // Refs to child components (e.g., to call triggerRemove)
// Auto-scroll state
const scrollIntervalId = ref(null);
const scrollSpeed = ref(0);

// --- Methods ---
const updateParentFlashcards = () => {
  if (!Array.isArray(mutableFlashcards.value)) return;
  // Update internal position property based on current index before emitting
  const updatedCards = mutableFlashcards.value.map((card, index) => ({
    ...card,
    position: index // Ensure internal position reflects array order
  }));
  emit('update:modelValue', updatedCards);
};

// --- Watchers ---
watch(() => props.modelValue, (newVal) => {
  if (Array.isArray(newVal)) {
    // Ensure incoming cards also have the internalKey
    mutableFlashcards.value = newVal.map((card, index) => ({
      ...card,
      internalKey: card.internalKey || `${Date.now()}-${index}-${Math.random()}`
    }));
  } else {
    mutableFlashcards.value = [];
  }
  // Ensure placeholder exists after syncing
  if (ensurePlaceholderCard(mutableFlashcards)) {
    // If placeholder added, immediately update parent model if strict sync needed
    // updateParentFlashcards(); // Usually handled by next user action or deep watch
  }
}, { immediate: true, deep: true });

watch(mutableFlashcards, (newVal, oldVal) => {
  // This watcher primarily ensures the placeholder logic triggers correctly
  // when the content of the last card changes or items are deleted.
  const newLength = Array.isArray(newVal) ? newVal.length : 0;
  const oldLength = Array.isArray(oldVal) ? oldVal.length : 0;

  if (newLength > 0) {
    // Ensure placeholder exists if last card is now filled
    if (ensurePlaceholderCard(mutableFlashcards)) {
      updateParentFlashcards();
    }
  } else if (newLength === 0 && oldLength > 0) {
    // All cards were deleted, add placeholder back
    if (ensurePlaceholderCard(mutableFlashcards)) {
      updateParentFlashcards();
    }
  }
}, { deep: true });


// --- Event Handlers - IMPLEMENTED ---
const handleStartEdit = ({ index, field }) => {
  if (typeof index !== 'number' || index < 0) return;

  // Cancel any other ongoing edits for this specific card maybe? (Optional)
  // cancelCardEdit(index, 'term');
  // cancelCardEdit(index, 'definition');
  // cancelPositionEdit(); // Cancel position if editing term/def? Or allow concurrent?

  if (field === 'position') {
    // If starting position edit, cancel term/def edits for this card
    handleCancelEdit({ index, field: 'term' });
    handleCancelEdit({ index, field: 'definition' });
    editingPositionIndex.value = index;
  } else if (field === 'term' || field === 'definition') {
    // If starting term/def edit, cancel position edit
    handleCancelEdit({ index, field: 'position' });
    // Ensure the array exists
    if (!editingCardIndices.value[field]) editingCardIndices.value[field] = [];
    // Add index if not already editing this field
    if (!editingCardIndices.value[field].includes(index)) {
      editingCardIndices.value[field].push(index);
    }
  }
};

const handleSaveEdit = ({ index, field }) => {
  if (typeof index !== 'number' || index < 0) return;
  // Simply remove the index from the corresponding editing state
  if (field === 'position') {
    if (editingPositionIndex.value === index) { // Check if this was the one being edited
      editingPositionIndex.value = null;
    }
  } else if (field === 'term' || field === 'definition') {
    if (Array.isArray(editingCardIndices.value[field])) {
      const fieldIndex = editingCardIndices.value[field].indexOf(index);
      if (fieldIndex > -1) {
        editingCardIndices.value[field].splice(fieldIndex, 1);
      }
    }
  }
  // Actual data update happens via @update:card or @update:position
};

const handleCancelEdit = ({ index, field }) => {
  if (typeof index !== 'number' || index < 0) return;
  // Similar to save, just remove from editing state
  if (field === 'position') {
    if (editingPositionIndex.value === index) {
      editingPositionIndex.value = null;
    }
  } else if (field === 'term' || field === 'definition') {
    if (Array.isArray(editingCardIndices.value[field])) {
      const fieldIndex = editingCardIndices.value[field].indexOf(index);
      if (fieldIndex > -1) {
        editingCardIndices.value[field].splice(fieldIndex, 1);
      }
    }
  }
};

// Called when FlashcardItem saves term/definition via @update:card
const handleUpdateCard = ({ index, field, value }) => {
  if (Array.isArray(mutableFlashcards.value) && mutableFlashcards.value[index]) {
    // Update the local mutable array
    mutableFlashcards.value[index][field] = value;
    // Emit the change up to the parent via v-model update
    updateParentFlashcards();
  }
};

// Called when FlashcardItem saves position via @update:position
const handleUpdatePosition = ({ fromIndex, toIndex }) => {
  // Add checks for valid indices if necessary
  if (typeof fromIndex === 'number' && typeof toIndex === 'number') {
    // Call the move function which handles array mutation and parent update
    moveCardWithAnimation(fromIndex, toIndex);
  }
};

// Called by FlashcardItem via @start-delete-timer
const startDeleteTimer = (index) => {
  if (!Array.isArray(mutableFlashcards.value)) return;
  if (isLastEmptyCard(index, mutableFlashcards.value)) return; // Can't delete placeholder
  if (typeof index !== 'number' || index < 0) return;

  // Clear existing timer if any
  if (deleteTimer.value) clearInterval(deleteTimer.value);

  deletingIndex.value = index; // Set which card is being timed
  deleteProgress.value = 0; // Reset progress

  // Start new timer
  deleteTimer.value = setInterval(() => {
    deleteProgress.value += 5; // Increment progress (adjust speed as needed)
    if (deleteProgress.value >= 100) {
      clearInterval(deleteTimer.value); // Stop timer
      triggerDeletion(index); // Initiate the deletion animation/process
      cancelDelete(); // Reset state after triggering
    }
  }, 75); // Interval duration (adjust for desired hold time)
};

// Called by FlashcardItem via @cancel-delete
const cancelDelete = () => {
  if (deleteTimer.value) {
    clearInterval(deleteTimer.value);
    deleteTimer.value = null;
  }
  // Reset deleting state regardless of whether timer was running
  deletingIndex.value = null;
  deleteProgress.value = 0;
};

// Called internally when delete timer completes
const triggerDeletion = (index) => {
  // Check ref exists for the item to be deleted
  const itemRef = flashcardItemRefs[index];
  if (itemRef && typeof itemRef.triggerRemove === 'function') {
    // Call the exposed method on the FlashcardItem child
    itemRef.triggerRemove();
    // The actual array splice happens in handleStartRemoving after the animation
  } else {
    // Fallback if ref or method not found (shouldn't happen)
    console.warn(`Could not trigger remove animation for index ${index}. Removing directly.`);
    handleStartRemoving(index); // Directly remove data if animation trigger fails
  }
};

// Called by FlashcardItem via @start-removing (after its animation starts)
const handleStartRemoving = (index) => {
  // Wait for animation to finish before removing data from array
  // Duration should match CSS transition time for .flashcard-list-leave-active
  setTimeout(() => {
    if (Array.isArray(mutableFlashcards.value) && mutableFlashcards.value[index]) {
      mutableFlashcards.value.splice(index, 1);
      // Placeholder logic handled by watcher, just update parent
      updateParentFlashcards();
    }
  }, 400); // Match transition duration
};


// --- Drag and Drop + AutoScroll + Wheel Scroll ---

// --- Manual Wheel Scroll Handler ---
const handleDragScroll = (event) => {
  // console.log('Wheel event during drag attempt:', event.deltaY, 'Dragged Index:', draggedIndex.value); // DEBUG LOG
  if (draggedIndex.value !== null && scrollContainerRef.value) {
    // console.log('Processing wheel scroll...'); // DEBUG LOG
    event.preventDefault();
    event.stopPropagation();
    const scrollAmount = event.deltaY * 1.5;
    // console.log(`Adjusting scroll by: ${scrollAmount}`); // DEBUG LOG
    scrollContainerRef.value.scrollTop += scrollAmount;
    // console.log(`New scrollTop: ${scrollContainerRef.value.scrollTop}`); // DEBUG LOG
    stopAutoScroll();
  } else {
    // console.log('Wheel event ignored (not dragging or no container ref)'); // DEBUG LOG
  }
};

// --- Edge AutoScroll ---
const startAutoScroll = () => {
  if (scrollIntervalId.value) return;
  // console.log(`Starting edge auto-scroll, speed: ${scrollSpeed.value}`); // DEBUG LOG
  scrollIntervalId.value = setInterval(() => {
    if (scrollContainerRef.value && scrollSpeed.value !== 0) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.value;
      const currentScrollTop = scrollTop;
      const nextScrollTop = currentScrollTop + scrollSpeed.value;
      if ((scrollSpeed.value < 0 && currentScrollTop <= 0) || (scrollSpeed.value > 0 && currentScrollTop >= scrollHeight - clientHeight)) {
        // console.log('Reached scroll boundary, stopping auto-scroll.'); // DEBUG LOG
        stopAutoScroll();
      } else {
        scrollContainerRef.value.scrollTop = Math.max(0, Math.min(nextScrollTop, scrollHeight - clientHeight));
        // console.log(`Auto-scrolling. New scrollTop: ${scrollContainerRef.value.scrollTop}`); // DEBUG LOG (can be noisy)
      }
    } else {
      stopAutoScroll();
    }
  }, 16);
};

const stopAutoScroll = () => {
  if (scrollIntervalId.value) {
    // console.log('Stopping edge auto-scroll.'); // DEBUG LOG
    clearInterval(scrollIntervalId.value);
    scrollIntervalId.value = null;
    scrollSpeed.value = 0;
  }
};

// --- Cleanup ---
const cleanupDragListeners = () => {
  // console.log('Cleaning up drag listeners...'); // DEBUG LOG
  stopAutoScroll();
  document.removeEventListener('wheel', handleDragScroll, { capture: true });
  if(deleteTimer.value) clearInterval(deleteTimer.value); // Ensure delete timer is cleared
};

onUnmounted(() => {
  cleanupDragListeners();
});

// --- Drag Event Handlers ---
const handleDragStart = (event, index) => {
  if (!Array.isArray(mutableFlashcards.value) || isLastEmptyCard(index, mutableFlashcards.value) || typeof index !== 'number' || index < 0) {
    event.preventDefault(); return;
  }
  // console.log(`Drag Start on index: ${index}`); // DEBUG LOG
  draggedIndex.value = index;
  // Add Wheel listener
  document.addEventListener('wheel', handleDragScroll, { passive: false, capture: true });
  nextTick(() => {
    try {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    } catch(e) { console.warn("Could not library drag event dataTransfer properties", e); }
  });
};

const handleDragEnd = (event) => {
  // console.log('Drag End'); // DEBUG LOG
  // Remove Wheel listener
  document.removeEventListener('wheel', handleDragScroll, { capture: true });
  stopAutoScroll(); // Stop edge scroll

  // Reset state if not already done by drop/move
  if (draggedIndex.value !== null || dragOverIndex.value !== null) {
    // console.log('Resetting drag state in dragend.'); // DEBUG LOG
    draggedIndex.value = null;
    dragOverIndex.value = null;
    swappingCardIndices.value = { from: null, to: null };
  }
};

const handleDragOverContainer = (event) => {
  event.preventDefault();
  if (!scrollContainerRef.value || draggedIndex.value === null) return;

  const containerRect = scrollContainerRef.value.getBoundingClientRect();
  const mouseY = event.clientY;
  const threshold = 100; // Increased threshold
  const scrollAmount = 15; // Constant speed amount

  if (mouseY < containerRect.top + threshold) {
    scrollSpeed.value = -scrollAmount; // Set constant negative speed
    startAutoScroll();
  } else if (mouseY > containerRect.bottom - threshold) {
    scrollSpeed.value = scrollAmount; // Set constant positive speed
    startAutoScroll();
  } else {
    stopAutoScroll(); // Stop edge scroll in dead zone
  }
};

const handleDragLeaveContainer = (event) => {
  const container = scrollContainerRef.value;
  if (container && event.relatedTarget && !container.contains(event.relatedTarget)) {
    // console.log('Drag left container - stopping edge scroll.'); // DEBUG LOG
    stopAutoScroll();
    dragOverIndex.value = null;
  } else if (!event.relatedTarget && container) {
    // console.log('Drag left window - stopping edge scroll.'); // DEBUG LOG
    stopAutoScroll();
    dragOverIndex.value = null;
  }
};

const handleDragOverItem = (event, index) => {
  event.preventDefault();
  event.stopPropagation();

  if (!Array.isArray(mutableFlashcards.value) || draggedIndex.value === null || draggedIndex.value === index || isLastEmptyCard(index, mutableFlashcards.value)) {
    event.dataTransfer.dropEffect = 'none';
    if (dragOverIndex.value !== null) dragOverIndex.value = null;
    return;
  }
  event.dataTransfer.dropEffect = 'move';
  if (dragOverIndex.value !== index) {
    dragOverIndex.value = index;
  }
  // Manually trigger container check for edge scrolling
  handleDragOverContainer(event);
};

const handleDropItem = (event, dropIndex) => {
  event.preventDefault();
  event.stopPropagation();
  // console.log(`Drop on Item Index: ${dropIndex}`); // DEBUG LOG

  if (!Array.isArray(mutableFlashcards.value) || draggedIndex.value === null || draggedIndex.value === dropIndex || isLastEmptyCard(dropIndex, mutableFlashcards.value)) {
    // console.log('Invalid drop on item, cleaning up.'); // DEBUG LOG
    handleDragEnd(); // Clean up state, remove listeners
    return;
  }
  if (typeof draggedIndex.value === 'number' && typeof dropIndex === 'number') {
    // console.log(`Executing move from ${draggedIndex.value} to ${dropIndex}`); // DEBUG LOG
    // Move function now calls handleDragEnd internally
    moveCardWithAnimation(draggedIndex.value, dropIndex);
  } else {
    // console.log('Invalid indices for move, cleaning up.'); // DEBUG LOG
    handleDragEnd(); // Clean up state, remove listeners
  }
};

const handleDropContainer = (event) => {
  event.preventDefault();
  // console.log('Drop on Container (Fallback)'); // DEBUG LOG
  // End the drag if not dropped on a valid item
  handleDragEnd();
};


// Function to move a card (Insertion Logic)
const moveCardWithAnimation = (fromIndex, toIndex) => {
  // console.log(`moveCardWithAnimation called: from ${fromIndex} to ${toIndex}`); // DEBUG LOG
  if (fromIndex === toIndex) {
    // console.log('Move cancelled: from === to'); // DEBUG LOG
    return handleDragEnd(); // Clean up state if no move
  }
  if (!Array.isArray(mutableFlashcards.value) || !mutableFlashcards.value[fromIndex]) {
    console.error("Cannot move card, array or source index invalid.");
    return handleDragEnd(); // Clean up state on error
  }

  const cardToMove = { ...(mutableFlashcards.value[fromIndex] || {}) };
  if (!cardToMove.internalKey) cardToMove.internalKey = `${Date.now()}-moved-${Math.random()}`;

  // Perform splice operations
  mutableFlashcards.value.splice(fromIndex, 1);
  mutableFlashcards.value.splice(toIndex, 0, cardToMove);
  // console.log('Array mutated for move.'); // DEBUG LOG

  // Update parent - TransitionGroup should animate the move
  updateParentFlashcards();

  // Clean up drag state *after* data update
  // Note: handleDragEnd removes wheel listener and stops auto-scroll
  handleDragEnd();
};

</script>

<style scoped>
.flashcard-list-container {
  width: 100%;
  position: relative;
}
.flashcard-container {
  background: var(--bg-tertiary, #121729); padding: 30px; border-radius: 12px; width: 100%; min-height: 200px;
  overflow-y: auto; max-height: 70vh; /* Example max height */
  scrollbar-width: thin; scrollbar-color: var(--primary-color, #5F98EF) var(--bg-secondary, #22293A);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; align-content: start;
}
.flashcard-container::-webkit-scrollbar { width: 8px; }
.flashcard-container::-webkit-scrollbar-track { background: var(--bg-secondary, #22293A); border-radius: 4px; }
.flashcard-container::-webkit-scrollbar-thumb { background-color: var(--primary-color, #5F98EF); border-radius: 4px; border: 2px solid var(--bg-secondary, #22293A); }
</style>