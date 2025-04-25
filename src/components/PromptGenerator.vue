<template>
  <div class="prompt-container">
    <label for="prompt" class="prompt-label">Please input your prompt below!</label>
    <textarea
        id="prompt"
        v-model="localPrompt"
        class="prompt-input"
        placeholder="Example: Key concepts of quantum physics, Important dates in World War II, Spanish vocabulary for beginners..."
        rows="3"
        @input="updatePrompt"
    ></textarea>

    <div class="card-count">
      <label class="count-label">Number of flashcards: {{ localCount }}</label>
      <div class="slider-container">
        <input
            type="range"
            min="5"
            max="35"
            step="5"
            v-model="localCount"
            class="slider"
            @input="updateCount"
        />
        <div class="slider-markers">
          <span v-for="n in 7" :key="n">{{ n * 5 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  prompt: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['update:prompt', 'update:count']);

const localPrompt = ref(props.prompt);
const localCount = ref(props.count);

watch(() => props.prompt, (newValue) => {
  localPrompt.value = newValue;
});

watch(() => props.count, (newValue) => {
  localCount.value = newValue;
});

const updatePrompt = () => {
  emit('update:prompt', localPrompt.value);
};

const updateCount = () => {
  emit('update:count', Number(localCount.value));
};
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

.prompt-input {
  width: 90%;
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
}

.prompt-input:focus {
  outline: none;
  border-color: #5F98EF;
}

.prompt-input::placeholder {
  color: #646b7c;
}

.card-count {
  margin-top: 25px;
  text-align: left;
}

.count-label {
  display: block;
  color: white;
  font-size: 16px;
  font-family: "Outfit", sans-serif;
  font-weight: 500;
  margin-bottom: 15px;
}

.slider-container {
  position: relative;
  padding-bottom: 25px;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #2a335a;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5F98EF;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5F98EF;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(95, 152, 239, 0.3);
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 10px;
  width: calc(100% - 20px);
  position: relative;
}

.slider-markers span {
  font-size: 12px;
  color: #888;
  position: relative;
  text-align: center;
  font-family: "Outfit", sans-serif;
}

.slider-markers span::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 5px;
  background-color: #888;
}
</style>
