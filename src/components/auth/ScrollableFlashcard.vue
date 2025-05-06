<template>
  <div class="flashcard-row-wrapper" :style="{ height: `${rowHeight}px` }">
    <ScrollingCarousel
        :itemCount="terms.length"
        :itemWidth="cardWidth"
        :itemSpacing="cardSpacing"
        :direction="direction"
        :scrollSpeed="scrollSpeed"
    >
      <div
          v-for="card in allCards"
          :key="card.id"
          class="flashcard"
          :style="{ background: color }"
      >
        <div class="card-content">{{ card.term }}</div>
      </div>
    </ScrollingCarousel>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ScrollingCarousel from './ScrollingCarousel.vue'; // Use the generic carousel

const props = defineProps({
  // Props defining the flashcards and their container
  terms: {
    type: Array,
    required: true,
    default: () => []
  },
  color: {
    type: String,
    required: true
  },
  rowHeight: {
    type: Number,
    required: true
  },
  cardWidth: {
    type: Number,
    required: true
  },
  cardHeight: {
    type: Number,
    required: true
  },
  cardSpacing: {
    type: Number,
    required: true
  },
  // Props controlling the scrolling behavior (passed down)
  direction: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  },
  scrollSpeed: {
    type: Number,
    default: 0.8
  }
});

// Prepare duplicated list for seamless looping
const allCards = computed(() => {
  const set1 = props.terms.map((term, index) => ({ id: `set1-${index}`, term }));
  const set2 = props.terms.map((term, index) => ({ id: `set2-${index}`, term }));
  // Only return cards if there are terms, otherwise ScrollingCarousel gets itemCount=0
  return props.terms.length > 0 ? [...set1, ...set2] : [];
});

</script>

<style scoped>
/* Styles specific to the flashcard presentation */
.flashcard-row-wrapper {
  padding: v-bind('rowHeight * 0.075 + "px"') 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.flashcard {
  flex: 0 0 auto;
  width: v-bind('cardWidth + "px"');
  height: v-bind('cardHeight + "px"');
  margin-right: v-bind('cardSpacing + "px"');
  border-radius: v-bind('Math.max(8, cardHeight * 0.07) + "px"');
  box-shadow: 0 v-bind('cardHeight * 0.1 + "px"') v-bind('cardHeight * 0.2 + "px"') rgba(0, 0, 0, 0.4);
  border: v-bind('Math.max(1, cardHeight * 0.01) + "px"') solid rgba(95, 152, 239, 0.3);
  font-family: 'Outfit', sans-serif;
  position: relative;
  box-sizing: border-box;
  /* Center card vertically within the track's available space */
  top: 50%;
  transform: translateY(-50%);
}

.card-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 700;
  font-size: v-bind('Math.max(12, cardHeight * 0.16) + "px"');
  text-shadow: 0 v-bind('cardHeight * 0.02 + "px"') v-bind('cardHeight * 0.04 + "px"') rgba(0, 0, 0, 0.5);
  text-align: center;
  letter-spacing: 0.02em;
  padding: v-bind('cardHeight * 0.05 + "px"');
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
}

/* Responsive styles */
@media (max-width: 768px) {
  .card-content {
    font-size: v-bind('Math.max(10, cardHeight * 0.14) + "px"');
  }
  .flashcard {
    border-width: v-bind('Math.max(1, cardHeight * 0.008) + "px"');
  }
}

@media (max-width: 480px) {
  .card-content {
    font-size: v-bind('Math.max(9, cardHeight * 0.12) + "px"');
  }
  .flashcard-row-wrapper {
    padding: v-bind('rowHeight * 0.05 + "px"') 0;
  }
}
</style>