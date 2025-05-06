<template>
  <div class="input-container" :class="{ 'focused': isFocused || modelValue }">
    <span class="icon-wrapper">
      <font-awesome-icon :icon="iconObject" :class="{ 'focused-icon': isFocused }" />
    </span>
    <input
        :type="type"
        class="input-field"
        :value="modelValue"
        placeholder=" "
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="isFocused = true"
        @blur="isFocused = !!modelValue"
    />
    <label class="input-label">{{ label }}</label>
  </div>
</template>

<script>
// Import FontAwesome components and functions
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
// Import solid and regular icon collections (or others as needed)
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
// Optionally import brands if needed
// import { fab } from '@fortawesome/free-brands-svg-icons';

// Add complete collections to the library
library.add(fas, far);

export default {
  name: "InputWithIcon",
  components: { FontAwesomeIcon },
  props: {
    // Accept a simpler format for icon specification
    icon: {
      type: String,
      required: true,
      // Examples: 'user' (solid by default), 'regular:envelope', 'solid:lock'
    },
    type: {
      type: String,
      default: "text"
    },
    modelValue: String,
    label: {
      type: String,
      required: true
    }
  },
  computed: {
    iconObject() {
      // Parse the icon string to determine icon style and name
      if (this.icon.includes(':')) {
        const [style, name] = this.icon.split(':');
        return [style === 'regular' ? 'far' : 'fas', name];
      }
      // Default to solid style if not specified
      return ['fas', this.icon];
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isFocused: false,
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.input-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  border: 2px solid #686868;
  border-radius: 5px;
  padding: 14px 16px;
  transition: border-color 0.3s ease-in-out;
  background: transparent;
  height: 56px;
}

.input-container.focused {
  border-color: #5F98EF;
}

.icon-wrapper {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  height: 100%;
  color: #686868;
}

.focused-icon {
  color: #5F98EF;
}

.input-field {
  flex: 1;
  width: 100%;
  padding-left: 40px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #ffffff;
  height: 24px;
}

.input-label {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #686868;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
  background: #22293A;
  padding: 2px 6px;
}

.focused .input-label,
.input-field:focus ~ .input-label,
.input-field:not(:placeholder-shown) ~ .input-label {
  top: 1px;
  font-size: 12px;
  color: #5F98EF;
}
</style>
