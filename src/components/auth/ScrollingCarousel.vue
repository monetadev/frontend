<template>
  <div
      class="flashcard-row"
      :style="{ height: `${rowHeight}px` }"
      ref="rowRef"
  >
    <div
        v-for="card in visibleCards"
        :key="card.uniqueId"
        class="flashcard-container"
        :style="card.style" >
      <div
          class="flashcard"
          :class="{ 'is-flipped': flippedStates[card.originalIndex] }"
          @click="toggleFlip(card.originalIndex)"
          :style="{
          width: `${cardWidth}px`, // Apply size here
          height: `${cardHeight}px`,
          borderRadius: cardBorderRadius,
          boxShadow: cardBoxShadow,
          border: cardBorder
        }"
      >
        <div class="flashcard-face flashcard-front" :style="{ background: color }">
          <div class="card-content">{{ card.term }}</div>
        </div>
        <div class="flashcard-face flashcard-back" :style="{ background: color }">
          <div class="card-content definition-content">{{ card.definition }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  cardsData: { // Array of { term, definition }
    type: Array,
    required: true,
    default: () => [],
    validator: (v) => Array.isArray(v) && v.every(i => typeof i === 'object' && 'term' in i && 'definition' in i)
  },
  direction: {
    type: String, default: 'left', validator: (v) => ['left', 'right'].includes(v)
  },
  color: { type: String, required: true },
  rowHeight: { type: Number, required: true },
  cardWidth: { type: Number, required: true },
  cardHeight: { type: Number, required: true },
  cardSpacing: { type: Number, required: true },
  scrollSpeed: { type: Number, default: 0.8 },
  containerWidth: { type: Number, default: 0 }, // Received from parent
});

const rowRef = ref(null); // Ref for the row element if needed
const visibleCards = ref([]); // Holds the subset of cards to render { uniqueId, originalIndex, term, definition, xPos, style }
const flippedStates = ref({}); // Tracks flip state by originalIndex
let animationFrameId = null;

// --- Helper Functions ---
// Utility to safely get cardsData length
const dataLength = computed(() => props.cardsData?.length || 0);

// Utility to parse X translation from style string
function parseTranslateX(transform) {
  if (!transform) return 0;
  // Matches translate(Xpx, -50%) or translateX(Xpx)
  const match = transform.match(/translate(?:X)?\(\s*([^ ,p]+)px/);
  return match ? parseFloat(match[1]) : 0;
}

// --- Core Logic: Initialization and Animation ---

// (Re)Initializes the visible cards based on container size and data
const initializeVisibleCards = () => {
  stopAnimation(); // Stop any previous animation
  flippedStates.value = {}; // Reset flips
  visibleCards.value = []; // Clear current cards

  if (dataLength.value === 0 || props.cardWidth <= 0 || props.containerWidth <= 0) {
    return; // Not enough info or data to initialize
  }

  // Calculate how many cards are needed
  const cardTotalWidth = props.cardWidth + props.cardSpacing;
  const cardsNeededForView = Math.ceil(props.containerWidth / cardTotalWidth);
  // Add buffer: 2 extra on each side for smoother wrapping
  const totalVisibleCount = cardsNeededForView + 4;
  const actualTotalCount = Math.min(totalVisibleCount, dataLength.value * 2); // Don't render more than 2x data length

  const newVisibleCards = [];
  for (let i = 0; i < actualTotalCount; i++) {
    const originalIndex = i % dataLength.value; // Wrap around card data
    const cardData = props.cardsData[originalIndex];
    const xPos = i * cardTotalWidth; // Initial horizontal position

    newVisibleCards.push({
      uniqueId: `vis-${i}-${Date.now()}`, // More unique key for potential fast updates
      originalIndex: originalIndex,
      term: cardData.term,
      definition: cardData.definition,
      xPos: xPos, // Store numerical position separately
      style: { // Initial style object
        transform: `translate(${xPos}px, -50%)`,
        willChange: 'transform', // Perf hint
        // Apply width/height/margins here via style binding? No, keep on element for simplicity.
      }
    });
  }
  visibleCards.value = newVisibleCards;
  // console.log(`Initialized ${visibleCards.value.length} cards for container width ${props.containerWidth}`);

  // Use nextTick to ensure DOM is updated before starting animation
  nextTick(() => {
    startAnimation();
  });
};

// The animation loop using requestAnimationFrame
const animate = () => {
  if (visibleCards.value.length === 0 || dataLength.value === 0) {
    stopAnimation();
    return;
  }

  const cardTotalWidth = props.cardWidth + props.cardSpacing;
  const speed = props.scrollSpeed;
  const directionMultiplier = props.direction === 'left' ? -1 : 1;
  const containerW = props.containerWidth;

  // Find current bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let leftmostCardIndex = -1;
  let rightmostCardIndex = -1;

  visibleCards.value.forEach((card, index) => {
    if (card.xPos < minX) {
      minX = card.xPos;
      leftmostCardIndex = index;
    }
    if (card.xPos > maxX) {
      maxX = card.xPos;
      rightmostCardIndex = index;
    }
  });


  // Update positions and handle wrap-around
  for (let i = 0; i < visibleCards.value.length; i++) {
    const card = visibleCards.value[i];

    // Update position
    card.xPos += speed * directionMultiplier;

    // Check for wrap-around
    if (props.direction === 'left' && (card.xPos + props.cardWidth) < 0) {
      // Card moved off the left edge, wrap it to the right
      const rightmostCard = visibleCards.value[rightmostCardIndex];
      card.xPos = rightmostCard.xPos + cardTotalWidth; // Position after the current rightmost card

      // Update content to follow the sequence
      const prevOriginalIndex = rightmostCard.originalIndex;
      card.originalIndex = (prevOriginalIndex + 1) % dataLength.value;
      const newData = props.cardsData[card.originalIndex];
      card.term = newData.term;
      card.definition = newData.definition;

      // Update bounds tracking for this frame
      rightmostCardIndex = i;
      maxX = card.xPos;


    } else if (props.direction === 'right' && card.xPos > containerW) {
      // Card moved off the right edge, wrap it to the left
      const leftmostCard = visibleCards.value[leftmostCardIndex];
      card.xPos = leftmostCard.xPos - cardTotalWidth; // Position before the current leftmost card

      // Update content to precede the sequence
      const nextOriginalIndex = leftmostCard.originalIndex;
      // Correctly handle negative modulo result in JS
      card.originalIndex = (nextOriginalIndex - 1 + dataLength.value) % dataLength.value;
      const newData = props.cardsData[card.originalIndex];
      card.term = newData.term;
      card.definition = newData.definition;

      // Update bounds tracking for this frame
      leftmostCardIndex = i;
      minX = card.xPos;
    }

    // Update the style object reactively (Vue handles DOM update)
    card.style = {
      ...card.style, // Preserve other styles like willChange
      transform: `translate(${card.xPos}px, -50%)`,
    };
  }

  animationFrameId = requestAnimationFrame(animate);
};

const startAnimation = () => {
  stopAnimation(); // Ensure no duplicates running
  if (visibleCards.value.length > 0 && dataLength.value > 0) {
    // console.log("Starting animation...");
    animationFrameId = requestAnimationFrame(animate);
  }
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    // console.log("Animation stopped.");
  }
};

// --- Flipping Logic ---
const toggleFlip = (originalIndex) => {
  flippedStates.value[originalIndex] = !flippedStates.value[originalIndex];
};

// --- Watchers for Prop Changes ---
watch(
    [
      () => props.containerWidth,
      () => props.cardsData,
      () => props.cardWidth,
      () => props.cardHeight, // If height changes, maybe re-init?
      () => props.cardSpacing,
      () => props.direction, // Direction change requires re-initialization/positioning
    ],
    ([newWidth, newData, newCardW], [oldWidth, oldData, oldCardW]) => {
      // Only re-initialize if key layout props changed significantly
      if(newWidth !== oldWidth || newData !== oldData || newCardW !== oldCardW) {
        // console.log("Key props changed, re-initializing...");
        // Use nextTick to allow DOM/props to settle before re-calculating
        nextTick(initializeVisibleCards);
      } else {
        // If only direction changed, restart might be enough if positions were symmetric
        // but re-initializing is safer to ensure correct start positions/order.
        nextTick(initializeVisibleCards);
      }
    },
    { deep: true, immediate: false } // deep watch for cardsData, immediate false to wait for mounted
);

// Watch scroll speed separately - can change without full re-init
watch(() => props.scrollSpeed, (newSpeed, oldSpeed) => {
  if (newSpeed !== oldSpeed && animationFrameId) {
    // If animation is running, just let the animate loop pick up the new speed.
    // No restart needed unless speed becomes zero or negative (handled in animate loop).
  } else if (newSpeed > 0 && !animationFrameId) {
    // If speed becomes positive and animation was stopped, restart it
    startAnimation();
  }
});


// --- Lifecycle Hooks ---
onMounted(() => {
  // Wait for initial containerWidth prop from parent
  nextTick(() => {
    initializeVisibleCards();
  });
});

onBeforeUnmount(() => {
  stopAnimation();
});

// --- Computed Styles for CSS v-bind ---
// (These remain mostly the same as before, ensure they use props correctly)
const cardBorderRadius = computed(() => `${Math.max(8, props.cardHeight * 0.07)}px`);
const cardBoxShadow = computed(() => `0 ${props.cardHeight * 0.1}px ${props.cardHeight * 0.2}px rgba(0, 0, 0, 0.4)`);
const cardBorder = computed(() => `${Math.max(1, props.cardHeight * 0.01)}px solid rgba(95, 152, 239, 0.3)`);
const cardContentFontSize = computed(() => `${Math.max(12, props.cardHeight * 0.16)}px`);
const cardContentPadding = computed(() => `${props.cardHeight * 0.05}px`);
const cardTextShadow = computed(() => `0 ${props.cardHeight * 0.02}px ${props.cardHeight * 0.04}px rgba(0, 0, 0, 0.5)`);
// Responsive
const cardContentFontSizeMd = computed(() => `${Math.max(10, props.cardHeight * 0.14)}px`);
const cardContentFontSizeSm = computed(() => `${Math.max(9, props.cardHeight * 0.12)}px`);
const cardBorderMd = computed(() => `${Math.max(1, props.cardHeight * 0.008)}px`);
const definitionContentFontSize = computed(() => `${Math.max(11, props.cardHeight * 0.14)}px`); // Adjust definition size
const definitionContentFontSizeMd = computed(() => `${Math.max(9, props.cardHeight * 0.12)}px`);
const definitionContentFontSizeSm = computed(() => `${Math.max(8, props.cardHeight * 0.11)}px`);
const rowPadding = computed(() => `${props.rowHeight * 0.075}px 0`);
const rowPaddingSm = computed(() => `${props.rowHeight * 0.05}px 0`);


</script>

<style scoped>
.flashcard-row {
  position: relative; /* Crucial for absolute positioning of children */
  overflow: hidden; /* Hide cards moving outside bounds */
  width: 100%;
  padding: v-bind(rowPadding);
  box-sizing: border-box;
}

/* Container for each card, positioned absolutely */
.flashcard-container {
  position: absolute;
  top: 50%; /* Align top to vertical center of row */
  /* transform: translateY(-50%); Set via dynamic style now */
  perspective: 1000px; /* For 3D flip */
  box-sizing: border-box;
  /* width/height applied to inner .flashcard */
}

/* The actual flipping card element */
.flashcard {
  width: 100%; /* Take full size of container */
  height: 100%;
  position: relative; /* Needed for absolute faces */
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Flip state */
.flashcard.is-flipped {
  transform: rotateY(180deg); /* Only rotation needed here */
}

/* Card faces */
.flashcard-face {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: inherit;
  box-sizing: border-box;
  /* background applied via inline style */
}

.flashcard-front { z-index: 2; }
.flashcard-back { transform: rotateY(180deg); }

/* Content styling */
.card-content {
  color: white;
  font-weight: 700;
  font-size: v-bind(cardContentFontSize);
  text-shadow: v-bind(cardTextShadow);
  text-align: center;
  letter-spacing: 0.02em;
  padding: v-bind(cardContentPadding);
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.definition-content {
  font-size: v-bind(definitionContentFontSize);
  font-weight: 500;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .card-content { font-size: v-bind(cardContentFontSizeMd); }
  .definition-content { font-size: v-bind(definitionContentFontSizeMd); }
  .flashcard { border-width: v-bind(cardBorderMd); } /* Applied via inline style */
}

@media (max-width: 480px) {
  .card-content { font-size: v-bind(cardContentFontSizeSm); }
  .definition-content { font-size: v-bind(definitionContentFontSizeSm); }
  .flashcard-row { padding: v-bind(rowPaddingSm); }
}
</style>