<template>
  <div class="prompt-container">
    <label for="count" class="prompt-label">Number of flashcards: {{ localCount }}</label>
    <div class="slider-container">
      <vue-slider
          v-model="localCount"
          :min="5"
          :max="25"
          :interval="1"
          :adsorb="true"
          :marks="true"
          :marks-labels="markLabels"
          :process-style="{ backgroundColor: '#5F98EF' }"
          :rail-style="{ backgroundColor: '#2a335a' }"
          :dot-style="dotStyle"
          :height="6"
          :tooltip="'none'"
          @change="handleSliderChange"
      />
    </div>

    <label for="prompt" class="prompt-label">Please input your prompt below!</label>
    <div class="input-container">
      <textarea
          id="prompt"
          v-model="localPrompt"
          class="prompt-input"
          placeholder="Example: Key concepts of quantum physics, Important dates in World War II, Spanish vocabulary for beginners..."
          rows="3"
          @input="updatePrompt"
      ></textarea>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-3-slider-component'

export default {
  name: 'FlashcardPrompt',
  components: {
    VueSlider
  },
  props: {
    prompt: {
      type: String,
      default: ''
    },
    count: {
      type: Number,
      default: 15
    }
  },
  data() {
    return {
      localPrompt: this.prompt,
      localCount: this.count,
      dotStyle: {
        width: '20px',
        height: '20px',
        backgroundColor: '#5F98EF',
        border: '2px solid #fff',
        boxShadow: '0 0 0 2px rgba(95, 152, 239, 0.3)'
      }
    }
  },
  computed: {
    markLabels() {
      // Only show labels for multiples of 5
      const labels = {};
      for (let i = 5; i <= 25; i++) {
        if (i % 5 === 0) {
          labels[i] = i.toString();
        } else {
          labels[i] = '';
        }
      }
      return labels;
    }
  },
  mounted() {
    // Ensure initial value is set to 15
    if (this.localCount !== 15) {
      this.localCount = 15;
      this.$emit('update:count', 15);
    }
  },
  watch: {
    prompt(newValue) {
      this.localPrompt = newValue;
    },
    count(newValue) {
      this.localCount = newValue;
    }
  },
  methods: {
    updatePrompt() {
      this.$emit('update:prompt', this.localPrompt);
    },
    handleSliderChange(value) {
      this.$emit('update:count', value);
    }
  }
}
</script>

<style scoped>
.prompt-container {
  background: #121729;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
}

.prompt-label {
  display: block;
  color: white;
  font-size: 16px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: left;
}

.slider-container {
  position: relative;
  padding: 15px 10px 35px 10px;
  margin: 15px 0 25px 0;
}

.input-container {
  position: relative;
  margin: 15px 0 25px 0;
  width: 100%;
}

.prompt-input {
  width: 100%;
  background: #1a2233;
  border: 1px solid #2a335a;
  border-radius: 8px;
  color: white;
  font-family: "Outfit", sans-serif;
  font-size: 16px;
  padding: 10px;
  resize: vertical;
  min-height: 30px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.prompt-input:focus {
  outline: none;
  border-color: #5F98EF;
}

.prompt-input::placeholder {
  color: #646b7c;
}

/* Vue Slider Component Styling */
:deep(.vue-slider) {
  margin-bottom: 25px;
}

:deep(.vue-slider-mark) {
  top: auto;
  bottom: -16px;
  width: 1px;
}

:deep(.vue-slider-mark-step) {
  width: 1px;
  height: 5px;
  background-color: #666;
  opacity: 0.7;
}

:deep(.vue-slider-mark.vue-slider-mark-active .vue-slider-mark-step) {
  background-color: #5F98EF;
}

:deep(.vue-slider-mark[data-value="5"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="10"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="15"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="20"] .vue-slider-mark-step),
:deep(.vue-slider-mark[data-value="25"] .vue-slider-mark-step) {
  width: 2px;
  height: 10px;
  background-color: #aaa;
}

:deep(.vue-slider-mark-label) {
  font-size: 12px;
  color: #aaa;
  font-family: "Outfit", sans-serif;
  font-weight: bold;
  margin-top: 5px;
}

/* Fix alignment of first and last labels */
:deep(.vue-slider-mark[data-value="5"] .vue-slider-mark-label) {
  transform: translateX(0);
  left: 0;
}

:deep(.vue-slider-mark[data-value="25"] .vue-slider-mark-label) {
  transform: translateX(-100%);
  right: 0;
}
</style>
